---
title: "Stop Using [weak self] in Swift Tasks - Here's Why"
slug: stop-using-weak-self-in-tasks
excerpt: "Task is a struct, not a closure. That [weak self] you keep adding? It does nothing useful - and the real memory management pattern is different."
tags: [Swift, Concurrency, SwiftUI, iOS]
skill_level: intermediate
reading_time_minutes: 7
---

*That `[weak self]` you keep adding inside `Task { }`? It does nothing useful - and the real memory management pattern is completely different.*

---

I keep seeing this in pull requests. Senior developers, juniors, tutorials, StackOverflow answers - almost everyone writes it:

```swift
func handleButtonTapped() {
    Task { [weak self] in
        guard let self else { return }
        let data = try await apiClient.fetchProfile()
        self.profile = data
    }
}
```

It looks responsible. You learned years ago that closures can capture `self` strongly and cause retain cycles. So you add `[weak self]` everywhere. Safety first.

Except in this case, it's doing nothing useful. And the `guard let self` is just noise.

---

## Why `[weak self]` Doesn't Help Here

Let's be precise about what's happening.

When you write `Task { [weak self] in ... }`, the closure **does** capture `self` weakly. That part works as expected. But here's what's different from the classic retain cycle scenario:

**A retain cycle requires two objects holding strong references to each other.** The textbook example:

```swift
class ViewModel {
    var onComplete: (() -> Void)?

    func start() {
        onComplete = { 
            self.finish() // self → onComplete → self (cycle)
        }
    }
}
```

`self` owns `onComplete`. `onComplete` captures `self`. Neither can be deallocated. Classic cycle.

Now look at `Task`:

```swift
class ViewModel {
    func load() {
        Task {
            self.profile = try await api.fetchProfile()
        }
    }
}
```

Where's the cycle? The `Task` closure captures `self` strongly, but **nobody stores the Task**. It's a fire-and-forget value. It runs, completes, and its closure is released. `self` doesn't hold a reference to the Task, so there's no cycle.

**No cycle means no leak.** The `[weak self]` is solving a problem that doesn't exist.

---

## "But What If the ViewModel Is Deallocated Mid-Task?"

This is the real concern people have, and it's valid - just misidentified.

If a user navigates away from a screen while a network request is in flight, you probably don't want that request to finish and write to a deallocated ViewModel. But `[weak self]` is the wrong tool for this. Here's why:

**1. `[weak self]` makes `self` nil, but the Task keeps running.**

```swift
Task { [weak self] in
    let data = try await api.fetchProfile() // still runs!
    self?.profile = data // self is nil, silent no-op
}
```

The network request still fires. The response still downloads. You still pay the cost. You just silently discard the result. That's not cancellation - that's waste.

**2. The actual fix: cancel the Task.**

```swift
@MainActor @Observable
final class ProfileViewModel {
    var profile: Profile?
    var isLoading = false

    private var loadTask: Task<Void, Never>?

    func load() {
        loadTask?.cancel()
        loadTask = Task {
            isLoading = true
            defer { isLoading = false }

            do {
                let data = try await api.fetchProfile()
                profile = data
            }
            catch {
                // handle error
            }
        }
    }

    func cancelLoad() {
        loadTask?.cancel()
        loadTask = nil
    }
}
```

Store the Task. Cancel it when the screen disappears. The request is actually stopped (assuming your networking layer checks for cancellation). No wasted work. No silent no-ops.

---

## SwiftUI's `.task` Modifier: The Easiest Win

SwiftUI already handles this for you with the `.task` modifier:

```swift
struct ProfileScreen: View {
    @State var viewModel: ProfileViewModel

    var body: some View {
        ContentView(profile: viewModel.profile)
            .task {
                await viewModel.load()
            }
    }
}
```

`.task` creates a Task tied to the view's lifecycle. When the view disappears, the Task is **automatically cancelled**. No manual storage, no `onDisappear` cleanup.

This is almost always what you want for screen-level data loading.

---

## When You Actually Need `[weak self]`

`[weak self]` isn't dead. It's still the right tool in specific situations:

### Stored closures (the classic case)

```swift
class ViewModel {
    var onComplete: (() -> Void)?

    func start() {
        onComplete = { [weak self] in
            self?.finish()
        }
    }
}
```

Self owns the closure. The closure references self. Without `[weak self]`, that's a cycle.

### Combine subscriptions

```swift
apiClient.statusPublisher
    .sink { [weak self] status in
        self?.updateStatus(status)
    }
    .store(in: &cancellables)
```

The subscription is stored in `cancellables`, which is owned by `self`. The sink closure references `self`. Without `[weak self]`, the subscription keeps `self` alive indefinitely.

### `MainActor.run` inside a detached context

```swift
Task.detached {
    let result = await heavyComputation()
    await MainActor.run { [weak self] in
        self?.data = result
    }
}
```

`Task.detached` doesn't inherit the caller's context. If the original object is deallocated, `MainActor.run` could execute on a zombie. `[weak self]` is appropriate here.

---

## Quick Reference

| Context | `[weak self]`? | Why |
|---------|:-:|-----|
| `Task { }` in a method | No | No retain cycle - Task is not stored by self |
| `.task { }` modifier | No | SwiftUI auto-cancels on disappear |
| Stored closure property | **Yes** | Self owns closure, closure captures self |
| Combine `.sink` | **Yes** | Subscription stored in cancellables owned by self |
| `Task.detached` + `MainActor.run` | **Yes** | Detached task outlives caller context |
| Timer / NotificationCenter callback | **Yes** | Long-lived subscription can outlive the object |

---

## The Mental Model

Stop thinking about `[weak self]` as a general safety measure. Think about it in terms of **ownership**:

**Does `self` own something that references `self`?** Use `[weak self]` to break the cycle.

**Is it a fire-and-forget operation?** Cancel it when you're done, don't weaken the reference.

The pattern for modern Swift concurrency is: **store, cancel, clean up** - not `[weak self]` and hope for the best.

---

*If this changed how you think about Task capture semantics, I write about Swift architecture and real production patterns on my blog. More posts coming.*
