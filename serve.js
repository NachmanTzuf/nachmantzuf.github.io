const http=require('http'),fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'dist');
const types={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.glb':'model/gltf-binary','.mp4':'video/mp4','.webm':'video/webm','.wav':'audio/wav','.mp3':'audio/mpeg','.woff2':'font/woff2','.ico':'image/x-icon'};
http.createServer((req,res)=>{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
 let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);res.end();return;}
 let file=path.resolve(root,'.'+pathname);if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
 if(pathname.endsWith('/'))file=path.join(file,'index.html');
 fs.stat(file,(err,stats)=>{
  if(err||!stats.isFile()){
   if(path.extname(pathname)){res.writeHead(404);res.end('Not found');return;}
   file=path.join(root,'index.html');try{stats=fs.statSync(file);}catch{res.writeHead(404);res.end();return;}
  }
  const headers={'Content-Type':types[path.extname(file).toLowerCase()]||'application/octet-stream','Cache-Control':'no-cache','Accept-Ranges':'bytes'};
  let start=0,end=stats.size-1,status=200;
  if(req.headers.range){const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
   if(!match||(!match[1]&&!match[2])){res.writeHead(416,{'Content-Range':`bytes */${stats.size}`});res.end();return;}
   if(!match[1])start=Math.max(0,stats.size-Number(match[2]));else{start=Number(match[1]);if(match[2])end=Math.min(end,Number(match[2]));}
   if(start>end||start>=stats.size){res.writeHead(416,{'Content-Range':`bytes */${stats.size}`});res.end();return;}
   status=206;headers['Content-Range']=`bytes ${start}-${end}/${stats.size}`;
  }
  headers['Content-Length']=Math.max(0,end-start+1);res.writeHead(status,headers);
  if(req.method==='HEAD'||stats.size===0){res.end();return;}
  const stream=fs.createReadStream(file,{start,end});stream.on('error',()=>res.destroy());stream.pipe(res);req.on('close',()=>stream.destroy());
 });
}).listen(Number(process.env.PORT||8088),'0.0.0.0',()=>console.log('Earpa preview server ready'));
