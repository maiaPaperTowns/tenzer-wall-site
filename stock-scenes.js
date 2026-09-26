/* Original user-supplied artwork. All motion and masks are browser-rendered. */
(() => {
  const clamp = n => Math.max(0, Math.min(1, n));
  const ease = n => 1 - Math.pow(1 - clamp(n), 3);
  const sequence = new Map();
  const cache = new Map();
  const imageLoads = new Map();
  function loadImage(src) {
    if (!imageLoads.has(src)) imageLoads.set(src,new Promise((resolve,reject)=>{
      const image=new Image();
      const timeout=setTimeout(()=>{image.onload=image.onerror=null;reject(Error('Image timed out: '+src))},30000);
      image.onload=()=>{clearTimeout(timeout);resolve(image)};
      image.onerror=()=>{clearTimeout(timeout);reject(Error('Image unavailable: '+src))};
      image.src=src;
    }));
    return imageLoads.get(src);
  }
  async function prepare(entry) {
    const images=await Promise.all(entry.assets.map(loadImage));
    const kanjiImage=entry.kanjiAsset ? await loadImage(entry.kanjiAsset) : null;
    return {...entry,images,kanjiImage};
  }
  function cutout(img, crop, key, shape, transparent=false) {
    if (!img.naturalWidth) return null;
    if (cache.has(key)) return cache.get(key);
    const [x,y,w,h] = crop, c = document.createElement('canvas');
    c.width = Math.ceil(img.naturalWidth*w); c.height = Math.ceil(img.naturalHeight*h);
    const g = c.getContext('2d');
    if (shape) {
      g.beginPath(); shape.forEach(([px,py],i) => i ? g.lineTo(px*c.width,py*c.height) : g.moveTo(px*c.width,py*c.height)); g.closePath(); g.clip();
    }
    g.drawImage(img,x*img.naturalWidth,y*img.naturalHeight,w*img.naturalWidth,h*img.naturalHeight,0,0,c.width,c.height);
    if (shape) {
      const pixels = g.getImageData(0,0,c.width,c.height);
      for(let i=0;i<pixels.data.length;i+=4) {
        const r=pixels.data[i], green=pixels.data[i+1], b=pixels.data[i+2];
        const paper=clamp((Math.min(r,green)-165)/48)*clamp((r-b-4)/15);
        pixels.data[i+3]*=1-paper;
      }
      g.putImageData(pixels,0,0);
    }
    // Feather only the crop boundary; preserve original pigment and pale petals.
    if (!shape && !transparent) {
      g.globalCompositeOperation = 'destination-in';
      g.save(); g.translate(c.width/2,c.height/2); g.scale(c.width/2,c.height/2);
      const mask=g.createRadialGradient(0,0,.67,0,0,1);
      mask.addColorStop(0,'#000'); mask.addColorStop(1,'transparent');
      g.fillStyle=mask; g.fillRect(-1,-1,2,2); g.restore();
    }
    cache.set(key,c); return c;
  }
  function petals(sprite,key,pivot) {
    if(cache.has(key))return cache.get(key);
    const [px,py]=pivot, pieces=[];
    for(let i=0;i<6;i++) {
      const layer=document.createElement('canvas');layer.width=sprite.width;layer.height=sprite.height;
      const c=layer.getContext('2d'),x=px*layer.width,y=py*layer.height;
      c.beginPath();c.moveTo(x,y);c.arc(x,y,Math.hypot(layer.width,layer.height),i*Math.PI/3-.012,(i+1)*Math.PI/3+.012);c.closePath();c.clip();c.drawImage(sprite,0,0);pieces.push(layer);
    }
    cache.set(key,pieces);return pieces;
  }
  function wingLayer(sprite,key,wing) {
    if(cache.has(key))return cache.get(key);
    const layer=document.createElement('canvas');layer.width=sprite.width;layer.height=sprite.height;
    const c=layer.getContext('2d');c.beginPath();wing.shape.forEach(([x,y],i)=>i?c.lineTo(x*layer.width,y*layer.height):c.moveTo(x*layer.width,y*layer.height));c.closePath();c.clip();c.drawImage(sprite,0,0);
    cache.set(key,layer);return layer;
  }
  function softSun(img) {
    const key=img.src+':soft-disc';if(cache.has(key))return cache.get(key);
    const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;
    const g=c.getContext('2d');g.drawImage(img,0,0);
    g.globalCompositeOperation='destination-in';
    const mask=g.createRadialGradient(c.width*.505,c.height*.495,c.width*.419,c.width*.505,c.height*.495,c.width*.441);
    mask.addColorStop(0,'#000');mask.addColorStop(1,'transparent');g.fillStyle=mask;g.fillRect(0,0,c.width,c.height);
    cache.set(key,c);return c;
  }
  function fallingPetal(img) {
    const key=img.src+':falling-petal';if(cache.has(key))return cache.get(key);
    const c=document.createElement('canvas');c.width=64;c.height=88;const g=c.getContext('2d');
    g.beginPath();g.moveTo(32,86);g.bezierCurveTo(-8,53,0,5,26,3);g.bezierCurveTo(64,-8,77,43,32,86);g.closePath();g.clip();
    g.drawImage(img,img.naturalWidth*.39,img.naturalHeight*.12,img.naturalWidth*.045,img.naturalHeight*.09,0,0,64,88);
    cache.set(key,c);return c;
  }
  function cover(g,img,w,h,alpha) {
    if (!img.naturalWidth) return;
    const scale=Math.max(w/img.naturalWidth,h/img.naturalHeight);
    g.save(); g.globalAlpha=alpha;
    g.drawImage(img,(w-img.naturalWidth*scale)/2,(h-img.naturalHeight*scale)/2,img.naturalWidth*scale,img.naturalHeight*scale); g.restore();
  }
  window.drawStockScene = (g,s,fade,w,h,reduced) => {
    const entry=s.entry, assets=entry.images, options=entry.options;
    const countVariants=entry.behavior==='glow'?entry.variants.length:entry.behavior==='fly'?entry.crops.length:assets.length;
    if (s.stockVariant == null) {
      const next=sequence.get(entry.id)||0; s.stockVariant=next%countVariants; sequence.set(entry.id,next+1);
    }
    const t=s.life, min=Math.min(w,h);
    g.save();
    if (entry.behavior==='bloom') {
      const count=Math.round(reduced?(options.reducedCount||30):Math.min(options.countMax||150,Math.max(options.countMin||90,Math.round(w*h/12000))));
      if(!s.flowers || s.flowerWidth!==w || s.flowerHeight!==h) {
        const cx=s.x??w/2,cy=s.y??h/2,cols=Math.ceil(Math.sqrt(count*w/h)),rows=Math.ceil(count/cols);
        s.flowers=Array.from({length:count},(_,i)=>{
          const x=i===0?cx:((i%cols)+.5+Math.sin(i*17)*.28)*w/cols;
          const y=i===0?cy:(Math.floor(i/cols)+.5+Math.cos(i*11)*.28)*h/rows;
          return {x,y,delay:Math.hypot(x-cx,y-cy)/Math.hypot(w,h)*(options.spreadSeconds||2.1),size:min*(i===0?.32:.10+(i%5)*.023),rotation:Math.sin(i*13)*1.2};
        });
        s.flowerWidth=w; s.flowerHeight=h;
      }
      for(let i=0;i<count;i++) {
        const index=(i+s.stockVariant)%entry.crops.length, spec=entry.crops[index];
        const sprite=cutout(assets[spec.asset],spec.crop,entry.id+':crop:'+index,spec.shape,spec.transparent);
        if(!sprite) continue;
        const age=t-s.flowers[i].delay,open=ease(age/(options.openSeconds||1.2));
        if(!open) continue;
        const {x,y,rotation}=s.flowers[i],size=Math.min(s.flowers[i].size,sprite.width),height=size*sprite.height/sprite.width;
        const pivot=spec.pivot||[.5,.5];
        const shake=reduced?0:Math.sin(age*11+i)*.12*Math.exp(-age*1.1)+Math.sin(t*1.8+i)*.065;
        const bloom=reduced?1:open+Math.sin(Math.PI*clamp(age/(options.openSeconds||1.2)))*.28;
        g.save();g.translate(x+(reduced?0:Math.sin(t*1.1+i)*min*.004),y);g.rotate(rotation+shake);
        g.scale(bloom,bloom);g.globalAlpha=fade*open;
        // Prototype 1's outward reveal, with the licensed flower kept intact.
        if(!reduced&&open<1){g.beginPath();g.arc(0,0,size*1.42*open,0,Math.PI*2);g.clip();}
        g.drawImage(sprite,-size*pivot[0],-height*pivot[1],size,height);
        g.restore();
      }
      if(!reduced) {
        const petal=fallingPetal(assets[0]),total=options.petalCount||28,fall=options.petalFallSeconds||5;
        for(let i=0;i<total;i++) {
          const age=t-.65-i*.045;if(age<0)continue;
          const cycle=Math.floor(age/fall),p=(age%fall)/fall,origin=s.flowers[(i*7+cycle)%count];
          const drift=Math.sin(p*Math.PI*2+i)*min*.045+p*min*.055;
          g.save();g.translate(origin.x+drift,origin.y+p*min*.6);g.rotate(i*2.4+p*3+Math.sin(p*8+i)*.45);
          g.scale(.35+.65*Math.abs(Math.cos(p*7+i)),1);g.globalAlpha=fade*ease(p*8)*(1-ease((p-.72)/.28))*.85;
          const size=min*(.012+(i%4)*.003);g.drawImage(petal,-size/2,-size*.7,size,size*1.4);g.restore();
        }
      }
    } else if(entry.behavior==='glow') {
      const variant=entry.variants[s.stockVariant];
      if(variant.mode==='backdrop') {
        cover(g,assets[variant.asset],w,h,fade);
      } else {
        const pulse=reduced?0:Math.sin(t*Math.PI*2/(options.pulseSeconds||4.5));
        const size=min*.68, settle=reduced?1:1.12-.12*ease(t/(options.settleSeconds||2.3));
        const glow=g.createRadialGradient(w/2,h/2,0,w/2,h/2,Math.max(w,h)*(.52+.045*pulse));
        glow.addColorStop(0,'rgba(255,200,66,.65)'); glow.addColorStop(.5,'rgba(255,193,60,.2)'); glow.addColorStop(1,'rgba(255,220,150,0)');
        g.globalAlpha=fade*(.85+.15*pulse); g.fillStyle=glow; g.fillRect(0,0,w,h);
        if(variant.rays!=null) {g.save();g.globalCompositeOperation='screen';g.translate(w/2,h/2);g.rotate(reduced?0:t*.012);g.globalAlpha=fade*.3*ease(t/2);g.drawImage(assets[variant.rays],-size*.72,-size*.72,size*1.44,size*1.44);g.restore();}
        if(assets[variant.asset].naturalWidth) {
          g.translate(w/2,h/2); g.scale(settle,settle);
          g.globalAlpha=fade;g.globalCompositeOperation='screen';g.drawImage(softSun(assets[variant.asset]),-size*.505,-size*.495,size,size);
        }
      }
    } else if(entry.behavior==='fly') {
      const spec=entry.crops[s.stockVariant];
      const sprite=cutout(assets[spec.asset],spec.crop,entry.id+':crop:'+s.stockVariant,spec.shape);
      if(sprite) for(let i=0;i<(reduced?(options.reducedCount||3):(options.count||6));i++) {
        const delay=i*(options.staggerSeconds||.65);
        const flight=clamp((t-delay)/(options.flightSeconds||14));
        if(!flight)continue;
        const x=reduced?w*(.17+(i%3)*.3):-w*.14+flight*w*1.3;
        const y=h*(.22+(i%3)*.25)+(reduced?0:Math.sin(t*.65+i)*h*.035);
        const size=min*(.18+(i%3)*.025), height=size*sprite.height/sprite.width;
        const heading=reduced?0:Math.max(-.10,Math.min(.10,Math.atan2(Math.cos(t*.65+i)*h*.035*.65,w*1.3/(options.flightSeconds||14))));
        g.save();g.translate(x,y);g.rotate((spec.rotationDegrees||0)*Math.PI/180+heading);g.globalAlpha=fade*ease((t-delay)/.8);
        if((spec.facing||-1)<0)g.scale(-1,1);
        g.drawImage(sprite,-size/2,-height/2,size,height);
        if(spec.wing) {
          const wing=wingLayer(sprite,entry.id+':wing:'+s.stockVariant,spec.wing);
          const phase=Math.sin(t*Math.PI*2/(options.flapSeconds||.85)+i*1.3);
          const px=(spec.wing.pivot[0]-.5)*size,py=(spec.wing.pivot[1]-.5)*height;
          g.translate(px,py);g.rotate(reduced?0:phase*.32);
          g.scale(1,reduced?1:.72+.28*Math.cos(t*Math.PI*2/(options.flapSeconds||.85)+i*1.3));
          g.drawImage(wing,-size/2-px,-height/2-py,size,height);
        }
        g.restore();
      }
    } else if(entry.behavior==='mountain') {
      for(let i=0;i<entry.layers.length;i++) {
        const layer=entry.layers[i],spec=entry.crops[layer.crop];
        const sprite=cutout(assets[spec.asset],spec.crop,entry.id+':mountain:'+layer.crop,spec.shape,true);
        const rise=ease((t-layer.delay)/(options.revealSeconds||2.5));
        if(!sprite||!rise)continue;
        const width=Math.min(w*layer.width,h*(1.25+i*.05)),height=width*sprite.height/sprite.width;
        const x=w*.5+(layer.x-.5)*Math.min(w,h*2.5),y=h*layer.y+(reduced?0:(1-rise)*h*.075);
        g.save();g.globalAlpha=fade*rise*layer.opacity;
        g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.filter='contrast(1.12) saturate(1.06)';
        g.drawImage(sprite,x-width/2,y-height/2,width,height);g.restore();
      }
    } else if(entry.behavior==='reveal') {
      const img=assets[s.stockVariant];
      // The original composition fills the canvas, with no strip slicing or synthetic peaks.
      // Broad, overlapping soft reveals keep the painting's actual contours intact.
      if(img.naturalWidth) {
        let layer=s.layer;
        if(!layer || layer.width!==w || layer.height!==h) {layer=document.createElement('canvas');layer.width=w;layer.height=h;s.layer=layer;}
        const c=layer.getContext('2d');c.clearRect(0,0,w,h);c.globalCompositeOperation='source-over';
        for(let i=0;i<5;i++) {
          const reveal=ease((t-i*(options.staggerSeconds||.32))/(options.revealSeconds||2.4));if(!reveal)continue;
          const x=w*(.15+i*.18),y=h*(.3+(i%3)*.2),r=Math.hypot(w,h)*reveal*.75;
          const mask=c.createRadialGradient(x,y,0,x,y,Math.max(1,r));
          mask.addColorStop(0,'#000');mask.addColorStop(.55,'#000');mask.addColorStop(1,'transparent');c.fillStyle=mask;c.fillRect(0,0,w,h);
        }
        c.globalCompositeOperation='source-in'; cover(c,img,w,h,1);
        g.globalAlpha=fade;g.drawImage(layer,0,0,w,h);
      }
    }
    g.restore();
  };
  window.TenzerScenes={prepare};
})();
