const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 200,
        height: 300,
        frame: false, // Frameless window
        transparent: true, // Transparent background
        resizable: false,
        alwaysOnTop: true, // Keep window on top of all others
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        backgroundColor: '#00000000' // Fully transparent
    });

    mainWindow.setAlwaysOnTop(true, 'screen-saver');

    mainWindow.loadFile('index.html');

    // Enable click-through with forwarding
    mainWindow.setIgnoreMouseEvents(true, { forward: true });

    const { ipcMain } = require('electron');
    ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        win.setIgnoreMouseEvents(ignore, options);
    });

    ipcMain.on('window-move', (event, { x, y }) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        win.setPosition(x, y);
    });

    ipcMain.on('get-window-position', (event) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        const bounds = win.getBounds();
        event.reply('window-position', bounds);
    });

    // Open DevTools in development mode
    if (process.argv.includes('--dev')) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
