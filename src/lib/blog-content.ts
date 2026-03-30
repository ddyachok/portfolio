// Blog post content stored as strings until Hasura is connected
// The title/h1 is stripped since BlogPost component renders it from metadata

export const blogContent: Record<string, string> = {
  'dynamic-localization-in-ios': `*How we built real-time English/Arabic switching in Bankee, and the RTL bugs that nearly broke us.*

---

Bankee is an edtech banking app built for Kuwait. Arabic isn't a nice-to-have — it's the primary language for most of our users. So when we set out to add full Arabic support with **in-app language switching** (no restart required), we figured it would be a couple of weeks of work.

Three weeks of debugging later, here's what actually happened:
- SwiftUI TextFields had no idea how to position a cursor in Arabic
- Some UI elements mirrored when they absolutely should not have

This post covers the architecture we built and the battles we fought.

---

## The Architecture: Switching Languages at Runtime

iOS really wants you to restart the app when changing languages. The standard \`NSLocalizedString\` reads from a bundle that's set at launch. Users, however, don't want to restart anything — they want to tap "عربي" and see the entire app flip instantly.

We needed three things:
1. A way to load a different \`.lproj\` bundle at runtime
2. A reactive system that propagates the change to every screen
3. RTL layout direction that updates globally and immediately

### Runtime Bundle Switching

The foundation is a small \`Bundle\` extension that swaps the localization bundle without restarting:

\`\`\`swift
extension Bundle {
    private static var _bundle: Bundle?

    static var localizedBundle: Bundle {
        _bundle ?? Bundle.main
    }

    static func setLanguage(_ language: AppLanguage) {
        let code = language.localizationCode

        guard let path = Bundle.main.path(forResource: code, ofType: "lproj"),
              let bundle = Bundle(path: path) else {
            _bundle = Bundle.main
            return
        }

        _bundle = bundle
    }
}
\`\`\`

When the user switches language, we load the corresponding \`.lproj\` folder (\`en.lproj\` or \`ar.lproj\`) and cache it. Every localized string lookup now reads from this bundle instead of \`Bundle.main\`.

It's 38 lines. It works. It's also fighting the system — more on that later.

### The Language Enum: \`ar-KW@numbers=latn\`

Our app supports two languages, but the Arabic configuration has a twist:

\`\`\`swift
enum AppLanguage: String, CaseIterable {
    case english = "en"
    case arabic = "ar-KW@numbers=latn"

    var isRTL: Bool { self == .arabic }

    var locale: Locale { Locale(identifier: rawValue) }

    var opposite: AppLanguage {
        switch self {
        case .english: .arabic
        case .arabic: .english
        }
    }
}
\`\`\`

That \`ar-KW@numbers=latn\` identifier isn't random. It tells the system: "Kuwait Arabic, but use Latin numerals (1, 2, 3) instead of Arabic-Indic numerals (١, ٢, ٣)." This was a product decision — our users deal with financial data and expect Western digits. Getting this locale identifier right saved us from doing manual number formatting everywhere.

### LanguageManager: The Reactive Brain

The \`LanguageManager\` is an \`ObservableObject\` that sits at the root of the view hierarchy and orchestrates everything:

\`\`\`swift
final class LanguageManager: ObservableObject {
    @Published private(set) var currentLanguage: AppLanguage {
        didSet {
            guard oldValue != currentLanguage else { return }
            handleLanguageChange(from: oldValue)
        }
    }

    func setLanguage(_ language: AppLanguage) {
        guard language != currentLanguage else { return }
        setUserLanguageOverride(true)

        withAnimation(.easeInOut(duration: 0.2)) {
            currentLanguage = language
        }
    }
}
\`\`\`

When \`currentLanguage\` changes, \`handleLanguageChange\` fires a chain reaction:

\`\`\`swift
private func handleLanguageChange(from previousLanguage: AppLanguage) {
    // 1. Update network header so the backend returns localized content
    endpoint.headers[RequestHeaderKey("x-lang")] = currentLanguage.headerValue

    // 2. Persist the preference
    storedLanguage = currentLanguage.rawValue

    // 3. Update system-level language preferences (keyboards, formatters)
    updateSystemLanguagePreference()

    // 4. Swap the localization bundle
    Bundle.setLanguage(currentLanguage)

    // 5. Notify all Combine subscribers
    languageDidChangeSubject.send((previous: previousLanguage, current: currentLanguage))
}
\`\`\`

Five things happen in sequence. Miss any one of them and something breaks — keyboards show the wrong language, the backend returns English content, or the UI shows stale strings.

### The \`.id()\` Trick: Forcing SwiftUI to Re-render

SwiftUI is smart about not re-rendering views that haven't changed. Too smart. When you swap a localization bundle, SwiftUI doesn't know that every \`Text\` view now resolves to different content. We needed a way to force full view recreation.

Enter \`LanguageAwareModifier\`:

\`\`\`swift
struct LanguageAwareModifier: ViewModifier {
    @EnvironmentObject var languageManager: LanguageManager

    func body(content: Content) -> some View {
        content
            .environment(\\.layoutDirection, languageManager.isRTL ? .rightToLeft : .leftToRight)
            .id(languageManager.currentLanguage.rawValue)
    }
}
\`\`\`

The \`.id()\` modifier is the key. When the language changes, the \`id\` changes, and SwiftUI **destroys and recreates the entire view tree** below this modifier. Every \`Text\` view re-resolves its localized string. Every layout recalculates its direction.

It's powerful but dangerous — it destroys all local \`@State\` in child views. We apply \`.languageAware()\` strategically at screen-level boundaries, not on every component.

### System Language Detection

The \`LanguageManager\` also handles the reverse direction — detecting when the user changes their device language in iOS Settings:

\`\`\`swift
private func setupAppLifecycleObservers() {
    // App returning from background
    Publishers.Merge(
        NotificationCenter.default.publisher(for: UIApplication.didBecomeActiveNotification),
        NotificationCenter.default.publisher(for: UIApplication.willEnterForegroundNotification)
    )
    .sink { [weak self] _ in
        self?.refreshLanguageFromSystem()
    }
    .store(in: &cancellables)

    // System locale change (user changed language in Settings)
    NotificationCenter.default.publisher(for: NSLocale.currentLocaleDidChangeNotification)
        .sink { [weak self] _ in
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                self?.handleSystemLanguageChange()
            }
        }
        .store(in: &cancellables)
}
\`\`\`

There's a \`userLanguageOverride\` flag that tracks whether the user manually picked a language in-app. If they did, we don't override it when the device language changes. If they haven't, the app follows the system.

That 0.1-second delay on \`currentLocaleDidChangeNotification\` isn't arbitrary — the system hasn't fully updated its locale state when the notification fires. Without the delay, you read stale values.

---

## Battle: TextFields That Don't Know They're Arabic

SwiftUI's \`TextField\` doesn't give you enough control for proper RTL text input. Text alignment, cursor position, placeholder direction — all of it needs to be set at the UIKit level.

### The Solution: A UIKit Wrapper

We built \`RTLTextFieldView\`, a \`UIViewRepresentable\` that wraps \`UITextField\` with explicit RTL configuration:

\`\`\`swift
private func configureRTL(_ textField: UITextField) {
    textField.textAlignment = isRTL ? .right : .left
    textField.semanticContentAttribute = isRTL ? .forceRightToLeft : .forceLeftToRight
}

private func configurePlaceholder(_ textField: UITextField) {
    let paragraphStyle = NSMutableParagraphStyle()
    paragraphStyle.alignment = isRTL ? .right : .left

    textField.attributedPlaceholder = NSAttributedString(
        string: placeholder,
        attributes: [
            .foregroundColor: placeholderColor,
            .font: font,
            .paragraphStyle: paragraphStyle
        ]
    )
}
\`\`\`

Three separate things need RTL handling: text alignment, semantic content attribute (which controls cursor position and text selection handles), and placeholder paragraph style. Miss any one and the field looks partially broken.

### The Cursor Jump Bug

The most subtle bug: every keystroke caused the cursor to jump to the end of the text. The cause was in \`updateUIView\`:

\`\`\`swift
func updateUIView(_ textField: UITextField, context: Context) {
    // BAD: this resets cursor position on every SwiftUI update cycle
    // textField.text = text

    // GOOD: only update when the text actually differs
    if textField.text != text {
        textField.text = text
    }

    configureAppearance(textField)
    configureRTL(textField)
    configurePlaceholder(textField)
    configureInput(textField)
}
\`\`\`

SwiftUI calls \`updateUIView\` frequently — on every state change in the parent view, not just when text changes. Unconditionally setting \`textField.text\` resets the cursor position even when the text hasn't changed. The fix is a one-line guard, but finding it took hours of debugging.

### Layout Inversion: The Double-Mirror Problem

In RTL mode, the password toggle button needs to appear on the left (opposite of LTR). We swap HStack order:

\`\`\`swift
if isRTL {
    HStack(spacing: 0) {
        passwordToggleButton
        textFieldContent
    }
} else {
    HStack(spacing: 0) {
        textFieldContent
        passwordToggleButton
    }
}
\`\`\`

But here's the catch — if the container also has \`.environment(\\.layoutDirection, .rightToLeft)\`, SwiftUI will mirror the HStack *again*, putting the button back on the right. The fix is to force the container to LTR:

\`\`\`swift
var body: some View {
    VStack(spacing: 4) {
        titleView
        textFieldContainerView
        errorView
    }
    .environment(\\.layoutDirection, .leftToRight)  // prevent double-mirroring
}
\`\`\`

We manage RTL layout manually inside the component and prevent SwiftUI's automatic mirroring from interfering. This is a pattern that comes up repeatedly: **not everything should auto-mirror**.

---

## The Details That Bite

### Global vs. Local Semantic Attributes

For UIKit-backed views (navigation bars, system alerts), we set RTL globally:

\`\`\`swift
UIView.appearance().semanticContentAttribute = languageManager.isRTL
    ? .forceRightToLeft
    : .forceLeftToRight
\`\`\`

But individual components override this when they need to stay LTR — progress bars, phone number fields, certain icons. It's a constant tug of war between "mirror everything" and "except this one."

### Network Layer: The \`x-lang\` Header

Every API request includes an \`x-lang\` header (\`"en"\` or \`"ar"\`). When the user switches language, the header updates immediately. This means the backend returns localized content — error messages, category names, notification text — in the correct language without the client doing any string mapping.

This sounds obvious, but getting the timing right matters. If a network request fires between the language switch and the header update, you get a response in the wrong language. Our chain in \`handleLanguageChange\` updates the header *before* notifying subscribers, so any requests triggered by the language change notification already have the correct header.

### Noto Kufi Arabic: The Font

We use **Noto Kufi Arabic** as our Arabic font throughout the app. System Arabic fonts work, but they don't match our design language. Loading a custom Arabic font has its own edge cases — line heights differ between Latin and Arabic glyphs, so spacing needs testing in both languages.

---

## Lessons Learned

**RTL is not "just flip the layout."** SwiftUI's automatic mirroring handles 70% of cases. The remaining 30% — scroll offsets, cursor positions, component ordering, selective non-mirroring — is where all the debugging time goes.

**The \`.id()\` modifier is a sledgehammer.** It forces view recreation, which is exactly what you need for language switching. But it destroys \`@State\`, resets scroll positions, and dismisses keyboards. Apply it at the right level of the hierarchy — too high and you lose app state, too low and some views don't update.

**Bundle swizzling works, but you're on your own.** Apple doesn't officially support runtime language switching. System components (date pickers, keyboards, share sheets) may not respect your swizzled bundle. We update \`AppleLanguages\` in UserDefaults as a workaround, but it's not perfect.

**Build RTL from day one.** Retrofitting RTL support into an existing LTR app means touching almost every screen. If you know your app will need Arabic, Hebrew, Urdu, or any RTL language — set up the architecture before you have 50 screens that assume LTR.

**Test in Arabic, not just "RTL mode."** Simulator's RTL pseudolanguage doesn't catch everything. Real Arabic text has different word lengths, different line heights, and different breaking rules. Test with actual Arabic content.

---

*The full implementation is in the [Bankee iOS](https://github.com/Bankee-online/bankee-ios) codebase. If you're building dynamic localization in SwiftUI and hitting similar issues, feel free to reach out.*`,
}
