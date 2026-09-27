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
  function wingPoint(x,y,wing,phase) {
    // A continuous deformation of ONE bird image; the shoulder cannot detach.
    let inside=false,distance=Infinity;
    for(let i=0,j=wing.shape.length-1;i<wing.shape.length;j=i++) {
      const [ax,ay]=wing.shape[j],[bx,by]=wing.shape[i],dx=bx-ax,dy=by-ay;
      if((ay>y)!==(by>y)&&x<(bx-ax)*(y-ay)/(by-ay)+ax)inside=!inside;
      const p=clamp(((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy||1));
      distance=Math.min(distance,Math.hypot(x-ax-p*dx,y-ay-p*dy));
    }
    const edge=clamp(.5+(inside?distance:-distance)/.3),weight=edge*edge*(3-2*edge);
    const dy=y-wing.pivot[1];
    // Small smooth shear/compression cannot fold the mesh back over itself into a second wing tip.
    return [x+dy*phase*.14*weight,y];
  }
  const birdFrames=new WeakMap();
  function drawFlappingBird(g,sprite,wing,phase,size,height) {
    // Inverse-rasterize one intact bird. Triangle clips formerly sampled the full
    // sprite repeatedly and could expose a second wing edge at shared boundaries.
    // Each output pixel now has exactly one source location; there is no overlay.
    let data=birdFrames.get(sprite);
    if(!data){
      const scale=Math.min(1,512/Math.max(sprite.width,sprite.height)),source=document.createElement('canvas');
      source.width=Math.round(sprite.width*scale);source.height=Math.round(sprite.height*scale);
      const ctx=source.getContext('2d');ctx.drawImage(sprite,0,0,source.width,source.height);
      const width=source.width,rows=[];
      for(let y=0;y<source.height;y++){
        const row=new Float32Array(width);
        for(let x=0;x<width;x++)row[x]=(wingPoint(x/width,y/source.height,wing,1)[0]-x/width)*width;
        rows.push(row);
      }
      data={width,height:source.height,pad:Math.ceil(width*.16),pixels:ctx.getImageData(0,0,width,source.height).data,rows,frames:new Map()};birdFrames.set(sprite,data);
    }
    const key=Math.round(clamp((phase+1)/2)*40),amount=key/20-1;
    if(!data.frames.has(key)){
      const frame=document.createElement('canvas'),{width,height:rows,pad,pixels}=data;frame.width=width+pad*2;frame.height=rows;
      const ctx=frame.getContext('2d'),out=ctx.createImageData(frame.width,rows);
      for(let y=0;y<rows;y++)for(let x=0;x<frame.width;x++){
        const target=x-pad,row=data.rows[y];let sx=target;
        for(let iteration=0;iteration<6;iteration++){
          const q=Math.max(0,Math.min(width-1,sx)),left=Math.floor(q),right=Math.min(width-1,left+1);
          sx=target-amount*(row[left]+(row[right]-row[left])*(q-left));
        }
        if(sx<0||sx>=width-1)continue;
        const left=Math.floor(sx),mix=sx-left,a=(y*width+left)*4,b=a+4,d=(y*frame.width+x)*4;
        const alpha=pixels[a+3]*(1-mix)+pixels[b+3]*mix;out.data[d+3]=alpha;
        if(alpha)for(let channel=0;channel<3;channel++)out.data[d+channel]=(pixels[a+channel]*pixels[a+3]*(1-mix)+pixels[b+channel]*pixels[b+3]*mix)/alpha;
      }
      ctx.putImageData(out,0,0);data.frames.set(key,frame);
    }
    const padding=size*data.pad/data.width;
    g.drawImage(data.frames.get(key),-size/2-padding,-height/2,size+padding*2,height);
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
  const noise = n => {const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v)};
  function rainSample(i,time,speed=0.75) {
    const flight=(.65+noise(i+4)*.65)*.75/speed,period=flight+.95;
    const clock=time+noise(i+11)*period,cycle=Math.floor(clock/period),age=clock%period;
    const x=.025+noise(i*17+cycle*53)*.95,y=.04+noise(i*31+cycle*71)*.92;
    const p=clamp(age/flight);
    return {x,y,age,flight,period,phase:age<flight?'fall':'impact',dropX:x-(1-p)*.045,dropY:-.15+(y+.15)*p,impactAge:age-flight,depth:.3+.7*y};
  }
  function bolt(seed) {
    const paths=[],trunk=[];let x=.25+noise(seed)*.5;
    for(let j=0;j<=30;j++){x=Math.max(.12,Math.min(.88,x+(noise(seed+j*3)-.5)*.055));trunk.push([x,.06+j*.027]);}
    paths.push(trunk);
    for(let k=0;k<5;k++){
      const start=5+k*4,branch=[trunk[start]],side=k%2?1:-1;
      for(let j=1;j<10;j++){const p=branch[j-1];branch.push([p[0]+side*(.01+noise(seed+k*31+j)*.023),p[1]+.016+noise(seed+j*7)*.018]);}
      paths.push(branch);
    }
    return paths.map((path,k)=>path.flatMap((p,j)=>{
      if(!j)return [p];const prev=path[j-1];
      return [1,2,3,4].map(step=>{const f=step/4;return [prev[0]+(p[0]-prev[0])*f+(step===4?0:(noise(seed+j*19+step+k)-.5)*.006),prev[1]+(p[1]-prev[1])*f]});
    }));
  }
  window.drawStockScene = (g,s,fade,w,h,reduced) => {
    const entry=s.entry, assets=entry.images, options=entry.options;
    const countVariants=entry.behavior==='glow'?entry.variants.length:entry.behavior==='fly'?entry.crops.length:assets.length;
    if (s.stockVariant == null) {
      const next=sequence.get(entry.id)||0; s.stockVariant=next%countVariants; sequence.set(entry.id,next+1);
    }
    const t=s.life, min=Math.min(w,h);
    g.save();
    if(window.TenzerNature?.draw(g,s,fade,w,h,reduced)){g.restore();return;}
    if (entry.behavior==='bloom') {
      const count=Math.round(reduced?(options.reducedCount||30):Math.min(options.countMax||150,Math.max(options.countMin||90,Math.round(w*h/35000))));
      if(!s.flowers || s.flowerWidth!==w || s.flowerHeight!==h) {
        const cx=s.x??w/2,cy=s.y??h/2;
        s.flowers=[];
        const groups=4,perBranch=Math.ceil(count/groups);
        s.blossomBranches=[];s.blossomTwigs=[];
        const curves=[[[0,1.02],[.04,.47],[.44,.76],[.72,.32]],[[1.03,.87],[.84,.8],[.94,.37],[.46,.19]],[[-.03,.12],[.2,.1],[.15,.47],[.48,.39]],[[.96,-.03],[.91,.25],[.65,.06],[.55,.23]]];
        const point=(branch,q)=>{const [a,b,c,d]=curves[branch],v=1-q;return {x:w*(v*v*v*a[0]+3*v*v*q*b[0]+3*v*q*q*c[0]+q*q*q*d[0]),y:h*(v*v*v*a[1]+3*v*v*q*b[1]+3*v*q*q*c[1]+q*q*q*d[1])}};
        for(let branch=0;branch<groups;branch++)s.blossomBranches.push(Array.from({length:41},(_,i)=>point(branch,i/40)));
        for(let branch=0;branch<groups;branch++)for(let k=0;k<7;k++){
          const q=.18+k*.105,root=point(branch,q),next=point(branch,Math.min(1,q+.1)),dx=next.x-root.x,dy=next.y-root.y,len=Math.hypot(dx,dy)||1,side=k%2?1:-1;
          const length=min*(.09+noise(branch*9+k+75)*.11),tx=dx/len,ty=dy/len;
          const tip={x:root.x+length*(tx*.7-ty*side*.8),y:root.y+length*(ty*.7+tx*side*.8)};
          s.blossomTwigs.push({branch,q,root,tip,delay:q*2.2+branch*.18});
        }
        for(let i=0;i<count;i++){
          const group=Math.floor(i/perBranch),local=i%perBranch,q=(local+.4)/perBranch,twig=s.blossomTwigs[group*7+local%7],u=.38+noise(i+58)*.62;
          const anchor=i%4===0?point(group,q):{x:twig.root.x+(twig.tip.x-twig.root.x)*u,y:twig.root.y+(twig.tip.y-twig.root.y)*u};
          const x=anchor.x+(noise(i+24)-.5)*min*.03,y=anchor.y+(local%2?1:-1)*min*(.009+noise(i+6)*.018);
          s.flowers.push({x,y,anchor,group,delay:(i%4===0?q:twig.q+.2*u)*(options.spreadSeconds||2.5)+group*.18,size:min*(.045+noise(i+91)*.045),rotation:(noise(i+34)-.5)*1.1});
        }
        s.flowerWidth=w; s.flowerHeight=h;
      }
      // Continuous sweeping branches connect the staggered blossoms, leaving open breathing space.
      for(let b=0;b<s.blossomBranches.length;b++){
        const points=s.blossomBranches[b],p=reduced?1:clamp((t-b*.18)/2.2);
        g.globalAlpha=fade*.9;g.fillStyle='#514139';g.lineCap='round';
        const end=Math.min(points.length-1,Math.ceil((points.length-1)*p)),edges=[[],[]];
        for(let j=0;j<=end;j++){const a=points[Math.max(0,j-1)],c=points[Math.min(points.length-1,j+1)],dx=c.x-a.x,dy=c.y-a.y,len=Math.hypot(dx,dy)||1,r=min*(.008*Math.pow(1-j/points.length,1.4)+.0005);for(let side=0;side<2;side++)edges[side].push([points[j].x-dy/len*r*(side?1:-1),points[j].y+dx/len*r*(side?1:-1)])}
        g.beginPath();[...edges[0],...edges[1].reverse()].forEach(([x,y],j)=>j?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();
      }
      for(const twig of s.blossomTwigs){const p=reduced?1:ease((t-twig.delay)/1.3),{root,tip}=twig;
        g.globalAlpha=fade*.78;g.strokeStyle='#685044';g.lineWidth=min*.003;g.beginPath();g.moveTo(root.x,root.y);g.quadraticCurveTo(root.x+(tip.x-root.x)*p*.3,root.y+(tip.y-root.y)*p*.55,root.x+(tip.x-root.x)*p,root.y+(tip.y-root.y)*p);g.stroke();
        if(p>.5){g.lineWidth=min*.0012;const ax=root.x+(tip.x-root.x)*.6,ay=root.y+(tip.y-root.y)*.6;g.beginPath();g.moveTo(ax,ay);g.lineTo(ax+(tip.x-root.x)*.35*(p-.5)*2+(tip.y-root.y)*.22,ay+(tip.y-root.y)*.35*(p-.5)*2-(tip.x-root.x)*.22);g.stroke()}
      }
      for(const f of s.flowers){g.globalAlpha=fade*.35*(reduced?1:ease((t-f.delay)/.5));g.lineWidth=1;g.beginPath();g.moveTo(f.anchor.x,f.anchor.y);g.lineTo(f.x,f.y);g.stroke()}
      // Sparse botanical accents sit behind the blossoms, never over their petals.
      const leafCount=Math.min(count,options.leafCount??22);
      for(let j=0;j<leafCount;j++) {
        const i=Math.floor(j*count/leafCount),flower=s.flowers[i];
        const p=reduced?1:clamp((t-flower.delay-.12)/2),unfurl=p*p*(3-2*p);
        if(!unfurl)continue;
        const length=flower.size*(.38+noise(j+503)*.2),side=j%2?1:-1;
        const sway=reduced?0:Math.sin(t*.8+j*1.7)*.035;
        g.save();g.translate(flower.x,flower.y+flower.size*.12);
        g.rotate(side*(.55+noise(j+631)*.9)+sway);
        g.scale(reduced?1:unfurl,reduced?1:.35+.65*unfurl);
        g.globalAlpha=fade*ease(p*2)*.67;
        const pigment=g.createLinearGradient(0,0,length,-length*.2);
        pigment.addColorStop(0,'#526b50');pigment.addColorStop(.5,j%3?'#81936b':'#8d9e82');pigment.addColorStop(1,'#bbc19a');
        g.fillStyle=pigment;g.beginPath();g.moveTo(0,0);
        g.bezierCurveTo(length*.23,-length*.4,length*.72,-length*.46,length,-length*.18);
        g.bezierCurveTo(length*.7,length*.18,length*.26,length*.27,0,0);g.fill();
        g.strokeStyle='rgba(236,232,202,.45)';g.lineWidth=Math.max(.6,min*.0008);
        g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(length*.5,-length*.035,length*.94,-length*.17);g.stroke();
        for(let vein=1;vein<4;vein++){
          const a=vein/5;g.beginPath();g.moveTo(length*a,-length*.1*a);
          g.quadraticCurveTo(length*(a+.05),-length*.18,length*(a+.14),-length*.27);g.stroke();
        }
        g.restore();
      }
      for(let i=0;i<count;i++) {
        const index=(s.flowers[i].group*2+(i%2)+s.stockVariant)%entry.crops.length, spec=entry.crops[index];
        const sprite=cutout(assets[spec.asset],spec.crop,entry.id+':crop:'+index,spec.shape,spec.transparent);
        if(!sprite) continue;
        const age=t-s.flowers[i].delay,p=reduced?1:clamp(age/(options.openSeconds||1.15)),open=1-Math.pow(1-p,3);
        if(!open) continue;
        const {x,y,rotation}=s.flowers[i],size=Math.min(s.flowers[i].size,sprite.width),height=size*sprite.height/sprite.width;
        const pivot=spec.pivot||[.5,.5];
        const sway=reduced?0:Math.sin(t*.8+i)*.035;
        // Continuous unfurling: no overshoot, shudder, spinning or circular wipe.
        g.save();g.translate(x,y);g.rotate(rotation+sway);
        g.scale(reduced?1:.18+.82*open,reduced?1:.3+.7*open);g.globalAlpha=fade*ease(p*2);
        g.drawImage(sprite,-size*pivot[0],-height*pivot[1],size,height);
        g.restore();
      }
      if(!reduced) {
        const petal=fallingPetal(assets[0]),total=options.petalCount||28,fall=options.petalFallSeconds||5;
        for(let i=0;i<total;i++) {
          const age=t-2-i*.12;if(age<0)continue;
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
        const warmth=g.createRadialGradient(w*.5,h*.5,min*.12,w*.5,h*.5,Math.hypot(w,h)*.65);
        warmth.addColorStop(0,'rgba(255,209,96,.68)');warmth.addColorStop(.5,'rgba(255,184,64,.34)');warmth.addColorStop(1,'rgba(255,202,116,.10)');
        g.globalAlpha=fade*(.94+.06*pulse);g.fillStyle=warmth;g.fillRect(0,0,w,h);
        const glow=g.createRadialGradient(w/2,h/2,0,w/2,h/2,Math.max(w,h)*(.52+.045*pulse));
        glow.addColorStop(0,'rgba(255,236,165,.85)'); glow.addColorStop(.5,'rgba(255,199,76,.32)'); glow.addColorStop(1,'rgba(255,220,150,0)');
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
        if(spec.wing&&!reduced) {
          const phase=Math.sin(t*Math.PI*2/(options.flapSeconds||.85)+i*1.3);
          drawFlappingBird(g,sprite,spec.wing,phase,size,height);
        } else g.drawImage(sprite,-size/2,-height/2,size,height);
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
    } else if(entry.behavior==='rainbow') {
      cover(g,assets[0],w,h,fade);
      const img=assets[1],progress=reduced?1:clamp(t/(options.growSeconds||4.5));
      if(!s.rainbowLayer){s.rainbowLayer=document.createElement('canvas');s.rainbowLayer.width=img.naturalWidth;s.rainbowLayer.height=img.naturalHeight;}
      const layer=s.rainbowLayer,c=layer.getContext('2d'),lw=layer.width,lh=layer.height;
      c.clearRect(0,0,lw,lh);c.globalCompositeOperation='source-over';c.drawImage(img,0,0,lw,lh);
      // Feather only the independent spectral object, never wipe the landscape.
      c.globalCompositeOperation='destination-in';
      const edge=-.22+progress*1.6,mask=c.createLinearGradient((edge-.2)*lw,0,edge*lw,lh*.12);
      mask.addColorStop(0,'#000');mask.addColorStop(1,'transparent');c.fillStyle=mask;c.fillRect(0,0,lw,lh);
      const arcScale=options.scale||1.2;
      g.globalAlpha=fade*.76;g.drawImage(layer,-w*(arcScale-1)/2,h*(1-arcScale)*.65+(reduced?0:-(1-progress)*h*.07),w*arcScale,h*arcScale);
    } else if(entry.behavior==='lightning') {
      cover(g,assets[0],w,h,fade);
      const interval=Math.max(2.4,options.intervalSeconds||3.8),elapsed=Math.max(0,t-.6),strike=Math.floor(elapsed/interval);
      const age=elapsed%interval,span=options.strikeSeconds||1.1;
      const intensity=reduced?.28:(t<.6?0:ease(age/.055)*(1-ease((age-.12)/(span-.12))));
      if(intensity>0){
        if(!s.bolts||s.boltIndex!==(reduced?0:strike)){s.bolts=bolt(17+(reduced?0:strike)*53);s.boltIndex=reduced?0:strike;}
        const light=g.createRadialGradient(w*.5,h*.35,0,w*.5,h*.35,min*.65);
        light.addColorStop(0,'rgba(185,193,255,.16)');light.addColorStop(1,'rgba(185,193,255,0)');
        g.globalAlpha=fade*intensity;g.fillStyle=light;g.fillRect(0,0,w,h);
        g.lineJoin='round';g.lineCap='round';
        for(let layer=0;layer<3;layer++) {
          g.strokeStyle=['rgba(110,137,255,.16)','rgba(164,185,255,.5)','#eff5ff'][layer];
          s.bolts.forEach((path,i)=>{
            const reveal=reduced?1:clamp((age-(i? .025:0))/.055);
            g.lineWidth=Math.max(.7,min*[.013,.005,.0015][layer])*(i?.52:1);
            g.beginPath();path.slice(0,Math.max(1,Math.ceil(path.length*reveal))).forEach(([x,y],j)=>j?g.lineTo(x*w,y*h):g.moveTo(x*w,y*h));g.stroke();
          });
        }
      }
    } else if(entry.behavior==='rain') {
      const fabric=options.surfaces?.[s.stockVariant]==='fabric';
      if(!s.wetFloor||s.wetFloorVariant!==s.stockVariant||s.wetFloor.width!==Math.ceil(w)||s.wetFloor.height!==Math.ceil(h)) {
        s.wetFloor=document.createElement('canvas');s.wetFloor.width=Math.ceil(w);s.wetFloor.height=Math.ceil(h);
        s.wetFloorVariant=s.stockVariant;
        const floor=s.wetFloor.getContext('2d');cover(floor,assets[s.stockVariant],w,h,1);
        floor.fillStyle='rgba(17,35,57,.18)';floor.fillRect(0,0,w,h);
      }
      g.globalAlpha=fade;g.drawImage(s.wetFloor,0,0,w,h);
      const count=reduced?(options.reducedCount||85):(options.count||520),time=reduced?0:t;
      g.lineCap='round';
      for(let i=0;i<count;i++) {
        const event=rainSample(i,time,options.speed||.75),{depth}=event,x=event.x*w,y=event.y*h;
        if(event.phase==='fall'){
          const length=min*(.012+.022*depth),dx=event.dropX*w,dy=event.dropY*h;
          g.globalAlpha=fade*(.16+.35*depth);g.strokeStyle='#e4f0ff';g.lineWidth=.55+depth;
          g.beginPath();g.moveTo(dx-length*.12,dy-length);g.lineTo(dx,dy);g.stroke();
        } else {
          const p=event.impactAge/.95,scale=min/800,r=(2+p*26)*depth*scale,ry=r*(.22+.15*depth);
          if(fabric){
            // Beads begin at the impact, then accelerate downhill on curved fabric.
            const travel=Math.pow(Math.max(0,p-.14),2),bx=x+(event.x-.5)*travel*min*.08,by=y+travel*min*.09;
            const br=Math.max(.7,(1.5+Math.sin(p*Math.PI)*1.8)*depth*scale);
            g.globalAlpha=fade*(1-p)*.28;g.strokeStyle='#b8ddff';g.lineWidth=br*.65;
            g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x,by,bx,by);g.stroke();
            g.save();g.beginPath();g.ellipse(bx,by,br,br*1.4,.25,0,Math.PI*2);g.clip();
            g.globalAlpha=fade*(1-p)*.8;g.drawImage(s.wetFloor,-br*.4,-br*.5,w+br,h+br);g.restore();
            g.globalAlpha=fade*(1-p)*.65;g.strokeStyle='#173d75';g.lineWidth=Math.max(.5,scale*.6);
            g.beginPath();g.ellipse(bx,by,br,br*1.4,.25,0,Math.PI*2);g.stroke();
            g.fillStyle='#edf7ff';g.beginPath();g.ellipse(bx-br*.3,by-br*.5,br*.38,br*.3,0,0,Math.PI*2);g.fill();
          } else {
          // Refract the actual floor only beneath the expanding water ring.
          // Tile seams remain anchored; ripples and reflections move with impacts.
          const sx=Math.max(0,x-r-3),sy=Math.max(0,y-ry-3),sw=Math.min(w-sx,r*2+6),sh=Math.min(h-sy,ry*2+6);
          g.save();g.beginPath();g.ellipse(x,y,r,ry,0,0,Math.PI*2);g.clip();g.globalAlpha=fade*(1-p)*.7;
          g.drawImage(s.wetFloor,sx,sy,sw,sh,sx+Math.sin(p*12)*1.8*depth,sy+Math.cos(p*12)*depth,sw,sh);g.restore();
          for(let ring=0;ring<2;ring++){
            const radius=r*(1-ring*.28);g.globalAlpha=fade*(1-p)*(.32-ring*.1);g.lineWidth=(.65+depth*.5)*scale;g.strokeStyle=ring?'#182d42':'#dceafa';
            g.beginPath();g.ellipse(x,y,radius,ry*(1-ring*.28),0,0,Math.PI*2);g.stroke();
          }
          }
          if(event.impactAge<.36){
            const q=event.impactAge/.36;
            g.globalAlpha=fade*(1-q)*.8;g.fillStyle='#e4f0ff';
            for(let k=0;k<5;k++){
              const angle=k*Math.PI*2/5+i,radius=q*16*depth*scale;
              const px=x+Math.cos(angle)*radius,py=y+Math.sin(angle)*radius*.28-Math.sin(q*Math.PI)*14*depth*scale;
              g.beginPath();g.ellipse(px,py,Math.max(.5,depth*1.3*scale),Math.max(.7,depth*1.8*scale),0,0,Math.PI*2);g.fill();
            }
          }
        }
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
  window.TenzerScenes={prepare,rainSample,wingPoint,drawFlappingBird};
})();
