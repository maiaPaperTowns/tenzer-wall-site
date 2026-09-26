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
  function cutout(img, crop, key, shape) {
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
    if (!shape) {
      g.globalCompositeOperation = 'destination-in';
      g.save(); g.translate(c.width/2,c.height/2); g.scale(c.width/2,c.height/2);
      const mask=g.createRadialGradient(0,0,.67,0,0,1);
      mask.addColorStop(0,'#000'); mask.addColorStop(1,'transparent');
      g.fillStyle=mask; g.fillRect(-1,-1,2,2); g.restore();
    }
    cache.set(key,c); return c;
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
      const count=Math.round(reduced?(options.reducedCount||24):Math.min(options.countMax||150,Math.max(options.countMin||70,Math.round(w*h/13000))));
      if(!s.flowers || s.flowerWidth!==w || s.flowerHeight!==h) {
        const cols=Math.ceil(Math.sqrt(count*w/h)), rows=Math.ceil(count/cols);
        s.flowers=Array.from({length:cols*rows},(_,i)=>({
          x:((i%cols)+.5+Math.sin(i*17)*.24)*w/cols,
          y:(Math.floor(i/cols)+.5+Math.cos(i*23)*.24)*h/rows
        })).sort((a,b)=>Math.hypot(a.x-s.x,a.y-s.y)-Math.hypot(b.x-s.x,b.y-s.y));
        s.flowerWidth=w; s.flowerHeight=h;
      }
      for(let i=0;i<count;i++) {
        const index=(i+s.stockVariant)%entry.crops.length, spec=entry.crops[index];
        const sprite=cutout(assets[spec.asset],spec.crop,entry.id+':crop:'+index,spec.shape);
        if(!sprite) continue;
        const progress=i/count, open=ease((t-progress*(options.spreadSeconds||3.1))/(options.openSeconds||1.7));
        if(!open) continue;
        const {x,y}=s.flowers[i];
        const size=min*(.13+(i%5)*.023), height=size*sprite.height/sprite.width;
        g.save(); g.translate(x,y); g.rotate(Math.sin(i*17)*.5);
        g.scale(.12+.88*open,.12+.88*open); g.globalAlpha=fade*open;
        g.drawImage(sprite,-size/2,-height/2,size,height); g.restore();
      }
    } else if(entry.behavior==='glow') {
      const variant=entry.variants[s.stockVariant];
      if(variant.mode==='backdrop') {
        cover(g,assets[variant.asset],w,h,fade);
      } else {
        const size=min*.84, settle=reduced?1:1.14-.14*ease(t/(options.settleSeconds||2.3));
        const glow=g.createRadialGradient(w/2,h/2,0,w/2,h/2,Math.max(w,h)*.65);
        glow.addColorStop(0,'rgba(255,200,66,.65)'); glow.addColorStop(.5,'rgba(255,193,60,.2)'); glow.addColorStop(1,'rgba(255,220,150,0)');
        g.globalAlpha=fade; g.fillStyle=glow; g.fillRect(0,0,w,h);
        if(variant.rays!=null) {g.save();g.translate(w/2,h/2);g.rotate(reduced?0:t*.012);g.globalAlpha=fade*.3*ease(t/2);g.drawImage(assets[variant.rays],-size*.72,-size*.72,size*1.44,size*1.44);g.restore();}
        if(assets[variant.asset].naturalWidth) {
          g.translate(w/2,h/2); g.scale(settle,settle); g.beginPath();g.arc(0,0,size*.449,0,Math.PI*2);g.clip();
          g.globalAlpha=fade;g.drawImage(assets[variant.asset],-size*.505,-size*.495,size,size);
        }
      }
    } else if(entry.behavior==='fly') {
      const spec=entry.crops[s.stockVariant];
      const sprite=cutout(assets[spec.asset],spec.crop,entry.id+':crop:'+s.stockVariant,spec.shape);
      if(sprite) for(let i=0;i<(reduced?(options.reducedCount||3):(options.count||6));i++) {
        const delay=i*(options.staggerSeconds||.65);
        const flight=clamp((t-delay)/(options.flightSeconds||14));
        if(!flight)continue;
        const x=reduced?w*(.2+i*.3):w*1.12-flight*w*1.3;
        const y=h*(.22+(i%3)*.25)+(reduced?0:Math.sin(t*.65+i)*h*.035);
        const size=min*(.18+(i%3)*.025), height=size*sprite.height/sprite.width;
        g.save();g.translate(x,y);g.rotate(reduced?0:Math.sin(t*.8+i)*.035);g.globalAlpha=fade*ease((t-delay)/.8);
        g.drawImage(sprite,-size/2,-height/2,size,height);g.restore();
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
