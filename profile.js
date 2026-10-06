function renderProfile() {
    const me = getMe();
    if (!me) return showLogin();

    document.getElementById('appNick').textContent = me.nick || 'без ника';
    document.getElementById('appTag').textContent = '@' + (me.tag || 'tag');

    const av = document.getElementById('appAvatar');
    if (me.avatar) av.innerHTML = `<img src="${me.avatar}" alt="">`;
    else av.innerHTML = (me.nick || '?').charAt(0).toUpperCase();

    const cov = document.getElementById('appCover');
    if (me.cover) cov.style.backgroundImage = `url(${me.cover})`;
    else cov.style.backgroundImage = 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)';

    const posts = getPosts().filter(p => p.userId === me.id);
    document.getElementById('statPosts').textContent = posts.length;
    document.getElementById('statFollowers').textContent = (me.followers || []).length;
    document.getElementById('statFollowing').textContent = (me.following || []).length;

    renderPostsGrid(me.id);
}

function renderPostsGrid(userId) {
    const grid = document.getElementById('postsGrid');
    const posts = getPosts().filter(p => p.userId === userId);
    const me = getMe();

    if (posts.length === 0) {
        grid.innerHTML = '<div class="feed-empty">здесь будут ваши публикации</div>';
        return;
    }

    grid.innerHTML = posts.map(p => {
        const media = p.mediaType === 'video'
            ? `<video src="${p.media}" muted></video>`
            : `<img src="${p.media}" alt="">`;
        const liked = me && p.likes.includes(me.id);
        const views = (p.viewedBy || []).length;
        const heartIcon = liked ? '❤' : '♡';
        return `<div class="post-item" onclick="openPostView(${p.id}, 'profile')">
            ${media}
            <div class="post-stats">
                <div class="post-stat ${liked ? 'liked' : ''}">${heartIcon} ${p.likes.length}</div>
                <div class="post-stat">👁 ${views}</div>
            </div>
        </div>`;
    }).join('');
}

// ===== РЕДАКТИРОВАНИЕ =====
function showEditProfile() {
    const me = getMe();
    if (!me) return showLogin();
    document.getElementById('editNick').value = me.nick || '';
    document.getElementById('editTag').value = me.tag || '';
    const av = document.getElementById('editAvatarPreview');
    const avPh = document.getElementById('editAvatarPlaceholder');
    if (me.avatar) {
        av.src = me.avatar; av.classList.remove('hidden');
        avPh.classList.add('hidden');
    } else {
        av.classList.add('hidden'); av.src = '';
        avPh.classList.remove('hidden');
    }
    const cov = document.getElementById('editCoverPreview');
    if (me.cover) {
        cov.style.backgroundImage = `url(${me.cover})`; cov.textContent = '';
    } else {
        cov.style.backgroundImage = ''; cov.textContent = 'нажмите, чтобы выбрать фон';
    }
    const sw = document.getElementById('themeSwitch');
    if (sw) sw.classList.toggle('on', document.body.classList.contains('light'));
    showScreen('editProfileBox');
}

function previewEditAvatar(event) {
    const file = event.target.files[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = e => {
        document.getElementById('editAvatarPreview').src = e.target.result;
        document.getElementById('editAvatarPreview').classList.remove('hidden');
        document.getElementById('editAvatarPlaceholder').classList.add('hidden');
    };
    r.readAsDataURL(file);
}

function previewEditCover(event) {
    const file = event.target.files[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = e => {
        const cov = document.getElementById('editCoverPreview');
        cov.style.backgroundImage = `url(${e.target.result})`;
        cov.textContent = '';
    };
    r.readAsDataURL(file);
}

document.getElementById('editProfileForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const msg = document.getElementById('editMessage');
    const me = getMe();
    if (!me) return showLogin();
    const newNick = document.getElementById('editNick').value.trim();
    const newTag = document.getElementById('editTag').value.trim().toLowerCase();
    if (!newNick || !newTag) return showMessage(msg, 'заполните все поля', 'error');
    if (newNick.length < 2) return showMessage(msg, 'ник слишком короткий', 'error');
    if (!/^[a-z0-9_]+$/.test(newTag)) return showMessage(msg, 'тег: только a-z, 0-9 и _', 'error');
    const users = getUsers();
    const meRec = users.find(u => u.id === me.id);
    if (users.some(u => u.tag === newTag && u.id !== me.id)) return showMessage(msg, `тег @${newTag} уже занят`, 'error');
    const avEl = document.getElementById('editAvatarPreview');
    const newAvatar = avEl.classList.contains('hidden') ? meRec.avatar : avEl.src;
    const covEl = document.getElementById('editCoverPreview');
    const cs = covEl.style.backgroundImage;
    let newCover = meRec.cover;
    if (cs && cs.startsWith('url(')) newCover = cs.slice(5, -2).replace(/["']/g, '');
    meRec.nick = newNick;
    meRec.tag = newTag;
    meRec.avatar = newAvatar;
    meRec.cover = newCover;
    saveUsers(users);
    localStorage.setItem('currentUser', JSON.stringify(meRec));
    renderProfile();
    showScreen('profileScreen');
});

// ===== ДРОПДАУН =====
function toggleDropdown(event) {
    event.stopPropagation();
    document.getElementById('profileDropdown').classList.toggle('hidden');
}
document.addEventListener('click', function() {
    const dd = document.getElementById('profileDropdown');
    if (dd) dd.classList.add('hidden');
});