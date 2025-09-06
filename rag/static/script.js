const sendBtn = document.getElementById("send-btn");
const submitBtn = document.getElementById("submit-btn");
const inputField = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");
const sidebarToggle = document.getElementById("sidebar-toggle");
const sidebar = document.getElementById("sidebar");
const resourceInput = document.getElementById("resource-input");
const resourceList = document.getElementById("resource-list");

async function init() {
  submitBtn.addEventListener("click", contextResource);
  sendBtn.addEventListener("click", sendMessage);
  inputField.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  });

  // Initialize sidebar toggle functionality
  toggleSidebar();
}

async function contextResource() {
  const resourceData = resourceInput.value;
  resourceInput.value = "";
  submitBtn.disabled = true;

  resourceList.innerHTML += `<li>${resourceData}</li>`;

  const response = await fetch("/resource", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: resourceData }),
  });

  const data = await response.json();

  if (data) {
    sendBtn.disabled = false;
  }
}

async function sendMessage() {
  const userMessage = inputField.value;
  if (!userMessage.trim()) return;
  inputField.value = "";

  chatBox.innerHTML += `<p><strong>You:</strong> ${userMessage}</p>`;

  try {
    const response = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage }),
    });

    if (!response.ok) throw new Error("Network response was not ok");

    const data = await response.json();
    chatBox.innerHTML += `<p><strong>Bot:</strong> ${data.response}</p>`;
  } catch (error) {
    console.error("Error:", error);
    chatBox.innerHTML += `<p><strong>Bot:</strong> Sorry, there was an error processing your request.</p>`;
  }
  // Scroll to the bottom of chat box after new message
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Sidebar toggle functionality
function toggleSidebar() {
  sidebarToggle.addEventListener("click", () => {
    sidebar.classList.toggle("active");
  });

  // Close sidebar when clicking outside of it (on mobile)
  document.addEventListener("click", (event) => {
    if (
      window.innerWidth <= 768 &&
      sidebar.classList.contains("active") &&
      !sidebar.contains(event.target) &&
      event.target !== sidebarToggle
    ) {
      sidebar.classList.remove("active");
    }
  });
  // Function to update toggle button text
  const updateToggleButtonText = () => {
    sidebarToggle.textContent = sidebar.classList.contains("active")
      ? "Close"
      : "Open";
  };

  // Set initial toggle button text
  updateToggleButtonText();

  // Watch for changes to the sidebar's classList
  const observer = new MutationObserver(updateToggleButtonText);
  observer.observe(sidebar, {
    attributes: true,
    attributeFilter: ["class"],
  });
}

document.addEventListener("DOMContentLoaded", () => {
  init();
});
