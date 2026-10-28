/**
 * A synthetic desktop used when no screen is shared: an interactive game window,
 * movable RPG characters (Knight Guy & Mage Girl), Priest NPC with dialogue,
 * equippable items (Sword, Hat, Glasses), Treasure Chest, Mystery Box,
 * Calculator input, rearrangeable sidebar icons, and an ad popup.
 */

export const AD_CYCLE = 24;

export type Point = { x: number; y: number };

export const DEMO_FILE = { x: 0.9, y: 0.2, hw: 0.03, hh: 0.05 } as const;
export const DEMO_ARCHIVE = { x: 0.85, y: 0.6, w: 0.12, h: 0.18 } as const;

export interface DemoFile {
  x: number;
  y: number;
  archived: boolean;
}

export const initialDemoFile = (): DemoFile => ({ x: DEMO_FILE.x, y: DEMO_FILE.y, archived: false });

export const demoFileAt = (file: DemoFile): Point =>
  file.archived ? { x: DEMO_ARCHIVE.x + DEMO_ARCHIVE.w / 2, y: DEMO_ARCHIVE.y + DEMO_ARCHIVE.h / 2 } : { x: file.x, y: file.y };

const inArchive = (p: Point) =>
  p.x >= DEMO_ARCHIVE.x && p.x <= DEMO_ARCHIVE.x + DEMO_ARCHIVE.w && p.y >= DEMO_ARCHIVE.y && p.y <= DEMO_ARCHIVE.y + DEMO_ARCHIVE.h;

const onFile = (file: DemoFile, p: Point) =>
  !file.archived && Math.abs(p.x - file.x) <= DEMO_FILE.hw && Math.abs(p.y - file.y) <= DEMO_FILE.hh;

export function demoDrag(file: DemoFile, from: Point, to: Point): { file: DemoFile; moved: boolean; message: string } {
  if (!onFile(file, from)) return { file, moved: false, message: 'Drag grabbed nothing — no draggable item at the start point' };
  if (inArchive(to)) return { file: { ...file, archived: true }, moved: true, message: 'Dragged "Report" into the Archive folder' };
  const x = Math.min(1 - DEMO_FILE.hw, Math.max(DEMO_FILE.hw, to.x));
  const y = Math.min(0.93 - DEMO_FILE.hh, Math.max(DEMO_FILE.hh, to.y));
  return { file: { x, y, archived: false }, moved: true, message: `Dragged "Report" to (${(x * 100).toFixed(0)}%, ${(y * 100).toFixed(0)}%)` };
}

export const DEMO_ICON = { hw: 0.025, hh: 0.045 } as const;

export interface DemoIcon {
  label: string;
  x: number;
  y: number;
  color: string;
}

const ICON_COLORS: Record<string, string> = { Files: '#2f6fdf', Notes: '#22c55e', Game: '#d08cf0', Calc: '#fde047' };

export const initialDemoIcons = (): DemoIcon[] =>
  ['Files', 'Notes', 'Game', 'Calc'].map((label, i) => ({ label, x: 0.055, y: 0.105 + i * 0.16, color: ICON_COLORS[label] }));

export const iconAt = (icons: DemoIcon[], p: Point): DemoIcon | null =>
  icons.find((i) => Math.abs(p.x - i.x) <= DEMO_ICON.hw && Math.abs(p.y - i.y) <= DEMO_ICON.hh) ?? null;

export const findIcon = (icons: DemoIcon[], label: string): DemoIcon | null =>
  icons.find((i) => new RegExp(`\\b${i.label}\\b`, 'i').test(label)) ?? null;

const keepOnDesktop = (to: Point): Point => ({
  x: Math.min(1 - DEMO_ICON.hw, Math.max(DEMO_ICON.hw, to.x)),
  y: Math.min(0.93 - DEMO_ICON.hh, Math.max(DEMO_ICON.hh, to.y)),
});

export function moveIcon(icons: DemoIcon[], from: Point, to: Point): { icons: DemoIcon[]; moved: DemoIcon | null } {
  const grabbed = iconAt(icons, from);
  if (!grabbed) return { icons, moved: null };
  const moved = { ...grabbed, ...keepOnDesktop(to) };
  return { icons: icons.map((i) => (i === grabbed ? moved : i)), moved };
}

/** Rich Game and Quest state for testing multi-step AI workflows */
export interface DemoGameState {
  tab: 'menu' | 'custom_game' | 'char_select' | 'in_game';
  selectedChar: number; // 1 to 5
  started: boolean;
  score: number;
  // Characters
  guy: {
    x: number;
    y: number;
    stepsForward: number;
    weight: number;
    hasSword: boolean;
    hasHat: boolean;
    hasGlasses: boolean;
  };
  girl: {
    x: number;
    y: number;
    stepsForward: number;
    weight: number;
    hasHat: boolean;
    hasStaff: boolean;
    hasPotion: boolean;
  };
  // Quest NPC: Priest
  priest: {
    x: number;
    y: number;
    talking: boolean;
    dialogueStep: number;
    receivedHi: boolean;
    response: string;
  };
  // Items & Objects
  chest: {
    x: number;
    y: number;
    opened: boolean;
    items: string[];
  };
  sword: { x: number; y: number; equipped: boolean };
  hat: { x: number; y: number; equipped: boolean };
  glasses: { x: number; y: number; equipped: boolean };
  mysteryBox: { x: number; y: number; opened: boolean; content: string };
  calcBox: { x: number; y: number; text: string };
  dragonGate: { x: number; y: number; unlocked: boolean };
}

export const initialDemoGameState = (): DemoGameState => ({
  tab: 'menu',
  selectedChar: 1,
  started: false,
  score: 0,
  guy: {
    x: 0.35,
    y: 0.65,
    stepsForward: 0,
    weight: 20,
    hasSword: false,
    hasHat: false,
    hasGlasses: false,
  },
  girl: {
    x: 0.42,
    y: 0.65,
    stepsForward: 0,
    weight: 15,
    hasHat: false,
    hasStaff: false,
    hasPotion: false,
  },
  priest: {
    x: 0.65,
    y: 0.62,
    talking: false,
    dialogueStep: 0,
    receivedHi: false,
    response: 'Welcome traveler! Speak to me or type "hi".',
  },
  chest: {
    x: 0.72,
    y: 0.45,
    opened: false,
    items: ['Sword', 'Crown', 'Magic Potion'],
  },
  sword: { x: 0.52, y: 0.45, equipped: false },
  hat: { x: 0.58, y: 0.45, equipped: false },
  glasses: { x: 0.64, y: 0.45, equipped: false },
  mysteryBox: { x: 0.28, y: 0.45, opened: false, content: 'Golden Key' },
  calcBox: { x: 0.5, y: 0.22, text: '25 + 75 = 100' },
  dragonGate: { x: 0.78, y: 0.25, unlocked: false },
});

export function demoPlayButton(t: number) {
  return { x: 0.5 + Math.sin(t / 14) * 0.05, y: 0.62 };
}

export function demoAd(t: number) {
  const phase = t % AD_CYCLE;
  return { visible: phase >= 15 && phase < 21, x: 0.42, y: 0.3, w: 0.4, h: 0.4, closeX: 0.8, closeY: 0.335 };
}

function drawDraggable(ctx: CanvasRenderingContext2D, w: number, h: number, file: DemoFile) {
  ctx.fillStyle = '#a16207';
  ctx.fillRect(DEMO_ARCHIVE.x * w, DEMO_ARCHIVE.y * h, DEMO_ARCHIVE.w * w, DEMO_ARCHIVE.h * h);
  ctx.fillStyle = '#fef3c7';
  ctx.font = `${Math.round(h * 0.028)}px sans-serif`;
  ctx.fillText(file.archived ? 'Archive (1)' : 'Archive', DEMO_ARCHIVE.x * w + 6, (DEMO_ARCHIVE.y + DEMO_ARCHIVE.h) * h - 8);

  if (file.archived) return;

  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect((file.x - DEMO_FILE.hw) * w, (file.y - DEMO_FILE.hh) * h, DEMO_FILE.hw * 2 * w, DEMO_FILE.hh * 2 * h);
  ctx.fillStyle = '#1e293b';
  ctx.font = `${Math.round(h * 0.024)}px sans-serif`;
  ctx.fillText('Report', (file.x - DEMO_FILE.hw) * w + 4, file.y * h + 4);
}

/** Draws the demo desktop and interactive game world */
export function drawDemoDesktop(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  adDismissed = false,
  file: DemoFile = initialDemoFile(),
  icons: DemoIcon[] = initialDemoIcons(),
  game: DemoGameState = initialDemoGameState()
) {
  // Desktop background
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#0f172a');
  bg.addColorStop(1, '#020617');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Desktop icons on sidebar
  icons.forEach((icon) => {
    ctx.fillStyle = icon.color;
    ctx.fillRect((icon.x - DEMO_ICON.hw) * w, (icon.y - DEMO_ICON.hh) * h, DEMO_ICON.hw * 2 * w, DEMO_ICON.hh * 2 * h);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = `${Math.round(h * 0.028)}px sans-serif`;
    ctx.fillText(icon.label, (icon.x - DEMO_ICON.hw) * w, (icon.y + DEMO_ICON.hh + 0.038) * h);
  });

  // Main Interactive Window / Quest Arena
  const gx = w * 0.16;
  const gy = h * 0.08;
  const gw = w * 0.68;
  const gh = h * 0.74;

  ctx.fillStyle = '#064e3b';
  ctx.fillRect(gx, gy, gw, gh);

  // Window Title Bar
  ctx.fillStyle = '#047857';
  ctx.fillRect(gx, gy, gw, h * 0.055);
  ctx.fillStyle = '#ecfeff';
  ctx.font = `bold ${Math.round(h * 0.03)}px sans-serif`;
  ctx.fillText('Quest Adventure 3D — Active Simulation', gx + 12, gy + h * 0.038);

  // Navigation Tabs: [Games] [Custom Game] [Character 5] [Start Game]
  const tabY = gy + h * 0.065;
  const tabs = [
    { label: 'Games', tab: 'menu' as const, x: gx + 10, w: 90 },
    { label: 'Custom Game', tab: 'custom_game' as const, x: gx + 110, w: 130 },
    { label: `Char ${game.selectedChar || 5}`, tab: 'char_select' as const, x: gx + 250, w: 100 },
    { label: game.started ? 'Restart Game' : 'Start Game', tab: 'in_game' as const, x: gx + 360, w: 120, highlight: true },
  ];

  tabs.forEach((tab) => {
    ctx.fillStyle = tab.highlight ? '#f59e0b' : game.tab === tab.tab ? '#10b981' : '#1f2937';
    ctx.fillRect(tab.x, tabY, tab.w, 24);
    ctx.fillStyle = tab.highlight ? '#111827' : '#ffffff';
    ctx.font = `bold ${Math.round(h * 0.024)}px sans-serif`;
    ctx.fillText(tab.label, tab.x + 8, tabY + 17);
  });

  // Arena Ground
  ctx.fillStyle = '#065f46';
  ctx.fillRect(gx + 10, gy + h * 0.14, gw - 20, gh - h * 0.16);

  // Grid tiles for distance and stepping
  ctx.strokeStyle = '#047857';
  ctx.lineWidth = 1;
  for (let x = gx + 10; x < gx + gw - 10; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, gy + h * 0.14);
    ctx.lineTo(x, gy + gh - 10);
    ctx.stroke();
  }

  // Draw Interactive Boxes / Calculator
  // 1. Mystery Box (double click to open)
  const mbX = game.mysteryBox.x * w;
  const mbY = game.mysteryBox.y * h;
  ctx.fillStyle = game.mysteryBox.opened ? '#fbbf24' : '#b45309';
  ctx.fillRect(mbX - 25, mbY - 20, 50, 40);
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(h * 0.022)}px sans-serif`;
  ctx.fillText(game.mysteryBox.opened ? 'Key Open!' : 'Box (2x)', mbX - 22, mbY + 4);

  // 2. Treasure Chest
  const chX = game.chest.x * w;
  const chY = game.chest.y * h;
  ctx.fillStyle = game.chest.opened ? '#ca8a04' : '#78350f';
  ctx.fillRect(chX - 28, chY - 22, 56, 44);
  ctx.fillStyle = '#fef08a';
  ctx.font = `bold ${Math.round(h * 0.022)}px sans-serif`;
  ctx.fillText(game.chest.opened ? 'Chest [Open]' : 'Chest [Locked]', chX - 26, chY + 5);

  // 3. Calculator / Text Input Box
  const cbX = game.calcBox.x * w;
  const cbY = game.calcBox.y * h;
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(cbX - 80, cbY - 16, 160, 32);
  ctx.strokeStyle = '#38bdf8';
  ctx.strokeRect(cbX - 80, cbY - 16, 160, 32);
  ctx.fillStyle = '#38bdf8';
  ctx.font = `${Math.round(h * 0.024)}px monospace`;
  ctx.fillText(game.calcBox.text || 'Calc: Type expr', cbX - 74, cbY + 6);

  // 4. Equippable Items: Sword, Hat, Glasses
  if (!game.sword.equipped) {
    const swX = game.sword.x * w;
    const swY = game.sword.y * h;
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(swX - 18, swY - 12, 36, 24);
    ctx.fillStyle = '#0284c7';
    ctx.font = `bold ${Math.round(h * 0.02)}px sans-serif`;
    ctx.fillText('⚔ Sword', swX - 16, swY + 4);
  }

  if (!game.hat.equipped) {
    const htX = game.hat.x * w;
    const htY = game.hat.y * h;
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(htX - 16, htY - 12, 32, 24);
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(h * 0.02)}px sans-serif`;
    ctx.fillText('🎩 Hat', htX - 14, htY + 4);
  }

  if (!game.glasses.equipped) {
    const glX = game.glasses.x * w;
    const glY = game.glasses.y * h;
    ctx.fillStyle = '#ec4899';
    ctx.fillRect(glX - 20, glY - 12, 40, 24);
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(h * 0.02)}px sans-serif`;
    ctx.fillText('👓 Glasses', glX - 18, glY + 4);
  }

  // 5. Draw Guy Character (Male Knight Hero)
  const guyX = (game.guy.x + game.guy.stepsForward * 0.03) * w;
  const guyY = game.guy.y * h;
  // Body
  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(guyX - 18, guyY - 25, 36, 50);
  // Head
  ctx.fillStyle = '#fed7aa';
  ctx.beginPath();
  ctx.arc(guyX, guyY - 35, 14, 0, Math.PI * 2);
  ctx.fill();
  // Equipped Gear on Guy
  if (game.guy.hasHat) {
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(guyX - 16, guyY - 55, 32, 14);
  }
  if (game.guy.hasGlasses) {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(guyX - 10, guyY - 38, 20, 6);
  }
  if (game.guy.hasSword) {
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(guyX + 20, guyY - 20, 8, 40);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(guyX + 16, guyY, 16, 6);
  }
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(h * 0.022)}px sans-serif`;
  ctx.fillText(`Guy (${game.guy.weight}kg)`, guyX - 26, guyY + 38);
  if (game.guy.stepsForward > 0) {
    ctx.fillStyle = '#a7f3d0';
    ctx.font = `${Math.round(h * 0.02)}px sans-serif`;
    ctx.fillText(`Moved +${game.guy.stepsForward}`, guyX - 22, guyY + 52);
  }

  // 6. Draw Girl Character (Female Mage Hero)
  const girlX = (game.girl.x + game.girl.stepsForward * 0.03) * w;
  const girlY = game.girl.y * h;
  ctx.fillStyle = '#ec4899';
  ctx.fillRect(girlX - 16, girlY - 22, 32, 44);
  ctx.fillStyle = '#fbcfe8';
  ctx.beginPath();
  ctx.arc(girlX, girlY - 32, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(h * 0.022)}px sans-serif`;
  ctx.fillText(`Girl (${game.girl.weight}kg)`, girlX - 24, girlY + 36);

  // 7. Draw Priest NPC with Talk Action
  const prX = game.priest.x * w;
  const prY = game.priest.y * h;
  ctx.fillStyle = '#8b5cf6';
  ctx.fillRect(prX - 20, prY - 30, 40, 60);
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(prX, prY - 42, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(h * 0.024)}px sans-serif`;
  ctx.fillText('Priest NPC', prX - 28, prY + 42);

  // Talk Button over Priest
  ctx.fillStyle = '#10b981';
  ctx.fillRect(prX - 24, prY - 72, 48, 20);
  ctx.fillStyle = '#064e3b';
  ctx.font = `bold ${Math.round(h * 0.022)}px sans-serif`;
  ctx.fillText('💬 Talk', prX - 18, prY - 58);

  // Dialogue Bubble if talking
  if (game.priest.talking) {
    const dbX = prX - 120;
    const dbY = prY - 145;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(dbX, dbY, 240, 65);
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 2;
    ctx.strokeRect(dbX, dbY, 240, 65);

    ctx.fillStyle = '#111827';
    ctx.font = `bold ${Math.round(h * 0.022)}px sans-serif`;
    ctx.fillText('Elder Priest:', dbX + 10, dbY + 18);
    ctx.font = `${Math.round(h * 0.02)}px sans-serif`;
    ctx.fillText(game.priest.response, dbX + 10, dbY + 36);

    // [Next] button in dialogue
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(dbX + 180, dbY + 42, 50, 18);
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(h * 0.018)}px sans-serif`;
    ctx.fillText('Next ➔', dbX + 184, dbY + 55);
  }

  // Play button for original drift testing
  const play = demoPlayButton(t);
  const bw = w * 0.12;
  const bh = h * 0.06;
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(play.x * w - bw / 2, play.y * h - bh / 2, bw, bh);
  ctx.fillStyle = '#1c1917';
  ctx.font = `bold ${Math.round(h * 0.035)}px sans-serif`;
  ctx.fillText('PLAY', play.x * w - bw * 0.28, play.y * h + bh * 0.2);

  // Taskbar + clock
  ctx.fillStyle = '#020617';
  ctx.fillRect(0, h * 0.93, w, h * 0.07);
  ctx.fillStyle = '#94a3b8';
  ctx.font = `${Math.round(h * 0.028)}px monospace`;
  ctx.fillText(`12:${String(Math.floor(t / 2) % 60).padStart(2, '0')}`, w * 0.92, h * 0.975);

  drawDraggable(ctx, w, h, file);

  // Ad popup
  const ad = demoAd(t);
  if (ad.visible && !adDismissed) {
    ctx.fillStyle = '#be123c';
    ctx.fillRect(ad.x * w, ad.y * h, ad.w * w, ad.h * h);
    ctx.fillStyle = '#fde047';
    ctx.font = `bold ${Math.round(h * 0.045)}px sans-serif`;
    ctx.fillText('MEGA QUEST OFFER!', ad.x * w + 14, ad.y * h + h * 0.1);
    ctx.font = `${Math.round(h * 0.03)}px sans-serif`;
    ctx.fillStyle = '#fff';
    ctx.fillText('Unlock Character 5 & Dragon Gate', ad.x * w + 14, ad.y * h + h * 0.18);
    ctx.fillStyle = '#fff';
    ctx.fillRect(ad.closeX * w - 10, ad.closeY * h - 10, 20, 20);
    ctx.fillStyle = '#be123c';
    ctx.font = `bold ${Math.round(h * 0.035)}px sans-serif`;
    ctx.fillText('×', ad.closeX * w - 6, ad.closeY * h + 7);
  }
}

export function interactDemoGame(
  game: DemoGameState,
  x: number,
  y: number,
  isDoubleClick = false
): { game: DemoGameState; handled: boolean; message: string } {
  const g: DemoGameState = {
    ...game,
    guy: { ...game.guy },
    girl: { ...game.girl },
    priest: { ...game.priest },
    chest: { ...game.chest },
    mysteryBox: { ...game.mysteryBox },
    sword: { ...game.sword },
    hat: { ...game.hat },
    glasses: { ...game.glasses },
    calcBox: { ...game.calcBox },
    dragonGate: { ...game.dragonGate },
  };

  // 1. Navigation tabs at top of game window (y around 0.11 - 0.18)
  if (y >= 0.11 && y <= 0.18) {
    if (x >= 0.16 && x <= 0.26) {
      g.tab = 'menu';
      return { game: g, handled: true, message: 'Switched to Games Menu tab' };
    }
    if (x >= 0.27 && x <= 0.41) {
      g.tab = 'custom_game';
      return { game: g, handled: true, message: 'Opened Custom Game mode' };
    }
    if (x >= 0.42 && x <= 0.52) {
      g.selectedChar = 5;
      g.tab = 'char_select';
      return { game: g, handled: true, message: 'Selected Character 5 (Shadow Rogue)' };
    }
    if (x >= 0.53 && x <= 0.68) {
      g.started = true;
      g.tab = 'in_game';
      return { game: g, handled: true, message: 'Started Quest Adventure Simulation!' };
    }
  }

  // 2. Priest Talk & Dialogue
  // Next button in dialogue (x: 0.70-0.76, y: 0.46-0.54)
  if (g.priest.talking && Math.abs(x - 0.72) < 0.06 && Math.abs(y - 0.50) < 0.06) {
    g.priest.dialogueStep += 1;
    g.priest.response = 'Proceed eastward, hero! Wield your sword and unlock the ancient mysteries.';
    return { game: g, handled: true, message: 'Clicked Next ➔ on Priest Dialogue' };
  }
  // Priest NPC or Talk bubble (x: 0.65, y: 0.50 - 0.68)
  if (Math.abs(x - g.priest.x) < 0.07 && (Math.abs(y - g.priest.y) < 0.09 || Math.abs(y - 0.53) < 0.06)) {
    g.priest.talking = true;
    return { game: g, handled: true, message: 'Spoke with Elder Priest: "Welcome traveler! Speak to me or type \'hi\'."' };
  }

  // 3. Treasure Chest (x: 0.72, y: 0.45)
  if (Math.abs(x - g.chest.x) < 0.06 && Math.abs(y - g.chest.y) < 0.06) {
    g.chest.opened = true;
    return { game: g, handled: true, message: 'Opened Treasure Chest! Discovered Sword, Hat, and Magic Potion.' };
  }

  // 4. Mystery Box (x: 0.28, y: 0.45)
  if (Math.abs(x - g.mysteryBox.x) < 0.06 && Math.abs(y - g.mysteryBox.y) < 0.06) {
    g.mysteryBox.opened = true;
    return { game: g, handled: true, message: 'Opened Mystery Box! Discovered Golden Key.' };
  }

  // 5. Equippable items click
  // Sword (x: 0.52, y: 0.45)
  if (!g.sword.equipped && Math.abs(x - g.sword.x) < 0.05 && Math.abs(y - g.sword.y) < 0.05) {
    g.sword.equipped = true;
    g.guy.hasSword = true;
    g.guy.weight += 10;
    return { game: g, handled: true, message: `Equipped Sword to Sir Knight (Guy)! Weight increased to ${g.guy.weight}kg.` };
  }
  // Hat (x: 0.58, y: 0.45)
  if (!g.hat.equipped && Math.abs(x - g.hat.x) < 0.05 && Math.abs(y - g.hat.y) < 0.05) {
    g.hat.equipped = true;
    g.guy.hasHat = true;
    g.guy.weight += 2;
    return { game: g, handled: true, message: `Equipped Hat over Guy head! Weight increased to ${g.guy.weight}kg.` };
  }
  // Glasses (x: 0.64, y: 0.45)
  if (!g.glasses.equipped && Math.abs(x - g.glasses.x) < 0.05 && Math.abs(y - g.glasses.y) < 0.05) {
    g.glasses.equipped = true;
    g.guy.hasGlasses = true;
    g.guy.weight += 1;
    return { game: g, handled: true, message: 'Equipped Glasses over Guy eyes! Precision targeting enabled.' };
  }

  // 6. Character click / move 3 spaces forward
  const guyCurX = g.guy.x + g.guy.stepsForward * 0.03;
  if (Math.abs(x - guyCurX) < 0.06 && Math.abs(y - g.guy.y) < 0.09) {
    g.guy.stepsForward += 3;
    // Lady Mage follows to stay close
    if (Math.abs(g.guy.x + g.guy.stepsForward * 0.03 - g.girl.x) > 0.15) {
      g.girl.stepsForward = Math.max(0, g.guy.stepsForward - 1);
    }
    return { game: g, handled: true, message: 'Moved Sir Knight (Guy) 3 spaces forward! Lady Mage adjusted position.' };
  }

  // Dragon Gate (x: 0.78, y: 0.25)
  if (Math.abs(x - g.dragonGate.x) < 0.06 && Math.abs(y - g.dragonGate.y) < 0.06) {
    if (g.mysteryBox.opened) {
      g.dragonGate.unlocked = true;
      return { game: g, handled: true, message: 'Unlocked Dragon Gate with the Golden Key! Victory achieved!' };
    }
    return { game: g, handled: true, message: 'Dragon Gate is locked. Need Golden Key from Mystery Box.' };
  }

  return { game: g, handled: false, message: 'No game element at coordinates' };
}

export function typeInDemoGame(game: DemoGameState, text: string): { game: DemoGameState; handled: boolean; message: string } {
  const g: DemoGameState = { ...game, priest: { ...game.priest }, calcBox: { ...game.calcBox } };
  const lower = text.trim().toLowerCase();

  // If Priest is talking or screen active, answering "hi"
  if (lower.includes('hi') || lower.includes('hello')) {
    g.priest.talking = true;
    g.priest.receivedHi = true;
    g.priest.response = 'Greetings hero! Open the chest, wield your sword, and claim destiny.';
    return { game: g, handled: true, message: `Typed "hi" in dialogue — Priest replied: "${g.priest.response}"` };
  }

  // Typing in calculator box or expression
  if (/[0-9+\-*/=]/.test(text)) {
    g.calcBox.text = text;
    return { game: g, handled: true, message: `Typed "${text}" in Calculator Box` };
  }

  return { game: g, handled: false, message: 'Typed text not handled in game' };
}

export function dragDemoGame(
  game: DemoGameState,
  from: Point,
  to: Point
): { game: DemoGameState; moved: boolean; message: string } {
  const g: DemoGameState = {
    ...game,
    guy: { ...game.guy },
    girl: { ...game.girl },
    sword: { ...game.sword },
    hat: { ...game.hat },
    glasses: { ...game.glasses },
  };

  // Drag sword to Guy
  if (!g.sword.equipped && Math.abs(from.x - g.sword.x) < 0.05 && Math.abs(from.y - g.sword.y) < 0.05) {
    const guyX = g.guy.x + g.guy.stepsForward * 0.03;
    if (Math.abs(to.x - guyX) < 0.08 && Math.abs(to.y - g.guy.y) < 0.1) {
      g.sword.equipped = true;
      g.guy.hasSword = true;
      g.guy.weight += 10;
      return { game: g, moved: true, message: 'Dragged Sword to Sir Knight hand! Equipped (+10kg weight).' };
    }
  }

  // Drag Hat to Guy or Girl Head
  if (!g.hat.equipped && Math.abs(from.x - g.hat.x) < 0.05 && Math.abs(from.y - g.hat.y) < 0.05) {
    const guyX = g.guy.x + g.guy.stepsForward * 0.03;
    if (Math.abs(to.x - guyX) < 0.08 && Math.abs(to.y - (g.guy.y - 0.06)) < 0.08) {
      g.hat.equipped = true;
      g.guy.hasHat = true;
      g.guy.weight += 2;
      return { game: g, moved: true, message: 'Dragged Hat onto Sir Knight head! Equipped (+2kg weight).' };
    }
    const girlX = g.girl.x + g.girl.stepsForward * 0.03;
    if (Math.abs(to.x - girlX) < 0.08 && Math.abs(to.y - (g.girl.y - 0.06)) < 0.08) {
      g.hat.equipped = true;
      g.girl.hasHat = true;
      g.girl.weight += 2;
      return { game: g, moved: true, message: 'Dragged Hat onto Lady Mage head! Equipped (+2kg weight).' };
    }
  }

  // Drag Glasses to Guy Eyes
  if (!g.glasses.equipped && Math.abs(from.x - g.glasses.x) < 0.05 && Math.abs(from.y - g.glasses.y) < 0.05) {
    const guyX = g.guy.x + g.guy.stepsForward * 0.03;
    if (Math.abs(to.x - guyX) < 0.08 && Math.abs(to.y - (g.guy.y - 0.04)) < 0.08) {
      g.glasses.equipped = true;
      g.guy.hasGlasses = true;
      g.guy.weight += 1;
      return { game: g, moved: true, message: 'Dragged Glasses over Sir Knight eyes! Equipped (+1kg weight).' };
    }
  }

  // Drag Guy Character to position
  const guyX = g.guy.x + g.guy.stepsForward * 0.03;
  if (Math.abs(from.x - guyX) < 0.06 && Math.abs(from.y - g.guy.y) < 0.08) {
    g.guy.x = Math.max(0.18, Math.min(0.8, to.x));
    g.guy.y = Math.max(0.2, Math.min(0.75, to.y));
    g.guy.stepsForward = 0;
    // Girl moves to maintain escort distance
    if (Math.hypot(g.guy.x - g.girl.x, g.guy.y - g.girl.y) > 0.18) {
      g.girl.x = g.guy.x + 0.06;
      g.girl.y = g.guy.y;
    }
    return { game: g, moved: true, message: `Dragged Sir Knight (Guy) to (${Math.round(to.x * 100)}%, ${Math.round(to.y * 100)}%). Lady Mage repositioned.` };
  }

  return { game: g, moved: false, message: 'No game item dragged' };
}

