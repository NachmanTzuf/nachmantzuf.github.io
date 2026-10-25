// Coordinates measured on the original 571 x 1024 photographs, not the viewport.
export type TrailRealm = 'single' | 'melody' | 'levers';
const ys = [901,819,732,650,579,522,471,425,374,322];
const centers: Record<TrailRealm, number[]> = {
 single: [218,198,195,259,317,381,326,287,322,301],
 melody: [218,198,195,259,317,381,325,286,316,296],
 levers: [218,198,195,259,317,381,326,287,322,301],
};
export function trailPoints(realm: TrailRealm) {
 return ys.map((y,i) => ({id:i+1, position:i+1, xPct:centers[realm][i]/571*100, yPct:y/1024*100, badgeAlign: i<3?'right' as const:'left' as const}));
}
// Match CSS object-fit: cover / object-position: center exactly.
export function projectTrailPoint<T extends {xPct:number;yPct:number}>(p:T,width:number,height:number):T {
 if(width<=0 || height<=0) return p;
 const scale=Math.max(width/571,height/1024);
 return {...p,xPct:((p.xPct/100*571*scale-(571*scale-width)/2)/width)*100,
 yPct:((p.yPct/100*1024*scale-(1024*scale-height)/2)/height)*100};
}
