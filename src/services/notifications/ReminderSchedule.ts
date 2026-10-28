export function validTime(time:string){return /^([01]\d|2[0-3]):[0-5]\d$/.test(time);}
export function localDay(now:Date){return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;}
export function reminderDue(config:{enabled:boolean;time:string;lastNotifiedDate?:string},now=new Date()){
 if(!config.enabled||!validTime(config.time)||config.lastNotifiedDate===localDay(now))return false;
 const [h,m]=config.time.split(':').map(Number);const elapsed=now.getHours()*60+now.getMinutes()-h*60-m;
 return elapsed>=0&&elapsed<60;
}
