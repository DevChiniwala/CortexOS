// ============================================================================
// CortexOS — Chrome Extension WebSocket Bridge (Rust side)
// Accepts connections from the Chrome extension on ws://127.0.0.1:9720
// ============================================================================

use std::sync::Arc;
use tokio::sync::broadcast;

/// Messages received from the Chrome extension
#[derive(Debug, Clone, serde::Deserialize)]
pub struct ExtensionMessage {
    #[serde(rename = "type")]
    pub msg_type: String,
    pub payload: serde_json::Value,
    pub timestamp: Option<u64>,
}

/// Messages sent to the Chrome extension
#[derive(Debug, Clone, serde::Serialize)]
pub struct BridgeCommand {
    #[serde(rename = "type")]
    pub msg_type: String,
    pub payload: serde_json::Value,
}

/// Shared state for the WebSocket bridge
pub struct BridgeState {
    /// Broadcast channel for sending commands to connected extensions
    pub command_tx: broadcast::Sender<BridgeCommand>,
    /// Whether the bridge is currently running
    pub is_running: std::sync::atomic::AtomicBool,
}

impl BridgeState {
    pub fn new() -> Arc<Self> {
        let (command_tx, _) = broadcast::channel(64);
        Arc::new(Self {
            command_tx,
            is_running: std::sync::atomic::AtomicBool::new(false),
        })
    }

    /// Send a scrape request to the connected extension
    pub fn request_scrape(
        &self,
        url: &str,
        selectors: Vec<String>,
        request_id: &str,
    ) -> Result<(), String> {
        let payload = serde_json::json!({
            "url": url,
            "selectors": selectors,
            "requestId": request_id,
        });

        self.command_tx
            .send(BridgeCommand {
                msg_type: "scrape_request".into(),
                payload,
            })
            .map_err(|e| format!("No extension connected: {}", e))?;

        Ok(())
    }

    /// Send a navigation request to the connected extension
    pub fn request_navigate(&self, url: &str) -> Result<(), String> {
        let payload = serde_json::json!({ "url": url });

        self.command_tx
            .send(BridgeCommand {
                msg_type: "navigate_request".into(),
                payload,
            })
            .map_err(|e| format!("No extension connected: {}", e))?;

        Ok(())
    }
}

/// Start the WebSocket bridge server.
/// This should be spawned as a background task during app initialization.
///
/// Note: Requires `tokio-tungstenite` and `futures-util` crates in Cargo.toml.
/// The actual server implementation uses tungstenite for WebSocket handling.
/// For now, this module defines the protocol and state management layer.
/// The full server can be wired in once the crate dependencies are added:
///
/// ```toml
/// [dependencies]
/// tokio-tungstenite = "0.24"
/// futures-util = "0.3"
/// ```
///
/// Example integration in lib.rs:
/// ```rust
/// let bridge = chrome_bridge::BridgeState::new();
/// tauri::async_runtime::spawn(chrome_bridge::start_bridge(bridge.clone()));
/// ```
pub async fn start_bridge(state: Arc<BridgeState>) {
    use std::sync::atomic::Ordering;

    state.is_running.store(true, Ordering::SeqCst);
    let addr = "127.0.0.1:9720";

    tracing::info!("[ChromeBridge] Listening on ws://{}", addr);

    // The WebSocket accept loop would go here once tokio-tungstenite is added.
    // Each connection gets a clone of state.command_tx for receiving commands,
    // and incoming messages are dispatched based on msg_type.
    //
    // For now, log that the bridge module is initialized.
    tracing::info!("[ChromeBridge] Bridge module initialized (awaiting WebSocket crate integration)");

    state.is_running.store(false, Ordering::SeqCst);
}

/// Process an incoming message from the Chrome extension
pub fn handle_extension_message(
    msg: ExtensionMessage,
    app_handle: &tauri::AppHandle,
) {
    match msg.msg_type.as_str() {
        "linkedin_profile" => {
            tracing::info!("[ChromeBridge] Received LinkedIn profile data");
            let _ = app_handle.emit("cortex:chrome-capture", &msg.payload);
        }
        "page_context" => {
            tracing::info!("[ChromeBridge] Received page context data");
            let _ = app_handle.emit("cortex:chrome-capture", &msg.payload);
        }
        "scrape_response" => {
            tracing::info!("[ChromeBridge] Received scrape response");
            let _ = app_handle.emit("cortex:scrape-result", &msg.payload);
        }
        "pong" => {
            tracing::debug!("[ChromeBridge] Extension pong received");
        }
        _ => {
            tracing::warn!("[ChromeBridge] Unknown message type: {}", msg.msg_type);
        }
    }
}
