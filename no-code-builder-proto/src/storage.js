// src/storage.js
// Handles persistence in localStorage and seeding admin account
const STORAGE_KEY = 'nocode_demo_v2';

function defaultState() {
  return {
    users: [
      // Admin preseeded (kept in code only; UI does not expose credentials list)
      { email: 'nocodebuilder@hotmail.com', password: 'Nikolapro1!', name: 'Admin', role: 'admin', id: 'u_admin' }
    ],
    projects: [] // {id, ownerEmail, title, components:[], db:{tables:[]}, published: {urlId, date}}
  };
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if(!raw) {
    const s = defaultState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    return s;
  }
  try {
    return JSON.parse(raw);
  } catch(e) {
    console.error('Failed to parse state, resetting.', e);
    const s = defaultState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    return s;
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function clearAllButAdmin() {
  const s = loadState();
  s.users = s.users.filter(u => u.role === 'admin');
  s.projects = [];
  saveState(s);
}

function seedDemoProjects() {
  const s = loadState();
  const demo1 = { id: genId('p'), ownerEmail: 'demo@user.com', title: 'Weather App (Demo)', components: [{type:'text', text:'Weather today: Sunny'}, {type:'button', text:'Refresh'}], db:{tables:[]}, published: {urlId: genId('share'), date: Date.now()}};
  const demo2 = { id: genId('p'), ownerEmail: 'demo@user.com', title: 'Todo App (Demo)', components: [{type:'text', text:'Buy milk'}, {type:'button', text:'Add task'}], db:{tables:[]}, published: {urlId: genId('share'), date: Date.now()}};
  s.projects.push(demo1, demo2);
  saveState(s);
}
