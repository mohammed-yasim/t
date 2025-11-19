const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
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

    mainWindow.loadFile('index.html');

    // Enable click-through (allow clicks to pass through the window)
    mainWindow.setIgnoreMouseEvents(true);

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
