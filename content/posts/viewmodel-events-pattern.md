---
title: "The ViewModel Events Pattern: Navigation Without Coupling"
slug: viewmodel-events-pattern
excerpt: "A pattern for keeping ViewModels navigation-agnostic — and why it matters the moment you try to reuse or test one."
tags: [SwiftUI, MVVM, Architecture, iOS]
skill_level: intermediate
reading_time_minutes: 5
---

*A pattern for keeping ViewModels navigation-agnostic — and why it matters the moment you try to reuse or test one.*

---

A ViewModel that pushes to a `NavigationPath`. It works. It ships. But the moment you try to reuse it from a different screen, or write a unit test for it, you realize navigation logic has leaked into your business logic. Here's a pattern that prevents that from happening.

---

## The Anti-Pattern

Here's what the coupling problem looks like in practice. A typical `LoginViewModel` might signal navigation like this:

```swift
final class LoginViewModel: ObservableObject {
    @Published var navigateToHome = false

    func login() {
        // ... auth logic
        navigateToHome = true
    }
}
```

The View observes `navigateToHome` and reacts to it — a `NavigationLink` fires, or a sheet appears. It works, but notice what just happened: the ViewModel now has an opinion about what occurs after login. It owns a navigation flag. It's coupled to the View layer.

This causes real problems:

- **You can't reuse this ViewModel.** If you want login to route somewhere different in another context, the flag doesn't map cleanly — you end up with a second flag, or conditional logic inside the ViewModel that knows about different destinations.
- **Unit testing is awkward.** To verify that login triggers navigation, you have to observe a published property that only makes sense in the context of a View.
- **The ViewModel silently assumes its own outcome.** It knows there's a home screen. That's not business logic — that's routing.

---

## The Events Pattern

The fix is to invert the relationship. Instead of the ViewModel deciding what happens next, it declares *that* something happened — and lets the caller decide what to do about it.

```swift
final class LoginViewModel: ObservableObject {
    struct Events {
        var onLoginSuccess: () -> Void
        var onForgotPassword: () -> Void
    }

    private let events: Events

    init(events: Events) {
        self.events = events
    }

    func login() {
        // ... auth logic
        events.onLoginSuccess()
    }
}
```

The ViewModel calls `events.onLoginSuccess()` and stops caring. It has no `@Published` navigation flags, no awareness of what's next. Whether that callback pushes to a `NavigationStack`, presents a sheet, or fires an analytics event — that's entirely the caller's concern.

The ViewModel is now navigation-agnostic.

---

## Wiring It Up

The Coordinator (or parent View) creates the ViewModel and injects concrete behavior:

```swift
LoginViewModel(
    events: .init(
        onLoginSuccess: { [weak self] in
            self?.showHome()
        },
        onForgotPassword: { [weak self] in
            self?.showPasswordReset()
        }
    )
)
```

All routing decisions live here, at the assembly point. The same `LoginViewModel` can be reused in an onboarding flow, a re-authentication sheet, or a test harness — just inject different callbacks.

In a unit test, that looks like:

```swift
var didNavigateToHome = false

let vm = LoginViewModel(
    events: .init(
        onLoginSuccess: { didNavigateToHome = true },
        onForgotPassword: { }
    )
)

vm.login()
XCTAssertTrue(didNavigateToHome)
```

No Views. No `@Published` observation. Just a callback and an assertion.

---

## What You Gain

Three things change immediately when you adopt this pattern:

- **Testability** — inject mock Events, assert callbacks were called. No View infrastructure needed.
- **Reusability** — same ViewModel, different navigation outcomes depending on context.
- **Clear responsibility** — the ViewModel owns logic, the Coordinator owns routing. Neither bleeds into the other.

The `Events` struct also serves as documentation. Looking at a ViewModel's `Events` tells you exactly what navigation-relevant outcomes the ViewModel can produce — without reading the implementation.

---

*This pattern pairs well with a Coordinator-based architecture, but it works equally well if you're assembling ViewModels directly in SwiftUI views. The key is that the ViewModel never decides what happens after it fires an event.*
