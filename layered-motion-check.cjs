const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:4183/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.TenzerScenes);
const result=await page.evaluate(async()=>{requestAnimationFrame=()=>0;const entries=await Promise.all((await TenzerConfig.load('config.json')).entries.map(TenzerScenes.prepare)),out=[];
for(const [w,h] of [[1200,400],[420,840]])for(const entry of entries){const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const g=canvas.getContext('2d'),s={entry,x:w*.5,y:h*.5,stockVariant:0};
const render=(t,reduced=false,fade=1)=>{g.clearRect(0,0,w,h);s.life=t;TenzerRenderBudget.draw(g,s,fade,w,h,reduced);return canvas.toDataURL()};const blank=render(0,false,0);
out.push({id:entry.id,aspect:w/h,moving:render(11.1)!==render(11.9),stable:render(11.1,true)===render(11.9,true),exit:render(12,false,0)===blank});}
// A small circular marker must remain circular after background cover fitting.
const source=document.createElement('canvas');source.width=source.height=100;const q=source.getContext('2d');q.fillStyle='#fff';q.beginPath();q.arc(50,50,10,0,Math.PI*2);q.fill();const shapes=[];
for(const [w,h] of [[200,400],[400,200]]){const s={entry:{behavior:'water',images:[source]}};TenzerScenes.fitBackgrounds(s,w,h);const img=s.entry.images[0],pixels=img.getContext('2d').getImageData(0,0,w,h).data;let left=w,right=0,top=h,bottom=0;for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(pixels[(y*w+x)*4+3]>200){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y)}shapes.push({width:right-left,height:bottom-top});}
return {out,shapes};});
console.log(JSON.stringify({failures:result.out.filter(row=>!row.moving||!row.stable||!row.exit)}));
for(const row of result.out)assert.ok(row.moving&&row.stable&&row.exit,JSON.stringify(row));for(const shape of result.shapes)assert.ok(Math.abs(shape.width-shape.height)<=1,JSON.stringify(shape));assert.deepEqual(errors,[]);
await page.setViewportSize({width:420,height:840});
for(const id of ['sakura','flower','tree','bamboo','water','river','ocean','wind','lotus','cat','fire','ice']){await page.evaluate(async id=>{const entry=await TenzerScenes.prepare((await TenzerConfig.load('config.json')).entries.find(e=>e.id===id)),c=document.createElement('canvas');c.width=420;c.height=840;c.style.cssText='position:fixed;inset:0;width:420px;height:840px';document.body.replaceChildren(c);TenzerRenderBudget.draw(c.getContext('2d'),{entry,life:11,x:210,y:420,stockVariant:0},1,420,840,false)},id);await page.screenshot({path:'/private/tmp/layered-portrait-'+id+'.png'});}
console.log(JSON.stringify({scenes:result.out.length,proportionalMarkers:result.shapes,errors}));
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
