const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const raw=require('./config.json');
(async()=>{
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try {
 const page=await browser.newPage({viewport:{width:1400,height:700}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4183/');
 await page.waitForFunction(()=>!document.querySelector('#begin').disabled,{},{timeout:60000});
 // The document capture listener must suppress menus on all public surfaces.
 assert.equal(await page.evaluate(()=>['#art','#begin','#sound','#intro','body'].every(selector=>{
  const event=new MouseEvent('contextmenu',{bubbles:true,cancelable:true});document.querySelector(selector).dispatchEvent(event);return event.defaultPrevented;
 })),true);
 await page.evaluate(()=>{const draw=window.drawStockScene;window.samples=[];window.drawStockScene=(...args)=>{samples.push({id:args[1].entry.id,at:performance.now(),fade:args[2]});draw(...args)};document.addEventListener('contextmenu',e=>window.nativeMenuPrevented=e.defaultPrevented)});
 await page.click('#begin');await page.locator('#begin').evaluate(el=>el.blur());await page.waitForTimeout(500);await page.keyboard.press('Enter');await page.waitForTimeout(1700);await page.keyboard.press('Enter');await page.waitForTimeout(1100);
 const transition=await page.evaluate(()=>{
   const latest=samples.at(-1);return {ids:[...new Set(samples.map(s=>s.id))],visible:[...new Set(samples.filter(s=>s.at>=latest.at-1 && s.fade>.01).map(s=>s.id))]};
 });assert.equal(transition.ids.length,2);assert.equal(transition.visible.length,1);
 await page.mouse.click(600,400,{button:'right'});
 assert.equal(await page.evaluate(()=>window.nativeMenuPrevented),true);
 // Exercise every configured renderer/variant without semantic-name assumptions.
 const variants=await page.evaluate(async()=>{
   const dataset=await TenzerConfig.load('config.json');const entries=await Promise.all(dataset.entries.map(TenzerScenes.prepare));
   requestAnimationFrame=()=>0;await new Promise(r=>setTimeout(r,100));
   const g=document.querySelector('canvas').getContext('2d');let count=0;
   for(const entry of entries)for(let i=0;i<(entry.behavior==='glow'?entry.variants.length:entry.behavior==='fly'?entry.crops.length:entry.images.length);i++){
     window.drawStockScene(g,{entry,life:5,x:700,y:350,stockVariant:i},1,1400,700,false);count++;
   }return count;
 });assert.equal(variants,raw.entries.reduce((n,e)=>n+(e.behavior==='glow'?e.variants.length:e.behavior==='fly'?e.crops.length:e.assets.length),0));
 await page.screenshot({path:'/private/tmp/tenzer-prototype2.png'});
 // An entirely new dataset works with unchanged engine code and an image glyph.
 const custom={version:1,entries:[{id:'snow-demo',meaning:'Snow demo',kanjiAsset:'glyph.svg',behavior:'reveal',assets:['assets/stock/holy-cross.jpg'],duration:8,sound:{src:'demo.mp3',volume:.25}}]};
 await page.route('**/alternate.json',r=>r.fulfill({json:custom}));
 await page.route('**/glyph.svg',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="5" y="80" font-size="80">雪</text></svg>'}));
 await page.goto('http://127.0.0.1:4183/?dataset=alternate.json');await page.waitForFunction(()=>!document.querySelector('#begin').disabled);
 await page.evaluate(()=>{const draw=drawStockScene;window.drawStockScene=(...a)=>{window.activeId=a[1].entry.id;draw(...a)};window.Audio=class{constructor(src){window.soundSrc=src}play(){return Promise.resolve()}pause(){}}});
 await page.click('#begin');await page.click('#sound');await page.locator('#sound').evaluate(el=>el.blur());await page.keyboard.press('Enter');await page.waitForTimeout(300);assert.equal(await page.evaluate(()=>window.activeId),'snow-demo');
 // All datasets use the requested shared legacy chime, never per-character media.
 assert.equal(await page.evaluate(()=>window.soundSrc),undefined);
 assert.equal(await page.locator('#sound').getAttribute('aria-pressed'),'true');
 // Hold a visible character through Hammer's press threshold; releasing must not open a browser menu.
 await page.goto('http://127.0.0.1:4183/');await page.waitForFunction(()=>!document.querySelector('#begin').disabled);
 await page.evaluate(()=>{
   const fill=CanvasRenderingContext2D.prototype.fillText;
   CanvasRenderingContext2D.prototype.fillText=function(...a){const m=this.getTransform(),x=m.e/devicePixelRatio,y=m.f/devicePixelRatio;if(x>80&&x<innerWidth-80&&y>80&&y<innerHeight-120)window.lastGlyph={x,y};return fill.apply(this,a)};
   const draw=drawStockScene;window.drawStockScene=(...a)=>{window.heldCharacter=a[1].entry.id;draw(...a)};
 });
 await page.click('#begin');await page.waitForTimeout(500);
 const point=await page.evaluate(()=>window.lastGlyph);await page.mouse.move(point.x,point.y);await page.mouse.down();await page.waitForTimeout(650);await page.mouse.up();
 await page.waitForFunction(()=>window.heldCharacter);assert.ok(await page.evaluate(()=>window.heldCharacter));
 await page.route('**/broken.json',r=>r.fulfill({json:{version:1,entries:[]}}));
 await page.goto('http://127.0.0.1:4183/?dataset=broken.json');await page.waitForFunction(()=>document.querySelector('#dataset-status').textContent.includes('Unable to start'));
 assert.equal(await page.locator('#begin').isDisabled(),true);
 assert.deepEqual(errors,[]);console.log(JSON.stringify({contextMenus:'suppressed',transitions:'pass',variants,alternateDataset:'pass',invalidConfig:'visible error',errors}));
}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
