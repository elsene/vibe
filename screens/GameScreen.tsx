import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Dimensions, Pressable, StyleSheet, Text, Vibration, View } from "react-native";
import Svg, { Circle, Defs, Line, LinearGradient, RadialGradient, Stop } from "react-native-svg";
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';
import { theme } from '../theme';

// Types
interface Position {
  x: number;
  y: number;
}

interface Piece {
  owner: string;
  king?: boolean;
}

interface Move {
  from: string;
  to: string;
  over?: string;
  kind?: string;
}

interface GameState {
  pieces: { [key: string]: Piece | null };
  turn: string;
  history: Move[];
  mustContinueFrom: string | null;
}

interface Geometry {
  pos: { [key: string]: Position };
  lines: string[][];
  adj: { [key: string]: string[] };
  size: number;
  segs: { a: string; b: string }[];
  cx: number;
  cy: number;
  neighbourDistances: { [key: string]: number };
}

const { width: W, height: H } = Dimensions.get("window");

/* ------------------- NŒUDS ------------------- */
const OUTER = [...Array(12)].map((_, i) => `O${i}`);
const MO = [...Array(12)].map((_, i) => `MO${i}`);
const MI = [...Array(12)].map((_, i) => `MI${i}`);
const INNER = [...Array(12)].map((_, i) => `I${i}`);
const NODES = [...OUTER, ...MO, ...MI, ...INNER, "C"]; // 12*4 + centre = 49

/* ------------------- LIGNES : anneaux + 12 rayons continus ------------------- */
const buildLines = () => {
  const rings = [
    [...Array(12)].map((_, i) => `O${i}`).concat("O0"),
    [...Array(12)].map((_, i) => `MO${i}`).concat("MO0"),
    [...Array(12)].map((_, i) => `MI${i}`).concat("MI0"),
    [...Array(12)].map((_, i) => `I${i}`).concat("I0"),
  ];
  const spokes = [...Array(12)].map((_, i) => {
    const opp = (i + 6) % 12;
    return [
      `O${i}`, `MO${i}`, `MI${i}`, `I${i}`, "C",
      `I${opp}`, `MI${opp}`, `MO${opp}`, `O${opp}`,
    ];
  });
  return [...rings, ...spokes];
};
const LINES = buildLines();

/* ------------------- GÉOMÉTRIE ------------------- */
function useGeom(size = Math.min(W - 20, Math.min(H - 120, 620))): Geometry {
  const cx = size / 2, cy = size / 2;
  const rO = size * 0.45, rMO = size * 0.355, rMI = size * 0.255, rI = size * 0.16;

  const pos: { [key: string]: Position } = {};
  const putCircle = (prefix: string, r: number) => {
    for (let i = 0; i < 12; i++) {
      const a = (Math.PI * 2 * i) / 12 - Math.PI / 2;
      pos[`${prefix}${i}`] = { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
    }
  };
  putCircle("O", rO);
  putCircle("MO", rMO);
  putCircle("MI", rMI);
  putCircle("I", rI);
  pos.C = { x: cx, y: cy };

  // segments (dédupliqués par coordonnées arrondies)
  const seen = new Set<string>();
  const segs: { a: string; b: string }[] = [];
  const edgeKey = (a: string, b: string): string => {
    const A = pos[a], B = pos[b];
    const x1 = Math.round(A.x), y1 = Math.round(A.y);
    const x2 = Math.round(B.x), y2 = Math.round(B.y);
    return x1 < x2 || (x1 === x2 && y1 < y2)
      ? `${x1},${y1}|${x2},${y2}`
      : `${x2},${y2}|${x1},${y1}`;
  };
  for (const L of LINES) {
    for (let i = 0; i < L.length - 1; i++) {
      const a = L[i], b = L[i + 1];
      const k = edgeKey(a, b);
      if (!seen.has(k)) { seen.add(k); segs.push({ a, b }); }
    }
  }

  // ordre local entre voisins (pour dimensionner halo)
  const neighbourDistances: { [key: string]: number } = {};
  for (const n of NODES) {
    const p = pos[n]; if (!p) continue;
    let nearest = Infinity;
    for (const L of LINES) {
      const idx = L.indexOf(n);
      if (idx < 0) continue;
      const neighs = [L[idx - 1], L[idx + 1]].filter(Boolean);
      for (const m of neighs) {
        const q = pos[m];
        nearest = Math.min(nearest, Math.hypot(p.x - q.x, p.y - q.y));
      }
    }
    neighbourDistances[n] = isFinite(nearest) ? nearest : size * 0.08;
  }

  return { size, pos, segs, cx, cy, neighbourDistances, lines: LINES, adj: ADJ };
}

/* ------------------- RÈGLES ------------------- */
const buildAdj = (): { [key: string]: string[] } => {
  const g: { [key: string]: string[] } = {};
  NODES.forEach(n => (g[n] = []));
  const add = (u: string, v: string) => {
    if (!g[u].includes(v)) g[u].push(v);
    if (!g[v].includes(u)) g[v].push(u);
  };
  for (const L of LINES) for (let i = 0; i < L.length - 1; i++) add(L[i], L[i + 1]);
  return g;
};
const ADJ = buildAdj();

// Fonction pour extraire le numéro d'un nœud
const extractNumber = (node: string): number | null => {
  const match = node.match(/\d+/);
  return match ? parseInt(match[0]) : null;
};

// Fonction pour déterminer le cercle d'un nœud
const getCircle = (node: string): string => {
  if (node === "C") return "center";
  if (node.startsWith("O")) return "outer";
  if (node.startsWith("MO")) return "middleOuter";
  if (node.startsWith("MI")) return "middleInner";
  if (node.startsWith("I")) return "inner";
  return "unknown";
};

const landingAfter = (from: string, over: string, pieces: { [key: string]: Piece | null }): string | null => {
  console.log(`🎯 landingAfter: ${from} -> ${over} - VERSION CORRIGÉE`);
  
  // Captures uniquement en ligne droite (le long des lignes existantes)
  for (const L of LINES) {
    const iF = L.indexOf(from), iO = L.indexOf(over);
    if (iF < 0 || iO < 0) continue;
    const d = iO - iF;
    if (Math.abs(d) !== 1) continue;
    const iT = iO + d;
    if (iT >= 0 && iT < L.length) {
      const landingNode = L[iT];
      console.log(`    Vérifiant position d'atterrissage: ${landingNode} (libre: ${!pieces[landingNode]})`);
      if (!pieces[landingNode]) {
        console.log(`  ✅ Capture ligne droite: ${from} -> ${over} -> ${landingNode}`);
        return landingNode;
      } else {
        console.log(`    Position d'atterrissage occupée par: ${pieces[landingNode]}`);
      }
    } else {
      console.log(`    Position d'atterrissage hors limites: ${iT}`);
    }
  }
  
  // Si aucune capture en ligne droite, essayer les captures latérales
  console.log(`  🔄 Essai de capture latérale...`);
  const fromCircle = getCircle(from);
  const overCircle = getCircle(over);
  
  if (fromCircle === overCircle && fromCircle !== "center") {
    const fromNum = extractNumber(from);
    const overNum = extractNumber(over);
    if (fromNum !== null && overNum !== null) {
      const direction = overNum > fromNum ? 1 : -1;
      const targetNum = (overNum + direction + 12) % 12;
      let targetNode;
      
      if (fromCircle === "outer") targetNode = `O${targetNum}`;
      else if (fromCircle === "middleOuter") targetNode = `MO${targetNum}`;
      else if (fromCircle === "middleInner") targetNode = `MI${targetNum}`;
      else if (fromCircle === "inner") targetNode = `I${targetNum}`;
      
      if (targetNode && !pieces[targetNode]) {
        console.log(`  ✅ Capture latérale: ${from} -> ${over} -> ${targetNode}`);
        return targetNode;
      }
    }
  }
  
  console.log(`  ❌ Aucune capture trouvée`);
  return null;
};

// Types pour les pièces
type Pieces = Record<string, Piece | null>;

// position initiale : 24 vs 24 (moité haute / basse)
const initialPieces = (): Pieces => {
  const pieces: Pieces = {};
  // Rouge (A) : indices 0..5 sur chaque anneau
  for (let i = 0; i < 6; i++) {
    pieces[`O${i}`] = { owner: "A" };
    pieces[`MO${i}`] = { owner: "A" };
    pieces[`MI${i}`] = { owner: "A" };
    pieces[`I${i}`] = { owner: "A" };
  }
  // Bleu (B) : indices 6..11
  for (let i = 6; i < 12; i++) {
    pieces[`O${i}`] = { owner: "B" };
    pieces[`MO${i}`] = { owner: "B" };
    pieces[`MI${i}`] = { owner: "B" };
    pieces[`I${i}`] = { owner: "B" };
  }
  // centre libre
  return pieces;
};

// Fonction pour créer l'état initial avec les dames
const initialState = (): GameState => ({
  pieces: initialPieces(),
  turn: "A",
  history: [],
  mustContinueFrom: null
});

// Fonction pour vérifier si une pièce est une dame
const isQueen = (node: string, pieces: { [key: string]: Piece | null }) => {
  const piece = pieces[node];
  return piece?.king || false;
};

// Fonction pour promouvoir une pièce si nécessaire
const promoteIfNeeded = (state: any, node: string, piece: Piece): Piece => {
  // Promotion au centre
  if (node === "C") {
    return { ...piece, king: true };
  }
  
  // Autres règles de promotion peuvent être ajoutées ici
  return piece;
};

const genSteps = (s: GameState, p: string): Move[] => {
  const out: Move[] = [];
  for (const n of NODES) {
    const piece = s.pieces[n];
    if (piece?.owner === p) {
      const isQueenPiece = isQueen(n, s.pieces);
      
      if (isQueenPiece) {
        // Les dames peuvent se déplacer en sautant sur plusieurs cases libres
        for (const L of LINES) {
          const idx = L.indexOf(n);
          if (idx < 0) continue;
          
          // Vérifier dans les deux directions
          for (let direction = -1; direction <= 1; direction += 2) {
            let jumpDistance = 1;
            while (true) {
              const targetIdx = idx + (direction * jumpDistance);
              if (targetIdx < 0 || targetIdx >= L.length) break;
              
              const targetNode = L[targetIdx];
              if (s.pieces[targetNode]) break; // Case occupée, on s'arrête
              
              out.push({ kind: "step", from: n, to: targetNode });
              jumpDistance++;
            }
          }
        }
      } else {
        // Les pions normaux se déplacent d'une case
        for (const nb of ADJ[n]) if (!s.pieces[nb]) {
          out.push({ kind: "step", from: n, to: nb });
        }
      }
    }
  }
  return out;
};

const genJumpsFrom = (s: GameState, p: string, start: string): Move[] => {
  const out: Move[] = [];
  const piece = s.pieces[start];
  if (!piece || piece.owner !== p) return out;
  
  const isQueenPiece = isQueen(start, s.pieces);
  console.log(`🔍 Cherchant captures pour ${start} (${p}) ${isQueenPiece ? '👑' : '♟️'}`);
  
  if (isQueenPiece) {
    console.log(`  👑 Dame détectée, recherche de captures étendues...`);
    // Les dames peuvent capturer en sautant sur plusieurs cases
    for (const L of LINES) {
      const idx = L.indexOf(start);
      if (idx < 0) continue;
      
      // Vérifier dans les deux directions
      for (let direction = -1; direction <= 1; direction += 2) {
        let jumpDistance = 1;
        while (true) {
          const victimIdx = idx + (direction * jumpDistance);
          if (victimIdx < 0 || victimIdx >= L.length) break;
          
          const victimNode = L[victimIdx];
          const victimPiece = victimNode ? s.pieces[victimNode] : null;
          console.log(`    Vérifiant ${victimNode}: ${victimPiece?.owner}`);
          
          if (!victimPiece) {
            jumpDistance++;
            continue; // Case libre, continuer
          }
          
          if (victimPiece.owner === p) {
            console.log(`    Pièce alliée trouvée, arrêt`);
            break; // Pièce alliée, s'arrêter
          }
          
          // Victime trouvée, chercher la position d'atterrissage
          const landingIdx = victimIdx + direction;
          if (landingIdx < 0 || landingIdx >= L.length) break;
          
          const landingNode = L[landingIdx];
          console.log(`    Position d'atterrissage: ${landingNode} (libre: ${!s.pieces[landingNode]})`);
          
          if (!s.pieces[landingNode]) {
            console.log(`  ✅ Capture dame: ${start} -> ${victimNode} -> ${landingNode}`);
            out.push({ kind: "jump", from: start, over: victimNode, to: landingNode });
          }
          break; // Une seule capture par direction
        }
      }
    }
  } else {
    // 1. Captures depuis les voisins directs (lignes existantes)
    for (const nb of ADJ[start]) {
      const victim = nb;
      const victimPiece = s.pieces[victim];
      console.log(`  Voisin direct: ${victim}, contient: ${victimPiece?.owner}`);
      if (victimPiece && victimPiece.owner !== p) {
        console.log(`  Victime trouvée: ${victim} (${victimPiece.owner})`);
        const land = landingAfter(start, victim, s.pieces);
        console.log(`  Position d'atterrissage: ${land}`);
        if (land && !s.pieces[land]) {
          console.log(`  ✅ Capture ligne droite: ${start} -> ${victim} -> ${land}`);
          out.push({ kind: "jump", from: start, over: victim, to: land });
        }
      }
    }
    
    // 2. Captures latérales sur tous les cercles
    const startCircle = getCircle(start);
    if (startCircle !== "center") {
      const startNum = extractNumber(start);
      if (startNum !== null) {
        // Vérifier les captures latérales dans les deux directions
        for (let direction = -1; direction <= 1; direction += 2) {
          const victimNum = (startNum + direction + 12) % 12;
          let victimNode;
          
          // Construire le nom du nœud victime
          if (startCircle === "outer") victimNode = `O${victimNum}`;
          else if (startCircle === "middleOuter") victimNode = `MO${victimNum}`;
          else if (startCircle === "middleInner") victimNode = `MI${victimNum}`;
          else if (startCircle === "inner") victimNode = `I${victimNum}`;
          
          // Vérifier si la victime existe et est de la couleur adverse
          const victimPiece = victimNode ? s.pieces[victimNode] : null;
          if (victimPiece && victimPiece.owner !== p) {
            // Calculer la position d'atterrissage latérale
            const targetNum = (victimNum + direction + 12) % 12;
            let targetNode;
            
            if (startCircle === "outer") targetNode = `O${targetNum}`;
            else if (startCircle === "middleOuter") targetNode = `MO${targetNum}`;
            else if (startCircle === "middleInner") targetNode = `MI${targetNum}`;
            else if (startCircle === "inner") targetNode = `I${targetNum}`;
            
            // Vérifier si la position d'atterrissage est libre
            if (targetNode && !s.pieces[targetNode]) {
              console.log(`  ✅ Capture latérale: ${start} -> ${victimNode} -> ${targetNode}`);
              out.push({ kind: "jump", from: start, over: victimNode, to: targetNode });
            }
          }
        }
      }
    }
  }
  
  console.log(`  Total captures trouvées: ${out.length}`);
  return out;
};

const genJumps = (s: GameState, p: string): Move[] => {
  let out: Move[] = [];
  // Captures normales le long des lignes
  for (const n of NODES) {
    const piece = s.pieces[n];
    if (piece?.owner === p) {
      out = out.concat(genJumpsFrom(s, p, n));
    }
  }
  return out;
};

const legalMoves = (s: GameState): Move[] => {
  const p = s.turn;
  console.log(`🎯 Tour de ${p === 'A' ? 'Rouge' : 'Bleu'}`);
  
  if (s.mustContinueFrom) {
    console.log(`🔄 Continuation de capture depuis ${s.mustContinueFrom}`);
    return genJumpsFrom(s, p, s.mustContinueFrom); // chaîne de captures
  }
  
  const jumps = genJumps(s, p);
  console.log(`📊 Captures trouvées: ${jumps.length}`);
  
  if (jumps.length) {
    console.log(`⚠️ Capture obligatoire! ${jumps.length} captures disponibles`);
    return jumps; // capture obligatoire si possible
  }
  
  const steps = genSteps(s, p);
  console.log(`🚶 Mouvements simples: ${steps.length}`);
  return steps;
};

const applyMove = (s: GameState, m: Move): GameState => {
  const n: GameState = { 
    pieces: { ...s.pieces }, 
    turn: s.turn, 
    history: [...s.history, m], 
    mustContinueFrom: null 
  };
  
  const moving = s.pieces[m.from];
  if (!moving) return s; // garde-fou

  // libère la case source
  delete n.pieces[m.from];

  // place la pièce en destination (en conservant king/owner)
  n.pieces[m.to] = { ...moving };

  // si capture: retirer la victime + vérifier enchainement
  if (m.kind === "jump") {
    if (m.over) delete n.pieces[m.over];

    // promotion éventuelle avant d'enchaîner
    n.pieces[m.to] = promoteIfNeeded(n, m.to, n.pieces[m.to]!);

    const more = genJumpsFrom(n, moving.owner, m.to);
    if (more.length) {
      n.mustContinueFrom = m.to as string;    // on force le même pion à continuer
      return n;                     // tour non fini
    }
  } else {
    // pas simple → promotion éventuelle
    n.pieces[m.to] = promoteIfNeeded(n, m.to, n.pieces[m.to]!);
  }

  // fin de tour
  n.turn = moving.owner === "A" ? "B" : "A";
  return n;
};

const terminal = (s: GameState): boolean => {
  const a = Object.values(s.pieces).filter((p): p is Piece => p !== null).filter(p => p.owner === "A").length;
  const b = Object.values(s.pieces).filter((p): p is Piece => p !== null).filter(p => p.owner === "B").length;
  if (a === 0 || b === 0) return true;
  return legalMoves(s).length === 0;
};

// Fonction d'évaluation de position
const evaluatePosition = (state: GameState, aiColor: string): number => {
  let score = 0;
  
  // Compter les pièces
  for (const [pos, piece] of Object.entries(state.pieces)) {
    if (!piece) continue;
    
    const isQueenPiece = isQueen(pos, state.pieces);
    const pieceValue = isQueenPiece ? 3 : 1; // Les dames valent plus
    
    if (piece.owner === aiColor) {
      score += pieceValue;
    } else {
      score -= pieceValue;
    }
  }
  
  // Bonus pour les captures possibles
  const aiMoves = legalMoves(state).filter(move => {
    const piece = state.pieces[move.from];
    return piece && piece.owner === aiColor;
  });
  
  const captures = aiMoves.filter(move => move.kind === 'jump');
  score += captures.length * 0.5; // Bonus pour les captures
  
  // Bonus pour le centre (position stratégique)
  const centerPiece = state.pieces['C'];
  if (centerPiece && centerPiece.owner === aiColor) {
    score += 0.3;
  }
  
  return score;
};

// IA Minimax optimisée avec élagage alpha-beta et timeout
const minimax = (state: GameState, depth: number, isMaximizing: boolean, aiColor: string, alpha: number = -Infinity, beta: number = Infinity, startTime: number = Date.now(), maxTime: number = 2000): number => {
  // Timeout pour éviter les blocages
  if (Date.now() - startTime > maxTime) {
    return evaluatePosition(state, aiColor);
  }
  
  if (depth === 0 || terminal(state)) {
    return evaluatePosition(state, aiColor);
  }
  
  const moves = legalMoves(state).filter(move => {
    const piece = state.pieces[move.from];
    return piece && piece.owner === (isMaximizing ? aiColor : (aiColor === 'A' ? 'B' : 'A'));
  });
  
  if (moves.length === 0) {
    return evaluatePosition(state, aiColor);
  }
  
  // Limiter le nombre de mouvements évalués pour la performance
  const maxMoves = Math.min(moves.length, 8);
  const movesToEvaluate = moves.slice(0, maxMoves);
  
  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of movesToEvaluate) {
      const newState = applyMove(state, move);
      const evaluation = minimax(newState, depth - 1, false, aiColor, alpha, beta, startTime, maxTime);
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break; // Élagage alpha-beta
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of movesToEvaluate) {
      const newState = applyMove(state, move);
      const evaluation = minimax(newState, depth - 1, true, aiColor, alpha, beta, startTime, maxTime);
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break; // Élagage alpha-beta
    }
    return minEval;
  }
};

// IA intelligente avec différents niveaux de difficulté
const aiMove = (state: GameState, difficulty: string, aiColor: string): Move | null => {
  try {
    console.log('🤖 IA analyse l\'état:', state.turn, 'difficulté:', difficulty);
    const legalMovesList = legalMoves(state).filter(move => {
      const piece = state.pieces[move.from];
      return piece && piece.owner === aiColor;
    });
    
    console.log('🤖 Mouvements légaux IA trouvés:', legalMovesList.length);
    
    if (legalMovesList.length === 0) {
      console.log('🤖 Aucun mouvement légal disponible');
      return null;
    }
    
    let selectedMove: Move;
    
    switch (difficulty) {
      case 'easy':
        // IA facile : mouvements aléatoires avec préférence pour les captures
        const captures = legalMovesList.filter(move => move.kind === 'jump');
        if (captures.length > 0) {
          selectedMove = captures[Math.floor(Math.random() * captures.length)];
        } else {
          selectedMove = legalMovesList[Math.floor(Math.random() * legalMovesList.length)];
        }
        console.log('🤖 IA Facile - Mouvement aléatoire:', selectedMove);
        break;
        
      case 'mid':
        // IA moyenne : minimax avec profondeur 1 + timeout
        let bestScore = -Infinity;
        selectedMove = legalMovesList[0];
        const startTimeMid = Date.now();
        
        // Limiter à 6 mouvements pour la performance
        const movesToEvaluateMid = legalMovesList.slice(0, 6);
        
        for (const move of movesToEvaluateMid) {
          if (Date.now() - startTimeMid > 1500) break; // Timeout 1.5s
          const newState = applyMove(state, move);
          const score = minimax(newState, 1, false, aiColor, -Infinity, Infinity, startTimeMid, 1500);
          if (score > bestScore) {
            bestScore = score;
            selectedMove = move;
          }
        }
        console.log('🤖 IA Moyenne - Score:', bestScore, 'Mouvement:', selectedMove);
        break;
        
      case 'hard':
        // IA difficile : minimax avec profondeur 2 + optimisations
        let bestScoreHard = -Infinity;
        selectedMove = legalMovesList[0];
        const startTimeHard = Date.now();
        
        // Trier les mouvements pour améliorer l'élagage alpha-beta
        const sortedMoves = legalMovesList.sort((a, b) => {
          const aIsCapture = a.kind === 'jump' ? 1 : 0;
          const bIsCapture = b.kind === 'jump' ? 1 : 0;
          return bIsCapture - aIsCapture; // Captures en premier
        });
        
        // Limiter à 8 mouvements pour la performance
        const movesToEvaluateHard = sortedMoves.slice(0, 8);
        
        for (const move of movesToEvaluateHard) {
          if (Date.now() - startTimeHard > 2000) break; // Timeout 2s
          const newState = applyMove(state, move);
          const score = minimax(newState, 2, false, aiColor, -Infinity, Infinity, startTimeHard, 2000);
          if (score > bestScoreHard) {
            bestScoreHard = score;
            selectedMove = move;
          }
        }
        console.log('🤖 IA Difficile - Score:', bestScoreHard, 'Mouvement:', selectedMove);
        break;
        
      default:
        selectedMove = legalMovesList[0];
    }
    
    return selectedMove;
  } catch (error) {
    console.error('🤖 Erreur dans aiMove:', error);
    return legalMoves(state).filter(move => {
      const piece = state.pieces[move.from];
      return piece && piece.owner === aiColor;
    }).length > 0 ? legalMoves(state).filter(move => {
      const piece = state.pieces[move.from];
      return piece && piece.owner === aiColor;
    })[0] : null;
  }
};

export default function GameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors } = useTheme();
  const { settings } = useSettings();
  const { t } = useLanguage();
  
  const mode = params.mode as string || 'local';
  const difficulty = settings.difficulty; // Utilise les paramètres sauvegardés
  const adsDisabled = params.adsDisabled === 'true';

  // Constantes IA
  const AI_THINK_MS = difficulty === 'easy' ? 1200 : difficulty === 'mid' ? 2000 : 3200;
  const aiColor = 'B'; // L'IA joue toujours Bleu

  const [size, setSize] = useState(Math.min(W - 20, Math.min(H - 120, 620)));
  const [state, setState] = useState<GameState>(initialState());
  const [sel, setSel] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(14);
  const [isTimerActive, setIsTimerActive] = useState(true);
  
  // États IA robustes
  const [aiThinking, setAiThinking] = useState(false);
  const [aiRemainingMs, setAiRemainingMs] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isAITurn, setIsAITurn] = useState(false);
  
  // États pour la modal pause
  const [showPauseModal, setShowPauseModal] = useState(false);
  
  // États pour la punition
  const [punishmentAnimation, setPunishmentAnimation] = useState<string | null>(null);
  
  // États pour la fin de jeu
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [gameWinner, setGameWinner] = useState<string | null>(null);
  const [finalScore, setFinalScore] = useState({ red: 0, blue: 0 });
  
  // Refs pour éviter les closures périmées
  const aiTimerRef = useRef<number | null>(null);
  const aiDeadlineRef = useRef<number | null>(null);
  const stateRef = useRef(state);
  
  // Synchroniser stateRef avec state
  useEffect(() => { 
    stateRef.current = state; 
  }, [state]);

  // Gérer le tour de l'IA
  useEffect(() => {
    if (mode === 'ai') {
      setIsAITurn(state.turn === aiColor);
    } else {
      setIsAITurn(false);
    }
  }, [state.turn, mode, aiColor]);
  
  
  // Fonction utilitaire pour lire l'état actuel
  const getLatestState = () => stateRef.current;
  
  
  // Fonctions helpers IA
  const startAiTimer = (totalMs: number) => {
    aiDeadlineRef.current = Date.now() + totalMs;
    setAiRemainingMs(totalMs);
    if (aiTimerRef.current) clearInterval(aiTimerRef.current);
    aiTimerRef.current = setInterval(() => {
      // Mettre en pause le timer IA si la modal pause est ouverte
      if (showPauseModal) {
        return;
      }
      const left = Math.max(0, (aiDeadlineRef.current ?? 0) - Date.now());
      setAiRemainingMs(left);
      if (left <= 0) {
        clearInterval(aiTimerRef.current!);
        aiTimerRef.current = null;
      }
    }, 100);
  };

  const stopAiTimer = () => {
    if (aiTimerRef.current) clearInterval(aiTimerRef.current);
    aiTimerRef.current = null;
    aiDeadlineRef.current = null;
    setAiRemainingMs(0);
  };

  const waitUntilDeadlineOrCancel = (): Promise<void> => {
    return new Promise(resolve => {
      const tick = () => {
        const done = !aiDeadlineRef.current || (aiDeadlineRef.current - Date.now()) <= 0;
        if (done) return resolve();
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  };

  const getBestMoveSafely = (s: GameState, moves: Move[]): Move | null => {
    try {
      // Pour l'instant, on utilise une logique simple
      // Priorité: captures > promotion > mouvement vers le centre
      const sortedMoves = moves.sort((a, b) => {
        if (a.kind === "jump" && b.kind !== "jump") return -1;
        if (b.kind === "jump" && a.kind !== "jump") return 1;
        if (a.to === "C" && b.to !== "C") return -1;
        if (b.to === "C" && a.to !== "C") return 1;
        return 0;
      });
      return sortedMoves[0];
    } catch (e) {
      console.warn('getBestMove failed, fallback random', e);
      return null;
    }
  };

  const delay = (ms: number) => {
    return new Promise(res => setTimeout(res, ms));
  };

  const playMoveWithAnimation = async (first: Move) => {
    setIsAnimating(true);

    // Applique le 1er coup
    setState(prev => applyMove(prev, first));

    // Si c'est un saut et que d'autres sauts sont possibles, on enchaîne
    let current = first;
    let s = getLatestState();
    
    // Attendre un tick pour que l'état soit mis à jour
    await delay(100);
    s = getLatestState();
    
    while (current.kind === 'jump' && s && s.mustContinueFrom) {
      await delay(250);
      const more = genJumpsFrom(s, s.turn, s.mustContinueFrom);
      if (!more || more.length === 0) break;
      const next = more[0];
      console.log(`🤖 IA continue: ${next.from} -> ${next.to} (${next.kind})`);
      setState(prev => applyMove(prev, next));
      await delay(100);
      s = getLatestState();
      current = next;
    }

    setIsAnimating(false);
  };

  const endGameBecauseNoMoves = () => {
    console.log('Fin de partie - aucun mouvement possible');
    // Ne pas reset automatiquement, laisser l'utilisateur décider
    setAiThinking(false);
    setIsAITurn(false);
  };

  const checkGameOver = () => {
    const countA = Object.values(state.pieces).filter((p): p is Piece => p !== null).filter(p => p.owner === "A").length;
    const countB = Object.values(state.pieces).filter((p): p is Piece => p !== null).filter(p => p.owner === "B").length;
    
    if (countA === 0 || countB === 0) {
      const winner = countA === 0 ? "B" : "A";
      const winnerName = winner === "A" ? "Rouge" : "Bleu";
      
      setGameWinner(winnerName);
      setFinalScore({ red: countA, blue: countB });
      setShowGameOverModal(true);
      
      // Arrêter le timer et l'IA
      setAiThinking(false);
      setIsAITurn(false);
      setIsTimerActive(false);
      
      // Effets sonores et haptiques
      if (settings.soundEffects) {
        // TODO: Jouer un son de victoire
        console.log('🔊 Son de victoire');
      }
      if (settings.vibration) {
        Vibration.vibrate([0, 500, 200, 500]); // Vibration de victoire
      }
      
      console.log(`🎉 Fin de partie ! Gagnant: ${winnerName}`);
      return true;
    }
    return false;
  };

  const playSound = (type: 'move' | 'capture' | 'error' | 'victory') => {
    if (!settings.soundEffects) return;
    
    // TODO: Implémenter les sons réels
    console.log(`🔊 Son: ${type}`);
  };

  const playVibration = (type: 'move' | 'capture' | 'error' | 'victory') => {
    if (!settings.vibration) return;
    
    switch (type) {
      case 'move':
        Vibration.vibrate(50);
        break;
      case 'capture':
        Vibration.vibrate([0, 100, 50, 100]);
        break;
      case 'error':
        Vibration.vibrate([0, 200, 100, 200]);
        break;
      case 'victory':
        Vibration.vibrate([0, 500, 200, 500]);
        break;
    }
  };
  
  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const turnIndicatorAnim = useRef(new Animated.Value(1)).current;
  const boardGlowAnim = useRef(new Animated.Value(0)).current;
  const selectionAnim = useRef(new Animated.Value(0)).current;

  const geom = useGeom(size);
  const legal = useMemo(() => legalMoves(state), [state]);
  const movesByFrom = useMemo(() => {
    const m: { [key: string]: Move[] } = {};
    for (const mv of legal) (m[mv.from] ??= []).push(mv);
    return m;
  }, [legal]);

  // Animation de pulsation pour les pièces du joueur actuel
  useEffect(() => {
    if (isTimerActive && !aiThinking && !isAnimating) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [state.turn, isTimerActive, aiThinking, isAnimating]);

  // Animation de l'indicateur de tour
  useEffect(() => {
    Animated.sequence([
      Animated.timing(turnIndicatorAnim, {
        toValue: 1.05,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(turnIndicatorAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [state.turn]);

  // Animation du glow du plateau
  useEffect(() => {
    Animated.timing(boardGlowAnim, {
      toValue: state.turn === "A" ? 1 : 0,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [state.turn]);

  // Animation de sélection
  useEffect(() => {
    if (sel) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(selectionAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(selectionAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      selectionAnim.setValue(0);
    }
  }, [sel]);

  // Timer
  useEffect(() => {
    let interval: number | undefined;
    if (isTimerActive && timeLeft > 0 && !aiThinking && !isAnimating && !showPauseModal) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Temps écoulé - vérifier s'il y avait des captures obligatoires
            const currentState = getLatestState();
            const jumps = genJumps(currentState, currentState.turn);
            
            if (jumps.length > 0 && !(mode === 'ai' && currentState.turn === aiColor)) {
              console.log('⚠️ Temps écoulé avec captures obligatoires! Punition appliquée.');
              // Supprimer une pièce aléatoire qui devait capturer
              const piecesThatMustCapture = new Set<string>();
              jumps.forEach(jump => {
                piecesThatMustCapture.add(jump.from);
              });
              const randomPiece = Array.from(piecesThatMustCapture)[Math.floor(Math.random() * piecesThatMustCapture.size)];
              
              // Animation de punition
              setPunishmentAnimation(randomPiece);
              setTimeout(() => setPunishmentAnimation(null), 1000);
              
              setState(prevState => {
                const newState = { ...prevState };
                delete newState.pieces[randomPiece];
                // Passer au tour suivant après la punition
                newState.turn = prevState.turn === "A" ? "B" : "A";
                return newState;
              });
            } else {
              // Pas de captures obligatoires, passage normal au tour suivant
            setState(prevState => ({
              ...prevState,
              turn: prevState.turn === "A" ? "B" : "A"
            }));
            }
            return 11; // Reset timer
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft, aiThinking, isAnimating, showPauseModal]);

  // Reset timer quand le tour change
  useEffect(() => {
    setTimeLeft(settings.timerDuration);
  }, [state.turn, settings.timerDuration]);

  // Vérifier la fin de jeu après chaque changement d'état
  useEffect(() => {
    checkGameOver();
  }, [state.pieces]);

  // Fonction principale thinkAndPlay asynchrone et robuste
  const thinkAndPlay = async () => {
    setAiThinking(true);

    // Démarrage du timer visuel
    startAiTimer(AI_THINK_MS);

    // Récupère les coups légaux pour l'IA (Bleu)
    const moves = legalMoves(state);
    
    // Vérification de sécurité : l'IA ne doit jouer que ses propres pièces
    const aiMoves = moves.filter(move => {
      const piece = state.pieces[move.from];
      return piece && piece.owner === aiColor;
    });

    console.log(`🤖 IA (${aiColor}) - Coups légaux totaux: ${moves.length}, Coups IA: ${aiMoves.length}`);

    // Si aucun coup légal pour l'IA -> fin de partie
    if (!aiMoves || aiMoves.length === 0) {
      stopAiTimer();
      setAiThinking(false);
      endGameBecauseNoMoves();
      return;
    }

    // Laisse "réfléchir" jusqu'à l'échéance (sans bloquer)
    await waitUntilDeadlineOrCancel();

    // Sélectionne un coup avec notre IA intelligente
    let best = aiMove(state, difficulty, aiColor);
    if (!best) best = aiMoves[Math.floor(Math.random() * aiMoves.length)];

    console.log(`🤖 IA joue: ${best.from} -> ${best.to} (${best.kind})`);

    stopAiTimer();

    // Joue le coup
    await playMoveWithAnimation(best);

    setAiThinking(false);
  };

  // Déclenchement automatique du tour IA
  useEffect(() => {
    if (!isAITurn || aiThinking || isAnimating) return;

    // Lance la réflexion IA de manière asynchrone
    thinkAndPlay();
  }, [isAITurn, aiThinking, isAnimating]);

  // Cleanup des timers
  useEffect(() => {
    return () => stopAiTimer();
  }, []);

  useEffect(() => {
    if (state.history.length === 0) return;
    if (terminal(state)) {
      const a = Object.values(state.pieces).filter((p): p is Piece => p !== null).filter(p => p.owner === "A").length;
      const b = Object.values(state.pieces).filter((p): p is Piece => p !== null).filter(p => p.owner === "B").length;
      const w = a === 0 ? "B" : b === 0 ? "A" : (state.turn === "A" ? "B" : "A");
      
      // Navigation vers la modal de victoire
      // TODO: Implement win modal with expo-router
      console.log('Game won by:', w);
      // Ne pas reset automatiquement, laisser l'utilisateur décider
      setAiThinking(false);
      setIsAITurn(false);
    }
  }, [state, router]);

  const tap = (n: string) => {
    // Empêcher les interactions pendant le tour de l'IA ou les animations
    if (aiThinking || isAnimating) {
      console.log('🎯 Interaction bloquée - IA réfléchit ou animation en cours');
      return;
    }
    
    // En mode IA, empêcher le joueur humain de jouer quand c'est le tour de l'IA
    if (mode === 'ai' && state.turn === aiColor) {
      console.log('🎯 Interaction bloquée - C\'est le tour de l\'IA');
      return;
    }
    
    console.log('🎯 Clic sur:', n, 'Tour actuel:', state.turn, 'Mode:', mode);
    
    const piece = state.pieces[n];
    const mine = piece?.owner === state.turn;
    if (!sel) { 
      if (mine && movesByFrom[n]) setSel(n); 
      return; 
    }
    if (n === sel) { setSel(null); return; }
    
    const mv = (movesByFrom[sel] || []).find(m => m.to === n);
    if (!mv) { 
      if (mine && movesByFrom[n]) setSel(n); 
      return; 
    }
    
    console.log('🔍 Debug mouvement:', {
      moveKind: mv.kind,
      moveFrom: mv.from,
      moveTo: mv.to,
      moveOver: mv.over
    });
    
    const next = applyMove(state, mv);
    console.log('🎯 Mouvement effectué:', mv, 'Nouveau tour:', next.turn);
    setState(next);
    setSel(next.mustContinueFrom ? next.mustContinueFrom : null);
  };

  const reset = () => { 
    setState(initialState()); 
    setSel(null); 
    setTimeLeft(14);
    setIsTimerActive(true);
    setIsAITurn(false);
  };

  const handlePause = () => {
    setShowPauseModal(true);
  };

  const handleQuit = () => {
    router.push('/menu');
  };

  const handleNewGame = () => {
    reset();
    setShowPauseModal(false);
  };

  const handleGameOverNewGame = () => {
    reset();
    setShowGameOverModal(false);
    setGameWinner(null);
    setFinalScore({ red: 0, blue: 0 });
  };

  const handleGameOverQuit = () => {
    setShowGameOverModal(false);
    setGameWinner(null);
    setFinalScore({ red: 0, blue: 0 });
    router.push('/menu');
  };

  const countA = Object.values(state.pieces).filter((p): p is Piece => p !== null).filter(p => p.owner === "A").length;
  const countB = Object.values(state.pieces).filter((p): p is Piece => p !== null).filter(p => p.owner === "B").length;

  // Couleurs pour les scores
  const redColor = colors.redPiece;
  const blueColor = colors.bluePiece;
  const currentPlayerColor = state.turn === "A" ? redColor : blueColor;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      {/* Header moderne */}
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <View style={styles.logoContainer}>
          <Text style={[styles.logoMain, { color: theme.colors.text }]}>WHEEL</Text>
          <Text style={[styles.logoSub, { color: theme.colors.textDim }]}>CHECKERS</Text>
        </View>
        
        {/* Indicateur de tour moderne */}
        <Animated.View 
          style={[
            styles.messageBoard,
            { 
              backgroundColor: aiThinking ? theme.colors.blue : theme.colors.panel,
              transform: [{ scale: turnIndicatorAnim }]
            }
          ]}
        >
          <Text style={[styles.messageText, { color: theme.colors.text }]}>
            {aiThinking ? `${t('game.ai_thinking')} ${Math.ceil(aiRemainingMs/100)/10}s` : `${t('game.turn')} : ${state.turn === "A" ? t('game.red') : t('game.blue')}`}
          </Text>
          
          {/* Timer moderne */}
          <View style={styles.timerContainer}>
            <Text style={[styles.timerText, { color: theme.colors.text }]}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </Text>
            <View style={[styles.timerBarContainer, { backgroundColor: theme.colors.divider }]}>
              <View style={[
                styles.timerBar, 
                { 
                  width: aiThinking 
                    ? `${Math.max(0, 1 - aiRemainingMs/AI_THINK_MS) * 100}%`
                    : `${(timeLeft / 14) * 100}%`,
                  backgroundColor: aiThinking ? theme.colors.blue : theme.colors.ok
                }
              ]} />
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Message de punition */}
      {punishmentAnimation && (
        <View style={[styles.punishmentMessage, { backgroundColor: theme.colors.red }]}>
          <Text style={[styles.punishmentText, { color: theme.colors.text }]}>
            ⚠️ {t('game.punishment.message')}
          </Text>
        </View>
      )}

      {/* Plateau de jeu moderne */}
      <Animated.View 
        style={[
          styles.boardContainer,
          {
            shadowColor: theme.colors.text,
            shadowOpacity: boardGlowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.1, 0.3],
            }),
            shadowRadius: boardGlowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [8, 16],
            }),
          }
        ]}
      >
        <Svg width="100%" height="100%" viewBox={`0 0 ${geom.size} ${geom.size}`}>
          <Defs>
            {/* Gradient du board moderne */}
            <RadialGradient id="boardGrad" cx="50%" cy="50%" r="65%">
              <Stop offset="0%" stopColor={theme.colors.boardTop} />
              <Stop offset="100%" stopColor={theme.colors.boardBot} />
            </RadialGradient>
            
            {/* Pions rouges modernes */}
            <LinearGradient id="pieceRed" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={theme.colors.red} />
              <Stop offset="100%" stopColor={theme.colors.redDark} />
            </LinearGradient>
            
            {/* Pions bleus modernes */}
            <LinearGradient id="pieceBlue" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={theme.colors.blue} />
              <Stop offset="100%" stopColor={theme.colors.blueDark} />
            </LinearGradient>
            
            {/* Dames rouges modernes */}
            <LinearGradient id="queenRed" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={theme.colors.red} />
              <Stop offset="50%" stopColor={theme.colors.redDark} />
              <Stop offset="100%" stopColor={theme.colors.red} />
            </LinearGradient>
            
            {/* Dames bleues modernes */}
            <LinearGradient id="queenBlue" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={theme.colors.blue} />
              <Stop offset="50%" stopColor={theme.colors.blueDark} />
              <Stop offset="100%" stopColor={theme.colors.blue} />
            </LinearGradient>
          </Defs>

          {/* Fond du plateau moderne */}
          <Circle 
            cx={geom.cx} 
            cy={geom.cy} 
            r={geom.size/2 - 6} 
            fill="url(#boardGrad)" 
            stroke={theme.colors.gridSoft} 
            strokeWidth="3"
          />

          {/* Lignes du plateau modernes */}
          {geom.segs.map((s, i) => (
            <Line key={i}
              x1={geom.pos[s.a].x} y1={geom.pos[s.a].y}
              x2={geom.pos[s.b].x} y2={geom.pos[s.b].y}
              stroke={theme.colors.grid} 
              strokeOpacity="0.65" 
              strokeWidth="2"
            />
          ))}

          {/* Nœuds et pions modernes */}
          {NODES.map(n => {
            const p = geom.pos[n];
            const pc = state.pieces[n];
            const selected = sel === n;
            const isQueenPiece = pc ? isQueen(n, state.pieces) : false;
            const isTarget = sel ? (movesByFrom[sel] || []).some((m: Move) => m.to === n) : false;
            const isCenter = n === "C";
            const isBeingPunished = punishmentAnimation === n;
            
            // Rayons calculés de manière cohérente
            const base = Math.max(12, W * 0.03);
            const rEmpty = base;
            const rPiece = isCenter ? base + 2 : base + 3;
            const rQueen = isCenter ? base + 4 : base + 5;
            
            // Padding pour les highlights
            const PADDING_HIGHLIGHT = Math.max(4, geom.size * 0.006);
            
            return (
              <React.Fragment key={`node-${n}`}>
                {/* Case vide */}
                {!pc && (
                  <Circle 
                    cx={p.x} 
                    cy={p.y} 
                    r={rEmpty} 
                    fill={theme.colors.center} 
                    stroke={theme.colors.gridSoft} 
                    strokeWidth="1"
                    opacity="0.3"
                  />
                )}
                
                {/* Pièce */}
                {pc && (
                  <>
                    <Circle 
                      cx={p.x} 
                      cy={p.y} 
                      r={isQueenPiece ? rQueen : rPiece}
                      fill={isQueenPiece 
                        ? (pc.owner === "A" ? "url(#queenRed)" : "url(#queenBlue)")
                        : (pc.owner === "A" ? "url(#pieceRed)" : "url(#pieceBlue)")
                      }
                      stroke={isBeingPunished ? "#FF0000" : theme.colors.pieceStroke} 
                      strokeWidth={isBeingPunished ? "4" : "2"}
                      opacity={selected ? 0.8 : (isBeingPunished ? 0.5 : 1)}
                    />
                    
                    {/* Effet 3D subtil */}
                    <Circle 
                      cx={p.x} 
                      cy={p.y} 
                      r={isQueenPiece ? rQueen - 1 : rPiece - 1} 
                      fill="none" 
                      stroke="rgba(255,255,255,0.2)" 
                      strokeWidth="1"
                    />
                    
                    {/* Couronne pour les dames */}
                    {isQueenPiece && (
                      <>
                        <Circle 
                          cx={p.x} 
                          cy={p.y} 
                          r={rQueen - 2} 
                          fill="none" 
                          stroke={theme.colors.select} 
                          strokeWidth="2" 
                          strokeDasharray="3,3"
                        />
                        <Circle 
                          cx={p.x} 
                          cy={p.y} 
                          r={rQueen - 4} 
                          fill="none" 
                          stroke={theme.colors.select} 
                          strokeWidth="1" 
                          strokeDasharray="2,2"
                        />
                      </>
                    )}
                  </>
                )}
                
                {/* Cercle de sélection (corrigé) */}
                {selected && (
                  <Circle
                    cx={p.x}
                    cy={p.y}
                    r={(isQueenPiece ? rQueen : rPiece) + PADDING_HIGHLIGHT}
                    fill="none"
                    stroke={theme.colors.select}
                    strokeWidth="2.5"
                  />
                )}
                
                {/* Cercle de cible (corrigé) */}
                {isTarget && (
                  <Circle
                    cx={p.x}
                    cy={p.y}
                    r={(isQueenPiece ? rQueen : rPiece) + PADDING_HIGHLIGHT}
                    fill="none"
                    stroke={theme.colors.highlight}
                    strokeDasharray="4,6"
                    strokeWidth="2.5"
                  />
                )}
              </React.Fragment>
            );
          })}
        </Svg>

        {/* Zones tactiles modernes */}
        {NODES.map(n => {
          const p = geom.pos[n];
          const base = Math.max(12, W * 0.03);
          const rEmpty = base;
          const rPiece = n === "C" ? base + 2 : base + 3;
          const rQueen = n === "C" ? base + 4 : base + 5;
          
          // Taille exacte selon le type de nœud
          let targetRadius;
          if (state.pieces[n]) {
            targetRadius = isQueen(n, state.pieces) ? rQueen : rPiece;
          } else {
            targetRadius = rEmpty;
          }
          
          // Zone tactile avec padding pour faciliter les clics
          const halo = targetRadius + 8;
          
          return (
            <Pressable
              key={`tap-${n}`}
              onPress={() => tap(n)}
              style={[
                styles.tap,
                {
                  left: p.x - halo, 
                  top: p.y - halo, 
                  width: halo * 2, 
                  height: halo * 2,
                  borderRadius: halo,
                }
              ]}
            />
          );
        })}
      </Animated.View>

      {/* Barre de score moderne */}
      <View style={[styles.scoreBar, { backgroundColor: theme.colors.card }]}>
        <View style={styles.scoreItem}>
          <View style={[styles.scoreDot, { backgroundColor: theme.colors.red }]} />
          <Text style={[styles.scoreValue, { color: theme.colors.text }]}>{countA}</Text>
        </View>
        <View style={styles.scoreDivider} />
        <View style={styles.scoreItem}>
          <View style={[styles.scoreDot, { backgroundColor: theme.colors.blue }]} />
          <Text style={[styles.scoreValue, { color: theme.colors.text }]}>{countB}</Text>
        </View>
      </View>

      {/* Contrôles modernes */}
      <View style={styles.controls}>
        <Pressable onPress={handlePause} style={[styles.controlBtn, { backgroundColor: theme.colors.panel }]}>
          <Text style={[styles.controlBtnText, { color: theme.colors.text }]}>⏸️</Text>
          <Text style={[styles.controlBtnLabel, { color: theme.colors.textDim }]}>{t('game.pause')}</Text>
        </Pressable>
      </View>

      {/* Modal Pause */}
      {showPauseModal && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{t('game.pause.title')}</Text>
            <Text style={[styles.modalSubtitle, { color: theme.colors.textDim }]}>
              {t('game.pause.subtitle')}
            </Text>
            
            <View style={styles.modalButtons}>
              <Pressable 
                onPress={handleNewGame} 
                style={[styles.modalButton, { backgroundColor: theme.colors.blue }]}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>🆕 {t('game.pause.new')}</Text>
        </Pressable>
              
              <Pressable 
                onPress={handleQuit} 
                style={[styles.modalButton, { backgroundColor: theme.colors.panel }]}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>🏠 {t('game.pause.quit')}</Text>
              </Pressable>
              
              <Pressable 
                onPress={() => setShowPauseModal(false)} 
                style={[styles.modalButton, { backgroundColor: theme.colors.ok }]}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>▶️ {t('game.pause.resume')}</Text>
        </Pressable>
      </View>
          </View>
        </View>
      )}

      {/* Modal Fin de Jeu */}
      {showGameOverModal && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>🎉 {t('game.over.title')}</Text>
            <Text style={[styles.modalSubtitle, { color: theme.colors.textDim }]}>
              {t('game.over.winner', { winner: gameWinner || '' })}
            </Text>
            
            {/* Score final */}
            <View style={styles.gameOverScoreContainer}>
              <View style={styles.gameOverScoreItem}>
                <View style={[styles.gameOverScoreDot, { backgroundColor: theme.colors.red }]} />
                <Text style={[styles.gameOverScoreValue, { color: theme.colors.text }]}>{t('game.red')}: {finalScore.red}</Text>
              </View>
              <View style={styles.gameOverScoreItem}>
                <View style={[styles.gameOverScoreDot, { backgroundColor: theme.colors.blue }]} />
                <Text style={[styles.gameOverScoreValue, { color: theme.colors.text }]}>{t('game.blue')}: {finalScore.blue}</Text>
              </View>
            </View>
            
            <View style={styles.modalButtons}>
              <Pressable 
                onPress={handleGameOverNewGame} 
                style={[styles.modalButton, { backgroundColor: theme.colors.blue }]}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>🆕 {t('game.over.new')}</Text>
              </Pressable>
              
              <Pressable 
                onPress={handleGameOverQuit} 
                style={[styles.modalButton, { backgroundColor: theme.colors.panel }]}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>🏠 {t('game.over.quit')}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingTop: Math.max(24, H*0.03),
    backgroundColor: theme.colors.bg,
  },
  
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  
  logoContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  
  logoMain: {
    fontSize: Math.max(28, W*0.07),
    fontWeight: "700",
    letterSpacing: 3,
  },
  
  logoSub: {
    fontSize: Math.max(16, W*0.04),
    fontWeight: "600",
    letterSpacing: 1,
  },
  
  messageBoard: {
    borderRadius: theme.radius.md,
    padding: 12,
    alignItems: "center",
    ...theme.shadow.card,
  },
  
  messageText: {
    fontSize: Math.max(14, W*0.035),
    fontWeight: "600",
    marginBottom: 8,
  },
  
  timerContainer: {
    alignItems: "center",
    width: "100%",
  },
  
  timerText: {
    fontSize: Math.max(12, W*0.03),
    fontWeight: "700",
    marginBottom: 6,
  },
  
  timerBarContainer: {
    height: 6,
    borderRadius: 3,
    width: "100%",
    overflow: "hidden",
  },
  
  timerBar: {
    height: "100%",
    borderRadius: 3,
  },
  
  boardContainer: {
    width: "92%",
    aspectRatio: 1,
    maxWidth: Math.min(W-20, H-200),
    alignSelf: "center",
    marginVertical: 20,
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    ...theme.shadow.card,
  },
  
  tap: {
    position: "absolute",
  },
  
  scoreBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginHorizontal: 20,
    borderRadius: theme.radius.md,
    ...theme.shadow.card,
  },
  
  scoreItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  
  scoreDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  
  scoreDivider: {
    width: 1,
    height: 20,
    backgroundColor: theme.colors.divider,
  },
  
  scoreValue: {
    fontSize: Math.max(18, W*0.045),
    fontWeight: "700",
  },
  
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 20,
    marginBottom: 16,
  },
  
  controlBtn: {
    width: 60,
    height: 60,
    borderRadius: theme.radius.md,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.divider,
    ...theme.shadow.card,
  },
  
  controlBtnText: {
    fontSize: 24,
    marginBottom: 2,
  },
  
  controlBtnLabel: {
    fontSize: Math.max(10, W*0.025),
    fontWeight: "600",
  },
  
  // Styles pour la modal pause
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  
  modalContent: {
    padding: 24,
    borderRadius: 16,
    minWidth: 280,
    maxWidth: 320,
    ...theme.shadow.card,
  },
  
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  
  modalSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  
  modalButtons: {
    gap: 12,
  },
  
  modalButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Styles pour le message de punition
  punishmentMessage: {
    padding: 12,
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  
  punishmentText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  // Styles pour la modal de fin de jeu
  gameOverScoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  
  gameOverScoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  gameOverScoreDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  
  gameOverScoreValue: {
    fontSize: 16,
    fontWeight: '600',
  },
});
