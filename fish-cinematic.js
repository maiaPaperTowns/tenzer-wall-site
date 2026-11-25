/* Photographic clean plate + independent photographic fish layers.
 * No painted assets. Existing wall UI and other scenes are untouched. */
(()=>{
  'use strict';
  const previous=window.drawStockScene,canvas=document.createElement('canvas');
  const gl=canvas.getContext('webgl',{alpha:false,antialias:false});
  const seed=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
  const position=(i,t)=>{
    const depth=.18+seed(i+40)*.82,direction=seed(i+72)>.25?-1:1;
    const speed=.030+depth*.029;
    const phase=((seed(i+9)+t*speed*direction)%1.28+1.28)%1.28;
    return {x:phase-.14,y:.40+seed(i+13)*.43+Math.sin(t*.43+i)*.022,
      depth,direction,tail:Math.sin(t*(5.4+depth*1.8)+i)};
  };
  let program,u;
  if(gl){
    const vertex='attribute vec2 p;varying vec2 uv;void main(){uv=vec2((p.x+1.)*.5,(1.-p.y)*.5);gl_Position=vec4(p,0.,1.);}';
    const fragment=`precision highp float;varying vec2 uv;
      uniform sampler2D photo;uniform vec2 viewport;uniform vec2 imageSize;uniform float time;uniform float moving;
      void main(){
        float ar=viewport.x/viewport.y,ia=imageSize.x/imageSize.y;
        vec2 fit=ar>ia?vec2(1.,ia/ar):vec2(ar/ia,1.);
        vec2 q=(uv-.5)*fit+vec2(.5,ar>ia?.53:.5);
        float surface=1.-smoothstep(.04,.48,q.y);
        vec2 ripple=vec2(sin(q.y*57.-time*1.4)+sin(q.y*107.+time*.8)*.35,cos(q.x*48.+time*.9)*.5);
        vec3 col=texture2D(photo,clamp(q+ripple*.0025*surface*moving,.001,.999)).rgb;
        float source=.48+sin(time*.23)*.035;
        float angle=(q.x-source)/(q.y+.16);
        float rays=pow(max(0.,sin(angle*14.+sin(time*.47+q.y*4.)*.55)),12.);
        float veil=(.55+.45*sin(time*.7+angle*3.))*rays*pow(1.-q.y,1.2);
        col+=vec3(.40,.67,.80)*veil*.14*moving;
        col*=1.+sin(time*.55+q.y*5.)*.025*moving;
        gl_FragColor=vec4(col,1.);
      }`;
    const shader=(kind,source)=>{const s=gl.createShader(kind);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
    program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
    const p=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(p);gl.vertexAttribPointer(p,2,gl.FLOAT,false,0,0);
    u=Object.fromEntries(['photo','viewport','imageSize','time','moving'].map(k=>[k,gl.getUniformLocation(program,k)]));
  }
  const textures=new WeakMap();
  function texture(image){let v=textures.get(image);if(v)return v;v=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,v);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);textures.set(image,v);return v;}
  window.drawStockScene=(ctx,scene,fade,w,h,reduced)=>{
    if(scene.entry.id!=='fish')return previous(ctx,scene,fade,w,h,reduced);
    const [plate,fish]=scene.entry.images;if(!plate?.naturalWidth||!fish?.naturalWidth)return;
    const t=reduced?0:scene.life;
    ctx.save();ctx.globalAlpha=fade;
    if(gl){
      if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
      gl.viewport(0,0,w,h);gl.useProgram(program);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture(plate));gl.uniform1i(u.photo,0);
      gl.uniform2f(u.viewport,w,h);gl.uniform2f(u.imageSize,plate.naturalWidth,plate.naturalHeight);gl.uniform1f(u.time,t);gl.uniform1f(u.moving,reduced?0:1);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);ctx.drawImage(canvas,0,0,w,h);
    }else{const z=Math.max(w/plate.naturalWidth,h/plate.naturalHeight);ctx.drawImage(plate,(w-plate.naturalWidth*z)/2,(h-plate.naturalHeight*z)/2,plate.naturalWidth*z,plate.naturalHeight*z);}
    const count=Math.max(28,Math.min(72,Math.round(w/h*22)));
    const order=Array.from({length:count},(_,i)=>i).sort((a,b)=>seed(a+40)-seed(b+40));
    for(const i of order){
      const f=position(i,t),fw=h*(.045+f.depth*.15),fh=fw*fish.naturalHeight/fish.naturalWidth;
      const shimmer=reduced?0:Math.sin(t*1.1+i+f.x*7.)*.07;
      ctx.save();ctx.globalAlpha=fade*(.30+f.depth*.66+shimmer);ctx.translate(f.x*w,f.y*h);ctx.rotate(Math.sin(t*.5+i)*.075);ctx.scale(f.direction,1);
      // Tail-led body wave, stable head, real translation through the scene.
      const strips=24,sw=fish.naturalWidth/strips,step=fw/strips;
      for(let j=0;j<strips;j++){const z=(j+.5)/strips;
        const wave=reduced?0:Math.sin(t*(5.4+f.depth*1.8)+i-z*5.8)*fh*.22*Math.pow(1-z,2.2);
        ctx.drawImage(fish,j*sw,0,sw+.4,fish.naturalHeight,-fw/2+j*step,-fh/2+wave,step+.3,fh);
      }
      ctx.restore();
    }
    // Slow suspended particles and luminous currents provide depth, not confetti.
    ctx.fillStyle='#d3edf5';
    for(let i=0;i<55;i++){const d=.3+seed(i+97)*.7;const x=((seed(i+91)+t*.005*d)%1)*w,y=((seed(i+121)-t*.009*d)%1+1)%1*h;
      ctx.globalAlpha=fade*(.045+d*.1);ctx.beginPath();ctx.arc(x,y,Math.max(.4,h*.0013*d),0,Math.PI*2);ctx.fill();}
    ctx.restore();
  };
  window.TenzerFishCinematic={position};
})();
