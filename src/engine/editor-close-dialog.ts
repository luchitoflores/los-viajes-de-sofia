export function editorCloseDialog():Promise<'save'|'discard'|'cancel'>{return new Promise(resolve=>{
 const dialog=document.createElement('dialog');dialog.style.cssText='max-width:440px;padding:24px;border:2px solid #b99762;border-radius:12px;background:#fff5df;color:#24394c;z-index:2000';
 dialog.innerHTML='<h2>Cambios en el editor</h2><p>¿Quieres conservar los cambios que hiciste?</p><div style="display:flex;gap:8px;flex-wrap:wrap"><button data-exit="save">Guardar y volver</button><button data-exit="discard">Descartar y volver</button><button data-exit="cancel">Seguir editando</button></div>';
 const finish=(value:'save'|'discard'|'cancel')=>{dialog.close();dialog.remove();resolve(value)};
 dialog.querySelectorAll<HTMLButtonElement>('[data-exit]').forEach(b=>b.onclick=()=>finish(b.dataset.exit as 'save'|'discard'|'cancel'));dialog.oncancel=e=>{e.preventDefault();finish('cancel')};document.body.append(dialog);dialog.showModal();
})}
