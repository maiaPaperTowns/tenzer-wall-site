/* Original user-supplied artwork. All motion and masks are browser-rendered. */
(() => {
  const clamp = n => Math.max(0, Math.min(1, n));
  const ease = n => 1 - Math.pow(1 - clamp(n), 3);
  const files = {
    flower: ['azalea.jpg', 'rose.jpg', 'pink-clusters.jpg', 'cherry-photo.png', 'botanical.jpg'],
    sun: ['solar-disc.png', 'sunset.png', 'sun-rays.png'],
    bird: ['snow-bird.jpg', 'blue-bird.jpg', 'indigo-bird.jpg'],
    mountain: ['umbrian.jpg', 'crystal.jpg', 'holy-cross.jpg']
  };
  const assets = Object.fromEntries(Object.entries(files).map(([kind, names]) => [kind, names.map(name => {
    const img = new Image(); img.src = 'assets/stock/' + name; return img;
  })]));
  const sequence = {flower: 0, sun: 0, bird: 0, mountain: 0};
  const cache = new Map();
  // Source-coordinate crops retain the supplied painting, not a generated redraw.
  const flowers = [
    [0,.335,.19,.345,.445], [1,.285,.125,.265,.33],
    [2,.347,.373,.2,.235], [2,.523,.22,.197,.24],
    [3,.43,.29,.12,.1], [4,.54,.56,.115,.12],
    [4,.30,.70,.125,.13], [4,.305,.275,.08,.085], [4,.66,.08,.095,.1]
  ];
  const birds = [
    {crop:[.39,.20,.445,.22], shape:[[0,.77],[.16,.65],[.37,.44],[.85,0],[1,0],[.77,.37],[.69,.61],[.53,.86],[.25,.99],[.08,.93]]},
    {crop:[.249,.088,.434,.297], shape:[[0,.27],[.18,.16],[.65,.13],[.97,0],[1,.05],[.92,.19],[.96,.41],[.89,1],[.72,.81],[.61,.61],[.41,.94],[.05,.9],[.31,.61],[.27,.45],[.09,.38]]},
    {crop:[.24,.444,.39,.15], shape:[[0,.12],[.12,0],[.28,.09],[.42,.33],[.67,.51],[1,.59],[.92,.75],[.65,.76],[.68,.95],[.46,1],[.22,.6],[.12,.29]]}
  ];
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
    if (s.stockVariant == null) s.stockVariant = sequence[s.kind]++ % assets[s.kind].length;
    const t=s.life, min=Math.min(w,h);
    g.save();
    if (s.kind==='flower') {
      const count=reduced?24:Math.min(150,Math.max(70,Math.round(w*h/13000)));
      if(!s.flowers || s.flowerWidth!==w || s.flowerHeight!==h) {
        const cols=Math.ceil(Math.sqrt(count*w/h)), rows=Math.ceil(count/cols);
        s.flowers=Array.from({length:cols*rows},(_,i)=>({
          x:((i%cols)+.5+Math.sin(i*17)*.24)*w/cols,
          y:(Math.floor(i/cols)+.5+Math.cos(i*23)*.24)*h/rows
        })).sort((a,b)=>Math.hypot(a.x-s.x,a.y-s.y)-Math.hypot(b.x-s.x,b.y-s.y));
        s.flowerWidth=w; s.flowerHeight=h;
      }
      for(let i=0;i<count;i++) {
        const spec=flowers[(i+s.stockVariant)%flowers.length];
        const sprite=cutout(assets.flower[spec[0]],spec.slice(1),'f'+((i+s.stockVariant)%flowers.length));
        if(!sprite) continue;
        const progress=i/count, open=ease((t-progress*3.1)/1.7);
        if(!open) continue;
        const {x,y}=s.flowers[i];
        const size=min*(.13+(i%5)*.023), height=size*sprite.height/sprite.width;
        g.save(); g.translate(x,y); g.rotate(Math.sin(i*17)*.5);
        g.scale(.12+.88*open,.12+.88*open); g.globalAlpha=fade*open;
        g.drawImage(sprite,-size/2,-height/2,size,height); g.restore();
      }
    } else if(s.kind==='sun') {
      if(s.stockVariant===1) {
        cover(g,assets.sun[1],w,h,fade);
      } else {
        const size=min*.84, settle=reduced?1:1.14-.14*ease(t/2.3);
        const glow=g.createRadialGradient(w/2,h/2,0,w/2,h/2,Math.max(w,h)*.65);
        glow.addColorStop(0,'rgba(255,200,66,.65)'); glow.addColorStop(.5,'rgba(255,193,60,.2)'); glow.addColorStop(1,'rgba(255,220,150,0)');
        g.globalAlpha=fade; g.fillStyle=glow; g.fillRect(0,0,w,h);
        if(assets.sun[2].naturalWidth) {g.save();g.translate(w/2,h/2);g.rotate(reduced?0:t*.012);g.globalAlpha=fade*.3*ease(t/2);g.drawImage(assets.sun[2],-size*.72,-size*.72,size*1.44,size*1.44);g.restore();}
        if(assets.sun[0].naturalWidth) {
          g.translate(w/2,h/2); g.scale(settle,settle); g.beginPath();g.arc(0,0,size*.449,0,Math.PI*2);g.clip();
          g.globalAlpha=fade;g.drawImage(assets.sun[0],-size*.505,-size*.495,size,size);
        }
      }
    } else if(s.kind==='bird') {
      const spec=birds[s.stockVariant];
      const sprite=cutout(assets.bird[s.stockVariant],spec.crop,'b'+s.stockVariant,spec.shape);
      if(sprite) for(let i=0;i<(reduced?3:6);i++) {
        const flight=clamp((t-i*.65)/14);
        if(!flight)continue;
        const x=reduced?w*(.2+i*.3):w*1.12-flight*w*1.3;
        const y=h*(.22+(i%3)*.25)+(reduced?0:Math.sin(t*.65+i)*h*.035);
        const size=min*(.18+(i%3)*.025), height=size*sprite.height/sprite.width;
        g.save();g.translate(x,y);g.rotate(reduced?0:Math.sin(t*.8+i)*.035);g.globalAlpha=fade*ease((t-i*.65)/.8);
        g.drawImage(sprite,-size/2,-height/2,size,height);g.restore();
      }
    } else if(s.kind==='mountain') {
      const img=assets.mountain[s.stockVariant];
      // The original composition fills the canvas, with no strip slicing or synthetic peaks.
      // Broad, overlapping soft reveals keep the painting's actual contours intact.
      if(img.naturalWidth) {
        const key='landscape'+s.stockVariant+':'+w+':'+h;
        let layer=cache.get(key);
        if(!layer) {layer=document.createElement('canvas');layer.width=w;layer.height=h;cache.set(key,layer);}
        const c=layer.getContext('2d');c.clearRect(0,0,w,h);c.globalCompositeOperation='source-over';
        for(let i=0;i<5;i++) {
          const reveal=ease((t-i*.32)/2.4);if(!reveal)continue;
          const x=w*(.15+i*.18),y=h*(.3+(i%3)*.2),r=Math.hypot(w,h)*reveal*.75;
          const mask=c.createRadialGradient(x,y,0,x,y,Math.max(1,r));
          mask.addColorStop(0,'#000');mask.addColorStop(.55,'#000');mask.addColorStop(1,'transparent');c.fillStyle=mask;c.fillRect(0,0,w,h);
        }
        c.globalCompositeOperation='source-in'; cover(c,img,w,h,1);
        g.globalAlpha=fade;g.drawImage(layer,0,0,w,h);
        // Avoid unbounded cached canvases after window resizing.
        for(const k of cache.keys())if(k.startsWith('landscape')&&k!==key)cache.delete(k);
      }
    }
    g.restore();
  };
})();
