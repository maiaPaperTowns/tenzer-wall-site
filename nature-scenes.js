/* Data-driven nature scenes. Original photographs stay intact; motion is rendered live. */
(() => {
  const clamp=n=>Math.max(0,Math.min(1,n)),ease=n=>{n=clamp(n);return n*n*(3-2*n)};
  const noise=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v)};
  const types=new Set(['tree','fire','moon','snow','wind','river','ocean','water']);
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
    const min=Math.min(w,h),o=s.entry.options,clock=reduced?20:t;
    if(!s.branches){
      const nodes=[];
      function branch(x,y,angle,len,depth,start,seed){
        const ex=x+Math.cos(angle)*len,ey=y+Math.sin(angle)*len;
        nodes.push({x,y,ex,ey,depth,start,seed});
        if(depth<5){branch(ex,ey,angle-(.3+noise(seed)*.4),len*.71,depth+1,start+.68,seed*2+1);branch(ex,ey,angle+(.28+noise(seed+1)*.42),len*.69,depth+1,start+.72,seed*2+2)}
      }
      const trees=Math.max(1,Math.round(w/h/1.4));
      for(let i=0;i<trees;i++)branch((i+.5)*w/trees,h*1.01,-Math.PI/2,min*.28,0, i*.18,13+i*79);
      s.branches=nodes;s.treeSize=[w,h];
    }
    if(s.treeSize[0]!==w||s.treeSize[1]!==h){s.branches=null;return tree(g,s,t,w,h,fade,reduced)}
    const rate=6/(o.growSeconds||6);g.lineCap='round';
    for(const b of s.branches){
      const p=ease((clock*rate-b.start)/.95);if(!p)continue;
      const x=b.x+(b.ex-b.x)*p,y=b.y+(b.ey-b.y)*p;
      g.globalAlpha=fade;g.strokeStyle=b.depth<2?'#635647':'#7c7856';g.lineWidth=Math.max(1,min*.023*Math.pow(.56,b.depth));
      g.beginPath();g.moveTo(b.x,b.y);g.quadraticCurveTo(b.x+(b.ex-b.x)*p*.35,b.y+(b.ey-b.y)*p*.65,x,y);g.stroke();
      if(b.depth>2){
        const grow=ease((clock*rate-b.start-.55)/1.3);
        for(let j=0;j<3;j++){
          const q=.4+j*.3,lx=b.x+(b.ex-b.x)*q,ly=b.y+(b.ey-b.y)*q;
          const sway=reduced?0:Math.sin(t*.7+b.seed+j)*.045;
          leaf(g,s.entry.images[0],(b.seed+j)%4,lx,ly,min*(.046+noise(b.seed+j)*.035)*grow,(j%2?-.8:.8)+sway,fade*grow*.9);
        }
      }
    }
  }
  function fire(g,s,t,w,h,fade,reduced){
    const min=Math.min(w,h),o=s.entry.options,spread=reduced?1:ease(t/(o.spreadSeconds||3.5)),clock=reduced?2:t;
    g.globalAlpha=fade*spread;g.fillStyle='#100b10';g.fillRect(0,0,w,h);
    cover(g,s.entry.images[1],w,h,fade*spread*.35);
    const bands=Math.max(6,Math.ceil(w/h*7));
    g.save();g.globalCompositeOperation='screen';
    for(let i=0;i<bands;i++){
      const phase=clock*(.8+noise(i)*.3)+i*2.1,fh=h*(.85+.3*Math.sin(phase))*(.15+.85*spread),fw=w/bands*2.1;
      const x=(i+.5)*w/bands+Math.sin(phase*.7)*min*.03;
      g.globalAlpha=fade*spread*(.52+.13*Math.sin(phase));
      g.drawImage(s.entry.images[0],x-fw/2,h-fh,fw,fh*1.15);
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
    // Preserve the supplied lunar disc, hiding its black photographic backdrop by light blending.
    g.drawImage(img,img.width*.25,img.height*.035,img.width*.5,img.height*.93,x-r,y-r,r*2,r*2);g.restore();
  }
  function snow(g,s,t,w,h,fade,reduced){
    const min=Math.min(w,h),clock=reduced?2:t,arrive=reduced?1:ease((t-.35)/2.5),o=s.entry.options;
    cover(g,s.entry.images[s.stockVariant%2],w,h,fade*arrive);
    g.globalAlpha=fade*arrive*.25;g.fillStyle='#dce7ef';g.fillRect(0,0,w,h);
    const count=reduced?(o.reducedCount||35):(o.count||170);
    for(let i=0;i<count;i++){
      const depth=.3+noise(i+19)*.7,p=(noise(i)+clock*(.025+depth*.04))%1;
      const x=noise(i+70)*w+Math.sin(clock*.35+i+p*4)*min*.06,y=p*(h+80)-40,size=min*(.006+depth*.026);
      g.save();g.translate(x,y);g.rotate(clock*.15*(i%2?1:-1)+i);g.globalAlpha=fade*arrive*(.35+depth*.55);
      if(i%4===0)g.drawImage(s.entry.images[2],-size/2,-size/2,size,size);
      else {g.fillStyle='#fff';g.beginPath();g.arc(0,0,size*.1,0,Math.PI*2);g.fill()}g.restore();
    }dissolve(g,s,t,w,h,fade,'snow',reduced);
  }
  function wind(g,s,t,w,h,fade,reduced){
    const min=Math.min(w,h),clock=reduced?2:t,o=s.entry.options,arrive=reduced?1:ease(t/1.2);
    const wash=g.createLinearGradient(0,0,w,h);wash.addColorStop(0,'#e7eadf');wash.addColorStop(1,'#b9c7b4');g.globalAlpha=fade*.7;g.fillStyle=wash;g.fillRect(0,0,w,h);
    const gust=clock*.16+.035*Math.sin(clock*1.8),count=reduced?(o.reducedCount||18):(o.count||72);
    for(let i=0;i<count;i++){
      const p=(noise(i)+gust*(.8+noise(i+3)*.6))%1,x=p*(w+min*.2)-min*.1;
      const y=noise(i+41)*h+Math.sin(p*8+i)*min*.1,rotation=clock*(2+noise(i))+.7*Math.sin(clock*4+i),size=min*(.025+noise(i+27)*.055);
      if(i%3){g.save();g.translate(x,y);g.scale(.3+.7*Math.abs(Math.cos(clock*3+i)),1);leaf(g,s.entry.images[0],i%4,0,0,size,rotation,fade*arrive*.85);g.restore()}
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
      for(let i=0;i<100;i++){
        const p=(noise(i+k*103)+clock/(o.flowSeconds||7))%1,f=p*(path.length-1),index=Math.min(path.length-2,Math.floor(f)),q=f-index;
        const a=path[index],b=path[index+1],nx=a[0]+(b[0]-a[0])*q,ny=a[1]+(b[1]-a[1])*q;
        const x=ox+nx*iw+(noise(i+11)-.5)*iw*.022,y=oy+ny*ih;
        g.globalAlpha=fade*arrive*Math.sin(p*Math.PI)*(.04+noise(i)*.15);g.strokeStyle='#e0eeeb';g.lineWidth=.5+noise(i+8)*.6;g.beginPath();g.moveTo(x-min*.006,y);g.quadraticCurveTo(x,y+min*.002,x+min*.008,y);g.stroke();
      }
    }
  }
  function ocean(g,s,t,w,h,fade,reduced){
    const clock=reduced?2:t,min=Math.min(w,h),arrive=reduced?1:ease(t/1.6);
    cover(g,s.entry.images[0],w,h,fade*arrive);
    // Animated surf covers the foreground; each crest travels shoreward then retreats.
    for(let band=0;band<4;band++){
      const p=(clock/(s.entry.options.waveSeconds||5)+band/4)%1,y=h*(.59+p*.43),amp=min*(.009+p*.012),opacity=Math.sin(p*Math.PI);
      const fill=g.createLinearGradient(0,y-min*.03,0,y+min*.1);fill.addColorStop(0,'rgba(41,116,130,0)');fill.addColorStop(.22,'rgba(184,226,224,.25)');fill.addColorStop(.5,'rgba(215,244,239,.12)');fill.addColorStop(1,'rgba(215,244,239,0)');
      g.globalAlpha=fade*arrive*opacity;g.fillStyle=fill;g.beginPath();g.moveTo(0,y+min*.07);
      for(let x=0;x<=w+12;x+=12)g.lineTo(x,y+Math.sin(x/min*5+band+clock*.3)*amp);
      g.lineTo(w,y+min*.1);g.closePath();g.fill();
      for(let i=0;i<230;i++){const x=noise(i+band*89)*w,yy=y+Math.sin(x/min*5+band+clock*.3)*amp;g.globalAlpha=fade*arrive*opacity*(.15+noise(i)*.4);g.fillStyle='#f6fffa';g.beginPath();g.ellipse(x,yy+noise(i+31)*min*.028,min*(.001+noise(i)*.009),min*(.001+noise(i+7)*.003),Math.sin(i)*.2,0,Math.PI*2);g.fill()}
    }
  }
  function water(g,s,t,w,h,fade,reduced){
    const min=Math.min(w,h),clock=reduced?3:t,arrive=reduced?1:ease(t/2),x=s.x??w/2,y=s.y??h/2;
    cover(g,s.entry.images[0],w,h,fade*arrive);
    for(let i=0;i<9;i++){
      const p=(clock*.19+i/9)%1,r=p*Math.hypot(w,h)*.7,alpha=Math.sin(p*Math.PI)*(1-p);
      g.globalAlpha=fade*arrive*alpha*.55;g.strokeStyle=i%2?'#e0f4f4':'#376879';g.lineWidth=1+(1-p)*2;
      g.beginPath();g.ellipse(x,y,r,r*.34,0,0,Math.PI*2);g.stroke();
    }dissolve(g,s,t,w,h,fade,'water',reduced);
  }
  const renderers={tree,fire,moon,snow,wind,river,ocean,water};
  window.TenzerNature={types,draw(g,s,fade,w,h,reduced){if(!types.has(s.entry.behavior))return false;renderers[s.entry.behavior](g,s,s.life,w,h,fade,reduced);return true}};
})();
