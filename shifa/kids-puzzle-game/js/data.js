/* ==========================================================================
   data.js — All educational content lives here.
   Each category is a list of items: { id, label, display, speak }
     - id:      unique string used internally
     - label:   short text shown under/near the item
     - display: what is rendered in tiles/cards (emoji or letter/number glyph)
     - speak:   what the voice should say when referring to this item
   Keeping content in one place makes it easy to add more words/items later
   without touching any game logic.
   ========================================================================== */

const GAME_DATA = {

  alphabet: {
    title: "Alphabet",
    emoji: "🔤",
    items: [
      { id:"A", label:"Apple",      display:"A", speak:"A, for Apple" },
      { id:"B", label:"Ball",       display:"B", speak:"B, for Ball" },
      { id:"C", label:"Cat",        display:"C", speak:"C, for Cat" },
      { id:"D", label:"Dog",        display:"D", speak:"D, for Dog" },
      { id:"E", label:"Elephant",   display:"E", speak:"E, for Elephant" },
      { id:"F", label:"Fish",       display:"F", speak:"F, for Fish" },
      { id:"G", label:"Grapes",     display:"G", speak:"G, for Grapes" },
      { id:"H", label:"Hat",        display:"H", speak:"H, for Hat" },
      { id:"I", label:"Ice Cream",  display:"I", speak:"I, for Ice Cream" },
      { id:"J", label:"Juice",      display:"J", speak:"J, for Juice" },
      { id:"K", label:"Kite",       display:"K", speak:"K, for Kite" },
      { id:"L", label:"Lion",       display:"L", speak:"L, for Lion" },
      { id:"M", label:"Monkey",     display:"M", speak:"M, for Monkey" },
      { id:"N", label:"Nest",       display:"N", speak:"N, for Nest" },
      { id:"O", label:"Orange",     display:"O", speak:"O, for Orange" },
      { id:"P", label:"Pig",        display:"P", speak:"P, for Pig" },
      { id:"Q", label:"Queen",      display:"Q", speak:"Q, for Queen" },
      { id:"R", label:"Rabbit",     display:"R", speak:"R, for Rabbit" },
      { id:"S", label:"Sun",        display:"S", speak:"S, for Sun" },
      { id:"T", label:"Tree",       display:"T", speak:"T, for Tree" },
      { id:"U", label:"Umbrella",   display:"U", speak:"U, for Umbrella" },
      { id:"V", label:"Violin",     display:"V", speak:"V, for Violin" },
      { id:"W", label:"Watermelon", display:"W", speak:"W, for Watermelon" },
      { id:"X", label:"Xylophone",  display:"X", speak:"X, for Xylophone" },
      { id:"Y", label:"Yoyo",       display:"Y", speak:"Y, for Yoyo" },
      { id:"Z", label:"Zebra",      display:"Z", speak:"Z, for Zebra" }
    ],
    // pictures used by the drag & drop and matching games as "clue" emoji
    pics: { A:"🍎",B:"⚽",C:"🐱",D:"🐶",E:"🐘",F:"🐟",G:"🍇",H:"🎩",I:"🍦",J:"🧃",
            K:"🪁",L:"🦁",M:"🐒",N:"🪺",O:"🍊",P:"🐷",Q:"👑",R:"🐰",S:"☀️",T:"🌳",
            U:"☂️",V:"🎻",W:"🍉",X:"🎹",Y:"🪀",Z:"🦓" }
  },

  numbers: {
    title: "Numbers",
    emoji: "🔢",
    items: [
      { id:"1",  label:"One",   display:"1",  speak:"One", count:1 },
      { id:"2",  label:"Two",   display:"2",  speak:"Two", count:2 },
      { id:"3",  label:"Three", display:"3",  speak:"Three", count:3 },
      { id:"4",  label:"Four",  display:"4",  speak:"Four", count:4 },
      { id:"5",  label:"Five",  display:"5",  speak:"Five", count:5 },
      { id:"6",  label:"Six",   display:"6",  speak:"Six", count:6 },
      { id:"7",  label:"Seven", display:"7",  speak:"Seven", count:7 },
      { id:"8",  label:"Eight", display:"8",  speak:"Eight", count:8 },
      { id:"9",  label:"Nine",  display:"9",  speak:"Nine", count:9 },
      { id:"10", label:"Ten",   display:"10", speak:"Ten", count:10 }
    ]
  },

  colors: {
    title: "Colors",
    emoji: "🎨",
    items: [
      { id:"red",    label:"Red",    hex:"#ff5757", speak:"Red" },
      { id:"blue",   label:"Blue",   hex:"#3aa0ff", speak:"Blue" },
      { id:"yellow", label:"Yellow", hex:"#ffd23f", speak:"Yellow" },
      { id:"green",  label:"Green",  hex:"#5ec969", speak:"Green" },
      { id:"purple", label:"Purple", hex:"#b98af7", speak:"Purple" },
      { id:"orange", label:"Orange", hex:"#ffa552", speak:"Orange" },
      { id:"pink",   label:"Pink",   hex:"#ff8fc7", speak:"Pink" },
      { id:"brown",  label:"Brown",  hex:"#a9713f", speak:"Brown" }
    ]
  },

  shapes: {
    title: "Shapes",
    emoji: "🔷",
    items: [
      { id:"circle",    label:"Circle",    display:"🔵", speak:"Circle" },
      { id:"square",     label:"Square",    display:"🟦", speak:"Square" },
      { id:"triangle",   label:"Triangle",  display:"🔺", speak:"Triangle" },
      { id:"star",       label:"Star",      display:"⭐", speak:"Star" },
      { id:"heart",       label:"Heart",     display:"❤️", speak:"Heart" },
      { id:"diamond",    label:"Diamond",   display:"🔶", speak:"Diamond" },
      { id:"rectangle",  label:"Rectangle", display:"🟪", speak:"Rectangle" },
      { id:"oval",       label:"Oval",      display:"🥚", speak:"Oval" }
    ]
  },

  animals: {
    title: "Animals",
    emoji: "🐾",
    items: [
      { id:"dog",      label:"Dog",      display:"🐶", speak:"Dog" },
      { id:"cat",      label:"Cat",      display:"🐱", speak:"Cat" },
      { id:"lion",     label:"Lion",     display:"🦁", speak:"Lion" },
      { id:"elephant", label:"Elephant", display:"🐘", speak:"Elephant" },
      { id:"monkey",   label:"Monkey",   display:"🐒", speak:"Monkey" },
      { id:"fish",     label:"Fish",     display:"🐟", speak:"Fish" },
      { id:"bird",     label:"Bird",     display:"🐦", speak:"Bird" },
      { id:"rabbit",   label:"Rabbit",   display:"🐰", speak:"Rabbit" },
      { id:"cow",      label:"Cow",      display:"🐮", speak:"Cow" },
      { id:"duck",     label:"Duck",     display:"🦆", speak:"Duck" }
    ]
  },

  fruits: {
    title: "Fruits",
    emoji: "🍓",
    items: [
      { id:"apple",      label:"Apple",      display:"🍎", speak:"Apple" },
      { id:"banana",     label:"Banana",     display:"🍌", speak:"Banana" },
      { id:"orange",     label:"Orange",     display:"🍊", speak:"Orange" },
      { id:"grape",      label:"Grapes",     display:"🍇", speak:"Grapes" },
      { id:"strawberry", label:"Strawberry", display:"🍓", speak:"Strawberry" },
      { id:"watermelon", label:"Watermelon", display:"🍉", speak:"Watermelon" },
      { id:"pineapple",  label:"Pineapple",  display:"🍍", speak:"Pineapple" },
      { id:"cherry",     label:"Cherry",     display:"🍒", speak:"Cherry" },
      { id:"mango",      label:"Mango",      display:"🥭", speak:"Mango" },
      { id:"peach",      label:"Peach",      display:"🍑", speak:"Peach" }
    ]
  }
};

// Order categories appear in the category-select screen
const CATEGORY_ORDER = ["alphabet","numbers","colors","shapes","animals","fruits"];

// The three game modes, with friendly names/descriptions for the mode screen
const GAME_MODES = [
  { id:"match",  name:"Find & Match", emoji:"🔍", desc:"Tap the right answer" },
  { id:"memory", name:"Memory Game",  emoji:"🧠", desc:"Flip cards to find pairs" },
  { id:"dnd",    name:"Drag & Drop",  emoji:"✋", desc:"Drag items to the right spot" }
];
