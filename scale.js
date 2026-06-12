'use strict';

const DEFAULT_DPI = 96;
let ppm = DEFAULT_DPI / 25.4;
let pointerx = null;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const scaleInput = document.getElementById('scaleInput');
const readout = document.getElementById('readout');
const dpiValueEl = document.getElementById('dpiValue');