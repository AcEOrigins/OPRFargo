// Admin Panel Functions

// Admin Password - Change this to your desired password
const ADMIN_PASSWORD = 'PQ81377CAS2024!'; // Change this to your secure password

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
        
        const passwordModal = document.getElementById('passwordModal');
        const passwordModalContent = passwordModal.querySelector('.password-modal-content');
        const passwordModalLogo = passwordModal.querySelector('.password-modal-logo');
        const loadingScreen = document.getElementById('loadingScreen');
        const loadingLogo = document.getElementById('loadingLogo');
        
        // Show loading screen immediately (logo will transition smoothly)
        loadingScreen.style.display = 'flex';
        
        // Collapse the login box content (everything except logo)
        passwordModalContent.classList.add('collapsing');
        
        // Start logo transition
        passwordModalLogo.classList.add('transitioning');
        
        // After collapse animation (0.5s), hide password modal
        setTimeout(() => {
            passwordModal.style.display = 'none';
            
            // Start trace animation for each line sequentially
            loadingScreen.classList.add('rotating');
            
            // After 5 seconds (all traces complete - 5 colors × 1s each), hide loading screen and show admin panel
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                loadingScreen.classList.remove('rotating');
                const adminContent = document.getElementById('adminContent');
                if (adminContent) {
                    adminContent.style.display = 'block';
                    // Small delay to ensure DOM is ready
                    setTimeout(() => {
                        // Initialize admin panel after authentication
                        if (typeof displayAdminServers === 'function') displayAdminServers();
                        if (typeof initSidebar === 'function') initSidebar();
                        if (typeof loadContentIntoForms === 'function') loadContentIntoForms();
                    }, 100);
                }
            }, 5000);
        }, 500);
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

    // Allow Enter key to submit add server form
    const battlemetricsIdInput = document.getElementById('battlemetricsId');
    if (battlemetricsIdInput) {
        battlemetricsIdInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addServer();
            }
        });
    }

    // Check if already authenticated
    if (isAuthenticated()) {
        const passwordModal = document.getElementById('passwordModal');
        const adminContent = document.getElementById('adminContent');
        if (passwordModal) passwordModal.style.display = 'none';
        if (adminContent) {
            adminContent.style.display = 'block';
            // Small delay to ensure DOM is ready
            setTimeout(() => {
                if (typeof displayAdminServers === 'function') displayAdminServers();
                if (typeof initSidebar === 'function') initSidebar();
                if (typeof loadContentIntoForms === 'function') loadContentIntoForms();
            }, 100);
        }
    } else {
        // Focus password input
        setTimeout(() => {
            if (passwordInput) passwordInput.focus();
        }, 100);
    }
});

// Load servers from database
async function loadServers() {
    try {
        const servers = await getServers();
        // Convert database format to frontend format
        return servers.map(s => ({
            id: s.battlemetrics_id,  // BattleMetrics ID for frontend
            dbId: s.id,               // Database ID for deletion
            name: s.name,
            displayName: s.display_name || s.name
        }));
    } catch (error) {
        console.error('Error loading servers:', error);
        return [];
    }
}

// Save servers to database (not used directly, but kept for compatibility)
async function saveServers(servers) {
    // This function is kept for compatibility but servers are saved individually via API
    console.warn('saveServers() is deprecated. Use addServer() or updateServer() instead.');
}

// Open add server modal
function openAddServerModal() {
    const modal = document.getElementById('addServerModal');
    if (modal) {
        modal.style.display = 'flex';
        // Focus on first input
        setTimeout(() => {
            const serverNameInput = document.getElementById('serverName');
            if (serverNameInput) serverNameInput.focus();
        }, 100);
        // Close on background click
        const closeOnBackground = function(e) {
            if (e.target === modal) {
                closeAddServerModal();
                modal.removeEventListener('click', closeOnBackground);
            }
        };
        modal.addEventListener('click', closeOnBackground);
        // Close on Escape key
        const closeOnEscape = function(e) {
            if (e.key === 'Escape') {
                closeAddServerModal();
                document.removeEventListener('keydown', closeOnEscape);
            }
        };
        document.addEventListener('keydown', closeOnEscape);
    }
}

// Close add server modal
function closeAddServerModal() {
    const modal = document.getElementById('addServerModal');
    if (modal) {
        modal.style.display = 'none';
        // Clear form
        const serverName = document.getElementById('serverName');
        const battlemetricsId = document.getElementById('battlemetricsId');
        if (serverName) serverName.value = '';
        if (battlemetricsId) battlemetricsId.value = '';
    }
}

// Add a new server
async function addServer() {
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

    try {
        // Check if server ID already exists
        const existingServers = await loadServers();
        if (existingServers.some(s => s.id === battlemetricsId)) {
            alert('Server with this BattleMetrics ID already exists');
            return;
        }

        // Add server via API
        await apiCall('add_server', 'POST', {
            name: serverName,
            displayName: serverName,
            battlemetricsId: battlemetricsId,
            ipAddress: ''
        });

        // Clear form
        document.getElementById('serverName').value = '';
        document.getElementById('battlemetricsId').value = '';

        // Refresh admin list
        await displayAdminServers();
        
        // Close modal
        closeAddServerModal();
        
        // Show success message
        if (typeof showToast === 'function') {
            showToast('Server Added', 'Server added successfully!', 'success');
        } else {
            alert('Server added successfully!');
        }
    } catch (error) {
        console.error('Error adding server:', error);
        alert('Error adding server. Please try again.');
    }
}

// Remove a server (called after confirmation)
async function removeServer(serverId) {
    try {
        await deleteServer(serverId);
        // Refresh admin list
        await displayAdminServers();
    } catch (error) {
        console.error('Error removing server:', error);
        alert('Error removing server. Please try again.');
    }
}

// Display servers in admin panel
async function displayAdminServers() {
    const servers = await loadServers();
    const adminList = document.getElementById('adminServersList');

    if (!adminList) return;

    if (servers.length === 0) {
        adminList.innerHTML = '<div class="empty-state">No servers added yet. Add your first server above.</div>';
        return;
    }

    // Clear existing content
    adminList.innerHTML = '';
    
    // Create server cards similar to main page
    servers.forEach(server => {
        const card = document.createElement('div');
        card.className = 'server-card admin-server-card';
        card.id = `admin-server-${server.id}`;
        card.innerHTML = `
            <button class="admin-remove-x" onclick="confirmRemoveServer('${server.dbId}', '${server.id}')" aria-label="Remove server">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
            </button>
            <div class="server-status-line" id="admin-statusLine-${server.id}"></div>
            <div class="server-card-header">
                <h2 class="server-card-title">${escapeHtml(server.displayName || server.name)}</h2>
                <div class="status-indicator" id="admin-status-${server.id}">
                    <span class="status-dot"></span>
                    <span class="status-text">Loading...</span>
                </div>
            </div>
            <div class="server-card-content">
                <div class="players-pair">
                    <div class="info-card square-card">
                        <div class="info-label">Players</div>
                        <div class="info-value" id="admin-players-${server.id}">-</div>
                    </div>
                    <div class="info-card square-card">
                        <div class="info-label">Max Players</div>
                        <div class="info-value" id="admin-maxPlayers-${server.id}">-</div>
                    </div>
                </div>
                <div class="server-info-grid">
                    <div class="info-card">
                        <div class="info-label">Map</div>
                        <div class="info-value" id="admin-map-${server.id}">-</div>
                    </div>
                    <div class="info-card">
                        <div class="info-label">Game Mode</div>
                        <div class="info-value" id="admin-gameMode-${server.id}">-</div>
                    </div>
                </div>
                <div class="uptime-card-container">
                    <div class="info-card uptime-card">
                        <div class="info-label">Uptime</div>
                        <div class="info-value" id="admin-uptime-${server.id}">-</div>
                    </div>
                </div>
                <div class="server-connect-section">
                    <div class="server-ip-display" id="admin-serverIP-${server.id}">
                        <span>Server IP: </span>
                        <span class="ip-address" id="admin-ipAddress-${server.id}">Loading...</span>
                        <button class="copy-btn" onclick="copyIP('${server.id}')">Copy</button>
                    </div>
                </div>
            </div>
        `;
        adminList.appendChild(card);
        
        // Fetch server data from BattleMetrics
        fetchAdminServerData(server.id, server.displayName || server.name);
    });
}

// Fetch server data for admin panel
async function fetchAdminServerData(serverId, displayName) {
    try {
        const apiUrl = `https://api.battlemetrics.com/servers/${serverId}?include=player,session`;
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        updateAdminServerDisplay(data, serverId, displayName);
    } catch (error) {
        console.error(`Error fetching server data for ${serverId}:`, error);
        displayAdminError(serverId, displayName);
    }
}

// Update admin server card with data
function updateAdminServerDisplay(data, serverId, displayName) {
    const attributes = data.data.attributes;
    
    // Update status indicator
    const statusIndicator = document.getElementById(`admin-status-${serverId}`);
    if (!statusIndicator) return;
    
    const statusDot = statusIndicator.querySelector('.status-dot');
    const statusText = statusIndicator.querySelector('.status-text');
    
    // Update status line
    const statusLine = document.getElementById(`admin-statusLine-${serverId}`);
    if (statusLine) {
        if (attributes.status === 'online') {
            statusLine.classList.add('online');
            statusLine.classList.remove('offline');
        } else {
            statusLine.classList.add('offline');
            statusLine.classList.remove('online');
        }
    }
    
    if (attributes.status === 'online') {
        statusDot.classList.add('online');
        statusDot.classList.remove('offline');
        statusText.textContent = 'Online';
    } else {
        statusDot.classList.add('offline');
        statusDot.classList.remove('online');
        statusText.textContent = 'Offline';
    }
    
    // Update server information
    const playersEl = document.getElementById(`admin-players-${serverId}`);
    const maxPlayersEl = document.getElementById(`admin-maxPlayers-${serverId}`);
    const mapEl = document.getElementById(`admin-map-${serverId}`);
    const gameModeEl = document.getElementById(`admin-gameMode-${serverId}`);
    const uptimeEl = document.getElementById(`admin-uptime-${serverId}`);
    const ipAddressEl = document.getElementById(`admin-ipAddress-${serverId}`);
    
    if (playersEl) playersEl.textContent = attributes.players || 0;
    if (maxPlayersEl) maxPlayersEl.textContent = attributes.maxPlayers || 0;
    
    // Get map and game mode from details
    const details = attributes.details || {};
    if (mapEl) mapEl.textContent = details.map || 'Unknown';
    if (gameModeEl) gameModeEl.textContent = details.mode || details.gameMode || 'Unknown';
    
    // Calculate and display uptime
    if (uptimeEl) {
        if (attributes.details?.uptime) {
            uptimeEl.textContent = formatUptime(attributes.details.uptime);
        } else if (attributes.startTime) {
            const startTime = new Date(attributes.startTime);
            const uptime = calculateUptime(startTime);
            uptimeEl.textContent = uptime;
        } else {
            uptimeEl.textContent = 'N/A';
        }
    }
    
    // Update server IP
    const ip = attributes.ip || 'N/A';
    const port = attributes.port || 'N/A';
    const ipPort = `${ip}:${port}`;
    if (ipAddressEl) ipAddressEl.textContent = ipPort;
}

// Display error for admin server card
function displayAdminError(serverId, displayName) {
    const statusIndicator = document.getElementById(`admin-status-${serverId}`);
    if (statusIndicator) {
        const statusText = statusIndicator.querySelector('.status-text');
        if (statusText) statusText.textContent = 'Error';
    }
}

// Format uptime helper (reuse from main.js if available, otherwise define)
function formatUptime(seconds) {
    if (typeof calculateUptime === 'function') {
        // Use existing function if available
        const date = new Date(Date.now() - seconds * 1000);
        return calculateUptime(date);
    }
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

// Calculate uptime helper
function calculateUptime(startTime) {
    const now = new Date();
    const diff = now - startTime;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

// Show toast notification
function showToast(title, message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Icon based on type
    let iconSvg = '';
    if (type === 'error') {
        iconSvg = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>';
    } else if (type === 'success') {
        iconSvg = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
    } else if (type === 'warning') {
        iconSvg = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>';
    } else {
        iconSvg = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>';
    }

    toast.innerHTML = `
        <div class="toast-icon">${iconSvg}</div>
        <div class="toast-content">
            <div class="toast-title">${escapeHtml(title)}</div>
            <div class="toast-message">${escapeHtml(message)}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()" aria-label="Close">
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
        </button>
    `;

    container.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 300);
    }, 5000);
}

// Store the server ID for deletion
let pendingDeleteServerId = null;

// Confirm and remove server
async function confirmRemoveServer(dbId, battlemetricsId) {
    // Get server name before removing
    const servers = await loadServers();
    const server = servers.find(s => s.dbId == dbId);
    const serverName = server ? (server.displayName || server.name) : 'Server';

    // Store the database ID for deletion
    pendingDeleteServerId = dbId;

    // Update modal content
    document.getElementById('deleteServerName').textContent = `"${serverName}"`;

    // Show custom modal
    const deleteModal = document.getElementById('deleteModal');
    deleteModal.style.display = 'flex';
}

// Close delete modal
function closeDeleteModal() {
    const deleteModal = document.getElementById('deleteModal');
    deleteModal.style.display = 'none';
    pendingDeleteServerId = null;
}

// Confirm delete action
async function confirmDelete() {
    if (pendingDeleteServerId) {
        // Get server name before removing for toast
        const servers = await loadServers();
        const server = servers.find(s => s.dbId == pendingDeleteServerId);
        const serverName = server ? (server.displayName || server.name) : 'Server';

        // Remove the server
        await removeServer(pendingDeleteServerId);

        // Show success toast
        showToast('Server Removed', `"${serverName}" has been removed successfully.`, 'success');

        // Close modal
        closeDeleteModal();
    }
}

// Close modal when clicking overlay
document.addEventListener('DOMContentLoaded', () => {
    const deleteModal = document.getElementById('deleteModal');
    const overlay = deleteModal?.querySelector('.delete-modal-overlay');
    
    if (overlay) {
        overlay.addEventListener('click', closeDeleteModal);
    }

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && deleteModal.style.display === 'flex') {
            closeDeleteModal();
        }
    });
});

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Logout function
function logout() {
    // Clear authentication
    sessionStorage.removeItem('adminAuthenticated');
    // Redirect to show login modal again
    window.location.reload();
}


