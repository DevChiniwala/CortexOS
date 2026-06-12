// ============================================================================
// CortexOS Companion — Popup Script
// ============================================================================

document.addEventListener("DOMContentLoaded", async () => {
  const statusBadge = document.getElementById("status-badge");
  const statusDot = document.getElementById("status-dot");
  const statusText = document.getElementById("status-text");
  const pageType = document.getElementById("page-type");
  const captureBtn = document.getElementById("btn-capture");
  const openAppBtn = document.getElementById("btn-open-app");
  const captureCountText = document.getElementById("capture-count-text");

  // Check connection status
  chrome.runtime.sendMessage({ type: "get_connection_status" }, (response) => {
    if (response?.connected) {
      statusBadge.className = "status-badge connected";
      statusDot.className = "status-dot green";
      statusText.textContent = "Connected";
    } else {
      statusBadge.className = "status-badge disconnected";
      statusDot.className = "status-dot red";
      statusText.textContent = "Disconnected";
    }
  });

  // Detect current page type
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url) {
      if (tab.url.includes("linkedin.com/in/")) {
        pageType.textContent = "LinkedIn Profile";
      } else if (tab.url.includes("linkedin.com/company/")) {
        pageType.textContent = "LinkedIn Company";
      } else if (tab.url.includes("crunchbase.com")) {
        pageType.textContent = "Crunchbase";
      } else {
        pageType.textContent = "General Web";
      }
    }
  } catch (e) {
    pageType.textContent = "Unknown";
  }

  // Load capture count
  const result = await chrome.storage.local.get("captureCount");
  const count = result.captureCount || 0;
  captureCountText.textContent = `${count} capture${count !== 1 ? "s" : ""} this session`;

  // Capture button
  captureBtn.addEventListener("click", async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) return;

      // Execute extraction on the active tab
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          return {
            url: window.location.href,
            title: document.title,
            text: document.body?.innerText?.substring(0, 30000) || "",
            timestamp: Date.now(),
          };
        },
      });

      if (results?.[0]?.result) {
        chrome.runtime.sendMessage({
          type: "page_context_data",
          payload: results[0].result,
        });

        // Increment count
        const newCount = count + 1;
        await chrome.storage.local.set({ captureCount: newCount });
        captureCountText.textContent = `${newCount} capture${newCount !== 1 ? "s" : ""} this session`;

        captureBtn.textContent = "✓ Captured!";
        captureBtn.style.color = "#22c55e";
        setTimeout(() => {
          captureBtn.textContent = "⚡ Capture This Page";
          captureBtn.style.color = "";
        }, 2000);
      }
    } catch (err) {
      captureBtn.textContent = "✗ Failed";
      captureBtn.style.color = "#ef4444";
      setTimeout(() => {
        captureBtn.textContent = "⚡ Capture This Page";
        captureBtn.style.color = "";
      }, 2000);
    }
  });

  // Open app button
  openAppBtn.addEventListener("click", () => {
    // Deep-link protocol to open CortexOS desktop app
    window.open("cortexos://open", "_blank");
  });
});
