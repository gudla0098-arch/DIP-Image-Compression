/* ============================================================
   DIP PROJECT — MAIN APPLICATION JAVASCRIPT
   Handles: technique page rendering, upload, processing,
            results display, drag-and-drop, metrics
   ============================================================ */

'use strict';

/* ── Technique Data ─────────────────────────────────────────── */
const TECH_DATA = {
  dct: {
    title: 'Discrete Cosine Transform',
    titleShort: 'DCT',
    metaDesc: 'Learn how Discrete Cosine Transform (DCT) compresses images by converting pixel data into frequency coefficients.',
    tagline: 'Is an image compression technique that converts image pixels into frequency components to reduce the image size while maintaining good visual quality.',
    steps: [
      {
        heading: '1. Input Image',
        bullets: [
          'Take An Original Digital Image.',
          'The Image Contains Pixels With Different Brightness Values.',
        ],
      },
      {
        heading: '2. Divide Into 8 × 8 Blocks',
        bullets: [
          'Divide The Image Into Small Blocks Of 8 × 8 Pixels.',
          'Each Block Contains 64 Pixel Values.',
        ],
      },
      {
        heading: '3. Apply DCT Transformation',
        bullets: [
          'Convert Each 8 × 8 Pixel Block From The Spatial Domain Into The Frequency Domain.',
          'Separate Low-Frequency And High-Frequency Information.',
        ],
      },
      {
        heading: '4. Quantization',
        bullets: [
          'Keep Important Low-Frequency Information.',
          'Reduce Or Remove Less Important High-Frequency Information.',
          'This Helps Reduce The Amount Of Data.',
        ],
      },
      {
        heading: '5. Encoding',
        bullets: [
          'Encode The Remaining Values Into A Compact Representation.',
        ],
      },
      {
        heading: '6. Compressed Image',
        bullets: [
          'Reconstruct The Image Using The Compressed Data.',
          'The Final Image Has A Smaller File Size While Maintaining Reasonable Visual Quality.',
        ],
      },
    ],
    flow: [
      'Original Image',
      'Divide Into 8×8 Blocks',
      'Apply DCT',
      'Frequency Coefficients',
      'Quantization',
      'Encoding',
      'Compressed Image',
    ],
    footnotes: [
      {
        label: 'JPEG Compression',
        labelClass: '',
        text: ': when you take a photograph using your smartphone and save it as a jpeg image, dct helps reduce the image file size by removing less noticeable visual information.',
      },
      {
        label: 'Remember',
        labelClass: 'red',
        text: ': dct does not directly delete pixels. it transforms pixel values into frequency coefficients, and quantization reduces the precision of less important coefficients.',
      },
    ],
  },

  dwt: {
    title: 'Discrete Wavelet Transform',
    titleShort: 'DWT',
    metaDesc: 'Learn how Discrete Wavelet Transform (DWT) decomposes images into frequency sub-bands for efficient compression.',
    tagline: 'Is an image compression technique that divides an image into different frequency components and resolution levels. it reduces image size by removing less important information while preserving important details.',
    steps: [
      {
        heading: '1. Input Image',
        bullets: [
          'Take An Original Digital Image Containing Pixels.',
          'Convert It Into A Suitable Matrix Of Pixel Values.',
        ],
      },
      {
        heading: '2. Apply Wavelet Transform',
        bullets: [
          'Apply DWT To The Image.',
          'It Separates Image Information Into Low-Frequency And High-Frequency Components.',
        ],
      },
      {
        heading: '3. Divide Into Four Sub-Bands',
        bullets: [
          'DWT Produces Four Components:',
          'LL — Contains Basic Image Information (Approximation).',
          'LH — Contains Horizontal Detail Information.',
          'HL — Contains Vertical Detail Information.',
          'HH — Contains Diagonal Detail Information.',
        ],
      },
      {
        heading: '4. Apply Thresholding',
        bullets: [
          'Keep Important Coefficients.',
          'Remove Or Reduce Small, Less Significant Coefficients.',
          'This Helps Reduce Image Data.',
        ],
      },
      {
        heading: '5. Encoding',
        bullets: [
          'Encode The Remaining Coefficients Into A Compressed Format.',
        ],
      },
      {
        heading: '6. Reconstruct Compressed Image',
        bullets: [
          'Apply Inverse Wavelet Transformation.',
          'Reconstruct The Image Using The Compressed Coefficients.',
        ],
      },
    ],
    flow: [
      'Original Image',
      'Apply DWT',
      'Image Decomposition',
      '__subbands__',   // special marker for LL/LH/HL/HH grid
      'Thresholding',
      'Encoding',
      'Compressed Image',
    ],
    footnotes: [
      {
        label: 'JPEG Compression',
        labelClass: '',
        text: ': Uses DWT to compress images while maintaining good visual quality. it is useful in medical imaging, digital photography, and satellite images.',
      },
    ],
  },

  svd: {
    title: 'Singular Value Decomposition',
    titleShort: 'SVD',
    metaDesc: 'Learn how Singular Value Decomposition (SVD) compresses images by retaining only the most significant matrix components.',
    tagline: 'Is a mathematical technique used for image compression by decomposing an image matrix into three smaller mathematical components. it keeps the most important information and removes less significant data to reduce image size.',
    steps: [
      {
        heading: '1. Input Image',
        bullets: [
          'Take An Original Digital Image.',
          'Convert The Image Into A Numerical Matrix Containing Pixel Values.',
        ],
      },
      {
        heading: '2. Apply SVD',
        bullets: [
          'Decompose The Image Matrix Into Three Matrices: U, Σ (Sigma), And Vᵀ.',
        ],
      },
      {
        heading: '3. Identify Singular Values',
        bullets: [
          'The Σ Matrix Contains Singular Values.',
          'Larger Values Represent More Important Image Information.',
          'Smaller Values Represent Less Significant Information.',
        ],
      },
      {
        heading: '4. Rank Reduction',
        bullets: [
          'Keep Only The Top K Largest Singular Values.',
          'Remove Smaller Singular Values To Reduce The Amount Of Data.',
        ],
      },
      {
        heading: '5. Image Reconstruction',
        bullets: [
          'Multiply The Reduced Matrices U, Σ, And Vᵀ.',
          'Reconstruct An Approximate Version Of The Original Image.',
        ],
      },
      {
        heading: '6. Compressed Image',
        bullets: [
          'Obtain A Compressed Image With Reduced Storage Requirements While Preserving Important Visual Information.',
        ],
      },
    ],
    flow: [
      'Original Image',
      'Convert Into Matrix',
      'Apply SVD',
      'U × Σ × Vᵀ',
      'Select Top K Values',
      'Rank Reduction',
      'Reconstruct Image',
      'Compressed Image',
    ],
    footnotes: [
      {
        label: 'Lower Rank',
        labelClass: '',
        text: ': means stronger compression. Using more singular values preserves more image detail but results in less size reduction.',
      },
    ],
  },
};

/* ── Router: detect current page ───────────────────────────── */
const pathParts = location.pathname.replace(/\/$/, '').split('/').filter(Boolean);
const pageKind   = pathParts[0];   // 'technique' | 'upload' | undefined
const pageTech   = pathParts[1];   // 'dct' | 'dwt' | 'svd' | undefined

/* ── TECHNIQUE PAGE ─────────────────────────────────────────── */
if (pageKind === 'technique' && TECH_DATA[pageTech]) {
  initTechniquePage(pageTech);
}

function initTechniquePage(tech) {
  const d = TECH_DATA[tech];

  // Page metadata
  document.title          = `${d.titleShort} — Digital Image Processing`;
  const metaEl = document.getElementById('meta-desc');
  if (metaEl) metaEl.setAttribute('content', d.metaDesc);

  // Heading & tagline
  document.getElementById('tech-title').textContent   = d.title;
  document.getElementById('tech-tagline').textContent = d.tagline;

  // Step list
  const stepList = document.getElementById('step-list');
  if (stepList) {
    stepList.innerHTML = d.steps.map(s => `
      <li>
        <strong>${s.heading}</strong>
        <ul>${s.bullets.map(b => `<li>${b}</li>`).join('')}</ul>
      </li>
    `).join('');
  }

  // Flow diagram (right box)
  const flowBox = document.getElementById('flow-box');
  if (flowBox) {
    flowBox.innerHTML = d.flow.map(label => {
      if (label === '__subbands__') {
        return `
          <div class="flow-step">
            <div class="flow-subbands">
              <span>LL</span><span>LH</span>
              <span>HL</span><span>HH</span>
            </div>
          </div>`;
      }
      return `<div class="flow-step">${label}</div>`;
    }).join('');
  }

  // Footnotes
  const fnEl = document.getElementById('footnotes');
  if (fnEl && d.footnotes) {
    fnEl.innerHTML = d.footnotes.map(fn => `
      <p class="footnote">
        <span class="fn-label ${fn.labelClass}">${fn.label}</span>${fn.text}
      </p>
    `).join('');
  }

  // Try link
  const tryLink = document.getElementById('try-link');
  if (tryLink) tryLink.href = `/upload/${tech}`;
}

/* ── UPLOAD PAGE ────────────────────────────────────────────── */
if (pageKind === 'upload' && TECH_DATA[pageTech]) {
  initUploadPage(pageTech);
}

function initUploadPage(tech) {
  const d = TECH_DATA[tech];

  // Page metadata
  document.title = `${d.titleShort} Project — DIP`;
  const heading = document.getElementById('upload-heading');
  if (heading) heading.textContent = d.title;

  // Build per-technique controls
  renderControls(tech);

  // Wire up interactions
  const dropZone     = document.getElementById('drop-zone');
  const fileInput    = document.getElementById('file-input');
  const browseTrigger= document.getElementById('browse-trigger');
  const selectedPrev = document.getElementById('selected-preview');
  const previewImg   = document.getElementById('preview-img');
  const fileName     = document.getElementById('file-name');
  const fileSize     = document.getElementById('file-size');
  const removeBtn    = document.getElementById('remove-btn');
  const processBtn   = document.getElementById('process-btn');
  const statusMsg    = document.getElementById('status-msg');
  const resultsSection=document.getElementById('results-section');

  let currentFile = null;

  // ── File choose ──
  function chooseFile(file) {
    if (!file) return;
    const allowed = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setStatus('Please upload a PNG, JPG or WEBP image.', 'error');
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setStatus('Image must be smaller than 12 MB.', 'error');
      return;
    }
    currentFile = file;
    previewImg.src = URL.createObjectURL(file);
    previewImg.alt = `Preview of ${file.name}`;
    fileName.textContent = file.name;
    fileSize.textContent = formatBytes(file.size);
    selectedPrev.hidden = false;
    dropZone.hidden     = true;
    processBtn.disabled = false;
    resultsSection.hidden = true;
    setStatus('');
  }

  // ── Browse trigger ──
  if (browseTrigger) browseTrigger.addEventListener('click', () => fileInput.click());
  if (dropZone)      dropZone.addEventListener('click', e => {
    if (e.target !== browseTrigger) fileInput.click();
  });

  // Keyboard support for drop zone
  if (dropZone) dropZone.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); }
  });

  if (fileInput) fileInput.addEventListener('change', () => chooseFile(fileInput.files[0]));

  // ── Drag and drop ──
  if (dropZone) {
    ['dragover', 'dragenter'].forEach(evt => dropZone.addEventListener(evt, e => {
      e.preventDefault();
      dropZone.classList.add('drag-over');
    }));
    ['dragleave', 'drop'].forEach(evt => dropZone.addEventListener(evt, e => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
    }));
    dropZone.addEventListener('drop', e => chooseFile(e.dataTransfer.files[0]));
  }

  // ── Remove file ──
  if (removeBtn) removeBtn.addEventListener('click', () => {
    currentFile = null;
    fileInput.value = '';
    previewImg.src  = '';
    selectedPrev.hidden = true;
    dropZone.hidden = false;
    processBtn.disabled = true;
    resultsSection.hidden = true;
    setStatus('');
  });

  // ── Process ──
  if (processBtn) processBtn.addEventListener('click', () => processImage(tech, currentFile));

  // ── Status helper ──
  function setStatus(msg, type = '') {
    statusMsg.textContent = msg;
    statusMsg.className   = 'status-msg' + (type ? ' ' + type : '');
  }
}

/* ── Render technique-specific controls ─────────────────────── */
function renderControls(tech) {
  const row = document.getElementById('controls-row');
  if (!row) return;

  if (tech === 'dct') {
    row.innerHTML = `
      <div class="control-group">
        <label for="quality-range">
          Compression Quality
          <input type="range" id="quality-range" min="10" max="90" value="55" aria-label="Compression quality">
          <span class="range-value" id="quality-value">55</span>
        </label>
      </div>`;
    const r = document.getElementById('quality-range');
    const v = document.getElementById('quality-value');
    if (r && v) r.addEventListener('input', () => { v.textContent = r.value; });
  }

  if (tech === 'dwt') {
    row.innerHTML = `
      <div class="control-group">
        <label for="wavelet-select">
          Wavelet
          <select id="wavelet-select" aria-label="Wavelet type">
            <option value="haar">Haar</option>
            <option value="db2">Daubechies (db2)</option>
            <option value="sym2">Symlets (sym2)</option>
          </select>
        </label>
      </div>
      <div class="control-group">
        <label for="threshold-range">
          Threshold
          <input type="range" id="threshold-range" min="0" max="60" value="18" aria-label="Thresholding strength">
          <span class="range-value" id="threshold-value">18</span>
        </label>
      </div>`;
    const r = document.getElementById('threshold-range');
    const v = document.getElementById('threshold-value');
    if (r && v) r.addEventListener('input', () => { v.textContent = r.value; });
  }

  if (tech === 'svd') {
    row.innerHTML = `
      <div class="control-group">
        <label for="rank-input">
          Retained Rank (singular values to keep)
          <input type="number" id="rank-input" min="1" max="500" value="40" aria-label="Number of singular values to retain">
        </label>
      </div>`;
  }
}

/* ── Process image: build FormData and POST to API ──────────── */
async function processImage(tech, file) {
  if (!file) return;

  const btn       = document.getElementById('process-btn');
  const statusMsg = document.getElementById('status-msg');

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span>Processing…';
  setStatusById('status-msg', 'Sending image to server…');

  const fd = new FormData();
  fd.append('image', file);

  if (tech === 'dct') {
    fd.append('quality', document.getElementById('quality-range')?.value ?? 55);
  }
  if (tech === 'dwt') {
    fd.append('wavelet',   document.getElementById('wavelet-select')?.value ?? 'haar');
    fd.append('threshold', document.getElementById('threshold-range')?.value ?? 18);
  }
  if (tech === 'svd') {
    fd.append('rank', document.getElementById('rank-input')?.value ?? 40);
  }

  try {
    const res  = await fetch(`/api/process/${tech}`, { method: 'POST', body: fd });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || `Server error ${res.status}`);
    }

    displayResults(file, data);
    setStatusById('status-msg', '✓ Image processed successfully.', 'success');

  } catch (err) {
    setStatusById('status-msg', `Error: ${err.message}`, 'error');
  } finally {
    btn.disabled  = false;
    btn.innerHTML = 'Process Image';
  }
}

/* ── Display results ─────────────────────────────────────────── */
function displayResults(originalFile, data) {
  const section = document.getElementById('results-section');
  if (!section) return;

  // Images
  document.getElementById('original-img').src  = URL.createObjectURL(originalFile);
  document.getElementById('original-img').alt  = 'Original: ' + originalFile.name;
  document.getElementById('processed-img').src = data.processed_url + '?t=' + Date.now();
  document.getElementById('processed-img').alt = 'Processed output';

  // Download link
  const dl = document.getElementById('download-btn');
  dl.href     = data.processed_url;
  dl.download = data.output_filename || 'processed.png';

  // Summary bar
  const m    = data.metrics;
  const saved = m.size_reduction_percent;
  const summaryBar = document.getElementById('summary-bar');
  summaryBar.innerHTML = `
    <span class="summary-main">
      ${saved >= 0
        ? saved.toFixed(1) + '% smaller than original'
        : Math.abs(saved).toFixed(1) + '% larger than original'}
    </span>
    <span class="summary-stat">Ratio: ${m.compression_ratio.toFixed(2)}:1</span>
    <span class="summary-stat">
      ${Math.abs(m.bytes_saved).toLocaleString()} bytes
      ${m.bytes_saved >= 0 ? 'saved' : 'added'}
    </span>
    <span class="summary-stat">Technique: ${data.technique.toUpperCase()}</span>
  `;

  // Metrics cards — curated readable set
  const metricMap = {
    original_size_kb:        { label: 'Original Size',        fmt: v => v.toFixed(1) + ' KB' },
    processed_size_kb:       { label: 'Processed Size',       fmt: v => v.toFixed(1) + ' KB' },
    compression_ratio:       { label: 'Compression Ratio',    fmt: v => v.toFixed(2) + ' : 1' },
    size_reduction_percent:  { label: 'Size Reduction',       fmt: v => v.toFixed(1) + '%' },
    bytes_saved:             { label: 'Bytes Saved',          fmt: v => v.toLocaleString() + ' B' },
    pixel_mse:               { label: 'MSE',                  fmt: v => (typeof v === 'number' ? v.toFixed(4) : v) },
    psnr_db:                 { label: 'PSNR',                 fmt: v => (typeof v === 'number' ? v.toFixed(2) + ' dB' : v + ' dB') },
    quality_setting:         { label: 'Quality Setting',      fmt: v => v },
    wavelet:                 { label: 'Wavelet',              fmt: v => v },
    threshold:               { label: 'Threshold',            fmt: v => v },
    retained_rank:           { label: 'Retained Rank',        fmt: v => v },
    maximum_rank:            { label: 'Maximum Rank',         fmt: v => v },
  };

  const grid = document.getElementById('metrics-grid');
  grid.innerHTML = '';

  for (const [key, cfg] of Object.entries(metricMap)) {
    if (m[key] === undefined) continue;
    const card = document.createElement('div');
    card.className  = 'metric-card';
    card.setAttribute('role', 'listitem');
    card.innerHTML  = `
      <div class="metric-label">${cfg.label}</div>
      <div class="metric-value">${cfg.fmt(m[key])}</div>
    `;
    grid.appendChild(card);
  }

  // Show results & scroll
  section.hidden = false;
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ── Utilities ──────────────────────────────────────────────── */
function formatBytes(bytes) {
  if (bytes < 1024)       return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function setStatusById(id, msg, type = '') {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.className   = 'status-msg' + (type ? ' ' + type : '');
}
