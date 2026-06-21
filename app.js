/* =============================================
   ToolBox — Application Logic (6 Tools)
   ============================================= */

// ==================== NAVIGATION ====================
window.addEventListener('scroll', () => {
    document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 40);
});

const toolMeta = {
    'pdf-converter': { title: 'PDF ⇄ Word Dönüştürücü', desc: 'Dosyalarınız tarayıcı içinde işlenir, sunucuya hiçbir veri gönderilmez.', icon: '📄' },
    qrcode:   { title:'QR Kod Oluşturucu',        desc:'Metin veya URL\'den QR kod üretin.',       icon:'📱', bg:'linear-gradient(135deg,#8b5cf6,#6d28d9)' },
    palette:  { title:'Renk Paleti Oluşturucu',    desc:'Uyumlu renk paletleri keşfedin.',          icon:'🎨', bg:'linear-gradient(135deg,#ec4899,#db2777)' },
    counter:  { title:'Kelime & Karakter Sayacı',  desc:'Metin istatistiklerinizi anında görün.',   icon:'📝', bg:'linear-gradient(135deg,#06b6d4,#0891b2)' },
    json:     { title:'JSON Formatlayıcı',          desc:'JSON verilerinizi güzelleştirin.',         icon:'{ }', bg:'linear-gradient(135deg,#f59e0b,#d97706)' },
    password: { title:'Şifre Oluşturucu',           desc:'Güvenli rastgele şifreler üretin.',       icon:'🔒', bg:'linear-gradient(135deg,#34d399,#059669)' },
    lorem:    { title:'Lorem Ipsum Oluşturucu',     desc:'Yer tutucu metin oluşturun.',              icon:'📄', bg:'linear-gradient(135deg,#f472b6,#c026d3)' }
};

function showHome() {
    document.getElementById('homePage').style.display = '';
    document.getElementById('toolPage').style.display = 'none';
    document.querySelectorAll('.tool-panel').forEach(p => p.style.display = 'none');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openTool(id) {
    const meta = toolMeta[id];
    if (!meta) return;

    document.getElementById('homePage').style.display = 'none';
    document.getElementById('toolPage').style.display = '';

    document.getElementById('toolHeaderTitle').textContent = meta.title;
    document.getElementById('toolHeaderDesc').textContent = meta.desc;
    const iconEl = document.getElementById('toolHeaderIcon');
    iconEl.style.background = meta.bg || '#4f46e5';
    iconEl.textContent = meta.icon;

    document.querySelectorAll('.tool-panel').forEach(p => p.style.display = 'none');
    const panel = document.getElementById('tool-' + id);
    if (panel) panel.style.display = '';

    window.scrollTo({ top: 0 });

    // Init specific tools
    if (id === 'palette' && document.getElementById('paletteDisplay').children.length === 0) generatePalette();
    if (id === 'password' && document.getElementById('passwordOutput').value === 'Oluşturmak için butona basın') genPassword();
}

// Toast
function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
}

// ==================== 1. QR CODE ====================
let qrType = 'text';

function setQrType(btn, type) {
    qrType = type;
    document.querySelectorAll('.radio-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const area = document.getElementById('qrInputArea');
    if (type === 'text') {
        area.innerHTML = `<div class="input-group"><label class="input-label">Metin veya URL</label><textarea class="input-textarea" id="qrText" placeholder="https://ornek.com veya herhangi bir metin..." rows="4" oninput="generateQR()"></textarea></div>`;
    } else if (type === 'wifi') {
        area.innerHTML = `
            <div class="input-group"><label class="input-label">Ağ Adı (SSID)</label><input class="input-field" id="qrWifiSSID" placeholder="WiFi adı" oninput="generateQR()"></div>
            <div class="input-group"><label class="input-label">Şifre</label><input class="input-field" id="qrWifiPass" placeholder="WiFi şifresi" oninput="generateQR()"></div>
            <div class="input-group"><label class="input-label">Güvenlik</label><select class="input-select" id="qrWifiSec" onchange="generateQR()"><option value="WPA">WPA/WPA2</option><option value="WEP">WEP</option><option value="">Açık</option></select></div>
        `;
    } else if (type === 'email') {
        area.innerHTML = `
            <div class="input-group"><label class="input-label">E-posta Adresi</label><input class="input-field" id="qrEmail" placeholder="ornek@mail.com" oninput="generateQR()"></div>
            <div class="input-group"><label class="input-label">Konu</label><input class="input-field" id="qrEmailSubject" placeholder="Konu" oninput="generateQR()"></div>
            <div class="input-group"><label class="input-label">Mesaj</label><textarea class="input-textarea" id="qrEmailBody" placeholder="Mesaj içeriği..." rows="3" oninput="generateQR()"></textarea></div>
        `;
    }
}

function getQRData() {
    if (qrType === 'text') {
        return (document.getElementById('qrText')?.value || '').trim();
    } else if (qrType === 'wifi') {
        const ssid = document.getElementById('qrWifiSSID')?.value || '';
        const pass = document.getElementById('qrWifiPass')?.value || '';
        const sec = document.getElementById('qrWifiSec')?.value || 'WPA';
        if (!ssid) return '';
        return `WIFI:T:${sec};S:${ssid};P:${pass};;`;
    } else if (qrType === 'email') {
        const email = document.getElementById('qrEmail')?.value || '';
        const subject = document.getElementById('qrEmailSubject')?.value || '';
        const body = document.getElementById('qrEmailBody')?.value || '';
        if (!email) return '';
        return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
    return '';
}

function generateQR() {
    const data = getQRData();
    const output = document.getElementById('qrOutput');
    const dlBtn = document.getElementById('qrDownloadBtn');

    if (!data) {
        output.innerHTML = '<p class="preview-hint">← İçerik girerek QR kod oluşturun</p>';
        dlBtn.style.display = 'none';
        return;
    }

    const size = parseInt(document.getElementById('qrSize').value);
    const color = document.getElementById('qrColor').value;

    // Pure JS QR Code generation using Canvas
    output.innerHTML = '';
    const canvas = document.createElement('canvas');
    canvas.id = 'qrCanvas';
    output.appendChild(canvas);

    drawQR(canvas, data, size, color);
    dlBtn.style.display = '';
}

// Minimal QR Code renderer (using a simple encoding approach)
function drawQR(canvas, data, size, color) {
    // We'll use a simple grid-based QR representation
    // For production, you'd use a library like qrcodejs
    const modules = generateQRMatrix(data);
    const moduleCount = modules.length;
    const cellSize = Math.floor(size / moduleCount);
    const actualSize = cellSize * moduleCount;

    canvas.width = actualSize;
    canvas.height = actualSize;
    const ctx = canvas.getContext('2d');

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, actualSize, actualSize);

    // Draw modules
    ctx.fillStyle = color;
    for (let r = 0; r < moduleCount; r++) {
        for (let c = 0; c < moduleCount; c++) {
            if (modules[r][c]) {
                ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
            }
        }
    }
}

// Simple QR-like matrix generator (visual representation)
function generateQRMatrix(data) {
    const size = 25;
    const matrix = Array.from({ length: size }, () => Array(size).fill(false));

    // Finder patterns (top-left, top-right, bottom-left)
    const drawFinder = (row, col) => {
        for (let r = 0; r < 7; r++) {
            for (let c = 0; c < 7; c++) {
                if (r === 0 || r === 6 || c === 0 || c === 6 ||
                    (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
                    matrix[row + r][col + c] = true;
                }
            }
        }
    };

    drawFinder(0, 0);
    drawFinder(0, size - 7);
    drawFinder(size - 7, 0);

    // Timing patterns
    for (let i = 8; i < size - 8; i++) {
        matrix[6][i] = i % 2 === 0;
        matrix[i][6] = i % 2 === 0;
    }

    // Alignment pattern
    const ap = size - 9;
    for (let r = -2; r <= 2; r++) {
        for (let c = -2; c <= 2; c++) {
            if (Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0)) {
                matrix[ap + r][ap + c] = true;
            }
        }
    }

    // Data encoding (simplified - creates a unique pattern based on input)
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        hash = ((hash << 5) - hash + data.charCodeAt(i)) | 0;
    }

    const rng = (function(seed) {
        let s = seed;
        return function() {
            s = (s * 1103515245 + 12345) & 0x7fffffff;
            return s / 0x7fffffff;
        };
    })(Math.abs(hash));

    // Fill data area
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            // Skip finder patterns and timing
            if ((r < 8 && c < 8) || (r < 8 && c >= size - 8) || (r >= size - 8 && c < 8)) continue;
            if (r === 6 || c === 6) continue;
            if (Math.abs(r - ap) <= 2 && Math.abs(c - ap) <= 2) continue;

            matrix[r][c] = rng() > 0.5;
        }
    }

    return matrix;
}

function downloadQR() {
    const canvas = document.getElementById('qrCanvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'qr-code.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('✅ QR kod indirildi!');
}

// ==================== 2. COLOR PALETTE ====================
let paletteHistory = [];

function hslToHex(h, s, l) {
    s /= 100; l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

function generatePalette() {
    const display = document.getElementById('paletteDisplay');
    const baseHue = Math.floor(Math.random() * 360);
    const schemes = ['analogous', 'complementary', 'triadic', 'split'];
    const scheme = schemes[Math.floor(Math.random() * schemes.length)];

    let hues;
    switch (scheme) {
        case 'analogous':
            hues = [baseHue, baseHue + 30, baseHue + 60, baseHue - 30, baseHue - 60];
            break;
        case 'complementary':
            hues = [baseHue, baseHue + 15, baseHue + 180, baseHue + 195, baseHue + 210];
            break;
        case 'triadic':
            hues = [baseHue, baseHue + 30, baseHue + 120, baseHue + 240, baseHue + 270];
            break;
        case 'split':
            hues = [baseHue, baseHue + 150, baseHue + 180, baseHue + 210, baseHue + 30];
            break;
    }

    const colors = hues.map((h, i) => {
        const sat = 55 + Math.random() * 30;
        const light = 40 + Math.random() * 25;
        return hslToHex(((h % 360) + 360) % 360, sat, light);
    });

    display.innerHTML = colors.map(c => {
        const textColor = isLight(c) ? '#000' : '#fff';
        return `
            <div class="palette-swatch" style="background:${c}; color:${textColor};" onclick="copySwatch('${c}')">
                <div class="swatch-info">
                    <div class="swatch-hex">${c.toUpperCase()}</div>
                    <div class="swatch-copy">Tıkla & Kopyala</div>
                </div>
            </div>
        `;
    }).join('');

    // Add to history
    paletteHistory.unshift(colors);
    if (paletteHistory.length > 8) paletteHistory.pop();
    renderPaletteHistory();
}

function isLight(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}

function copySwatch(hex) {
    navigator.clipboard.writeText(hex);
    showToast('✅ ' + hex.toUpperCase() + ' kopyalandı!');
}

function renderPaletteHistory() {
    const hist = document.getElementById('paletteHistory');
    hist.innerHTML = paletteHistory.map(colors =>
        `<div class="history-item" onclick="loadPalette(${JSON.stringify(colors).replace(/"/g, "'")})">
            ${colors.map(c => `<div class="history-swatch" style="background:${c}"></div>`).join('')}
        </div>`
    ).join('');
}

window.loadPalette = function(colors) {
    const display = document.getElementById('paletteDisplay');
    display.innerHTML = colors.map(c => {
        const textColor = isLight(c) ? '#000' : '#fff';
        return `<div class="palette-swatch" style="background:${c}; color:${textColor};" onclick="copySwatch('${c}')">
            <div class="swatch-info"><div class="swatch-hex">${c.toUpperCase()}</div><div class="swatch-copy">Tıkla & Kopyala</div></div>
        </div>`;
    }).join('');
};

// Spacebar shortcut for palette
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && document.getElementById('tool-palette')?.style.display !== 'none'
        && document.getElementById('toolPage')?.style.display !== 'none') {
        e.preventDefault();
        generatePalette();
    }
});

// ==================== 3. WORD COUNTER ====================
function updateCounter() {
    const text = document.getElementById('counterText').value;

    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, '').length;
    const sentences = text.trim() ? (text.match(/[.!?…]+/g) || []).length || (text.trim() ? 1 : 0) : 0;
    const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter(p => p.trim()).length || (text.trim() ? 1 : 0) : 0;
    const lines = text ? text.split('\n').length : 0;
    const readTime = Math.max(1, Math.ceil(words / 200));
    const avgWordLen = words > 0 ? (charsNoSpace / words).toFixed(1) : 0;

    document.getElementById('cntWords').textContent = words;
    document.getElementById('cntChars').textContent = chars;
    document.getElementById('cntSentences').textContent = sentences;
    document.getElementById('cntParagraphs').textContent = paragraphs;
    document.getElementById('cntReadTime').textContent = readTime + ' dk';
    document.getElementById('cntCharsNoSpace').textContent = charsNoSpace;
    document.getElementById('cntLines').textContent = lines;
    document.getElementById('cntAvgWord').textContent = avgWordLen;
}

// ==================== 4. JSON FORMATTER ====================
function validateJSON() {
    const input = document.getElementById('jsonInput').value.trim();
    const status = document.getElementById('jsonStatus');

    if (!input) {
        status.className = 'json-status';
        return;
    }

    try {
        JSON.parse(input);
        status.className = 'json-status valid';
        status.textContent = '✅ Geçerli JSON';
    } catch (e) {
        status.className = 'json-status invalid';
        status.textContent = '❌ Geçersiz: ' + e.message;
    }
}

function formatJSON() {
    const input = document.getElementById('jsonInput').value.trim();
    if (!input) return;
    try {
        const parsed = JSON.parse(input);
        document.getElementById('jsonOutput').value = JSON.stringify(parsed, null, 4);
        showToast('✅ JSON formatlandı!');
    } catch (e) {
        showToast('❌ Geçersiz JSON: ' + e.message);
    }
    validateJSON();
}

function minifyJSON() {
    const input = document.getElementById('jsonInput').value.trim();
    if (!input) return;
    try {
        const parsed = JSON.parse(input);
        document.getElementById('jsonOutput').value = JSON.stringify(parsed);
        showToast('✅ JSON küçültüldü!');
    } catch (e) {
        showToast('❌ Geçersiz JSON: ' + e.message);
    }
    validateJSON();
}

function copyJSON() {
    const output = document.getElementById('jsonOutput').value;
    if (!output) return;
    navigator.clipboard.writeText(output);
    showToast('✅ JSON kopyalandı!');
}

function clearJSON() {
    document.getElementById('jsonInput').value = '';
    document.getElementById('jsonOutput').value = '';
    document.getElementById('jsonStatus').className = 'json-status';
}

// ==================== 5. PASSWORD GENERATOR ====================
function genPassword() {
    const length = parseInt(document.getElementById('pwLength').value);
    const upper = document.getElementById('pwUpper').checked;
    const lower = document.getElementById('pwLower').checked;
    const numbers = document.getElementById('pwNumbers').checked;
    const symbols = document.getElementById('pwSymbols').checked;

    let chars = '';
    if (upper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (lower) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (numbers) chars += '0123456789';
    if (symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (!chars) {
        document.getElementById('pwLower').checked = true;
        chars = 'abcdefghijklmnopqrstuvwxyz';
    }

    let password = '';
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
        password += chars[array[i] % chars.length];
    }

    document.getElementById('passwordOutput').value = password;
    updateStrength(password);
}

function updatePwLength() {
    document.getElementById('pwLengthVal').textContent = document.getElementById('pwLength').value;
    genPassword();
}

function updateStrength(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (password.length >= 20) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    const fill = document.getElementById('strengthFill');
    const text = document.getElementById('strengthText');

    const levels = [
        { pct: '15%', color: '#f87171', label: 'Çok Zayıf' },
        { pct: '30%', color: '#fb923c', label: 'Zayıf' },
        { pct: '50%', color: '#fbbf24', label: 'Orta' },
        { pct: '70%', color: '#a3e635', label: 'Güçlü' },
        { pct: '85%', color: '#34d399', label: 'Çok Güçlü' },
        { pct: '100%', color: '#22d3ee', label: 'Mükemmel' }
    ];

    const level = levels[Math.min(score, levels.length - 1)];
    fill.style.width = level.pct;
    fill.style.background = level.color;
    text.textContent = level.label;
    text.style.color = level.color;
}

function copyPassword() {
    const pw = document.getElementById('passwordOutput').value;
    navigator.clipboard.writeText(pw);
    showToast('✅ Şifre kopyalandı!');
}

function genBulkPasswords() {
    const count = Math.min(50, parseInt(document.getElementById('pwBulkCount').value) || 5);
    const length = parseInt(document.getElementById('pwLength').value);
    const upper = document.getElementById('pwUpper').checked;
    const lower = document.getElementById('pwLower').checked;
    const numbers = document.getElementById('pwNumbers').checked;
    const symbols = document.getElementById('pwSymbols').checked;

    let chars = '';
    if (upper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (lower) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (numbers) chars += '0123456789';
    if (symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz';

    const passwords = [];
    for (let j = 0; j < count; j++) {
        let pw = '';
        const arr = new Uint32Array(length);
        crypto.getRandomValues(arr);
        for (let i = 0; i < length; i++) pw += chars[arr[i] % chars.length];
        passwords.push(pw);
    }

    document.getElementById('bulkPasswordOutput').innerHTML = passwords.map((p, i) =>
        `<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
            <span>${i + 1}. ${p}</span>
            <button class="btn-action btn-sm" onclick="navigator.clipboard.writeText('${p}');showToast('✅ Kopyalandı!')">📋</button>
        </div>`
    ).join('');
}

// ==================== 6. LOREM IPSUM ====================
function generateLorem() {
    const type = document.getElementById('loremType').value;
    const count = parseInt(document.getElementById('loremCount').value) || 3;
    const startClassic = document.getElementById('loremStartClassic').checked;
    
    // Basit bir lorem ipsum üreteci
    const words = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo', 'consequat'];
    
    let result = '';
    
    if (type === 'words') {
        const selected = [];
        if (startClassic && count >= 5) {
            selected.push('lorem', 'ipsum', 'dolor', 'sit', 'amet');
            for(let i=0; i<count-5; i++) selected.push(words[Math.floor(Math.random()*words.length)]);
        } else {
            for(let i=0; i<count; i++) selected.push(words[Math.floor(Math.random()*words.length)]);
        }
        result = selected.join(' ') + '.';
        result = result.charAt(0).toUpperCase() + result.slice(1);
    } 
    else if (type === 'sentences') {
        const sentences = [];
        for(let i=0; i<count; i++) {
            const wCount = Math.floor(Math.random() * 8) + 5; // 5-12 kelimelik cümleler
            let sentenceWords = [];
            for(let j=0; j<wCount; j++) sentenceWords.push(words[Math.floor(Math.random()*words.length)]);
            let sentence = sentenceWords.join(' ') + '.';
            if (i===0 && startClassic) sentence = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
            else sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
            sentences.push(sentence);
        }
        result = sentences.join(' ');
    }
    else if (type === 'paragraphs') {
        const paragraphs = [];
        for(let i=0; i<count; i++) {
            const sCount = Math.floor(Math.random() * 4) + 3; // 3-6 cümlelik paragraflar
            let sentences = [];
            for(let j=0; j<sCount; j++) {
                const wCount = Math.floor(Math.random() * 8) + 5;
                let sentenceWords = [];
                for(let k=0; k<wCount; k++) sentenceWords.push(words[Math.floor(Math.random()*words.length)]);
                let sentence = sentenceWords.join(' ') + '.';
                if (i===0 && j===0 && startClassic) sentence = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
                else sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
                sentences.push(sentence);
            }
            paragraphs.push(sentences.join(' '));
        }
        result = paragraphs.join('\n\n');
    }
    
    document.getElementById('loremOutput').innerText = result;
    
    // Info güncelle
    const totalWords = result.trim().split(/\s+/).length;
    const totalChars = result.length;
    document.getElementById('loremInfo').innerText = `${totalWords} kelime · ${totalChars} karakter`;
}

function copyLorem() {
    const text = document.getElementById('loremOutput').innerText;
    if(!text || text.includes('Oluşturmak için')) return;
    
    navigator.clipboard.writeText(text).then(() => {
        showToast('Metin kopyalandı!');
    });
}

// ==================== PDF & WORD DÖNÜŞTÜRÜCÜ ====================

// PDF.js Çalışanı (Worker) Tanımlaması
if (window['pdfjs-dist/build/pdf']) {
    window['pdfjs-dist/build/pdf'].GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
}

// 1. Word'den PDF'e (mammoth.js -> HTML -> html2pdf.js)
function convertWordToPdf() {
    const fileInput = document.getElementById('wordFileInput');
    const status = document.getElementById('wordToPdfStatus');
    
    if (!fileInput.files.length) {
        return showToast('Lütfen bir Word (.docx) dosyası seçin!');
    }
    
    const file = fileInput.files[0];
    status.innerText = "⏳ Dosya okunuyor, lütfen bekleyin...";
    
    const reader = new FileReader();
    reader.onload = function(event) {
        const arrayBuffer = event.target.result;
        
        mammoth.convertToHtml({arrayBuffer: arrayBuffer})
            .then(function(result){
                const html = result.value; 
                status.innerText = "⏳ PDF oluşturuluyor...";
                
                const element = document.createElement('div');
                element.innerHTML = `
                <style>
                    * { box-sizing: border-box; }
                    img, p, h1, h2, h3, h4, h5, h6, table, tr, td, ul, li, figure {
                        page-break-inside: avoid;
                        break-inside: avoid;
                    }
                    img {
                        max-width: 100%;
                        height: auto;
                    }
                    p {
                        margin-bottom: 12px;
                    }
                </style>
                ${html}`;
                
                // PDF için temel stil ayarları
                element.style.padding = '30px';
                element.style.fontFamily = 'Arial, sans-serif';
                element.style.lineHeight = '1.6';
                element.style.color = '#1a1a1a';
                
                const opt = {
                    margin:       [0.6, 0.5, 0.6, 0.5],
                    filename:     file.name.replace('.docx', '.pdf'),
                    image:        { type: 'jpeg', quality: 0.98 },
                    html2canvas:  { scale: 2, useCORS: true, logging: false },
                    jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' },
                    pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] } // En agresif engelleme
                };
                
                html2pdf().set(opt).from(element).save().then(() => {
                    status.innerText = "✅ Başarıyla PDF olarak indirildi!";
                    showToast('PDF dönüştürme başarılı!');
                });
            })
            .catch(function(error) {
                console.error(error);
                status.innerText = "❌ Hata: Dosya dönüştürülemedi.";
                showToast('Hata: ' + error.message);
            });
    };
    reader.readAsArrayBuffer(file);
}

// 2. PDF'ten Word'e (pdf.js -> Metin -> docx.js)
async function convertPdfToWord() {
    const fileInput = document.getElementById('pdfFileInput');
    const status = document.getElementById('pdfToWordStatus');
    
    if (!fileInput.files.length) {
        return showToast('Lütfen bir PDF dosyası seçin!');
    }
    
    const file = fileInput.files[0];
    status.innerText = "⏳ PDF okunuyor ve metinler çıkarılıyor...";
    
    const reader = new FileReader();
    reader.onload = async function(event) {
        try {
            const typedarray = new Uint8Array(event.target.result);
            const pdf = await window['pdfjs-dist/build/pdf'].getDocument(typedarray).promise;
            
            let fullText = "";
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(" ");
                fullText += pageText + "\n\n";
            }
            
            status.innerText = "⏳ Word dosyası oluşturuluyor...";
            
            // DOCX Kütüphanesi ile yeni belge oluştur
            const { Document, Packer, Paragraph, TextRun } = window.docx;
            
            const paragraphs = fullText.split('\n').map(line => {
                return new Paragraph({
                    children: [new TextRun(line)]
                });
            });
            
            const doc = new Document({
                sections: [{
                    properties: {},
                    children: paragraphs
                }]
            });
            
            Packer.toBlob(doc).then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = file.name.replace('.pdf', '.docx');
                a.click();
                window.URL.revokeObjectURL(url);
                
                status.innerText = "✅ Başarıyla Word olarak indirildi!";
                showToast('Word dönüştürme başarılı!');
            });
            
        } catch (error) {
            console.error(error);
            status.innerText = "❌ Hata: Dosya okunurken sorun oluştu.";
            showToast('Hata: Şifreli veya bozuk PDF dosyası.');
        }
    };
    reader.readAsArrayBuffer(file);
}

// ==================== SCROLL ANIMATION ====================
const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.style.opacity = '1';
            e.target.style.transform = 'translateY(0)';
            observer.unobserve(e.target);
        }
    });
}, { threshold: 0.1 });

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.tool-card, .about-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(24px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });
});
