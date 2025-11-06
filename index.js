// renderer/index.js
// Surah Browser — Electron + localStorage + hero → grid

const API = "https://api.alquran.cloud/v1/surah";

// DOM
const q = document.getElementById("q");
const translatorSel = document.getElementById("translator");
const list = document.getElementById("list");
const info = document.getElementById("info");
const alertBox = document.getElementById("alert");
const refreshBtn = document.getElementById("refresh");
const heroOpenBtn = document.getElementById("heroOpenBtn");
const surahGrid = document.getElementById("surah-grid");

// ⭐ search bar in hero (we hide it first)
const heroTools = document.querySelector(".hero-tools");

// modal
const modal = document.getElementById("journalModal");
const jmTitle = document.getElementById("jmTitle");
const jmAyahs = document.getElementById("jmAyahs");
const jmNotes = document.getElementById("jmNotes");
const jmCancel = document.getElementById("jmCancel");
const jmSave = document.getElementById("jmSave");

const HAS_ELECTRON = typeof window !== "undefined" && !!window.journal;

// ---------------- daily reminder (your circle) ----------------
const heroReminder = document.getElementById("heroReminder");
const remTitle = document.getElementById("remTitle");
const remDesc = document.getElementById("remDesc");
const remRead = document.getElementById("remRead");
const remLater = document.getElementById("remLater");

// favourite / lazim surahs
const DAILY_FAV = [
  { id: 36, name: "Surah Yasin", note: "Heart of the Qur’an — read when you need comfort 💚" },
  { id: 55, name: "Surah Ar-Rahman", note: "Which of your Lord’s favours will you deny? ✨" },
  { id: 56, name: "Surah Al-Waqi’ah", note: "Read at night — rizq is from Allah 🤍" },
  { id: 67, name: "Surah Al-Mulk", note: "Protection in the grave — 30 blessed ayahs 🕊️" },
  { id: 18, name: "Surah Al-Kahf", note: "Perfect for Friday — keep your heart firm 🌿" },
];

function pickDaily() {
  const today = new Date().toISOString().slice(0, 10);
  const stored = localStorage.getItem("qj_daily_pick");
  if (stored) {
    const parsed = JSON.parse(stored);
    if (parsed.date === today) {
      return parsed.item;
    }
  }
  const item = DAILY_FAV[Math.floor(Math.random() * DAILY_FAV.length)];
  localStorage.setItem("qj_daily_pick", JSON.stringify({ date: today, item }));
  return item;
}

// simple local surah names cache
const SURAH_NAMES = [
  null,
  "Al-Fatihah",
  "Al-Baqarah",
  "Ali 'Imran",
  "An-Nisa",
  "Al-Ma'idah",
  "Al-An'am",
  "Al-A'raf",
  "Al-Anfal",
  "At-Tawbah",
  "Yunus",
  "Hud",
  "Yusuf",
  "Ar-Ra'd",
  "Ibrahim",
  "Al-Hijr",
  "An-Nahl",
  "Al-Isra'",
  "Al-Kahf",
  "Maryam",
  "Ta-Ha",
  "Al-Anbiya'",
  "Al-Hajj",
  "Al-Mu'minun",
  "An-Nur",
  "Al-Furqan",
  "Ash-Shu'ara'",
  "An-Naml",
  "Al-Qasas",
  "Al-'Ankabut",
  "Ar-Rum",
  "Luqman",
  "As-Sajdah",
  "Al-Ahzab",
  "Saba'",
  "Fatir",
  "Ya-Sin",
  "As-Saffat",
  "Sad",
  "Az-Zumar",
  "Ghafir",
  "Fussilat",
  "Ash-Shura",
  "Az-Zukhruf",
  "Ad-Dukhan",
  "Al-Jathiyah",
  "Al-Ahqaf",
  "Muhammad",
  "Al-Fath",
  "Al-Hujurat",
  "Qaf",
  "Adh-Dhariyat",
  "At-Tur",
  "An-Najm",
  "Al-Qamar",
  "Ar-Rahman",
  "Al-Waqi'ah",
  "Al-Hadid",
  "Al-Mujadila",
  "Al-Hashr",
  "Al-Mumtahanah",
  "As-Saff",
  "Al-Jumu'ah",
  "Al-Munafiqun",
  "At-Taghabun",
  "At-Talaq",
  "At-Tahrim",
  "Al-Mulk",
  "Al-Qalam",
  "Al-Haqqah",
  "Al-Ma'arij",
  "Nuh",
  "Al-Jinn",
  "Al-Muzzammil",
  "Al-Muddaththir",
  "Al-Qiyamah",
  "Al-Insan",
  "Al-Mursalat",
  "An-Naba'",
  "An-Nazi'at",
  "'Abasa",
  "At-Takwir",
  "Al-Infitar",
  "Al-Mutaffifin",
  "Al-Inshiqaq",
  "Al-Buruj",
  "At-Tariq",
  "Al-A'la",
  "Al-Ghashiyah",
  "Al-Fajr",
  "Al-Balad",
  "Ash-Shams",
  "Al-Layl",
  "Adh-Dhuha",
  "Ash-Sharh",
  "At-Tin",
  "Al-'Alaq",
  "Al-Qadr",
  "Al-Bayyinah",
  "Az-Zalzalah",
  "Al-'Adiyat",
  "Al-Qari'ah",
  "At-Takathur",
  "Al-'Asr",
  "Al-Humazah",
  "Al-Fil",
  "Quraysh",
  "Al-Ma'un",
  "Al-Kawthar",
  "Al-Kafirun",
  "An-Nasr",
  "Al-Masad",
  "Al-Ikhlas",
  "Al-Falaq",
  "An-Nas",
];

// ------------- storage adapter -------------
const Store = (() => {
  const mirror = (id, rec) => {
    try {
      localStorage.setItem(`jj_${id}`, JSON.stringify(rec));
    } catch (_) {}
  };

  const loadAllFromLocal = () => {
    const out = {};
    for (let i = 1; i <= 114; i++) {
      const v = localStorage.getItem(`jj_${i}`);
      if (v) out[i] = JSON.parse(v);
    }
    return out;
  };

  return {
    async getAll() {
      if (HAS_ELECTRON) {
        const raw = (await window.journal.getAll()) || {};
        const all = Array.isArray(raw)
          ? raw.reduce((acc, item) => {
              const id = item.surahNumber || item.id;
              if (!id) return acc;
              acc[id] = {
                completedAyahs: item.completedAyahs ?? item.completedAyah ?? 0,
                notes: item.notes ?? item.note ?? "",
                updatedAt: item.updatedAt ?? new Date().toISOString(),
              };
              return acc;
            }, {})
          : raw;

        if (!all || !Object.keys(all).length) return loadAllFromLocal();
        Object.entries(all).forEach(([id, rec]) => mirror(id, rec));
        return all;
      }
      return loadAllFromLocal();
    },

    async getOne(id) {
      if (HAS_ELECTRON) {
        const rec = await window.journal.getOne(String(id));
        if (rec) {
          mirror(id, rec);
          return rec;
        }
      }
      const local = localStorage.getItem(`jj_${id}`);
      return local ? JSON.parse(local) : null;
    },

    async upsert(id, data) {
      const payload = { ...data, updatedAt: new Date().toISOString() };
      if (HAS_ELECTRON) {
        const saved = await window.journal.upsert(String(id), payload);
        mirror(id, saved);
        return saved;
      }
      mirror(id, payload);
      return payload;
    },
  };
})();

// ------------- fetch surahs -------------
async function fetchSurahs() {
  const res = await fetch(API);
  const json = await res.json();
  if (json.code !== 200) throw new Error("Failed to fetch surahs");
  return json.data;
}

// ------------- render list -------------
async function renderList(filterText = "") {
  try {
    const [surahs, journal] = await Promise.all([fetchSurahs(), Store.getAll()]);

    const clean = filterText.trim().toLowerCase();

    const cards = surahs
      .filter((s) => {
        if (!clean) return true;
        return (
          s.englishName.toLowerCase().includes(clean) ||
          s.name.toLowerCase().includes(clean) ||
          (s.englishNameTranslation || "").toLowerCase().includes(clean)
        );
      })
      .map((s) => {
        const j = journal[s.number];
        const done = j?.completedAyahs ?? 0;
        const total = s.numberOfAyahs;
        const pct = Math.min(100, Math.floor((done / total) * 100));

        return `
          <div class="card surah-card" data-id="${s.number}">
            <div class="small muted">
              ${s.number}. ${s.englishName} (${s.name})
            </div>
            <!-- 👇 translation bigger now -->
            <div style="font-size:1rem; font-weight:500; margin-top:8px; line-height:1.25;">
              ${s.englishNameTranslation || ""}
            </div>
            <div class="small" style="margin-top:4px;">
              ${s.revelationType?.toLowerCase() || ""} · ${s.numberOfAyahs} ayahs
            </div>
            <div class="progress" style="margin-top:10px;">
              <span style="width:${pct}%;"></span>
            </div>
            <div style="display:flex; gap:8px; margin-top:12px;">
              <button class="btn open-btn" data-id="${s.number}">Open Surah</button>
              <button class="btn secondary edit-btn" data-id="${s.number}">Add/Edit Journal</button>
            </div>
          </div>
        `;
      })
      .join("");

    list.innerHTML = cards;
    if (info) info.textContent = `Showing ${surahs.length} of 114`;
  } catch (err) {
    console.error(err);
    if (alertBox) {
      alertBox.textContent = err.message;
      alertBox.style.display = "block";
    }
  }
}

// ------------- modal helpers -------------
let currentEditId = null;

function openModal(id, existing) {
  currentEditId = id;
  jmTitle.textContent = `Journal — ${SURAH_NAMES[id] || "Surah " + id}`;
  jmAyahs.value = existing?.completedAyahs ?? 0;
  jmNotes.value = existing?.notes ?? "";
  modal.classList.add("show");
}

function closeModal() {
  modal.classList.remove("show");
  currentEditId = null;
}

// ------------- events -------------
document.addEventListener("DOMContentLoaded", async () => {
  // 🔒 hide search first
  if (heroTools) {
    heroTools.style.display = "none";
    heroTools.style.opacity = "0";
  }

  // hero "Open Surahs"
  if (heroOpenBtn && surahGrid) {
    heroOpenBtn.addEventListener("click", (e) => {
      e.preventDefault();
      surahGrid.classList.remove("hidden-grid");

      // show search now
      if (heroTools) {
        heroTools.style.display = "flex";
        requestAnimationFrame(() => {
          heroTools.style.opacity = "1";
        });
      }

      surahGrid.scrollIntoView({ behavior: "smooth" });
    });
  }

  // daily bubble → fill with today’s pick
  const pick = pickDaily();
  if (heroReminder) {
    heroReminder.dataset.surah = pick.id;
  }
  if (remTitle) remTitle.textContent = pick.name;
  if (remDesc) remDesc.textContent = pick.note;

  if (remRead) {
    remRead.addEventListener("click", () => {
      localStorage.setItem("qj_last_surah", pick.id);
      window.location.href = `./surah.html?id=${pick.id}`;
    });
  }

  if (remLater) {
    remLater.addEventListener("click", () => {
      if (heroReminder) heroReminder.style.display = "none";
    });
  }

  // load list
  await renderList();

  // search
  if (q) {
    q.addEventListener("input", (e) => {
      renderList(e.target.value);
    });
  }

  // refresh
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      renderList(q?.value || "");
    });
  }

  // card actions
  list.addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = Number(btn.dataset.id);
    if (!id) return;

    if (btn.classList.contains("open-btn")) {
      location.href = `./surah.html?id=${id}`;
      return;
    }

    if (btn.classList.contains("edit-btn")) {
      const cur = (await Store.getOne(id)) || {};
      openModal(id, cur);
    }
  });

  // modal buttons
  jmCancel.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  jmSave.addEventListener("click", async () => {
    if (!currentEditId) return;
    const completedAyahs = Number(jmAyahs.value) || 0;
    const notes = jmNotes.value || "";
    await Store.upsert(currentEditId, { completedAyahs, notes });
    closeModal();
    renderList(q?.value || "");
  });
});
