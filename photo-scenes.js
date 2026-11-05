/* Five-photo wall test. Motion is composited over the same 32:9 review crops. */
(() => {
  const legacyDraw = window.drawStockScene;
  const TAU = Math.PI * 2;
  const noise = n => { const v=Math.sin(n*127.1+311.7)*43758.5453; return v-Math.floor(v); };
  function drawPhoto(ctx,scene,fade,w,h,reduced) {
    const image=scene.entry.images[0];
    if(!image?.naturalWidth) return;
    const t=reduced?0:scene.life;
    // Preserve the review framing on narrower screens; the 32:9 wall fills exactly.
    const scale=Math.min(w/image.naturalWidth,h/image.naturalHeight);
    const pw=image.naturalWidth*scale,ph=image.naturalHeight*scale,x=(w-pw)/2,y=(h-ph)/2;
    ctx.save();ctx.globalAlpha=fade;ctx.translate(x,y);
    ctx.beginPath();ctx.rect(0,0,pw,ph);ctx.clip();
    ctx.drawImage(image,0,0,pw,ph);
    if(!reduced) {
      const motion=scene.entry.id;
      if(motion==='snow') {
        for(let i=0;i<105;i++) {
          const depth=.35+noise(i+91)*.65;
          const px=((noise(i)*pw+t*ph*.035*depth+Math.sin(t*.5+i)*ph*.025)%(pw+16)+pw+16)%(pw+16)-8;
          const py=(noise(i+11)*ph+t*ph*(.09+.12*depth))%(ph+16)-8;
          ctx.globalAlpha=fade*(.35+depth*.55);ctx.fillStyle='#fff';ctx.beginPath();
          ctx.arc(px,py,Math.max(.8,ph*.004*depth),0,TAU);ctx.fill();
        }
      } else if(motion==='cloud') {
        const z=1.035,dx=Math.sin(t*.075)*pw*.012,dy=Math.sin(t*.06)*ph*.012;
        ctx.drawImage(image,-pw*(z-1)/2+dx,-ph*(z-1)/2+dy,pw*z,ph*z);
        const haze=ctx.createLinearGradient(0,0,pw,ph);
        haze.addColorStop(0,'rgba(255,255,255,0)');haze.addColorStop(.5,`rgba(255,255,255,${.025+.02*Math.sin(t*.3)})`);haze.addColorStop(1,'rgba(255,255,255,0)');
        ctx.fillStyle=haze;ctx.fillRect(0,0,pw,ph);
      } else if(motion==='fire') {
        for(let row=0;row<ph;row+=4) {
          const shift=Math.sin(row*.06-t*4.2)*ph*.007+Math.sin(row*.13+t*2.9)*ph*.003;
          const sy=Math.max(0,Math.min(image.naturalHeight-5,(row/ph)*image.naturalHeight+Math.sin(t*5+row*.03)*2));
          ctx.drawImage(image,0,sy,image.naturalWidth,Math.min(image.naturalHeight-sy,6/scale),shift,row,pw,6);
        }
        for(let i=0;i<35;i++) {
          const age=(noise(i+40)+t*.12) % 1,px=(noise(i+74)+Math.sin(t+i)*.008)*pw,py=ph*(1-age);
          ctx.globalAlpha=fade*(1-age)*.65;ctx.fillStyle=i%2?'#ffb84c':'#ffe4aa';
          ctx.beginPath();ctx.arc(px,py,Math.max(.65,ph*.0022),0,TAU);ctx.fill();
        }
      } else if(motion==='water') {
        for(let i=0;i<8;i++) {
          const phase=(t*.25+noise(i))%1,cx=pw*(.08+noise(i+30)*.84),cy=ph*(.12+noise(i+90)*.76),r=ph*(.025+phase*.3);
          ctx.globalAlpha=fade*(1-phase)*.24;ctx.strokeStyle='#f0ffff';ctx.lineWidth=Math.max(.8,ph*.002);
          ctx.beginPath();ctx.ellipse(cx,cy,r*1.8,r*.65,0,0,TAU);ctx.stroke();
          ctx.save();ctx.beginPath();ctx.ellipse(cx,cy,r*1.75,r*.6,0,0,TAU);ctx.clip();
          ctx.globalAlpha=fade*(1-phase)*.18;ctx.drawImage(image,Math.sin(t*2+i)*ph*.004,Math.cos(t*2+i)*ph*.003,pw,ph);ctx.restore();
        }
      } else if(motion==='waterfall') {
        // Sample adjacent rows within the cascades. Rocks retain their position.
        const streams=[[.04,.12],[.15,.18],[.37,.14],[.57,.12],[.76,.16]];
        for(const [sx,sw] of streams) {
          ctx.save();ctx.beginPath();ctx.rect(pw*sx,ph*.04,pw*sw,ph*.79);ctx.clip();
          for(let row=0;row<ph*.84;row+=5) {
            const sy=Math.max(0,Math.min(image.naturalHeight-8,row/ph*image.naturalHeight+Math.sin(row*.05-t*5)*4));
            ctx.globalAlpha=fade*.23;ctx.drawImage(image,image.naturalWidth*sx,sy,image.naturalWidth*sw,Math.min(8/scale,image.naturalHeight-sy),pw*sx,row,pw*sw,8);
          }
          ctx.restore();
        }
        for(let i=0;i<30;i++) {
          const a=(noise(i)+t*.18)%1;
          ctx.globalAlpha=fade*(1-a)*.1;ctx.fillStyle='#eefaff';ctx.beginPath();
          ctx.ellipse(pw*noise(i+5)+Math.sin(t+i)*ph*.025,ph*(.89-a*.14),ph*(.035+a*.07),ph*(.01+a*.025),0,0,TAU);ctx.fill();
        }
      }
    }
    ctx.restore();
  }
  window.drawStockScene=(ctx,scene,fade,w,h,reduced)=>scene.entry.options?.photoPrototype ? drawPhoto(ctx,scene,fade,w,h,reduced) : legacyDraw(ctx,scene,fade,w,h,reduced);
  window.TenzerPhotoScenes={draw:drawPhoto};
})();
