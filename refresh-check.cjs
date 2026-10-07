const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 try{
  const page=await browser.newPage();await page.goto('http://127.0.0.1:4183/');
  await page.waitForFunction(()=>!document.querySelector('#begin').disabled,{}, {timeout:60000});
  const result=await page.evaluate(async()=>{
   const entries=await Promise.all((await TenzerConfig.load('config.json')).entries.map(TenzerScenes.prepare));
   const water=entries.find(e=>e.id==='water'),s={entry:water,life:.8,x:350,y:200,stockVariant:0};
   const c=document.createElement('canvas');c.width=700;c.height=400;const g=c.getContext('2d');let arcs=0,ellipses=0;
   const arc=g.arc.bind(g),ellipse=g.ellipse.bind(g);g.arc=(...a)=>{arcs++;return arc(...a)};g.ellipse=(...a)=>{ellipses++;return ellipse(...a)};
   drawStockScene(g,s,1,700,400,false);
   let snowContinuous=true,meltObserved=false;
   for(let i=0;i<20;i++)for(let t=0;t<25;t+=.03){const a=TenzerNature.snowSample(i,t),b=TenzerNature.snowSample(i,t+.001);if(a.phase==='melt'){meltObserved=true;if(a.fall!==1||a.alpha<0||a.scale<=0)snowContinuous=false}if(a.phase==='fall'&&b.phase==='melt'&&Math.abs(a.fall-b.fall)>.001)snowContinuous=false}
   let noFold=true;
   for(const crop of entries.find(e=>e.id==='bird').crops)for(const phase of [-1,-.5,0,.5,1])for(let y=0;y<1;y+=.04)for(let x=0;x<1;x+=.04){const p=TenzerScenes.wingPoint(x,y,crop.wing,phase),a=TenzerScenes.wingPoint(x+.001,y,crop.wing,phase),b=TenzerScenes.wingPoint(x,y+.001,crop.wing,phase);if((a[0]-p[0])*(b[1]-p[1])-(a[1]-p[1])*(b[0]-p[0])<=0)noFold=false}
   const cutouts=['cat','fish','cloud','leaves','moon'];
   const transparent=cutouts.every(id=>{g.clearRect(0,0,700,400);g.drawImage(entries.find(e=>e.id===id).images[0],0,0,700,400);return g.getImageData(0,0,1,1).data[3]<5});
   const rain=entries.find(e=>e.id==='rain');
   return {entries:entries.length,waterArcs:arcs,waterRipples:ellipses,noGlyphParticles:!s.inkPoints,snowContinuous,meltObserved,noFold,transparent,rainSurfaces:rain.assets.length,noBlueRain:rain.assets.every(a=>!a.includes('umbrella')),skyOnly:entries.find(e=>e.id==='rainbow').assets[0].includes('rainbow-sky-v3')};
  });
  assert.equal(result.entries,29);assert.equal(result.waterArcs,0);assert.equal(result.waterRipples,1);assert.equal(result.rainSurfaces,1);
  for(const key of ['noGlyphParticles','snowContinuous','meltObserved','noFold','transparent','noBlueRain','skyOnly'])assert.ok(result[key],key);
  console.log(JSON.stringify(result));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
