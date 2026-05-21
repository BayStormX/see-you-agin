/* ==========================================
   FAREWELL PAGE - script.js
   All interactions, animations, magic ✨
========================================== */

// ====== STATE ======
let currentScreen = 1;
let totalScreens = 9;
let musicPlaying = false;
let starsCaught = 0;
let noBtnClicks = 0;
let gameStarInterval = null;
let noBtnTimeout = null;
let noBtnPos = { x: null, y: null };

// ====== INIT ======
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initStarLayer();
  initCursorSparkle();
  initRippleEffect();
  initJarObserver();
  initNoBtnChaos();
  spawnGameStars();
  initFallingStars();
});

// ====== SCREEN NAVIGATION ======
function goToScreen(num) {
  if (num === currentScreen) return;

  const prev = document.getElementById(`screen-${currentScreen}`);
  const next = document.getElementById(`screen-${num}`);

  if (!prev || !next) return;

  prev.classList.add('exit-up');

  setTimeout(() => {
    prev.classList.remove('active', 'exit-up');
    next.classList.add('active');
    currentScreen = num;
    updateDots();

    // Screen-specific init
    if (num === 4) autoPlayMusic();
    if (num === 5) initJarAnimation();
    if (num === 6) startGameTimeout();
    if (num === 7) triggerPromiseItems();
    if (num === 8) startZingSequence();
    if (num === 9) placeNoBtnInitial();
  }, 350);
}

function updateDots() {
  document.querySelectorAll('.dot').forEach((dot, i) => {
    dot.classList.toggle('active', i + 1 === currentScreen);
  });
}

// ====== PARTICLES BACKGROUND ======
function initParticles() {
  const container = document.getElementById('particles-container');
  const colors = ['#c084fc', '#f0abfc', '#a78bfa', '#f9a8d4', '#5eead4', '#fbbf24'];

  for (let i = 0; i < 35; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 6 + 2;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const duration = Math.random() * 15 + 8;
    const delay = Math.random() * 10;
    const left = Math.random() * 100;

    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${left}%;
      background: ${color};
      animation-duration: ${duration}s;
      animation-delay: -${delay}s;
      filter: blur(${Math.random() > 0.5 ? '1px' : '0px'});
      opacity: 0;
    `;
    container.appendChild(p);
  }
}

// ====== STAR BACKGROUND ======
function initStarLayer() {
  const layer = document.getElementById('stars-layer');

  for (let i = 0; i < 80; i++) {
    const star = document.createElement('div');
    star.className = 'star-dot';
    const size = Math.random() * 2.5 + 0.5;
    const duration = Math.random() * 4 + 2;
    const delay = Math.random() * 5;

    star.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
    `;
    layer.appendChild(star);
  }
}

// ====== FALLING STARS (screen 3) ======
function initFallingStars() {
  setInterval(() => {
    const screen3 = document.getElementById('screen-3');
    const bg = screen3.querySelector('.starfall-bg');
    if (!bg) return;

    const star = document.createElement('div');
    star.className = 'falling-star';
    star.style.left = Math.random() * 100 + '%';
    star.style.animationDuration = (Math.random() * 2 + 1.5) + 's';
    star.style.animationDelay = '0s';
    star.style.opacity = '0';
    bg.appendChild(star);

    setTimeout(() => star.remove(), 4000);
  }, 600);
}

// ====== CURSOR SPARKLE ======
function initCursorSparkle() {
  const canvas = document.getElementById('cursor-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouseX = -100, mouseY = -100;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    for (let i = 0; i < 3; i++) {
      particles.push({
        x: mouseX + (Math.random() - 0.5) * 10,
        y: mouseY + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2 - 1,
        size: Math.random() * 6 + 2,
        life: 1,
        decay: Math.random() * 0.03 + 0.02,
        color: ['#c084fc', '#f0abfc', '#fbbf24', '#f9a8d4', '#5eead4'][Math.floor(Math.random() * 5)],
        emoji: Math.random() > 0.85 ? ['✦', '·', '★', '✿'][Math.floor(Math.random() * 4)] : null
      });
    }
  });

  function drawCursor() {
    // Custom cursor dot
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw cursor
    ctx.save();
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, 8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(192,132,252,0.6)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(240,171,252,0.9)';
    ctx.fill();
    ctx.restore();

    // Draw particles
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05; // gravity
      p.life -= p.decay;

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);

      if (p.emoji) {
        ctx.font = `${p.size * 2}px serif`;
        ctx.fillStyle = p.color;
        ctx.fillText(p.emoji, p.x, p.y);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }

      ctx.restore();
    });

    requestAnimationFrame(drawCursor);
  }

  drawCursor();
}

// ====== RIPPLE ON CLICK ======
function initRippleEffect() {
  document.addEventListener('click', (e) => {
    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    const size = 40;
    ripple.style.cssText = `
      width: ${size}px; height: ${size}px;
      left: ${e.clientX - size / 2}px;
      top: ${e.clientY - size / 2}px;
    `;
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  });
}

// ====== MUSIC - AUTO PLAY everywhere from screen 4 ======
function autoPlayMusic() {
  const audio = document.getElementById('bgMusic');
  if (!audio) return;
  audio.play().catch(() => {});
}

// ====== ZING SEQUENCE (screen 8) ======
function startZingSequence() {
  const lines = ['z1','z2','z3','z4','z5','z6','z7','z8','z9','z10'];
  // reset first
  lines.forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.classList.add('hidden'); el.classList.remove('show'); }
  });
  document.getElementById('nextBtn8')?.classList.add('hidden');

  let delay = 600;
  lines.forEach((id, i) => {
    setTimeout(() => {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.remove('hidden');
      void el.offsetHeight;
      el.classList.add('show');
      // rain tears emoji on climax lines
      if (id === 'z9' || id === 'z10') spawnTearsDrop();
    }, delay);
    delay += i < 5 ? 900 : 1100;
  });

  // show next button after all lines
  setTimeout(() => {
    document.getElementById('nextBtn8')?.classList.remove('hidden');
  }, delay + 400);
}

function spawnTearsDrop() {
  const emojis = ['💧','🥺','😢','✨','🫶'];
  for (let i = 0; i < 6; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      el.style.cssText = `
        position:fixed; pointer-events:none; z-index:50;
        left:${Math.random()*90+5}vw; top:-30px;
        font-size:${Math.random()*14+14}px; opacity:0.85;
        animation: floatParticle ${Math.random()*3+2.5}s linear forwards;
      `;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 6000);
    }, i * 180);
  }
}


let bubblePopped = 0;
const totalBubbles = 6;

function popBubble(el) {
  if (el.classList.contains('popped')) return;
  el.classList.add('popped');
  bubblePopped++;

  // Mini sparkle at card center
  const rect = el.getBoundingClientRect();
  spawnCatchSparkle(rect.left + rect.width / 2, rect.top + rect.height / 2);

  if (bubblePopped >= totalBubbles) {
    const hint = document.getElementById('bubbleHint');
    if (hint) {
      hint.style.opacity = '0';
      setTimeout(() => { hint.textContent = 'เปิดครบแล้ว! 🎉'; hint.style.opacity = '1'; }, 400);
    }
    setTimeout(() => {
      document.getElementById('nextBtn4').classList.remove('hidden');
    }, 600);
  }
}

// ====== JAR ANIMATION ======
function initJarAnimation() {
  const notes = document.querySelectorAll('.memory-note');
  notes.forEach((note, i) => {
    setTimeout(() => {
      note.classList.add('visible');
    }, i * 300 + 200);
  });
}

function initJarObserver() {
  // click jar to shake
  const jar = document.getElementById('memory-jar');
  if (jar) {
    jar.addEventListener('click', () => {
      jar.style.animation = 'none';
      jar.style.transform = 'rotate(-5deg)';
      setTimeout(() => {
        jar.style.transform = 'rotate(5deg)';
      }, 100);
      setTimeout(() => {
        jar.style.transform = 'rotate(-3deg)';
      }, 200);
      setTimeout(() => {
        jar.style.transform = '';
        jar.style.animation = '';
      }, 300);
    });
  }
}

// ====== STAR GAME ======
function spawnGameStars() {
  const area = document.getElementById('gameArea');
  if (!area) return;

  if (gameStarInterval) clearInterval(gameStarInterval);

  gameStarInterval = setInterval(() => {
    if (starsCaught >= 5) {
      clearInterval(gameStarInterval);
      return;
    }

    if (currentScreen !== 6) return;

    const star = document.createElement('div');
    star.className = 'game-star';
    star.textContent = ['⭐', '🌟', '✨', '💫'][Math.floor(Math.random() * 4)];

    const area = document.getElementById('gameArea');
    if (!area) return;

    const maxX = area.clientWidth - 40;
    const maxY = area.clientHeight - 40;
    const startX = Math.random() * maxX;
    const startY = Math.random() * maxY;

    star.style.left = startX + 'px';
    star.style.top = startY + 'px';
    star.style.animationDuration = (Math.random() * 3 + 2) + 's';

    star.addEventListener('click', () => {
      catchStar(star);
    });
    star.addEventListener('touchstart', () => {
      catchStar(star);
    });

    area.appendChild(star);

    // Move star randomly
    const moveInterval = setInterval(() => {
      if (!document.body.contains(star)) {
        clearInterval(moveInterval);
        return;
      }
      const newX = Math.random() * maxX;
      const newY = Math.random() * maxY;
      star.style.transition = 'left 0.8s ease, top 0.8s ease';
      star.style.left = newX + 'px';
      star.style.top = newY + 'px';
    }, 1200);

    // Auto remove after 5s
    setTimeout(() => {
      if (document.body.contains(star)) {
        star.style.opacity = '0';
        star.style.transition = 'opacity 0.3s';
        setTimeout(() => {
          if (document.body.contains(star)) star.remove();
        }, 300);
        clearInterval(moveInterval);
      }
    }, 5000);
  }, 800);
}

function startGameTimeout() {
  starsCaught = 0;
  document.getElementById('starScore').textContent = '0';
  document.getElementById('gameMsg').classList.add('hidden');
  document.getElementById('nextBtn6').classList.add('hidden');

  const area = document.getElementById('gameArea');
  area.innerHTML = '';

  spawnGameStars();
}

function catchStar(starEl) {
  starsCaught++;
  document.getElementById('starScore').textContent = starsCaught;

  // Pop animation
  starEl.style.transform = 'scale(2)';
  starEl.style.opacity = '0';
  starEl.style.transition = 'all 0.3s ease';

  // Sparkle at position
  spawnCatchSparkle(
    starEl.getBoundingClientRect().left + 15,
    starEl.getBoundingClientRect().top + 15
  );

  setTimeout(() => starEl.remove(), 300);

  if (starsCaught >= 5) {
    const area = document.getElementById('gameArea');
    area.innerHTML = '';
    clearInterval(gameStarInterval);

    setTimeout(() => {
      document.getElementById('gameMsg').classList.remove('hidden');
      document.getElementById('nextBtn6').classList.remove('hidden');
    }, 400);
  }
}

function spawnCatchSparkle(x, y) {
  const emojis = ['✨', '🌟', '💫', '⭐'];
  for (let i = 0; i < 5; i++) {
    const s = document.createElement('div');
    s.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    s.style.cssText = `
      position: fixed;
      left: ${x}px; top: ${y}px;
      font-size: 18px;
      pointer-events: none;
      z-index: 999;
      transition: all 0.6s ease;
      opacity: 1;
    `;
    document.body.appendChild(s);
    setTimeout(() => {
      const angle = (Math.random() * Math.PI * 2);
      const dist = Math.random() * 60 + 30;
      s.style.left = (x + Math.cos(angle) * dist) + 'px';
      s.style.top = (y + Math.sin(angle) * dist) + 'px';
      s.style.opacity = '0';
      s.style.transform = 'scale(0.3)';
    }, 20);
    setTimeout(() => s.remove(), 700);
  }
}

// ====== PROMISE ITEMS ======
function triggerPromiseItems() {
  const items = document.querySelectorAll('.promise-item');
  items.forEach(item => {
    item.style.animationName = 'none';
    void item.offsetHeight;
    item.style.animationName = '';
  });
}

// ====== NO BUTTON CHAOS ======
function initNoBtnChaos() {
  placeNoBtnInitial();
}

function placeNoBtnInitial() {
  const noBtn = document.getElementById('noBtn');
  if (!noBtn) return;

  noBtn.style.transition = 'none';
  noBtn.style.position = 'fixed';
  noBtn.style.left = '50%';
  noBtn.style.top = '72%';
  noBtn.style.transform = 'translateX(-50%)';
  noBtn.style.fontSize = '15px';
  noBtn.style.opacity = '1';
  noBtnClicks = 0;

  noBtn.addEventListener('mouseenter', escapeBtnMouse);
  noBtn.addEventListener('touchstart', escapeBtnTouch, { passive: true });
}

function escapeBtnMouse(e) {
  moveNoBtn();
}

function escapeBtnTouch(e) {
  moveNoBtn();
}

function moveNoBtn() {
  const noBtn = document.getElementById('noBtn');
  if (!noBtn) return;

  noBtnClicks++;

  const maxX = window.innerWidth - 130;
  const maxY = window.innerHeight - 60;

  const newX = Math.random() * maxX + 10;
  const newY = Math.random() * maxY + 10;

  // Shrink over time
  const scale = Math.max(0.3, 1 - noBtnClicks * 0.07);
  const opacity = Math.max(0, 1 - noBtnClicks * 0.1);

  noBtn.style.transition = 'left 0.2s ease, top 0.2s ease, font-size 0.3s, opacity 0.3s, transform 0.3s';
  noBtn.style.left = newX + 'px';
  noBtn.style.top = newY + 'px';
  noBtn.style.transform = `scale(${scale})`;
  noBtn.style.fontSize = Math.max(8, 15 - noBtnClicks * 0.8) + 'px';
  noBtn.style.opacity = opacity;
  noBtn.style.padding = `${Math.max(4, 12 - noBtnClicks)}px ${Math.max(8, 24 - noBtnClicks * 2)}px`;

  // Wiggle
  noBtn.style.animation = 'none';
  setTimeout(() => {
    if (noBtnClicks > 5) {
      noBtn.style.animation = 'wobble 0.3s ease';
    }
  }, 100);

  // After enough attempts, disappear
  if (noBtnClicks >= 10) {
    noBtn.style.opacity = '0';
    noBtn.style.pointerEvents = 'none';
    setTimeout(() => {
      noBtn.style.display = 'none';
    }, 500);

    // Show message
    showNoBtnVanishMsg();
  }
}

function showNoBtnVanishMsg() {
  const msg = document.createElement('div');
  msg.style.cssText = `
    position: fixed;
    left: 50%; top: 65%;
    transform: translateX(-50%);
    font-family: 'Caveat', cursive;
    font-size: 22px;
    color: rgba(249,168,212,0.8);
    text-align: center;
    pointer-events: none;
    z-index: 150;
    animation: fadeSlideIn 0.5s ease both;
  `;
  msg.textContent = 'ปุ่มหนีไปแล้ว 🌙';
  document.getElementById('screen-9').appendChild(msg);
}

// ====== ENDING ======
function showEnding() {
  const overlay = document.getElementById('ending-overlay');
  overlay.classList.remove('hidden');

  // Animate emoji
  let emojis = ['🌙', '🌟', '🎉', '💫', '✨', '🎊'];
  let idx = 0;
  const emojiEl = document.getElementById('endEmoji');
  const emojiInterval = setInterval(() => {
    idx++;
    if (idx < emojis.length) {
      emojiEl.textContent = emojis[idx];
    } else {
      clearInterval(emojiInterval);
    }
  }, 200);

  // Confetti
  setTimeout(launchConfetti, 600);
}

function launchConfetti() {
  const area = document.getElementById('confettiArea');
  const colors = ['#c084fc', '#f0abfc', '#fbbf24', '#f9a8d4', '#5eead4', '#a78bfa', '#ffffff'];

  for (let i = 0; i < 40; i++) {
    setTimeout(() => {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = Math.random() * 8 + 6;
      const startX = Math.random() * 400 - 50;
      const duration = Math.random() * 1.5 + 1;

      piece.style.cssText = `
        left: ${startX}px;
        top: 0;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
        animation-duration: ${duration}s;
        animation-delay: ${Math.random() * 0.5}s;
      `;
      area.appendChild(piece);
      setTimeout(() => piece.remove(), duration * 1000 + 600);
    }, i * 50);
  }
}

function restartAll() {
  // Hide overlay
  document.getElementById('ending-overlay').classList.add('hidden');

  // Reset no btn
  const noBtn = document.getElementById('noBtn');
  if (noBtn) {
    noBtn.style.display = '';
    noBtn.style.opacity = '1';
    noBtn.style.pointerEvents = '';
    noBtnClicks = 0;
    placeNoBtnInitial();
  }

  // Remove vanish msg
  const msgs = document.getElementById('screen-9')?.querySelectorAll('div') || [];
  msgs.forEach(m => { if (m.textContent.includes('ปุ่มหนีไปแล้ว')) m.remove(); });

  // Reset zing screen 8
  ['z1','z2','z3','z4','z5','z6','z7','z8','z9','z10'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.classList.add('hidden'); el.classList.remove('show'); }
  });
  document.getElementById('nextBtn8')?.classList.add('hidden');

  // Go to screen 1
  const all = document.querySelectorAll('.screen');
  all.forEach(s => {
    s.classList.remove('active', 'exit-up');
  });
  currentScreen = 9;
  goToScreen(1);

  // Reset bubbles screen 4
  bubblePopped = 0;
  document.querySelectorAll('.bubble-card').forEach(c => c.classList.remove('popped'));
  const hint = document.getElementById('bubbleHint');
  if (hint) { hint.textContent = 'กดการ์ดเพื่อเปิดอ่าน ✨'; hint.style.opacity = '1'; }
  const nb4 = document.getElementById('nextBtn4');
  if (nb4) nb4.classList.add('hidden');

  // Stop music
  const audio = document.getElementById('bgMusic');
  if (audio) { audio.pause(); audio.currentTime = 0; }
}

// ====== KEYBOARD NAVIGATION ======
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
    if (currentScreen < totalScreens) goToScreen(currentScreen + 1);
    e.preventDefault();
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    if (currentScreen > 1) goToScreen(currentScreen - 1);
    e.preventDefault();
  }
});

// ====== TOUCH SWIPE ======
let touchStartY = 0;
let touchStartX = 0;

document.addEventListener('touchstart', (e) => {
  touchStartY = e.touches[0].clientY;
  touchStartX = e.touches[0].clientX;
}, { passive: true });

document.addEventListener('touchend', (e) => {
  const dy = touchStartY - e.changedTouches[0].clientY;
  const dx = touchStartX - e.changedTouches[0].clientX;

  if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 50) {
    if (dy > 0 && currentScreen < totalScreens) {
      goToScreen(currentScreen + 1);
    } else if (dy < 0 && currentScreen > 1) {
      goToScreen(currentScreen - 1);
    }
  }
}, { passive: true });

// ====== INTERACTIVE HOVER EFFECTS ON CARDS ======
document.addEventListener('mousemove', (e) => {
  const cards = document.querySelectorAll('.letter-card, .promise-card');
  cards.forEach(card => {
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / rect.width;
    const dy = (e.clientY - cy) / rect.height;

    if (
      e.clientX >= rect.left && e.clientX <= rect.right &&
      e.clientY >= rect.top && e.clientY <= rect.bottom
    ) {
      card.style.transform = `rotateY(${dx * 8}deg) rotateX(${-dy * 8}deg) translateZ(10px)`;
      card.style.transition = 'transform 0.1s ease';
    } else {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s ease';
    }
  });
});

// ====== FLOATING EMOJI RAIN on Screen 3 ======
let emojiRainInterval = null;

function startEmojiRain() {
  if (emojiRainInterval) return;
  const emojis = ['🌙', '✨', '💫', '🌟', '⭐', '🩷', '🫶', '🌸'];

  emojiRainInterval = setInterval(() => {
    if (currentScreen !== 3) {
      clearInterval(emojiRainInterval);
      emojiRainInterval = null;
      return;
    }
    const e = document.createElement('div');
    e.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    e.style.cssText = `
      position: fixed;
      left: ${Math.random() * 100}vw;
      top: -30px;
      font-size: ${Math.random() * 16 + 12}px;
      pointer-events: none;
      z-index: 5;
      opacity: 0.7;
      animation: floatParticle ${Math.random() * 4 + 3}s linear forwards;
    `;
    document.body.appendChild(e);
    setTimeout(() => e.remove(), 8000);
  }, 400);
}

// Watch screen changes
const screenObserver = new MutationObserver(() => {
  if (currentScreen === 3) startEmojiRain();
});
screenObserver.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['class'] });

// ====== TILT EFFECT on Moon ======
document.addEventListener('mousemove', (e) => {
  const moon = document.querySelector('.moon');
  if (!moon) return;

  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  const dx = (e.clientX - cx) / cx;
  const dy = (e.clientY - cy) / cy;

  moon.style.transform = `translateY(0) rotate(${dx * 10}deg) scale(${1 + Math.abs(dy) * 0.05})`;
});

// ====== STAR SCORE ANIMATION ======
function animateScoreUp(el) {
  el.style.transform = 'scale(1.5)';
  el.style.color = '#fbbf24';
  setTimeout(() => {
    el.style.transform = '';
    el.style.color = '';
    el.style.transition = 'all 0.3s ease';
  }, 200);
}

const scoreEl = document.getElementById('starScore');
if (scoreEl) {
  const observer = new MutationObserver(() => animateScoreUp(scoreEl));
  observer.observe(scoreEl, { childList: true });
}

// ====== AUTO-ADVANCE HINT ======
function showAutoHint() {
  // Tiny hint after 8s of inaction on screen 1
  setTimeout(() => {
    if (currentScreen === 1) {
      const hint = document.querySelector('.scroll-hint');
      if (hint) {
        hint.style.opacity = '1';
        hint.style.animation = 'bounce 1s infinite';
      }
    }
  }, 8000);
}
showAutoHint();

// ====== WINDOW RESIZE ======
window.addEventListener('resize', () => {
  if (currentScreen === 9) placeNoBtnInitial();
});

// ====== CONSOLE EASTER EGG ======
console.log('%c🌙 ลาก่อนนะ ~', 'font-size:24px; font-family:Georgia; color:#c084fc;');
console.log('%cคิดถึงอยู่นะ 🫶', 'font-size:16px; font-family:Georgia; color:#f9a8d4;');
