/* ==========================================================================
   game.js — Screen flow, game-mode rendering, and scoring logic.
   Depends on: data.js (GAME_DATA, CATEGORY_ORDER, GAME_MODES), audio.js
   ========================================================================== */

/* ---------------------------------------------------------------------- */
/* Global session state (kept in memory only — no localStorage, so every  */
/* fresh page load starts clean, which also keeps the game simple for    */
/* young children: no confusing "continue?" prompts.)                    */
/* ---------------------------------------------------------------------- */
const state = {
  category: null,
  modeId: null,
  level: 1,
  round: 0,
  roundsPerLevel: 5,
  correctInLevel: 0,
  totalScore: 0,
  totalStars: 0,
  // mode-specific working data
  currentPool: [],
  currentTarget: null,
  memory: { flipped: [], matchedCount: 0, lockBoard: false },
  dnd: { placedCount: 0 }
};

const DIFFICULTY = {
  match:  { 1: 3, 2: 4, 3: 6 },
  memory: { 1: 3, 2: 4, 3: 5 }, // number of PAIRS
  dnd:    { 1: 3, 2: 4, 3: 5 }
};

/* ---------------------------------------------------------------------- */
/* Utility helpers                                                        */
/* ---------------------------------------------------------------------- */
function $(sel){ return document.querySelector(sel); }
function $all(sel){ return Array.from(document.querySelectorAll(sel)); }
function shuffle(arr){
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function pickRandom(list, n){ return shuffle(list).slice(0, n); }

function showScreen(id){
  $all(".screen").forEach(s => s.classList.add("hidden"));
  $(`#${id}`).classList.remove("hidden");
}

function updateScorePill(){
  $all(".score-pill").forEach(el => {
    el.innerHTML = `⭐ <span>${state.totalScore}</span>`;
  });
}

function feedbackBanner(text, good){
  const el = $("#feedback-banner");
  el.textContent = text;
  el.className = "feedback-banner show " + (good ? "good" : "bad");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 900);
}

function confettiBurst(){
  const colors = ["#ff6b6b","#ffd23f","#6bcB77","#52c9f0","#b98af7","#ff8fc7","#ffa552"];
  for (let i = 0; i < 40; i++){
    const el = document.createElement("div");
    el.className = "confetti";
    el.style.left = Math.random() * 100 + "vw";
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.animationDuration = (2 + Math.random() * 1.5) + "s";
    el.style.width = el.style.height = (8 + Math.random() * 8) + "px";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3600);
  }
}

/* ---------------------------------------------------------------------- */
/* Category-specific rendering rules                                      */
/* Each entry describes how to turn an `item` into HTML for prompts,      */
/* options, memory cards, and drag & drop pieces for that category.       */
/* ---------------------------------------------------------------------- */
function dotsHTML(n){
  const size = n > 6 ? "1.1rem" : "1.6rem";
  let out = `<div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;max-width:220px;">`;
  for (let i = 0; i < n; i++) out += `<span style="font-size:${size}">🔴</span>`;
  out += `</div>`;
  return out;
}
function swatchHTML(hex, size){
  return `<div style="width:${size||70}%;height:${size||70}%;border-radius:50%;background:${hex};box-shadow:inset 0 -6px 0 rgba(0,0,0,0.12);"></div>`;
}

const RENDER = {
  alphabet: {
    prompt: item => `<div class="prompt-value">${item.display}</div>`,
    option: item => GAME_DATA.alphabet.pics[item.id],
    memoryStyle: "linked",
    memoryA: item => item.display,
    memoryB: item => GAME_DATA.alphabet.pics[item.id],
    dndDrag: item => item.display,
    dndTarget: item => `<div class="t-emoji">${GAME_DATA.alphabet.pics[item.id]}</div><div>${item.label}</div>`,
    promptSpeak: item => `Find the letter that goes with ${item.label}`,
  },
  numbers: {
    prompt: item => `<div class="prompt-label">How many?</div>${dotsHTML(item.count)}`,
    option: item => item.display,
    memoryStyle: "linked",
    memoryA: item => item.display,
    memoryB: item => dotsHTML(item.count),
    dndDrag: item => item.display,
    dndTarget: item => `${dotsHTML(item.count)}<div>${item.label}</div>`,
    promptSpeak: item => `How many dots do you see? Find the number ${item.speak}`,
  },
  colors: {
    prompt: item => `<div class="prompt-label">Find the color</div><div class="prompt-value">${item.label}</div>`,
    option: item => swatchHTML(item.hex),
    memoryStyle: "duplicate",
    memoryA: item => swatchHTML(item.hex, 80),
    dndDrag: item => swatchHTML(item.hex, 90),
    dndTarget: item => `<div>${item.label}</div>`,
    promptSpeak: item => `Find the color ${item.speak}`,
  },
  shapes: {
    prompt: item => `<div class="prompt-label">Find the shape</div><div class="prompt-value">${item.label}</div>`,
    option: item => item.display,
    memoryStyle: "duplicate",
    memoryA: item => item.display,
    dndDrag: item => item.display,
    dndTarget: item => `<div>${item.label}</div>`,
    promptSpeak: item => `Find the shape called ${item.speak}`,
  },
  animals: {
    prompt: item => `<div class="prompt-label">Find the animal</div><div class="prompt-value">${item.label}</div>`,
    option: item => item.display,
    memoryStyle: "duplicate",
    memoryA: item => item.display,
    dndDrag: item => item.display,
    dndTarget: item => `<div>${item.label}</div>`,
    promptSpeak: item => `Find the ${item.speak}`,
  },
  fruits: {
    prompt: item => `<div class="prompt-label">Find the fruit</div><div class="prompt-value">${item.label}</div>`,
    option: item => item.display,
    memoryStyle: "duplicate",
    memoryA: item => item.display,
    dndDrag: item => item.display,
    dndTarget: item => `<div>${item.label}</div>`,
    promptSpeak: item => `Find the ${item.speak}`,
  }
};

const PRAISE = ["Great Job!", "Awesome!", "You Did It!", "Super Star!", "Wonderful!", "Fantastic!"];
const TRY_AGAIN = ["Try Again!", "Almost!", "Keep Going!"];

/* ---------------------------------------------------------------------- */
/* Screen: Categories                                                      */
/* ---------------------------------------------------------------------- */
function renderCategoryScreen(){
  const grid = $("#category-grid");
  grid.innerHTML = CATEGORY_ORDER.map(key => {
    const cat = GAME_DATA[key];
    return `<button class="card c-${key}" data-cat="${key}">
        <span class="emoji">${cat.emoji}</span>
        <span class="label">${cat.title}</span>
      </button>`;
  }).join("");
  $all("#category-grid .card").forEach(btn => {
    btn.addEventListener("click", () => {
      AudioModule.playClick();
      state.category = btn.dataset.cat;
      renderModeScreen();
      showScreen("screen-mode");
      AudioModule.speak(`${GAME_DATA[state.category].title}! Pick a game to play.`);
    });
  });
}

/* ---------------------------------------------------------------------- */
/* Screen: Mode select                                                    */
/* ---------------------------------------------------------------------- */
function renderModeScreen(){
  $("#mode-cat-title").textContent = `${GAME_DATA[state.category].emoji} ${GAME_DATA[state.category].title}`;
  const wrap = $("#mode-list");
  wrap.innerHTML = GAME_MODES.map(m => `
    <button class="mode-card" data-mode="${m.id}">
      <span class="emoji">${m.emoji}</span>
      <span class="txt"><span class="name">${m.name}</span><span class="desc">${m.desc}</span></span>
    </button>`).join("");
  $all("#mode-list .mode-card").forEach(btn => {
    btn.addEventListener("click", () => {
      AudioModule.playClick();
      state.modeId = btn.dataset.mode;
      state.level = 1;
      state.totalStars = 0;
      beginLevel();
    });
  });
}

/* ---------------------------------------------------------------------- */
/* Level lifecycle                                                        */
/* ---------------------------------------------------------------------- */
function beginLevel(){
  state.round = 0;
  state.correctInLevel = 0;
  showScreen("screen-game");
  renderProgressDots();
  const modeName = GAME_MODES.find(m => m.id === state.modeId).name;
  AudioModule.speak(`Level ${state.level}. ${modeName}. Let's go!`);
  nextRound();
}

function renderProgressDots(){
  const dotsWrap = $("#progress-dots");
  dotsWrap.innerHTML = "";
  for (let i = 0; i < state.roundsPerLevel; i++){
    const span = document.createElement("span");
    dotsWrap.appendChild(span);
  }
  updateProgressDots();
}
function updateProgressDots(){
  $all("#progress-dots span").forEach((el, i) => {
    el.className = i < state.round ? "done" : (i === state.round ? "current" : "");
  });
}

function resetGameContainers(){
  // Only the container for the active mode should be visible; the others
  // are cleared out so leftover markup from a previous mode never lingers.
  $("#match-options").innerHTML = "";
  $("#memory-grid").innerHTML = "";
  $("#dnd-tray").innerHTML = "";
  $("#dnd-targets").innerHTML = "";
  $("#match-options").classList.toggle("hidden", state.modeId !== "match");
  $("#memory-grid").classList.toggle("hidden", state.modeId !== "memory");
  $("#dnd-wrap").classList.toggle("hidden", state.modeId !== "dnd");
  $("#progress-dots").classList.toggle("hidden", state.modeId !== "match");
}

function nextRound(){
  if (state.round >= state.roundsPerLevel){
    finishLevel();
    return;
  }
  resetGameContainers();
  updateProgressDots();
  $("#game-title").textContent = `${GAME_DATA[state.category].title} · Level ${state.level}`;
  if (state.modeId === "match") renderMatchRound();
  else if (state.modeId === "memory") renderMemoryRound();
  else if (state.modeId === "dnd") renderDndRound();
}

function registerAnswer(isCorrect){
  if (isCorrect){
    state.correctInLevel++;
    state.totalScore += 10;
    updateScorePill();
    feedbackBanner(PRAISE[Math.floor(Math.random() * PRAISE.length)], true);
    AudioModule.playCorrect();
    AudioModule.speak(PRAISE[Math.floor(Math.random() * PRAISE.length)]);
  } else {
    feedbackBanner(TRY_AGAIN[Math.floor(Math.random() * TRY_AGAIN.length)], false);
    AudioModule.playWrong();
  }
}

function finishLevel(){
  const acc = state.correctInLevel / state.roundsPerLevel;
  let stars = 1;
  if (acc >= 0.95) stars = 3;
  else if (acc >= 0.7) stars = 2;
  state.totalStars += stars;
  state.totalScore += stars * 5;
  updateScorePill();

  $("#results-title").textContent = state.level >= 3 ? "Level Complete! 🎉" : `Level ${state.level} Complete!`;
  $("#results-score").textContent = `You scored ${state.correctInLevel} out of ${state.roundsPerLevel}!`;
  const starsRow = $("#results-stars");
  starsRow.innerHTML = "";
  for (let i = 0; i < 3; i++){
    const s = document.createElement("span");
    s.className = "star" + (i < stars ? " earned" : "");
    s.textContent = "⭐";
    starsRow.appendChild(s);
  }

  const nextBtn = $("#btn-next-level");
  if (state.level < 3){
    nextBtn.textContent = "Next Level ➡️";
    nextBtn.classList.remove("hidden");
  } else {
    nextBtn.classList.add("hidden");
  }

  showScreen("screen-results");
  confettiBurst();
  AudioModule.playLevelComplete();
  AudioModule.speak(stars === 3 ? "Perfect! You are a superstar!" : "Great work! Let's keep learning!");
}

/* ---------------------------------------------------------------------- */
/* MODE 1: Find & Match                                                   */
/* ---------------------------------------------------------------------- */
function renderMatchRound(){
  const cat = state.category;
  const items = GAME_DATA[cat].items;
  const n = DIFFICULTY.match[state.level];
  const pool = pickRandom(items, Math.min(n, items.length));
  const target = pool[Math.floor(Math.random() * pool.length)];
  state.currentTarget = target;

  $("#prompt-box").innerHTML = RENDER[cat].prompt(target);
  AudioModule.speak(RENDER[cat].promptSpeak(target));

  const grid = $("#match-options");
  const cols = pool.length <= 3 ? pool.length : (pool.length <= 4 ? 2 : 3);
  grid.style.gridTemplateColumns = `repeat(${cols}, minmax(90px, 1fr))`;
  grid.innerHTML = shuffle(pool).map(item => `
    <button class="option-tile" data-id="${item.id}">${RENDER[cat].option(item)}</button>
  `).join("");

  $all("#match-options .option-tile").forEach(btn => {
    btn.addEventListener("click", () => onMatchAnswer(btn, target));
  });
}

function onMatchAnswer(btn, target){
  $all("#match-options .option-tile").forEach(b => b.classList.add("disabled"));
  const correct = btn.dataset.id === target.id;
  btn.classList.add(correct ? "correct" : "wrong");
  if (!correct){
    const correctBtn = $(`#match-options .option-tile[data-id="${target.id}"]`);
    if (correctBtn) correctBtn.classList.add("correct");
  }
  registerAnswer(correct);
  state.round++;
  setTimeout(nextRound, 1100);
}

/* ---------------------------------------------------------------------- */
/* MODE 2: Memory Game                                                    */
/* ---------------------------------------------------------------------- */
function renderMemoryRound(){
  const cat = state.category;
  const items = GAME_DATA[cat].items;
  const pairs = Math.min(DIFFICULTY.memory[state.level], items.length);
  const chosen = pickRandom(items, pairs);
  const style = RENDER[cat].memoryStyle;

  let cards = [];
  chosen.forEach(item => {
    if (style === "linked"){
      cards.push({ pairId: item.id, content: RENDER[cat].memoryA(item) });
      cards.push({ pairId: item.id, content: RENDER[cat].memoryB(item) });
    } else {
      cards.push({ pairId: item.id, content: RENDER[cat].memoryA(item) });
      cards.push({ pairId: item.id, content: RENDER[cat].memoryA(item) });
    }
  });
  cards = shuffle(cards);

  state.memory = { flipped: [], matchedCount: 0, lockBoard: false, totalPairs: pairs };

  const grid = $("#memory-grid");
  const cols = cards.length <= 6 ? 3 : (cards.length <= 8 ? 4 : 5);
  grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  grid.innerHTML = cards.map((c, i) => `
    <div class="memory-card" data-idx="${i}" data-pair="${c.pairId}">
      <div class="memory-card-inner">
        <div class="memory-card-face memory-card-back">❓</div>
        <div class="memory-card-face memory-card-front">${c.content}</div>
      </div>
    </div>`).join("");

  $("#prompt-box").innerHTML = `<div class="prompt-label">Memory Game</div><div class="prompt-value" style="font-size:1.4rem;">Find the matching pairs!</div>`;
  AudioModule.speak("Flip the cards and find the matching pairs!");

  $all("#memory-grid .memory-card").forEach(card => {
    card.addEventListener("click", () => onMemoryCardClick(card));
  });
}

function onMemoryCardClick(card){
  const m = state.memory;
  if (m.lockBoard) return;
  if (card.classList.contains("flipped") || card.classList.contains("matched")) return;

  card.classList.add("flipped");
  AudioModule.playFlip();
  m.flipped.push(card);

  if (m.flipped.length === 2){
    m.lockBoard = true;
    const [a, b] = m.flipped;
    const isMatch = a.dataset.pair === b.dataset.pair;
    if (isMatch){
      setTimeout(() => {
        a.classList.add("matched");
        b.classList.add("matched");
        m.matchedCount++;
        m.flipped = [];
        m.lockBoard = false;
        AudioModule.playCorrect();
        feedbackBanner(PRAISE[Math.floor(Math.random() * PRAISE.length)], true);
        if (m.matchedCount >= m.totalPairs){
          state.correctInLevel = state.roundsPerLevel; // full credit for finishing the board
          state.round = state.roundsPerLevel;
          setTimeout(finishLevel, 700);
        }
      }, 450);
    } else {
      AudioModule.playWrong();
      setTimeout(() => {
        a.classList.remove("flipped");
        b.classList.remove("flipped");
        m.flipped = [];
        m.lockBoard = false;
      }, 800);
    }
  }
}

/* ---------------------------------------------------------------------- */
/* MODE 3: Drag & Drop                                                    */
/* Implemented with pointer events (not native HTML5 DnD) so it works     */
/* reliably on touchscreens — essential for phones/tablets.               */
/* ---------------------------------------------------------------------- */
function renderDndRound(){
  const cat = state.category;
  const items = GAME_DATA[cat].items;
  const n = Math.min(DIFFICULTY.dnd[state.level], items.length);
  const chosen = pickRandom(items, n);

  state.dnd = { placedCount: 0, total: n };

  $("#prompt-box").innerHTML = `<div class="prompt-label">Drag & Drop</div><div class="prompt-value" style="font-size:1.3rem;">Match each one to its spot!</div>`;
  AudioModule.speak("Drag each item to where it belongs!");

  const tray = $("#dnd-tray");
  tray.innerHTML = shuffle(chosen).map(item => `
    <div class="dnd-item" data-id="${item.id}" id="drag-${item.id}">${RENDER[cat].dndDrag(item)}</div>
  `).join("");

  const targets = $("#dnd-targets");
  const cols = n <= 3 ? n : (n <= 4 ? 2 : 3);
  targets.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  targets.innerHTML = shuffle(chosen).map(item => `
    <div class="dnd-target" data-id="${item.id}">${RENDER[cat].dndTarget(item)}</div>
  `).join("");

  $all("#dnd-tray .dnd-item").forEach(el => makeDraggable(el));
}

function makeDraggable(el){
  let startX, startY, origParent, origNextSibling, offsetX, offsetY;

  el.addEventListener("pointerdown", (e) => {
    if (el.classList.contains("placed")) return;
    e.preventDefault();
    el.setPointerCapture(e.pointerId);
    const rect = el.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    origParent = el.parentNode;
    origNextSibling = el.nextSibling;

    el.classList.add("dragging");
    el.style.width = rect.width + "px";
    el.style.height = rect.height + "px";
    document.body.appendChild(el); // lift out so it can float above everything
    el.style.position = "fixed";
    moveTo(e.clientX, e.clientY);

    function moveTo(x, y){
      el.style.left = (x - offsetX) + "px";
      el.style.top = (y - offsetY) + "px";
    }

    function onMove(ev){
      moveTo(ev.clientX, ev.clientY);
      const target = findTargetUnder(ev.clientX, ev.clientY);
      $all(".dnd-target").forEach(t => t.classList.remove("hover"));
      if (target) target.classList.add("hover");
    }

    function onUp(ev){
      el.releasePointerCapture(ev.pointerId);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      const target = findTargetUnder(ev.clientX, ev.clientY);
      $all(".dnd-target").forEach(t => t.classList.remove("hover"));

      el.classList.remove("dragging");
      el.style.position = "";
      el.style.left = "";
      el.style.top = "";
      el.style.width = "";
      el.style.height = "";

      if (target && !target.classList.contains("filled")){
        if (target.dataset.id === el.dataset.id){
          // correct drop
          target.classList.add("filled");
          el.classList.add("placed");
          origParent.insertBefore(el, origNextSibling); // return to DOM tree (hidden)
          AudioModule.playDrop();
          registerAnswer(true);
          state.dnd.placedCount++;
          if (state.dnd.placedCount >= state.dnd.total){
            state.correctInLevel = state.roundsPerLevel;
            state.round = state.roundsPerLevel;
            setTimeout(finishLevel, 700);
          }
        } else {
          // wrong target: bounce back
          origParent.insertBefore(el, origNextSibling);
          AudioModule.playWrong();
          feedbackBanner(TRY_AGAIN[Math.floor(Math.random() * TRY_AGAIN.length)], false);
        }
      } else {
        origParent.insertBefore(el, origNextSibling);
      }
    }

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
  });
}

function findTargetUnder(x, y){
  const els = document.elementsFromPoint(x, y);
  return els.find(el => el.classList && el.classList.contains("dnd-target"));
}

/* ---------------------------------------------------------------------- */
/* Results screen navigation                                              */
/* ---------------------------------------------------------------------- */
function bindResultsButtons(){
  $("#btn-next-level").addEventListener("click", () => {
    AudioModule.playClick();
    state.level++;
    beginLevel();
  });
  $("#btn-replay-level").addEventListener("click", () => {
    AudioModule.playClick();
    beginLevel();
  });
  $("#btn-choose-another").addEventListener("click", () => {
    AudioModule.playClick();
    renderModeScreen();
    showScreen("screen-mode");
  });
  $("#btn-results-home").addEventListener("click", () => {
    AudioModule.playClick();
    showScreen("screen-start");
  });
}

/* ---------------------------------------------------------------------- */
/* Top bar (back button + mute toggles) wiring                            */
/* ---------------------------------------------------------------------- */
function bindTopBars(){
  $all(".btn-back-cat").forEach(b => b.addEventListener("click", () => {
    AudioModule.playClick();
    showScreen("screen-categories");
  }));
  $all(".btn-back-mode").forEach(b => b.addEventListener("click", () => {
    AudioModule.playClick();
    renderModeScreen();
    showScreen("screen-mode");
  }));

  let soundOn = true, musicOn = true;
  $all(".btn-mute-sound").forEach(b => b.addEventListener("click", () => {
    soundOn = !soundOn;
    AudioModule.toggleSfx(soundOn);
    AudioModule.toggleVoice(soundOn);
    $all(".btn-mute-sound").forEach(el => el.textContent = soundOn ? "🔊" : "🔇");
  }));
  $all(".btn-mute-music").forEach(b => b.addEventListener("click", () => {
    musicOn = !musicOn;
    AudioModule.toggleMusic(musicOn);
    $all(".btn-mute-music").forEach(el => el.textContent = musicOn ? "🎵" : "🎵🚫");
  }));
}

/* ---------------------------------------------------------------------- */
/* Boot                                                                    */
/* ---------------------------------------------------------------------- */
function init(){
  renderCategoryScreen();
  bindResultsButtons();
  bindTopBars();
  updateScorePill();

  $("#btn-start").addEventListener("click", () => {
    AudioModule.unlock();
    AudioModule.startMusic();
    AudioModule.playClick();
    AudioModule.speak("Let's play and learn! Pick something fun!");
    showScreen("screen-categories");
  });

  // Decorative drifting clouds
  const cloudLayer = $("#cloud-layer");
  const cloudSizes = [60, 90, 70, 110, 50];
  cloudSizes.forEach((size, i) => {
    const c = document.createElement("div");
    c.className = "cloud";
    c.style.width = size + "px";
    c.style.height = size * 0.5 + "px";
    c.style.top = (5 + i * 15) + "%";
    c.style.animationDuration = (30 + i * 8) + "s";
    c.style.animationDelay = (-i * 6) + "s";
    cloudLayer.appendChild(c);
  });
}

document.addEventListener("DOMContentLoaded", init);
