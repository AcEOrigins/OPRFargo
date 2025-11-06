// Content Management Functions

// Load site content from database (for compatibility)
async function loadSiteContent() {
    try {
        const settings = await getSettings();
        return {
            slideshow: {}, // Slideshow handled separately
            settings: {
                updateInterval: parseInt(settings.updateInterval) || 30
            }
        };
    } catch (error) {
        console.error('Error loading site content:', error);
        return {
            slideshow: {},
            settings: {
                updateInterval: 30
            }
        };
    }
}

// Save site content to database (for compatibility)
async function saveSiteContent(content) {
    try {
        if (content.settings) {
            await saveSetting('updateInterval', content.settings.updateInterval || 30);
        }
    } catch (error) {
        console.error('Error saving site content:', error);
    }
}

// Sidebar navigation
// Tab titles mapping
const tabTitles = {
    'servers': 'Server Management',
    'slideshow': 'Slideshow',
    'events': 'Events',
    'settings': 'Settings'
};

function initSidebar() {
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const floatingAddBtn = document.getElementById('floatingAddBtn');
    const headerBarTitle = document.getElementById('headerBarTitle');
    const mainHeaderBar = document.getElementById('mainHeaderBar');
    
    // Ensure header bar is visible
    if (mainHeaderBar) {
        mainHeaderBar.style.display = 'block';
    }
    
    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all items
            sidebarItems.forEach(i => i.classList.remove('active'));
            // Add active class to clicked item
            item.classList.add('active');
            
            // Hide all sections
            const sections = document.querySelectorAll('.admin-section');
            sections.forEach(section => section.style.display = 'none');
            
            // Hide servers display section
            const serversDisplaySection = document.getElementById('servers-display-section');
            
            if (serversDisplaySection) {
                serversDisplaySection.style.display = 'none';
            }
            
            // Show selected section
            const sectionName = item.getAttribute('data-section');
            const section = document.getElementById(`${sectionName}-section`);
            if (section) {
                section.style.display = 'block';
            }
            
            // Update header bar title
            if (headerBarTitle && tabTitles[sectionName]) {
                headerBarTitle.textContent = tabTitles[sectionName];
            }
            
            // Ensure header bar is visible
            if (mainHeaderBar) {
                mainHeaderBar.style.display = 'block';
            }
            
            // Show/hide floating add button and servers display section (only for servers tab)
            const floatingAddImageBtn = document.getElementById('floatingAddImageBtn');
            if (floatingAddBtn) {
                if (sectionName === 'servers') {
                    floatingAddBtn.style.display = 'flex';
                    // Show servers display section
                    if (serversDisplaySection) {
                        serversDisplaySection.style.display = 'block';
                    }
                } else {
                    floatingAddBtn.style.display = 'none';
                }
            }
            
            // Show/hide floating add image button (only for slideshow tab)
            if (floatingAddImageBtn) {
                if (sectionName === 'slideshow') {
                    floatingAddImageBtn.style.display = 'flex';
                    // Load and display images when slideshow tab is opened
                    if (typeof displayImages === 'function') {
                        displayImages();
                    }
                } else {
                    floatingAddImageBtn.style.display = 'none';
                }
            }
        });
    });
    
    // Show add button and servers sections on initial load if servers section is active
    const activeItem = document.querySelector('.sidebar-item.active');
    if (activeItem) {
        const sectionName = activeItem.getAttribute('data-section');
        
        // Update header bar title on initial load
        if (headerBarTitle && tabTitles[sectionName]) {
            headerBarTitle.textContent = tabTitles[sectionName];
        }
        
        // Ensure header bar is visible on initial load
        if (mainHeaderBar) {
            mainHeaderBar.style.display = 'block';
        }
        
        if (sectionName === 'servers') {
            if (floatingAddBtn) floatingAddBtn.style.display = 'flex';
            const serversDisplaySection = document.getElementById('servers-display-section');
            if (serversDisplaySection) serversDisplaySection.style.display = 'block';
        } else {
            if (floatingAddBtn) floatingAddBtn.style.display = 'none';
        }
        
        // Show/hide floating add image button on initial load
        const floatingAddImageBtn = document.getElementById('floatingAddImageBtn');
        if (floatingAddImageBtn) {
            if (sectionName === 'slideshow') {
                floatingAddImageBtn.style.display = 'flex';
                // Load and display images when slideshow tab is opened
                if (typeof displayImages === 'function') {
                    displayImages();
                }
            } else {
                floatingAddImageBtn.style.display = 'none';
            }
        }
    } else {
        // If no active item, default to servers section
        const serversItem = document.querySelector('.sidebar-item[data-section="servers"]');
        if (serversItem) {
            serversItem.classList.add('active');
            if (headerBarTitle && tabTitles['servers']) {
                headerBarTitle.textContent = tabTitles['servers'];
            }
            if (mainHeaderBar) {
                mainHeaderBar.style.display = 'block';
            }
            if (floatingAddBtn) floatingAddBtn.style.display = 'flex';
            const serversDisplaySection = document.getElementById('servers-display-section');
            if (serversDisplaySection) serversDisplaySection.style.display = 'block';
        }
    }
}

// Load content into forms
async function loadContentIntoForms() {
    try {
        // Wait a bit to ensure DOM is ready and admin content is visible
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Check if admin content is visible
        const adminContent = document.getElementById('adminContent');
        if (!adminContent || adminContent.style.display === 'none') {
            console.warn('Admin content not visible yet, skipping form load');
            return;
        }
        
        const content = await loadSiteContent();
        
        // Settings
        if (content && content.settings) {
            const updateIntervalEl = document.getElementById('updateInterval');
            if (updateIntervalEl) {
                updateIntervalEl.value = content.settings.updateInterval || 30;
            } else {
                console.warn('updateInterval element not found in DOM');
            }
        }
        
        // Display events in admin panel
        await displayAdminEvents();
    } catch (error) {
        console.error('Error in loadContentIntoForms:', error);
    }
}

// Save slideshow images (deprecated - now using database)
function saveSlideshowImages() {
    // This function is deprecated - slideshow is now managed via database
    console.log('saveSlideshowImages is deprecated - use slideshow admin instead');
}

// Save settings
async function saveSettings() {
    const updateIntervalEl = document.getElementById('updateInterval');
    if (!updateIntervalEl) {
        console.error('updateInterval element not found');
        return;
    }
    const interval = parseInt(updateIntervalEl.value);
    if (isNaN(interval) || interval < 10 || interval > 300) {
        alert('Update interval must be between 10 and 300 seconds');
        return;
    }
    
    try {
        await saveSetting('updateInterval', interval);
        alert('Settings saved successfully!');
    } catch (error) {
        console.error('Error saving settings:', error);
        alert('Error saving settings. Please try again.');
    }
}

// Events Management
async function loadEvents() {
    try {
        const events = await getEvents();
        return Array.isArray(events) ? events : [];
    } catch (error) {
        console.error('Error loading events:', error);
        return [];
    }
}

async function addEvent() {
    const titleEl = document.getElementById('eventTitle');
    const dateEl = document.getElementById('eventDate');
    const descriptionEl = document.getElementById('eventDescription');
    
    if (!titleEl || !dateEl) {
        console.error('Event form elements not found');
        return;
    }
    
    const title = titleEl.value.trim();
    const date = dateEl.value;
    const description = descriptionEl ? descriptionEl.value.trim() : '';
    
    if (!title || !date) {
        alert('Please fill in event title and date');
        return;
    }
    
    try {
        // Use the API function from api.js
        const response = await fetch('/php/api.php?action=add_event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: title,
                date: date,
                description: description || ''
            })
        });
        const result = await response.json();
        
        if (result.success) {
            // Clear form
            if (titleEl) titleEl.value = '';
            if (dateEl) dateEl.value = '';
            if (descriptionEl) descriptionEl.value = '';
            
            // Refresh display
            await displayAdminEvents();
            alert('Event added successfully!');
        } else {
            alert('Error adding event: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error adding event:', error);
        alert('Error adding event. Please try again.');
    }
}

async function removeEvent(eventId) {
    if (!confirm('Are you sure you want to remove this event?')) {
        return;
    }
    
    try {
        await deleteEvent(eventId);
        await displayAdminEvents();
    } catch (error) {
        console.error('Error removing event:', error);
        alert('Error removing event. Please try again.');
    }
}

async function displayAdminEvents() {
    const events = await loadEvents();
    const adminList = document.getElementById('adminEventsList');
    
    if (!adminList) return;
    
    if (events.length === 0) {
        adminList.innerHTML = '<div class="empty-state">No events added yet. Add your first event above.</div>';
        return;
    }
    
    // Sort by date
    const sortedEvents = [...events].sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
    });
    
    adminList.innerHTML = sortedEvents.map(event => {
        const eventDate = new Date(event.date);
        const dateStr = eventDate.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        
        return `
            <div class="admin-server-item">
                <div class="admin-server-info">
                    <strong>${escapeHtml(event.title)}</strong>
                    <span class="admin-server-id">${dateStr}</span>
                    ${event.description ? `<span style="display: block; margin-top: 0.25rem; color: var(--text-secondary); font-size: 0.9rem;">${escapeHtml(event.description)}</span>` : ''}
                </div>
                <button class="remove-server-btn" onclick="removeEvent('${event.id}')">Remove</button>
            </div>
        `;
    }).join('');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (isAuthenticated()) {
        initSidebar();
        loadContentIntoForms();
    }
});

// Ensure admin UI elements (header, floating add buttons, server section) are visible
// This is a non-invasive initializer to run after DOM/content loads and after auth flows.
function ensureAdminUI(){
    try{
        const adminContent = document.getElementById('adminContent');
        const mainHeaderBar = document.getElementById('mainHeaderBar');
        const floatingAddBtn = document.getElementById('floatingAddBtn');
        const floatingAddImageBtn = document.getElementById('floatingAddImageBtn');
        const serversDisplaySection = document.getElementById('servers-display-section');

        if(!adminContent) return;

        // If adminContent is shown, ensure header is visible
        if (adminContent.style.display !== 'none'){
            if (mainHeaderBar) mainHeaderBar.style.display = 'block';

            // Determine active section
            const activeItem = document.querySelector('.sidebar-item.active') || document.querySelector('.sidebar-item[data-section="servers"]');
            const sectionName = activeItem ? activeItem.getAttribute('data-section') : 'servers';

            // Toggle servers display and floating add button
            if (sectionName === 'servers'){
                if (serversDisplaySection) serversDisplaySection.style.display = 'block';
                if (floatingAddBtn) floatingAddBtn.style.display = 'flex';
            } else {
                if (floatingAddBtn) floatingAddBtn.style.display = 'none';
            }

            // Toggle slideshow add image button
            if (sectionName === 'slideshow'){
                if (floatingAddImageBtn) floatingAddImageBtn.style.display = 'flex';
            } else {
                if (floatingAddImageBtn) floatingAddImageBtn.style.display = 'none';
            }
        }
    }catch(e){
        console.warn('ensureAdminUI error', e);
    }
}

// Run ensureAdminUI at key points to make sure UI becomes visible when scripts/auth finish
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(ensureAdminUI, 50);
    setTimeout(ensureAdminUI, 500);
});

// Also call from other modules if needed (admin.js will call loadContentIntoForms and displayAdminServers)
window.ensureAdminUI = ensureAdminUI;

