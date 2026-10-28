const fs=require('fs'),path=require('path');
const root=require('path').resolve(__dirname,'..');
const dir=root+'/dist/_expo/static/js/web';
const code=fs.readdirSync(dir).filter(n=>n.endsWith('.js')).map(n=>fs.readFileSync(dir+'/'+n,'utf8')).join('');
for(const marker of ['sb_secret_','SUPABASE_SECRET_KEY','ghp_'])console.log('Marker',marker,'count:',code.split(marker).length-1);
for(const file of ['.env','.env.local'])if(fs.existsSync(path.join(root,file)))for(const line of fs.readFileSync(path.join(root,file),'utf8').split(/\r?\n/)){
 const i=line.indexOf('=');if(i<0)continue;
 const k=line.slice(0,i).trim(),v=line.slice(i+1).trim().replace(/^['"]|['"]$/g,'');
 if(/SECRET|TOKEN|PRIVATE/.test(k)&&!k.startsWith('EXPO_PUBLIC')&&v.length>16){const exposed=code.includes(v);console.log(k,'actual value in bundle:',exposed);if(exposed)process.exitCode=1;}
}
