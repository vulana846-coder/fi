function renderPeople() {
    const list = document.getElementById('peopleList');
    const me = getMe();
    if (!me) return;

    const query = (document.getElementById('peopleSearch').value || '').toLowerCase().trim();
    const users = getUsers().filter(u => u.id !== me.id);

    const filtered = users.filter(u => {
        if (!query) return true;
        return (u.nick || '').toLowerCase().includes(query) || (u.tag || '').toLowerCase().includes(query);
    });

    if (filtered.length === 0) {
        list.innerHTML = '<div class="feed-empty" style="margin:20px;">никого не найдено</div>';
        return;
    }

    list.innerHTML = filtered.map(u => {
        const av = u.avatar ? `<img src="${u.avatar}" alt="">` : (u.nick || '?').charAt(0).toUpperCase();
        const isFollowing = (me.following || []).includes(u.id);
        return `
            <div class="person-item">
                <div class="person-avatar">${av}</div>
                <div class="person-info">
                    <div class="person-nick">${escapeHtml(u.nick || 'без ника')}</div>
                    <div class="person-tag">@${u.tag}</div>
                </div>
                <button class="person-btn ${isFollowing ? 'following' : ''}" onclick="toggleFollow(${u.id})">
                    ${isFollowing ? 'отписаться' : 'подписаться'}
                </button>
                <button class="person-btn msg" onclick="openChatWith(${u.id})">написать</button>
            </div>`;
    }).join('');
}

function toggleFollow(userId) {
    const me = getMe();
    if (!me) return;
    const users = getUsers();
    const meRec = users.find(u => u.id === me.id);
    const otherRec = users.find(u => u.id === userId);
    if (!meRec || !otherRec) return;

    meRec.following = meRec.following || [];
    otherRec.followers = otherRec.followers || [];

    const idx = meRec.following.indexOf(userId);
    if (idx === -1) {
        meRec.following.push(userId);
        otherRec.followers.push(me.id);
    } else {
        meRec.following.splice(idx, 1);
        const j = otherRec.followers.indexOf(me.id);
        if (j !== -1) otherRec.followers.splice(j, 1);
    }

    saveUsers(users);
    localStorage.setItem('currentUser', JSON.stringify(meRec));
    renderPeople();
}

// ===== СООБЩЕНИЯ =====
function openChatWith(userId) {
    const me = getMe();
    if (!me) return;
    const chats = getChats();
    let chat = chats.find(c => c.users.includes(me.id) && c.users.includes(userId));
    if (!chat) {
        chat = { id: Date.now(), users: [me.id, userId], messages: [], createdAt: new Date().toISOString() };
        chats.push(chat);
        saveChats(chats);
    }
    openChat(chat.id);
}

function openChat(chatId) {
    const chat = getChats().find(c => c.id === chatId);
    if (!chat) return;
    const me = getMe();
    const otherId = chat.users.find(id => id !== me.id);
    const other = getUsers().find(u => u.id === otherId);
    if (!other) return;

    window.currentChatId = chatId;

    const av = document.getElementById('chatAvatar');
    if (other.avatar) av.innerHTML = `<img src="${other.avatar}" alt="">`;
    else av.textContent = (other.nick || '?').charAt(0).toUpperCase();

    document.getElementById('chatNick').textContent = other.nick || 'без ника';
    document.getElementById('chatTag').textContent = '@' + other.tag;

    renderChatMessages(chat);
    showScreen('chatScreen');
}

function renderChatMessages(chat) {
    const box = document.getElementById('chatMessages');
    const me = getMe();
    if (chat.messages.length === 0) {
        box.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:30px 20px;font-size:14px;">начните переписку</div>';
        return;
    }
    box.innerHTML = chat.messages.map(m => {
        const cls = m.from === me.id ? 'me' : 'them';
        return `<div class="msg ${cls}">${escapeHtml(m.text)}<div class="msg-time">${timeShort(m.createdAt)}</div></div>`;
    }).join('');
    box.scrollTop = box.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;
    const me = getMe();
    const chats = getChats();
    const chat = chats.find(c => c.id === window.currentChatId);
    if (!chat) return;
    chat.messages.push({ from: me.id, text: text, createdAt: new Date().toISOString() });
    saveChats(chats);
    input.value = '';
    renderChatMessages(chat);
}

function renderChatList() {
    const list = document.getElementById('chatList');
    const me = getMe();
    if (!me) return;
    const chats = getChats().filter(c => c.users.includes(me.id));
    if (chats.length === 0) {
        list.innerHTML = '<div class="feed-empty" style="margin:20px;">пока нет переписок</div>';
        return;
    }
    list.innerHTML = chats.map(c => {
        const otherId = c.users.find(id => id !== me.id);
        const other = getUsers().find(u => u.id === otherId);
        if (!other) return '';
        const last = c.messages[c.messages.length - 1];
        const lastText = last ? last.text : 'нет сообщений';
        const lastTime = last ? timeShort(last.createdAt) : '';
        const av = other.avatar ? `<img src="${other.avatar}" alt="">` : (other.nick || '?').charAt(0).toUpperCase();
        return `
            <div class="chat-list-item" onclick="openChat(${c.id})">
                <div class="chat-list-avatar">${av}</div>
                <div class="chat-list-info">
                    <div class="chat-list-nick">${escapeHtml(other.nick || 'без ника')}</div>
                    <div class="chat-list-last">${escapeHtml(lastText)}</div>
                </div>
                <div class="chat-list-meta"><div class="chat-list-time">${lastTime}</div></div>
            </div>`;
    }).join('');
}

function goBackFromChat() {
    showScreen('messagesScreen');
    renderChatList();
}