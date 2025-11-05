// Content Management Functions

// Load site content from localStorage
function loadSiteContent() {
    const contentJson = localStorage.getItem('oprFargoContent');
    if (contentJson) {
        return JSON.parse(contentJson);
    }
    return {
        homepage: {
            title: 'OPR Fargo',
            description: 'Arma Reforger Server'
        },
        footer: {
            description: 'Join us for tactical military simulation gameplay',
            copyright: '© 2024 OPR Fargo. All rights reserved.'
        },
        social: {
            discord: '',
            twitter: '',
            facebook: '',
            instagram: '',
            youtube: '',
            twitch: '',
            reddit: ''
        },
        slideshow: {
            slide1: 'images/slide1.jpg',
            slide2: 'images/slide2.jpg',
            slide3: 'images/slide3.jpg'
        },
        settings: {
            updateInterval: 30
        }
    };
}

// Save site content to localStorage
function saveSiteContent(content) {
    localStorage.setItem('oprFargoContent', JSON.stringify(content));
}

// Sidebar navigation
function initSidebar() {
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all items
            sidebarItems.forEach(i => i.classList.remove('active'));
            // Add active class to clicked item
            item.classList.add('active');
            
            // Hide all sections
            const sections = document.querySelectorAll('.admin-section');
            sections.forEach(section => section.style.display = 'none');
            
            // Show selected section
            const sectionName = item.getAttribute('data-section');
            const section = document.getElementById(`${sectionName}-section`);
            if (section) {
                section.style.display = 'block';
            }
        });
    });
}

// Load content into forms
function loadContentIntoForms() {
    const content = loadSiteContent();
    
    // Homepage
    if (content.homepage) {
        document.getElementById('siteTitle').value = content.homepage.title || '';
        document.getElementById('siteDescription').value = content.homepage.description || '';
    }
    
    // Footer
    if (content.footer) {
        document.getElementById('footerDescription').value = content.footer.description || '';
        document.getElementById('footerCopyright').value = content.footer.copyright || '';
    }
    
    // Social Media
    if (content.social) {
        document.getElementById('discordLink').value = content.social.discord || '';
        document.getElementById('twitterLink').value = content.social.twitter || '';
        document.getElementById('facebookLink').value = content.social.facebook || '';
        document.getElementById('instagramLink').value = content.social.instagram || '';
        document.getElementById('youtubeLink').value = content.social.youtube || '';
        document.getElementById('twitchLink').value = content.social.twitch || '';
        document.getElementById('redditLink').value = content.social.reddit || '';
    }
    
    // Slideshow
    if (content.slideshow) {
        document.getElementById('slide1Url').value = content.slideshow.slide1 || '';
        document.getElementById('slide2Url').value = content.slideshow.slide2 || '';
        document.getElementById('slide3Url').value = content.slideshow.slide3 || '';
    }
    
    // Settings
    if (content.settings) {
        document.getElementById('updateInterval').value = content.settings.updateInterval || 30;
    }
}

// Save homepage content
function saveHomepageContent() {
    const content = loadSiteContent();
    content.homepage = {
        title: document.getElementById('siteTitle').value.trim(),
        description: document.getElementById('siteDescription').value.trim()
    };
    saveSiteContent(content);
    alert('Homepage content saved successfully!');
}

// Save footer content
function saveFooterContent() {
    const content = loadSiteContent();
    content.footer = {
        description: document.getElementById('footerDescription').value.trim(),
        copyright: document.getElementById('footerCopyright').value.trim()
    };
    saveSiteContent(content);
    alert('Footer content saved successfully!');
}

// Save social media links
function saveSocialLinks() {
    const content = loadSiteContent();
    content.social = {
        discord: document.getElementById('discordLink').value.trim(),
        twitter: document.getElementById('twitterLink').value.trim(),
        facebook: document.getElementById('facebookLink').value.trim(),
        instagram: document.getElementById('instagramLink').value.trim(),
        youtube: document.getElementById('youtubeLink').value.trim(),
        twitch: document.getElementById('twitchLink').value.trim(),
        reddit: document.getElementById('redditLink').value.trim()
    };
    saveSiteContent(content);
    alert('Social media links saved successfully!');
}

// Save slideshow images
function saveSlideshowImages() {
    const content = loadSiteContent();
    content.slideshow = {
        slide1: document.getElementById('slide1Url').value.trim(),
        slide2: document.getElementById('slide2Url').value.trim(),
        slide3: document.getElementById('slide3Url').value.trim()
    };
    saveSiteContent(content);
    alert('Slideshow images saved successfully!');
}

// Save settings
function saveSettings() {
    const content = loadSiteContent();
    const interval = parseInt(document.getElementById('updateInterval').value);
    if (isNaN(interval) || interval < 10 || interval > 300) {
        alert('Update interval must be between 10 and 300 seconds');
        return;
    }
    content.settings = {
        updateInterval: interval
    };
    saveSiteContent(content);
    alert('Settings saved successfully!');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (isAuthenticated()) {
        initSidebar();
        loadContentIntoForms();
    }
});

