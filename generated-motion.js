/* Generated ink-wash scenery, original single-tap wall controller.
 * World assets use cover framing; all living objects are independent layers. */
(() => {
  'use strict';
  const previous=window.drawStockScene;
  const surface=document.createElement('canvas');
  const gl=surface.getContext('webgl',{alpha:false,antialias:false,preserveDrawingBuffer:true});
  if(!gl){console.warn('Generated motion: WebGL unavailable; using static generated backgrounds.');window.drawStockScene=(c,s,f,w,h)=>{const im=s.entry.images[0],z=Math.max(w/im.naturalWidth,h/im.naturalHeight);c.save();c.globalAlpha=f;c.drawImage(im,(w-im.naturalWidth*z)/2,(h-im.naturalHeight*z)/2,im.naturalWidth*z,im.naturalHeight*z);c.restore();};return;}
  const vertex='attribute vec2 p;varying vec2 uv;void main(){uv=vec2((p.x+1.)*.5,(1.-p.y)*.5);gl_Position=vec4(p,0.,1.);}';
  const fragment=`precision highp float;varying vec2 uv;
  uniform sampler2D photo;uniform vec2 viewport;uniform vec2 photoSize;uniform float time;uniform float mode;uniform float moving;
  float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.)),f.x),f.y);}
  float fbm(vec2 p){return noise(p)*.57+noise(p*2.03)*.28+noise(p*4.07)*.15;}
  vec3 sampleAt(vec2 q){return texture2D(photo,clamp(q,.001,.999)).rgb;}
  float island(vec2 q,vec2 center,vec2 radius){return smoothstep(.95,1.3,length((q-center)/radius));}
  float water(vec2 q){
    float d=smoothstep(.47,1.,q.y),left=mix(.465,.26,d),right=mix(.52,1.04,d);
    float region=smoothstep(.48,.54,q.y)*smoothstep(left,left+.025,q.x)*(1.-smoothstep(right-.025,right,q.x));
    region*=island(q,vec2(.54,.79),vec2(.052,.065));
    region*=island(q,vec2(.36,.815),vec2(.035,.035));
    region*=island(q,vec2(.805,.9),vec2(.046,.05));
    region*=island(q,vec2(.51,.61),vec2(.026,.024));
    return region;
  }
  void main(){float ar=viewport.x/viewport.y,ia=photoSize.x/photoSize.y;vec2 scale=ar>ia?vec2(1.,ia/ar):vec2(ar/ia,1.);vec2 q=(uv-.5)*scale+.5;
    vec3 base=sampleAt(q),col=base;float t=time;
    if(mode<.5){
      float lake=smoothstep(.785,.805,q.y),depth=max(0.,(q.y-.79)/.21);
      vec2 rip=vec2(sin(q.y*170.-t*.9)+sin(q.y*320.+t*1.1)*.35,cos(q.x*95.-t*.6)*.28)*.0015*lake*depth;
      col=sampleAt(q+rip*moving);
      float clouds=fbm(vec2(q.x*4.-t*.006,q.y*10.));
      float wisps=smoothstep(.48,.83,clouds)*exp(-pow((q.y-.48)*5.,2.))*.065*(1.-lake)*moving;
      col=mix(col,vec3(.43,.50,.53),wisps);
    }else if(mode<1.5){
      float region=water(q),d=smoothstep(.42,.98,q.y);
      vec2 flow=vec2((q.x-.50)*.025,.038)*(.15+d*d);
      float a=fract(t*.20),b=fract(t*.20+.5),blend=abs(a-.5)*2.;
      vec2 curl=vec2(sin(q.y*104.-t*3.4),cos(q.x*118.+t*2.5))*.0012*d;
      vec2 qa=q-flow*a+curl,qb=q-flow*b+curl;
      vec3 current=mix(sampleAt(qa),sampleAt(qb),blend);
      float safe=region*min(water(qa),water(qb));
      col=mix(base,current,safe*.93*moving);
      float glint=pow(max(0.,sin(q.x*310.+q.y*170.-t*3.5)),14.)*.026*d;
      col+=vec3(.82,.91,.88)*glint*safe*moving;
      // The stream banks stay still; only a tiny high canopy sway is added.
      float canopy=(1.-region)*smoothstep(.02,.12,q.y)*(1.-smoothstep(.32,.42,q.y));
      vec3 leaves=sampleAt(q+vec2(sin(q.y*17.+t*.6)*.00035,0.));
      col=mix(col,leaves,canopy*moving);
    }else{
      float depth=1.-q.y;
      vec2 refraction=vec2(sin(q.y*29.+t*.6)+sin(q.y*73.-t*.9)*.35,cos(q.x*34.-t*.5)*.35)*.0018;
      col=sampleAt(q+refraction*(.35+depth)*moving);
      float rays=pow(max(0.,sin((q.x-.48)/(q.y+.20)*16.+sin(t*.13)*.6)),9.);
      float slow=fbm(vec2(q.x*8.-t*.018,q.y*5.+t*.035));
      col+=vec3(.12,.15,.12)*rays*pow(depth,1.6)*(.24+slow*.65)*moving;
      col*=1.+(slow-.5)*.045*moving;
    }
    gl_FragColor=vec4(col,1.);
  }`;
  function shader(kind,source){const s=gl.createShader(kind);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
  const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);
  const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);const pos=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
  const u=Object.fromEntries(['photo','viewport','photoSize','time','mode','moving'].map(k=>[k,gl.getUniformLocation(program,k)])),textures=new WeakMap();
  function texture(image){let tex=textures.get(image);if(tex)return tex;tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);textures.set(image,tex);return tex;}
  const seed=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x);};
  const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
  function imageY(q,w,h,image){const ar=w/h,ia=image.naturalWidth/image.naturalHeight,s=ar>ia?ia/ar:1;return ((q-.5)/s+.5)*h;}
  function ridge(x,w,h,image){return imageY(.758+Math.sin(x/w*12.)*.008+Math.sin(x/w*27.+1.)*.006,w,h,image);}
  function moon(ctx,s,t,w,h,reduced){
    const [background,disc]=s.entry.images;if(!disc?.naturalWidth)return;
    const progress=reduced ? .8 : smooth(t/28),r=h*.145,x=w*(.54+.045*progress),horizon=imageY(.764,w,h,background);
    const y=horizon+r*1.06-progress*h*.48;
    // Moon is behind the ridge, not a circle that fades on over the mountains.
    ctx.save();ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(w,0);for(let xx=w;xx>=0;xx-=w/160)ctx.lineTo(xx,ridge(xx,w,h,background));ctx.closePath();ctx.clip();
    const glow=ctx.createRadialGradient(x,y,r*.8,x,y,r*2.8);glow.addColorStop(0,'rgba(242,223,178,.13)');glow.addColorStop(1,'rgba(242,223,178,0)');ctx.fillStyle=glow;ctx.fillRect(x-r*3,y-r*3,r*6,r*6);
    ctx.globalAlpha*=.75+.25*progress;ctx.drawImage(disc,x-r,y-r,r*2,r*2);ctx.restore();
    const lake=imageY(.795,w,h,background),strength=smooth((horizon+r-y)/(r*3));
    ctx.save();const opacity=ctx.globalAlpha;ctx.globalCompositeOperation='screen';
    for(let i=0;i<54;i++){const d=i/54,yy=lake+(h-lake)*d,phase=reduced?0:t;const xx=x+Math.sin(i*1.77+phase*.65)*w*.004*(.3+d),ww=w*(.009+d*.045)*( .65+.35*Math.sin(i*2.1+phase*.22));ctx.globalAlpha=opacity*strength*(1-d)*.16;ctx.fillStyle='#dcc693';ctx.beginPath();ctx.ellipse(xx,yy,ww,Math.max(.4,h*.0009),0,0,Math.PI*2);ctx.fill();}
    ctx.restore();
  }
  function fish(ctx,s,t,w,h,reduced){const sprite=s.entry.images[1];if(!sprite?.naturalWidth)return;const opacity=ctx.globalAlpha;
    // Depth sorting means small distant fish never cover the large foreground ones.
    const count=Math.max(14,Math.min(44,Math.round(w/h*13)));
    const order=Array.from({length:count},(_,i)=>i).sort((a,b)=>seed(a+40)-seed(b+40));
    for(const i of order){
      const depth=.25+seed(i+40)*.75,speed=.018+depth*.022,phase=seed(i+51)*Math.PI*2;
      // Long oval circuits: fish turn and swim back, rather than a one-way conveyor.
      const orbit=phase+t*speed*1.8;
      const x=w*(.5+Math.sin(orbit)*(.43+seed(i+8)*.12));
      const y=h*(.28+seed(i+13)*.43)+Math.cos(orbit)*h*.075+Math.sin(t*.32+phase)*h*.015;
      const fw=h*(.065+depth*.12),fh=fw*(sprite.naturalHeight/sprite.naturalWidth);
      const direction=Math.cos(orbit)>=0?1:-1;
      const turning=.24+.76*Math.pow(Math.abs(Math.cos(orbit)),.25);
      ctx.save();ctx.globalAlpha=opacity*(.36+depth*.58);ctx.translate(x,y);ctx.rotate(Math.sin(t*.28+phase)*.028);ctx.scale(direction*turning*(.96+Math.sin(t*3.1+phase)*.025),1);
      // A continuous body wave grows toward the tail (left), while the head stays steady.
      const strips=38,sw=sprite.naturalWidth/strips,step=fw/strips;
      for(let j=0;j<strips;j++){const z=(j+.5)/strips,tail=Math.pow(1-z,2.6),wave=reduced?0:Math.sin(t*(3.6+depth)+phase-z*5.5)*fh*.14*tail;ctx.drawImage(sprite,j*sw,0,sw+.6,sprite.naturalHeight,-fw/2+j*step,-fh/2+wave,step+.45,fh);}
      ctx.restore();
    }
    // Suspended fine particles share the water current, not a screen-space snowfall.
    ctx.save();ctx.fillStyle='#e9eee0';for(let i=0;i<70;i++){const d=.3+seed(i+201)*.7,x=((seed(i+91)+t*.003*d)%1)*w,y=((seed(i+121)-t*.004*d)%1+1)%1*h;ctx.globalAlpha=opacity*(.08+d*.13);ctx.beginPath();ctx.arc(x,y,Math.max(.5,h*.001*d),0,Math.PI*2);ctx.fill();}ctx.restore();
  }
  window.drawStockScene=(ctx,s,fade,w,h,reduced)=>{
    const mode=['moon','river','fish'].indexOf(s.entry.id);if(mode<=0)return previous(ctx,s,fade,w,h,reduced);
    const image=s.entry.images[0];if(!image?.naturalWidth)return;
    if(surface.width!==w||surface.height!==h){surface.width=w;surface.height=h;}gl.viewport(0,0,w,h);gl.useProgram(program);
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture(image));gl.uniform1i(u.photo,0);gl.uniform2f(u.viewport,w,h);gl.uniform2f(u.photoSize,image.naturalWidth,image.naturalHeight);gl.uniform1f(u.time,reduced?0:s.life);gl.uniform1f(u.mode,mode);gl.uniform1f(u.moving,reduced?0:1);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    ctx.save();ctx.globalAlpha=fade;ctx.drawImage(surface,0,0,w,h);if(mode===0)moon(ctx,s,reduced?24:s.life,w,h,reduced);if(mode===2)fish(ctx,s,reduced?0:s.life,w,h,reduced);ctx.restore();
  };
  // Expose pure timing only for deterministic tests, never scene/controller state.
  window.TenzerGeneratedMotion={moonProgress:t=>smooth(t/28)};
})();
