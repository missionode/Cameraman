// AI Worker v2 (Renamed to bypass cache)
// Handles MediaPipe Face Detector off the main thread

// Use a clean, direct URL
importScripts("./vision_classic.js");

let faceDetector = null;
let isBusy = false;

self.onmessage = async (event) => {
    const { type, payload } = event.data;

    if (type === 'init') {
        try {
            const { FaceDetector, FilesetResolver } = vision;

            const filesetResolver = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
            );
            
            faceDetector = await FaceDetector.createFromOptions(filesetResolver, {
                baseOptions: {
                    modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
                    delegate: "GPU"
                },
                runningMode: "IMAGE"
            });
            console.log("AI Worker V2: Ready");
            self.postMessage({ type: 'ready' });
        } catch (e) {
            console.error("AI Worker V2: Init Failed", e);
        }
    } 
    else if (type === 'detect') {
        if (!faceDetector || isBusy) {
            if (payload.bitmap) payload.bitmap.close();
            return;
        }

        isBusy = true;
        try {
            const results = faceDetector.detect(payload.bitmap);
            self.postMessage({ 
                type: 'result', 
                payload: { detections: results.detections } 
            });
        } catch (e) {
            console.warn("AI Detection Error", e);
            self.postMessage({ 
                type: 'result', 
                payload: { detections: [] } 
            });
        } finally {
            if (payload.bitmap) payload.bitmap.close();
            isBusy = false;
        }
    }
};
