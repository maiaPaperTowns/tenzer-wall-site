/* Four reference-led landscape scenes. Motion stays local to its material. */
(() => {
  const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x)},noise=i=>{const n=Math.sin(i*127.1+311.7)*43758.5453;return n-Math.floor(n)};
  function driftingSky(g,s,key,index,w,h,t,alpha,reduced,ridge,amount,cloudOnly=false){
    if(!s[key]){const original=(s.originalEntry||s.entry).images[index],c=document.createElement('canvas');c.width=original.width;c.height=original.height;const q=c.getContext('2d');q.drawImage(original,0,0);const p=q.getImageData(0,0,c.width,c.height);
      for(let x=0;x<c.width;x++){const nx=x/c.width;let k=0;while(k<ridge.length-2&&nx>ridge[k+1][0])k++;const a=ridge[k],b=ridge[k+1],edge=a[1]+(b[1]-a[1])*(nx-a[0])/(b[0]-a[0]),side=ease(nx/.02)*ease((1-nx)/.02);for(let y=0;y<c.height;y++){const i=(y*c.width+x)*4,cloud=cloudOnly?clamp((p.data[i]-p.data[i+2]*.42)/30)*clamp((p.data[i]+p.data[i+1]-65)/100):1;p.data[i+3]*=ease((edge-y/c.height)/.05)*side*cloud;}}
      q.putImageData(p,0,0);s[key]=c;
    }
    const c=s[key],scale=Math.max(w/c.width,h/c.height),sw=c.width*scale,sh=c.height*scale;g.save();g.globalAlpha=alpha;g.drawImage(c,(w-sw)/2+(reduced?0:Math.sin(t*.055)*sw*amount),(h-sh)/2,sw,sh);g.restore();
  }
  function lake(g,img,w,h,t,fade,line=.75){
    surface(g,img,w,h,t*.65,fade,line);
  }
  function surface(g,img,w,h,t,fade,top=0){
    g.globalAlpha=fade;g.drawImage(img,0,0,w,h);
    // Two travelling frequencies move reflections together, without magnifying the plate.
    for(let y=Math.ceil(h*top);y<h;y+=3){const q=y/h,d=(q-top)/(1-top),a=ease(d*5)*(.35+.65*d),sy=Math.max(top*img.height,Math.min(img.height-4*img.height/h,(q+Math.sin(q*28-t*.65)*.004*a)*img.height)),dx=(Math.sin(q*48-t*.8)+.5*Math.sin(q*19+t*.47))*h*.009*a;
      g.drawImage(img,0,sy,img.width,Math.min(4*img.height/h,img.height-sy),dx,y,w,4);
    }
  }
  function bloom(g,s,t,w,h,fade,reduced){
    if(s.entry.behavior==='sakura'){sakura(g,s,t,w,h,fade,reduced);return}
    if(s.entry.options.watercolor){watercolorFlower(g,s,t,w,h,fade,reduced);return}
    const time=reduced?12:t,min=Math.min(w,h),arrive=reduced?1:ease(t/3.2);g.globalAlpha=fade*arrive;g.drawImage(s.entry.images[1],0,0,w,h);
    if(!s.flowerSky||s.flowerSkySize!==w+':'+h){const img=s.entry.images[1],c=document.createElement('canvas');c.width=Math.min(w,1200);c.height=Math.round(c.width*h/w*.54);const q=c.getContext('2d');q.drawImage(img,0,0,img.width,img.height*.54,0,0,c.width,c.height);q.globalCompositeOperation='destination-in';const mask=q.createLinearGradient(0,0,0,c.height);mask.addColorStop(0,'#000');mask.addColorStop(.70,'#000');mask.addColorStop(1,'transparent');q.fillStyle=mask;q.fillRect(0,0,c.width,c.height);s.flowerSky=c;s.flowerSkySize=w+':'+h;}
    g.drawImage(s.flowerSky,-w*.07+(reduced?0:Math.sin(time*.11)*w*.06),-h*.004,w*1.14,h*.55);
    const img=s.entry.images[0],count=Math.min(180,Math.max(65,Math.round(w/h*45)));s.flowers=[];
    for(let i=0;i<count;i++){
      const depth=.54+.46*i/count,x=w*(.02+noise(i+81)*.96),target=h*depth,open=reduced?1:ease((t-.3-noise(i+20)*3.2)/2.4),size=min*(.045+depth*.13)*(.08+.92*open),y=target+(1-open)*min*.025,sway=reduced?0:Math.sin(time*.7+i*.9)*size*.1,rootY=Math.min(h*1.04,target+min*(.11+noise(i+18)*.09)),rootX=x+(noise(i+57)-.5)*size*.7;
      s.flowers.push({x:x+sway,y,open});g.globalAlpha=fade*open;g.strokeStyle=i%2?'#54743d':'#73984b';g.lineWidth=Math.max(.6,size*.02);g.beginPath();g.moveTo(rootX,rootY);g.quadraticCurveTo(x-size*.18+sway,(y+rootY)/2,x+sway,y);g.stroke();
      for(let j=0;j<2;j++){const ly=y+(rootY-y)*(.45+j*.25),side=j%2?1:-1;g.save();g.translate(x+sway*.5,ly);g.rotate(side*.8);g.fillStyle=j?'#688b46':'#52793c';g.beginPath();g.ellipse(side*size*.12,0,size*.15,size*.045,0,0,Math.PI*2);g.fill();g.restore();}
      g.save();g.translate(x+sway,y);g.rotate((noise(i+31)-.5)*.6+(reduced?0:Math.sin(time*.7+i)*.06));g.scale(.3+.7*open,1);g.globalAlpha=fade*open;
      g.drawImage(img,(i%2)*img.width/2,(Math.floor(i/2)%2)*img.height/2,img.width/2,img.height/2,-size/2,-size/2,size,size);g.restore();
    }
    // Small translucent petals travel independently of the painted canopy.
    if(!reduced)for(let i=0;i<40;i++){const p=(time*(.035+noise(i)*.025)+noise(i+13))%1,x=(noise(i+4)*w+p*w*.19+Math.sin(p*7+i)*min*.04)%(w+30),y=-20+p*(h+40),size=min*(.006+noise(i+12)*.008);
      g.save();g.translate(x,y);g.rotate(time*(.4+noise(i))+i);g.scale(.25+.75*Math.abs(Math.sin(time+i)),1);g.globalAlpha=fade*arrive*Math.sin(p*Math.PI)*.85;g.fillStyle=i%2?'#f7c3d7':'#ffe4e9';g.beginPath();g.moveTo(0,-size);g.bezierCurveTo(size*1.1,-size*.8,size*.7,size*.8,0,size);g.bezierCurveTo(-size*.8,size*.5,-size*.7,-size*.7,0,-size);g.fill();g.restore();
    }
  }
  function watercolorFlower(g,s,t,w,h,fade,reduced){
    const clock=reduced?10:t,min=Math.min(w,h),arrive=reduced?1:ease(t/2.4),atlas=s.entry.images[0];
    g.globalAlpha=fade*arrive;g.drawImage(s.entry.images[1],0,0,w,h);
    // Airy ink-wash composition: large flowers on the right, quiet paper on the left.
    const layouts=[[.86,.13,.48,1,-.14],[.92,.34,.52,3,.13],[.72,.57,.72,0,-.08],[.88,.85,.55,3,.22],[.64,.91,.46,1,-.38],[.10,.91,.42,2,.18],[.12,.19,.34,1,.46],[.06,.43,.38,3,-.3],[.20,.66,.45,2,.3],[.38,.86,.40,0,-.2],[.57,.25,.37,3,.2],[.38,.42,.34,0,.2],[.91,.64,.40,2,-.26],[.41,.09,.31,1,-.4]];
    const cells=[[0,0,.555,.515],[.555,0,.445,.515],[0,.52,.535,.48],[.535,.515,.465,.485]];
    s.flowers=[];
    layouts.forEach(([nx,ny,k,cell,angle],i)=>{const open=reduced?1:ease((t-.18-noise(i+62)*3.2)/3.2),size=min*k*(.68+.32*open),sway=reduced?0:Math.sin(clock*.45+i*.8)*.018,x=nx*w,y=ny*h,[sx,sy,sw,sh]=cells[cell],cw=atlas.width*sw,ch=atlas.height*sh;
      s.flowers.push({x,y,open});g.save();g.translate(x,y+size*.28);g.rotate(angle+sway);g.translate(0,-size*.28);g.scale(.86+.14*open,1);g.globalAlpha=fade*open;g.imageSmoothingQuality='high';g.drawImage(atlas,sx*atlas.width,sy*atlas.height,cw,ch,-size/2,-size/2,size,size*ch/cw);g.restore();
    });
    if(!reduced)for(let i=0;i<32;i++){const phase=(noise(i+421)+clock*(.025+noise(i+88)*.022))%1,x=w*(noise(i+59)*1.15-phase*.20)+Math.sin(phase*7+i)*min*.05,y=-min*.04+phase*(h+min*.08),size=min*(.009+noise(i+33)*.015);g.save();g.translate(x,y);g.rotate(clock*.32+i);g.scale(.4+.6*Math.abs(Math.sin(clock*.48+i)),1);g.globalAlpha=fade*arrive*Math.sin(phase*Math.PI)*.7;g.fillStyle=i%2?'#fffdf6':'#e9e3d6';g.beginPath();g.moveTo(0,-size);g.bezierCurveTo(size*.85,-size*.6,size*.6,size*.7,0,size);g.bezierCurveTo(-size*.6,size*.4,-size*.45,-size*.6,0,-size);g.fill();g.restore();}
  }
  function bridgeSakura(g,s,t,w,h,fade,reduced){
    if(!s.mutedSakura){s.mutedSakura=s.entry.images.map((img,i)=>{const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const q=c.getContext('2d');q.filter=i===0?'saturate(.52) contrast(.94) brightness(1.025)':'saturate(.70) contrast(.97)';q.drawImage(img,0,0);return c;});}
    const atlas=s.mutedSakura[0],clock=reduced?12:t,min=Math.min(w,h);g.globalAlpha=fade;g.drawImage(s.mutedSakura[1],0,0,w,h);
    const placements=[[.02,.02,1.05,0,-.16],[.26,-.05,1.05,1,.08],[.54,-.09,1.0,0,-.05],[.80,-.04,1.05,1,.12],[1,.08,1.05,2,-.22],[.04,.32,.76,2,.18],[.98,.39,.85,3,-.2],[.04,.66,.60,3,.25],[.98,.71,.67,2,-.14],[.08,.97,.55,0,-.08],[.93,.96,.55,1,.08]];
    s.flowers=[];placements.forEach(([nx,ny,k,cell,angle],i)=>{const open=reduced?1:ease((t-noise(i+94)*2.8)/3),size=min*k*(.76+.24*open),cw=atlas.width/2,ch=atlas.height/2,sway=reduced?0:Math.sin(clock*.42+i)*.016;s.flowers.push({x:nx*w,y:ny*h,open});g.save();g.translate(nx*w,ny*h);g.rotate(angle+sway);g.globalAlpha=fade*open;g.imageSmoothingQuality='high';g.drawImage(atlas,(cell%2)*cw,Math.floor(cell/2)*ch,cw,ch,-size/2,-size/2,size,size*ch/cw);g.restore();});
    if(!reduced){g.save();g.filter='saturate(.45)';petalDrift(g,clock,w,h,fade*.8,false);petalDrift(g,clock+19,w,h,fade*.5,false);g.restore();}
  }
  function sakura(g,s,t,w,h,fade,reduced){
    if(s.entry.options.bridge){bridgeSakura(g,s,t,w,h,fade,reduced);return;}
    const plate=s.entry.images[1],atlas=s.entry.images[0],clock=reduced?12:t;g.globalAlpha=fade*(reduced?1:ease(t/2));g.drawImage(plate,0,0,w,h);
    if(!s.blossomAnchors){const c=document.createElement('canvas');c.width=384;c.height=Math.round(384*h/w);const q=c.getContext('2d');q.drawImage(plate,0,0,c.width,c.height);const p=q.getImageData(0,0,c.width,c.height).data,points=[];for(let y=0;y<c.height;y+=3)for(let x=0;x<c.width;x+=3){const k=(y*c.width+x)*4;if(p[k]<145&&p[k+1]<125&&p[k+2]<140)points.push([x/c.width,y/c.height])}s.blossomAnchors=points.length?points:[[.2,.2],[.8,.3]];}
    const branchAtlas=s.entry.images[2],branchWidth=Math.min(w*.74,h*2),branchHeight=branchWidth*branchAtlas.height/2/branchAtlas.width,layouts=[[w*1.03-branchWidth,h*.30,false],[-w*.03,h*.63,true]];
    // Small masks locate blossoms only; visible branches retain the full source resolution.
    if(!s.sakuraTwigPixels){s.sakuraTwigPixels=[];for(let i=0;i<2;i++){const c=document.createElement('canvas');c.width=384;c.height=Math.round(384*branchAtlas.height/2/branchAtlas.width);const q=c.getContext('2d');q.drawImage(branchAtlas,0,i*branchAtlas.height/2,branchAtlas.width,branchAtlas.height/2,0,0,c.width,c.height);const p=q.getImageData(0,0,c.width,c.height).data,points=[];for(let y=3;y<c.height-3;y+=3)for(let x=3;x<c.width-3;x+=3)if(p[(y*c.width+x)*4+3]>150)points.push([x/c.width,y/c.height]);s.sakuraTwigPixels.push(points);}}
    s.interiorBlossoms=[];layouts.forEach(([x,y,flip],i)=>{g.save();g.globalAlpha=fade*ease(clock/2);g.imageSmoothingQuality='high';g.translate(x+branchWidth/2,y+branchHeight/2);g.scale(flip?-1:1,1);g.drawImage(branchAtlas,0,i*branchAtlas.height/2,branchAtlas.width,branchAtlas.height/2,-branchWidth/2,-branchHeight/2,branchWidth,branchHeight);g.restore();for(const [nx,ny] of s.sakuraTwigPixels[i])s.interiorBlossoms.push([(x+(flip?1-nx:nx)*branchWidth)/w,(y+ny*branchHeight)/h]);});
    s.flowers=[];const count=Math.min(300,Math.max(185,Math.round(w/h*100))),points=s.blossomAnchors;
    for(let i=0;i<count;i++){const candidates=i%3===0?s.interiorBlossoms:points,[nx,ny]=candidates[Math.floor(noise(i+78)*candidates.length)],open=reduced?1:ease((t-.3-noise(i+40)*4)/2.6),size=Math.min(w,h)*(.085+noise(i+13)*.10)*open,x=nx*w+(reduced?0:Math.sin(clock*.65+i)*size*.055),y=ny*h+(reduced?0:Math.sin(clock*.48+i)*size*.025);s.flowers.push({x,y,open});
      g.save();g.translate(x,y);g.rotate((noise(i)-.5)*2+Math.sin(clock*.55+i)*.045);g.scale(.3+.7*open,1);g.globalAlpha=fade*open;g.drawImage(atlas,(i%2)*atlas.width/2,(Math.floor(i/2)%2)*atlas.height/2,atlas.width/2,atlas.height/2,-size/2,-size/2,size,size*atlas.height/atlas.width);g.restore();
    }if(!reduced){petalDrift(g,clock,w,h,fade,false);petalDrift(g,clock+17,w,h,fade*.8,false);}
  }
  function moon(g,s,t,w,h,fade,reduced){
    const time=reduced?10:t,night=reduced?1:ease(t/3),rise=reduced?1:ease((t-.5)/6),min=Math.min(w,h),x=w*.59,y=h*(.67-.38*rise),r=min*.15625;
    lake(g,s.entry.images[1],w,h,time,fade*night,.755);
    driftingSky(g,s,'moonClouds',1,w,h,time,fade*night,reduced,[[0,.59],[.09,.62],[.16,.59],[.23,.59],[.34,.64],[.44,.65],[.55,.67],[.67,.65],[.76,.65],[.88,.61],[1,.65]],.022,true);
    const halo=g.createRadialGradient(x,y,r*.4,x,y,r*2.7);halo.addColorStop(0,'rgba(255,225,187,.3)');halo.addColorStop(.4,'rgba(255,228,193,.13)');halo.addColorStop(1,'rgba(255,228,193,0)');g.globalAlpha=fade*night*rise;g.fillStyle=halo;g.fillRect(x-r*3,y-r*3,r*6,r*6);
    g.save();g.globalCompositeOperation='screen';g.globalAlpha=fade*night*ease(rise*3);g.filter='sepia(.2) brightness(1.15)';g.drawImage(s.entry.images[0],x-r,y-r,r*2,r*2);g.restore();
    for(let i=0;i<65;i++){const p=i/65,yy=h*(.765+p*.235),xx=x+Math.sin(i*1.3+time*.65)*min*.025*p,len=min*(.006+p*.14)*( .3+noise(i)*.7);
      g.globalAlpha=fade*night*rise*(1-p)*(.13+noise(i)*.23);g.strokeStyle='#ffdfbe';g.lineWidth=1+p*2;g.beginPath();g.moveTo(xx-len,yy);g.lineTo(xx+len,yy);g.stroke();
    }
  }
  function strikeSample(t){let index=0,start=.6;while(start+.95+noise(index+901)*1.7<=t){start+=.95+noise(index+901)*1.7;index++}return {index,age:t-start,start}}
  function lightning(g,s,t,w,h,fade,reduced){
    const time=reduced?2:t,img=s.entry.images[0];g.globalAlpha=fade;
    // Replace the entire sky with moving material bands: no stationary cloud plate remains.
    for(let y=0;y<h;y+=3){const v=y/h,dy=Math.sin(time*.23+v*8)*h*.006,dx=(Math.sin(time*.16+v*4)+.4*Math.sin(time*.27+v*11))*w*.012,sh=Math.min(img.height,4*img.height/h),sy=Math.max(0,Math.min(img.height-sh,(y+dy)*img.height/h));g.drawImage(img,0,sy,img.width,sh,-w*.025+dx,y,w*1.05,4);}
    // Feathered cloud texture drifts while the mountains and lake horizon stay fixed.
    if(!s.cloudLayer){const c=document.createElement('canvas');c.width=768;c.height=512;const q=c.getContext('2d');q.drawImage(s.entry.images[0],0,0,768,512);q.globalCompositeOperation='destination-in';const mask=q.createLinearGradient(0,0,0,512);mask.addColorStop(0,'#000');mask.addColorStop(.43,'#000');mask.addColorStop(.65,'transparent');q.fillStyle=mask;q.fillRect(0,0,768,512);s.cloudLayer=c}
    const event=strikeSample(t),strike=reduced?0:event.index,age=event.age,span=.22+noise(strike+83)*.16,intensity=reduced?.25:(age<0?0:ease(age/.025)*(1-ease((age-.05)/(span-.05))));
    if(!s.bolts||s.boltIndex!==strike||s.boltReduced!==reduced){s.bolts=[];for(let b=0;b<1;b++){const trunk=[],seed=strike*31+b*101;let x=.18+noise(seed+71)*.64;for(let j=0;j<24;j++){x+=(noise(seed+j*8)-.5)*.036;trunk.push([x,.10+j*.027])}s.bolts.push(trunk);for(let k=0;k<5;k++){const start=5+k*3,path=[trunk[start]],dir=k%2?1:-1;for(let j=1;j<7;j++){const a=path[j-1];path.push([a[0]+dir*(.012+noise(seed+k*6+j)*.018),a[1]+.02])}s.bolts.push(path)}}s.boltIndex=strike;s.boltReduced=reduced}
    if(!intensity)return;
    for(let layer=0;layer<3;layer++){g.globalAlpha=fade*intensity;g.strokeStyle=['rgba(148,126,255,.13)','rgba(189,182,255,.5)','#f1ebff'][layer];g.lineJoin='round';
      s.bolts.forEach((path,k)=>{g.lineWidth=Math.max(.5,Math.min(w,h)*[.014,.004,.0015][layer])*(k%6?.34:1);g.beginPath();path.forEach(([x,y],j)=>{if(!j){g.moveTo(x*w,y*h);return}const a=path[j-1];for(let step=1;step<=4;step++){const u=step/4;g.lineTo((a[0]+(x-a[0])*u+(step<4?(noise(k*101+j*7+step+strike)-.5)*.007:0))*w,(a[1]+(y-a[1])*u)*h)}});g.stroke()});
    }
    for(let b=0;b<1;b++){const root=s.bolts[b*6][0],gr=g.createRadialGradient(root[0]*w,root[1]*h,0,root[0]*w,root[1]*h,h*.28);gr.addColorStop(0,'rgba(210,195,255,.22)');gr.addColorStop(1,'transparent');g.globalAlpha=fade*intensity;g.fillStyle=gr;g.fillRect(0,0,w,h);
    }
  }
  function waterfall(g,s,t,w,h,fade,reduced){
    const time=reduced?12:t,world=1,img=s.entry.images[0];lake(g,img,w,h,time,fade*world,.79);
    // Extract bright blue-white water at viewport proportions. Moving short bands
    // remain clipped to that material, rather than recycling a rectangular patch.
    if(!s.cascadeWater||s.cascadeSize!==w+':'+h){
      const c=document.createElement('canvas');c.width=Math.min(1200,w);c.height=Math.round(c.width*h/w);const q=c.getContext('2d');q.drawImage(img,0,0,c.width,c.height);const data=q.getImageData(0,0,c.width,c.height);
      for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){const k=(y*c.width+x)*4,r=data.data[k],b=data.data[k+2],v=y/c.height,n=x/c.width;
        const light=ease((r-135)/70)*ease((b-r+12)/30),edge=ease(v/.07)*(1-ease((v-.65)/.14)),right=w/h>1.6?ease((n-.43)/.08):1;
        data.data[k+3]=Math.round(255*light*edge*right);
      }q.putImageData(data,0,0);s.cascadeWater=c;s.cascadeSize=w+':'+h;s.cascadeFrame=document.createElement('canvas');s.cascadeFrame.width=c.width;s.cascadeFrame.height=c.height;
    }
    const flow=s.cascadeWater,q=s.cascadeFrame.getContext('2d');q.clearRect(0,0,flow.width,flow.height);q.globalCompositeOperation='source-over';
    for(let y=0;y<flow.height*.8;y+=4){const p=y/flow.height,travel=(Math.sin(p*67-time*13)+.45*Math.sin(p*119-time*19))*flow.height*.009*ease(p*9),sy=Math.max(0,Math.min(flow.height-6,y-travel));q.drawImage(flow,0,sy,flow.width,6,Math.sin(p*31-time*2)*1.2,y,flow.width,6)}
    q.globalCompositeOperation='destination-in';q.drawImage(flow,0,0);g.globalAlpha=fade*world*.85;g.drawImage(s.cascadeFrame,0,0,w,h);
    // Repeated falling texture is masked inside the water, never moving rock faces.
    if(!s.fallLayer){const c=document.createElement('canvas');c.width=512;c.height=768;const q=c.getContext('2d');q.drawImage(img,img.width*.53,img.height*.10,img.width*.16,img.height*.60,0,0,512,768);q.globalCompositeOperation='destination-in';const mask=q.createLinearGradient(0,0,512,0);mask.addColorStop(0,'transparent');mask.addColorStop(.17,'#000');mask.addColorStop(.83,'#000');mask.addColorStop(1,'transparent');q.fillStyle=mask;q.fillRect(0,0,512,768);s.fallLayer=c}
    const mist=reduced?1:ease((t-3.8)/3);for(let i=0;i<20;i++){const p=noise(i),x=w*(.27+p*.46)+(reduced?0:Math.sin(time*.35+i)*w*.02),y=h*(.73+noise(i+7)*.09),r=h*(.045+noise(i+13)*.065),gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(228,247,252,.2)');gr.addColorStop(1,'transparent');g.globalAlpha=fade*mist;g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2)}
    if(!reduced)for(let i=0;i<115;i++){const age=(time*(.65+noise(i+93)*.35)+noise(i))%1,base=w*(.51+noise(i+5)*.20),vx=(noise(i+13)-.5)*w*.15,vy=h*(.11+noise(i+17)*.12),x=base+vx*age,y=h*.79-vy*age+h*.26*age*age;g.globalAlpha=fade*(1-ease((age-.5)/.5))*(.3+noise(i+82)*.35);g.fillStyle='#f3fbff';g.beginPath();g.ellipse(x,y,Math.max(.7,h*(.001+noise(i)*.003)),Math.max(.7,h*(.001+noise(i)*.002)),age,0,Math.PI*2);g.fill();}
  }
  function dropSample(time){const period=3.8,flight=1.45,cycle=Math.floor(time/period),age=time-cycle*period;return {period,flight,cycle,age,falling:age<flight,fall:clamp(age/flight),impactAge:age-flight}}
  function water(g,s,t,w,h,fade,reduced){
    const clock=reduced?2.4:t,min=Math.min(w,h),arrive=reduced?1:ease(t/2),x=w*.57,y=h*.65,event=dropSample(clock);
    surface(g,s.entry.images[0],w,h,clock,fade*arrive,0);
    // One quiet downward drop per cycle; rings begin only after surface contact.
    if(!reduced&&event.falling){const p=event.fall,dy=h*.10+(y-h*.10)*p*p,r=min*.012,shine=g.createRadialGradient(x-r*.3,dy-r*.4,r*.05,x,dy,r*1.4);shine.addColorStop(0,'#ffffff');shine.addColorStop(.3,'#c5e5f6');shine.addColorStop(.65,'#4680a0');shine.addColorStop(.9,'#deeffa');shine.addColorStop(1,'#6da7c1');g.globalAlpha=fade*arrive*ease(p*5);g.fillStyle=shine;g.beginPath();g.ellipse(x,dy,r*.8,r*(1+.25*p),0,0,Math.PI*2);g.fill()}
    for(let past=0;past<2;past++)for(let ring=0;ring<3;ring++){const age=event.impactAge+past*event.period-ring*.17;if(event.cycle<past||age<0||age>4.8)continue;const p=age/4.8,r=min*(.012+p*.43),alpha=Math.sin(Math.PI*p)*(1-p);g.globalAlpha=fade*arrive*alpha*.55;g.lineWidth=Math.max(.6,min*.0015)*(1-p*.6);g.strokeStyle=ring===1?'#386f95':'#f1fbff';g.beginPath();g.ellipse(x,y,r,r*.28,0,0,Math.PI*2);g.stroke()}
    if(!reduced&&event.impactAge>=0&&event.impactAge<.6){const p=event.impactAge/.6,up=Math.sin(p*Math.PI)*min*.035;g.globalAlpha=fade*arrive*(1-p)*.65;g.fillStyle='#d4effc';g.beginPath();g.moveTo(x-min*.014,y);g.quadraticCurveTo(x-min*.005,y-up*.2,x,y-up);g.quadraticCurveTo(x+min*.005,y-up*.2,x+min*.014,y);g.closePath();g.fill()}
  }
  function fire(g,s,t,w,h,fade,reduced){
    const img=s.entry.images[0],clock=reduced?5:t,arrive=reduced?1:ease(t/2.8),min=Math.min(w,h);
    const atlas=s.entry.images[1],sky=g.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#1d1020');sky.addColorStop(1,'#6b2417');g.globalAlpha=fade*arrive;g.fillStyle=sky;g.fillRect(0,0,w,h);
    g.drawImage(img,0,img.height*.88,img.width,img.height*.12,0,h*.88,w,h*.12);
    const count=Math.max(4,Math.ceil(w/h*6)),cw=atlas.width/4,ch=atlas.height/2;s.flameFrames=[];
    for(let i=0;i<count;i++){const frame=reduced?3:(Math.floor(clock*10)+i*3)%8,height=h*(.55+noise(i+32)*.52),width=height*cw/ch,x=w*(i+.5)/count;s.flameFrames.push(frame);
      g.save();g.translate(x,h*.97);g.globalAlpha=fade*arrive;g.globalCompositeOperation='screen';g.drawImage(atlas,(frame%4)*cw,Math.floor(frame/4)*ch,cw,ch,-width*.5,-height,width,height);g.restore();
    }
    if(!reduced)for(let i=0;i<50;i++){const p=(noise(i)+clock*(.1+noise(i+7)*.08))%1,x=w*(.18+noise(i+20)*.8)+Math.sin(p*7+i)*min*.045,y=h*(.93-p*.94);g.globalAlpha=fade*arrive*Math.sin(p*Math.PI)*.7;g.strokeStyle=i%3?'#ffcf85':'#ff7d3d';g.lineWidth=Math.max(.7,min*.0015);g.beginPath();g.moveTo(x,y);g.lineTo(x+min*.001,y-min*.005);g.stroke()}
  }
  function treeLegacy(g,s,t,w,h,fade,reduced){
    const img=s.entry.images[0],plate=s.entry.images[1],clock=reduced?12:t,arrive=reduced?1:ease(t/2.5);
    g.globalAlpha=fade*arrive;g.drawImage(plate,0,0,w,h);
    if(clock>=10){g.drawImage(img,0,0,w,h);swayCanopy(g,s,img,w,h,clock,fade*arrive,reduced);return}
    if(!s.greenLayer){s.greenLayer=document.createElement('canvas');s.greenLayer.width=1536;s.greenLayer.height=512;s.greenMask=document.createElement('canvas');s.greenMask.width=1536;s.greenMask.height=512}
    const c=s.greenLayer.getContext('2d'),m=s.greenMask.getContext('2d'),W=1536,H=512;
    c.clearRect(0,0,W,H);c.globalCompositeOperation='source-over';c.drawImage(img,0,0,W,H);m.clearRect(0,0,W,H);m.fillStyle='#000';
    const grow=ease(clock/4);m.beginPath();m.moveTo(W*.46,H*.92);m.lineTo(W*.49,H*(.92-grow*.69));m.lineTo(W*.65,H*(.92-grow*.69));m.lineTo(W*.71,H*.92);m.fill();
    for(let i=0;i<60;i++){const x=.20+noise(i+31)*.69,y=.025+noise(i+48)*.55,open=ease((clock-1.5-(1-y)*3-noise(i)*2)/2.4),r=H*(.12+noise(i+10)*.12)*open;if(!r)continue;const gr=m.createRadialGradient(x*W,y*H,0,x*W,y*H,r);gr.addColorStop(0,'#000');gr.addColorStop(.72,'#000');gr.addColorStop(1,'transparent');m.fillStyle=gr;m.fillRect(x*W-r,y*H-r,r*2,r*2)}
    m.globalAlpha=ease((clock-7.5)/2.5);m.fillStyle='#000';m.fillRect(0,0,W,H);m.globalAlpha=1;c.globalCompositeOperation='destination-in';c.drawImage(s.greenMask,0,0);
    g.globalAlpha=fade*arrive;g.drawImage(s.greenLayer,0,0,w,h);
  }
  function tree(g,s,t,w,h,fade,reduced){
    const clock=reduced?12:t,atlas=s.entry.images[2],cw=atlas.width/2,ch=atlas.height/2,size=Math.min(h*.74,w*.58),x=w*.52,ground=h*.95,open=1;
    if(!s.treeCells){s.treeCells=[];for(let i=0;i<4;i++){const c=document.createElement('canvas');c.width=cw;c.height=ch;const q=c.getContext('2d');const inset=12;q.drawImage(atlas,(i%2)*cw+inset,Math.floor(i/2)*ch+inset,cw-inset*2,ch-inset*2,inset,inset,cw-inset*2,ch-inset*2);s.treeCells.push(c);}}
    g.globalAlpha=fade;g.drawImage(s.entry.images[1],0,0,w,h);
    driftingSky(g,s,'treeClouds',1,w,h,clock,fade,reduced,[[0,.13],[.04,.15],[.10,.22],[.12,.10],[.16,.24],[.20,.23],[.25,.39],[.32,.35],[.40,.43],[.47,.39],[.53,.40],[.59,.32],[.65,.43],[.70,.49],[.78,.42],[.86,.50],[.95,.36],[1,.34]],.017);
    // Full rooted trunk and canopy are present from the first frame; only foliage sways.
    g.globalAlpha=fade*open;g.drawImage(s.treeCells[0],x-size*cw/ch/2,ground-size,size*cw/ch,size);
    const anchors=[[-.43,-.88],[-.2,-1.00],[.05,-1.04],[.30,-.96],[.48,-.79],[-.4,-.64],[-.13,-.78],[.15,-.80],[.38,-.60]];s.canopyClusters=[];
    anchors.forEach(([ax,ay],i)=>{const grow=1,height=size*(.42+noise(i+14)*.14),angle=reduced?0:Math.sin(clock*(.6+noise(i)*.2)+i)*.025,dx=reduced?0:Math.sin(clock*.7+i)*size*.009,index=1+i%3;s.canopyClusters.push({angle,grow});
      g.save();g.translate(x+ax*size+dx,ground+ay*size*open);g.rotate(angle);g.globalAlpha=fade*grow;g.drawImage(s.treeCells[index],-height*cw/ch*.5,-height*.35,height*cw/ch,height);g.restore();
    });
  }
  function swayCanopy(g,s,img,w,h,t,fade,reduced){
    if(reduced)return;
    if(!s.canopy){const c=document.createElement('canvas');c.width=1536;c.height=512;const q=c.getContext('2d');q.drawImage(img,0,0,c.width,c.height);const p=q.getImageData(0,0,c.width,c.height);
      for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){const k=(y*c.width+x)*4,r=p.data[k],green=p.data[k+1],b=p.data[k+2];p.data[k+3]*=clamp((green-b-3)/20)*clamp((green-r+25)/35)*clamp((.68-y/c.height)/.12)}q.putImageData(p,0,0);s.canopy=c;
    }
    g.globalAlpha=fade*.9;const c=s.canopy;
    for(let j=0;j<48;j++){const u=j/48,bend=Math.sin(t*.7+u*5)*h*.006*(1-u);g.drawImage(c,u*c.width,0,c.width/48,c.height,u*w+bend,Math.sin(t*.8+u*7)*h*.002,w/48+.5,h)}
  }
  function petalDrift(g,t,w,h,fade,purple=false,fast=false){
    for(let i=0;i<36;i++){const p=(noise(i)+t*(fast?.12:.035))%1,x=(noise(i+8)*w+p*w*(fast?1.2:.2))%w,y=(noise(i+31)*h+p*h)%h,r=h*(.005+noise(i+5)*.008);g.save();g.translate(x,y);g.rotate(t*(.6+noise(i))+i);g.scale(.3+.7*Math.abs(Math.sin(t+i)),1);g.globalAlpha=fade*Math.sin(p*Math.PI)*.7;g.fillStyle=purple?'#dfc4f3':i%2?'#ffd7e3':'#f8a9c2';g.beginPath();g.ellipse(0,0,r*.6,r,0,0,Math.PI*2);g.fill();g.restore()}
  }
  function bamboo(g,s,t,w,h,fade,reduced){
    const img=s.entry.images[0],clock=reduced?12:t,sky=g.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#a7bd95');sky.addColorStop(.5,'#d7d9ad');sky.addColorStop(1,'#294b3e');g.globalAlpha=fade*(reduced?1:ease(t/2));g.fillStyle=sky;g.fillRect(0,0,w,h);
    const count=Math.max(5,Math.ceil(w/h*3)),cw=img.width/2,ch=img.height/2;s.stalks=[];
    for(let i=0;i<count;i++){const depth=.45+noise(i+13)*.55,height=h*(1.25+depth*.22),width=height*cw/ch,x=w*(i+.5)/count,open=1,bend=reduced?0:Math.sin(clock*(.30+depth*.08)+i*.7)*.012*depth;s.stalks.push({x,bend});g.save();g.translate(x,h*1.12);g.rotate(bend);g.globalAlpha=fade*(.65+depth*.35);
      // Continuous curvature anchored at the root; leaves at different heights lag the stalk.
      g.beginPath();g.rect(-width,-height*open,width*2,height*open+h);g.clip();
      for(let j=0;j<96;j++){const u=j/96,dx=reduced?0:(Math.sin(clock*.42+i+u*.7)*height*.004+Math.sin(clock*.8+i+u*5)*height*.0008)*(1-u)**2;g.drawImage(img,(i%2)*cw,(Math.floor(i/2)%2)*ch+u*ch,cw,ch/96,-width*.5+dx,-height+u*height,width,height/96+.5)}g.restore();
    }
  }
  function wind(g,s,t,w,h,fade,reduced){
    const img=s.entry.images[0],clock=reduced?7:t,open=reduced?1:ease(t/2.5),sky=g.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#527fc0');sky.addColorStop(1,'#f3c4cb');g.globalAlpha=fade*open;g.fillStyle=sky;g.fillRect(0,0,w,h);
    if(!s.windTerrain){const c=document.createElement('canvas');c.width=1024;c.height=Math.round(1024*h/w);const q=c.getContext('2d');q.drawImage(img,0,0,c.width,c.height);q.globalCompositeOperation='destination-in';const mask=q.createLinearGradient(0,0,0,c.height);mask.addColorStop(0,'transparent');mask.addColorStop(.65,'transparent');mask.addColorStop(.95,'#000');q.fillStyle=mask;q.fillRect(0,0,c.width,c.height);s.windTerrain=c;}
    const clouds=s.entry.images[2];if(!s.windClouds){s.windClouds=[];for(let i=0;i<4;i++){const c=document.createElement('canvas');c.width=512;c.height=512*clouds.height/clouds.width;const q=c.getContext('2d');q.drawImage(clouds,(i%2)*clouds.width/2,Math.floor(i/2)*clouds.height/2,clouds.width/2,clouds.height/2,0,0,c.width,c.height);q.globalCompositeOperation='destination-in';for(const horizontal of [true,false]){const mask=q.createLinearGradient(0,0,horizontal?c.width:0,horizontal?0:c.height);mask.addColorStop(0,'transparent');mask.addColorStop(.18,'#000');mask.addColorStop(.82,'#000');mask.addColorStop(1,'transparent');q.fillStyle=mask;q.fillRect(0,0,c.width,c.height)}s.windClouds.push(c)}}
    for(let i=0;i<9;i++){const depth=.35+noise(i+63)*.65,width=Math.min(w,h*3)*(.38+depth*.35),p=(noise(i+82)+clock*(.009+depth*.012))%1,x=p*(w+width*2)-width,y=h*(.1+noise(i+22)*.57);g.globalAlpha=fade*open*(.35+depth*.5);g.drawImage(s.windClouds[i%4],x,y,width,width*clouds.height/clouds.width*(1+.04*Math.sin(clock*.3+i)))}
    g.globalAlpha=fade*open;g.drawImage(s.windTerrain,0,0,w,h);
    const atlas=s.entry.images[1],cw=atlas.width/2,ch=atlas.height/2;
    for(let i=0;i<6;i++){const p=(clock*(.042+noise(i+2)*.028)+noise(i+40))%1,x=-w*.36+p*w*1.72,y=h*(.10+noise(i+4)*.65)+Math.sin(clock*.5+i)*h*.045,width=w*(.40+noise(i)*.18),height=width*ch/cw;
      g.save();g.translate(x,y);g.rotate(Math.sin(clock*.33+i)*.06);g.globalAlpha=fade*open*(reduced?1:Math.min(1,Math.sin(p*Math.PI)*1.35));
      // Each ribbon travels and flexes independently, with its own transparent silhouette.
      for(let j=0;j<24;j++){const u=j/24,bend=Math.sin(u*6-clock*1.4+i)*h*.013*Math.sin(u*Math.PI);g.drawImage(atlas,(i%2)*cw+u*cw,(Math.floor(i/2)%2)*ch,cw/24,ch,(u-.5)*width,-height/2+bend,width/24+.5,height)}g.restore();
    }if(!reduced)petalDrift(g,clock,w,h,fade*open,false,true);
  }
  function ice(g,s,t,w,h,fade,reduced){
    const img=s.entry.images[0],clock=reduced?12:t,atlas=s.entry.images[1];g.globalAlpha=fade*(reduced?1:ease(t/2));g.drawImage(img,0,0,w,h);
    s.crystals=[];for(let i=0;i<3;i++){const x=w*(.16+i*.34),base=h*(.82+noise(i+21)*.12),open=reduced?1:ease((t-.8-i*1.1)/3),size=Math.min(w*.28,h*(.24+noise(i+4)*.12));s.crystals.push({x,base,open});
      g.save();g.translate(x,base);g.globalAlpha=fade*open;
      g.drawImage(atlas,(i%2)*atlas.width/2,(Math.floor(i/2)%2)*atlas.height/2,atlas.width/2,atlas.height/2,-size*.5,-size*(.4+.6*open),size,size*(.4+.6*open));g.restore();
    }
    for(let i=0;i<26;i++){const x=noise(i+42)*w,y=h*(.45+noise(i+11)*.55),pulse=reduced?.45:Math.pow(.5+.5*Math.sin(clock*.9+i*2.4),5),r=h*(.007+noise(i)*.009)*pulse;g.globalAlpha=fade*ease(clock/6)*pulse*.8;g.strokeStyle='#f2fbff';g.lineWidth=1;g.beginPath();g.moveTo(x-r,y);g.lineTo(x+r,y);g.moveTo(x,y-r*1.5);g.lineTo(x,y+r*1.5);g.stroke()}
  }
  function sand(g,s,t,w,h,fade,reduced){
    const img=s.entry.images[0],clock=reduced?5:t,open=1;
    if(!s.sandSurface||s.sandSurface.width!==Math.ceil(w)||s.sandSurface.height!==Math.ceil(h)){s.sandSurface=document.createElement('canvas');s.sandSurface.width=Math.ceil(w);s.sandSurface.height=Math.ceil(h);}
    const q=s.sandSurface.getContext('2d');q.clearRect(0,0,w,h);q.drawImage(img,0,0,w,h);
    if(!s.sandClouds){
      const original=(s.originalEntry||s.entry).images[0],c=document.createElement('canvas');c.width=original.width;c.height=original.height;const sky=c.getContext('2d');sky.drawImage(original,0,0);const pixels=sky.getImageData(0,0,c.width,c.height);
      // Feather above the dune skyline so only the painted sky travels.
      const ridge=[[0,.45],[.2,.47],[.4,.48],[.5,.43],[.6,.395],[.694,.31],[.78,.355],[.89,.34],[1,.40]];
      for(let x=0;x<c.width;x++){const nx=x/c.width;let k=0;while(k<ridge.length-2&&nx>ridge[k+1][0])k++;const a=ridge[k],b=ridge[k+1],edge=a[1]+(b[1]-a[1])*(nx-a[0])/(b[0]-a[0]),side=ease(nx/.025)*ease((1-nx)/.025);for(let y=0;y<c.height;y++)pixels.data[(y*c.width+x)*4+3]*=ease((edge-y/c.height)/.065)*side;}
      sky.putImageData(pixels,0,0);s.sandClouds=c;
    }
    const skyScale=Math.max(w/s.sandClouds.width,h/s.sandClouds.height),skyW=s.sandClouds.width*skyScale,skyH=s.sandClouds.height*skyScale;
    const cloudDrift=reduced?0:Math.sin(clock*.055)*skyW*.018;
    q.drawImage(s.sandClouds,(w-skyW)/2+cloudDrift,(h-skyH)/2,skyW,skyH);
    // Build one opaque painting first; applying fade per overlapping strip made horizontal bars.
    if(!reduced)for(let y=Math.floor(h*.6);y<h;y+=5){const v=y/h,envelope=ease((v-.6)/.18),dx=Math.sin(v*32-clock*.35)*w*.002*(v-.6)*envelope;q.drawImage(img,0,v*img.height,img.width,Math.min(img.height-v*img.height,6/h*img.height),dx,y,w,6)}
    g.globalAlpha=fade;g.drawImage(s.sandSurface,0,0,w,h);
    if(reduced)return;
    for(let i=0;i<230;i++){const p=(noise(i)+clock*(.045+noise(i+41)*.04))%1,x=p*w,y=h*(.52+noise(i+15)*.48)+Math.sin(p*9+i)*h*.022;g.globalAlpha=fade*open*Math.sin(p*Math.PI)*(.25+noise(i)*.3);g.strokeStyle='#fff0ce';g.lineWidth=.5+noise(i)*.6;g.beginPath();g.moveTo(x,y);g.lineTo(x+h*.006,y-h*.002);g.stroke()}
  }
  function wisteria(g,s,t,w,h,fade,reduced){
    const img=s.entry.images[0],clock=reduced?10:t,open=reduced?1:ease(t/3),atlas=s.entry.images[1];g.globalAlpha=fade*open;g.drawImage(img,0,0,w,h);
    const count=Math.max(10,Math.ceil(w/h*7));s.racemes=[];for(let i=0;i<count;i++){const x=w*(i+.5)/count,anchor=h*(.015+noise(i+13)*.14),length=h*(.35+noise(i+41)*.34),grow=1,angle=reduced?0:Math.sin(clock*(.38+noise(i)*.12)+i*.73)*.045+Math.sin(clock*.19+i)*.02;s.racemes.push({x,angle});
      g.save();g.translate(x,anchor);g.rotate(angle);g.globalAlpha=fade*grow;const cw=atlas.width/2,ch=atlas.height/2,width=length*cw/ch;g.drawImage(atlas,(i%2)*cw,(Math.floor(i/2)%2)*ch,cw,ch,-width*.5,0,width,length*grow);g.restore();
    }
  }
  function lotus(g,s,t,w,h,fade,reduced){
    const img=s.entry.images[0],clock=reduced?10:t,open=reduced?1:ease(t/3),atlas=s.entry.images[1];surface(g,img,w,h,clock*.6,fade*open,0);
    const cols=w/h>1.6?4:2,rows=3;s.lotusFloats=[];for(let i=0;i<cols*rows;i++){const row=Math.floor(i/cols),depth=.27+row*.27,size=Math.min(w/cols*.76,h*.26)*(.93+noise(i+21)*.12),stagger=row%2?.14:-.08,x=w*((i%cols+.5+stagger)/cols)+Math.sin(clock*.14+i)*size*.06,y=h*depth+(noise(i+31)-.5)*h*.025+Math.sin(clock*.7+i*1.7)*h*.006;s.lotusFloats.push({x,y,size});
      g.save();g.translate(x,y);g.rotate(Math.sin(clock*.24+i)*.045);g.globalAlpha=fade*open;g.drawImage(atlas,(i%2)*atlas.width/2,(Math.floor(i/2)%2)*atlas.height/2,atlas.width/2,atlas.height/2,-size*.5,-size*.7,size,size*atlas.height/atlas.width);g.restore();
      const p=(clock*.11+noise(i))%1;g.globalAlpha=fade*open*Math.sin(p*Math.PI)*.23;g.strokeStyle='#e8f1ee';g.lineWidth=.8;g.beginPath();g.ellipse(x,y+size*.02,size*(.3+p*.25),size*(.045+p*.035),0,0,Math.PI*2);g.stroke();
    }
  }
  const scenes={bloom,sakura:bloom,moon,lightning,waterfall,water,fire,tree,bamboo,wind,ice,sand,wisteria,lotus};window.TenzerDream={dropSample,strikeSample,draw(g,s,fade,w,h,reduced){const f=scenes[s.entry.behavior];if(!f)return false;f(g,s,s.life,w,h,fade,reduced);return true}};
})();
