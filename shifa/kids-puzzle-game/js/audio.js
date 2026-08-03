/* ==========================================================================
   audio.js — Sound effects, background music, and spoken voice instructions.

   Design note: instead of loading external mp3/wav files (which would need
   to be sourced from third-party libraries and bundled), every sound in this
   game is synthesized in real time with the Web Audio API. This keeps the
   whole game 100% self-contained and license-free while still giving the
   cheerful chimes/jingles the brief asks for. Spoken instructions use the
   browser's built-in SpeechSynthesis API (also free, no assets required).
   ========================================================================== */

const AudioModule = (() => {
  let ctx = null;
  let musicEnabled = true;
  let voiceEnabled = true;
  let sfxEnabled = true;
  let musicTimer = null;
  let musicStep = 0;

  function ensureCtx(){
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  // Play a single tone. freq in Hz, duration in seconds.
  function tone(freq, start, duration, type = "sine", gainPeak = 0.18){
    const c = ensureCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, c.currentTime + start);
    gain.gain.exponentialRampToValueAtTime(gainPeak, c.currentTime + start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + duration);
    osc.connect(gain).connect(c.destination);
    osc.start(c.currentTime + start);
    osc.stop(c.currentTime + start + duration + 0.05);
  }

  // ---- Sound effect presets -------------------------------------------------
  function playClick(){
    if (!sfxEnabled) return;
    tone(520, 0, 0.08, "triangle", 0.12);
  }

  function playCorrect(){
    if (!sfxEnabled) return;
    // cheerful ascending chime
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.09, 0.22, "sine", 0.16));
  }

  function playWrong(){
    if (!sfxEnabled) return;
    // gentle "try again" descending blip, never harsh
    tone(330, 0, 0.16, "sine", 0.14);
    tone(247, 0.12, 0.2, "sine", 0.12);
  }

  function playLevelComplete(){
    if (!sfxEnabled) return;
    [523.25, 587.33, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.11, 0.28, "triangle", 0.18));
  }

  function playFlip(){
    if (!sfxEnabled) return;
    tone(440, 0, 0.08, "square", 0.08);
  }

  function playDrop(){
    if (!sfxEnabled) return;
    tone(392, 0, 0.1, "triangle", 0.14);
    tone(523.25, 0.06, 0.14, "triangle", 0.14);
  }

  // ---- Ambient background music ---------------------------------------------
  // A tiny, cheerful, endlessly-looping arpeggio built from a pentatonic scale
  // so it never sounds sour, no matter which notes land together.
  const SCALE = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];

  function musicTick(){
    if (!musicEnabled) return;
    const pattern = [0, 2, 4, 2, 0, 3, 5, 3];
    const note = SCALE[pattern[musicStep % pattern.length]];
    tone(note, 0, 0.5, "sine", 0.045);
    musicStep++;
  }

  function startMusic(){
    if (musicTimer) return;
    ensureCtx();
    musicTimer = setInterval(musicTick, 420);
  }

  function stopMusic(){
    if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
  }

  function toggleMusic(on){
    musicEnabled = on;
    if (on) startMusic(); else stopMusic();
  }

  function toggleSfx(on){ sfxEnabled = on; }

  // ---- Speech synthesis (voice instructions) ---------------------------------
  let voices = [];
  function loadVoices(){
    voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
  }
  if (window.speechSynthesis) {
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  function pickFriendlyVoice(){
    // Prefer a clear English voice; fall back to whatever's available.
    return voices.find(v => /en-(US|GB|AU)/i.test(v.lang) && /female|samantha|victoria|zira/i.test(v.name))
        || voices.find(v => /en/i.test(v.lang))
        || voices[0]
        || null;
  }

  function speak(text){
    if (!voiceEnabled || !window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel(); // don't let phrases pile up and overlap
    const utter = new SpeechSynthesisUtterance(text);
    const v = pickFriendlyVoice();
    if (v) utter.voice = v;
    utter.rate = 0.92;
    utter.pitch = 1.15;
    utter.volume = 1;
    window.speechSynthesis.speak(utter);
  }

  function toggleVoice(on){
    voiceEnabled = on;
    if (!on && window.speechSynthesis) window.speechSynthesis.cancel();
  }

  function unlock(){
    // Must be called from a user gesture (tap) to satisfy mobile autoplay rules
    ensureCtx();
    if (ctx.state === "suspended") ctx.resume();
  }

  return {
    unlock,
    playClick, playCorrect, playWrong, playLevelComplete, playFlip, playDrop,
    startMusic, stopMusic, toggleMusic, toggleSfx,
    speak, toggleVoice
  };
})();
