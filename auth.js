function getMe() {
    const c = JSON.parse(localStorage.getItem('currentUser'));
    if (!c) return null;
    const fresh = getUsers().find(u => u.id === c.id);
    return fresh || null;
}

// ===== РЕГИСТРАЦИЯ =====
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const msg = document.getElementById('regMessage');
    const email = document.getElementById('regEmail').value.trim().toLowerCase();
    const password = document.getElementById('regPassword').value;
    if (!email || !password) return showMessage(msg, 'заполните все поля', 'error');
    if (password.length < 6) return showMessage(msg, 'пароль минимум 6 символов', 'error');
    const users = getUsers();
    if (users.some(u => u.email === email)) return showMessage(msg, 'email уже занят', 'error');
    pendingUser = { email, password };
    this.reset();
    showProfileSetup();
});

function previewAvatar(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        document.getElementById('avatarPreview').src = e.target.result;
        document.getElementById('avatarPreview').classList.remove('hidden');
        document.getElementById('avatarPlaceholder').classList.add('hidden');
    };
    reader.readAsDataURL(file);
}

document.getElementById('profileForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const msg = document.getElementById('profileMessage');
    const nick = document.getElementById('profileNick').value.trim();
    const tag = document.getElementById('profileTag').value.trim().toLowerCase();
    const avatarImg = document.getElementById('avatarPreview');
    if (!nick || !tag) return showMessage(msg, 'заполните все поля', 'error');
    if (nick.length < 2) return showMessage(msg, 'ник слишком короткий', 'error');
    if (!/^[a-z0-9_]+$/.test(tag)) return showMessage(msg, 'тег: только a-z, 0-9 и _', 'error');
    const users = getUsers();
    if (users.some(u => u.tag === tag)) return showMessage(msg, `тег @${tag} уже занят`, 'error');
    const avatar = avatarImg.classList.contains('hidden') ? '' : avatarImg.src;
    const newUser = {
        id: Date.now(), nick, tag,
        email: pendingUser.email, password: pendingUser.password,
        avatar, cover: '', followers: [], following: [],
        createdAt: new Date().toISOString()
    };
    users.push(newUser);
    saveUsers(users);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    pendingUser = null;
    renderProfile();
    showScreen('profileScreen');
});

// ===== ВХОД =====
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const msg = document.getElementById('loginMessage');
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;
    const user = getUsers().find(u => u.email === email && u.password === password);
    if (!user) return showMessage(msg, 'неверный email или пароль', 'error');
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.reset();
    renderProfile();
    showScreen('profileScreen');
});

// ===== ВЫХОД =====
function logout() {
    localStorage.removeItem('currentUser');
    showLogin();
}

// ===== ЭКРАНЫ АВТОРИЗАЦИИ =====
function showRegister() { showScreen('registerBox'); }
function showLogin()    { showScreen('loginBox'); }

function showProfileSetup() {
    document.getElementById('avatarPreview').classList.add('hidden');
    document.getElementById('avatarPlaceholder').classList.remove('hidden');
    document.getElementById('profileForm').reset();
    showScreen('profileSetupBox');
}