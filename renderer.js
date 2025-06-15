// Load Monaco Editor
async function loadMonacoEditor() {
    return new Promise((resolve) => {
        // Configure require for Monaco
        require.config({
            paths: { 
                'vs': './node_modules/monaco-editor/min/vs',
                'socketio': 'https://cdn.socket.io/4.5.0/socket.io.min'
            }
        });

        // Load Monaco
        require(['vs/editor/editor.main'], () => {
            // Create editor
            window.editor = monaco.editor.create(document.getElementById('editor'), {
                value: '// Welcome to the Collaborative Text Editor\\n// Start typing here...\\n',
                language: 'javascript',
                theme: 'vs-dark',
                automaticLayout: true,
                minimap: { enabled: true }
            });
            
            // Handle editor changes
            window.editor.onDidChangeModelContent((event) => {
                const value = window.editor.getValue();
                const version = window.editor.getModel().getAlternativeVersionId();
                
                // Emit changes to other clients
                if (window.socket && window.socket.connected) {
                    window.socket.emit('text-change', {
                        value,
                        version,
                        userId: window.userId
                    });
                }
            });
            
            resolve();
        });
    });
}

// Initialize Socket.IO connection
function initializeSocketIO() {
    return new Promise((resolve) => {
        // Generate a random user ID
        window.userId = 'user-' + Math.random().toString(36).substr(2, 9);
        
        // Connect to Socket.IO server
        window.socket = window.io('http://localhost:3000');
        
        // Handle connection
        window.socket.on('connect', () => {
            console.log('Connected to server with ID:', window.socket.id);
            
            // Join the collaborative session
            window.socket.emit('join', window.userId);
        });
        
        // Handle text changes from other clients
        window.socket.on('text-change', (data) => {
            if (data.userId !== window.userId) {
                const currentValue = window.editor.getValue();
                if (currentValue !== data.value) {
                    window.editor.setValue(data.value);
                }
            }
        });
        
        // Handle user list updates
        window.socket.on('user-joined', (users) => {
            updateUsersList(users);
        });
        
        window.socket.on('user-left', (userId) => {
            console.log('User left:', userId);
            // We'll update the UI in the next step
        });
        
        resolve();
    });
}

// Update the users list in the sidebar
function updateUsersList(users) {
    const usersList = document.getElementById('users-list');
    if (usersList) {
        usersList.innerHTML = users
            .map(userId => `
                <div class="user-item">
                    <span class="user-icon">👤</span>
                    <span class="user-id">${userId}</span>
                </div>
            `)
            .join('');
    }
}

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM fully loaded');
    
    try {
        // Load Monaco Editor
        await loadMonacoEditor();
        console.log('Monaco Editor loaded');
        
        // Initialize Socket.IO connection
        await initializeSocketIO();
        console.log('Socket.IO initialized');
        
    } catch (error) {
        console.error('Error initializing application:', error);
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    if (window.editor) {
        window.editor.layout();
    }
});

console.log('Renderer script loaded');// This file will be loaded in the renderer process
console.log('Renderer process started');

// We'll add Monaco Editor and Socket.IO initialization here
// For now, just log that the renderer is ready
console.log('Renderer script loaded');

// This will be replaced with Monaco Editor initialization in the next step
