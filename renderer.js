// Make sure electron is available
if (!window.electron) {
    console.error('Electron APIs not available!');
    return;
}

// Configure require.js to load Monaco
require.config({
    paths: {
        'vs': './node_modules/monaco-editor/min/vs'
    }
});

// Initialize Socket.IO through the preload script
console.log('Initializing Socket.IO...');
const socket = window.electron.createSocket('http://localhost:3000');

// Load Monaco Editor
require(['vs/editor/editor.main'], function() {
    console.log('Monaco Editor loaded');
    const editor = monaco.editor.create(document.getElementById('editor'), {
        value: '',
        language: 'javascript',
        theme: 'vs-dark',
        minimap: { enabled: false },
        lineNumbers: 'on',
        automaticLayout: true
    });

    // Store current user ID
    const userId = Math.random().toString(36).substring(2);
    socket.emit('join', userId);

    // Handle text changes
    editor.onDidChangeModelContent(() => {
        const model = editor.getModel();
        const changes = model.getAlternativeVersionId();
        socket.emit('text-change', {
            changes,
            value: model.getValue()
        });
    });

    // Handle incoming text changes
    socket.on('text-change', (data) => {
        const model = editor.getModel();
        if (model.getAlternativeVersionId() !== data.changes) {
            model.setValue(data.value);
        }
    });

    // Update users list
    socket.on('user-joined', (users) => {
        updateUsersList(users);
    });

    socket.on('user-left', (userId) => {
        updateUsersList(Array.from(document.getElementById('users-list').children)
            .map(el => el.dataset.userId)
            .filter(id => id !== userId));
    });

    function updateUsersList(users) {
        const usersList = document.getElementById('users-list');
        usersList.innerHTML = users.map(user => `
            <div class="user-item" data-user-id="${user}">
                <span class="user-icon">👤</span>
                <span class="user-id">User ${user}</span>
            </div>
        `).join('');
    }
});
