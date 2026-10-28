import {createClient} from 'npm:@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';
const allowed=(endpoint:string)=>{try{const u=new URL(endpoint);return u.protocol==='https:'&&(u.hostname==='fcm.googleapis.com'||u.hostname==='updates.push.services.mozilla.com'||u.hostname==='web.push.apple.com'||u.hostname.endsWith('.notify.windows.com'));}catch{return false;}};
Deno.serve(async(req)=>{
 const secret=Deno.env.get('REMINDER_CRON_SECRET');
 if(!secret||req.headers.get('Authorization')!==`Bearer ${secret}`)return new Response('Unauthorized',{status:401});
 const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
 webpush.setVapidDetails(Deno.env.get('VAPID_SUBJECT')!,Deno.env.get('VAPID_PUBLIC_KEY')!,Deno.env.get('VAPID_PRIVATE_KEY')!);
 const {data,error}=await db.rpc('claim_due_earpa_reminders');if(error)return new Response('Schedule query failed',{status:500});
 let sent=0,failed=0;
 for(const row of data||[]){
  if(!allowed(row.endpoint)){await db.from('earpa_push_subscriptions').update({enabled:false}).eq('id',row.id);failed++;continue;}
  try{
   await webpush.sendNotification({endpoint:row.endpoint,keys:{p256dh:row.p256dh,auth:row.auth}},JSON.stringify({body:'A few minutes to listen, find your tonic, and enjoy your harp.'}),{TTL:3600,timeout:15000});
   const day=new Intl.DateTimeFormat('en-CA',{timeZone:row.timezone,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
   const {error:updateError}=await db.from('earpa_push_subscriptions').update({last_sent_day:day,claimed_at:null}).eq('id',row.id);
   if(updateError)failed++;else sent++;
  }catch(e){failed++;const status=Number((e as {statusCode?:number})?.statusCode);if([404,410].includes(status))await db.from('earpa_push_subscriptions').delete().eq('id',row.id);}
 }
 return Response.json({sent,failed});
});
