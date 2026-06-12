'use strict';

const DEFAULT_DPI = 96;
let ppm = DEFAULT_DPI / 25.4;
let pointerx = null;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const readout = document.getElementById('readout');
const dpiValueEl = document.getElementById('dpiValue');
const RULER_HEIGHT_CSS = 96;
const TICK_CONFIG = [
  { modulo: 10, height: 28, width: 1.0, labelOffset: 42 }, 
  { modulo:  5, height: 18, width: 0.6 },                  
  { modulo:  1, height: 10, width: 0.5 },
];


function setPPMFromDPI(dpi) {
    ppm = dpi / 25.4;
    dpiValueEl.textContent = Math.round(dpi);
    document.querySelector('.dpi-readout__source').textContent = 'manual';
    draw();
}

function draw() {
    const dpr    = window.devicePixelRatio || 1;
    const cssW   = canvas.parentElement.clientWidth;
    const cssH   = RULER_HEIGHT_CSS;
    canvas.width  = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    canvas.style.height = cssH + 'px';

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, cssW, cssH);

    drawTicks(cssW, cssH);
    drawBaselineAndUnit(cssW, cssH);
    if (pointerx !== null) drawPointer(pointerx, cssH);

    ctx.restore();
}


function drawTicks(cssW, cssH) {
    const totalMM = cssW / ppm;
    for(let mm = 0; mm <= Math.ceil(totalMM); mm++)
    {
        const x = mm * ppm;
        if(x>cssW) break;
        const tier = TICK_CONFIG.find(t => mm % t.modulo === 0);
        if (!tier) continue;

        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, tier.height);
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim();
        ctx.lineWidth = tier.width;
        ctx.stroke();

        if(tier.labelOffset && mm>0)
        {
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim();
            ctx.font = `400 11px "Courier New", monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(mm, x, tier.labelOffset);
        }
    }
}

function drawBaselineAndUnit(cssW, cssH) {
    ctx.beginPath();
    ctx.moveTo(0, 60);
    ctx.lineTo(cssW, 60);
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border').trim();
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--ink-3').trim();
    ctx.font = `400 10px "Courier New", monospace`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText('mm', cssW - 4, 62);
}

function drawPointer(x, cssH) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 60);
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    ctx.lineWidth = 1;
    ctx.stroke();
    const tw = 5;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x-tw, -6);
    ctx.lineTo(x+tw, -6);
    ctx.closePath();
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    ctx.fill();

}

function updatePointer(clientX)
{
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    pointerx = x;
    const mm = x/ppm;
    readout.textContent = mm.toFixed(2) + ' mm';
    draw();
}

function clearPointer()
{
    pointerx = null;
    readout.textContent = '-';
    draw();
}


canvas.addEventListener('mousemove', e => updatePointer(e.clientX));
canvas.addEventListener('mouseleave', clearPointer);

canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    updatePointer(e.touches[0].clientX);
}, { passive: false });

canvas.addEventListener('touchend', clearPointer);


let resizeTimer;

window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(draw, 60);
});


draw();
