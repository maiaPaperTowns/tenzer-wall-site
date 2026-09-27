/* Data-driven nature scenes. Original photographs stay intact; motion is rendered live. */
(() => {
  const clamp=n=>Math.max(0,Math.min(1,n)),ease=n=>{n=clamp(n);return n*n*(3-2*n)};
  const noise=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v)};
  const types=new Set(['tree','fire','moon','snow','wind','river','ocean','water','bamboo','fish','star','cloud','leaves','cat']);
  function cover(g,img,w,h,alpha=1){const k=Math.max(w/img.width,h/img.height);g.globalAlpha=alpha;g.drawImage(img,(w-img.width*k)/2,(h-img.height*k)/2,img.width*k,img.height*k)}
  function leaf(g,img,index,x,y,size,rotation,alpha){g.save();g.translate(x,y);g.rotate(rotation);g.globalAlpha=alpha;g.drawImage(img,(index%2)*img.width/2,Math.floor(index/2)%2*img.height/2,img.width/2,img.height/2,-size/2,-size*.94,size,size);g.restore()}
  function glyphPoints(s){
    if(s.inkPoints)return s.inkPoints;
    const c=document.createElement('canvas');c.width=c.height=160;const g=c.getContext('2d');
    g.font='120px "Aoyagi Kouzan", KaiTi, serif';g.textAlign='center';g.textBaseline='middle';g.fillText(s.entry.glyph,80,80);
    const d=g.getImageData(0,0,160,160).data,points=[];
    for(let y=0;y<160;y+=5)for(let x=0;x<160;x+=5)if(d[(y*160+x)*4+3]>100)points.push([x/160-.5,y/160-.5]);
    return s.inkPoints=points;
  }
  function dissolve(g,s,t,w,h,fade,kind,reduced){
    if(reduced||t>4)return;
    const min=Math.min(w,h),x=s.x??w*.5,y=s.y??h*.5,points=glyphPoints(s),p=ease((t-.25)/2.8);
    g.globalAlpha=fade*(1-ease((t-.25)/1.4));g.fillStyle='#293335';g.textAlign='center';g.textBaseline='middle';g.font=`${min*.2}px "Aoyagi Kouzan", KaiTi, serif`;g.fillText(s.entry.glyph,x,y);
    points.forEach(([px,py],i)=>{
      const dx=(noise(i+31)-.5)*min*p*.65,dy=kind==='fire'?-p*min*(.15+noise(i)*.6):p*min*(.1+noise(i)*.45);
      g.globalAlpha=fade*ease(t/.4)*(1-ease((t-2)/2));
      g.fillStyle=kind==='fire'?`hsl(${25+noise(i)*25} 95% 65%)`:kind==='snow'?'#fff':'#b6e3ee';
      g.beginPath();g.arc(x+px*min*.24+dx,y+py*min*.24+dy,Math.max(.6,min*.002*(1+p)),0,Math.PI*2);g.fill();
    });
  }
  function tree(g,s,t,w,h,fade,reduced){
    const img=s.entry.images[0],p=reduced?1:clamp(t/(s.entry.options.growSeconds||6));
    if(!s.treeLayer){s.treeLayer=document.createElement('canvas');s.treeLayer.width=s.treeLayer.height=1024}
    const layer=s.treeLayer,c=layer.getContext('2d'),z=layer.width;c.clearRect(0,0,z,z);c.globalCompositeOperation='source-over';c.drawImage(img,0,0,z,z);
    c.globalCompositeOperation='destination-in';
    // Organic root-outward reveal follows radial distance from the trunk, without a straight wipe.
    const r=Math.max(1,p*z*1.2),mask=c.createRadialGradient(z*.51,z*.94,r*.72,z*.51,z*.94,r);mask.addColorStop(0,'#000');mask.addColorStop(1,'transparent');c.fillStyle=mask;c.fillRect(0,0,z,z);
    const count=Math.max(1,Math.round(w/h/1.8)),size=h*1.04;
    for(let i=0;i<count;i++){g.save();g.translate((i+.5)*w/count,h*1.025);g.transform(1,0,reduced?0:Math.sin(t*.6+i)*.007,1,0,0);g.globalAlpha=fade;g.drawImage(layer,-size*.51,-size*.95,size,size);g.restore()}
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
      g.save();g.translate(x,y);g.rotate(event.phase==='fall'?event.fall*2+i:i+2);g.scale(event.scale,event.phase==='fall'?1:event.scale*.28);g.globalAlpha=fade*arrive*(.35+depth*.55)*event.alpha;
      if(i%4===0)g.drawImage(s.entry.images[1],-size/2,-size/2,size,size);
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
      for(let i=0;i<140;i++){
        const p=(noise(i+k*143)+clock/((o.flowSeconds||9)*.82))%1,[nx,ny]=sample(p),[ex,ey]=sample(Math.min(1,p+.014));
        const offset=(noise(i+11)-.5)*iw*.025,x=ox+nx*iw+offset,y=oy+ny*ih;
        g.globalAlpha=fade*arrive*Math.sin(p*Math.PI)*(.05+noise(i)*.14);g.strokeStyle='#e0eeeb';g.lineWidth=.5+noise(i+8)*.8;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo((x+ox+ex*iw+offset)/2+min*.004,(y+oy+ey*ih)/2,ox+ex*iw+offset,oy+ey*ih);g.stroke();
      }
    }
  }
  function ocean(g,s,t,w,h,fade,reduced){
    const clock=reduced?2:t,min=Math.min(w,h),arrive=reduced?1:ease(t/1.6);
    const base=g.createLinearGradient(0,0,0,h);base.addColorStop(0,'#c7e0e5');base.addColorStop(.32,'#6fa9b1');base.addColorStop(.75,'#9cc8c5');base.addColorStop(.9,'#d5d9c7');base.addColorStop(1,'#e9dfc9');g.globalAlpha=fade*arrive;g.fillStyle=base;g.fillRect(0,0,w,h);
    const img=s.entry.images[0];
    // Animated surf covers the foreground; each crest travels shoreward then retreats.
    for(let band=0;band<3;band++){
      const p=(clock/(s.entry.options.waveSeconds||5)+band/3)%1,y=h*(.42+p*.57),amp=min*(.009+p*.012),opacity=Math.sin(p*Math.PI);
      const surge=ease(p),waveHeight=min*(.12+.17*Math.sin(Math.PI*p))*(1-.55*ease((p-.65)/.35));
      g.globalAlpha=fade*arrive*opacity*.92;g.drawImage(img,-w*.05+Math.sin(clock*.45+band)*min*.02,y-waveHeight,w*1.1,waveHeight);
      const fill=g.createLinearGradient(0,y-min*.03,0,y+min*.1);fill.addColorStop(0,'rgba(41,116,130,0)');fill.addColorStop(.22,'rgba(184,226,224,.25)');fill.addColorStop(.5,'rgba(215,244,239,.12)');fill.addColorStop(1,'rgba(215,244,239,0)');
      g.globalAlpha=fade*arrive*opacity;g.fillStyle=fill;g.beginPath();g.moveTo(0,y+min*.07);
      for(let x=0;x<=w+12;x+=12)g.lineTo(x,y+Math.sin(x/min*5+band+clock*.3)*amp);
      g.lineTo(w,y+min*.1);g.closePath();g.fill();
      // The original foam sprite flattens into the shore, instead of a second dotted foam overlay.
      if(p>.55){g.globalAlpha=fade*arrive*opacity*.35;g.drawImage(img,-w*.04,y-min*.018,w*1.08,min*(.025+(1-p)*.065))}
    }
  }
  function water(g,s,t,w,h,fade,reduced){
    const min=Math.min(w,h),clock=reduced?3:t,arrive=reduced?1:ease(t/2),x=s.x??w/2,y=s.y??h/2;
    g.save();g.filter='hue-rotate(-18deg) saturate(.65) brightness(1.16)';cover(g,s.entry.images[0],w,h,fade*arrive);g.restore();
    for(let origin=0;origin<5;origin++)for(let i=0;i<4;i++){
      const p=(clock*.14+i/4+origin*.17)%1,r=p*min*.54,alpha=Math.sin(p*Math.PI)*(1-p),cx=origin?noise(origin+9)*w:x,cy=origin?(.15+noise(origin+26)*.7)*h:y;
      g.globalAlpha=fade*arrive*alpha*.42;g.strokeStyle=i%2?'#e5f3e9':'#527e83';g.lineWidth=.8+(1-p)*1.5;
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
    const min=Math.min(w,h),o=s.entry.options,clock=reduced?20:t,count=o.count||7;
    for(let i=0;i<count;i++){
      const height=h*(.54+noise(i+85)*.39),base=(i+.5)*w/count,width=min*(.01+noise(i+6)*.008);
      const growth=ease((clock-i*.16)/(o.growSeconds||5)),angle=(noise(i+7)-.5)*.19+(reduced?0:Math.sin(t*.6+i)*.018);
      g.save();g.translate(base,h*1.04);g.rotate(angle);g.globalAlpha=fade*(.62+noise(i)*.35);
      for(let j=0;j<8;j++){
        const part=clamp(growth*8-j);if(!part)continue;
        const y=-height*j/8,len=height/8*part;
        const green=g.createLinearGradient(-width/2,0,width/2,0);green.addColorStop(0,'#365e43');green.addColorStop(.45,'#91ab73');green.addColorStop(1,'#55794e');
        g.fillStyle=green;g.beginPath();g.moveTo(-width/2,y);g.lineTo(-width*.45,y-len);g.quadraticCurveTo(0,y-len-2,width*.45,y-len);g.lineTo(width/2,y);g.fill();
        g.strokeStyle='#c0c9a0';g.lineWidth=Math.max(1,min*.002);g.beginPath();g.moveTo(-width*.55,y);g.quadraticCurveTo(0,y+2,width*.55,y);g.stroke();
        if(j>1){const open=ease((growth*8-j-.35)/1.2);if(open){
          const side=(i+j)%2?1:-1,size=min*(.2+noise(i*13+j)*.15)*open;
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
    g.save();g.filter='hue-rotate(-30deg) saturate(.55) brightness(1.3)';cover(g,s.entry.images[1],w,h,fade*arrive);g.restore();
    g.globalAlpha=fade*arrive*.22;g.fillStyle='#81b6a1';g.fillRect(0,0,w,h);
    for(let i=0;i<(o.count||9);i++){
      const pose=fishPose(i,clock,w,h,o.swimSeconds||26),size=min*(.14+noise(i+38)*.1),sh=size*(img.height/img.width),sw=img.width/2,sy=Math.floor(i%4/2)*img.height/2,sx=(i%2)*sw;
      g.save();g.translate(pose.x,pose.y);g.rotate(pose.angle);g.globalAlpha=fade*arrive*(.7+noise(i+4)*.25);
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
  }
  function star(g,s,t,w,h,fade,reduced){
    const clock=reduced?4:t,o=s.entry.options,arrive=reduced?1:ease(t/(o.nightSeconds||3)),img=s.entry.images[s.stockVariant%s.entry.images.length];
    g.globalAlpha=fade*arrive;g.fillStyle='#060d20';g.fillRect(0,0,w,h);cover(g,img,w,h,fade*arrive*.7);
    for(let i=0;i<(o.count||130);i++){
      const x=noise(i+5)*w,y=noise(i+92)*h,r=.6+noise(i+8)*1.7,pulse=.4+.6*Math.pow(.5+.5*Math.sin(clock*(.65+noise(i)*.7)+i*2.4),2);
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
      const row=i%3,side=i%2?1:-1,x=(Math.floor(i/3)+.5)*w/Math.ceil(count/3),y=h*(.25+row*.31);
      const open=ease((clock-noise(i+4)*2)/(o.growSeconds||3)),size=min*(.14+noise(i+20)*.1)*open;
      const rotation=side*(.3+noise(i)*.65)+(reduced?0:Math.sin(t*.8+i)*.06);
      leaf(g,s.entry.images[0],i%4,x,y+size*.4,size,rotation,fade*open*(.7+noise(i+3)*.3));
    }
    if(!reduced)for(let i=0;i<7;i++){
      const age=t-3-i*.4;if(age<0)continue;const p=(age/9)%1,size=min*(.07+noise(i)*.04);
      const x=(i+.5)*w/7+Math.sin(p*6+i)*min*.09,y=-size+p*(h+size*2);
      g.save();g.translate(x,y);g.scale(.4+.6*Math.abs(Math.cos(p*6+i)),1);leaf(g,s.entry.images[0],i%4,0,0,size,p*2+Math.sin(p*7+i)*.45,fade*Math.sin(Math.PI*p)*.8);g.restore();
    }
  }
  function cat(g,s,t,w,h,fade,reduced){
    const clock=reduced?5:t,img=s.entry.images[0],size=Math.min(w*.42,h*.52),period=s.entry.options.crossSeconds||12,p=(clock/period)%1,x=-size+p*(w+size*2),y=h*.77;
    const frame=reduced?0:Math.floor(clock*7)%4,height=size*img.height/img.width;
    g.globalAlpha=fade*(reduced?1:ease(t/.6));g.save();g.translate(x,y);cell(g,img,frame,-size/2,-height,size,height);g.restore();
  }
  const renderers={tree,fire,moon,snow,wind,river,ocean,water,bamboo,fish,star,cloud,leaves,cat};
  window.TenzerNature={types,snowSample,fishPose,draw(g,s,fade,w,h,reduced){if(!types.has(s.entry.behavior))return false;renderers[s.entry.behavior](g,s,s.life,w,h,fade,reduced);return true}};
})();
