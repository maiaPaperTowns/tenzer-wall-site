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
test('panoramic painted scenes fill wall and fish circulate with reduced-motion support',()=>{
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
  assert.equal(cfg.entries[0].assets[0],'assets/moon.jpg');
  for(const entry of cfg.entries.slice(1))for(const asset of entry.assets)assert.ok(fs.statSync(path.join(root,asset)).size>1000);
});
