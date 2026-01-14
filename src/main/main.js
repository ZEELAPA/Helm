import { app, shell, BrowserWindow, ipcMain, Tray, Menu, nativeImage, Notification } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import Store from 'electron-store' 
import iconPath from '../../resources/helm.ico?asset'

const store = new Store()
let mainWindow = null
let tray = null
let miniWindow = null
let notificationInterval = null

function createMiniWindow() {
  miniWindow = new BrowserWindow({
    width: 300,
    height: 120,
    show: false,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    backgroundColor: '#1a1b26',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

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
    frame: false,
    autoHideMenuBar: true,
    backgroundColor: '#1a1b26',
    icon: iconPath,
    ...(process.platform === 'linux' ? { icon: iconPath } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault()
      mainWindow.hide()
    }
    return false
  })

  ipcMain.on('window:close', () => {
    if (mainWindow) mainWindow.close() 
  })

  mainWindow.on('maximize', () => mainWindow.webContents.send('window:state-change', true))
  mainWindow.on('unmaximize', () => mainWindow.webContents.send('window:state-change', false))

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

// --- NOTIFICATION SYSTEM LOGIC ---
function startNotificationChecker() {
  // Check every 60 seconds
  notificationInterval = setInterval(() => {
    const tasks = store.get('tasks', [])
    const now = new Date()
    let hasChanges = false

    const updatedTasks = tasks.map(task => {
      // If task has a notification time set, hasn't been notified yet, and isn't done
      if (task.notifyAt && !task.hasBeenNotified && !task.done) {
        const notifyTime = new Date(task.notifyAt)

        // Check if NOW is past the notification time
        if (now >= notifyTime) {
          
          // Send Notification
          const notif = new Notification({
            title: 'Helm Reminder',
            body: `Upcoming: ${task.title}`,
            silent: false,
            icon: iconPath
          })
          
          notif.show()
          
          notif.on('click', () => {
            if (mainWindow) {
                if (mainWindow.isMinimized()) mainWindow.restore()
                mainWindow.show()
                mainWindow.focus()
            }
          })

          // Mark as notified so we don't spam
          hasChanges = true
          return { ...task, hasBeenNotified: true }
        }
      }
      return task
    })

    // Only write to disk if we actually sent a notification
    if (hasChanges) {
      store.set('tasks', updatedTasks)
      // Optional: Inform renderer to refresh UI if open
      if(mainWindow) mainWindow.webContents.send('data:updated') 
    }

  }, 60000) // 60000 ms = 1 minute
}
// ---------------------------------

ipcMain.on('mode:mini', () => {
  mainWindow.hide()
  miniWindow.show()
})

ipcMain.on('mode:main', () => {
  miniWindow.hide()
  mainWindow.show()
})

ipcMain.on('timer:sync', (_event, data) => {
  if (miniWindow && !miniWindow.isDestroyed() && miniWindow.isVisible()) {
    miniWindow.webContents.send('timer:update', data)
  }
})

ipcMain.on('timer:control', (_event, action) => {
  if (mainWindow) {
    mainWindow.webContents.send('timer:command', action)
  }
})

function createTray() {
  const trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 16 })
  tray = new Tray(trayIcon)
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show Helm', click: () => mainWindow && mainWindow.show() },
    { type: 'separator' },
    { label: 'Quit', click: () => { app.isQuitting = true; app.quit() } }
  ])
  tray.setToolTip('Helm')
  tray.setContextMenu(contextMenu)
  tray.on('click', () => {
    if (!mainWindow) return; 
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
  })
}

ipcMain.handle('db:get', (_event, key) => store.get(key, []))
ipcMain.handle('db:set', (_event, key, value) => {
  store.set(key, value)
  return true
})

ipcMain.on('window:focus', () => {
    if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.show()
        mainWindow.focus()
    }
})

ipcMain.on('window:maximize', () => {
  if (mainWindow) {
    mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize()
  }
})

ipcMain.on('window:minimize', () => {
  if (mainWindow) mainWindow.minimize()
})

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.Helm.app')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })
  
  createWindow()
  createTray()
  startNotificationChecker() // <--- Start the loop

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // We do NOT quit here, so the notification loop keeps running in background
    // app.quit() 
  }
})