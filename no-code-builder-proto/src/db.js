// src/db.js
// Simple per-project DB operations (in-memory edit persisted to state)
function renderDBSection(project) {
  const el = document.getElementById('db-section');
  el.innerHTML = '';
  if(!project.db) project.db = { tables: [] };
  const tpl = document.createElement('div');

  const list = document.createElement('div');
  project.db.tables.forEach((t, idx) => {
    const row = document.createElement('div');
    row.style.marginBottom = '8px';
    row.innerHTML = '<strong>' + escapeHtml(t.name) + '</strong> — rows: ' + (t.rows ? t.rows.length : 0) +
      ' <button class="btn tiny" data-idx="'+idx+'">Open</button>';
    list.appendChild(row);
  });

  const addBtn = document.createElement('button');
  addBtn.className = 'btn full';
  addBtn.textContent = '+ New table';
  addBtn.addEventListener('click', ()=> {
    const name = prompt('Table name') || 'Table';
    project.db.tables.push({ name, rows: [] });
    persistCurrentProject();
    renderDBSection(project);
  });

  tpl.appendChild(list);
  tpl.appendChild(addBtn);
  el.appendChild(tpl);

  // wire open buttons
  Array.from(el.querySelectorAll('button[data-idx]')).forEach(b=>{
    b.addEventListener('click', ()=> {
      const idx = b.dataset.idx;
      openTableEditor(project, idx);
    });
  });
}

function openTableEditor(project, idx) {
  const table = project.db.tables[idx];
  const name = prompt('Edit table name', table.name) || table.name;
  table.name = name;
  // simple row add
  if(!table.rows) table.rows = [];
  if(confirm('Add a sample row to this table?')) {
    table.rows.push({ id: genId('r'), data: { sample: 'value' }});
  }
  persistCurrentProject();
  renderDBSection(project);
}
