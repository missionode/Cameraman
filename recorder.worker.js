let writableStream = null;
let isSecure = false;
let cryptoKey = null;
let isClosing = false;
let writeQueue = Promise.resolve(); // Serialize writes

// Constants for SE6 Format
const MAGIC_SIGNATURE = new TextEncoder().encode('SE6'); // 3 bytes

self.onmessage = async (event) => {
    const { type, payload } = event.data;

    try {
        if (type === 'init') {
            const fileHandle = payload.fileHandle;
            isSecure = payload.isSecure || false;
            isClosing = false;
            writeQueue = Promise.resolve();
            
            // Open file
            writableStream = await fileHandle.createWritable();

            if (isSecure) {
                // Secure Mode Setup
                cryptoKey = payload.key; // CryptoKey object passed from main thread
                const salt = payload.salt; // 16 bytes

                if (!cryptoKey || !salt) {
                    throw new Error("Secure mode requires Key and Salt");
                }

                // Write Header: [Magic (3)] + [Salt (16)]
                await writableStream.write(MAGIC_SIGNATURE);
                await writableStream.write(salt);
                
                console.log('Worker: Secure writer initialized (.se6).');
            } else {
                console.log('Worker: Standard file writer initialized.');
            }

        } else if (type === 'write') {
            if (writableStream && !isClosing) {
                // Chain writes to ensure order
                writeQueue = writeQueue.then(async () => {
                    try {
                        if (isClosing) return; // double check inside queue

                        const data = payload.data; // Blob

                        if (isSecure) {
                            // --- ENCRYPTION PIPELINE ---
                            
                            // 1. Convert Blob to ArrayBuffer
                            const arrayBuffer = await data.arrayBuffer();

                            // 2. Generate unique IV for this chunk (12 bytes for AES-GCM)
                            const iv = self.crypto.getRandomValues(new Uint8Array(12));

                            // 3. Encrypt
                            const encryptedBuffer = await self.crypto.subtle.encrypt(
                                { name: "AES-GCM", iv: iv },
                                cryptoKey,
                                arrayBuffer
                            );

                            // 4. Construct Packet: [Length (4 bytes)] + [IV (12 bytes)] + [Encrypted Data]
                            const chunkLength = encryptedBuffer.byteLength;
                            
                            // Optimize: Combine into single buffer to reduce I/O ops
                            const packet = new Uint8Array(4 + 12 + chunkLength);
                            const view = new DataView(packet.buffer);
                            
                            view.setUint32(0, chunkLength, false); // Big Endian
                            packet.set(iv, 4);
                            packet.set(new Uint8Array(encryptedBuffer), 16);

                            // 5. Write atomically
                            await writableStream.write(packet);

                        } else {
                            // Standard Write
                            await writableStream.write(data);
                        }
                    } catch (writeErr) {
                         console.error("Worker Write Error:", writeErr);
                         self.postMessage({ type: 'error', error: writeErr.message });
                    }
                });
            }

        } else if (type === 'close') {
            isClosing = true;
            // Wait for pending writes
            await writeQueue;
            
            if (writableStream) {
                await writableStream.close();
                writableStream = null;
                isSecure = false;
                cryptoKey = null;
                console.log('Worker: file closed.');
            }
            self.postMessage({ type: 'closed' });
        }
    } catch (error) {
        console.error('Worker error:', error);
        self.postMessage({ type: 'error', error: error.message });
    }
};