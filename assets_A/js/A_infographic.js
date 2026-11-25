/**
 * 三峽藍染 400 年：數位互動懶人包
 * 歷史滾動時間軸、馬藍 vs 木藍對比滑塊、染缸剖面 Hover 發光互動
 */

document.addEventListener('DOMContentLoaded', () => {
  initTimelineScroll();
  initCompareSlider();
  initVatLayerInteractive();
  initPatternCardsAudio();
});

/* ==========================================================================
   1. 歷史時間軸滾動漸顯動畫 (Timeline Scroll Reveal)
   ========================================================================== */
function initTimelineScroll() {
  const timelineNodes = document.querySelectorAll('.timeline-node');
  if (!timelineNodes.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('opacity-100', 'translate-y-0');
        entry.target.classList.remove('opacity-0', 'translate-y-8');
      }
    });
  }, { threshold: 0.2 });

  timelineNodes.forEach(node => {
    node.classList.add('transition-all', 'duration-700', 'opacity-0', 'translate-y-8');
    observer.observe(node);
  });
}

/* ==========================================================================
   2. 馬藍 vs 木藍對比滑塊 (Split Compare Slider)
   ========================================================================== */
function initCompareSlider() {
  const container = document.getElementById('plant-compare-container');
  const slider = document.getElementById('plant-compare-slider');
  const overlay = document.getElementById('plant-overlay-image');
  const divider = document.getElementById('plant-slider-divider');

  if (!container || !slider || !overlay) return;

  function updateSlider(val) {
    const percentage = Math.max(0, Math.min(100, val));
    overlay.style.width = `${percentage}%`;
    if (divider) divider.style.left = `${percentage}%`;
  }

  slider.addEventListener('input', (e) => {
    updateSlider(e.target.value);
  });

  // 支援在容器上拖曳滑鼠/觸控
  let isDragging = false;

  const handleMove = (e) => {
    if (!isDragging) return;
    const rect = container.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const offset = clientX - rect.left;
    const pct = (offset / rect.width) * 100;
    slider.value = pct;
    updateSlider(pct);
  };

  container.addEventListener('mousedown', () => { isDragging = true; });
  window.addEventListener('mouseup', () => { isDragging = false; });
  window.addEventListener('mousemove', handleMove);

  container.addEventListener('touchstart', () => { isDragging = true; }, { passive: true });
  window.addEventListener('touchend', () => { isDragging = false; });
  window.addEventListener('touchmove', handleMove, { passive: true });

  // 初始設在 50%
  updateSlider(50);
}

/* ==========================================================================
   3. 染缸剖面 Hover 發光與四要素解密 (Vat Layer Hover Glow)
   ========================================================================== */
const VAT_DETAILS = {
  flower: {
    title: "1. 頂層發酵藍花 (Indigo Foam)",
    desc: "藍染缸表面浮現的細密泡沫稱為「藍花」，呈現深邃帶紫之靛藍色。藍花越細膩濃郁，代表染缸內的微生物生機旺盛，是染液處於健康發酵還原狀態的最直接標誌！"
  },
  alkali: {
    title: "2. 鹼度調節：消石灰 / 天然草木灰水",
    desc: "藍草提取之藍泥在酸性或中性環境下無法溶解。必須加入消石灰或天然草木灰水，將染缸 pH 值精準維持在 10 ~ 11 的強鹼環境，色素分子方能溶解展開還原！"
  },
  nutrient: {
    title: "3. 活化養分：天然米酒與麥芽糖",
    desc: "染缸內的嗜鹼性微生物就像活體生命，需要持續攝取醣類養分。適量添加天然純米酒與純麥芽糖，能持續滋養益菌繁殖，使發酵還原反應持久不斷。"
  },
  leuco: {
    title: "4. 還原態染液：淡黃綠色白靛 (Leuco-indigo)",
    desc: "很多人誤以為染缸裡也是深藍色，其實真正健康的染液呈現透明清澈的「淡黃綠色」！這是還原態水溶性白靛分子，布料浸泡於此吸收色素，撈出接觸空氣吸氧才會瞬間變為湛藍！"
  },
  sediment: {
    title: "5. 缸底沉澱：細緻植物纖維與微粒",
    desc: "發酵靜置過程中，過多的石灰渣滓與不溶性植物微粒自然沉積於陶缸底層，保持中層染液純淨均勻，避免染色時出現斑駁色斑。"
  }
};

function initVatLayerInteractive() {
  const layers = document.querySelectorAll('.vat-interactive-layer');
  const titleEl = document.getElementById('vat-detail-title');
  const descEl = document.getElementById('vat-detail-desc');

  if (!layers.length || !titleEl || !descEl) return;

  layers.forEach(layer => {
    layer.addEventListener('mouseenter', () => {
      const type = layer.dataset.layer;
      const data = VAT_DETAILS[type];
      if (data) {
        titleEl.textContent = data.title;
        descEl.textContent = data.desc;
        if (window.playIndigoChime) window.playIndigoChime(622.25); // D#5
      }

      // 高亮當前 layer
      layers.forEach(l => l.classList.remove('vat-active-glow'));
      layer.classList.add('vat-active-glow');
    });
  });
}

/* ==========================================================================
   4. 花紋圖鑑 Hover 音效
   ========================================================================== */
function initPatternCardsAudio() {
  const cards = document.querySelectorAll('.pattern-technique-card');
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      if (window.playIndigoChime) window.playIndigoChime(523.25);
    });
  });
}
