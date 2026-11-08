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
  assert.equal(context.S.r.filter((item) => /floss|interdental/i.test(item.n)).length, 1, "one floss reminder is present");
  assert.equal(context.S.r.filter((item) => /tongue/i.test(item.n)).length, 1, "one tongue-cleaning reminder is present");
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

test("oral-care defaults sequence floss before brushing and keep mouthwash separate", () => {
  const { context } = runScript(read("routine.js"), "routine.js#new-user");
  const routine = context.S.r;
  assert.equal(routine.filter((item) => /Brush teeth for 2 minutes with fluoride toothpaste/.test(item.n)).length, 2, "brushing is scheduled twice daily");
  assert.equal(routine.find((item) => item.id === 31).t, "08:15");
  assert.equal(routine.find((item) => item.id === 32).t, "08:20");
  assert.equal(routine.find((item) => item.id === 34).t, "08:35");
  assert.equal(routine.find((item) => item.id === 35).t, "08:40");
  assert.equal(routine.find((item) => item.id === 30).t, "08:45", "facial skincare follows the shower and drying steps");
  assert.deepEqual(JSON.parse(JSON.stringify(routine.find((item) => item.id === 32).dayNotes)), {
    3: "Hair wash today: shampoo your scalp and rinse; condition the lengths/ends as suited to your hair type, then rinse.",
    0: "Hair wash today: shampoo your scalp and rinse; condition the lengths/ends as suited to your hair type, then rinse.",
  });
  assert.equal(routine.filter((item) => /floss or clean between teeth/i.test(item.n)).length, 1);
  assert.equal(routine.filter((item) => /clean tongue with scraper/i.test(item.n)).length, 1);
  assert.equal(routine.find((item) => item.id === 19).t, "23:30");
  assert.equal(routine.find((item) => item.id === 62).t, "23:35");
  assert.equal(routine.find((item) => item.id === 27).t, "23:40");
  assert.equal(routine.find((item) => item.id === 26).t, "14:30", "optional mouthwash stays after lunch, away from brushing");
  assert.match(routine.find((item) => item.id === 26).n, /if using/);
});

test("skincare guidance expands under the morning and evening routine items", () => {
  const { context, dom } = runScript(read("routine.js"), "routine.js#skincare");
  const morning = context.S.r.find((item) => item.id === 30);
  const evening = context.S.r.find((item) => item.id === 28);
  assert.match(dom.document.getElementById("app").innerHTML, /class="routine-detail"/);
  assert.match(dom.document.getElementById("app").innerHTML, /Wash your hands/);
  assert(morning.detail.some((step) => /lukewarm water/.test(step)));
  assert(morning.detail.some((step) => /10–20 seconds/.test(step)));
  assert(morning.detail.some((step) => /SPF 30–50 sunscreen/.test(step)));
  assert(evening.detail.some((step) => /pea-sized amount of moisturiser/.test(step)));
  assert(evening.detail.some((step) => /lip balm if you want/.test(step)));

  const custom = { r: [
    { id: 30, t: "09:15", n: "Morning face care: gently cleanse, pat dry and moisturise", c: "free" },
    { id: 28, t: "21:30", n: "Evening face care: cleanse gently and apply moisturiser", c: "free" },
  ], days: { "2025-01-01": { d: { 30: 1 }, w: 0 } }, wt: 1800, v: 12 };
  const migrated = runScript(read("routine.js"), "routine.js#custom-skincare", { storage: localStorage({ rt1: JSON.stringify(custom) }) });
  assert.equal(migrated.context.S.r[0].n, custom.r[0].n, "migration preserves a customized morning label");
  assert.equal(migrated.context.S.r[1].n, custom.r[1].n, "migration preserves a customized evening label");
  assert.equal(migrated.context.S.r[0].t, "08:45", "morning face care moves after shower while preserving the task");
  assert(migrated.context.S.r[0].detail.length > 0, "existing customized face-care tasks receive the steps");
  assert(migrated.context.S.r[1].detail.length > 0, "existing customized evening face-care task receives the steps");
  assert.equal(migrated.context.S.days["2025-01-01"].d[30], 1, "migration preserves completion history");
  assert.match(migrated.dom.document.getElementById("app").innerHTML, /Show skincare steps/);

  const legacyCustom = { r: [
    { id: 701, t: "08:15", n: "Morning face care: gently cleanse and moisturise", c: "free" },
    { id: 702, t: "21:30", n: "Evening face care: cleanse and moisturise", c: "free" },
  ], days: { "2025-01-02": { d: { 701: 1 }, w: 0 } }, wt: 2000, v: 13 };
  const migratedLegacy = runScript(read("routine.js"), "routine.js#legacy-custom-skincare", { storage: localStorage({ rt1: JSON.stringify(legacyCustom) }) });
  assert(migratedLegacy.context.S.r[0].detail?.length > 0 && migratedLegacy.context.S.r[1].detail?.length > 0, "migration finds face-care tasks even with custom IDs and an already-upgraded version");
  assert.equal(migratedLegacy.context.S.r[0].n, legacyCustom.r[0].n);
  assert.equal(migratedLegacy.context.S.days["2025-01-02"].d[701], 1);
});

test("repairs misplaced skincare steps and restores the morning grooming time", () => {
  const skinSteps = [
    "Wash your hands, then wet your face with lukewarm water.",
    "Use one pump of gentle face wash on wet hands.",
    "Rinse all cleanser away with lukewarm water, then pat your face dry.",
    "Gently spread a pea-sized amount of moisturiser over your cheeks, chin and forehead.",
  ];
  const saved = { r: [
    { id: 40, t: "20:00", n: "10-minute room reset: put clothes in laundry, clear surfaces and put items away", c: "free", detail: skinSteps },
    { id: 37, t: "08:45", n: "Comb/style hair and check nails, beard and general grooming", c: "free", detail: skinSteps },
    { id: 57, t: "12:00", n: "Personal upkeep: trim/file nails, clean trimmer heads and wipe grooming tools", c: "free", d: "d0", detail: skinSteps },
    { id: 30, t: "08:30", n: "Morning face care: gently cleanse, pat dry and moisturise", c: "free", detail: skinSteps },
  ], days: { "2026-11-08": { d: { 40: 1, 37: 1, 57: 1 }, w: 750 } }, wt: 2000, v: 18 };
  const { context } = runScript(read("routine.js"), "routine.js#repair-skincare-placement", { storage: localStorage({ rt1: JSON.stringify(saved) }) });
  const routine = context.S.r;
  assert.equal(routine.find((item) => item.id === 40).detail, undefined, "room-reset items no longer inherit face-care instructions");
  assert.equal(routine.find((item) => item.id === 37).detail, undefined, "grooming items no longer inherit face-care instructions");
  assert.equal(routine.find((item) => item.id === 37).t, "08:55", "morning grooming follows shower and skincare");
  assert.equal(routine.find((item) => item.id === 57).t, "12:00", "the weekly personal-upkeep task stays scheduled at noon");
  assert.equal(routine.find((item) => item.id === 57).detail, undefined);
  assert(routine.find((item) => item.id === 30).detail.length > 0, "face-care instructions remain with the face-care task");
  assert.equal(context.S.days["2026-11-08"].d[37], 1, "routine completion history is preserved");
  assert.equal(context.S.days["2026-11-08"].w, 750, "water history is preserved");
});

test("shower and hair-wash days migrate into the shower item and follow the local calendar", () => {
  const saved = { r: [
    { id: 801, t: "08:25", n: "Shower: wash and dry thoroughly", c: "free" },
    { id: 802, t: "08:25", n: "Non-shower day: wash with a clean flannel", c: "free" },
    { id: 803, t: "08:50", n: "Hair washing: shampoo and condition", c: "free" },
  ], days: { "2025-03-03": { d: { 801: 1 }, w: 500 } }, wt: 2000, v: 14 };
  const { context, dom } = runScript(read("routine.js"), "routine.js#weekly-hygiene", { storage: localStorage({ rt1: JSON.stringify(saved) }) });
  const shower = context.S.r.find((item) => item.id === 801);
  const nonShower = context.S.r.find((item) => item.id === 802);
  assert.equal(shower.d, "days:1,3,5,0");
  assert.equal(nonShower.d, "days:2,4,6");
  assert.equal(context.S.r.some((item) => item.id === 803), false, "separate hair-wash reminder is merged into the shower task");
  assert.match(context.routineDayNote(shower, "2026-11-11"), /Hair wash today/);
  assert.match(context.routineDayNote(shower, "2026-11-15"), /Hair wash today/);
  assert.equal(context.routineDayNote(shower, "2026-11-09"), "", "the shower task only calls out hair washing on Wednesday and Sunday");
  for (const [date, shouldShower, shouldHair] of [
    ["2026-11-09", true, false], ["2026-11-10", false, false],
    ["2026-11-11", true, true], ["2026-11-12", false, false],
    ["2026-11-13", true, false], ["2026-11-14", false, false],
    ["2026-11-15", true, true],
  ]) {
    assert.equal(context.app(shower, date), shouldShower, `shower schedule for ${date}`);
    assert.equal(!!context.routineDayNote(shower, date), shouldHair, `hair-wash note for ${date}`);
  }
  assert.equal(context.app(nonShower, "2026-11-10"), true);
  assert.equal(context.app(nonShower, "2026-11-13"), false);
  assert.equal(context.S.r[0].n, saved.r[0].n, "schedule migration preserves task names");
  assert.equal(context.S.r[0].t, "08:20", "shower is moved before the post-shower skincare sequence");
  assert.equal(context.S.days["2025-03-03"].d[801], 1, "schedule migration preserves completion history");
  assert.match(dom.document.getElementById("app").innerHTML, /YOUR LOCAL DAY/);

  dom.navButtons.find((node) => node.dataset.section === "edit").click();
  assert.match(dom.document.getElementById("app").innerHTML, /Tue\/Thu\/Sat/);
});

test("removes only duplicate oral-care reminders and adds workout and gaming time", () => {
  const saved = { r: [
    { id: 19, t: "22:00", n: "Floss / clean between teeth with interdental brushes", c: "free" },
    { id: 62, t: "22:05", n: "Gently scrape your tongue once daily", c: "free" },
    { id: 901, t: "21:40", n: "Floss carefully between every tooth; be gentle around the gumline", c: "free" },
    { id: 902, t: "21:45", n: "Gently clean your tongue with the scraper; don't press hard", c: "free" },
    { id: 13, t: "18:00", n: "Strength workout on planned training days; otherwise light activity", c: "move", d: "wk" },
  ], days: { "2025-03-03": { d: { 19: 1, 62: 1, 901: 1 }, w: 0 } }, wt: 2000, v: 15 };
  const { context, dom } = runScript(read("routine.js"), "routine.js#free-time", { storage: localStorage({ rt1: JSON.stringify(saved) }) });
  assert.equal(context.S.r.some((item) => item.id === 19 || item.id === 62), false, "the two added duplicate reminders are removed");
  assert(context.S.r.some((item) => item.id === 901), "the user's earlier floss reminder remains");
  assert(context.S.r.some((item) => item.id === 902), "the user's earlier tongue-cleaning reminder remains");
  assert.equal(context.S.days["2025-03-03"].d[19], 1, "existing completion data is retained");
  const workout = context.S.r.find((item) => item.id === 13);
  assert.equal(workout.n, saved.r[4].n, "workout label remains unchanged");
  assert.equal(workout.d, "days:1,2,4,5", "workout block follows Lift days and rests Wednesday/weekends");
  const gaming = context.S.r.find((item) => /gaming, relax or enjoy a hobby/.test(item.n));
  assert(gaming, "a daily leisure block is added");
  assert.equal(gaming.t, "20:30");
  assert.equal(context.S.r.filter((item) => /gaming|game time|free time|leisure/i.test(item.n)).length, 1);
  assert.equal(context.app(workout, "2026-11-11"), false, "no workout reminder appears on Wednesday recovery");
  assert.equal(context.app(workout, "2026-11-12"), true, "the Thursday workout appears");
  assert.match(dom.document.getElementById("app").innerHTML, /Free time: gaming, relax or enjoy a hobby/);
});

test("sleep quest has a visible logger that saves hours and awards XP", () => {
  const { context, dom } = runScript(read("routine.js"), "routine.js#sleep-log");
  let html = dom.document.getElementById("app").innerHTML;
  assert.match(html, /LOG LAST NIGHT&#39;S SLEEP/);
  assert.match(html, /id="save-sleep"/);
  assert.match(html, /type="number" id="sl"/);
  const input = dom.document.getElementById("sl");
  const save = dom.document.getElementById("save-sleep");
  input.value = "7.5";
  save.click();
  const today = new Date();
  const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  assert.equal(context.S.days[key].sl, 7.5);
  assert.equal(context.S.xp.total, 14, "sleep action XP and rest quest reward are paid once");
  assert.equal(context.S.xp.days[key].quests.sleep, true);
  html = dom.document.getElementById("app").innerHTML;
  assert.match(html, /Update log/);
  assert.match(html, /Logged/);
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

test("Lift covers all major muscle groups, adds forearm and core work, and labels each target", () => {
  const lift = runScript(inlineScript("lift.html"), "lift.html#muscle-coverage");
  const plan = vm.runInContext("PLAN", lift.context);
  const muscleTarget = (day, exercise) => vm.runInContext(`muscleTarget(${day},${exercise})`, lift.context);
  assert.equal(plan[0].day, "Monday");
  assert.equal(plan[1].day, "Tuesday");
  assert.equal(plan[3].day, "Thursday");
  assert.equal(plan[4].day, "Friday");
  assert.equal(plan[2].rest && plan[5].rest && plan[6].rest, true, "Wednesday and weekends stay recovery days");
  for (const day of [0, 3]) {
    assert(plan[day].ex.some((exercise) => /wrist curl/i.test(exercise[0]) || /forearm|farmer hold/i.test(exercise[0])), `${plan[day].day} includes direct forearm work`);
    for (let i = 0; i < plan[day].ex.length; i++) assert(muscleTarget(day, i), `${plan[day].ex[i][0]} has a muscle target`);
  }
  for (const day of [1, 4]) {
    assert(plan[day].ex.some((exercise) => /chair march|suitcase hold/i.test(exercise[0])), `${plan[day].day} includes core work`);
    for (let i = 0; i < plan[day].ex.length; i++) assert(muscleTarget(day, i), `${plan[day].ex[i][0]} has a muscle target`);
  }
  assert.match(plan[1].focus, /Quads.*Glutes.*Hamstrings.*Calves/);
  assert.match(plan[4].focus, /Quads.*Glutes.*Hamstrings.*Calves/);
  lift.context.action("plan");
  const html = lift.dom.document.getElementById("app").innerHTML;
  assert.match(html, /Weekly coverage/);
  assert.match(html, /Targets: Forearms/);
  vm.runInContext("activeDay=0;page='workout';render()", lift.context);
  assert.match(lift.dom.document.getElementById("app").innerHTML, /Muscles worked:/);
});

test("Lift defaults to small-space chair and wall exercises and preserves optional bench mode and old labels", () => {
  const oldDate = "2026-11-02";
  const oldLog = { [oldDate]: { day: 0, sets: { "0_0": [{ w: 7, r: 10, done: true }] }, splitVersion: 2 } };
  const storage = localStorage({ lift_redesign_v1: JSON.stringify({ logs: oldLog, cardio: [], maxDb: 20, increment: 0.5, rest: 120 }) });
  const lift = runScript(inlineScript("lift.html"), "lift.html#small-space", { storage });
  let plan = vm.runInContext("PLAN", lift.context);
  for (const day of [0, 1, 3, 4]) for (const exercise of plan[day].ex) {
    assert.doesNotMatch(exercise[0], /floor|lying|dead bug|glute bridge/i, `${exercise[0]} can be done without using floor space`);
    assert.doesNotMatch(exercise[6], /lie on the floor|lie down|floor/i, `${exercise[0]} cue avoids floor setup`);
  }
  assert(plan[0].ex.some((exercise) => /wall push-up/i.test(exercise[0])));
  assert(plan[1].ex.some((exercise) => /chair/i.test(exercise[0])));
  assert.equal(vm.runInContext("exerciseNameForLog(state.logs['2026-11-02'],0,0)", lift.context), "Dumbbell floor press", "older entries keep their original exercise name");
  vm.runInContext("page='progress';render()", lift.context);
  assert.match(lift.dom.document.getElementById("app").innerHTML, /Dumbbell floor press/);
  lift.context.action("settings");
  assert.match(lift.dom.document.getElementById("app").innerHTML, /BENCH WORKOUTS: OFF/);
  vm.runInContext("toast=()=>{}", lift.context);
  lift.context.action("toggleBench");
  plan = vm.runInContext("PLAN", lift.context);
  assert.equal(plan[0].ex[0][0], "Dumbbell bench press");
  assert.equal(plan[3].ex[1][0], "Chest-supported dumbbell row on bench");
  assert.equal(plan[3].ex[5][0], "Bench-supported dumbbell triceps extension");
  assert.equal(JSON.parse(storage.getItem("lift_redesign_v1")).useBench, true, "bench preference is saved with Lift settings");
  const reloaded = runScript(inlineScript("lift.html"), "lift.html#bench-reload", { storage });
  assert.equal(vm.runInContext("PLAN[0].ex[0][0]", reloaded.context), "Dumbbell bench press", "the optional bench plan persists after reload");
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
