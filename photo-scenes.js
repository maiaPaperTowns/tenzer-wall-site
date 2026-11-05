/* Five-photo wall test. Motion is composited over the complete source photographs. */
(() => {
  const legacyDraw = window.drawStockScene;

  const TAU = Math.PI * 2;
  const noise = n => { const v=Math.sin(n*127.1+311.7)*43758.5453; return v-Math.floor(v); };
  function drawPhoto(ctx,scene,fade,w,h,reduced) {
    const backdrop=scene.entry.images[0];
    const image=scene.entry.images[1] || backdrop;
    if(!image?.naturalWidth) return;
    const t=reduced?0:scene.life;
    // Fill the viewport proportionally in both browser and projection modes.
    const scale=Math.max(w/image.naturalWidth,h/image.naturalHeight);
    const pw=image.naturalWidth*scale,ph=image.naturalHeight*scale,x=(w-pw)/2,y=(h-ph)/2;
    ctx.save();ctx.globalAlpha=fade;
    ctx.fillStyle='#eee8da';ctx.fillRect(0,0,w,h);
    ctx.translate(x,y);
    ctx.beginPath();ctx.rect(0,0,pw,ph);ctx.clip();
    ctx.drawImage(image,0,0,pw,ph);
    if(!reduced) {
      const motion=scene.entry.id;
      if(motion==='snow') {
        for(let i=0;i<110;i++) {
          const depth=.35+noise(i+91)*.65;
          const px=((noise(i)*pw+t*ph*.035*depth+Math.sin(t*.5+i)*ph*.025)%(pw+16)+pw+16)%(pw+16)-8;
          const py=(noise(i+11)*ph+t*ph*(.035+.065*depth))%(ph+16)-8;
          ctx.globalAlpha=fade*(.2+depth*.4);ctx.fillStyle='#fff';ctx.beginPath();
          ctx.arc(px,py,Math.max(.8,ph*.004*depth),0,TAU);ctx.fill();
        }
      } else if(motion==='cloud') {
        // Independent translucent cloud banks travel across a stable sky.
        for(let i=0;i<7;i++) {
          const speed=.012+noise(i+12)*.014;
          const cx=((noise(i+1)+t*speed)%1.6-.3)*pw;
          const cy=ph*(.12+noise(i+20)*.65),r=pw*(.08+noise(i+8)*.08);
          ctx.save();ctx.translate(cx,cy);ctx.scale(1,.42);
          const mist=ctx.createRadialGradient(0,0,0,0,0,r);
          mist.addColorStop(0,'rgba(255,255,255,.32)');
          mist.addColorStop(.55,'rgba(255,255,255,.16)');
          mist.addColorStop(1,'rgba(255,255,255,0)');
          ctx.fillStyle=mist;ctx.fillRect(-r,-r,2*r,2*r);ctx.restore();
        }
      } else if(motion==='fire') {
        for(let row=0;row<ph;row+=4) {
          const shift=Math.sin(row*.06-t*4.2)*ph*.006+Math.sin(row*.13+t*2.9)*ph*.0007;
          const sy=Math.max(0,Math.min(image.naturalHeight-5,(row/ph)*image.naturalHeight+Math.sin(t*5+row*.03)*2));
          ctx.drawImage(image,0,sy,image.naturalWidth,Math.min(image.naturalHeight-sy,6/scale),shift,row,pw,6);
        }
        for(let i=0;i<36;i++) {
          const age=(noise(i+40)+t*.12) % 1,px=(noise(i+74)+Math.sin(t+i)*.008)*pw,py=ph*(1-age);
          ctx.globalAlpha=fade*(1-age)*.28;ctx.fillStyle=i%2?'#ffb84c':'#ffe4aa';
          ctx.beginPath();ctx.arc(px,py,Math.max(.65,ph*.0022),0,TAU);ctx.fill();
        }
      } else if(motion==='water') {
        // A drop accelerates toward the surface, then generates expanding rings.
        for(let i=0;i<5;i++) {
          const cycle=3.8,age=(t+i*.83)%cycle;
          const cx=pw*(.28+noise(i+30)*.44),cy=ph*(.42+noise(i+90)*.35);
          if(age<.65) {
            const u=age/.65,dy=cy-ph*.38*(1-u*u);
            ctx.globalAlpha=fade*.8;ctx.fillStyle='#e9ffff';
            ctx.beginPath();ctx.ellipse(cx,dy,ph*.0025,ph*(.005+.009*u),0,0,TAU);ctx.fill();
          } else {
            const u=(age-.65)/(cycle-.65);
            for(let ring=0;ring<3;ring++) {
              const phase=u-ring*.075;if(phase<=0)continue;
              const r=ph*(.006+phase*.29);
              ctx.globalAlpha=fade*Math.pow(1-u,2)*(.55-ring*.1);
              ctx.strokeStyle=ring%2?'#397c91':'#edffff';ctx.lineWidth=Math.max(1,ph*.002*(1-u));
              ctx.beginPath();ctx.ellipse(cx,cy,r*1.8,r*.6,0,0,TAU);ctx.stroke();
            }
            if(u<.12) {
              ctx.globalAlpha=fade*(1-u/.12)*.65;ctx.strokeStyle='#efffff';
              for(let j=0;j<7;j++) {
                const angle=j/7*TAU,dist=ph*u*.25;
                const sx=cx+Math.cos(angle)*dist,sy=cy-Math.sin(j+1)*ph*u*.25;
                ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx,sy-ph*.009);ctx.stroke();
              }
            }
          }
        }
      } else if(motion==='waterfall') {
        // Water follows the visible cascade channels; rock positions stay fixed.
        const streams=[[.09,.18,.08,.76],[.27,.11,.12,.72],[.44,.17,.12,.78],[.65,.15,.23,.74],[.79,.12,.36,.72]];
        for(let i=0;i<100;i++) {
          const [left,width,top,bottom]=streams[i%streams.length];
          const age=(noise(i+54)+t*(.48+noise(i+3)*.45))%1;
          const px=pw*(left+noise(i+70)*width),py=ph*(top+(bottom-top)*age);
          const len=ph*(.015+noise(i+19)*.07);
          ctx.globalAlpha=fade*.28*Math.sin(age*Math.PI);
          const streak=ctx.createLinearGradient(px,py-len,px,py);
          streak.addColorStop(0,'rgba(235,251,255,0)');streak.addColorStop(1,'rgba(235,251,255,.85)');
          ctx.strokeStyle=streak;ctx.lineWidth=Math.max(1,pw*.0012);
          ctx.beginPath();ctx.moveTo(px,py-len);ctx.quadraticCurveTo(px+Math.sin(t*3+i)*pw*.002,py-len*.4,px,py);ctx.stroke();
        }
        for(let i=0;i<32;i++) {
          const a=(noise(i)+t*.24)%1,cx=pw*(.18+noise(i+5)*.7)+Math.sin(t+i)*ph*.015,cy=ph*(.79-a*.12),r=ph*(.015+a*.05);
          const mist=ctx.createRadialGradient(cx,cy,0,cx,cy,r);
          mist.addColorStop(0,`rgba(239,251,255,${(1-a)*.12})`);mist.addColorStop(1,'rgba(239,251,255,0)');
          ctx.globalAlpha=fade;ctx.fillStyle=mist;ctx.fillRect(cx-r,cy-r,r*2,r*2);
        }
      }
    }
    ctx.restore();
  }
  window.drawStockScene=(ctx,scene,fade,w,h,reduced)=>scene.entry.options?.photoPrototype ? drawPhoto(ctx,scene,fade,w,h,reduced) : legacyDraw(ctx,scene,fade,w,h,reduced);
  window.TenzerPhotoScenes={draw:drawPhoto};
})();
