const fs=require('fs'),path=require('path');
const root='C:/Users/Hp/.gemini/antigravity/scratch/mobile-app-studio/earpa-video';
const {bundle}=require(root+'/node_modules/@remotion/bundler');
const {getCompositions,renderStill,renderMedia,openBrowser}=require(root+'/node_modules/@remotion/renderer');
const suite=require(root+'/src/mission/suite.json');
const out=root+'/out/mission';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const serveUrl=await bundle({entryPoint:root+'/src/index.ts',publicDir:root+'/public'});
 const browser=await openBrowser('chrome',{chromiumOptions:{gl:'angle'}});
 const all=await getCompositions(serveUrl,{puppeteerInstance:browser});
 const selected=all.filter(c=>suite[c.id]);
 const render=process.argv.includes('--render');const only=process.argv.find(a=>a.startsWith('--only='))?.slice(7);const skip=process.argv.find(a=>a.startsWith('--skip='))?.slice(7);
 const results=[];
 try{for(const composition of selected){
  if((only&&composition.id!==only)||composition.id===skip)continue;
  if(process.argv.includes('--resume')&&fs.existsSync(out+'/'+composition.id+'-status.json')&&JSON.parse(fs.readFileSync(out+'/'+composition.id+'-status.json','utf8')).rendered){console.log(composition.id+' already rendered');continue;}
  const images=[];
  for(const frame of [90,Math.floor(composition.durationInFrames*.55),composition.durationInFrames-90]){
   const output=path.join(out,composition.id+'-'+frame+'.png');
   await renderStill({serveUrl,composition,output,frame,puppeteerInstance:browser,imageFormat:'png',logLevel:'error'});images.push(output);
  }
  console.log(composition.id+' preview stills ready');
  if(render){
   const output=path.join(out,composition.id+'-review.mp4');
   await renderMedia({serveUrl,composition,outputLocation:output,codec:'h264',audioCodec:'aac',pixelFormat:'yuv420p',crf:20,concurrency:3,puppeteerInstance:browser,logLevel:'error',onProgress:({progress})=>{const p=Math.floor(progress*10);if(p!==global.lastP){global.lastP=p;console.log(composition.id+' '+p*10+'%');}}});
   console.log(composition.id+' MP4 ready');
  }
  results.push({id:composition.id,images,rendered:render});fs.writeFileSync(out+'/'+composition.id+'-status.json',JSON.stringify(results.at(-1),null,2));
 }}finally{await browser.close({silent:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
