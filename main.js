const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 200,
        height: 300,
        frame: false, // Frameless window
        transparent: true, // Transparent background
        alwaysOnTop: true, // Keep window on top of all others
        skipTaskbar: true, // Don't show in taskbar
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        backgroundColor: '#00000000' // Fully transparent
    });

    // Apply multiple methods to ensure always on top
    mainWindow.setAlwaysOnTop(true, 'screen-saver');
    mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

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

    ipcMain.on('resize-window', (event, step) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        const bounds = win.getBounds();

        console.log('Resize requested. Step:', step, 'Current size:', bounds.width, 'x', bounds.height);

        // Calculate new width (step is +100 or -100)
        let newWidth = bounds.width + step;

        // Enforce constraints
        const MIN_WIDTH = 100;
        const MAX_WIDTH = 900;
        newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidth));

        console.log('New width after constraints:', newWidth);

        // Maintain aspect ratio (original is 200:300 = 2:3)
        const aspectRatio = 2 / 3;
        const newHeight = Math.round(newWidth / aspectRatio);

        console.log('Setting new size:', newWidth, 'x', newHeight);

        // Resize the window
        win.setSize(newWidth, newHeight);

        // Re-enforce always on top after resize
        win.setAlwaysOnTop(true, 'screen-saver');
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
