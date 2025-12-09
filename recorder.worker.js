let writableStream = null;

self.onmessage = async (event) => {
    const { type, payload } = event.data;

    try {
        if (type === 'init') {
            writableStream = payload.writableStream;
            console.log('Worker: specialized file writer initialized.');
        } else if (type === 'write') {
            if (writableStream) {
                await writableStream.write(payload.data);
            }
        } else if (type === 'close') {
            if (writableStream) {
                await writableStream.close();
                writableStream = null;
                console.log('Worker: file closed.');
                self.postMessage({ type: 'closed' });
            }
        }
    } catch (error) {
        console.error('Worker error:', error);
        self.postMessage({ type: 'error', error: error.message });
    }
};
