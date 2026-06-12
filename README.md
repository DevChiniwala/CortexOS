# CortexOS

<p align="center">
  <img src="src-tauri/icons/icon.png" width="128" alt="CortexOS Logo" />
</p>

<p align="center">
  <b>The Autonomous Intelligence Platform for Modern Outbound</b>
</p>

## Overview

CortexOS is a high-performance desktop application built to orchestrate autonomous AI research agents. It deeply analyzes target companies, uncovers hidden buying signals, and evaluates intent—giving your GTM teams an unfair advantage. 

Built on a robust Rust backend (Tauri) and an ultra-responsive React 19 frontend, CortexOS runs locally, giving you total control over your intelligence pipelines and API routing.

## ⚡ Key Capabilities

- **Autonomous Agent Orchestration**: Spawn local AI agents that traverse the web, scrape documentation, and extract structured buying signals.
- **Cortex Pipeline**: Visual drag-and-drop Kanban boards and virtualized data tables to manage your target accounts and contacts.
- **Real-Time Stream Terminal**: Watch your agents think and execute in real-time through a matrix-style dual-pane terminal layout.
- **Glassmorphism UI**: A gorgeous, dark-mode first design system powered by TailwindCSS and Framer Motion micro-animations.
- **Chrome Extension Bridge**: Native companion Chrome Extension that extracts unstructured DOM intelligence (like LinkedIn profiles) directly into your local database via WebSocket.
- **TanStack Query Caching**: Insanely fast, optimistic UI mutations with robust garbage collection and cache warming.

## Architecture

CortexOS follows a strict decoupled architecture:

1. **Frontend (Vite + React 19 + Zustand + TanStack Query)**: Completely stateless UI layer. All state is synced via optimistic updates and WebSocket streams.
2. **Backend (Tauri 2 + Rust + SQLite)**: The heavy lifter. It manages the persistent memory graph, SQLite databases, agent orchestration loops, and the local Chrome WebSocket server.
3. **Companion Extension (Manifest V3)**: Lives in the browser to bypass anti-bot protections and stream authenticated DOM data securely into the Rust backend.

## Tech Stack

- **Framework**: Tauri 2.0
- **Frontend**: React 19, Vite, Tailwind CSS, Framer Motion, Zustand
- **Backend**: Rust, Tokio, SQLx, SQLite
- **Communication**: Tauri IPC + WebSocket Bridge (ws://127.0.0.1:9720)

## Getting Started

### Prerequisites
- Node.js (v20+)
- Rust (Latest Stable)
- (Windows) Visual Studio C++ Build Tools
- (macOS) Xcode Command Line Tools

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/DevChiniwala/CortexOS.git
   cd CortexOS
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run in Development Mode**
   ```bash
   npm run tauri:dev
   ```
   *(This compiles the Rust backend and starts the Vite hot-reloading frontend).*

### Building for Production

To compile a native binary for your OS:
```bash
npm run tauri:build
```
The compiled binaries will be located in `src-tauri/target/release/bundle/`.

## Chrome Extension Setup

To use the companion extension:
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** in the top right.
3. Click **Load unpacked** and select the `extension/` folder inside the CortexOS repository.
4. The extension will automatically connect to CortexOS when the desktop app is running.

## Continuous Integration & Auto-Updates

CortexOS uses GitHub Actions for automated cross-platform builds. When a new tag (`v*`) is pushed, CI compiles MacOS, Windows, and Linux binaries and drafts a GitHub Release. 

The desktop app is configured with Tauri's built-in auto-updater. On launch, it checks the latest GitHub release and prompts the user to apply delta patches seamlessly.

## License

This project is licensed under the MIT License.
