document.addEventListener('DOMContentLoaded', function() {

  /* ---------- Navbar scroll + mobile toggle ---------- */
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', function() {
    if (navbar) {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    }
  });

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function() {
      navLinks.classList.toggle('active');
      const isActive = navLinks.classList.contains('active');
      navToggle.setAttribute('aria-expanded', isActive);
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    window.addEventListener('click', function(e) {
      if (navLinks && navLinks.classList.contains('active') && !e.target.closest('.navbar')) {
        navLinks.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- Music toggle ---------- */
  const musicToggle = document.getElementById('musicToggle');
  let audioCtx = null;
  let isPlaying = false;

  if (musicToggle) {
    musicToggle.addEventListener('click', function() {
      isPlaying = !isPlaying;
      musicToggle.setAttribute('aria-toggle', isPlaying ? 'on' : 'off');
      musicToggle.textContent = isPlaying ? '🎶' : '🎵';

      if (isPlaying) {
        startAmbientAudio();
      } else {
        stopAmbientAudio();
      }
    });
  }

  function startAmbientAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const master = audioCtx.createGain();
    master.gain.value = 0.06;
    master.connect(audioCtx.destination);

    const notes = [261.63, 329.63, 392.00, 523.25];
    const oscillators = notes.map(freq => {
      const osc = audioCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const gain = audioCtx.createGain();
      gain.gain.value = 0.15;
      osc.connect(gain);
      gain.connect(master);
      osc.start();
      return osc;
    });

    const lfo = audioCtx.createOscillator();
    lfo.frequency.value = 0.08;
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.value = 0.02;
    lfo.connect(lfoGain);
    oscillators.forEach(osc => {
      lfoGain.connect(osc.frequency);
    });
    lfo.start();

    window._audioNodes = { master, oscillators, lfo, lfoGain };
  }

  function stopAmbientAudio() {
    if (!audioCtx) return;
    const nodes = window._audioNodes;
    if (nodes) {
      nodes.oscillators.forEach(o => o.stop());
      nodes.lfo.stop();
      nodes.master.gain.setTargetAtTime(0, audioCtx.currentTime, 0.1);
    }
    setTimeout(() => {
      try { audioCtx.close(); } catch (e) {}
      audioCtx = null;
      window._audioNodes = null;
    }, 300);
  }

  /* ---------- Countdown (index.html) ---------- */
  const countdownEl = document.getElementById('countdown');
  if (countdownEl) {
    const targetDate = new Date(new Date().getFullYear(), 10, 25);

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minsEl = document.getElementById('minutes');
    const secsEl = document.getElementById('seconds');

    function update() {
      const now = new Date();
      let diff = targetDate - now;
      if (diff < 0) diff = 0;

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);

      if (daysEl) daysEl.textContent = String(d).padStart(2, '0');
      if (hoursEl) hoursEl.textContent = String(h).padStart(2, '0');
      if (minsEl) minsEl.textContent = String(m).padStart(2, '0');
      if (secsEl) secsEl.textContent = String(s).padStart(2, '0');
      if (diff <= 0) {
        document.getElementById('coverPage').classList.add('hidden');
      }
    }
    update();
    setInterval(update, 1000);
  }

/* ---------- Floating balloons (index.html) ---------- */
  const balloonsContainer = document.getElementById('balloons');
  if (balloonsContainer) {
    const colors = ['#ff4d6d', '#ff8fab', '#ffd700', '#ff9a9e', '#e91e63', '#fad0c4'];
    for (let i = 0; i < 18; i++) {
      const b = document.createElement('div');
      b.className = 'balloon';
      b.style.left = Math.random() * 100 + 'vw';
      b.style.background = colors[Math.floor(Math.random() * colors.length)];
      b.style.animationDuration = (Math.random() * 6 + 8) + 's';
      b.style.animationDelay = (Math.random() * 5) + 's';
      b.style.opacity = Math.random() * 0.6 + 0.3;
      b.style.transform = `scale(${Math.random() * 0.8 + 0.6})`;
      balloonsContainer.appendChild(b);
    }
  }
});

