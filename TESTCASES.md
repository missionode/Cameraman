# Cameraman App - Test Cases

This document outlines the test strategy for the Cameraman application, covering core functionality, security features, AI capabilities, and UI responsiveness.

## 1. Core Camera & Recording

| ID | Test Case | Steps | Expected Result | Priority | Status |
|----|-----------|-------|-----------------|----------|--------|
| **TC001** | Camera Initialization | 1. Open the application.<br>2. Allow Camera permissions. | Viewfinder displays live feed. Dynamic Island shows "Ready". No console errors. | High | **Pass** |
| **TC002** | Standard Recording | 1. Tap the **Record** button.<br>2. Record for >10 seconds.<br>3. Tap **Stop**. | Timer increments in Dynamic Island. Island pulses red. File is saved to default/chosen location with correct extension (.webm/.mp4). | High | **Pass** |
| **TC003** | Photo Capture | 1. Tap the **Capture** (Camera icon) button. | Screen flashes white. Shutter sound plays. Image saved as PNG. | Medium | **Pass** |
| **TC004** | Camera Switch | 1. Tap the **Rotate Camera** button. | Camera feed flips between User (Front) and Environment (Back). Feed resumes instantly. | Medium | **Pass** |
| **TC005** | Audio Capture | 1. Record a video while speaking.<br>2. Play back the file. | Audio is clear and synced with video. | High | **Pass** |

## 2. Secure Mode (Encryption)

| ID | Test Case | Steps | Expected Result | Priority | Status |
|----|-----------|-------|-----------------|----------|--------|
| **TC006** | Secure Mode Setup | 1. Go to **Settings** > **Privacy & Security** > **Secure Record**.<br>2. Enter **Master Key** and **Private Key**.<br>3. Click **Authenticate**. | **File Picker appears immediately** to select save location. Dynamic Island updates to "Secure Mode | Standby" (Gold). | High | |
| **TC007** | Secure Recording Start | 1. Complete TC006 (Standby Mode).<br>2. Tap the main **Record** button. | Recording starts **immediately** without a second file prompt. Dynamic Island turns Red. | High | |
| **TC008** | Secure File Generation | 1. Stop a secure recording.<br>2. Check the saved file size. | File saved with `.se6` extension. File size increases with duration. File is **not** playable in standard players (VLC, etc.). | High | |
| **TC009** | Secure Playback (Success) | 1. Go to **Settings** > **View Secure**.<br>2. Select the `.se6` file.<br>3. Enter the **Correct** keys used for recording. | Video plays in the overlay. Seek bar loads correctly (does not jump to 90% immediately). Status shows "PLAYING SECURE STREAM". | High | |
| **TC010** | Secure Playback (Failure) | 1. Attempt playback of `.se6` file with **Incorrect** keys. | Alert "Decryption Failed" appears. Video does not play. | High | |
| **TC011** | Overheating Check | 1. Play a long Secure Video (>1 min). | Device temperature remains stable. Playback buffers intelligently (throttling logic active). | High | |

## 3. AI & Vision Features

| ID | Test Case | Steps | Expected Result | Priority | Status |
|----|-----------|-------|-----------------|----------|--------|
| **TC012** | Center Stage Toggle | 1. Open **Settings**.<br>2. Enable **Center Stage (AI)**. | Camera digitally zooms/pans to keep the user's face centered. | Medium | |
| **TC013** | Movie Mode Behavior | 1. Enable **Center Stage**.<br>2. Enable **Movie Mode**. | Crop becomes wider/cinematic. Movement tracking is smoother/slower (damping effect). | Low | |
| **TC014** | Worker Stability | 1. Refresh the app.<br>2. Check Browser Console. | **No "document is not defined" error.** AI Worker initializes successfully using `OffscreenCanvas`. | High | |

## 4. Director Mode (Voice Control)

| ID | Test Case | Steps | Expected Result | Priority | Status |
|----|-----------|-------|-----------------|----------|--------|
| **TC015** | Enable Director Mode | 1. Settings > Enable **Director Mode**.<br>2. Grant Microphone permission. | Dynamic Island shows "Director Mode On". Mic icon active in browser tab. | Medium | |
| **TC016** | Voice Command: Start | 1. Say **"Action"**, **"Start"**, or **"Shoot"**. | 3-Second Countdown starts (Visual + Audio beeps). Recording begins automatically. | Medium | |
| **TC017** | Voice Command: Stop | 1. While recording, say **"Cut"**, **"Stop"**, or **"Thank You"**. | Recording stops. "CUT!" displayed on Island. File saves. | Medium | |

## 5. UI Responsiveness & Design

| ID | Test Case | Steps | Expected Result | Priority | Status |
|----|-----------|-------|-----------------|----------|--------|
| **TC018** | Mobile Viewport | 1. Resize browser width to < 480px (or use mobile). | Buttons scale down (`clamp()` active). Settings panel slides up as a bottom sheet. No horizontal scroll. | High | |
| **TC019** | Desktop Viewport | 1. Resize browser width to > 1024px. | Settings panel appears as a centered modal. Buttons scale up to comfortable click targets. | Medium | |
| **TC020** | Focus Slider | 1. Tap **Focus** toggle (if supported).<br>2. Drag slider. | Slider container fades in. Camera focus changes manually. Clicking outside closes slider. | Low | |
| **TC021** | Dynamic Island | 1. Observe Island during different states. | Animates width smoothly. Text is legible. Icons (Red/Green/Gold) indicate correct state. | Medium | |

## 6. PWA & Settings

| ID | Test Case | Steps | Expected Result | Priority | Status |
|----|-----------|-------|-----------------|----------|--------|
| **TC022** | Persistent Storage | 1. Settings > **Choose Folder** > Select a folder.<br>2. Reload Page. | Selected folder name persists in Settings. New recordings save to that folder automatically. | High | |
| **TC023** | Color Grading | 1. Settings > **Color Grading** > Select "Matrix". | Viewfinder changes tint immediately. Recorded video retains the look (if "Grade in Recording" on). | Low | |
| **TC024** | Offline Access | 1. Disconnect Internet.<br>2. Reload Page. | App loads fully via Service Worker cache. UI functions normally. | High | |
