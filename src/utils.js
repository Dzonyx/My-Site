function genId(prefix='id'){ return prefix+'_'+Math.random().toString(36).substr(2,9);}
function downloadBlob(filename, content, type='text/html'){ const a=document.createElement('a'); const blob=new Blob([content],{type}); a.href=URL.createObjectURL(blob); a.download=filename; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
