import {cloud} from '../account/CloudAccounts';
import {validTime,localDay,reminderDue} from './ReminderSchedule';
export interface ReminderConfig {enabled:boolean;time:string;lastNotifiedDate?:string;background?:boolean;}
export const HARP_REMINDER_PROMPTS=[{title:'Earpa Â· Time to listen',body:'A few minutes with your harp. Listen, find the tonic, and enjoy a practice round.'},{title:'Earpa Â· Your daily practice',body:'Single notes, melodies or levers: choose a small step for today.'}];
export class PracticeReminderService {
 private static key='earpa_practice_reminders'; private static sending=false;
 static getConfig():ReminderConfig {try{const c=JSON.parse(localStorage.getItem(this.key)||'null');if(c&&validTime(c.time))return c;}catch{}return {enabled:false,time:'10:00'};}
 static saveConfig(config:ReminderConfig){if(!validTime(config.time))throw new Error('Use a time such as 10:00.');try{localStorage.setItem(this.key,JSON.stringify(config));}catch{throw new Error('Reminder preferences could not be saved on this device.');}}
 static isSupported(){return typeof window!=='undefined'&&'Notification' in window;}
 static getPermissionState():NotificationPermission {return this.isSupported()?Notification.permission:'denied';}
 static async requestPermission():Promise<NotificationPermission>{if(!this.isSupported())return 'denied';try{return await Notification.requestPermission();}catch{return 'denied';}}
 static getRandomPrompt(){return HARP_REMINDER_PROMPTS[Math.floor(Math.random()*HARP_REMINDER_PROMPTS.length)];}
 static async registration(){
  if(!('serviceWorker' in navigator))throw new Error('Service workers are unavailable.');
  await navigator.serviceWorker.register('/sw.js');
  let timer:ReturnType<typeof setTimeout>|undefined;
  try{return await Promise.race([navigator.serviceWorker.ready,new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new Error('The notification service did not become ready. Please retry.')),10000);})]);}finally{if(timer)clearTimeout(timer);}
 }
 static async configure(enabled:boolean,time:string):Promise<string>{
  if(!validTime(time))throw new Error('Enter a valid 24-hour time (HH:MM).');
  if(!enabled){
   if(typeof navigator!=='undefined'&&'serviceWorker' in navigator){const reg=await navigator.serviceWorker.getRegistration();const sub=await reg?.pushManager?.getSubscription();if(sub){if(cloud){const {error}=await cloud.from('earpa_push_subscriptions').delete().eq('endpoint',sub.endpoint);if(error)throw new Error('Could not turn off server reminders. Please retry.');}await sub.unsubscribe();}}
   this.saveConfig({...this.getConfig(),enabled:false,background:false,time});return 'Reminders off';
  }
  if(await this.requestPermission()!=='granted')throw new Error('Notifications are unavailable or blocked. On iPhone, install Earpa on the Home Screen first.');
  const vapid=process.env.EXPO_PUBLIC_WEB_PUSH_KEY;
  if(!cloud||!vapid){this.saveConfig({...this.getConfig(),enabled:true,time,background:false});return 'Saved for when Earpa is open. Background delivery is not connected yet.';}
  const {data:{user}}=await cloud.auth.getUser();if(!user)throw new Error('Sign in before enabling background reminders.');
  const reg=await this.registration();
  const base64=vapid.replace(/-/g,'+').replace(/_/g,'/');const key=Uint8Array.from(atob(base64.padEnd(Math.ceil(base64.length/4)*4,'=')),c=>c.charCodeAt(0));
  const existing=await reg.pushManager.getSubscription();const sub=existing??await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:key});
  const json=sub.toJSON();const {error}=await cloud.from('earpa_push_subscriptions').upsert({user_id:user.id,endpoint:sub.endpoint,p256dh:json.keys?.p256dh,auth:json.keys?.auth,local_time:time,timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,enabled:true},{onConflict:'endpoint'});
  if(error){if(!existing)await sub.unsubscribe();throw new Error('The reminder server could not save your schedule. Please retry.');}
  this.saveConfig({...this.getConfig(),enabled:true,time,background:true});return 'Subscription saved. Delivery depends on the server schedule, device settings and connectivity.';
 }
 static async sendTestNotification(){return this.dispatchNotification();}
 static async checkAndDispatchDailyReminder(){
  const config=this.getConfig();if(config.background||this.sending||!reminderDue(config)||this.getPermissionState()!=='granted')return false;
  this.sending=true;try{const sent=await this.dispatchNotification();if(sent)this.saveConfig({...config,lastNotifiedDate:localDay(new Date())});return sent;}finally{this.sending=false;}
 }
 private static async dispatchNotification(){
  if(this.getPermissionState()!=='granted')return false;
  const prompt=this.getRandomPrompt();const options={body:prompt.body,icon:'/images/icons/earpa_icon_192.png',tag:'earpa-daily-practice',data:{url:'/'}};
  try{if('serviceWorker' in navigator){const reg=await this.registration();await reg.showNotification(prompt.title,options);}else{new Notification(prompt.title,options);}return true;}catch{return false;}
 }
}
