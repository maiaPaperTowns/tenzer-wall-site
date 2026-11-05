/* Five-photo wall test. Motion is composited over the complete source photographs. */
(() => {
  const legacyDraw = window.drawStockScene;

  const TAU = Math.PI * 2;
  const noise = n => { const v=Math.sin(n*127.1+311.7)*43758.5453; return v-Math.floor(v); };
  const fluidCache=new WeakMap();
  function fluidFrame(image,t,kind) {
    let state=fluidCache.get(image);
    if(!state) {
      const canvas=document.createElement('canvas');
      canvas.width=Math.min(1280,image.naturalWidth);canvas.height=Math.round(canvas.width*image.naturalHeight/image.naturalWidth);
      const gl=canvas.getContext('webgl',{alpha:false,preserveDrawingBuffer:true});
      if(!gl)return null;
      const shader=(type,source)=>{const sh=gl.createShader(type);gl.shaderSource(sh,source);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(sh));return sh;};
      const program=gl.createProgram();
      gl.attachShader(program,shader(gl.VERTEX_SHADER,'attribute vec2 p; varying vec2 uv; void main(){uv=vec2((p.x+1.)*.5,(1.-p.y)*.5);gl_Position=vec4(p,0.,1.);}'));
      gl.attachShader(program,shader(gl.FRAGMENT_SHADER,`precision mediump float;
        varying vec2 uv;uniform sampler2D photo;uniform float time;uniform float mode;
        void main(){
          vec2 q=uv;vec3 base=texture2D(photo,q).rgb;
          // Keep the stock credit region intact while preview assets are in use.
          float credit=step(.59,q.x)*step(.55,q.y)*step(q.y,.78);
          if(mode<1.5){
            vec2 d=vec2(0.);
            for(int i=0;i<5;i++){
              float n=float(i);float age=mod(time+n*.83,3.8)-.65;
              vec2 center=vec2(.31+mod(n*.137,.38),.46+mod(n*.173,.28));
              vec2 v=(q-center)*vec2(1.,2.7);float r=length(v);
              float ring=r-age*.16;
              float envelope=exp(-ring*ring*500.)*exp(-max(age,0.)*.8)*step(0.,age);
              d+=normalize(v+vec2(.0001))*sin(r*110.-age*18.)*envelope*.008;
            }
            d+=vec2(sin(q.y*65.+time*1.3),cos(q.x*54.-time))* .0008;
            q+=d*(1.-credit);
          }else if(mode<2.5){
            float light=smoothstep(.32,.72,dot(base,vec3(.299,.587,.114)));
            float region=smoothstep(.04,.18,q.y)*(1.-smoothstep(.74,.89,q.y));
            float flow=(sin(q.y*85.-time*13.+sin(q.x*27.))* .006+sin(q.y*173.-time*23.)*.002);
            q.y+=flow*light*region*(1.-credit);
            q.x+=sin(q.y*47.-time*8.)*.0018*light*region*(1.-credit);
          }else if(mode>3.5){
            float flame=smoothstep(.12,.38,base.r-base.b)*smoothstep(.25,.65,base.r);
            q.x+=sin(q.y*31.-time*5.)*.006*flame*(1.-credit);
            q.y+=sin(q.y*53.-time*8.)*.008*flame*(1.-credit);
          }else{
            // Horizontal wind advection, with subtle different speeds by height.
            float wind=sin(time*.12)*.026+sin(time*.21+q.y*5.)*.005;
            q.x+=wind*(1.-credit);q.y+=sin(q.x*8.+time*.2)*.0015*(1.-credit);
          }
          gl_FragColor=vec4(texture2D(photo,clamp(q,.001,.999)).rgb,1.);
        }`));
      gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Photo animation shader failed to link');gl.useProgram(program);
      const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
      const pos=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
      gl.bindTexture(gl.TEXTURE_2D,gl.createTexture());gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
      state={canvas,gl,program,time:gl.getUniformLocation(program,'time'),mode:gl.getUniformLocation(program,'mode')};fluidCache.set(image,state);
    }
    const {gl,canvas}=state;gl.viewport(0,0,canvas.width,canvas.height);gl.uniform1f(state.time,t);gl.uniform1f(state.mode,kind==='water'?1:kind==='waterfall'?2:kind==='fire'?4:3);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);return canvas;
  }
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
    let surface=image;
    if(!reduced && ['water','waterfall','cloud','fire'].includes(scene.entry.id)) {
      try {surface=fluidFrame(image,t,scene.entry.id)||image;} catch(error) {if(!scene.fluidWarning){console.warn(error);scene.fluidWarning=true;}}
    }
    ctx.drawImage(surface,0,0,pw,ph);
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
        // Cloud movement is rendered directly from the original photograph above.
      } else if(motion==='fire') {
        for(let i=0;i<36;i++) {
          const age=(noise(i+40)+t*.12) % 1,px=(noise(i+74)+Math.sin(t+i)*.008)*pw,py=ph*(1-age);
          ctx.globalAlpha=fade*(1-age)*.28;ctx.fillStyle=i%2?'#ffb84c':'#ffe4aa';
          ctx.beginPath();ctx.arc(px,py,Math.max(.65,ph*.0022),0,TAU);ctx.fill();
        }
      } else if(motion==='water') {
        // A drop accelerates toward the surface, then generates expanding rings.
        for(let i=0;i<5;i++) {
          const cycle=3.8,age=(t+i*.83)%cycle;
          const cx=pw*(.31+(i*.137)%.38),cy=ph*(.46+(i*.173)%.28);
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
