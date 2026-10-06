function renderFeed() {
    const list = document.getElementById('feedList');
    const me = getMe();
    if (!me) return;

    const allPosts = getPosts().sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (allPosts.length === 0) {
        list.innerHTML = '<div class="feed-empty" style="margin:20px;">пока нет публикаций</div>';
        return;
    }

    list.innerHTML = allPosts.map(p => {
        const author = getUsers().find(u => u.id === p.userId);
        if (!author) return '';

        const liked = p.likes.includes(me.id);
        const views = (p.viewedBy || []).length;
        const av = author.avatar
            ? `<img src="${author.avatar}" alt="">`
            : author.nick.charAt(0).toUpperCase();

        const media = p.mediaType === 'video'
            ? `<video src="${p.media}" controls></video>`
            : `<img src="${p.media}" alt="">`;

        const commentsHtml = p.comments.length > 0
            ? `<div class="feed-comments-list">
                ${p.comments.slice(-3).map(c => {
                    const cav = c.avatar ? `<img src="${c.avatar}" alt="">` : (c.nick || '?').charAt(0).toUpperCase();
                    const cphoto = c.photo ? `<img src="${c.photo}" class="feed-comment-image" alt="">` : '';
                    return `<div class="feed-comment">
                        <div class="feed-comment-avatar">${cav}</div>
                        <div class="feed-comment-body">
                            <div class="feed-comment-nick">@${c.tag}<span class="feed-comment-time">${timeAgo(c.createdAt)}</span></div>
                            ${c.text ? `<div class="feed-comment-text">${escapeHtml(c.text)}</div>` : ''}
                            ${cphoto}
                        </div>
                    </div>`;
                }).join('')}
              </div>`
            : '';

        return `
            <div class="feed-card">
                <div class="feed-card-header" onclick="openPostView(${p.id}, 'feed')">
                    <div class="feed-card-avatar">${av}</div>
                    <div class="feed-card-author">
                        <div class="feed-card-nick">@${author.tag}</div>
                        <div class="feed-card-time">${timeAgo(p.createdAt)}</div>
                    </div>
                </div>
                <div class="feed-card-media" onclick="openPostView(${p.id}, 'feed')">${media}</div>
                ${p.caption ? `<div class="feed-card-caption">${escapeHtml(p.caption)}</div>` : ''}
                <div class="feed-card-actions">
                    <button class="feed-action-btn ${liked ? 'liked' : ''}" onclick="likePostFromFeed(${p.id})">
                        ${liked ? '❤' : '♡'} <span class="count">${p.likes.length}</span>
                    </button>
                    <button class="feed-action-btn" onclick="openPostView(${p.id}, 'feed')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                        <span class="count">${p.comments.length}</span>
                    </button>
                    <div class="feed-views" onclick="openPostView(${p.id}, 'feed')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        <span>${views}</span>
                    </div>
                </div>
                <div class="feed-comments">
                    ${commentsHtml}
                    <div class="feed-comment-form">
                        <button type="button" class="feed-add-btn" onclick="document.getElementById('feedCommentPhoto_${p.id}').click()" title="прикрепить фото">+</button>
                        <input type="text" id="feedCommentInput_${p.id}" placeholder="написать комментарий..." onkeydown="if(event.key==='Enter')addCommentFromFeed(${p.id})">
                        <input type="file" id="feedCommentPhoto_${p.id}" accept="image/*" class="hidden" onchange="previewFeedCommentPhoto(event, ${p.id})">
                        <button type="button" class="send-btn" onclick="addCommentFromFeed(${p.id})">→</button>
                    </div>
                    <div id="feedCommentPreview_${p.id}" class="feed-comment-preview hidden"></div>
                </div>
            </div>`;
    }).join('');
}

function likePostFromFeed(id) {
    const me = getMe();
    if (!me) return;
    const posts = getPosts();
    const post = posts.find(p => p.id === id);
    if (!post) return;
    const idx = post.likes.indexOf(me.id);
    if (idx === -1) post.likes.push(me.id);
    else post.likes.splice(idx, 1);
    savePosts(posts);
    renderFeed();
}

// ===== ФОТО В КОММЕНТАРИЯХ (ЛЕНТА) =====
function previewFeedCommentPhoto(event, postId) {
    const file = event.target.files[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = e => {
        pendingFeedCommentPhotos[postId] = e.target.result;
        const preview = document.getElementById('feedCommentPreview_' + postId);
        preview.innerHTML = `<img src="${e.target.result}" alt=""><button class="remove-photo" onclick="removeFeedCommentPhoto(${postId})">×</button>`;
        preview.classList.remove('hidden');
    };
    r.readAsDataURL(file);
}

function removeFeedCommentPhoto(postId) {
    delete pendingFeedCommentPhotos[postId];
    const inp = document.getElementById('feedCommentPhoto_' + postId);
    if (inp) inp.value = '';
    const preview = document.getElementById('feedCommentPreview_' + postId);
    if (preview) {
        preview.classList.add('hidden');
        preview.innerHTML = '';
    }
}

function addCommentFromFeed(postId) {
    const input = document.getElementById('feedCommentInput_' + postId);
    const text = input.value.trim();
    const photo = pendingFeedCommentPhotos[postId] || null;
    if (!text && !photo) return;
    const me = getMe();
    if (!me) return;
    const posts = getPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    post.comments.push({
        userId: me.id, nick: me.nick, tag: me.tag, avatar: me.avatar,
        text: text, photo: photo,
        createdAt: new Date().toISOString(), likes: []
    });
    savePosts(posts);
    delete pendingFeedCommentPhotos[postId];
    renderFeed();
}

// ===== ПРОСМОТР ПОСТА =====
function openPostView(id, from) {
    currentPostId = id;
    if (from) postOpenedFrom = from;

    const posts = getPosts();
    const post = posts.find(p => p.id === id);
    if (!post) return;

    const me = getMe();

    if (!post.viewedBy) post.viewedBy = [];
    if (me && !post.viewedBy.includes(me.id)) {
        post.viewedBy.push(me.id);
        savePosts(posts);
    }

    const author = getUsers().find(u => u.id === post.userId);

    const av = document.getElementById('pvAvatar');
    if (author && author.avatar) av.innerHTML = `<img src="${author.avatar}" alt="">`;
    else av.textContent = (author?.nick || '?').charAt(0).toUpperCase();

    document.getElementById('pvNick').textContent = '@' + (author?.tag || 'user');
    document.getElementById('pvTime').textContent = timeAgo(post.createdAt);

    const media = document.getElementById('pvMedia');
    media.innerHTML = post.mediaType === 'video'
        ? `<video src="${post.media}" controls></video>`
        : `<img src="${post.media}" alt="">`;

    document.getElementById('pvCaption').textContent = post.caption || '';

    const liked = me && post.likes.includes(me.id);
    const likeBtn = document.getElementById('pvLikeBtn');
    likeBtn.textContent = liked ? '❤' : '♡';
    likeBtn.classList.toggle('liked', liked);

    document.getElementById('pvLikes').textContent = post.likes.length;
    document.getElementById('pvViews').textContent = post.viewedBy.length;
    document.getElementById('pvComments').textContent = post.comments.length;

    renderComments(post);
    showScreen('postViewBox');
}

function renderComments(post) {
    const list = document.getElementById('commentsList');
    const me = getMe();
    if (post.comments.length === 0) {
        list.innerHTML = '<div style="color:var(--text-muted);font-size:14px;">пока нет комментариев</div>';
        return;
    }
    list.innerHTML = post.comments.map((c, idx) => {
        const av = c.avatar ? `<img src="${c.avatar}" alt="">` : (c.nick || '?').charAt(0).toUpperCase();
        const isMine = me && c.userId === me.id;
        const liked = c.likes && me && c.likes.includes(me.id);
        const likesCount = c.likes ? c.likes.length : 0;
        const photo = c.photo ? `<img src="${c.photo}" class="comment-image" alt="" onclick="viewImage('${c.photo}')">` : '';
        return `
            <div class="comment">
                <div class="comment-avatar">${av}</div>
                <div class="comment-body">
                    <div class="comment-nick">@${c.tag} <span style="color:var(--text-muted);font-weight:400;font-size:11px;">${timeAgo(c.createdAt)}</span></div>
                    ${c.text ? `<div class="comment-text">${escapeHtml(c.text)}</div>` : ''}
                    ${photo}
                    <div class="comment-actions">
                        <button class="comment-like-btn ${liked ? 'liked' : ''}" onclick="likeComment(${idx})">
                            ${liked ? '❤' : '♡'} ${likesCount > 0 ? likesCount : ''}
                        </button>
                        ${isMine ? `<button class="comment-delete-btn" onclick="deleteComment(${idx})">удалить</button>` : ''}
                    </div>
                </div>
            </div>`;
    }).join('');
}

function toggleLike() {
    const me = getMe();
    if (!me) return;
    const posts = getPosts();
    const post = posts.find(p => p.id === currentPostId);
    if (!post) return;
    const idx = post.likes.indexOf(me.id);
    if (idx === -1) post.likes.push(me.id);
    else post.likes.splice(idx, 1);
    savePosts(posts);
    openPostView(currentPostId);
}

function previewCommentPhoto(event) {
    const file = event.target.files[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = e => {
        pendingCommentPhoto = e.target.result;
        const preview = document.getElementById('commentPhotoPreview');
        preview.innerHTML = `<img src="${e.target.result}" alt=""><button class="remove-photo" onclick="removeCommentPhoto()">×</button>`;
        preview.classList.remove('hidden');
    };
    r.readAsDataURL(file);
}

function removeCommentPhoto() {
    pendingCommentPhoto = null;
    const inp = document.getElementById('commentPhotoInput');
    if (inp) inp.value = '';
    const preview = document.getElementById('commentPhotoPreview');
    if (preview) {
        preview.classList.add('hidden');
        preview.innerHTML = '';
    }
}

function addComment() {
    const input = document.getElementById('commentInput');
    const text = input.value.trim();
    if (!text && !pendingCommentPhoto) return;
    const me = getMe();
    if (!me) return;
    const posts = getPosts();
    const post = posts.find(p => p.id === currentPostId);
    if (!post) return;
    post.comments.push({
        userId: me.id, nick: me.nick, tag: me.tag, avatar: me.avatar,
        text: text, photo: pendingCommentPhoto,
        createdAt: new Date().toISOString(), likes: []
    });
    savePosts(posts);
    input.value = '';
    removeCommentPhoto();
    openPostView(currentPostId);
}

function likeComment(idx) {
    const me = getMe();
    if (!me) return;
    const posts = getPosts();
    const post = posts.find(p => p.id === currentPostId);
    if (!post) return;
    const c = post.comments[idx];
    if (!c) return;
    if (!c.likes) c.likes = [];
    const i = c.likes.indexOf(me.id);
    if (i === -1) c.likes.push(me.id);
    else c.likes.splice(i, 1);
    savePosts(posts);
    openPostView(currentPostId);
}

function deleteComment(idx) {
    if (!confirm('удалить комментарий?')) return;
    const posts = getPosts();
    const post = posts.find(p => p.id === currentPostId);
    if (!post) return;
    const me = getMe();
    const c = post.comments[idx];
    if (!c || c.userId !== me.id) return;
    post.comments.splice(idx, 1);
    savePosts(posts);
    openPostView(currentPostId);
}

function viewImage(src) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.95);display:flex;align-items:center;justify-content:center;z-index:9999;cursor:pointer;padding:20px;';
    overlay.innerHTML = `<img src="${src}" style="max-width:100%;max-height:100%;object-fit:contain;">`;
    overlay.onclick = () => overlay.remove();
    document.body.appendChild(overlay);
}

function closePostView() {
    if (postOpenedFrom === 'feed') {
        renderFeed();
        showScreen('feedScreen');
    } else {
        renderProfile();
        showScreen('profileScreen');
    }
}

// ===== СОЗДАНИЕ ПОСТА =====
function showCreatePost() {
    document.getElementById('postPreview').innerHTML = '<div id="postPlaceholder">нажмите, чтобы<br>выбрать фото или видео</div>';
    document.getElementById('postFileInput').value = '';
    document.getElementById('postCaption').value = '';
    pendingMedia = null;
    pendingMediaType = null;
    showScreen('createPostBox');
}

function previewPost(event) {
    const file = event.target.files[0];
    if (!file) return;
    const isVideo = file.type.startsWith('video/');
    pendingMediaType = isVideo ? 'video' : 'image';
    const r = new FileReader();
    r.onload = e => {
        pendingMedia = e.target.result;
        const preview = document.getElementById('postPreview');
        preview.innerHTML = isVideo
            ? `<video src="${e.target.result}" controls></video>`
            : `<img src="${e.target.result}" alt="">`;
    };
    r.readAsDataURL(file);
}

document.getElementById('createPostForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const msg = document.getElementById('postMessage');
    if (!pendingMedia) return showMessage(msg, 'добавьте фото или видео', 'error');
    const caption = document.getElementById('postCaption').value.trim();
    const me = getMe();
    if (!me) return showLogin();
    const posts = getPosts();
    posts.unshift({
        id: Date.now(), userId: me.id,
        media: pendingMedia, mediaType: pendingMediaType,
        caption, createdAt: new Date().toISOString(),
        likes: [], viewedBy: [], comments: []
    });
    savePosts(posts);
    pendingMedia = null;
    pendingMediaType = null;
    renderProfile();
    showScreen('profileScreen');
});