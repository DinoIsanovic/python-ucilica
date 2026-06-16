const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Napredak
  loadProgress:  ()     => ipcRenderer.invoke('progress:load'),
  saveProgress:  (data) => ipcRenderer.invoke('progress:save', data),
  resetProgress: ()     => ipcRenderer.invoke('progress:reset'),
  getVersion:    ()     => ipcRenderer.invoke('app:version'),

  // Update
  checkForUpdate:   ()     => ipcRenderer.invoke('update:check'),
  downloadUpdate:   ()     => ipcRenderer.invoke('update:download'),
  installUpdate:    ()     => ipcRenderer.invoke('update:install'),
  openReleases:     ()     => ipcRenderer.invoke('update:open-releases'),

  // Update događaji (push od main procesa)
  onUpdateAvailable:    (cb) => ipcRenderer.on('update:available',     (_, d) => cb(d)),
  onUpdateNotAvailable: (cb) => ipcRenderer.on('update:not-available', ()     => cb()),
  onUpdateProgress:     (cb) => ipcRenderer.on('update:progress',      (_, d) => cb(d)),
  onUpdateDownloaded:   (cb) => ipcRenderer.on('update:downloaded',    (_, d) => cb(d)),
  onUpdateError:        (cb) => ipcRenderer.on('update:error',         (_, d) => cb(d)),

  isElectron: true
});
