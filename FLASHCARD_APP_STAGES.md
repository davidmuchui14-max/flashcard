# Flashcard App: Initial Build Stages

Use these prompts one at a time with your coding assistant. Review each result before moving to the next stage. The goal is a useful web app first, with a structure that can later support a mobile app.

## Product direction

Build a straightforward flashcard study app. A learner can create decks, add question-and-answer cards, and study a deck by revealing answers and marking whether they knew each one. Keep the first version focused; avoid accounts, social features, and complex learning algorithms until the core experience works.

## Stage 1 — Inspect the project and plan the MVP

> Inspect the existing project before changing anything. Summarize its current structure and recommend the smallest suitable approach for building a flashcard app as a website. Preserve unrelated files and existing work. Propose an MVP with the main screens, core user actions, and a short list of features to defer. Do not implement anything yet.

## Stage 2 — Design the main screens and user flow

> Based on the agreed MVP, design the flow for a first-time user: view decks, create a deck, add cards, and study. Describe the page layout and important empty, loading, and error states. Keep the interface responsive, keyboard-friendly, and simple to use on both desktop and mobile browsers. Do not add features outside the MVP.

## Stage 3 — Build the app shell and deck list

> Implement the app shell and deck-list screen using the project's existing conventions and the agreed design. Show a helpful empty state when there are no decks, and provide a clear way to create one. Use accessible labels and responsive styling. Keep the code easy to extend; do not implement card study behavior yet.

## Stage 4 — Create and manage decks and cards

> Add the MVP deck and card management flows. Users should be able to create and rename a deck, add and edit question-and-answer cards, and delete decks or cards with an appropriate confirmation where needed. Validate required fields and show clear feedback for invalid input. Keep state handling consistent with the existing project.

## Stage 5 — Implement study mode

> Implement a study session for a selected deck. Show one question at a time, let the learner reveal the answer, then record whether they knew it. Include previous/next or equivalent session navigation, a visible position indicator, and a clear completion state. Handle empty decks gracefully. Make all controls usable by keyboard as well as pointer.

## Stage 6 — Save and restore user data

> Make decks and cards persist between visits using an appropriate storage approach for this MVP. If the app is a client-side website, use browser storage and handle missing, malformed, or unavailable saved data without crashing or silently discarding it. Keep storage logic separate from presentation so it can later be replaced by a server API. Explain the data shape and any limitations.

## Stage 7 — Polish accessibility and responsive behavior

> Review the implemented app for responsive layouts, readable contrast, semantic HTML, visible focus states, form labels, and screen-reader-friendly feedback. Fix issues you find without changing the agreed product scope. Check that deck management and studying work on narrow screens and with keyboard-only navigation.

## Stage 8 — Verify the MVP

> Test the main user journeys: creating a deck, adding and editing cards, studying cards, recording answers, completing a session, refreshing and confirming data persists, and handling an empty deck. Run the relevant project checks. Fix issues caused by this work and report what you tested, the results, and any remaining limitations.

## Stage 9 — Prepare for a future mobile app

> Review the finished website and identify what would need to change to support a mobile app later. Focus on reusable data and business logic, a future sync/API boundary, authentication only if needed, and mobile-specific features such as offline access or notifications. Do not add mobile tooling or rewrite the website now; provide a short, prioritized migration path.

## Possible follow-up features

- Import and export decks
- Search, tags, and deck organization
- Study reminders and streaks
- Spaced repetition after the basic study flow is reliable
- Accounts and synchronization across devices
- Sharing decks with other learners
