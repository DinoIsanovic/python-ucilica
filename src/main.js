const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path   = require('path');
const fs     = require('fs');

// Auto-updater — učitavamo lazy da ne blokira startup
let autoUpdater = null;

// ── Putanje ───────────────────────────────────────────
const USER_DATA   = app.getPath('userData');
const PROGRESS_F  = path.join(USER_DATA, 'progress.json');

// ── Progress helpers ──────────────────────────────────
function defaultProgress() {
  return {
    version: 2,
    currentProfile: null,
    profiles: {}
  };
}

function loadProgress() {
  try {
    if (fs.existsSync(PROGRESS_F))
      return JSON.parse(fs.readFileSync(PROGRESS_F, 'utf8'));
  } catch (e) { console.error('loadProgress:', e.message); }
  return defaultProgress();
}

function saveProgress(data) {
  try {
    fs.mkdirSync(path.dirname(PROGRESS_F), { recursive: true });
    fs.writeFileSync(PROGRESS_F, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('saveProgress:', e.message);
    return false;
  }
}

// ── IPC ───────────────────────────────────────────────
ipcMain.handle('progress:load',  ()     => loadProgress());
ipcMain.handle('progress:save',  (_, d) => saveProgress(d));
ipcMain.handle('app:version',    ()     => app.getVersion());

ipcMain.handle('progress:reset', async () => {
  const { response } = await dialog.showMessageBox({
    type:      'warning',
    title:     'Resetuj napredak',
    message:   'Jesi li siguran/na?',
    detail:    'Ovo će obrisati sav napredak svih učenika na ovom računaru.',
    buttons:   ['Otkaži', 'Da, resetuj sve'],
    defaultId: 0,
    cancelId:  0
  });
  if (response === 1) {
    const fresh = defaultProgress();
    saveProgress(fresh);
    return fresh;
  }
  return null;
});

// ── Auto-update IPC ───────────────────────────────────
ipcMain.handle('update:check', async () => {
  if (!autoUpdater) return { status: 'unavailable' };
  try {
    const result = await autoUpdater.checkForUpdates();
    return { status: 'checked', info: result?.updateInfo || null };
  } catch (e) {
    return { status: 'error', message: e.message };
  }
});

ipcMain.handle('update:download', async () => {
  if (!autoUpdater) return false;
  try {
    await autoUpdater.downloadUpdate();
    return true;
  } catch (e) {
    return false;
  }
});

ipcMain.handle('update:install', () => {
  if (autoUpdater) autoUpdater.quitAndInstall();
});

ipcMain.handle('update:open-releases', () => {
  shell.openExternal('https://github.com/GITHUB_USERNAME/python-ucilica/releases');
});

// ── Prozor ────────────────────────────────────────────
let win;

function createWindow() {
  win = new BrowserWindow({
    width:           1280,
    height:          820,
    minWidth:        900,
    minHeight:       580,
    title:           'Python Učilica',
    backgroundColor: '#0F1117',
    webPreferences: {
      preload:          path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration:  false,
      webSecurity:      false   // Pyodide + lokalni fajlovi
    },
    show: false
  });

  win.loadFile(path.join(__dirname, 'index.html'));
  win.once('ready-to-show', () => win.show());

  // Spremi sesiju pri zatvaranju
  win.on('close', () => {
    try {
      win.webContents.executeJavaScript(
        'if(window._saveSessionTime) window._saveSessionTime();'
      );
    } catch (_) {}
  });
}

// ── Auto-updater inicijalizacija ──────────────────────
function initUpdater() {
  // Electron-updater funkcioniše samo u packaged verziji
  if (!app.isPackaged) {
    console.log('[updater] Dev mode — updater isključen');
    return;
  }

  try {
    const { autoUpdater: au, NsisUpdater } = require('electron-updater');
    autoUpdater = au;

    autoUpdater.autoDownload        = false; // Pitamo korisnika
    autoUpdater.autoInstallOnAppQuit = false;

    // GitHub kao update server — čita publish config iz package.json
    autoUpdater.setFeedURL({
      provider:   'github',
      owner:      'DinoIsanovic',
      repo:       'python-ucilica',
      releaseType: 'release'
    });

    autoUpdater.on('update-available', (info) => {
      win?.webContents.send('update:available', {
        version:     info.version,
        releaseDate: info.releaseDate,
        releaseNotes: info.releaseNotes
      });
    });

    autoUpdater.on('update-not-available', () => {
      win?.webContents.send('update:not-available');
    });

    autoUpdater.on('download-progress', (p) => {
      win?.webContents.send('update:progress', {
        percent:       Math.round(p.percent),
        transferred:   Math.round(p.transferred / 1024 / 1024 * 10) / 10,
        total:         Math.round(p.total / 1024 / 1024 * 10) / 10,
        bytesPerSecond: Math.round(p.bytesPerSecond / 1024)
      });
    });

    autoUpdater.on('update-downloaded', (info) => {
      win?.webContents.send('update:downloaded', { version: info.version });
    });

    autoUpdater.on('error', (err) => {
      console.error('[updater] Greška:', err.message);
      win?.webContents.send('update:error', { message: err.message });
    });

    // Provjeri update 10s nakon starta (ne odmah — daj Pyodide da se učita)
    // Tiho ignorišemo greške dok nije konfigurisan GitHub repo
    setTimeout(() => autoUpdater.checkForUpdates().catch(e => {
      console.log('[updater] Provjera nije uspjela (nema GitHub config?):', e.message);
    }), 10_000);

    console.log('[updater] Inicijalizovan');
  } catch (e) {
    console.error('[updater] Nije mogao biti učitan:', e.message);
  }
}

// ── App lifecycle ─────────────────────────────────────
app.whenReady().then(() => {
  createWindow();
  initUpdater();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
