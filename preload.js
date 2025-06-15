window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
      const element = document.getElementById(selector)
      if (element) element.innerText = text
    }
  
    for (const type of ['chrome', 'node', 'electron']) {
      replaceText(`${type}-version`, process.versions[type])
    }
  });const { contextBridge, ipcRenderer } = require('electron');
  
  // Expose protected methods to the renderer process
  contextBridge.exposeInMainWorld('electron', {
      // Expose versions
      versions: {
          node: process.versions.node,
          chrome: process.versions.chrome,
          electron: process.versions.electron
      },
      
      // Expose environment variables
      environment: process.env.NODE_ENV || 'production',
      
      // Expose IPC methods
      ipc: {
          send: (channel, data) => ipcRenderer.send(channel, data),
          on: (channel, func) => {
              const validChannels = ['fromMain'];
              if (validChannels.includes(channel)) {
                  ipcRenderer.on(channel, (event, ...args) => func(...args));
              }
          },
          invoke: (channel, data) => ipcRenderer.invoke(channel, data)
      }
  });
  
  // Log that preload script has been loaded
  console.log('Preload script loaded');