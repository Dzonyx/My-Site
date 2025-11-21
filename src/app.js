window.onload=()=>{
const user=Auth.currentUser();
if(user)loadDashboard(user);else showLogin();
checkShareOnLoad();
};

function showLogin(){
document.getElementById('app').innerHTML=`<div id="loginBox"><h2>Login / Sign up</h2>
<input id="em" placeholder="email"><input id="pw" placeholder="password" type="password">
<div style="display:flex;gap:8px"><button id="lgn">Login</button><button id="sgn" class="secondary">Sign up</button></div></div>`;
document.getElementById('lgn').onclick=()=>{const u=Auth.login(document.getElementById('em').value,document.getElementById('pw').value);if(u)loadDashboard(u);else alert('Wrong credentials');};
document.getElementById('sgn').onclick=()=>{const u=Auth.signup(document.getElementById('em').value,document.getElementById('pw').value);if(u)loadDashboard(u);else alert('Could not create user (exists?)');};
}

function loadDashboard(user){
document.getElementById('app').innerHTML=`<div class="toolbar">
<div class="controls">
<button id="create">New Project</button>
<button id="open">Open Project</button>
<button id="publish" class="secondary">Publish</button>
<button id="export" class="secondary">Export HTML</button>
<button id="full" class="secondary">Fullscreen</button>
<button id="snapBtn" class="secondary">Snap: OFF</button>
</div>
<div class="controls">
<button id="addText">Add Text</button><button id="addBtn">Add Button</button><button id="addImg">Add Image</button>
</div>
</div>
<div id="projectsList" class="project-list"></div>
<div id="editorArea"><div id="editor-canvas-wrapper"></div></div>
<div id="inspector" class="inspector"></div>`;

document.getElementById('create').onclick=()=>{const name=prompt('Project name')||('Project '+(Object.keys(Storage.users[user.email].projects||[]).length+1));const p={id:genId('p'),name:name,items:[],published:null};Storage.users[user.email].projects.push(p);Storage.save();renderProjects(user);openProject(p);};
document.getElementById('open').onclick=()=>renderProjects(user);
document.getElementById('publish').onclick=()=>{Editor.publishProject();};
document.getElementById('export').onclick=()=>{Editor.exportProjectAsHTML();};
document.getElementById('full').onclick=()=>toggleFullscreen();
document.getElementById('snapBtn').onclick=()=>Editor.toggleSnap();
document.getElementById('addText').onclick=()=>{Editor.addItem('text');};
document.getElementById('addBtn').onclick=()=>{Editor.addItem('button');};
document.getElementById('addImg').onclick=()=>{const url=prompt('Image URL');if(!url)return;if(!currentProject)return alert('Open project first');const it={id:genId('it'),type:'image',src:url,left:50,top:50,width:140,height:90};currentProject.items.push(it);persistCurrentProject();renderProjects(user);renderCanvasItems();};
renderProjects(user);
}

function renderProjects(user){
const list=Storage.users[user.email].projects||[];
const container=document.getElementById('projectsList');
container.innerHTML='<h3>Your Projects</h3>';
list.forEach(p=>{const div=document.createElement('div');div.className='project-item-row';div.innerHTML=`<strong>${p.name}</strong> <button class="openBtn">Open</button> <button class="dupBtn">Duplicate</button>`;container.appendChild(div);div.querySelector('.openBtn').onclick=()=>openProject(p);div.querySelector('.dupBtn').onclick=()=>{const copy=JSON.parse(JSON.stringify(p));copy.id=genId('p');copy.name=p.name+' (copy)';Storage.users[user.email].projects.push(copy);Storage.save();renderProjects(user);};});
}

let currentProject=null;
function openProject(p){currentProject=p;document.getElementById('editor-canvas-wrapper').innerHTML='';Editor.init();Editor.renderCanvas();renderInspectorUI();}
function persistCurrentProject(){const u=Auth.currentUser();if(!u)return;const idx=Storage.users[u.email].projects.findIndex(x=>x.id===currentProject.id);if(idx===-1)Storage.users[u.email].projects.push(currentProject);else Storage.users[u.email].projects[idx]=currentProject;Storage.save();}
function selectItemByIdx(idx){Editor.selectedIdx=parseInt(idx);showInspectorForItem(currentProject.items[idx],idx);}
function showInspectorForItem(item,idx){const ins=document.getElementById('inspector');ins.classList.add('visible');ins.innerHTML=`<h4>Inspector</h4>
<div class="small">Type: ${item.type}</div>
<label>Text</label><input id="insText" value="${(item.text||'')}"/>
<label>Color</label><input id="insColor" type="color" value="${item.color||'#111'}"/>
<label>Background</label><input id="insBg" type="color" value="${item.bg||'#fff'}"/>
<label>Width</label><input id="insW" type="number" value="${item.width||120}"/>
<label>Height</label><input id="insH" type="number" value="${item.height||40}"/>
<div class="action-row">
<button id="saveItem">Save</button>
<button id="dupItem" class="secondary">Duplicate</button>
<button id="delItem" class="secondary">Delete</button>
</div>
<div class="muted">Drag items to move them. Snap optional.</div>`;
document.getElementById('saveItem').onclick=()=>{item.text=document.getElementById('insText').value;item.color=document.getElementById('insColor').value;item.bg=document.getElementById('insBg').value;item.width=parseInt(document.getElementById('insW').value)||item.width;item.height=parseInt(document.getElementById('insH').value)||item.height;persistCurrentProject();Editor.renderCanvas();};
document.getElementById('dupItem').onclick=()=>Editor.duplicateSelected();
document.getElementById('delItem').onclick=()=>{Editor.deleteSelected();ins.classList.remove('visible');};
}
function hideInspector(){document.getElementById('inspector').classList.remove('visible');}
function toggleFullscreen(){const root=document.getElementById('editorArea');if(!document.fullscreenElement){root.requestFullscreen().catch(()=>{root.classList.add('fullscreen-editor');});}else{document.exitFullscreen().catch(()=>{root.classList.remove('fullscreen-editor');});}}
// share link
function checkShareOnLoad(){const params=new URLSearchParams(window.location.search);const share=params.get('share');if(share){const p=Storage.findPublished(share);if(!p)return alert('Shared project not found.');const html=generatePreviewHTML(p);const w=window.open('','_blank');w.document.write(html);}}
function generatePreviewHTML(p){const items=(p.items||[]).map(it=>{if(it.type==='image')return`<img src="${it.src||''}" style="position:absolute;left:${it.left}px;top:${it.top}px;width:${it.width}px;height:${it.height}px"/>`;if(it.type==='button')return`<div style="position:absolute;left:${it.left}px;top:${it.top}px;width:${it.width}px;height:${it.height}px">${it.text}</div>`;return`<div style="position:absolute;left:${it.left}px;top:${it.top}px">${it.text}</div>`;}).join('\n');return `<!doctype html><html><head><meta charset="utf-8"><title>${p.name}</title><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div style="position:relative;width:375px;height:667px;border:1px solid #ddd">${items}</div></body></html>`;}
