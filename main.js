// ===== ЭКРАНЫ =====
const appScreens = ['profileScreen', 'feedScreen', 'peopleScreen', 'messagesScreen', 'chatScreen', 'cameraScreen', 'postViewBox'];
const authScreens = ['registerBox', 'profileSetupBox', 'loginBox', 'editProfileBox', 'createPostBox'];

function showScreen(id) {
    [...appScreens, ...authScreens].forEach(box => {
        const el = document.getElementById(box);
        if (el) el.classList.toggle('hidden', box !== id);
    });
    const nav = document.getElementById('bottomNav');
    const hideNav = ['chatScreen', 'postViewBox'].includes(id);
    if (appScreens.includes(id) && !hideNav) {
        nav.style.display = 'flex';
        const map = { profileScreen:'profile', feedScreen:'feed', peopleScreen:'people',
                      messagesScreen:'messages', cameraScreen:'camera' };
        const current = map[id];
        ['feed','people','camera','messages','profile'].forEach(t => {
            const n = document.getElementById('nav' + t.charAt(0).toUpperCase() + t.slice(1));
            if (n) n.classList.toggle('active', t === current);
        });
    } else {
        nav.style.display = 'none';
    }
    const dd = document.getElementById('profileDropdown');
    if (dd) dd.classList.add('hidden');
}

// ===== ТЕМА =====
function toggleTheme() {
    document.body.classList.toggle('light');
    const isLight = document.body.classList.contains('light');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    const sw = document.getElementById('themeSwitch');
    if (sw) sw.classList.toggle('on', isLight);
}

// ===== МЕНЮ =====
function switchTab(tab) {
    if (tab === 'profile') { renderProfile(); showScreen('profileScreen'); }
    else if (tab === 'feed') { renderFeed(); showScreen('feedScreen'); }
    else if (tab === 'people') { renderPeople(); showScreen('peopleScreen'); }
    else if (tab === 'messages') { renderChatList(); showScreen('messagesScreen'); }
    else if (tab === 'camera') { showScreen('cameraScreen'); }
}

// ===== СТАРТ =====
window.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light');
    }
    const me = getMe();
    if (me) { renderProfile(); showScreen('profileScreen'); }
    else showRegister();
});