# Build a Flashcard Web App Step by Step

This guide breaks the project into small steps you can complete in order. Give your coding assistant one prompt at a time, try the result in your browser, and fix problems before continuing.

## The app you are building

The first version is a single-user study app that runs in a web browser. A user can:

1. See their flashcard decks.
2. Organize decks into these topics: Probability and statistics, Web application, Desktop programming, Software engineering, Database system, Data science, and Routing and switching.
3. Create, rename, and delete a deck.
4. Add, edit, and delete cards in a deck.
5. Browse or filter decks by category.
6. Study one card at a time by revealing its answer.
7. Mark each answer as **Got it** or **Need to review**.
8. Close or refresh the page without losing decks, cards, or their categories.

Start with plain HTML, CSS, and JavaScript if that matches your current project. If the project already uses a framework, keep using it rather than starting over. Do not add accounts, online syncing, shared decks, or a complicated spaced-repetition algorithm in the first version.

## Step 1 — Check your starting point

**Goal:** Know what files and tools the project already uses before making changes.

**Prompt:**

> Inspect my existing project and explain how it currently runs, which files control its pages and styling, and whether it uses a framework or build tools. Do not change any files. Recommend the simplest way to add a flashcard app while preserving unrelated files. Tell me how I can run it locally and what browser I should use to check it.

**Check before continuing:** You know which file is the app's entry page and how to open or run it locally.

## Step 2 — Agree on the first-version requirements

**Goal:** Keep the first build small enough to finish.

**Prompt:**

> Help me define the first version of my flashcard web app. It needs these topic categories: Probability and statistics, Web application, Desktop programming, Software engineering, Database system, Data science, and Routing and switching. Include a deck list that shows each deck's category; deck creation and renaming with category assignment; filtering decks by category; card creation and editing; deletion; a study mode; and saving data in this browser. A deck belongs to one category in the MVP. Write the user flow and list the screens or panels needed. For each feature, say how I can manually check that it works. Keep accounts, cloud sync, sharing, AI, and advanced spaced repetition out of scope. Do not write code yet.

**Check before continuing:** Confirm that every deck has one of the seven requested categories.

## Step 3 — Sketch the screens

**Goal:** Decide where the main actions go before implementing them.

**Prompt:**

> Based on the agreed requirements, describe a simple responsive layout for these states: an empty deck list, a deck list with decks grouped or filtered by topic category, creating or editing a deck and choosing its category, editing a deck's cards, and studying a deck. Specify the text and buttons each state needs, including how a user returns to the deck list or finishes studying. Keep the design usable on a narrow phone-sized browser. Do not add features or write code yet.

**Check before continuing:** You can explain how a first-time user chooses a category, creates a deck, adds a card, filters to a topic, and starts studying.

## Step 4 — Build the page structure

**Goal:** Put the important content and controls on the page without worrying about final styling.

**Prompt:**

> Build the basic HTML structure for the agreed flashcard app in the existing project. Include a page heading, a category filter, a deck-list area with a useful empty state, a form or dialog for creating a deck with a category selector, a deck detail area for cards, and a study area. Use semantic HTML, labels for form fields, and buttons for actions. Keep unrelated files unchanged. Do not implement app behavior yet. Tell me which file changed and how to view it.

**Check before continuing:** Open the page. Confirm headings, empty state, and form fields appear, and each field has a visible label.

## Step 5 — Add responsive styling

**Goal:** Make the page clear and comfortable to use on desktop and small screens.

**Prompt:**

> Style the existing flashcard app using the project's current styling approach. Make the category filter, category labels on decks, forms, cards, and buttons visually distinct, with readable text, adequate spacing, visible keyboard focus, and clear hover/disabled states. At narrow viewport widths, prevent horizontal scrolling and keep controls easy to tap. Do not rely on color alone to tell categories apart. Do not change the app's requirements or add dependencies.

**Check before continuing:** Resize the browser to a narrow width and a desktop width. Check that nothing overlaps, becomes unreadable, or requires sideways scrolling.

## Step 6 — Define the deck and card data

**Goal:** Use a predictable shape for data so the interface and storage can share it.

**Prompt:**

> Define a simple data model for flashcard categories, decks, and cards in this project. Use these predefined categories: Probability and statistics, Web application, Desktop programming, Software engineering, Database system, Data science, and Routing and switching. Each category needs a stable id and a name. Each deck needs a stable id, a name, a category id, and a list of cards. Each card needs a stable id, a question, and an answer. Show a small example with two of these categories, two decks assigned to them, and a few cards. Keep study-session progress separate from the card text. Do not add a backend or change unrelated files.

**Check before continuing:** IDs are not based on array positions, and it is clear how every deck refers to its category and how its cards belong to it.

## Step 7 — Display the deck list and create decks

**Goal:** Make the first complete interaction work.

**Prompt:**

> Implement the deck list using the agreed category, deck, and card data model. Let me create a deck with a non-empty name and a category selected from the agreed list, show its name, category, and card count in the list, and open it. Add a category filter that can show all decks or only decks in one selected category. Update the empty state when there are no decks and when a category has no decks. Prevent blank names or missing categories, show clear validation, and clear the form after successful creation. Keep the existing responsive layout and do not implement card editing or studying yet.

**Check before continuing:** Create decks in two different categories, open each one, filter by each category and by all categories, and try submitting a blank name or missing category.

## Step 8 — Add and edit cards

**Goal:** Let a user build a deck of question-and-answer cards.

**Prompt:**

> In the selected deck, implement adding and editing flashcards with a question and an answer. Require both fields to contain non-whitespace text. Show the cards and their question text in the deck view, and make it clear which deck and topic category are open. Allow editing a card without creating a duplicate. Keep card ids stable and do not implement study mode yet.

**Check before continuing:** Add several cards, edit one, try blank questions and answers, and confirm editing changes the original card rather than adding another.

## Step 9 — Delete cards and decks safely

**Goal:** Avoid accidental loss while keeping the interface understandable.

**Prompt:**

> Add delete actions for cards and decks. Ask for confirmation before deleting a deck or card, and make sure deleting a deck also removes its cards from the app's data. If categories can be user-created, also prevent deleting a category that still has decks or clearly explain what happens to those decks. After deletion, show a sensible screen: return to the deck list if the open deck was deleted, or show the updated card list if a card was deleted. Do not change other behavior.

**Check before continuing:** Delete one card, cancel a deletion once, then delete a deck and confirm it no longer appears.

## Step 10 — Save data in the browser

**Goal:** Keep decks available after reloads without needing an account or server.

**Prompt:**

> Persist the category, deck, and card data in browser localStorage using a clearly named storage key. Load saved data when the app starts and save changes after creating, editing, or deleting categories, decks, and cards. Ensure each deck's category assignment survives a reload. Keep storage reading and writing in a small separate module or helper so it can later be replaced by an API. Handle no saved data as a normal first visit. If saved data is malformed, references a missing category, or storage is unavailable, show a clear recoverable error instead of silently replacing or discarding the data. Do not store passwords or secrets.

**Check before continuing:** Create decks in different categories, refresh the page, and confirm the categories and category filtering remain correct. Also check the empty first-visit state. If practical, test how the app responds when the saved JSON is invalid.

## Step 11 — Build the study session

**Goal:** Study cards in a simple, repeatable flow.

**Prompt:**

> Implement study mode for the selected deck. Show its deck name and topic category. Start at the first card and show its question, a button to reveal the answer, then buttons labeled "Got it" and "Need to review." Show the current card number and total. After answering, move to the next card. At the end, show the number marked "Got it" and "Need to review," with a button to study again and a button to return to the deck. Handle an empty deck with a message and a way to add cards. Keep session results separate from the saved card content.

**Check before continuing:** Study a deck with at least three cards, reveal each answer, use both answer buttons, finish, restart, and try a deck with no cards.

## Step 12 — Add navigation and interaction details

**Goal:** Make it easy to move between decks, card editing, and study mode.

**Prompt:**

> Review the app's navigation from the deck list to deck details and study mode. Make sure every view has an obvious way back, the selected deck stays clear, and starting a new study session resets only the session results. Prevent actions that do not make sense in the current state, such as studying a missing deck. Do not introduce unrelated features.

**Check before continuing:** Navigate through the app without using the browser Back button and confirm you can always return to your decks.

## Step 13 — Check accessibility and keyboard use

**Goal:** Make the app usable without relying on a mouse or color alone.

**Prompt:**

> Review the flashcard app for accessibility. Check semantic headings, form labels and validation, button names, keyboard navigation, visible focus, color contrast, and announcements for important changes such as revealing an answer or completing a study session. Fix issues using the project's existing patterns. Do not add a new accessibility library unless the project already uses one.

**Check before continuing:** Use Tab, Shift+Tab, Enter, and Space to operate the app. Confirm focus is always visible and controls have understandable names.

## Step 14 — Test the complete first version

**Goal:** Catch broken flows before sharing or publishing the app.

**Prompt:**

> Test the flashcard app against these flows: first visit with no decks; create decks in multiple categories; filter decks by category and show all decks; create, rename, and delete a deck while retaining its category; add, edit, and delete cards; reject blank names, missing categories, questions, and answers; study a deck and complete a session; handle an empty deck; refresh and confirm saved categories, decks, and cards remain; and use the main flow with keyboard navigation. Run the existing project checks if available. Fix problems caused by the app changes, then report each check as passed or failed and list remaining limitations.

**Check before continuing:** Try the flows yourself in the browser too. Do not consider the app finished if a core action only works in code but not in the page.

## Step 15 — Publish the website

**Goal:** Put the web version online so you can use and share it.

**Prompt:**

> Inspect the project and tell me the simplest way to publish this app as a website using its current files and tooling. If GitHub Pages is suitable, give me the exact repository settings and any required build or deployment steps. Do not publish anything, change repository visibility, or add deployment configuration without explaining what will change and asking me first.

**Check before continuing:** Open the published URL in a private/incognito browser window and confirm the app loads. Remember that localStorage data belongs to that browser and does not sync to other devices.

## Step 16 — Plan the mobile-app path

**Goal:** Reuse what works without prematurely rebuilding the project.

**Prompt:**

> Review the finished web app and propose a staged path to a mobile app. Identify which data model, validation, study-session logic, and visual components can be reused, and which parts depend on browser localStorage or web-only navigation. Compare keeping the website and later adding a mobile client with turning the site into a progressive web app. Explain when a backend and account-based sync would become necessary. Do not migrate or add mobile tooling yet.

**Check before deciding:** Choose a mobile path based on what you need—installability, offline use, app-store distribution, notifications, or cross-device sync—not just because the site should also work on a phone-sized screen.

## Add these later, one at a time

- Import and export decks so users can back up or move their data.
- Search, tags, or folders once there are enough decks to organize.
- Spaced repetition after the basic study flow feels reliable.
- A backend and accounts if you need data to sync across browsers or devices.
- Shared decks, reminders, and notifications only when the core app is working well.
