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
  function cat(g,s,t,w,h,fade,reduced){const size=Math.min(w*.32,h*.43),clock=reduced?8:t,x=reduced?w*.5:-size+(clock/(s.entry.options.crossSeconds||20))*(w+size*2);if(s.entry.images[1]){g.globalAlpha=fade*(reduced?1:ease(t/2));g.drawImage(s.entry.images[1],0,0,w,h)}animal(g,s.entry.images[0],'cat',x,h*.68,size,clock,0,fade*(reduced?1:ease(t/.6)),reduced)}
  function horsePose(t,w,size,x){const walk=clamp((t-2.5)/4),run=ease((t-6.5)/13.5),direction=x>w*.5?-1:1;return {x:x+direction*(walk*w*.08+run*(direction>0?w-x+size:x+size)),direction,gallop:ease((t-5)/3)}}
  function horse(g,s,t,w,h,fade,reduced){
    if(s.entry.images[1]){g.globalAlpha=fade*(reduced?1:ease(t/2.8));g.drawImage(s.entry.images[1],0,0,w,h)}
    const size=Math.min(w*.43,h*.57),origin=s.x??w/2,pose=reduced?{x:w*.5,direction:1,gallop:0}:horsePose(t,w,size,origin);
    if(!reduced&&t<4.2)glyph(g,s,t,w,h,fade);
    const emerge=reduced?1:ease((t-1.2)/2.2),ground=reduced?h*.84:(s.y??h*.5)*(1-ease((t-2)/3))+h*.84*ease((t-2)/3);
    g.save();if(t<3&&!reduced)g.filter='brightness(0)';animal(g,s.entry.images[0],'horse',pose.x,ground,size,Math.max(0,t-2.5),pose.gallop,fade*emerge,reduced,pose.direction);g.restore();
    if(!reduced)for(let i=0;i<18;i++){const p=(t*.6+noise(i))%1;g.globalAlpha=fade*pose.gallop*(1-p)*.085;g.fillStyle='#ad9873';g.beginPath();g.ellipse(pose.x-pose.direction*(size*.3+p*size),ground-p*size*.12,size*(.015+p*.07),size*(.008+p*.025),0,0,Math.PI*2);g.fill()}
  }
  function forest(g,s,t,w,h,fade,reduced){
    const img=s.entry.images[0],p=reduced?1:ease(t/8),scale=Math.max(w/img.width,h/img.height),iw=img.width*scale,ih=img.height*scale;
    // Edge strips grow inward and upward, surrounding the opening instead of spawning one tree.
    for(let i=0;i<64;i++){const x=i*w/64,edge=Math.abs(i/63-.5)*2,open=reduced?1:ease((t-(1-edge)*4)/4),height=h*open;if(!height)continue;
      g.globalAlpha=fade*open;g.drawImage(img,(x-(w-iw)/2)/scale,((h-height)-(h-ih)/2)/scale,w/64/scale,height/scale,x,h-height,w/64+1,height);
    }
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
