/* Semantic scenes and soft botanical motion. All coordinates scale to the wall. */
(() => {
  const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x)},noise=x=>{const n=Math.sin(x*127.1+311.7)*43758.5453;return n-Math.floor(n)};
  const crop=(g,img,c,x,y,w,h)=>g.drawImage(img,c[0]*img.width,c[1]*img.height,c[2]*img.width,c[3]*img.height,x,y,w,h);
  function glyph(g,s,t,w,h,fade,liquid=false){
    const size=s.entry.size||Math.min(w,h)*.2,x=s.x??w/2,y=s.y??h/2;
    if(!s.ink){const c=document.createElement('canvas');c.width=c.height=256;const q=c.getContext('2d');q.fillStyle='#242c30';q.font='190px "uddigikyokasho-pro",sans-serif';q.textAlign='center';q.textBaseline='middle';q.fillText(s.entry.glyph,128,128);s.ink=c;
      const d=q.getImageData(0,0,256,256).data;s.bottoms=[];for(let a=20;a<236;a+=7)for(let b=235;b>20;b--)if(d[(b*256+a)*4+3]>100){s.bottoms.push([a/256-.5,b/256-.5]);break}}
    g.globalAlpha=fade*(1-ease((t-1)/3));const scale=1+.18*Math.sin(clamp(t/.8)*Math.PI);
    for(let j=0;j<32;j++){const q=j/32,drip=liquid?ease((t-.6)/3)*h*.14*q*q:0;g.drawImage(s.ink,0,j*8,256,8,x-size*scale/2,y-size*scale/2+q*size*scale+drip,size*scale,size*scale/32+1)}
    return {x,y,size,points:s.bottoms};
  }
  function bloom(g,s,t,w,h,fade,reduced){
    const img=s.entry.images[0],min=Math.min(w,h),count=reduced?22:Math.min(85,Math.round(w/h*22)+20),clock=reduced?12:t;
    // Loose curved drifts, never visible stems or branch connectors.
    s.flowers=[];
    for(let i=0;i<count;i++){const u=(i+.5)/count,side=i%3,phase=u*Math.PI*2.4;
      const x=w*(.05+.9*u),y=h*(.46+.25*Math.sin(phase)+(.5-noise(i+39))*.3);
      s.flowers.push({x,y});const delay=Math.abs(x-(s.x??w/2))/w*3.6+noise(i+5)*2,open=ease((clock-delay)/2.4);if(!open)continue;
      const size=min*(.13+noise(i+7)*.12)*(0.12+.88*open),rotation=(noise(i+81)-.5)*1.1+(reduced?0:Math.sin(t*.55+i)*.025);
      g.save();g.translate(x,y);g.rotate(rotation);g.scale(.35+.65*open,1);g.globalAlpha=fade*ease(open*3);
      crop(g,img,[(i%2)*.5,(Math.floor(i/2)%2)*.5,.5,.5],-size/2,-size/2,size,size);g.restore();
    }
  }
  const rigs={cat:{body:[.016,.02,.62,.44],front:[.71,.08,.195,.39],hind:[.095,.52,.29,.44],tail:[.52,.59,.46,.31]},horse:{body:[.065,.015,.575,.465],front:[.727,.025,.133,.505],hind:[.18,.51,.145,.475],tail:[.40,.642,.555,.283]}};
  function animal(g,img,kind,x,ground,size,clock,gallop,alpha,reduced,direction=1){
    const c=rigs[kind],cat=kind==='cat',legHeight=size*(cat?.25:.45),bodyHeight=size*(cat?.61:.53),hipY=-legHeight,phase=reduced?0:clock*(cat?3.7:4+gallop*4),stride=size*(cat?.10:.17+gallop*.1);
    const part=(name,a,b,cw,ch)=>crop(g,img,c[name],a,b,cw,ch);
    g.save();g.translate(x,ground);g.scale(direction,1);g.globalAlpha=alpha;
    const leg=(front,offset,far)=>{const p=(phase/(Math.PI*2)+offset)%1,stance=p<.64,u=stance?p/.64:(p-.64)/.36,foot=stride*(stance?.5-u:-.5+ease(u)),lift=stance?0:Math.sin(u*Math.PI)*size*(cat?.028:.06),width=size*(cat?(front?.10:.17):(front?.10:.12));
      g.save();if(far){g.filter='brightness(.82)';g.translate(size*.035,-size*.006)}g.translate(size*(front?(cat?.28:.16):-.29),hipY);g.transform(1,0,foot/legHeight,1,0,0);part(front?'front':'hind',-width/2,-size*.09,width,legHeight+size*.09-lift);g.restore();};
    leg(false,.5,true);leg(true,.75,true);
    g.save();g.translate(-size*.39,hipY-(cat?bodyHeight*.31:size*.04));g.rotate(reduced?0:Math.sin(clock*1.4)*.07);part('tail',-size*.46,-size*(cat?.19:.12),size*.51,size*(cat?.29:.24));g.restore();
    leg(false,0,false);leg(true,.25,false);
    // The torso covers all four hip joints; paws remain short and grounded.
    g.save();g.translate(0,reduced?0:Math.sin(phase*2)*size*(cat?.003:.007+gallop*.014));part('body',-size*.48,hipY-bodyHeight*.82,size,bodyHeight);g.restore();g.restore();
  }
  function cat(g,s,t,w,h,fade,reduced){
    const wall=(s.originalEntry||s.entry).images[1],wallScale=Math.max(w/wall.width,h/wall.height);
    const size=Math.min(w*.44,h*.44),clock=reduced?8:t,x=w*.55,ground=(h-wall.height*wallScale)/2+wall.height*wallScale*.678,img=s.entry.images[0],cw=img.width/2,ch=img.height;
    // Contact follows the wall's cover crop, independent of animation time.
    s.catContact={x,y:ground};
    g.globalAlpha=fade*(reduced?1:ease(t/2));g.drawImage(s.entry.images[1],0,0,w,h);
    if(!s.catSky||s.catSkySize!==w+':'+h){const bg=s.entry.images[1],c=document.createElement('canvas');c.width=Math.min(w,1200);c.height=Math.round(c.width*h/w*.44);const q=c.getContext('2d');q.drawImage(bg,0,0,bg.width,bg.height*.44,0,0,c.width,c.height);q.globalCompositeOperation='destination-in';const mask=q.createLinearGradient(0,0,0,c.height);mask.addColorStop(0,'#000');mask.addColorStop(.68,'#000');mask.addColorStop(1,'transparent');q.fillStyle=mask;q.fillRect(0,0,c.width,c.height);s.catSky=c;s.catSkySize=w+':'+h;}
    g.drawImage(s.catSky,-w*.035+(reduced?0:Math.sin(clock*.06)*w*.026),-h*.004,w*1.07,h*.45);
    if(s.catFoot===undefined){const c=document.createElement('canvas');c.width=Math.ceil(cw);c.height=ch;const q=c.getContext('2d');q.drawImage(img,0,0,cw,ch,0,0,cw,ch);const p=q.getImageData(0,0,c.width,c.height).data;let bottom=0;for(let y=0;y<ch;y++)for(let xx=0;xx<c.width;xx++)if(p[(y*c.width+xx)*4+3]>120)bottom=Math.max(bottom,y);s.catFoot=(bottom+1)/ch;}
    g.globalAlpha=fade*(reduced?1:ease(t/2))*.25;g.fillStyle='#302b34';g.beginPath();g.ellipse(x+size*.05,ground,size*.26,size*.025,0,0,Math.PI*2);g.fill();
    g.save();g.translate(x,ground+size*(1-s.catFoot));g.globalAlpha=fade*(reduced?1:ease(t/2));
    // The tail is attached under the hindquarters; only its distal end flexes.
    const tailW=size*.70,tailH=tailW*ch/cw,tailX=size*.20;
    for(let j=0;j<32;j++){const u=j/32,bend=reduced?0:Math.sin(clock*.85-u*2)*size*.07*u*u;g.drawImage(img,cw+u*cw,0,cw/32,ch,tailX+u*tailW,-tailH*.91+bend,tailW/32+.5,tailH)}
    g.drawImage(img,0,0,cw,ch,-size*.40,-size,size*cw/ch,size);g.restore();
  }
  function horsePose(t,w,size,x){const direction=x>w*.5?-1:1,speed=Math.min(w*.11,size*.52),span=w+size*2,position=((x+size+direction*t*speed)%span+span)%span-size;return {x:position,direction,gallop:1}}
  function horse(g,s,t,w,h,fade,reduced){
    if(s.entry.images[1]){g.globalAlpha=fade;g.drawImage(s.entry.images[1],0,0,w,h)}
    if(!s.horseSky){const bg=(s.originalEntry||s.entry).images[1],c=document.createElement('canvas');c.width=bg.width;c.height=bg.height;const q=c.getContext('2d');q.drawImage(bg,0,0);const p=q.getImageData(0,0,c.width,c.height);for(let x=0;x<c.width;x++){const nx=x/c.width,edge=.30-.15*Math.exp(-Math.pow((nx-.47)/.17,2));for(let y=0;y<c.height;y++)p.data[(y*c.width+x)*4+3]*=clamp((edge-y/c.height)/.045);}q.putImageData(p,0,0);s.horseSky=c;}
    const skyScale=Math.max(w/s.horseSky.width,h/s.horseSky.height),skyW=s.horseSky.width*skyScale,skyH=s.horseSky.height*skyScale;
    g.globalAlpha=fade;g.drawImage(s.horseSky,(w-skyW)/2+(reduced?0:Math.sin(t*.075)*skyW*.018),(h-skyH)/2,skyW,skyH);
    const size=Math.min(w*.43,h*.57),origin=s.x??w/2,pose=reduced?{x:w*.5,direction:1,gallop:0}:horsePose(t,w,size,origin);
    pose.gallop=1;
    const emerge=1,ground=h*.84;
    // Whole-body poses keep the rump and all four joints continuous. Never shear limbs.
    const img=s.entry.images[0];
    if(!s.horseFrames){s.horseFrames=[];for(let i=0;i<8;i++){
      const c=document.createElement('canvas');c.width=Math.floor(img.width/4);c.height=Math.floor(img.height/2);const q=c.getContext('2d');
      q.drawImage(img,(i%4)*img.width/4,Math.floor(i/4)*img.height/2,img.width/4,img.height/2,0,0,c.width,c.height);
      const pixels=q.getImageData(0,0,c.width,c.height).data;let top=c.height,right=0;
      for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(pixels[(y*c.width+x)*4+3]>100){top=Math.min(top,y);right=Math.max(right,x)}
      s.horseFrames.push({image:c,top,right});
    }}
    const frame=reduced?5:Math.floor(t*12)%8,f=s.horseFrames[frame],scale=size/(s.horseFrames[5].image.height*.76);
    g.save();g.translate(pose.x,ground);g.scale(pose.direction,1);g.globalAlpha=fade*emerge;
    // Align the head, not the hooves: airborne poses must lift naturally above ground.
    g.drawImage(f.image,(s.horseFrames[5].right-f.right)*scale-size*.82,-size+(s.horseFrames[5].top-f.top)*scale,f.image.width*scale,f.image.height*scale);g.restore();
    if(!reduced)for(let i=0;i<18;i++){const p=(t*.6+noise(i))%1;g.globalAlpha=fade*pose.gallop*(1-p)*.085;g.fillStyle='#ad9873';g.beginPath();g.ellipse(pose.x-pose.direction*(size*.3+p*size),ground-p*size*.12,size*(.015+p*.07),size*(.008+p*.025),0,0,Math.PI*2);g.fill()}
  }
  function forest(g,s,t,w,h,fade,reduced){
    const img=s.entry.images[0],p=reduced?1:ease(t/1.4);g.save();g.globalAlpha=fade*p;g.filter='contrast(1.06) saturate(1.04)';
    if(reduced)g.drawImage(img,0,0,w,h);else for(let y=0;y<h;y+=4){const v=y/h,bend=Math.sin(t*.3+v*.8)*Math.min(w,h)*.0035*(1-ease(v/.78)),sh=Math.min(img.height-y*img.height/h,5*img.height/h);g.drawImage(img,0,y*img.height/h,img.width,sh,-w*.005+bend,y,w*1.01,5);}
    g.restore();
    if(!s.forestLeaves||s.forestSize!==w+':'+h){const c=document.createElement('canvas');c.width=Math.min(1200,w);c.height=Math.round(c.width*h/w);const q=c.getContext('2d');q.drawImage(img,0,0,c.width,c.height);const a=q.getImageData(0,0,c.width,c.height);for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){const k=(y*c.width+x)*4,r=a.data[k],green=a.data[k+1],b=a.data[k+2],ny=y/c.height;const foliage=clamp((green-b+8)/22)*clamp((green-r+20)/35),height=1-ease((ny-.45)/.35);a.data[k+3]=Math.round(255*foliage*height);}q.putImageData(a,0,0);s.forestLeaves=c;s.forestSize=w+':'+h;}
    if(!reduced){const c=s.forestLeaves;g.globalAlpha=fade*p*.8;for(let j=0;j<96;j++){const u=j/96,bend=Math.sin(t*.43+u*7)*Math.min(w,h)*.003;g.drawImage(c,u*c.width,0,c.width/96,c.height,u*w+bend,Math.sin(t*.37+u*9)*h*.0015,w/96+.5,h);}
      const glow=g.createRadialGradient(w*.52,h*.23,0,w*.52,h*.23,h*.65);glow.addColorStop(0,'rgba(244,239,195,.10)');glow.addColorStop(1,'transparent');g.globalAlpha=fade*p*(.5+.3*Math.sin(t*.35));g.fillStyle=glow;g.fillRect(0,0,w,h);
    }
    // Slow drifting dust catches the sunbeam; brighter motes are nearer the viewer.
    if(!reduced)for(let i=0;i<12;i++){const phase=(noise(i+900)+t*(.022+noise(i+910)*.018))%1,size=Math.min(w,h)*(.004+noise(i+920)*.005),x=w*noise(i+930)+Math.sin(t*.55+i)*w*.025,y=phase*(h+size*4)-size*2;g.save();g.translate(x,y);g.rotate(t*.38+i);g.scale(.35+.65*Math.abs(Math.sin(t*.8+i)),1);g.globalAlpha=fade*p*Math.sin(phase*Math.PI)*.6;g.fillStyle=i%3?'#9ea665':'#d2b878';g.beginPath();g.moveTo(0,-size);g.quadraticCurveTo(size,0,0,size);g.quadraticCurveTo(-size,0,0,-size);g.fill();g.restore();}
    for(let i=0;i<65;i++){const clock=reduced?12:t,depth=.25+noise(i+516)*.75,phase=(noise(i+331)+clock*(.009+depth*.012))%1,x=w*(.22+noise(i+221)*.55)+Math.sin(clock*.19+i)*h*.018,y=h*(.08+phase*.78),r=Math.max(.45,Math.min(w,h)*(.0008+depth*.002)),light=Math.max(0,1-Math.abs(x/w-.51)*2.5),alpha=Math.sin(phase*Math.PI)*light*(.12+depth*.32);g.globalAlpha=fade*p*alpha;g.fillStyle=i%3?'#f4edcb':'#dce9d4';g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();}
    if(s.entry.images.length===1){if(!reduced)for(let i=0;i<28;i++){const x=w*noise(i+4)+Math.sin(t*.25+i)*h*.018,y=h*(.25+noise(i+9)*.7)+Math.cos(t*.3+i)*h*.02,r=1+noise(i)*1.2;g.globalAlpha=fade*p*(.15+.5*Math.pow(.5+.5*Math.sin(t+i),2));g.fillStyle='#ffe6a6';g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill()}return}
    const atlas=s.entry.images[3],count=Math.max(4,Math.ceil(w/h*3));
    for(let i=0;i<count;i++){const open=reduced?1:ease((t-2-i*.25)/5),size=h*(.65+noise(i)*.25),x=w*(i%2?1-Math.floor(i/2)*.11:Math.floor(i/2)*.11);g.save();g.translate(x,h*1.04);g.transform(1,0,reduced?0:Math.sin(t*.42+i)*.006,1,0,0);g.globalAlpha=fade*open*.58;crop(g,atlas,[(i%2)*.5,0,.5,.585],-size*.35,-size*open,size*.7,size*open);g.restore()}
  }
  function waterfall(g,s,t,w,h,fade,reduced){
    const clock=reduced?12:t,world=reduced?1:ease((t-5)/6),img=s.entry.images[0];g.globalAlpha=fade*world;g.drawImage(img,0,0,w,h);
    const info=!reduced&&t<5?glyph(g,s,t,w,h,fade,true):{x:s.x??w/2,y:s.y??h/2,size:Math.min(w,h)*.2,points:s.bottoms||[]};
    // Only water columns shimmer downward. Rocks and tree silhouettes stay still.
    if(world)for(const [left,right,top,bottom] of [[.39,.63,.07,.69],[.165,.205,.19,.65],[.79,.835,.21,.67]])for(let i=0;i<60;i++){
      const p=(noise(i+left*100)+clock*(.27+noise(i)*.14))%1,x=w*(left+(right-left)*noise(i+24)),y=h*(top+p*(bottom-top));g.globalAlpha=fade*world*Math.sin(p*Math.PI)*.23;g.strokeStyle='#e4f1ed';g.lineWidth=w*.001;g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.sin(i+clock)*w*.001,y+h*.035);g.stroke();
    }
    if(!reduced&&t<10){const flow=ease((t-.7)/4),end=info.y+(h-info.y)*flow;
      for(let i=0;i<info.points.length;i++){const [px,py]=info.points[i],x=info.x+px*info.size,y=info.y+py*info.size,p=(t*(.7+noise(i)*.3)+noise(i))%1;
        g.globalAlpha=fade*(1-world)*flow*.65;g.strokeStyle=t<1.8?'#343f45':'#a5cdd9';g.lineWidth=1+flow*3;g.beginPath();g.moveTo(x,y);g.lineTo(x,y+(end-y)*ease((t-1.5)/3));g.stroke();g.fillStyle='#c7e5ee';g.beginPath();g.ellipse(x,y+p*Math.max(0,end-y),1.5,3.5,0,0,Math.PI*2);g.fill();
      }
    }
    const mist=reduced?1:ease((t-4)/4);for(let i=0;i<12;i++){const x=w*(.2+noise(i)*.6)+(reduced?0:Math.sin(t*.3+i)*w*.015),y=h*(.70+noise(i+30)*.12),r=h*(.06+noise(i+12)*.04),gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(228,240,227,.12)');gr.addColorStop(1,'transparent');g.fillStyle=gr;g.globalAlpha=fade*mist;g.fillRect(x-r,y-r,r*2,r*2)}
  }
  const renderers={bloom,cat,forest,horse,waterfall};window.TenzerWorld={glyph,horsePose,draw(g,s,fade,w,h,reduced){const f=renderers[s.entry.behavior];if(!f)return false;f(g,s,s.life,w,h,fade,reduced);return true}};
})();
