// Utility Functions
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;

    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

function getLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(rgb1, rgb2) {
    const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
}

// Sequential Palette
const sequentialPalettes = [
    ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5'],
    ['#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d'],
    ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45'],
    ['#fcfbfd', '#efedf5', '#dadaeb', '#bcbddc', '#9e9ac8', '#807dba', '#6a51a3'],
];

function randomizeSequential() {
    const palette = sequentialPalettes[Math.floor(Math.random() * sequentialPalettes.length)];
    displayPalette('sequential-palette', palette);
}

// Diverging Palette
const divergingPalettes = [
    ['#d73027', '#f46d43', '#fdae61', '#fee090', '#e0f3f8', '#abd9e9', '#74add1', '#4575b4'],
    ['#8e0152', '#c51b7d', '#de77ae', '#f1b6da', '#e6f5d0', '#b8e186', '#7fbc41', '#4d9221'],
    ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee090', '#ffffbf', '#e0f3f8', '#abd9e9'],
];

function randomizeDiverging() {
    const palette = divergingPalettes[Math.floor(Math.random() * divergingPalettes.length)];
    displayPalette('diverging-palette', palette);
}

// Categorical Palette
const categoricalPalettes = [
    ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b'],
    ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33'],
    ['#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462'],
    ['#7fc97f', '#beaed4', '#fdc086', '#ffff99', '#386cb0', '#f0027f'],
];

function randomizeCategorical() {
    const palette = categoricalPalettes[Math.floor(Math.random() * categoricalPalettes.length)];
    displayPalette('categorical-palette', palette);
}

function displayPalette(elementId, colors) {
    const container = document.getElementById(elementId);
    container.innerHTML = '';
    colors.forEach(color => {
        const div = document.createElement('div');
        div.style.backgroundColor = color;
        div.title = color;
        container.appendChild(div);
    });
}

// Interactive Color Tester
function testColors() {
    const colors = [
        document.getElementById('color1').value,
        document.getElementById('color2').value,
        document.getElementById('color3').value,
        document.getElementById('color4').value,
        document.getElementById('color5').value,
    ];

    // Display preview
    const previewChart = document.getElementById('preview-chart');
    previewChart.innerHTML = '';
    colors.forEach((color, i) => {
        const div = document.createElement('div');
        div.style.backgroundColor = color;
        div.textContent = i + 1;
        previewChart.appendChild(div);
    });

    // Analyze colors
    const analysis = analyzeColorPalette(colors);
    displayAnalysis(analysis);

    // Update colorblind simulation
    updateColorblindSim();
}

function analyzeColorPalette(colors) {
    const analysis = {
        distinctiveness: [],
        minContrast: Infinity,
        avgLightness: 0,
        warnings: []
    };

    // Calculate contrast between adjacent colors
    for (let i = 0; i < colors.length - 1; i++) {
        const rgb1 = hexToRgb(colors[i]);
        const rgb2 = hexToRgb(colors[i + 1]);
        const contrast = getContrastRatio(rgb1, rgb2);
        analysis.distinctiveness.push({
            pair: `${i + 1} & ${i + 2}`,
            ratio: contrast.toFixed(2)
        });
        analysis.minContrast = Math.min(analysis.minContrast, contrast);
    }

    // Calculate average lightness
    const lightnesses = colors.map(color => {
        const rgb = hexToRgb(color);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        return hsl.l;
    });
    analysis.avgLightness = lightnesses.reduce((a, b) => a + b, 0) / lightnesses.length;

    // Generate warnings
    if (analysis.minContrast < 2) {
        analysis.warnings.push('Low contrast between adjacent colors - may be hard to distinguish');
    }
    if (analysis.avgLightness > 70) {
        analysis.warnings.push('Palette is too light - consider adding darker colors for better contrast');
    }
    if (analysis.avgLightness < 30) {
        analysis.warnings.push('Palette is too dark - consider adding lighter colors');
    }

    // Check for similar hues
    const hues = colors.map(color => {
        const rgb = hexToRgb(color);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        return hsl.h;
    });
    const hueDifferences = [];
    for (let i = 0; i < hues.length - 1; i++) {
        const diff = Math.abs(hues[i] - hues[i + 1]);
        hueDifferences.push(Math.min(diff, 360 - diff));
    }
    const minHueDiff = Math.min(...hueDifferences);
    if (minHueDiff < 30) {
        analysis.warnings.push('Some colors have very similar hues - may be confusing');
    }

    return analysis;
}

function displayAnalysis(analysis) {
    const container = document.getElementById('analysis-results');
    let html = '<div class="analysis-item"><strong>Color Distinctiveness (Contrast Ratios):</strong><br>';

    analysis.distinctiveness.forEach(item => {
        const quality = item.ratio < 2 ? 'Poor' : item.ratio < 3 ? 'Fair' : 'Good';
        html += `Colors ${item.pair}: ${item.ratio}:1 (${quality})<br>`;
    });
    html += '</div>';

    html += `<div class="analysis-item"><strong>Average Lightness:</strong> ${analysis.avgLightness.toFixed(1)}%</div>`;

    if (analysis.warnings.length > 0) {
        html += '<div class="analysis-item"><strong>Warnings:</strong><br>';
        analysis.warnings.forEach(warning => {
            html += `⚠️ ${warning}<br>`;
        });
        html += '</div>';
    } else {
        html += '<div class="analysis-item"><strong>Status:</strong> ✅ No major issues detected</div>';
    }

    container.innerHTML = html;
}

// Color Blindness Simulation
const colorBlindnessDescriptions = {
    normal: 'Normal color vision - no color vision deficiency.',
    protanopia: 'Protanopia (Red-Blind) - Difficulty distinguishing between red and green. Affects about 1% of males.',
    deuteranopia: 'Deuteranopia (Green-Blind) - Difficulty distinguishing between red and green. Most common form, affects about 1% of males.',
    tritanopia: 'Tritanopia (Blue-Blind) - Difficulty distinguishing between blue and yellow. Very rare, affects about 0.001% of people.',
    achromatopsia: 'Achromatopsia (Total Color Blindness) - Complete absence of color vision. Extremely rare.'
};

function simulateColorBlindness(hex, type) {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;

    let r = rgb.r / 255;
    let g = rgb.g / 255;
    let b = rgb.b / 255;

    // Convert to linear RGB
    r = r <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    g = g <= 0.04045 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    b = b <= 0.04045 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

    let l, m, s;

    // RGB to LMS
    l = 17.8824 * r + 43.5161 * g + 4.11935 * b;
    m = 3.45565 * r + 27.1554 * g + 3.86714 * b;
    s = 0.0299566 * r + 0.184309 * g + 1.46709 * b;

    // Apply color blindness transformation
    let lSim, mSim, sSim;

    switch(type) {
        case 'protanopia':
            lSim = 0.0 * l + 2.02344 * m + -2.52581 * s;
            mSim = m;
            sSim = s;
            break;
        case 'deuteranopia':
            lSim = l;
            mSim = 0.494207 * l + 0.0 * m + 1.24827 * s;
            sSim = s;
            break;
        case 'tritanopia':
            lSim = l;
            mSim = m;
            sSim = -0.395913 * l + 0.801109 * m + 0.0 * s;
            break;
        case 'achromatopsia':
            const gray = (l + m + s) / 3;
            lSim = mSim = sSim = gray;
            break;
        default:
            lSim = l;
            mSim = m;
            sSim = s;
    }

    // LMS to RGB
    r = 0.0809444479 * lSim + -0.130504409 * mSim + 0.116721066 * sSim;
    g = -0.0102485335 * lSim + 0.0540193266 * mSim + -0.113614708 * sSim;
    b = -0.000365296938 * lSim + -0.00412161469 * mSim + 0.693511405 * sSim;

    // Convert back to sRGB
    r = r <= 0.0031308 ? 12.92 * r : 1.055 * Math.pow(r, 1/2.4) - 0.055;
    g = g <= 0.0031308 ? 12.92 * g : 1.055 * Math.pow(g, 1/2.4) - 0.055;
    b = b <= 0.0031308 ? 12.92 * b : 1.055 * Math.pow(b, 1/2.4) - 0.055;

    // Clamp values
    r = Math.max(0, Math.min(1, r));
    g = Math.max(0, Math.min(1, g));
    b = Math.max(0, Math.min(1, b));

    return rgbToHex(
        Math.round(r * 255),
        Math.round(g * 255),
        Math.round(b * 255)
    );
}

function updateColorblindSim() {
    const visionType = document.getElementById('vision-type').value;
    const colors = [
        document.getElementById('color1').value,
        document.getElementById('color2').value,
        document.getElementById('color3').value,
        document.getElementById('color4').value,
        document.getElementById('color5').value,
    ];

    const preview = document.getElementById('colorblind-preview');
    preview.innerHTML = '';

    colors.forEach((color, i) => {
        const simColor = simulateColorBlindness(color, visionType);
        const div = document.createElement('div');
        div.className = 'sim-color';
        div.style.backgroundColor = simColor;
        div.textContent = `Color ${i + 1}`;
        preview.appendChild(div);
    });

    document.getElementById('colorblind-description').textContent =
        colorBlindnessDescriptions[visionType];
}

// Contrast Checker
function checkContrast() {
    const fgColor = document.getElementById('fg-color').value;
    const bgColor = document.getElementById('bg-color').value;

    const fgRgb = hexToRgb(fgColor);
    const bgRgb = hexToRgb(bgColor);

    const ratio = getContrastRatio(fgRgb, bgRgb);

    // Update sample
    const sample = document.getElementById('contrast-sample');
    sample.style.color = fgColor;
    sample.style.backgroundColor = bgColor;

    // Display results
    const results = document.getElementById('contrast-results');
    let html = `<div class="contrast-ratio">Contrast Ratio: ${ratio.toFixed(2)}:1</div>`;

    // WCAG AA
    const passAA = ratio >= 4.5;
    html += `<div class="wcag-result ${passAA ? 'pass' : 'fail'}">
        WCAG AA (Normal Text): ${passAA ? '✅ Pass' : '❌ Fail'} (4.5:1 required)
    </div>`;

    const passAALarge = ratio >= 3;
    html += `<div class="wcag-result ${passAALarge ? 'pass' : 'fail'}">
        WCAG AA (Large Text): ${passAALarge ? '✅ Pass' : '❌ Fail'} (3:1 required)
    </div>`;

    // WCAG AAA
    const passAAA = ratio >= 7;
    html += `<div class="wcag-result ${passAAA ? 'pass' : 'fail'}">
        WCAG AAA (Normal Text): ${passAAA ? '✅ Pass' : '❌ Fail'} (7:1 required)
    </div>`;

    const passAAALarge = ratio >= 4.5;
    html += `<div class="wcag-result ${passAAALarge ? 'pass' : 'fail'}">
        WCAG AAA (Large Text): ${passAAALarge ? '✅ Pass' : '❌ Fail'} (4.5:1 required)
    </div>`;

    results.innerHTML = html;
}

// Color Harmony
const harmonyDescriptions = {
    complementary: 'Complementary colors are opposite each other on the color wheel. They create high contrast and vibrant looks.',
    analogous: 'Analogous colors are next to each other on the color wheel. They create harmonious and pleasing combinations.',
    triadic: 'Triadic colors are evenly spaced around the color wheel. They create vibrant yet balanced palettes.',
    'split-complementary': 'Split complementary uses a base color and two colors adjacent to its complement. Creates contrast with more nuance than complementary.',
    tetradic: 'Tetradic (square) uses four colors evenly spaced around the color wheel. Offers plenty of possibilities for variation.'
};

function generateHarmony() {
    const baseColor = document.getElementById('base-color').value;
    const harmonyType = document.getElementById('harmony-type').value;

    const rgb = hexToRgb(baseColor);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const baseHue = hsl.h;

    let colors = [baseColor];
    let hues = [];

    switch(harmonyType) {
        case 'complementary':
            hues = [(baseHue + 180) % 360];
            break;
        case 'analogous':
            hues = [(baseHue - 30 + 360) % 360, (baseHue + 30) % 360];
            break;
        case 'triadic':
            hues = [(baseHue + 120) % 360, (baseHue + 240) % 360];
            break;
        case 'split-complementary':
            hues = [(baseHue + 150) % 360, (baseHue + 210) % 360];
            break;
        case 'tetradic':
            hues = [(baseHue + 90) % 360, (baseHue + 180) % 360, (baseHue + 270) % 360];
            break;
    }

    hues.forEach(hue => {
        const newRgb = hslToRgb(hue, hsl.s, hsl.l);
        colors.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    });

    displayHarmony(colors);
    document.getElementById('harmony-description').innerHTML =
        `<p>${harmonyDescriptions[harmonyType]}</p>`;
}

function displayHarmony(colors) {
    const container = document.getElementById('harmony-result');
    container.innerHTML = '';

    colors.forEach((color, i) => {
        const div = document.createElement('div');
        div.className = 'harmony-color';
        div.style.backgroundColor = color;
        div.textContent = color;
        container.appendChild(div);
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize palettes
    randomizeSequential();
    randomizeDiverging();
    randomizeCategorical();

    // Initialize color tester
    testColors();

    // Initialize contrast checker
    checkContrast();

    // Initialize harmony
    generateHarmony();

    // Add event listeners for color inputs
    const colorInputs = ['color1', 'color2', 'color3', 'color4', 'color5'];
    colorInputs.forEach(id => {
        document.getElementById(id).addEventListener('change', testColors);
    });

    // Add event listeners for contrast checker
    document.getElementById('fg-color').addEventListener('change', checkContrast);
    document.getElementById('bg-color').addEventListener('change', checkContrast);

    // Add event listener for base color
    document.getElementById('base-color').addEventListener('change', generateHarmony);
});
