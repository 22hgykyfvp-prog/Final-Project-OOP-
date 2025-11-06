// main.js — Quran Journal (Electron App, fixed)
// ✅ saves to Electron appData folder
// ✅ also mirrors to ./data/journal.json (so you can see it change)
// ✅ converts old ARRAY file → OBJECT so renderer can edit

import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ------------------------------
// 1. paths & storage
// ------------------------------

// stable user folder, e.g. C:\Users\<you>\AppData\Roaming\QuranJournal
const APP_DATA_DIR = path.join(app.getPath("appData"), "QuranJournal");
const DATA_FILE = path.join(APP_DATA_DIR, "journal.json");

// project copy (so you can see it in your repo)
const PROJECT_DATA_DIR = path.join(__dirname, "data");
const PROJECT_DATA_FILE = path.join(PROJECT_DATA_DIR, "journal.json");

// make sure a file exists
function ensureFile(p, init = "{}") {
  const dir = path.dirname(p);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(p)) {
    fs.writeFileSync(p, init, "utf-8");
  }
}

// convert old array-style file → object { "1": {...}, "18": {...} }
function normalizeStore(raw) {
  if (!raw) return {};
  // already object
  if (!Array.isArray(raw) && typeof raw === "object") {
    return raw;
  }
  // old array style
  if (Array.isArray(raw)) {
    const out = {};
    for (const item of raw) {
      const id = item.surahNumber || item.id;
      if (!id) continue;
      out[id] = {
        completedAyahs: item.completedAyahs ?? item.completedAyah ?? 0,
        notes: item.notes ?? item.note ?? "",
        lastAyahKey: item.lastAyahKey ?? null,
        lastPage: item.lastPage ?? 1,
        lastPerPage: item.lastPerPage ?? 20,
        updatedAt: item.updatedAt ?? new Date().toISOString(),
      };
    }
    return out;
  }
  return {};
}

// read from disk (prefer userData, fallback to project copy)
function loadJournal() {
  let data = null;

  if (fs.existsSync(DATA_FILE)) {
    try {
      data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    } catch (err) {
      console.warn("[main] failed to read DATA_FILE", err);
    }
  } else if (fs.existsSync(PROJECT_DATA_FILE)) {
    try {
      data = JSON.parse(fs.readFileSync(PROJECT_DATA_FILE, "utf-8"));
    } catch (err) {
      console.warn("[main] failed to read PROJECT_DATA_FILE", err);
    }
  }

  return normalizeStore(data);
}

// write to BOTH places
function saveJournal(storeObj) {
  const json = JSON.stringify(storeObj, null, 2);

  // user data
  ensureFile(DATA_FILE, "{}");
  fs.writeFileSync(DATA_FILE, json, "utf-8");

  // project data
  ensureFile(PROJECT_DATA_FILE, "{}");
  fs.writeFileSync(PROJECT_DATA_FILE, json, "utf-8");
}

// ------------------------------
// 2. window
// ------------------------------
let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 820,
    webPreferences: {
      contextIsolation: true,
      // 👇 IMPORTANT: we point to preload.js (not preload.cjs)
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // load your main page
  win.loadFile(path.join(__dirname, "renderer", "index.html"));
}

// ------------------------------
// 3. IPC handlers (bridge)
// ------------------------------
ipcMain.handle("journal:all", () => {
  const store = loadJournal();
  return store;
});

ipcMain.handle("journal:one", (event, id) => {
  const store = loadJournal();
  return store[id] || null;
});

ipcMain.handle("journal:upsert", (event, id, payload = {}) => {
  const store = loadJournal();
  const now = new Date().toISOString();

  store[id] = {
    ...(store[id] || {}),
    ...payload,
    updatedAt: now,
  };

  saveJournal(store);
  return store[id];
});

ipcMain.handle("journal:delete", (event, id) => {
  const store = loadJournal();
  if (store[id]) {
    delete store[id];
    saveJournal(store);
  }
  return true;
});

// ------------------------------
// 4. app lifecycle
// ------------------------------
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  // quit on Win / Linux
  if (process.platform !== "darwin") {
    app.quit();
  }
});
