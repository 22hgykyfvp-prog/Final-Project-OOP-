// renderer/progress.js — ayah-based progress + "continue" button
console.log("[progress] loaded");

// DOM
const list = document.querySelector("#progress-list");
const totalSurahEl = document.querySelector("#progress-count");
const totalAyahEl = document.querySelector("#progress-ayahs");
const emptyEl = document.querySelector("#progress-empty");
const barFill = document.querySelector("#progress-bar-fill");
const percentEl = document.querySelector("#progress-percent");

// 114 surahs: name + ayahCount
const SURAH_META = {
  1: { name: "Al-Fatihah", ayahs: 7 },
  2: { name: "Al-Baqarah", ayahs: 286 },
  3: { name: "Ali 'Imran", ayahs: 200 },
  4: { name: "An-Nisa'", ayahs: 176 },
  5: { name: "Al-Ma'idah", ayahs: 120 },
  6: { name: "Al-An'am", ayahs: 165 },
  7: { name: "Al-A'raf", ayahs: 206 },
  8: { name: "Al-Anfal", ayahs: 75 },
  9: { name: "At-Tawbah", ayahs: 129 },
  10: { name: "Yunus", ayahs: 109 },
  11: { name: "Hud", ayahs: 123 },
  12: { name: "Yusuf", ayahs: 111 },
  13: { name: "Ar-Ra'd", ayahs: 43 },
  14: { name: "Ibrahim", ayahs: 52 },
  15: { name: "Al-Hijr", ayahs: 99 },
  16: { name: "An-Nahl", ayahs: 128 },
  17: { name: "Al-Isra'", ayahs: 111 },
  18: { name: "Al-Kahf", ayahs: 110 },
  19: { name: "Maryam", ayahs: 98 },
  20: { name: "Ta-Ha", ayahs: 135 },
  21: { name: "Al-Anbiya'", ayahs: 112 },
  22: { name: "Al-Hajj", ayahs: 78 },
  23: { name: "Al-Mu’minun", ayahs: 118 },
  24: { name: "An-Nur", ayahs: 64 },
  25: { name: "Al-Furqan", ayahs: 77 },
  26: { name: "Ash-Shu'ara'", ayahs: 227 },
  27: { name: "An-Naml", ayahs: 93 },
  28: { name: "Al-Qasas", ayahs: 88 },
  29: { name: "Al-Ankabut", ayahs: 69 },
  30: { name: "Ar-Rum", ayahs: 60 },
  31: { name: "Luqman", ayahs: 34 },
  32: { name: "As-Sajdah", ayahs: 30 },
  33: { name: "Al-Ahzab", ayahs: 73 },
  34: { name: "Saba'", ayahs: 54 },
  35: { name: "Fatir", ayahs: 45 },
  36: { name: "Ya-Sin", ayahs: 83 },
  37: { name: "As-Saffat", ayahs: 182 },
  38: { name: "Sad", ayahs: 88 },
  39: { name: "Az-Zumar", ayahs: 75 },
  40: { name: "Ghafir", ayahs: 85 },
  41: { name: "Fussilat", ayahs: 54 },
  42: { name: "Ash-Shura", ayahs: 53 },
  43: { name: "Az-Zukhruf", ayahs: 89 },
  44: { name: "Ad-Dukhan", ayahs: 59 },
  45: { name: "Al-Jathiyah", ayahs: 37 },
  46: { name: "Al-Ahqaf", ayahs: 35 },
  47: { name: "Muhammad", ayahs: 38 },
  48: { name: "Al-Fath", ayahs: 29 },
  49: { name: "Al-Hujurat", ayahs: 18 },
  50: { name: "Qaf", ayahs: 45 },
  51: { name: "Adh-Dhariyat", ayahs: 60 },
  52: { name: "At-Tur", ayahs: 49 },
  53: { name: "An-Najm", ayahs: 62 },
  54: { name: "Al-Qamar", ayahs: 55 },
  55: { name: "Ar-Rahman", ayahs: 78 },
  56: { name: "Al-Waqi'ah", ayahs: 96 },
  57: { name: "Al-Hadid", ayahs: 29 },
  58: { name: "Al-Mujadilah", ayahs: 22 },
  59: { name: "Al-Hashr", ayahs: 24 },
  60: { name: "Al-Mumtahanah", ayahs: 13 },
  61: { name: "As-Saff", ayahs: 14 },
  62: { name: "Al-Jumu'ah", ayahs: 11 },
  63: { name: "Al-Munafiqun", ayahs: 11 },
  64: { name: "At-Taghabun", ayahs: 18 },
  65: { name: "At-Talaq", ayahs: 12 },
  66: { name: "At-Tahrim", ayahs: 12 },
  67: { name: "Al-Mulk", ayahs: 30 },
  68: { name: "Al-Qalam", ayahs: 52 },
  69: { name: "Al-Haqqah", ayahs: 52 },
  70: { name: "Al-Ma'arij", ayahs: 44 },
  71: { name: "Nuh", ayahs: 28 },
  72: { name: "Al-Jinn", ayahs: 28 },
  73: { name: "Al-Muzzammil", ayahs: 20 },
  74: { name: "Al-Muddaththir", ayahs: 56 },
  75: { name: "Al-Qiyamah", ayahs: 40 },
  76: { name: "Al-Insan", ayahs: 31 },
  77: { name: "Al-Mursalat", ayahs: 50 },
  78: { name: "An-Naba'", ayahs: 40 },
  79: { name: "An-Nazi'at", ayahs: 46 },
  80: { name: "'Abasa", ayahs: 42 },
  81: { name: "At-Takwir", ayahs: 29 },
  82: { name: "Al-Infitar", ayahs: 19 },
  83: { name: "Al-Mutaffifin", ayahs: 36 },
  84: { name: "Al-Inshiqaq", ayahs: 25 },
  85: { name: "Al-Buruj", ayahs: 22 },
  86: { name: "At-Tariq", ayahs: 17 },
  87: { name: "Al-A'la", ayahs: 19 },
  88: { name: "Al-Ghashiyah", ayahs: 26 },
  89: { name: "Al-Fajr", ayahs: 30 },
  90: { name: "Al-Balad", ayahs: 20 },
  91: { name: "Ash-Shams", ayahs: 15 },
  92: { name: "Al-Layl", ayahs: 21 },
  93: { name: "Ad-Duha", ayahs: 11 },
  94: { name: "Ash-Sharh", ayahs: 8 },
  95: { name: "At-Tin", ayahs: 8 },
  96: { name: "Al-'Alaq", ayahs: 19 },
  97: { name: "Al-Qadr", ayahs: 5 },
  98: { name: "Al-Bayyinah", ayahs: 8 },
  99: { name: "Az-Zalzalah", ayahs: 8 },
  100: { name: "Al-'Adiyat", ayahs: 11 },
  101: { name: "Al-Qari'ah", ayahs: 11 },
  102: { name: "At-Takathur", ayahs: 8 },
  103: { name: "Al-'Asr", ayahs: 3 },
  104: { name: "Al-Humazah", ayahs: 9 },
  105: { name: "Al-Fil", ayahs: 5 },
  106: { name: "Quraysh", ayahs: 4 },
  107: { name: "Al-Ma'un", ayahs: 7 },
  108: { name: "Al-Kawthar", ayahs: 3 },
  109: { name: "Al-Kafirun", ayahs: 6 },
  110: { name: "An-Nasr", ayahs: 3 },
  111: { name: "Al-Masad", ayahs: 5 },
  112: { name: "Al-Ikhlas", ayahs: 4 },
  113: { name: "Al-Falaq", ayahs: 5 },
  114: { name: "An-Nas", ayahs: 6 },
};

// total ayahs of Qur'an
const TOTAL_AYAHS = Object.values(SURAH_META).reduce(
  (sum, s) => sum + s.ayahs,
  0
);

// adapter
const J = (() => {
  const isElectron = typeof window !== "undefined" && !!window.journal;

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
      if (isElectron) {
        const raw = (await window.journal.getAll()) || {};
        const all = Array.isArray(raw)
          ? raw.reduce((acc, item) => {
              const id = item.surahNumber || item.id;
              if (!id) return acc;
              acc[id] = {
                completedAyahs:
                  item.completedAyahs ?? item.completedAyah ?? 0,
                notes: item.notes ?? item.note ?? "",
                updatedAt: item.updatedAt ?? new Date().toISOString(),
              };
              return acc;
            }, {})
          : raw;
        return all;
      }
      return loadAllFromLocal();
    },
  };
})();

async function renderProgress() {
  const all = await J.getAll();
  const ids = Object.keys(all);

  // 1) journals count
  const journalsCount = ids.length;
  if (totalSurahEl) totalSurahEl.textContent = `${journalsCount} / 114`;

  // 2) total ayahs completed (capped)
  let completedAyahs = 0;
  ids.forEach((id) => {
    const rec = all[id];
    const meta = SURAH_META[id];
    const maxAyahs = meta ? meta.ayahs : 6236;
    const done = Math.min(rec.completedAyahs ?? 0, maxAyahs);
    completedAyahs += done;
  });

  if (totalAyahEl) totalAyahEl.textContent = `${completedAyahs} / ${TOTAL_AYAHS}`;

  // 3) bar
  const percent = Math.min(100, Math.round((completedAyahs / TOTAL_AYAHS) * 100));
  if (barFill) barFill.style.width = percent + "%";
  if (percentEl) percentEl.textContent = percent + "% completed";

  // 4) empty state
  if (!ids.length) {
    if (emptyEl) emptyEl.style.display = "block";
    if (list) list.innerHTML = "";
    return;
  } else {
    if (emptyEl) emptyEl.style.display = "none";
  }

  // 5) render list
  if (list) {
    list.innerHTML = ids
      .sort((a, b) => Number(a) - Number(b))
      .map((id) => {
        const rec = all[id];
        const meta = SURAH_META[id];
        const name = meta ? meta.name : `Surah ${id}`;
        const ayahs = rec.completedAyahs ?? 0;
        const time = rec.updatedAt
          ? new Date(rec.updatedAt).toLocaleString()
          : "";

        return `
          <li class="progress-item">
            <div class="progress-left">
              <div class="progress-surah">${name}</div>
              ${rec.notes ? `<div class="progress-note">${rec.notes}</div>` : ""}
            </div>
            <div class="progress-right">
              <div class="progress-count">${ayahs} ayahs</div>
              ${time ? `<div class="progress-time">${time}</div>` : ""}
              <button class="progress-open" data-surah="${id}">Continue</button>
            </div>
          </li>
        `;
      })
      .join("");
  }
}

// click → go to surah
document.addEventListener("DOMContentLoaded", () => {
  renderProgress().catch((err) => console.error(err));

  if (list) {
    list.addEventListener("click", (e) => {
      const btn = e.target.closest(".progress-open");
      if (!btn) return;
      const surahId = btn.dataset.surah;
      if (!surahId) return;

      // remember
      localStorage.setItem("qj_last_surah", surahId);

      // ✅ your surah.js expects ?id=, so:
      window.location.href = `./surah.html?id=${surahId}`;
    });
  }
});
