// Preload script for Electron
// This runs before the renderer process loads

const { contextBridge } = require('electron');

// Expose any APIs to the renderer process here if needed
contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  platform: process.platform
});
