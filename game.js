/* Prompt Brawl: describe a fighter in one line and watch it battle. A static app on
   Pollinations: players sign in with their own account and pay with their own Pollen. */
(() => {
"use strict";

// ================================================================== config
const APP_KEY = "pk_ujmzKskx0hhk5j7d"; // public App Key (developer earnings on)
const PAGES_URL = "https://lotxo1.github.io/prompt-brawl/";
const IS_LOCAL = location.hostname === "localhost";
const REDIRECT_URI = IS_LOCAL ? `http://localhost:${location.port}/` : PAGES_URL;
const AUTH_URL = "https://enter.pollinations.ai/authorize";
const TOKEN_URL = "https://enter.pollinations.ai/api/oauth/token";
const API = "https://gen.pollinations.ai";
const MEDIA = "https://media.pollinations.ai/";
const TEXT_MODELS = ["openai/gpt-6-luna", "openai/gpt-5.4-nano"];
const IMAGE_MODELS = ["tongyi-mai/z-image-turbo", "black-forest-labs/flux.1-schnell"];
const TTS_MODEL = "openai/tts-1";
const TTS_VOICE = "fable";
const STAT_KEYS = ["power", "speed", "guard", "wits"];
const STAT_TOTAL = 22;
const KINDS = ["strike", "special", "defense", "trick"];
const ART_STYLE = "Fighting game character art, full body, dynamic battle stance, bold cel-shaded cartoon style, thick clean outlines, vibrant colors, dramatic rim light, plain dark arena backdrop with a spotlight, family-friendly, no text, no letters, no logos.";

const DESIGN_PROMPT = `You design fighters for Prompt Brawl, a comedic arena game. The player describes a fighter in one line. Build the whole fighter from that line: look, abilities, quirks and fighting style must all follow from it. Specific, clever descriptions earn specific, clever abilities; vague ones get vague fighters. Keep it funny and family-friendly: slapstick, no gore. If the line names a real person, make an original parody instead. Write every text field in the language of the description, except "look", which is always English.

Return only JSON:
{"name": "max 24 chars", "title": "an epithet, max 40 chars", "look": "English, for an illustrator: body, outfit, signature item, colors, 1-2 sentences, no text or letters", "style": "fighting style, one sentence", "stats": {"power": 1-10, "speed": 1-10, "guard": 1-10, "wits": 1-10}, "moves": [{"name": "max 28 chars", "kind": "strike|special|defense|trick", "text": "what it does, max 18 words"}], "quirk": "a trait that can help or hurt, max 20 words", "weakness": "a specific weakness that follows from the description, max 16 words", "catchphrase": "max 12 words"}
Exactly 3 moves. The four stats must add up to exactly 22.`;

const BATTLE_PROMPT = `You are the referee and play-by-play commentator of Prompt Brawl. Simulate a short, funny fight between fighter A and fighter B.

Rules:
- First set the odds from the matchup: descriptions, moves, quirks and weaknesses. Clever counters and exploiting a weakness matter most; stats only break ties. Even a big favorite stays below 75%. Never favor a fighter for being A or B.
- Then luck decides within those odds. luck_A and luck_B are each fighter's d20 rolls for its turns, in order. High rolls land well; low rolls whiff or backfire in a way that fits the fighter. In a close matchup, the fighter with the hotter rolls usually wins; a lucky underdog can pull off an upset.
- 5 to 8 exchanges. Each has one lively commentary line (max 28 words) naming the move. Build tension; the last exchange is the knockout.
- Both start with 100 HP. "damage" is what the other fighter loses (0-45). The loser hits exactly 0 on the last exchange; the winner stays above 0.
- Never mention dice, rolls, numbers or HP in the lines.
- Family-friendly slapstick, no gore. Write in the language of "language_sample".

Return only JSON:
{"exchanges": [{"actor": "A" or "B", "move": "move name", "damage": 0-45, "line": "commentary"}], "winner": "A" or "B", "finale": "a funny closing line about the victory, max 20 words; the screen already shows who won", "key_moment": "why the winner won, one sentence"}`;

const LADDER = [
  { em: "🐱", en: "A sleepy cat who only fights during the 3 a.m. zoomies", es: "Un gato dormilón que solo pelea durante sus carreras locas de las 3 de la mañana" },
  { em: "🥫", en: "A sentient vending machine that only accepts exact change", es: "Una máquina expendedora con vida propia que solo acepta el importe exacto" },
  { em: "🛡️", en: "A medieval knight who is terrified of tiny spiders", es: "Un caballero medieval aterrorizado por las arañas diminutas" },
  { em: "🦍", en: "A gym-obsessed gorilla who narrates his own workouts", es: "Un gorila obsesionado con el gimnasio que narra sus propios entrenamientos" },
  { em: "🧶", en: "A wizard grandma whose every spell comes out as knitting", es: "Una abuela hechicera a la que todos los hechizos le salen tejidos" },
  { em: "⛈️", en: "The final boss: a living storm cloud made of Monday mornings", es: "El jefe final: una nube de tormenta hecha de lunes por la mañana" },
];
const BOSSES = [
  { em: "🌋", en: "A volcano with anger management issues and a very calm therapist parrot", es: "Un volcán con problemas de ira y un loro terapeuta muy tranquilo" },
  { em: "🍞", en: "A haunted toaster that burns warnings into bread in Morse code", es: "Una tostadora embrujada que quema advertencias en el pan en código Morse" },
  { em: "🦆", en: "A rubber duck that was a famous detective in a past life", es: "Un patito de goma que fue un detective famoso en otra vida" },
  { em: "🧛", en: "A vampire who is a strict vegan and faints at the sight of ketchup", es: "Un vampiro vegano estricto que se desmaya al ver kétchup" },
  { em: "🤖", en: "A retired robot butler who still apologizes before every punch", es: "Un mayordomo robot jubilado que pide perdón antes de cada golpe" },
  { em: "🦖", en: "A T-rex personal trainer who can't reach his own whistle", es: "Un T-rex entrenador personal que no alcanza su propio silbato" },
  { em: "🍝", en: "A sentient plate of spaghetti that tangles anyone who insults Italy", es: "Un plato de espaguetis con vida que enreda a quien insulte a Italia" },
  { em: "🧙", en: "A wizard who can only cast spells by singing off-key opera", es: "Un mago que solo lanza hechizos cantando ópera desafinada" },
  { em: "🐙", en: "An octopus DJ who fights with eight turntables at once", es: "Un pulpo DJ que pelea con ocho tocadiscos a la vez" },
  { em: "👻", en: "A ghost who is afraid of the dark and carries a nightlight", es: "Un fantasma que le tiene miedo a la oscuridad y lleva una lamparita" },
  { em: "🥷", en: "A ninja who is extremely stealthy but sneezes every ten seconds", es: "Un ninja sigilosísimo que estornuda cada diez segundos" },
  { em: "🐝", en: "The queen of a bee hive who demands everything in hexagons", es: "La reina de una colmena que exige todo en forma de hexágono" },
  { em: "🧊", en: "An ice cube boxer fighting in the middle of a heatwave", es: "Un cubito de hielo boxeador peleando en plena ola de calor" },
  { em: "📎", en: "A paperclip assistant who keeps offering help mid-fight", es: "Un clip asistente que no para de ofrecer ayuda en plena pelea" },
];
const IDEAS = {
  en: ["A grandma with a cast-iron frying pan who never loses her cool", "A pigeon who believes he is the king of the city", "A lighthouse keeper who fights with a giant flashlight", "A mime trapped in an invisible box that turns out to be very useful",
    "A sushi chef samurai who only attacks with perfectly sliced fish", "A tired dad who weaponizes terrible puns", "A cactus who just wants a hug", "A librarian who silences enemies with a single look",
    "A kangaroo boxer with a pouch full of surprises", "A snowman wizard on a very hot day", "A pizza delivery rider who always arrives in 30 minutes or less", "A dragon who is allergic to fire"],
  es: ["Una abuela con una sartén de hierro que nunca pierde la calma", "Una paloma que se cree la reina de la ciudad", "Un farero que pelea con una linterna gigante", "Un mimo atrapado en una caja invisible que resulta muy útil",
    "Un samurái cocinero de sushi que solo ataca con pescado perfectamente cortado", "Un papá cansado que convierte los chistes malos en armas", "Un cactus que solo quiere un abrazo", "Una bibliotecaria que silencia a sus enemigos con una mirada",
    "Un canguro boxeador con una bolsa llena de sorpresas", "Un mago de nieve en un día muy caluroso", "Un repartidor de pizza que siempre llega en 30 minutos o menos", "Un dragón alérgico al fuego"],
};

// ================================================================== i18n
const STR = {
  en: {
    signIn: "Sign in with Pollinations", signOut: "Sign out", watchDemo: "▶ Watch a demo fight",
    heroTitle: "Describe a fighter in one line. Watch it brawl.",
    heroLead: "The AI designs your fighter from that line (look, moves, quirks and weaknesses) and throws it into a commentated battle. Clever descriptions win.",
    heroFine: "Free to play with your Pollinations account: new accounts get free Pollen, and a fight costs about 0.01 Pollen. You pay with your own Pollen; nobody else's key runs dry.",
    step1t: "Write one line", step1d: "“A grandma with a cast-iron frying pan who never loses her cool.”",
    step2t: "Meet your fighter", step2d: "A trading card with a portrait, stats, three moves, a quirk and a weakness.",
    step3t: "Brawl and climb", step3d: "Beat six challengers, face the daily boss and share your best fights.",
    createTitle: "Who's stepping into the arena?", lineLabel: "Describe your fighter in one line",
    linePlaceholder: "A grandma with a cast-iron frying pan who never loses her cool", diceTitle: "Random idea",
    create: "Bring it to life", createFine: "Specific beats generic: give it a job, a habit, a fear or a weird item.",
    newFighter: "✏️ New fighter", ladderTitle: "The ladder", bossTitle: "Daily boss", skip: "⏩ Skip", share: "🔗 Share this fight",
    back: "← Back", replayCta: "Think you can write a better fighter?", ctaBtn: "Make your own fighter", source: "Source on GitHub",
    voiceTitle: "Read the fight aloud", langTitle: "Español",
    designing: ["Sketching your fighter…", "Inventing signature moves…", "Looking for a weakness…", "Painting the portrait…"],
    warming: "Your opponent is warming up…", fighting: ["The crowd takes its seats…", "The referee checks the gloves…", "Bets are flying…", "Somebody brought snacks…"],
    fight: "Fight!", rematch: "Rematch", locked: "🔒", next: "Next challenger →", tryAgain: "Try again ↻", fightBoss: "Fight the boss",
    beatenToday: "✓ Beaten today", record: "{w} wins · {l} losses", round: "Round {n}",
    stats: { power: "Power", speed: "Speed", guard: "Guard", wits: "Wits" },
    kinds: { strike: "strike", special: "special", defense: "defense", trick: "trick" },
    quirk: "Quirk", weakness: "Weakness", wins: "{name} wins!", champion: "🏆 You beat the whole ladder! Try the daily boss.",
    shareCopied: "Link copied! Send it to a friend.", shareTitle: "{a} vs {b}", shareText: "Watch {a} fight {b} on Prompt Brawl",
    errPollen: "You're out of Pollen.", errPollenLink: "Get more", errBudget: "Your key for this app ran out of budget.", errBudgetLink: "Raise it",
    errAuth: "Your session expired. Sign in again.", errRate: "Too many requests. Wait a moment and try again.",
    errNetwork: "No connection. Check your internet.", errGeneric: "Something went wrong ({status}): {msg}",
    errSignIn: "Sign-in failed: {msg}", errBadFight: "The referee lost the scorecard. Try again.", badLink: "That fight link is broken.",
    portraitFailed: "The painter took a break, so this fighter has no portrait.", balance: "🪙 {n} Pollen",
  },
  es: {
    signIn: "Entrar con Pollinations", signOut: "Salir", watchDemo: "▶ Ver una pelea de ejemplo",
    heroTitle: "Describe un luchador en una línea. Míralo pelear.",
    heroLead: "La IA diseña tu luchador a partir de esa línea (aspecto, movimientos, manías y debilidades) y lo lanza a una pelea narrada. Gana la descripción más ingeniosa.",
    heroFine: "Gratis con tu cuenta de Pollinations: las cuentas nuevas reciben Pollen gratis y una pelea cuesta unos 0.01 Pollen. Pagas con tu propio Pollen; la llave de nadie se queda seca.",
    step1t: "Escribe una línea", step1d: "“Una abuela con una sartén de hierro que nunca pierde la calma.”",
    step2t: "Conoce a tu luchador", step2d: "Una carta con retrato, estadísticas, tres movimientos, una manía y una debilidad.",
    step3t: "Pelea y sube", step3d: "Vence a seis rivales, enfrenta al jefe del día y comparte tus mejores peleas.",
    createTitle: "¿Quién entra a la arena?", lineLabel: "Describe tu luchador en una línea",
    linePlaceholder: "Una abuela con una sartén de hierro que nunca pierde la calma", diceTitle: "Idea al azar",
    create: "Darle vida", createFine: "Lo específico gana a lo genérico: dale un oficio, una costumbre, un miedo o un objeto raro.",
    newFighter: "✏️ Nuevo luchador", ladderTitle: "La escalera", bossTitle: "Jefe del día", skip: "⏩ Saltar", share: "🔗 Compartir pelea",
    back: "← Volver", replayCta: "¿Crees que puedes escribir un luchador mejor?", ctaBtn: "Crea tu luchador", source: "Código en GitHub",
    voiceTitle: "Narrar la pelea en voz alta", langTitle: "English",
    designing: ["Dibujando a tu luchador…", "Inventando movimientos especiales…", "Buscándole una debilidad…", "Pintando el retrato…"],
    warming: "Tu rival está calentando…", fighting: ["El público toma asiento…", "El árbitro revisa los guantes…", "Vuelan las apuestas…", "Alguien trajo palomitas…"],
    fight: "¡Pelear!", rematch: "Revancha", locked: "🔒", next: "Siguiente rival →", tryAgain: "Otra vez ↻", fightBoss: "Pelear contra el jefe",
    beatenToday: "✓ Vencido hoy", record: "{w} victorias · {l} derrotas", round: "Ronda {n}",
    stats: { power: "Fuerza", speed: "Velocidad", guard: "Defensa", wits: "Astucia" },
    kinds: { strike: "golpe", special: "especial", defense: "defensa", trick: "truco" },
    quirk: "Manía", weakness: "Debilidad", wins: "¡Gana {name}!", champion: "🏆 ¡Venciste toda la escalera! Prueba con el jefe del día.",
    shareCopied: "¡Enlace copiado! Mándaselo a un amigo.", shareTitle: "{a} vs {b}", shareText: "Mira a {a} pelear contra {b} en Prompt Brawl",
    errPollen: "Te quedaste sin Pollen.", errPollenLink: "Conseguir más", errBudget: "Tu llave para esta app se quedó sin presupuesto.", errBudgetLink: "Aumentarlo",
    errAuth: "Tu sesión venció. Vuelve a entrar.", errRate: "Demasiadas solicitudes. Espera un momento y vuelve a intentar.",
    errNetwork: "Sin conexión. Revisa tu internet.", errGeneric: "Algo salió mal ({status}): {msg}",
    errSignIn: "No se pudo entrar: {msg}", errBadFight: "El árbitro perdió la tarjeta. Inténtalo otra vez.", badLink: "Ese enlace de pelea está roto.",
    portraitFailed: "El pintor se tomó un descanso: este luchador no tiene retrato.", balance: "🪙 {n} Pollen",
  },
};

// ================================================================== small helpers
const $ = (id) => document.getElementById(id);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const store = {
  get(k, s = localStorage) { try { return s.getItem(k); } catch { return null; } },
  set(k, v, s = localStorage) { try { s.setItem(k, v); } catch { /* storage may be blocked */ } },
  del(k, s = localStorage) { try { s.removeItem(k); } catch { /* ignore */ } },
  json(k, fallback) { try { const v = JSON.parse(this.get(k)); return v == null ? fallback : v; } catch { return fallback; } },
  setJson(k, v) { this.set(k, JSON.stringify(v)); },
};
let lang = store.get("brawl.lang") || ((navigator.language || "en").toLowerCase().startsWith("es") ? "es" : "en");
const t = (key, vars = {}) => {
  const s = (STR[lang] && STR[lang][key]) ?? STR.en[key] ?? key;
  return typeof s === "string" ? s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "") : s;
};
const str = (v, max) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");
const clampInt = (v, lo, hi) => Math.min(hi, Math.max(lo, Math.round(Number(v) || 0)));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
function el(tag, attrs = {}, ...kids) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === "class") node.className = v;
    else if (k === "text") node.textContent = v;
    else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v === true ? "" : v);
  }
  for (const kid of kids.flat()) if (kid != null && kid !== false) node.append(kid);
  return node;
}
function hash(s) { // FNV-1a, for cache keys
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return (h >>> 0).toString(36);
}
function randomString(n) {
  const a = new Uint8Array(n);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[b % 62]).join("");
}
async function sha256(s) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return btoa(String.fromCharCode(...new Uint8Array(d))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
let toastTimer = 0;
function toast(content, ms = 6000) {
  const box = $("toast");
  box.replaceChildren(content);
  box.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => box.classList.add("hidden"), ms);
}

// ================================================================== state
const state = {
  token: store.get("brawl.token", sessionStorage) || store.get("brawl.token"),
  me: store.json("brawl.me", null),
  voice: store.get("brawl.voice") === "1",
  busy: false,
  current: null, // fight on screen
  opponent: null, // { entry, kind, index }
};

// ================================================================== auth (OAuth code flow + PKCE, no server)
async function signIn() {
  const verifier = randomString(48);
  const st = randomString(16);
  store.set("brawl.verifier", verifier, sessionStorage);
  store.set("brawl.state", st, sessionStorage);
  store.set("brawl.return", location.hash, sessionStorage);
  const params = new URLSearchParams({
    response_type: "code", client_id: APP_KEY, redirect_uri: REDIRECT_URI, scope: "profile usage",
    state: st, code_challenge: await sha256(verifier), code_challenge_method: "S256",
    models: "text,image,audio", expiry: "30",
  });
  location.href = `${AUTH_URL}?${params}`;
}
async function handleRedirect() {
  const q = new URLSearchParams(location.search);
  if (!q.get("code") && !q.get("error")) return;
  const back = store.get("brawl.return", sessionStorage) || "";
  history.replaceState(null, "", location.pathname + back);
  if (q.get("error")) return;
  const expected = store.get("brawl.state", sessionStorage);
  const verifier = store.get("brawl.verifier", sessionStorage);
  ["brawl.state", "brawl.verifier", "brawl.return"].forEach((k) => store.del(k, sessionStorage));
  if (!expected || q.get("state") !== expected || !verifier) { toast(t("errSignIn", { msg: "state mismatch" })); return; }
  try {
    const res = await fetch(TOKEN_URL, {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ grant_type: "authorization_code", code: q.get("code"), client_id: APP_KEY, redirect_uri: REDIRECT_URI, code_verifier: verifier }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.access_token) throw new Error(data.error_description || data.error || res.status);
    state.token = data.access_token;
    store.set("brawl.token", state.token);
  } catch (e) { toast(t("errSignIn", { msg: e.message })); }
}
function signOut() {
  state.token = null;
  store.del("brawl.token", sessionStorage);
  store.del("brawl.token");
  route();
}

// ================================================================== API
class ApiError extends Error { constructor(status, message, code) { super(message); this.status = status; this.code = code || ""; } }
async function api(path, opts = {}) {
  let res;
  try {
    res = await fetch(API + path, { ...opts, headers: { ...(opts.headers || {}), Authorization: `Bearer ${state.token}` } });
  } catch (e) { throw new ApiError(0, e.message || "network"); }
  if (!res.ok) {
    let msg = res.statusText || "error", code = "";
    try {
      const j = await res.json();
      const er = j.error || j;
      msg = (typeof er === "string" ? er : er.message) || j.message || msg;
      code = (er && er.code) || j.code || "";
    } catch { /* not JSON */ }
    if (res.status === 401) signOut();
    throw new ApiError(res.status, String(msg), code);
  }
  return res;
}
const retryable = (e) => e instanceof ApiError ? (e.status >= 500 || e.status === 0) : true;
function showError(err) {
  if (!(err instanceof ApiError)) { toast(err instanceof SyntaxError ? t("errBadFight") : err.message || t("errBadFight")); return; }
  const s = err.status;
  if (s === 402) {
    const budget = /budget/i.test(`${err.code} ${err.message}`);
    const link = budget ? ((err.message.match(/https:\/\/enter\.pollinations\.ai\/[^\s"'(),;<>]+/) || [])[0] || "https://enter.pollinations.ai").replace(/[.,;:!?]+$/, "") : "https://enter.pollinations.ai";
    toast(el("span", {}, `${t(budget ? "errBudget" : "errPollen")} `, el("a", { href: link, target: "_blank", rel: "noopener", text: t(budget ? "errBudgetLink" : "errPollenLink") })), 12000);
  } else if (s === 401) toast(t("errAuth"));
  else if (s === 429) toast(t("errRate"));
  else if (s === 0) toast(t("errNetwork"));
  else toast(t("errGeneric", { status: s, msg: String(err.message).slice(0, 200) }));
}

async function chatJSON(system, user) {
  let lastErr;
  for (const model of TEXT_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await api("/v1/chat/completions", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model, messages: [{ role: "system", content: system }, { role: "user", content: user }], response_format: { type: "json_object" }, reasoning_effort: "low" }),
        });
        const j = await res.json();
        const text = j.choices?.[0]?.message?.content || "";
        return JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
      } catch (e) {
        lastErr = e;
        if (!retryable(e)) throw e;
        if (e instanceof ApiError) break; // server trouble: try the next model
      }
    }
  }
  throw lastErr;
}
async function paint(look) {
  let lastErr;
  for (const model of IMAGE_MODELS) {
    try {
      const res = await api("/v1/images/generations", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, prompt: `${look} ${ART_STYLE}`, size: "768x1024", response_format: "url", n: 1 }),
      });
      const url = (await res.json()).data?.[0]?.url || "";
      if (url.startsWith(MEDIA)) return url;
      lastErr = new Error("no image");
    } catch (e) {
      lastErr = e;
      if (!retryable(e)) throw e;
    }
  }
  throw lastErr;
}
async function refreshBalance() {
  if (!state.token) return;
  try {
    const b = await (await api("/account/balance")).json();
    const total = b.accountBalance ? b.accountBalance.total : null;
    const v = b.balance != null ? (total != null ? Math.min(b.balance, total) : b.balance) : total;
    if (v != null) {
      $("balance").textContent = t("balance", { n: v >= 1 ? v.toFixed(2) : v.toFixed(3) });
      $("balance").classList.remove("hidden");
    }
  } catch { /* optional */ }
}

// ================================================================== fighters
function cleanFighter(raw, line) {
  const f = {
    line: str(line, 140),
    name: str(raw.name, 24) || "???",
    title: str(raw.title, 40),
    look: str(raw.look, 400),
    style: str(raw.style, 160),
    quirk: str(raw.quirk, 140),
    weakness: str(raw.weakness, 120),
    catchphrase: str(raw.catchphrase, 90),
    img: typeof raw.img === "string" && raw.img.startsWith(MEDIA) ? raw.img.slice(0, 200) : "",
  };
  // Stats: integers 1-10 that add up to STAT_TOTAL, so no fighter is simply stronger.
  const stats = STAT_KEYS.map((k) => clampInt(raw.stats && raw.stats[k], 1, 10));
  let diff = STAT_TOTAL - stats.reduce((a, b) => a + b, 0);
  for (let guard = 0; diff !== 0 && guard < 50; guard++) {
    const i = guard % 4;
    if (diff > 0 && stats[i] < 10) { stats[i]++; diff--; } else if (diff < 0 && stats[i] > 1) { stats[i]--; diff++; }
  }
  f.stats = Object.fromEntries(STAT_KEYS.map((k, i) => [k, stats[i]]));
  f.moves = (Array.isArray(raw.moves) ? raw.moves : []).slice(0, 3).map((m) => ({
    name: str(m && m.name, 28) || "???",
    kind: KINDS.includes(m && m.kind) ? m.kind : "strike",
    text: str(m && m.text, 140),
  }));
  while (f.moves.length < 3) f.moves.push({ name: "Wild Swing", kind: "strike", text: "" });
  return f;
}
async function designFighter(line) {
  const f = cleanFighter(await chatJSON(DESIGN_PROMPT, line), line);
  if (!f.look) f.look = line;
  return f;
}
const briefOf = (f) => ({ description: f.line, name: f.name, title: f.title, style: f.style, stats: f.stats, moves: f.moves, quirk: f.quirk, weakness: f.weakness, catchphrase: f.catchphrase });
const challengerLine = (entry) => entry[lang] || entry.en;
const cacheKey = (line) => `brawl.c.${hash(line)}`;
async function getChallenger(entry) {
  const line = challengerLine(entry);
  const cached = store.json(cacheKey(line), null);
  if (cached && cached.img) return cleanFighter(cached, line);
  const f = cached ? cleanFighter(cached, line) : await designFighter(line);
  try { f.img = await paint(f.look); } catch (e) { if (!retryable(e)) throw e; }
  store.setJson(cacheKey(line), f);
  return f;
}

// ================================================================== battle
function normalizeFight(raw) {
  let ex = (Array.isArray(raw.exchanges) ? raw.exchanges : raw.ex || []).map((e) => ({
    actor: e && e.actor === "B" ? "B" : "A",
    move: str(e && e.move, 40),
    damage: clampInt(e && e.damage, 0, 60),
    line: str(e && e.line, 240),
  })).filter((e) => e.line).slice(0, 10);
  if (ex.length < 3) throw new Error(t("errBadFight"));
  let winner = raw.winner === "B" ? "B" : "A";
  if (!ex.some((e) => e.actor === winner)) winner = winner === "A" ? "B" : "A";
  const loser = winner === "A" ? "B" : "A";
  // The fight ends on the winner's last blow, and the numbers must add up to that knockout.
  ex = ex.slice(0, ex.map((e) => e.actor).lastIndexOf(winner) + 1);
  const last = ex[ex.length - 1];
  const toLoser = ex.filter((e) => e.actor === winner && e !== last);
  let before = toLoser.reduce((a, e) => a + e.damage, 0);
  if (before > 90) { toLoser.forEach((e) => { e.damage = Math.floor((e.damage * 90) / before); }); before = toLoser.reduce((a, e) => a + e.damage, 0); }
  last.damage = 100 - before;
  const toWinner = ex.filter((e) => e.actor === loser);
  const taken = toWinner.reduce((a, e) => a + e.damage, 0);
  if (taken > 92) toWinner.forEach((e) => { e.damage = Math.floor((e.damage * 92) / taken); });
  return { ex, winner, finale: str(raw.finale, 160), key: str(raw.key_moment ?? raw.key, 220) };
}
async function runFight(opponent) {
  const rolls = Array.from(crypto.getRandomValues(new Uint32Array(11)), (v) => 1 + (v % 20));
  // The player's fighter takes a random corner, so the model can't favor whoever is listed first.
  const swap = rolls.pop() > 10;
  const [A, B] = swap ? [opponent, state.me] : [state.me, opponent];
  const raw = await chatJSON(BATTLE_PROMPT, JSON.stringify({ A: briefOf(A), B: briefOf(B), luck_A: rolls.slice(0, 5), luck_B: rolls.slice(5), language_sample: state.me.line }));
  if (swap && Array.isArray(raw.exchanges)) {
    raw.exchanges.forEach((e) => { if (e) e.actor = e.actor === "A" ? "B" : "A"; });
    raw.winner = raw.winner === "A" ? "B" : "A";
  }
  return { v: 1, a: state.me, b: opponent, ...normalizeFight(raw) };
}

// ================================================================== voice
let audio = null;
async function speakUrl(text) {
  const res = await api("/v1/audio/speech", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: TTS_MODEL, voice: TTS_VOICE, input: text, response_format: "mp3" }),
  });
  return URL.createObjectURL(await res.blob());
}
function play(url) {
  return new Promise((resolve) => {
    audio = new Audio(url);
    audio.onended = audio.onerror = () => { URL.revokeObjectURL(url); resolve(); };
    audio.play().catch(() => resolve());
  });
}
function stopAudio() { if (audio) { audio.pause(); audio = null; } }

// ================================================================== rendering
function show(view) {
  for (const id of ["home", "create", "lobby", "arena"]) $(id).classList.toggle("hidden", id !== view);
  window.scrollTo({ top: 0 });
}
function applyI18n() {
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach((n) => { n.textContent = t(n.dataset.i18n); });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((n) => { n.placeholder = t(n.dataset.i18nPlaceholder); });
  document.querySelectorAll("[data-i18n-title]").forEach((n) => { n.title = t(n.dataset.i18nTitle); n.setAttribute("aria-label", n.title); });
  $("langBtn").textContent = lang === "es" ? "EN" : "ES";
  $("voiceBtn").textContent = state.voice ? "🔊" : "🔇";
  $("voiceBtn").setAttribute("aria-pressed", String(state.voice));
}
const NO_PORTRAIT = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 4"><rect width="3" height="4" fill="#1f1830"/><text x="1.5" y="2.55" font-size="1.6" text-anchor="middle" fill="#ffcc33" font-family="Arial Black,sans-serif">?</text></svg>')}`;
function portrait(f, cls) {
  return el("img", { class: cls, alt: f.name, src: f.img || NO_PORTRAIT, loading: "lazy", referrerpolicy: "no-referrer" });
}
function card(f) {
  const stats = el("div", { class: "stats" });
  for (const k of STAT_KEYS) {
    const bar = el("i");
    bar.style.width = `${f.stats[k] * 10}%`;
    stats.append(el("span", { text: t("stats")[k] }), el("div", { class: "stat-bar" }, bar), el("b", { text: String(f.stats[k]) }));
  }
  return el("article", { class: "card" },
    portrait(f, "card-img"),
    el("h3", { class: "card-name", text: f.name }),
    f.title && el("p", { class: "card-title", text: f.title }),
    el("p", { class: "card-line", text: f.line }),
    stats,
    el("ul", { class: "moves" }, f.moves.map((m) => el("li", {}, el("b", {}, m.name, el("span", { class: "kind", text: t("kinds")[m.kind] || m.kind })), m.text))),
    f.quirk && el("p", { class: "trait" }, el("b", { text: `${t("quirk")}: ` }), f.quirk),
    f.weakness && el("p", { class: "trait" }, el("b", { text: `${t("weakness")}: ` }), f.weakness),
    f.catchphrase && el("p", { class: "quote", text: `“${f.catchphrase}”` }),
  );
}
const today = () => Math.floor(Date.now() / 86400000);
const bossOfToday = () => BOSSES[today() % BOSSES.length];
function renderLobby() {
  const me = state.me;
  $("myCard").replaceChildren(card(me));
  $("record").textContent = t("record", { w: me.wins || 0, l: me.losses || 0 });
  const progress = me.progress || 0;
  $("ladder").replaceChildren(...LADDER.map((entry, i) => {
    const cached = store.json(cacheKey(challengerLine(entry)), null);
    const status = i < progress ? "beaten" : i === progress ? "current" : "locked";
    const btn = el("button", { type: "button", class: status === "current" ? "big-btn" : "ghost-btn", disabled: status === "locked" || state.busy,
      text: status === "locked" ? t("locked") : status === "beaten" ? t("rematch") : t("fight"),
      onclick: () => startFight({ entry, kind: "ladder", index: i }) });
    return el("li", { class: `rung ${status}` },
      el("span", { class: "em", text: entry.em }),
      el("div", { class: "txt" }, el("b", { text: cached ? cached.name : t("round", { n: i + 1 }) }), el("span", { text: challengerLine(entry) })),
      btn);
  }));
  const boss = bossOfToday();
  const won = store.get("brawl.bossDay") === String(today());
  $("boss").replaceChildren(el("div", { class: "rung boss" },
    el("span", { class: "em", text: boss.em }),
    el("div", { class: "txt" }, el("b", { text: won ? t("beatenToday") : t("bossTitle") }), el("span", { text: challengerLine(boss) })),
    el("button", { type: "button", class: "big-btn", disabled: state.busy, text: t("fightBoss"), onclick: () => startFight({ entry: boss, kind: "boss" }) })));
}
function sidePanel(f, side) {
  const bar = el("i");
  return el("div", { class: `side ${side}` }, portrait(f, ""), el("div", { class: "nm", text: f.name }),
    el("div", { class: "hp" }, bar), el("div", { class: "hp-num", text: "100 HP" }));
}
function setStatus(id, msgs) {
  const box = $(id);
  if (!msgs) { box.classList.add("hidden"); clearInterval(box._timer); return; }
  const list = Array.isArray(msgs) ? msgs : [msgs];
  let i = 0;
  box.classList.remove("hidden", "error");
  box.textContent = list[0];
  clearInterval(box._timer);
  if (list.length > 1) box._timer = setInterval(() => { box.textContent = list[++i % list.length]; }, 2200);
}

// ================================================================== flows
function route() {
  applyI18n();
  $("signOutBtn").classList.toggle("hidden", !state.token);
  if (!state.token) { $("balance").classList.add("hidden"); show("home"); return; }
  if (state.me) { renderLobby(); show("lobby"); } else { show("create"); $("lineInput").focus(); }
}
async function createFighter(line) {
  if (state.busy) return;
  state.busy = true;
  $("createBtn").disabled = true;
  setStatus("createStatus", t("designing"));
  try {
    const f = await designFighter(line);
    try { f.img = await paint(f.look); } catch (e) { if (!retryable(e)) throw e; toast(t("portraitFailed")); }
    f.id = randomString(8);
    f.progress = 0; f.wins = 0; f.losses = 0;
    state.me = f;
    store.setJson("brawl.me", f);
    state.busy = false;
    route();
  } catch (e) {
    showError(e);
  } finally {
    state.busy = false;
    $("createBtn").disabled = false;
    setStatus("createStatus", null);
    refreshBalance();
  }
}
async function startFight(opponent) {
  if (state.busy) return;
  state.busy = true;
  state.opponent = opponent;
  stopAudio();
  show("arena");
  $("result").classList.add("hidden");
  $("feed").replaceChildren();
  $("sideA").replaceChildren(sidePanel(state.me, "A"));
  $("sideB").replaceChildren(el("div", { class: "side B" }, el("div", { class: "nm", text: opponent.entry.em })));
  setStatus("arenaStatus", t("warming"));
  try {
    const b = await getChallenger(opponent.entry);
    $("sideB").replaceChildren(sidePanel(b, "B"));
    setStatus("arenaStatus", t("fighting"));
    const fight = await runFight(b);
    setStatus("arenaStatus", null);
    record(fight, opponent);
    await playFight(fight, false);
  } catch (e) {
    state.busy = false;
    setStatus("arenaStatus", null);
    showError(e);
    route();
  } finally {
    state.busy = false;
    refreshBalance();
  }
}
function record(fight, opponent) {
  const me = state.me;
  if (fight.winner === "A") {
    me.wins = (me.wins || 0) + 1;
    if (opponent.kind === "ladder" && opponent.index === (me.progress || 0)) me.progress = (me.progress || 0) + 1;
    if (opponent.kind === "boss") store.set("brawl.bossDay", String(today()));
  } else me.losses = (me.losses || 0) + 1;
  store.setJson("brawl.me", me);
}
let skip = false;
async function playFight(fight, replay) {
  state.current = fight;
  skip = false;
  const sides = { A: $("sideA"), B: $("sideB") };
  sides.A.replaceChildren(sidePanel(fight.a, "A"));
  sides.B.replaceChildren(sidePanel(fight.b, "B"));
  $("feed").replaceChildren();
  $("result").classList.add("hidden");
  $("skipBtn").classList.remove("hidden");
  const hp = { A: 100, B: 100 };
  const voice = state.voice && !replay && !!state.token;
  // Each clip takes a few seconds to make, so request them all now and play them in order.
  const clips = voice ? fight.ex.map((e) => speakUrl(e.line).catch(() => null)) : [];
  for (let i = 0; i < fight.ex.length; i++) {
    const e = fight.ex[i];
    const target = e.actor === "A" ? "B" : "A";
    const name = (e.actor === "A" ? fight.a : fight.b).name;
    hp[target] = Math.max(0, hp[target] - e.damage);
    $("feed").append(el("li", { class: e.actor },
      e.damage > 0 && el("span", { class: "pill", text: `-${e.damage}` }),
      el("span", { class: "mv", text: `${name}${e.move ? ` · ${e.move}` : ""}` }), el("br"), e.line));
    const panel = sides[target].firstElementChild;
    panel.querySelector(".hp i").style.width = `${hp[target]}%`;
    panel.querySelector(".hp-num").textContent = `${hp[target]} HP`;
    if (e.damage > 0 && !skip) {
      panel.classList.remove("hit");
      void panel.offsetWidth; // restart the shake animation
      panel.classList.add("hit");
      const pop = el("div", { class: "dmg", text: `-${e.damage}` });
      panel.append(pop);
      setTimeout(() => pop.remove(), 1000);
    }
    if (skip) continue;
    $("feed").lastElementChild.scrollIntoView({ behavior: "smooth", block: "nearest" });
    if (voice) {
      const url = await clips[i];
      if (url && !skip) await play(url); else if (!skip) await sleep(1800);
    } else {
      await waitOrSkip(Math.min(4200, 1400 + e.line.length * 28));
    }
  }
  $("skipBtn").classList.add("hidden");
  const loser = fight.winner === "A" ? "B" : "A";
  sides[loser].firstElementChild.classList.add("down");
  $("winnerLine").textContent = `🏆 ${t("wins", { name: (fight.winner === "A" ? fight.a : fight.b).name })}`;
  $("finale").textContent = fight.finale;
  $("keyMoment").textContent = fight.key;
  const op = state.opponent;
  const next = $("nextBtn");
  next.classList.toggle("hidden", replay);
  if (!replay && op) {
    const won = fight.winner === "A";
    const nextRung = op.kind === "ladder" && won ? op.index + 1 : -1;
    if (nextRung >= 0 && nextRung < LADDER.length) { next.textContent = t("next"); next.onclick = () => startFight({ entry: LADDER[nextRung], kind: "ladder", index: nextRung }); }
    else if (!won) { next.textContent = t("tryAgain"); next.onclick = () => startFight(op); }
    else next.classList.add("hidden");
    if (won && op.kind === "ladder" && op.index === LADDER.length - 1) toast(t("champion"));
  }
  $("backBtn").classList.toggle("hidden", replay);
  $("replayCta").classList.toggle("hidden", !replay);
  $("result").classList.remove("hidden");
  $("result").scrollIntoView({ behavior: "smooth", block: "nearest" });
}
function waitOrSkip(ms) {
  return new Promise((resolve) => {
    const end = Date.now() + ms;
    const tick = () => (skip || Date.now() >= end ? resolve() : setTimeout(tick, 100));
    tick();
  });
}

// ================================================================== share links (#fight=…)
const b64url = (bytes) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const unb64url = (s) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
async function pipe(bytes, stream) { return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer()); }
const lite = (f) => ({ line: f.line, name: f.name, title: f.title, stats: f.stats, moves: f.moves, quirk: f.quirk, weakness: f.weakness, catchphrase: f.catchphrase, img: f.img });
async function encodeFight(fight) {
  const json = new TextEncoder().encode(JSON.stringify({ v: 1, a: lite(fight.a), b: lite(fight.b), ex: fight.ex, winner: fight.winner, finale: fight.finale, key: fight.key }));
  if (typeof CompressionStream === "function") return `z${b64url(await pipe(json, new CompressionStream("deflate-raw")))}`;
  return `j${b64url(json)}`;
}
async function decodeFight(code) {
  const bytes = unb64url(code.slice(1));
  const json = code[0] === "z" ? await pipe(bytes, new DecompressionStream("deflate-raw")) : bytes;
  const raw = JSON.parse(new TextDecoder().decode(json));
  return { v: 1, a: cleanFighter(raw.a || {}, raw.a && raw.a.line), b: cleanFighter(raw.b || {}, raw.b && raw.b.line), ...normalizeFight(raw) };
}
async function shareFight() {
  const fight = state.current;
  if (!fight) return;
  const url = `${PAGES_URL}#fight=${await encodeFight(fight)}`;
  const vars = { a: fight.a.name, b: fight.b.name };
  if (navigator.share && matchMedia("(pointer: coarse)").matches) {
    try { await navigator.share({ title: t("shareTitle", vars), text: t("shareText", vars), url }); return; } catch { /* fall back to copying */ }
  }
  try { await navigator.clipboard.writeText(url); toast(t("shareCopied"), 3500); } catch { prompt("", url); }
}
async function openSharedFight() {
  const m = location.hash.match(/^#fight=([zj][A-Za-z0-9_-]+)$/);
  if (!m) return false;
  try {
    const fight = await decodeFight(m[1]);
    applyI18n();
    show("arena");
    playFight(fight, true);
    return true;
  } catch {
    toast(t("badLink"));
    return false;
  }
}

// ================================================================== wiring
function wire() {
  $("signInBtn").onclick = signIn;
  $("signOutBtn").onclick = signOut;
  $("demoBtn").onclick = $("heroArt").onclick = () => { if (DEMO) { state.opponent = null; show("arena"); playFight(DEMO, true); } };
  $("langBtn").onclick = () => {
    lang = lang === "es" ? "en" : "es";
    store.set("brawl.lang", lang);
    applyI18n();
    if (!$("lobby").classList.contains("hidden")) renderLobby();
  };
  $("voiceBtn").onclick = () => {
    state.voice = !state.voice;
    store.set("brawl.voice", state.voice ? "1" : "0");
    applyI18n();
  };
  $("diceBtn").onclick = () => { $("lineInput").value = pick(IDEAS[lang]); $("lineInput").focus(); };
  $("createForm").onsubmit = (e) => {
    e.preventDefault();
    const line = $("lineInput").value.trim();
    if (line) createFighter(line);
  };
  $("newFighterBtn").onclick = () => { $("lineInput").value = ""; show("create"); $("lineInput").focus(); };
  $("skipBtn").onclick = () => { skip = true; stopAudio(); };
  $("shareBtn").onclick = shareFight;
  $("backBtn").onclick = () => { stopAudio(); route(); };
  $("ctaBtn").onclick = () => { history.replaceState(null, "", location.pathname); if (state.token) { stopAudio(); route(); } else signIn(); };
  window.addEventListener("hashchange", () => { if (location.hash.startsWith("#fight=")) openSharedFight(); });
}

// A finished fight shown on the landing page, so visitors see the game before signing in.
const DEMO = {
  v: 1, winner: "A",
  a: { line: "A grandma with a cast-iron frying pan who never loses her cool", name: "Granny Ironclad", title: "The Unflappable Skillet Sage",
    stats: { power: 6, speed: 4, guard: 7, wits: 5 },
    moves: [{ name: "Skillet Skillet", kind: "strike", text: "A measured pan tap sends opponents wobbling backward, as if nudged from the dinner table." },
      { name: "Sunday Dinner Dome", kind: "defense", text: "She raises the pan to block a blow, barely disturbing her perfectly pinned curls." },
      { name: "Tea-Time Pause", kind: "trick", text: "She offers a soothing cup; curious foes hesitate long enough for a cheeky pan feint." }],
    quirk: "The louder the arena gets, the calmer she becomes—and the more firmly she insists everyone sit up straight.",
    weakness: "Her sensible slippers struggle on slick floors, especially when someone has spilled tea.",
    catchphrase: "Now, dear, let's not make a scene.", img: `${MEDIA}b2bf81a53a49e3b89b16bae49ad68176223692bd50cfbbd6359a4faf05449740` },
  b: { line: "A sleepy cat who only fights during the 3 a.m. zoomies", name: "Midnight Mrowler", title: "The 3 A.M. Tornado",
    stats: { power: 5, speed: 9, guard: 3, wits: 5 },
    moves: [{ name: "Hallway Zoomies", kind: "special", text: "Dashes in zigzags, bumping opponents before skidding to a baffled stop." },
      { name: "Sleepy Paw Tap", kind: "strike", text: "Lazily bats the opponent; the paw speeds up halfway through the swing." },
      { name: "Blanket Burrito", kind: "defense", text: "Wraps in its pajama cape and rolls away, briefly becoming very hard to aim at." }],
    quirk: "Every few moments, it stops to nap; a sudden noise instantly restarts its zoomies.",
    weakness: "After a zoomie burst, it gets winded and naps in place.",
    catchphrase: "Why is everyone awake?", img: `${MEDIA}4fe913c37f746bb81f0bbe794ba2c1aa22d920de4d15e90aa9219e49170015b8` },
  ex: [
    { actor: "B", move: "Sleepy Paw Tap", damage: 12, line: "The sleepy paw tap suddenly speeds up, bonking Granny into a very dignified shuffle." },
    { actor: "A", move: "Tea-Time Pause", damage: 20, line: "Granny offers tea; the curious cat pauses, and her cheeky pan feint sends it tumbling." },
    { actor: "B", move: "Hallway Zoomies", damage: 18, line: "Hallway Zoomies ricochet Granny across the ring—then the cat skids to a baffled stop." },
    { actor: "A", move: "Skillet Skillet", damage: 25, line: "“Now, dear, let's not make a scene.” Granny’s measured skillet swat catches the winded cat mid-pause." },
    { actor: "B", move: "Blanket Burrito", damage: 8, line: "The cat rolls into a Blanket Burrito, bumps Granny’s slipper, and nearly dozes off inside its own cape." },
    { actor: "A", move: "Sunday Dinner Dome", damage: 10, line: "Granny blocks the sleepy paw with her pan, then nudges the cat aside without disturbing a curl." },
    { actor: "B", move: "Hallway Zoomies", damage: 0, line: "One last Hallway Zoomies burst ends in a dizzy skid; the cat curls up for an accidental nap." },
    { actor: "A", move: "Skillet Skillet", damage: 45, line: "Granny calmly taps the snoozing zoomie machine; it flops onto a cushion, out cold and purring." },
  ],
  finale: "She dusts off the skillet and reminds everyone to sit up straight.",
  key: "Granny stayed composed, turned the cat’s pauses and post-zoomie naps into openings, and finished with a precise skillet tap.",
};

(async function boot() {
  wire();
  applyI18n();
  $("demoBtn").classList.toggle("hidden", !DEMO);
  if (DEMO) {
    $("heroArt").replaceChildren(portrait(DEMO.a, ""), el("span", { text: "VS" }), portrait(DEMO.b, ""));
    $("heroArt").classList.remove("hidden");
  }
  await handleRedirect();
  if (await openSharedFight()) { refreshBalance(); return; }
  route();
  refreshBalance();
})();
})();
