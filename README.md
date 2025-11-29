# GridCast - Freemium Video Editor & Player

**GridCast** is a powerful, web-based video editor and player built with **React 19**, **Vite**, and **TailwindCSS 4**. It combines advanced playback capabilities with a freemium editing workflow, allowing users to add subtitles, watermark videos, and export them directly from the browser.

## 🚀 Key Features

### 🎬 Advanced Video Player
- **Multi-View Grid**: Watch multiple videos simultaneously with dynamic grid layouts.
- **Instant Local Playback**: Zero-latency streaming of large local files (GBs) using Blob URLs.
- **HLS Support**: Native support for `.m3u8` adaptive streaming.
- **Custom Controls**: Glassmorphism UI with precise seeking, volume, and playback speed (click menu).

### ✍️ Subtitle & Script Editor
- **Visual Overlay**: Real-time subtitle preview burned onto the video.
- **Full Editing Suite**:
    - **Edit Text**: Modify subtitle content instantly.
    - **Time Control**: Adjust Start/End timestamps for perfect synchronization.
    - **Add/Delete**: Easily add new lines or remove unwanted ones (with optimized UX).
- **Smart UX**: Editor panel auto-scrolls to active line, closes on outside click, and doesn't obstruct controls.

### 📤 Client-Side Export Engine
- **Browser-Based Rendering**: Exports video **entirely in the browser** using HTML5 Canvas & MediaRecorder API. No server required.
- **Freemium Model**:
    - **Free Tier**: Exports 720p video with "Made with GridCast" watermark and burned-in subtitles.
    - **Pro Tier**: (UI Demo) Locked features for premium users.
- **Robust Process**:
    - **Real-time Progress**: Native `<progress>` bar showing exact export status.
    - **Cancel Support**: Abort export at any time.
    - **Auto-Download**: Automatically saves `.webm` file upon completion.

### 🔒 Security & Protection
- **Fixed Watermark**: "Made with GridCast" watermark permanently displayed for free users.
- **Anti-Piracy Layers**:
    - Transparent overlay blocks right-click/save-as.
    - Dynamic user-ID watermarking (optional module).

## 🛠 Technical Architecture

### 1. Client-Side Video Export
GridCast uses a novel approach to export videos without a backend:
1.  **Canvas Composition**: The video frame is drawn onto an off-screen HTML5 Canvas 30 times per second.
2.  **Layering**: Watermarks and subtitles are programmatically drawn on top of the video frame using the Canvas 2D Context.
3.  **Stream Capture**: `canvas.captureStream(30)` generates a MediaStream from the canvas.
4.  **Recording**: The `MediaRecorder` API compresses this stream into a `.webm` blob in real-time as the video plays.

### 2. Instant Local Streaming
Uses `URL.createObjectURL(file)` to create a direct pointer to the local file system, allowing GB-sized files to play instantly without uploading or memory crashes.

## 💻 Tech Stack

- **Framework**: React 19 + Vite
- **Language**: TypeScript
- **Styling**: TailwindCSS 4 (Glassmorphism, Dark Mode)
- **Icons**: Lucide React
- **Video Core**: Native HTML5 Video + hls.js

## 🏃‍♂️ Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```
