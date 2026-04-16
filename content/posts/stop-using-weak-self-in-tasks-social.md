# Social Media Posts - "Stop Using [weak self] in Swift Tasks"

---

## X Thread (6 tweets)

### Tweet 1 (Hook)
Stop writing `[weak self]` in Swift Tasks.

I see this in almost every iOS PR I review. It looks responsible. It's actually useless.

Here's why, and what to do instead:

### Tweet 2 (Anti-pattern)
The code everyone writes:

```
Task { [weak self] in
    guard let self else { return }
    let data = try await api.fetchProfile()
    self.profile = data
}
```

Looks safe. But Task is not a stored closure - nobody owns this Task. There's no retain cycle to break. That [weak self] adds noise for zero benefit.

### Tweet 3 (The real problem)
"But what if the ViewModel is deallocated?"

With [weak self], the Task still runs. The network request still fires. You still pay the cost. You just silently discard the result.

That's not cancellation - that's waste.

### Tweet 4 (The fix)
The actual fix: store the Task, cancel it when the screen disappears.

```
private var loadTask: Task<Void, Never>?

func load() {
    loadTask?.cancel()
    loadTask = Task {
        isLoading = true
        defer { isLoading = false }
        profile = try await api.fetchProfile()
    }
}
```

Or even better - use SwiftUI's `.task` modifier. It auto-cancels when the view disappears.

### Tweet 5 (When you DO need it)
When you DO still need [weak self]:

- Stored closure properties (self owns closure that captures self)
- Combine .sink (subscription stored in cancellables)
- Task.detached + MainActor.run

The rule: does self own something that references self? Use [weak self]. Fire-and-forget? Cancel the Task instead.

### Tweet 6 (CTA)
Full post with code examples and a quick reference table on my blog:

[link]

If this changed how you think about Task capture semantics - share it with your team. I've seen entire codebases littered with unnecessary guard-lets.

---

## LinkedIn Post

I've reviewed hundreds of Swift pull requests over the past few years, and there's one pattern I see in almost every single one: [weak self] inside Task { }.

It looks like responsible memory management. It's actually doing nothing.

Here's the key insight: a retain cycle requires two objects holding strong references to each other. When you write Task { [weak self] in ... }, the closure captures self - but self doesn't store the Task. There's no cycle. No leak. The [weak self] just adds optional unwrapping noise.

Worse - when the screen is deallocated mid-request, [weak self] doesn't cancel the work. The network call still fires, the response still downloads. You just silently throw away the result.

The correct pattern in modern Swift concurrency: store the Task, cancel it when the view disappears. SwiftUI's .task modifier handles this automatically.

[weak self] still matters for stored closures and Combine subscriptions - anywhere self owns something that captures self. But for fire-and-forget async work, cancellation is the tool, not weak references.

I wrote a full breakdown with code examples and a quick reference table:
[link]

#Swift #iOS #SwiftUI #iOSDevelopment #MobileDevelopment #CodeReview

---

## Threads Post

### Post 1
hot take: [weak self] inside Task { } does nothing useful

I see this in every PR. Task is not a stored closure - there's no retain cycle to break. You're just making self optional and adding guard-let noise for zero memory benefit.

The actual fix when a screen disappears mid-request? Cancel the Task. Don't weaken the reference and hope for the best.

### Post 2
quick rule:

[weak self] - stored closures, Combine sinks, anything where self owns the thing that captures self

cancel the Task - fire-and-forget async work, screen-level data loading, anything tied to view lifecycle

SwiftUI's .task modifier auto-cancels. Use it.

full post with code + reference table on my blog (link in bio)
