// ============================================================================
// CortexOS Companion — Background Service Worker
// Manages WebSocket connection to Tauri backend and orchestrates content scripts.
// ============================================================================

const CORTEX_WS_URL = "ws://127.0.0.1:9720";
const RECONNECT_INTERVAL_MS = 5000;
const MAX_RECONNECT_ATTEMPTS = 20;

let ws = null;
let reconnectAttempts = 0;
let isConnected = false;
let messageQueue = [];

// ============================================================================
// WebSocket Connection Manager
// ============================================================================

function connect() {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    return;
  }

  try {
    ws = new WebSocket(CORTEX_WS_URL);

    ws.onopen = () => {
      console.log("[CortexOS] WebSocket connected to Tauri backend");
      isConnected = true;
      reconnectAttempts = 0;
      updateBadge("ON", "#22c55e");

      // Flush queued messages
      while (messageQueue.length > 0) {
        const msg = messageQueue.shift();
        ws.send(JSON.stringify(msg));
      }
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleBackendMessage(message);
      } catch (err) {
        console.error("[CortexOS] Failed to parse WebSocket message:", err);
      }
    };

    ws.onclose = () => {
      console.log("[CortexOS] WebSocket disconnected");
      isConnected = false;
      ws = null;
      updateBadge("OFF", "#ef4444");
      scheduleReconnect();
    };

    ws.onerror = (err) => {
      console.error("[CortexOS] WebSocket error:", err);
      ws?.close();
    };
  } catch (err) {
    console.error("[CortexOS] Failed to create WebSocket:", err);
    scheduleReconnect();
  }
}

function scheduleReconnect() {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.warn("[CortexOS] Max reconnect attempts reached. Stopping.");
    updateBadge("!", "#f59e0b");
    return;
  }

  reconnectAttempts++;
  const delay = RECONNECT_INTERVAL_MS * Math.min(reconnectAttempts, 6);
  console.log(`[CortexOS] Reconnecting in ${delay}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
  setTimeout(connect, delay);
}

function sendToBackend(type, payload) {
  const message = { type, payload, timestamp: Date.now() };

  if (isConnected && ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  } else {
    // Queue for when connection is restored
    messageQueue.push(message);
    if (messageQueue.length > 100) {
      messageQueue.shift(); // Drop oldest if queue is too large
    }
  }
}

// ============================================================================
// Backend Message Handlers
// ============================================================================

function handleBackendMessage(message) {
  switch (message.type) {
    case "scrape_request":
      // Backend is asking us to scrape a specific URL
      handleScrapeRequest(message.payload);
      break;

    case "navigate_request":
      // Backend wants us to navigate a tab to a URL
      handleNavigateRequest(message.payload);
      break;

    case "ping":
      sendToBackend("pong", { status: "alive" });
      break;

    default:
      console.log("[CortexOS] Unknown backend message type:", message.type);
  }
}

async function handleScrapeRequest(payload) {
  const { url, selectors, requestId } = payload;

  try {
    // Find or create a tab with this URL
    const tabs = await chrome.tabs.query({ url: url + "*" });
    let tab;

    if (tabs.length > 0) {
      tab = tabs[0];
    } else {
      tab = await chrome.tabs.create({ url, active: false });
      // Wait for tab to finish loading
      await new Promise((resolve) => {
        const listener = (tabId, changeInfo) => {
          if (tabId === tab.id && changeInfo.status === "complete") {
            chrome.tabs.onUpdated.removeListener(listener);
            resolve();
          }
        };
        chrome.tabs.onUpdated.addListener(listener);
      });
    }

    // Execute content script to extract data
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractPageData,
      args: [selectors || []],
    });

    sendToBackend("scrape_response", {
      requestId,
      success: true,
      data: results[0]?.result ?? null,
    });
  } catch (err) {
    sendToBackend("scrape_response", {
      requestId,
      success: false,
      error: err.message,
    });
  }
}

async function handleNavigateRequest(payload) {
  const { url } = payload;
  try {
    await chrome.tabs.create({ url, active: true });
    sendToBackend("navigate_response", { success: true });
  } catch (err) {
    sendToBackend("navigate_response", { success: false, error: err.message });
  }
}

// ============================================================================
// DOM Extraction (runs inside tab context)
// ============================================================================

function extractPageData(selectors) {
  const result = {
    url: window.location.href,
    title: document.title,
    timestamp: Date.now(),
    elements: {},
    meta: {},
  };

  // Extract meta tags
  document.querySelectorAll("meta").forEach((meta) => {
    const name = meta.getAttribute("name") || meta.getAttribute("property");
    if (name) {
      result.meta[name] = meta.getAttribute("content");
    }
  });

  // Extract specified CSS selectors
  if (selectors && selectors.length > 0) {
    selectors.forEach((selector) => {
      try {
        const elements = document.querySelectorAll(selector);
        result.elements[selector] = Array.from(elements).map((el) => ({
          text: el.textContent?.trim() || "",
          html: el.innerHTML,
          href: el.getAttribute("href") || null,
        }));
      } catch (e) {
        result.elements[selector] = { error: e.message };
      }
    });
  }

  // Extract full page text (cleaned)
  result.bodyText = document.body?.innerText?.substring(0, 50000) || "";

  return result;
}

// ============================================================================
// Content Script Communication
// ============================================================================

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case "linkedin_profile_data":
      sendToBackend("linkedin_profile", {
        ...message.payload,
        sourceTabId: sender.tab?.id,
      });
      sendResponse({ received: true });
      break;

    case "page_context_data":
      sendToBackend("page_context", {
        ...message.payload,
        sourceTabId: sender.tab?.id,
      });
      sendResponse({ received: true });
      break;

    case "get_connection_status":
      sendResponse({ connected: isConnected });
      break;

    default:
      sendResponse({ error: "Unknown message type" });
  }

  return true; // Keep sendResponse channel open for async
});

// ============================================================================
// Badge / UI Helpers
// ============================================================================

function updateBadge(text, color) {
  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeBackgroundColor({ color });
}

// ============================================================================
// Initialize
// ============================================================================

connect();
console.log("[CortexOS] Background service worker initialized");
