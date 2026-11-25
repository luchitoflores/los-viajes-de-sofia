export type Facing=1|-1;
export const arrivalFacing=(x:number,width:number):Facing=>x>width/2?-1:1;
/** Use the same ordered destinations as the map, never infer direction from filenames. */
export function travelDirection(order:string[],from:string,to:string):Facing{
 const a=order.indexOf(from),b=order.indexOf(to);return a>=0&&b>=0&&b<a?-1:1;
}
export function planetOrder(home:string[],stages:string[],catalog:string[]){return [...new Set([...home,...stages,...catalog])]}
/** Spatial order belongs to the catalog, independently of mission prerequisites. */
export function flightPath(order:string[],from:string,to:string){
 const a=order.indexOf(from),b=order.indexOf(to);if(a<0||b<0||a===b)return [];
 const step=b>a?1:-1,path:string[]=[];for(let i=a+step;i!==b;i+=step)path.push(order[i]);return path;
}
