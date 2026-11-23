import {compactSceneControls} from './compact-editor-controls';
/** Disposición única: barra fuera del lienzo y biblioteca/inspector en el lateral. */
export function mountSceneWorkspace(root:HTMLElement,resize:()=>void){
 document.getElementById('scene-place-resource')?.remove();
 const stage=document.getElementById('stage')!,bar=document.createElement('section');bar.id='core-canvas-toolbar';bar.setAttribute('aria-label','Herramientas de la escena');stage.before(bar);
 const actions=document.querySelector<HTMLElement>('#core-editor-tools .editor-bar')!;bar.append(actions);
 const undo=bar.querySelector<HTMLButtonElement>('[data-e="undo"]')!;undo.textContent='Deshacer';undo.title='Deshacer el último cambio';
 const redo=document.createElement('button');redo.id='scene-redo';redo.textContent='Rehacer';redo.onclick=()=>window.dispatchEvent(new Event('sofia-editor-redo'));undo.after(redo);
 // Los botones añadidos no forman parte del dock original al volver a cargar una escena.
 const original=actions.querySelector('.editor-bar-actions')!;original.querySelectorAll('#scene-redo').forEach((b,i)=>{if(i>0)b.remove()});
 const tools=root.querySelector('.scene-tool-buttons');if(tools)bar.append(tools);
 const row=document.createElement('div');row.className='scene-workspace-actions';
 const selected=document.createElement('span');selected.id='scene-current-selection';selected.setAttribute('role','status');
 const del=document.createElement('button');del.id='scene-delete';del.textContent='Eliminar selección';del.onclick=()=>{const label=document.getElementById('editor')!.dataset.selectionLabel??'Sin selección';if(label==='Sin selección')return;if(confirm('¿Eliminar «'+label+'» de esta escena? Puedes recuperarlo con Deshacer.'))document.getElementById('delete-selection')!.click()};row.append(selected,del);
 const trial=document.getElementById('core-test-scene')!;row.append(trial);bar.append(row);
 compactSceneControls(bar);
 const editor=document.getElementById('editor')!;const sync=()=>{const label=editor.dataset.selectionLabel??'Sin selección';selected.textContent='Selección: '+label;del.disabled=label==='Sin selección'};sync();const observer=new MutationObserver(sync);observer.observe(editor,{attributes:true,attributeFilter:['data-selection-label','data-selected-object']});
 const cleanup=new MutationObserver(()=>{if(!bar.isConnected){observer.disconnect();cleanup.disconnect()}});cleanup.observe(stage.parentElement!,{childList:true});
 const panel=document.getElementById('core-editor-tools') as HTMLDetailsElement;panel.querySelector('summary')!.textContent='1. Biblioteca y propiedades de la selección';
 const toolbox=document.getElementById('scene-toolbox')!;const state=document.getElementById('scene-edit-status')!;bar.prepend(state);const extras=document.createElement('details');extras.innerHTML='<summary>Zonas y conversaciones de la selección</summary>';panel.before(extras);extras.append(toolbox);extras.before(panel);
 const name=document.getElementById('object-name') as HTMLInputElement,kind=document.getElementById('object-kind')!;name.placeholder='Ej.: Platón junto al fuego';const place=document.createElement('button');place.id='scene-place-resource';place.textContent='Colocar este recurso en el escenario';place.onclick=()=>document.querySelector<HTMLButtonElement>('[data-edit-mode=object]')!.click();kind.closest('label')!.after(place);kind.closest('label')!.firstChild!.textContent='Recurso que vas a colocar';
 const help=document.getElementById('edit-help')!;help.textContent='Elige un recurso, pulsa Añadir objeto / NPC y toca una vez el escenario. Después vuelves a Seleccionar. Para quitarlo: selecciónalo y pulsa Eliminar selección arriba.';
 const imageInput=document.getElementById('core-image')!,images=imageInput.closest('details')!;images.open=false;images.querySelector('summary')!.textContent='2. Importar una imagen nueva';panel.after(images);

 const settings=document.getElementById('core-scene-settings')!;settings.textContent='Fondo y configuración de la escena';
 const sizes=new ResizeObserver(()=>{document.documentElement.style.setProperty('--scene-toolbar-height',bar.getBoundingClientRect().height+'px');resize()});sizes.observe(bar);requestAnimationFrame(resize);
}
