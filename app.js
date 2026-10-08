(() => {
  const canvas = document.querySelector('#art');
  const ctx = canvas.getContext('2d', { alpha: true });
  const intro = document.querySelector('#intro');
  const begin = document.querySelector('#begin');
  const hint = document.querySelector('#hint');
  const soundButton = document.querySelector('#sound');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Windows infrared touch can synthesize a right-click after a long hold.
  // Capture on the document so this also covers controls and future overlays.
  document.addEventListener('contextmenu', event => event.preventDefault(), { capture: true });
  document.addEventListener('dragstart', event => event.preventDefault(), { capture: true });
  let entries = [], ready = false;
  let w = 0, h = 0, dpr = 1, last = performance.now(), started = false;
  let audio, wind, sceneSound;
  let effectNodes=[],effectGain;
  function stopEffect(){if(effectGain&&audio){effectGain.gain.cancelScheduledValues(audio.currentTime);effectGain.gain.setTargetAtTime(.0001,audio.currentTime,.06);}for(const n of effectNodes){try{n.stop(audio.currentTime+.3)}catch{}}effectNodes=[];}
  function sceneEffect(c){
    stopEffect();if(!audio||audio.state!=='running')return;
    const now=audio.currentTime,duration=Math.min(30,c.duration||20),id=c.id||c.behavior,seed=[...id].reduce((n,x)=>n+x.charCodeAt(0),0),gain=audio.createGain();effectGain=gain;gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(1,now+.4);gain.gain.setTargetAtTime(.0001,now+duration-.5,.15);gain.connect(audio.destination);
    const tone=(at,f,len,volume=.018,end=f)=>{const o=audio.createOscillator(),v=audio.createGain();o.frequency.setValueAtTime(f,now+at);o.frequency.exponentialRampToValueAtTime(Math.max(20,end),now+at+len);v.gain.setValueAtTime(.0001,now+at);v.gain.linearRampToValueAtTime(volume,now+at+.025);v.gain.exponentialRampToValueAtTime(.0001,now+at+len);o.connect(v).connect(gain);o.start(now+at);o.stop(now+at+len+.03);effectNodes.push(o);};
    const noise=(at,len,f,volume,type='lowpass')=>{const b=audio.createBuffer(1,Math.ceil(audio.sampleRate*len),audio.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;const n=audio.createBufferSource(),filter=audio.createBiquadFilter(),v=audio.createGain();n.buffer=b;filter.type=type;filter.frequency.value=f;v.gain.setValueAtTime(.0001,now+at);v.gain.linearRampToValueAtTime(volume,now+at+Math.min(.15,len*.2));v.gain.exponentialRampToValueAtTime(.0001,now+at+len);n.connect(filter).connect(v).connect(gain);n.start(now+at);n.stop(now+at+len);effectNodes.push(n);};
    if(['waterfall','river','ocean','rain','water','fish','lotus'].includes(id)){for(let at=0;at<duration-2;at+=id==='waterfall'?2:3.8){if(id==='water'){tone(at+1.45,840,.28,.025,260);tone(at+1.55,510,.4,.012,170);}else noise(at,Math.min(4,duration-at),id==='rain'?3700:id==='ocean'?900:1800,id==='waterfall'?.045:.025);}}
    else if(['wind','leaves','bamboo','forest','tree','cloud','sand','snow','ice'].includes(id)){for(let at=0;at<duration-3;at+=4.1)noise(at,4.8,id==='sand'?2300:650+seed%800,id==='wind'?.035:.016,'bandpass');if(id==='ice')for(let at=1;at<duration;at+=3.7)tone(at,1700+seed,1.3,.009);}
    else if(id==='fire'){for(let at=0;at<duration-1;at+=2)noise(at,2.4,650,.025);for(let at=.3;at<duration;at+=.6+(seed%7)*.07)noise(at,.07,2300,.012);}
    else if(id==='lightning'){for(let at=.7;at<duration-2;at+=3.3){noise(at,1.8,170,.065);tone(at,60,1.5,.024,30);}}
    else if(id==='horse'){for(let at=.1;at<duration-.5;at+=.7){for(const offset of [0,.12,.31]){noise(at+offset,.08,550,.035);tone(at+offset,130,.09,.025,65);}}}
    else if(id==='cat'){tone(.2,440,.8,.018,570);tone(.85,570,.45,.012,260);for(let at=1.5;at<duration-1;at+=2)tone(at,45,1.7,.01,42);}
    else if(id==='bird'){for(let at=.3;at<duration-.8;at+=2.6){tone(at,1500,.2,.015,2700);tone(at+.23,2400,.25,.012,1600);}}
    else{const f=260+seed%500;for(let at=.1;at<duration-2;at+=4.5){tone(at,f,2,.015);tone(at+.2,f*1.5,2.3,.008);tone(at+.4,f*2,1.8,.006);}}
  }
  const characters = [], ripples = [], scenes = [];
  let spawnCounts = [];
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  function resize() {
    w = innerWidth; h = innerHeight;
    dpr = Math.min(devicePixelRatio || 1, 1.5, Math.sqrt(4200000 / (w*h)));
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawnCharacter(startY = null) {
    const activeCounts = entries.map(type => characters.filter(c => c.state === 'falling' && c.id === type.id).length);
    const lowestActive = Math.min(...activeCounts);
    const candidates = entries.map((type, index) => ({ type, index }))
      .filter(({ index }) => activeCounts[index] === lowestActive)
      .sort((a, b) => spawnCounts[a.index] - spawnCounts[b.index]);
    const leastSpawned=spawnCounts[candidates[0].index];
    const balanced=candidates.filter(candidate=>spawnCounts[candidate.index]===leastSpawned);
    const { type, index:typeIndex } = balanced[Math.floor(Math.random()*balanced.length)];
    spawnCounts[typeIndex]++;
    const wallScale = w / Math.max(h, 1) > 2.4 ? 1.18 : 1;
    const size = clamp(Math.min(w, h) * rand(.105, .17) * wallScale, 84, 360);
    const y = startY ?? -size * .7;
    const margin = Math.min(size * .78, w * .24);
    let x = w * .5, bestScore = -Infinity;
    const laneCount = clamp(Math.floor(w / Math.max(150, size * 1.35)), 3, 8);
    for (let i = 0; i < laneCount; i++) {
      const laneX = margin + (w - margin * 2) * ((i + .5) / laneCount);
      const proposedX = clamp(laneX + rand(-size * .12, size * .12), margin, w - margin);
      const nearby = characters.filter(c => c.state === 'falling' && Math.abs(c.y - y) < (c.size + size) * 1.15);
      const score = nearby.length ? Math.min(...nearby.map(c => Math.abs(c.x - proposedX) / ((c.size + size) * .5))) : 99;
      if (score > bestScore) { bestScore = score; x = proposedX; }
    }
    characters.push({
      ...type, x, y, size,
      vy: reduced ? 8 : rand(17, 28), drift: rand(-7, 7), phase: rand(0, Math.PI * 2),
      alpha: 0, life: 0, state: 'falling', scale: 1, rotation: rand(-.08, .08)
    });
  }

  function resolveCharacterSpacing() {
    const falling = characters.filter(c => c.state === 'falling');
    for (let i = 0; i < falling.length; i++) {
      for (let j = i + 1; j < falling.length; j++) {
        const a = falling[i], b = falling[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const minimumX = (a.size + b.size) * .57;
        const minimumY = (a.size + b.size) * .68;
        if (Math.abs(dx) >= minimumX || Math.abs(dy) >= minimumY) continue;
        const direction = dx === 0 ? (i % 2 ? 1 : -1) : Math.sign(dx);
        const push = (minimumX - Math.abs(dx)) * .16;
        a.x = clamp(a.x - direction * push, a.size * .58, w - a.size * .58);
        b.x = clamp(b.x + direction * push, b.size * .58, w - b.size * .58);
        if (Math.abs(b.x - a.x) < minimumX * .74) {
          const verticalNudge = (minimumY - Math.abs(dy)) * .035;
          if (a.y < b.y) b.y += verticalNudge; else a.y += verticalNudge;
        }
      }
    }
  }

  function burst(c) {
    if (c.state !== 'falling') return;
    c.state = 'opening'; c.life = 0;
    if(!['horse','waterfall'].includes(c.behavior))ripples.push({ x: c.x, y: c.y, r: c.size * .38, alpha: .62, hue: c.hue });
    const activeScenes = scenes.filter(scene => scene.life >= 0 && scene.life < scene.max);
    const currentScene = activeScenes[activeScenes.length - 1];
    const outgoingFadeTime = c.transitions.switch;
    activeScenes.slice(0, -1).forEach(scene => { scene.max = scene.life; });
    if (currentScene) {
      // Clear the previous painting quickly so two detailed scenes never
      // remain fully visible together.
      currentScene.exitDuration = outgoingFadeTime;
      currentScene.max = Math.min(currentScene.max, currentScene.life + outgoingFadeTime);
    }
    scenes.push({
      entry: c, x: c.x, y: c.y,
      life: 0, max: c.duration,
      enterDuration: c.transitions.enter, exitDuration: c.transitions.exit, hue: c.hue
    });
    if(sceneSound) {sceneSound.pause();sceneSound=null;}
    sceneEffect(c);
    if (audio?.state === 'running' && c.sound) {
      if(c.sound.src) {
        sceneSound=new Audio(c.sound.src);sceneSound.volume=c.sound.volume ?? .5;
        sceneSound.play().catch(()=>{hint.textContent='Sound unavailable — touch another character';});
      }
    }
    setTimeout(() => { if (started) spawnCharacter(); }, reduced ? 700 : 2200);
  }

  function chime(freq) {
    const now = audio.currentTime;
    [1, 1.5, 2].forEach((ratio, i) => {
      const osc = audio.createOscillator(), gain = audio.createGain();
      osc.type = 'sine'; osc.frequency.value = freq * ratio;
      gain.gain.setValueAtTime(0, now + i * .06); gain.gain.linearRampToValueAtTime(.035 / (i + 1), now + .12 + i * .06);
      gain.gain.exponentialRampToValueAtTime(.0001, now + 2.2 + i * .2);
      osc.connect(gain).connect(audio.destination); osc.start(now + i * .06); osc.stop(now + 2.5 + i * .2);
    });
  }

  function toggleSound() {
    if (!audio) {
      audio = new (window.AudioContext || window.webkitAudioContext)();
      wind = audio.createOscillator(); const gain = audio.createGain();
      wind.type = 'sine'; wind.frequency.value = 92; gain.gain.value = .007;
      wind.connect(gain).connect(audio.destination); wind.start();
      const current=scenes[scenes.length-1];audio.resume().then(()=>{if(current)sceneEffect(current.entry);});
      soundButton.textContent = 'Sound on'; soundButton.setAttribute('aria-pressed', 'true');
    } else {
      const on = audio.state === 'running'; (on ? audio.suspend() : audio.resume());
      if(on)stopEffect();else {const current=scenes[scenes.length-1];if(current)audio.resume().then(()=>sceneEffect(current.entry));}
      if(on && sceneSound) sceneSound.pause();
      soundButton.textContent = on ? 'Sound off' : 'Sound on'; soundButton.setAttribute('aria-pressed', String(!on));
    }
  }

  function interact(x, y) {
    let best = null, distance = Infinity;
    for (const c of characters) {
      if (c.state !== 'falling') continue;
      const d = Math.hypot(c.x - x, c.y - y);
      // Infrared wall input is less precise than a phone. Keep the visual form
      // untouched while giving every character a deliberately generous hit area.
      if (d < c.size * 1.02 && d < distance) { best = c; distance = d; }
    }
    if (best) burst(best);
    else ripples.push({ x, y, r: 6, alpha: .28, hue: 205 });
    hint.classList.add('quiet');
  }

  function drawCharacter(c, dt) {
    c.life += dt; c.phase += dt * .6;
    // These scenes own the exact enlargement/material transition of their glyph.
    if(c.state!=='falling'&&['horse','waterfall'].includes(c.behavior)){c.state='gone';return;}
    if (c.state === 'falling') {
      c.alpha = Math.min(1, c.alpha + dt * .7);
      c.y += c.vy * dt * (h / 700); c.x += Math.sin(c.phase) * c.drift * dt;
      if (c.y > h + c.size) { c.state = 'gone'; setTimeout(() => started && spawnCharacter(), 500); }
    } else {
      c.alpha = Math.max(0, 1 - c.life / 1.9); c.scale = 1 + c.life * .34; c.rotation += dt * .08;
      if (c.alpha <= 0) c.state = 'gone';
    }
    if (c.state === 'gone') return;
    ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.rotation); ctx.scale(c.scale, c.scale);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `400 ${c.size}px "uddigikyokasho-pro", sans-serif`;
    if(c.kanjiImage) {
      const ratio=c.kanjiImage.naturalWidth/c.kanjiImage.naturalHeight;
      const iw=c.size*Math.min(1,ratio), ih=c.size/Math.max(1,ratio);
      ctx.globalAlpha=c.alpha;ctx.drawImage(c.kanjiImage,-iw/2,-ih/2,iw,ih);
      ctx.restore();return;
    }
    ctx.shadowColor = 'rgba(225,239,240,.45)'; ctx.shadowBlur = c.size * .08;
    const darkScene=scenes.some(s=>['lightning','rain','rainbow','fire','moon'].includes(s.entry.behavior)&&sceneOpacity(s)>.45);
    ctx.fillStyle = darkScene?`rgba(255,249,230,${c.alpha*.96})`:`rgba(28,48,56,${c.alpha * .87})`; ctx.fillText(c.glyph, 0, 0);
    ctx.lineWidth = Math.max(1, c.size * .012); ctx.strokeStyle = `rgba(255,255,249,${c.alpha * .2})`; ctx.strokeText(c.glyph, 1, 1);
    ctx.restore();
  }

  function sceneOpacity(scene) {
    if (scene.life < 0) return 0;
    const smooth = value => value * value * (3 - 2 * value);
    const enter = smooth(clamp(scene.life / (scene.enterDuration || 2.2), 0, 1));
    const exit = smooth(clamp((scene.max - scene.life) / (scene.exitDuration || 2.2), 0, 1));
    return Math.min(enter, exit);
  }

  function frame(now) {
    const elapsed = Math.max(0, (now - last) / 1000);
    const dt = Math.min(elapsed, .04); last = now;
    ctx.clearRect(0, 0, w, h);
    scenes.forEach(s => {
      s.life += elapsed; const fade = sceneOpacity(s);
      if (s.life < 0 || fade <= 0) return;
      window.TenzerRenderBudget.draw(ctx, s, fade, w, h, reduced);
    });
    resolveCharacterSpacing();
    characters.forEach(c => drawCharacter(c, dt));
    ripples.forEach(r => {
      r.r += dt * 74; r.alpha -= dt * .15;
      ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2); ctx.lineWidth = 1.4; ctx.strokeStyle = `hsla(${r.hue},55%,52%,${Math.max(0,r.alpha)})`; ctx.stroke();
    });
    for (let i = characters.length - 1; i >= 0; i--) if (characters[i].state === 'gone') characters.splice(i, 1);
    for (let i = ripples.length - 1; i >= 0; i--) if (ripples[i].alpha <= 0) ripples.splice(i, 1);
    for (let i = scenes.length - 1; i >= 0; i--) if (scenes[i].life > scenes[i].max) scenes.splice(i, 1);
    requestAnimationFrame(frame);
  }

  async function loadKanjiFonts() {
    if (!document.fonts) return;
    await window.tenzerFontsReady;
    await Promise.race([
      document.fonts.load('400 120px "uddigikyokasho-pro"', entries.map(e=>e.glyph||'').join('')),
      new Promise(resolve=>setTimeout(resolve,3000))
    ]);
  }

  async function start() {
    if (started || !ready) return; started = true; intro.classList.add('hidden');
    const initialCount = clamp(Math.round(w / 1600) + 2, 3, 7);
    for (let i = 0; i < initialCount; i++) {
      spawnCharacter(h * (.1 + (i / Math.max(1, initialCount - 1)) * .78));
    }
  }

  async function initialize() {
    const status=document.querySelector('#dataset-status');
    begin.disabled=true;begin.textContent='Loading artwork…';
    try {
      const dataset=await window.TenzerConfig.load(new URLSearchParams(location.search).get('dataset') || 'config.json');
      document.title=dataset.title;document.body.style.background=dataset.background;
      const results=await Promise.allSettled(dataset.entries.map(window.TenzerScenes.prepare));
      entries=results.filter(r=>r.status==='fulfilled').map(r=>r.value);
      const missing=results.map((r,i)=>r.status==='rejected'?dataset.entries[i].meaning:null).filter(Boolean);
      if(!entries.length)throw Error('No artwork could be loaded. Check the asset paths and connection.');
      spawnCounts=entries.map(()=>0);
      await loadKanjiFonts().catch(()=>{});
      status.textContent=missing.length?'Unavailable artwork: '+missing.join(', ')+'. Other characters are ready.':'';
      ready=true;begin.disabled=false;begin.textContent='Begin';
    } catch(error) {
      status.textContent='Unable to start: '+error.message;
      begin.textContent='Artwork unavailable';
    }
  }

  function bindWallInput() {
    if (window.Hammer) {
      const manager = new Hammer.Manager(canvas, {
        touchAction: 'none',
        inputClass: window.PointerEvent ? Hammer.PointerEventInput : undefined
      });
      const tap = new Hammer.Tap({
        event: 'walltap', pointers: 1, taps: 1,
        time: 520, threshold: 30, posThreshold: 44
      });
      const press = new Hammer.Press({
        event: 'wallpress', pointers: 1,
        time: 330, threshold: 34
      });
      manager.add([tap, press]);

      let lastActivation = -Infinity;
      manager.on('walltap wallpress', event => {
        const now = performance.now();
        // Some infrared frames can satisfy both recognizers. Treat them as one
        // intentional selection rather than opening the same scene twice.
        if (now - lastActivation < 220) return;
        lastActivation = now;
        if (!started) start();
        interact(event.center.x, event.center.y);
      });
      return;
    }

    // The artwork remains usable if the gesture library cannot be loaded.
    canvas.addEventListener('pointerup', event => {
      if (event.button !== 0) return;
      if (!started) start();
      interact(event.clientX, event.clientY);
    });
  }

  addEventListener('resize', resize); resize(); requestAnimationFrame(frame);
  begin.addEventListener('click', start);
  soundButton.addEventListener('click', toggleSound);
  bindWallInput();
  initialize();
  addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!started) start(); else { const c = characters.find(c => c.state === 'falling'); if (c) burst(c); } } });
})();
