import { app, shell, BrowserWindow, ipcMain, Tray, Menu, nativeImage } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import Store from 'electron-store' // This will now work with v8.1.0
import iconPath from '../../resources/helm.ico?asset'

// Initialize the store
const store = new Store()
let mainWindow = null // [!code ++]
let tray = null // [!code ++]
let miniWindow = null

// 1. ADD THIS FUNCTION
function createMiniWindow() {
  miniWindow = new BrowserWindow({
    width: 300,
    height: 120, // Small HUD size
    show: false,
    frame: false, // Frameless
    alwaysOnTop: true, // Key feature: Floats over other apps
    skipTaskbar: true, // Don't clutter taskbar
    resizable: false,
    backgroundColor: '#1a1b26',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  // Load the same index.html but with a hash to tell React to render the MiniApp
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    miniWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}#/mini`)
  } else {
    miniWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: 'mini' })
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    frame: false, // [cite: 12]
    autoHideMenuBar: true,
    backgroundColor: '#1a1b26', // [cite: 13]
    icon: iconPath, // <--- ADD THIS LINE
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // --- NEW: Intercept Close Event ---
  mainWindow.on('close', (event) => {
  // If the app is not quitting (user just clicked X), hide it instead
  if (!app.isQuitting) {
      event.preventDefault()
      mainWindow.hide()
    }
    return false
  })

  ipcMain.on('window:close', () => {
    if (mainWindow) mainWindow.close() 
  })
  // ----------------------------------

  // --- NEW: Window State Sync (Main -> Renderer) ---
  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window:state-change', true)
  })

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window:state-change', false)
  })
  // -------------------------------------------------

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  createMiniWindow()
}

// 2. ADD IPC HANDLERS FOR POPUP MODE
// A. Switch to Mini Mode
ipcMain.on('mode:mini', () => {
  mainWindow.hide()
  miniWindow.show()
})

// B. Switch back to Main Mode
ipcMain.on('mode:main', () => {
  miniWindow.hide()
  mainWindow.show()
})

// C. Sync Data: Main -> Mini (The "Tick")
ipcMain.on('timer:sync', (_event, data) => {
  if (miniWindow && !miniWindow.isDestroyed() && miniWindow.isVisible()) {
    miniWindow.webContents.send('timer:update', data)
  }
})

// D. Send Commands: Mini -> Main (Play/Pause/Stop)
ipcMain.on('timer:control', (_event, action) => {
  if (mainWindow) {
    mainWindow.webContents.send('timer:command', action)
  }
})

// --- NEW: Tray Logic ---
function createTray() {
  // Use the imported path
  const trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 16 })
  
  tray = new Tray(trayIcon)
  
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show Helm', click: () => mainWindow && mainWindow.show() },
    { type: 'separator' },
    { label: 'Quit', click: () => {
        app.isQuitting = true
        app.quit() 
      } 
    }
  ])

  tray.setToolTip('Helm')
  tray.setContextMenu(contextMenu)

  tray.on('click', () => {
    if (!mainWindow) return; // Safety check

    if (mainWindow.isVisible()) {
        mainWindow.hide()
    } else {
        mainWindow.show()
    }
  })
}
// -----------------------

// --- DATABASE HANDLERS (The new part) ---
// 1. Get Data
ipcMain.handle('db:get', (_event, key) => {
  return store.get(key, []) // Returns empty array [] if key doesn't exist
})

// 2. Set Data
ipcMain.handle('db:set', (_event, key, value) => {
  store.set(key, value)
  return true
})

// --- NEW: Window Focus Handler (for Notification click) ---
ipcMain.on('window:focus', () => {
    if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.show()
        mainWindow.focus()
    }
})

ipcMain.handle('save-audio-file', async (event, { name, buffer }) => {
  const userDataPath = app.getPath('userData')
  const soundsDir = path.join(userDataPath, 'sounds')
  
  if (!fs.existsSync(soundsDir)) fs.mkdirSync(soundsDir)
  
  const filePath = path.join(soundsDir, name)
  fs.writeFileSync(filePath, Buffer.from(buffer))
  return `file://${filePath}` // Return the path to be saved in DB
})
// ---------------------------------------------------------

// --- NEW: Window Controls (Renderer -> Main) ---
ipcMain.on('window:maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  }
})

ipcMain.on('window:minimize', () => {
  if (mainWindow) mainWindow.minimize()
})
// -----------------------------------------------


app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.Helm.app')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()
  createTray() // [!code ++]

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
  }
})