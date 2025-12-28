// Video Processor Worker
// Handles rendering and color grading off the main thread

let canvas = null;
let ctx = null;

const gradingDefinitions = {
    'noir': [{ mode: 'saturation', color: '#3f3e3e5a' }, { mode: 'overlay', color: 'rgba(0,0,0,0.4)' }, { mode: 'multiply', color: 'rgba(0,0,0,0.2)' }],
    'vintage': [{ mode: 'color', color: 'rgba(112, 66, 20, 0.32)' }, { mode: 'soft-light', color: 'rgba(255, 240, 200, 0.3)' }, { mode: 'multiply', color: 'rgba(255, 255, 255, 0.1)' }],
    'bleach-bypass': [{ mode: 'saturation', color: '#55555586' }, { mode: 'overlay', color: 'rgba(255,255,255,0.3)' }, { mode: 'multiply', color: 'rgba(0,0,0,0.3)' }],
    'teal-orange': [{ mode: 'overlay', gradient: { stops: [[0, 'rgba(0, 255, 21, 0.21)'], [1, 'rgba(255, 165, 0, 0.6)']], type: 'linear' } }],
    'matrix': [{ mode: 'saturation', color: '#807e7e8b' }, { mode: 'overlay', color: 'rgba(136, 240, 136, 0.4)' }, { mode: 'multiply', color: 'rgba(0, 50, 0, 0.2)' }],
    'kgf': [{ mode: 'color', color: 'rgba(180, 140, 60, 0.2)' }, { mode: 'multiply', color: 'rgba(20, 10, 0, 0.15)' }, { mode: 'overlay', color: 'rgba(200, 150, 50, 0.10)' }],
    'salaar': [{ mode: 'saturation', color: '#60686b99' }, { mode: 'multiply', color: 'rgba(20, 30, 40, 0.24)' }, { mode: 'hard-light', color: 'rgba(0, 0, 0, 0.1)' }],
    'empuraan': [{ mode: 'soft-light', color: 'rgba(255, 170, 90, 0.25)' }, { mode: 'multiply', color: 'rgba(20, 30, 48, 0.15)' }, { mode: 'screen', color: 'rgba(255, 245, 230, 0.10)' }],
    'meiyazhagan': [{ mode: 'soft-light', color: 'rgba(255, 240, 220, 0.3)' }, { mode: 'screen', color: 'rgba(255, 200, 150, 0.1)' }]
};

self.onmessage = (event) => {
    const { type, payload } = event.data;

    if (type === 'init') {
        canvas = payload.canvas;
        // alpha: false leads to better performance if transparency isn't needed
        ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    } 
    else if (type === 'render') {
        if (!ctx || !payload.bitmap) return;

        const { bitmap, crop, grading, width, height, isMirror } = payload;

        // Resize canvas if dimensions change
        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
        }

        // 1. Calculate Draw Coordinates
        // The bitmap is the full video frame
        const sx = crop.x * bitmap.width;
        const sy = crop.y * bitmap.height;
        const sw = crop.width * bitmap.width;
        const sh = crop.height * bitmap.height;

        // 2. Clear / Reset
        ctx.globalCompositeOperation = 'source-over';
        
        // 3. Draw with Transform (Mirroring)
        ctx.save();
        if (isMirror) {
            ctx.translate(width, 0);
            ctx.scale(-1, 1);
        }
        
        ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, width, height);
        ctx.restore();

        // 4. Color Grading
        if (grading && grading !== 'none') {
            applyGrading(ctx, width, height, grading);
        }

        // Cleanup the transferred bitmap to prevent memory leaks
        bitmap.close();
    }
};

function applyGrading(ctx, width, height, gradeName) {
    const layers = gradingDefinitions[gradeName];
    if (!layers) return;
    
    layers.forEach(layer => {
        ctx.globalCompositeOperation = layer.mode;
        if (layer.gradient) {
            const grad = ctx.createLinearGradient(0, 0, width, height);
            layer.gradient.stops.forEach(stop => grad.addColorStop(stop[0], stop[1]));
            ctx.fillStyle = grad;
        } else {
            ctx.fillStyle = layer.color;
        }
        ctx.fillRect(0, 0, width, height);
    });
    
    // Reset
    ctx.globalCompositeOperation = 'source-over';
}
