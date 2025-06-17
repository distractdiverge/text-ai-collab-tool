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
    // Create the browser window with web preferences
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

    // Load the index.html file
    mainWindow.loadFile('index.html');

    // Open DevTools in development mode
    if (process.env.NODE_ENV === 'development') {
        console.log('Running in development mode');
        mainWindow.webContents.openDevTools();
    }

    // Handle window closed event
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Create HTTP and Socket.IO server
function createEditorServer() {
    httpServer = createServer();
    
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
        console.log('Client connected:', socket.id);
        
        // Handle new user joining
        socket.on('join', (userId) => {
            console.log('User joined:', userId);
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
            console.log('Client disconnected:', socket.id);
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
    const PORT = 3000;
    httpServer.listen(PORT, () => {
        console.log(`Socket.IO server running on port ${PORT}`);
    });
}

// Handle Electron app events
app.whenReady().then(() => {
    createWindow();
    createEditorServer();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// On Window close & Darwin (OSX) make sure to quit the app
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
