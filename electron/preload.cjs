const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld("electronAPI", {
  isElectron: true,
  platform: process.platform,
  print: () => ipcRenderer.invoke("print-page"),
  openExternal: (url) => ipcRenderer.invoke("open-external", url),
  getVersion: () => ipcRenderer.invoke("get-app-version"),
});
