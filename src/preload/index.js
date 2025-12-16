import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  getItems: (key) => ipcRenderer.invoke('db:get', key),
  setItems: (key, value) => ipcRenderer.invoke('db:set', key, value),
  closeApp: () => ipcRenderer.send('window:close'),
  closeApp: () => ipcRenderer.send('window:close'),
  
  // NEW METHODS
  switchToMini: () => ipcRenderer.send('mode:mini'),
  switchToMain: () => ipcRenderer.send('mode:main'),
  
  // Logic -> UI
  sendTimerSync: (data) => ipcRenderer.send('timer:sync', data),
  onTimerUpdate: (callback) => ipcRenderer.on('timer:update', (_event, value) => callback(value)),
  
  // UI -> Logic
  sendTimerControl: (action) => ipcRenderer.send('timer:control', action),
  onTimerCommand: (callback) => ipcRenderer.on('timer:command', (_event, value) => callback(value))
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('db', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.db = api
}