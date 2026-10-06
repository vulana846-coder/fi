function getUsers() { return JSON.parse(localStorage.getItem('fishingUsers')) || []; }
function saveUsers(u) { localStorage.setItem('fishingUsers', JSON.stringify(u)); }
function getPosts() { return JSON.parse(localStorage.getItem('fishingPosts')) || []; }
function savePosts(p) { localStorage.setItem('fishingPosts', JSON.stringify(p)); }
function getChats() { return JSON.parse(localStorage.getItem('fishingChats')) || []; }
function saveChats(c) { localStorage.setItem('fishingChats', JSON.stringify(c)); }

// показать сообщение об ошибке/успехе
function showMessage(el, text, type) {
    el.textContent = text;
    el.className = 'message ' + type;
}

// переменные для работы
let pendingUser = null;
let pendingCommentPhoto = null;
let pendingFeedCommentPhotos = {};
let currentPostId = null;
let postOpenedFrom = 'profile';
let pendingMedia = null;
let pendingMediaType = null;

// ===== ВСПОМОГАТЕЛЬНЫЕ =====
function timeAgo(iso) {
    const d = (Date.now() - new Date(iso).getTime()) / 1000;
    if (d < 60) return 'только что';
    if (d < 3600) return Math.floor(d/60) + ' мин назад';
    if (d < 86400) return Math.floor(d/3600) + ' ч назад';
    if (d < 604800) return Math.floor(d/86400) + ' дн назад';
    return new Date(iso).toLocaleDateString('ru-RU');
}

function timeShort(iso) {
    return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(t) {
    const d = document.createElement('div');
    d.textContent = t;
    return d.innerHTML;
}