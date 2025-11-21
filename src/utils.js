// src/utils.js
function genId(prefix='id') {
  return prefix + '_' + Math.random().toString(36).slice(2,9);
}

function escapeHtml(s=''){ return String(s).replace(/[&<>"']/g, function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];}); }
