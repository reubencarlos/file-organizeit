import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
  scanMedia: (sourcePath: string, destPath: string) => ipcRenderer.invoke('scan:media', sourcePath, destPath),
  organizeMedia: (sourcePath: string, destPath: string, fileCount: number) => ipcRenderer.invoke('organize:media', sourcePath, destPath, fileCount),
  onProgress: (callback: (progress: { current: number, total: number }) => void) => ipcRenderer.on('organize:progress', (_, progress) => callback(progress)),
  onLog: (callback: (message: string) => void) => ipcRenderer.on('organize:log', (_, message) => callback(message)),
});