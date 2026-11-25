const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=__dirname;
test('three supplied photos and original interface retained',()=>{
  const validator=require('./config-loader.js');
  const config=validator.validate(JSON.parse(fs.readFileSync(path.join(root,'config.json'))),'http://localhost:4185/config.json');
  assert.deepEqual(config.entries.map(e=>e.glyph),['月','川','魚']);
  for(const e of config.entries)assert.ok(fs.statSync(path.join(root,new URL(e.assets[0]).pathname)).size>1000);
  if(fs.existsSync(path.join(root,'../styles.css')))assert.equal(fs.readFileSync(path.join(root,'styles.css'),'utf8'),fs.readFileSync(path.join(root,'../styles.css'),'utf8'));
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  assert.ok(html.includes('id="intro"'));assert.ok(html.includes('id="sound"'));assert.ok(html.includes('id="about-dialog"'));
  assert.ok(!html.includes('data-scene='));
  assert.ok(!html.includes('Review 5 Flower images'));assert.ok(!html.includes('hammer.min.js'));
});
test('original-photo motion renders finite geometry at wall and phone ratios',()=>{
  const values={},gl=new Proxy({}, {get:(_,name)=>{
    if(name==='getShaderParameter'||name==='getProgramParameter')return()=>true;
    if(name==='getUniformLocation')return(_,key)=>key;
    if(name==='uniform1f')return(k,v)=>{values[k]=v;assert.ok(Number.isFinite(v));};
    return()=>({});
  }});
  const maskContext=new Proxy({},{get:()=>()=>{}});
  const document={createElement:()=>({width:0,height:0,getContext:kind=>kind==='webgl'?gl:maskContext}),querySelector:()=>({})};const window={drawStockScene(){}};
  vm.runInNewContext(fs.readFileSync(path.join(root,'photo-motion.js'),'utf8'),{window,document,console});
  const ctx=new Proxy({globalAlpha:1},{get:(o,k)=>k in o?o[k]:k==='createRadialGradient'?()=>({addColorStop(){}}):(...args)=>{for(const v of args)if(typeof v==='number')assert.ok(Number.isFinite(v));}});
  assert.equal(window.TenzerPhotoMotion.moonRiseSeconds,6);
  for(const[w,h]of [[1920,540],[7680,2160],[390,844]])for(const[mode,id]of ['moon','river','fish'].entries())for(const time of [0,12,35]){
    const scene={entry:{id,images:[{naturalWidth:2172,naturalHeight:724},{naturalWidth:1254,naturalHeight:1254}]},life:time};
    window.drawStockScene(ctx,scene,.7,w,h,false);assert.equal(values.mode,mode);assert.equal(values.t,time);
    window.drawStockScene(ctx,scene,.7,w,h,true);assert.equal(values.t,0);assert.equal(values.moving,0);
  }
});
test('archived painted renderer remains compatible but is not active',()=>{
  const values={},gl=new Proxy({}, {get:(_,name)=>{
    if(name==='getShaderParameter'||name==='getProgramParameter')return()=>true;
    if(name==='getUniformLocation')return(_,key)=>key;
    if(name==='uniform1f')return(k,v)=>{values[k]=v;assert.ok(Number.isFinite(v));};
    return()=>({});
  }});
  const document={createElement:()=>({getContext:()=>gl})};let delegated=0;
  const window={drawStockScene(){delegated++;}};
  vm.runInNewContext(fs.readFileSync(path.join(root,'generated-motion.js'),'utf8'),{window,document,console});
  const ctx=new Proxy({globalAlpha:1},{get:(o,k)=>k in o?o[k]:(...args)=>{for(const v of args)if(typeof v==='number')assert.ok(Number.isFinite(v));}});
  for(const [w,h]of [[1920,540],[7680,2160],[390,844]])for(const id of ['river','fish'])for(const time of [0,6,20,31]){
    const s={entry:{id,images:[{naturalWidth:2172,naturalHeight:724},{naturalWidth:2172,naturalHeight:724}]},life:time};
    window.drawStockScene(ctx,s,.8,w,h,false);assert.equal(values.time,time);assert.equal(values.moving,1);
    window.drawStockScene(ctx,s,.8,w,h,true);assert.equal(values.time,0);assert.equal(values.moving,0);
  }
  window.drawStockScene(ctx,{entry:{id:'moon'}},1,1920,540,false);assert.equal(delegated,1);
  const cfg=JSON.parse(fs.readFileSync(path.join(root,'config.json')));
  assert.equal(cfg.entries[0].assets[0],'assets/moon-restored-hd.webp');
  for(const entry of cfg.entries.slice(1))for(const asset of entry.assets)assert.ok(fs.statSync(path.join(root,asset)).size>1000);
});
test('source originals retained; no painterly renderer; fish uses separate photographic layers',()=>{
  const crypto=require('node:crypto');
  const expected={moon:'358c54f9153833b6072a03f0377deb2313c8ccd0',river:'65ef6ed1d04149ad7f368f975236d678b8c8c5a2',fish:'967fc5f914da7e2c6a75b603d30c026770ae1555'};
  const cfg=JSON.parse(fs.readFileSync(path.join(root,'config.json')));
  for(const entry of cfg.entries){
    assert.equal(crypto.createHash('sha1').update(fs.readFileSync(path.join(root,'assets/'+entry.id+'.jpg'))).digest('hex'),expected[entry.id]);
  }
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  assert.ok(!html.includes('src="generated-motion.js'));
  assert.ok(html.includes('src="fish-cinematic.js'));
  assert.equal(cfg.entries[2].assets.length,2);
  const motion=fs.readFileSync(path.join(root,'photo-motion.js'),'utf8');
  assert.ok(!motion.includes('col*=1.+paper'));
  assert.ok(motion.includes('fishRegion(q,'));
});
test('fish actually translate through the scene, tails change phase, light advances; reduced motion freezes',()=>{
  const values={},gl=new Proxy({}, {get:(_,key)=>{
    if(key==='getShaderParameter'||key==='getProgramParameter')return()=>true;
    if(key==='getUniformLocation')return(_,k)=>k;
    if(key==='uniform1f')return(k,v)=>{values[k]=v;assert.ok(Number.isFinite(v));};
    return()=>({});
  }});
  const window={drawStockScene(){}},document={createElement:()=>({getContext:()=>gl})};
  vm.runInNewContext(fs.readFileSync(path.join(root,'fish-cinematic.js'),'utf8'),{window,document,console});
  const a=window.TenzerFishCinematic.position(1,0),b=window.TenzerFishCinematic.position(1,3);
  assert.ok(Math.abs(a.x-b.x)>.05);assert.notEqual(a.tail,b.tail);
  const ctx=new Proxy({globalAlpha:1},{get:(o,k)=>k in o?o[k]:(...args)=>{for(const v of args)if(typeof v==='number')assert.ok(Number.isFinite(v));}});
  for(const[w,h]of [[1920,1080],[1920,540],[7680,2160],[390,844]]){
    const s={life:8,entry:{id:'fish',images:[{naturalWidth:1536,naturalHeight:1024},{naturalWidth:2172,naturalHeight:724}]}};
    window.drawStockScene(ctx,s,.8,w,h,false);assert.equal(values.time,8);assert.equal(values.moving,1);
    window.drawStockScene(ctx,s,.8,w,h,true);assert.equal(values.time,0);assert.equal(values.moving,0);
  }
});
