const API = "https://api.alquran.cloud/v1";
const qs = new URLSearchParams(location.search);
const surahId = Number(qs.get("id")) || 1;

// DOM
const $ = (s) => document.querySelector(s);
const titleEl = $("#title");
const metaEl = $("#meta");
const versesEl = $("#verses");
const perPageSel = $("#perPage");
const prevBtn = $("#prev");
const nextBtn = $("#next");
const pageInfo = $("#pageInfo");
const backBtn = $("#backBtn");
const errBox = $("#err");
const audioPlayer = $("#ayahPlayer");

// browser fallback keys
const PROG_KEY = `qj_surah_${surahId}_progress`;
const JOURNAL_KEY = `jj_${surahId}`;

const HAS_ELECTRON = typeof window !== "undefined" && !!window.journal;

// state
let allAyahs = [];
let state = {
  completedAyahs: 0,
  notes: "",
  lastAyahKey: null,
  lastPage: 1,
  lastPerPage: 20,
};
let page = 1;
let perPage = 20;
let totalPages = 1;

// audio state
let autoPlay = false;
let currentAudioIndex = -1;
let currentPlayingDomId = null;

/* ---------------------------------------------
   helpers
--------------------------------------------- */

function markPlaying(domId) {
  if (currentPlayingDomId) {
    const oldEl = document.getElementById(currentPlayingDomId);
    if (oldEl) oldEl.classList.remove("ayah--playing");
  }
  currentPlayingDomId = domId;
  if (!domId) return;
  const el = document.getElementById(domId);
  if (el) {
    el.classList.add("ayah--playing");
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function stopAudio() {
  autoPlay = false;
  audioPlayer.pause();
  audioPlayer.currentTime = 0;
  if (currentPlayingDomId) {
    const el = document.getElementById(currentPlayingDomId);
    if (el) el.classList.remove("ayah--playing");
    currentPlayingDomId = null;
  }
}

// ----------------------------------------------------
// 1. load state
// ----------------------------------------------------
async function loadState() {
  let electronRec = null;
  let lsProg = null;
  let lsJournal = null;

  if (HAS_ELECTRON) {
    try {
      electronRec = await window.journal.getOne(String(surahId));
    } catch (e) {
      console.warn("journal.getOne error", e);
    }
  }

  try {
    const rawP = localStorage.getItem(PROG_KEY);
    if (rawP) lsProg = JSON.parse(rawP);
  } catch {}
  try {
    const rawJ = localStorage.getItem(JOURNAL_KEY);
    if (rawJ) lsJournal = JSON.parse(rawJ);
  } catch {}

  const hasElectronData =
    electronRec &&
    (electronRec.lastAyahKey ||
      electronRec.completedAyahs ||
      electronRec.lastPage ||
      electronRec.lastPerPage);

  const hasLocalData =
    (lsProg && (lsProg.lastAyahKey || lsProg.lastPage)) ||
    (lsJournal && lsJournal.completedAyahs);

  if (hasElectronData) {
    state = {
      completedAyahs: electronRec.completedAyahs || 0,
      notes: electronRec.notes || "",
      lastAyahKey: electronRec.lastAyahKey || null,
      lastPage: electronRec.lastPage || 1,
      lastPerPage: electronRec.lastPerPage || 20,
    };
  } else if (hasLocalData) {
    state = {
      completedAyahs: (lsJournal && lsJournal.completedAyahs) || 0,
      notes: (lsJournal && lsJournal.notes) || "",
      lastAyahKey: (lsProg && lsProg.lastAyahKey) || null,
      lastPage: (lsProg && lsProg.lastPage) || 1,
      lastPerPage: (lsProg && lsProg.lastPerPage) || 20,
    };

    if (HAS_ELECTRON) {
      try {
        await window.journal.upsert(String(surahId), { ...state });
      } catch (e) {
        console.warn("migrate to Electron failed", e);
      }
    }
  } else {
    state = {
      completedAyahs: 0,
      notes: "",
      lastAyahKey: null,
      lastPage: 1,
      lastPerPage: 20,
    };
  }

  page = state.lastPage || 1;
  perPage = state.lastPerPage || 20;
  perPageSel.value = String(perPage);
}

// ----------------------------------------------------
// 2. save state
// ----------------------------------------------------
async function saveState(partial = {}) {
  state = { ...state, ...partial };

  if (HAS_ELECTRON) {
    try {
      await window.journal.upsert(String(surahId), {
        completedAyahs: state.completedAyahs,
        notes: state.notes,
        lastAyahKey: state.lastAyahKey,
        lastPage: state.lastPage,
        lastPerPage: state.lastPerPage,
      });
    } catch (e) {
      console.warn("journal.upsert error", e);
    }
  }

  try {
    localStorage.setItem(
      PROG_KEY,
      JSON.stringify({
        lastAyahKey: state.lastAyahKey,
        lastPage: state.lastPage,
        lastPerPage: state.lastPerPage,
      })
    );
    localStorage.setItem(
      JOURNAL_KEY,
      JSON.stringify({
        completedAyahs: state.completedAyahs,
        notes: state.notes,
        updatedAt: Date.now(),
      })
    );
  } catch (e) {
    console.warn("localStorage save error", e);
  }
}

// ----------------------------------------------------
// 3. API
// ----------------------------------------------------
async function fetchSurahAllEditions(id) {
  const url = `${API}/surah/${id}/editions/quran-simple,en.sahih,ar.alafasy`;
  const res = await fetch(url);
  const json = await res.json();

  if (json.code !== 200 || !Array.isArray(json.data)) {
    throw new Error("Unexpected API response (not array)");
  }

  const ar = json.data.find((x) => x.edition?.identifier === "quran-simple");
  const en = json.data.find((x) => x.edition?.identifier === "en.sahih");
  const au = json.data.find((x) => x.edition?.identifier === "ar.alafasy");

  if (!ar) throw new Error("Arabic edition not found");

  const total = ar.ayahs?.length || 0;
  const merged = [];
  for (let i = 0; i < total; i++) {
    const a = ar.ayahs[i];
    merged.push({
      numberInSurah: a.numberInSurah,
      arabic: a.text,
      translation: en?.ayahs?.[i]?.text || "",
      audio: au?.ayahs?.[i]?.audio || "",
    });
  }

  return {
    meta: {
      number: ar.number,
      name: ar.name,
      englishName: ar.englishName,
      englishNameTranslation: ar.englishNameTranslation,
      revelationType: ar.revelationType,
      totalAyahs: total,
    },
    ayahs: merged,
  };
}

// ----------------------------------------------------
// 4. audio autoplay + auto page turn
// ----------------------------------------------------
function playFromIndex(idx) {
  if (idx < 0 || idx >= allAyahs.length) {
    autoPlay = false;
    return;
  }

  const ay = allAyahs[idx];

  if (!ay.audio) {
    playFromIndex(idx + 1);
    return;
  }

  currentAudioIndex = idx;
  autoPlay = true;
  audioPlayer.src = ay.audio;
  audioPlayer.play().catch((err) => {
    console.error("audio play error", err);
    autoPlay = false;
  });

  const ayPage = Math.floor(idx / perPage) + 1;
  if (ayPage !== page) {
    page = ayPage;
    renderPage();
  }

  const domId = `ayah-${surahId}-${ay.numberInSurah}`;
  markPlaying(domId);
}

audioPlayer.addEventListener("ended", () => {
  if (!autoPlay) return;
  playFromIndex(currentAudioIndex + 1);
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopAudio();
});

window.addEventListener("beforeunload", () => {
  saveState(state);
  stopAudio();
});

// ----------------------------------------------------
// 5. render
// ----------------------------------------------------
function renderPage() {
  totalPages = Math.max(1, Math.ceil(allAyahs.length / perPage));
  if (page > totalPages) page = totalPages;

  const start = (page - 1) * perPage;
  const current = allAyahs.slice(start, start + perPage);

  versesEl.innerHTML = "";

  current.forEach((v) => {
    const ayahKey = `${surahId}:${v.numberInSurah}`;
    const isChecked = state.lastAyahKey === ayahKey;
    const domId = `ayah-${surahId}-${v.numberInSurah}`;

    const wrap = document.createElement("div");
    wrap.className = "ayah";
    wrap.id = domId;
    wrap.innerHTML = `
      <label class="ayah-wrap">
        <input type="checkbox" class="ayah-check" data-key="${ayahKey}" ${isChecked ? "checked" : ""} />
        <div class="ayah-body">
          <div class="ayah-key small">${ayahKey}</div>
          <div class="ayah-ar">${v.arabic}</div>
          <!-- 👇 removed .small so it's not 12px anymore -->
          <div class="ayah-tr">${v.translation}</div>
          ${
            v.audio
              ? `
                <div class="ayah-audio-btns">
                  <button type="button" class="btn secondary small-btn play-btn" data-idx="${
                    v.numberInSurah - 1
                  }">▶ Play</button>
                  <button type="button" class="btn danger small-btn stop-btn" data-idx="${
                    v.numberInSurah - 1
                  }">⏹ Stop</button>
                </div>`
              : ""
          }
        </div>
      </label>
    `;

    const chk = wrap.querySelector(".ayah-check");
    const playBtn = wrap.querySelector(".play-btn");
    const stopBtn = wrap.querySelector(".stop-btn");

    chk.addEventListener("change", async () => {
      if (chk.checked) {
        versesEl
          .querySelectorAll(".ayah-check")
          .forEach((c) => c !== chk && (c.checked = false));
        await saveState({
          lastAyahKey: ayahKey,
          lastPage: page,
          lastPerPage: perPage,
          completedAyahs: v.numberInSurah,
        });
      } else {
        await saveState({ lastAyahKey: null });
      }
    });

    if (playBtn) {
      playBtn.addEventListener("click", () => {
        const idx = Number(playBtn.dataset.idx);
        playFromIndex(idx);
      });
    }

    if (stopBtn) {
      stopBtn.addEventListener("click", () => {
        stopAudio();
      });
    }

    if (currentPlayingDomId === domId) {
      wrap.classList.add("ayah--playing");
    }

    versesEl.appendChild(wrap);
  });

  pageInfo.textContent = `Page ${page} / ${totalPages}`;
  prevBtn.disabled = page <= 1;
  nextBtn.disabled = page >= totalPages;

  if (state.lastAyahKey && state.lastPage === page && !currentPlayingDomId) {
    const el = document.getElementById(
      `ayah-${state.lastAyahKey.replace(":", "-")}`
    );
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.style.outline = "2px solid rgba(42,165,249,0.4)";
      setTimeout(() => (el.style.outline = "none"), 2000);
    }
  }
}

// ----------------------------------------------------
// 6. events
// ----------------------------------------------------
perPageSel.addEventListener("change", async () => {
  perPage = Number(perPageSel.value);
  page = 1;
  await saveState({ lastPerPage: perPage, lastPage: 1 });
  renderPage();
});

prevBtn.addEventListener("click", () => {
  if (page > 1) {
    page--;
    renderPage();
  }
});

nextBtn.addEventListener("click", () => {
  if (page < totalPages) {
    page++;
    renderPage();
  }
});

backBtn.addEventListener("click", () => {
  stopAudio();
  history.back();
});

// ----------------------------------------------------
// 7. boot
// ----------------------------------------------------
(async () => {
  try {
    await loadState();
    const { meta, ayahs } = await fetchSurahAllEditions(surahId);
    allAyahs = ayahs;

    titleEl.textContent = `${meta.englishName} — ${meta.name}`;
    metaEl.textContent = `Surah ${meta.number} · ${meta.totalAyahs} ayahs · Revelation: ${meta.revelationType} · ${meta.englishNameTranslation}`;

    renderPage();
  } catch (e) {
    console.error(e);
    errBox.textContent = `Error loading surah: ${e.message}`;
    errBox.style.display = "block";
  }
})();
