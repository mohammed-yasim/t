const { app, BrowserWindow, screen } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    const displays = screen.getAllDisplays();
    let x = 0, y = 0, width = 0, height = 0;

    // Calculate the total bounds of all displays
    for (const display of displays) {
        x = Math.min(x, display.bounds.x);
        y = Math.min(y, display.bounds.y);
        width = Math.max(width, display.bounds.x + display.bounds.width);
        height = Math.max(height, display.bounds.y + display.bounds.height);
    }

    // Adjust width/height to be relative to the top-leftmost point
    width -= x;
    height -= y;

    mainWindow = new BrowserWindow({
        x: x,
        y: y,
        width: width,
        height: height,
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
