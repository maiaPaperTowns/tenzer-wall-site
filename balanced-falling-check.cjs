const {chromium}=require('playwright'),fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 try {
  for(const width of [390,1440]) {
   const page=await browser.newPage({viewport:{width,height:844}});
   await page.route('**/app.js?*',route=>route.fulfill({contentType:'text/javascript',body:fs.readFileSync(__dirname+'/app.js','utf8').replace(/\}\)\(\);\s*$/,'window.__balance={spawnCharacter,characters,counts:()=>spawnCounts,drawCharacter};})();')}));
   await page.goto('http://127.0.0.1:4183/');await page.waitForFunction(()=>window.__balance&&document.querySelector('#begin').disabled===false);
   const result=await page.evaluate(()=>{
    const b=__balance;b.characters.length=0;const before=b.counts().slice();
    for(let i=0;i<before.length*12;i++){b.characters.length=0;b.spawnCharacter();}
    const counts=b.counts();const c=b.characters[0];c.state='opening';c.life=0;b.drawCharacter(c,2);
    const sound=document.querySelector('#sound').getBoundingClientRect(),about=document.querySelector('#about').getBoundingClientRect();
    return {spread:Math.max(...counts)-Math.min(...counts),rotation:c.rotation,scale:c.scale,alpha:c.alpha,center:(sound.left+about.right)/2,width:innerWidth};
   });
   assert.ok(result.spread<=1);assert.equal(result.rotation,0);assert.equal(result.scale,1);assert.ok(result.alpha>.4);assert.ok(Math.abs(result.center-width/2)<2);console.log(result);await page.close();
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
