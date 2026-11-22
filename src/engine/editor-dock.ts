/** Reubica los controles existentes sin duplicar IDs ni perder sus eventos. */
export function createEditorDock(){
  const nodes=[document.querySelector<HTMLElement>('#editor .editor-bar')!,document.getElementById('editor-tools')!];
  const homes=nodes.map(node=>{const marker=document.createComment('editor-control-home');node.before(marker);return marker});
  return {
    restore(){nodes.forEach((node,i)=>homes[i].after(node))},
    mount(slot:HTMLElement){slot.append(...nodes)}
  };
}
