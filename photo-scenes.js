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
        float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
        float field(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
        float turbulence(vec2 p){return field(p)*.57+field(p*2.03)*.28+field(p*4.07)*.15;}
        void main(){
          vec2 q=uv;vec3 base=texture2D(photo,q).rgb;
          // Keep the stock credit region intact while preview assets are in use.
          float credit=step(.59,q.x)*step(.55,q.y)*step(q.y,.78);
          if(mode<1.5){
            // Animate the three ripple systems already present in the photograph.
            // No extra ellipse graphics are composited over the surface.
            vec2 d=vec2(0.);float total=0.;
            for(int i=0;i<3;i++){
              vec2 center=i==0?vec2(.55,.23):(i==1?vec2(.25,.65):vec2(.79,.73));
              vec2 v=q-center;vec2 elliptical=v*vec2(1.,1.3);float r=length(elliptical);
              float influence=exp(-r*r*15.);
              float wave=sin(r*62.-time*2.1+float(i)*1.8);
              d+=normalize(v+vec2(.0001))*wave*.013*influence;
              total+=influence;
            }
            d/=max(1.,total);
            d+=vec2(sin(q.y*29.+time*.65),cos(q.x*31.-time*.72))*.0012;
            q+=d*(1.-credit);
          }else if(mode<2.5){
            // Advect the water texture downward, with two staggered passes.
            // Crossfades conceal the loop reset; no oscillation of the rock face.
            float light=smoothstep(.48,.82,dot(base,vec3(.299,.587,.114)));
            float region=smoothstep(.03,.12,q.y)*(1.-smoothstep(.73,.86,q.y));
            float a=fract(time*.32),b=fract(time*.32+.5);
            float weight=abs(a-.5)*2.;
            vec3 first=texture2D(photo,vec2(q.x,clamp(q.y-a*.075,.001,.999))).rgb;
            vec3 second=texture2D(photo,vec2(q.x,clamp(q.y-b*.075,.001,.999))).rgb;
            vec3 moving=mix(first,second,weight);
            gl_FragColor=vec4(mix(base,moving,light*region*(1.-credit)*.88),1.);
            return;
          }else if(mode>3.5){
            // Warm bright pixels define the flame layer, separate from dark backdrop.
            float flame=smoothstep(.10,.35,base.r-base.b)*smoothstep(.20,.62,base.r);
            float liftA=fract(time*.48),liftB=fract(time*.48+.5);
            float blend=abs(liftA-.5)*2.;
            float gust=turbulence(vec2(q.x*7.,q.y*9.+time*1.8));
            float detail=turbulence(vec2(q.x*19.+time*.2,q.y*22.+time*3.3));
            float rise=1.-q.y;
            float wind=(gust-.5)*(.018+.025*rise);
            float curl=(detail-.5)*.016;
            float surge=.65+turbulence(vec2(time*.8,q.x*5.))* .9;
            vec2 qa=vec2(q.x+wind+curl,q.y+liftA*.11*surge);
            vec2 qb=vec2(q.x+wind+curl,q.y+liftB*.11*surge);
            vec3 first=texture2D(photo,clamp(qa,.001,.999)).rgb;
            vec3 second=texture2D(photo,clamp(qb,.001,.999)).rgb;
            vec3 burning=mix(first,second,blend);
            float flicker=.91+detail*.22+gust*.12;
            burning*=flicker;
            gl_FragColor=vec4(mix(base,burning,flame*(1.-credit)),1.);
            return;
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
          const age=(noise(i+40)+t*(.18+noise(i+12)*.16)) % 1,px=(noise(i+74)+Math.sin(t+i)*.008)*pw,py=ph*(1-age);
          ctx.globalAlpha=fade*(1-age)*.45;ctx.fillStyle=i%2?'#ffb84c':'#ffe4aa';
          ctx.beginPath();ctx.arc(px,py,Math.max(.65,ph*.0022),0,TAU);ctx.fill();
        }
      } else if(motion==='water') {
        // Drops land at the original ripple centers; the shader moves the surface.
        const centers=[[.55,.23],[.25,.65],[.79,.73]];
        for(let i=0;i<centers.length;i++) {
          const age=(t+i*1.3)%4.6;
          if(age>=.7)continue;
          const u=age/.7,cx=pw*centers[i][0],cy=ph*centers[i][1];
          ctx.globalAlpha=fade*.6;ctx.fillStyle='#ecffff';
          ctx.beginPath();ctx.ellipse(cx,cy-ph*.2*(1-u*u),Math.max(1,ph*.0018),ph*(.003+.005*u),0,0,TAU);ctx.fill();
        }
      } else if(motion==='waterfall') {
        // The shader advects only the bright water; the rock image remains fixed.
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
