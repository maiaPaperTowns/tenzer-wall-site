(() => {
  const canvas = document.querySelector('#art');
  const ctx = canvas.getContext('2d', { alpha: true });
  const intro = document.querySelector('#intro');
  const begin = document.querySelector('#begin');
  const hint = document.querySelector('#hint');
  const soundButton = document.querySelector('#sound');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const KANJI = [
    { glyph: '花', meaning: 'flower', hue: 340 },
    { glyph: '日', meaning: 'sun', hue: 42 },
    { glyph: '虹', meaning: 'rainbow', hue: 205 },
    { glyph: '雨', meaning: 'rain', hue: 211 },
    { glyph: '鳥', meaning: 'bird', hue: 198 },
    { glyph: '山', meaning: 'mountain', hue: 176 },
    { glyph: '雷', meaning: 'thunder', hue: 224 }
  ];
  let w = 0, h = 0, dpr = 1, last = performance.now(), started = false, lastBirdType = -1;
  let audio, wind;
  const characters = [], particles = [], ripples = [], scenes = [];
  const spawnCounts = KANJI.map(() => 0);
  const blossomSprites = ['cluster', 'spray', 'bough'].map(name => {
    const image = new Image(); image.src = `assets/cherry-blossom-${name}.png`; return image;
  });
  const flowerHeads = new Image(); flowerHeads.src = 'assets/cherry-blossom-heads.png';
  const sunPainting = new Image(); sunPainting.src = 'assets/golden-sun-clouds.png';
  const sunCurrents = new Image(); sunCurrents.src = 'assets/sun-golden-currents.png';
  const rainbowMountains = new Image(); rainbowMountains.src = 'assets/rainbow-mountains-clean.png';
  const rainbowArc = new Image(); rainbowArc.src = 'assets/rainbow-arc-cutout.png';
  const rainPainting = new Image(); rainPainting.src = 'assets/rain-ink-village.png';
  const birdSpecies = new Image(); birdSpecies.src = 'assets/painted-bird-species.png';
  const mountainLayers = new Image(); mountainLayers.src = 'assets/mountain-layers.png';
  const thunderPainting = new Image(); thunderPainting.src = 'assets/thunder-storm-clouds.png';
  const preparedMountainLayers = [];
  const preparedRainbowMountains = [];
  let preparedSunArt = null;

  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  function prepareMountains() {
    if (!mountainLayers.width || preparedMountainLayers.length) return;
    const rows = 5, sourceH = mountainLayers.height / rows;
    for (let i = 0; i < rows; i++) {
      const image = document.createElement('canvas'); image.width = mountainLayers.width; image.height = Math.ceil(sourceH);
      const imageCtx = image.getContext('2d');
      imageCtx.drawImage(mountainLayers, 0, i * sourceH, mountainLayers.width, sourceH, 0, 0, image.width, image.height);
      imageCtx.globalCompositeOperation = 'destination-in';
      const feather = imageCtx.createLinearGradient(0, 0, 0, image.height);
      feather.addColorStop(0, 'rgba(0,0,0,0)'); feather.addColorStop(.08, '#000');
      feather.addColorStop(.9, '#000'); feather.addColorStop(1, 'rgba(0,0,0,0)');
      imageCtx.fillStyle = feather; imageCtx.fillRect(0, 0, image.width, image.height);
      preparedMountainLayers.push(image);
    }
  }

  function prepareSunArt() {
    if (!sunPainting.width || preparedSunArt) return;
    preparedSunArt = document.createElement('canvas');
    preparedSunArt.width = sunPainting.width; preparedSunArt.height = sunPainting.height;
    const sunCtx = preparedSunArt.getContext('2d');
    sunCtx.drawImage(sunPainting, 0, 0);
    const pixels = sunCtx.getImageData(0, 0, preparedSunArt.width, preparedSunArt.height);
    for (let i = 0; i < pixels.data.length; i += 4) {
      const luminance = (pixels.data[i]*.28 + pixels.data[i+1]*.58 + pixels.data[i+2]*.14)/255;
      const keep = clamp((luminance-.025)/.24, 0, 1);
      pixels.data[i+3] = Math.round(pixels.data[i+3]*keep);
    }
    sunCtx.putImageData(pixels, 0, 0);
  }

  function prepareRainbowMountains() {
    if (!rainbowMountains.width || preparedRainbowMountains.length) return;
    const shapes = [
      [[0,.08],[.25,.1],[.39,.58],[.46,1],[0,1]],
      [[.1,.24],[.48,.2],[.58,.67],[.47,.91],[.08,.84]],
      [[.27,.12],[.73,.1],[.73,.65],[.31,.72]],
      [[.52,.2],[.88,.08],[.97,.7],[.7,.91],[.52,.65]],
      [[.71,.07],[1,.03],[1,1],[.64,1],[.68,.58]]
    ];
    shapes.forEach(points => {
      const layer = document.createElement('canvas');
      layer.width = rainbowMountains.width; layer.height = rainbowMountains.height;
      const layerCtx = layer.getContext('2d');
      layerCtx.drawImage(rainbowMountains, 0, 0);
      const mask = document.createElement('canvas');
      mask.width = layer.width; mask.height = layer.height;
      const maskCtx = mask.getContext('2d');
      maskCtx.filter = `blur(${Math.max(18, layer.width * .018)}px)`;
      maskCtx.beginPath();
      points.forEach(([x,y], index) => (index ? maskCtx.lineTo(x*layer.width,y*layer.height) : maskCtx.moveTo(x*layer.width,y*layer.height)));
      maskCtx.closePath(); maskCtx.fillStyle = '#000'; maskCtx.fill();
      layerCtx.globalCompositeOperation = 'destination-in';
      layerCtx.drawImage(mask, 0, 0);
      preparedRainbowMountains.push(layer);
    });
  }

  mountainLayers.addEventListener('load', prepareMountains);
  sunPainting.addEventListener('load', prepareSunArt);
  rainbowMountains.addEventListener('load', prepareRainbowMountains);
  if (mountainLayers.complete) prepareMountains();
  if (sunPainting.complete) prepareSunArt();
  if (rainbowMountains.complete) prepareRainbowMountains();

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = innerWidth; h = innerHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawnCharacter(startY = null) {
    const activeCounts = KANJI.map(type => characters.filter(c => c.state === 'falling' && c.meaning === type.meaning).length);
    const lowestActive = Math.min(...activeCounts);
    const candidates = KANJI.map((type, index) => ({ type, index }))
      .filter(({ index }) => activeCounts[index] === lowestActive)
      .sort((a, b) => spawnCounts[a.index] - spawnCounts[b.index]);
    const { type, index:typeIndex } = candidates[0];
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
    ripples.push({ x: c.x, y: c.y, r: c.size * .38, alpha: .62, hue: c.hue });
    particles.forEach(particle => {
      if (particle.fadeAt == null) particle.fadeAt = particle.life;
    });
    let birdType = -1;
    if (c.meaning === 'bird') {
      birdType = (lastBirdType + 1 + Math.floor(Math.random() * 5)) % 6;
      lastBirdType = birdType;
    }
    const activeScenes = scenes.filter(scene => scene.life >= 0 && scene.life < scene.max);
    const currentScene = activeScenes[activeScenes.length - 1];
    const crossfadeTime = 2.2;
    activeScenes.slice(0, -1).forEach(scene => { scene.max = scene.life; });
    if (currentScene) {
      // Begin both sides of the transition immediately: the previous scene
      // fades out while the selected scene fades in on the same frame.
      currentScene.max = Math.min(currentScene.max, currentScene.life + crossfadeTime);
    }
    scenes.push({
      kind: c.meaning, x: c.x, y: c.y,
      life: 0, max: c.meaning === 'flower' ? 16 : c.meaning === 'sun' ? 13 : 15,
      hue: c.hue, birdType
    });
    const count = reduced ? 18 : c.meaning === 'flower' ? 72 : 54;
    for (let i = 0; i < count; i++) {
      const a = rand(0, Math.PI * 2), speed = rand(c.size * .18, c.size * .82);
      const isRainbow = c.meaning === 'rainbow';
      const isMountain = c.meaning === 'mountain';
      const isThunder = c.meaning === 'thunder';
      particles.push({
        kind: c.meaning === 'flower' ? 'petal' : isRainbow ? 'prism' : c.meaning === 'rain' ? 'drop' : c.meaning === 'bird' ? 'feather' : isMountain ? 'mist' : isThunder ? 'spark' : 'ray',
        x: isRainbow || c.meaning === 'rain' ? rand(0, w) : c.x,
        y: isRainbow || c.meaning === 'rain' ? rand(-h * .18, -6) : c.y,
        vx: isRainbow ? rand(-12, 12) : c.meaning === 'rain' ? rand(-28, -10) : Math.cos(a) * speed,
        vy: isRainbow ? rand(h * .18, h * .42) : c.meaning === 'rain' ? rand(h * .55, h * 1.05) : Math.sin(a) * speed - (c.meaning === 'flower' ? rand(4, 24) : 0),
        size: rand(c.size * .035, c.size * .095), hue: c.meaning === 'rainbow' ? (i * 47 + rand(-8, 8)) % 360 : c.hue + rand(-10, 12),
        alpha: rand(.62, .96), life: 0, max: rand(3.8, 7), spin: rand(-2, 2), rotation: rand(0, 6)
      });
    }
    if (c.meaning === 'flower') {
      const clusters = reduced ? 4 : clamp(Math.round(w / 360), 5, 9);
      for (let i = 0; i < clusters; i++) {
        const progress = clusters <= 1 ? 0 : i / (clusters - 1);
        const angle = i * 2.39996 + rand(-.22, .22);
        const radius = Math.sqrt(progress) * Math.hypot(w, h) * .58;
        particles.push({
          kind: 'bloom',
          x: clamp(c.x + Math.cos(angle) * radius, -w * .04, w * 1.04),
          y: clamp(c.y + Math.sin(angle) * radius, -h * .05, h * 1.05),
          vx: rand(-2, 2), vy: rand(-4, 2), size: rand(Math.min(w,h) * .14, Math.min(w,h) * .31),
          sprite: i % blossomSprites.length,
          hue: 340, alpha: rand(.5,.82), life: -progress * rand(2.2, 3.4), max: rand(12, 16), spin: rand(-.02,.02), rotation: rand(-.5,.5)
        });
      }
      const flowers = reduced ? 30 : clamp(Math.round((w*h)/9500), 90, 180);
      for (let i = 0; i < flowers; i++) {
        const progress = i / Math.max(1, flowers - 1), angle = i * 2.39996 + rand(-.35,.35);
        const radius = Math.sqrt(progress) * Math.hypot(w,h) * .6;
        particles.push({ kind:'flowerHead', x:clamp(c.x+Math.cos(angle)*radius,18,w-18), y:clamp(c.y+Math.sin(angle)*radius,18,h-18), vx:rand(-1,1), vy:rand(-2,1), size:rand(22,Math.min(w,h)*.075), sprite:i%9, hue:340, alpha:rand(.55,.88), life:-progress*3.4-rand(0,.35), max:rand(12,16), spin:rand(-.08,.08), rotation:rand(-Math.PI,Math.PI) });
      }
      for (let i = 0; i < (reduced ? 28 : 140); i++) {
        const a = rand(0, Math.PI * 2), speed = rand(Math.min(w,h)*.08, Math.min(w,h)*.32);
        particles.push({ kind: 'petal', x: c.x, y: c.y, vx: Math.cos(a)*speed + w*.025, vy: Math.sin(a)*speed*.62 - 12, size: rand(5,15), hue: rand(330,350), alpha: rand(.45,.9), life: -(i/95)*1.4, max: rand(6,10), spin: rand(-3,3), rotation: rand(0,6) });
      }
    }
    if (audio) chime(c.meaning === 'flower' ? 523.25 : c.meaning === 'rainbow' ? 659.25 : c.meaning === 'rain' ? 440 : c.meaning === 'bird' ? 783.99 : c.meaning === 'mountain' ? 329.63 : c.meaning === 'thunder' ? 196 : 392);
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
      soundButton.textContent = 'Sound on'; soundButton.setAttribute('aria-pressed', 'true');
    } else {
      const on = audio.state === 'running'; (on ? audio.suspend() : audio.resume());
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
    ctx.font = `400 ${c.size}px "Aoyagi Kouzan", KaiTi, STKaiti, "Yu Mincho", serif`;
    ctx.shadowColor = 'rgba(225,239,240,.45)'; ctx.shadowBlur = c.size * .08;
    ctx.fillStyle = `rgba(28,48,56,${c.alpha * .87})`; ctx.fillText(c.glyph, 0, 0);
    ctx.lineWidth = Math.max(1, c.size * .012); ctx.strokeStyle = `rgba(255,255,249,${c.alpha * .2})`; ctx.strokeText(c.glyph, 1, 1);
    ctx.restore();
  }

  function drawParticle(p, dt) {
    p.life += dt; p.vx *= Math.pow(.985, dt * 60); p.vy += (p.kind === 'petal' ? 13 : 1.5) * dt;
    if (p.life < 0) return;
    p.x += p.vx * dt; p.y += p.vy * dt; p.rotation += p.spin * dt;
    const naturalFade = Math.max(0, 1 - p.life / p.max);
    const transitionFade = p.fadeAt == null ? 1 : clamp(1 - (p.life - p.fadeAt) / 2.2, 0, 1);
    const alpha = p.alpha * naturalFade * transitionFade;
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rotation);
    if (p.kind === 'flowerHead') {
      const open = 1 - Math.pow(1-clamp(p.life*.7,0,1),3), cell = flowerHeads.width/3;
      ctx.scale(open,open); ctx.globalAlpha=alpha*open; ctx.rotate(Math.sin(p.life*.7)*.03);
      if (flowerHeads.complete && flowerHeads.width) ctx.drawImage(flowerHeads,(p.sprite%3)*cell,Math.floor(p.sprite/3)*cell,cell,cell,-p.size,-p.size,p.size*2,p.size*2);
    } else if (p.kind === 'bloom') {
      const open = 1 - Math.pow(1 - clamp(p.life * .42, 0, 1), 3);
      ctx.scale(.72 + open * .28, .72 + open * .28); ctx.globalAlpha = alpha * open;
      ctx.shadowColor = 'rgba(190,91,125,.18)'; ctx.shadowBlur = p.size * .12;
      const sprite = blossomSprites[p.sprite || 0];
      ctx.beginPath(); ctx.arc(0, 0, p.size * 1.42 * open, 0, Math.PI * 2); ctx.clip();
      if (sprite.complete) ctx.drawImage(sprite, -p.size, -p.size, p.size * 2, p.size * 2);
    } else if (p.kind === 'petal') {
      ctx.scale(1, .62); ctx.beginPath(); ctx.moveTo(0, -p.size); ctx.bezierCurveTo(p.size, -p.size*.4, p.size*.8, p.size*.8, 0, p.size); ctx.bezierCurveTo(-p.size*.8, p.size*.8, -p.size, -p.size*.4, 0, -p.size); ctx.fillStyle = `hsla(${p.hue},55%,72%,${alpha})`; ctx.fill();
    } else if (p.kind === 'prism') {
      ctx.globalCompositeOperation = 'screen';
      ctx.scale(1.8, .7); ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue},72%,78%,${alpha * .65})`; ctx.fill();
    } else if (p.kind === 'drop') {
      ctx.strokeStyle = `rgba(218,236,248,${alpha * .72})`;
      ctx.lineWidth = Math.max(.7, p.size * .13); ctx.beginPath();
      ctx.moveTo(0, -p.size * 2.6); ctx.lineTo(0, p.size * 2.6); ctx.stroke();
    } else if (p.kind === 'feather') {
      ctx.scale(1, .45); ctx.beginPath(); ctx.ellipse(0, 0, p.size * 1.7, p.size, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(72,108,120,${alpha * .42})`; ctx.fill();
    } else if (p.kind === 'mist') {
      ctx.scale(2.8, .75); ctx.beginPath(); ctx.arc(0, 0, p.size * 1.8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(188,220,214,${alpha * .2})`; ctx.fill();
    } else {
      const length = p.size * 4.5; const glow = ctx.createLinearGradient(0, 0, length, 0); glow.addColorStop(0, `hsla(${p.hue},90%,72%,${alpha})`); glow.addColorStop(1, `hsla(${p.hue},95%,85%,0)`); ctx.fillStyle = glow; ctx.fillRect(0, -p.size*.12, length, p.size*.24);
    }
    ctx.restore();
  }

  function drawSunStrokes(scene, fade, warmth) {
    if (!sunCurrents.complete || !sunCurrents.width) return;
    const progress = 1 - Math.pow(1 - clamp((scene.life - 1.65) / 1.8, 0, 1), 3);
    if (!progress) return;
    ctx.save();
    ctx.translate(w * .5, h * .5);
    ctx.rotate(Math.sin(scene.life * .22) * .012);
    const currentScale = 1.08 - progress * .08;
    ctx.scale(currentScale, currentScale);
    ctx.globalAlpha = fade * warmth * progress * .58;
    ctx.drawImage(sunCurrents, -w * .58, -h * .58, w * 1.16, h * 1.16);
    ctx.restore();
  }

  function drawSunClouds(scene, fade) {
    if (!preparedSunArt) return;
    const size = Math.min(w * .82, h * 1.08);
    const sunIn = 1 - Math.pow(1 - clamp(scene.life / 2.25, 0, 1), 3);
    const settle = 1 + (1-sunIn)*.3;
    const breathe = 1 + Math.sin(scene.life*.55)*.006*sunIn;
    ctx.save();
    ctx.translate(w * .5, h * .47);
    ctx.scale(settle*breathe, settle*breathe);
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = fade * sunIn * .86;
    ctx.shadowColor = `rgba(255,205,92,${fade*sunIn*.7})`;
    ctx.shadowBlur = size*.09;
    ctx.drawImage(preparedSunArt, -size*.67, -size*.42, size*1.34, size*.84);
    ctx.restore();
  }

  function seeded(seed) {
    const value = Math.sin(seed * 91.733) * 43758.5453;
    return value - Math.floor(value);
  }

  function sceneOpacity(scene) {
    if (scene.life < 0) return 0;
    const smooth = value => value * value * (3 - 2 * value);
    const enter = smooth(clamp(scene.life / 2.2, 0, 1));
    const exit = smooth(clamp((scene.max - scene.life) / 2.2, 0, 1));
    return Math.min(enter, exit);
  }

  function drawLightningBolt(seed, intensity) {
    const points = [{ x: w * (.28 + seeded(seed) * .44), y: -12 }];
    const segments = 13;
    for (let i = 1; i <= segments; i++) {
      const previous = points[i-1];
      points.push({
        x: clamp(previous.x + (seeded(seed + i * 2.7) - .5) * w * .16, w * .08, w * .92),
        y: i * h / segments
      });
    }
    const stroke = (lineWidth, color, blur) => {
      ctx.beginPath(); ctx.moveTo(points[0].x, points[0].y);
      points.slice(1).forEach(point => ctx.lineTo(point.x, point.y));
      ctx.strokeStyle = color; ctx.lineWidth = lineWidth; ctx.shadowColor = 'rgba(190,220,255,.95)'; ctx.shadowBlur = blur; ctx.stroke();
    };
    ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    stroke(7 * intensity, `rgba(174,205,255,${.32*intensity})`, 26);
    stroke(2.2 * intensity, `rgba(255,255,246,${.98*intensity})`, 10);
    [4,7,9].forEach((at, branchIndex) => {
      const origin = points[at], direction = seeded(seed + branchIndex * 11) > .5 ? 1 : -1;
      ctx.beginPath(); ctx.moveTo(origin.x, origin.y);
      for (let step = 1; step <= 4; step++) {
        ctx.lineTo(origin.x + direction * step * w * (.035 + seeded(seed+step+branchIndex)*.025), origin.y + step * h * .045);
      }
      ctx.strokeStyle = `rgba(239,247,255,${.78*intensity})`; ctx.lineWidth = 1.25 * intensity; ctx.shadowBlur = 8; ctx.stroke();
    });
    ctx.restore();
  }

  function frame(now) {
    const dt = Math.min((now - last) / 1000, .04); last = now;
    ctx.clearRect(0, 0, w, h);
    scenes.forEach(s => {
      s.life += dt; const fade = sceneOpacity(s);
      if (s.life < 0) return;
      if (s.kind === 'thunder') {
        if (!thunderPainting.complete || !thunderPainting.width) return;
        const imageRatio = thunderPainting.width / thunderPainting.height, screenRatio = w / h;
        const drawW = screenRatio > imageRatio ? w : h * imageRatio;
        const drawH = screenRatio > imageRatio ? w / imageRatio : h;
        const reveal = 1 - Math.pow(1 - clamp(s.life / 1.8, 0, 1), 3);
        ctx.save(); ctx.globalAlpha = fade * reveal * .94;
        ctx.drawImage(thunderPainting, (w-drawW)/2, (h-drawH)/2, drawW, drawH); ctx.restore();
        const cycle = Math.floor(s.life / 1.65), local = s.life % 1.65;
        const primary = clamp(1 - local / .13, 0, 1);
        const echo = local > .2 ? clamp(1 - (local-.2)/.1, 0, 1) * .55 : 0;
        const intensity = Math.max(primary, echo) * fade * reveal;
        if (intensity > .02) {
          ctx.save(); ctx.globalCompositeOperation = 'screen';
          ctx.fillStyle = `rgba(206,221,255,${intensity*.18})`; ctx.fillRect(0,0,w,h);
          drawLightningBolt(cycle + 31, intensity); ctx.restore();
        }
      } else if (s.kind === 'rainbow') {
        if (!rainbowMountains.complete || !rainbowMountains.width || !rainbowArc.complete || !rainbowArc.width) return;
        const reveal = 1-Math.pow(1-clamp(s.life/1.5,0,1),3);
        const backgroundRatio = rainbowMountains.width/rainbowMountains.height;
        const screenRatio = w/h;
        const backgroundW = screenRatio>backgroundRatio ? w : h*backgroundRatio;
        const backgroundH = screenRatio>backgroundRatio ? w/backgroundRatio : h;
        const backgroundX=(w-backgroundW)*.5, backgroundY=(h-backgroundH)*.5;
        ctx.save(); ctx.globalAlpha=fade*reveal*.24;
        ctx.drawImage(rainbowMountains,backgroundX,backgroundY,backgroundW,backgroundH); ctx.restore();
        preparedRainbowMountains.forEach((layer,index)=>{
          const delay=.18+index*.28;
          const rise=1-Math.pow(1-clamp((s.life-delay)/1.35,0,1),3);
          if(!rise)return;
          ctx.save();
          ctx.globalAlpha=fade*rise*.9;
          ctx.translate(0,(1-rise)*h*.055);
          ctx.drawImage(layer,backgroundX,backgroundY,backgroundW,backgroundH);
          ctx.restore();
        });
        const rainbowProgress=1-Math.pow(1-clamp((s.life-.55)/3.8,0,1),3);
        if(rainbowProgress>0){
          const boundary=h*clamp(rainbowProgress*1.08,0,1);
          const feather=h*.055;
          ctx.save();
          ctx.translate(0,(1-rainbowProgress)*-h*.035);
          [[feather*1.5,.14],[feather*.75,.24],[0,.66]].forEach(([extra,alpha])=>{
            ctx.save(); ctx.beginPath(); ctx.rect(0,0,w,boundary+extra); ctx.clip();
            ctx.globalAlpha=fade*alpha;
            ctx.drawImage(rainbowArc,backgroundX,backgroundY,backgroundW,backgroundH);
            ctx.restore();
          });
          ctx.restore();
        }
      } else if (s.kind === 'mountain') {
        if (!preparedMountainLayers.length) return;
        const rows = preparedMountainLayers.length;
        const layerY = [.1, .2, .31, .43, .54];
        ctx.save();
        const mist = ctx.createLinearGradient(0, 0, 0, h);
        mist.addColorStop(0, `rgba(220,236,235,${fade * .18})`);
        mist.addColorStop(.62, `rgba(206,231,225,${fade * .12})`);
        mist.addColorStop(1, 'rgba(192,220,215,0)');
        ctx.fillStyle = mist; ctx.fillRect(0, 0, w, h); ctx.restore();
        for (let i = 0; i < rows; i++) {
          const delay = .35 + i * .55;
          const rise = 1 - Math.pow(1 - clamp((s.life - delay) / 1.8, 0, 1), 3);
          if (!rise) continue;
          const depth = .72 + i * .09;
          const destW = w * (1.04 + i * .025);
          const destH = h * (.29 + i * .025);
          const destX = (w - destW) * .5 + Math.sin(s.life * .13 + i) * w * .006;
          const destY = h * layerY[i] + (1 - rise) * h * .1;
          ctx.save(); ctx.globalAlpha = fade * rise * (.38 + depth * .48);
          ctx.drawImage(preparedMountainLayers[i], destX, destY, destW, destH);
          ctx.restore();
        }
      } else if (s.kind === 'bird') {
        if (!birdSpecies.complete || !birdSpecies.width) return;
        const cols = 3, rows = 2;
        const cellW = birdSpecies.width / cols, cellH = birdSpecies.height / rows;
        const sx = (s.birdType % cols) * cellW, sy = Math.floor(s.birdType / cols) * cellH;
        const flock = reduced ? 4 : 9;
        for (let i = 0; i < flock; i++) {
          const delay = i * .23;
          const flight = clamp((s.life - delay) / 8.6, 0, 1);
          if (!flight || flight >= 1) continue;
          const depth = .68 + (i % 4) * .1;
          const x = -w * .14 + flight * w * 1.3;
          const lane = .2 + (i % 3) * .2;
          const y = h * lane + Math.sin(flight * Math.PI * 3 + i * 1.7) * h * .045;
          const size = Math.min(w, h) * (.105 + (i % 3) * .018) * depth;
          const flap = Math.sin(s.life * 7.5 + i * 1.3);
          ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(flight * 8 + i) * .035);
          ctx.scale(1, .91 + flap * .09); ctx.globalAlpha = fade * clamp((s.life - delay) * 2, 0, 1) * (.58 + depth * .32);
          ctx.drawImage(birdSpecies, sx, sy, cellW, cellH, -size * .75, -size * .5, size * 1.5, size);
          ctx.restore();
        }
      } else if (s.kind === 'rain') {
        if (!rainPainting.complete || !rainPainting.width) return;
        const reveal = 1 - Math.pow(1 - clamp(s.life / 2.2, 0, 1), 3);
        const imageRatio = rainPainting.width / rainPainting.height;
        const screenRatio = w / h;
        const drawW = screenRatio > imageRatio ? w : h * imageRatio;
        const drawH = screenRatio > imageRatio ? w / imageRatio : h;
        ctx.save(); ctx.globalAlpha = fade * reveal * .56;
        ctx.drawImage(rainPainting, (w - drawW) * .5, (h - drawH) * .5, drawW, drawH); ctx.restore();
        ctx.save();
        const rainAtmosphere = ctx.createLinearGradient(0, 0, 0, h);
        rainAtmosphere.addColorStop(0, `rgba(85,123,151,${fade*reveal*.2})`);
        rainAtmosphere.addColorStop(.62, `rgba(118,154,176,${fade*reveal*.12})`);
        rainAtmosphere.addColorStop(1, `rgba(206,224,232,${fade*reveal*.08})`);
        ctx.fillStyle = rainAtmosphere; ctx.fillRect(0,0,w,h); ctx.restore();
        ctx.save(); ctx.globalCompositeOperation = 'screen';
        const rainCount = reduced ? 70 : clamp(Math.round(w / 3.7), 220, 460);
        for (let i = 0; i < rainCount; i++) {
          const seed = Math.abs(Math.sin(i * 91.733) * 43758.5453) % 1;
          const seed2 = Math.abs(Math.sin((i + 17) * 47.119) * 24634.6345) % 1;
          const depth = .38 + seed * .92;
          const speed = h * (.58 + seed * .94);
          const wind = h * (.025 + seed2 * .035);
          const x = (seed * w * 1.16 - s.life * wind + w) % (w * 1.16) - w * .08;
          const y = (seed2 * (h + 130) + s.life * speed) % (h + 130) - 65;
          const length = 14 + depth * 66;
          ctx.strokeStyle = `rgba(224,240,250,${fade * reveal * (.16 + depth * .43)})`;
          ctx.lineWidth = .5 + depth * 1.45; ctx.beginPath();
          ctx.moveTo(x + length*.09, y - length); ctx.lineTo(x, y); ctx.stroke();
          if (y > h * .72 && y < h * .77 && seed > .72) {
            ctx.strokeStyle = `rgba(226,242,250,${fade * reveal * .38})`; ctx.lineWidth = .8;
            ctx.beginPath(); ctx.ellipse(x, y, 6 + seed * 13, 1.8 + seed * 2.4, 0, 0, Math.PI * 2); ctx.stroke();
          }
        }
        ctx.restore();
      } else if (s.kind === 'sun') {
        const warmth=1-Math.pow(1-clamp(s.life/4.2,0,1),3);
        const glowX=s.x+(w*.5-s.x)*warmth, glowY=s.y+(h*.47-s.y)*warmth, glowRadius=Math.max(w,h)*(.12+warmth*.98);
        ctx.save(); ctx.globalCompositeOperation='screen';
        const g=ctx.createRadialGradient(glowX,glowY,0,glowX,glowY,glowRadius);
        g.addColorStop(0,`rgba(255,232,133,${fade*.72})`); g.addColorStop(.2,`rgba(255,214,82,${fade*.48})`); g.addColorStop(.52,`rgba(255,193,65,${fade*.24})`); g.addColorStop(.78,`rgba(255,225,151,${fade*.13})`); g.addColorStop(1,'rgba(255,244,205,0)');
        ctx.fillStyle=g; ctx.fillRect(0,0,w,h); ctx.fillStyle=`rgba(255,236,181,${fade*warmth*.1})`; ctx.fillRect(0,0,w,h); ctx.restore();
        drawSunStrokes(s, fade, warmth);
        drawSunClouds(s, fade);
      }
    });
    resolveCharacterSpacing();
    characters.forEach(c => drawCharacter(c, dt));
    particles.forEach(p => drawParticle(p, dt));
    ripples.forEach(r => {
      r.r += dt * 74; r.alpha -= dt * .15;
      ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2); ctx.lineWidth = 1.4; ctx.strokeStyle = `hsla(${r.hue},55%,52%,${Math.max(0,r.alpha)})`; ctx.stroke();
    });
    for (let i = characters.length - 1; i >= 0; i--) if (characters[i].state === 'gone') characters.splice(i, 1);
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i];
      if (particle.life > particle.max || (particle.fadeAt != null && particle.life > particle.fadeAt + 2.2)) particles.splice(i, 1);
    }
    for (let i = ripples.length - 1; i >= 0; i--) if (ripples[i].alpha <= 0) ripples.splice(i, 1);
    for (let i = scenes.length - 1; i >= 0; i--) if (scenes[i].life > scenes[i].max) scenes.splice(i, 1);
    requestAnimationFrame(frame);
  }

  async function loadKanjiFonts() {
    if (!document.fonts) return;
    await document.fonts.load('400 120px "Aoyagi Kouzan"', '花日');
  }

  async function start() {
    if (started) return; started = true; intro.classList.add('hidden');
    await loadKanjiFonts();
    const initialCount = clamp(Math.round(w / 1600) + 2, 3, 7);
    for (let i = 0; i < initialCount; i++) {
      spawnCharacter(h * (.1 + (i / Math.max(1, initialCount - 1)) * .78));
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
      if (!started) start();
      interact(event.clientX, event.clientY);
    });
  }

  addEventListener('resize', resize); resize(); requestAnimationFrame(frame);
  begin.addEventListener('click', start);
  soundButton.addEventListener('click', toggleSound);
  bindWallInput();
  addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!started) start(); else { const c = characters.find(c => c.state === 'falling'); if (c) burst(c); } } });
})();
