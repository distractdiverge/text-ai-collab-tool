const { contextBridge, ipcRenderer } = require('electron');
const io = require('socket.io-client');

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electron', {
    // Expose Socket.IO
    createSocket: (url) => io(url),
    
    // Expose any other Node.js functionality you need
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
    
    // Example of exposing IPC methods
    ping: () => ipcRenderer.invoke('ping'),
    
    // You can expose other functionality as needed
    platform: process.platform
});
