// server.cjs (CommonJS p/ não depender de "type": "module")
const http = require('node:http');
const { appendFile, readFile, stat } = require('node:fs/promises');
const { createReadStream } = require('node:fs');
const path = require('node:path');

const PORT = process.env.PORT || 3000;
const DIST = path.join(process.cwd(), 'dist');
const METRICS_PATH = process.env.METRICS_PATH || '/tmp/webvitals.ndjson';

const mime = (ext) => ({
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.svg': 'image/svg+xml',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
}[ext] || 'application/octet-stream');

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    // --- endpoint de métricas ---
    if (url.pathname === '/api/web-vitals') {
        if (req.method === 'POST') {
            const chunks = [];
            req.on('data', (c) => chunks.push(c));
            req.on('end', async () => {
                try {
                    const body = Buffer.concat(chunks).toString('utf8') || '{}';
                    let json;
                    try { json = JSON.parse(body); } catch { json = { raw: body }; }
                    const doc = JSON.stringify({ ...json, ts: Date.now() }) + '\n';
                    await appendFile(METRICS_PATH, doc, 'utf8');
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ ok: true }));
                } catch (e) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ ok: false, error: String(e.message || e) }));
                }
            });
            return;
        }
        if (req.method === 'GET') {
            const data = await readFile(METRICS_PATH, 'utf8').catch(() => '');
            res.writeHead(200, { 'Content-Type': 'application/x-ndjson' });
            res.end(data);
            return;
        }
        res.writeHead(405).end(); return;
    }

    // --- estático + fallback SPA ---
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === '/') pathname = '/index.html';
    const file = path.join(DIST, pathname);
    try {
        const st = await stat(file);
        if (st.isDirectory()) throw new Error('is dir');
        res.writeHead(200, { 'Content-Type': mime(path.extname(file)) });
        createReadStream(file).pipe(res);
    } catch {
        const index = path.join(DIST, 'index.html');
        const html = await readFile(index);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
    }
});

server.listen(PORT, () => {
    console.log(`CSR server up on http://0.0.0.0:${PORT}`);
});
