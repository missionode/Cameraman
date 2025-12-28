# Cameraman Pro

**Cameraman Pro** is a next-generation web-based video camera application designed for creators and professionals. It combines manual cinema controls with advanced AI tracking ("Center Stage") and military-grade encryption ("Secure Record"), all running entirely in the browser.

![PWA](https://img.shields.io/badge/PWA-Installable-blue) ![Privacy](https://img.shields.io/badge/Privacy-Local_Only-green) ![Encryption](https://img.shields.io/badge/Security-AES--GCM-yellow)

## ✨ Key Features

### 🎥 Professional Controls
*   **Manual Focus:** Precise rack focus control with an on-screen slider (device dependent).
*   **Cinema Grades:** Real-time color grading LUTs (Teal & Orange, Matrix, Noir, etc.) baked into the recording.
*   **Aspect Ratios:** Native support for 16:9, 4:3, 1:1, 9:16 (Social), and 2.39:1 (Cinema).
*   **Resolutions:** Up to 4K recording support.

### 🤖 Center Stage (AI Tracking)
*   **Intelligent Framing:** Uses MediaPipe Face Detection to automatically pan and zoom to keep you in the frame.
*   **Cinematic Composition:**
    *   **Rule of Thirds:** Automatically places eyes at the upper 42% of the frame for professional headroom.
    *   **Zoom Cap:** Prevents claustrophobic close-ups.
    *   **Deadzone:** Eliminates jitter by ignoring micro-movements.
*   **Performance:** Runs on a dedicated Web Worker to ensure 30FPS UI performance.

### 🎬 Director Mode (Voice Control)
*   **Hands-Free Operation:** Control the camera with your voice.
*   **Commands:**
    *   *"Action"* / *"Start"* → Starts recording with a 3-second countdown.
    *   *"Cut"* / *"Thank You"* → Stops recording safely.
*   **Smart Restart:** Mic automatically re-initializes after recording starts to listen for the stop command.

### 🔐 Secure Record
*   **Client-Side Encryption:** Videos are encrypted *on-the-fly* as they are written to disk.
*   **AES-GCM:** Uses military-grade AES-256-GCM encryption derived from a Master Key + Private Key.
*   **Zero-Trust:** No unencrypted temp files are ever created.
*   **Secure Player:** Built-in player to decrypt and watch `.se6` files in memory.

## 🛠️ Technology Stack

*   **Core:** Vanilla JavaScript (ES6+), HTML5, CSS3.
*   **PWA:** Service Workers for offline support and installation.
*   **AI:** MediaPipe (Google) via WebAssembly (WASM).
*   **Graphics:** OffscreenCanvas & ImageBitmap for high-performance processing.
*   **Storage:** File System Access API (Direct save to disk).
*   **Crypto:** Web Crypto API (SubtleCrypto) for PBKDF2 key derivation and AES-GCM.

## 🚀 Getting Started

### Online Demo
Visit the live demo (if hosted): `https://your-username.github.io/Cameraman/`

### Local Development

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/Cameraman.git
    cd Cameraman
    ```

2.  **Serve the files:**
    Because of PWA and Worker security policies, you must serve the files via HTTPS or `localhost`.
    ```bash
    # Python 3
    python3 -m http.server 8000
    ```

3.  **Open in Browser:**
    Navigate to `http://localhost:8000`.

## 📱 Installation (PWA)

1.  Open the app in **Chrome** (Android/Desktop) or **Safari** (iOS).
2.  Click the "Install" button in the URL bar or "Add to Home Screen" in the share menu.
3.  Launch from your home screen for a full-screen, native app experience.

## 🔒 Privacy & Security

*   **Local Processing:** All AI detection and video processing happens 100% on your device. No video data is sent to the cloud.
*   **Direct Save:** Videos are saved directly to your chosen local folder.
*   **Encryption:** In Secure Mode, if you lose your keys, the video is unrecoverable. There are no backdoors.

## 📄 License

MIT License. Copyright (c) 2024.
