const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { YoutubeTranscript } = require('youtube-transcript');

const PORT = 3000;
const DIST = path.join(__dirname, 'dist');

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
'.map': 'application/json',
	  '.pdf': 'application/pdf',
	};

// ── YouTube Transcript Fetcher ────────────────────────────────
function httpsGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers, timeout: 10000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return httpsGet(res.headers.location, headers).then(resolve).catch(reject);
      }
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve(body));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function fetchVideoTitle(videoId) {
  try {
    const body = await httpsGet(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
    const info = JSON.parse(body);
    return info.title || 'YouTube Video';
  } catch { return 'YouTube Video'; }
}

async function fetchYouTubeTranscript(videoId) {
  let title = await fetchVideoTitle(videoId);

  try {
    const segments = await YoutubeTranscript.fetchTranscript(videoId);
    const transcript = segments.map(s => s.text).join(' ');
    return { title, transcript, hasRealTranscript: transcript.length > 20 };
  } catch (e) {
    const msg = e.message || '';
    if (msg.includes('disabled') || msg.includes('not found') || msg.includes('Could not find')) {
      return { title, transcript: '', hasRealTranscript: false, reason: 'No captions available.' };
    }
    return { title, transcript: '', hasRealTranscript: false, reason: msg };
  }
}

// ── HTTP Server ────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.writeHead(204);
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  // YouTube transcript API endpoint
  if (url.pathname === '/api/youtube-transcript' && req.method === 'GET') {
    const videoId = url.searchParams.get('videoId');
    if (!videoId) {
      res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      return res.end(JSON.stringify({ error: 'Missing videoId parameter' }));
    }

    try {
      const result = await fetchYouTubeTranscript(videoId);
      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify(result));
    } catch (e) {
      console.error('YouTube transcript error:', e.message);
      res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ error: `Failed to fetch transcript: ${e.message}` }));
    }
    return;
  }

  // Download route for project zip
  if (url.pathname === '/download/project') {
const zipPath = path.join(__dirname, 'ai-study-assistant-FULL.zip');
      try {
      const stat = fs.statSync(zipPath);
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="ai-study-assistant-FULL.zip"');
      res.setHeader('Content-Length', stat.size);
      res.writeHead(200);
      fs.createReadStream(zipPath).pipe(res);
    } catch {
      res.writeHead(404);
      res.end('File not found');
    }
    return;
  }

  // Static file serving
  let filePath = path.join(DIST, req.url === '/' ? 'index.html' : req.url);

  // SPA fallback
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST, 'index.html');
  }

  const ext = path.extname(filePath);
  const mime = MIME[ext] || 'application/octet-stream';

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Content-Type', mime);

  try {
    const data = fs.readFileSync(filePath);
    res.writeHead(200);
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`SmartStudy AI serving on port ${PORT}`);
});