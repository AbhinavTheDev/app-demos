class AlgoliaMCPChat {
  constructor() {
    this.appContainer = document.getElementById("app-container");

    // State
    this.isProcessing = false;
    this.apiUrl = "http://127.0.0.1:3000/api/chat";
    this.chatHistory = [];
    this.currentChatId = null;
    this.originalAppContent = null; // Store original app container content

    // Sample queries for the UI
    this.sampleQueriesData = [
      "Search for sci-fi movies from the 1980s",
      "How many records are in my movie index?",
      "Show me the most popular search terms",
      "What's the search performance like?",
      "Find movies directed by James Cameron",
    ];

    // Store the original app container content before initialization
    if (this.appContainer) {
      this.originalAppContent = this.appContainer.innerHTML;
    }

    this.init();
  }

  init() {
    // Always initialize chat elements and event listeners
    this.initializeChatElements();
    this.setupEventListeners();
    this.renderSampleQueries();
    this.checkApiHealth();
    this.autoResizeInput();
    // Check for and load a saved chat from localStorage
    if (!this.loadChatFromStorage()) {
      this.currentChatId = this.generateChatId();
      this.addWelcomeScreen();
    }
  }
  // --- DOM elements ---
  initializeChatElements() {
    this.messagesContainer = document.getElementById("messagesContainer");
    this.messagesContent = document.getElementById("messageContent");
    this.messageInput = document.getElementById("messageInput");
    this.chatForm = document.getElementById("chatForm");
    this.sendButton = document.getElementById("sendButton");
    this.newChatBtn = document.getElementById("newChatBtn");
    this.configPanel = document.getElementById("configPanel");
    this.configToggle = document.getElementById("configIcon");
    this.configPanelCloseBtn = document.getElementById("configPanelClose");
    this.sampleQueries = document.getElementById("sampleQueries");
  }

  // Main workflow functions

  async checkApiHealth() {
    // console.log("checkAPIHealth is working.....");
    try {
      const response = await fetch("http://127.0.0.1:3000/api/health");
      const data = await response.json();

      if (data.status === "ok") {
        console.log("API health check passed");
      } else {
        console.warn("API health check returned unexpected status:", data);
        this.addSystemMessage(
          "Warning: The chat backend returned an unexpected status. Some features may not work correctly."
        );
      }
    } catch (error) {
      console.error("API health check failed:", error);
      this.addSystemMessage(
        "Warning: Could not connect to the chat backend. Please make sure the server is running."
      );
    }
  }

  setupEventListeners() {
    // console.log("event listener function is working.....");

    // Chat form submission
    if (this.chatForm) {
      this.chatForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleSendMessage();
      });
    }

    // New chat button
    if (this.newChatBtn) {
      this.newChatBtn.addEventListener("click", () => {
        this.startNewChat();
      });
    }
    // Config panel toggle (if exists in this UI)
    // Config panel toggle
    if (this.configToggle && this.configPanel) {
      // Check both exist
      this.configPanelCloseBtn.addEventListener("click", (e) => {
        e.preventDefault();
        // Toggle between flex and none display
        this.configPanel.style.display =
          this.configPanel.style.display === "none" ? "flex" : "none";
      });
      this.configToggle.addEventListener("click", (e) => {
        e.preventDefault();
        // Toggle between flex and none display
        this.configPanel.style.display =
          this.configPanel.style.display === "none" ? "flex" : "none";
      });
    }

    // Input field auto-resize and enter key handling
    if (this.messageInput) {
      this.messageInput.addEventListener("input", () => {
        this.autoResizeInput();
      });

      this.messageInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          this.handleSendMessage();
        }
      });
    }
  }

  renderSampleQueries() {
    // console.log("render sample query is working.....");

    const sampleQueriesElement = document.getElementById("sampleQueries");
    if (!sampleQueriesElement) return;

    sampleQueriesElement.innerHTML = "";
    this.sampleQueriesData.forEach((query) => {
      const button = document.createElement("button");
      button.className = "query-button";
      button.textContent = query;
      button.type = "button";
      button.addEventListener("click", (e) => {
        e.preventDefault();
        if (this.messageInput) {
          this.messageInput.value = query;
          this.handleSendMessage();
          if (this.configToggle && this.configPanel) {
            this.configPanel.style.display =
              this.configPanel.style.display === "none" ? "flex" : "none";
          }
        }
      });
      sampleQueriesElement.appendChild(button);
    });
  }

  saveChatToStorage() {
    // console.log("save to storage is working.....");

    if (this.chatHistory.length > 0) {
      const chatData = {
        chatId: this.currentChatId,
        history: this.chatHistory,
      };
      // console.log(chatData);
      localStorage.setItem("mcpChatSession", JSON.stringify(chatData));
    }
  }

  loadChatFromStorage() {
    // console.log("load chat from localstorage is working.....");

    const savedChat = localStorage.getItem("mcpChatSession");
    if (savedChat) {
      const chatData = JSON.parse(savedChat);
      this.chatHistory = chatData.history;
      this.currentChatId = chatData.chatId;

      this.initializeChatElements();

      // Render the saved messages
      this.messagesContainer.innerHTML = ""; // Clear any default content
      this.chatHistory.forEach((message) => this.renderMessage(message));

      return true; // Indicate that a chat was loaded
    }
    return false; // No chat found
  }

  startNewChat() {
    // console.log("start new chat is working.....");

    // Clear the saved session from localStorage
    localStorage.removeItem("mcpChatSession");

    // Reset chat history
    this.chatHistory = [];

    // Generate a new chat ID
    this.currentChatId = this.generateChatId();

    // Show welcome screen instead of clearing messages
    this.addWelcomeScreen();
  }

  generateChatId() {
    return "chat_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
  }

  addWelcomeScreen() {
    // console.log("welcome screen is working.....");

    // Create welcome screen HTML
    const welcomeHTML = `
          <div class="welcomeScreen" id="welcomeScreen">
      <div class="inner">
        <!-- Project Overview -->
        <div class="project-overview">
        <img src="./assets/algolia.svg" alt="algoliaLogo" width="55" height="55" class="flip-logo" />
          <h1>Algolia MCP Chat</h1>
        </div>

        <!-- Form -->
        <div class="welcome-form-wrapper">
          <div class="textarea-wrapper">
            <textarea id="welcomeInput" class="welcome-input" placeholder="Type your message..."></textarea>
            <div class="welcome-input-actions">
            <!-- Model Picker -->
            <div class="model-picker">
              <div class="dropdown" id="modelDropdown">
                <button class="dropdown-toggle" onclick="toggleDropdown()">
                 <img
                        src="./assets/meta.svg"
                        alt="Meta"
                        class="provider-icon"
                      />
                      <span>Llama 3.1</span>
                  <svg
                    class="dropdown-arrow"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                <div class="dropdown-menu">
                  <div
                    class="dropdown-item"
                    onclick="selectModel('Llama 3.1', 'Meta', '#0866ff')"
                  >
                    <div class="dropdown-item-header">
                      <img
                        src="./assets/meta.svg"
                        alt="Meta"
                        class="provider-icon"
                      />
                      <span>Llama 3.1</span>
                    </div>
                    <span class="dropdown-item-provider">Meta</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Send Button -->
            <button id="welcomeSendButton" class="welcome-send-button">
              <img src="./assets/send.svg" class="send-icon" alt="send-icon" />
            </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    `;

    // NOTE: Do not store original content here as it's already stored in constructor

    // Add welcome screen to app container
    this.appContainer.innerHTML = welcomeHTML;
    this.appContainer.style.display = "block";

    // Setup dropdown functionality
    const dropdown = document.getElementById("modelDropdown");
    const toggle = dropdown.querySelector(".dropdown-toggle");

    toggle.addEventListener("click", () => {
      dropdown.classList.toggle("open");
    });

    // Model selection handler
    window.selectModel = (modelName, provider, color) => {
      const toggle = document.querySelector(".dropdown-toggle");
      const icon = toggle.querySelector(".provider-icon");
      const text = toggle.querySelector("span");

      icon.src = `./assets/${provider.toLowerCase()}.svg`;
      icon.alt = provider;
      text.textContent = modelName;

      dropdown.classList.remove("open");
    };

    // Close dropdown when clicking outside
    document.addEventListener("click", (event) => {
      if (!dropdown.contains(event.target)) {
        dropdown.classList.remove("open");
      }
    });

    // Setup welcome input and send button
    const welcomeInput = document.getElementById("welcomeInput");
    const welcomeSendButton = document.getElementById("welcomeSendButton");

    // Handle welcome input enter key
    welcomeInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.handleWelcomeSubmit();
      }
    });

    // Handle welcome send button click
    welcomeSendButton.addEventListener("click", () => {
      this.handleWelcomeSubmit();
    });
  }

  handleWelcomeSubmit() {
    // console.log("handle welcome submit is working.....");

    const welcomeInput = document.getElementById("welcomeInput");
    const message = welcomeInput.value.trim();

    if (!message || this.isProcessing) return;

    // Restore original app container content
    this.appContainer.innerHTML = this.originalAppContent;

    // Re-initialize DOM elements after restoring original content
    this.initializeChatElements();
    this.setupEventListeners();
    this.renderSampleQueries();
    this.checkApiHealth();
    this.autoResizeInput();

    // Set the message input value to the welcome input value
    if (this.messageInput) {
      this.messageInput.value = message;
    }
    // Process the message
    this.handleSendMessage();
  }

  async handleSendMessage() {
    // console.log("handle send message is working.....");

    if (!this.messageInput) return;

    const message = this.messageInput.value.trim();
    if (!message || this.isProcessing) return;

    this.isProcessing = true;
    if (this.sendButton) {
      this.sendButton.disabled = true;
    }

    // Add user message to UI
    const userMessage = {
      role: "user",
      content: message,
    };

    this.chatHistory.push(userMessage);

    this.renderMessage(userMessage);

    // Clear input and resize
    this.messageInput.value = "";
    this.autoResizeInput();

    // Show typing indicator
    this.showTypingIndicator();

    try {
      // Call the backend API
      const response = await this.callChatApi(message);
      this.hideTypingIndicator();

      // Process and display the response
      if (response.error) {
        const assistantMessage = {
          role: "assistant",
          content: response.message || "Some error while processing query",
        };
        this.addSystemMessage(
          `Error: ${response.message || "Unknown error occurred"}`
        );
      } else {
        // Add the main response
        const assistantMessage = {
          role: "assistant",
          content:
            response.response ||
            "I received your message but couldn't generate a response.",
          mcp: response.mcpResults || {},
          intent: response.intent || {},
        };

        this.chatHistory.push(assistantMessage);
        this.saveChatToStorage();
        this.renderMessage(assistantMessage);
        // console.log("CHAT DATA AFTER Send Message", this.chatHistory);
        // Save the chat history after a successful exchange

        // Process any tool results if available
        if (response.toolResults && response.toolResults.length > 0) {
          this.processToolResults(response.toolResults);
        }
      }
    } catch (error) {
      this.hideTypingIndicator();
      this.addSystemMessage(
        `Error communicating with the server: ${error.message}`
      );
      console.error("API call error:", error);
    }

    this.isProcessing = false;
    if (this.sendButton) {
      this.sendButton.disabled = false;
    }
    if (this.messageInput) {
      this.messageInput.focus();
    }
  }

  async callChatApi(message) {
    // console.log("call chat api is working.....");

    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          conversationHistory: this.chatHistory,
        }),
      });
      console.log("Response from backend", response);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Server responded with status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("API call failed:", error);
      throw error;
    }
  }

  processToolResults(toolResults) {
    // console.log("process tool result is working.....");

    toolResults.forEach((result) => {
      if (result.error) {
        // Display tool error
        this.addSystemMessage(
          `Tool error (${result.toolName}): ${result.error}`
        );
      } else if (result.result) {
        // Process different types of tool results
        if (result.toolName === "search") {
          this.displaySearchResults(result.result);
        } else if (result.toolName === "analytics") {
          this.displayAnalyticsResults(result.result);
        } else {
          // Generic tool result display
          this.addSystemMessage(`Tool result (${result.toolName}):`);
          this.addCodeBlock(JSON.stringify(result.result, null, 2));
        }
      }
    });
  }

  // Utility Functions

  autoResizeInput() {
    // console.log("auto resize is wokring is working.....");

    if (!this.messageInput) return;

    // Reset height to auto to get the correct scrollHeight
    this.messageInput.style.height = "auto";

    // Set the height based on scrollHeight (with a max height)
    const newHeight = Math.min(this.messageInput.scrollHeight, 150);
    this.messageInput.style.height = `${newHeight}px`;
  }

  displaySearchResults(results) {
    // console.log("display search result is working.....");

    if (!results || !results.hits || results.hits.length === 0) {
      this.addSystemMessage("No search results found.");
      return;
    }

    // Create a formatted display of search results
    const resultsContainer = document.createElement("div");
    resultsContainer.className = "search-results";

    results.hits.forEach((hit) => {
      const resultItem = document.createElement("div");
      resultItem.className = "search-result-item";

      // Title with year
      const title = document.createElement("h4");
      title.textContent = `${hit.title} (${hit.year || "N/A"})`;
      resultItem.appendChild(title);

      // Details
      const details = document.createElement("div");
      details.className = "search-result-details";

      if (hit.director) {
        const director = document.createElement("span");
        director.textContent = `Director: ${hit.director}`;
        details.appendChild(director);
      }

      if (hit.genre) {
        const genre = document.createElement("span");
        genre.textContent = `Genre: ${hit.genre}`;
        details.appendChild(genre);
      }

      if (hit.rating) {
        const rating = document.createElement("span");
        rating.textContent = `Rating: ${hit.rating}`;
        details.appendChild(rating);
      }

      resultItem.appendChild(details);
      resultsContainer.appendChild(resultItem);
    });

    // Add to messages container
    this.addCustomContent(resultsContainer);
  }

  displayAnalyticsResults(analytics) {
    // console.log("displayAnalyticsResults is working.....");

    if (!analytics) {
      this.addSystemMessage("No analytics data available.");
      return;
    }

    // Create a formatted display of analytics
    const analyticsContainer = document.createElement("div");
    analyticsContainer.className = "analytics-results";

    // Create a table for analytics data
    const table = document.createElement("table");
    table.className = "analytics-table";

    // Add rows for each analytics metric
    Object.entries(analytics).forEach(([key, value]) => {
      const row = document.createElement("tr");

      const keyCell = document.createElement("td");
      keyCell.className = "analytics-key";
      keyCell.textContent = this.formatAnalyticsKey(key);

      const valueCell = document.createElement("td");
      valueCell.className = "analytics-value";

      // Format arrays specially
      if (Array.isArray(value)) {
        valueCell.textContent = value.join(", ");
      } else {
        valueCell.textContent = value;
      }

      row.appendChild(keyCell);
      row.appendChild(valueCell);
      table.appendChild(row);
    });

    analyticsContainer.appendChild(table);

    // Add to messages container
    this.addCustomContent(analyticsContainer);
  }

  formatAnalyticsKey(key) {
    // console.log("formatAnalyticsKey is working.....");

    // Convert camelCase to Title Case with spaces
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .replace(/([A-Z])/g, (match) => ` ${match}`)
      .replace(/^\s+/, "")
      .replace(/([A-Z])\s/g, (match) => match.trim())
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/^./, (str) => str.toUpperCase());
  }

  renderMessage(message) {
    // console.log("renderMessagerenderMessage is working.....");

    if (!this.messagesContainer) return;

    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${message.role}-message`;

    if (message.role === "user") {
      // User message
      const content = document.createElement("div");
      content.className = "message-content";

      const textEl = document.createElement("div");
      textEl.className = "message-text";
      textEl.textContent = message.content;
      content.appendChild(textEl);

      messageDiv.appendChild(content);
    } else if (message.role === "assistant") {
      // MCP tool calls/results UI (if any)
      if (message.mcp && Object.keys(message.mcp).length > 0) {
        const toolCallDiv = document.createElement("div");
        toolCallDiv.className = "tool-call-summary";

        // Show tool names
        const toolNames = message.intent?.tools || Object.keys(message.mcp);
        const toolLabel = document.createElement("span");
        toolLabel.className = "tool-call-label";
        toolLabel.textContent = `MCP Tool${toolNames.length > 1 ? "s" : ""}:`;
        const tools = document.createElement("span");
        tools.className = "tool-list";
        tools.textContent = ` ${
          toolNames.length > 0 ? toolNames.join(", ") : "No Tool Used.."
        }`;

        toolCallDiv.appendChild(toolLabel);
        toolCallDiv.appendChild(tools);

        messageDiv.appendChild(toolCallDiv);
      }

      // AI message (with avatar)
      const avatar = this.createAvatar();
      const content = document.createElement("div");
      content.className = "message-content";

      const textEl = document.createElement("div");
      textEl.className = "message-text";
      textEl.innerHTML = this.formatMessage(message.content);
      content.appendChild(textEl);

      const assistantMessageDiv = document.createElement("div");
      assistantMessageDiv.className = "assist-message-content";
      assistantMessageDiv.appendChild(avatar);
      assistantMessageDiv.appendChild(content);
      messageDiv.appendChild(assistantMessageDiv);
    }

    this.messagesContainer.appendChild(messageDiv);
    this.scrollToBottom();
  }

  addSystemMessage(text) {
    // console.log("addSystemMessage is working.....");

    if (!this.messagesContainer) return;

    const messageDiv = document.createElement("div");
    messageDiv.className = "message system-message";

    const avatar = this.createAvatar("system");
    const content = document.createElement("div");
    content.className = "message-content";

    const textEl = document.createElement("div");
    textEl.className = "message-text system-text";
    textEl.textContent = text;
    content.appendChild(textEl);

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);

    this.messagesContainer.appendChild(messageDiv);
    this.scrollToBottom();
  }

  addCodeBlock(code, language = "json") {
    if (!this.messagesContainer) return;

    const messageDiv = document.createElement("div");
    messageDiv.className = "message assistant-message";

    const avatar = this.createAvatar();
    const content = document.createElement("div");
    content.className = "message-content";

    const pre = document.createElement("pre");
    pre.className = "code-block";
    const codeEl = document.createElement("code");
    codeEl.className = language;
    codeEl.textContent = code;
    pre.appendChild(codeEl);
    content.appendChild(pre);

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);

    this.messagesContainer.appendChild(messageDiv);
    this.scrollToBottom();
  }

  addCustomContent(element) {
    if (!this.messagesContainer) return;

    const messageDiv = document.createElement("div");
    messageDiv.className = "message assistant-message";

    const avatar = this.createAvatar();
    const content = document.createElement("div");
    content.className = "message-content";

    content.appendChild(element);

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);

    this.messagesContainer.appendChild(messageDiv);
    this.scrollToBottom();
  }

  createAvatar(type = "assistant") {
    const avatar = document.createElement("div");
    avatar.className = "message-avatar";

    if (type === "assistant") {
      avatar.innerHTML = `
                <img src="./assets/algolia.svg" alt="aiavatar" width="22" height="22" />
            `;
    } else if (type === "system") {
      avatar.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14z" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M8 11V8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M8 5.5v-.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
            `;
    }

    return avatar;
  }
  renderPrettySearchResults(json) {
    // Accepts either an object or a JSON string
    let data = json;
    if (typeof json === "string") {
      try {
        data = JSON.parse(json);
      } catch {
        // fallback: show as code block
        return `<pre>${json}</pre>`;
      }
    }
    if (!data.hits || !Array.isArray(data.hits)) {
      return `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    }

    // Build HTML table for hits
    let html = `<div class="search-results-table"><table><thead><tr><th>Title</th><th>Genre</th><th>Year</th></tr></thead><tbody>`;
    data.hits.forEach((hit) => {
      html += `<tr>
      <td>${hit.title || ""}</td>
      <td>${hit.genre || ""}</td>
      <td>${hit.year || ""}</td>
    </tr>`;
    });
    html += `</tbody></table></div>`;

    // Optionally, show meta info
    html += `<div class="search-meta">
    <span><b>Total:</b> ${data.nbHits}</span>
    <span><b>Page:</b> ${data.page + 1} / ${data.nbPages}</span>
    <span><b>Hits per page:</b> ${data.hitsPerPage}</span>
    <span><b>Processing time:</b> ${data.processingTimeMS}ms</span>
  </div>`;

    // Optionally, show queries
    if (data.queries && Array.isArray(data.queries)) {
      html += `<div class="search-queries"><b>Queries:</b><ul>`;
      data.queries.forEach((q) => {
        html += `<li>${q.query} <ul>${
          q.params
            ? q.params.map((p) => `<li>${p.name}: ${p.value}</li>`).join("")
            : ""
        }</ul></li>`;
      });
      html += `</ul></div>`;
    }

    return html;
  }
  prettifyObject(obj, level = 0) {
    if (obj === null) return '<span class="null-value">null</span>';
    if (typeof obj !== "object")
      return `<span class="primitive-value">${String(obj)}</span>`;

    let html = `<div class="pretty-object" style="margin-left:${
      level * 1.2
    }em">`;
    for (const key in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
      const value = obj[key];
      if (typeof value === "object" && value !== null) {
        html += `
        <details class="pretty-object-details">
          <summary><span class="pretty-object-key">${key}</span></summary>
          ${this.prettifyObject(value, level + 1)}
        </details>
      `;
      } else {
        html += `
        <div class="pretty-object-row">
          <span class="pretty-object-key">${key}:</span>
          <span class="pretty-object-value">${String(value)}</span>
        </div>
      `;
      }
    }
    html += `</div>`;
    return html;
  }
  formatMessage(text) {
    // Trim content before "**Search Result**" if present
    const marker = "**Search Results:**";
    const markerIndex = text.indexOf(marker);
    if (markerIndex !== -1) {
      text = text.substring(markerIndex + marker.length).trim();
    }
    // Convert URLs to links
    text = text.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );
    if (window.marked) {
      text = marked.parse(text);
    }
    // Use marked to convert markdown to HTML
    // Convert line breaks to <br>
    text = text.replace(/\n/g, "<br>");

    const marker2 = "Algolia Search Results:";
    const markerIndex2 = text.indexOf(marker2);
    if (markerIndex2 !== -1) {
      text = text.substring(markerIndex2 + marker2.length).trim();
    }
    return text;
  }

  showTypingIndicator() {
    if (!this.messagesContainer) return;

    const typingDiv = document.createElement("div");
    typingDiv.className = "message assistant-message typing-message";
    typingDiv.id = "typingIndicator";

    const avatar = this.createAvatar();
    const content = document.createElement("div");
    content.className = "message-content";

    const typingIndicator = document.createElement("div");
    typingIndicator.className = "typing-indicator";
    typingIndicator.innerHTML = `
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
        `;

    content.appendChild(typingIndicator);
    typingDiv.appendChild(avatar);
    typingDiv.appendChild(content);

    this.messagesContainer.appendChild(typingDiv);
    this.scrollToBottom();
  }

  hideTypingIndicator() {
    const typingIndicator = document.getElementById("typingIndicator");
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  scrollToBottom() {
    if (this.messagesContainer) {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
  }
}

// Initialize the chat application when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const algolia_mcp_chat = new AlgoliaMCPChat();
});
