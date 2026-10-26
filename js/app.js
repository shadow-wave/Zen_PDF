/**
 * ============================================================================
 * ZEN PDF STUDIO — REFINED APPLICATION CONTROLLER
 * Complete All-in-One Suite for Students, Teachers & Professionals
 * Developer: Aravind o k
 * ============================================================================
 */

const state = {
    currentView: 'home',
    theme: localStorage.getItem('zenTheme') || 'dark',
    recentTools: JSON.parse(localStorage.getItem('zenRecentTools') || '["edit", "merge", "compress", "csv2pdf"]'),
    merge: { files: [] },
    split: { file: null, doc: null, pdfJsDoc: null, totalPages: 0, selectedPages: new Set() },
    delete: { file: null, doc: null, pdfJsDoc: null, totalPages: 0, markedPages: new Set() },
    rotate: { file: null, doc: null, pdfJsDoc: null, totalPages: 0, rotationMap: {} },
    reorder: { file: null, doc: null, pdfJsDoc: null, totalPages: 0, order: [] },
    watermark: { file: null, doc: null },
    'page-numbers': { file: null, doc: null },
    img2pdf: { files: [] },
    pdf2img: { file: null, pdfJsDoc: null, images: [] },
    compress: { file: null, pdfJsDoc: null, originalSize: 0 },
    imgcompress: { files: [] },
    csv2pdf: { file: null, csvText: '' },
    pdf2csv: { file: null, pdfJsDoc: null, extractedCsv: '' },
    slide2pdf: { text: '' },
    text2pdf: { text: '' },
    'extract-text': { file: null, pdfJsDoc: null, text: '' },
    grayscale: { file: null, pdfJsDoc: null },
    invert: { file: null, pdfJsDoc: null },
    metadata: { file: null },
    flatten: { file: null, pdfJsDoc: null },
    compare: { fileA: null, docA: null, pageA: 1, totalA: 0, fileB: null, docB: null, pageB: 1, totalB: 0, sync: true },
    crop: { file: null, pdfJsDoc: null, pageNum: 1, top: 30, right: 30, bottom: 30, left: 30 },
    tts: { file: null, pdfJsDoc: null, pageNum: 1, totalPages: 1, isSpeaking: false, utter: null },
    bates: { file: null, doc: null },
    scanner: { stream: null, capturedPages: [] },
    // NEW SUITE TOOLS
    extract: { file: null, doc: null, pdfJsDoc: null, totalPages: 0, selectedPages: new Set() },
    organize: { file: null, doc: null, pdfJsDoc: null, totalPages: 0, pages: [] },
    repair: { file: null, buffer: null },
    ocr: { file: null, pdfJsDoc: null, text: '' },
    word2pdf: { file: null, text: '' },
    pdf2word: { file: null, pdfJsDoc: null },
    pdf2powerpoint: { file: null, pdfJsDoc: null },
    pdf2pdfa: { file: null, buffer: null },
    pdf2md: { file: null, pdfJsDoc: null, md: '' },
    forms: { file: null, buffer: null, fields: [] },
    unlock: { file: null, buffer: null },
    protect: { file: null, buffer: null },
    sign: { file: null, doc: null, pdfJsDoc: null, pageNum: 1, totalPages: 1, sigDataUrl: null, x: 100, y: 100, isDrawing: false },
    redact: { file: null, doc: null, pdfJsDoc: null, pageNum: 1, totalPages: 1, redactions: [], isDrawing: false, startX: 0, startY: 0 },
    summarizer: { file: null, pdfJsDoc: null, summary: '', bullets: [], mode: 'ai' },
    translate: { file: null, pdfJsDoc: null, originalText: '', translatedText: [], mode: 'ai' },
    aichat: { file: null, doc: null, pdfJsDoc: null, text: '', messages: [] },
    aistudy: { file: null, doc: null, pdfJsDoc: null, text: '', mode: 'quiz', quiz: [], flashcards: [], currentFcIdx: 0, outline: '', score: 0, answered: {} }
};

// Tool metadata for Spotlight / Command Palette
const ALL_TOOLS_CATALOG = [
    // 1. Organize PDF
    { id: 'merge', title: 'Merge Documents', desc: 'Combine multiple PDFs into one', icon: 'fa-object-group', cat: 'organize' },
    { id: 'split', title: 'Split PDF', desc: 'Visual thumbnail page extractor', icon: 'fa-scissors', cat: 'organize' },
    { id: 'delete', title: 'Remove Pages', desc: 'Remove blank or unwanted pages', icon: 'fa-file-circle-minus', cat: 'organize' },
    { id: 'extract', title: 'Extract Pages', desc: 'Extract specific pages into standalone PDF', icon: 'fa-file-export', cat: 'organize' },
    { id: 'organize', title: 'Organize PDF', desc: 'Interactive visual grid: sort, reorder & duplicate', icon: 'fa-layer-group', cat: 'organize' },
    { id: 'scanner', title: 'Scan Document (Camera)', desc: 'Snap physical paper pages to PDF', icon: 'fa-camera', cat: 'organize' },

    // 2. Optimize PDF
    { id: 'compress', title: 'Compress PDF', desc: 'Reduce PDF file size offline', icon: 'fa-file-zipper', cat: 'optimize' },
    { id: 'repair', title: 'Repair PDF', desc: 'Recover damaged or corrupted PDF streams', icon: 'fa-wrench', cat: 'optimize' },
    { id: 'ocr', title: 'OCR PDF (Text Scan)', desc: 'Convert scanned pages into copyable text', icon: 'fa-eye', cat: 'optimize' },
    { id: 'grayscale', title: 'Grayscale PDF', desc: 'Convert colored scans to black & white', icon: 'fa-circle-half-stroke', cat: 'optimize' },
    { id: 'invert', title: 'Dark Mode Invert', desc: 'Invert page luminance for night reading', icon: 'fa-moon', cat: 'optimize' },
    { id: 'flatten', title: 'Flatten PDF', desc: 'Lock annotations & forms permanently', icon: 'fa-cubes', cat: 'optimize' },
    { id: 'metadata', title: 'Metadata & Privacy Scrub', desc: 'View properties & strip personal data', icon: 'fa-tags', cat: 'optimize' },

    // 3. Convert to PDF
    { id: 'img2pdf', title: 'JPG / PNG to PDF', desc: 'Combine photos into standardized PDF', icon: 'fa-images', cat: 'to-pdf' },
    { id: 'word2pdf', title: 'Word to PDF', desc: 'Convert .docx / text / markdown into PDF', icon: 'fa-file-word', cat: 'to-pdf' },
    { id: 'slide2pdf', title: 'PowerPoint to PDF', desc: '16:9 presentation slides from text notes', icon: 'fa-person-chalkboard', cat: 'to-pdf' },
    { id: 'csv2pdf', title: 'Excel / CSV to PDF Table', desc: 'Spreadsheet data to formatted PDF report', icon: 'fa-table-cells', cat: 'to-pdf' },
    { id: 'html2pdf', title: 'HTML to PDF', desc: 'Render HTML markup into styled PDF', icon: 'fa-code', cat: 'to-pdf' },

    // 4. Convert from PDF
    { id: 'pdf2img', title: 'PDF to Images (HD & ZIP)', desc: 'Render high-DPI images and ZIP archive', icon: 'fa-file-image', cat: 'from-pdf' },
    { id: 'pdf2word', title: 'PDF to Word (.docx)', desc: 'Export to editable Microsoft Word document', icon: 'fa-file-lines', cat: 'from-pdf' },
    { id: 'pdf2powerpoint', title: 'PDF to PowerPoint (.pptx)', desc: 'Export pages to presentation slide deck', icon: 'fa-file-powerpoint', cat: 'from-pdf' },
    { id: 'pdf2csv', title: 'PDF Table to CSV / Excel', desc: 'Extract table columns to spreadsheet', icon: 'fa-file-csv', cat: 'from-pdf' },
    { id: 'pdf2pdfa', title: 'PDF to PDF/A', desc: 'ISO 19005-1 archival standard compliance', icon: 'fa-box-archive', cat: 'from-pdf' },
    { id: 'pdf2md', title: 'PDF to Markdown', desc: 'Clean Markdown for Obsidian & Notion', icon: 'fa-hashtag', cat: 'from-pdf' },
    { id: 'extract-text', title: 'Extract Text (TXT)', desc: 'Copy or export all readable text', icon: 'fa-align-left', cat: 'from-pdf' },

    // 5. Edit & Sign
    { id: 'edit', title: 'Smart PDF Editor', desc: 'Erase, annotate, draw, type & redact', icon: 'fa-pen-nib', cat: 'edit' },
    { id: 'rotate', title: 'Rotate PDF', desc: 'Fix page orientations individually', icon: 'fa-rotate-right', cat: 'edit' },
    { id: 'crop', title: 'Crop & Trim Margins', desc: 'Trim white margins and scanner borders', icon: 'fa-crop-simple', cat: 'edit' },
    { id: 'page-numbers', title: 'Add Page Numbers', desc: 'Custom header and footer numbering', icon: 'fa-list-ol', cat: 'edit' },
    { id: 'watermark', title: 'Add Watermark', desc: 'Stamp text watermarks across document', icon: 'fa-stamp', cat: 'edit' },
    { id: 'forms', title: 'PDF Forms', desc: 'Fill interactive form fields & export data', icon: 'fa-square-check', cat: 'edit' },
    { id: 'bates', title: 'Bates Numbering', desc: 'Sequential index numbering for archives', icon: 'fa-hashtag', cat: 'edit' },

    // 6. PDF Security
    { id: 'unlock', title: 'Unlock PDF', desc: 'Remove passwords and permissions', icon: 'fa-lock-open', cat: 'security' },
    { id: 'protect', title: 'Protect PDF', desc: 'Encrypt document with password barrier', icon: 'fa-lock', cat: 'security' },
    { id: 'sign', title: 'Sign PDF Studio', desc: 'Place handwritten signature & date badge', icon: 'fa-signature', cat: 'security' },
    { id: 'redact', title: 'Redact PDF', desc: 'Permanently blackout sensitive text & SSN', icon: 'fa-shield-halved', cat: 'security' },
    { id: 'compare', title: 'Compare PDFs (Diff)', desc: 'Side-by-side visual document comparison', icon: 'fa-code-compare', cat: 'security' },

    // 7. AI & Study
    { id: 'summarizer', title: 'AI Document Summarizer', desc: 'Smart executive bullet summary & stats (Gemini AI & Offline)', icon: 'fa-wand-magic-sparkles', cat: 'ai' },
    { id: 'translate', title: 'Translate PDF', desc: 'Multilingual neural & glossary translation', icon: 'fa-language', cat: 'ai' },
    { id: 'tts', title: 'PDF Audio Reader (TTS)', desc: 'Listen to your document read aloud', icon: 'fa-headphones', cat: 'ai' },
    { id: 'certificate', title: 'Certificate Generator', desc: 'Create elegant student award certificates', icon: 'fa-award', cat: 'ai' },
    { id: 'imgcompress', title: 'Compress Images', desc: 'Resize & optimize JPG, PNG, WebP', icon: 'fa-image', cat: 'ai' },
    { id: 'aichat', title: 'Ask & Chat with PDF', desc: 'Chat with document, ask questions & extract insights with Gemini AI', icon: 'fa-comments', cat: 'ai' },
    { id: 'aistudy', title: 'AI Quiz & Study Suite', desc: 'Interactive quizzes, 3D flashcards & concept guides', icon: 'fa-graduation-cap', cat: 'ai' }
];

// --- Theme Management (Light & Dark Only) ---
function initTheme() {
    setTheme(state.theme);
}

function setTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('zenTheme', theme);
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
        themeIcon.className = theme === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
    }
}

function toggleTheme() {
    const next = state.theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    playSensorySound('tap');
}

// --- PWA Installation Toggle ---
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    updatePwaToggleState(false);
});

window.addEventListener('appinstalled', () => {
    updatePwaToggleState(true);
    deferredPrompt = null;
    showToast('Zen PDF is installed as a Web App!');
});

function isPwaInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function updatePwaToggleState(isInstalled) {
    const toggle = document.getElementById('pwa-switch');
    if (toggle) {
        if (isInstalled || isPwaInstalled()) {
            toggle.classList.add('active');
        } else {
            toggle.classList.remove('active');
        }
    }
}

function handlePwaToggle() {
    playSensorySound('tap');
    if (isPwaInstalled()) {
        showToast('Zen PDF is running in standalone Web App mode!');
        return;
    }

    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choice) => {
            if (choice.outcome === 'accepted') {
                updatePwaToggleState(true);
            }
            deferredPrompt = null;
        });
    } else {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        if (isIOS) {
            showToast('On iPad/iPhone: Tap Share ⎙ and select "Add to Home Screen" ➕', 'info');
        } else {
            showToast('In browser menu (⋮), choose "Install App" or "Add to Desktop"', 'info');
        }
    }
}

// --- Precision Haptic Feedback ---
let audioEnabled = false; // Muted by default for clean pro experience

function playSensorySound(type = 'tap') {
    if (!audioEnabled || !window.liquidEngine) return;
    window.liquidEngine.playHapticTap();
}

function toggleAudio() {
    audioEnabled = !audioEnabled;
    const soundIcon = document.getElementById('sound-icon');
    if (soundIcon) {
        soundIcon.className = audioEnabled ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
    }
    if (window.liquidEngine) {
        window.liquidEngine.audioEnabled = audioEnabled;
        if (audioEnabled) window.liquidEngine.playHapticTap();
    }
}

// --- Navigation & Routing ---
function navigate(viewId) {
    if (state.currentView === viewId) return;

    if (viewId === 'home') {
        window.location.hash = '';
    } else {
        window.location.hash = viewId;
        recordRecentTool(viewId);
    }

    // Stop camera or speech if moving away
    if (state.scanner.stream) stopCameraScanner();
    if (state.tts.isSpeaking) stopSpeaking();

    const doSwitch = () => {
        document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
        const target = document.getElementById(`view-${viewId}`);
        if (target) {
            target.classList.add('active');
            state.currentView = viewId;
        }
        document.getElementById('main-viewport').scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (document.startViewTransition) {
        document.startViewTransition(() => doSwitch());
    } else {
        doSwitch();
    }
    playSensorySound('tap');
}

function recordRecentTool(toolId) {
    state.recentTools = [toolId, ...state.recentTools.filter(t => t !== toolId)].slice(0, 5);
    localStorage.setItem('zenRecentTools', JSON.stringify(state.recentTools));
    renderRecentTools();
}

function renderRecentTools() {
    const wrap = document.getElementById('recent-tools-chips');
    if (!wrap) return;
    wrap.innerHTML = '';
    state.recentTools.forEach(toolId => {
        const item = ALL_TOOLS_CATALOG.find(t => t.id === toolId);
        if (item) {
            const chip = document.createElement('button');
            chip.className = "btn-secondary py-1 px-3 text-xs rounded-full whitespace-nowrap flex-shrink-0 inline-flex items-center gap-1.5 hover:border-theme-accent transition-colors";
            chip.innerHTML = `<i class="fa-solid ${item.icon} text-accent mr-1"></i> ${item.title}`;
            chip.onclick = () => navigate(item.id);
            wrap.appendChild(chip);
        }
    });
}

window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash) navigate(hash);
    else navigate('home');
});

// Category and Search Filtering
function filterCategory(category, buttonEl) {
    document.querySelectorAll('.cat-pill').forEach(btn => {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-secondary');
    });
    if (buttonEl) {
        buttonEl.classList.remove('btn-secondary');
        buttonEl.classList.add('btn-primary');
    } else {
        const matchingBtn = document.querySelector(`.cat-pill[data-category="${category}"]`);
        if (matchingBtn) {
            matchingBtn.classList.remove('btn-secondary');
            matchingBtn.classList.add('btn-primary');
        }
    }

    const bento = document.getElementById('bento-hero-grid');
    const sections = document.querySelectorAll('.category-section');
    const cards = document.querySelectorAll('.glass-card');

    if (category === 'all') {
        if (bento) bento.style.display = 'grid';
        sections.forEach(sec => sec.style.display = 'block');
        cards.forEach(card => card.style.display = 'block');
    } else {
        if (bento) bento.style.display = 'none';
        sections.forEach(sec => {
            const secCat = sec.getAttribute('data-category');
            if (secCat === category) {
                sec.style.display = 'block';
                sec.querySelectorAll('.glass-card').forEach(c => c.style.display = 'block');
            } else {
                sec.style.display = 'none';
            }
        });
    }
    playSensorySound('tap');
}

function clearHomeSearch() {
    const input = document.getElementById('home-search-input');
    const clearBtn = document.getElementById('home-search-clear');
    if (input) {
        input.value = '';
        searchTools('');
    }
    if (clearBtn) clearBtn.classList.add('hidden');
    playSensorySound('tap');
}

function searchTools(query) {
    const q = (query || '').toLowerCase().trim();
    const clearBtn = document.getElementById('home-search-clear');
    if (clearBtn) {
        if (q.length > 0) clearBtn.classList.remove('hidden');
        else clearBtn.classList.add('hidden');
    }
    const bento = document.getElementById('bento-hero-grid');
    const sections = document.querySelectorAll('.category-section');

    if (!q) {
        const activePill = document.querySelector('.cat-pill.btn-primary');
        const activeCat = activePill ? (activePill.getAttribute('data-category') || 'all') : 'all';
        filterCategory(activeCat);
        return;
    }

    if (bento) bento.style.display = 'none';
    sections.forEach(sec => {
        let matchCount = 0;
        sec.querySelectorAll('.glass-card').forEach(card => {
            const title = (card.querySelector('h3')?.innerText || '').toLowerCase();
            const desc = (card.querySelector('p')?.innerText || '').toLowerCase();
            const badge = (card.querySelector('.tag-badge')?.innerText || '').toLowerCase();
            if (title.includes(q) || desc.includes(q) || badge.includes(q)) {
                card.style.display = 'block';
                matchCount++;
            } else {
                card.style.display = 'none';
            }
        });
        sec.style.display = matchCount > 0 ? 'block' : 'none';
    });
}

// --- Command Palette (Spotlight Search Ctrl+K) ---
window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openSpotlight();
    } else if (e.key === 'Escape') {
        closeSpotlight();
        if (state.currentView !== 'home') navigate('home');
    }
});

function openSpotlight() {
    const modal = document.getElementById('spotlight-modal');
    const input = document.getElementById('spotlight-input');
    if (modal && input) {
        modal.classList.remove('hidden');
        input.value = '';
        renderSpotlightResults('');
        input.focus();
        playSensorySound('tap');
    }
}

function closeSpotlight() {
    const modal = document.getElementById('spotlight-modal');
    if (modal) modal.classList.add('hidden');
}

function renderSpotlightResults(q) {
    const container = document.getElementById('spotlight-results');
    if (!container) return;
    const cleanQ = q.toLowerCase().trim();
    const matches = ALL_TOOLS_CATALOG.filter(t => !cleanQ || t.title.toLowerCase().includes(cleanQ) || t.desc.toLowerCase().includes(cleanQ));
    container.innerHTML = '';

    if (matches.length === 0) {
        container.innerHTML = `<div class="p-4 text-center text-xs text-muted">No matching tool found</div>`;
        return;
    }

    matches.forEach((tool, idx) => {
        const item = document.createElement('div');
        item.className = `spotlight-item ${idx === 0 ? 'active' : ''}`;
        item.innerHTML = `
            <div class="w-8 h-8 rounded-lg bg-theme-accent-light text-accent flex items-center justify-center text-sm">
                <i class="fa-solid ${tool.icon}"></i>
            </div>
            <div class="flex-1 min-w-0">
                <p class="font-bold text-xs text-main truncate">${tool.title}</p>
                <p class="text-[10px] text-muted truncate">${tool.desc}</p>
            </div>
            <i class="fa-solid fa-arrow-turn-down text-[10px] text-muted"></i>
        `;
        item.onclick = () => {
            closeSpotlight();
            navigate(tool.id);
        };
        container.appendChild(item);
    });
}

// Workspace UI State helpers
function revealWorkspace(tool) {
    const container = document.getElementById(`cont-${tool}`);
    const ws = document.getElementById(`ws-${tool}`);
    if (container) container.classList.add('workspace-active');
    if (ws) ws.classList.remove('hidden');
}

function clearWorkspace(tool) {
    const container = document.getElementById(`cont-${tool}`);
    const ws = document.getElementById(`ws-${tool}`);
    if (container) container.classList.remove('workspace-active');
    if (ws) ws.classList.add('hidden');

    const input = document.getElementById(`${tool}-file-input`);
    if (input) input.value = '';

    if (tool === 'merge') {
        state.merge.files = [];
        document.getElementById('merge-file-list').innerHTML = '';
    } else if (tool === 'img2pdf') {
        state.img2pdf.files.forEach(f => URL.revokeObjectURL(f.previewUrl));
        state.img2pdf.files = [];
        document.getElementById('img-file-list').innerHTML = '';
    } else if (tool === 'pdf2img') {
        document.getElementById('pdf2img-gallery').innerHTML = '';
        state.pdf2img.images = [];
    } else if (tool === 'imgcompress') {
        state.imgcompress.files = [];
        document.getElementById('imgcompress-list').innerHTML = '';
    } else if (tool === 'extract') {
        state.extract.selectedPages.clear();
        const eg = document.getElementById('extract-grid');
        if (eg) eg.innerHTML = '';
    } else if (tool === 'organize') {
        state.organize.pages = [];
        const og = document.getElementById('organize-grid');
        if (og) og.innerHTML = '';
    } else if (tool === 'redact') {
        state.redact.redactions = [];
    } else if (tool === 'forms') {
        const fc = document.getElementById('forms-fields-container');
        if (fc) fc.innerHTML = '';
    }
}

// Setup Drag & Drop Helper
function setupDropzone(zoneId, inputId, callback) {
    const zone = document.getElementById(zoneId);
    const input = document.getElementById(inputId);
    if (!zone || !input) return;

    zone.addEventListener('click', (e) => {
        if (e.target !== input) {
            input.click();
        }
    });

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(evt => {
        zone.addEventListener(evt, e => {
            e.preventDefault();
            e.stopPropagation();
        });
    });

    ['dragenter', 'dragover'].forEach(evt => {
        zone.addEventListener(evt, () => zone.classList.add('drag-active'));
    });

    ['dragleave', 'drop'].forEach(evt => {
        zone.addEventListener(evt, () => zone.classList.remove('drag-active'));
    });

    zone.addEventListener('drop', e => {
        input.files = e.dataTransfer.files;
        callback({ target: input });
        playSensorySound('water');
    });

    input.addEventListener('change', (e) => {
        callback(e);
        playSensorySound('water');
    });
}

// --- Notifications & Loading Overlay ---
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    const isSuccess = type === 'success';
    const icon = isSuccess ? '<i class="fa-solid fa-check text-emerald"></i>' : (type === 'info' ? '<i class="fa-solid fa-circle-info text-accent"></i>' : '<i class="fa-solid fa-triangle-exclamation text-rose"></i>');

    toast.className = 'toast-pill pointer-events-auto';
    toast.innerHTML = `
        <span class="text-sm">${icon}</span>
        <span class="font-bold text-xs truncate text-main">${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(12px)';
        toast.style.transition = 'all 0.25s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3200);
}

function showLoading(title, subtitle = 'Processing locally in your browser...') {
    const overlay = document.getElementById('loading-overlay');
    document.getElementById('loading-title').innerText = title;
    document.getElementById('loading-text').innerText = subtitle;
    overlay.classList.remove('hidden');
    overlay.classList.add('flex');
}

function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    overlay.classList.add('hidden');
    overlay.classList.remove('flex');
}

function formatBytes(bytes, decimals = 1) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// ============================================================================
// TOOL WORKSPACES
// ============================================================================

// 1. SMART PDF EDITOR
setupDropzone('dropzone-edit', 'edit-file-input', async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== 'application/pdf') {
        showToast('Please select a valid PDF file', 'error');
        return;
    }
    showLoading('Opening in PDF Studio...');
    try {
        await window.pdfEditor.loadDocument(file);
        revealWorkspace('edit');
        showToast('Document ready for editing');
    } catch (err) {
        showToast('Could not load PDF. It may be encrypted.', 'error');
    }
    hideLoading();
});

async function exportStudioPdf() {
    showLoading('Exporting edited document...');
    try {
        const bytes = await window.pdfEditor.exportEditedPdf();
        window.pdfEngine.downloadBlob(bytes, `edited_${window.pdfEditor.file.name}`);
        showToast('PDF exported successfully!');
        navigate('home');
    } catch (err) {
        showToast('Export failed.', 'error');
    }
    hideLoading();
}

// 2. MERGE DOCUMENTS
setupDropzone('dropzone-merge', 'merge-file-input', (e) => {
    const newFiles = Array.from(e.target.files).filter(f => f.type === 'application/pdf');
    if (newFiles.length > 0) {
        state.merge.files = [...state.merge.files, ...newFiles];
        revealWorkspace('merge');
        renderMergeList();
    }
    e.target.value = '';
});

function renderMergeList() {
    const listEl = document.getElementById('merge-file-list');
    const btn = document.getElementById('btn-merge');
    listEl.innerHTML = '';
    btn.disabled = state.merge.files.length < 2;

    state.merge.files.forEach((file, i) => {
        const item = document.createElement('div');
        item.className = "flex items-center justify-between p-3.5 glass-panel rounded-xl";
        item.innerHTML = `
            <div class="flex items-center gap-3 min-w-0">
                <span class="w-7 h-7 rounded-lg bg-theme-accent-light text-accent flex items-center justify-center font-bold text-xs">${i + 1}</span>
                <div class="min-w-0">
                    <p class="font-bold text-xs text-main truncate">${file.name}</p>
                    <p class="text-[10px] text-muted">${formatBytes(file.size)}</p>
                </div>
            </div>
            <div class="flex items-center gap-1.5">
                <button onclick="moveMergeFile(${i}, -1)" ${i === 0 ? 'disabled' : ''} class="p-1.5 text-muted hover:text-main disabled:opacity-30"><i class="fa-solid fa-arrow-up text-xs"></i></button>
                <button onclick="moveMergeFile(${i}, 1)" ${i === state.merge.files.length - 1 ? 'disabled' : ''} class="p-1.5 text-muted hover:text-main disabled:opacity-30"><i class="fa-solid fa-arrow-down text-xs"></i></button>
                <button onclick="removeMergeFile(${i})" class="p-1.5 text-rose"><i class="fa-solid fa-trash-can text-xs"></i></button>
            </div>
        `;
        listEl.appendChild(item);
    });
}

function moveMergeFile(index, dir) {
    const target = index + dir;
    if (target < 0 || target >= state.merge.files.length) return;
    const temp = state.merge.files[index];
    state.merge.files[index] = state.merge.files[target];
    state.merge.files[target] = temp;
    renderMergeList();
    playSensorySound('tap');
}

function removeMergeFile(index) {
    state.merge.files.splice(index, 1);
    if (state.merge.files.length === 0) clearWorkspace('merge');
    else renderMergeList();
}

async function processMerge() {
    showLoading('Merging documents...');
    try {
        const bytes = await window.pdfEngine.mergePdfs(state.merge.files);
        window.pdfEngine.downloadBlob(bytes, 'merged_document.pdf');
        showToast('Merged successfully!');
        navigate('home');
    } catch (e) {
        showToast('Merge failed.', 'error');
    }
    hideLoading();
}

// 3. SPLIT & EXTRACT
setupDropzone('dropzone-split', 'split-file-input', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    showLoading('Loading pages...');
    try {
        state.split.file = f;
        const arrayBuf = await f.arrayBuffer();
        state.split.doc = await PDFDocument.load(arrayBuf);
        state.split.pdfJsDoc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuf.slice(0)) }).promise;
        state.split.totalPages = state.split.pdfJsDoc.numPages;
        state.split.selectedPages = new Set(Array.from({ length: state.split.totalPages }, (_, i) => i));

        document.getElementById('split-filename').innerText = f.name;
        document.getElementById('split-pagecount').innerText = `${state.split.totalPages} pages total`;
        revealWorkspace('split');
        await renderSplitGrid();
    } catch (err) {
        showToast('Could not load PDF.', 'error');
    }
    hideLoading();
    e.target.value = '';
});

async function renderSplitGrid() {
    const grid = document.getElementById('split-page-grid');
    grid.innerHTML = '';
    const total = state.split.totalPages;

    for (let i = 1; i <= total; i++) {
        const card = document.createElement('div');
        const isSelected = state.split.selectedPages.has(i - 1);
        card.className = `page-thumb-card ${isSelected ? 'selected' : ''}`;
        card.onclick = () => {
            if (state.split.selectedPages.has(i - 1)) state.split.selectedPages.delete(i - 1);
            else state.split.selectedPages.add(i - 1);
            card.classList.toggle('selected');
            updateSplitSelectionSummary();
            playSensorySound('tap');
        };

        const canvas = await window.pdfEngine.renderPageToCanvas(state.split.pdfJsDoc, i, 0.35);
        canvas.className = 'page-thumb-canvas';
        card.appendChild(canvas);
        card.innerHTML += `<span class="mt-2 text-xs font-bold text-main">Page ${i}</span>`;
        grid.appendChild(card);
    }
    updateSplitSelectionSummary();
}

function updateSplitSelectionSummary() {
    const count = state.split.selectedPages.size;
    const indicator = document.getElementById('split-selection-count');
    if (indicator) indicator.innerText = `${count} pages selected`;
    const btn = document.getElementById('btn-split');
    if (btn) btn.disabled = count === 0;
}

function selectSplitPreset(type) {
    const total = state.split.totalPages;
    state.split.selectedPages.clear();
    for (let i = 0; i < total; i++) {
        if (type === 'all') state.split.selectedPages.add(i);
        else if (type === 'even' && (i + 1) % 2 === 0) state.split.selectedPages.add(i);
        else if (type === 'odd' && (i + 1) % 2 !== 0) state.split.selectedPages.add(i);
    }
    const cards = document.querySelectorAll('#split-page-grid .page-thumb-card');
    cards.forEach((card, idx) => {
        if (state.split.selectedPages.has(idx)) card.classList.add('selected');
        else card.classList.remove('selected');
    });
    updateSplitSelectionSummary();
    playSensorySound('tap');
}

async function processSplit() {
    const indices = Array.from(state.split.selectedPages).sort((a, b) => a - b);
    if (indices.length === 0) {
        showToast('Please select at least 1 page', 'error');
        return;
    }
    showLoading('Extracting pages...');
    try {
        const arrayBuf = await state.split.file.arrayBuffer();
        const bytes = await window.pdfEngine.splitPdf(arrayBuf, indices);
        window.pdfEngine.downloadBlob(bytes, `extracted_${state.split.file.name}`);
        showToast('Extracted successfully!');
        navigate('home');
    } catch (err) {
        showToast('Extraction failed.', 'error');
    }
    hideLoading();
}

// 4. DELETE PAGES
setupDropzone('dropzone-delete', 'delete-file-input', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    showLoading('Loading pages...');
    try {
        state.delete.file = f;
        const arrayBuf = await f.arrayBuffer();
        state.delete.doc = await PDFDocument.load(arrayBuf);
        state.delete.pdfJsDoc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuf.slice(0)) }).promise;
        state.delete.totalPages = state.delete.pdfJsDoc.numPages;
        state.delete.markedPages = new Set();

        document.getElementById('delete-filename').innerText = f.name;
        document.getElementById('delete-pagecount').innerText = `${state.delete.totalPages} pages total`;
        revealWorkspace('delete');
        await renderDeleteGrid();
    } catch (err) {
        showToast('Failed to load PDF.', 'error');
    }
    hideLoading();
    e.target.value = '';
});

async function renderDeleteGrid() {
    const grid = document.getElementById('delete-page-grid');
    grid.innerHTML = '';
    const total = state.delete.totalPages;

    for (let i = 1; i <= total; i++) {
        const card = document.createElement('div');
        const isMarked = state.delete.markedPages.has(i - 1);
        card.className = `page-thumb-card ${isMarked ? 'deleted' : ''}`;
        card.onclick = () => {
            if (state.delete.markedPages.has(i - 1)) state.delete.markedPages.delete(i - 1);
            else state.delete.markedPages.add(i - 1);
            card.classList.toggle('deleted');
            updateDeleteSummary();
            playSensorySound('tap');
        };

        const canvas = await window.pdfEngine.renderPageToCanvas(state.delete.pdfJsDoc, i, 0.35);
        canvas.className = 'page-thumb-canvas';
        card.appendChild(canvas);
        card.innerHTML += `<span class="mt-2 text-xs font-bold text-main">Page ${i}</span>`;
        grid.appendChild(card);
    }
    updateDeleteSummary();
}

function updateDeleteSummary() {
    const count = state.delete.markedPages.size;
    const indicator = document.getElementById('delete-summary');
    if (indicator) indicator.innerText = `${count} pages marked for deletion`;
    const btn = document.getElementById('btn-delete');
    if (btn) btn.disabled = count === 0;
}

async function processDelete() {
    const indices = Array.from(state.delete.markedPages);
    if (indices.length >= state.delete.totalPages) {
        showToast('You cannot delete every page!', 'error');
        return;
    }
    showLoading('Removing pages...');
    try {
        const arrayBuf = await state.delete.file.arrayBuffer();
        const bytes = await window.pdfEngine.deletePages(arrayBuf, indices);
        window.pdfEngine.downloadBlob(bytes, `trimmed_${state.delete.file.name}`);
        showToast('Pages deleted successfully!');
        navigate('home');
    } catch (e) {
        showToast('Delete failed.', 'error');
    }
    hideLoading();
}

// 5. ROTATE PAGES
setupDropzone('dropzone-rotate', 'rotate-file-input', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    showLoading('Loading pages...');
    try {
        state.rotate.file = f;
        const arrayBuf = await f.arrayBuffer();
        state.rotate.doc = await PDFDocument.load(arrayBuf);
        state.rotate.pdfJsDoc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuf.slice(0)) }).promise;
        state.rotate.totalPages = state.rotate.pdfJsDoc.numPages;
        state.rotate.rotationMap = {};

        revealWorkspace('rotate');
        await renderRotateGrid();
    } catch (err) {
        showToast('Could not load PDF.', 'error');
    }
    hideLoading();
    e.target.value = '';
});

async function renderRotateGrid() {
    const grid = document.getElementById('rotate-page-grid');
    grid.innerHTML = '';
    const total = state.rotate.totalPages;

    for (let i = 1; i <= total; i++) {
        const card = document.createElement('div');
        card.className = 'page-thumb-card';

        const canvas = await window.pdfEngine.renderPageToCanvas(state.rotate.pdfJsDoc, i, 0.35);
        canvas.className = 'page-thumb-canvas';
        canvas.id = `rotate-canvas-${i - 1}`;

        card.appendChild(canvas);
        card.innerHTML += `
            <div class="flex items-center justify-between w-full mt-2 px-1">
                <span class="text-xs font-bold text-main">Page ${i}</span>
                <div class="flex gap-1">
                    <button onclick="rotateSinglePage(${i - 1}, -90)" class="p-1 rounded text-accent" title="Rotate Left 90°"><i class="fa-solid fa-rotate-left text-xs"></i></button>
                    <button onclick="rotateSinglePage(${i - 1}, 90)" class="p-1 rounded text-accent" title="Rotate Right 90°"><i class="fa-solid fa-rotate-right text-xs"></i></button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    }
}

function rotateSinglePage(pageIdx, degrees) {
    const current = state.rotate.rotationMap[pageIdx] || 0;
    const next = (current + degrees + 360) % 360;
    state.rotate.rotationMap[pageIdx] = next;

    const canvas = document.getElementById(`rotate-canvas-${pageIdx}`);
    if (canvas) canvas.style.transform = `rotate(${next}deg)`;
    playSensorySound('tap');
}

function rotateAllPages(degrees) {
    for (let i = 0; i < state.rotate.totalPages; i++) {
        rotateSinglePage(i, degrees);
    }
}

async function processRotate() {
    showLoading('Rotating pages...');
    try {
        const arrayBuf = await state.rotate.file.arrayBuffer();
        const bytes = await window.pdfEngine.rotatePages(arrayBuf, state.rotate.rotationMap);
        window.pdfEngine.downloadBlob(bytes, `rotated_${state.rotate.file.name}`);
        showToast('Rotated successfully!');
        navigate('home');
    } catch (e) {
        showToast('Rotation failed.', 'error');
    }
    hideLoading();
}

// 6. CROP & TRIM MARGINS (NEW)
setupDropzone('dropzone-crop', 'crop-file-input', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    showLoading('Loading PDF for Crop...');
    try {
        state.crop.file = f;
        const arrayBuf = await f.arrayBuffer();
        state.crop.pdfJsDoc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuf.slice(0)) }).promise;
        revealWorkspace('crop');
        renderCropPreview();
    } catch (err) {
        showToast('Could not load PDF.', 'error');
    }
    hideLoading();
    e.target.value = '';
});

async function renderCropPreview() {
    const canvas = await window.pdfEngine.renderPageToCanvas(state.crop.pdfJsDoc, 1, 0.6);
    const wrap = document.getElementById('crop-preview-wrap');
    if (!wrap) return;
    wrap.innerHTML = '';
    canvas.className = "rounded-lg border shadow-sm max-w-full";
    wrap.appendChild(canvas);
}

async function processCrop() {
    const top = parseInt(document.getElementById('crop-top').value, 10) || 0;
    const right = parseInt(document.getElementById('crop-right').value, 10) || 0;
    const bottom = parseInt(document.getElementById('crop-bottom').value, 10) || 0;
    const left = parseInt(document.getElementById('crop-left').value, 10) || 0;

    showLoading('Trimming margins...');
    try {
        const arrayBuf = await state.crop.file.arrayBuffer();
        const bytes = await window.pdfEngine.cropPdf(arrayBuf, { top, right, bottom, left });
        window.pdfEngine.downloadBlob(bytes, `cropped_${state.crop.file.name}`);
        showToast('Cropped successfully!');
        navigate('home');
    } catch (e) {
        showToast('Crop failed.', 'error');
    }
    hideLoading();
}

// 7. COMPARE PDFS (DIFF) (NEW)
setupDropzone('dropzone-compare-a', 'compare-file-a', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    state.compare.fileA = f;
    const arrayBuf = await f.arrayBuffer();
    state.compare.docA = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuf.slice(0)) }).promise;
    state.compare.totalA = state.compare.docA.numPages;
    state.compare.pageA = 1;
    checkAndRenderCompare();
});

setupDropzone('dropzone-compare-b', 'compare-file-b', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    state.compare.fileB = f;
    const arrayBuf = await f.arrayBuffer();
    state.compare.docB = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuf.slice(0)) }).promise;
    state.compare.totalB = state.compare.docB.numPages;
    state.compare.pageB = 1;
    checkAndRenderCompare();
});

async function checkAndRenderCompare() {
    if (state.compare.docA && state.compare.docB) {
        revealWorkspace('compare');
        renderComparePages();
    }
}

async function renderComparePages() {
    const wrapA = document.getElementById('compare-canvas-a');
    const wrapB = document.getElementById('compare-canvas-b');
    if (!wrapA || !wrapB) return;

    wrapA.innerHTML = '';
    wrapB.innerHTML = '';

    const canvasA = await window.pdfEngine.renderPageToCanvas(state.compare.docA, state.compare.pageA, 0.7);
    const canvasB = await window.pdfEngine.renderPageToCanvas(state.compare.docB, state.compare.pageB, 0.7);
    canvasA.className = "rounded-lg border shadow-sm w-full";
    canvasB.className = "rounded-lg border shadow-sm w-full";

    wrapA.appendChild(canvasA);
    wrapB.appendChild(canvasB);

    document.getElementById('compare-indicator-a').innerText = `Doc A: Page ${state.compare.pageA} / ${state.compare.totalA}`;
    document.getElementById('compare-indicator-b').innerText = `Doc B: Page ${state.compare.pageB} / ${state.compare.totalB}`;
}

function changeComparePage(delta) {
    if (state.compare.sync) {
        state.compare.pageA = Math.min(state.compare.totalA, Math.max(1, state.compare.pageA + delta));
        state.compare.pageB = Math.min(state.compare.totalB, Math.max(1, state.compare.pageB + delta));
    }
    renderComparePages();
    playSensorySound('tap');
}

// 8. PDF AUDIO READER / READ ALOUD (TTS) (NEW)
setupDropzone('dropzone-tts', 'tts-file-input', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    showLoading('Extracting text for speech...');
    try {
        state.tts.file = f;
        const arrayBuf = await f.arrayBuffer();
        state.tts.pdfJsDoc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuf.slice(0)) }).promise;
        state.tts.totalPages = state.tts.pdfJsDoc.numPages;
        state.tts.pageNum = 1;
        revealWorkspace('tts');
        loadTtsPage(1);
    } catch (err) {
        showToast('Could not load text.', 'error');
    }
    hideLoading();
    e.target.value = '';
});

async function loadTtsPage(num) {
    state.tts.pageNum = num;
    document.getElementById('tts-page-indicator').innerText = `Page ${num} / ${state.tts.totalPages}`;
    const page = await state.tts.pdfJsDoc.getPage(num);
    const content = await page.getTextContent();
    const text = content.items.map(it => it.str).join(' ');
    document.getElementById('tts-text-preview').value = text;
}

function playTtsSpeech() {
    const text = document.getElementById('tts-text-preview').value.trim();
    if (!text) {
        showToast('No text on this page to read', 'info');
        return;
    }
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        const rate = parseFloat(document.getElementById('tts-rate').value) || 1.0;
        utter.rate = rate;
        utter.onend = () => {
            state.tts.isSpeaking = false;
            document.getElementById('btn-tts-play').innerHTML = '<i class="fa-solid fa-play mr-1"></i> Read Page';
        };
        window.speechSynthesis.speak(utter);
        state.tts.isSpeaking = true;
        document.getElementById('btn-tts-play').innerHTML = '<i class="fa-solid fa-pause mr-1"></i> Pause';
    }
}

function stopSpeaking() {
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        state.tts.isSpeaking = false;
        const btn = document.getElementById('btn-tts-play');
        if (btn) btn.innerHTML = '<i class="fa-solid fa-play mr-1"></i> Read Page';
    }
}

function changeTtsPage(delta) {
    stopSpeaking();
    const next = state.tts.pageNum + delta;
    if (next >= 1 && next <= state.tts.totalPages) {
        loadTtsPage(next);
    }
}

// 9. BATES NUMBERING (NEW)
setupDropzone('dropzone-bates', 'bates-file-input', (e) => {
    const f = e.target.files[0];
    if (!f) return;
    state.bates.file = f;
    revealWorkspace('bates');
    e.target.value = '';
});

async function processBatesNumbering() {
    const prefix = document.getElementById('bates-prefix').value || 'DOC-';
    const startNum = parseInt(document.getElementById('bates-start').value, 10) || 1;
    const digits = parseInt(document.getElementById('bates-digits').value, 10) || 6;
    const position = document.getElementById('bates-position').value || 'bottom-right';

    showLoading('Stamping Bates indices...');
    try {
        const arrayBuf = await state.bates.file.arrayBuffer();
        const bytes = await window.pdfEngine.applyBatesNumbering(arrayBuf, { prefix, startNum, digits, position });
        window.pdfEngine.downloadBlob(bytes, `bates_${state.bates.file.name}`);
        showToast('Bates numbering applied!');
        navigate('home');
    } catch (e) {
        showToast('Bates stamping failed.', 'error');
    }
    hideLoading();
}

// 10. CERTIFICATE & AWARD GENERATOR (NEW)
async function processCertificateGen() {
    const recipientName = document.getElementById('cert-name').value.trim() || 'Jane Doe';
    const awardTitle = document.getElementById('cert-title').value.trim() || 'Certificate of Completion';
    const issuer = document.getElementById('cert-issuer').value.trim() || 'Academy Board';
    const date = document.getElementById('cert-date').value.trim() || 'October 2026';
    const signatureText = document.getElementById('cert-signature').value.trim() || 'Authorized Signature';

    showLoading('Designing certificate...');
    try {
        const bytes = await window.pdfEngine.generateCertificate({ recipientName, awardTitle, issuer, date, signatureText });
        window.pdfEngine.downloadBlob(bytes, `${recipientName.replace(/\s+/g, '_')}_Certificate.pdf`);
        showToast('Award certificate downloaded!');
        navigate('home');
    } catch (e) {
        showToast('Certificate creation failed.', 'error');
    }
    hideLoading();
}

// 11. CAMERA DOCUMENT SCANNER (NEW & BULLETPROOF)
function handleScannerFileInput(event) {
    const files = event.target.files;
    if (files && files.length > 0) {
        addScannerFiles(Array.from(files));
    }
    event.target.value = '';
}

async function addScannerFiles(fileList) {
    if (!fileList || fileList.length === 0) return;
    for (const f of fileList) {
        if (!f.type.startsWith('image/')) continue;
        const blob = f;
        const url = URL.createObjectURL(blob);
        state.scanner.capturedPages.push({ blob, url, rotation: 0 });
    }
    revealWorkspace('scanner');
    renderScannerPages();
    playSensorySound('tap');
    showToast(`Added ${fileList.length} page(s) to scanner`);
}

async function startCameraScanner() {
    const video = document.getElementById('scanner-video');
    const webcamBox = document.getElementById('scanner-webcam-box');
    try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Webcam stream is restricted by browser security policies on local file:// origin. Please use "Take Photo (Camera)" or "Upload Photos" below.');
        }
        state.scanner.stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } }
        });
        video.srcObject = state.scanner.stream;
        video.play();
        if (webcamBox) webcamBox.classList.remove('hidden');
        revealWorkspace('scanner');
        renderScannerPages();
    } catch (err) {
        console.warn('Webcam stream failed:', err);
        showToast(err.message || 'Camera stream blocked. Launching direct camera capture...', 'error');
        const snap = document.getElementById('scanner-snap-input');
        if (snap) snap.click();
    }
}

function stopCameraScanner() {
    if (state.scanner.stream) {
        state.scanner.stream.getTracks().forEach(track => track.stop());
        state.scanner.stream = null;
    }
    const webcamBox = document.getElementById('scanner-webcam-box');
    if (webcamBox) webcamBox.classList.add('hidden');
}

function captureScannerPage() {
    const video = document.getElementById('scanner-video');
    if (!video || !video.videoWidth) {
        showToast('Webcam not active or video not ready.', 'error');
        return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
        state.scanner.capturedPages.push({ blob, url: URL.createObjectURL(blob), rotation: 0 });
        renderScannerPages();
        playSensorySound('tap');
        showToast('Captured page from camera!');
    }, 'image/png');
}

function moveScannerPage(idx, dir) {
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= state.scanner.capturedPages.length) return;
    const temp = state.scanner.capturedPages[idx];
    state.scanner.capturedPages[idx] = state.scanner.capturedPages[targetIdx];
    state.scanner.capturedPages[targetIdx] = temp;
    renderScannerPages();
    playSensorySound('tap');
}

function rotateScannerPage(idx) {
    if (state.scanner.capturedPages[idx]) {
        state.scanner.capturedPages[idx].rotation = (state.scanner.capturedPages[idx].rotation + 90) % 360;
        renderScannerPages();
        playSensorySound('tap');
    }
}

function deleteScannerPage(idx) {
    if (state.scanner.capturedPages[idx]) {
        URL.revokeObjectURL(state.scanner.capturedPages[idx].url);
        state.scanner.capturedPages.splice(idx, 1);
        renderScannerPages();
        playSensorySound('tap');
    }
}

function clearAllScans() {
    if (confirm('Are you sure you want to clear all scanned pages?')) {
        state.scanner.capturedPages.forEach(p => URL.revokeObjectURL(p.url));
        state.scanner.capturedPages = [];
        renderScannerPages();
        playSensorySound('tap');
    }
}

function renderScannerPages() {
    const list = document.getElementById('scanner-pages-grid');
    const countEl = document.getElementById('scanner-page-count');
    const compileBtn = document.getElementById('btn-compile-scans');
    const statusEl = document.getElementById('scanner-status-text');
    if (!list) return;

    list.innerHTML = '';
    const total = state.scanner.capturedPages.length;
    if (countEl) countEl.textContent = total;

    if (total === 0) {
        list.innerHTML = `
            <div class="col-span-full py-8 text-center text-xs text-muted border-2 border-dashed border-border/40 rounded-xl">
                <i class="fa-solid fa-camera text-2xl mb-2 opacity-50 block"></i>
                No pages scanned yet. Click "Take Photo" or "Upload Photos" above.
            </div>
        `;
        if (compileBtn) compileBtn.disabled = true;
        if (statusEl) statusEl.textContent = 'Add pages to compile';
        return;
    }

    state.scanner.capturedPages.forEach((item, idx) => {
        const card = document.createElement('div');
        card.className = "relative group rounded-xl overflow-hidden border border-border/60 bg-surface/80 shadow-sm aspect-[1/1.4] flex flex-col justify-between";
        const rotStyle = item.rotation ? `style="transform: rotate(${item.rotation}deg);"` : '';
        card.innerHTML = `
            <div class="w-full h-full flex items-center justify-center p-1 bg-surface-dark overflow-hidden">
                <img src="${item.url}" class="max-w-full max-h-full object-contain transition-transform duration-200" ${rotStyle}>
            </div>
            <div class="absolute top-1 left-1 bg-black/70 backdrop-blur text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                #${idx + 1}
            </div>
            <div class="absolute bottom-1 left-1 flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                <button onclick="moveScannerPage(${idx}, -1)" ${idx === 0 ? 'disabled class="w-6 h-6 rounded bg-black/30 text-white/40 flex items-center justify-center text-[10px] cursor-not-allowed"' : 'class="w-6 h-6 rounded bg-black/60 hover:bg-black/90 text-white flex items-center justify-center text-[10px]"'} title="Move Left">
                    <i class="fa-solid fa-chevron-left"></i>
                </button>
                <button onclick="moveScannerPage(${idx}, 1)" ${idx === total - 1 ? 'disabled class="w-6 h-6 rounded bg-black/30 text-white/40 flex items-center justify-center text-[10px] cursor-not-allowed"' : 'class="w-6 h-6 rounded bg-black/60 hover:bg-black/90 text-white flex items-center justify-center text-[10px]"'} title="Move Right">
                    <i class="fa-solid fa-chevron-right"></i>
                </button>
            </div>
            <div class="absolute bottom-1 right-1 flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                <button onclick="rotateScannerPage(${idx})" class="w-6 h-6 rounded bg-black/60 hover:bg-black/90 text-white flex items-center justify-center text-[10px]" title="Rotate 90 deg">
                    <i class="fa-solid fa-rotate-right"></i>
                </button>
                <button onclick="deleteScannerPage(${idx})" class="w-6 h-6 rounded bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center text-[10px]" title="Delete page">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;
        list.appendChild(card);
    });

    if (compileBtn) compileBtn.disabled = false;
    if (statusEl) statusEl.textContent = `${total} page(s) ready to compile`;
}

async function applyScannerFilter(blob, filterType, rotation = 0) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const rot = (rotation % 360 + 360) % 360;
            if (rot === 90 || rot === 270) {
                canvas.width = img.height;
                canvas.height = img.width;
            } else {
                canvas.width = img.width;
                canvas.height = img.height;
            }
            const ctx = canvas.getContext('2d');
            ctx.save();
            if (rot === 90) {
                ctx.translate(canvas.width, 0);
                ctx.rotate(Math.PI / 2);
            } else if (rot === 180) {
                ctx.translate(canvas.width, canvas.height);
                ctx.rotate(Math.PI);
            } else if (rot === 270) {
                ctx.translate(0, canvas.height);
                ctx.rotate(-Math.PI / 2);
            }
            ctx.drawImage(img, 0, 0);
            ctx.restore();

            if (filterType !== 'original') {
                const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const d = imgData.data;
                for (let i = 0; i < d.length; i += 4) {
                    const r = d[i], g = d[i + 1], b = d[i + 2];
                    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                    if (filterType === 'grayscale') {
                        d[i] = d[i + 1] = d[i + 2] = gray;
                    } else if (filterType === 'doc') {
                        // Magic Document Filter: Whitens paper background and darkens ink text
                        let v = gray;
                        if (v > 135) v = Math.min(255, v + (255 - v) * 0.75);
                        else if (v < 115) v = Math.max(0, v * 0.65);
                        d[i] = d[i + 1] = d[i + 2] = v;
                    } else if (filterType === 'mono') {
                        // High-contrast clean 1-bit monochrome photocopy
                        const v = gray > 130 ? 255 : 0;
                        d[i] = d[i + 1] = d[i + 2] = v;
                    } else if (filterType === 'color') {
                        // Enhanced Color: Whitens background paper while preserving vibrant logos/stamps
                        if (gray > 175) {
                            d[i] = Math.min(255, r + 45);
                            d[i + 1] = Math.min(255, g + 45);
                            d[i + 2] = Math.min(255, b + 45);
                        } else {
                            d[i] = Math.max(0, Math.min(255, r * 1.15));
                            d[i + 1] = Math.max(0, Math.min(255, g * 1.15));
                            d[i + 2] = Math.max(0, Math.min(255, b * 1.15));
                        }
                    }
                }
                ctx.putImageData(imgData, 0, 0);
            }
            canvas.toBlob((b) => resolve(b || blob), 'image/png');
        };
        img.onerror = () => resolve(blob);
        img.src = URL.createObjectURL(blob);
    });
}

async function compileScansToPdf() {
    if (state.scanner.capturedPages.length === 0) return;
    const filter = document.getElementById('scanner-filter')?.value || 'original';
    const pageSize = document.getElementById('scanner-page-size')?.value || 'a4';
    const margin = document.getElementById('scanner-margin')?.value || 'none';

    showLoading('Processing & compiling scans...', 'Applying document filter...');
    try {
        const processedFiles = [];
        for (let i = 0; i < state.scanner.capturedPages.length; i++) {
            const page = state.scanner.capturedPages[i];
            const processedBlob = await applyScannerFilter(page.blob, filter, page.rotation);
            processedFiles.push(new File([processedBlob], `scan_page_${i + 1}.png`, { type: 'image/png' }));
        }

        const marginVal = margin === 'standard' ? 36 : 0;
        const bytes = await window.pdfEngine.imagesToPdf(processedFiles, {
            pageSize: pageSize === 'auto' ? 'fit' : pageSize,
            margin: marginVal
        });

        window.pdfEngine.downloadBlob(bytes, 'camera_document_scan.pdf');
        stopCameraScanner();
        showToast('Document created from camera scans!');
        navigate('home');
    } catch (e) {
        console.error(e);
        showToast('Compilation failed: ' + e.message, 'error');
    }
    hideLoading();
}

// 12. COMPRESS PDF
setupDropzone('dropzone-compress', 'compress-file-input', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    showLoading('Analyzing PDF...');
    try {
        state.compress.file = f;
        state.compress.originalSize = f.size;
        const arrayBuf = await f.arrayBuffer();
        state.compress.pdfJsDoc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuf.slice(0)) }).promise;
        document.getElementById('compress-orig-size').innerText = formatBytes(f.size);
        revealWorkspace('compress');
    } catch (err) {
        showToast('Could not load PDF.', 'error');
    }
    hideLoading();
    e.target.value = '';
});

async function processCompress() {
    const level = document.getElementById('compress-level').value;
    let scale = 1.35;
    let jpegQuality = 0.65;
    if (level === 'high') { scale = 1.1; jpegQuality = 0.5; }
    else if (level === 'max') { scale = 0.9; jpegQuality = 0.38; }

    showLoading('Compressing document...', 'Optimizing stream streams & images...');
    try {
        const bytes = await window.pdfEngine.compressPdf(state.compress.pdfJsDoc, { scale, jpegQuality });
        const newSize = bytes.byteLength;
        const diff = Math.max(0, Math.round(((state.compress.originalSize - newSize) / state.compress.originalSize) * 100));

        window.pdfEngine.downloadBlob(bytes, `compressed_${state.compress.file.name}`);
        showToast(`Compressed by ${diff}%! Downloaded.`);
        navigate('home');
    } catch (e) {
        showToast('Compression failed.', 'error');
    }
    hideLoading();
}

// 13. COMPRESS IMAGES
setupDropzone('dropzone-imgcompress', 'imgcompress-file-input', (e) => {
    const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
    if (files.length > 0) {
        state.imgcompress.files = files;
        revealWorkspace('imgcompress');
        renderImgCompressPreview();
    }
    e.target.value = '';
});

function renderImgCompressPreview() {
    const listEl = document.getElementById('imgcompress-list');
    listEl.innerHTML = '';
    state.imgcompress.files.forEach((file) => {
        const card = document.createElement('div');
        card.className = "flex items-center justify-between p-2.5 glass-panel rounded-xl";
        card.innerHTML = `
            <div class="flex items-center gap-2">
                <i class="fa-regular fa-image text-accent"></i>
                <span class="text-xs font-bold text-main truncate max-w-xs">${file.name}</span>
            </div>
            <span class="text-xs text-muted font-mono">${formatBytes(file.size)}</span>
        `;
        listEl.appendChild(card);
    });
}

async function processImageCompression() {
    const quality = parseFloat(document.getElementById('img-quality-slider').value) || 0.7;
    const maxDim = parseInt(document.getElementById('img-max-dim').value, 10) || 1920;

    showLoading('Compressing images...');
    try {
        for (let file of state.imgcompress.files) {
            const blob = await window.pdfEngine.compressImage(file, { quality, maxDim });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `compressed_${file.name}`;
            a.click();
        }
        showToast('Images compressed successfully!');
        navigate('home');
    } catch (e) {
        showToast('Image compression failed.', 'error');
    }
    hideLoading();
}

// 14. EXCEL / CSV TO PDF TABLE
setupDropzone('dropzone-csv2pdf', 'csv2pdf-file-input', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        state.csv2pdf.file = file;
        state.csv2pdf.csvText = event.target.result;
        document.getElementById('csv-preview-text').value = state.csv2pdf.csvText.split('\n').slice(0, 10).join('\n') + '\n...';
        revealWorkspace('csv2pdf');
    };
    reader.readAsText(file);
    e.target.value = '';
});

async function processCsvToPdf() {
    const title = document.getElementById('csv-doc-title').value.trim() || 'Data Table';
    showLoading('Formatting table to PDF...');
    try {
        const bytes = await window.pdfEngine.csvToPdf(state.csv2pdf.csvText, title);
        window.pdfEngine.downloadBlob(bytes, `${title.replace(/\s+/g, '_')}.pdf`);
        showToast('Spreadsheet converted to PDF table!');
        navigate('home');
    } catch (e) {
        showToast(e.message || 'Conversion failed.', 'error');
    }
    hideLoading();
}

// 15. PDF TABLE TO CSV / EXCEL
setupDropzone('dropzone-pdf2csv', 'pdf2csv-file-input', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    showLoading('Extracting tabular data...');
    try {
        state.pdf2csv.file = f;
        const arrayBuf = await f.arrayBuffer();
        state.pdf2csv.pdfJsDoc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuf.slice(0)) }).promise;
        const csv = await window.pdfEngine.pdfToCsv(state.pdf2csv.pdfJsDoc);
        state.pdf2csv.extractedCsv = csv;
        document.getElementById('pdf2csv-preview').value = csv.split('\n').slice(0, 15).join('\n') + '\n...';
        revealWorkspace('pdf2csv');
    } catch (e) {
        showToast('Could not extract table.', 'error');
    }
    hideLoading();
    e.target.value = '';
});

function downloadPdfToCsv() {
    if (!state.pdf2csv.extractedCsv) return;
    window.pdfEngine.downloadBlob(state.pdf2csv.extractedCsv, `table_${state.pdf2csv.file.name}.csv`, 'text/csv');
    showToast('Downloaded CSV for Excel & Numbers!');
    navigate('home');
}

// 16. PRESENTATION SLIDES (MARKDOWN/TEXT) TO PDF
async function processSlidesToPdf() {
    const text = document.getElementById('slides-input-text').value.trim();
    if (!text) {
        showToast('Please enter slide content.', 'error');
        return;
    }
    showLoading('Generating slide deck...');
    try {
        const bytes = await window.pdfEngine.textToSlideDeck(text);
        window.pdfEngine.downloadBlob(bytes, 'presentation_slides.pdf');
        showToast('Slide deck created successfully!');
        navigate('home');
    } catch (e) {
        showToast('Failed to create slides.', 'error');
    }
    hideLoading();
}

// 17. MARKDOWN / NOTES TO A4 PDF
async function processTextToPdf() {
    const text = document.getElementById('text2pdf-input').value.trim();
    const title = document.getElementById('text2pdf-title').value.trim() || 'Document';
    if (!text) {
        showToast('Please enter document text.', 'error');
        return;
    }
    showLoading('Formatting document...');
    try {
        const bytes = await window.pdfEngine.textToDocumentPdf(text, title);
        window.pdfEngine.downloadBlob(bytes, `${title.replace(/\s+/g, '_')}.pdf`);
        showToast('Document created successfully!');
        navigate('home');
    } catch (e) {
        showToast('Failed to format document.', 'error');
    }
    hideLoading();
}

// 18. WATERMARK STUDIO
setupDropzone('dropzone-watermark', 'watermark-file-input', (e) => {
    const f = e.target.files[0];
    if (!f) return;
    state.watermark.file = f;
    revealWorkspace('watermark');
    e.target.value = '';
});

async function processWatermark() {
    const text = document.getElementById('wm-text').value.trim() || 'CONFIDENTIAL';
    const fontSize = parseInt(document.getElementById('wm-size').value, 10) || 50;
    const rotation = parseInt(document.getElementById('wm-rotation').value, 10) || 45;
    const opacity = parseFloat(document.getElementById('wm-opacity').value) || 0.25;
    const color = document.getElementById('wm-color').value || '#64748b';
    const tiling = document.getElementById('wm-tiling').checked;

    showLoading('Applying watermark...');
    try {
        const arrayBuf = await state.watermark.file.arrayBuffer();
        const bytes = await window.pdfEngine.applyWatermark(arrayBuf, { text, fontSize, rotation, opacity, color, tiling });
        window.pdfEngine.downloadBlob(bytes, `watermarked_${state.watermark.file.name}`);
        showToast('Watermark applied!');
        navigate('home');
    } catch (e) {
        showToast('Watermarking failed.', 'error');
    }
    hideLoading();
}

// 19. PAGE NUMBERS
setupDropzone('dropzone-page-numbers', 'page-numbers-file-input', (e) => {
    const f = e.target.files[0];
    if (!f) return;
    state['page-numbers'].file = f;
    revealWorkspace('page-numbers');
    e.target.value = '';
});

async function processPageNumbers() {
    const position = document.getElementById('pn-position').value;
    const format = document.getElementById('pn-format').value;
    const skipFirst = document.getElementById('pn-skip-first').checked;

    showLoading('Stamping page numbers...');
    try {
        const arrayBuf = await state['page-numbers'].file.arrayBuffer();
        const bytes = await window.pdfEngine.applyPageNumbers(arrayBuf, { position, format, skipFirst });
        window.pdfEngine.downloadBlob(bytes, `numbered_${state['page-numbers'].file.name}`);
        showToast('Page numbers applied!');
        navigate('home');
    } catch (e) {
        showToast('Page numbering failed.', 'error');
    }
    hideLoading();
}

// 20. IMAGES TO PDF
setupDropzone('dropzone-img', 'img-file-input', (e) => {
    const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
    if (files.length > 0) {
        files.forEach(f => {
            f.previewUrl = URL.createObjectURL(f);
            state.img2pdf.files.push(f);
        });
        revealWorkspace('img2pdf');
        renderImgList();
    }
    e.target.value = '';
});

function renderImgList() {
    const listEl = document.getElementById('img-file-list');
    listEl.innerHTML = '';
    state.img2pdf.files.forEach((file, idx) => {
        const item = document.createElement('div');
        item.className = "relative rounded-xl overflow-hidden aspect-square border border-card bg-surface";
        item.innerHTML = `
            <img src="${file.previewUrl}" class="w-full h-full object-cover">
            <button onclick="removeImg(${idx})" class="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose text-white flex items-center justify-center text-xs">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        `;
        listEl.appendChild(item);
    });
}

function removeImg(idx) {
    URL.revokeObjectURL(state.img2pdf.files[idx].previewUrl);
    state.img2pdf.files.splice(idx, 1);
    if (state.img2pdf.files.length === 0) clearWorkspace('img2pdf');
    else renderImgList();
}

async function processImg2Pdf() {
    const pageSize = document.getElementById('img-page-size').value;
    showLoading('Creating PDF from images...');
    try {
        const bytes = await window.pdfEngine.imagesToPdf(state.img2pdf.files, { pageSize });
        window.pdfEngine.downloadBlob(bytes, 'images_compiled.pdf');
        showToast('PDF created successfully!');
        navigate('home');
    } catch (e) {
        showToast('Conversion failed.', 'error');
    }
    hideLoading();
}

// 21. PDF TO IMAGES
setupDropzone('dropzone-pdf2img', 'pdf2img-file-input', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    showLoading('Rendering high-res images...');
    try {
        const arrayBuf = await f.arrayBuffer();
        state.pdf2img.pdfJsDoc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuf.slice(0)) }).promise;
        state.pdf2img.file = f;
        revealWorkspace('pdf2img');

        const images = await window.pdfEngine.pdfToImages(state.pdf2img.pdfJsDoc, 2.0, 'png');
        state.pdf2img.images = images;

        const gallery = document.getElementById('pdf2img-gallery');
        gallery.innerHTML = '';
        images.forEach(img => {
            const card = document.createElement('div');
            card.className = "glass-panel p-2.5 rounded-xl flex flex-col items-center gap-2";
            card.innerHTML = `
                <img src="${img.dataUrl}" class="rounded-lg w-full aspect-[1/1.4] object-contain bg-white">
                <a href="${img.dataUrl}" download="page_${img.pageNum}.png" class="btn-primary w-full py-1.5 rounded-lg text-xs font-bold text-center">
                    Page ${img.pageNum} <i class="fa-solid fa-download ml-1"></i>
                </a>
            `;
            gallery.appendChild(card);
        });
    } catch (err) {
        showToast('Failed to convert pages.', 'error');
    }
    hideLoading();
    e.target.value = '';
});

async function downloadAllImagesAsZip() {
    if (!state.pdf2img.images.length || !window.JSZip) {
        showToast('No images available', 'error');
        return;
    }
    showLoading('Packaging into ZIP...');
    try {
        const zip = new JSZip();
        state.pdf2img.images.forEach(img => {
            const base64Data = img.dataUrl.split(',')[1];
            zip.file(`page_${img.pageNum}.png`, base64Data, { base64: true });
        });
        const zipContent = await zip.generateAsync({ type: 'blob' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(zipContent);
        a.download = `${state.pdf2img.file.name}_images.zip`;
        a.click();
        showToast('ZIP downloaded!');
    } catch (e) {
        showToast('ZIP failed.', 'error');
    }
    hideLoading();
}

// 22. EXTRACT TEXT
setupDropzone('dropzone-extract-text', 'extract-text-file-input', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    showLoading('Extracting text content...');
    try {
        state['extract-text'].file = f;
        const arrayBuf = await f.arrayBuffer();
        state['extract-text'].pdfJsDoc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuf.slice(0)) }).promise;
        const text = await window.pdfEngine.extractText(state['extract-text'].pdfJsDoc);
        document.getElementById('extracted-text-area').value = text;
        revealWorkspace('extract-text');
    } catch (err) {
        showToast('Could not extract text.', 'error');
    }
    hideLoading();
    e.target.value = '';
});

function copyExtractedText() {
    const text = document.getElementById('extracted-text-area').value;
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!');
}

function downloadExtractedText(ext = 'txt') {
    const text = document.getElementById('extracted-text-area').value;
    const mime = ext === 'md' ? 'text/markdown' : 'text/plain';
    window.pdfEngine.downloadBlob(text, `extracted_text.${ext}`, mime);
    showToast(`Saved as .${ext.toUpperCase()}`);
}

// 23. GRAYSCALE & 24. INVERT
setupDropzone('dropzone-grayscale', 'grayscale-file-input', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    state.grayscale.file = f;
    const arrayBuf = await f.arrayBuffer();
    state.grayscale.pdfJsDoc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuf.slice(0)) }).promise;
    revealWorkspace('grayscale');
    e.target.value = '';
});

async function processGrayscale() {
    showLoading('Converting to Grayscale...');
    try {
        const bytes = await window.pdfEngine.convertToGrayscale(state.grayscale.pdfJsDoc);
        window.pdfEngine.downloadBlob(bytes, `grayscale_${state.grayscale.file.name}`);
        showToast('Converted to Grayscale!');
        navigate('home');
    } catch (e) {
        showToast('Conversion failed.', 'error');
    }
    hideLoading();
}

setupDropzone('dropzone-invert', 'invert-file-input', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    state.invert.file = f;
    const arrayBuf = await f.arrayBuffer();
    state.invert.pdfJsDoc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuf.slice(0)) }).promise;
    revealWorkspace('invert');
    e.target.value = '';
});

async function processInvert() {
    showLoading('Inverting colors...');
    try {
        const bytes = await window.pdfEngine.invertColors(state.invert.pdfJsDoc);
        window.pdfEngine.downloadBlob(bytes, `darkmode_${state.invert.file.name}`);
        showToast('Inverted colors!');
        navigate('home');
    } catch (e) {
        showToast('Invert failed.', 'error');
    }
    hideLoading();
}

// 25. METADATA
setupDropzone('dropzone-metadata', 'metadata-file-input', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    showLoading('Reading metadata...');
    try {
        state.metadata.file = f;
        const arrayBuf = await f.arrayBuffer();
        const meta = await window.pdfEngine.getMetadata(arrayBuf);
        document.getElementById('meta-title').value = meta.title;
        document.getElementById('meta-author').value = meta.author;
        document.getElementById('meta-subject').value = meta.subject;
        document.getElementById('meta-keywords').value = meta.keywords;
        revealWorkspace('metadata');
    } catch (err) {
        showToast('Could not read metadata.', 'error');
    }
    hideLoading();
    e.target.value = '';
});

async function processMetadata() {
    showLoading('Updating metadata...');
    try {
        const arrayBuf = await state.metadata.file.arrayBuffer();
        const bytes = await window.pdfEngine.setMetadata(arrayBuf, {
            title: document.getElementById('meta-title').value,
            author: document.getElementById('meta-author').value,
            subject: document.getElementById('meta-subject').value,
            keywords: document.getElementById('meta-keywords').value
        });
        window.pdfEngine.downloadBlob(bytes, `meta_${state.metadata.file.name}`);
        showToast('Metadata updated!');
        navigate('home');
    } catch (e) {
        showToast('Update failed.', 'error');
    }
    hideLoading();
}

async function stripAllMetadata() {
    showLoading('Scrubbing metadata...');
    try {
        const arrayBuf = await state.metadata.file.arrayBuffer();
        const bytes = await window.pdfEngine.stripMetadata(arrayBuf);
        window.pdfEngine.downloadBlob(bytes, `anonymized_${state.metadata.file.name}`);
        showToast('Metadata removed for privacy!');
        navigate('home');
    } catch (e) {
        showToast('Strip failed.', 'error');
    }
    hideLoading();
}

// 26. FLATTEN PDF
setupDropzone('dropzone-flatten', 'flatten-file-input', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    state.flatten.file = f;
    const arrayBuf = await f.arrayBuffer();
    state.flatten.pdfJsDoc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuf.slice(0)) }).promise;
    revealWorkspace('flatten');
    e.target.value = '';
});

async function processFlatten() {
    showLoading('Flattening document layers...');
    try {
        const bytes = await window.pdfEngine.flattenPdf(state.flatten.pdfJsDoc);
        window.pdfEngine.downloadBlob(bytes, `flattened_${state.flatten.file.name}`);
        showToast('Document flattened!');
        navigate('home');
    } catch (e) {
        showToast('Flatten failed.', 'error');
    }
    hideLoading();
}


// ============================================================================
// 27. EXTRACT PAGES HANDLER
// ============================================================================
setupDropzone('dropzone-extract', 'extract-file-input', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    state.extract.file = f;
    const arrayBuf = await f.arrayBuffer();
    state.extract.doc = await (window.PDFLib || PDFLib).PDFDocument.load(arrayBuf.slice(0));
    state.extract.pdfJsDoc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuf.slice(0)) }).promise;
    state.extract.totalPages = state.extract.doc.getPageCount();
    state.extract.selectedPages = new Set();

    await renderExtractGrid();
    revealWorkspace('extract');
    e.target.value = '';
});

async function renderExtractGrid() {
    const grid = document.getElementById('extract-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const total = state.extract.totalPages;

    for (let i = 1; i <= total; i++) {
        const card = document.createElement('div');
        const isSelected = state.extract.selectedPages.has(i);
        card.className = `organizer-card flex flex-col items-center cursor-pointer ${isSelected ? 'selected' : ''}`;
        
        const canvas = document.createElement('canvas');
        canvas.className = 'w-full h-auto rounded shadow-sm border mb-1.5';
        await window.pdfEngine.renderPageToCanvas(state.extract.pdfJsDoc, i, 0.28, canvas);

        const lbl = document.createElement('span');
        lbl.className = 'text-[11px] font-bold font-mono text-main';
        lbl.textContent = `Page ${i}`;

        card.appendChild(canvas);
        card.appendChild(lbl);

        card.onclick = () => {
            if (state.extract.selectedPages.has(i)) state.extract.selectedPages.delete(i);
            else state.extract.selectedPages.add(i);
            card.classList.toggle('selected');
            updateExtractBadge();
            playSensorySound('tap');
        };

        grid.appendChild(card);
    }
    updateExtractBadge();
}

function updateExtractBadge() {
    const b = document.getElementById('extract-count-badge');
    const btn = document.getElementById('btn-extract');
    const count = state.extract.selectedPages.size;
    if (b) b.textContent = `${count} Selected`;
    if (btn) btn.disabled = count === 0;
}

function selectAllExtract(select) {
    if (select) {
        for (let i = 1; i <= state.extract.totalPages; i++) state.extract.selectedPages.add(i);
    } else {
        state.extract.selectedPages.clear();
    }
    document.querySelectorAll('#extract-grid .organizer-card').forEach((card, idx) => {
        if (select) card.classList.add('selected');
        else card.classList.remove('selected');
    });
    updateExtractBadge();
}

function applyExtractRange() {
    const input = document.getElementById('extract-range-input');
    if (!input || !input.value.trim()) return;
    state.extract.selectedPages.clear();

    const parts = input.value.split(',');
    parts.forEach(part => {
        const range = part.trim().split('-');
        if (range.length === 2) {
            const start = parseInt(range[0], 10);
            const end = parseInt(range[1], 10);
            if (!isNaN(start) && !isNaN(end)) {
                for (let p = Math.min(start, end); p <= Math.max(start, end); p++) {
                    if (p >= 1 && p <= state.extract.totalPages) state.extract.selectedPages.add(p);
                }
            }
        } else if (range.length === 1) {
            const p = parseInt(range[0], 10);
            if (!isNaN(p) && p >= 1 && p <= state.extract.totalPages) state.extract.selectedPages.add(p);
        }
    });

    document.querySelectorAll('#extract-grid .organizer-card').forEach((card, idx) => {
        if (state.extract.selectedPages.has(idx + 1)) card.classList.add('selected');
        else card.classList.remove('selected');
    });
    updateExtractBadge();
    showToast(`Selected ${state.extract.selectedPages.size} pages`);
}

async function processExtract() {
    if (state.extract.selectedPages.size === 0) return;
    showLoading('Extracting selected pages...');
    try {
        const arrayBuf = await state.extract.file.arrayBuffer();
        const indices = Array.from(state.extract.selectedPages).map(p => p - 1).sort((a, b) => a - b);
        const bytes = await window.pdfEngine.splitPdf(arrayBuf, indices);
        window.pdfEngine.downloadBlob(bytes, `extracted_${state.extract.file.name}`);
        showToast('Pages extracted successfully!');
        navigate('home');
    } catch (e) {
        showToast('Extraction failed: ' + e.message, 'error');
    }
    hideLoading();
}

// ============================================================================
// 28. ORGANIZE PDF (VISUAL DRAG & REORDER GRID)
// ============================================================================
setupDropzone('dropzone-organize', 'organize-file-input', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    state.organize.file = f;
    const arrayBuf = await f.arrayBuffer();
    state.organize.doc = await (window.PDFLib || PDFLib).PDFDocument.load(arrayBuf.slice(0));
    state.organize.pdfJsDoc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuf.slice(0)) }).promise;
    state.organize.totalPages = state.organize.doc.getPageCount();
    state.organize.pages = Array.from({ length: state.organize.totalPages }, (_, i) => ({
        originalIndex: i,
        rotation: 0
    }));

    await renderOrganizeGrid();
    revealWorkspace('organize');
    e.target.value = '';
});

async function renderOrganizeGrid() {
    const grid = document.getElementById('organize-grid');
    if (!grid) return;
    grid.innerHTML = '';

    for (let i = 0; i < state.organize.pages.length; i++) {
        const item = state.organize.pages[i];
        const card = document.createElement('div');
        card.className = 'organizer-card flex flex-col items-center';

        const canvas = document.createElement('canvas');
        canvas.className = 'w-full h-auto rounded shadow-sm border mb-2';
        canvas.style.transform = `rotate(${item.rotation}deg)`;
        canvas.style.transition = 'transform 0.2s ease';
        await window.pdfEngine.renderPageToCanvas(state.organize.pdfJsDoc, item.originalIndex + 1, 0.25, canvas);

        const rowTop = document.createElement('div');
        rowTop.className = 'flex items-center justify-between w-full mb-1 text-xs font-mono font-bold';
        rowTop.innerHTML = `<span class="text-accent">#${i + 1}</span><span class="text-muted text-[10px]">(Orig: ${item.originalIndex + 1})</span>`;

        const controls = document.createElement('div');
        controls.className = 'flex items-center justify-center gap-1.5 w-full mt-1 border-t pt-1.5';
        controls.innerHTML = `
            <button onclick="shiftOrganizePage(${i}, -1)" class="w-6 h-6 rounded glass-panel flex items-center justify-center text-[10px] ${i === 0 ? 'opacity-30' : ''}" title="Move Left" ${i === 0 ? 'disabled' : ''}><i class="fa-solid fa-arrow-left"></i></button>
            <button onclick="rotateOrganizePage(${i})" class="w-6 h-6 rounded glass-panel flex items-center justify-center text-[10px] text-accent" title="Rotate 90°"><i class="fa-solid fa-rotate-right"></i></button>
            <button onclick="duplicateOrganizePage(${i})" class="w-6 h-6 rounded glass-panel flex items-center justify-center text-[10px]" title="Duplicate"><i class="fa-regular fa-copy"></i></button>
            <button onclick="deleteOrganizePage(${i})" class="w-6 h-6 rounded glass-panel flex items-center justify-center text-[10px] text-rose" title="Delete"><i class="fa-solid fa-trash"></i></button>
            <button onclick="shiftOrganizePage(${i}, 1)" class="w-6 h-6 rounded glass-panel flex items-center justify-center text-[10px] ${i === state.organize.pages.length - 1 ? 'opacity-30' : ''}" title="Move Right" ${i === state.organize.pages.length - 1 ? 'disabled' : ''}><i class="fa-solid fa-arrow-right"></i></button>
        `;

        card.appendChild(rowTop);
        card.appendChild(canvas);
        card.appendChild(controls);
        grid.appendChild(card);
    }
}

function shiftOrganizePage(idx, direction) {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= state.organize.pages.length) return;
    const temp = state.organize.pages[idx];
    state.organize.pages[idx] = state.organize.pages[targetIdx];
    state.organize.pages[targetIdx] = temp;
    renderOrganizeGrid();
    playSensorySound('tap');
}

function rotateOrganizePage(idx) {
    state.organize.pages[idx].rotation = (state.organize.pages[idx].rotation + 90) % 360;
    renderOrganizeGrid();
    playSensorySound('tap');
}

function duplicateOrganizePage(idx) {
    const item = state.organize.pages[idx];
    state.organize.pages.splice(idx + 1, 0, { ...item });
    renderOrganizeGrid();
    showToast('Page duplicated');
}

function deleteOrganizePage(idx) {
    if (state.organize.pages.length <= 1) {
        showToast('Document must contain at least one page.', 'error');
        return;
    }
    state.organize.pages.splice(idx, 1);
    renderOrganizeGrid();
    showToast('Page removed');
}

function resetOrganizeOrder() {
    state.organize.pages = Array.from({ length: state.organize.totalPages }, (_, i) => ({
        originalIndex: i,
        rotation: 0
    }));
    renderOrganizeGrid();
    showToast('Order reset');
}

async function processOrganize() {
    showLoading('Building organized document...');
    try {
        const arrayBuf = await state.organize.file.arrayBuffer();
        const srcDoc = await (window.PDFLib || PDFLib).PDFDocument.load(arrayBuf.slice(0));
        const newDoc = await PDFLib.PDFDocument.create();

        for (const item of state.organize.pages) {
            const [copied] = await newDoc.copyPages(srcDoc, [item.originalIndex]);
            if (item.rotation > 0) {
                const currentRot = copied.getRotation().angle;
                copied.setRotation(PDFLib.degrees((currentRot + item.rotation) % 360));
            }
            newDoc.addPage(copied);
        }

        const bytes = await newDoc.save();
        window.pdfEngine.downloadBlob(bytes, `organized_${state.organize.file.name}`);
        showToast('Organized PDF saved successfully!');
        navigate('home');
    } catch (e) {
        showToast('Organize failed: ' + e.message, 'error');
    }
    hideLoading();
}

// ============================================================================
// 29. REPAIR PDF HANDLER
// ============================================================================
setupDropzone('dropzone-repair', 'repair-file-input', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    state.repair.file = f;
    state.repair.buffer = await f.arrayBuffer();
    document.getElementById('repair-filename').textContent = f.name;
    revealWorkspace('repair');
    e.target.value = '';
});

async function processRepair() {
    showLoading('Rebuilding corrupted streams & xref tables...');
    try {
        const bytes = await window.pdfEngine.repairPdf(state.repair.buffer);
        window.pdfEngine.downloadBlob(bytes, `repaired_${state.repair.file.name}`);
        showToast('Document repaired and recovered successfully!');
        navigate('home');
    } catch (e) {
        showToast('Repair failed: ' + e.message, 'error');
    }
    hideLoading();
}

// ============================================================================
// 30. OCR PDF HANDLER
// ============================================================================
setupDropzone('dropzone-ocr', 'ocr-file-input', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    state.ocr.file = f;
    const arrayBuf = await f.arrayBuffer();
    state.ocr.pdfJsDoc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuf.slice(0)) }).promise;
    
    showLoading('Scanning document text layer...');
    try {
        const result = await window.pdfEngine.ocrPdf(state.ocr.pdfJsDoc);
        state.ocr.text = result.pages.map(p => `--- PAGE ${p.pageNum} ---
${p.text}`).join('\n\n');
        document.getElementById('ocr-result-text').value = state.ocr.text;
        document.getElementById('ocr-stats-badge').textContent = `Scanned ${result.totalPages} Pages (${result.totalWords} Words)`;
        revealWorkspace('ocr');
        showToast('OCR scan completed!');
    } catch (err) {
        showToast('OCR Scan failed: ' + err.message, 'error');
    }
    hideLoading();
    e.target.value = '';
});

function copyOcrText() {
    const text = document.getElementById('ocr-result-text').value;
    navigator.clipboard.writeText(text);
    showToast('OCR text copied to clipboard!');
}

function downloadOcrText() {
    const text = document.getElementById('ocr-result-text').value;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ocr_${state.ocr.file ? state.ocr.file.name.replace('.pdf', '') : 'document'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

// ============================================================================
// 31. WORD TO PDF HANDLER
// ============================================================================
setupDropzone('dropzone-word2pdf', 'word2pdf-file-input', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    state.word2pdf.file = f;
    const text = await f.text();
    document.getElementById('word2pdf-editor').value = text;
    document.getElementById('word2pdf-title').value = f.name.replace(/\.[^/.]+$/, "");
    revealWorkspace('word2pdf');
    e.target.value = '';
});

async function processWordToPdf() {
    const text = document.getElementById('word2pdf-editor').value;
    const title = document.getElementById('word2pdf-title').value || 'Document';
    if (!text.trim()) {
        showToast('Please provide text or notes content.', 'error');
        return;
    }
    showLoading('Formatting PDF document...');
    try {
        const bytes = await window.pdfEngine.wordToPdf(text, { title });
        window.pdfEngine.downloadBlob(bytes, `${title}.pdf`);
        showToast('Word document converted to PDF!');
        navigate('home');
    } catch (e) {
        showToast('Conversion failed: ' + e.message, 'error');
    }
    hideLoading();
}

// ============================================================================
// 32. PDF TO WORD (.DOCX) HANDLER
// ============================================================================
setupDropzone('dropzone-pdf2word', 'pdf2word-file-input', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    state.pdf2word.file = f;
    const arrayBuf = await f.arrayBuffer();
    state.pdf2word.pdfJsDoc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuf.slice(0)) }).promise;
    document.getElementById('pdf2word-filename').textContent = f.name;
    revealWorkspace('pdf2word');
    e.target.value = '';
});

async function processPdfToWord() {
    showLoading('Extracting document flow & building .docx...');
    try {
        const docxBytes = await window.pdfEngine.pdfToWord(state.pdf2word.pdfJsDoc);
        const blob = new Blob([docxBytes], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = state.pdf2word.file.name.replace(/\.pdf$/i, '.docx');
        a.click();
        URL.revokeObjectURL(url);
        showToast('Word document (.docx) exported successfully!');
        navigate('home');
    } catch (e) {
        showToast('Export failed: ' + e.message, 'error');
    }
    hideLoading();
}

// ============================================================================
// 33. PDF TO POWERPOINT (.PPTX) HANDLER
// ============================================================================
setupDropzone('dropzone-pdf2powerpoint', 'pdf2powerpoint-file-input', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    state.pdf2powerpoint.file = f;
    const arrayBuf = await f.arrayBuffer();
    state.pdf2powerpoint.pdfJsDoc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuf.slice(0)) }).promise;
    document.getElementById('pdf2powerpoint-filename').textContent = f.name;
    revealWorkspace('pdf2powerpoint');
    e.target.value = '';
});

async function processPdfToPowerPoint() {
    showLoading('Converting pages to presentation slides...');
    try {
        const zipBytes = await window.pdfEngine.pdfToPowerPoint(state.pdf2powerpoint.pdfJsDoc);
        const blob = new Blob([zipBytes], { type: 'application/zip' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = state.pdf2powerpoint.file.name.replace(/\.pdf$/i, '_presentation_slides.zip');
        a.click();
        URL.revokeObjectURL(url);
        showToast('Presentation slide deck downloaded!');
        navigate('home');
    } catch (e) {
        showToast('PowerPoint export failed: ' + e.message, 'error');
    }
    hideLoading();
}

// ============================================================================
// 34. PDF TO PDF/A HANDLER
// ============================================================================
setupDropzone('dropzone-pdf2pdfa', 'pdf2pdfa-file-input', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    state.pdf2pdfa.file = f;
    state.pdf2pdfa.buffer = await f.arrayBuffer();
    revealWorkspace('pdf2pdfa');
    e.target.value = '';
});

async function processPdfToPdfA() {
    showLoading('Embedding ISO 19005-1 archival schema & sRGB profile...');
    try {
        const bytes = await window.pdfEngine.pdfToPdfA(state.pdf2pdfa.buffer);
        window.pdfEngine.downloadBlob(bytes, `pdfa_${state.pdf2pdfa.file.name}`);
        showToast('PDF/A Archival document generated!');
        navigate('home');
    } catch (e) {
        showToast('PDF/A conversion failed: ' + e.message, 'error');
    }
    hideLoading();
}

// ============================================================================
// 35. HTML TO PDF HANDLER
// ============================================================================
async function processHtmlToPdf() {
    const html = document.getElementById('html2pdf-input').value;
    const title = document.getElementById('html2pdf-title').value || 'Web Document';
    if (!html.trim()) {
        showToast('Please provide HTML content.', 'error');
        return;
    }
    showLoading('Rendering HTML markup to PDF...');
    try {
        const bytes = await window.pdfEngine.htmlToPdf(html, title);
        window.pdfEngine.downloadBlob(bytes, `${title}.pdf`);
        showToast('HTML successfully exported to PDF!');
        navigate('home');
    } catch (e) {
        showToast('HTML to PDF failed: ' + e.message, 'error');
    }
    hideLoading();
}

// ============================================================================
// 36. PDF TO MARKDOWN HANDLER
// ============================================================================
setupDropzone('dropzone-pdf2md', 'pdf2md-file-input', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    state.pdf2md.file = f;
    const arrayBuf = await f.arrayBuffer();
    state.pdf2md.pdfJsDoc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuf.slice(0)) }).promise;

    showLoading('Parsing headings and lists to Markdown...');
    try {
        const md = await window.pdfEngine.pdfToMarkdown(state.pdf2md.pdfJsDoc);
        state.pdf2md.md = md;
        document.getElementById('pdf2md-result').value = md;
        revealWorkspace('pdf2md');
        showToast('Markdown conversion completed!');
    } catch (err) {
        showToast('Markdown conversion failed: ' + err.message, 'error');
    }
    hideLoading();
    e.target.value = '';
});

function copyPdf2Md() {
    const text = document.getElementById('pdf2md-result').value;
    navigator.clipboard.writeText(text);
    showToast('Markdown copied to clipboard!');
}

function downloadPdf2Md() {
    const text = document.getElementById('pdf2md-result').value;
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.pdf2md.file.name.replace('.pdf', '')}.md`;
    a.click();
    URL.revokeObjectURL(url);
}

// ============================================================================
// 37. PDF FORMS HANDLER
// ============================================================================
setupDropzone('dropzone-forms', 'forms-file-input', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    state.forms.file = f;
    state.forms.buffer = await f.arrayBuffer();

    showLoading('Inspecting form fields...');
    try {
        const fields = await window.pdfEngine.getPdfFormFields(state.forms.buffer);
        state.forms.fields = fields;
        const container = document.getElementById('forms-fields-container');
        container.innerHTML = '';

        if (fields.length === 0) {
            container.innerHTML = '<p class="text-xs text-muted p-3 bg-surface rounded-xl">No interactive form fields found in this PDF.</p>';
        } else {
            fields.forEach(field => {
                const row = document.createElement('div');
                row.className = 'flex items-center justify-between gap-3 p-2 bg-surface rounded-xl border';
                row.innerHTML = `
                    <label class="text-xs font-bold text-main truncate max-w-xs">${field.name}</label>
                    <input type="text" data-field-name="${field.name}" placeholder="Value" class="text-xs py-1.5 px-3 rounded-lg w-52">
                `;
                container.appendChild(row);
            });
        }
        revealWorkspace('forms');
    } catch (err) {
        showToast('Failed to read form: ' + err.message, 'error');
    }
    hideLoading();
    e.target.value = '';
});

async function processFormsFill() {
    const inputs = document.querySelectorAll('#forms-fields-container input');
    const values = {};
    inputs.forEach(inp => {
        const name = inp.getAttribute('data-field-name');
        if (name) values[name] = inp.value;
    });

    const flatten = document.getElementById('forms-flatten-chk').checked;
    showLoading('Saving form values...');
    try {
        const bytes = await window.pdfEngine.fillPdfForm(state.forms.buffer, values, flatten);
        window.pdfEngine.downloadBlob(bytes, `filled_${state.forms.file.name}`);
        showToast('Form filled & saved!');
        navigate('home');
    } catch (e) {
        showToast('Failed to fill form: ' + e.message, 'error');
    }
    hideLoading();
}

// ============================================================================
// 38. UNLOCK PDF HANDLER
// ============================================================================
setupDropzone('dropzone-unlock', 'unlock-file-input', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    state.unlock.file = f;
    state.unlock.buffer = await f.arrayBuffer();
    revealWorkspace('unlock');
    e.target.value = '';
});

async function processUnlock() {
    const pwd = document.getElementById('unlock-password').value;
    showLoading('Removing encryption & permissions...');
    try {
        const bytes = await window.pdfEngine.unlockPdf(state.unlock.buffer, pwd);
        window.pdfEngine.downloadBlob(bytes, `unlocked_${state.unlock.file.name}`);
        showToast('PDF unlocked successfully!');
        navigate('home');
    } catch (e) {
        showToast('Unlock failed. Please verify password.', 'error');
    }
    hideLoading();
}

// ============================================================================
// 39. PROTECT PDF HANDLER
// ============================================================================
setupDropzone('dropzone-protect', 'protect-file-input', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    state.protect.file = f;
    state.protect.buffer = await f.arrayBuffer();
    revealWorkspace('protect');
    e.target.value = '';
});

async function processProtect() {
    const pwd = document.getElementById('protect-password').value;
    const confirm = document.getElementById('protect-confirm').value;
    if (!pwd) {
        showToast('Please enter a password.', 'error');
        return;
    }
    if (pwd !== confirm) {
        showToast('Passwords do not match.', 'error');
        return;
    }
    showLoading('Encrypting PDF document...');
    try {
        const bytes = await window.pdfEngine.protectPdf(state.protect.buffer, pwd);
        window.pdfEngine.downloadBlob(bytes, `protected_${state.protect.file.name}`);
        showToast('PDF encrypted & protected!');
        navigate('home');
    } catch (e) {
        showToast('Protection failed: ' + e.message, 'error');
    }
    hideLoading();
}

// ============================================================================
// 40. SIGN PDF STUDIO (DEDICATED)
// ============================================================================
setupDropzone('dropzone-sign', 'sign-file-input', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    state.sign.file = f;
    const arrayBuf = await f.arrayBuffer();
    state.sign.doc = await (window.PDFLib || PDFLib).PDFDocument.load(arrayBuf.slice(0));
    state.sign.pdfJsDoc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuf.slice(0)) }).promise;
    state.sign.totalPages = state.sign.doc.getPageCount();
    state.sign.pageNum = 1;
    state.sign.x = 100;
    state.sign.y = 100;

    initSignStudioPad();
    await renderSignStudioDocPage();
    revealWorkspace('sign');
    e.target.value = '';
});

function initSignStudioPad() {
    const cvs = document.getElementById('sign-studio-canvas');
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    let drawing = false;

    const getPos = (e) => {
        const rect = cvs.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const start = (e) => {
        e.preventDefault();
        drawing = true;
        const pos = getPos(e);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
    };

    const draw = (e) => {
        if (!drawing) return;
        e.preventDefault();
        const pos = getPos(e);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
    };

    const stop = () => { drawing = false; };

    cvs.onmousedown = start;
    cvs.onmousemove = draw;
    window.addEventListener('mouseup', stop);

    cvs.ontouchstart = start;
    cvs.ontouchmove = draw;
    cvs.ontouchend = stop;
}

function clearSignStudioCanvas() {
    const cvs = document.getElementById('sign-studio-canvas');
    if (cvs) {
        const ctx = cvs.getContext('2d');
        ctx.clearRect(0, 0, cvs.width, cvs.height);
    }
}

async function renderSignStudioDocPage() {
    const cvs = document.getElementById('sign-doc-canvas');
    if (!cvs || !state.sign.pdfJsDoc) return;
    await window.pdfEngine.renderPageToCanvas(state.sign.pdfJsDoc, state.sign.pageNum, 0.75, cvs);
    document.getElementById('sign-page-indicator').textContent = `${state.sign.pageNum} / ${state.sign.totalPages}`;

    cvs.onclick = (e) => {
        const rect = cvs.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        // Calculate PDF coordinate (bottom-left origin)
        const scale = cvs.width / (state.sign.doc.getPage(state.sign.pageNum - 1).getWidth());
        state.sign.x = clickX / scale;
        state.sign.y = (cvs.height - clickY) / scale;

        // Draw visual indicator on canvas
        const ctx = cvs.getContext('2d');
        ctx.save();
        ctx.fillStyle = 'rgba(79, 70, 229, 0.2)';
        ctx.strokeStyle = '#4f46e5';
        ctx.lineWidth = 2;
        ctx.fillRect(clickX - 50, clickY - 25, 100, 50);
        ctx.strokeRect(clickX - 50, clickY - 25, 100, 50);
        ctx.fillStyle = '#4f46e5';
        ctx.font = '11px sans-serif';
        ctx.fillText('Signature Stamp', clickX - 45, clickY + 5);
        ctx.restore();

        playSensorySound('tap');
        showToast('Signature position set!');
    };
}

async function changeSignPage(delta) {
    const target = state.sign.pageNum + delta;
    if (target >= 1 && target <= state.sign.totalPages) {
        state.sign.pageNum = target;
        await renderSignStudioDocPage();
    }
}

async function processSignPdf() {
    const pad = document.getElementById('sign-studio-canvas');
    const name = document.getElementById('sign-name-input').value;
    const addDate = document.getElementById('sign-date-chk').checked;

    showLoading('Applying digital signature stamp...');
    try {
        const sigDataUrl = pad.toDataURL('image/png');
        const arrayBuf = await state.sign.file.arrayBuffer();

        const bytes = await window.pdfEngine.signPdf(arrayBuf, {
            signatureDataUrl: sigDataUrl,
            pageNum: state.sign.pageNum,
            x: Math.max(10, state.sign.x - 70),
            y: Math.max(10, state.sign.y - 25),
            width: 140,
            height: 60,
            signerName: name,
            date: addDate ? new Date().toLocaleDateString() : ''
        });

        window.pdfEngine.downloadBlob(bytes, `signed_${state.sign.file.name}`);
        showToast('Document digitally signed!');
        navigate('home');
    } catch (e) {
        showToast('Signature failed: ' + e.message, 'error');
    }
    hideLoading();
}

// ============================================================================
// 41. REDACT PDF HANDLER
// ============================================================================
setupDropzone('dropzone-redact', 'redact-file-input', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    state.redact.file = f;
    const arrayBuf = await f.arrayBuffer();
    state.redact.doc = await (window.PDFLib || PDFLib).PDFDocument.load(arrayBuf.slice(0));
    state.redact.pdfJsDoc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuf.slice(0)) }).promise;
    state.redact.totalPages = state.redact.doc.getPageCount();
    state.redact.pageNum = 1;
    state.redact.redactions = [];

    await renderRedactPage();
    revealWorkspace('redact');
    e.target.value = '';
});

async function renderRedactPage() {
    const renderCvs = document.getElementById('redact-render-canvas');
    const overlayCvs = document.getElementById('redact-overlay-canvas');
    if (!renderCvs || !overlayCvs || !state.redact.pdfJsDoc) return;

    await window.pdfEngine.renderPageToCanvas(state.redact.pdfJsDoc, state.redact.pageNum, 1.0, renderCvs);
    overlayCvs.width = renderCvs.width;
    overlayCvs.height = renderCvs.height;
    document.getElementById('redact-page-indicator').textContent = `${state.redact.pageNum} / ${state.redact.totalPages}`;

    const oCtx = overlayCvs.getContext('2d');
    oCtx.clearRect(0, 0, overlayCvs.width, overlayCvs.height);

    // Render existing redactions for this page
    state.redact.redactions.filter(r => r.pageNum === state.redact.pageNum).forEach(r => {
        oCtx.fillStyle = 'black';
        oCtx.fillRect(r.canvasX, r.canvasY, r.canvasW, r.canvasH);
    });

    let isDrawing = false;
    let startX = 0;
    let startY = 0;

    overlayCvs.onmousedown = (e) => {
        const rect = overlayCvs.getBoundingClientRect();
        startX = e.clientX - rect.left;
        startY = e.clientY - rect.top;
        isDrawing = true;
    };

    overlayCvs.onmousemove = (e) => {
        if (!isDrawing) return;
        const rect = overlayCvs.getBoundingClientRect();
        const curX = e.clientX - rect.left;
        const curY = e.clientY - rect.top;
        oCtx.clearRect(0, 0, overlayCvs.width, overlayCvs.height);

        // Re-render confirmed redactions
        state.redact.redactions.filter(r => r.pageNum === state.redact.pageNum).forEach(r => {
            oCtx.fillStyle = 'black';
            oCtx.fillRect(r.canvasX, r.canvasY, r.canvasW, r.canvasH);
        });

        // Render current selection preview
        oCtx.fillStyle = 'rgba(244, 63, 94, 0.4)';
        oCtx.strokeStyle = '#f43f5e';
        oCtx.lineWidth = 1.5;
        const w = curX - startX;
        const h = curY - startY;
        oCtx.fillRect(startX, startY, w, h);
        oCtx.strokeRect(startX, startY, w, h);
    };

    overlayCvs.onmouseup = (e) => {
        if (!isDrawing) return;
        isDrawing = false;
        const rect = overlayCvs.getBoundingClientRect();
        const endX = e.clientX - rect.left;
        const endY = e.clientY - rect.top;

        const x = Math.min(startX, endX);
        const y = Math.min(startY, endY);
        const w = Math.abs(endX - startX);
        const h = Math.abs(endY - startY);

        if (w > 5 && h > 5) {
            const page = state.redact.doc.getPage(state.redact.pageNum - 1);
            const scale = overlayCvs.width / page.getWidth();

            state.redact.redactions.push({
                pageNum: state.redact.pageNum,
                canvasX: x,
                canvasY: y,
                canvasW: w,
                canvasH: h,
                x: x / scale,
                y: (overlayCvs.height - (y + h)) / scale,
                width: w / scale,
                height: h / scale
            });

            document.getElementById('redact-count-badge').textContent = `${state.redact.redactions.length} Redactions`;
            renderRedactPage();
            playSensorySound('tap');
        }
    };
}

async function changeRedactPage(delta) {
    const target = state.redact.pageNum + delta;
    if (target >= 1 && target <= state.redact.totalPages) {
        state.redact.pageNum = target;
        await renderRedactPage();
    }
}

function clearRedactionsCurrentPage() {
    state.redact.redactions = state.redact.redactions.filter(r => r.pageNum !== state.redact.pageNum);
    document.getElementById('redact-count-badge').textContent = `${state.redact.redactions.length} Redactions`;
    renderRedactPage();
    showToast('Page redactions cleared');
}

async function processRedactPdf() {
    if (state.redact.redactions.length === 0) {
        showToast('Please select at least one area to redact.', 'error');
        return;
    }
    showLoading('Permanently burning blackouts into document...');
    try {
        const arrayBuf = await state.redact.file.arrayBuffer();
        const bytes = await window.pdfEngine.redactPdf(arrayBuf, state.redact.redactions);
        window.pdfEngine.downloadBlob(bytes, `redacted_${state.redact.file.name}`);
        showToast('Document redacted permanently!');
        navigate('home');
    } catch (e) {
        showToast('Redaction failed: ' + e.message, 'error');
    }
    hideLoading();
}

// ============================================================================
// 42. AI DOCUMENT SUMMARIZER HANDLER (OFFLINE)
// ============================================================================
setupDropzone('dropzone-summarizer', 'summarizer-file-input', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    state.summarizer.file = f;
    const arrayBuf = await f.arrayBuffer();
    state.summarizer.pdfJsDoc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuf.slice(0)) }).promise;

    if (window.geminiService && window.geminiService.hasKey()) {
        showLoading('Generating Executive AI Summary with Gemini...');
        try {
            const textData = await window.pdfEngine.extractText(state.summarizer.pdfJsDoc);
            const prompt = `Analyze this document and generate a structured executive summary:
1. Executive TL;DR paragraph (3-4 sentences).
2. Exactly 5 concise, high-impact bullet takeaways.

Respond strictly in valid JSON format:
{
  "tldr": "...",
  "bullets": ["...", "...", "...", "...", "..."]
}

DOCUMENT CONTENT:
${textData.fullText.slice(0, 35000)}`;

            const aiResp = await window.geminiService.generateContent(prompt, "You are an executive document analyst. Output only valid JSON.", 2000);
            const clean = aiResp.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(clean);

            state.summarizer.summary = parsed.tldr || '';
            state.summarizer.bullets = parsed.bullets || [];

            document.getElementById('sum-stat-words').textContent = textData.wordCount.toLocaleString();
            document.getElementById('sum-stat-time').textContent = `${Math.ceil(textData.wordCount / 200)} min`;
            document.getElementById('sum-stat-bullets').textContent = `${state.summarizer.bullets.length} Points (Gemini)`;

            const container = document.getElementById('summary-bullets-container');
            container.innerHTML = '';

            if (parsed.tldr) {
                const tldrCard = document.createElement('div');
                tldrCard.className = 'p-3.5 bg-theme-accent-light rounded-xl border border-accent/20 mb-3';
                tldrCard.innerHTML = `<h5 class="text-xs font-bold text-accent mb-1"><i class="fa-solid fa-sparkles mr-1"></i> Executive TL;DR</h5><p class="text-xs text-main leading-relaxed">${parsed.tldr}</p>`;
                container.appendChild(tldrCard);
            }

            state.summarizer.bullets.forEach((bullet, idx) => {
                const item = document.createElement('div');
                item.className = 'p-3 bg-surface rounded-xl border flex items-start gap-3';
                item.innerHTML = `
                    <span class="w-5 h-5 rounded-full bg-theme-accent-light text-accent flex items-center justify-center text-xs font-bold font-mono flex-none mt-0.5">${idx + 1}</span>
                    <p class="text-xs text-main leading-relaxed flex-1">${bullet}</p>
                `;
                container.appendChild(item);
            });

            revealWorkspace('summarizer');
            showToast('Document summarized with Gemini AI!');
            hideLoading();
            e.target.value = '';
            return;
        } catch (err) {
            console.warn('Gemini summary error, falling back to offline:', err);
        }
    }

    showLoading('Analyzing sentences & calculating salience scores (Offline)...');
    try {
        const result = await window.pdfEngine.summarizePdf(state.summarizer.pdfJsDoc, 5);
        state.summarizer.summary = result.summary;
        state.summarizer.bullets = result.bullets;

        document.getElementById('sum-stat-words').textContent = result.stats.wordCount.toLocaleString();
        document.getElementById('sum-stat-time').textContent = `${result.stats.readTimeMinutes} min`;
        document.getElementById('sum-stat-bullets').textContent = `${result.bullets.length} Points`;

        const container = document.getElementById('summary-bullets-container');
        container.innerHTML = '';
        result.bullets.forEach((bullet, idx) => {
            const item = document.createElement('div');
            item.className = 'p-3 bg-surface rounded-xl border flex items-start gap-3';
            item.innerHTML = `
                <span class="w-5 h-5 rounded-full bg-theme-accent-light text-accent flex items-center justify-center text-xs font-bold font-mono flex-none mt-0.5">${idx + 1}</span>
                <p class="text-xs text-main leading-relaxed flex-1">${bullet}</p>
            `;
            container.appendChild(item);
        });

        revealWorkspace('summarizer');
        showToast('Document summarized successfully!');
    } catch (err) {
        showToast('Summarization failed: ' + err.message, 'error');
    }
    hideLoading();
    e.target.value = '';
});

function copySummaryText() {
    const text = state.summarizer.bullets.map((b, i) => `${i + 1}. ${b}`).join('\n\n');
    navigator.clipboard.writeText(text);
    showToast('Summary copied to clipboard!');
}

async function exportSummaryPdf() {
    const title = `Summary — ${state.summarizer.file ? state.summarizer.file.name.replace('.pdf', '') : 'Document'}`;
    const text = `# ${title}

## Executive Highlights

` + state.summarizer.bullets.map(b => `- ${b}`).join('\n');
    showLoading('Exporting summary report...');
    try {
        const bytes = await window.pdfEngine.textToDocumentPdf(text, title);
        window.pdfEngine.downloadBlob(bytes, `summary_${state.summarizer.file.name}`);
        showToast('Summary PDF exported!');
    } catch (e) {
        showToast('Export failed: ' + e.message, 'error');
    }
    hideLoading();
}

// ============================================================================
// 43. TRANSLATE PDF HANDLER (OFFLINE)
// ============================================================================
setupDropzone('dropzone-translate', 'translate-file-input', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    state.translate.file = f;
    const arrayBuf = await f.arrayBuffer();
    state.translate.pdfJsDoc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuf.slice(0)) }).promise;

    showLoading('Extracting document text for translation...');
    try {
        const textData = await window.pdfEngine.extractText(state.translate.pdfJsDoc);
        state.translate.originalText = textData.fullText;
        document.getElementById('translate-original').value = textData.fullText;
        await runTranslate();
        revealWorkspace('translate');
    } catch (err) {
        showToast('Extraction failed: ' + err.message, 'error');
    }
    hideLoading();
    e.target.value = '';
});

async function runTranslate() {
    const langSelect = document.getElementById('translate-target-lang');
    const lang = langSelect ? langSelect.value : 'ml';
    const langNames = {
        'ml': 'Malayalam (മലയാളം)',
        'hi': 'Hindi (हिन्दी)',
        'ta': 'Tamil (தமிழ்)',
        'es': 'Spanish (Español)',
        'fr': 'French (Français)',
        'de': 'German (Deutsch)',
        'ar': 'Arabic (العربية)',
        'zh': 'Chinese (中文)',
        'ja': 'Japanese (日本語)'
    };
    const targetName = langNames[lang] || lang;
    const orig = state.translate.originalText || '';

    if (!orig) return;

    if (window.geminiService && window.geminiService.hasKey()) {
        showLoading(`Translating document into ${targetName} with Gemini AI...`);
        try {
            const prompt = `Translate the following document text into ${targetName}. Provide a natural, highly accurate and fluent translation while preserving paragraphs, bullet points and formatting:\n\n${orig.slice(0, 30000)}`;
            const result = await window.geminiService.generateContent(prompt, "You are a professional literary and technical translator.", 3000);
            state.translate.translatedText = result;
            document.getElementById('translate-result').value = result;
            hideLoading();
            showToast(`Translated to ${targetName} with Gemini AI!`);
            return;
        } catch (e) {
            console.warn('Gemini translate fallback:', e);
            hideLoading();
            showToast('Gemini API call failed, using offline glossary.', 'info');
        }
    }

    // Offline fallback
    const translated = await window.pdfEngine.translatePdfText(orig, lang);
    state.translate.translatedText = translated;
    document.getElementById('translate-result').value = translated;
}

function copyTranslatedText() {
    const text = document.getElementById('translate-result').value;
    navigator.clipboard.writeText(text);
    showToast('Translated text copied!');
}

async function exportTranslatedPdf() {
    const text = document.getElementById('translate-result').value;
    const title = `Translated (${document.getElementById('translate-target-lang').value.toUpperCase()}) — ${state.translate.file ? state.translate.file.name.replace('.pdf', '') : 'Doc'}`;
    showLoading('Generating translated PDF...');
    try {
        const bytes = await window.pdfEngine.textToDocumentPdf(text, title);
        window.pdfEngine.downloadBlob(bytes, `translated_${state.translate.file.name}`);
        showToast('Translated PDF exported!');
    } catch (e) {
        showToast('Export failed: ' + e.message, 'error');
    }
    hideLoading();
}


// ============================================================================
// UNIVERSAL MULTI-PROVIDER AI INTEGRATION ENGINE & SETTINGS CONTROLLER
// Supports: Google Gemini, OpenAI, Groq Cloud, OpenRouter, Custom / Local AI (Ollama)
// Client-Side Only &bull; 100% User Privacy &bull; Zero Server Middleware
// ============================================================================

const AI_PROVIDERS = {
    gemini: {
        id: 'gemini',
        name: 'Google Gemini',
        defaultModel: 'gemini-3.8-flash',
        keyPlaceholder: 'AIzaSy...',
        keyUrl: 'https://aistudio.google.com/app/apikey',
        keyLinkLabel: 'Get Free Key from Google AI Studio',
        hint: 'Official free tier on Google AI Studio with Gemini 3.8 Flash.',
        models: [
            { id: 'gemini-3.8-flash', label: 'gemini-3.8-flash (Recommended &bull; Flagship GA, 1M context)' },
            { id: 'gemini-3.5-flash-lite', label: 'gemini-3.5-flash-lite (Ultra-fast, high throughput)' },
            { id: 'gemini-3.6-flash', label: 'gemini-3.6-flash (Balanced Stable Multimodal)' },
            { id: 'gemini-3.1-flash-lite', label: 'gemini-3.1-flash-lite (Cost-efficient Lightweight)' }
        ]
    },
    openai: {
        id: 'openai',
        name: 'OpenAI',
        defaultModel: 'gpt-4o-mini',
        keyPlaceholder: 'sk-proj-...',
        keyUrl: 'https://platform.openai.com/api-keys',
        keyLinkLabel: 'Get API Key from OpenAI Platform',
        hint: 'State-of-the-art GPT-4o intelligence.',
        models: [
            { id: 'gpt-4o-mini', label: 'gpt-4o-mini (Recommended &bull; High speed & efficiency)' },
            { id: 'gpt-4o', label: 'gpt-4o (Flagship multimodal intelligence)' },
            { id: 'o3-mini', label: 'o3-mini (Advanced STEM & logical reasoning)' },
            { id: 'gpt-4-turbo', label: 'gpt-4-turbo (Comprehensive document analysis)' }
        ]
    },
    groq: {
        id: 'groq',
        name: 'Groq Cloud',
        defaultModel: 'llama-3.3-70b-versatile',
        keyPlaceholder: 'gsk_...',
        keyUrl: 'https://console.groq.com/keys',
        keyLinkLabel: 'Get Free Key from Groq Console',
        hint: 'Ultra-fast LPU inference (500+ tokens/sec).',
        models: [
            { id: 'llama-3.3-70b-versatile', label: 'llama-3.3-70b-versatile (Recommended &bull; Fast 70B Model)' },
            { id: 'llama-3.1-8b-instant', label: 'llama-3.1-8b-instant (Sub-100ms ultra-speed)' },
            { id: 'mixtral-8x7b-32768', label: 'mixtral-8x7b-32768 (High-capacity 32k context)' }
        ]
    },
    openrouter: {
        id: 'openrouter',
        name: 'OpenRouter',
        defaultModel: 'deepseek/deepseek-r1',
        keyPlaceholder: 'sk-or-...',
        keyUrl: 'https://openrouter.ai/keys',
        keyLinkLabel: 'Get API Key from OpenRouter',
        hint: 'Access DeepSeek R1, Claude 3.5 Sonnet & 200+ models.',
        models: [
            { id: 'deepseek/deepseek-r1', label: 'deepseek/deepseek-r1 (Recommended &bull; Deep reasoning)' },
            { id: 'anthropic/claude-3.5-sonnet', label: 'anthropic/claude-3.5-sonnet (High-nuance writing)' },
            { id: 'meta-llama/llama-3.3-70b-instruct', label: 'meta-llama/llama-3.3-70b-instruct (Open-weights)' },
            { id: 'google/gemini-3.8-flash', label: 'google/gemini-3.8-flash (Gemini via OpenRouter)' }
        ]
    },
    custom: {
        id: 'custom',
        name: 'Custom / Local AI (Ollama)',
        defaultModel: 'llama3',
        keyPlaceholder: 'Optional (e.g. ollama / secret)',
        keyUrl: 'https://ollama.com',
        keyLinkLabel: 'Learn more about Ollama Local AI',
        hint: '100% private offline LLM running on your local machine.',
        models: [
            { id: 'llama3', label: 'llama3 (Ollama Default)' },
            { id: 'deepseek-r1', label: 'deepseek-r1 (Local DeepSeek)' },
            { id: 'mistral', label: 'mistral (Local Mistral 7B)' },
            { id: 'qwen2.5', label: 'qwen2.5 (Local Alibaba Qwen)' }
        ]
    }
};
window.AI_PROVIDERS = AI_PROVIDERS;

class UniversalAiService {
    constructor() {
        this.provider = localStorage.getItem('zen_ai_provider') || 'gemini';
        this.apiKey = localStorage.getItem('zen_ai_api_key') || localStorage.getItem('zen_gemini_api_key') || '';
        this.model = localStorage.getItem('zen_ai_model') || localStorage.getItem('zen_gemini_model') || 'gemini-3.8-flash';
        this.customUrl = localStorage.getItem('zen_custom_api_url') || 'http://localhost:11434/v1';

        // Auto-migrate any deprecated models (e.g. 2.5 or 1.5) to official current gemini-3.8-flash
        if (this.provider === 'gemini') {
            if (!this.model || this.model.includes('2.5') || this.model.includes('1.5') || this.model.includes('argon')) {
                this.model = 'gemini-3.8-flash';
                localStorage.setItem('zen_ai_model', 'gemini-3.8-flash');
                localStorage.setItem('zen_gemini_model', 'gemini-3.8-flash');
            }
        }
    }

    getProvider() {
        return this.provider || 'gemini';
    }

    getProviderConfig() {
        return AI_PROVIDERS[this.provider] || AI_PROVIDERS.gemini;
    }

    getProviderName() {
        return this.getProviderConfig().name;
    }

    hasKey() {
        if (this.provider === 'custom') {
            return !!(this.customUrl && this.customUrl.trim().length > 5);
        }
        return !!(this.apiKey && this.apiKey.trim().length > 5);
    }

    setConfiguration(provider, key, model, customUrl = '') {
        this.provider = provider || 'gemini';
        this.apiKey = (key || '').trim();
        this.model = model || (AI_PROVIDERS[this.provider] ? AI_PROVIDERS[this.provider].defaultModel : 'gemini-3.8-flash');
        this.customUrl = (customUrl || 'http://localhost:11434/v1').trim();

        localStorage.setItem('zen_ai_provider', this.provider);
        if (this.apiKey) {
            localStorage.setItem('zen_ai_api_key', this.apiKey);
            if (this.provider === 'gemini') localStorage.setItem('zen_gemini_api_key', this.apiKey);
        } else {
            localStorage.removeItem('zen_ai_api_key');
            localStorage.removeItem('zen_gemini_api_key');
        }
        localStorage.setItem('zen_ai_model', this.model);
        localStorage.setItem('zen_gemini_model', this.model);
        localStorage.setItem('zen_custom_api_url', this.customUrl);

        this.updateUiBadges();
    }

    // Backward-compatible setKey
    setKey(key, model) {
        this.setConfiguration(this.provider, key, model, this.customUrl);
    }

    clearKey() {
        this.apiKey = '';
        localStorage.removeItem('zen_ai_api_key');
        localStorage.removeItem('zen_gemini_api_key');
        this.updateUiBadges();
    }

    updateUiBadges() {
        const dot = document.getElementById('ai-status-dot');
        const text = document.getElementById('ai-status-text');
        const pill = document.getElementById('ai-status-pill');
        const noKeyBanner = document.getElementById('aichat-no-key-banner');
        const activeName = this.getProviderName();

        if (this.hasKey()) {
            if (dot) {
                dot.style.background = '#10b981';
                dot.style.boxShadow = '0 0 10px #10b981';
            }
            if (text) text.innerText = `AI: ${activeName.replace('Google ', '').replace(' Cloud', '')}`;
            if (pill) {
                pill.style.borderColor = 'rgba(16, 185, 129, 0.35)';
                pill.style.background = 'rgba(16, 185, 129, 0.08)';
            }
            if (noKeyBanner) noKeyBanner.classList.add('hidden');
        } else {
            if (dot) {
                dot.style.background = '#94a3b8';
                dot.style.boxShadow = 'none';
            }
            if (text) text.innerText = 'Settings & AI';
            if (pill) {
                pill.style.borderColor = '';
                pill.style.background = '';
            }
            if (noKeyBanner) noKeyBanner.classList.remove('hidden');
        }
    }

    async testConnection(testProvider, testKey, testModel, testCustomUrl) {
        const provider = testProvider || this.provider;
        const key = (testKey !== undefined ? testKey : this.apiKey || '').trim();
        const model = testModel || this.model;
        const customUrl = (testCustomUrl || this.customUrl || 'http://localhost:11434/v1').replace(/\/+$/, '');

        if (provider !== 'custom' && !key) {
            throw new Error(`Please enter an API key for ${AI_PROVIDERS[provider]?.name || provider}.`);
        }

        if (provider === 'gemini') {
            const modelToTest = (model && !model.includes('2.5') && !model.includes('1.5')) ? model : 'gemini-3.8-flash';
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelToTest}:generateContent?key=${encodeURIComponent(key)}`;
            let res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': key
                },
                body: JSON.stringify({
                    contents: [{ role: 'user', parts: [{ text: 'Respond with the single word: OK' }] }],
                    generationConfig: { maxOutputTokens: 10, temperature: 0.1 }
                })
            });
            if (!res.ok) {
                // Automatic fallback to gemini-3.5-flash-lite
                const fallbackModel = (modelToTest === 'gemini-3.8-flash') ? 'gemini-3.5-flash-lite' : 'gemini-3.8-flash';
                const fbUrl = `https://generativelanguage.googleapis.com/v1beta/models/${fallbackModel}:generateContent?key=${encodeURIComponent(key)}`;
                const fbRes = await fetch(fbUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-goog-api-key': key
                    },
                    body: JSON.stringify({
                        contents: [{ role: 'user', parts: [{ text: 'OK' }] }],
                        generationConfig: { maxOutputTokens: 5 }
                    })
                });
                if (fbRes.ok) {
                    this.model = fallbackModel;
                    localStorage.setItem('zen_ai_model', fallbackModel);
                    return `OK (Connected via ${fallbackModel})`;
                }
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error?.message || `HTTP ${res.status}: ${res.statusText}`);
            }
            const data = await res.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'OK';
        }

        // OpenAI, Groq, OpenRouter, Custom (OpenAI Compatible)
        let endpoint = 'https://api.openai.com/v1/chat/completions';
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key || 'ollama'}`
        };

        if (provider === 'groq') {
            endpoint = 'https://api.groq.com/openai/v1/chat/completions';
        } else if (provider === 'openrouter') {
            endpoint = 'https://openrouter.ai/api/v1/chat/completions';
            headers['HTTP-Referer'] = 'http://localhost';
            headers['X-Title'] = 'Zen PDF Universal Suite';
        } else if (provider === 'custom') {
            endpoint = `${customUrl}/chat/completions`;
        }

        const res = await fetch(endpoint, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                model: model,
                messages: [{ role: 'user', content: 'Say OK' }],
                max_tokens: 10,
                temperature: 0.1
            })
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error?.message || err.message || `HTTP ${res.status}: ${res.statusText}`);
        }
        const data = await res.json();
        return data.choices?.[0]?.message?.content?.trim() || 'OK';
    }

    async generateContent(prompt, systemInstruction = '', maxTokens = 2500) {
        if (!this.hasKey()) {
            throw new Error(`AI API Key is missing. Click Settings (⚙️) to configure your ${this.getProviderName()} key or local endpoint.`);
        }

        if (this.provider === 'gemini') {
            const activeModel = (this.model && !this.model.includes('2.5') && !this.model.includes('1.5')) ? this.model : 'gemini-3.8-flash';
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${encodeURIComponent(this.apiKey)}`;
            const body = {
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: { maxOutputTokens: maxTokens, temperature: 0.3 }
            };
            if (systemInstruction) {
                body.systemInstruction = { parts: [{ text: systemInstruction }] };
            }
            let res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': this.apiKey
                },
                body: JSON.stringify(body)
            });
            if (!res.ok) {
                // Auto-fallback to gemini-3.5-flash-lite on model not found or rate limit
                if (res.status === 404 || res.status === 400 || res.status === 429) {
                    const fallbackModel = (activeModel === 'gemini-3.8-flash') ? 'gemini-3.5-flash-lite' : 'gemini-3.8-flash';
                    const fbUrl = `https://generativelanguage.googleapis.com/v1beta/models/${fallbackModel}:generateContent?key=${encodeURIComponent(this.apiKey)}`;
                    const fbRes = await fetch(fbUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-goog-api-key': this.apiKey
                        },
                        body: JSON.stringify(body)
                    });
                    if (fbRes.ok) {
                        const fbData = await fbRes.json();
                        return fbData.candidates?.[0]?.content?.parts?.[0]?.text || '';
                    }
                }
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error?.message || `HTTP ${res.status}: ${res.statusText}`);
            }
            const data = await res.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        }

        // OpenAI-Compatible Providers (OpenAI, Groq, OpenRouter, Custom)
        let endpoint = 'https://api.openai.com/v1/chat/completions';
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey || 'ollama'}`
        };

        if (this.provider === 'groq') {
            endpoint = 'https://api.groq.com/openai/v1/chat/completions';
        } else if (this.provider === 'openrouter') {
            endpoint = 'https://openrouter.ai/api/v1/chat/completions';
            headers['HTTP-Referer'] = 'http://localhost';
            headers['X-Title'] = 'Zen PDF Universal Suite';
        } else if (this.provider === 'custom') {
            endpoint = `${this.customUrl.replace(/\/+$/, '')}/chat/completions`;
        }

        const messages = [];
        if (systemInstruction) {
            messages.push({ role: 'system', content: systemInstruction });
        }
        messages.push({ role: 'user', content: prompt });

        const res = await fetch(endpoint, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                model: this.model,
                messages: messages,
                max_tokens: maxTokens,
                temperature: 0.3
            })
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error?.message || err.message || `HTTP ${res.status}: ${res.statusText}`);
        }
        const data = await res.json();
        return data.choices?.[0]?.message?.content || '';
    }
}

window.aiService = new UniversalAiService();
window.geminiService = window.aiService; // Full backward compatibility

// --- Settings Modal Handlers ---
function populateAiModelSelect(providerId, currentModel = '') {
    const select = document.getElementById('gemini-model-select');
    if (!select) return;
    const cfg = AI_PROVIDERS[providerId] || AI_PROVIDERS.gemini;
    select.innerHTML = '';
    cfg.models.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.innerHTML = m.label;
        if (m.id === currentModel || (!currentModel && m.id === cfg.defaultModel)) {
            opt.selected = true;
        }
        select.appendChild(opt);
    });
}

function handleAiProviderChange() {
    const provSelect = document.getElementById('ai-provider-select');
    const keyLabel = document.getElementById('ai-api-key-label');
    const keyLink = document.getElementById('ai-get-key-link');
    const keyInput = document.getElementById('gemini-api-key-input');
    const hintEl = document.getElementById('ai-provider-hint');
    const customRow = document.getElementById('ai-custom-url-row');
    const customInput = document.getElementById('ai-custom-url-input');

    const providerId = provSelect ? provSelect.value : 'gemini';
    const cfg = AI_PROVIDERS[providerId] || AI_PROVIDERS.gemini;

    if (keyLabel) keyLabel.innerText = `${cfg.name} API Key`;
    if (keyInput) keyInput.placeholder = cfg.keyPlaceholder;
    if (hintEl) hintEl.innerText = cfg.hint;

    if (keyLink) {
        keyLink.href = cfg.keyUrl;
        keyLink.innerHTML = `${cfg.keyLinkLabel} <i class="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>`;
    }

    if (customRow) {
        if (providerId === 'custom') customRow.classList.remove('hidden');
        else customRow.classList.add('hidden');
    }

    populateAiModelSelect(providerId);
}


// ============================================================================
// UNIFIED STUDIO SETTINGS & AI ENGINE MODAL CONTROLLERS
// ============================================================================

function openSettingsModal(initialTab = 'ai') {
    const modal = document.getElementById('settings-modal');
    if (!modal) return;

    // Switch to target tab
    switchSettingsTab(initialTab);

    // 1. Populate AI Engine Data
    const provSelect = document.getElementById('ai-provider-select');
    const input = document.getElementById('gemini-api-key-input');
    const customInput = document.getElementById('ai-custom-url-input');
    const resBox = document.getElementById('api-test-result');

    const currentProvider = window.aiService.getProvider();
    if (provSelect) provSelect.value = currentProvider;
    if (input) input.value = window.aiService.apiKey || '';
    if (customInput) customInput.value = window.aiService.customUrl || 'http://localhost:11434/v1';

    handleAiProviderChange();
    populateAiModelSelect(currentProvider, window.aiService.model);

    if (resBox) {
        resBox.classList.add('hidden');
        resBox.innerHTML = '';
    }

    // 2. Populate Studio Preferences Data
    const ambientToggle = document.getElementById('pref-ambient-toggle');
    const audioToggle = document.getElementById('pref-audio-toggle');
    const dpiSelect = document.getElementById('pref-dpi-select');
    const themeIcon = document.getElementById('pref-theme-icon');

    if (ambientToggle) {
        const bg = document.querySelector('.ambient-glow-bg');
        ambientToggle.checked = bg ? !bg.classList.contains('hidden') : true;
    }
    if (audioToggle) {
        audioToggle.checked = audioEnabled;
    }
    if (dpiSelect) {
        dpiSelect.value = localStorage.getItem('zenDefaultDpi') || '300';
    }
    if (themeIcon) {
        const theme = document.documentElement.getAttribute('data-theme') || 'dark';
        themeIcon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }

    modal.classList.remove('hidden');
    playSensorySound('tap');
}

function closeSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (modal) modal.classList.add('hidden');
}

function switchSettingsTab(tab) {
    const aiTabBtn = document.getElementById('tab-btn-ai');
    const studioTabBtn = document.getElementById('tab-btn-studio');
    const aiPanel = document.getElementById('settings-tab-ai');
    const studioPanel = document.getElementById('settings-tab-studio');
    const headerIcon = document.getElementById('settings-header-icon');

    if (tab === 'studio') {
        if (aiTabBtn) {
            aiTabBtn.classList.remove('active', 'font-bold');
            aiTabBtn.classList.add('text-muted', 'font-semibold');
        }
        if (studioTabBtn) {
            studioTabBtn.classList.add('active', 'font-bold');
            studioTabBtn.classList.remove('text-muted');
        }
        if (aiPanel) aiPanel.classList.add('hidden');
        if (studioPanel) studioPanel.classList.remove('hidden');
        if (headerIcon) headerIcon.innerHTML = '<i class="fa-solid fa-sliders"></i>';
    } else {
        if (aiTabBtn) {
            aiTabBtn.classList.add('active', 'font-bold');
            aiTabBtn.classList.remove('text-muted');
        }
        if (studioTabBtn) {
            studioTabBtn.classList.remove('active', 'font-bold');
            studioTabBtn.classList.add('text-muted', 'font-semibold');
        }
        if (aiPanel) aiPanel.classList.remove('hidden');
        if (studioPanel) studioPanel.classList.add('hidden');
        if (headerIcon) headerIcon.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i>';
    }
    playSensorySound('tap');
}

// Full backward-compatibility aliases
window.openAiModal = () => openSettingsModal('ai');
window.closeAiModal = closeSettingsModal;
window.openPreferencesModal = () => openSettingsModal('studio');
window.closePreferencesModal = closeSettingsModal;

function toggleApiKeyVisibility() {
    const input = document.getElementById('gemini-api-key-input');
    const icon = document.getElementById('api-key-eye-icon');
    if (input && icon) {
        if (input.type === 'password') {
            input.type = 'text';
            icon.className = 'fa-solid fa-eye-slash';
        } else {
            input.type = 'password';
            icon.className = 'fa-solid fa-eye';
        }
    }
}

async function testApiKey() {
    const provSelect = document.getElementById('ai-provider-select');
    const input = document.getElementById('gemini-api-key-input');
    const select = document.getElementById('gemini-model-select');
    const customInput = document.getElementById('ai-custom-url-input');
    const resBox = document.getElementById('api-test-result');
    const btn = document.getElementById('btn-test-key');

    const provider = provSelect ? provSelect.value : 'gemini';
    const key = input ? input.value.trim() : '';
    const model = select ? select.value : '';
    const customUrl = customInput ? customInput.value.trim() : '';

    if (provider !== 'custom' && !key) {
        showToast('Please enter an API key first.', 'info');
        return;
    }

    if (btn) btn.disabled = true;
    if (resBox) {
        resBox.classList.remove('hidden');
        resBox.className = 'mb-4 p-2.5 rounded-xl text-xs font-medium bg-theme-accent-light text-accent border border-accent/20 flex items-center gap-2';
        resBox.innerHTML = `<div class="w-3.5 h-3.5 border-2 border-accent border-t-transparent rounded-full animate-spin"></div> Connecting to ${AI_PROVIDERS[provider]?.name || provider} API...`;
    }

    try {
        await window.aiService.testConnection(provider, key, model, customUrl);
        if (resBox) {
            resBox.className = 'mb-4 p-2.5 rounded-xl text-xs font-medium bg-emerald-500/10 text-emerald border border-emerald-500/20 flex items-center gap-2';
            resBox.innerHTML = `<i class="fa-solid fa-circle-check text-base"></i> Connection successful! ${AI_PROVIDERS[provider]?.name || provider} is verified and operational.`;
        }
        showToast('API Key verified successfully!');
    } catch (e) {
        if (resBox) {
            resBox.className = 'mb-4 p-2.5 rounded-xl text-xs font-medium bg-rose-500/10 text-rose border border-rose-500/20 flex items-start gap-2';
            resBox.innerHTML = `<i class="fa-solid fa-circle-xmark text-base mt-0.5"></i> <div><b>Connection Failed:</b> ${e.message}</div>`;
        }
    } finally {
        if (btn) btn.disabled = false;
    }
}

function saveApiKey() {
    const provSelect = document.getElementById('ai-provider-select');
    const input = document.getElementById('gemini-api-key-input');
    const select = document.getElementById('gemini-model-select');
    const customInput = document.getElementById('ai-custom-url-input');

    const provider = provSelect ? provSelect.value : 'gemini';
    const key = input ? input.value.trim() : '';
    const model = select ? select.value : '';
    const customUrl = customInput ? customInput.value.trim() : '';

    window.aiService.setConfiguration(provider, key, model, customUrl);
    showToast(`${window.aiService.getProviderName()} configured successfully!`);
    closeSettingsModal();
}

function clearApiKey() {
    const input = document.getElementById('gemini-api-key-input');
    const resBox = document.getElementById('api-test-result');
    if (input) input.value = '';
    if (resBox) resBox.classList.add('hidden');
    window.aiService.clearKey();
    showToast('AI settings cleared. Running in 100% offline mode.', 'info');
}

// ============================================================================
// WORKSPACE: ASK & CHAT WITH PDF (GEMINI AI)
// ============================================================================

setupDropzone('dropzone-aichat', 'aichat-file-input', async (e) => {
    const file = (e && e.target && e.target.files) ? e.target.files[0] : (e instanceof File ? e : null);
    if (!file) return;
    state.aichat.file = file;
    state.aichat.messages = [];
    showLoading('Analyzing PDF text for AI Chat...');
    try {
        const arrayBuf = await file.arrayBuffer();
        const pdfJsDoc = await window.pdfjsLib.getDocument({ data: new Uint8Array(arrayBuf.slice(0)) }).promise;
        state.aichat.pdfJsDoc = pdfJsDoc;

        const textData = await window.pdfEngine.extractText(pdfJsDoc);
        state.aichat.text = textData.fullText || '';

        const nameEl = document.getElementById('aichat-doc-name');
        const metaEl = document.getElementById('aichat-doc-meta');
        if (nameEl) nameEl.innerText = file.name;
        if (metaEl) metaEl.innerText = `${pdfJsDoc.numPages} Pages • ${textData.wordCount} Words`;

        // Check key status and show welcome message
        initAiChatWelcome();
        revealWorkspace('aichat');
    } catch (err) {
        showToast('Failed to load document: ' + err.message, 'error');
    }
    hideLoading();
});

function initAiChatWelcome() {
    const box = document.getElementById('aichat-messages-box');
    const noKeyBanner = document.getElementById('aichat-no-key-banner');

    if (noKeyBanner) {
        if (window.geminiService.hasKey()) noKeyBanner.classList.add('hidden');
        else noKeyBanner.classList.remove('hidden');
    }

    state.aichat.messages = [
        {
            role: 'ai',
            text: `Hello! I have analyzed **${state.aichat.file ? state.aichat.file.name : 'your document'}** (${state.aichat.pdfJsDoc ? state.aichat.pdfJsDoc.numPages : 1} pages). Ask me any question, request summaries, extract tables, or explain key concepts!`
        }
    ];
    renderChatMessages();
}

function renderChatMessages() {
    const box = document.getElementById('aichat-messages-box');
    if (!box) return;
    box.innerHTML = '';

    state.aichat.messages.forEach(msg => {
        const div = document.createElement('div');
        if (msg.role === 'user') {
            div.className = 'chat-bubble chat-bubble-user';
            div.innerText = msg.text;
        } else {
            div.className = 'chat-bubble chat-bubble-ai';
            const roleHeader = `<div class="flex items-center justify-between gap-2 mb-1.5 text-[11px] font-bold text-accent">
                <span><i class="fa-solid fa-sparkles mr-1"></i> Zen Assistant (Gemini)</span>
                <button onclick="navigator.clipboard.writeText(this.closest('.chat-bubble-ai').querySelector('.ai-msg-body').innerText); showToast('Copied to clipboard!');" class="text-muted hover:text-main text-[10px]" title="Copy response"><i class="fa-regular fa-copy"></i></button>
            </div>`;
            const formatted = formatMarkdownSimple(msg.text);
            div.innerHTML = `${roleHeader}<div class="ai-msg-body text-xs leading-relaxed">${formatted}</div>`;
        }
        box.appendChild(div);
    });

    box.scrollTop = box.scrollHeight;
}

function formatMarkdownSimple(text) {
    if (!text) return '';
    let escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    
    // Bold
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    // Bullet points
    escaped = escaped.replace(/^[\*\-]\s+(.+)$/gm, '<li>$1</li>');
    escaped = escaped.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    // Line breaks
    escaped = escaped.replace(/\n/g, '<br>');
    return escaped;
}

async function sendChatMessage(customPrompt = null) {
    const input = document.getElementById('aichat-user-input');
    const sendBtn = document.getElementById('btn-send-aichat');
    const q = (customPrompt || (input ? input.value : '')).trim();

    if (!q) return;
    if (input) input.value = '';

    // Add user message
    state.aichat.messages.push({ role: 'user', text: q });
    renderChatMessages();

    if (!window.geminiService.hasKey()) {
        state.aichat.messages.push({
            role: 'ai',
            text: '⚠️ **Google Gemini API Key is required for conversational AI.**\n\nPlease click [Settings ⚙️] in the top navigation bar to enter your free API key from Google AI Studio.'
        });
        renderChatMessages();
        return;
    }

    if (sendBtn) sendBtn.disabled = true;

    // Add temporary thinking placeholder
    const box = document.getElementById('aichat-messages-box');
    const thinkingEl = document.createElement('div');
    thinkingEl.id = 'chat-thinking-bubble';
    thinkingEl.className = 'chat-bubble chat-bubble-ai text-muted text-xs flex items-center gap-2';
    thinkingEl.innerHTML = '<div class="w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin"></div> Thinking with Gemini AI...';
    box.appendChild(thinkingEl);
    box.scrollTop = box.scrollHeight;

    try {
        const docSnippet = (state.aichat.text || '').slice(0, 45000); // 45k chars context
        const sysPrompt = "You are Zen AI, an expert document intelligence assistant. Answer questions based on the provided document text accurately, concisely, and helpfully. Use clear formatting, bullet points, and headers.";
        const fullPrompt = `DOCUMENT CONTENT:\n${docSnippet}\n\nUSER QUESTION:\n${q}`;

        const reply = await window.geminiService.generateContent(fullPrompt, sysPrompt, 2048);
        thinkingEl.remove();
        state.aichat.messages.push({ role: 'ai', text: reply || 'I could not find an answer in the document.' });
        renderChatMessages();
    } catch (err) {
        thinkingEl.remove();
        state.aichat.messages.push({ role: 'ai', text: `❌ **Error:** ${err.message}` });
        renderChatMessages();
    } finally {
        if (sendBtn) sendBtn.disabled = false;
    }
}

function sendQuickChatPrompt(prompt) {
    sendChatMessage(prompt);
}

function clearChatHistory() {
    initAiChatWelcome();
    showToast('Chat history cleared.');
}

// ============================================================================
// WORKSPACE: AI QUIZ & STUDY SUITE
// ============================================================================

setupDropzone('dropzone-aistudy', 'aistudy-file-input', async (e) => {
    const file = (e && e.target && e.target.files) ? e.target.files[0] : (e instanceof File ? e : null);
    if (!file) return;
    state.aistudy.file = file;
    state.aistudy.score = 0;
    state.aistudy.answered = {};
    showLoading('Analyzing lecture notes & generating study materials...');
    try {
        const arrayBuf = await file.arrayBuffer();
        const pdfJsDoc = await window.pdfjsLib.getDocument({ data: new Uint8Array(arrayBuf.slice(0)) }).promise;
        state.aistudy.pdfJsDoc = pdfJsDoc;

        const textData = await window.pdfEngine.extractText(pdfJsDoc);
        state.aistudy.text = textData.fullText || '';

        await generateStudyContent();
        revealWorkspace('aistudy');
    } catch (err) {
        showToast('Failed to load study document: ' + err.message, 'error');
    }
    hideLoading();
});

function switchStudyMode(mode, btn) {
    state.aistudy.mode = mode;
    document.querySelectorAll('.study-tab-btn').forEach(b => {
        b.classList.remove('btn-primary');
        b.classList.add('btn-secondary');
    });
    if (btn) {
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-primary');
    }

    document.getElementById('study-panel-quiz').classList.toggle('hidden', mode !== 'quiz');
    document.getElementById('study-panel-flashcards').classList.toggle('hidden', mode !== 'flashcards');
    document.getElementById('study-panel-outline').classList.toggle('hidden', mode !== 'outline');
    playSensorySound('tap');
}

async function generateStudyContent() {
    state.aistudy.score = 0;
    state.aistudy.answered = {};
    const textSnippet = (state.aistudy.text || '').slice(0, 35000);

    if (window.geminiService.hasKey() && textSnippet.length > 50) {
        showLoading('Generating AI Quiz & Flashcards with Gemini...');
        try {
            const prompt = `Based on the following document content, generate educational study materials:
1. 5 multiple-choice questions with 4 options each, the correct 0-based index (0, 1, 2, or 3), and a concise explanation.
2. 6 flashcards with front (question/concept) and back (answer/definition).
3. A concise conceptual guide with key terms and definitions.

Respond ONLY with valid JSON in this exact structure:
{
  "quiz": [
    { "question": "...", "options": ["A", "B", "C", "D"], "answer": 0, "explanation": "..." }
  ],
  "flashcards": [
    { "q": "...", "a": "..." }
  ],
  "outline": "### Key Concepts\n- **Term**: Definition..."
}

DOCUMENT CONTENT:
${textSnippet}`;

            const reply = await window.geminiService.generateContent(prompt, "You are a master educator. Output only valid JSON.", 3000);
            const cleanJson = reply.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleanJson);

            state.aistudy.quiz = parsed.quiz || [];
            state.aistudy.flashcards = parsed.flashcards || [];
            state.aistudy.outline = parsed.outline || '';
        } catch (e) {
            console.warn('Gemini study generation fallback:', e);
            generateOfflineStudyContent();
        } finally {
            hideLoading();
        }
    } else {
        generateOfflineStudyContent();
    }

    renderQuiz();
    renderFlashcard();
    renderOutline();
}

function generateOfflineStudyContent() {
    const text = state.aistudy.text || 'Document sample text';
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const cleanSentences = sentences.map(s => s.trim()).filter(s => s.length > 30 && s.length < 150);

    // Heuristic Offline Flashcards
    state.aistudy.flashcards = cleanSentences.slice(0, 6).map((s, idx) => {
        const words = s.split(' ');
        const keyWord = words[Math.min(2, words.length - 1)];
        return {
            q: `What key concept is described regarding "${keyWord}"?`,
            a: s
        };
    });

    if (state.aistudy.flashcards.length === 0) {
        state.aistudy.flashcards = [
            { q: "What is the primary topic of this document?", a: (state.aistudy.file ? state.aistudy.file.name : "Document Analysis") },
            { q: "How many pages are in this document?", a: `${state.aistudy.pdfJsDoc ? state.aistudy.pdfJsDoc.numPages : 1} pages.` }
        ];
    }

    // Heuristic Offline Quiz
    state.aistudy.quiz = state.aistudy.flashcards.slice(0, 5).map((fc, idx) => ({
        question: fc.q,
        options: [
            fc.a,
            "Contradicts the main principles outlined in chapter notes.",
            "An alternative perspective not supported by the document.",
            "None of the provided options are fully accurate."
        ],
        answer: 0,
        explanation: "Verified directly from the document source material."
    }));

    // Offline Outline
    state.aistudy.outline = cleanSentences.slice(0, 8).map(s => `- ${s}`).join('\n\n');
}

function renderQuiz() {
    const container = document.getElementById('quiz-questions-container');
    const badge = document.getElementById('quiz-score-badge');
    if (!container) return;
    container.innerHTML = '';

    const questions = state.aistudy.quiz || [];
    if (badge) badge.innerText = `Score: ${state.aistudy.score} / ${questions.length}`;

    questions.forEach((q, qIdx) => {
        const card = document.createElement('div');
        card.className = 'glass-panel p-5 rounded-2xl space-y-3';

        const qTitle = `<div class="flex items-start gap-2.5">
            <span class="w-5 h-5 rounded-full bg-theme-accent-light text-accent text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">${qIdx + 1}</span>
            <h4 class="text-xs font-bold text-main leading-relaxed">${q.question}</h4>
        </div>`;

        let optsHtml = '<div class="space-y-2 pt-1">';
        q.options.forEach((opt, optIdx) => {
            optsHtml += `<button onclick="checkQuizAnswer(${qIdx}, ${optIdx}, this)" id="q-${qIdx}-opt-${optIdx}" class="quiz-opt-btn">
                <span><b>${String.fromCharCode(65 + optIdx)}.</b> ${opt}</span>
                <i class="opt-icon fa-regular fa-circle text-xs text-muted"></i>
            </button>`;
        });
        optsHtml += '</div>';

        const expHtml = `<div id="q-${qIdx}-exp" class="hidden text-[11px] p-2.5 rounded-xl border bg-surface mt-2 text-muted leading-relaxed">
            <b>Explanation:</b> ${q.explanation}
        </div>`;

        card.innerHTML = `${qTitle}${optsHtml}${expHtml}`;
        container.appendChild(card);
    });
}

function checkQuizAnswer(qIdx, optIdx, btnEl) {
    if (state.aistudy.answered[qIdx] !== undefined) return;
    state.aistudy.answered[qIdx] = optIdx;

    const q = state.aistudy.quiz[qIdx];
    const isCorrect = (optIdx === q.answer);
    if (isCorrect) state.aistudy.score++;

    // Highlight options
    const correctBtn = document.getElementById(`q-${qIdx}-opt-${q.answer}`);
    if (correctBtn) {
        correctBtn.classList.add('correct');
        const icon = correctBtn.querySelector('.opt-icon');
        if (icon) icon.className = 'opt-icon fa-solid fa-circle-check text-xs text-emerald';
    }

    if (!isCorrect) {
        btnEl.classList.add('incorrect');
        const icon = btnEl.querySelector('.opt-icon');
        if (icon) icon.className = 'opt-icon fa-solid fa-circle-xmark text-xs text-rose';
    }

    const exp = document.getElementById(`q-${qIdx}-exp`);
    if (exp) exp.classList.remove('hidden');

    const badge = document.getElementById('quiz-score-badge');
    if (badge) badge.innerText = `Score: ${state.aistudy.score} / ${state.aistudy.quiz.length}`;
    playSensorySound('tap');
}

function renderFlashcard() {
    const fcs = state.aistudy.flashcards || [];
    if (!fcs.length) return;
    const idx = state.aistudy.currentFcIdx % fcs.length;
    const fc = fcs[idx];

    const cardWrap = document.getElementById('flashcard-card-element');
    if (cardWrap) cardWrap.classList.remove('flipped');

    const front = document.getElementById('fc-front-text');
    const back = document.getElementById('fc-back-text');
    const counter = document.getElementById('fc-counter');

    if (front) front.innerText = fc.q;
    if (back) back.innerText = fc.a;
    if (counter) counter.innerText = `${idx + 1} / ${fcs.length}`;
}

function flipFlashcard() {
    const cardWrap = document.getElementById('flashcard-card-element');
    if (cardWrap) cardWrap.classList.toggle('flipped');
    playSensorySound('tap');
}

function nextFlashcard() {
    const fcs = state.aistudy.flashcards || [];
    if (!fcs.length) return;
    state.aistudy.currentFcIdx = (state.aistudy.currentFcIdx + 1) % fcs.length;
    renderFlashcard();
}

function prevFlashcard() {
    const fcs = state.aistudy.flashcards || [];
    if (!fcs.length) return;
    state.aistudy.currentFcIdx = (state.aistudy.currentFcIdx - 1 + fcs.length) % fcs.length;
    renderFlashcard();
}

function renderOutline() {
    const box = document.getElementById('outline-content-box');
    if (box) {
        box.innerHTML = formatMarkdownSimple(state.aistudy.outline || 'No outline generated.');
    }
}

function copyOutlineText() {
    navigator.clipboard.writeText(state.aistudy.outline || '');
    showToast('Concept outline copied!');
}

function regenerateStudyContent() {
    generateStudyContent();
    showToast('Regenerating study suite...');
}

async function exportQuizPdf() {
    const questions = state.aistudy.quiz || [];
    let textDoc = `ACADEMIC ASSESSMENT QUIZ & STUDY GUIDE\nSource: ${state.aistudy.file ? state.aistudy.file.name : 'Document'}\n\n`;
    questions.forEach((q, idx) => {
        textDoc += `Question ${idx + 1}: ${q.question}\n`;
        q.options.forEach((opt, oIdx) => {
            textDoc += `  [${String.fromCharCode(65 + oIdx)}] ${opt}\n`;
        });
        textDoc += `Correct Answer: [${String.fromCharCode(65 + q.answer)}] - ${q.explanation}\n\n`;
    });

    showLoading('Exporting Quiz PDF...');
    try {
        const bytes = await window.pdfEngine.textToDocumentPdf(textDoc, 'Academic Assessment Quiz');
        window.pdfEngine.downloadBlob(bytes, `quiz_${state.aistudy.file ? state.aistudy.file.name : 'doc'}`);
        showToast('Quiz exported to PDF!');
    } catch (e) {
        showToast('Export failed: ' + e.message, 'error');
    }
    hideLoading();
}

// Initialize on Load
window.addEventListener('DOMContentLoaded', () => {
    initTheme();
    updatePwaToggleState(isPwaInstalled());
    renderRecentTools();
    if (window.pdfEditor) window.pdfEditor.init();
    if (window.geminiService) window.geminiService.updateUiBadges();

    const hash = window.location.hash.replace('#', '');
    if (hash) navigate(hash);
});


// Setup Drag & Drop on Camera Scanner initial box
document.addEventListener('DOMContentLoaded', () => {
    const contScanner = document.getElementById('cont-scanner');
    if (contScanner) {
        contScanner.addEventListener('dragover', (e) => { e.preventDefault(); contScanner.classList.add('border-accent'); });
        contScanner.addEventListener('dragleave', () => { contScanner.classList.remove('border-accent'); });
        contScanner.addEventListener('drop', (e) => {
            e.preventDefault();
            contScanner.classList.remove('border-accent');
            if (e.dataTransfer && e.dataTransfer.files) {
                addScannerFiles(Array.from(e.dataTransfer.files));
            }
        });
    }
}); // cont-scanner-drag-setup


// Setup Drag & Drop file loaders for Slide2Pdf, Text2Pdf, and Html2Pdf
function initTextToolFileLoaders() {
    // Slide2Pdf file loader
    const slideDrop = document.getElementById('dropzone-slide2pdf');
    const slideInput = document.getElementById('slide2pdf-file-input');
    if (slideDrop && slideInput) {
        slideInput.addEventListener('change', async (e) => {
            const f = e.target.files[0];
            if (f) {
                const text = await f.text();
                const ta = document.getElementById('slides-input-text');
                if (ta) ta.value = text;
                showToast(`Loaded ${f.name} into slides`);
            }
        });
    }

    // Text2Pdf file loader
    const textDrop = document.getElementById('dropzone-text2pdf');
    const textInput = document.getElementById('text2pdf-file-input');
    if (textDrop && textInput) {
        textInput.addEventListener('change', async (e) => {
            const f = e.target.files[0];
            if (f) {
                const text = await f.text();
                const ta = document.getElementById('text-to-convert');
                if (ta) ta.value = text;
                showToast(`Loaded ${f.name} into document`);
            }
        });
    }

    // Html2Pdf file loader
    const htmlDrop = document.getElementById('dropzone-html2pdf');
    const htmlInput = document.getElementById('html2pdf-file-input');
    if (htmlDrop && htmlInput) {
        htmlInput.addEventListener('change', async (e) => {
            const f = e.target.files[0];
            if (f) {
                const text = await f.text();
                const ta = document.getElementById('html2pdf-input');
                if (ta) ta.value = text;
                showToast(`Loaded ${f.name} into HTML editor`);
            }
        });
    }
}
document.addEventListener('DOMContentLoaded', initTextToolFileLoaders);



function toggleAmbientGlow(enable) {
    const bg = document.querySelector('.ambient-glow-bg');
    if (bg) {
        if (enable) bg.classList.remove('hidden');
        else bg.classList.add('hidden');
    }
    localStorage.setItem('zenAmbientGlow', enable ? '1' : '0');
    showToast(enable ? 'Ambient lighting enabled' : 'Ambient lighting disabled');
}

function setPreferredDpi(dpi) {
    localStorage.setItem('zenDefaultDpi', dpi);
    showToast(`Default PDF Quality set to ${dpi} DPI`);
}

function clearRecentToolsHistory() {
    state.recentTools = [];
    localStorage.removeItem('zenRecentTools');
    renderRecentTools();
    showToast('Recent tools history cleared.');
}

function clearStudioCache() {
    state.scanner.capturedPages.forEach(p => URL.revokeObjectURL(p.url));
    state.scanner.capturedPages = [];
    renderScannerPages();
    showToast('Studio cache & temporary memory flushed.');
}


function handleModalBackdropClick(event) {
    if (event.target.classList.contains('modal-overlay')) {
        closeSettingsModal();
    }
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeSettingsModal();
        if (typeof closeSpotlight === 'function') closeSpotlight();
    }
});
