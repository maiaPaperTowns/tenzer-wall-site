/* Five-photo wall test. Motion is composited over the complete source photographs. */
(() => {
  const legacyDraw = window.drawStockScene;
  const wallDisplay = new URLSearchParams(location.search).get('display') === 'wall';
  const TAU = Math.PI * 2;
  const noise = n => { const v=Math.sin(n*127.1+311.7)*43758.5453; return v-Math.floor(v); };
  function drawPhoto(ctx,scene,fade,w,h,reduced) {
    const backdrop=scene.entry.images[0];
    const image=scene.entry.images[1] || backdrop;
    if(!image?.naturalWidth) return;
    const t=reduced?0:scene.life;
    // Web: preserve the complete photo. Wall: crop to fill the projection.
    const scale=(wallDisplay ? Math.max : Math.min)(w/image.naturalWidth,h/image.naturalHeight);
    const pw=image.naturalWidth*scale,ph=image.naturalHeight*scale,x=(w-pw)/2,y=(h-ph)/2;
    ctx.save();ctx.globalAlpha=fade;
    ctx.fillStyle='#eee8da';ctx.fillRect(0,0,w,h);
    ctx.translate(x,y);
    ctx.beginPath();ctx.rect(0,0,pw,ph);ctx.clip();
    ctx.drawImage(image,0,0,pw,ph);
    if(!reduced) {
      const motion=scene.entry.id;
      if(motion==='snow') {
        for(let i=0;i<65;i++) {
          const depth=.35+noise(i+91)*.65;
          const px=((noise(i)*pw+t*ph*.035*depth+Math.sin(t*.5+i)*ph*.025)%(pw+16)+pw+16)%(pw+16)-8;
          const py=(noise(i+11)*ph+t*ph*(.035+.065*depth))%(ph+16)-8;
          ctx.globalAlpha=fade*(.2+depth*.4);ctx.fillStyle='#fff';ctx.beginPath();
          ctx.arc(px,py,Math.max(.8,ph*.004*depth),0,TAU);ctx.fill();
        }
      } else if(motion==='cloud') {
        // A soft illumination change keeps the photograph stable and intact.
        const haze=ctx.createLinearGradient(0,0,pw,ph);
        haze.addColorStop(0,'rgba(255,255,255,0)');
        haze.addColorStop(.5,`rgba(255,255,255,${.012+.008*Math.sin(t*.12)})`);
        haze.addColorStop(1,'rgba(255,255,255,0)');
        ctx.fillStyle=haze;ctx.fillRect(0,0,pw,ph);
      } else if(motion==='fire') {
        for(let row=0;row<ph;row+=4) {
          const shift=Math.sin(row*.06-t*4.2)*ph*.0015+Math.sin(row*.13+t*2.9)*ph*.0007;
          const sy=Math.max(0,Math.min(image.naturalHeight-5,(row/ph)*image.naturalHeight+Math.sin(t*5+row*.03)*2));
          ctx.drawImage(image,0,sy,image.naturalWidth,Math.min(image.naturalHeight-sy,6/scale),shift,row,pw,6);
        }
        for(let i=0;i<14;i++) {
          const age=(noise(i+40)+t*.12) % 1,px=(noise(i+74)+Math.sin(t+i)*.008)*pw,py=ph*(1-age);
          ctx.globalAlpha=fade*(1-age)*.28;ctx.fillStyle=i%2?'#ffb84c':'#ffe4aa';
          ctx.beginPath();ctx.arc(px,py,Math.max(.65,ph*.0022),0,TAU);ctx.fill();
        }
      } else if(motion==='water') {
        for(let i=0;i<4;i++) {
          const phase=(t*.09+noise(i))%1,cx=pw*(.08+noise(i+30)*.84),cy=ph*(.12+noise(i+90)*.76),r=ph*(.025+phase*.3);
          ctx.globalAlpha=fade*(1-phase)*.09;ctx.strokeStyle='#f0ffff';ctx.lineWidth=Math.max(.8,ph*.002);
          ctx.beginPath();ctx.ellipse(cx,cy,r*1.8,r*.65,0,0,TAU);ctx.stroke();
          ctx.save();ctx.beginPath();ctx.ellipse(cx,cy,r*1.75,r*.6,0,0,TAU);ctx.clip();
          ctx.globalAlpha=fade*(1-phase)*.04;ctx.drawImage(image,Math.sin(t*2+i)*ph*.004,Math.cos(t*2+i)*ph*.003,pw,ph);ctx.restore();
        }
      } else if(motion==='waterfall') {
        // Sample adjacent rows within the cascades. Rocks retain their position.
        const streams=[[.04,.12],[.15,.18],[.37,.14],[.57,.12],[.76,.16]];
        for(const [sx,sw] of streams) {
          ctx.save();ctx.beginPath();ctx.rect(pw*sx,ph*.04,pw*sw,ph*.79);ctx.clip();
          for(let row=0;row<ph*.84;row+=5) {
            const sy=Math.max(0,Math.min(image.naturalHeight-8,row/ph*image.naturalHeight+Math.sin(row*.05-t*2.2)*.7));
            ctx.globalAlpha=fade*.12;ctx.drawImage(image,image.naturalWidth*sx,sy,image.naturalWidth*sw,Math.min(8/scale,image.naturalHeight-sy),pw*sx,row,pw*sw,8);
          }
          ctx.restore();
        }
        for(let i=0;i<12;i++) {
          const a=(noise(i)+t*.18)%1;
          ctx.globalAlpha=fade*(1-a)*.025;ctx.fillStyle='#eefaff';ctx.beginPath();
          ctx.ellipse(pw*noise(i+5)+Math.sin(t+i)*ph*.025,ph*(.89-a*.14),ph*(.035+a*.07),ph*(.01+a*.025),0,0,TAU);ctx.fill();
        }
      }
    }
    ctx.restore();
  }
  window.drawStockScene=(ctx,scene,fade,w,h,reduced)=>scene.entry.options?.photoPrototype ? drawPhoto(ctx,scene,fade,w,h,reduced) : legacyDraw(ctx,scene,fade,w,h,reduced);
  window.TenzerPhotoScenes={draw:drawPhoto};
})();
