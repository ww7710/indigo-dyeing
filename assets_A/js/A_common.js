/**
 * 三峽藍染 400 年：以原創 IP 與數位內容推廣傳統工藝
 * 全站共用互動邏輯 (Common Navigation, Progress Bar & VTuber Widget)
 */

document.addEventListener('DOMContentLoaded', () => {
  initProgressBar();
  initNavbar();
  initFloatingWidget();
  initAudioChime();
});

/* ==========================================================================
   1. 頂部 2px 滾動進度條 (Scroll Progress Bar)
   ========================================================================== */
function initProgressBar() {
  const progressBar = document.getElementById('scroll-progress-bar');
  if (!progressBar) return;

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight > 0) {
      const progress = (window.scrollY / totalHeight) * 100;
      progressBar.style.width = `${progress}%`;
    }
  }, { passive: true });
}

/* ==========================================================================
   2. 置頂固定導航列與手機版漢堡選單 (Navbar & Mobile Menu)
   ========================================================================== */
function initNavbar() {
  const navbar = document.querySelector('.fixed-navbar');
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu-dropdown');

  // 滾動時增加微陰影
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // 漢堡選單開關
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
      mobileToggle.setAttribute('aria-expanded', !isExpanded);
      mobileMenu.classList.toggle('hidden');
      
      const iconMenu = mobileToggle.querySelector('.icon-menu');
      const iconClose = mobileToggle.querySelector('.icon-close');
      if (iconMenu && iconClose) {
        iconMenu.classList.toggle('hidden');
        iconClose.classList.toggle('hidden');
      }
    });

    // 點擊選單內部錨點連結自動關閉手機選單
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        mobileToggle.setAttribute('aria-expanded', 'false');
        const iconMenu = mobileToggle.querySelector('.icon-menu');
        const iconClose = mobileToggle.querySelector('.icon-close');
        if (iconMenu && iconClose) {
          iconMenu.classList.remove('hidden');
          iconClose.classList.add('hidden');
        }
      });
    });
  }
}

/* ==========================================================================
   3. Web Audio API 純代碼零依賴擬真音效 (Procedural Sound Synthesizer)
   ========================================================================== */
let audioCtx = null;

function initAudioChime() {
  // 首次使用者點擊後解鎖 AudioContext
  const unlockAudio = () => {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    document.removeEventListener('click', unlockAudio);
    document.removeEventListener('touchstart', unlockAudio);
  };
  document.addEventListener('click', unlockAudio, { once: true });
  document.addEventListener('touchstart', unlockAudio, { once: true });
}

window.playIndigoChime = function(freq = 659.25) { // E5 note
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, audioCtx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.35);
  } catch (err) {
    // 靜音 fallback
  }
};

/* ==========================================================================
   4. VTuber 小染懸浮助手互動 (Floating Xiao Ran Widget)
   ========================================================================== */
const XIAORAN_DIALOGS = [
  "嗨！我是三峽藍染守護精靈小染！點我可以為你快速指路喔～✨",
  "你知道嗎？染缸裡的染液其實是黃綠色的喔！出缸接觸空氣才會變成深藍色！🌿",
  "想知道你的性格適合哪種藍染圖騰嗎？快點擊「花紋心理學」測驗看看！🌸",
  "三峽山區濕潤多霧的氣候，正是培育頂級「馬藍」的最佳溫床喔！⛰️",
  "從古埃及到三峽老街，傳統藍染已傳承超過四百年，快看看懶人包吧！📜"
];

function initFloatingWidget() {
  const widgetBtn = document.getElementById('widget-avatar-btn');
  const dialogBubble = document.getElementById('widget-dialog-bubble');
  const dialogText = document.getElementById('widget-dialog-text');
  const closeDialogBtn = document.getElementById('widget-dialog-close');

  if (!widgetBtn || !dialogBubble) return;

  let currentDialogIndex = 0;

  // 點擊頭像切換對話框與台詞
  widgetBtn.addEventListener('click', () => {
    if (window.playIndigoChime) window.playIndigoChime(783.99); // G5 note
    
    if (dialogBubble.classList.contains('hidden-dialog')) {
      dialogBubble.classList.remove('hidden-dialog');
      if (dialogText) {
        dialogText.textContent = XIAORAN_DIALOGS[currentDialogIndex];
        currentDialogIndex = (currentDialogIndex + 1) % XIAORAN_DIALOGS.length;
      }
    } else {
      if (dialogText) {
        // 若已開啟則輪換台詞
        dialogText.textContent = XIAORAN_DIALOGS[currentDialogIndex];
        currentDialogIndex = (currentDialogIndex + 1) % XIAORAN_DIALOGS.length;
      }
    }
  });

  if (closeDialogBtn) {
    closeDialogBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dialogBubble.classList.add('hidden-dialog');
    });
  }

  // 頁面載入 3 秒後自動冒泡打招呼一次
  setTimeout(() => {
    if (dialogBubble.classList.contains('hidden-dialog')) {
      dialogBubble.classList.remove('hidden-dialog');
      if (dialogText) {
        dialogText.textContent = XIAORAN_DIALOGS[0];
      }
    }
  }, 3000);
}
