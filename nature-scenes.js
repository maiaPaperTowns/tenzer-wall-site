/* Data-driven nature scenes. Original photographs stay intact; motion is rendered live. */
(() => {
  const clamp=n=>Math.max(0,Math.min(1,n)),ease=n=>{n=clamp(n);return n*n*(3-2*n)};
  const noise=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v)};
  const types=new Set(['tree','fire','moon','snow','wind','river','ocean','water','bamboo','fish','star','cloud','leaves','cat']);
  const colorCache=new WeakMap();
  function colored(img,filter){let variants=colorCache.get(img);if(!variants){variants=new Map();colorCache.set(img,variants)}if(!variants.has(filter)){const c=document.createElement('canvas'),scale=Math.min(1,1600/Math.max(img.width,img.height));c.width=Math.round(img.width*scale);c.height=Math.round(img.height*scale);const g=c.getContext('2d');g.filter=filter;g.drawImage(img,0,0,c.width,c.height);variants.set(filter,c)}return variants.get(filter)}
  function cover(g,img,w,h,alpha=1){const k=Math.max(w/img.width,h/img.height);g.globalAlpha=alpha;g.drawImage(img,(w-img.width*k)/2,(h-img.height*k)/2,img.width*k,img.height*k)}
  // Continuous surface displacement; overlapping strips avoid cracks without rotating the photograph.
  function livingWater(g,img,w,h,clock,alpha,start=0,strength=1,full=false){
    const k=Math.max(w/img.width,h/img.height),sw=full?img.width:w/k,sh=full?img.height:h/k,sx=(img.width-sw)/2,sy=(img.height-sh)/2;
    g.globalAlpha=alpha;
    const step=3;
    for(let y=0;y<h;y+=step){const depth=clamp((y/h-start)/(1-start)),a=depth*strength;
      const dx=(Math.sin(y/h*24-clock*1.1)+.45*Math.sin(y/h*49+clock*.72))*w*.004*a;
      const dy=(Math.sin(y/h*31-clock*.85)*.003+(full?Math.sin(y/h*11-clock*1.05)*.019:0))*h*a;
      const sourceY=Math.max(0,Math.min(img.height-(step+1)*sh/h,sy+(y+dy)*sh/h));
      g.drawImage(img,sx,sourceY,sw,(step+1)*sh/h,-w*.012+dx,y,w*1.024,step+1);
    }
  }
  function leaf(g,img,index,x,y,size,rotation,alpha){g.save();g.translate(x,y);g.rotate(rotation);g.globalAlpha=alpha;g.drawImage(img,(index%2)*img.width/2,Math.floor(index/2)%2*img.height/2,img.width/2,img.height/2,-size/2,-size*.94,size,size);g.restore()}
  function glyphPoints(s){
    const fontActive=document.documentElement.classList.contains('wf-active');
    if(s.inkPoints&&s.inkFontActive===fontActive)return s.inkPoints;
    s.inkFontActive=fontActive;
    const c=document.createElement('canvas');c.width=c.height=160;const g=c.getContext('2d');
    g.font='120px "uddigikyokasho-pro", sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(s.entry.glyph,80,80);
    const d=g.getImageData(0,0,160,160).data,points=[];
    for(let y=0;y<160;y+=5)for(let x=0;x<160;x+=5)if(d[(y*160+x)*4+3]>100)points.push([x/160-.5,y/160-.5]);
    return s.inkPoints=points;
  }
  function dissolve(g,s,t,w,h,fade,kind,reduced){
    if(reduced||t>4)return;
    const min=Math.min(w,h),x=s.x??w*.5,y=s.y??h*.5,points=glyphPoints(s),p=ease((t-.25)/2.8);
    g.globalAlpha=fade*(1-ease((t-.25)/1.4));g.fillStyle='#293335';g.textAlign='center';g.textBaseline='middle';g.font=`${min*.2}px "uddigikyokasho-pro", sans-serif`;g.fillText(s.entry.glyph,x,y);
    points.forEach(([px,py],i)=>{
      const dx=(noise(i+31)-.5)*min*p*.65,dy=kind==='fire'?-p*min*(.15+noise(i)*.6):p*min*(.1+noise(i)*.45);
      g.globalAlpha=fade*ease(t/.4)*(1-ease((t-2)/2));
      g.fillStyle=kind==='fire'?`hsl(${25+noise(i)*25} 95% 65%)`:kind==='snow'?'#fff':'#b6e3ee';
      g.beginPath();g.arc(x+px*min*.24+dx,y+py*min*.24+dy,Math.max(.6,min*.002*(1+p)),0,Math.PI*2);g.fill();
    });
  }
  function tree(g,s,t,w,h,fade,reduced){
    const atlas=s.entry.images[1],min=Math.min(w,h);
    if(!s.treeSprites){
      s.treeSprites=[0,1,2,3].map(index=>{const c=document.createElement('canvas');c.width=c.height=768;const ctx=c.getContext('2d');
        if(index===3){const img=s.entry.images[0],scale=Math.min(768/img.width,768/img.height);ctx.drawImage(img,(768-img.width*scale)/2,768-img.height*scale,img.width*scale,img.height*scale)}
        else {const crops=[[0,0,.5,.585],[.5,0,.5,.585],[0,.59,.51,.4]], [x,y,w,h]=crops[index],sw=w*atlas.width,sh=h*atlas.height,scale=Math.min(768/sw,768/sh);ctx.drawImage(atlas,x*atlas.width,y*atlas.height,sw,sh,(768-sw*scale)/2,768-sh*scale,sw*scale,sh*scale)}return c});
      s.treeLayer=document.createElement('canvas');s.treeLayer.width=s.treeLayer.height=768;
    }
    // 木 remains one rooted tree; small canopy regions unfurl independently.
    const sizeLimit=Math.min(1.04,w/h*.88),targetX=Math.max(h*sizeLimit*.48,Math.min(w-h*sizeLimit*.48,s.x??w*.5));
    const placements=[[targetX/w,sizeLimit,1,3,0]];
    const layer=s.treeLayer,c=layer.getContext('2d'),z=layer.width;
    placements.forEach(([nx,scale,opacity,index,delay],i)=>{
      const p=reduced?1:clamp((t-delay)/(s.entry.options.growSeconds||6)),size=h*scale;
      c.clearRect(0,0,z,z);c.globalCompositeOperation='source-over';c.drawImage(s.treeSprites[index],0,0);
      c.globalCompositeOperation='destination-in';
      // Build the trunk first, then overlapping soft leaf-cluster masks, not a whole-image fade.
      if(!s.treeMask){s.treeMask=document.createElement('canvas');s.treeMask.width=s.treeMask.height=z}
      const m=s.treeMask.getContext('2d');m.clearRect(0,0,z,z);m.fillStyle='#000';
      const trunk=reduced?1:ease(t/3.5);m.beginPath();m.moveTo(z*.47,z);m.lineTo(z*.48,z*(1-trunk*.76));m.lineTo(z*.55,z*(1-trunk*.76));m.lineTo(z*.57,z);m.fill();
      for(let j=0;j<38;j++){const ax=.16+noise(j+40)*.69,ay=.08+noise(j+92)*.73,open=reduced?1:ease((t-1.4-(1-ay)*4.5-noise(j)*2)/2.3);if(!open)continue;const r=z*(.1+noise(j+8)*.065)*open,mask=m.createRadialGradient(ax*z,ay*z,0,ax*z,ay*z,r);mask.addColorStop(0,'#000');mask.addColorStop(.7,'#000');mask.addColorStop(1,'transparent');m.fillStyle=mask;m.fillRect(ax*z-r,ay*z-r,r*2,r*2)}
      m.globalAlpha=reduced?1:ease((t-8)/2);m.fillStyle='#000';m.fillRect(0,0,z,z);m.globalAlpha=1;c.drawImage(s.treeMask,0,0);
      const emergence=reduced?1:ease(t/4),rootY=(s.y??h*.5)*(1-emergence)+h*1.035*emergence;
      g.save();g.translate(nx*w,rootY);g.scale(.18+.82*emergence,.18+.82*emergence);g.transform(1,0,reduced?0:Math.sin(t*.6+i)*.009,1,0,0);g.globalAlpha=fade*opacity;g.drawImage(layer,-size*.5,-size,size,size);
      const anchors=index===3?[[.55,.24],[.76,.34],[.43,.45],[.67,.52],[.26,.62],[.8,.68],[.42,.76]]:index===2?[[.3,.5],[.4,.6],[.67,.65],[.78,.76],[.43,.8]]:[[.36,.28],[.63,.32],[.27,.48],[.7,.53],[.43,.62]];
      anchors.forEach(([ax,ay],j)=>{
        const open=reduced?1:ease((t-delay-1.8-(1-ay)*3.8-j*.08)/2.2);if(!open)return;
        const leafSize=Math.min(size*.09,min*.09)*open;
        g.save();g.translate((ax-.5)*size,(ay-1)*size);g.rotate((ax-.5)*1.1+(reduced?0:Math.sin(t*1.1+j+i)*.035));g.scale(.4+.6*open,1);g.globalAlpha=fade*opacity*.9;g.drawImage(atlas,atlas.width*.52,atlas.height*.59,atlas.width*.46,atlas.height*.4,-leafSize*.5,-leafSize*.88,leafSize,leafSize*.87);g.restore();
      });g.restore();
    });
  }
  function fire(g,s,t,w,h,fade,reduced){
    const min=Math.min(w,h),o=s.entry.options,spread=reduced?1:ease(t/(o.spreadSeconds||3.5)),clock=reduced?2:t;
    g.globalAlpha=fade*spread;g.fillStyle='#100b10';g.fillRect(0,0,w,h);
    const bands=Math.max(8,Math.ceil(w/h*9)),img=s.entry.images[0];
    g.save();g.globalCompositeOperation='screen';
    for(let i=0;i<bands;i++){
      const phase=clock*(1.4+noise(i)*.6)+i*2.1,fh=h*(.55+noise(i+8)*.5+.07*Math.sin(phase))*(.15+.85*spread),fw=min*(.25+noise(i+4)*.27);
      const x=(i+.5)*w/bands+Math.sin(phase*.7)*min*.024;
      g.save();g.translate(x,h+fh*.08);g.transform(1,0,Math.sin(phase)*.045,1,0,0);g.globalAlpha=fade*spread*(.7+.12*Math.sin(phase));
      const crop=[[0,0,.56,.57],[.59,0,.4,.57],[.1,.59,.4,.4],[.60,.57,.39,.43]][i%4];
      g.drawImage(img,crop[0]*img.width,crop[1]*img.height,crop[2]*img.width,crop[3]*img.height,-fw/2,-fh,fw,fh);g.restore();
    }
    for(let i=0;i<(reduced?20:o.emberCount||90);i++){
      const p=(noise(i)+clock*(.09+noise(i+7)*.08))%1,x=noise(i+20)*w+Math.sin(p*7+i)*min*.055,y=h*(1-p);
      g.globalAlpha=fade*spread*Math.sin(p*Math.PI)*.8;g.fillStyle=i%3?'#ffc77a':'#ff7541';g.beginPath();g.ellipse(x,y,min*.0015,min*.004,Math.sin(i+clock)*.3,0,Math.PI*2);g.fill();
    }g.restore();dissolve(g,s,t,w,h,fade,'fire',reduced);
  }
  function moon(g,s,t,w,h,fade,reduced){
    const min=Math.min(w,h),night=reduced?1:ease(t/(s.entry.options.nightSeconds||3)),rise=reduced?1:ease((t-.5)/(s.entry.options.riseSeconds||4));
    const sky=g.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#070e22');sky.addColorStop(.65,'#152c48');sky.addColorStop(1,'#526c80');
    g.globalAlpha=fade*night;g.fillStyle=sky;g.fillRect(0,0,w,h);
    for(let i=0;i<75;i++){g.globalAlpha=fade*night*.5;g.fillStyle='#e3e9f0';g.beginPath();g.arc(noise(i)*w,noise(i+63)*h*.75,.4+noise(i+3),0,Math.PI*2);g.fill()}
    const x=w*.55,y=h*(.47+(1-rise)*.2),r=min*.22;
    const halo=g.createRadialGradient(x,y,r*.55,x,y,r*2.6);halo.addColorStop(0,'rgba(200,224,255,.2)');halo.addColorStop(1,'rgba(200,224,255,0)');
    g.globalAlpha=fade*rise;g.fillStyle=halo;g.fillRect(0,0,w,h);
    const img=s.entry.images[0];g.save();g.globalCompositeOperation='screen';g.globalAlpha=fade*rise;
    g.drawImage(img,x-r,y-r,r*2,r*2);g.restore();
  }
  function snow(g,s,t,w,h,fade,reduced){
    const min=Math.min(w,h),clock=reduced?2:t,arrive=reduced?1:ease((t-.35)/2.5),o=s.entry.options;
    const img=s.entry.images[0],scale=Math.max(w/img.width,h/img.height),ih=img.height*scale;
    cover(g,img,w,h,fade*arrive);
    const ground=Math.max(h*.64,Math.min(h*.86,(h-ih)/2+ih*.64));
    const count=reduced?(o.reducedCount||35):(o.count||170);
    for(let i=0;i<count;i++){
      const depth=.3+noise(i+19)*.7,event=snowSample(i,clock),size=min*(.006+depth*.026),land=ground+noise(i+48)*(h*.98-ground);
      const x=(.04+noise(i+70)*.92)*w+Math.sin(event.fall*Math.PI)*Math.sin(i+event.fall*5)*min*.045,y=-40+event.fall*(land+40);
      g.save();g.translate(x,y);g.rotate(event.phase==='fall'?event.fall*2+i:i+2);g.scale(event.scale,event.phase==='fall'?1:event.scale*.28);g.globalAlpha=fade*arrive*(.7+depth*.3)*event.alpha;
      if(i%4===0){g.filter='brightness(0) invert(1)';g.drawImage(s.entry.images[1],-size/2,-size/2,size,size)}
      else {g.fillStyle='#fff';g.beginPath();g.arc(0,0,size*.1,0,Math.PI*2);g.fill()}g.restore();
    }dissolve(g,s,t,w,h,fade,'snow',reduced);
  }
  function snowSample(i,time){const flight=7+noise(i+19)*8,period=flight+1.6,age=(time+noise(i)*period)%period,impact=clamp((age-flight)/1.6);return {phase:age<flight?'fall':'melt',fall:clamp(age/flight),scale:1-impact*.85,alpha:1-ease(impact)}}
  function wind(g,s,t,w,h,fade,reduced){
    const min=Math.min(w,h),clock=reduced?2:t,o=s.entry.options,arrive=reduced?1:ease(t/1.2);
    const wash=g.createLinearGradient(0,0,w,h);wash.addColorStop(0,'#e7eadf');wash.addColorStop(1,'#b9c7b4');g.globalAlpha=fade*.7;g.fillStyle=wash;g.fillRect(0,0,w,h);
    const img=s.entry.images[0],th=h*.94,tw=th*img.width/img.height,groves=Math.max(1,Math.ceil(w/tw));
    g.globalAlpha=fade*arrive;
    // Horizontal strips share a smooth bend field; the roots stay planted.
    for(let grove=0;grove<groves;grove++)for(let j=0;j<100;j++){const q=j/100,bend=reduced?0:Math.sin(clock*1.15+grove*.3)*min*.035*Math.pow(1-q,2);g.drawImage(img,0,q*img.height,img.width,img.height/100,(grove+.5)*w/groves-tw/2+bend,h-th+q*th,tw,th/100+.6)}
    for(let i=0;i<6;i++){
      const p=(clock*.12+i/6)%1,x=w*(1.2-p*1.5),y=h*(.12+i*.12),len=min*(.22+noise(i)*.2);
      g.globalAlpha=fade*arrive*Math.sin(p*Math.PI)*.32;g.strokeStyle='#f3f5e9';g.lineWidth=min*.002;g.lineCap='round';
      g.beginPath();g.moveTo(x+len,y);g.bezierCurveTo(x+len*.35,y-min*.03,x,y+min*.055,x-len*.25,y);g.bezierCurveTo(x-len*.45,y-min*.06,x-len*.13,y-min*.07,x-len*.16,y-min*.025);g.stroke();
    }
    const gust=clock*.16+.035*Math.sin(clock*1.8),count=reduced?(o.reducedCount||18):(o.count||72);
    for(let i=0;i<count;i++){
      const p=(noise(i)+gust*(.8+noise(i+3)*.6))%1,x=(1-p)*(w+min*.2)-min*.1;
      const y=noise(i+41)*h+Math.sin(p*8+i)*min*.1,rotation=clock*(2+noise(i))+.7*Math.sin(clock*4+i),size=min*(.025+noise(i+27)*.055);
      if(i%3){g.save();g.translate(x,y);g.rotate(rotation);g.scale(.3+.7*Math.abs(Math.cos(clock*3+i)),1);g.globalAlpha=fade*arrive*.85;g.drawImage(img,img.width*.534,img.height*.183,img.width*.086,img.height*.059,-size/2,-size*.34,size,size*.68);g.restore()}
      else {g.save();g.translate(x,y);g.rotate(rotation);g.scale(.25+.75*Math.abs(Math.cos(clock*4+i)),1);g.globalAlpha=fade*arrive*.8;g.fillStyle=i%2?'#d590a4':'#f1c9d2';g.beginPath();g.moveTo(0,size*.3);g.bezierCurveTo(-size*.35,0,-size*.25,-size*.6,0,-size*.4);g.bezierCurveTo(size*.4,-size*.5,size*.4,0,0,size*.3);g.fill();g.restore()}
    }
  }
  function river(g,s,t,w,h,fade,reduced){
    const clock=reduced?3:t,min=Math.min(w,h),o=s.entry.options,arrive=reduced?1:ease(t/2.4);
    const img=s.entry.images[0],scale=Math.max(w/img.width,h/img.height),iw=img.width*scale,ih=img.height*scale,ox=(w-iw)/2,oy=(h-ih)/2;
    cover(g,img,w,h,fade*arrive);
    const channels=s.entry.options.channels;
    for(let k=0;k<channels.length;k++){
      const path=channels[k];
      const sample=p=>{const f=clamp(p)*(path.length-1),j=Math.min(path.length-2,Math.floor(f)),u=f-j,a=path[Math.max(0,j-1)],b=path[j],c=path[j+1],d=path[Math.min(path.length-1,j+2)];return [0,1].map(n=>.5*((2*b[n])+(-a[n]+c[n])*u+(2*a[n]-5*b[n]+4*c[n]-d[n])*u*u+(-a[n]+3*b[n]-3*c[n]+d[n])*u*u*u))};
      for(let i=0;i<(reduced?70:220);i++){
        const p=(noise(i+k*143)+clock/((o.flowSeconds||4.8)*(.8+noise(i+8)*.3)))%1,[nx,ny]=sample(p),[ex,ey]=sample(Math.min(1,p+.026));
        const offset=(noise(i+11)-.5)*iw*.025,x=ox+nx*iw+offset,y=oy+ny*ih;
        g.globalAlpha=fade*arrive*Math.sin(p*Math.PI)*(.12+noise(i)*.23);g.strokeStyle='#e0eeeb';g.lineWidth=.6+noise(i+8)*1.1;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo((x+ox+ex*iw+offset)/2+min*.004,(y+oy+ey*ih)/2,ox+ex*iw+offset,oy+ey*ih);g.stroke();
      }
    }
  }
  function ocean(g,s,t,w,h,fade,reduced){
    const clock=reduced?2:t,min=Math.min(w,h),arrive=reduced?1:ease(t/1.6);
    // A stable sky above the painting's horizon, with coherent shoreward wave compression below.
    const img=s.entry.images[0],horizon=.283,step=3;g.globalAlpha=fade*arrive;
    g.drawImage(img,0,0,img.width,img.height*horizon,0,0,w,h*horizon);
    for(let y=h*horizon;y<h;y+=step){const depth=(y/h-horizon)/(1-horizon),phase=depth*15-clock*1.15;
      const dy=h*.019*Math.sin(phase)*Math.sin(depth*Math.PI),dx=w*.003*Math.sin(phase*.7)*depth;
      const sy=Math.max(img.height*horizon,Math.min(img.height-(step+1)*img.height/h,(y+dy)*img.height/h));
      g.drawImage(img,0,sy,img.width,(step+1)*img.height/h,-w*.006+dx,y,w*1.012,step+1);
    }
  }
  function water(g,s,t,w,h,fade,reduced){
    const min=Math.min(w,h),clock=reduced?3:t,arrive=reduced?1:ease(t/2),x=s.x??w/2,y=s.y??h/2;
    livingWater(g,colored(s.entry.images[0],'hue-rotate(-8deg) saturate(.8) brightness(1.17)'),w,h,clock,fade*arrive,0,1);
    for(let origin=0;origin<5;origin++)for(let i=0;i<4;i++){
      const p=(clock*.14+i/4+origin*.17)%1,r=p*min*.54,alpha=Math.sin(p*Math.PI)*(1-p),cx=origin?noise(origin+9)*w:x,cy=origin?(.15+noise(origin+26)*.7)*h:y;
      g.globalAlpha=fade*arrive*alpha*.26;g.strokeStyle=i%2?'#e5f3e9':'#527e83';g.lineWidth=.65+(1-p);
      g.beginPath();g.ellipse(cx,cy,r,r*.38,0,0,Math.PI*2);g.stroke();
    }
  }
  // Atlas cells keep their original alpha. Motion never scales the entire photograph.
  const featherCells=new WeakMap();
  function cell(g,img,index,x,y,w,h,feather=false){
    if(!feather){g.drawImage(img,(index%2)*img.width/2,Math.floor(index/2)%2*img.height/2,img.width/2,img.height/2,x,y,w,h);return}
    if(!featherCells.has(img))featherCells.set(img,[]);const slots=featherCells.get(img);
    if(!slots[index]){const c=document.createElement('canvas');c.width=img.width/2;c.height=img.height/2;const ctx=c.getContext('2d');cell(ctx,img,index,0,0,c.width,c.height);ctx.globalCompositeOperation='destination-in';for(const horizontal of [true,false]){const mask=ctx.createLinearGradient(0,0,horizontal?c.width:0,horizontal?0:c.height);mask.addColorStop(0,'transparent');mask.addColorStop(.16,'#000');mask.addColorStop(.84,'#000');mask.addColorStop(1,'transparent');ctx.fillStyle=mask;ctx.fillRect(0,0,c.width,c.height)}slots[index]=c}
    g.drawImage(slots[index],x,y,w,h);
  }
  function bamboo(g,s,t,w,h,fade,reduced){
    const min=Math.min(w,h),o=s.entry.options,clock=reduced?30:t,count=o.count||5;
    for(let i=0;i<count;i++){
      const height=h*(.58+noise(i+85)*.35),base=(i+.3+noise(i+42)*.5)*w/count,width=min*(.008+noise(i+6)*.006);
      const growth=ease((clock-i*.8)/(o.growSeconds||9)),angle=(noise(i+7)-.5)*.22+(reduced?0:Math.sin(t*.48+i*.6)*.012);
      g.save();g.translate(base,h*1.04);g.rotate(angle);g.globalAlpha=fade*(.62+noise(i)*.35);
      for(let j=0;j<8;j++){
        const part=clamp(growth*8-j);if(!part)continue;
        const y=-height*j/8,len=height/8*part;
        const green=g.createLinearGradient(-width/2,0,width/2,0);green.addColorStop(0,'#365e43');green.addColorStop(.45,'#91ab73');green.addColorStop(1,'#55794e');
        g.fillStyle=green;g.beginPath();g.moveTo(-width/2,y);g.lineTo(-width*.45,y-len);g.quadraticCurveTo(0,y-len-2,width*.45,y-len);g.lineTo(width/2,y);g.fill();
        g.strokeStyle='#c0c9a0';g.lineWidth=Math.max(1,min*.002);g.beginPath();g.moveTo(-width*.55,y);g.quadraticCurveTo(0,y+2,width*.55,y);g.stroke();
        if((j===4||j===6)&&part>.95){const open=ease((clock-i*.8-j*.65-1.8)/3.7);if(open){
          const side=(i+j)%2?1:-1,size=min*(.12+noise(i*13+j)*.075)*open;
          g.save();g.translate(0,y);g.rotate(-side*.13+(reduced?0:Math.sin(t*1.1+i+j)*.07));g.scale(side,1);
          const img=s.entry.images[0];g.drawImage(img,-size*.035,-size*.53*img.height/img.width,size,size*img.height/img.width);g.restore();
        }}
      }g.restore();
    }
  }
  function fishPose(i,time,w,h,seconds){
    const a=time/seconds*Math.PI*2*(i%2?1:-1)+i*2.399,rx=w*(.16+noise(i+13)*.2),ry=h*(.13+noise(i+9)*.18);
    const cx=w*(.35+noise(i+12)*.3),cy=h*(.35+noise(i+25)*.3);
    const direction=i%2?1:-1;
    return {x:cx+Math.cos(a)*rx,y:cy+Math.sin(a)*ry,angle:Math.atan2(Math.cos(a)*ry*direction,-Math.sin(a)*rx*direction)};
  }
  function fish(g,s,t,w,h,fade,reduced){
    const min=Math.min(w,h),clock=reduced?8:t,o=s.entry.options,arrive=reduced?1:ease(t/1.8),img=s.entry.images[0];
    livingWater(g,colored(s.entry.images[1],'saturate(.92) brightness(1.02)'),w,h,clock,fade*arrive,0,.65);
    g.globalAlpha=fade*arrive*.07;g.fillStyle='#99dac6';g.fillRect(0,0,w,h);
    for(let i=0;i<(o.count||9);i++){
      const pose=fishPose(i,clock,w,h,o.swimSeconds||26),size=min*(.14+noise(i+38)*.1),sh=size*(img.height/img.width),sw=img.width/2,sy=Math.floor(i%4/2)*img.height/2,sx=(i%2)*sw;
      g.save();g.translate(pose.x,pose.y);g.rotate(pose.angle);g.globalAlpha=fade*arrive*(.64+noise(i+4)*.18);g.filter='saturate(.85) contrast(.88)';
      // Continuous narrow strips share the same smooth displacement field: no detached tail.
      const strips=48;
      for(let k=0;k<strips;k++){
        const u=k/strips,tail=Math.pow(1-u,2),bend=(reduced?0:Math.sin(clock*5+i-u*5))*size*.065*tail;
        g.drawImage(img,sx+u*sw,sy,sw/strips,img.height/2,-size/2+u*size,-sh/2+bend,size/strips+.3,sh);
      }g.restore();
      // Each ripple remains where the fish surfaced instead of following it like a badge.
      for(let ring=0;ring<2;ring++){
        const age=(clock+i*.69+ring*1.5)%3,origin=fishPose(i,clock-age,w,h,o.swimSeconds||26),p=age/3;
        g.globalAlpha=fade*arrive*Math.sin(Math.PI*p)*(1-p)*.32;g.strokeStyle='#e8f4e7';g.lineWidth=1;
        g.beginPath();g.ellipse(origin.x,origin.y,min*(.012+p*.095),min*(.008+p*.06),0,0,Math.PI*2);g.stroke();
      }
    }
    // A shared translucent surface passes over the fish so they sit beneath the water.
    g.save();g.globalCompositeOperation='screen';livingWater(g,s.entry.images[1],w,h,clock,fade*arrive*.12,0,.85);g.restore();
  }
  function star(g,s,t,w,h,fade,reduced){
    const clock=reduced?4:t,o=s.entry.options,arrive=reduced?1:ease(t/(o.nightSeconds||3)),img=s.entry.images[s.stockVariant%s.entry.images.length];
    g.globalAlpha=fade*arrive;g.fillStyle='#060d20';g.fillRect(0,0,w,h);cover(g,img,w,h,fade*arrive*.42);
    for(let i=0;i<(o.count||130);i++){
      const x=noise(i+5)*w,y=noise(i+92)*h,r=Math.min(w,h)*(.0012+noise(i+8)*.0028),pulse=.08+.92*Math.pow(.5+.5*Math.sin(clock*(1+noise(i)*1.2)+i*2.4),3);
      g.globalAlpha=fade*arrive*pulse;const glow=g.createRadialGradient(x,y,0,x,y,r*6);glow.addColorStop(0,'rgba(235,246,255,.8)');glow.addColorStop(.22,'rgba(159,198,236,.4)');glow.addColorStop(1,'rgba(159,198,236,0)');g.fillStyle=glow;g.fillRect(x-r*6,y-r*6,r*12,r*12);
      g.fillStyle=i%4?'#ecf5ff':'#ffe4b7';g.beginPath();g.arc(x,y,r*.55,0,Math.PI*2);g.fill();
      if(i%11===0){g.strokeStyle='#e1efff';g.lineWidth=.65;g.beginPath();g.moveTo(x-r*4*pulse,y);g.lineTo(x+r*4*pulse,y);g.moveTo(x,y-r*5*pulse);g.lineTo(x,y+r*5*pulse);g.stroke()}
    }
  }
  function cloud(g,s,t,w,h,fade,reduced){
    const clock=reduced?8:t,min=Math.min(w,h),o=s.entry.options,arrive=reduced?1:ease(t/2.2);
    const sky=g.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#83abc5');sky.addColorStop(.65,'#c6d7dc');sky.addColorStop(1,'#eee0cd');g.globalAlpha=fade*arrive;g.fillStyle=sky;g.fillRect(0,0,w,h);
    for(let i=0;i<(o.count||9);i++){
      const depth=.45+noise(i+12)*.55,size=min*(.6+depth*.9),p=(noise(i+20)+clock/(o.driftSeconds||65)*(.3+depth*.45))%1;
      const x=p*(w+size*2)-size,y=h*(.1+noise(i+53)*.63)+Math.sin(clock*.32+i)*min*.014;
      g.globalAlpha=fade*arrive*(.42+depth*.4);cell(g,s.entry.images[0],i%4,x-size/2,y-size*.2,size,size*s.entry.images[0].height/s.entry.images[0].width,true);
    }
  }
  function leaves(g,s,t,w,h,fade,reduced){
    const clock=reduced?15:t,min=Math.min(w,h),o=s.entry.options,count=o.count||24;
    for(let i=0;i<count;i++){
      const side=i%2?1:-1,x=w*(.04+noise(i+170)*.92),y=h*(.08+noise(i+290)*.8);
      const open=ease((clock-noise(i+4)*2)/(o.growSeconds||3)),size=min*(.14+noise(i+20)*.1)*open;
      const rotation=side*(.12+noise(i)*1.5)+(reduced?0:Math.sin(t*.8+i)*.06);
      leaf(g,s.entry.images[0],i%4,x,y+size*.4,size,rotation,fade*open*(.7+noise(i+3)*.3));
    }
    if(!reduced)for(let i=0;i<7;i++){
      const age=t-3-i*.4;if(age<0)continue;const p=(age/9)%1,size=min*(.07+noise(i)*.04);
      const x=(i+.5)*w/7+Math.sin(p*6+i)*min*.09,y=-size+p*(h+size*2);
      g.save();g.translate(x,y);g.scale(.4+.6*Math.abs(Math.cos(p*6+i)),1);leaf(g,s.entry.images[0],i%4,0,0,size,p*2+Math.sin(p*7+i)*.45,fade*Math.sin(Math.PI*p)*.8);g.restore();
    }
  }
  function cat(g,s,t,w,h,fade,reduced){
    const clock=reduced?8:t,img=s.entry.images[0],size=Math.min(w*.35,h*.46),period=s.entry.options.crossSeconds||20,p=(clock/period)%1,x=-size+p*(w+size*2),y=h*.79;
    const speed=(w+size*2)/period,stride=size*.24,stepSeconds=stride/(speed*.65);
    const crops={body:[.028,.045,.485,.377],front:[.677,.035,.135,.433],hind:[.172,.514,.19,.447],tail:[.651,.503,.197,.465]};
    const part=(name,dx,dy,dw,dh)=>{const [a,b,c,d]=crops[name];g.drawImage(img,a*img.width,b*img.height,c*img.width,d*img.height,dx,dy,dw,dh)};
    g.save();g.translate(x,y);g.globalAlpha=fade*(reduced?1:ease(t/.6));
    const leg=(front,offset,far)=>{
      const phase=reduced?.3:(clock/stepSeconds+offset)%1,stance=phase<.65,u=stance?phase/.65:(phase-.65)/.35;
      const foot=stride*(stance?.5-u:-.5+ease(u)),lift=stance?0:Math.sin(Math.PI*u)*size*.055;
      const hipX=size*(front?.25:-.29),hipY=-size*(front?.31:.32),height=-hipY-lift,width=size*(front?.102:.142),crop=crops[front?'front':'hind'];
      g.save();if(far){g.filter='brightness(.76)';g.translate(-size*.02,-size*.008)}
      for(let j=0;j<48;j++){const q=j/48,bend=foot*q*q;g.drawImage(img,crop[0]*img.width,(crop[1]+q*crop[3])*img.height,crop[2]*img.width,crop[3]*img.height/48,hipX-width/2+bend,hipY+q*height,width,height/48+.5)}
      g.restore();
    };
    // Four staggered contacts, planted paws during stance; the torso never hops between frames.
    leg(false,.5,true);leg(true,.75,true);
    g.save();g.translate(-size*.39,-size*.4);g.rotate(reduced?-.25:-.25+Math.sin(clock*1.9)*.1);part('tail',-size*.06,-size*.44,size*.16,size*.47);g.restore();
    part('body',-size*.46,-size*.62,size*.96,size*.44);
    leg(false,0,false);leg(true,.25,false);
    g.restore();
  }
  const renderers={tree,fire,moon,snow,wind,river,ocean,water,bamboo,fish,star,cloud,leaves,cat};
  window.TenzerNature={types,snowSample,fishPose,draw(g,s,fade,w,h,reduced){if(!types.has(s.entry.behavior))return false;renderers[s.entry.behavior](g,s,s.life,w,h,fade,reduced);return true}};
})();
