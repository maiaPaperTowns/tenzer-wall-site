const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const b=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 try{
  const p=await b.newPage();await p.goto('http://127.0.0.1:4183/');
  const results=await p.evaluate(async()=>{
   requestAnimationFrame=()=>0;
   const es=await Promise.all((await TenzerConfig.load('config.json')).entries.filter(e=>['flower','waterfall','moon'].includes(e.id)).map(TenzerScenes.prepare)),out=[];
   for(const entry of es)for(const budget of [false,true]){
    const c=document.createElement('canvas');c.width=2400;c.height=1500;const g=c.getContext('2d');g.scale(2,2);const s={entry,life:8,x:600,y:350};
    const draw=()=>budget?TenzerRenderBudget.draw(g,s,1,1200,750,false):drawStockScene(g,s,1,1200,750,false);draw();
    const start=performance.now();for(let i=0;i<8;i++){s.life+=1/60;g.clearRect(0,0,1200,750);draw()}g.getImageData(0,0,1,1);
    out.push({scene:entry.id,budget,ms:+((performance.now()-start)/8).toFixed(1)});
   }
   const sizes=[TenzerRenderBudget.dimensions(7680,2160),TenzerRenderBudget.dimensions(1200,750)];
   const c=document.createElement('canvas');c.width=600;c.height=375;const g=c.getContext('2d'),s={entry:es[0],life:8,x:300,y:200};
   const blank=c.toDataURL();TenzerRenderBudget.draw(g,s,0,600,375,false);const clean=c.toDataURL()===blank;
   return {out,sizes,clean};
  });assert.ok(results.clean);assert.ok(results.sizes.every(s=>s.w*s.h<=1500000));console.log(JSON.stringify(results));
 }finally{await b.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
