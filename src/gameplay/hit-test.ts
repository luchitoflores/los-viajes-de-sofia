export function hitZone(point:{x:number;y:number},zones:{id:string;x:number;y:number;width:number;height:number}[]){
 return zones.filter(z=>point.x>=z.x&&point.x<=z.x+z.width&&point.y>=z.y&&point.y<=z.y+z.height).sort((a,b)=>a.width*a.height-b.width*b.height)[0]?.id;
}

export function canvasPoint(client:{x:number;y:number},rect:{left:number;top:number;width:number;height:number},view:{width:number;height:number}){return{x:(client.x-rect.left)/rect.width*view.width,y:(client.y-rect.top)/rect.height*view.height}}
