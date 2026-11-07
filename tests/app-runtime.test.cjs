const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");

function classList() {
  const values = new Set();
  return {
    add: (value) => values.add(value),
    remove: (value) => values.delete(value),
    toggle: (value, on) => (on === undefined ? values.has(value) ? values.delete(value) : values.add(value) : on ? values.add(value) : values.delete(value)),
    contains: (value) => values.has(value),
  };
}

function makeDom() {
  let generated = [];
  const fixed = new Map();
  const listeners = new Map();
  const attrs = (source) => {
    const result = {};
    for (const match of source.matchAll(/([^\s=]+)(?:="([^"]*)")?/g)) result[match[1]] = match[2] ?? "";
    return result;
  };
  const element = (id = "") => ({
    id, value: "", checked: false, disabled: false, className: "", classList: classList(),
    style: {}, scrollTop: 0, offsetTop: 0, clientWidth: 390, textContent: "",
    setAttribute(name, value) { this[name] = value; },
    matches(selector) { return matches(this, selector); },
    closest() { return { querySelector: (selector) => generated.find((node) => matches(node, selector)) || null }; },
    querySelector(selector) { return generated.find((node) => matches(node, selector)) || null; },
    click() { this.onclick?.(); },
  });
  const app = element("app");
  let html = "";
  Object.defineProperty(app, "innerHTML", {
    get: () => html,
    set(value) {
      html = value;
      generated = [];
      for (const match of value.matchAll(/<([a-z][\w-]*)\b([^>]*)>/gi)) {
        const parsed = attrs(match[2]);
        const node = element(parsed.id || "");
        node.tagName = match[1].toUpperCase();
        node.className = parsed.class || "";
        node.value = parsed.value || "";
        node.checked = /(?:^|\s)checked(?:\s|$)/.test(match[2]);
        node.disabled = /(?:^|\s)disabled(?:\s|$)/.test(match[2]);
        node.type = parsed.type || "";
        node.dataset = {};
        for (const [name, val] of Object.entries(parsed)) {
          if (name.startsWith("data-")) node.dataset[name.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = val;
        }
        generated.push(node);
      }
    },
  });
  fixed.set("app", app);
  for (const id of ["routine-view", "embedded-meals", "embedded-lift", "xp-badge", "mealsFrame", "liftFrame", "timer", "tx", "t1", "t2", "t3", "modalroot", "tb", "tt"]) fixed.set(id, element(id));
  for (const id of ["embedded-meals", "embedded-lift"]) fixed.get(id).classList = classList();
  fixed.get("routine-view").hidden = false;
  fixed.get("mealsFrame").contentWindow = { frame: "meals" };
  fixed.get("liftFrame").contentWindow = { frame: "lift" };
  const navButtons = ["today", "week", "edit", "meals", "lift"].map((section) => {
    const button = element("nav-" + section);
    button.dataset = { section };
    return button;
  });
  const matches = (node, selector) => {
    if (selector.startsWith("[")) {
      const required = [...selector.matchAll(/\[data-([\w-]+)(?:="([^"]+)")?\]/g)];
      return required.length > 0 && required.every((data) => {
        const key = data[1].replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        return Object.hasOwn(node.dataset || {}, key) && (data[2] === undefined || node.dataset[key] === data[2]);
      });
    }
    if (selector.startsWith(".")) return (node.className || "").split(/\s+/).includes(selector.slice(1));
    return false;
  };
  const document = {
    body: element("body"),
    getElementById(id) { return generated.find((node) => node.id === id) || fixed.get(id) || (fixed.set(id, element(id)), fixed.get(id)); },
    querySelectorAll(selector) { return [...navButtons, ...generated].filter((node) => matches(node, selector)); },
    addEventListener(type, handler) { const items = listeners.get(type) || []; items.push(handler); listeners.set(type, items); },
    createElement() { return element(); },
  };
  return { document, fixed, listeners, navButtons, get generated() { return generated; }, matches };
}

function localStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
    values,
  };
}

function runScript(source, filename, options = {}) {
  const dom = makeDom();
  const storage = options.storage || localStorage();
  const messages = [];
  const window = {
    location: { origin: "http://localhost" }, scrollY: 0, scrollTo() {},
    addEventListener() {}, parent: options.parent || null,
  };
  if (options.embedded) window.parent = { postMessage: (data, origin) => messages.push({ data, origin }) };
  else window.parent = window;
  const context = {
    document: dom.document, window, localStorage: storage,
    navigator: { vibrate() {} }, alert() {}, confirm() { return false; }, prompt() { return null; },
    setInterval() { return 1; }, clearInterval() {},
  };
  vm.createContext(context);
  new vm.Script(source, { filename }).runInContext(context);
  return { context, dom, storage, messages, window };
}

function inlineScript(file) {
  const source = read(file);
  const start = source.indexOf("<script>");
  const end = source.indexOf("</script>", start);
  assert(start >= 0 && end > start, `${file} has an inline app script`);
  return source.slice(start + 8, end);
}

test("RoutineHub XP, ranks, quests, route navigation and old customizations work together", () => {
  const today = new Date();
  const dayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const original = { r: [{ id: 901, t: "09:10", n: "My saved walk", c: "move" }], days: {}, wt: 1800, v: 10 };
  const storage = localStorage({ rt1: JSON.stringify(original), mp4: "preserve-meals", lift_redesign_v1: "preserve-lift" });
  const { context, dom } = runScript(read("routine.js"), "routine.js", { storage });

  assert.match(dom.document.getElementById("app").innerHTML, /THE ASHEN PATH/);
  assert.match(dom.document.getElementById("app").innerHTML, /My saved walk/);
  assert.equal(JSON.parse(storage.getItem("rt1")).r[0].n, "My saved walk");
  assert.equal(JSON.parse(storage.getItem("rt1")).wt, 1800);
  assert.equal(storage.getItem("mp4"), "preserve-meals");
  assert.equal(storage.getItem("lift_redesign_v1"), "preserve-lift");

  const savedWalk = dom.generated.find((node) => node.dataset?.b === "901");
  assert(savedWalk && typeof savedWalk.onchange === "function", "custom routine checkbox is bound");
  savedWalk.checked = true;
  savedWalk.onchange();
  assert.equal(context.S.xp.total, 3, "checking a routine task awards XP in the UI flow");
  for (let i = 0; i < 8; i++) {
    const addWater = dom.generated.find((node) => node.dataset?.w === "250");
    addWater.click();
  }
  assert.equal(context.S.days[dayKey].w, 2000);
  assert.equal(context.S.xp.total, 23, "hitting the water target pays the action and quest reward once");

  for (const id of [1, 2]) assert.equal(context.awardActionXP("routine", id), true);
  assert.equal(context.awardActionXP("routine", 1), false, "a routine action cannot be replayed for XP");
  assert.equal(context.S.xp.total, 41, "three actions plus the daily rhythm quest reward");
  assert.equal(context.awardActionXP("routine", 4), true);
  assert.equal(context.awardActionXP("routine", 5), true);
  assert.equal(context.awardActionXP("routine", 6), false, "routine XP is capped at five actions per day");

  const day = context.S.days[dayKey] || (context.S.days[dayKey] = { d: {}, w: 0 });
  day.w = context.S.wt;
  assert.equal(context.awardActionXP("water"), false);
  day.sl = 7;
  assert.equal(context.awardActionXP("sleep"), true);
  assert.equal(context.awardActionXP("sleep"), false);
  assert.equal(context.awardActionXP("meal", 0), true);
  assert.equal(context.awardActionXP("meal", 1), true);
  assert.equal(context.awardActionXP("meal", 0), false);
  assert.equal(context.awardActionXP("meal", 2), true);
  assert.equal(context.awardActionXP("meal", 3), false, "meal XP is capped at three meals per day");
  assert.equal(context.awardActionXP("lift"), true);
  assert.equal(context.awardActionXP("lift"), false);
  assert.equal(context.xpLevel(), 1);
  context.S.xp.total = 250;
  assert.equal(context.xpLevel(), 2, "levels advance every 250 XP");
  assert.match(context.questCard(), /Progress to next level/);
  const backup = { format: "RoutineHubBackup", version: 1, stores: {
    rt1: JSON.stringify(context.S),
    mp4: JSON.stringify({ plan: Array(14), ck: [], inv: {} }),
    lift_redesign_v1: JSON.stringify({ logs: {} }),
  } };
  assert.equal(context.validRoutineBackup(backup), true, "combined backups include the XP ledger in the existing RoutineHub store");
  assert.equal(JSON.parse(backup.stores.rt1).xp.total, 250);

  for (const section of ["week", "edit", "meals", "lift", "today"]) {
    dom.navButtons.find((node) => node.dataset.section === section).click();
    if (section === "week") assert.match(dom.document.getElementById("app").innerHTML, /This week/);
    if (section === "edit") assert.match(dom.document.getElementById("app").innerHTML, /Routine settings/);
    if (section === "meals") assert.equal(dom.document.getElementById("embedded-meals").classList.contains("active"), true);
    if (section === "lift") assert.equal(dom.document.getElementById("embedded-lift").classList.contains("active"), true);
  }
  context.save();
  assert.equal(JSON.parse(storage.getItem("rt1")).xp.total, context.S.xp.total);
  assert.match(dom.document.getElementById("app").innerHTML, /Today/);
});

test("Meals and Lift retain their own stores and notify only the parent app of earned actions", () => {
  const mealsStorage = localStorage();
  const meals = runScript(inlineScript("meals.html"), "meals.html#inline", { storage: mealsStorage, embedded: true });
  const hub = runScript(read("routine.js"), "routine.js#hub");
  assert.match(meals.dom.document.getElementById("app").innerHTML, /Meals/);
  const eaten = meals.dom.generated.find((node) => node.dataset?.k === "0,0");
  assert(eaten && typeof eaten.onchange === "function", "meal checkbox is bound");
  eaten.checked = true;
  eaten.onchange();
  assert.equal(JSON.parse(mealsStorage.getItem("mp4")).ck[0][0], 1);
  assert.deepEqual(JSON.parse(JSON.stringify(meals.messages[0])), { data: { type: "routinehub:xp", activity: "meal", slot: 0 }, origin: "http://localhost" });
  hub.context.handleQuestMessage({ origin: meals.messages[0].origin, source: hub.dom.fixed.get("mealsFrame").contentWindow, data: meals.messages[0].data });
  assert.equal(hub.context.S.xp.total, 4, "the hub awards the meal action through its trusted frame bridge");
  hub.context.handleQuestMessage({ origin: "https://untrusted.example", source: hub.dom.fixed.get("mealsFrame").contentWindow, data: meals.messages[0].data });
  assert.equal(hub.context.S.xp.total, 4, "messages from another origin cannot award XP");
  meals.dom.document.getElementById("t2").click();
  assert.equal(meals.dom.document.getElementById("t2").className, "on", "Meals internal navigation still works");

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const oldDate = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
  const history = { [oldDate]: { day: 0, sets: { "0_0": [{ w: 8, r: 10, done: true }] }, splitVersion: 1 } };
  const liftStorage = localStorage({ lift_redesign_v1: JSON.stringify({ logs: history, cardio: [], maxDb: 20, increment: 0.5, rest: 120 }) });
  const lift = runScript(inlineScript("lift.html"), "lift.html#inline", { storage: liftStorage, embedded: true });
  assert.match(lift.dom.document.getElementById("app").innerHTML, /TODAY'S PLAN/);
  assert.equal(JSON.parse(liftStorage.getItem("lift_redesign_v1")).logs[oldDate].sets["0_0"][0].w, 8, "old workout history remains intact");
  vm.runInContext("activeDay=0;page='workout';render()", lift.context);
  const reps = lift.dom.generated.find((node) => node.dataset?.field === "r" && node.dataset?.i === "0");
  const done = lift.dom.generated.find((node) => node.dataset?.done === "1" && node.dataset?.i === "0");
  assert(reps && done, "workout set controls render");
  reps.value = "8";
  reps.onchange();
  done.checked = true;
  done.onchange();
  for (const handler of lift.dom.listeners.get("change") || []) handler({ target: done });
  assert.deepEqual(JSON.parse(JSON.stringify(lift.messages[0])), { data: { type: "routinehub:xp", activity: "lift" }, origin: "http://localhost" });
  hub.context.handleQuestMessage({ origin: lift.messages[0].origin, source: hub.dom.fixed.get("liftFrame").contentWindow, data: lift.messages[0].data });
  assert.equal(hub.context.S.xp.total, 27, "the hub awards a logged set only once");
  hub.context.handleQuestMessage({ origin: lift.messages[0].origin, source: hub.dom.fixed.get("liftFrame").contentWindow, data: lift.messages[0].data });
  assert.equal(hub.context.S.xp.total, 27, "repeated workout messages are deduplicated");
  assert.equal(JSON.parse(liftStorage.getItem("lift_redesign_v1")).logs[oldDate].sets["0_0"][0].w, 8);
});

test("all inline scripts parse and required offline assets are cached", () => {
  new vm.Script(read("routine.js"), { filename: "routine.js" });
  new vm.Script(read("sw.js"), { filename: "sw.js" });
  new vm.Script(inlineScript("meals.html"), { filename: "meals.html#inline" });
  new vm.Script(inlineScript("lift.html"), { filename: "lift.html#inline" });
  const manifest = JSON.parse(read("manifest.json"));
  assert.equal(manifest.theme_color, "#101013");
  const cache = read("sw.js");
  for (const file of ["index.html", "routine-theme.css", "routine.js", "meals.html", "lift.html", "manifest.json", "icon-192.png", "icon-512.png"]) assert(cache.includes(`./${file}`), `${file} is in the offline cache`);
});
