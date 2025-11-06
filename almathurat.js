// renderer/almathurat.js

console.log("[mathurat] offline akuislam version");

// 👇 list in the same *sequence* as akuislam (pagi sughra)
const ALMATHURAT_PAGI = [
  {
    no: 1,
    title: "Al-Fatihah",
    arabic:
      "بِسْمِ اللَّهِ الرَّحْمٰنِ الرَّحِيمِ ... (hingga وَلَا الضَّالِّينَ)",
    rumi:
      "Bismillah, kemudian baca al-Fatihah lengkap sampai 'walad-dallin'.",
    repeat: "1x",
    audio:
      "https://media.akuislam.com/BACAAN%20AL%20MATHURAT/1.%20Surah%20Al%20Fatihah.mp3", // :contentReference[oaicite:1]{index=1}
  },
  {
    no: 2,
    title: "Al-Baqarah 1–5",
    arabic:
      "الم * ذَٰلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ ... (hingga هُمُ الْمُفْلِحُونَ)",
    rumi:
      "Baca permulaan surah al-Baqarah ayat 1 sampai 5 seperti dalam mushaf.",
    repeat: "1x",
    audio:
      "https://media.akuislam.com/BACAAN%20AL%20MATHURAT/2.%20Surah%20al%20Baqarah%201-5.mp3", // :contentReference[oaicite:2]{index=2}
  },
  {
    no: 3,
    title: "Ayat al-Kursi (al-Baqarah: 255)",
    arabic:
      "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ... (hingga وَهُوَ الْعَلِيُّ الْعَظِيمُ)",
    rumi:
      "Baca Ayat Kursi penuh. Ini wirid utama untuk perlindungan pagi.",
    repeat: "1x",
    audio:
      "https://media.akuislam.com/BACAAN%20AL%20MATHURAT/3.%20Ayat%20Kursi.mp3", // :contentReference[oaicite:3]{index=3}
  },
  {
    no: 4,
    title: "Al-Baqarah: 256",
    arabic:
      "لَا إِكْرَاهَ فِي الدِّينِ ... (hingga سَمِيعٌ عَلِيمٌ)",
    rumi: "Baca ayat 256 surah al-Baqarah.",
    repeat: "1x",
    audio:
      "https://media.akuislam.com/BACAAN%20AL%20MATHURAT/4.%20Surah%20al%20Baqarah%20ayat%20256.mp3", // :contentReference[oaicite:4]{index=4}
  },
  {
    no: 5,
    title: "Al-Baqarah: 257",
    arabic:
      "اللَّهُ وَلِيُّ الَّذِينَ آمَنُوا ... (hingga هُمْ فِيهَا خَالِدُونَ)",
    rumi: "Baca ayat 257 surah al-Baqarah.",
    repeat: "1x",
    audio:
      "https://media.akuislam.com/BACAAN%20AL%20MATHURAT/5.%20Surah%20al%20Baqarah%20257.mp3", // :contentReference[oaicite:5]{index=5}
  },
  {
    no: 6,
    title: "Al-Ikhlas",
    arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ ...",
    rumi: "Baca surah al-Ikhlas tiga kali.",
    repeat: "3x",
    audio:
      "https://media.akuislam.com/BACAAN%20AL%20MATHURAT/16.%20Surah%20Al%20Ikhlas.mp3",
  },
  {
    no: 7,
    title: "Al-Falaq",
    arabic: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ...",
    rumi: "Baca surah al-Falaq tiga kali.",
    repeat: "3x",
    audio:
      "https://media.akuislam.com/BACAAN%20AL%20MATHURAT/17.%20Surah%20Al%20Falaq.mp3",
  },
  {
    no: 8,
    title: "An-Nas",
    arabic: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ ...",
    rumi: "Baca surah an-Nas tiga kali.",
    repeat: "3x",
    audio:
      "https://media.akuislam.com/BACAAN%20AL%20MATHURAT/18.%20Surah%20An%20Nas.mp3",
  },
  {
    no: 9,
    title: "Sayyidul Istighfar",
    arabic:
      "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ ...",
    rumi:
      "Allahumma anta rabbii laa ilaaha illaa anta, khalaqtanii wa ana ‘abduka ... (doa istighfar yang Nabi ajar, boleh salin penuh dari buku sendiri).",
    repeat: "1x",
    // no direct audio in that article, so just leave blank or use full
    audio: "",
  },
];

// we can also add petang later, for now just pagi
const listEl = document.getElementById("mathuratList") || document.querySelector("#mathuratList");
const emptyEl = document.getElementById("mathuratEmpty") || document.querySelector("#mathuratEmpty");

// save ticks to localStorage so user dah baca tak hilang
const STORAGE_KEY = "mathurat_pagi_ticks";

function loadTicks() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v ? JSON.parse(v) : {};
  } catch (e) {
    return {};
  }
}

function saveTicks(obj) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  } catch (e) {
    console.warn("[mathurat] cannot save ticks", e);
  }
}

function renderMathurat() {
  const ticks = loadTicks();

  if (!listEl) return;

  listEl.innerHTML = "";

  if (!ALMATHURAT_PAGI.length) {
    if (emptyEl) emptyEl.style.display = "block";
    return;
  } else {
    if (emptyEl) emptyEl.style.display = "none";
  }

  ALMATHURAT_PAGI.forEach((item) => {
    const wrap = document.createElement("article");
    wrap.className = "mathurat-item";

    const checked = !!ticks[item.no];

    wrap.innerHTML = `
      <div class="mathurat-title-line">
        <label style="display:flex;gap:.5rem;align-items:center;">
          <input type="checkbox" data-no="${item.no}" ${checked ? "checked" : ""} />
          <span><strong>${item.no}. ${item.title}</strong> <span style="opacity:.6;font-size:.7rem;">${item.repeat}</span></span>
        </label>
      </div>
      <div class="mathurat-arabic">${item.arabic}</div>
      <div class="mathurat-latin">${item.rumi}</div>
      ${
        item.audio
          ? `<audio class="audio-small" controls preload="none">
               <source src="${assets/audio/almathurat.mp3}" type="audio/mpeg" />
             </audio>`
          : ""
      }
    `;

    listEl.appendChild(wrap);
  });

  // attach checkbox events
  listEl.querySelectorAll("input[type=checkbox]").forEach((cb) => {
    cb.addEventListener("change", () => {
      const no = cb.dataset.no;
      const current = loadTicks();
      if (cb.checked) {
        current[no] = true;
      } else {
        delete current[no];
      }
      saveTicks(current);
    });
  });
}

renderMathurat();
