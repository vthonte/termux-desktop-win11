document.addEventListener('DOMContentLoaded', () => {
  const x11Dot = document.getElementById('x11-dot');
  const x11ToggleText = document.getElementById('x11-toggle-text');
  const btnToggleX11 = document.getElementById('btn-toggle-x11');
  const btnOpenApp = document.getElementById('btn-open-app');
  
  const valX11Status = document.getElementById('val-x11-status');
  const valRdpStatus = document.getElementById('val-rdp-status');
  const valPulseStatus = document.getElementById('val-pulse-status');
  const valStorageFree = document.getElementById('val-storage-free');

  const desktopGrid = document.getElementById('desktop-grid');
  const consoleOutput = document.getElementById('console-output');
  const btnClearLog = document.getElementById('btn-clear-log');

  const btnQuickStart = document.getElementById('btn-quick-start');
  const btnQuickRdp = document.getElementById('btn-quick-rdp');
  const btnQuickStop = document.getElementById('btn-quick-stop');
  const btnCleanSpace = document.getElementById('btn-clean-space');

  let currentStatus = null;

  function log(msg) {
    const timestamp = new Date().toLocaleTimeString();
    consoleOutput.textContent += `\n[${timestamp}] ${msg}`;
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
  }

  btnClearLog.addEventListener('click', () => {
    consoleOutput.textContent = 'Console cleared.';
  });

  async function fetchStatus() {
    try {
      const res = await fetch('/api/status');
      if (!res.ok) return;
      const data = await res.json();
      currentStatus = data;
      updateUI(data);
    } catch (e) {
      console.error('Failed to fetch status:', e);
    }
  }

  function updateUI(data) {
    // X11 status
    if (data.x11Running) {
      x11Dot.classList.add('active');
      x11ToggleText.textContent = 'Stop X11 Server';
      valX11Status.textContent = 'Running (:0)';
      valX11Status.style.color = 'var(--success)';
    } else {
      x11Dot.classList.remove('active');
      x11ToggleText.textContent = 'Start X11 Server';
      valX11Status.textContent = 'Stopped';
      valX11Status.style.color = 'var(--text-muted)';
    }

    // RDP status
    if (data.rdpRunning) {
      valRdpStatus.textContent = 'Active (10.57.65.155:3390)';
      valRdpStatus.style.color = '#38bdf8';
    } else {
      valRdpStatus.textContent = 'Inactive';
      valRdpStatus.style.color = 'var(--text-muted)';
    }

    // PulseAudio status
    valPulseStatus.textContent = data.pulseRunning ? 'Active' : 'Inactive';
    valPulseStatus.style.color = data.pulseRunning ? 'var(--success)' : 'var(--text-muted)';

    // Storage
    if (data.storage) {
      valStorageFree.textContent = `${data.storage.avail} free (${data.storage.percent} used)`;
    }

    // Render Desktops
    renderDesktops(data.desktops);
  }

  function renderDesktops(desktops) {
    desktopGrid.innerHTML = '';
    desktops.forEach(de => {
      const card = document.createElement('div');
      card.className = `de-card ${de.active ? 'active' : ''}`;
      
      const isInstalled = de.installed;

      card.innerHTML = `
        <div class="de-header">
          <div class="de-icon-box">${de.icon || '🖥️'}</div>
          <div class="de-title">
            <h3>${de.name}</h3>
            <span class="badge">${isInstalled ? 'Installed' : 'Not Installed'}</span>
          </div>
        </div>
        <div class="de-desc">${de.desc}</div>
        <div class="de-footer">
          ${isInstalled ? `
            <button class="btn btn-primary btn-sm btn-launch" data-id="${de.id}" style="width:100%;">
              ${de.active ? '🔄 Restart DE' : '▶ Launch ' + de.name}
            </button>
          ` : `
            <button class="btn btn-accent btn-sm btn-install" data-pkg="${de.pkg || de.id}" style="width:100%;">
              📥 Install ${de.name}
            </button>
          `}
        </div>
      `;

      desktopGrid.appendChild(card);
    });

    // Attach event listeners to dynamic buttons
    document.querySelectorAll('.btn-launch').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const deId = e.currentTarget.getAttribute('data-id');
        triggerAction('launch', deId);
      });
    });

    document.querySelectorAll('.btn-install').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const pkgName = e.currentTarget.getAttribute('data-pkg');
        triggerInstall(pkgName);
      });
    });
  }

  async function triggerAction(action, de = 'xfce4') {
    log(`Executing action: ${action} ${de}...`);
    try {
      const res = await fetch('/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, de })
      });
      const result = await res.json();
      if (result.stdout) log(result.stdout);
      if (result.stderr) log(result.stderr);
      fetchStatus();
    } catch (e) {
      log(`Error executing action: ${e.message}`);
    }
  }

  async function triggerInstall(pkg) {
    log(`Starting installation of package: ${pkg}... (this may take a minute)`);
    try {
      const res = await fetch('/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'install', pkg })
      });
      const result = await res.json();
      log(result.message || 'Installation process initiated.');
      setTimeout(fetchStatus, 5000);
    } catch (e) {
      log(`Installation request failed: ${e.message}`);
    }
  }

  // Header and Action listeners
  btnToggleX11.addEventListener('click', () => {
    if (currentStatus && currentStatus.x11Running) {
      triggerAction('stop');
    } else {
      triggerAction('start');
    }
  });

  btnOpenApp.addEventListener('click', () => {
    triggerAction('open');
  });

  btnQuickStart.addEventListener('click', () => {
    triggerAction('launch', 'xfce4');
  });

  btnQuickRdp.addEventListener('click', () => {
    triggerAction('rdp');
  });

  btnQuickStop.addEventListener('click', () => {
    triggerAction('stop');
  });

  btnCleanSpace.addEventListener('click', async () => {
    log('Cleaning package caches and temporary files...');
    await triggerAction('clean');
    log('Storage cleanup completed successfully!');
  });

  // Initial fetch and polling loop
  fetchStatus();
  setInterval(fetchStatus, 3000);
});
