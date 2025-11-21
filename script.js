// script.js - frontend-only demo with localStorage persistence

// Helpers
const $ = (sel) => document.querySelector(sel);
const qs = (sel, el=document) => el.querySelector(sel);

const STORAGE_KEY = 'nocode_demo_v1';

// default app state
function loadState(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(!raw) {
    const defaultState = {
      users: [
        // admin user (preseeded)
        { email: 'nocodebuilder@hotmail.com', password: 'Nikolapro1!', name: 'Admin', role: 'admin', id: 'u_admin' }
      ],
      projects: [] // {id, ownerEmail, title, components[], published: {urlId, date}}
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
    return defaultState;
  }
  return JSON.parse(raw);
}
function saveState(state){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
let state = loadState();

// UI elements
const authModal = $('#auth-modal');
const authTitle = $('#auth-title');
const authForm = $('#auth-form');
const authEmail = $('#auth-email');
const authPassword = $('#auth-password');
const authClose = $('#auth-close');
const switchToSignup = $('#switch-to-signup');

const btnLogin = $('#btn-login');
const btnSignup = $('#btn-signup');
const ctaStart = $('#cta-start');
const ctaExplore = $('#cta-explore');

const landing = $('#landing');
const dashboard = $('#dashboard');
const publicPreview = $('#public-preview');

const newProjectBtn = $('#new-project-btn');
const projectsList = $('#projects-list');
const projectEditor = $('#project-editor');
const editorEmpty = $('#editor-empty');
const projectTitleInput = $('#project-title');
const editorCanvas = $('#editor-canvas');
const inspector = $('#inspector');
const btnPublish = $('#btn-publish');
const btnPreview = $('#btn-preview');
const btnBack = $('#btn-back');
const btnLogout = $('#btn-logout');
const adminPanel = $('#admin-panel');
const adminSeed = $('#admin-seed');
const adminClear = $('#admin-clear');
const userEmailDisplay = $('#user-email-display');
const userRoleDisplay = $('#user-role-display');

const previewTitle = $('#preview-title');
const framePhone = $('#frame-phone');
const frameTablet = $('#frame-tablet');
const frameDesktop = $('#frame-desktop');
const previewBack = $('#preview-back');

// Template
const tplProject = $('#project-item-tpl').content;

// App runtime
let currentUser = null;
let currentProject = null;

// Utility: generate id
function genId(prefix='id') {
  return prefix + '_' + Math.random().toString(36).slice(2,9);
}

// Auth modal handlers
function openAuth(mode='login'){
  authTitle.textContent = (mode === 'login') ? 'Log in' : 'Sign up';
  $('#auth-submit').textContent = (mode === 'login') ? 'Log in' : 'Sign up';
  authForm.dataset.mode = mode;
  authModal.classList.remove('hidden');
  authEmail.focus();
}
function closeAuth(){ authModal.classList.add('hidden'); authForm.reset(); }

authClose.addEventListener('click', closeAuth);
btnLogin.addEventListener('click', ()=> openAuth('login'));
btnSignup.addEventListener('click', ()=> openAuth('signup'));
ctaStart.addEventListener('click', ()=> openAuth('signup'));
switchToSignup.addEventListener('click', ()=> {
  const mode = authForm.dataset.mode === 'signup' ? 'login' : 'signup';
  openAuth(mode);
});

// Auth submit
authForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const mode = authForm.dataset.mode || 'login';
  const email = authEmail.value.trim().toLowerCase();
  const password = authPassword.value;
  if(!email || !password) return alert('Please enter email and password.');

  state = loadState();

  if(mode === 'login'){
    const user = state.users.find(u => u.email === email && u.password === password);
    if(!user) return alert('Invalid credentials.');
    currentUser = user;
    afterLogin();
  } else {
    // signup
    if(state.users.find(u => u.email === email)) return alert('Email already registered. Please log in.');
    const newUser = { email, password, name: email.split('@')[0], role: 'user', id: genId('u') };
    state.users.push(newUser);
    saveState(state);
    currentUser = newUser;
    afterLogin();
  }
});

// After login
function afterLogin(){
  closeAuth();
  showDashboard();
  renderUserInfo();
  renderProjects();
  alert(`Welcome back, ${currentUser.name}!`);
}

// Show dashboard
function showDashboard(){
  landing.classList.add('hidden');
  publicPreview.classList.add('hidden');
  dashboard.classList.remove('hidden');
  // admin panel visible?
  if(currentUser && currentUser.role === 'admin') adminPanel.classList.remove('hidden');
  else adminPanel.classList.add('hidden');
  renderProjects();
}

// Show landing
function showLanding(){
  dashboard.classList.add('hidden');
  publicPreview.classList.add('hidden');
  landing.classList.remove('hidden');
  currentProject = null;
  renderUserInfo();
}

// Logout
btnLogout.addEventListener('click', ()=>{
  currentUser = null;
  showLanding();
  alert('Logged out.');
});

// Render user info
function renderUserInfo(){
  userEmailDisplay.textContent = currentUser ? currentUser.email : 'Not signed in';
  userRoleDisplay.textContent = currentUser ? (currentUser.role || 'user') : 'visitor';
}

// Projects rendering
function renderProjects(){
  projectsList.innerHTML = '';
  state = loadState();
  // show projects owned by user first, then public projects
  const own = currentUser ? state.projects.filter(p => p.ownerEmail === currentUser.email) : [];
  const others = state.projects.filter(p => p.ownerEmail !== (currentUser ? currentUser.email : '__') );
  const list = [...own, ...others];
  if(list.length === 0) {
    projectsList.innerHTML = `<div class="muted small">No projects yet. Create one!</div>`;
    return;
  }
  list.forEach(proj => {
    const node = tplProject.cloneNode(true);
    const el = node.querySelector('.project-item');
    el.dataset.id = proj.id;
    el.querySelector('.title').textContent = proj.title + (proj.published ? ' (published)' : '');
    el.querySelector('.open').addEventListener('click', ()=> openProject(proj.id));
    el.querySelector('.edit').addEventListener('click', ()=> renameProject(proj.id));
    el.querySelector('.publish').addEventListener('click', ()=> publishProject(proj.id));
    el.querySelector('.del').addEventListener('click', ()=> deleteProject(proj.id));
    projectsList.appendChild(node);
  });
}

newProjectBtn.addEventListener('click', ()=>{
  if(!currentUser) {
    if(confirm('You must be signed in to create a project. Sign up now?')) openAuth('signup');
    return;
  }
  const title = prompt('New project title') || 'Untitled Project';
  const p = { id: genId('p'), ownerEmail: currentUser.email, title, components: [], created: Date.now(), published: null };
  state = loadState();
  state.projects.push(p);
  saveState(state);
  renderProjects();
  openProject(p.id);
});

function openProject(id){
  state = loadState();
  const proj = state.projects.find(p => p.id === id);
  if(!proj) return alert('Project not found.');
  currentProject = proj;
  projectEditor.classList.remove('hidden');
  editorEmpty.classList.add('hidden');
  renderEditor();
}

function renderEditor(){
  projectTitleInput.value = currentProject.title;
  // render components into canvas
  editorCanvas.innerHTML = '';
  if(currentProject.components.length === 0){
    editorCanvas.innerHTML = `<div class="muted small">Canvas is empty. Add components from the left. Click components to edit text.</div>`;
  } else {
    currentProject.components.forEach((c, idx) => {
      const el = document.createElement('div');
      el.className = 'canvas-item';
      el.dataset.idx = idx;
      el.style.padding = '8px';
      el.style.marginBottom = '8px';
      el.style.background = 'rgba(0,0,0,0.03)';
      el.style.borderRadius = '6px';
      el.textContent = `${c.type.toUpperCase()}: ${c.text || ''}`;
      el.addEventListener('click', ()=> selectCanvasItem(idx));
      editorCanvas.appendChild(el);
    });
  }
}

function selectCanvasItem(idx){
  const comp = currentProject.components[idx];
  inspector.innerHTML = '';
  const input = document.createElement('input'); input.className='input'; input.value = comp.text || '';
  const save = document.createElement('button'); save.className='btn primary'; save.textContent='Save';
  save.addEventListener('click', ()=>{
    comp.text = input.value;
    // persist
    state = loadState();
    const p = state.projects.find(x=>x.id===currentProject.id);
    p.components = currentProject.components;
    saveState(state);
    renderEditor();
    inspector.innerHTML = '<div class="muted small">Saved.</div>';
  });
  inspector.appendChild(input); inspector.appendChild(document.createElement('br')); inspector.appendChild(save);
}

qsAll = (sel, root=document) => Array.from(root.querySelectorAll(sel));
document.querySelectorAll('.component').forEach(c => {
  c.addEventListener('click', ()=> {
    if(!currentUser) return alert('Sign in to edit projects.');
    if(!currentProject) return alert('Open a project first.');
    const type = c.dataset.type;
    if(c.textContent.toLowerCase().includes('coming')) return alert('This component is coming soon.');
    const comp = { id: genId('c'), type, text: type==='text' ? 'Sample text' : type==='button' ? 'Click me' : '' };
    currentProject.components.push(comp);
    state = loadState();
    const p = state.projects.find(x=>x.id===currentProject.id);
    p.components = currentProject.components;
    saveState(state);
    renderEditor();
  });
});

// Rename
function renameProject(id){
  const newTitle = prompt('New project title') || null;
  if(!newTitle) return;
  state = loadState();
  const p = state.projects.find(x=>x.id===id);
  if(!p) return;
  p.title = newTitle;
  saveState(state);
  renderProjects();
  if(currentProject && currentProject.id === id) currentProject.title = newTitle;
}

// Delete
function deleteProject(id){
  if(!confirm('Delete project? This cannot be undone.')) return;
  state = loadState();
  state.projects = state.projects.filter(p => p.id !== id);
  saveState(state);
  if(currentProject && currentProject.id === id) {
    currentProject = null;
    projectEditor.classList.add('hidden');
    editorEmpty.classList.remove('hidden');
  }
  renderProjects();
}

// Publish (generate share id and set published metadata)
function publishProject(id){
  state = loadState();
  const p = state.projects.find(x=>x.id===id);
  if(!p) return alert('Project not found.');
  // create urlId
  p.published = { urlId: genId('share'), date: Date.now() };
  saveState(state);
  renderProjects();
  const url = window.location.href.split('?')[0] + '?share=' + p.published.urlId;
  prompt('Project published! Share this link:', url);
}

// Preview (open public preview from currentProject)
btnPreview.addEventListener('click', ()=>{
  if(!currentProject) return alert('Open a project first.');
  openPublicPreviewForProject(currentProject);
});

// Back to list
btnBack.addEventListener('click', ()=>{
  currentProject = null;
  projectEditor.classList.add('hidden');
  editorEmpty.classList.remove('hidden');
});

// Admin actions
adminSeed.addEventListener('click', ()=>{
  if(!currentUser || currentUser.role !== 'admin') return alert('Admin only.');
  state = loadState();
  // create some demo public projects
  const demo1 = { id: genId('p'), ownerEmail: 'demo@user.com', title: 'Weather App (Demo)', components: [{type:'text', text:'Weather today: Sunny'}, {type:'button', text:'Refresh'}], published: {urlId: genId('share'), date: Date.now()}};
  const demo2 = { id: genId('p'), ownerEmail: 'demo@user.com', title: 'Todo App (Demo)', components: [{type:'text', text:'Buy milk'}, {type:'button', text:'Add task'}], published: {urlId: genId('share'), date: Date.now()}};
  state.projects.push(demo1, demo2);
  saveState(state);
  renderProjects();
  alert('Seeded demo projects.');
});
adminClear.addEventListener('click', ()=>{
  if(!currentUser || currentUser.role !== 'admin') return alert('Admin only.');
  if(!confirm('Clear all users (except admin) and projects?')) return;
  state = loadState();
  state.users = state.users.filter(u => u.role === 'admin'); // keep admin
  state.projects = [];
  saveState(state);
  renderProjects();
  alert('Cleared data.');
});

// Open public preview based on project object
function openPublicPreviewForProject(project){
  dashboard.classList.add('hidden');
  landing.classList.add('hidden');
  publicPreview.classList.remove('hidden');
  previewTitle.textContent = project.title;
  renderPreviewFrames(project);
}

// Render preview into frames
function renderPreviewFrames(project){
  const htmlFromProject = project.components.map(c => {
    if(c.type === 'text') return `<div style="padding:8px;font-size:14px;">${escapeHtml(c.text || '')}</div>`;
    if(c.type === 'button') return `<button style="padding:8px 12px;border-radius:8px;">${escapeHtml(c.text || 'Button')}</button>`;
    return `<div style="padding:8px;font-size:13px;color:#666;">${escapeHtml(c.type)}</div>`;
  }).join('');
  framePhone.innerHTML = `<div style="font-weight:700;margin-bottom:8px">${escapeHtml(project.title)}</div>${htmlFromProject}`;
  frameTablet.innerHTML = framePhone.innerHTML;
  frameDesktop.innerHTML = framePhone.innerHTML;
}
function escapeHtml(s=''){ return String(s).replace(/[&<>"']/g, function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];}); }

previewBack.addEventListener('click', ()=>{
  // go back to landing
  publicPreview.classList.add('hidden');
  showLanding();
});

// URL share handling: if ?share=ID present, show public preview
function checkShareLinkOnLoad(){
  const params = new URLSearchParams(window.location.search);
  const share = params.get('share');
  if(share){
    state = loadState();
    const p = state.projects.find(x => x.published && x.published.urlId === share);
    if(!p) {
      alert('Shared project not found or unpublished.');
      return;
    }
    openPublicPreviewForProject(p);
  }
}

// helpers for querySelectorAll alias
function qsAll(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }

// initially
renderUserInfo();
checkShareLinkOnLoad();

// Explore public projects button
ctaExplore.addEventListener('click', ()=>{
  // show landing but open projects list as if guest clicked explore
  if(state.projects.length === 0) {
    alert('No public projects yet. Admin can seed demo projects.');
    return;
  }
  // show a simple list of published projects and open first
  const published = state.projects.filter(p => p.published);
  if(published.length === 0) return alert('No published projects yet.');
  openPublicPreviewForProject(published[0]);
});

// when clicking brand go home
$('#go-home').addEventListener('click', (e)=>{ e.preventDefault(); showLanding(); });

// Open project via share: create small function
window.openProjectById = function(id){
  const p = state.projects.find(x=>x.id===id);
  if(p) openProject(id);
};

// Initial render of projects (if logged in)
renderProjects();
