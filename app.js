/* ══════════════════════════════════════════════
   NEBULA — Red Social | app.js
   Motor principal de la aplicación
   ══════════════════════════════════════════════ */

// ── STATE GLOBAL ──
let currentUser = null;
let activePostId = null;
let activeChatUserId = null;
let reactionTargetPostId = null;
let msgReactionTargetId = null;
let replyingToMsg = null;
let contextMenuMsgId = null;

// ── BASE DE DATOS EN MEMORIA ──
const DB = {
  users: [
    {
      id: 'user_nova',
      username: '@nova',
      name: 'Nova Stellaris',
      email: 'nova@nebula.io',
      password: '1234',
      bio: 'Exploradora de galaxias digitales. Colecciono momentos como supernovas 🌟',
      location: 'Andromeda Station',
      color: '#7c5cfc',
      following: ['user_orion', 'user_lyra', 'user_cosmo'],
      followers: ['user_orion', 'user_lyra'],
      joinDate: '2024-01-15'
    },
    {
      id: 'user_orion',
      username: '@orion',
      name: 'Orion Vega',
      email: 'orion@nebula.io',
      password: '1234',
      bio: 'Programador intergaláctico. Escribo código que viaja a la velocidad de la luz.',
      location: 'Constelación del Norte',
      color: '#4ade80',
      following: ['user_nova', 'user_cosmo'],
      followers: ['user_nova', 'user_lyra', 'user_cosmo'],
      joinDate: '2024-02-20'
    },
    {
      id: 'user_lyra',
      username: '@lyra',
      name: 'Lyra Cosmos',
      email: 'lyra@nebula.io',
      password: '1234',
      bio: 'Artista visual. Pinto con luz y código ✨',
      location: 'Nebulosa Aquila',
      color: '#f59e0b',
      following: ['user_nova', 'user_orion'],
      followers: ['user_nova', 'user_orion', 'user_cosmo'],
      joinDate: '2024-03-10'
    },
    {
      id: 'user_cosmo',
      username: '@cosmo',
      name: 'Cosmo Drake',
      email: 'cosmo@nebula.io',
      password: '1234',
      bio: 'Filósofo del espacio digital. El universo tiene WiFi.',
      location: 'Saturno Ring City',
      color: '#f43f5e',
      following: ['user_nova', 'user_lyra'],
      followers: ['user_nova', 'user_orion'],
      joinDate: '2024-04-05'
    }
  ],

  posts: [
    {
      id: 'post_001',
      authorId: 'user_orion',
      text: 'Acabo de lanzar mi nuevo proyecto de simulación de órbitas planetarias. ¿Alguien quiere colaborar? 🚀 El universo está lleno de posibilidades cuando el código es tu telescopio.',
      media: null,
      mediaType: null,
      reactions: { supernova: ['user_nova', 'user_lyra'], quantum: ['user_cosmo'], warp: [], eclipse: [], pulsar: ['user_nova'] },
      comments: ['comment_001', 'comment_002'],
      shares: ['user_nova'],
      timestamp: Date.now() - 3600000 * 2,
      sharedBy: null
    },
    {
      id: 'post_002',
      authorId: 'user_lyra',
      text: 'Nueva pieza generativa terminada. Llevé 72 horas renderizando esta galaxia virtual. A veces el arte necesita tiempo de gestación igual que las estrellas reales 🌌',
      media: null,
      mediaType: null,
      reactions: { supernova: ['user_nova', 'user_orion', 'user_cosmo'], quantum: ['user_nova'], warp: ['user_orion'], eclipse: [], pulsar: [] },
      comments: ['comment_003'],
      shares: [],
      timestamp: Date.now() - 3600000 * 5,
      sharedBy: null
    },
    {
      id: 'post_003',
      authorId: 'user_cosmo',
      text: '¿Será que en un universo paralelo todos usamos la misma red social? Me pregunto si la conectividad es una constante universal o simplemente una ilusión muy bien programada.',
      media: null,
      mediaType: null,
      reactions: { supernova: [], quantum: ['user_nova', 'user_lyra'], warp: ['user_orion'], eclipse: ['user_nova'], pulsar: ['user_lyra'] },
      comments: [],
      shares: ['user_lyra'],
      timestamp: Date.now() - 3600000 * 8,
      sharedBy: null
    },
    {
      id: 'post_003_shared',
      authorId: 'user_cosmo',
      text: '¿Será que en un universo paralelo todos usamos la misma red social? Me pregunto si la conectividad es una constante universal o simplemente una ilusión muy bien programada.',
      media: null,
      mediaType: null,
      reactions: { supernova: [], quantum: [], warp: [], eclipse: [], pulsar: [] },
      comments: [],
      shares: [],
      timestamp: Date.now() - 3600000 * 7,
      sharedBy: 'user_lyra',
      originalPostId: 'post_003'
    }
  ],

  comments: [
    {
      id: 'comment_001',
      postId: 'post_001',
      authorId: 'user_nova',
      text: '¡Esto es increíble! Me uno sin dudarlo 🌟',
      timestamp: Date.now() - 3600000,
      replies: ['comment_001_r1']
    },
    {
      id: 'comment_001_r1',
      postId: 'post_001',
      authorId: 'user_orion',
      text: 'Genial @nova, te mando los specs por mensajes.',
      timestamp: Date.now() - 3500000,
      parentId: 'comment_001',
      replies: []
    },
    {
      id: 'comment_002',
      postId: 'post_001',
      authorId: 'user_lyra',
      text: 'El código como telescopio... adoro esa metáfora ⚛️',
      timestamp: Date.now() - 3000000,
      replies: []
    },
    {
      id: 'comment_003',
      postId: 'post_002',
      authorId: 'user_cosmo',
      text: '72 horas bien invertidas. Esto merece una supernova entera 💫',
      timestamp: Date.now() - 3600000 * 4,
      replies: []
    }
  ],

  messages: {
    'user_nova__user_orion': [
      { id: 'msg_001', senderId: 'user_orion', text: '¡Hola Nova! Vi tu perfil y me parece muy interesante tu trabajo.', timestamp: Date.now() - 86400000, status: 'read', reaction: null, replyTo: null, deleted: false },
      { id: 'msg_002', senderId: 'user_nova', text: 'Gracias Orion! Tu proyecto de órbitas se ve brutal 🚀', timestamp: Date.now() - 82800000, status: 'read', reaction: 'supernova', replyTo: null, deleted: false },
      { id: 'msg_003', senderId: 'user_orion', text: 'Justo iba a preguntarte si te apetece colaborar en algo', timestamp: Date.now() - 79200000, status: 'read', reaction: null, replyTo: 'msg_002', deleted: false },
      { id: 'msg_004', senderId: 'user_nova', text: '¡Claro que sí! ¿Cuándo empezamos?', timestamp: Date.now() - 75600000, status: 'read', reaction: 'quantum', replyTo: null, deleted: false }
    ],
    'user_nova__user_lyra': [
      { id: 'msg_010', senderId: 'user_lyra', text: 'Nova, ¿puedes ver mi última creación? Quiero tu opinión honesta.', timestamp: Date.now() - 7200000, status: 'read', reaction: null, replyTo: null, deleted: false },
      { id: 'msg_011', senderId: 'user_nova', text: '¡Es preciosa! Ese rojo nebuloso en el centro... ⚛️', timestamp: Date.now() - 3600000, status: 'delivered', reaction: null, replyTo: 'msg_010', deleted: false }
    ],
    'user_nova__user_cosmo': [
      { id: 'msg_020', senderId: 'user_cosmo', text: '¿Tú también crees que el universo está simulado?', timestamp: Date.now() - 3600000 * 12, status: 'read', reaction: 'pulsar', replyTo: null, deleted: false },
      { id: 'msg_021', senderId: 'user_nova', text: 'Solo sé que Nebula es muy real para mí jaja 😄', timestamp: Date.now() - 3600000 * 11, status: 'read', reaction: null, replyTo: null, deleted: false }
    ]
  },

  notifications: [
    { id: 'notif_001', type: 'reaction', fromId: 'user_orion', postId: 'post_002', reaction: 'supernova', timestamp: Date.now() - 1800000, read: false },
    { id: 'notif_002', type: 'comment', fromId: 'user_lyra', postId: 'post_001', timestamp: Date.now() - 3600000, read: false },
    { id: 'notif_003', type: 'follow', fromId: 'user_cosmo', timestamp: Date.now() - 7200000, read: false },
    { id: 'notif_004', type: 'share', fromId: 'user_lyra', postId: 'post_003', timestamp: Date.now() - 86400000, read: true },
    { id: 'notif_005', type: 'mention', fromId: 'user_orion', postId: 'post_001', timestamp: Date.now() - 172800000, read: true }
  ]
};

/* ══════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════ */
const $ = id => document.getElementById(id);
const getUserById = id => DB.users.find(u => u.id === id);
const getPostById = id => DB.posts.find(p => p.id === id);
const getCommentById = id => DB.comments.find(c => c.id === id);

function formatTime(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `${mins}m`;
  if (hours < 24) return `${hours}h`;
  return `${days}d`;
}

function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2,6)}`;
}

function getChatKey(uid1, uid2) {
  const sorted = [uid1, uid2].sort();
  return `${sorted[0]}__${sorted[1]}`;
}

function showToast(msg, emoji = '✦') {
  const t = $('toast');
  t.textContent = `${emoji} ${msg}`;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);
}

function renderAvatar(user, size = 'md', clickHandler = null) {
  const div = document.createElement('div');
  div.className = `avatar-${size}`;
  div.style.background = `linear-gradient(135deg, ${user.color}, ${user.color}88)`;
  div.textContent = getInitials(user.name);
  if (clickHandler) div.onclick = clickHandler;
  else div.onclick = () => showProfile(user.id);
  return div;
}

/* ══════════════════════════════════════════════
   AUTH
   ══════════════════════════════════════════════ */
function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab').forEach((t, i) => {
    t.classList.toggle('active', (i === 0 && tab === 'login') || (i === 1 && tab === 'register'));
  });
  $('login-form').classList.toggle('active', tab === 'login');
  $('register-form').classList.toggle('active', tab === 'register');
}

function doLogin() {
  const uInput = $('login-user').value.trim();
  const pass = $('login-pass').value;
  const user = DB.users.find(u => (u.username === uInput || u.email === uInput) && u.password === pass);
  if (!user) { showToast('Credenciales incorrectas', '❌'); return; }
  loginSuccess(user);
}

function doRegister() {
  const name = $('reg-name').value.trim();
  const username = $('reg-user').value.trim();
  const email = $('reg-email').value.trim();
  const pass = $('reg-pass').value;
  if (!name || !username || !email || !pass) { showToast('Completa todos los campos', '⚠️'); return; }
  if (pass.length < 6) { showToast('La contraseña debe tener mínimo 6 caracteres', '⚠️'); return; }
  const handle = username.startsWith('@') ? username : `@${username}`;
  if (DB.users.find(u => u.username === handle)) { showToast('Ese usuario ya existe', '❌'); return; }
  const newUser = {
    id: generateId('user'),
    username: handle,
    name,
    email,
    password: pass,
    bio: '',
    location: '',
    color: '#7c5cfc',
    following: [],
    followers: [],
    joinDate: new Date().toISOString().split('T')[0]
  };
  DB.users.push(newUser);
  loginSuccess(newUser);
}

function loginSuccess(user) {
  currentUser = user;
  $('auth-screen').classList.remove('active');
  const appScreen = $('app-screen');
  appScreen.classList.add('active');
  appScreen.style.display = 'flex';
  initApp();
  showToast(`Bienvenido de vuelta, ${user.name.split(' ')[0]}!`, '✦');
}

/* ══════════════════════════════════════════════
   APP INIT
   ══════════════════════════════════════════════ */
function initApp() {
  updateSidebarUser();
  renderFeed();
  renderTrending();
  renderSuggestions();
  renderChatList();
  renderNotifications();
  renderExplore('');
  closeAllContextMenus();
  document.addEventListener('click', handleGlobalClick);
}

function updateSidebarUser() {
  const avatar = $('sidebar-avatar');
  avatar.style.background = `linear-gradient(135deg, ${currentUser.color}, ${currentUser.color}88)`;
  avatar.textContent = getInitials(currentUser.name);
  $('sidebar-name').textContent = currentUser.name.split(' ')[0];
  $('sidebar-handle').textContent = currentUser.username;

  const compAvatar = $('composer-avatar');
  if (compAvatar) {
    compAvatar.style.background = `linear-gradient(135deg, ${currentUser.color}, ${currentUser.color}88)`;
    compAvatar.textContent = getInitials(currentUser.name);
  }
}

function showView(viewName) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  $(`view-${viewName}`).classList.add('active');
  document.querySelector(`[data-view="${viewName}"]`)?.classList.add('active');

  // Notifs badge
  if (viewName === 'notifications') {
    $('notif-badge').style.display = 'none';
    DB.notifications.forEach(n => n.read = true);
  }
}

/* ══════════════════════════════════════════════
   FEED
   ══════════════════════════════════════════════ */
function renderFeed() {
  const feedEl = $('feed-list');
  feedEl.innerHTML = '';
  // Show posts from current user + followed users
  const following = [...currentUser.following, currentUser.id];
  const feedPosts = DB.posts
    .filter(p => following.includes(p.sharedBy || p.authorId))
    .sort((a, b) => b.timestamp - a.timestamp);

  if (feedPosts.length === 0) {
    feedEl.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text3)">
      <div style="font-size:48px;margin-bottom:12px">🌌</div>
      <p>El universo está vacío por aquí.</p>
      <p style="font-size:12px;margin-top:6px">Sigue a otros viajeros para ver sus publicaciones.</p>
    </div>`;
    return;
  }

  feedPosts.forEach(post => {
    feedEl.appendChild(renderPostCard(post));
  });
}

function renderPostCard(post, compact = false) {
  const author = getUserById(post.authorId);
  const sharer = post.sharedBy ? getUserById(post.sharedBy) : null;
  const totalReactions = Object.values(post.reactions).flat().length;
  const topReaction = getTopReaction(post.reactions);
  const userReacted = Object.entries(post.reactions).find(([,users]) => users.includes(currentUser.id));
  const isOwn = post.authorId === currentUser.id;
  const commentCount = post.comments.length;

  const card = document.createElement('div');
  card.className = 'post-card';
  card.dataset.postId = post.id;

  let html = '';

  if (sharer) {
    html += `<div class="shared-banner">
      <i class="fa-solid fa-retweet"></i>
      <span onclick="showProfile('${sharer.id}')" style="cursor:pointer;font-weight:600;color:var(--text)">${sharer.name}</span> 
      compartió esto
    </div>`;
  }

  html += `<div class="post-header">
    <div class="avatar-md" style="background:linear-gradient(135deg,${author.color},${author.color}88);cursor:pointer" onclick="showProfile('${author.id}')">${getInitials(author.name)}</div>
    <div class="post-user-info">
      <div class="post-user-name" onclick="showProfile('${author.id}')">${author.name}</div>
      <div class="post-user-handle">${author.username} · ${formatTime(post.timestamp)}</div>
    </div>
    ${!compact ? `<button class="post-menu-btn" onclick="togglePostMenu(event,'${post.id}','${isOwn}')"><i class="fa-solid fa-ellipsis"></i></button>` : ''}
  </div>`;

  html += `<div class="post-body">`;
  if (post.text) html += `<p class="post-text">${escapeHtml(post.text)}</p>`;
  if (post.media) {
    html += `<div class="post-media">`;
    if (post.mediaType === 'image') html += `<img src="${post.media}" alt="Media" loading="lazy"/>`;
    else if (post.mediaType === 'video') html += `<video src="${post.media}" controls></video>`;
    html += `</div>`;
  }
  html += `</div>`;

  // Actions
  html += `<div class="post-actions">
    <button class="action-btn ${userReacted ? 'reacted' : ''}" onclick="showReactionPicker(event,'${post.id}')">
      <span>${topReaction || '🌟'}</span>
      <span class="action-count">${totalReactions > 0 ? totalReactions : ''}</span>
      <span style="font-size:11px;color:var(--text3)">Reaccionar</span>
    </button>
    <button class="action-btn" onclick="toggleComments('${post.id}')">
      <i class="fa-regular fa-comment"></i>
      <span class="action-count">${commentCount > 0 ? commentCount : ''}</span>
      <span style="font-size:11px;color:var(--text3)">Comentar</span>
    </button>
    <button class="action-btn" onclick="sharePost('${post.id}')">
      <i class="fa-solid fa-retweet"></i>
      <span class="action-count">${post.shares.length > 0 ? post.shares.length : ''}</span>
      <span style="font-size:11px;color:var(--text3)">Compartir</span>
    </button>
  </div>`;

  // Comments section
  if (!compact) {
    html += `<div class="comments-section" id="comments-${post.id}">`;
    html += renderCommentsSection(post);
    html += `</div>`;
  }

  card.innerHTML = html;
  return card;
}

function getTopReaction(reactions) {
  const map = { supernova: '🌟', quantum: '⚛️', warp: '🌀', eclipse: '🌑', pulsar: '💫' };
  let top = null, max = 0;
  Object.entries(reactions).forEach(([key, users]) => {
    if (users.length > max) { max = users.length; top = map[key]; }
  });
  return top;
}

function escapeHtml(text) {
  return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ══════════════════════════════════════════════
   REACTIONS
   ══════════════════════════════════════════════ */
function showReactionPicker(event, postId) {
  event.stopPropagation();
  reactionTargetPostId = postId;
  const popup = $('reactions-popup');
  const rect = event.currentTarget.getBoundingClientRect();
  popup.style.left = rect.left + 'px';
  popup.style.top = (rect.top - 90) + 'px';
  popup.classList.add('visible');
}

function applyReaction(btn) {
  const reaction = btn.dataset.reaction;
  const post = getPostById(reactionTargetPostId);
  if (!post) return;
  const userId = currentUser.id;

  // Remove from all reactions first
  Object.keys(post.reactions).forEach(key => {
    post.reactions[key] = post.reactions[key].filter(id => id !== userId);
  });

  // Toggle: add if not already there
  if (!Object.values(post.reactions).flat().includes(userId)) {
    post.reactions[reaction].push(userId);
  } else {
    // already removed, was a toggle-off
  }

  $('reactions-popup').classList.remove('visible');
  reactionTargetPostId = null;
  renderFeed();
  showToast('Reacción enviada ✦');
}

/* ══════════════════════════════════════════════
   COMMENTS
   ══════════════════════════════════════════════ */
function renderCommentsSection(post) {
  const rootComments = post.comments
    .map(id => getCommentById(id))
    .filter(c => c && !c.parentId);

  let html = `<div class="comment-composer">
    <div class="avatar-sm" style="background:linear-gradient(135deg,${currentUser.color},${currentUser.color}88)">${getInitials(currentUser.name)}</div>
    <div class="comment-input-area">
      <textarea class="comment-bubble-input" placeholder="Escribe tu pensamiento..." id="comment-input-${post.id}" rows="1" 
        onkeydown="handleCommentKey(event,'${post.id}',null)"></textarea>
    </div>
    <button class="comment-send-btn" onclick="submitComment('${post.id}',null)">
      <i class="fa-solid fa-paper-plane" style="font-size:14px"></i>
    </button>
  </div>
  <div class="comments-list" id="comments-list-${post.id}">`;

  rootComments.forEach(comment => {
    html += renderComment(comment, post.id);
    // Replies
    if (comment.replies) {
      comment.replies.forEach(rId => {
        const reply = getCommentById(rId);
        if (reply) html += renderComment(reply, post.id, true);
      });
    }
  });

  html += `</div>`;
  return html;
}

function renderComment(comment, postId, isReply = false) {
  const author = getUserById(comment.authorId);
  return `<div class="comment-item ${isReply ? 'reply-item' : ''}" id="${comment.id}">
    <div class="avatar-sm" style="background:linear-gradient(135deg,${author.color},${author.color}88);cursor:pointer" onclick="showProfile('${author.id}')">${getInitials(author.name)}</div>
    <div class="comment-bubble">
      <div class="comment-header">
        <span class="comment-author" onclick="showProfile('${author.id}')">${author.name}</span>
        <span class="comment-ts">${formatTime(comment.timestamp)}</span>
      </div>
      <div class="comment-text">${escapeHtml(comment.text)}</div>
      <div class="comment-actions">
        ${!isReply ? `<button class="comment-action" onclick="openReplyInput('${postId}','${comment.id}')">Responder</button>` : ''}
        <span class="comment-ts" style="margin-left:auto">${formatTime(comment.timestamp)}</span>
      </div>
      ${!isReply ? `<div id="reply-composer-${comment.id}" style="display:none;margin-top:10px">
        <div style="display:flex;gap:8px;align-items:flex-end">
          <textarea class="comment-bubble-input" id="reply-input-${comment.id}" placeholder="Responder a ${author.name}..." rows="1"
            onkeydown="handleCommentKey(event,'${postId}','${comment.id}')"></textarea>
          <button class="comment-send-btn" onclick="submitComment('${postId}','${comment.id}')">
            <i class="fa-solid fa-paper-plane" style="font-size:12px"></i>
          </button>
        </div>
      </div>` : ''}
    </div>
  </div>`;
}

function toggleComments(postId) {
  const section = $(`comments-${postId}`);
  section.classList.toggle('open');
  if (section.classList.contains('open')) {
    const input = $(`comment-input-${postId}`);
    if (input) setTimeout(() => input.focus(), 300);
  }
}

function openReplyInput(postId, commentId) {
  const div = $(`reply-composer-${commentId}`);
  if (div) {
    div.style.display = div.style.display === 'none' ? 'block' : 'none';
    const input = $(`reply-input-${commentId}`);
    if (input && div.style.display === 'block') input.focus();
  }
}

function handleCommentKey(event, postId, parentCommentId) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    submitComment(postId, parentCommentId);
  }
}

function submitComment(postId, parentCommentId) {
  const inputId = parentCommentId ? `reply-input-${parentCommentId}` : `comment-input-${postId}`;
  const input = $(inputId);
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;

  const newComment = {
    id: generateId('comment'),
    postId,
    authorId: currentUser.id,
    text,
    timestamp: Date.now(),
    replies: [],
    parentId: parentCommentId || null
  };

  DB.comments.push(newComment);
  const post = getPostById(postId);
  if (post) {
    if (parentCommentId) {
      const parent = getCommentById(parentCommentId);
      if (parent) parent.replies.push(newComment.id);
    } else {
      post.comments.push(newComment.id);
    }
  }

  input.value = '';
  // Refresh comments section
  const section = $(`comments-${postId}`);
  if (section) {
    section.innerHTML = renderCommentsSection(post);
    section.classList.add('open');
  }
  showToast('Comentario enviado', '💬');
}

/* ══════════════════════════════════════════════
   SHARE POST
   ══════════════════════════════════════════════ */
function sharePost(postId) {
  const post = getPostById(postId);
  if (!post) return;
  if (post.sharedBy === currentUser.id) { showToast('Ya compartiste esto', '⚠️'); return; }
  if (post.authorId === currentUser.id) { showToast('No puedes compartir tu propia publicación', '⚠️'); return; }
  if (post.shares.includes(currentUser.id)) { showToast('Ya compartiste esta publicación', '⚠️'); return; }

  const sharedPost = {
    ...JSON.parse(JSON.stringify(post)),
    id: generateId('post'),
    timestamp: Date.now(),
    sharedBy: currentUser.id,
    originalPostId: postId,
    reactions: { supernova: [], quantum: [], warp: [], eclipse: [], pulsar: [] },
    comments: [],
    shares: []
  };
  post.shares.push(currentUser.id);
  DB.posts.unshift(sharedPost);
  renderFeed();
  showToast('¡Publicación compartida!', '🔁');
}

/* ══════════════════════════════════════════════
   POST MENU
   ══════════════════════════════════════════════ */
function togglePostMenu(event, postId, isOwn) {
  event.stopPropagation();
  const existing = document.querySelector('.post-context-menu');
  if (existing) existing.remove();

  const menu = document.createElement('div');
  menu.className = 'msg-context-menu post-context-menu';
  menu.style.position = 'fixed';
  const rect = event.currentTarget.getBoundingClientRect();
  menu.style.top = (rect.bottom + 4) + 'px';
  menu.style.left = (rect.left - 140) + 'px';

  let items = `<div class="ctx-item" onclick="copyPostText('${postId}')"><i class="fa-regular fa-copy"></i> Copiar texto</div>
    <div class="ctx-item" onclick="sharePost('${postId}');closeAllContextMenus()"><i class="fa-solid fa-retweet"></i> Compartir</div>`;
  if (isOwn === 'true') {
    items += `<div class="ctx-item danger" onclick="deletePost('${postId}')"><i class="fa-solid fa-trash"></i> Eliminar</div>`;
  }
  menu.innerHTML = items;
  document.body.appendChild(menu);
}

function copyPostText(postId) {
  const post = getPostById(postId);
  if (post?.text) navigator.clipboard.writeText(post.text).then(() => showToast('Texto copiado', '📋'));
  closeAllContextMenus();
}

function deletePost(postId) {
  const idx = DB.posts.findIndex(p => p.id === postId);
  if (idx > -1) DB.posts.splice(idx, 1);
  closeAllContextMenus();
  renderFeed();
  showToast('Publicación eliminada', '🗑️');
}

/* ══════════════════════════════════════════════
   COMPOSER
   ══════════════════════════════════════════════ */
function openComposer(type) {
  const modal = $('modal-composer');
  modal.classList.add('open');
  const avatar = $('composer-modal-avatar');
  avatar.style.background = `linear-gradient(135deg, ${currentUser.color}, ${currentUser.color}88)`;
  avatar.textContent = getInitials(currentUser.name);
  $('post-text').value = '';
  $('char-count').textContent = '0';
  $('media-preview').innerHTML = '';
  $('file-input').value = '';

  $('post-text').oninput = function() {
    $('char-count').textContent = this.value.length;
    $('char-count').style.color = this.value.length > 450 ? 'var(--red)' : 'var(--text3)';
  };

  if (type === 'image') $('file-input').click();
  else if (type === 'video') {
    $('file-input').setAttribute('accept', 'video/*');
    $('file-input').click();
  }
}

function handleFileSelect(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const preview = $('media-preview');
    if (file.type.startsWith('image/')) {
      preview.innerHTML = `<img src="${e.target.result}" style="max-height:200px;width:100%;object-fit:cover;border-radius:10px"/>`;
      preview.dataset.type = 'image';
    } else if (file.type.startsWith('video/')) {
      preview.innerHTML = `<video src="${e.target.result}" controls style="width:100%;max-height:200px;border-radius:10px"></video>`;
      preview.dataset.type = 'video';
    }
    preview.dataset.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function publishPost() {
  const text = $('post-text').value.trim();
  const preview = $('media-preview');
  if (!text && !preview.dataset.src) { showToast('Escribe algo antes de lanzar', '⚠️'); return; }

  const newPost = {
    id: generateId('post'),
    authorId: currentUser.id,
    text,
    media: preview.dataset.src || null,
    mediaType: preview.dataset.type || null,
    reactions: { supernova: [], quantum: [], warp: [], eclipse: [], pulsar: [] },
    comments: [],
    shares: [],
    timestamp: Date.now(),
    sharedBy: null
  };

  DB.posts.unshift(newPost);
  closeModal('modal-composer');
  renderFeed();
  showToast('¡Publicación lanzada al universo!', '🚀');
  delete preview.dataset.src;
  delete preview.dataset.type;
}

/* ══════════════════════════════════════════════
   TRENDING & SUGGESTIONS
   ══════════════════════════════════════════════ */
function renderTrending() {
  const trends = [
    { tag: '#SupernovaCode', count: '12.4K' },
    { tag: '#QuantumDesign', count: '8.1K' },
    { tag: '#WarpThinking', count: '5.7K' },
    { tag: '#NebulaCultura', count: '4.2K' },
    { tag: '#PulsarDev', count: '3.9K' }
  ];
  const el = $('trending-list');
  el.innerHTML = trends.map((t, i) => `
    <div class="trending-item">
      <span class="trending-num">${i+1}</span>
      <div>
        <div class="trending-tag">${t.tag}</div>
        <div class="trending-count">${t.count} orbitas</div>
      </div>
    </div>`).join('');
}

function renderSuggestions() {
  const el = $('suggestions-list');
  const suggestions = DB.users
    .filter(u => u.id !== currentUser.id && !currentUser.following.includes(u.id))
    .slice(0, 3);

  el.innerHTML = suggestions.map(u => `
    <div class="suggestion-item">
      <div class="avatar-sm" style="background:linear-gradient(135deg,${u.color},${u.color}88);cursor:pointer" onclick="showProfile('${u.id}')">${getInitials(u.name)}</div>
      <div class="suggestion-info">
        <div class="suggestion-name" onclick="showProfile('${u.id}')">${u.name}</div>
        <div class="suggestion-handle">${u.username}</div>
      </div>
      <button class="follow-btn" id="follow-btn-${u.id}" onclick="toggleFollow('${u.id}')">
        ${currentUser.following.includes(u.id) ? '✓' : '+ Seguir'}
      </button>
    </div>`).join('');
}

function toggleFollow(userId) {
  const user = getUserById(userId);
  if (!user) return;
  const idx = currentUser.following.indexOf(userId);
  if (idx > -1) {
    currentUser.following.splice(idx, 1);
    user.followers = user.followers.filter(id => id !== currentUser.id);
    showToast(`Dejaste de seguir a ${user.name.split(' ')[0]}`, '👋');
  } else {
    currentUser.following.push(userId);
    if (!user.followers.includes(currentUser.id)) user.followers.push(currentUser.id);
    showToast(`Ahora sigues a ${user.name.split(' ')[0]}`, '✦');
  }
  renderSuggestions();
  renderFeed();
}

/* ══════════════════════════════════════════════
   EXPLORE
   ══════════════════════════════════════════════ */
function doSearch(query) {
  renderExplore(query);
}

function renderExplore(query) {
  const el = $('explore-results');
  const q = query.toLowerCase().trim();
  const results = DB.users.filter(u => {
    if (u.id === currentUser.id) return false;
    return !q || u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q) || u.bio.toLowerCase().includes(q);
  });

  if (results.length === 0) {
    el.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text3)">
      <div style="font-size:40px;margin-bottom:12px">🔭</div>
      <p>No encontramos viajeros con ese nombre.</p>
    </div>`;
    return;
  }

  el.innerHTML = results.map(u => `
    <div class="user-result-card" onclick="showProfile('${u.id}')">
      <div class="avatar-lg" style="background:linear-gradient(135deg,${u.color},${u.color}88)">${getInitials(u.name)}</div>
      <div class="user-result-info">
        <div class="user-result-name">${u.name}</div>
        <div class="user-result-handle">${u.username}</div>
        <div class="user-result-bio">${u.bio || 'Sin bio todavía...'}</div>
      </div>
      <button class="follow-btn ${currentUser.following.includes(u.id) ? 'following' : ''}" 
        onclick="event.stopPropagation();toggleFollow('${u.id}');renderExplore('${q}')">
        ${currentUser.following.includes(u.id) ? '✓ Siguiendo' : '+ Seguir'}
      </button>
    </div>`).join('');
}

/* ══════════════════════════════════════════════
   PROFILE
   ══════════════════════════════════════════════ */
function showProfile(userId) {
  showView('profile');
  const user = getUserById(userId);
  if (!user) return;
  const isOwn = user.id === currentUser.id;
  const isFollowing = currentUser.following.includes(userId);
  const userPosts = DB.posts
    .filter(p => p.authorId === userId || p.sharedBy === userId)
    .sort((a, b) => b.timestamp - a.timestamp);

  const el = $('profile-content');

  el.innerHTML = `
    <div class="profile-cover">
      <div class="cover-decoration"><span class="cover-stars">✦ ✦ ✦ ✦</span></div>
    </div>
    <div style="position:relative;background:var(--bg2)">
      <div class="profile-header-bar">
        <div class="avatar-xl" style="background:linear-gradient(135deg,${user.color},${user.color}88);border-color:var(--bg2)" onclick="showProfile('${user.id}')">${getInitials(user.name)}</div>
        <div style="display:flex;gap:10px;padding-bottom:12px;align-items:center">
          ${isOwn ? 
            `<button class="edit-profile-btn" onclick="openEditProfile()"><i class="fa-solid fa-pencil"></i> Editar perfil</button>` :
            `<button class="msg-user-btn" onclick="openChatWith('${userId}')"><i class="fa-solid fa-message"></i> Mensaje</button>
             <button class="follow-action-btn ${isFollowing ? 'following-state' : ''}" onclick="toggleFollow('${userId}');showProfile('${userId}')">
               ${isFollowing ? '✓ Siguiendo' : '+ Seguir'}
             </button>`
          }
        </div>
      </div>
      <div class="profile-info-section">
        <div class="profile-name">${user.name}</div>
        <div class="profile-handle">${user.username}</div>
        <div class="profile-bio">${user.bio || '<span style="color:var(--text3)">Sin bio todavía...</span>'}</div>
        <div class="profile-meta">
          ${user.location ? `<div class="profile-meta-item"><i class="fa-solid fa-location-dot"></i>${user.location}</div>` : ''}
          <div class="profile-meta-item"><i class="fa-solid fa-star"></i>Se unió el ${user.joinDate}</div>
        </div>
        <div class="profile-stats">
          <div class="stat-item">
            <div class="stat-num">${userPosts.filter(p => !p.sharedBy).length}</div>
            <div class="stat-label">Publicaciones</div>
          </div>
          <div class="stat-item">
            <div class="stat-num">${user.following.length}</div>
            <div class="stat-label">Siguiendo</div>
          </div>
          <div class="stat-item">
            <div class="stat-num">${user.followers.length}</div>
            <div class="stat-label">Seguidores</div>
          </div>
        </div>
      </div>
      <div class="profile-tabs">
        <button class="profile-tab active">Publicaciones</button>
        <button class="profile-tab">Compartidos</button>
      </div>
      <div class="profile-posts" id="profile-posts-list">
        ${userPosts.length === 0 ? `<div style="text-align:center;padding:40px;color:var(--text3)">
          <div style="font-size:40px;margin-bottom:12px">🌌</div>
          <p>Aún no hay publicaciones aquí.</p>
        </div>` : ''}
      </div>
    </div>`;

  const postsEl = $('profile-posts-list');
  if (postsEl && userPosts.length > 0) {
    userPosts.forEach(post => {
      postsEl.appendChild(renderPostCard(post));
    });
  }
}

function showMyProfile() {
  showProfile(currentUser.id);
  showView('profile');
}

function openEditProfile() {
  $('edit-name').value = currentUser.name;
  $('edit-bio').value = currentUser.bio || '';
  $('edit-location').value = currentUser.location || '';
  $('edit-color').value = currentUser.color;
  $('modal-edit-profile').classList.add('open');
}

function saveProfile() {
  currentUser.name = $('edit-name').value.trim() || currentUser.name;
  currentUser.bio = $('edit-bio').value.trim();
  currentUser.location = $('edit-location').value.trim();
  currentUser.color = $('edit-color').value;
  // Update in DB
  const idx = DB.users.findIndex(u => u.id === currentUser.id);
  if (idx > -1) DB.users[idx] = { ...DB.users[idx], ...currentUser };
  closeModal('modal-edit-profile');
  updateSidebarUser();
  showMyProfile();
  showToast('¡Perfil actualizado!', '✦');
}

/* ══════════════════════════════════════════════
   CHAT
   ══════════════════════════════════════════════ */
function renderChatList() {
  const el = $('chat-list');
  const conversations = DB.users.filter(u => {
    if (u.id === currentUser.id) return false;
    const key = getChatKey(currentUser.id, u.id);
    return DB.messages[key] && DB.messages[key].length > 0;
  });

  if (conversations.length === 0) {
    el.innerHTML = `<div style="padding:20px;text-align:center;color:var(--text3);font-size:13px">
      No hay mensajes todavía.<br>¡Inicia una conversación!
    </div>`;
    return;
  }

  el.innerHTML = conversations.map(u => {
    const key = getChatKey(currentUser.id, u.id);
    const msgs = DB.messages[key] || [];
    const lastMsg = msgs[msgs.length - 1];
    const unread = msgs.filter(m => m.senderId !== currentUser.id && m.status !== 'read').length;
    const isActive = activeChatUserId === u.id;
    return `<div class="chat-list-item ${isActive ? 'active' : ''}" onclick="openChatWith('${u.id}')">
      <div class="avatar-md" style="background:linear-gradient(135deg,${u.color},${u.color}88)">${getInitials(u.name)}</div>
      <div class="chat-item-info">
        <div class="chat-item-header">
          <span class="chat-item-name">${u.name}</span>
          <span class="chat-item-time">${lastMsg ? formatTime(lastMsg.timestamp) : ''}</span>
        </div>
        <div class="chat-item-preview">${lastMsg ? (lastMsg.deleted ? '<i>Mensaje eliminado</i>' : (lastMsg.senderId === currentUser.id ? 'Tú: ' : '') + lastMsg.text) : ''}</div>
      </div>
      ${unread > 0 ? '<div class="unread-dot"></div>' : ''}
    </div>`;
  }).join('');
}

function openChatWith(userId) {
  // Ensure a message thread exists
  const key = getChatKey(currentUser.id, userId);
  if (!DB.messages[key]) DB.messages[key] = [];
  activeChatUserId = userId;
  showView('chat');
  renderChatList();
  renderChatWindow(userId);
}

function renderChatWindow(userId) {
  const partner = getUserById(userId);
  const key = getChatKey(currentUser.id, userId);
  const msgs = DB.messages[key] || [];

  // Mark as read
  msgs.forEach(m => { if (m.senderId !== currentUser.id) m.status = 'read'; });

  const win = $('chat-window');
  win.innerHTML = `
    <div class="chat-win-header">
      <div class="avatar-md" style="background:linear-gradient(135deg,${partner.color},${partner.color}88);cursor:pointer" onclick="showProfile('${partner.id}')">${getInitials(partner.name)}</div>
      <div class="chat-win-user">
        <div class="chat-win-name">${partner.name}</div>
        <div class="chat-win-status">● En órbita</div>
      </div>
      <button class="icon-btn" onclick="showProfile('${userId}')"><i class="fa-solid fa-user"></i></button>
    </div>
    <div class="messages-area" id="messages-area"></div>
    <div class="msg-input-area">
      <div id="reply-preview-container"></div>
      <div class="msg-input-row">
        <textarea class="msg-input-box" id="msg-input-box" placeholder="Enviar mensaje a ${partner.name}..." rows="1"
          onkeydown="handleMsgKey(event,'${userId}')"
          oninput="this.style.height='auto';this.style.height=this.scrollHeight+'px'"></textarea>
        <button class="msg-send-btn" onclick="sendMessage('${userId}')">
          <i class="fa-solid fa-paper-plane"></i>
        </button>
      </div>
    </div>`;

  const area = $('messages-area');
  if (msgs.length === 0) {
    area.innerHTML = `<div style="text-align:center;color:var(--text3);font-size:13px;padding:20px">
      <div style="font-size:36px;margin-bottom:10px">🌟</div>
      Inicio de la conversación con ${partner.name}
    </div>`;
  } else {
    renderMessages(msgs, area, userId);
  }

  area.scrollTop = area.scrollHeight;
}

function renderMessages(msgs, container, partnerId) {
  container.innerHTML = '';
  let prevSender = null;

  msgs.filter(m => !m.deleted).forEach(msg => {
    const isOwn = msg.senderId === currentUser.id;
    const senderChanged = msg.senderId !== prevSender;
    prevSender = msg.senderId;

    const group = document.createElement('div');
    group.className = `msg-group ${isOwn ? 'own' : ''}`;
    if (senderChanged) group.style.marginTop = '8px';

    let replyHtml = '';
    if (msg.replyTo) {
      const original = msgs.find(m => m.id === msg.replyTo);
      if (original && !original.deleted) {
        const origSender = getUserById(original.senderId);
        replyHtml = `<div class="msg-reply-preview">
          <strong>${origSender.name.split(' ')[0]}</strong>: ${original.text.slice(0,60)}${original.text.length > 60 ? '...' : ''}
        </div>`;
      }
    }

    const statusIcon = isOwn ? getStatusIcon(msg.status) : '';
    const reactionEmoji = msg.reaction ? getReactionEmoji(msg.reaction) : '';

    group.innerHTML = `<div class="msg-wrapper">
      <div class="msg-bubble ${isOwn ? 'outgoing' : 'incoming'}" id="${msg.id}" 
        oncontextmenu="showMsgContextMenu(event,'${msg.id}','${partnerId}',${isOwn})"
        onclick="handleMsgClick(event,'${msg.id}','${partnerId}',${isOwn})">
        ${replyHtml}
        <div>${escapeHtml(msg.text)}</div>
        ${reactionEmoji ? `<div class="msg-reaction-display" title="Reacción">${reactionEmoji}</div>` : ''}
      </div>
    </div>
    <div class="msg-meta">
      <span>${formatTime(msg.timestamp)}</span>
      ${statusIcon}
    </div>`;

    container.appendChild(group);
  });
}

function getStatusIcon(status) {
  const icons = { sent: '✓', delivered: '✓✓', read: '<span class="msg-status read">✓✓</span>' };
  return icons[status] || '';
}

function getReactionEmoji(reaction) {
  const map = { supernova: '🌟', quantum: '⚛️', warp: '🌀', eclipse: '🌑', pulsar: '💫' };
  return map[reaction] || '';
}

function handleMsgKey(event, partnerId) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage(partnerId);
  }
}

function sendMessage(partnerId) {
  const input = $('msg-input-box');
  const text = input.value.trim();
  if (!text) return;

  const key = getChatKey(currentUser.id, partnerId);
  if (!DB.messages[key]) DB.messages[key] = [];

  const newMsg = {
    id: generateId('msg'),
    senderId: currentUser.id,
    text,
    timestamp: Date.now(),
    status: 'sent',
    reaction: null,
    replyTo: replyingToMsg,
    deleted: false
  };

  DB.messages[key].push(newMsg);
  input.value = '';
  input.style.height = 'auto';
  replyingToMsg = null;
  $('reply-preview-container').innerHTML = '';

  // Simulate delivered + read
  setTimeout(() => { newMsg.status = 'delivered'; refreshMessages(partnerId); }, 800);
  setTimeout(() => { newMsg.status = 'read'; refreshMessages(partnerId); }, 2000);

  refreshMessages(partnerId);
  renderChatList();
}

function refreshMessages(partnerId) {
  const key = getChatKey(currentUser.id, partnerId);
  const msgs = DB.messages[key] || [];
  const area = $('messages-area');
  if (!area) return;
  const wasAtBottom = area.scrollHeight - area.scrollTop - area.clientHeight < 60;
  renderMessages(msgs, area, partnerId);
  if (wasAtBottom) area.scrollTop = area.scrollHeight;
}

/* ── MSG CONTEXT MENU ── */
function showMsgContextMenu(event, msgId, partnerId, isOwn) {
  event.preventDefault();
  event.stopPropagation();
  closeAllContextMenus();
  contextMenuMsgId = msgId;

  const menu = document.createElement('div');
  menu.className = 'msg-context-menu';
  menu.id = 'active-msg-menu';
  menu.style.top = event.clientY + 'px';
  menu.style.left = Math.min(event.clientX, window.innerWidth - 170) + 'px';

  let items = `<div class="ctx-item" onclick="replyToMessage('${msgId}','${partnerId}')"><i class="fa-solid fa-reply"></i> Responder</div>
    <div class="ctx-item" onclick="reactToMessage('${msgId}','${partnerId}',event)"><i class="fa-solid fa-face-smile"></i> Reaccionar</div>`;
  if (isOwn) {
    items += `<div class="ctx-item" onclick="editMessage('${msgId}','${partnerId}')"><i class="fa-solid fa-pencil"></i> Editar</div>
      <div class="ctx-item danger" onclick="deleteMessage('${msgId}','${partnerId}')"><i class="fa-solid fa-trash"></i> Eliminar</div>`;
  }
  menu.innerHTML = items;
  document.body.appendChild(menu);
}

function handleMsgClick(event, msgId, partnerId, isOwn) {
  // Only triggers on mobile tap-hold equivalent, do nothing on plain click
}

function replyToMessage(msgId, partnerId) {
  closeAllContextMenus();
  const key = getChatKey(currentUser.id, partnerId);
  const msgs = DB.messages[key] || [];
  const msg = msgs.find(m => m.id === msgId);
  if (!msg) return;
  replyingToMsg = msgId;
  const sender = getUserById(msg.senderId);
  $('reply-preview-container').innerHTML = `
    <div class="reply-preview-bar">
      <span><strong>${sender.name.split(' ')[0]}</strong>: ${msg.text.slice(0,60)}</span>
      <span class="reply-cancel" onclick="cancelReply()">✕</span>
    </div>`;
  $('msg-input-box').focus();
}

function cancelReply() {
  replyingToMsg = null;
  $('reply-preview-container').innerHTML = '';
}

function reactToMessage(msgId, partnerId, event) {
  closeAllContextMenus();
  msgReactionTargetId = { msgId, partnerId };
  const popup = $('msg-reactions-popup');
  popup.style.top = (event.clientY - 70) + 'px';
  popup.style.left = Math.min(event.clientX, window.innerWidth - 270) + 'px';
  popup.classList.add('visible');
}

function applyMsgReaction(btn) {
  if (!msgReactionTargetId) return;
  const { msgId, partnerId } = msgReactionTargetId;
  const key = getChatKey(currentUser.id, partnerId);
  const msgs = DB.messages[key] || [];
  const msg = msgs.find(m => m.id === msgId);
  if (msg) {
    msg.reaction = msg.reaction === btn.dataset.reaction ? null : btn.dataset.reaction;
  }
  $('msg-reactions-popup').classList.remove('visible');
  msgReactionTargetId = null;
  refreshMessages(partnerId);
}

function editMessage(msgId, partnerId) {
  closeAllContextMenus();
  const key = getChatKey(currentUser.id, partnerId);
  const msgs = DB.messages[key] || [];
  const msg = msgs.find(m => m.id === msgId);
  if (!msg) return;
  const newText = prompt('Editar mensaje:', msg.text);
  if (newText !== null && newText.trim()) {
    msg.text = newText.trim() + ' (editado)';
    refreshMessages(partnerId);
    showToast('Mensaje editado', '✏️');
  }
}

function deleteMessage(msgId, partnerId) {
  closeAllContextMenus();
  const key = getChatKey(currentUser.id, partnerId);
  const msgs = DB.messages[key] || [];
  const msg = msgs.find(m => m.id === msgId);
  if (msg) {
    msg.deleted = true;
    refreshMessages(partnerId);
    renderChatList();
    showToast('Mensaje eliminado', '🗑️');
  }
}

/* ── NEW CHAT MODAL ── */
function openNewChatModal() {
  $('modal-new-chat').classList.add('open');
  $('new-chat-search').value = '';
  searchForChat('');
}

function searchForChat(query) {
  const el = $('new-chat-results');
  const q = query.toLowerCase();
  const results = DB.users.filter(u => u.id !== currentUser.id &&
    (!q || u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q)));

  el.innerHTML = results.map(u => `
    <div class="user-result-card" onclick="closeModal('modal-new-chat');openChatWith('${u.id}')">
      <div class="avatar-sm" style="background:linear-gradient(135deg,${u.color},${u.color}88)">${getInitials(u.name)}</div>
      <div class="user-result-info">
        <div class="user-result-name">${u.name}</div>
        <div class="user-result-handle">${u.username}</div>
      </div>
    </div>`).join('');
}

/* ══════════════════════════════════════════════
   NOTIFICATIONS
   ══════════════════════════════════════════════ */
function renderNotifications() {
  const el = $('notif-list');
  const notifIcons = { reaction: '🌟', comment: '💬', follow: '👤', share: '🔁', mention: '@' };
  const notifText = {
    reaction: (n) => {
      const from = getUserById(n.fromId);
      return `<strong>${from.name}</strong> reaccionó a tu publicación con ${getReactionEmoji(n.reaction) || '🌟'}`;
    },
    comment: (n) => {
      const from = getUserById(n.fromId);
      return `<strong>${from.name}</strong> comentó en tu publicación`;
    },
    follow: (n) => {
      const from = getUserById(n.fromId);
      return `<strong>${from.name}</strong> comenzó a seguirte`;
    },
    share: (n) => {
      const from = getUserById(n.fromId);
      return `<strong>${from.name}</strong> compartió tu publicación`;
    },
    mention: (n) => {
      const from = getUserById(n.fromId);
      return `<strong>${from.name}</strong> te mencionó en una publicación`;
    }
  };

  el.innerHTML = DB.notifications.sort((a,b) => b.timestamp - a.timestamp).map(n => {
    const from = getUserById(n.fromId);
    return `<div class="notif-item ${n.read ? '' : 'unread'}" onclick="handleNotifClick('${n.id}','${n.fromId}')">
      <div class="avatar-sm" style="background:linear-gradient(135deg,${from.color},${from.color}88)">${getInitials(from.name)}</div>
      <div class="notif-text">
        <div>${notifText[n.type](n)}</div>
        <div class="notif-time">${formatTime(n.timestamp)}</div>
      </div>
      <div class="notif-icon">${notifIcons[n.type]}</div>
    </div>`;
  }).join('');
}

function handleNotifClick(notifId, fromId) {
  const notif = DB.notifications.find(n => n.id === notifId);
  if (notif) notif.read = true;
  showProfile(fromId);
}

/* ══════════════════════════════════════════════
   MODAL HELPERS
   ══════════════════════════════════════════════ */
function closeModal(modalId) {
  $(modalId).classList.remove('open');
}

function closeAllContextMenus() {
  document.querySelectorAll('.msg-context-menu, .post-context-menu').forEach(el => el.remove());
  $('reactions-popup').classList.remove('visible');
  $('msg-reactions-popup').classList.remove('visible');
}

function handleGlobalClick(event) {
  const reactionPopup = $('reactions-popup');
  const msgReactionPopup = $('msg-reactions-popup');
  if (!reactionPopup.contains(event.target)) reactionPopup.classList.remove('visible');
  if (!msgReactionPopup.contains(event.target)) msgReactionPopup.classList.remove('visible');
  if (!event.target.closest('.msg-context-menu') && !event.target.closest('.post-context-menu')) {
    closeAllContextMenus();
  }
  // Close modals on overlay click
  document.querySelectorAll('.modal-overlay.open').forEach(overlay => {
    if (event.target === overlay) overlay.classList.remove('open');
  });
}

/* ══════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════ */
// Preload: allow Enter key on login form
document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeAllContextMenus();
      document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
    }
  });

  // Animate auth orbs
  const authScreen = $('auth-screen');
  if (authScreen) authScreen.classList.add('active');
});
