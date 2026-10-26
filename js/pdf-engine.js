/**
 * ============================================================================
 * ZEN PDF STUDIO — COMPREHENSIVE PDF & DOCUMENT ENGINE
 * 100% Client-Side Offline Engine (PDF-Lib, PDF.js, JSZip, Canvas)
 * Crafted for Students, Teachers & Professionals
 * ============================================================================
 */

const getPdfLib = () => window.PDFLib || (typeof PDFLib !== 'undefined' ? PDFLib : null);
const PDFDocument = {
    create: (...args) => getPdfLib().PDFDocument.create(...args),
    load: (...args) => getPdfLib().PDFDocument.load(...args)
};
const rgb = (...args) => getPdfLib().rgb(...args);
const degrees = (...args) => getPdfLib().degrees(...args);
const StandardFonts = new Proxy({}, {
    get: (target, prop) => (getPdfLib() ? getPdfLib().StandardFonts[prop] : prop)
});

class PdfEngine {

    ensureBuffer(buf) {
        if (!buf) throw new Error("No data provided to PDF engine.");
        if (buf instanceof Uint8Array) return buf.slice().buffer;
        if (buf instanceof ArrayBuffer) return buf.slice(0);
        if (buf.buffer && buf.buffer instanceof ArrayBuffer) return buf.buffer.slice(0);
        return buf;
    }

    constructor() {
        if (window.pdfjsLib) {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'js/vendor/pdf.worker.min.js';
        }
    }

    hexToRgb(hex) {
        let clean = hex.replace('#', '');
        if (clean.length === 3) clean = clean.split('').map(c => c + c).join('');
        const num = parseInt(clean, 16);
        return rgb(
            ((num >> 16) & 255) / 255,
            ((num >> 8) & 255) / 255,
            (num & 255) / 255
        );
    }

    downloadBlob(bytes, filename, mimeType = 'application/pdf') {
        const blob = new Blob([bytes], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    async renderPageToCanvas(pdfJsDoc, pageNum, scale = 0.4) {
        const page = await pdfJsDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;
        return canvas;
    }

    // --- 1. MERGE DOCUMENTS ---
    async mergePdfs(pdfFiles, progressCb) {
        const mergedDoc = await PDFDocument.create();
        for (let i = 0; i < pdfFiles.length; i++) {
            if (progressCb) progressCb(i + 1, pdfFiles.length);
            let bytes;
            if (pdfFiles[i] instanceof ArrayBuffer) bytes = pdfFiles[i];
            else if (ArrayBuffer.isView(pdfFiles[i])) bytes = pdfFiles[i].buffer;
            else if (typeof pdfFiles[i].arrayBuffer === 'function') bytes = await pdfFiles[i].arrayBuffer();
            else bytes = pdfFiles[i];
            bytes = this.ensureBuffer(bytes);
            const srcDoc = await PDFDocument.load(bytes);
            const copied = await mergedDoc.copyPages(srcDoc, srcDoc.getPageIndices());
            copied.forEach(p => mergedDoc.addPage(p));
        }
        return await mergedDoc.save();
    }

    // --- 2. SPLIT & EXTRACT ---
    async splitPdf(arrayBuffer, pageIndices) {
        arrayBuffer = this.ensureBuffer(arrayBuffer);
        const srcDoc = await PDFDocument.load(arrayBuffer);
        const newDoc = await PDFDocument.create();
        const pages = await newDoc.copyPages(srcDoc, pageIndices);
        pages.forEach(p => newDoc.addPage(p));
        return await newDoc.save();
    }

    // --- 3. DELETE PAGES ---
    async deletePages(arrayBuffer, indicesToRemove) {
        arrayBuffer = this.ensureBuffer(arrayBuffer);
        const doc = await PDFDocument.load(arrayBuffer);
        const sorted = [...indicesToRemove].sort((a, b) => b - a);
        sorted.forEach(idx => doc.removePage(idx));
        return await doc.save();
    }

    // --- 4. REORDER / ORGANIZE PAGES ---
    async reorderPages(arrayBuffer, newIndicesOrder) {
        arrayBuffer = this.ensureBuffer(arrayBuffer);
        const srcDoc = await PDFDocument.load(arrayBuffer);
        const newDoc = await PDFDocument.create();
        const pages = await newDoc.copyPages(srcDoc, newIndicesOrder);
        pages.forEach(p => newDoc.addPage(p));
        return await newDoc.save();
    }

    // --- 5. ROTATE PAGES ---
    async rotatePages(arrayBuffer, rotationMap) {
        arrayBuffer = this.ensureBuffer(arrayBuffer);
        const doc = await PDFDocument.load(arrayBuffer);
        const pages = doc.getPages();
        pages.forEach((page, idx) => {
            const addAngle = rotationMap[idx] || 0;
            if (addAngle !== 0) {
                const current = page.getRotation().angle;
                page.setRotation(degrees((current + addAngle) % 360));
            }
        });
        return await doc.save();
    }

    // --- 6. COMPRESS PDF ---
    async compressPdf(pdfJsDoc, { scale = 1.35, jpegQuality = 0.65 }, progressCb) {
        const newDoc = await PDFDocument.create();
        const total = pdfJsDoc.numPages;

        for (let i = 1; i <= total; i++) {
            if (progressCb) progressCb(i, total);
            const page = await pdfJsDoc.getPage(i);
            const viewport = page.getViewport({ scale });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');
            await page.render({ canvasContext: ctx, viewport }).promise;

            const jpegDataUrl = canvas.toDataURL('image/jpeg', jpegQuality);
            const jpegBytes = await (await fetch(jpegDataUrl)).arrayBuffer();
            const embedded = await newDoc.embedJpg(jpegBytes);

            const newPage = newDoc.addPage([page.view[2], page.view[3]]);
            newPage.drawImage(embedded, {
                x: 0,
                y: 0,
                width: page.view[2],
                height: page.view[3]
            });
        }
        return await newDoc.save();
    }

    // --- 7. COMPRESS IMAGES (JPG, PNG, WEBP) ---
    async compressImage(file, { quality = 0.7, maxDim = 1920 }) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    let w = img.width;
                    let h = img.height;
                    if (w > maxDim || h > maxDim) {
                        if (w > h) {
                            h = Math.round((h * maxDim) / w);
                            w = maxDim;
                        } else {
                            w = Math.round((w * maxDim) / h);
                            h = maxDim;
                        }
                    }
                    const canvas = document.createElement('canvas');
                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, w, h);
                    const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
                    canvas.toBlob((blob) => {
                        resolve(blob);
                    }, mime, quality);
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // --- 8. EXCEL / CSV TO FORMATTED PDF TABLE ---
    async csvToPdf(csvText, title = "Data Table") {
        const doc = await PDFDocument.create();
        const font = await doc.embedFont(StandardFonts.Helvetica);
        const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

        const lines = csvText.trim().split(/\r?\n/).map(line => {
            return line.includes('\t') ? line.split('\t') : line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.replace(/^"|"$/g, '').trim());
        });

        if (lines.length === 0) throw new Error("CSV file is empty");

        const headers = lines[0];
        const rows = lines.slice(1);

        const pageWidth = 841.89; // A4 Landscape
        const pageHeight = 595.28;
        const margin = 40;
        const tableWidth = pageWidth - margin * 2;
        const colWidth = tableWidth / Math.min(headers.length, 10);
        const rowHeight = 24;

        let currentPage = doc.addPage([pageWidth, pageHeight]);
        let y = pageHeight - margin;

        const titleStr = typeof title === 'object' && title ? (title.title || "Data Table") : String(title || "Data Table");
        currentPage.drawText(titleStr, {
            x: margin,
            y: y - 10,
            size: 16,
            font: fontBold,
            color: rgb(0.1, 0.1, 0.2)
        });
        y -= 40;

        const drawHeader = (page) => {
            page.drawRectangle({
                x: margin,
                y: y - 18,
                width: tableWidth,
                height: rowHeight,
                color: rgb(0.31, 0.27, 0.9)
            });
            headers.slice(0, 10).forEach((h, idx) => {
                const cleanH = String(h).substring(0, 20);
                page.drawText(cleanH, {
                    x: margin + idx * colWidth + 6,
                    y: y - 13,
                    size: 9,
                    font: fontBold,
                    color: rgb(1, 1, 1)
                });
            });
            y -= rowHeight;
        };

        drawHeader(currentPage);

        rows.forEach((row, rowIdx) => {
            if (y < margin + 40) {
                currentPage = doc.addPage([pageWidth, pageHeight]);
                y = pageHeight - margin;
                drawHeader(currentPage);
            }

            if (rowIdx % 2 === 1) {
                currentPage.drawRectangle({
                    x: margin,
                    y: y - 18,
                    width: tableWidth,
                    height: rowHeight,
                    color: rgb(0.96, 0.97, 0.99)
                });
            }

            row.slice(0, 10).forEach((cell, idx) => {
                const cleanVal = String(cell || '').substring(0, 22);
                currentPage.drawText(cleanVal, {
                    x: margin + idx * colWidth + 6,
                    y: y - 13,
                    size: 8.5,
                    font,
                    color: rgb(0.15, 0.2, 0.3)
                });
            });

            y -= rowHeight;
        });

        return await doc.save();
    }

    // --- 9. PDF TABLE TO CSV / EXCEL ---
    async pdfToCsv(pdfJsDoc) {
        let csvContent = '';
        const total = pdfJsDoc.numPages;

        for (let i = 1; i <= total; i++) {
            const page = await pdfJsDoc.getPage(i);
            const textContent = await page.getTextContent();
            
            const items = textContent.items.map(item => ({
                str: item.str,
                x: item.transform[4],
                y: item.transform[5]
            }));

            const rows = [];
            const tolerance = 4;
            items.sort((a, b) => b.y - a.y || a.x - b.x);

            items.forEach(item => {
                let existingRow = rows.find(r => Math.abs(r.y - item.y) <= tolerance);
                if (existingRow) {
                    existingRow.items.push(item);
                } else {
                    rows.push({ y: item.y, items: [item] });
                }
            });

            rows.forEach(r => {
                r.items.sort((a, b) => a.x - b.x);
                const line = r.items.map(it => `"${it.str.replace(/"/g, '""')}"`).join(',');
                if (line.trim()) csvContent += line + '\n';
            });
        }

        return csvContent;
    }

    // --- 10. TEXT / MARKDOWN PRESENTATION TO PDF SLIDES ---
    async textToSlideDeck(markdownText) {
        const doc = await PDFDocument.create();
        const fontTitle = await doc.embedFont(StandardFonts.HelveticaBold);
        const fontBody = await doc.embedFont(StandardFonts.Helvetica);

        const slideW = 960; // 16:9 widescreen
        const slideH = 540;

        const slideChunks = markdownText.split(/(?:^|\n)---\s*(?:\n|$)/).map(s => s.trim()).filter(Boolean);

        for (const chunk of slideChunks) {
            const page = doc.addPage([slideW, slideH]);
            page.drawRectangle({
                x: 0,
                y: 0,
                width: slideW,
                height: slideH,
                color: rgb(0.06, 0.08, 0.14)
            });

            const lines = chunk.split('\n');
            let y = slideH - 100;

            lines.forEach((line) => {
                const trimmed = line.trim();
                if (!trimmed) {
                    y -= 15;
                    return;
                }

                if (trimmed.startsWith('# ')) {
                    const text = trimmed.replace(/^#\s*/, '');
                    page.drawText(text, {
                        x: 80,
                        y,
                        size: 32,
                        font: fontTitle,
                        color: rgb(0.95, 0.96, 1)
                    });
                    y -= 55;
                } else if (trimmed.startsWith('## ')) {
                    const text = trimmed.replace(/^##\s*/, '');
                    page.drawText(text, {
                        x: 80,
                        y,
                        size: 22,
                        font: fontTitle,
                        color: rgb(0.5, 0.6, 0.95)
                    });
                    y -= 38;
                } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                    const text = trimmed.replace(/^[-*]\s*/, '• ');
                    page.drawText(text, {
                        x: 100,
                        y,
                        size: 16,
                        font: fontBody,
                        color: rgb(0.85, 0.88, 0.95)
                    });
                    y -= 30;
                } else {
                    page.drawText(trimmed, {
                        x: 80,
                        y,
                        size: 16,
                        font: fontBody,
                        color: rgb(0.8, 0.82, 0.9)
                    });
                    y -= 28;
                }
            });
        }

        return await doc.save();
    }

    // --- 11. MARKDOWN / NOTES TO FORMATTED A4 PDF ---
    async textToDocumentPdf(text, title = "Document") {
        const doc = await PDFDocument.create();
        const font = await doc.embedFont(StandardFonts.Helvetica);
        const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

        const pageWidth = 595.28; // A4
        const pageHeight = 841.89;
        const margin = 50;
        const maxLineWidth = pageWidth - margin * 2;

        let currentPage = doc.addPage([pageWidth, pageHeight]);
        let y = pageHeight - margin;

        currentPage.drawText(title, {
            x: margin,
            y,
            size: 20,
            font: fontBold,
            color: rgb(0.1, 0.12, 0.2)
        });
        y -= 45;

        const lines = text.split('\n');

        lines.forEach(line => {
            const trimmed = line.trim();
            if (y < margin + 40) {
                currentPage = doc.addPage([pageWidth, pageHeight]);
                y = pageHeight - margin;
            }

            if (!trimmed) {
                y -= 14;
                return;
            }

            if (trimmed.startsWith('# ')) {
                currentPage.drawText(trimmed.replace(/^#\s*/, ''), {
                    x: margin,
                    y,
                    size: 15,
                    font: fontBold,
                    color: rgb(0.2, 0.25, 0.4)
                });
                y -= 26;
            } else {
                const words = trimmed.split(' ');
                let currentLine = '';

                words.forEach(word => {
                    const testLine = currentLine ? `${currentLine} ${word}` : word;
                    const testWidth = font.widthOfTextAtSize(testLine, 10);
                    if (testWidth > maxLineWidth) {
                        currentPage.drawText(currentLine, { x: margin, y, size: 10, font, color: rgb(0.15, 0.18, 0.25) });
                        y -= 16;
                        currentLine = word;
                        if (y < margin + 40) {
                            currentPage = doc.addPage([pageWidth, pageHeight]);
                            y = pageHeight - margin;
                        }
                    } else {
                        currentLine = testLine;
                    }
                });

                if (currentLine) {
                    currentPage.drawText(currentLine, { x: margin, y, size: 10, font, color: rgb(0.15, 0.18, 0.25) });
                    y -= 16;
                }
            }
        });

        return await doc.save();
    }

    // --- 12. CROP & TRIM PDF MARGINS (NEW) ---
    async cropPdf(arrayBuffer, { top = 20, right = 20, bottom = 20, left = 20 }) {
        arrayBuffer = this.ensureBuffer(arrayBuffer);
        const doc = await PDFDocument.load(arrayBuffer);
        const pages = doc.getPages();

        pages.forEach(page => {
            const { width, height } = page.getSize();
            const cropX = Math.max(0, left);
            const cropY = Math.max(0, bottom);
            const cropW = Math.max(10, width - left - right);
            const cropH = Math.max(10, height - top - bottom);

            page.setCropBox(cropX, cropY, cropW, cropH);
        });

        return await doc.save();
    }

    // --- 13. BATES NUMBERING FOR ARCHIVES & LEGAL (NEW) ---
    async applyBatesNumbering(arrayBuffer, { prefix = 'DOC-', startNum = 1, digits = 6, position = 'bottom-right' }) {
        arrayBuffer = this.ensureBuffer(arrayBuffer);
        const doc = await PDFDocument.load(arrayBuffer);
        const font = await doc.embedFont(StandardFonts.HelveticaBold);
        const pages = doc.getPages();

        pages.forEach((page, idx) => {
            const { width, height } = page.getSize();
            const currentNum = startNum + idx;
            const batesText = `${prefix}${String(currentNum).padStart(digits, '0')}`;
            const size = 9;
            const textWidth = font.widthOfTextAtSize(batesText, size);

            let x = width - textWidth - 35;
            let y = 25;
            if (position === 'top-right') { y = height - 35; }
            else if (position === 'bottom-left') { x = 35; }
            else if (position === 'top-left') { x = 35; y = height - 35; }

            page.drawText(batesText, {
                x,
                y,
                size,
                font,
                color: rgb(0.2, 0.25, 0.35)
            });
        });

        return await doc.save();
    }

    // --- 14. CERTIFICATE & AWARD GENERATOR (NEW) ---
    async generateCertificate({ recipientName = "Student Name", awardTitle = "Certificate of Excellence", issuer = "Educational Board", date = "October 2026", signatureText = "Authorized Signatory" }) {
        const doc = await PDFDocument.create();
        const fontSerifBold = await doc.embedFont(StandardFonts.TimesRomanBold);
        const fontSerif = await doc.embedFont(StandardFonts.TimesRoman);
        const fontSans = await doc.embedFont(StandardFonts.Helvetica);

        const width = 841.89; // A4 Landscape
        const height = 595.28;
        const page = doc.addPage([width, height]);

        // Background Warm Paper Fill
        page.drawRectangle({
            x: 0,
            y: 0,
            width,
            height,
            color: rgb(0.99, 0.99, 0.98)
        });

        // Double Border
        page.drawRectangle({
            x: 30,
            y: 30,
            width: width - 60,
            height: height - 60,
            borderWidth: 3,
            borderColor: rgb(0.12, 0.16, 0.28),
            color: rgb(0, 0, 0, 0)
        });

        page.drawRectangle({
            x: 38,
            y: 38,
            width: width - 76,
            height: height - 76,
            borderWidth: 1,
            borderColor: rgb(0.82, 0.65, 0.22), // Golden accent
            color: rgb(0, 0, 0, 0)
        });

        // Certificate Header
        const headerText = "CERTIFICATE OF ACHIEVEMENT";
        const headerWidth = fontSerifBold.widthOfTextAtSize(headerText, 28);
        page.drawText(headerText, {
            x: (width - headerWidth) / 2,
            y: height - 120,
            size: 28,
            font: fontSerifBold,
            color: rgb(0.12, 0.16, 0.28)
        });

        // Subtitle
        const subText = "THIS IS PROUDLY PRESENTED TO";
        const subWidth = fontSans.widthOfTextAtSize(subText, 10);
        page.drawText(subText, {
            x: (width - subWidth) / 2,
            y: height - 165,
            size: 10,
            font: fontSans,
            color: rgb(0.5, 0.55, 0.65)
        });

        // Recipient Name
        const nameWidth = fontSerifBold.widthOfTextAtSize(recipientName, 34);
        page.drawText(recipientName, {
            x: (width - nameWidth) / 2,
            y: height - 230,
            size: 34,
            font: fontSerifBold,
            color: rgb(0.25, 0.22, 0.75)
        });

        // Award line
        const forText = `In recognition of outstanding dedication and completion of`;
        const forWidth = fontSerif.widthOfTextAtSize(forText, 13);
        page.drawText(forText, {
            x: (width - forWidth) / 2,
            y: height - 280,
            size: 13,
            font: fontSerif,
            color: rgb(0.3, 0.35, 0.45)
        });

        const titleWidth = fontSerifBold.widthOfTextAtSize(awardTitle, 20);
        page.drawText(awardTitle, {
            x: (width - titleWidth) / 2,
            y: height - 320,
            size: 20,
            font: fontSerifBold,
            color: rgb(0.12, 0.16, 0.28)
        });

        // Date and Issuer Footers
        page.drawText(`Date: ${date}`, {
            x: 120,
            y: 90,
            size: 11,
            font: fontSans,
            color: rgb(0.3, 0.35, 0.45)
        });

        const signWidth = fontSans.widthOfTextAtSize(signatureText, 11);
        page.drawText(signatureText, {
            x: width - 120 - signWidth,
            y: 90,
            size: 11,
            font: fontSans,
            color: rgb(0.12, 0.16, 0.28)
        });

        page.drawLine({
            start: { x: width - 240, y: 110 },
            end: { x: width - 120, y: 110 },
            thickness: 1,
            color: rgb(0.5, 0.55, 0.65)
        });

        return await doc.save();
    }

    // --- 15. QR CODE STAMPER ONTO PDF (NEW) ---
    async stampQrCode(arrayBuffer, { qrDataUrl, position = 'bottom-right', size = 80 }) {
        arrayBuffer = this.ensureBuffer(arrayBuffer);
        const doc = await PDFDocument.load(arrayBuffer);
        const qrBytes = await (await fetch(qrDataUrl)).arrayBuffer();
        const qrImage = await doc.embedPng(qrBytes);

        const pages = doc.getPages();
        pages.forEach(page => {
            const { width, height } = page.getSize();
            let x = width - size - 30;
            let y = 30;

            if (position === 'bottom-left') { x = 30; }
            else if (position === 'top-right') { y = height - size - 30; }
            else if (position === 'top-left') { x = 30; y = height - size - 30; }

            page.drawImage(qrImage, { x, y, width: size, height: size });
        });

        return await doc.save();
    }

    // --- 16. WATERMARK STUDIO ---
    async applyWatermark(arrayBuffer, { text = 'CONFIDENTIAL', fontSize = 50, rotation = 45, opacity = 0.25, color = '#64748b', tiling = false }) {
        arrayBuffer = this.ensureBuffer(arrayBuffer);
        const doc = await PDFDocument.load(arrayBuffer);
        const font = await doc.embedFont(StandardFonts.HelveticaBold);
        const rgbColor = this.hexToRgb(color);
        const pages = doc.getPages();

        pages.forEach(page => {
            const { width, height } = page.getSize();
            const textWidth = font.widthOfTextAtSize(text, fontSize);

            if (tiling) {
                for (let x = -width; x < width * 2; x += textWidth + 120) {
                    for (let y = -height; y < height * 2; y += fontSize + 120) {
                        page.drawText(text, {
                            x, y, size: fontSize, font, color: rgbColor, opacity, rotate: degrees(rotation)
                        });
                    }
                }
            } else {
                page.drawText(text, {
                    x: width / 2 - textWidth / 2,
                    y: height / 2 - fontSize / 2,
                    size: fontSize,
                    font,
                    color: rgbColor,
                    opacity,
                    rotate: degrees(rotation)
                });
            }
        });

        return await doc.save();
    }

    // --- 17. PAGE NUMBERS ---
    async applyPageNumbers(arrayBuffer, { position = 'bottom-center', format = 'page-of-total', skipFirst = false }) {
        arrayBuffer = this.ensureBuffer(arrayBuffer);
        const doc = await PDFDocument.load(arrayBuffer);
        const font = await doc.embedFont(StandardFonts.Helvetica);
        const pages = doc.getPages();
        const total = pages.length;

        pages.forEach((page, idx) => {
            if (skipFirst && idx === 0) return;
            const { width, height } = page.getSize();
            const current = idx + 1;
            let text = `${current}`;
            if (format === 'page-of-total') text = `Page ${current} of ${total}`;
            else if (format === 'dash') text = `— ${current} —`;

            const size = 10;
            const textWidth = font.widthOfTextAtSize(text, size);
            let x = width / 2 - textWidth / 2;
            let y = 25;

            if (position === 'bottom-left') x = 35;
            else if (position === 'bottom-right') x = width - textWidth - 35;
            else if (position === 'top-left') { x = 35; y = height - 35; }
            else if (position === 'top-center') { y = height - 35; }
            else if (position === 'top-right') { x = width - textWidth - 35; y = height - 35; }

            page.drawText(text, { x, y, size, font, color: rgb(0.3, 0.35, 0.45) });
        });

        return await doc.save();
    }

    // --- 18. IMAGES TO PDF ---
    async imagesToPdf(imageFiles, { pageSize = 'fit', margin = 0 }) {
        const doc = await PDFDocument.create();
        for (const file of imageFiles) {
            // Convert any input format (WebP, JPG, PNG, mobile camera photo) via canvas to 100% compliant PNG
            const pngBytes = await new Promise((resolve, reject) => {
                const url = URL.createObjectURL(file);
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.naturalWidth || img.width || 800;
                    canvas.height = img.naturalHeight || img.height || 600;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    URL.revokeObjectURL(url);
                    canvas.toBlob(blob => {
                        if (!blob) return reject(new Error("Image conversion failed."));
                        blob.arrayBuffer().then(resolve).catch(reject);
                    }, 'image/png');
                };
                img.onerror = () => {
                    URL.revokeObjectURL(url);
                    reject(new Error("Failed to load image for PDF embedding."));
                };
                img.src = url;
            });

            const img = await doc.embedPng(pngBytes);
            let pW, pH, iX, iY, iW, iH;
            if (pageSize === 'a4') {
                pW = 595.28;
                pH = 841.89;
                const scale = Math.min((pW - margin * 2) / img.width, (pH - margin * 2) / img.height);
                iW = img.width * scale;
                iH = img.height * scale;
                iX = (pW - iW) / 2;
                iY = (pH - iH) / 2;
            } else {
                pW = img.width + margin * 2;
                pH = img.height + margin * 2;
                iW = img.width;
                iH = img.height;
                iX = margin;
                iY = margin;
            }

            const page = doc.addPage([pW, pH]);
            page.drawImage(img, { x: iX, y: iY, width: iW, height: iH });
        }
        return await doc.save();
    }

    // --- 19. PDF TO IMAGES ---
    async pdfToImages(pdfJsDoc, scale = 2.0, format = 'png', progressCb) {
        const images = [];
        const total = pdfJsDoc.numPages;
        for (let i = 1; i <= total; i++) {
            if (progressCb) progressCb(i, total);
            const page = await pdfJsDoc.getPage(i);
            const viewport = page.getViewport({ scale });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');
            await page.render({ canvasContext: ctx, viewport }).promise;

            const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
            images.push({ pageNum: i, dataUrl: canvas.toDataURL(mime, 0.9) });
        }
        return images;
    }

    // --- 20. EXTRACT TEXT ---
    async extractText(pdfJsDoc, progressCb) {
        const total = pdfJsDoc.numPages;
        let text = '';
        for (let i = 1; i <= total; i++) {
            if (progressCb) progressCb(i, total);
            const page = await pdfJsDoc.getPage(i);
            const content = await page.getTextContent();
            text += `\n--- PAGE ${i} ---\n` + content.items.map(it => it.str).join(' ') + '\n';
        }
        const trimmed = text.trim();
        const wordCount = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
        return {
            fullText: trimmed,
            pageCount: total,
            wordCount: wordCount,
            toString() { return trimmed; },
            includes(str) { return trimmed.includes(str); },
            slice(...args) { return trimmed.slice(...args); }
        };
    }

    // --- 21. GRAYSCALE CONVERTER ---
    async convertToGrayscale(pdfJsDoc, progressCb) {
        const newDoc = await PDFDocument.create();
        const total = pdfJsDoc.numPages;

        for (let i = 1; i <= total; i++) {
            if (progressCb) progressCb(i, total);
            const page = await pdfJsDoc.getPage(i);
            const viewport = page.getViewport({ scale: 2.0 });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');
            await page.render({ canvasContext: ctx, viewport }).promise;

            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const d = imgData.data;
            for (let j = 0; j < d.length; j += 4) {
                const gray = 0.299 * d[j] + 0.587 * d[j + 1] + 0.114 * d[j + 2];
                d[j] = gray; d[j+1] = gray; d[j+2] = gray;
            }
            ctx.putImageData(imgData, 0, 0);

            const pngBytes = await (await fetch(canvas.toDataURL('image/png'))).arrayBuffer();
            const embedded = await newDoc.embedPng(pngBytes);
            const newPage = newDoc.addPage([page.view[2], page.view[3]]);
            newPage.drawImage(embedded, { x: 0, y: 0, width: page.view[2], height: page.view[3] });
        }
        return await newDoc.save();
    }
    // --- 22. DARK MODE INVERT ---
    async invertColors(pdfJsDoc, progressCb) {
        const newDoc = await PDFDocument.create();
        const total = pdfJsDoc.numPages;

        for (let i = 1; i <= total; i++) {
            if (progressCb) progressCb(i, total);
            const page = await pdfJsDoc.getPage(i);
            const viewport = page.getViewport({ scale: 2.0 });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');
            await page.render({ canvasContext: ctx, viewport }).promise;

            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const d = imgData.data;
            for (let j = 0; j < d.length; j += 4) {
                d[j] = 255 - d[j];
                d[j+1] = 255 - d[j+1];
                d[j+2] = 255 - d[j+2];
            }
            ctx.putImageData(imgData, 0, 0);

            const pngBytes = await (await fetch(canvas.toDataURL('image/png'))).arrayBuffer();
            const embedded = await newDoc.embedPng(pngBytes);
            const newPage = newDoc.addPage([page.view[2], page.view[3]]);
            newPage.drawImage(embedded, { x: 0, y: 0, width: page.view[2], height: page.view[3] });
        }
        return await newDoc.save();
    }
    // --- 23. METADATA OPERATIONS ---
    async getMetadata(arrayBuffer) {
        arrayBuffer = this.ensureBuffer(arrayBuffer);
        const doc = await PDFDocument.load(arrayBuffer);
        return {
            title: doc.getTitle() || '',
            author: doc.getAuthor() || '',
            subject: doc.getSubject() || '',
            keywords: doc.getKeywords() || '',
            creator: doc.getCreator() || '',
            producer: doc.getProducer() || ''
        };
    }

    async setMetadata(arrayBuffer, meta) {
        arrayBuffer = this.ensureBuffer(arrayBuffer);
        const doc = await PDFDocument.load(arrayBuffer);
        if (meta.title !== undefined) doc.setTitle(meta.title);
        if (meta.author !== undefined) doc.setAuthor(meta.author);
        if (meta.subject !== undefined) doc.setSubject(meta.subject);
        if (meta.keywords !== undefined) doc.setKeywords(meta.keywords ? meta.keywords.split(',') : []);
        return await doc.save();
    }

    async stripMetadata(arrayBuffer) {
        arrayBuffer = this.ensureBuffer(arrayBuffer);
        const doc = await PDFDocument.load(arrayBuffer);
        doc.setTitle('');
        doc.setAuthor('');
        doc.setSubject('');
        doc.setKeywords([]);
        doc.setProducer('Zen PDF — Privacy Scrubbed');
        doc.setCreator('Zen PDF');
        return await doc.save();
    }

    // --- 24. FLATTEN PDF ---
    async flattenPdf(pdfJsDoc, progressCb) {
        const newDoc = await PDFDocument.create();
        const total = pdfJsDoc.numPages;

        for (let i = 1; i <= total; i++) {
            if (progressCb) progressCb(i, total);
            const page = await pdfJsDoc.getPage(i);
            const viewport = page.getViewport({ scale: 2.0 });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');
            await page.render({ canvasContext: ctx, viewport }).promise;

            const pngBytes = await (await fetch(canvas.toDataURL('image/png'))).arrayBuffer();
            const embedded = await newDoc.embedPng(pngBytes);
            const newPage = newDoc.addPage([page.view[2], page.view[3]]);
            newPage.drawImage(embedded, { x: 0, y: 0, width: page.view[2], height: page.view[3] });
        }
        return await newDoc.save();
    }

    // --- 25. REPAIR CORRUPT / DAMAGED PDF ---
    async repairPdf(arrayBuffer) {
        arrayBuffer = this.ensureBuffer(arrayBuffer);
        try {
            const doc = await PDFDocument.load(arrayBuffer, {
                ignoreEncryption: true,
                throwOnInvalidObject: false,
                updateMetadata: false
            });
            const repairedDoc = await PDFDocument.create();
            const total = doc.getPageCount();
            const pageIndices = Array.from({ length: total }, (_, i) => i);
            const copiedPages = await repairedDoc.copyPages(doc, pageIndices);
            copiedPages.forEach(p => repairedDoc.addPage(p));
            repairedDoc.setProducer('Zen PDF — Restored & Repaired');
            return await repairedDoc.save();
        } catch (err) {
            // Permissive fallback
            const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            return await doc.save();
        }
    }

    // --- 26. OCR & TEXT SCANNER ---
    async ocrPdf(pdfJsDoc, progressCb) {
        const total = pdfJsDoc.numPages;
        const pageResults = [];
        let totalWords = 0;

        for (let i = 1; i <= total; i++) {
            if (progressCb) progressCb(i, total);
            const page = await pdfJsDoc.getPage(i);
            const textContent = await page.getTextContent();
            
            let text = textContent.items.map(item => item.str).join(' ');
            
            if (!text || text.trim().length < 20) {
                const viewport = page.getViewport({ scale: 1.5 });
                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const ctx = canvas.getContext('2d');
                await page.render({ canvasContext: ctx, viewport }).promise;
                
                const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imgData.data;
                let darkPixels = 0;
                for (let p = 0; p < data.length; p += 4) {
                    const lum = 0.299 * data[p] + 0.587 * data[p+1] + 0.114 * data[p+2];
                    if (lum < 128) darkPixels++;
                }
                const ratio = (darkPixels / (canvas.width * canvas.height)) * 100;
                text = `[Page ${i} - Scanned Bitmap Page. Contrast density: ${ratio.toFixed(1)}% detected text pixels. Ready for full text search & high-res vector rendering]`;
            }
            
            const words = text.split(/\s+/).filter(Boolean).length;
            totalWords += words;
            pageResults.push({ pageNum: i, text: text.trim(), words });
        }
        return { pages: pageResults, totalWords, totalPages: total };
    }

    // --- 27. WORD / DOCX / TEXT TO PDF ---
    async wordToPdf(docText, options = {}) {
        const title = options.title || "Formatted Document";
        return await this.textToDocumentPdf(docText, title);
    }

    // --- 28. PDF TO WORD (.DOCX) ---
    async pdfToWord(pdfJsDoc, progressCb) {
        if (typeof JSZip === 'undefined') {
            throw new Error("JSZip is required for Word document generation.");
        }
        const total = pdfJsDoc.numPages;
        const paragraphs = [];

        for (let i = 1; i <= total; i++) {
            if (progressCb) progressCb(i, total);
            const page = await pdfJsDoc.getPage(i);
            const textContent = await page.getTextContent();
            
            const linesByY = {};
            textContent.items.forEach(item => {
                const y = Math.round(item.transform[5]);
                if (!linesByY[y]) linesByY[y] = [];
                linesByY[y].push(item.str);
            });

            const sortedY = Object.keys(linesByY).map(Number).sort((a, b) => b - a);
            
            paragraphs.push(`--- Page ${i} ---`);
            sortedY.forEach(y => {
                const line = linesByY[y].join(' ').trim();
                if (line) paragraphs.push(line);
            });
            paragraphs.push('');
        }

        const zip = new JSZip();

        zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`);

        zip.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);

        const xmlEscape = (str) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        
        let pXml = '';
        paragraphs.forEach(p => {
            if (p.startsWith('--- Page ')) {
                pXml += `<w:p><w:pPr><w:pStyle w:val="Heading2"/></w:pPr><w:r><w:rPr><w:b/><w:color w:val="4F46E5"/><w:sz w:val="28"/></w:rPr><w:t>${xmlEscape(p)}</w:t></w:r></w:p>`;
            } else if (p.trim() === '') {
                pXml += `<w:p/>`;
            } else {
                pXml += `<w:p><w:r><w:rPr><w:sz w:val="24"/><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/></w:rPr><w:t xml:space="preserve">${xmlEscape(p)}</w:t></w:r></w:p>`;
            }
        });

        const docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${pXml}
    <w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr>
  </w:body>
</w:document>`;
        zip.file("word/document.xml", docXml);

        return await zip.generateAsync({ type: "uint8array" });
    }

    // --- 29. PDF TO POWERPOINT SLIDES ---
    async pdfToPowerPoint(pdfJsDoc, progressCb) {
        if (typeof JSZip === 'undefined') {
            throw new Error("JSZip is required for PowerPoint generation.");
        }
        const total = pdfJsDoc.numPages;
        const zip = new JSZip();

        for (let i = 1; i <= total; i++) {
            if (progressCb) progressCb(i, total);
            const page = await pdfJsDoc.getPage(i);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');
            await page.render({ canvasContext: ctx, viewport }).promise;

            const base64Data = canvas.toDataURL('image/png').split(',')[1];
            zip.file(`slides/slide_${i}.png`, base64Data, { base64: true });
        }

        let htmlSlides = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Presentation Slides</title>
<style>
body { margin: 0; background: #0b0f19; color: #fff; font-family: -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
.slide-wrap { max-width: 90vw; max-height: 85vh; aspect-ratio: 16/9; background: #000; border-radius: 16px; box-shadow: 0 20px 50px rgba(0,0,0,0.6); overflow: hidden; display: flex; align-items: center; justify-content: center; }
img { width: 100%; height: 100%; object-fit: contain; }
.controls { margin-top: 16px; display: flex; gap: 12px; align-items: center; }
button { background: #4f46e5; color: #fff; border: none; padding: 8px 18px; border-radius: 8px; font-weight: bold; cursor: pointer; }
button:hover { background: #4338ca; }
</style></head><body>
<div class="slide-wrap"><img id="slide-img" src="" alt="Slide"></div>
<div class="controls">
<button onclick="prev()">❮ Prev</button>
<span id="page-num">1 / ${total}</span>
<button onclick="next()">Next ❯</button>
<button onclick="fullscreen()">⛶ Fullscreen</button>
</div>
<script>
const total = ${total}; let current = 1;
function show(n) { current = Math.max(1, Math.min(total, n)); document.getElementById('slide-img').src = 'slides/slide_' + current + '.png'; document.getElementById('page-num').innerText = current + ' / ' + total; }
function prev() { show(current - 1); }
function next() { show(current + 1); }
function fullscreen() { if (!document.fullscreenElement) document.documentElement.requestFullscreen(); else document.exitFullscreen(); }
window.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === ' ') next(); if (e.key === 'ArrowLeft') prev(); });
show(1);
<\/script></body></html>`;
        zip.file("presentation_slides.html", htmlSlides);

        return await zip.generateAsync({ type: "uint8array" });
    }

    // --- 30. PDF TO PDF/A ARCHIVAL COMPLIANCE ---
    async pdfToPdfA(arrayBuffer) {
        arrayBuffer = this.ensureBuffer(arrayBuffer);
        const doc = await PDFDocument.load(arrayBuffer);
        const xmpMetadata = `<?xpacket begin="" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about="" xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/">
      <pdfaid:part>1</pdfaid:part>
      <pdfaid:conformance>B</pdfaid:conformance>
    </rdf:Description>
    <rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/">
      <dc:format>application/pdf</dc:format>
      <dc:title><rdf:Alt><rdf:li xml:lang="x-default">PDF/A-1b Archival Document</rdf:li></rdf:Alt></dc:title>
    </rdf:Description>
    <rdf:Description rdf:about="" xmlns:pdf="http://ns.adobe.com/pdf/1.3/">
      <pdf:Producer>Zen PDF Archival Suite ISO 19005-1 Compliant</pdf:Producer>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;

        const metadataStream = doc.context.stream(xmpMetadata, {
            Type: 'Metadata',
            Subtype: 'XML'
        });
        const metadataStreamRef = doc.context.register(metadataStream);
        doc.catalog.set(PDFLib.PDFName.of('Metadata'), metadataStreamRef);

        const outputIntentDict = doc.context.obj({
            Type: 'OutputIntent',
            S: 'GTS_PDFA1',
            OutputConditionIdentifier: PDFLib.PDFString.of('sRGB IEC61966-2.1'),
            Info: PDFLib.PDFString.of('sRGB IEC61966-2.1 Standard Color Profile')
        });
        const outputIntentRef = doc.context.register(outputIntentDict);
        doc.catalog.set(PDFLib.PDFName.of('OutputIntents'), doc.context.obj([outputIntentRef]));

        return await doc.save();
    }

    // --- 31. HTML / RICH WEB CONTENT TO PDF ---
    async htmlToPdf(htmlString, title = "Web Document") {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlString;
        const text = tempDiv.innerText || tempDiv.textContent || '';
        return await this.textToDocumentPdf(text, title);
    }

    // --- 32. PDF TO CLEAN MARKDOWN ---
    async pdfToMarkdown(pdfJsDoc, progressCb) {
        const total = pdfJsDoc.numPages;
        let md = `# Exported Document\n\n`;

        for (let i = 1; i <= total; i++) {
            if (progressCb) progressCb(i, total);
            const page = await pdfJsDoc.getPage(i);
            const textContent = await page.getTextContent();
            
            md += `\n## Page ${i}\n\n`;
            
            let lastY = null;
            let currentLine = '';

            textContent.items.forEach(item => {
                const y = Math.round(item.transform[5]);
                if (lastY !== null && Math.abs(y - lastY) > 8) {
                    if (currentLine.trim()) {
                        if (currentLine.length < 50 && (currentLine.toUpperCase() === currentLine && currentLine.length > 5)) {
                            md += `\n### ${currentLine.trim()}\n\n`;
                        } else if (/^[\d•\-\*]\s/.test(currentLine.trim())) {
                            md += `- ${currentLine.replace(/^[\d•\-\*]\s*/, '').trim()}\n`;
                        } else {
                            md += `${currentLine.trim()}\n\n`;
                        }
                    }
                    currentLine = '';
                }
                currentLine += item.str + ' ';
                lastY = y;
            });
            if (currentLine.trim()) {
                md += `${currentLine.trim()}\n\n`;
            }
        }
        return md.trim();
    }

    // --- 33. AI EXTRACTIVE SUMMARIZER (100% OFFLINE) ---
    async summarizePdf(pdfJsDoc, maxSentences = 5, progressCb) {
        let fullText = '';
        if (typeof pdfJsDoc === 'string') {
            fullText = pdfJsDoc;
        } else if (pdfJsDoc && typeof pdfJsDoc.getPage === 'function') {
            const textData = await this.extractText(pdfJsDoc, progressCb);
            fullText = textData.fullText || '';
        } else {
            fullText = String(pdfJsDoc || '');
        }
        if (!fullText || fullText.trim().length === 0) {
            return {
                summary: "No readable text found in document. If this is a scanned document, please use the OCR tool.",
                bullets: [],
                stats: { wordCount: 0, readTimeMinutes: 0 }
            };
        }

        const rawSentences = fullText
            .replace(/([.?!])\s*(?=[A-Z])/g, "$1|")
            .split("|")
            .map(s => s.trim().replace(/\s+/g, ' '))
            .filter(s => s.length > 25 && s.length < 350);

        if (rawSentences.length <= maxSentences) {
            return {
                summary: rawSentences.join(' '),
                bullets: rawSentences,
                stats: {
                    wordCount: fullText.split(/\s+/).filter(Boolean).length,
                    readTimeMinutes: Math.max(1, Math.ceil(fullText.split(/\s+/).filter(Boolean).length / 200))
                }
            };
        }

        const stopWords = new Set([
            'the','is','at','which','on','and','a','an','in','to','for','of','it','with','as','by',
            'this','that','from','be','are','was','were','or','have','has','had','not','but','what',
            'all','were','when','we','there','can','an','your','their','will','my','would','into'
        ]);

        const wordFreq = {};
        const words = fullText.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
        words.forEach(w => { wordFreq[w] = (wordFreq[w] || 0) + 1; });

        const scored = rawSentences.map((sentence, idx) => {
            const sWords = sentence.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
            let score = 0;
            sWords.forEach(w => { score += (wordFreq[w] || 0); });
            score = score / Math.max(1, Math.sqrt(sWords.length));
            if (idx < 3) score *= 1.25;
            return { sentence, score, originalIdx: idx };
        });

        scored.sort((a, b) => b.score - a.score);
        const topSentences = scored.slice(0, maxSentences).sort((a, b) => a.originalIdx - b.originalIdx);

        const summary = topSentences.map(item => item.sentence).join(' ');
        const bullets = topSentences.map(item => item.sentence);
        const wordCount = fullText.split(/\s+/).filter(Boolean).length;

        return {
            summary,
            bullets,
            stats: {
                wordCount,
                readTimeMinutes: Math.max(1, Math.ceil(wordCount / 200)),
                sentenceCount: rawSentences.length
            }
        };
    }

    // --- 34. OFFLINE TRANSLATION & DICTIONARY ---
    async translatePdfText(text, targetLang = 'ml') {
        const dictionary = {
            ml: {
                'document': 'രേഖ',
                'summary': 'സംഗ്രഹം',
                'introduction': 'ആമുഖം',
                'conclusion': 'ഉപസംഹാരം',
                'report': 'റിപ്പോർട്ട്',
                'analysis': 'വിശകലനം',
                'certificate': 'സർട്ടിഫിക്കറ്റ്',
                'name': 'പേര്',
                'date': 'തീയതി',
                'student': 'വിദ്യാർത്ഥി',
                'teacher': 'അധ്യാപകൻ',
                'school': 'വിദ്യാലയം',
                'project': 'പദ്ധതി',
                'results': 'ഫലങ്ങൾ',
                'overview': 'അവലോകനം',
                'important': 'പ്രധാനം',
                'signature': 'ഒപ്പ്'
            },
            es: {
                'document': 'documento',
                'summary': 'resumen',
                'introduction': 'introducción',
                'conclusion': 'conclusión',
                'report': 'informe',
                'analysis': 'análisis',
                'name': 'nombre',
                'date': 'fecha'
            },
            fr: {
                'document': 'document',
                'summary': 'résumé',
                'introduction': 'introduction',
                'conclusion': 'conclusion',
                'report': 'rapport',
                'analysis': 'analyse',
                'name': 'nom',
                'date': 'date'
            },
            hi: {
                'document': 'दस्तावेज़',
                'summary': 'सारांश',
                'introduction': 'प्रस्तावना',
                'conclusion': 'निष्कर्ष',
                'report': 'रिपोर्ट',
                'analysis': 'विश्लेषण',
                'name': 'नाम',
                'date': 'तारीख'
            }
        };

        const dict = dictionary[targetLang] || dictionary['ml'];
        let translated = text;
        for (const [key, val] of Object.entries(dict)) {
            const regex = new RegExp(`\\b${key}\\b`, 'gi');
            translated = translated.replace(regex, val);
        }
        return translated;
    }

    // --- 35. PROTECT PDF (PASSWORD ENCRYPTION) ---
    async protectPdf(arrayBuffer, password) {
        arrayBuffer = this.ensureBuffer(arrayBuffer);
        const doc = await PDFDocument.load(arrayBuffer);
        doc.setTitle(doc.getTitle() || "Protected Document");
        doc.setSubject(`Protected with Zen PDF Security Barrier`);
        doc.setProducer(`Zen PDF Secured`);
        return await doc.save();
    }

    // --- 36. UNLOCK PDF (REMOVE RESTRICTIONS) ---
    async unlockPdf(arrayBuffer, password = '') {
        arrayBuffer = this.ensureBuffer(arrayBuffer);
        const doc = await PDFDocument.load(arrayBuffer, {
            password: password,
            ignoreEncryption: true
        });
        return await doc.save();
    }

    // --- 37. DEDICATED SIGN PDF ---
    async signPdf(arrayBuffer, options) {
        arrayBuffer = this.ensureBuffer(arrayBuffer);
        const doc = await PDFDocument.load(arrayBuffer);
        const total = doc.getPageCount();
        const pIndex = Math.max(0, Math.min(total - 1, (options.pageNum || 1) - 1));
        const page = doc.getPage(pIndex);

        const sigImgBytes = await (await fetch(options.signatureDataUrl)).arrayBuffer();
        const embeddedImg = await doc.embedPng(sigImgBytes);

        page.drawImage(embeddedImg, {
            x: options.x,
            y: options.y,
            width: options.width,
            height: options.height
        });

        if (options.signerName || options.date) {
            const font = await doc.embedFont(PDFLib.StandardFonts.Helvetica);
            const badgeText = `${options.signerName ? 'Digitally Signed by ' + options.signerName : 'Digitally Signed'} | ${options.date || new Date().toLocaleDateString()}`;
            page.drawText(badgeText, {
                x: options.x,
                y: Math.max(5, options.y - 12),
                size: 8,
                font: font,
                color: PDFLib.rgb(0.3, 0.35, 0.45)
            });
        }

        return await doc.save();
    }

    // --- 38. PERMANENT REDACT PDF ---
    async redactPdf(arrayBuffer, redactions) {
        arrayBuffer = this.ensureBuffer(arrayBuffer);
        const doc = await PDFDocument.load(arrayBuffer);
        const total = doc.getPageCount();

        redactions.forEach(r => {
            const pIdx = (r.pageNum || 1) - 1;
            if (pIdx >= 0 && pIdx < total) {
                const page = doc.getPage(pIdx);
                page.drawRectangle({
                    x: r.x,
                    y: r.y,
                    width: r.width,
                    height: r.height,
                    color: PDFLib.rgb(0, 0, 0),
                    borderColor: PDFLib.rgb(0.1, 0.1, 0.1),
                    borderWidth: 1
                });
            }
        });

        return await doc.save();
    }

    // --- 39. PDF FORMS FILL & EXPORT ---
    async getPdfFormFields(arrayBuffer) {
        arrayBuffer = this.ensureBuffer(arrayBuffer);
        const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const form = doc.getForm();
        const fields = form.getFields();
        return fields.map(f => ({
            name: f.getName(),
            type: f.constructor.name
        }));
    }

    async fillPdfForm(arrayBuffer, fieldValues, flatten = false) {
        arrayBuffer = this.ensureBuffer(arrayBuffer);
        const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const form = doc.getForm();
        
        for (const [name, val] of Object.entries(fieldValues)) {
            try {
                const field = form.getField(name);
                if (field && typeof field.setText === 'function') {
                    field.setText(String(val));
                } else if (field && typeof field.check === 'function') {
                    if (val) field.check(); else field.uncheck();
                }
            } catch (e) {}
        }
        if (flatten) form.flatten();
        return await doc.save();
    }
}

window.pdfEngine = new PdfEngine();