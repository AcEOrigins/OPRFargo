// Admin Panel Functions

// Admin Password - Change this to your desired password
const ADMIN_PASSWORD = 'admin123'; // Change this to your secure password

// Check if user is authenticated
function isAuthenticated() {
    return sessionStorage.getItem('adminAuthenticated') === 'true';
}

// Check password and authenticate
function checkPassword() {
    const passwordInput = document.getElementById('passwordInput');
    const passwordError = document.getElementById('passwordError');
    const enteredPassword = passwordInput.value.trim();

    if (enteredPassword === ADMIN_PASSWORD) {
        sessionStorage.setItem('adminAuthenticated', 'true');
        document.getElementById('passwordModal').style.display = 'none';
        document.getElementById('adminContent').style.display = 'block';
        // Initialize admin panel after authentication
        displayAdminServers();
        if (typeof initSidebar === 'function') initSidebar();
        if (typeof loadContentIntoForms === 'function') loadContentIntoForms();
    } else {
        passwordError.textContent = 'Incorrect password. Please try again.';
        passwordError.style.display = 'block';
        passwordInput.value = '';
        passwordInput.focus();
    }
}

// Allow Enter key to submit password
document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('passwordInput');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                checkPassword();
            }
        });
    }

    // Check if already authenticated
    if (isAuthenticated()) {
        document.getElementById('passwordModal').style.display = 'none';
        document.getElementById('adminContent').style.display = 'block';
        displayAdminServers();
        if (typeof initSidebar === 'function') initSidebar();
        if (typeof loadContentIntoForms === 'function') loadContentIntoForms();
    } else {
        // Focus password input
        setTimeout(() => {
            if (passwordInput) passwordInput.focus();
        }, 100);
    }
});

// Load servers from localStorage
function loadServers() {
    const serversJson = localStorage.getItem('oprFargoServers');
    if (serversJson) {
        return JSON.parse(serversJson);
    }
    return [];
}

// Save servers to localStorage
function saveServers(servers) {
    localStorage.setItem('oprFargoServers', JSON.stringify(servers));
}

// Add a new server
function addServer() {
    const serverName = document.getElementById('serverName').value.trim();
    const battlemetricsId = document.getElementById('battlemetricsId').value.trim();

    if (!serverName || !battlemetricsId) {
        alert('Please fill in all fields');
        return;
    }

    // Validate that ID is a number
    if (isNaN(battlemetricsId)) {
        alert('BattleMetrics Server ID must be a number');
        return;
    }

    const servers = loadServers();
    
    // Check if server ID already exists
    if (servers.some(s => s.id === battlemetricsId)) {
        alert('Server with this BattleMetrics ID already exists');
        return;
    }

    const newServer = {
        id: battlemetricsId,
        name: serverName,
        displayName: serverName
    };

    servers.push(newServer);
    saveServers(servers);

    // Clear form
    document.getElementById('serverName').value = '';
    document.getElementById('battlemetricsId').value = '';

    // Refresh admin list
    displayAdminServers();
    
    // Show success message
    alert('Server added successfully!');
}

// Remove a server
function removeServer(serverId) {
    if (!confirm('Are you sure you want to remove this server?')) {
        return;
    }

    const servers = loadServers();
    const filteredServers = servers.filter(s => s.id !== serverId);
    saveServers(filteredServers);

    // Refresh admin list
    displayAdminServers();
}

// Display servers in admin panel
function displayAdminServers() {
    const servers = loadServers();
    const adminList = document.getElementById('adminServersList');

    if (servers.length === 0) {
        adminList.innerHTML = '<div class="empty-state">No servers added yet. Add your first server above.</div>';
        return;
    }

    adminList.innerHTML = servers.map(server => {
        return `
            <div class="admin-server-item">
                <div class="admin-server-info">
                    <strong>${escapeHtml(server.displayName || server.name)}</strong>
                    <span class="admin-server-id">ID: ${server.id}</span>
                </div>
                <button class="remove-server-btn" onclick="removeServer('${server.id}')">Remove</button>
            </div>
        `;
    }).join('');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}


