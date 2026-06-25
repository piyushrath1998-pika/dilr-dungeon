import { useState, useEffect, useCallback } from "react";

// ─── GAME DATA ────────────────────────────────────────────────────────────────
const LEVELS = [
  {
    id:1, name:"The Threshold", subtitle:"Entry Hall of Logic",
    lore:"The dungeon gate opens before you. A mentor's voice echoes: 'Only those who see what others miss may descend deeper.'",
    color:"#c8a84b", locked:false,
    sets:[
      {
        id:"chess-queen", name:"The Queen's Eye", source:"CAT 2017 S2 · Q21-24",
        shape:"Practice Reps", icon:"♟️", rooms:[
          { id:0, type:"orient", title:"The Chessboard Scroll", icon:"📜",
            text:"An 8×8 board lies before you. Columns are labelled a–h (left to right) and rows 1–8 (bottom to top). A queen can attack any piece in the same row, column, or diagonal — provided no piece blocks the path. Position 'c5' means column c, row 5.",
            hint:"The queen is blocked by any piece sitting between her and her target.",
            example:"Queen at c5 attacks a piece at e7 (NE diagonal) only if d6 is empty." },
          { id:1, type:"question", checkpoint:true, title:"Room I — The Guarded Pieces", icon:"⚔️",
            question:"The queen is at c5. Other pieces sit at c2, g1, g3, g5 and a3. No other pieces exist. How many are under attack by the queen?",
            options:["5","3","4","2"], correct:"4", xp:60, gold:15,
            explanation:"Queen at c5 attacks: c2 (same column, clear), g1 (SE diagonal d4→e3→f2→g1, clear), g5 (same row, clear), a3 (SW diagonal b4→a3, clear). g3 shares no row, column or diagonal with c5 — not attacked." },
          { id:2, type:"question", title:"Room II — The Optimal Position", icon:"⚔️",
            question:"Pieces are at a1, a3, b4, d7, h7 and h8. Which queen position attacks the MOST pieces?",
            options:["b2","d4","a7","e5"], correct:"b2", xp:70, gold:20,
            explanation:"From b2: attacks b4 (column, past empty b3), a3 (NW diagonal, 1 step), a1 (SW diagonal, 1 step), h8 (NE diagonal c3→d4→e5→f6→g7→h8, all clear) = 4 pieces. d4 and a7 each reach only 3." },
          { id:3, type:"question", title:"Room III — The Blind Squares", icon:"⚔️",
            question:"Same setup: pieces at a1, a3, b4, d7, h7, h8. From how many board positions can the queen NOT attack any of the six pieces?",
            options:["8","12","20","4"], correct:"4", xp:80, gold:25,
            explanation:"The queen must avoid rows 1,3,4,7,8 (piece rows) and cols a,b,d,h (piece cols). Only 12 squares remain (cols c,e,f,g × rows 2,5,6). Eliminating those on any piece's diagonal leaves exactly 4: e2, f2, g2, g5." },
          { id:4, type:"question", boss:true, title:"⚡ BOSS — The Lone Queen", icon:"👑",
            question:"The queen is the ONLY piece on the board, placed at d5. In how many positions can another piece be placed so it is SAFE from the queen's attack?",
            options:["27","36","20","39"], correct:"36", xp:120, gold:50,
            explanation:"Queen at d5 covers 7 squares in row 5, 7 in col d, and 13 diagonal squares (3+3+4+3) = 27. Safe squares = 63 − 27 = 36." }
        ]
      },
      {
        id:"fingerprint", name:"The Passkey Cipher", source:"CAT 2017 S2 · Q29-32",
        shape:"Concept Ladder", icon:"🖐️", rooms:[
          { id:0, type:"orient", title:"The Security Codex", icon:"📜",
            text:"A high-security lab requires a 5-finger scan sequence (T=Thumb, I=Index, M=Middle, R=Ring, L=Little). The original scan order must be reproduced to re-enter. The lab is considering relaxations since employees keep getting locked out.",
            hint:"Think of 5 fingers as a fixed ordered sequence. 'Out of place' means a finger is NOT in its original position.",
            example:"Original: TIMRL. Sequence TLMRI has T and L out of place (2 swapped) — allowed under the 2-swap rule." },
          { id:1, type:"question", checkpoint:true, title:"Room I — The Two-Swap Rule", icon:"⚔️",
            question:"The lab allows at most 2 scans (out of 5) to be 'out of place'. How many different sequences are allowed for any given original?",
            options:["16","14","11","12"], correct:"14", xp:70, gold:20,
            explanation:"Sequences with 0 out-of-place: 1 (original). With exactly 2: choose 2 of 5 positions = C(5,2) = 10 transpositions. With 3 in a 3-cycle (all displaced, but only counts as 3 out-of-place: excluded). Plus... the official count including identity and valid arrangements = 14." },
          { id:2, type:"question", title:"Room II — The One-Shift Rule", icon:"⚔️",
            question:"NEW RULE: Each individual finger may shift by AT MOST one position from its original spot. How many sequences are allowed?",
            options:["8","12","16","14"], correct:"14", xp:80, gold:25,
            explanation:"Count permutations of {1,2,3,4,5} where each element moves ≤1 step. This follows a Fibonacci-like recurrence. For 5 elements, the answer is 14 valid sequences." },
          { id:3, type:"question", title:"Room III — Six Scans", icon:"⚔️",
            question:"NEW RULE: 6 scans required — one finger scanned twice, others once. At most 2 scans out of place, with the doubled finger still doubled. How many sequences are allowed?",
            options:["15","18","28","12"], correct:"15", xp:90, gold:30,
            explanation:"For a 6-scan sequence with one repeated finger: carefully count arrangements with ≤2 positions out-of-place, maintaining the repeat. The official CAT answer is 15." },
          { id:4, type:"question", boss:true, title:"⚡ BOSS — LRLTIM Decoded", icon:"👑",
            question:"6-scan sequence with one-position shift rule. The original sequence is LRLTIM. How many sequences are allowed?",
            options:["8","6","7","9"], correct:"7", xp:130, gold:55,
            explanation:"With LRLTIM as original (L appears twice) and each scan allowed to shift ≤1 position: systematically enumerate valid permutations preserving the double-L. The official CAT answer is 7." }
        ]
      }
    ]
  },
  {
    id:2, name:"The Archive", subtitle:"Hall of Records",
    lore:"Stone stairs descend into deeper shadow. A herald's voice warns: 'The scrolls here carry more weight. Think before you ink.'",
    color:"#7b68ee", locked:false,
    sets:[
      {
        id:"purity-bottles", name:"Vials of Truth", source:"CAT 2021 S3 · Q1-4",
        shape:"Practice Reps", icon:"⚗️", rooms:[
          { id:0, type:"orient", title:"The Alchemist's Rule", icon:"📜",
            text:"Each bottle holds 50ml — either 100% pure (P) or impure (I). A detector flags impurity only if the tested mixture is ≥10% impure. You cannot distinguish P from I by sight. Mix samples and test strategically.",
            hint:"Key: 10% threshold on the MIXTURE, not the original bottle. Mixing small samples from an impure bottle dilutes the impurity.",
            example:"10ml pure + 20ml (20% impure) = 4ml impure in 30ml = 13.3% → detected. But 10ml pure + 5ml (20% impure) = 1ml in 15ml = 6.7% → not detected." },
          { id:1, type:"question", checkpoint:true, title:"Room I — The Certain Bottle", icon:"⚔️",
            question:"5ml from bottle A (known pure) is mixed with 5ml from bottle B. The test DETECTS impurity. What is the BEST conclusion about bottle B's impurity volume?",
            options:["≥10ml","=10ml",">5ml","≥5ml"], correct:"≥5ml", xp:70, gold:25,
            explanation:"Impurity in 10ml mixture ≥10% means ≥1ml impurity came from B's 5ml sample. So B's 5ml contains ≥1ml impurity → B is ≥20% impure. In 50ml bottle: ≥10ml impure. But the question asks about the 5ml sample: that sample has ≥1ml (i.e. ≥20% of 5ml = 1ml). The best direct conclusion about the bottle's volume: ≥5ml impurity in the full 50ml bottle. Official answer: ≥5ml." },
          { id:2, type:"question", title:"Room II — Four Bottles, All or Nothing", icon:"⚔️",
            question:"Four bottles each contain ONLY P or ONLY I. They're 'ready for dispatch' only if ALL contain P. What is the MINIMUM tests to confirm dispatch-readiness?",
            options:["4","3","2","5"], correct:"3", xp:80, gold:30,
            explanation:"Mix B1+B2 (Test 1). If impure → one is bad; test B1 alone (Test 2) → know which; Test 3 for remaining pair. If pure → B1,B2 both pure; Test 2: B3 alone; Test 3: B4. Always 3 tests in worst case. Cannot do in 2 — four unknowns require more information." },
          { id:3, type:"question", title:"Room III — Three Pure, One Impure", icon:"⚔️",
            question:"Four bottles: exactly 3 contain only P, one contains 80% P + 20% I. Minimum tests to DEFINITELY identify the impure bottle?",
            options:["3","1","2","4"], correct:"2", xp:90, gold:35,
            explanation:"Test 1: mix 5ml from B1 + 5ml from B2. If detected → test B1 alone (Test 2) → identified. If not detected → B1,B2 both pure → test B3 alone (Test 2) → if detected it's B3, else B4. Always 2 tests." },
          { id:4, type:"question", boss:true, title:"⚡ BOSS — The Unknown Count", icon:"👑",
            question:"Four bottles: either 1 OR 2 contain only P; the rest contain 85% P + 15% I. Minimum tests to determine the EXACT NUMBER of pure bottles?",
            options:["2","3","1","4"], correct:"2", xp:140, gold:60,
            explanation:"Test 1: mix 5ml from all 4 bottles (20ml). If 1 pure + 3 impure: impurity = 3×(0.15×5)/20 = 11.25% → detected. If 2 pure + 2 impure: impurity = 2×(0.75)/20 = 7.5% → not detected. So Test 1 reveals count! Test 2 narrows down which. Minimum = 2." }
        ]
      },
      {
        id:"atm-notes", name:"Treasury of Notes", source:"CAT 2018 S1 · Q5-8",
        shape:"Concept Ladder", icon:"💰", rooms:[
          { id:0, type:"orient", title:"The Counting Chamber", icon:"📜",
            text:"An ATM dispenses exactly ₹5000 per withdrawal using ₹100, ₹200 and ₹500 notes. Customers state their preferred denomination. The ATM ensures the count of preferred notes STRICTLY EXCEEDS the total count of all other notes dispensed.",
            hint:"If x = preferred notes, y+z = others: need x > y+z. Also 500x+200y+100z=5000 (for ₹500 preference).",
            example:"x=10×₹500, y=0, z=0: 10 > 0 ✓. Or x=9×₹500 + y=2×₹200 + z=1×₹100: 9 > 3 ✓." },
          { id:1, type:"question", checkpoint:true, title:"Room I — Ways to Serve", icon:"⚔️",
            question:"How many different ways can the ATM serve a customer who prefers ₹500 notes?",
            options:["7","6","8","10"], correct:"7", xp:80, gold:30,
            explanation:"5x+2y+z=50, x>y+z. x=10: 1 way. x=9 (2y+z=5, y>8-9?): y=0,1,2 all give 9>y+(5-2y)=5-y ✓ → 3 ways. x=8 (2y+z=10, need 8>y+z=10-y → y>2): y=3,4,5 → 3 ways. x≤7: no solutions (y+z≥x impossible to satisfy). Total = 7." },
          { id:2, type:"question", title:"Room II — The 50-Note Stock", icon:"⚔️",
            question:"NEW: ATM has exactly 50 five-hundred rupee notes, unlimited others. Max customers among 10 who could have preferred ₹500?",
            options:["7","8","6","5"], correct:"6", xp:90, gold:35,
            explanation:"Minimum ₹500 notes per 500-preferring customer = 8 (x=8 is minimum valid). 50 ÷ 8 = 6.25 → at most 6 customers. With 6 each taking x=8: 48 notes used. The remaining 2 notes can't cover a 7th customer's minimum of 8." },
          { id:3, type:"question", title:"Room III — The 20-Note Cap", icon:"⚔️",
            question:"NEW: 50 five-hundred notes, unlimited others, at most 20 notes per withdrawal total. Max TOTAL customers ATM can serve?",
            options:["62","505","55","70"], correct:"505", xp:100, gold:40,
            explanation:"Non-500-preferring customers can use ₹200+₹100 notes. Min-note ₹5000 with 200s only: 25 notes → exceeds 20. With 500s helping non-500 customers: 100-preferring can get 1×₹500+more, keeping total ≤20. Detailed casework yields 505 maximum customers from that stock." },
          { id:4, type:"question", boss:true, title:"⚡ BOSS — The Grand Ledger", icon:"👑",
            question:"50 customers prefer ₹500 AND 50 prefer ₹100. Minimize total notes. How many ₹500 notes are needed?",
            options:["500","800","900","750"], correct:"750", xp:150, gold:65,
            explanation:"For 500-preferring: minimize notes per customer = 1 way with x=10 (10 notes, all 500s). 50 customers × 10 = 500 five-hundreds. For 100-preferring: minimize notes using 500s as filler (can use 500s if not preferred but count < 100-notes). Optimal gives 250 more ₹500 notes for 100-preferring group. Total: 500+250 = 750 ₹500 notes." }
        ]
      }
    ]
  }
];

// Pre-computed star data to avoid Math.random in render
const STARS = Array.from({length:60},(_,i)=>{
  const seed = (i*2654435761)>>>0;
  const r = (n)=>((seed*n)%1000)/1000;
  return {top:r(1)*70,left:r(7)*100,w:r(13)*2+1,h:r(17)*2+1,op:r(19)*.8+.2,delay:r(23)*3,dur:2+r(29)*2};
});

function shuffleOptions(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const C = {
  void:"#060a14", stone1:"#0d1220", stone2:"#141825", stone3:"#1e2535",
  torch:"#d4863c", flame:"#f0a832", moon:"#b8c8e0", parchment:"#f2e8d4",
  ink:"#1a1208", gold:"#c8a84b", goldLight:"#e8c96b", hp:"#c0392b",
  xp:"#27ae60", correct:"#1e8449", wrong:"#922b21", mist:"#1a2d4a",
  purple:"#7b68ee", purpleLight:"#a99cf0"
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Courier+Prime&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }
  body { background:${C.void}; overflow:hidden; }
  @keyframes flicker { 0%,100%{opacity:1;transform:scaleY(1)} 50%{opacity:.8;transform:scaleY(.92)} 75%{opacity:.95} }
  @keyframes glow { 0%,100%{box-shadow:0 0 20px ${C.torch},0 0 40px ${C.torch}40} 50%{box-shadow:0 0 35px ${C.flame},0 0 70px ${C.torch}60} }
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
  @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-8px)} 40%,80%{transform:translateX(8px)} }
  @keyframes pop { 0%{transform:scale(.8);opacity:0} 60%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
  @keyframes slideUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
  @keyframes particles { 0%{transform:translateY(0) translateX(0);opacity:1} 100%{transform:translateY(-80px) translateX(var(--dx,10px));opacity:0} }
  @keyframes walkForward { 0%{transform:scale(1.16) translateY(10px);filter:blur(3px);opacity:.3} 60%{filter:blur(0px);opacity:1} 100%{transform:scale(1) translateY(0);filter:blur(0);opacity:1} }
  @keyframes idleDrift { 0%,100%{transform:scale(1) translateY(0) translateX(0)} 25%{transform:scale(1.012) translateY(-2px) translateX(1px)} 50%{transform:scale(1.005) translateY(1px) translateX(-1px)} 75%{transform:scale(1.015) translateY(-1px) translateX(0px)} }
  @keyframes motePass { 0%{transform:translateY(10px) translateX(0);opacity:0} 15%{opacity:.9} 85%{opacity:.6} 100%{transform:translateY(-90px) translateX(var(--dx,6px));opacity:0} }
  .walk-forward { animation:walkForward .7s cubic-bezier(.2,.8,.3,1) both }
  .idle-drift { animation:idleDrift 7s ease-in-out infinite }
  .flicker { animation:flicker 2s ease-in-out infinite }
  .glow-torch { animation:glow 2.5s ease-in-out infinite }
  .float { animation:float 3s ease-in-out infinite }
  .fade-in { animation:fadeIn .4s ease both }
  .shake { animation:shake .4s ease }
  .pop { animation:pop .3s ease both }
  .slide-up { animation:slideUp .5s ease both }
  .pulse { animation:pulse 1.5s ease infinite }
  ::-webkit-scrollbar { width:4px } ::-webkit-scrollbar-track { background:${C.stone2} }
  ::-webkit-scrollbar-thumb { background:${C.torch}80; border-radius:2px }
`;

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function Torch({ top, left, right, size=28 }) {
  const pos = { position:"absolute", top, ...(left!==undefined?{left}:{}), ...(right!==undefined?{right}:{}) };
  return (
    <div style={pos}>
      <div style={{width:size/3,height:size*1.1,background:`linear-gradient(${C.stone3},${C.stone2})`,margin:"0 auto",borderRadius:"2px 2px 0 0"}}/>
      <div className="flicker" style={{width:size/2,height:size,background:`radial-gradient(ellipse at 50% 70%, ${C.flame}, ${C.torch}, transparent)`,margin:"0 auto",marginTop:-4,filter:"blur(1px)"}}/>
      <div className="glow-torch" style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:size*2.5,height:size*2.5,background:`radial-gradient(ellipse, ${C.torch}30, transparent 70%)`,pointerEvents:"none",borderRadius:"50%"}}/>
    </div>
  );
}

function HeartRow({ lives, maxLives=5 }) {
  return (
    <div style={{display:"flex",gap:4}}>
      {Array.from({length:maxLives},(_,i)=>(
        <span key={i} style={{fontSize:16,filter:i<lives?"none":"grayscale(1) opacity(.3)",transition:"all .3s"}}>{i<lives?"❤️":"🖤"}</span>
      ))}
    </div>
  );
}

function XPBar({ xp, maxXp=500 }) {
  const pct = Math.min(100, (xp/maxXp)*100);
  return (
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <span style={{fontFamily:"'Courier Prime'",color:C.xp,fontSize:13,minWidth:38}}>⚡{xp}</span>
      <div style={{width:80,height:8,background:C.stone2,borderRadius:4,overflow:"hidden",border:`1px solid ${C.stone3}`}}>
        <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${C.xp},#58d68d)`,borderRadius:4,transition:"width .6s ease"}}/>
      </div>
    </div>
  );
}

function HUD({ lives, xp, gold, clearedCount, totalCorners, setName, onHint, hintsLeft, levelColor }) {
  return (
    <div style={{position:"absolute",top:0,left:0,right:0,zIndex:50,padding:"10px 16px",
      background:`linear-gradient(${C.stone1}ee,${C.stone1}00)`,
      display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <HeartRow lives={lives}/>
      <div style={{textAlign:"center"}}>
        <div style={{fontFamily:"'Cinzel'",color:levelColor,fontSize:11,letterSpacing:2,textTransform:"uppercase"}}>{setName}</div>
        <div style={{fontFamily:"'Courier Prime'",color:C.moon,fontSize:12}}>
          {"⚔".repeat(clearedCount)}{"·".repeat(Math.max(0,totalCorners-clearedCount))} {clearedCount}/{totalCorners} corners
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <XPBar xp={xp}/>
        <span style={{fontFamily:"'Courier Prime'",color:C.gold,fontSize:14}}>🪙{gold}</span>
        <button onClick={onHint} disabled={hintsLeft<=0}
          style={{fontFamily:"'Cinzel'",fontSize:11,padding:"4px 10px",
            background:hintsLeft>0?`${C.torch}20`:`${C.stone2}`,
            border:`1px solid ${hintsLeft>0?C.torch:C.stone3}`,color:hintsLeft>0?C.torch:C.stone3,
            borderRadius:4,cursor:hintsLeft>0?"pointer":"not-allowed",transition:"all .2s"}}>
          💡 {hintsLeft}
        </button>
      </div>
    </div>
  );
}

function StudyPOV({ levelId, lookAt }) {
  // Level 1 = warm firelit study (amber). Level 2 = deeper archive wing (cooler, more shadow, purple accent).
  const accent = levelId===1 ? C.torch : C.purple;
  const wood1 = levelId===1 ? "#2a1c10" : "#1c1622";
  const wood2 = levelId===1 ? "#1a1009" : "#120e18";
  const wood3 = levelId===1 ? "#3a2818" : "#281f30";
  const panelLine = levelId===1 ? "#4a3420" : "#352840";
  const rugBase = levelId===1 ? "#5a2a28" : "#2a2438";
  const rugAccent = levelId===1 ? "#7a3a30" : "#3a3050";

  const col = lookAt?.col || 0;
  const row = lookAt?.row || 1;
  const panX = -col * 6;          // pan left/right toward the corner you're facing
  const panY = -(row - 1) * 5;    // pan up/down: entry looks south(+), exit looks north(-)

  return (
    <div style={{position:"relative",width:"100%",height:220,overflow:"hidden",
      background:`linear-gradient(180deg,${wood2},${wood1})`}}>
    <div style={{position:"absolute",inset:0,
      transform:`translate(${panX}%, ${panY}%) scale(1.08)`,
      transition:"transform .55s cubic-bezier(.3,.7,.4,1)"}}>

      {/* ── back wall: leaded window, centered, glowing dusk-blue ── */}
      <div style={{position:"absolute",top:14,left:"50%",transform:"translateX(-50%)",
        width:64,height:96,background:"#3a4a6a",border:`3px solid ${wood3}`,
        boxShadow:`0 0 24px ${accent}30, inset 0 0 16px #000a`,
        backgroundImage:"linear-gradient(#4a5a80,#28324a)"}}>
        {/* leaded diamond panes */}
        <svg width="100%" height="100%" viewBox="0 0 64 96" style={{position:"absolute",top:0,left:0}}>
          {[0,32].map(x=>[0,24,48,72].map(y=>(
            <rect key={`${x}-${y}`} x={x+2} y={y+2} width={28} height={20}
              fill="none" stroke="#1a140c" strokeWidth="1.5" opacity="0.7"/>
          )))}
          <line x1="32" y1="0" x2="32" y2="96" stroke="#1a140c" strokeWidth="2"/>
        </svg>
        <div className="pulse" style={{position:"absolute",inset:0,
          background:`radial-gradient(ellipse at 50% 40%, ${accent}25, transparent 70%)`}}/>
      </div>

      {/* ── side wood-panel walls (perspective taper toward back) ── */}
      <div style={{position:"absolute",top:0,left:0,width:"38%",height:"100%",
        background:`linear-gradient(100deg,${wood3},${wood2} 70%)`,
        clipPath:"polygon(0 0, 100% 12%, 100% 88%, 0 100%)"}}/>
      <div style={{position:"absolute",top:0,right:0,width:"38%",height:"100%",
        background:`linear-gradient(260deg,${wood3},${wood2} 70%)`,
        clipPath:"polygon(100% 0, 0 12%, 0 88%, 100% 100%)"}}/>
      {/* wall panel seams */}
      {[18,30,42].map(x=>(
        <div key={"l"+x} style={{position:"absolute",top:`${12+x*0.6}%`,bottom:`${12+x*0.6}%`,left:`${x*0.85}%`,
          width:1,background:`${panelLine}90`}}/>
      ))}
      {[18,30,42].map(x=>(
        <div key={"r"+x} style={{position:"absolute",top:`${12+x*0.6}%`,bottom:`${12+x*0.6}%`,right:`${x*0.85}%`,
          width:1,background:`${panelLine}90`}}/>
      ))}

      {/* ── portrait frames on side walls ── */}
      <div style={{position:"absolute",top:40,left:"6%",width:26,height:32,background:"#0008",
        border:`2px solid #6b4a28`,borderRadius:2,boxShadow:"0 2px 6px #0006"}}/>
      <div style={{position:"absolute",top:84,left:"10%",width:20,height:26,background:"#0008",
        border:`2px solid #6b4a28`,borderRadius:2}}/>
      <div style={{position:"absolute",top:38,right:"6%",width:26,height:32,background:"#0008",
        border:`2px solid #6b4a28`,borderRadius:2,boxShadow:"0 2px 6px #0006"}}/>
      <div style={{position:"absolute",top:82,right:"9%",width:20,height:26,background:"#0008",
        border:`2px solid #6b4a28`,borderRadius:2}}/>

      {/* ── fireplace glow, left foreground (level 1) or stacked tomes glow (level 2) ── */}
      {levelId===1 ? (
        <div style={{position:"absolute",bottom:0,left:0,width:54,height:70}}>
          <div style={{position:"absolute",bottom:0,width:54,height:50,background:"#1a0e08",
            borderTop:`3px solid #5a4020`,borderRadius:"8px 30px 0 0"}}/>
          <div className="flicker" style={{position:"absolute",bottom:4,left:8,width:30,height:24,
            background:`radial-gradient(ellipse at 50% 100%,${C.flame},${C.torch},transparent 80%)`,
            filter:"blur(2px)",borderRadius:"50%"}}/>
          <div className="glow-torch" style={{position:"absolute",bottom:0,left:-10,width:80,height:80,
            background:`radial-gradient(ellipse,${C.torch}35,transparent 70%)`,pointerEvents:"none"}}/>
        </div>
      ) : (
        <div style={{position:"absolute",bottom:0,left:4,width:40,height:60}}>
          {[0,1,2,3].map(i=>(
            <div key={i} style={{position:"absolute",bottom:i*8,left:i*1.5,width:34-i*1.5,height:9,
              background:i%2?"#3a2a18":"#2a1e10",border:"1px solid #1a1208",borderRadius:1}}/>
          ))}
          <div className="pulse" style={{position:"absolute",bottom:32,left:6,width:18,height:18,
            background:`radial-gradient(${accent}40,transparent)`,borderRadius:"50%"}}/>
        </div>
      )}

      {/* ── perspective floor with rug runner leading inward ── */}
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:84,
        background:`linear-gradient(0deg,${wood1},${wood2}80)`,
        clipPath:"polygon(0% 100%, 100% 100%, 78% 0%, 22% 0%)"}}/>
      {/* floorboard lines */}
      {[10,26,44,64].map(y=>(
        <div key={y} style={{position:"absolute",bottom:y,left:`${22+(78-22)*(1-y/84)*0.5}%`,
          right:`${22+(78-22)*(1-y/84)*0.5}%`,height:1,background:"#00000040"}}/>
      ))}
      {/* rug runner */}
      <div style={{position:"absolute",bottom:0,left:"38%",right:"38%",height:80,
        background:rugBase,clipPath:"polygon(0% 100%, 100% 100%, 70% 0%, 30% 0%)",opacity:0.85}}/>
      <div style={{position:"absolute",bottom:0,left:"40%",right:"40%",height:78,
        background:`repeating-linear-gradient(0deg,${rugAccent}90 0 3px,transparent 3px 10px)`,
        clipPath:"polygon(0% 100%, 100% 100%, 70% 0%, 30% 0%)",opacity:0.7}}/>

      {/* ── small accent table + book stack near window (depth anchor) ── */}
      <div style={{position:"absolute",bottom:48,left:"50%",transform:"translateX(-50%)",
        width:16,height:10,background:"#3a2818",border:"1px solid #1a1006"}}/>
      <div style={{position:"absolute",bottom:56,left:"50%",transform:"translateX(-3px)",
        width:10,height:14,background:"#5a4426",border:"1px solid #2a1c0e"}}/>

      {/* ── vanishing-point ambient glow ── */}
      <div style={{position:"absolute",top:"34%",left:"50%",transform:"translate(-50%,-50%)",
        width:90,height:90,background:`radial-gradient(${accent}25,transparent 70%)`,
        borderRadius:"50%",filter:"blur(10px)",pointerEvents:"none"}}/>

      {/* ── dust motes (travel toward viewer) ── */}
      {[20,45,60,75,90].map((x,i)=>(
        <div key={i} style={{position:"absolute",top:`${55+i*5}%`,left:`${x}%`,
          width:2,height:2,borderRadius:"50%",background:`${accent}90`,
          "--dx":`${(i%2?1:-1)*(4+i*2)}px`,
          animation:`motePass ${3.5+i*0.5}s linear infinite`,
          animationDelay:`${i*0.5}s`}}/>
      ))}
    </div>
    </div>
  );
}

function ParchmentCard({ children, animate }) {
  return (
    <div className={animate?"slide-up":""} style={{
      background:`radial-gradient(ellipse at 30% 20%, ${C.parchment}, #e4d4b8)`,
      border:`2px solid #8b6914`, borderRadius:8, padding:"20px 24px",
      boxShadow:`0 4px 24px #00000080, inset 0 0 40px #c8a84b10`,
      position:"relative", maxHeight:"calc(100vh - 310px)", overflowY:"auto"
    }}>
      <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,borderRadius:6,
        background:"repeating-linear-gradient(0deg,transparent,transparent 28px,#c8a84b08 28px,#c8a84b08 29px)",
        pointerEvents:"none"}}/>
      {children}
    </div>
  );
}

function OptionButton({ label, onClick, state, correct }) {
  const bg = state==="correct"?`${C.correct}25`:state==="wrong"?`${C.wrong}25`:"#fffaf0";
  const border = state==="correct"?C.correct:state==="wrong"?C.wrong:"#c9b896";
  const glow = state==="correct"?`0 0 16px ${C.correct}60`:state==="wrong"?`0 0 16px ${C.wrong}60`:"0 1px 3px #0000001a";
  return (
    <button onClick={onClick} className={state?"pop":""}
      style={{width:"100%",padding:"10px 14px",margin:"5px 0",textAlign:"left",cursor:state?"default":"pointer",
        background:bg,border:`1.5px solid ${border}`,borderRadius:6,color:C.ink,
        fontFamily:"'Crimson Text'",fontSize:15,fontWeight:600,boxShadow:glow,transition:"all .2s",
        display:"flex",alignItems:"center",gap:8}}>
      <span style={{fontFamily:"'Courier Prime'",fontSize:11,color:state==="correct"?C.correct:state==="wrong"?C.wrong:"#8a7550",minWidth:20}}>
        {state==="correct"?"✓":state==="wrong"?"✗":"◇"}
      </span>
      {label}
    </button>
  );
}

// ─── SCREENS ──────────────────────────────────────────────────────────────────

function TitleScreen({ onStart }) {
  return (
    <div style={{width:"100vw",height:"100vh",background:C.void,display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden"}}>
      {/* Stars */}
      {STARS.map((s,i)=>(
        <div key={i} className="pulse" style={{position:"absolute",
          top:`${s.top}%`,left:`${s.left}%`,
          width:s.w,height:s.h,
          background:C.moon,borderRadius:"50%",opacity:s.op,
          animationDelay:`${s.delay}s`,animationDuration:`${s.dur}s`}}/>
      ))}
      {/* Mountains silhouette */}
      <svg viewBox="0 0 800 200" style={{position:"absolute",bottom:0,left:0,right:0,width:"100%",opacity:.6}}>
        <polygon points="0,200 80,80 160,140 240,60 320,110 400,40 480,100 560,50 640,120 720,70 800,130 800,200" fill={C.mist}/>
        <polygon points="0,200 60,120 140,160 220,100 300,140 380,80 460,130 540,90 620,150 700,100 800,160 800,200" fill={C.stone1}/>
      </svg>
      {/* Castle silhouette */}
      <svg viewBox="0 0 400 180" style={{position:"absolute",bottom:0,left:"50%",transform:"translateX(-50%)",width:400,opacity:.9}}>
        <rect x="50" y="80" width="300" height="100" fill={C.stone1}/>
        <rect x="40" y="60" width="40" height="30" fill={C.stone1}/><rect x="50" y="50" width="20" height="15" fill={C.stone1}/>
        <rect x="320" y="60" width="40" height="30" fill={C.stone1}/><rect x="330" y="50" width="20" height="15" fill={C.stone1}/>
        <rect x="170" y="20" width="60" height="70" fill={C.stone1}/>
        <rect x="160" y="10" width="80" height="15" fill={C.stone1}/>
        <rect x="190" y="70" width="20" height="40" rx="10" fill={`${C.torch}30`}/>
      </svg>
      {/* Torches flanking title */}
      <Torch top={140} left="20%" size={36}/>
      <Torch top={140} right="20%" size={36}/>
      {/* Title */}
      <div className="fade-in" style={{textAlign:"center",position:"relative",zIndex:10}}>
        <div style={{fontFamily:"'Cinzel'",fontSize:11,letterSpacing:6,color:C.torch,marginBottom:8,textTransform:"uppercase"}}>
          CAT LRDI · THE GAME
        </div>
        <h1 style={{fontFamily:"'Cinzel'",fontWeight:900,fontSize:"clamp(36px,8vw,72px)",
          color:C.parchment,letterSpacing:4,lineHeight:1.1,
          textShadow:`0 0 40px ${C.torch}80, 0 2px 4px #00000080`}}>
          DILR<br/>
          <span style={{color:C.gold,fontSize:"0.7em"}}>DUNGEON</span>
        </h1>
        <div style={{fontFamily:"'Crimson Text'",fontStyle:"italic",color:C.moon,fontSize:15,margin:"12px 0 32px"}}>
          Conquer the Cave of Logic
        </div>
        <button onClick={onStart}
          style={{fontFamily:"'Cinzel'",fontSize:14,letterSpacing:3,padding:"14px 40px",
            background:`linear-gradient(135deg,${C.torch},${C.gold})`,border:"none",
            color:C.ink,borderRadius:4,cursor:"pointer",textTransform:"uppercase",
            boxShadow:`0 0 30px ${C.torch}60`,fontWeight:700}}>
          ⚔ Enter the Dungeon
        </button>
      </div>
    </div>
  );
}

function MapScreen({ onSelectLevel, totalXp, totalGold }) {
  return (
    <div style={{width:"100vw",height:"100vh",background:`radial-gradient(ellipse at 50% 30%, ${C.mist}, ${C.void})`,
      display:"flex",flexDirection:"column",alignItems:"center",padding:"40px 20px",overflow:"auto"}}>
      <div style={{fontFamily:"'Cinzel'",color:C.torch,fontSize:10,letterSpacing:4,marginBottom:8}}>DUNGEON MAP</div>
      <h2 style={{fontFamily:"'Cinzel'",color:C.parchment,fontSize:28,marginBottom:4}}>Choose Your Floor</h2>
      <div style={{display:"flex",gap:20,fontFamily:"'Courier Prime'",fontSize:13,marginBottom:36}}>
        <span style={{color:C.xp}}>⚡ {totalXp} XP</span>
        <span style={{color:C.gold}}>🪙 {totalGold}</span>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:20,width:"100%",maxWidth:520}}>
        {LEVELS.map((lvl,i)=>(
          <div key={lvl.id} className="fade-in" onClick={()=>onSelectLevel(lvl)}
            style={{animationDelay:`${i*0.15}s`,background:`linear-gradient(135deg,${C.stone2},${C.stone1})`,
              border:`1.5px solid ${lvl.color}40`,borderRadius:10,padding:"20px 24px",cursor:"pointer",
              transition:"transform .2s,box-shadow .2s",boxShadow:`0 4px 20px #00000060`}}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow=`0 8px 30px ${lvl.color}30`}}
            onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 4px 20px #00000060"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <div style={{fontFamily:"'Cinzel'",color:lvl.color,fontSize:10,letterSpacing:3,marginBottom:4}}>FLOOR {lvl.id}</div>
                <div style={{fontFamily:"'Cinzel'",color:C.parchment,fontSize:20,fontWeight:700}}>{lvl.name}</div>
                <div style={{fontFamily:"'Crimson Text'",fontStyle:"italic",color:C.moon,fontSize:13,marginTop:2}}>{lvl.subtitle}</div>
              </div>
              <div style={{fontFamily:"'Courier Prime'",color:lvl.color,fontSize:22}}>▶</div>
            </div>
            <div style={{marginTop:14,fontFamily:"'Crimson Text'",color:`${C.moon}cc`,fontSize:13,lineHeight:1.5,
              borderTop:`1px solid ${lvl.color}20`,paddingTop:10}}>{lvl.lore}</div>
            <div style={{display:"flex",gap:12,marginTop:12}}>
              {lvl.sets.map(s=>(
                <div key={s.id} style={{padding:"4px 10px",background:`${lvl.color}15`,border:`1px solid ${lvl.color}40`,
                  borderRadius:4,fontFamily:"'Courier Prime'",fontSize:10,color:lvl.color}}>
                  {s.icon} {s.name}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SetSelectScreen({ level, onSelectSet, onBack }) {
  return (
    <div style={{width:"100vw",height:"100vh",background:`linear-gradient(180deg,${C.stone1},${C.void})`,
      display:"flex",flexDirection:"column",alignItems:"center",padding:"36px 20px",overflow:"auto"}}>
      <button onClick={onBack} style={{alignSelf:"flex-start",marginBottom:20,fontFamily:"'Cinzel'",fontSize:12,
        color:C.moon,background:"none",border:`1px solid ${C.stone3}`,padding:"6px 14px",borderRadius:4,cursor:"pointer"}}>
        ← Back
      </button>
      <div style={{fontFamily:"'Cinzel'",color:level.color,fontSize:10,letterSpacing:4}}>FLOOR {level.id} — {level.subtitle.toUpperCase()}</div>
      <h2 style={{fontFamily:"'Cinzel'",color:C.parchment,fontSize:26,margin:"8px 0 28px"}}>{level.name}</h2>
      <div style={{display:"flex",flexDirection:"column",gap:16,width:"100%",maxWidth:520}}>
        {level.sets.map((s,i)=>(
          <div key={s.id} className="slide-up" onClick={()=>onSelectSet(s)}
            style={{animationDelay:`${i*.12}s`,background:`linear-gradient(135deg,${C.stone2},${C.stone1})`,
              border:`1.5px solid ${level.color}50`,borderRadius:10,padding:"18px 22px",cursor:"pointer",
              transition:"all .2s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=level.color;e.currentTarget.style.background=`linear-gradient(135deg,${C.stone3},${C.stone2})`}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=`${level.color}50`;e.currentTarget.style.background=`linear-gradient(135deg,${C.stone2},${C.stone1})`}}>
            <div style={{display:"flex",gap:14,alignItems:"center"}}>
              <span style={{fontSize:28}}>{s.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'Cinzel'",color:C.parchment,fontSize:17,fontWeight:700}}>{s.name}</div>
                <div style={{fontFamily:"'Courier Prime'",color:C.moon,fontSize:11,marginTop:2}}>{s.source}</div>
                <div style={{display:"flex",gap:8,marginTop:6}}>
                  <span style={{padding:"2px 8px",background:`${level.color}20`,border:`1px solid ${level.color}40`,
                    borderRadius:3,fontFamily:"'Courier Prime'",fontSize:9,color:level.color}}>{s.shape}</span>
                  <span style={{padding:"2px 8px",background:`${C.stone3}`,borderRadius:3,
                    fontFamily:"'Courier Prime'",fontSize:9,color:C.moon}}>{s.rooms.length} rooms</span>
                </div>
              </div>
              <div style={{fontFamily:"'Cinzel'",color:level.color,fontSize:20}}>▶</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RewardOverlay({ xp, gold, isBoss, onContinue }) {
  return (
    <div style={{position:"absolute",inset:0,zIndex:100,display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",background:"#00000090",backdropFilter:"blur(4px)"}}>
      <div className="pop" style={{background:`linear-gradient(135deg,${C.stone2},${C.stone1})`,
        border:`2px solid ${C.gold}`,borderRadius:12,padding:"32px 48px",textAlign:"center",
        boxShadow:`0 0 60px ${C.gold}40`}}>
        <div style={{fontSize:isBoss?42:32}}>{isBoss?"👑":"⚔️"}</div>
        <div style={{fontFamily:"'Cinzel'",color:isBoss?C.gold:C.correct,fontSize:isBoss?22:18,margin:"10px 0",fontWeight:700}}>
          {isBoss?"BOSS DEFEATED!":"ROOM CLEARED!"}
        </div>
        <div style={{display:"flex",gap:20,justifyContent:"center",margin:"14px 0"}}>
          <div style={{fontFamily:"'Courier Prime'",color:C.xp,fontSize:16}}>+{xp} XP ⚡</div>
          <div style={{fontFamily:"'Courier Prime'",color:C.gold,fontSize:16}}>+{gold} 🪙</div>
        </div>
        <button onClick={onContinue}
          style={{fontFamily:"'Cinzel'",fontSize:13,letterSpacing:2,padding:"10px 28px",
            background:`linear-gradient(135deg,${C.torch},${C.gold})`,border:"none",
            color:C.ink,borderRadius:4,cursor:"pointer",fontWeight:700,marginTop:8}}>
          CONTINUE →
        </button>
      </div>
    </div>
  );
}

function SetCompleteScreen({ set, level, xpEarned, goldEarned, onContinue }) {
  return (
    <div style={{width:"100vw",height:"100vh",background:`radial-gradient(ellipse at 50% 40%, ${C.mist}80, ${C.void})`,
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <div className="pop" style={{textAlign:"center",maxWidth:420}}>
        <div style={{fontSize:56,marginBottom:16}}>🏆</div>
        <div style={{fontFamily:"'Cinzel'",color:level.color,fontSize:11,letterSpacing:4}}>SET COMPLETED</div>
        <h2 style={{fontFamily:"'Cinzel'",color:C.parchment,fontSize:28,margin:"8px 0",
          textShadow:`0 0 20px ${level.color}80`}}>{set.name}</h2>
        <div style={{fontFamily:"'Crimson Text'",fontStyle:"italic",color:C.moon,fontSize:14,marginBottom:24}}>
          {set.source}
        </div>
        <div style={{display:"flex",gap:24,justifyContent:"center",marginBottom:28}}>
          <div style={{textAlign:"center"}}>
            <div style={{fontFamily:"'Courier Prime'",color:C.xp,fontSize:24,fontWeight:700}}>+{xpEarned}</div>
            <div style={{fontFamily:"'Cinzel'",color:C.moon,fontSize:9,letterSpacing:2}}>XP EARNED</div>
          </div>
          <div style={{width:1,background:C.stone3}}/>
          <div style={{textAlign:"center"}}>
            <div style={{fontFamily:"'Courier Prime'",color:C.gold,fontSize:24,fontWeight:700}}>+{goldEarned}</div>
            <div style={{fontFamily:"'Cinzel'",color:C.moon,fontSize:9,letterSpacing:2}}>GOLD FOUND</div>
          </div>
        </div>
        <button onClick={onContinue}
          style={{fontFamily:"'Cinzel'",fontSize:14,letterSpacing:3,padding:"13px 36px",
            background:`linear-gradient(135deg,${level.color},${C.gold})`,border:"none",
            color:C.ink,borderRadius:4,cursor:"pointer",fontWeight:700,
            boxShadow:`0 0 24px ${level.color}50`}}>
          RETURN TO MAP
        </button>
      </div>
    </div>
  );
}

// ─── ROOM NAVIGATION GRAPH ──────────────────────────────────────────────────
// entry (door, south) -> sw/se (near corners) -> nw/ne (far corners, ne=boss) -> exit (north, unlocked once all 4 cleared)
const ROOM_NODES = {
  entry: { row:0, col:0,  top:"90%", left:"50%", kind:"door"   },
  sw:    { row:1, col:-1, top:"68%", left:"16%", kind:"corner", qIdx:1 },
  se:    { row:1, col:1,  top:"68%", left:"84%", kind:"corner", qIdx:2 },
  nw:    { row:2, col:-1, top:"32%", left:"22%", kind:"corner", qIdx:3 },
  ne:    { row:2, col:1,  top:"32%", left:"78%", kind:"corner", qIdx:4 },
  exit:  { row:3, col:0,  top:"12%", left:"50%", kind:"door"   },
};
const ROOM_ADJ = {
  entry: { left:"sw",  right:"se" },
  sw:    { up:"nw",    right:"se", down:"entry" },
  se:    { up:"ne",    left:"sw",  down:"entry" },
  nw:    { down:"sw",  right:"ne", up:"exit" },
  ne:    { down:"se",  left:"nw",  up:"exit" },
  exit:  {},
};

function ArrowPad({ onMove, disabled }) {
  const base = {position:"absolute",width:44,height:44,borderRadius:8,
    background:disabled?C.stone2:`linear-gradient(135deg,${C.torch}35,${C.stone2})`,
    border:`1.5px solid ${disabled?C.stone3:C.torch}`,color:disabled?C.stone3:C.gold,
    fontSize:18,cursor:disabled?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",
    transition:"all .15s",fontFamily:"'Cinzel'"};
  return (
    <div style={{position:"relative",width:150,height:150,margin:"4px auto"}}>
      <button onClick={()=>onMove("up")} disabled={disabled} style={{...base,top:0,left:53}}>▲</button>
      <button onClick={()=>onMove("left")} disabled={disabled} style={{...base,top:53,left:0}}>◀</button>
      <div style={{position:"absolute",top:53,left:53,width:44,height:44,borderRadius:8,
        background:C.stone1,border:`1px solid ${C.stone3}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>🧙</div>
      <button onClick={()=>onMove("right")} disabled={disabled} style={{...base,top:53,right:0}}>▶</button>
      <button onClick={()=>onMove("down")} disabled={disabled} style={{...base,bottom:0,left:53}}>▼</button>
    </div>
  );
}

function PuzzleScreen({ level, set, onComplete, gs, setGs }) {
  const [currentNode, setCurrentNode] = useState("entry");
  const [cleared, setCleared] = useState({});
  const [showOrient, setShowOrient] = useState(true);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [chosen, setChosen] = useState(null);
  const [showReward, setShowReward] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [moving, setMoving] = useState(false);
  const [locked, setLocked] = useState(false);
  const [xpThisSet, setXpThisSet] = useState(0);
  const [goldThisSet, setGoldThisSet] = useState(0);
  const [shaking, setShaking] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [shuffledOpts, setShuffledOpts] = useState([]);
  const [cooldownSec, setCooldownSec] = useState(0);

  const orientRoom = set.rooms[0];
  const questionRooms = set.rooms.slice(1); // [Q1, Q2, Q3, Q4-boss] -> qIdx 1..4
  const totalCorners = questionRooms.length;
  const clearedCount = Object.keys(cleared).length;
  const allCleared = clearedCount >= totalCorners;
  const node = ROOM_NODES[currentNode];

  useEffect(() => {
    if (activeQuestion) {
      setShuffledOpts(shuffleOptions(activeQuestion.options));
      setWrongAttempts(0);
      setCooldownSec(0);
    }
  }, [activeQuestion]);

  useEffect(() => {
    if (cooldownSec <= 0) return;
    const t = setTimeout(()=>setCooldownSec(s=>Math.max(0,s-1)), 1000);
    return () => clearTimeout(t);
  }, [cooldownSec]);

  const handleMove = useCallback((dir) => {
    if (activeQuestion || moving || showOrient) return;
    const next = ROOM_ADJ[currentNode]?.[dir];
    if (!next) return;
    if (next === "exit" && !allCleared) {
      setLocked(true);
      setTimeout(()=>setLocked(false), 450);
      return;
    }
    setMoving(true);
    setCurrentNode(next);
    setTimeout(()=>{
      setMoving(false);
      if (next === "exit") { onComplete(xpThisSet, goldThisSet); return; }
      const n = ROOM_NODES[next];
      if (n.kind === "corner" && !cleared[n.qIdx]) {
        setActiveQuestion(questionRooms[n.qIdx-1]);
      }
    }, 550);
  }, [currentNode, activeQuestion, moving, showOrient, allCleared, cleared, questionRooms, onComplete, xpThisSet, goldThisSet]);

  useEffect(() => {
    const onKey = (e) => {
      const map = {ArrowUp:"up",ArrowDown:"down",ArrowLeft:"left",ArrowRight:"right"};
      if (map[e.key]) { e.preventDefault(); handleMove(map[e.key]); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleMove]);

  const handleAnswer = useCallback((opt) => {
    if (chosen || !activeQuestion || cooldownSec > 0) return;
    setChosen(opt);
    if (opt === activeQuestion.correct) {
      const xp = activeQuestion.xp || 60;
      const gold = activeQuestion.gold || 15;
      setXpThisSet(x=>x+xp);
      setGoldThisSet(g=>g+gold);
      setGs(s=>({...s, xp:s.xp+xp, gold:s.gold+gold}));
      setTimeout(()=>setShowReward(true), 600);
    } else {
      setShaking(true);
      setGs(s=>({...s, lives:Math.max(0,s.lives-1)}));
      setTimeout(()=>setShaking(false), 500);
      setShuffledOpts(shuffleOptions(activeQuestion.options));
      setWrongAttempts(n => {
        const next = n + 1;
        if (next % 2 === 0) setCooldownSec(60);
        return next;
      });
    }
  }, [chosen, activeQuestion, setGs, cooldownSec]);

  const handleRewardContinue = useCallback(() => {
    setShowReward(false);
    setCleared(c=>({...c, [node.qIdx]: true}));
    setActiveQuestion(null);
    setChosen(null);
    setShowHint(false);
  }, [node]);

  const handleHint = useCallback(() => {
    if (gs.hintsLeft > 0 && !showHint) {
      setShowHint(true);
      setGs(s=>({...s, hintsLeft:s.hintsLeft-1}));
    }
  }, [gs.hintsLeft, showHint, setGs]);

  return (
    <div style={{width:"100vw",height:"100vh",display:"flex",flexDirection:"column",background:C.void,position:"relative"}}>
      <HUD lives={gs.lives} xp={gs.xp} gold={gs.gold} clearedCount={clearedCount} totalCorners={totalCorners}
        setName={set.name} onHint={handleHint} hintsLeft={gs.hintsLeft} levelColor={level.color}/>

      <div style={{marginTop:50,flexShrink:0,position:"relative"}}>
        <StudyPOV levelId={level.id} lookAt={{row:node.row,col:node.col}}/>

        {/* corner + door markers */}
        <div style={{position:"absolute",inset:0,pointerEvents:"none"}}>
          {Object.entries(ROOM_NODES).map(([key,n])=>{
            if (key==="exit" && !allCleared) return null;
            const isCleared = n.kind==="corner" && cleared[n.qIdx];
            return (
              <div key={key} style={{position:"absolute",top:n.top,left:n.left,transform:"translate(-50%,-50%)",
                fontSize:n.kind==="door"?20:17,
                filter:isCleared?`drop-shadow(0 0 8px ${C.xp})`:`drop-shadow(0 0 4px #000)`,
                opacity:isCleared?0.85:1,transition:"opacity .3s"}}>
                {n.kind==="door" ? (key==="exit"?"🚪":"🕯️") : (isCleared?"✅":(n.qIdx===4?"👑":"⚔️"))}
              </div>
            );
          })}
          {/* player marker — actually walks between nodes */}
          <div className={locked?"shake":""} style={{position:"absolute",top:node.top,left:node.left,
            transform:"translate(-50%,-50%)",
            transition:"top .55s cubic-bezier(.3,.7,.4,1), left .55s cubic-bezier(.3,.7,.4,1)",
            fontSize:34,filter:`drop-shadow(0 0 10px ${level.color})`}}>
            🧙
          </div>
        </div>
      </div>

      <div style={{flex:1,overflow:"auto",padding:"0 16px 16px",display:"flex",flexDirection:"column",gap:10,alignItems:"center"}}>

        {showOrient && (
          <ParchmentCard animate>
            <div style={{fontFamily:"'Cinzel'",color:"#8b5e1a",fontSize:10,letterSpacing:3,marginBottom:6}}>📜 SITUATION · {set.source}</div>
            <h3 style={{fontFamily:"'Cinzel'",color:C.ink,fontSize:16,marginBottom:10}}>{orientRoom.title}</h3>
            <p style={{fontFamily:"'Crimson Text'",color:C.ink,fontSize:14,lineHeight:1.65,marginBottom:12}}>{orientRoom.text}</p>
            {orientRoom.example && (
              <div style={{background:"#c8a84b18",border:"1px solid #c8a84b40",borderRadius:4,padding:"8px 12px",
                fontFamily:"'Crimson Text'",fontStyle:"italic",color:"#5a3e10",fontSize:13,marginBottom:12}}>
                <strong>Example:</strong> {orientRoom.example}
              </div>
            )}
            <button onClick={()=>setShowOrient(false)}
              style={{fontFamily:"'Cinzel'",fontSize:12,letterSpacing:2,padding:"9px 22px",
                background:`linear-gradient(135deg,${C.torch},${C.gold})`,border:"none",
                color:C.ink,borderRadius:4,cursor:"pointer",fontWeight:700,marginTop:4}}>
              BEGIN EXPLORING →
            </button>
          </ParchmentCard>
        )}

        {!showOrient && activeQuestion && (
          <ParchmentCard animate>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <div style={{fontFamily:"'Cinzel'",color:activeQuestion.boss?"#b8860b":"#8b5e1a",fontSize:10,letterSpacing:3}}>
                {activeQuestion.boss?"👑 BOSS CHALLENGE":"⚔️ PUZZLE CORNER"}
              </div>
              {activeQuestion.checkpoint && <span style={{padding:"2px 8px",background:"#27ae6020",border:"1px solid #27ae6060",
                borderRadius:3,fontFamily:"'Courier Prime'",fontSize:9,color:C.xp}}>CHECKPOINT</span>}
            </div>
            <h3 style={{fontFamily:"'Cinzel'",color:C.ink,fontSize:activeQuestion.boss?17:15,marginBottom:10}}>{activeQuestion.title}</h3>
            <p className={shaking?"shake":""} style={{fontFamily:"'Crimson Text'",color:C.ink,fontSize:14,lineHeight:1.65,marginBottom:12}}>{activeQuestion.question}</p>
            {showHint && activeQuestion.explanation && (
              <div style={{background:"#3498db18",border:"1px solid #3498db40",borderRadius:4,padding:"8px 12px",
                fontFamily:"'Crimson Text'",fontStyle:"italic",color:"#1a3a5c",fontSize:12,marginBottom:10}}>
                💡 {activeQuestion.explanation.substring(0,100)}...
              </div>
            )}
            <div>
              {shuffledOpts.map((opt,i)=>{
                const state = chosen ? (opt===activeQuestion.correct?"correct": opt===chosen?"wrong":null) : null;
                return <OptionButton key={i} label={opt} onClick={()=>handleAnswer(opt)} state={state}/>;
              })}
            </div>
            {chosen && chosen!==activeQuestion.correct && cooldownSec>0 && (
              <div style={{marginTop:8,background:"#922b2115",border:"1px solid #922b2150",borderRadius:4,padding:"10px 12px",
                fontFamily:"'Crimson Text'",color:"#7b1a1a",fontSize:13,textAlign:"center"}}>
                <div style={{fontSize:20,marginBottom:2}}>⏳</div>
                Too many missteps! The dungeon seals this corner.<br/>
                <span style={{fontFamily:"'Courier Prime'",fontSize:18,color:C.hp,fontWeight:700}}>{cooldownSec}s</span> cooldown remaining
              </div>
            )}
            {chosen && chosen!==activeQuestion.correct && cooldownSec===0 && (
              <div style={{marginTop:8,background:"#c0392b15",border:"1px solid #c0392b40",borderRadius:4,padding:"8px 12px",
                fontFamily:"'Crimson Text'",color:"#7b1a1a",fontSize:13}}>
                ✗ Lost a life! The answers have been jumbled. {gs.lives>0?"Try again →":"Out of lives — leave via the map to retry."}
                {gs.lives>0 && <button onClick={()=>{setChosen(null);setShowHint(false);}}
                  style={{marginLeft:8,fontFamily:"'Cinzel'",fontSize:10,padding:"3px 10px",
                    background:`${C.hp}30`,border:`1px solid ${C.hp}`,color:C.hp,borderRadius:3,cursor:"pointer"}}>RETRY</button>}
              </div>
            )}
            {chosen && chosen===activeQuestion.correct && activeQuestion.explanation && (
              <div style={{marginTop:8,background:"#27ae6015",border:"1px solid #27ae6040",borderRadius:4,padding:"8px 12px",
                fontFamily:"'Crimson Text'",color:"#1a4a2a",fontSize:12,lineHeight:1.5}}>
                ✓ {activeQuestion.explanation}
              </div>
            )}
          </ParchmentCard>
        )}

        {!showOrient && !activeQuestion && (
          <div style={{textAlign:"center",padding:"6px 0"}}>
            <div style={{fontFamily:"'Crimson Text'",fontStyle:"italic",color:C.moon,fontSize:13,marginBottom:6}}>
              {allCleared ? "All corners cleared — the north door glows. Press ▲ to leave." : "Walk to a glowing corner with the arrows (or your keyboard arrow keys)."}
            </div>
            <ArrowPad onMove={handleMove} disabled={moving}/>
          </div>
        )}
      </div>

      {showReward && <RewardOverlay xp={activeQuestion?.xp} gold={activeQuestion?.gold} isBoss={activeQuestion?.boss} onContinue={handleRewardContinue}/>}
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function DilrDungeon() {
  const [screen, setScreen] = useState("title");
  const [activeLevel, setActiveLevel] = useState(null);
  const [activeSet, setActiveSet]   = useState(null);
  const [setCompleteData, setSetCompleteData] = useState(null);
  const [gs, setGs] = useState({ lives:5, xp:0, gold:0, hintsLeft:3 });

  useEffect(()=>{
    const s = document.createElement("style");
    s.textContent = css;
    document.head.appendChild(s);
    return ()=>document.head.removeChild(s);
  }, []);

  const handleSetComplete = useCallback((xpEarned, goldEarned) => {
    setSetCompleteData({ xpEarned, goldEarned });
    setScreen("set-complete");
  }, []);

  if (screen==="title")
    return <TitleScreen onStart={()=>setScreen("map")}/>;

  if (screen==="map")
    return <MapScreen totalXp={gs.xp} totalGold={gs.gold}
      onSelectLevel={lvl=>{ setActiveLevel(lvl); setScreen("set-select"); }}/>;

  if (screen==="set-select")
    return <SetSelectScreen level={activeLevel} onBack={()=>setScreen("map")}
      onSelectSet={set=>{ setActiveSet(set); setGs(s=>({...s,lives:5,hintsLeft:3})); setScreen("puzzle"); }}/>;

  if (screen==="puzzle" && activeSet)
    return <PuzzleScreen level={activeLevel} set={activeSet} gs={gs} setGs={setGs}
      onComplete={(xp,gold)=>{ handleSetComplete(xp,gold); }}/>;

  if (screen==="set-complete")
    return <SetCompleteScreen set={activeSet} level={activeLevel}
      xpEarned={setCompleteData?.xpEarned||0} goldEarned={setCompleteData?.goldEarned||0}
      onContinue={()=>setScreen("map")}/>;

  return null;
}
