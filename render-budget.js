/* Keep expensive artwork below a fixed pixel budget; UI/kanji stay on the main canvas. */
(() => {
  const MAX_PIXELS=3000000;
  function dimensions(w,h){const scale=Math.min(1,Math.sqrt(MAX_PIXELS/(w*h)));return {w:Math.max(1,Math.floor(w*scale)),h:Math.max(1,Math.floor(h*scale)),scale}}
  function draw(ctx,scene,fade,w,h,reduced){
    const size=dimensions(w,h);let layer=scene.renderLayer;
    if(!layer||layer.width!==size.w||layer.height!==size.h){const canvas=document.createElement('canvas');canvas.width=size.w;canvas.height=size.h;
      layer=scene.renderLayer={canvas,width:size.w,height:size.h,ctx:canvas.getContext('2d'),state:{entry:{...scene.entry,size:scene.entry.size?scene.entry.size*size.scale:undefined},stockVariant:scene.stockVariant}};
    }
    const s=layer.state;s.life=scene.life;s.x=scene.x==null?undefined:scene.x*size.scale;s.y=scene.y==null?undefined:scene.y*size.scale;
    layer.ctx.clearRect(0,0,size.w,size.h);
    window.drawStockScene(layer.ctx,s,fade,size.w,size.h,reduced);
    scene.stockVariant=s.stockVariant;
    ctx.save();ctx.globalAlpha=1;ctx.drawImage(layer.canvas,0,0,w,h);ctx.restore();
  }
  window.TenzerRenderBudget={dimensions,draw};
})();
