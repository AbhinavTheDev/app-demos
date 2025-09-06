class Potion {
  constructor() {
    this.notes = [];
    this.aiCapabilitiesStarted = false;
    this.currentEditingNote = null;
    this.currentViewingNote = null;
    this.isMindsDBInitialized = false;
    this.apiUrl = "http://localhost:3000/api";
    this.isSearchActive = false;
    this.init();
  }

  async init() {
    this.bindEvents();
    await this.loadNotes();
    await this.initializeMindsDB();
  }

  async initializeMindsDB() {
    try {
      const response = await fetch(`${this.apiUrl}/setup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const result = await response.json();

      if (result.success) {
        if (this.notes.length > 0 && !this.isMindsDBInitialized) {
          this.isMindsDBInitialized = true;
        }
      } else {
        console.error("Setup failed:", result);
      }
    } catch (error) {
      console.error("MindsDB initialization failed:", error);
      this.showNotification("Error occurred!!", "warning");
    }
  }

  bindEvents() {
    // Modal events
    document
      .getElementById("openAddNoteModal")
      .addEventListener("click", () => this.openAddNoteModal());
    document
      .getElementById("closeAddNoteModal")
      .addEventListener("click", () => this.closeAddNoteModal());

    // View Note Modal events
    document
      .getElementById("closeViewNoteModal")
      .addEventListener("click", () => this.closeViewNoteModal());
    document
      .getElementById("editNoteFromView")
      .addEventListener("click", () => this.editNoteFromView());
    document
      .getElementById("generateSummaryBtn")
      .addEventListener("click", () => this.summarizeCurrentNote());

    // Edit Note Modal events
    document
      .getElementById("closeEditNoteModal")
      .addEventListener("click", () => this.closeEditNoteModal());

    // Form submissions
    document
      .getElementById("noteForm")
      .addEventListener("submit", (e) => this.handleAddNote(e));
    document
      .getElementById("editNoteForm")
      .addEventListener("submit", (e) => this.handleEditNote(e));

    // AI Capabilities
    document
      .getElementById("activateAI")
      .addEventListener("click", () => this.startAI());
    document
      .getElementById("disableAI")
      .addEventListener("click", () => this.stopAI());

    // AI Features
    document
      .getElementById("askAiBtn")
      .addEventListener("click", () => this.openAiSidebar());
    document
      .getElementById("closeAiSidebar")
      .addEventListener("click", () => this.closeAiSidebar());
    document
      .getElementById("sendAiMessage")
      .addEventListener("click", () => this.sendChatMessage());

    // Search functionality
    const searchInput = document.getElementById("note-search-input");

    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.handleSearch(e.target.value.trim());
      }
    });

    searchInput.addEventListener("blur", (e) => {
      if (!e.target.value.trim()) {
        this.clearSearch();
      }
    });

    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.target.value = "";
        this.clearSearch();
      }
    });

    document.getElementById("aiInput").addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.sendChatMessage();
    });

    // Close modals when clicking outside
    document.getElementById("addNoteModal").addEventListener("click", (e) => {
      if (e.target.classList.contains("modal-overlay")) {
        this.closeAddNoteModal();
      }
    });

    document.getElementById("viewNoteModal").addEventListener("click", (e) => {
      if (e.target.classList.contains("modal-overlay")) {
        this.closeViewNoteModal();
      }
    });

    document.getElementById("editNoteModal").addEventListener("click", (e) => {
      if (e.target.classList.contains("modal-overlay")) {
        this.closeEditNoteModal();
      }
    });
  }

  // Modal Management
  openAddNoteModal() {
    document.getElementById("addNoteModal").classList.add("active");
    document.getElementById("noteTitle").focus();
  }

  closeAddNoteModal() {
    document.getElementById("addNoteModal").classList.remove("active");
    this.clearForm();
  }

  // NEW: View Note Modal
  openViewNoteModal(noteId) {
    const note = this.notes.find((n) => n.id.toString() === noteId.toString());

    if (!note) {
      console.error("Note not found with ID:", noteId);
      this.showNotification("Note not found", "error");
      return;
    }

    this.currentViewingNote = note;

    // Populate view modal
    document.getElementById("viewNoteTitle").textContent = note.title;
    document.getElementById("viewNoteContentText").textContent = note.content;

    // Category
    const categoryDisplay = document.getElementById("viewNoteCategory");
    if (note.category) {
      categoryDisplay.textContent = note.category;
      categoryDisplay.style.display = "inline-block";
    } else {
      categoryDisplay.style.display = "none";
    }

    // Date
    document.getElementById("viewNoteDate").textContent = `Created: ${new Date(
      note.createdAt
    ).toLocaleDateString()}`;

    // Summary
    const summarySection = document.getElementById("viewNoteSummary");
    const summaryText = document.getElementById("summaryText");
    const generateBtn = document.getElementById("generateSummaryBtn");

    if (note.aiSummary) {
      summaryText.textContent = note.aiSummary;
      summarySection.classList.remove("hidden");
      generateBtn.textContent = "Regenerate AI Summary";
    } else {
      summarySection.classList.add("hidden");
      generateBtn.textContent = "Generate AI Summary";
    }

    document.getElementById("viewNoteModal").classList.add("active");
  }

  closeViewNoteModal() {
    document.getElementById("viewNoteModal").classList.remove("active");
  }

  editNoteFromView() {
    if (this.currentViewingNote) {
      this.closeViewNoteModal();
      this.openEditNoteModal(this.currentViewingNote.id);
    }
  }

  openEditNoteModal(noteId) {
    const note = this.notes.find((n) => n.id === noteId);
    if (!note) return;

    this.currentEditingNote = note;
    document.getElementById("editNoteId").value = note.id;
    document.getElementById("editNoteTitle").value = note.title;
    document.getElementById("editNoteCategory").value = note.category || "";
    document.getElementById("editNoteContent").value = note.content;
    document.getElementById("editNoteModal").classList.add("active");
  }

  closeEditNoteModal() {
    document.getElementById("editNoteModal").classList.remove("active");
    this.currentEditingNote = null;
  }

  // AI Sidebar Management
  openAiSidebar() {
    if (this.aiCapabilitiesStarted) {
      document.getElementById("aiSidebar").classList.add("open");
      document.getElementById("aiInput").focus();
    } else {
      this.showNotification("Initiate AI Services first!", "info");
    }
  }

  closeAiSidebar() {
    document.getElementById("aiSidebar").classList.remove("open");
  }

  async startAI() {
    if (!this.aiCapabilitiesStarted && this.notes.length > 0) {
      try {
        this.showNotification("Initializing AI capabilities...", "info");

        const response = await fetch(`${this.apiUrl}/mindsdb/initialize`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notes: this.notes }),
        });

        const result = await response.json();

        if (result.success) {
          this.aiCapabilitiesStarted = true;
          this.isMindsDBInitialized = true;
          document.getElementById("search-bar-container").style.display = "";
          document.getElementById("activateAI").style.display = "none";
          document.getElementById("disableAI").style.display = "";
          this.showNotification("AI capabilities activated!", "success");
        } else {
          this.showNotification("Failed to activate AI capabilities", "error");
        }
      } catch (error) {
        console.error("AI initialization failed:", error);
        this.showNotification("AI initialization failed", "error");
      }
    } else if (this.notes.length === 0) {
      this.showNotification("Add some notes first!", "warning");
    }
  }

  stopAI() {
    if (this.aiCapabilitiesStarted) {
      this.aiCapabilitiesStarted = false;
      document.getElementById("search-bar-container").style.display = "none";
      document.getElementById("disableAI").style.display = "none";
      document.getElementById("activateAI").style.display = "";
      this.showNotification("AI capabilities disabled", "info");
    }
  }

  // AI Search Feature
  async handleSearch(searchTerm) {
    if (!searchTerm) {
      this.clearSearch();
      return;
    }

    if (!this.aiCapabilitiesStarted) {
      this.showNotification("AI capabilities not activated", "warning");
      return;
    }
    try {
      this.showSearchLoading(true);
      this.showNotification("Searching with AI...", "info");

      const response = await fetch(`${this.apiUrl}/notes/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ searchTerm }),
      });

      const result = await response.json();

      if (result.success && result.data.length > 0) {
        const sortedResults = result.data.sort(
          (a, b) => b.relevance - a.relevance
        );
        const noteIds = [...new Set(sortedResults.map((item) => item.id))];

        console.log("Search results sorted by relevance:", sortedResults);
        console.log("Unique note IDs:", noteIds);

        // Fetch full note data for each ID
        const fullNotes = await this.fetchFullNotesFromIds(noteIds);

        if (fullNotes.length > 0) {
          const sortedFullNotes = this.sortNotesByRelevance(
            fullNotes,
            sortedResults
          );

          this.isSearchActive = true;
          this.renderSearchResults(sortedFullNotes, searchTerm, "AI");
          this.showNotification(
            `Found ${fullNotes.length} relevant matches`,
            "success"
          );
        } else {
          this.isSearchActive = false;
          this.renderNotes();
          this.showNotification("No matches found", "info");
        }
      } else {
        this.isSearchActive = false;
        this.renderNotes();
        this.showNotification("No matches found", "info");
      }
    } catch (error) {
      console.error("AI search failed:", error);
      this.showNotification("AI search failed!", "warning");
    } finally {
      this.showSearchLoading(false);
    }
  }
  sortNotesByRelevance(fullNotes, searchResults) {
    const relevanceMap = new Map();
    searchResults.forEach((result) => {
      const noteId = result.id.toString(); // Ensure string type
      if (
        !relevanceMap.has(noteId) ||
        relevanceMap.get(noteId) < result.relevance
      ) {
        relevanceMap.set(noteId, result.relevance);
      }
    });

    return fullNotes.sort((a, b) => {
      const relevanceA = relevanceMap.get(a.id.toString()) || 0;
      const relevanceB = relevanceMap.get(b.id.toString()) || 0;
      return relevanceB - relevanceA;
    });
  }
  // New method to fetch full note data from IDs
  async fetchFullNotesFromIds(noteIds) {
    try {
      // Get notes directly from localStorage
      const localNotes = JSON.parse(
        localStorage.getItem("smart_notes") || "[]"
      );

      // Filter notes by the provided IDs
      const matchingNotes = localNotes.filter((note) => {
        const noteIdStr = note.id.toString();
        return noteIds.some((id) => id.toString() === noteIdStr);
      });

      console.log("Found matching notes from localStorage:", matchingNotes);
      return matchingNotes; // Return as-is, already in correct format
    } catch (error) {
      console.error("Failed to fetch notes from localStorage:", error);
      return [];
    }
  }

  // Clear search and show all notes
  clearSearch() {
    this.isSearchActive = false;
    this.renderNotes();
    const searchInput = document.getElementById("note-search-input");
    if (searchInput && searchInput.value) {
      searchInput.value = "";
      this.showNotification("Search cleared", "info");
    }
  }

  // Show/hide search loading state
  showSearchLoading(show) {
    const indicator = document.getElementById("searchStatusIndicator");
    const searchInput = document.getElementById("note-search-input");
    if (show) {
      indicator.classList.add("active");
      searchInput.style.opacity = "0.7";
      searchInput.disabled = true;
      searchInput.placeholder = "Searching with AI...";
    } else {
      indicator.classList.remove("active");
      searchInput.style.opacity = "1";
      searchInput.disabled = false;
      searchInput.placeholder = "Search notes with AI... (Press Enter)";
    }
  }

  // AI Summary Feature
  async summarizeCurrentNote() {
    if (!this.currentViewingNote || !this.aiCapabilitiesStarted) {
      this.showNotification("AI capabilities not available", "warning");
      return;
    }

    try {
      this.showNotification("Generating AI summary...", "info");

      const response = await fetch(`${this.apiUrl}/notes/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          noteId: this.currentViewingNote.id,
          title: this.currentViewingNote.title,
          content: this.currentViewingNote.content,
          category: this.currentViewingNote.category,
        }),
      });

      const result = await response.json();

      if (result.success && result.data.length > 0) {
        const summary = result.data[0].summary;

        // Save summary to local note
        const noteIndex = this.notes.findIndex(
          (n) => n.id === this.currentViewingNote.id
        );
        if (noteIndex !== -1) {
          this.notes[noteIndex].aiSummary = summary;
          this.notes[noteIndex].updatedAt = new Date().toISOString();
          localStorage.setItem("smart_notes", JSON.stringify(this.notes));

          // Update current viewing note
          this.currentViewingNote.aiSummary = summary;
        }

        // Update view modal
        document.getElementById("summaryText").textContent = summary;
        document.getElementById("viewNoteSummary").classList.remove("hidden");
        document.getElementById("generateSummaryBtn").textContent =
          "Regenerate AI Summary";

        this.showNotification("AI summary generated successfully!", "success");
        this.renderNotes(); // Re-render to show summary indicator
      } else {
        this.showNotification("Could not generate summary", "error");
      }
    } catch (error) {
      console.error("Summary generation failed:", error);
      this.showNotification("Summary generation failed", "error");
    }
  }

  // NEW: Delete note from grid
  async deleteNoteFromGrid(noteId, event) {
    event.stopPropagation(); // Prevent opening view modal
    const note = this.notes.find((n) => n.id === noteId);
    if (!note) return;

    if (!confirm(`Are you sure you want to delete "${note.title}"?`)) return;

    this.notes = this.notes.filter((n) => n.id !== noteId);
    localStorage.setItem("smart_notes", JSON.stringify(this.notes));

    this.renderNotes();
    this.showNotification("Note deleted successfully!", "success");
  }

  async loadNotes() {
    try {
      this.showLoading(true);
      this.notes = JSON.parse(localStorage.getItem("smart_notes") || "[]");
      this.renderNotes();
    } catch (error) {
      console.log("Loading notes from localStorage");
      this.notes = JSON.parse(localStorage.getItem("smart_notes") || "[]");
      this.renderNotes();
    } finally {
      this.showLoading(false);
    }
  }

  async handleAddNote(e) {
    e.preventDefault();
    const title = document.getElementById("noteTitle").value.trim();
    const category = document.getElementById("noteCategory").value;
    const content = document.getElementById("noteContent").value.trim();

    if (!title || !content) {
      this.showNotification("Please fill in title and content", "error");
      return;
    }

    const note = {
      id: Date.now().toString(),
      title,
      category: category,
      content,
      tags: this.extractTags(content),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      aiSummary: null, // Initialize as null
    };

    this.notes.unshift(note);
    localStorage.setItem("smart_notes", JSON.stringify(this.notes));

    this.renderNotes();
    this.closeAddNoteModal();
    this.showNotification("Note added successfully!", "success");
  }

  async handleEditNote(e) {
    e.preventDefault();
    const id = document.getElementById("editNoteId").value;
    const title = document.getElementById("editNoteTitle").value.trim();
    const category = document.getElementById("editNoteCategory").value;
    const content = document.getElementById("editNoteContent").value.trim();

    if (!title || !content) {
      this.showNotification("Please fill in title and content", "error");
      return;
    }

    const noteIndex = this.notes.findIndex((n) => n.id === id);
    if (noteIndex === -1) return;

    const updatedNote = {
      ...this.notes[noteIndex],
      title,
      category,
      content,
      updatedAt: new Date().toISOString(),
      // Keep existing aiSummary if content hasn't changed significantly
    };

    this.notes[noteIndex] = updatedNote;
    localStorage.setItem("smart_notes", JSON.stringify(this.notes));

    this.renderNotes();
    this.closeEditNoteModal();
    this.showNotification("Note updated successfully!", "success");
  }

  extractTags(content) {
    const words = content.toLowerCase().split(/\W+/);
    const commonWords = [
      "the",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
      "is",
      "are",
      "was",
      "were",
      "be",
      "been",
      "have",
      "has",
      "had",
      "do",
      "does",
      "did",
      "will",
      "would",
      "could",
      "should",
      "may",
      "might",
      "can",
      "cannot",
      "a",
      "an",
      "this",
      "that",
      "these",
      "those",
    ];

    return words
      .filter((word) => word.length > 4 && !commonWords.includes(word))
      .slice(0, 5);
  }

  renderNotes() {
    const container = document.getElementById("notesContainer");

    if (this.notes.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>No notes found</h3>
          <p>Create your first note to get started!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="notes-grid">
        ${this.notes
          .map(
            (note) => `
            <div class="note-card" data-note-id="${note.id}">
              <button class="note-delete-btn" id="deleteNoteBtn" data-note-id="${
                note.id
              }">
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
              ${
                note.aiSummary
                  ? '<div class="note-summary-indicator" title="Has AI Summary">✨</div>'
                  : ""
              }
              <div class="note-header">
                <h3 class="note-title">${note.title}</h3>
                ${
                  note.category
                    ? `<span class="note-category">${note.category}</span>`
                    : ""
                }
              </div>
              <p class="note-content">${note.content.substring(0, 150)}${
              note.content.length > 150 ? "..." : ""
            }</p>
              <div class="note-footer">
                <span>Created: ${new Date(
                  note.createdAt
                ).toLocaleDateString()}</span>
                <span>Updated: ${new Date(
                  note.updatedAt
                ).toLocaleDateString()}</span>
              </div>
            </div>
          `
          )
          .join("")}
      </div>
    `;
    document.querySelectorAll(".note-delete-btn").forEach((button) => {
      button.addEventListener("click", (e) => {
        e.stopPropagation();
        const noteId = button.getAttribute("data-note-id");
        this.deleteNoteFromGrid(noteId, e);
      });
    });
    document.querySelectorAll(".note-card").forEach((card) => {
      card.addEventListener("click", () => {
        const noteId = card.getAttribute("data-note-id");
        this.openViewNoteModal(noteId);
      });
    });
  }

  renderSearchResults(results, searchTerm, searchType = "AI") {
    const container = document.getElementById("notesContainer");

    container.innerHTML = `
    <div class="search-status">
      <p>🔍 ${searchType} Search Results for "${searchTerm}" - <button class="clear-search-btn">Clear Search</button></p>
    </div>
    <div class="notes-grid">
      ${results
        .map(
          (note, index) => `
          <div class="note-card search-result" data-note-id="${note.id}">
            <button class="note-delete-btn" onclick="app.deleteNoteFromGrid('${
              note.id
            }', event)" title="Delete note">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
            ${
              note.aiSummary
                ? '<div class="note-summary-indicator" title="Has AI Summary">✨</div>'
                : ""
            }
            ${
              searchType === "AI"
                ? `<div class="search-rank" title="Search relevance rank">#${
                    index + 1
                  }</div>`
                : ""
            }
            <div class="note-header">
              <h3 class="note-title">${this.highlightSearchTerm(
                note.title,
                searchTerm
              )}</h3>
              ${
                note.category
                  ? `<span class="note-category">${note.category}</span>`
                  : ""
              }
            </div>
            <p class="note-content">${this.highlightSearchTerm(
              note.content.substring(0, 150),
              searchTerm
            )}${note.content.length > 150 ? "..." : ""}</p>
            <div class="note-footer">
              <span>Created: ${new Date(
                note.createdAt
              ).toLocaleDateString()}</span>
              <span>${searchType === "AI" ? "AI Match" : "Local Match"}</span>
            </div>
          </div>
        `
        )
        .join("")}
    </div>
  `;
    document
      .querySelector(".clear-search-btn")
      .addEventListener("click", () => {
        this.clearSearch();
      });
    document.querySelectorAll(".note-card").forEach((card) => {
      card.addEventListener("click", () => {
        const noteId = card.getAttribute("data-note-id");
        this.openViewNoteModal(noteId);
      });
    });
  }
  // Helper method to highlight search terms
  highlightSearchTerm(text, searchTerm) {
    if (!searchTerm) return text;
    const regex = new RegExp(
      `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    return text.replace(regex, "<mark>$1</mark>");
  }

  clearForm() {
    document.getElementById("noteForm").reset();
  }

  showLoading(show) {
    document.getElementById("loadingNotes").classList.toggle("hidden", !show);
  }

  async sendChatMessage() {
    const input = document.getElementById("aiInput");
    const message = input.value.trim();
    if (!message || !this.aiCapabilitiesStarted) return;

    this.addChatMessage(message, "user");
    input.value = "";

    // Show loading message
    const loadingMessageId = this.addChatLoadingMessage();

    try {
      const response = await fetch(`${this.apiUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const result = await response.json();

      // Remove loading message
      this.removeChatLoadingMessage(loadingMessageId);

      if (result.success && result.data.length > 0) {
        // FIXED: Use 'answer' instead of 'response'
        this.addChatMessage(result.data[0].answer, "ai");
      } else {
        this.addChatMessage("Sorry, I couldn't process your request.", "ai");
      }
    } catch (error) {
      console.error("Chat failed:", error);
      // Remove loading message on error
      this.removeChatLoadingMessage(loadingMessageId);
      this.addChatMessage(
        "Sorry, there was an error processing your message.",
        "ai"
      );
    }
  }

  // NEW: Add loading message with animation
  addChatLoadingMessage() {
    const messagesContainer = document.getElementById("aiMessages");
    const messageDiv = document.createElement("div");
    const loadingId = `loading-${Date.now()}`;
    messageDiv.id = loadingId;
    messageDiv.className = "chat-message ai loading";

    messageDiv.innerHTML = `
    <div class="loading-dots">
      <div class="loading-text">AI is thinking</div>
      <div class="dots">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
    </div>
  `;

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    return loadingId;
  }

  // NEW: Remove loading message
  removeChatLoadingMessage(loadingId) {
    const loadingMessage = document.getElementById(loadingId);
    if (loadingMessage) {
      loadingMessage.remove();
    }
  }

  // UPDATED: Enhanced addChatMessage to handle markdown-like formatting
  addChatMessage(message, sender) {
    const messagesContainer = document.getElementById("aiMessages");
    const messageDiv = document.createElement("div");
    messageDiv.className = `chat-message ${sender}`;

    const messageP = document.createElement("p");

    // Format the message to handle line breaks and basic formatting
    const formattedMessage = this.formatChatMessage(message);
    messageP.innerHTML = formattedMessage;

    messageDiv.appendChild(messageP);
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // NEW: Format chat message to handle line breaks and basic formatting
  formatChatMessage(message) {
    return (
      message
        // Convert line breaks to <br>
        .replace(/\n/g, "<br>")
        // Convert **bold** to <strong>
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        // Convert *italic* to <em>
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        // Convert numbered lists
        .replace(/^\d+\.\s+(.+)/gm, '<div class="chat-list-item">$1</div>')
        // Convert bullet points
        .replace(/^\*\s+(.+)/gm, '<div class="chat-bullet">• $1</div>')
    );
  }

  showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add("show");
    }, 100);

    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 300);
    }, 5000);
  }
}

// Initialize the app when DOM is loaded
let app;
document.addEventListener("DOMContentLoaded", () => {
  app = new Potion();
});

export default Potion;
