/* Dataset validation is independent of the canvas renderer and testable in Node. */
(() => {
  const behaviors = ['bloom', 'glow', 'fly', 'reveal'];
  const fail = message => { throw new Error(message); };
  function assetURL(value, base) {
    if (typeof value !== 'string' || !value.trim()) fail('Asset path must be a non-empty string.');
    const url = new URL(value, base);
    if (!['http:', 'https:'].includes(url.protocol) || url.origin !== new URL(base).origin) fail('Assets and datasets must use this website’s origin.');
    return url.href;
  }
  function positive(value, label, max = 300) {
    if (!Number.isFinite(value) || value <= 0 || value > max) fail(`${label} must be between 0 and ${max}.`);
    return value;
  }
  function validate(raw, base) {
    if (!raw || raw.version !== 1 || !Array.isArray(raw.entries)) fail('Expected dataset version 1 and an entries array.');
    const transitions = {enter:1.4, exit:2.2, switch:.75, ...raw.transitions};
    for (const [key,value] of Object.entries(transitions)) positive(value, `transitions.${key}`, 30);
    if (raw.background && !/^#[0-9a-f]{6}$/i.test(raw.background)) fail('background must be a six-digit hex color.');
    const ids = new Set();
    const entries = raw.entries.filter(e => e?.enabled !== false).map((entry, index) => {
      const name = `Entry ${index + 1}`;
      if (!entry || typeof entry.id !== 'string' || !/^[a-z0-9_-]+$/i.test(entry.id) || ids.has(entry.id)) fail(`${name}: unique id required.`);
      ids.add(entry.id);
      if (typeof entry.meaning !== 'string' || !entry.meaning.trim()) fail(`${name}: meaning required.`);
      if ((!entry.glyph || typeof entry.glyph !== 'string') && !entry.kanjiAsset) fail(`${name}: glyph or kanjiAsset required.`);
      if (!behaviors.includes(entry.behavior)) fail(`${name}: unknown behavior '${entry.behavior}'. Use ${behaviors.join(', ')}.`);
      if (!Array.isArray(entry.assets) || !entry.assets.length) fail(`${name}: at least one scene asset required.`);
      const assets = entry.assets.map(src => assetURL(src,base));
      const checkIndex = i => { if(!Number.isInteger(i) || i < 0 || i >= assets.length) fail(`${name}: invalid asset index.`); };
      const crops = entry.crops || assets.map((_,asset) => ({asset,crop:[0,0,1,1]}));
      if(!Array.isArray(crops) || !crops.length) fail(`${name}: crops must be a non-empty array.`);
      crops.forEach(spec => {
        checkIndex(spec.asset);
        const c=spec.crop;
        if(!Array.isArray(c)||c.length!==4||!c.every(Number.isFinite)||c[0]<0||c[1]<0||c[2]<=0||c[3]<=0||c[0]+c[2]>1.00001||c[1]+c[3]>1.00001) fail(`${name}: crop must fit within normalized image bounds.`);
        if(spec.shape && (!Array.isArray(spec.shape)||spec.shape.length<3||!spec.shape.every(p=>Array.isArray(p)&&p.length===2&&p.every(n=>Number.isFinite(n)&&n>=0&&n<=1)))) fail(`${name}: invalid crop polygon.`);
      });
      const variants = entry.variants || assets.map((_,asset)=>({mode:'backdrop',asset}));
      if(!Array.isArray(variants)||!variants.length) fail(`${name}: variants must be non-empty.`);
      variants.forEach(v=>{checkIndex(v.asset);if(!['disc','backdrop'].includes(v.mode))fail(`${name}: invalid variant mode.`);if(v.rays!=null)checkIndex(v.rays)});
      const options = entry.options || {};
      for(const [key,value] of Object.entries(options)) positive(value,`${name} options.${key}`,1000);
      if(options.countMin && options.countMax && options.countMin>options.countMax)fail(`${name}: countMin exceeds countMax.`);
      const sound = entry.sound ? {...entry.sound} : null;
      if(sound?.src) sound.src=assetURL(sound.src,base);
      if(sound?.frequency!=null)positive(sound.frequency,`${name} sound.frequency`,20000);
      if(sound?.volume!=null && (!Number.isFinite(sound.volume)||sound.volume<0||sound.volume>1))fail(`${name}: sound volume must be 0–1.`);
      const timing={...transitions,...entry.transitions};
      Object.entries(timing).forEach(([k,v])=>positive(v,`${name} transitions.${k}`,30));
      const hue=entry.hue ?? 205;
      if(!Number.isFinite(hue)||hue<0||hue>360)fail(`${name}: hue must be 0–360.`);
      return {...entry, assets, crops, variants, options, sound, hue, transitions:timing, duration:positive(entry.duration ?? 15,`${name} duration`), kanjiAsset:entry.kanjiAsset ? assetURL(entry.kanjiAsset,base) : null};
    });
    if(!entries.length) fail('The dataset has no enabled characters.');
    return {version:1,title:raw.title || 'Tenzer Wall',background:raw.background || '#eee8da',entries};
  }
  async function load(path, base=location.href) {
    const url=assetURL(path,base);
    const response=await fetch(url,{cache:'no-cache'});
    if(!response.ok)throw Error(`Could not load dataset (${response.status}).`);
    return validate(await response.json(),url);
  }
  const api={validate,load,behaviors};
  if(typeof module!=='undefined')module.exports=api;
  else window.TenzerConfig=api;
})();
