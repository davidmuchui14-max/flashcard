"use strict";

const STORAGE_KEY = "studyspace.flashcards.v1";
const DEFAULT_CATEGORIES = [
    { id: "probability-statistics", name: "Probability and statistics" },
    { id: "web-application", name: "Web application" },
    { id: "desktop-programming", name: "Desktop programming" },
    { id: "software-engineering", name: "Software engineering" },
    { id: "database-system", name: "Database system" },
    { id: "data-science", name: "Data science" },
    { id: "routing-switching", name: "Routing and switching" }
];

const app = document.getElementById("app");
const deckDialog = document.getElementById("deck-dialog");
const cardDialog = document.getElementById("card-dialog");
const deckForm = document.getElementById("deck-form");
const cardForm = document.getElementById("card-form");
const notice = document.getElementById("notice");

let state = {
    version: 1,
    categories: DEFAULT_CATEGORIES.map((category) => ({ ...category })),
    decks: []
};
let storageIssue = "";
let storageBlocked = false;
let currentView = "decks";
let selectedDeckId = null;
let selectedCategoryId = "all";
let studyIndex = 0;
let studyRevealed = false;
let studyRatings = [];
let noticeTimeout;

function makeId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
        return window.crypto.randomUUID();
    }

    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function isNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
}

function isValidSavedData(value) {
    if (!value || typeof value !== "object" || value.version !== 1) {
        return false;
    }

    if (!Array.isArray(value.categories) || !Array.isArray(value.decks)) {
        return false;
    }

    const categoryIds = new Set();
    const deckIds = new Set();

    for (const category of value.categories) {
        if (
            !category ||
            !isNonEmptyString(category.id) ||
            !isNonEmptyString(category.name) ||
            categoryIds.has(category.id)
        ) {
            return false;
        }
        categoryIds.add(category.id);
    }

    for (const deck of value.decks) {
        if (
            !deck ||
            !isNonEmptyString(deck.id) ||
            !isNonEmptyString(deck.name) ||
            !isNonEmptyString(deck.categoryId) ||
            !categoryIds.has(deck.categoryId) ||
            !Array.isArray(deck.cards) ||
            deckIds.has(deck.id)
        ) {
            return false;
        }
        deckIds.add(deck.id);

        const cardIds = new Set();
        for (const card of deck.cards) {
            if (
                !card ||
                !isNonEmptyString(card.id) ||
                !isNonEmptyString(card.question) ||
                !isNonEmptyString(card.answer) ||
                cardIds.has(card.id)
            ) {
                return false;
            }
            cardIds.add(card.id);
        }
    }

    return true;
}

function loadData() {
    try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved === null) {
            return;
        }

        const parsed = JSON.parse(saved);
        if (!isValidSavedData(parsed)) {
            storageBlocked = true;
            storageIssue = "Saved data is not in the format this app expects. Your stored data has not been overwritten.";
            return;
        }

        const requiredIds = new Set(DEFAULT_CATEGORIES.map((category) => category.id));
        const usedCategoryIds = new Set(parsed.decks.map((deck) => deck.categoryId));
        const existingCategoriesInUse = parsed.categories.filter((category) =>
            usedCategoryIds.has(category.id) && !requiredIds.has(category.id)
        );
        state = {
            ...parsed,
            categories: [
                ...DEFAULT_CATEGORIES.map((category) => ({ ...category })),
                ...existingCategoriesInUse
            ]
        };
        if (state.categories.length !== parsed.categories.length ||
            DEFAULT_CATEGORIES.some((category) => !parsed.categories.some((savedCategory) => savedCategory.id === category.id && savedCategory.name === category.name))) {
            saveData();
        }
    } catch (error) {
        storageBlocked = true;
        storageIssue = error instanceof SyntaxError
            ? "Saved data could not be read because it is malformed. Your stored data has not been overwritten."
            : "Browser storage is unavailable. Your changes will only last until you close this page.";
    }
}

function saveData() {
    if (storageBlocked) {
        return false;
    }

    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        storageIssue = "";
        return true;
    } catch (error) {
        storageBlocked = true;
        storageIssue = "The browser could not save your data. Your current changes remain visible until you close this page.";
        render();
        return false;
    }
}

function updateAndSave() {
    saveData();
    render();
}

function getSelectedDeck() {
    return state.decks.find((deck) => deck.id === selectedDeckId) || null;
}

function getCategoryName(categoryId) {
    return state.categories.find((category) => category.id === categoryId)?.name || "Unknown topic";
}

function showNotice(message, kind = "success") {
    window.clearTimeout(noticeTimeout);
    notice.textContent = message;
    notice.dataset.kind = kind;
    notice.hidden = false;
    noticeTimeout = window.setTimeout(() => {
        notice.hidden = true;
    }, 3200);
}

function renderStorageWarning() {
    if (!storageIssue) {
        return "";
    }

    const canReset = storageBlocked;
    return `
        <section class="storage-warning" aria-label="Storage status">
            <div>
                <strong>Storage needs attention</strong>
                <p>${escapeHtml(storageIssue)}</p>
            </div>
            ${canReset ? '<button type="button" data-action="reset-storage">Start fresh in this browser</button>' : ""}
        </section>
    `;
}

function renderStats() {
    const totalCards = state.decks.reduce((total, deck) => total + deck.cards.length, 0);

    return `
        <section class="stats-row" aria-label="Your study library">
            <div class="stat-card">
                <div><span class="stat-label">Your decks</span><strong class="stat-value">${state.decks.length}</strong></div>
                <span class="stat-icon" aria-hidden="true">▤</span>
            </div>
            <div class="stat-card">
                <div><span class="stat-label">Flashcards</span><strong class="stat-value">${totalCards}</strong></div>
                <span class="stat-icon" aria-hidden="true">▧</span>
            </div>
            <div class="stat-card">
                <div><span class="stat-label">Topics</span><strong class="stat-value">${state.categories.length}</strong></div>
                <span class="stat-icon" aria-hidden="true">◉</span>
            </div>
        </section>
    `;
}

function renderDeckCard(deck) {
    const cardWord = deck.cards.length === 1 ? "card" : "cards";
    return `
        <article class="deck-card">
            <div class="deck-card-top">
                <span class="category-tag">${escapeHtml(getCategoryName(deck.categoryId))}</span>
                <details class="card-menu">
                    <summary aria-label="Actions for ${escapeHtml(deck.name)}">⋯</summary>
                    <div class="card-menu-items">
                        <button type="button" data-action="edit-deck" data-deck-id="${escapeHtml(deck.id)}">Rename deck</button>
                        <button type="button" class="menu-delete" data-action="delete-deck" data-deck-id="${escapeHtml(deck.id)}">Delete deck</button>
                    </div>
                </details>
            </div>
            <h3 class="deck-title">${escapeHtml(deck.name)}</h3>
            <p class="deck-subtitle">${deck.cards.length} ${cardWord} ready to study</p>
            <div class="deck-card-spacer"></div>
            <div class="deck-card-footer">
                <div class="deck-meta"><span aria-hidden="true">▧</span><span>${deck.cards.length} ${cardWord}</span></div>
                <div class="deck-actions">
                    <button class="button button-quiet button-small" type="button" data-action="open-deck" data-deck-id="${escapeHtml(deck.id)}">View deck</button>
                    <button class="button button-primary button-small" type="button" data-action="start-study" data-deck-id="${escapeHtml(deck.id)}" ${deck.cards.length === 0 ? "disabled" : ""}>Study</button>
                </div>
            </div>
        </article>
    `;
}

function renderDecksView() {
    const filteredDecks = selectedCategoryId === "all"
        ? state.decks
        : state.decks.filter((deck) => deck.categoryId === selectedCategoryId);

    const content = filteredDecks.length
        ? `<div class="deck-grid">${filteredDecks.map(renderDeckCard).join("")}</div>`
        : `
            <section class="empty-state">
                <div class="empty-illustration" aria-hidden="true">✳</div>
                <h2>${state.decks.length === 0 ? "Your first deck starts here" : "No decks in this topic yet"}</h2>
                <p>${state.decks.length === 0
                    ? "Choose a topic, give your deck a name, and add a few questions to start learning."
                    : "Try another topic, or create a deck for this one."}</p>
                <button class="button button-primary" type="button" data-action="new-deck"><span aria-hidden="true">＋</span> Create a deck</button>
            </section>
        `;

    return `
        ${renderStorageWarning()}
        <section class="page-heading">
            <div>
                <p class="eyebrow">A LITTLE LEARNING, EVERY DAY</p>
                <h1>Your study space</h1>
                <p class="page-description">Keep your knowledge organized, one card at a time.</p>
            </div>
            <button class="button button-primary" type="button" data-action="new-deck"><span aria-hidden="true">＋</span> New deck</button>
        </section>
        ${renderStats()}
        <section aria-labelledby="deck-list-heading">
            <div class="section-heading">
                <h2 id="deck-list-heading">Your decks</h2>
                <label class="filter-label" for="category-filter">
                    <span>Filter by topic</span>
                    <select id="category-filter" name="categoryFilter">
                        <option value="all" ${selectedCategoryId === "all" ? "selected" : ""}>All topics</option>
                        ${state.categories.map((category) => `
                            <option value="${escapeHtml(category.id)}" ${selectedCategoryId === category.id ? "selected" : ""}>
                                ${escapeHtml(category.name)}
                            </option>
                        `).join("")}
                    </select>
                </label>
            </div>
            ${content}
        </section>
    `;
}

function renderDeckView(deck) {
    const cards = deck.cards.length
        ? `
            <div class="flashcard-list">
                ${deck.cards.map((card, index) => `
                    <article class="flashcard-row">
                        <span class="card-number" aria-label="Card ${index + 1}">${String(index + 1).padStart(2, "0")}</span>
                        <div>
                            <p class="flashcard-question">${escapeHtml(card.question)}</p>
                            <p class="flashcard-preview">${escapeHtml(card.answer)}</p>
                        </div>
                        <div class="row-actions">
                            <button type="button" data-action="edit-card" data-card-id="${escapeHtml(card.id)}">Edit</button>
                            <button class="delete-action" type="button" data-action="delete-card" data-card-id="${escapeHtml(card.id)}">Delete</button>
                        </div>
                    </article>
                `).join("")}
            </div>
        `
        : `
            <section class="empty-state detail-empty">
                <div class="empty-illustration" aria-hidden="true">▧</div>
                <h2>No cards in this deck yet</h2>
                <p>Add your first question and answer. You can start studying as soon as you have a card.</p>
                <button class="button button-primary" type="button" data-action="new-card"><span aria-hidden="true">＋</span> Add a flashcard</button>
            </section>
        `;

    return `
        ${renderStorageWarning()}
        <button class="button button-quiet button-small back-button" type="button" data-action="back-to-decks">← All decks</button>
        <section class="detail-header">
            <div>
                <div class="detail-title-row">
                    <h1>${escapeHtml(deck.name)}</h1>
                    <span class="category-tag">${escapeHtml(getCategoryName(deck.categoryId))}</span>
                </div>
                <p class="page-description">${deck.cards.length} ${deck.cards.length === 1 ? "flashcard" : "flashcards"} in this deck</p>
            </div>
            <div class="detail-actions">
                <button class="button button-quiet" type="button" data-action="new-card"><span aria-hidden="true">＋</span> Add card</button>
                <button class="button button-primary" type="button" data-action="start-study" data-deck-id="${escapeHtml(deck.id)}" ${deck.cards.length === 0 ? "disabled" : ""}>Start studying <span aria-hidden="true">→</span></button>
            </div>
        </section>
        <section aria-labelledby="cards-heading">
            <div class="section-heading"><h2 id="cards-heading">Cards in this deck</h2></div>
            ${cards}
        </section>
    `;
}

function renderStudyView(deck) {
    const total = deck.cards.length;
    const complete = studyIndex >= total;

    if (complete) {
        const known = studyRatings.filter((rating) => rating === "known").length;
        const review = studyRatings.filter((rating) => rating === "review").length;
        return `
            ${renderStorageWarning()}
            <div class="study-wrap">
                <button class="button button-quiet button-small back-button" type="button" data-action="open-deck" data-deck-id="${escapeHtml(deck.id)}">← Back to deck</button>
                <section class="completion-card">
                    <div class="completion-icon" aria-hidden="true">✓</div>
                    <p class="eyebrow">SESSION COMPLETE</p>
                    <h1>Nice work.</h1>
                    <p>You made it through <strong>${total}</strong> ${total === 1 ? "card" : "cards"} in <strong>${escapeHtml(deck.name)}</strong>.</p>
                    <div class="result-row">
                        <div class="result-pill result-good"><strong>${known}</strong>Got it</div>
                        <div class="result-pill result-review"><strong>${review}</strong>Need to review</div>
                    </div>
                    <div class="completion-actions">
                        <button class="button button-quiet" type="button" data-action="open-deck" data-deck-id="${escapeHtml(deck.id)}">Back to deck</button>
                        <button class="button button-primary" type="button" data-action="restart-study" data-deck-id="${escapeHtml(deck.id)}">Study again</button>
                    </div>
                </section>
            </div>
        `;
    }

    const card = deck.cards[studyIndex];
    const progress = Math.round((studyIndex / total) * 100);
    return `
        ${renderStorageWarning()}
        <div class="study-wrap">
            <div class="study-topline">
                <div>
                    <span class="category-tag">${escapeHtml(getCategoryName(deck.categoryId))}</span>
                    <p class="study-deck-name">${escapeHtml(deck.name)}</p>
                </div>
                <span class="study-progress">Card ${studyIndex + 1} of ${total}</span>
            </div>
            <div class="progress-track" role="progressbar" aria-label="Study progress" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${studyIndex}">
                <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
            <section class="study-card" aria-live="polite">
                <p class="eyebrow">${studyRevealed ? "THE ANSWER" : "TAKE A MOMENT TO THINK"}</p>
                <h1 class="study-question">${escapeHtml(studyRevealed ? card.answer : card.question)}</h1>
                ${studyRevealed
                    ? '<p class="study-hint">How well did you know it?</p>'
                    : '<button class="button button-primary" type="button" data-action="reveal-answer">Reveal answer</button>'}
            </section>
            ${studyRevealed ? `
                <div class="study-rating">
                    <button class="button button-review" type="button" data-action="rate-card" data-rating="review">↻ &nbsp; Need to review</button>
                    <button class="button button-known" type="button" data-action="rate-card" data-rating="known">✓ &nbsp; Got it</button>
                </div>
            ` : ""}
        </div>
    `;
}

function render() {
    const deck = getSelectedDeck();

    if ((currentView === "deck" || currentView === "study") && !deck) {
        currentView = "decks";
        selectedDeckId = null;
    }

    if (currentView === "decks") {
        app.innerHTML = renderDecksView();
    } else if (currentView === "deck") {
        app.innerHTML = renderDeckView(deck);
    } else {
        app.innerHTML = renderStudyView(deck);
    }

    document.getElementById("deck-category").innerHTML = state.categories
        .map((category) => `<option value="${escapeHtml(category.id)}">${escapeHtml(category.name)}</option>`)
        .join("");
}

function openDeckDialog(deck = null) {
    document.getElementById("deck-dialog-title").textContent = deck ? "Rename your deck" : "Create a deck";
    document.getElementById("deck-id").value = deck?.id || "";
    document.getElementById("deck-name").value = deck?.name || "";
    document.getElementById("deck-category").value = deck?.categoryId || state.categories[0]?.id || "";
    deckDialog.showModal();
    document.getElementById("deck-name").focus();
}

function openCardDialog(card = null) {
    document.getElementById("card-dialog-title").textContent = card ? "Edit your flashcard" : "Add a flashcard";
    document.getElementById("card-id").value = card?.id || "";
    document.getElementById("card-question").value = card?.question || "";
    document.getElementById("card-answer").value = card?.answer || "";
    cardDialog.showModal();
    document.getElementById("card-question").focus();
}

function startStudy(deckId) {
    const deck = state.decks.find((item) => item.id === deckId);
    if (!deck || deck.cards.length === 0) {
        showNotice("Add at least one flashcard before studying.", "error");
        return;
    }

    selectedDeckId = deckId;
    currentView = "study";
    studyIndex = 0;
    studyRevealed = false;
    studyRatings = [];
    render();
    app.focus();
}

function openDeck(deckId) {
    const deck = state.decks.find((item) => item.id === deckId);
    if (!deck) {
        showNotice("That deck could not be found.", "error");
        return;
    }

    selectedDeckId = deckId;
    currentView = "deck";
    render();
    app.focus();
}

app.addEventListener("click", (event) => {
    const actionElement = event.target.closest("[data-action]");
    if (!actionElement) {
        return;
    }

    const { action, deckId, cardId, rating } = actionElement.dataset;

    if (action === "new-deck") {
        openDeckDialog();
    } else if (action === "edit-deck") {
        const deck = state.decks.find((item) => item.id === deckId);
        if (deck) {
            openDeckDialog(deck);
        }
    } else if (action === "delete-deck") {
        const deck = state.decks.find((item) => item.id === deckId);
        if (deck && window.confirm(`Delete "${deck.name}" and all ${deck.cards.length} of its cards? This cannot be undone.`)) {
            state.decks = state.decks.filter((item) => item.id !== deckId);
            if (selectedDeckId === deckId) {
                selectedDeckId = null;
                currentView = "decks";
            }
            updateAndSave();
            showNotice("Deck deleted.");
        }
    } else if (action === "open-deck") {
        openDeck(deckId || selectedDeckId);
    } else if (action === "back-to-decks") {
        currentView = "decks";
        selectedDeckId = null;
        render();
        app.focus();
    } else if (action === "new-card") {
        if (getSelectedDeck()) {
            openCardDialog();
        }
    } else if (action === "edit-card") {
        const deck = getSelectedDeck();
        const card = deck?.cards.find((item) => item.id === cardId);
        if (card) {
            openCardDialog(card);
        }
    } else if (action === "delete-card") {
        const deck = getSelectedDeck();
        const card = deck?.cards.find((item) => item.id === cardId);
        if (deck && card && window.confirm("Delete this flashcard? This cannot be undone.")) {
            deck.cards = deck.cards.filter((item) => item.id !== cardId);
            updateAndSave();
            showNotice("Flashcard deleted.");
        }
    } else if (action === "start-study") {
        startStudy(deckId || selectedDeckId);
    } else if (action === "reveal-answer") {
        studyRevealed = true;
        render();
    } else if (action === "rate-card") {
        if (!studyRevealed || !["known", "review"].includes(rating)) {
            return;
        }
        studyRatings[studyIndex] = rating;
        studyIndex += 1;
        studyRevealed = false;
        render();
    } else if (action === "restart-study") {
        startStudy(deckId || selectedDeckId);
    } else if (action === "reset-storage") {
        const confirmed = window.confirm("This will delete the unreadable saved data for this app from this browser and start with an empty library. Continue?");
        if (!confirmed) {
            return;
        }
        try {
            window.localStorage.removeItem(STORAGE_KEY);
            state = {
                version: 1,
                categories: DEFAULT_CATEGORIES.map((category) => ({ ...category })),
                decks: []
            };
            storageIssue = "";
            storageBlocked = false;
            selectedDeckId = null;
            currentView = "decks";
            updateAndSave();
            showNotice("Started a fresh library.");
        } catch (error) {
            storageIssue = "The browser would not clear the saved data. Check your browser storage settings and try again.";
            render();
        }
    }
});

app.addEventListener("change", (event) => {
    if (event.target.id === "category-filter") {
        selectedCategoryId = event.target.value;
        render();
    }
});

deckForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(deckForm);
    const name = String(formData.get("deckName") || "").trim();
    const categoryId = String(formData.get("categoryId") || "");
    const deckId = String(formData.get("deckId") || "");

    if (!name) {
        document.getElementById("deck-name").setCustomValidity("Enter a name for this deck.");
        deckForm.reportValidity();
        return;
    }
    document.getElementById("deck-name").setCustomValidity("");

    if (!state.categories.some((category) => category.id === categoryId)) {
        showNotice("Choose a valid topic for this deck.", "error");
        return;
    }

    const existingDeck = state.decks.find((deck) => deck.id === deckId);
    if (existingDeck) {
        existingDeck.name = name;
        existingDeck.categoryId = categoryId;
        showNotice("Deck updated.");
    } else {
        state.decks.unshift({
            id: makeId(),
            name,
            categoryId,
            cards: []
        });
        showNotice("Your new deck is ready.");
    }

    deckDialog.close();
    deckForm.reset();
    updateAndSave();
});

document.getElementById("deck-name").addEventListener("input", (event) => {
    event.currentTarget.setCustomValidity("");
});

cardForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const deck = getSelectedDeck();
    if (!deck) {
        cardDialog.close();
        showNotice("Open a deck before adding a flashcard.", "error");
        return;
    }

    const formData = new FormData(cardForm);
    const question = String(formData.get("question") || "").trim();
    const answer = String(formData.get("answer") || "").trim();
    const cardId = String(formData.get("cardId") || "");

    if (!question || !answer) {
        showNotice("Add both a question and an answer.", "error");
        return;
    }

    const existingCard = deck.cards.find((card) => card.id === cardId);
    if (existingCard) {
        existingCard.question = question;
        existingCard.answer = answer;
        showNotice("Flashcard updated.");
    } else {
        deck.cards.push({
            id: makeId(),
            question,
            answer
        });
        showNotice("Flashcard added.");
    }

    cardDialog.close();
    cardForm.reset();
    updateAndSave();
});

document.addEventListener("click", (event) => {
    if (event.target.closest("[data-close-dialog]")) {
        deckDialog.close();
        cardDialog.close();
    }

    if (event.target === deckDialog) {
        deckDialog.close();
    }
    if (event.target === cardDialog) {
        cardDialog.close();
    }
});

loadData();
render();
