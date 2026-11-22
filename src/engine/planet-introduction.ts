/** Presentación de cámara compartida; no cambia física, personajes ni destinos. */
export interface PlanetIntroductionSettings {holdMs:number;zoomMs:number}
export class PlanetIntroduction {
  private elapsed=0;
  finished=false;
  private settings:PlanetIntroductionSettings;
  private pose:(close:number)=>void;
  private complete:()=>void;
  private reduced:boolean;
  constructor(settings:PlanetIntroductionSettings,pose:(close:number)=>void,complete:()=>void,reduced=false){this.settings=settings;this.pose=pose;this.complete=complete;this.reduced=reduced;this.pose(0)}
  step(delta:number){
    if(this.finished)return;
    this.elapsed+=Math.max(0,delta);
    const hold=this.reduced?Math.min(this.settings.holdMs,300):this.settings.holdMs;
    const duration=this.reduced?0:this.settings.zoomMs;
    const t=this.elapsed<hold?0:duration?Math.min(1,(this.elapsed-hold)/duration):1;
    this.pose(t*t*(3-2*t));
    if(t===1)this.finish();
  }
  finish(){if(this.finished)return;this.finished=true;this.complete()}
}

/** Aviso no modal: no intercepta toques ni se convierte en destino del personaje. */
export function showPlanetViewHint(button:HTMLElement){
  const hint=document.createElement('div');
  hint.id='planet-view-tutorial';hint.className='planet-view-tutorial';hint.setAttribute('role','status');
  hint.textContent='Toca «Vista» para ver el planeta completo o acercarte de nuevo.';
  document.body.append(hint);
  const position=()=>{const r=button.getBoundingClientRect();hint.style.left=Math.max(8,Math.min(window.innerWidth-hint.offsetWidth-8,r.right-hint.offsetWidth))+'px';hint.style.top=(r.bottom+10)+'px'};
  position();window.addEventListener('resize',position);
  const remove=()=>{clearTimeout(timer);hint.remove();button.removeEventListener('click',remove);window.removeEventListener('resize',position)};
  const timer=setTimeout(remove,7000);button.addEventListener('click',remove,{once:true});return remove;
}
