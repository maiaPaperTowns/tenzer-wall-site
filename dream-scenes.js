/* Four reference-led landscape scenes. Motion stays local to its material. */
(() => {
  const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x)},noise=i=>{const n=Math.sin(i*127.1+311.7)*43758.5453;return n-Math.floor(n)};
  function lake(g,img,w,h,t,fade,line=.75){
    g.globalAlpha=fade;g.drawImage(img,0,0,w,h);
    for(let y=Math.ceil(h*line);y<h;y+=4){const depth=(y/h-line)/(1-line),dx=Math.sin(y/h*95-t*.8)*w*.002*depth,sy=Math.min(img.height-6,(y+Math.sin(y/h*48-t*.7)*h*.001*depth)/h*img.height);
      g.drawImage(img,0,sy,img.width,Math.min(5/h*img.height,img.height-sy),dx-w*.004,y,w*1.008,5);
    }
  }
  function bloom(g,s,t,w,h,fade,reduced){
    const time=reduced?12:t,min=Math.min(w,h),arrive=reduced?1:ease(t/3.2);lake(g,s.entry.images[1],w,h,time,fade*arrive,.66);
    const img=s.entry.images[0],count=reduced?24:48;s.flowers=[];
    for(let i=0;i<count;i++){
      const edge=i%4,q=(Math.floor(i/4)+.5)/(count/4),x=edge===0?q*w:edge===1?w*(.95+noise(i)*.04):edge===2?(1-q)*w:w*(.01+noise(i)*.04),y=edge===0?h*(.02+noise(i+9)*.07):edge===1?q*h:edge===2?h*(.94+noise(i+9)*.05):(1-q)*h;
      if((edge===0||edge===2)&&q>.32&&q<.68)continue;
      const open=reduced?1:ease((t-.3-noise(i+20)*3.2)/2.4),size=min*(.12+noise(i+5)*.14)*(.08+.92*open);s.flowers.push({x,y});
      g.save();g.translate(x,y);g.rotate((noise(i+31)-.5)*1.4+(reduced?0:Math.sin(time*.5+i)*.025));g.scale(.3+.7*open,1);g.globalAlpha=fade*open;
      g.drawImage(img,(i%2)*img.width/2,(Math.floor(i/2)%2)*img.height/2,img.width/2,img.height/2,-size/2,-size/2,size,size);g.restore();
    }
    // Small translucent petals travel independently of the painted canopy.
    if(!reduced)for(let i=0;i<40;i++){const p=(time*(.035+noise(i)*.025)+noise(i+13))%1,x=(noise(i+4)*w+p*w*.19+Math.sin(p*7+i)*min*.04)%(w+30),y=-20+p*(h+40),size=min*(.006+noise(i+12)*.008);
      g.save();g.translate(x,y);g.rotate(time*(.4+noise(i))+i);g.scale(.25+.75*Math.abs(Math.sin(time+i)),1);g.globalAlpha=fade*arrive*Math.sin(p*Math.PI)*.85;g.fillStyle=i%2?'#f7c3d7':'#ffe4e9';g.beginPath();g.moveTo(0,-size);g.bezierCurveTo(size*1.1,-size*.8,size*.7,size*.8,0,size);g.bezierCurveTo(-size*.8,size*.5,-size*.7,-size*.7,0,-size);g.fill();g.restore();
    }
  }
  function moon(g,s,t,w,h,fade,reduced){
    const time=reduced?10:t,night=reduced?1:ease(t/3),rise=reduced?1:ease((t-.5)/6),min=Math.min(w,h),x=w*.59,y=h*(.67-.38*rise),r=min*.125;
    lake(g,s.entry.images[1],w,h,time,fade*night,.755);
    const halo=g.createRadialGradient(x,y,r*.4,x,y,r*2.7);halo.addColorStop(0,'rgba(255,225,187,.3)');halo.addColorStop(.4,'rgba(255,228,193,.13)');halo.addColorStop(1,'rgba(255,228,193,0)');g.globalAlpha=fade*night*rise;g.fillStyle=halo;g.fillRect(x-r*3,y-r*3,r*6,r*6);
    g.save();g.globalCompositeOperation='screen';g.globalAlpha=fade*night*ease(rise*3);g.filter='sepia(.2) brightness(1.15)';g.drawImage(s.entry.images[0],x-r,y-r,r*2,r*2);g.restore();
    for(let i=0;i<65;i++){const p=i/65,yy=h*(.765+p*.235),xx=x+Math.sin(i*1.3+time*.65)*min*.025*p,len=min*(.006+p*.14)*( .3+noise(i)*.7);
      g.globalAlpha=fade*night*rise*(1-p)*(.13+noise(i)*.23);g.strokeStyle='#ffdfbe';g.lineWidth=1+p*2;g.beginPath();g.moveTo(xx-len,yy);g.lineTo(xx+len,yy);g.stroke();
    }
  }
  function lightning(g,s,t,w,h,fade,reduced){
    const time=reduced?2:t;lake(g,s.entry.images[0],w,h,time,fade,.75);
    // Feathered cloud texture drifts while the mountains and lake horizon stay fixed.
    if(!s.cloudLayer){const c=document.createElement('canvas');c.width=768;c.height=512;const q=c.getContext('2d');q.drawImage(s.entry.images[0],0,0,768,512);q.globalCompositeOperation='destination-in';const mask=q.createLinearGradient(0,0,0,512);mask.addColorStop(0,'#000');mask.addColorStop(.43,'#000');mask.addColorStop(.65,'transparent');q.fillStyle=mask;q.fillRect(0,0,768,512);s.cloudLayer=c}
    g.globalAlpha=fade*.3;g.drawImage(s.cloudLayer,-w*.025+Math.sin(time*.09)*w*.018,0,w*1.05,h);
    const interval=s.entry.options.intervalSeconds||1.15,elapsed=Math.max(0,t-.6),strike=reduced?0:Math.floor(elapsed/interval),age=elapsed%interval,span=.36,intensity=reduced?.25:(t<.6?0:ease(age/.035)*(1-ease((age-.07)/(span-.07))));
    if(!s.bolts||s.boltIndex!==strike||s.boltReduced!==reduced){s.bolts=[];for(let b=0;b<(reduced?1:4);b++){const trunk=[],seed=strike*31+b*101;let x=.24+b*.17+(noise(seed)-.5)*.1;for(let j=0;j<24;j++){x+=(noise(seed+j*8)-.5)*.036;trunk.push([x,.10+j*.027])}s.bolts.push(trunk);for(let k=0;k<5;k++){const start=5+k*3,path=[trunk[start]],dir=k%2?1:-1;for(let j=1;j<7;j++){const a=path[j-1];path.push([a[0]+dir*(.012+noise(seed+k*6+j)*.018),a[1]+.02])}s.bolts.push(path)}}s.boltIndex=strike;s.boltReduced=reduced}
    if(!intensity)return;
    for(let layer=0;layer<3;layer++){g.globalAlpha=fade*intensity;g.strokeStyle=['rgba(148,126,255,.13)','rgba(189,182,255,.5)','#f1ebff'][layer];g.lineJoin='round';
      s.bolts.forEach((path,k)=>{g.lineWidth=Math.max(.5,Math.min(w,h)*[.014,.004,.0015][layer])*(k%6?.34:1);g.beginPath();path.forEach(([x,y],j)=>{if(!j){g.moveTo(x*w,y*h);return}const a=path[j-1];for(let step=1;step<=4;step++){const u=step/4;g.lineTo((a[0]+(x-a[0])*u+(step<4?(noise(k*101+j*7+step+strike)-.5)*.007:0))*w,(a[1]+(y-a[1])*u)*h)}});g.stroke()});
    }
    for(let b=0;b<(reduced?1:4);b++){const root=s.bolts[b*6][0],gr=g.createRadialGradient(root[0]*w,root[1]*h,0,root[0]*w,root[1]*h,h*.28);gr.addColorStop(0,'rgba(210,195,255,.22)');gr.addColorStop(1,'transparent');g.globalAlpha=fade*intensity;g.fillStyle=gr;g.fillRect(0,0,w,h);
      const end=s.bolts[b*6].at(-1);for(let i=0;i<30;i++){const p=i/30,x=end[0]*w+Math.sin(i*1.6+time)*w*.005*p,y=h*(.752+p*.245),len=w*(.001+p*.014)*( .3+noise(i)*.7);g.globalAlpha=fade*intensity*(1-p)*.32;g.strokeStyle='#d1c3fc';g.lineWidth=1+p*2;g.beginPath();g.moveTo(x-len,y);g.lineTo(x+len,y);g.stroke()}}
  }
  function waterfall(g,s,t,w,h,fade,reduced){
    const time=reduced?12:t,world=reduced?1:ease((t-3.8)/5),img=s.entry.images[0];lake(g,img,w,h,time,fade*world,.81);
    // Repeated falling texture is masked inside the water, never moving rock faces.
    if(!s.fallLayer){const c=document.createElement('canvas');c.width=512;c.height=768;const q=c.getContext('2d');q.drawImage(img,img.width*.36,0,img.width*.28,img.height*.70,0,0,512,768);q.globalCompositeOperation='destination-in';const mask=q.createLinearGradient(0,0,512,0);mask.addColorStop(0,'transparent');mask.addColorStop(.17,'#000');mask.addColorStop(.83,'#000');mask.addColorStop(1,'transparent');q.fillStyle=mask;q.fillRect(0,0,512,768);s.fallLayer=c}
    if(world){const z=s.fallLayer;if(!s.fallFrame){const a=z.getContext('2d'),edge=a.createLinearGradient(0,0,0,z.height);edge.addColorStop(0,'transparent');edge.addColorStop(.16,'#000');edge.addColorStop(.84,'#000');edge.addColorStop(1,'transparent');a.globalCompositeOperation='destination-in';a.fillStyle=edge;a.fillRect(0,0,z.width,z.height);s.fallFrame=document.createElement('canvas');s.fallFrame.width=z.width;s.fallFrame.height=z.height}const q=s.fallFrame.getContext('2d'),offset=(time*.28%1)*z.height;q.clearRect(0,0,z.width,z.height);q.globalCompositeOperation='source-over';q.drawImage(z,0,offset);q.drawImage(z,0,offset-z.height);q.globalCompositeOperation='destination-in';const mask=q.createLinearGradient(0,0,0,z.height);mask.addColorStop(0,'transparent');mask.addColorStop(.12,'#000');mask.addColorStop(.78,'#000');mask.addColorStop(1,'transparent');q.fillStyle=mask;q.fillRect(0,0,z.width,z.height);g.globalAlpha=fade*world*.36;g.drawImage(s.fallFrame,w*.36,0,w*.28,h*.78);
    }
    if(!reduced&&t<8){const info=window.TenzerWorld.glyph(g,s,t,w,h,fade,true),flow=ease((t-.6)/3.3),end=info.y+(h*.82-info.y)*flow;
      for(let i=0;i<info.points.length;i++){const [px,py]=info.points[i],x=info.x+px*info.size,y=info.y+py*info.size,p=(time*(.65+noise(i)*.3)+noise(i))%1;g.globalAlpha=fade*(1-world)*flow*.65;g.strokeStyle=t<1.6?'#38424b':'#b6deed';g.lineWidth=1+flow*3;g.beginPath();g.moveTo(x,y);g.lineTo(x,y+(end-y)*ease((t-1.5)/2));g.stroke();g.fillStyle='#daeff6';g.beginPath();g.ellipse(x,y+p*Math.max(0,end-y),1.5,4,0,0,Math.PI*2);g.fill()}
    }
    const mist=reduced?1:ease((t-3.8)/3);for(let i=0;i<20;i++){const p=noise(i),x=w*(.27+p*.46)+(reduced?0:Math.sin(time*.35+i)*w*.02),y=h*(.73+noise(i+7)*.09),r=h*(.045+noise(i+13)*.065),gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(228,247,252,.2)');gr.addColorStop(1,'transparent');g.globalAlpha=fade*mist;g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2)}
    if(!reduced)for(let i=0;i<55;i++){const p=(time*.42+noise(i))%1,x=w*(.39+noise(i+5)*.22)+(noise(i+13)-.5)*w*.12*p,y=h*.80-h*.13*Math.sin(p*Math.PI);g.globalAlpha=fade*mist*(1-p)*.27;g.fillStyle='#e2f5ff';g.beginPath();g.arc(x,y,.5+noise(i)*1.2,0,Math.PI*2);g.fill()}
  }
  const scenes={bloom,moon,lightning,waterfall};window.TenzerDream={draw(g,s,fade,w,h,reduced){const f=scenes[s.entry.behavior];if(!f)return false;f(g,s,s.life,w,h,fade,reduced);return true}};
})();
