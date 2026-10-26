/**
 * ============================================================================
 * ZEN PDF STUDIO — PRO WYSIWYG CANVAS EDITOR & SIGNATURE STUDIO
 * Apple iOS 27 / visionOS Fluid Editing Experience
 * Created by Aravind o k
 * ============================================================================
 */

class PdfEditorStudio {
    constructor() {
        this.file = null;
        this.arrayBuffer = null;
        this.pdfJsDoc = null;
        this.currentPage = 1;
        this.totalPages = 1;
        this.scale = 1.4;
        this.mode = 'text'; // 'text', 'draw', 'highlighter', 'whiteout', 'redact', 'rect', 'arrow', 'signature'
        this.annotations = {}; // { [pageNum]: [ ...annotationObjects ] }
        this.redoStack = {};
        
        this.isDrawing = false;
        this.startX = 0;
        this.startY = 0;
        this.currentDraw = null;
        this.savedSignatureData = null;

        this.renderCanvas = null;
        this.annotCanvas = null;
        this.annotCtx = null;
    }

    init() {
        this.renderCanvas = document.getElementById('pdf-render-canvas');
        this.annotCanvas = document.getElementById('editor-annotation-canvas');
        if (this.annotCanvas) {
            this.annotCtx = this.annotCanvas.getContext('2d');
            this.bindCanvasEvents();
        }
        this.initSignatureModal();
    }

    async loadDocument(file) {
        this.file = file;
        this.arrayBuffer = await file.arrayBuffer();
        this.pdfJsDoc = await pdfjsLib.getDocument({ data: new Uint8Array(this.arrayBuffer.slice(0)) }).promise;
        this.totalPages = this.pdfJsDoc.numPages;
        this.currentPage = 1;
        this.annotations = {};
        this.redoStack = {};

        await this.renderPage(1);
    }

    async renderPage(pageNum) {
        if (!this.pdfJsDoc) return;
        this.currentPage = pageNum;
        
        const pageIndicator = document.getElementById('editor-page-indicator');
        if (pageIndicator) pageIndicator.innerText = `${pageNum} / ${this.totalPages}`;

        const page = await this.pdfJsDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: this.scale });

        const container = document.getElementById('canvas-wrapper');
        this.renderCanvas.width = viewport.width;
        this.renderCanvas.height = viewport.height;
        this.annotCanvas.width = viewport.width;
        this.annotCanvas.height = viewport.height;

        container.style.width = `${viewport.width}px`;
        container.style.height = `${viewport.height}px`;

        const ctx = this.renderCanvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;

        this.redrawAnnotations();
    }

    setMode(mode) {
        this.mode = mode;
        const modes = ['text', 'draw', 'highlighter', 'whiteout', 'redact', 'rect', 'arrow', 'signature'];
        modes.forEach(m => {
            const btn = document.getElementById(`btn-mode-${m}`);
            if (btn) {
                if (m === mode) {
                    btn.classList.add('btn-primary');
                    btn.classList.remove('btn-secondary');
                } else {
                    btn.classList.remove('btn-primary');
                    btn.classList.add('btn-secondary');
                }
            }
        });

        if (mode === 'signature') {
            this.openSignatureModal();
        }
    }

    redrawAnnotations() {
        if (!this.annotCtx) return;
        this.annotCtx.clearRect(0, 0, this.annotCanvas.width, this.annotCanvas.height);
        const list = this.annotations[this.currentPage] || [];

        list.forEach(a => {
            this.annotCtx.save();
            if (a.type === 'whiteout') {
                this.annotCtx.fillStyle = '#ffffff';
                this.annotCtx.fillRect(a.x, a.y, a.w, a.h);
            } else if (a.type === 'redact') {
                this.annotCtx.fillStyle = '#000000';
                this.annotCtx.fillRect(a.x, a.y, a.w, a.h);
            } else if (a.type === 'text') {
                if (a.bgColor) {
                    this.annotCtx.fillStyle = a.bgColor;
                    this.annotCtx.fillRect(a.x, a.y, a.w, a.h);
                }
                this.annotCtx.fillStyle = a.color || '#000000';
                this.annotCtx.font = `${a.fontSize}px ${a.fontFamily || 'sans-serif'}`;
                this.annotCtx.textBaseline = 'top';
                this.annotCtx.fillText(a.text, a.x + 4, a.y + 4);
            } else if (a.type === 'draw') {
                this.annotCtx.strokeStyle = a.color;
                this.annotCtx.lineWidth = a.width;
                this.annotCtx.lineCap = 'round';
                this.annotCtx.lineJoin = 'round';
                this.annotCtx.beginPath();
                a.points.forEach((pt, idx) => {
                    if (idx === 0) this.annotCtx.moveTo(pt.x, pt.y);
                    else this.annotCtx.lineTo(pt.x, pt.y);
                });
                this.annotCtx.stroke();
            } else if (a.type === 'highlighter') {
                this.annotCtx.strokeStyle = a.color;
                this.annotCtx.globalAlpha = 0.45;
                this.annotCtx.lineWidth = a.width || 18;
                this.annotCtx.lineCap = 'square';
                this.annotCtx.beginPath();
                a.points.forEach((pt, idx) => {
                    if (idx === 0) this.annotCtx.moveTo(pt.x, pt.y);
                    else this.annotCtx.lineTo(pt.x, pt.y);
                });
                this.annotCtx.stroke();
            } else if (a.type === 'rect') {
                this.annotCtx.strokeStyle = a.color;
                this.annotCtx.lineWidth = a.width || 2;
                this.annotCtx.strokeRect(a.x, a.y, a.w, a.h);
            } else if (a.type === 'arrow') {
                this.drawArrow(this.annotCtx, a.x1, a.y1, a.x2, a.y2, a.color, a.width);
            } else if (a.type === 'image' && a.imgElement) {
                this.annotCtx.drawImage(a.imgElement, a.x, a.y, a.w, a.h);
            }
            this.annotCtx.restore();
        });
    }

    drawArrow(ctx, fromx, fromy, tox, toy, color = '#6366f1', width = 3) {
        const headlen = 12;
        const dx = tox - fromx;
        const dy = toy - fromy;
        const angle = Math.atan2(dy, dx);
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(fromx, fromy);
        ctx.lineTo(tox, toy);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(tox, toy);
        ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
    }

    bindCanvasEvents() {
        const getPos = (e) => {
            const rect = this.annotCanvas.getBoundingClientRect();
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        };

        this.annotCanvas.addEventListener('pointerdown', (e) => {
            const pos = getPos(e);
            this.isDrawing = true;
            this.startX = pos.x;
            this.startY = pos.y;

            const page = this.currentPage;
            this.annotations[page] = this.annotations[page] || [];
            this.redoStack[page] = []; // clear redo on new action

            const color = document.getElementById('edit-color')?.value || '#000000';
            const size = parseInt(document.getElementById('edit-font-size')?.value, 10) || 16;

            if (this.mode === 'draw') {
                this.currentDraw = {
                    type: 'draw',
                    color,
                    width: 3,
                    points: [{ x: pos.x, y: pos.y }]
                };
                this.annotations[page].push(this.currentDraw);
            } else if (this.mode === 'highlighter') {
                this.currentDraw = {
                    type: 'highlighter',
                    color: '#facc15',
                    width: 20,
                    points: [{ x: pos.x, y: pos.y }]
                };
                this.annotations[page].push(this.currentDraw);
            }
        });

        this.annotCanvas.addEventListener('pointermove', (e) => {
            if (!this.isDrawing) return;
            const pos = getPos(e);

            if (this.mode === 'draw' || this.mode === 'highlighter') {
                this.currentDraw.points.push({ x: pos.x, y: pos.y });
                this.redrawAnnotations();
            } else if (['whiteout', 'redact', 'text', 'rect', 'arrow'].includes(this.mode)) {
                this.redrawAnnotations();
                this.annotCtx.save();
                this.annotCtx.strokeStyle = '#6366f1';
                this.annotCtx.lineWidth = 1.5;
                this.annotCtx.setLineDash([5, 5]);

                if (this.mode === 'arrow') {
                    this.drawArrow(this.annotCtx, this.startX, this.startY, pos.x, pos.y, '#6366f1', 2);
                } else {
                    const w = pos.x - this.startX;
                    const h = pos.y - this.startY;
                    this.annotCtx.strokeRect(this.startX, this.startY, w, h);
                }
                this.annotCtx.restore();
            }
        });

        this.annotCanvas.addEventListener('pointerup', (e) => {
            if (!this.isDrawing) return;
            this.isDrawing = false;
            const pos = getPos(e);
            const page = this.currentPage;

            const x = Math.min(this.startX, pos.x);
            const y = Math.min(this.startY, pos.y);
            const w = Math.abs(pos.x - this.startX);
            const h = Math.abs(pos.y - this.startY);

            if (this.mode === 'whiteout' && w > 4 && h > 4) {
                this.annotations[page].push({ type: 'whiteout', x, y, w, h });
                this.redrawAnnotations();
            } else if (this.mode === 'redact' && w > 4 && h > 4) {
                this.annotations[page].push({ type: 'redact', x, y, w, h });
                this.redrawAnnotations();
            } else if (this.mode === 'rect' && w > 4 && h > 4) {
                const color = document.getElementById('edit-color')?.value || '#6366f1';
                this.annotations[page].push({ type: 'rect', x, y, w, h, color, width: 2.5 });
                this.redrawAnnotations();
            } else if (this.mode === 'arrow' && (Math.abs(pos.x - this.startX) > 8 || Math.abs(pos.y - this.startY) > 8)) {
                const color = document.getElementById('edit-color')?.value || '#6366f1';
                this.annotations[page].push({
                    type: 'arrow',
                    x1: this.startX,
                    y1: this.startY,
                    x2: pos.x,
                    y2: pos.y,
                    color,
                    width: 3
                });
                this.redrawAnnotations();
            } else if (this.mode === 'text') {
                const text = prompt("Enter text to add / replace:");
                if (text && text.trim()) {
                    const fontSize = parseInt(document.getElementById('edit-font-size')?.value, 10) || 16;
                    const fontFamily = document.getElementById('edit-font-family')?.value || 'Helvetica';
                    const color = document.getElementById('edit-color')?.value || '#000000';

                    this.annotCtx.font = `${fontSize}px ${fontFamily}`;
                    const metrics = this.annotCtx.measureText(text);
                    const calcW = Math.max(w, metrics.width + 12);
                    const calcH = Math.max(h, fontSize + 8);

                    this.annotations[page].push({
                        type: 'text',
                        x, y,
                        w: calcW,
                        h: calcH,
                        text,
                        fontSize,
                        fontFamily,
                        color,
                        bgColor: '#ffffff'
                    });
                }
                this.redrawAnnotations();
            }
        });
    }

    undo() {
        const page = this.currentPage;
        if (this.annotations[page] && this.annotations[page].length > 0) {
            const popped = this.annotations[page].pop();
            this.redoStack[page] = this.redoStack[page] || [];
            this.redoStack[page].push(popped);
            this.redrawAnnotations();
            if (window.liquidEngine) window.liquidEngine.playWaterDrop(0.8);
        }
    }

    redo() {
        const page = this.currentPage;
        if (this.redoStack[page] && this.redoStack[page].length > 0) {
            const item = this.redoStack[page].pop();
            this.annotations[page].push(item);
            this.redrawAnnotations();
            if (window.liquidEngine) window.liquidEngine.playWaterDrop(1.2);
        }
    }

    changePage(delta) {
        const next = this.currentPage + delta;
        if (next >= 1 && next <= this.totalPages) {
            this.renderPage(next);
            if (window.liquidEngine) window.liquidEngine.playGlassTap();
        }
    }

    setZoom(newScale) {
        this.scale = Math.min(2.5, Math.max(0.75, newScale));
        this.renderPage(this.currentPage);
    }

    // --- DIGITAL SIGNATURE STUDIO MODAL ---
    initSignatureModal() {
        const sigCanvas = document.getElementById('signature-pad-canvas');
        if (!sigCanvas) return;
        const ctx = sigCanvas.getContext('2d');
        let signing = false;

        sigCanvas.addEventListener('pointerdown', (e) => {
            signing = true;
            const rect = sigCanvas.getBoundingClientRect();
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
        });

        sigCanvas.addEventListener('pointermove', (e) => {
            if (!signing) return;
            const rect = sigCanvas.getBoundingClientRect();
            ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
            ctx.stroke();
        });

        const stopSig = () => { signing = false; };
        sigCanvas.addEventListener('pointerup', stopSig);
        sigCanvas.addEventListener('pointerleave', stopSig);

        const clearBtn = document.getElementById('btn-clear-sig');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                ctx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
            });
        }

        const applyBtn = document.getElementById('btn-apply-sig');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                const dataUrl = sigCanvas.toDataURL('image/png');
                const img = new Image();
                img.onload = () => {
                    const page = this.currentPage;
                    this.annotations[page] = this.annotations[page] || [];
                    this.annotations[page].push({
                        type: 'image',
                        imgElement: img,
                        dataUrl: dataUrl,
                        x: 100,
                        y: 100,
                        w: 160,
                        h: 80
                    });
                    this.closeSignatureModal();
                    this.redrawAnnotations();
                    if (window.liquidEngine) window.liquidEngine.playWaterDrop(1.4);
                };
                img.src = dataUrl;
            });
        }
    }

    openSignatureModal() {
        const modal = document.getElementById('signature-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            const sigCanvas = document.getElementById('signature-pad-canvas');
            if (sigCanvas) {
                const ctx = sigCanvas.getContext('2d');
                ctx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
            }
        }
    }

    closeSignatureModal() {
        const modal = document.getElementById('signature-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    }

    // Apply quick stamp (e.g. APPROVED, CONFIDENTIAL)
    addStamp(stampText, color = '#10b981') {
        const page = this.currentPage;
        this.annotations[page] = this.annotations[page] || [];
        this.annotations[page].push({
            type: 'text',
            text: `[ ${stampText.toUpperCase()} ]`,
            x: 80,
            y: 80,
            w: 220,
            h: 40,
            fontSize: 22,
            fontFamily: 'Helvetica',
            color: color,
            bgColor: 'transparent'
        });
        this.redrawAnnotations();
        if (window.liquidEngine) window.liquidEngine.playWaterDrop(1.3);
    }

    // --- BURNING EDITS & EXPORTING ---
    async exportEditedPdf(progressCb) {
        if (!this.file || !this.arrayBuffer) return null;
        
        const freshDoc = await PDFDocument.load(this.arrayBuffer.slice(0));
        const fonts = {
            Helvetica: await freshDoc.embedFont(StandardFonts.HelveticaBold),
            TimesRoman: await freshDoc.embedFont(StandardFonts.TimesRomanBold),
            Courier: await freshDoc.embedFont(StandardFonts.CourierBold)
        };

        const pages = freshDoc.getPages();
        const total = pages.length;

        for (let pageNum = 1; pageNum <= total; pageNum++) {
            if (progressCb) progressCb(pageNum, total);
            const annots = this.annotations[pageNum];
            if (!annots || annots.length === 0) continue;

            const page = pages[pageNum - 1];
            const { width: pWidth, height: pHeight } = page.getSize();
            const scale = this.scale;

            for (const a of annots) {
                if (a.type === 'whiteout' || a.type === 'redact') {
                    const pdfX = a.x / scale;
                    const pdfY = pHeight - ((a.y + a.h) / scale);
                    const pdfW = a.w / scale;
                    const pdfH = a.h / scale;
                    const fillColor = a.type === 'whiteout' ? rgb(1, 1, 1) : rgb(0, 0, 0);

                    page.drawRectangle({
                        x: pdfX,
                        y: pdfY,
                        width: pdfW,
                        height: pdfH,
                        color: fillColor
                    });
                } else if (a.type === 'text') {
                    const pdfX = a.x / scale;
                    const pdfY = pHeight - ((a.y + a.h) / scale);
                    const pdfW = a.w / scale;
                    const pdfH = a.h / scale;

                    if (a.bgColor && a.bgColor !== 'transparent') {
                        page.drawRectangle({
                            x: pdfX,
                            y: pdfY,
                            width: pdfW,
                            height: pdfH,
                            color: rgb(1, 1, 1)
                        });
                    }

                    const selectedFont = fonts[a.fontFamily] || fonts.Helvetica;
                    const pdfFontSize = (a.fontSize / scale) * 0.95;
                    const fontColor = window.pdfEngine.hexToRgb(a.color || '#000000');

                    page.drawText(a.text, {
                        x: pdfX + 2,
                        y: pdfY + pdfH - pdfFontSize,
                        size: pdfFontSize,
                        font: selectedFont,
                        color: fontColor
                    });
                } else if (a.type === 'draw' || a.type === 'highlighter' || a.type === 'rect' || a.type === 'arrow') {
                    // Render high-res overlay canvas for vector-raster burn
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = pWidth * 2;
                    tempCanvas.height = pHeight * 2;
                    const tCtx = tempCanvas.getContext('2d');
                    tCtx.scale((pWidth * 2) / (pWidth * scale), (pHeight * 2) / (pHeight * scale));

                    if (a.type === 'draw') {
                        tCtx.strokeStyle = a.color;
                        tCtx.lineWidth = (a.width || 3) * scale;
                        tCtx.lineCap = 'round';
                        tCtx.lineJoin = 'round';
                        tCtx.beginPath();
                        a.points.forEach((pt, idx) => {
                            if (idx === 0) tCtx.moveTo(pt.x, pt.y);
                            else tCtx.lineTo(pt.x, pt.y);
                        });
                        tCtx.stroke();
                    } else if (a.type === 'highlighter') {
                        tCtx.strokeStyle = a.color;
                        tCtx.globalAlpha = 0.45;
                        tCtx.lineWidth = (a.width || 18) * scale;
                        tCtx.lineCap = 'square';
                        tCtx.beginPath();
                        a.points.forEach((pt, idx) => {
                            if (idx === 0) tCtx.moveTo(pt.x, pt.y);
                            else tCtx.lineTo(pt.x, pt.y);
                        });
                        tCtx.stroke();
                    } else if (a.type === 'rect') {
                        tCtx.strokeStyle = a.color;
                        tCtx.lineWidth = (a.width || 2.5) * scale;
                        tCtx.strokeRect(a.x, a.y, a.w, a.h);
                    } else if (a.type === 'arrow') {
                        this.drawArrow(tCtx, a.x1, a.y1, a.x2, a.y2, a.color, (a.width || 3) * scale);
                    }

                    const pngBytes = await (await fetch(tempCanvas.toDataURL('image/png'))).arrayBuffer();
                    const embeddedOverlay = await freshDoc.embedPng(pngBytes);
                    page.drawImage(embeddedOverlay, {
                        x: 0,
                        y: 0,
                        width: pWidth,
                        height: pHeight
                    });
                } else if (a.type === 'image' && a.dataUrl) {
                    const pngBytes = await (await fetch(a.dataUrl)).arrayBuffer();
                    const embeddedImg = await freshDoc.embedPng(pngBytes);
                    const pdfX = a.x / scale;
                    const pdfY = pHeight - ((a.y + a.h) / scale);
                    const pdfW = a.w / scale;
                    const pdfH = a.h / scale;

                    page.drawImage(embeddedImg, {
                        x: pdfX,
                        y: pdfY,
                        width: pdfW,
                        height: pdfH
                    });
                }
            }
        }

        return await freshDoc.save();
    }
}

// Global PDF Editor Studio instance
window.pdfEditor = new PdfEditorStudio();
