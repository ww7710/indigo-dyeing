/**
 * 三峽藍染 400 年：花紋心理學 ✕ 測出你的本命花紋
 * 核心互動邏輯與純 Canvas 向量動態生成 9:16 IG 限動分享卡片
 */

// 測驗題目資料庫 (4 關情境題)
const QUIZ_QUESTIONS = [
  {
    step: 1,
    category: "防染設計",
    title: "關卡 1：防染設計（選擇你的綁紮工具）",
    scenario: "面對眼前的純白布料，你打算如何處理布料以阻擋染液？",
    question: "當你要為白布進行「防染設計」時，你最直覺會拿起什麼工具？",
    options: [
      { key: "A", text: "橡皮筋與繩子", desc: "緊緊綑綁，隨性摺疊出同心圓與幾何線條。", type: "A" },
      { key: "B", text: "對稱的兩片木板與夾子", desc: "精準夾緊，創造出嚴謹且規則對稱的花紋。", type: "B" },
      { key: "C", text: "針與棉線", desc: "細心地一針一線縫出圖騰形狀，再拉緊打結。", type: "C" },
      { key: "D", text: "分階段浸泡的竹棒", desc: "不上防染工具，決定用「時間與浸泡深度」製造漸層。", type: "D" }
    ]
  },
  {
    step: 2,
    category: "調配染缸",
    title: "關卡 2：調配染缸（選擇你的魔法養分）",
    scenario: "藍染缸裡的微生物需要養分才能活化（還原）染液。",
    question: "看著呈現淡黃綠色的還原染缸，你覺得此時最需要加入什麼魔法養分？",
    options: [
      { key: "A", text: "香醇的天然米酒", desc: "點燃熱情，讓發酵過程充滿活力與驚喜。", type: "A" },
      { key: "B", text: "濃郁的麥芽糖", desc: "提供穩定而持久的養分，細水長流地照顧染缸。", type: "B" },
      { key: "C", text: "清澈的草木灰水", desc: "保持完美的酸鹼度平衡，注重原則與沉穩秩序。", type: "B" },
      { key: "D", text: "盛開的馬藍花瓣", desc: "憑感覺增添浪漫氣息與美感靈魂。", type: "C" }
    ]
  },
  {
    step: 3,
    category: "浸染過程",
    title: "關卡 3：浸染過程（面對時間與變化）",
    scenario: "將綁好的布料浸入藍染缸中，手在染液裡輕柔揉捏。",
    question: "此時在染缸中揉捏布料的這 3 分鐘裡，你的內心在想些什麼？",
    options: [
      { key: "A", text: "充滿期待的冒險感", desc: "好期待！不知道解開繩子那一刻會不會出現意想不到的驚奇！", type: "A" },
      { key: "B", text: "嚴謹計時與掌握細節", desc: "專心數著秒數，確保每一個部位都有均勻吸收色素與均勻受力。", type: "B" },
      { key: "C", text: "沉浸平靜的心靈療癒", desc: "靜靜感受著手掌溫度的傳遞，沉浸在這一刻平靜而療癒的時光。", type: "C" },
      { key: "D", text: "美學搭配與未來穿搭", desc: "開始思考這個布料做成帆布袋或圍巾後，可以怎麼搭配明天的穿搭。", type: "D" }
    ]
  },
  {
    step: 4,
    category: "氧化見證",
    title: "關卡 4：氧化見證（看見顏色的瞬間）",
    scenario: "把布料從染缸中撈出，黃綠色的布料一接觸空氣，數秒內迅速轉化為深藍色！",
    question: "親眼見證「黃綠變深藍」的神奇化學魔法時，哪一種感覺最符合你的心境？",
    options: [
      { key: "A", text: "讚嘆萬物的神奇！", desc: "這種不可預測的變幻莫測太令人著迷了。", type: "A" },
      { key: "B", text: "感到踏實與成就感", desc: "只要按照正確步驟，就一定能收穫美好的成果。", type: "B" },
      { key: "C", text: "被沉靜深藍撫平浮躁", desc: "內心獲得極大的療癒與深深的滿足感。", type: "C" },
      { key: "D", text: "靈感大爆發！", desc: "立刻想把這抹美麗的藍色分享給身邊重要的朋友。", type: "D" }
    ]
  }
];

// 結果資料庫 (包含專屬關鍵字與小染提示)
const QUIZ_RESULTS = {
  A: {
    type: "A",
    title: "隨性優雅的「扎染 (絞染) 靈魂」",
    patternName: "自由奔放的水波同心圓",
    plant: "活力充沛的馬藍",
    colorName: "湛藍色 (Deep Indigo)",
    colorHex: "#1e3a8a",
    badge: "扎染靈魂",
    keywords: ["#自由奔放", "#隨性優雅", "#打破框架", "#開盲盒般的驚喜"],
    personality: "你就像扎染一樣，隨性自由、不受拘束，且充滿創造力！你擁有極強的適應力與熱情，不喜歡被固定框架限制。在你身上總是能看見驚喜，朋友眼中的你就像開盲盒一樣，永遠充滿獨特魅力與新鮮感。",
    quote: "「解開繩圈的那一刻，就是你綻放獨一無二光的瞬間！」",
    tip: "小染悄悄話：你的靈魂像三峽山嵐一樣無拘無束，勇敢活出屬於自己的專屬色澤吧！"
  },
  B: {
    type: "B",
    title: "精準典雅的「夾染靈魂」",
    patternName: "對稱幾何與規律幾何圖騰",
    plant: "沉穩堅毅的木藍",
    colorName: "墨藍色 (Dark Navy)",
    colorHex: "#0f172a",
    badge: "夾染靈魂",
    keywords: ["#精準典雅", "#條理分明", "#原則堅持", "#極致美學追求"],
    personality: "你就像夾染一樣，注重細節、邏輯清晰且極具原則感！你做事條理分明，對自我有嚴格的要求，給人無比的安全感與信任感。雖然表面看起來內斂冷靜，但其實內心對品質與美學有著極高且不妥協的堅持。",
    quote: "「在規則與條理中，你總能勾勒出最完美而穩定的圖騰。」",
    tip: "小染悄悄話：你的自律與專注力非常耀眼，就像老街匠人對每一道工序的嚴謹執著！"
  },
  C: {
    type: "C",
    title: "細緻溫柔的「縫染靈魂」",
    patternName: "溫柔細膩的點線花紋與花朵圖案",
    plant: "含蓄優雅的藍草花",
    colorName: "天青藍 (Cerulean Blue)",
    colorHex: "#0284c7",
    badge: "縫染靈魂",
    keywords: ["#細緻溫柔", "#至真至純", "#共情同理", "#一針一線的溫度"],
    personality: "你就像縫染一樣，心思細膩、情感豐富且具備極大的同理心！你善於照顧身邊人的感受，注重生活中的小確幸與質感。你一針一線積累出的人生厚度，讓周遭的人都能感受到療癒與溫暖。",
    quote: "「耐心地付出，時間終會為你綻放出最細致繁複的花朵。」",
    tip: "小染悄悄話：懂得溫柔待人是你的超能力，但也別忘了留一朵美麗的花給自己喔！"
  },
  D: {
    type: "D",
    title: "漸進層次的「段染靈魂」",
    patternName: "層次豐富的漸層與色塊水墨感",
    plant: "適應力強的菘藍",
    colorName: "淺靛藍 (Soft Denim)",
    colorHex: "#3b82f6",
    badge: "段染靈魂",
    keywords: ["#游刃有餘", "#層次通達", "#深謀遠慮", "#歲月沉澱之美"],
    personality: "你就像段染一樣，深謀遠慮、富有遠見且極具美學品味！你明白萬事萬物皆需要時間的沉澱，不急於一時的成功。你善於在不同環境中找到自己的最佳定位，展現出多樣化且包容性極強的個人魅力。",
    quote: "「每一次的沉澱，都讓你的人生醞釀出更深邃美好的色彩。」",
    tip: "小染悄悄話：不急於一時的爆發，你的深度就像層層浸染的深邃靛青，耐人尋味！"
  }
};

// 狀態變數
let currentQuestionIndex = 0;
let userAnswers = [];
let currentResult = null;

document.addEventListener('DOMContentLoaded', () => {
  initQuizFlow();
});

/* ==========================================================================
   1. 測驗流程控制 (Quiz Flow Controller)
   ========================================================================== */
function initQuizFlow() {
  const introSection = document.getElementById('quiz-intro-section');
  const questionsSection = document.getElementById('quiz-questions-section');
  const startBtn = document.getElementById('btn-start-quiz');

  if (startBtn) {
    startBtn.addEventListener('click', () => {
      if (window.playIndigoChime) window.playIndigoChime(587.33); // D5
      introSection.classList.add('hidden');
      questionsSection.classList.remove('hidden');
      currentQuestionIndex = 0;
      userAnswers = [];
      renderQuestion(0);
    });
  }
}

function renderQuestion(index) {
  const qData = QUIZ_QUESTIONS[index];
  if (!qData) return;

  const stepIndicator = document.getElementById('quiz-step-indicator');
  const questionCategory = document.getElementById('quiz-question-category');
  const questionTitle = document.getElementById('quiz-question-title');
  const scenarioText = document.getElementById('quiz-scenario-text');
  const questionText = document.getElementById('quiz-question-text');
  const optionsContainer = document.getElementById('quiz-options-container');
  const progressLine = document.getElementById('quiz-progress-inner');

  if (stepIndicator) stepIndicator.textContent = `第 ${index + 1} 關 / 共 4 關`;
  if (questionCategory) questionCategory.textContent = qData.category;
  if (questionTitle) questionTitle.textContent = qData.title;
  if (scenarioText) scenarioText.textContent = qData.scenario;
  if (questionText) questionText.textContent = qData.question;
  if (progressLine) progressLine.style.width = `${((index + 1) / 4) * 100}%`;

  if (optionsContainer) {
    optionsContainer.innerHTML = '';
    qData.options.forEach((opt) => {
      const btn = document.createElement('button');
      btn.className = "w-full text-left p-4 sm:p-5 rounded-2xl border-2 border-brand-lavender/60 bg-white/90 hover:border-brand-deep hover:bg-brand-sky/20 transition-all duration-200 group flex items-start gap-4 shadow-sm";
      btn.innerHTML = `
        <div class="w-8 h-8 rounded-xl bg-brand-deep/10 text-brand-deep font-bold flex items-center justify-center flex-shrink-0 group-hover:bg-brand-deep group-hover:text-white transition-colors">
          ${opt.key}
        </div>
        <div class="space-y-1">
          <div class="font-bold text-slate-800 text-sm sm:text-base group-hover:text-brand-deep transition-colors">
            ${opt.text}
          </div>
          <div class="text-xs sm:text-sm text-slate-500 leading-relaxed">
            ${opt.desc}
          </div>
        </div>
      `;

      btn.addEventListener('click', () => {
        selectOption(opt.type);
      });

      optionsContainer.appendChild(btn);
    });
  }
}

function selectOption(selectedType) {
  if (window.playIndigoChime) window.playIndigoChime(659.25); // E5
  userAnswers.push(selectedType);

  if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
    currentQuestionIndex++;
    renderQuestion(currentQuestionIndex);
  } else {
    // 4 題全數完成，直接顯示測驗結果並動態生成卡片
    calculateAndShowResult();
  }
}

function calculateAndShowResult() {
  const counts = { A: 0, B: 0, C: 0, D: 0 };
  userAnswers.forEach(type => {
    if (counts[type] !== undefined) counts[type]++;
  });

  let maxType = "A";
  let maxCount = -1;
  ['A', 'B', 'C', 'D'].forEach(t => {
    if (counts[t] > maxCount) {
      maxCount = counts[t];
      maxType = t;
    }
  });

  currentResult = QUIZ_RESULTS[maxType] || QUIZ_RESULTS.A;

  const questionsSection = document.getElementById('quiz-questions-section');
  const resultSection = document.getElementById('quiz-result-section');

  if (questionsSection) questionsSection.classList.add('hidden');
  if (resultSection) {
    resultSection.classList.remove('hidden');
    renderResultUI(currentResult);
  }

  // 自動平滑滾動至結果頂端
  resultSection.scrollIntoView({ behavior: 'smooth' });
}

function renderResultUI(res) {
  document.getElementById('res-pattern-badge').textContent = res.badge;
  document.getElementById('res-title').textContent = res.title;
  document.getElementById('res-pattern-name').textContent = res.patternName;
  document.getElementById('res-plant').textContent = res.plant;
  document.getElementById('res-lucky-color').textContent = res.colorName;
  document.getElementById('res-personality').textContent = res.personality;
  document.getElementById('res-quote').textContent = res.quote;
  document.getElementById('res-tip').textContent = res.tip;

  // 渲染關鍵字標籤
  const keywordsContainer = document.getElementById('res-keywords-container');
  if (keywordsContainer && res.keywords) {
    keywordsContainer.innerHTML = res.keywords.map(kw => 
      `<span class="px-3 py-1 rounded-full bg-brand-deep/10 text-brand-deep font-semibold text-xs border border-brand-deep/20">${kw}</span>`
    ).join('');
  }

  // 動態在 Canvas 繪製專屬 9:16 IG 限動卡片（不使用任何靜態圖檔）
  const canvas = document.getElementById('ig-story-canvas');
  if (canvas) {
    renderDynamicIGCard(canvas, res);
    // 確保字型載入就緒後以最優字體再次重繪
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        renderDynamicIGCard(canvas, res);
      });
    }
  }

  // 綁定分享、下載與複製事件
  initShareActions(res);
}

/* ==========================================================================
   2. 純 Canvas 向量動態繪製 1080×1920 (9:16) IG 限動視覺卡片
   ========================================================================== */
function renderDynamicIGCard(canvas, res) {
  const ctx = canvas.getContext('2d');
  const W = 1080;
  const H = 1920;

  ctx.clearRect(0, 0, W, H);

  // 1. 底色：和紙手揉水墨漸層
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, '#0a1128');
  bgGrad.addColorStop(0.3, '#101d42');
  bgGrad.addColorStop(0.7, '#1c2541');
  bgGrad.addColorStop(1, '#0b132b');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // 2. 依測驗結果動態繪製專屬「藍染防染圖騰水墨背景」
  drawProceduralDyePattern(ctx, res.type, W, H);

  // 3. 和紙微纖維紋理顆粒感
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  for (let i = 0; i < 2000; i++) {
    const rx = Math.random() * W;
    const ry = Math.random() * H;
    ctx.fillRect(rx, ry, Math.random() * 2, Math.random() * 2);
  }

  // 4. 外圍雙層精緻邊框
  ctx.strokeStyle = '#c4abfa';
  ctx.lineWidth = 14;
  ctx.strokeRect(40, 40, W - 80, H - 80);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 2;
  ctx.strokeRect(55, 55, W - 110, H - 110);

  // 5. 頁首品牌標誌與小染專題標籤
  ctx.textAlign = 'center';

  // 頂部小標
  ctx.fillStyle = '#abc8fa';
  ctx.font = 'bold 30px "Noto Sans TC", sans-serif';
  ctx.fillText('🌿 三峽藍染 400 年 ✕ 虛擬代言人小染', W / 2, 130);

  // 主標題
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 56px "DM Sans", "Noto Sans TC", "Microsoft JhengHei", sans-serif';
  ctx.fillText('🌸 我的命定藍染花紋測驗結果', W / 2, 210);

  // 6. 中央半透明毛玻璃卡片容器
  const cardX = 90;
  const cardY = 270;
  const cardW = 900;
  const cardH = 1360;

  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.shadowColor = 'rgba(81, 112, 255, 0.35)';
  ctx.shadowBlur = 45;
  ctx.roundRect(cardX, cardY, cardW, cardH, 40);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = '#c4abfa';
  ctx.lineWidth = 4;
  ctx.stroke();

  // 7. 卡片內圖騰徽章與大字
  ctx.fillStyle = '#5170ff';
  ctx.font = 'bold 36px "DM Sans", "Noto Sans TC", "Microsoft JhengHei", sans-serif';
  ctx.fillText(`【 我是 ${res.badge} 】`, W / 2, 360);

  ctx.fillStyle = '#1e1b4b';
  ctx.font = '900 52px "DM Sans", "Noto Sans TC", "Microsoft JhengHei", sans-serif';
  ctx.fillText(res.patternName, W / 2, 435);

  // 8. 專屬動態圖騰幾何圓章 (在中央繪製專屬紋樣核心視覺)
  const sealY = 670;
  ctx.save();
  ctx.beginPath();
  ctx.arc(W / 2, sealY, 190, 0, Math.PI * 2);
  ctx.clip();
  
  // 圓章底色
  const sealGrad = ctx.createRadialGradient(W / 2, sealY, 10, W / 2, sealY, 190);
  sealGrad.addColorStop(0, '#5170ff');
  sealGrad.addColorStop(0.5, '#1e3a8a');
  sealGrad.addColorStop(1, '#0f172a');
  ctx.fillStyle = sealGrad;
  ctx.fillRect(W / 2 - 190, sealY - 190, 380, 380);

  // 依題型在圓章內繪製專屬紋樣細節
  drawSealPatternDetail(ctx, res.type, W / 2, sealY);
  ctx.restore();

  // 圓章外框線
  ctx.strokeStyle = '#c4abfa';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(W / 2, sealY, 195, 0, Math.PI * 2);
  ctx.stroke();

  // 9. 關鍵字標籤 (Hashtags)
  ctx.fillStyle = '#5170ff';
  ctx.font = 'bold 32px "Noto Sans TC", sans-serif';
  ctx.fillText(res.keywords.join('    '), W / 2, 920);

  // 10. 屬性標記 (本命植物 ✕ 幸運色)
  ctx.fillStyle = '#3730a3';
  ctx.font = '600 32px "Noto Sans TC", sans-serif';
  ctx.fillText(`🌿 本命植物：${res.plant}    |    🎨 幸運色：${res.colorName}`, W / 2, 990);

  // 11. 心靈寄語與小染悄悄話 (重點醒目區塊)
  ctx.fillStyle = '#9564ff';
  ctx.font = 'italic bold 36px "DM Sans", "Noto Sans TC", "Microsoft JhengHei", sans-serif';
  ctx.fillText(res.quote, W / 2, 1070);

  // 12. 性格特質詳解文字 (自動換行)
  ctx.fillStyle = '#334155';
  ctx.font = '400 28px "DM Sans", "Noto Sans TC", "Microsoft JhengHei", sans-serif';
  wrapText(ctx, res.personality, W / 2, 1140, 780, 44);

  // 13. 小染叮嚀小氣泡
  ctx.save();
  ctx.fillStyle = 'rgba(149, 100, 255, 0.12)';
  ctx.roundRect(140, 1420, 800, 160, 24);
  ctx.fill();
  ctx.strokeStyle = '#c4abfa';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = '#5170ff';
  ctx.font = 'bold 28px "DM Sans", "Noto Sans TC", "Microsoft JhengHei", sans-serif';
  ctx.fillText('✨ 小染悄悄話：', W / 2, 1465);

  ctx.fillStyle = '#1e1b4b';
  ctx.font = '500 25px "DM Sans", "Noto Sans TC", "Microsoft JhengHei", sans-serif';
  wrapText(ctx, res.tip, W / 2, 1515, 740, 36);

  // 14. 底部引流與驗證資訊
  ctx.fillStyle = '#abc8fa';
  ctx.font = 'bold 26px "DM Sans", "Noto Sans TC", "Microsoft JhengHei", sans-serif';
  ctx.fillText('#三峽藍染  #花紋心理學  #小染的湛藍魔法  #綠色工藝  #SDGs11_4', W / 2, 1720);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px "DM Sans", "Noto Sans TC", "Microsoft JhengHei", sans-serif';
  ctx.fillText('一抹藍，染出新潮流 ── 立即搜尋體驗', W / 2, 1780);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '400 22px "Noto Sans TC", sans-serif';
  const todayStr = new Date().toLocaleDateString('zh-TW');
  ctx.fillText(`新北市三峽染工坊 ✕ 全國專題競賽商業與管理群 ｜ 測驗證號 #AIZOME-${Date.now().toString().slice(-6)} ｜ ${todayStr}`, W / 2, 1835);
}

// 繪製背景防染水墨
function drawProceduralDyePattern(ctx, type, W, H) {
  ctx.save();
  if (type === 'A') {
    // 扎染：多重水波同心圓與放射狀防染線
    ctx.strokeStyle = 'rgba(171, 200, 250, 0.15)';
    ctx.lineWidth = 18;
    for (let r = 100; r < 1400; r += 90) {
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 6;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
      ctx.beginPath();
      ctx.moveTo(W / 2, H / 2);
      ctx.lineTo(W / 2 + Math.cos(a) * 1200, H / 2 + Math.sin(a) * 1200);
      ctx.stroke();
    }
  } else if (type === 'B') {
    // 夾染：嚴謹對稱菱形摺紙幾何
    ctx.strokeStyle = 'rgba(196, 171, 250, 0.14)';
    ctx.lineWidth = 8;
    const step = 120;
    for (let x = -W; x < W * 2; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + H, H);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x, H);
      ctx.lineTo(x + H, 0);
      ctx.stroke();
    }
  } else if (type === 'C') {
    // 縫染：細緻針線點線與蔓藤花枝
    ctx.strokeStyle = 'rgba(171, 200, 250, 0.2)';
    ctx.lineWidth = 6;
    ctx.setLineDash([16, 14]);
    for (let y = 150; y < H; y += 220) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(W * 0.3, y - 80, W * 0.7, y + 80, W, y);
      ctx.stroke();
    }
    ctx.setLineDash([]);
  } else {
    // 段染：流動水墨層次橫向波紋
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = `rgba(81, 112, 255, ${0.05 + i * 0.02})`;
      ctx.beginPath();
      const y = (H / 8) * i;
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(W * 0.4, y + 100, W * 0.6, y - 50, W, y + 60);
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.closePath();
      ctx.fill();
    }
  }
  ctx.restore();
}

// 繪製圓章內圖騰細節
function drawSealPatternDetail(ctx, type, cx, cy) {
  ctx.save();
  if (type === 'A') {
    // 扎染水波同心圓
    ctx.strokeStyle = '#ffffff';
    for (let r = 20; r < 180; r += 26) {
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (type === 'B') {
    // 夾染幾何對稱
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 8;
    for (let s = 30; s < 240; s += 40) {
      ctx.strokeRect(cx - s / 2, cy - s / 2, s, s);
    }
    ctx.translate(cx, cy);
    ctx.rotate(Math.PI / 4);
    for (let s = 30; s < 240; s += 40) {
      ctx.strokeRect(-s / 2, -s / 2, s, s);
    }
  } else if (type === 'C') {
    // 縫染花朵針線
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.setLineDash([8, 8]);
    for (let i = 0; i < 8; i++) {
      const ang = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.ellipse(cx + Math.cos(ang) * 70, cy + Math.sin(ang) * 70, 45, 20, ang, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(cx, cy, 25, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    // 段染多層水墨漸變
    const grad = ctx.createLinearGradient(cx, cy - 180, cx, cy + 180);
    grad.addColorStop(0, '#abc8fa');
    grad.addColorStop(0.3, '#38bdf8');
    grad.addColorStop(0.6, '#1d4ed8');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(cx - 190, cy - 190, 380, 380);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 6;
    for (let dy = -120; dy <= 120; dy += 40) {
      ctx.beginPath();
      ctx.moveTo(cx - 160, cy + dy);
      ctx.lineTo(cx + 160, cy + dy);
      ctx.stroke();
    }
  }
  ctx.restore();
}

// 輔助換行
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  let line = '';
  for (let n = 0; n < text.length; n++) {
    const testLine = line + text[n];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = text[n];
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

/* ==========================================================================
   3. 下載、複製卡片圖片與 Web Share API 互動
   ========================================================================== */
function initShareActions(res) {
  const downloadBtn = document.getElementById('btn-download-ig-card');
  const copyImgBtn = document.getElementById('btn-copy-card-img');
  const webShareBtn = document.getElementById('btn-web-share');
  const copyLinkBtn = document.getElementById('btn-copy-link');
  const retakeBtn = document.getElementById('btn-retake-quiz');
  const canvas = document.getElementById('ig-story-canvas');

  // 下載卡片 (PNG)
  if (downloadBtn && canvas) {
    downloadBtn.onclick = () => {
      if (window.playIndigoChime) window.playIndigoChime(880);
      const link = document.createElement('a');
      link.download = `三峽藍染_命定花紋_${res.badge}_IG限動卡.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
  }

  // 複製卡片圖片至剪貼簿 (Direct Image Copy to Clipboard)
  if (copyImgBtn && canvas) {
    copyImgBtn.onclick = async () => {
      if (window.playIndigoChime) window.playIndigoChime(783.99);
      try {
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          if (navigator.clipboard && window.ClipboardItem) {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            alert("✨ 已成功複製 IG 9:16 限動卡片圖片！您可直接在 IG 限動、LINE 聊天室或剪貼簿中貼上分享！");
          } else {
            alert("您的瀏覽器暫未開放圖片剪貼簿寫入，已為您自動下載卡片！");
            downloadBtn.click();
          }
        }, 'image/png');
      } catch (err) {
        alert("複製卡片失敗，為您自動下載高畫質 PNG！");
        downloadBtn.click();
      }
    };
  }

  // Web Share API 一鍵分享
  if (webShareBtn && canvas) {
    webShareBtn.onclick = async () => {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `三峽藍染_${res.badge}.png`, { type: 'image/png' });
        const shareData = {
          title: `我的三峽藍染本命花紋：【${res.badge}】`,
          text: `我剛測出我的藍染本命花紋是「${res.patternName}」！${res.quote} 快來測測看你的吧！`,
          url: window.location.href,
          files: [file]
        };

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share(shareData);
          } catch (e) {}
        } else if (navigator.share) {
          try {
            await navigator.share({
              title: shareData.title,
              text: shareData.text,
              url: window.location.href
            });
          } catch (e) {}
        } else {
          alert("已為您複製測驗連結，可直接貼上分享！");
          navigator.clipboard.writeText(window.location.href);
        }
      }, 'image/png');
    };
  }

  // 複製測驗連結
  if (copyLinkBtn) {
    copyLinkBtn.onclick = () => {
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert("已成功複製測驗連結！快傳給朋友測測看吧！✨");
      });
    };
  }

  // 重新測驗
  if (retakeBtn) {
    retakeBtn.onclick = () => {
      document.getElementById('quiz-result-section').classList.add('hidden');
      document.getElementById('quiz-intro-section').classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
  }
}
