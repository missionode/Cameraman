// Video Processor Worker
// Handles rendering and color grading off the main thread

let canvas = null;
let ctx = null;

const gradingDefinitions = {
    'noir': [{ mode: 'saturation', color: '#000000' }, { mode: 'overlay', color: 'rgba(0,0,0,0.4)' }, { mode: 'multiply', color: 'rgba(0,0,0,0.2)' }],
    'vintage': [{ mode: 'color', color: 'rgba(112, 66, 20, 0.4)' }, { mode: 'soft-light', color: 'rgba(255, 240, 200, 0.3)' }, { mode: 'multiply', color: 'rgba(255, 255, 255, 0.1)' }],
    'bleach-bypass': [{ mode: 'saturation', color: '#555555' }, { mode: 'overlay', color: 'rgba(255,255,255,0.3)' }, { mode: 'multiply', color: 'rgba(0,0,0,0.3)' }],
    'teal-orange': [{ mode: 'overlay', gradient: { stops: [[0, 'rgba(0, 128, 128, 0.6)'], [1, 'rgba(255, 165, 0, 0.6)']], type: 'linear' } }],
    'matrix': [{ mode: 'saturation', color: '#000000' }, { mode: 'overlay', color: '#00ff00' }, { mode: 'multiply', color: 'rgba(0, 50, 0, 0.4)' }],
    'kgf': [{ mode: 'color', color: 'rgba(180, 140, 60, 0.5)' }, { mode: 'multiply', color: 'rgba(20, 10, 0, 0.4)' }, { mode: 'overlay', color: 'rgba(200, 150, 50, 0.2)' }],
    'salaar': [{ mode: 'saturation', color: '#333333' }, { mode: 'multiply', color: 'rgba(20, 30, 40, 0.5)' }, { mode: 'hard-light', color: 'rgba(0, 0, 0, 0.3)' }],
    'empuraan': [{ mode: 'multiply', color: 'rgba(50, 20, 10, 0.5)' }, { mode: 'overlay', color: 'rgba(255, 100, 50, 0.4)' }, { mode: 'saturation', color: 'rgba(255, 100, 50, 0.5)' }],
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
