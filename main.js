const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Initialize @electron/remote
require('@electron/remote/main').initialize();

let mainWindow;
let httpServer;
let io;

function createWindow() {
    // Create HTTP server
    httpServer = createServer();
    
    // Create Socket.IO server
    io = new Server(httpServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    // Store connected clients
    const clients = new Map();

    // Handle Socket.IO connections
    io.on('connection', (socket) => {
        console.log('Client connected');
        
        // Handle new user joining
        socket.on('join', (userId) => {
            clients.set(userId, socket.id);
            socket.emit('user-joined', Array.from(clients.keys()));
            socket.broadcast.emit('user-joined', [userId]);
        });

        // Handle text changes from clients
        socket.on('text-change', (data) => {
            socket.broadcast.emit('text-change', data);
        });

        // Handle client disconnection
        socket.on('disconnect', () => {
            // Remove disconnected client
            for (const [userId, socketId] of clients.entries()) {
                if (socketId === socket.id) {
                    clients.delete(userId);
                    io.emit('user-left', userId);
                    break;
                }
            }
        });
    });

    // Start the HTTP server
    httpServer.listen(3000, () => {
        console.log('Socket.IO server running on port 3000');
    });

    // Create the browser window
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
            webSecurity: true
        }
    });
    
    // Enable @electron/remote for this window
    require('@electron/remote/main').enable(mainWindow.webContents);
    
    // Add this to help with module resolution in development
    if (process.env.NODE_ENV === 'development') {
        process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1';
        mainWindow.webContents.openDevTools();
    }

    mainWindow.loadFile('index.html');

    // Open the DevTools in development mode
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Handle Electron app events
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });    
});

app.on('window-all-closed', () => {
    // Close HTTP server when all windows are closed
    if (httpServer) {
        httpServer.close();
    }
    
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Handle any uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

// Handle any unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
