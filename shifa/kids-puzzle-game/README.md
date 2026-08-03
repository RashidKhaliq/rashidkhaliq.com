# Little Learners Playground 🧸
### Created by Shifa Rashid

A colorful, voice-guided educational puzzle game for 5-year-olds, built with plain HTML5, CSS3, and JavaScript (no frameworks, no build step, no dependencies to install).

## How to run it

Just open `index.html` in any modern browser (Chrome, Safari, Edge, Firefox on desktop, Android, or iOS). There is no server or installation required. For the best experience on a phone/tablet, add it to the home screen — it fills the whole screen and plays like an app.

## Project structure

```
kids-puzzle-game/
├── index.html          Screen markup (start, categories, modes, game, results)
├── css/
│   └── style.css        All visual styling, animations, and responsive rules
├── js/
│   ├── data.js           All educational content (alphabet, numbers, colors,
│   │                     shapes, animals, fruits) — edit this to add more words
│   ├── audio.js          Synthesized sound effects + background music (Web
│   │                     Audio API) and spoken instructions (SpeechSynthesis
│   │                     API) — no external audio files needed
│   └── game.js           Screen flow, scoring, and the three game modes
└── README.md
```

## Why no image/sound files?

Every visual is drawn with emoji/CSS (crisp on every screen size, zero licensing
concerns, tiny file size) and every sound is generated live with the Web Audio
API, so the game is 100% self-contained and works offline with nothing to
license or download. If you'd like to swap in real illustrations or recorded
voice-overs later, that's easy:

- **Images**: replace the emoji strings in `js/data.js` (`display`, `pics`,
  etc.) with `<img>` tags pointing at files you add under `assets/images/`.
- **Music/SFX**: replace the calls in `js/audio.js` (`playCorrect`,
  `startMusic`, etc.) with `new Audio('assets/sounds/....mp3').play()` calls,
  using royalty-free sources such as freesound.org (CC0), OpenGameArt.org, or
  Pixabay Audio.
- **Voice-overs**: replace `AudioModule.speak(text)` calls with pre-recorded
  clips if you want a specific narrator voice instead of the browser's
  built-in text-to-speech.

## How the game is organized

- **6 learning categories**: Alphabet, Numbers, Colors, Shapes, Animals, Fruits
  (`GAME_DATA` in `data.js`).
- **3 game modes**, playable with any category: Find & Match (tap the right
  answer), Memory Game (flip cards to find pairs), Drag & Drop (drag items to
  their matching spot). Drag & drop uses Pointer Events rather than the
  native HTML5 Drag & Drop API so it works reliably with touch on phones and
  tablets.
- **3 difficulty levels** per mode+category combo, each with more items than
  the last (`DIFFICULTY` in `game.js`).
- **Scoring & stars**: 10 points per correct answer, plus a 1–3 star rating
  at the end of each level based on accuracy, shown with confetti and a
  cheerful spoken message.

## Adding new content

To add a new word to an existing category, add one object to that category's
`items` array in `data.js` — no other file needs to change. To add a whole
new category, copy the shape of an existing entry in `GAME_DATA`, add its key
to `CATEGORY_ORDER`, and add a matching entry to the `RENDER` table in
`game.js` describing how prompts/options/cards should look for it.

## Browser support

Uses only standard, widely supported web APIs: Web Audio API, SpeechSynthesis
API, Pointer Events, CSS Grid/Flexbox. Tested against modern evergreen
browsers (Chrome, Safari, Edge, Firefox) on desktop and Android/iOS.
