export async function jsonResource(path:string,optional=false):Promise<any>{
 const response=await fetch(path),text=await response.text();
 const html=/^\s*</.test(text);
 if(optional&&(response.status===404||html))return undefined;
 if(!response.ok||html)throw Error(`No se pudo cargar ${path}: ${html?'el servidor devolvió HTML en lugar del archivo JSON':'HTTP '+response.status}.`);
 try{return JSON.parse(text)}catch{throw Error(`El archivo ${path} no contiene JSON válido.`)}
}
