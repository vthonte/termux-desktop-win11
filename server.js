const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec, execSync } = require('child_process');

const PORT = 7860;
const LAUNCHER_SCRIPT = path.join(__dirname, 'x11-launcher.sh');

const DE_DEFINITIONS = [
  { id: 'xfce4', name: 'XFCE4 Desktop', desc: 'Windows 11 Light Mode Desktop Environment.', check: 'startxfce4', icon: '🎨' },
  { id: 'lxqt', name: 'LXQt Desktop', desc: 'Modern, fast, lightweight Qt-based desktop environment.', check: 'startlxqt', icon: '⚡' },
  { id: 'openbox', name: 'Openbox WM', desc: 'Minimalist, highly configurable X11 window manager.', check: 'openbox', icon: '🔲' },
  { id: 'i3', name: 'i3 Tiling WM', desc: 'Dynamic, keyboard-driven tiling window manager.', check: 'i3', pkg: 'i3', icon: '📐' },
  { id: 'fluxbox', name: 'Fluxbox WM', desc: 'Extremely fast and lightweight window manager.', check: 'fluxbox', pkg: 'fluxbox', icon: '🚀' },
  { id: 'mate', name: 'MATE Desktop', desc: 'Traditional, elegant GNOME 2 fork desktop environment.', check: 'mate-session', pkg: 'mate-desktop', icon: '🌿' }
];

function checkCommandExists(cmd) {
  try {
    execSync(`which ${cmd}`, { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

function getSystemStatus() {
  let x11Running = false;
  let rdpRunning = false;
  let pulseRunning = false;
  let activeDE = 'none';

  try {
    const out = execSync(`pgrep -f "termux-x11"`).toString();
    if (out.trim()) x11Running = true;
  } catch (e) {}

  try {
    const out = execSync(`pgrep -f "xrdp"`).toString();
    if (out.trim()) rdpRunning = true;
  } catch (e) {}

  try {
    const out = execSync(`pgrep -f "pulseaudio"`).toString();
    if (out.trim()) pulseRunning = true;
  } catch (e) {}

  try {
    if (execSync('pgrep -f "xfce4-session|startxfce4"', { stdio: 'pipe' }).toString().trim()) activeDE = 'xfce4';
    else if (execSync('pgrep -f "lxqt-session|startlxqt"', { stdio: 'pipe' }).toString().trim()) activeDE = 'lxqt';
    else if (execSync('pgrep -f "openbox"', { stdio: 'pipe' }).toString().trim()) activeDE = 'openbox';
    else if (execSync('pgrep -f "i3"', { stdio: 'pipe' }).toString().trim()) activeDE = 'i3';
    else if (execSync('pgrep -f "fluxbox"', { stdio: 'pipe' }).toString().trim()) activeDE = 'fluxbox';
    else if (execSync('pgrep -f "mate-session"', { stdio: 'pipe' }).toString().trim()) activeDE = 'mate';
  } catch (e) {}

  let storage = { used: 'Unknown', total: 'Unknown', avail: 'Unknown', percent: '0%' };
  try {
    const dfOut = execSync('df -h /data/data/com.termux/files').toString().split('\n');
    if (dfOut.length >= 2) {
      const parts = dfOut[1].trim().split(/\s+/);
      if (parts.length >= 5) {
        storage = { total: parts[1], used: parts[2], avail: parts[3], percent: parts[4] };
      }
    }
  } catch (e) {}

  const desktops = DE_DEFINITIONS.map(de => ({
    ...de,
    installed: checkCommandExists(de.check),
    active: activeDE === de.id
  }));

  return {
    x11Running,
    rdpRunning,
    pulseRunning,
    activeDE,
    desktops,
    storage,
    rdpAddress: '10.57.65.155:3390'
  };
}

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  if (req.url === '/api/status' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify(getSystemStatus()));
    return;
  }

  if (req.url === '/api/action' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const action = payload.action || 'status';
        const de = payload.de || 'xfce4';

        if (action === 'install') {
          const pkgName = payload.pkg || de;
          res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.write(JSON.stringify({ success: true, message: `Starting installation of ${pkgName}...` }));
          res.end();
          exec(`pkg install -y ${pkgName}`, (err) => {
            if (err) console.error('Install error:', err);
          });
          return;
        }

        exec(`${LAUNCHER_SCRIPT} ${action} ${de}`, (err, stdout, stderr) => {
          res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({
            success: !err,
            stdout: stdout.toString(),
            stderr: stderr.toString(),
            status: getSystemStatus()
          }));
        });
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);
  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500);
        res.end('Server Error: ' + error.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Termux Control Dashboard running on http://0.0.0.0:${PORT}`);
});
