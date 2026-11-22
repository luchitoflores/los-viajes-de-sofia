export function setEditorChoices(select:HTMLSelectElement,choices:{value:string;label:string}[]){
 const previous=select.value;select.replaceChildren(...choices.map(c=>new Option(c.label,c.value)));
 if(choices.some(c=>c.value===previous))select.value=previous;
}
