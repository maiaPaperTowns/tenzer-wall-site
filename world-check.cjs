const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 try{
  const page=await browser.newPage({viewport:{width:1200,height:750}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4183/');
  await page.evaluate(async()=>{window.requestAnimationFrame=()=>0;window.entries=await Promise.all((await TenzerConfig.load('config.json')).entries.filter(e=>['bamboo','tree','river','cat','ocean','flower','moon','lightning','forest','horse','waterfall'].includes(e.id)).map(TenzerScenes.prepare));document.querySelector('#intro')?.remove()});
  for(const id of ['bamboo','tree','river','cat','ocean','flower','moon','lightning','forest','horse','waterfall']){
   const result=await page.evaluate(id=>{
    const c=document.createElement('canvas');c.width=800;c.height=500;const g=c.getContext('2d'),entry=entries.find(e=>e.id===id),s={entry,x:320,y:200,stockVariant:0};
    const render=(life,reduced=false,fade=1)=>{g.clearRect(0,0,800,500);s.life=life;drawStockScene(g,s,fade,800,500,reduced);return c.toDataURL()};const blank=c.toDataURL();
    return {moving:render(2)!==render(10),reduced:render(2,true)===render(10,true),exit:render(10,false,0)===blank};
   },id);assert.ok(result.moving&&result.reduced&&result.exit,JSON.stringify({id,...result}));
   await page.evaluate(id=>{const c=document.querySelector('canvas'),g=c.getContext('2d');g.clearRect(0,0,c.width,c.height);g.fillStyle='#eee8da';g.fillRect(0,0,c.width,c.height);drawStockScene(g,{entry:entries.find(e=>e.id===id),life:10,x:500,y:300,stockVariant:0},1,1200,750,false)},id);
   await page.screenshot({path:`/private/tmp/tenzer-review-${id}.png`});
  }
  const exits=await page.evaluate(()=>[1200,7680].every(w=>TenzerWorld.horsePose(22,w,500,w*.25).x>w&&TenzerWorld.horsePose(22,w,500,w*.75).x<0));assert.ok(exits);
  assert.deepEqual(errors,[]);console.log('11 scenes: motion, reduced motion, clean exits passed. Horse exits at 1200 and 7680px. No JS errors.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
