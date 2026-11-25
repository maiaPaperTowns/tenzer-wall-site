/* Supplied photographs remain unchanged. Motion uses bounded texture coordinates,
 * a conservative river mask, and independent atmospheric layers. No network assets. */
(() => {
  'use strict';
  const canvas=document.createElement('canvas');
  const gl=canvas.getContext('webgl',{alpha:false,antialias:false,preserveDrawingBuffer:true});
  const error=document.querySelector('#dataset-status');
  if(!gl){error.hidden=false;error.textContent='This animation study needs WebGL. Please try a browser with hardware acceleration enabled.';return;}
  const vert=`attribute vec2 p;varying vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}`;
  const frag=`precision highp float;
  varying vec2 uv;uniform sampler2D photo;uniform sampler2D mask;uniform vec2 resolution;uniform vec2 imageSize;uniform float t;uniform float mode;uniform float entrance;uniform float moving;
  float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.)),f.x),f.y);}
  float fbm(vec2 p){return .57*noise(p)+.28*noise(p*2.03)+.15*noise(p*4.07);}
  vec3 samplePhoto(vec2 q){return texture2D(photo,clamp(q,vec2(.001),vec2(.999))).rgb;}
  vec2 fishRegion(vec2 q,vec2 center,vec2 radius,float angle,float phase){
    float c=cos(angle),s=sin(angle);vec2 local=mat2(c,-s,s,c)*(q-center);
    float weight=1.-smoothstep(.4,1.,length(local/radius));
    // Each source region has its own phase. Zero displacement at region edges
    // preserves silhouettes without replacing fish with generic generated sprites.
    float tail=1.-smoothstep(-radius.x,radius.x,local.x);
    vec2 shift=vec2(sin(t*.65+phase)*.0035,sin(t*3.1+phase+local.x*65.)*.002*(.3+tail));
    return shift*weight;
  }
  void main(){
    vec2 screen=vec2(uv.x,1.-uv.y);vec2 q=screen;
    float ar=resolution.x/resolution.y,ia=imageSize.x/imageSize.y;
    // River and fish preserve the full image vertically on a wide wall;
    // outer edges extend only the scene's own edge colours, not enlarged subjects.
    vec2 fit=vec2(1.);if(ar>ia)fit.x=ia/ar;else fit.y=ar/ia;
    vec2 contained=(screen-.5)/fit+.5;
    float inside=step(0.,contained.x)*step(contained.x,1.)*step(0.,contained.y)*step(contained.y,1.);
    q=clamp(contained,.001,.999);
    if(mode>.5){
      // Fill the viewport without stretching the original objects; crop only.
      vec2 scale=ar>ia?vec2(1.,ia/ar):vec2(ar/ia,1.);
      q=(screen-.5)*scale+vec2(.5,ar>ia?.58:.5);
    }
    vec3 col=samplePhoto(q);
    if(mode<.5){
      // Original lunar pixels, size and final placement; no invented sky or scenery.
      // Six-second rise (previous generated version took 28 seconds).
      float progress=smoothstep(0.,6.,t);
      vec2 mq=contained-vec2(0.,.90*(1.-progress)*moving);
      float visible=step(0.,mq.x)*step(mq.x,1.)*step(0.,mq.y)*step(mq.y,1.);
      col=samplePhoto(mq)*visible;
    }else if(mode<1.5){
      float region=texture2D(mask,q).r;
      // Two phase-offset flow samples avoid resets and keep rocks/trees stationary.
      float a=fract(t*.21),b=fract(t*.21+.5),blend=abs(a-.5)*2.;
      vec2 velocity=vec2((q.x-.45)*.012,.027)*( .35+q.y*q.y );
      vec2 flutter=vec2(sin(q.y*70.-t*3.2),cos(q.x*61.+t*2.1))*.0012;
      vec2 qa=q-velocity*a+flutter,qb=q-velocity*b+flutter;
      vec3 flow=mix(samplePhoto(qa),samplePhoto(qb),blend);
      float safeA=texture2D(mask,clamp(qa,.001,.999)).r,safeB=texture2D(mask,clamp(qb,.001,.999)).r;
      col=mix(col,flow,region*min(safeA,safeB)*.9*moving);
      float sparkle=pow(max(0.,sin(q.x*470.+q.y*300.-t*5.)),18.)*.05;
      col+=sparkle*region*moving;
    }else{
      // Independently masked source-photo regions; no generated fish, paint,
      // replacement scene, copied fish or global school translation.
      vec2 swim=vec2(0.);
      swim+=fishRegion(q,vec2(.40,.70),vec2(.055,.050),-.7,.2);
      swim+=fishRegion(q,vec2(.45,.78),vec2(.046,.055),-.8,1.4);
      swim+=fishRegion(q,vec2(.54,.82),vec2(.050,.065),-.9,2.5);
      swim+=fishRegion(q,vec2(.67,.85),vec2(.055,.058),-.7,3.4);
      swim+=fishRegion(q,vec2(.74,.69),vec2(.050,.035),-.3,4.3);
      swim+=fishRegion(q,vec2(.84,.61),vec2(.060,.027),.1,5.2);
      swim+=fishRegion(q,vec2(.58,.56),vec2(.045,.025),.1,2.0);
      swim+=fishRegion(q,vec2(.39,.54),vec2(.040,.026),0.,3.8);
      vec2 water=vec2(sin(q.y*33.+t*.7),cos(q.x*26.-t*.55))*.0014;
      col=samplePhoto(q+(swim+water*.3)*moving);
      float rays=pow(max(0.,sin((q.x-.47)/(q.y+.13)*11.+t*.10)),8.)*.045;
      col+=vec3(.45,.8,1.)*rays*(1.-q.y)*moving;
      vec2 drift=vec2(q.x*95.+sin(t*.15)*.4,q.y*80.+t*.65);
      float mote=step(.993,hash(floor(drift)))*(1.-smoothstep(.02,.12,length(fract(drift)-.5)))*.18;
      col+=mote*(1.-smoothstep(.1,.8,q.y))*moving;
    }
    col*=mix(.0,1.,entrance);gl_FragColor=vec4(col,1.);
  }`;
  function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
  let program;
  try{program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vert));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,frag));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));}catch(e){error.hidden=false;error.textContent='The photo renderer could not start: '+e.message;return;}
  gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);const p=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(p);gl.vertexAttribPointer(p,2,gl.FLOAT,false,0,0);
  const uniforms=Object.fromEntries(['photo','mask','resolution','imageSize','t','mode','entrance','moving'].map(k=>[k,gl.getUniformLocation(program,k)]));
  function texture(source){const v=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,v);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);return v;}
  const mask=document.createElement('canvas');mask.width=724;mask.height=483;const mc=mask.getContext('2d');mc.fillStyle='black';mc.fillRect(0,0,724,483);mc.fillStyle='white';
  // Water-only polygon traced in original photo coordinates; inner rock islands excluded.
  mc.beginPath();[[.43,.47],[.48,.48],[.54,.53],[.58,.62],[.71,.73],[.81,.80],[1,.88],[1,1],[.29,1],[.32,.88],[.37,.74],[.33,.65],[.40,.57]].forEach(([x,y],i)=>i?mc.lineTo(x*724,y*483):mc.moveTo(x*724,y*483));mc.closePath();mc.fill();
  mc.fillStyle='black';for(const [x,y,rx,ry]of [[.47,.60,.033,.023],[.38,.67,.027,.024],[.55,.67,.04,.02],[.34,.78,.04,.028],[.64,.77,.04,.023],[.38,.91,.035,.025]]){mc.beginPath();mc.ellipse(x*724,y*483,rx*724,ry*483,0,0,Math.PI*2);mc.fill();}
  const soft=document.createElement('canvas');soft.width=724;soft.height=483;const sc=soft.getContext('2d');sc.fillStyle='black';sc.fillRect(0,0,724,483);sc.filter='blur(4px)';sc.drawImage(mask,0,0);const maskTexture=texture(soft);
  const photoTextures=new WeakMap();
  const previous=window.drawStockScene;
  window.TenzerPhotoMotion={moonRiseSeconds:6};
  window.drawStockScene=function(ctx,scene,fade,w,h,reducedMotion){
    const mode=['moon','river','fish'].indexOf(scene.entry.id);
    if(mode<0){previous(ctx,scene,fade,w,h,reducedMotion);return;}
    const image=scene.entry.images[0];if(!image?.naturalWidth)return;
    gl.activeTexture(gl.TEXTURE0);
    let tex=photoTextures.get(image);if(!tex){tex=texture(image);photoTextures.set(image,tex);}
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
    gl.viewport(0,0,w,h);gl.useProgram(program);
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex);gl.uniform1i(uniforms.photo,0);
    gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,maskTexture);gl.uniform1i(uniforms.mask,1);
    gl.uniform2f(uniforms.resolution,w,h);gl.uniform2f(uniforms.imageSize,image.naturalWidth,image.naturalHeight);
    gl.uniform1f(uniforms.t,reducedMotion?0:scene.life);gl.uniform1f(uniforms.mode,mode);
    gl.uniform1f(uniforms.entrance,1);gl.uniform1f(uniforms.moving,reducedMotion?0:1);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    ctx.save();ctx.globalAlpha=fade;ctx.drawImage(canvas,0,0,w,h);ctx.restore();
  };
})();
