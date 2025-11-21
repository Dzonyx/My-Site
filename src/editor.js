// src/editor.js
// Editor functions: create/open project, add components, render canvas, inspector, publish
const newProjectBtn = document.getElementById('new-project-btn');
const projectsList = document.getElementById('projects-list');
const projectEditor = document.getElementById('project-editor');
const editorEmpty = document.getElementById('editor-empty');
const projectTitleInput = document.getElementById('project-title');
const editorCanvas = document.getElementById('editor-canvas');
const inspector = document.getElementById('inspector');
const btnPublish = document.getElementById('btn-publish');
const btnPreview = document.getElementById('btn-preview');
const btnBack = document.getElementById('btn-back');
const deviceButtons = document.querySelectorAll('.device-switch button');

newProjectBtn.addEventListener('click', ()=>{
  if(!currentUser) {
    if(confirm('You must be signed in to create a project. Sign up now?')) openAuth('signup');
    return;
  }
  const title = prompt('New project title') || 'Untitled Project';
  const p = { id: genId('p'), ownerEmail: currentUser.email, title, components: [], db:{tables:[]}, created: Date.now(), published: null };
  const state = loadState();
  state.projects.push(p);
  saveState(state);
  renderProjects();
  openProject(p.id);
});

function renderProjects(){
  projectsList.innerHTML = '';
  const state = loadState();
  const own = currentUser ? state.projects.filter(p => p.ownerEmail === currentUser.email) : [];
  const others = state.projects.filter(p => p.ownerEmail !== (currentUser ? currentUser.email : '__') );
  const list = [...own, ...others];
  if(list.length === 0) {
    projectsList.innerHTML = '<div class="muted small">No projects yet. Create one!</div>';
    return;
  }
  const tpl = document.getElementById('project-item-tpl').content;
  list.forEach(proj => {
    const node = tpl.cloneNode(true);
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

let currentProject = null;
let currentDevice = 'phone';

function openProject(id){
  const state = loadState();
  const proj = state.projects.find(p => p.id === id);
  if(!proj) return alert('Project not found.');
  currentProject = JSON.parse(JSON.stringify(proj)); // work on a copy
  projectEditor.classList.remove('hidden');
  editorEmpty.classList.add('hidden');
  renderEditor();
  renderDBSection(currentProject);
}

function renderEditor(){
  projectTitleInput.value = currentProject.title;
  renderCanvas();
  renderInspector(null);
}

function renderCanvas(){
  editorCanvas.innerHTML = '';
  if(currentProject.components.length === 0){
    editorCanvas.innerHTML = '<div class="muted small">Canvas is empty. Add components from the left. Click components to edit text.</div>';
    return;
  }
  currentProject.components.forEach((c, idx) => {
    const el = document.createElement('div');
    el.className = 'canvas-item';
    el.dataset.idx = idx;
    el.style.padding = '8px';
    el.style.marginBottom = '8px';
    el.style.background = 'rgba(0,0,0,0.03)';
    el.style.borderRadius = '6px';
    if(c.type === 'button') el.innerHTML = '<button style="padding:8px 12px;border-radius:8px;">'+escapeHtml(c.text||'Button')+'</button>';
    else if(c.type === 'image') el.innerHTML = '<img src="'+escapeHtml(c.src||'')+'" style="max-width:100%;height:auto"/>';
    else if(c.type === 'list') el.innerHTML = '<div><strong>List bound to DB: '+escapeHtml(c.bindTable||'')+'</strong></div>';
    else el.textContent = c.text || 'Text element';
    el.addEventListener('click', ()=> selectCanvasItem(idx));
    editorCanvas.appendChild(el);
  });
}

function selectCanvasItem(idx){
  const comp = currentProject.components[idx];
  renderInspector(comp, idx);
}

function renderInspector(comp, idx){
  inspector.innerHTML = '';
  if(!comp) {
    inspector.innerHTML = '<div class="muted small">Select component to edit.</div>';
    return;
  }
  if(comp.type === 'text' || comp.type === 'button') {
    const input = document.createElement('input'); input.className='input'; input.value = comp.text||'';
    const save = document.createElement('button'); save.className='btn primary'; save.textContent='Save';
    save.addEventListener('click', ()=>{
      comp.text = input.value;
      persistCurrentProject();
      renderCanvas();
      inspector.innerHTML = '<div class="muted small">Saved.</div>';
    });
    inspector.appendChild(input); inspector.appendChild(document.createElement('br')); inspector.appendChild(save);
  } else if(comp.type === 'image') {
    const input = document.createElement('input'); input.className='input'; input.value = comp.src||''; input.placeholder='Image URL';
    const save = document.createElement('button'); save.className='btn primary'; save.textContent='Save';
    save.addEventListener('click', ()=>{
      comp.src = input.value;
      persistCurrentProject();
      renderCanvas();
      inspector.innerHTML = '<div class="muted small">Saved.</div>';
    });
    inspector.appendChild(input); inspector.appendChild(document.createElement('br')); inspector.appendChild(save);
  } else if(comp.type === 'list') {
    const sel = document.createElement('select');
    sel.className = 'input';
    const tables = (currentProject.db && currentProject.db.tables) ? currentProject.db.tables : [];
    sel.innerHTML = '<option value="">-- bind table --</option>' + tables.map((t,i)=>'<option value="'+i+'">'+escapeHtml(t.name)+'</option>').join('');
    const save = document.createElement('button'); save.className='btn primary'; save.textContent='Bind';
    save.addEventListener('click', ()=>{
      const selIdx = sel.value;
      if(selIdx==='') return alert('Choose a table.');
      comp.bindTable = currentProject.db.tables[selIdx].name;
      persistCurrentProject();
      renderCanvas();
      inspector.innerHTML = '<div class="muted small">Bound.</div>';
    });
    inspector.appendChild(sel); inspector.appendChild(document.createElement('br')); inspector.appendChild(save);
  }
}

function persistCurrentProject(){
  const state = loadState();
  const idx = state.projects.findIndex(p => p.id === currentProject.id);
  if(idx === -1) {
    // save as new
    state.projects.push(currentProject);
  } else {
    state.projects[idx] = currentProject;
  }
  saveState(state);
  renderProjects();
}

document.querySelectorAll('.component').forEach(c => {
  c.addEventListener('click', ()=> {
    if(!currentUser) return alert('Sign in to edit projects.');
    if(!currentProject) return alert('Open a project first.');
    const type = c.dataset.type;
    if(type === 'image') {
      const url = prompt('Image URL') || '';
      const comp = { id: genId('c'), type, src: url };
      currentProject.components.push(comp);
    } else {
      const comp = { id: genId('c'), type, text: type==='text' ? 'Sample text' : 'Click me' };
      currentProject.components.push(comp);
    }
    persistCurrentProject();
    renderEditor();
  });
});

function renameProject(id){
  const newTitle = prompt('New project title') || null;
  if(!newTitle) return;
  const state = loadState();
  const p = state.projects.find(x=>x.id===id);
  if(!p) return;
  p.title = newTitle;
  saveState(state);
  renderProjects();
  if(currentProject && currentProject.id === id) currentProject.title = newTitle;
}

function deleteProject(id){
  if(!confirm('Delete project? This cannot be undone.')) return;
  const state = loadState();
  state.projects = state.projects.filter(p => p.id !== id);
  saveState(state);
  if(currentProject && currentProject.id === id) {
    currentProject = null;
    projectEditor.classList.add('hidden');
    editorEmpty.classList.remove('hidden');
  }
  renderProjects();
}

function publishProject(id){
  const state = loadState();
  const p = state.projects.find(x=>x.id===id);
  if(!p) return alert('Project not found.');
  p.published = { urlId: genId('share'), date: Date.now() };
  saveState(state);
  renderProjects();
  const url = window.location.href.split('?')[0] + '?share=' + p.published.urlId;
  prompt('Project published! Share this link:', url);
}

// preview/back/back to projects
btnPreview.addEventListener('click', ()=>{
  if(!currentProject) return alert('Open a project first.');
  openPublicPreviewForProject(currentProject);
});
btnBack.addEventListener('click', ()=>{
  currentProject = null;
  projectEditor.classList.add('hidden');
  editorEmpty.classList.remove('hidden');
});

// device switching
deviceButtons.forEach(b=>{
  b.addEventListener('click', ()=>{
    document.querySelectorAll('.device-switch button').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    currentDevice = b.dataset.device;
  });
});
