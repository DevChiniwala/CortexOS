use tracing_subscriber::{fmt, EnvFilter};

/// Initializes the tracing subscriber for production-grade structured logging.
pub fn init_logging() {
    let filter = EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| EnvFilter::new("info,cortex_core_lib=debug"));

    fmt()
        .with_env_filter(filter)
        .with_thread_ids(true)
        .with_target(true)
        .with_file(true)
        .with_line_number(true)
        .init();
    
    tracing::info!("CortexOS Nexus Logging Initialized");
}
