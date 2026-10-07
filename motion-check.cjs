const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{
const page=await browser.newPage({viewport:{width:1400,height:800}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:4183/');await page.waitForFunction(()=>!document.querySelector('#begin').disabled,{}, {timeout:60000});
await page.evaluate(async()=>{window.requestAnimationFrame=()=>0;document.querySelector('#intro').remove();const config=await TenzerConfig.load('config.json');window.testEntries=await Promise.all(config.entries.map(TenzerScenes.prepare))});await page.waitForTimeout(100);
for(const id of ['flower','mountain','bird','sun']){
 for(const life of [1,5]){
  const stats=await page.evaluate(({id,life})=>{
   const g=document.querySelector('canvas').getContext('2d');g.clearRect(0,0,innerWidth,innerHeight);
   const s={entry:testEntries.find(e=>e.id===id),life,x:innerWidth*.5,y:innerHeight*.5,stockVariant:0};
   drawStockScene(g,s,1,innerWidth,innerHeight,false);
   return {flowers:s.flowers?.length,layers:s.entry.layers?.length,quadrants:s.flowers?new Set(s.flowers.map(f=>(f.x>innerWidth/2?1:0)+(f.y>innerHeight/2?2:0))).size:0};
  },{id,life});
  if(id==='flower'){assert.ok(stats.flowers>=40&&stats.flowers<=85);assert.equal(stats.quadrants,4);}if(id==='mountain')assert.equal(stats.layers,7);
  await page.screenshot({path:'/private/tmp/motion-'+id+'-'+life+'.png'});
 }
}
const alpha=await page.evaluate(()=>{
 const img=testEntries.find(e=>e.id==='flower').images[0],c=document.createElement('canvas');c.width=img.width;c.height=img.height;const g=c.getContext('2d');g.drawImage(img,0,0);return g.getImageData(0,0,1,1).data[3];
});assert.equal(alpha,0);
const leaves=await page.evaluate(()=>{
 const entry=testEntries.find(e=>e.id==='flower'),c=document.createElement('canvas');c.width=700;c.height=400;const g=c.getContext('2d');
 const render=(leafCount,fade=1)=>{g.clearRect(0,0,700,400);drawStockScene(g,{entry:{...entry,options:{...entry.options,leafCount}},life:5,stockVariant:0},fade,700,400,false);return c.toDataURL()};
 g.clearRect(0,0,700,400);const blank=c.toDataURL();
 return {visible:render(22)!==render(0),cleanExit:render(22,0)===blank};
});assert.ok(!leaves.visible&&leaves.cleanExit,'Branch-free flowers ignore legacy leaf options');
for(const variant of [1,2]) {
 await page.evaluate(variant=>{
  const g=document.querySelector('canvas').getContext('2d');g.clearRect(0,0,innerWidth,innerHeight);
  drawStockScene(g,{entry:testEntries.find(e=>e.id==='bird'),life:5,stockVariant:variant},1,innerWidth,innerHeight,false);
 },variant);
 await page.screenshot({path:'/private/tmp/motion-bird-variant-'+variant+'.png'});
}
const petalsCheck=await page.evaluate(()=>{
 const entry=testEntries.find(e=>e.id==='flower'),c=document.createElement('canvas');c.width=1400;c.height=800;const g=c.getContext('2d');
 let petalDraws=0;const native=g.drawImage;g.drawImage=function(img,...args){if(img.width===64&&img.height===88)petalDraws++;return native.call(this,img,...args)};
 drawStockScene(g,{entry,life:5,x:700,y:400},1,1400,800,false);const moving=petalDraws;
 petalDraws=0;drawStockScene(g,{entry,life:5,x:700,y:400},1,1400,800,true);
 return {moving,reduced:petalDraws};
});assert.equal(petalsCheck.moving,0);assert.equal(petalsCheck.reduced,0);
const motion=await page.evaluate(()=>{
 const g=document.querySelector('canvas').getContext('2d'),native=g.drawImage;
 const bird=testEntries.find(e=>e.id==='bird'),sun=testEntries.find(e=>e.id==='sun');
 const transforms=[];g.drawImage=function(...args){const m=this.getTransform();transforms.push({x:m.e,a:m.a,b:m.b,c:m.c,d:m.d,pixels:args[0].toDataURL?.()});return native.apply(this,args)};
 const b={...bird,options:{...bird.options,count:1}};
 drawStockScene(g,{entry:b,life:3,x:0,y:0,stockVariant:0},1,1400,800,false);const first=transforms.splice(0);
 drawStockScene(g,{entry:b,life:3.2,x:0,y:0,stockVariant:0},1,1400,800,false);const second=transforms.splice(0);
 const s1={entry:sun,life:3},s2={entry:sun,life:3};drawStockScene(g,s1,1,1400,800,false);drawStockScene(g,s2,1,1400,800,false);g.drawImage=native;
 return {rightward:second[0].x>first[0].x,wingMoves:first.length===1&&second.length===1&&second[0].pixels!==first[0].pixels,sameSun:s1.stockVariant===s2.stockVariant};
});assert.ok(motion.rightward&&motion.wingMoves&&motion.sameSun);
assert.deepEqual(errors,[]);console.log(JSON.stringify({errors,transparentBackground:true,singleFlowerLimit:140,fullScreenFlowers:true,mountainLayers:7,...motion}));
}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
