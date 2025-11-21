// src/app.js
// App initialization and routing
let currentUser = null;

function renderUserInfo(){
  document.getElementById('user-email-display').textContent = currentUser ? currentUser.email : 'Not signed in';
  document.getElementById('user-role-display').textContent = currentUser ? (currentUser.role || 'user') : 'visitor';
  document.getElementById('admin-panel').classList.toggle('hidden', !(currentUser && currentUser.role === 'admin'));
}

function afterLogin(){
  showDashboard();
  renderUserInfo();
  renderProjects();
  renderDBSection(null); // blank until project open
  alert('Welcome, ' + currentUser.name + '!');
}

function showDashboard(){
  document.getElementById('landing').classList.add('hidden');
  document.getElementById('public-preview').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
}

function showLanding(){
  document.getElementById('dashboard').classList.add('hidden');
  document.getElementById('public-preview').classList.add('hidden');
  document.getElementById('landing').classList.remove('hidden');
  currentUser = null;
  renderUserInfo();
}

document.getElementById('btn-logout').addEventListener('click', ()=>{
  currentUser = null;
  showLanding();
  alert('Logged out.');
});

// wire admin buttons
document.getElementById('admin-seed').addEventListener('click', ()=>{
  if(!(currentUser && currentUser.role==='admin')) return alert('Admin only.');
  seedDemoProjects();
  renderProjects();
});
document.getElementById('admin-clear').addEventListener('click', ()=>{
  if(!(currentUser && currentUser.role==='admin')) return alert('Admin only.');
  if(!confirm('Clear all users (except admin) and projects?')) return;
  clearAllButAdmin();
  renderProjects();
  alert('Cleared data.');
});

// public preview handling
function openPublicPreviewForProject(project){
  document.getElementById('dashboard').classList.add('hidden');
  document.getElementById('landing').classList.add('hidden');
  document.getElementById('public-preview').classList.remove('hidden');
  document.getElementById('preview-title').textContent = project.title;
  // hide all frames, then show the one chosen device (currentDevice)
  document.getElementById('frame-phone').classList.add('hidden');
  document.getElementById('frame-tablet').classList.add('hidden');
  document.getElementById('frame-desktop').classList.add('hidden');
  const frameMap = { phone: 'frame-phone', tablet: 'frame-tablet', desktop: 'frame-desktop' };
  const fid = frameMap[currentDevice] || 'frame-phone';
  document.getElementById(fid).classList.remove('hidden');
  renderPreviewFrames(project, fid);
}

function renderPreviewFrames(project, frameId){
  const frame = document.getElementById(frameId);
  const htmlFromProject = project.components.map(c => {
    if(c.type === 'text') return '<div style="padding:8px;font-size:14px;">'+escapeHtml(c.text || '')+'</div>';
    if(c.type === 'button') return '<button style="padding:8px 12px;border-radius:8px;">'+escapeHtml(c.text || 'Button')+'</button>';
    if(c.type === 'image') return '<img src="'+escapeHtml(c.src||'')+'" style="max-width:100%"/>';
    if(c.type === 'list') return '<div><strong>List bound to DB: '+escapeHtml(c.bindTable||'')+'</strong></div>';
    return '<div>'+escapeHtml(c.type)+'</div>';
  }).join('');
  frame.innerHTML = '<div style="font-weight:700;margin-bottom:8px">'+escapeHtml(project.title)+'</div>' + htmlFromProject;
}

// share link on load
function checkShareOnLoad(){
  const params = new URLSearchParams(window.location.search);
  const share = params.get('share');
  if(share){
    const s = loadState();
    const p = s.projects.find(x => x.published && x.published.urlId === share);
    if(!p) { alert('Shared project not found.'); return; }
    // set default device to phone
    currentDevice = 'phone';
    openPublicPreviewForProject(p);
  }
}

// initial bindings
document.getElementById('cta-explore').addEventListener('click', ()=>{
  const s = loadState();
  const published = s.projects.filter(p => p.published);
  if(published.length === 0) return alert('No published projects yet.');
  // open first published as demo
  currentDevice = 'phone';
  openPublicPreviewForProject(published[0]);
});

document.getElementById('preview-back').addEventListener('click', ()=>{
  document.getElementById('public-preview').classList.add('hidden');
  showLanding();
});

// init
(function init(){
  // if user info in session? we keep simple: not persisted
  renderUserInfo();
  renderProjects();
  checkShareOnLoad();
})();
