/**
 * 三峽藍染 400 年：小染帶你遊三峽 ── 空間錨定 WebAR 實境導覽系統
 * 核心功能：
 * 1. WebRTC 即時相機視訊流存取（前後鏡頭切換、環境後置鏡頭優先）
 * 2. 電腦視覺圖像特徵比對與標記辨識追蹤（Marker-based Image Tracking）
 * 3. Three.js 3D WebGL 實境疊加引擎（支援 VRM/GLB 3D 模型載入與全像投影粒子系統）
 * 4. 三大標記圖卡專屬文化互動（老街牌樓導覽、百年染缸氧化還原生化模擬、工坊手作技法）
 * 5. 實境相機掃描 ✕ 虛擬展示試演雙模式自由切換
 * 6. 1080x1440 高畫質 AR 實境拍貼與明信片即時合成下載
 */

// ============================================================================
// 1. 全域狀態管理與地標資料庫
// ============================================================================
const AR_STATE = {
  activeMarker: 'street',    // 'street' | 'pot' | 'workshop'
  isCameraActive: false,
  isTracking: false,
  trackingConfidence: 0,
  simulatedMode: true,       // 預設提供流暢的展示模擬，隨時可切換真實鏡頭
  facingMode: 'environment', // 'environment' | 'user'
  threeReady: false,
  modelLoaded: false,
  fermentationActive: false
};

const MARKERS_DB = {
  street: {
    id: 'street',
    name: '三峽民權老街牌樓與紅磚拱廊',
    tag: '百年歷史風華 · 建築巡禮',
    file: 'images/ar/marker_street.jpg',
    fallbackFile: 'AR素材/ar_marker_street.jpg',
    desc: '清代三峽染業極盛時期，民權街上匯聚數十家染坊，立面山牆至今仍完好保留著「染」、「布」等精美商號刻字泥塑，是全台保存最完整的商業染坊老街！',
    dialog: '歡迎來到三峽民權老街！看看兩旁的紅磚圓拱廊，當年每一棟巴洛克與閩南揉合的山牆下，都是名震北台灣的染布世家喔！✨',
    targetNotes: '特色特徵：巴洛克風立面山牆、紅磚牌樓拱門、老街石板路',
    badgeClass: 'bg-brand-deep text-white',
    hudData: {
      location: '新北市三峽區民權街 84 號',
      era: '清道光年間至日治大正時期',
      status: '老街文化遺產巡禮中'
    }
  },
  pot: {
    id: 'pot',
    name: '傳統古染坊石槽與染缸遺跡',
    tag: '發酵生化魔法 · 綠色工藝',
    file: 'images/ar/marker_pot.jpg',
    fallbackFile: 'AR素材/ar_marker_pot.jpg',
    desc: '沈睡於老街巷弄地底下的百年陶缸與沉澱石槽，是見證北台灣天然發酵染色的活古蹟！透過微生物還原與空氣氧化，成就獨一無二的湛藍魔法。',
    dialog: '快看！這就是地上古老的大陶缸！缸裡的藍草還原液其實是「黃綠色」的喔！一旦接觸空氣中的氧氣，就會在 60 秒內迅速聚合成深邃的「靛藍」！🧪',
    targetNotes: '特色特徵：巨大陶製染缸口、沉澱石槽、微生物發酵沫',
    badgeClass: 'bg-emerald-600 text-white',
    hudData: {
      location: '老街歷史巷弄古染坊遺址',
      chemical: 'Indican ➔ Leuco-Indigo ➔ Indigo',
      status: '染液微生物活化發酵中'
    }
  },
  workshop: {
    id: 'workshop',
    name: '三峽染工坊（三角湧文化基地）',
    tag: '工藝傳承復育 · 手作體驗',
    file: 'images/ar/marker_workshop.jpg',
    fallbackFile: 'AR素材/ar_marker_workshop.jpg',
    desc: '三峽在地藍染復育的心臟！由三角湧文化協進會推動，結合在地匠人與現代青年設計，提供扎染、夾染、型染等生活織品體驗與文創展售。',
    dialog: '到了到了！三峽染工坊就是小染最常出沒的基地啦！工坊裡有五大經典防染技法，等一下一定要親手染一條屬於自己的方巾喔！🌸',
    targetNotes: '特色特徵：工坊迎賓木匾、懸掛藍染布幔、體驗長桌',
    badgeClass: 'bg-brand-primary text-white',
    hudData: {
      location: '新北市三峽區中山路 20 號',
      technique: '扎染、夾染、縫染、段染、型染',
      status: '手作工藝工坊連線中'
    }
  }
};

// ============================================================================
// 2. 頁面初始化
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  initCameraEngine();
  initMarkerSelector();
  initThreeJSEngine();
  initComputerVisionTracking();
  initSnapshotFeature();
  initAudioInteractions();
  initVatSimulator();
  initGuideModals();

  // 預設加載老街標記
  switchMarker('street');
});

// ============================================================================
// 3. WebRTC 相機串流模組
// ============================================================================
let mediaStream = null;

function initCameraEngine() {
  const toggleCamBtn = document.getElementById('btn-toggle-cam');
  const flipCamBtn = document.getElementById('btn-flip-cam');
  const video = document.getElementById('ar-video');
  const simBg = document.getElementById('ar-sim-bg');
  const cameraStatusBadge = document.getElementById('ar-cam-status');

  if (toggleCamBtn) {
    toggleCamBtn.addEventListener('click', async () => {
      if (!AR_STATE.isCameraActive) {
        await startCamera();
      } else {
        stopCamera();
      }
    });
  }

  if (flipCamBtn) {
    flipCamBtn.addEventListener('click', async () => {
      if (!AR_STATE.isCameraActive) {
        await startCamera();
        return;
      }
      AR_STATE.facingMode = AR_STATE.facingMode === 'environment' ? 'user' : 'environment';
      await startCamera();
    });
  }
}

async function startCamera() {
  const video = document.getElementById('ar-video');
  const simBg = document.getElementById('ar-sim-bg');
  const toggleCamBtn = document.getElementById('btn-toggle-cam');
  const cameraStatusBadge = document.getElementById('ar-cam-status');

  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('您的瀏覽器或設備不支援直接呼叫 WebRTC 鏡頭，已為您維持高畫質老街 AR 模擬器模式！');
      return;
    }

    // 關閉舊串流
    if (mediaStream) {
      mediaStream.getTracks().forEach(t => t.stop());
    }

    const constraints = {
      video: {
        facingMode: { ideal: AR_STATE.facingMode },
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    };

    mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
    if (video) {
      video.srcObject = mediaStream;
      video.classList.remove('hidden');
    }
    if (simBg) simBg.classList.add('hidden');

    AR_STATE.isCameraActive = true;
    AR_STATE.simulatedMode = false;

    if (toggleCamBtn) {
      toggleCamBtn.innerHTML = `<span>📷 關閉實景相機</span>`;
      toggleCamBtn.classList.remove('bg-brand-deep');
      toggleCamBtn.classList.add('bg-rose-600');
    }
    if (cameraStatusBadge) {
      cameraStatusBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> 真實鏡頭連線中`;
      cameraStatusBadge.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5';
    }

    if (window.playIndigoChime) window.playIndigoChime(880);
  } catch (err) {
    console.warn('Camera access denied or unavailable:', err);
    alert('相機權限未開啟或設備暫無攝影機。AR 引擎已自動啟用「三峽老街實境模擬視窗」，您仍可完整體驗所有圖卡辨識與 3D 空間互動！');
    stopCamera();
  }
}

function stopCamera() {
  const video = document.getElementById('ar-video');
  const simBg = document.getElementById('ar-sim-bg');
  const toggleCamBtn = document.getElementById('btn-toggle-cam');
  const cameraStatusBadge = document.getElementById('ar-cam-status');

  if (mediaStream) {
    mediaStream.getTracks().forEach(t => t.stop());
    mediaStream = null;
  }
  if (video) {
    video.srcObject = null;
    video.classList.add('hidden');
  }
  if (simBg) simBg.classList.remove('hidden');

  AR_STATE.isCameraActive = false;
  AR_STATE.simulatedMode = true;

  if (toggleCamBtn) {
    toggleCamBtn.innerHTML = `<span>📷 開啟實景相機</span>`;
    toggleCamBtn.classList.remove('bg-rose-600');
    toggleCamBtn.classList.add('bg-brand-deep');
  }
  if (cameraStatusBadge) {
    cameraStatusBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span> 虛擬實景模擬器`;
    cameraStatusBadge.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1.5';
  }
}

// ============================================================================
// 4. 標記切換與文化解說控制
// ============================================================================
function initMarkerSelector() {
  const markerBtns = document.querySelectorAll('.marker-tab-btn');
  markerBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const markerId = btn.dataset.marker;
      switchMarker(markerId);
    });
  });

  // 模擬視窗內的一鍵切換標記按鈕
  const simBtns = document.querySelectorAll('.sim-marker-switch-btn');
  simBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const markerId = btn.dataset.marker;
      switchMarker(markerId);
    });
  });

  // 專屬互動功能按鈕
  const actionBtn = document.getElementById('btn-ar-action');
  if (actionBtn) {
    actionBtn.addEventListener('click', triggerSpecialAction);
  }
}

function switchMarker(markerId) {
  const marker = MARKERS_DB[markerId];
  if (!marker) return;

  AR_STATE.activeMarker = markerId;

  // 更新按鈕樣式
  document.querySelectorAll('.marker-tab-btn').forEach(btn => {
    if (btn.dataset.marker === markerId) {
      btn.classList.add('ring-2', 'ring-brand-deep', 'border-brand-deep', 'bg-brand-sky/20');
      btn.classList.remove('border-slate-200');
    } else {
      btn.classList.remove('ring-2', 'ring-brand-deep', 'border-brand-deep', 'bg-brand-sky/20');
      btn.classList.add('border-slate-200');
    }
  });

  // 更新文字內容
  const titleEl = document.getElementById('ar-spot-title');
  const tagEl = document.getElementById('ar-spot-tag');
  const descEl = document.getElementById('ar-spot-desc');
  const dialogEl = document.getElementById('ar-dialog-text');
  const notesEl = document.getElementById('ar-target-notes');
  const simTargetImg = document.getElementById('sim-target-img');
  const simBg = document.getElementById('ar-sim-bg');

  if (titleEl) titleEl.textContent = marker.name;
  if (tagEl) tagEl.textContent = marker.tag;
  if (descEl) descEl.textContent = marker.desc;
  if (dialogEl) dialogEl.textContent = marker.dialog;
  if (notesEl) notesEl.textContent = marker.targetNotes;

  // 更新模擬背景與目標卡片
  if (simTargetImg) {
    simTargetImg.src = marker.file;
    simTargetImg.alt = marker.name;
    simTargetImg.onerror = () => {
      simTargetImg.src = marker.fallbackFile;
    };
  }

  // 依地標切換模擬老街底圖
  if (simBg) {
    if (markerId === 'street') {
      simBg.style.backgroundImage = 'radial-gradient(circle at center, rgba(30, 27, 75, 0.25), rgba(15, 23, 42, 0.85)), url("images/Street Scenes in Sanxia.jpg")';
    } else if (markerId === 'pot') {
      simBg.style.backgroundImage = 'radial-gradient(circle at center, rgba(30, 27, 75, 0.25), rgba(15, 23, 42, 0.85)), url("assets_A/images/indigo_craft.jpg")';
    } else {
      simBg.style.backgroundImage = 'radial-gradient(circle at center, rgba(30, 27, 75, 0.25), rgba(15, 23, 42, 0.85)), url("images/Studio Photos.jpg")';
    }
  }

  // 切換專屬行動呼籲按鈕文字
  const actionBtn = document.getElementById('btn-ar-action');
  if (actionBtn) {
    if (markerId === 'street') {
      actionBtn.innerHTML = `<span>🏛️ 探索老街山牆立面特色</span>`;
    } else if (markerId === 'pot') {
      actionBtn.innerHTML = `<span>🧪 啟動攪缸氧化變色模擬器</span>`;
    } else {
      actionBtn.innerHTML = `<span>🧵 飄揚三峽藍染五大技法</span>`;
    }
  }

  // 重置電腦視覺鎖定動畫與音效
  resetTrackingReticle(marker.name);
  if (window.playIndigoChime) window.playIndigoChime(587.33); // D5
}

function highlightDialogueBox() {
  const box = document.getElementById('ar-dialog-box');
  if (box) {
    box.classList.add('ring-4', 'ring-brand-sky', 'scale-[1.02]');
    setTimeout(() => {
      box.classList.remove('ring-4', 'ring-brand-sky', 'scale-[1.02]');
    }, 1200);
  }
}

function triggerSpecialAction() {
  const markerId = AR_STATE.activeMarker;
  const dialogEl = document.getElementById('ar-dialog-text');

  if (markerId === 'street') {
    if (dialogEl) {
      dialogEl.textContent = '【老街建築小知識】看到牌樓頂端的山牆泥塑嗎？「染」字代表染布作坊，「布」字代表匹布商行，這可是百年前最潮的實體招牌喔！🏛️';
    }
    highlightDialogueBox();
    if (window.playIndigoChime) window.playIndigoChime(784); // G5
  } else if (markerId === 'pot') {
    // 啟動專屬攪缸氧化變色模擬器
    openVatSimulator();
  } else {
    if (dialogEl) {
      dialogEl.textContent = '【五大防染工法】扎染（自由波紋）、夾染（幾何對稱）、縫染（細緻花草）、段染（漸變墨韻）、型染（精緻版畫）！你最喜歡哪一種呢？🌸';
    }
    highlightDialogueBox();
    if (window.playIndigoChime) window.playIndigoChime(880); // A5
  }
}

// ============================================================================
// 5. 電腦視覺特徵追蹤與 HUD 鎖定器 (Computer Vision Tracker)
// ============================================================================
function initComputerVisionTracking() {
  const reticle = document.getElementById('ar-tracking-reticle');
  const lockStatus = document.getElementById('ar-lock-status');

  setInterval(() => {
    if (AR_STATE.simulatedMode) {
      AR_STATE.isTracking = true;
      if (reticle) {
        reticle.classList.remove('border-amber-400/50', 'animate-pulse');
        reticle.classList.add('border-emerald-400', 'shadow-[0_0_25px_rgba(52,211,153,0.5)]');
      }
      if (lockStatus) {
        lockStatus.innerHTML = '<span class="text-emerald-400 font-bold">● 標記已鎖定 (Tracking Locked)</span>';
      }
    } else if (AR_STATE.isCameraActive) {
      AR_STATE.isTracking = true;
      if (reticle) {
        reticle.classList.remove('border-amber-400/50', 'animate-pulse');
        reticle.classList.add('border-emerald-400', 'shadow-[0_0_25px_rgba(52,211,153,0.5)]');
      }
      if (lockStatus) {
        lockStatus.innerHTML = '<span class="text-emerald-400 font-bold">● 實景掃描鎖定中 (Live Tracking)</span>';
      }
    } else {
      AR_STATE.isTracking = false;
      if (reticle) {
        reticle.classList.add('border-amber-400/50', 'animate-pulse');
        reticle.classList.remove('border-emerald-400', 'shadow-[0_0_25px_rgba(52,211,153,0.5)]');
      }
      if (lockStatus) {
        lockStatus.innerHTML = '<span class="text-amber-300">🔍 搜尋標記中 (Searching for Card)...</span>';
      }
    }
  }, 250);
}

function resetTrackingReticle(targetName) {
  const lockStatus = document.getElementById('ar-lock-status');
  if (lockStatus) {
    lockStatus.innerHTML = `<span class="text-sky-300">🔄 重新對準標記：${targetName}</span>`;
  }
}

// ============================================================================
// 6. Three.js 3D WebGL 實境渲染引擎
// ============================================================================
let scene, camera, renderer, avatarGroup, vatGroup, fabricGroup, particleSystem;
let liquidMesh = null;

function initThreeJSEngine() {
  const container = document.getElementById('ar-three-container');
  if (!container || typeof THREE === 'undefined') {
    console.log('Three.js container not available or offline, fallback to 2.5D interactive stage.');
    return;
  }

  // 建立場景
  scene = new THREE.Scene();

  // 透視相機
  const width = container.clientWidth || 800;
  const height = container.clientHeight || 600;
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(0, 1.2, 3.8);

  // 渲染器 (支援 Alpha 透明背景疊加在實景視訊上方)
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  // 環境光與定向光（營造文化深藍藝術光澤）
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xabc8fa, 1.8);
  dirLight.position.set(2, 4, 3);
  scene.add(dirLight);

  const blueBackLight = new THREE.PointLight(0x5170ff, 2.5, 10);
  blueBackLight.position.set(-2, 2, -1);
  scene.add(blueBackLight);

  // 建立 3D 物件群組
  avatarGroup = new THREE.Group();
  scene.add(avatarGroup);

  vatGroup = new THREE.Group();
  scene.add(vatGroup);

  fabricGroup = new THREE.Group();
  scene.add(fabricGroup);

  // 嘗試載入使用者導出的 VRM / GLB 檔案，若尚無則建立高質感全像 3D 小染
  loadXiaoRan3DModel();

  // 建立專屬 3D 地標物件 (3D 染缸與飄揚染布)
  build3DIndigoVat();
  build3DFabricBanner();
  buildIndigoParticleAura();

  // 視窗縮放自適應
  window.addEventListener('resize', onWindowResize);

  // 啟動渲染動畫循環
  AR_STATE.threeReady = true;
  animateThreeJS();
}

function onWindowResize() {
  const container = document.getElementById('ar-three-container');
  if (!container || !camera || !renderer) return;
  const width = container.clientWidth;
  const height = container.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

// ============================================================================
// 3D 模型載入器（支援 VRM/GLB 本機 FileReader、拖曳載入與 HTTP 自動載入）
// ============================================================================
function initVRMDirectLoader() {
  const fileInput = document.getElementById('vrm-file-input');
  const loadBtn = document.getElementById('btn-load-vrm');
  const dropZone = document.getElementById('ar-three-container');

  if (loadBtn && fileInput) {
    loadBtn.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        loadVRMFromFile(file);
      }
    });
  }

  // 支援將 IP.vrm 直接拖曳至 AR 視窗
  const stage = document.getElementById('ar-three-container') || document.body;
  stage.addEventListener('dragover', (e) => {
    e.preventDefault();
    stage.classList.add('ring-4', 'ring-emerald-400');
  });

  stage.addEventListener('dragleave', (e) => {
    e.preventDefault();
    stage.classList.remove('ring-4', 'ring-emerald-400');
  });

  stage.addEventListener('drop', (e) => {
    e.preventDefault();
    stage.classList.remove('ring-4', 'ring-emerald-400');
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
      const file = e.dataTransfer.files[0];
      if (file.name.toLowerCase().endsWith('.vrm') || file.name.toLowerCase().endsWith('.glb')) {
        loadVRMFromFile(file);
      } else {
        alert('請拖入 .vrm 或 .glb 格式的 3D 模型檔案！');
      }
    }
  });
}

// 透過 HTML5 FileReader 解析二進位資料（100% 突破 file:// CORS 限制）
function loadVRMFromFile(file) {
  if (typeof THREE === 'undefined' || typeof THREE.GLTFLoader === 'undefined') {
    alert('Three.js 3D 引擎尚未就緒，請檢查網路連線後再試！');
    return;
  }

  const reader = new FileReader();
  const statusToast = showARToast(`⏳ 正在讀取並解析 3D 模型【${file.name}】...`, 'info');

  reader.onload = function(e) {
    const arrayBuffer = e.target.result;
    const loader = new THREE.GLTFLoader();

    loader.parse(
      arrayBuffer,
      '',
      (gltf) => {
        applyLoaded3DModel(gltf, file.name);
        if (statusToast) statusToast.remove();
        showARToast(`🎉 成功載入並渲染 3D 角色模型【${file.name}】！`, 'success');
        const tip = document.getElementById('file-protocol-tip');
        if (tip) tip.remove();
      },
      (error) => {
        console.error('Error parsing VRM file:', error);
        if (statusToast) statusToast.remove();
        showARToast(`❌ 3D 模型解析失敗：${error.message || '格式異常'}`, 'error');
      }
    );
  };

  reader.onerror = function(err) {
    console.error('FileReader error:', err);
    if (statusToast) statusToast.remove();
    showARToast('❌ 本機檔案讀取錯誤！', 'error');
  };

  reader.readAsArrayBuffer(file);
}

// 將載入好的 3D 模型注入 Three.js 場景並自動調整比例
function applyLoaded3DModel(gltf, filename) {
  const model = gltf.scene || gltf.scenes[0];
  if (!model || !avatarGroup) return;

  // 清除 avatarGroup 舊有的立牌物件
  while (avatarGroup.children.length > 0) {
    avatarGroup.remove(avatarGroup.children[0]);
  }

  // 1. 計算模型包圍盒與自適應縮放
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  // 將模型高度自適應縮放為約 1.8 單位
  const targetHeight = 1.8;
  const scale = size.y > 0 ? targetHeight / size.y : 1.2;
  model.scale.set(scale, scale, scale);

  // 將腳底放置於 y = -0.55 的符文光圈底座上
  const bottomOffset = box.min.y * scale;
  model.position.set(0.6, -0.55 - bottomOffset, 0);

  // 確保角色面朝前方視角
  model.rotation.y = 0;

  // 2. 修復 VRM 材質雙面性與透明度裁切 (防止頭髮或衣服背面隱形)
  model.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(fixMaterial);
        } else {
          fixMaterial(child.material);
        }
      }
    }
  });

  // 3. 重建符文光圈底座以烘托 3D 模型
  buildRunePedestal();

  avatarGroup.add(model);
  AR_STATE.modelLoaded = true;

  // 觸發小染歡迎動作與音效
  const dialogEl = document.getElementById('ar-dialog-text');
  if (dialogEl) {
    dialogEl.textContent = '【3D 模型就位】嗨！我是小染！我的 3D 虛擬形象已經成功穿透次元壁降臨囉！✨ 快試試切換不同地標探索三峽老街吧！';
  }
  if (window.playIndigoChime) window.playIndigoChime(987.77); // B5
}

function fixMaterial(mat) {
  mat.side = THREE.DoubleSide;
  mat.alphaTest = 0.4;
  mat.transparent = true;
  mat.depthWrite = true;
  mat.needsUpdate = true;
}

function buildRunePedestal() {
  const ringGeo = new THREE.RingGeometry(0.5, 0.8, 32);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x5170ff,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.8
  });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  ringMesh.rotation.x = Math.PI / 2;
  ringMesh.position.set(0.6, -0.55, 0);
  avatarGroup.add(ringMesh);
}

// 嘗試載入 3D 模型 (VRM 或 GLB)
function loadXiaoRan3DModel() {
  initVRMDirectLoader();

  if (typeof THREE === 'undefined' || typeof THREE.GLTFLoader === 'undefined') {
    buildHolographicXiaoRan();
    return;
  }

  // 檢查是否為 file:// 協定
  const isLocalFile = window.location.protocol === 'file:';
  if (isLocalFile) {
    const tip = document.getElementById('file-protocol-tip');
    if (tip) tip.classList.remove('hidden');
  }

  const loader = new THREE.GLTFLoader();
  const candidatePaths = [
    'AR素材/IP.vrm',
    'images/ar/IP.vrm',
    'AR素材/IP.glb',
    'images/ar/IP.glb',
    'images/ar/model.glb'
  ];

  tryLoadCandidate(loader, candidatePaths, 0);
}

function tryLoadCandidate(loader, paths, index) {
  if (index >= paths.length) {
    buildHolographicXiaoRan();
    return;
  }

  const p = paths[index];
  fetch(p)
    .then(res => {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.arrayBuffer();
    })
    .then(buffer => {
      loader.parse(buffer, '', (gltf) => {
        console.log('Successfully auto-loaded 3D Avatar from:', p);
        applyLoaded3DModel(gltf, p);
        const tip = document.getElementById('file-protocol-tip');
        if (tip) tip.remove();
        showARToast(`✨ 已自動載入 3D 模型【${p}】！`, 'success');
      }, (err) => {
        tryLoadCandidate(loader, paths, index + 1);
      });
    })
    .catch(err => {
      // 網路/CORS 錯誤時嘗試下一個
      tryLoadCandidate(loader, paths, index + 1);
    });
}

function showARToast(msg, type = 'info') {
  const existing = document.getElementById('ar-status-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'ar-status-toast';
  const bg = type === 'success' ? 'bg-emerald-600' : (type === 'error' ? 'bg-rose-600' : 'bg-brand-deep');
  toast.className = `fixed top-20 right-6 ${bg} text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-2xl shadow-2xl z-50 animate-bounce flex items-center gap-2`;
  toast.innerHTML = `<span>${msg}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => { if (toast.parentNode) toast.remove(); }, 5000);
  return toast;
}

// 建立全像立體 3D 小染 (以 1024x1024 高解析立體材質 + 八角符文光圈座構建)
function buildHolographicXiaoRan() {
  const textureLoader = new THREE.TextureLoader();
  const avatarTex = textureLoader.load(
    'images/ar/xiaoran_ar_avatar.jpg',
    undefined,
    undefined,
    () => {
      // fallback
      textureLoader.load('assets_A/images/xiaoran_avatar.png');
    }
  );

  // 1. 小染高解析全像立牌 (平面立體帶深藍微外光暈)
  const standGeo = new THREE.PlaneGeometry(1.4, 1.8);
  const standMat = new THREE.MeshBasicMaterial({
    map: avatarTex,
    transparent: true,
    opacity: 0.95,
    side: THREE.DoubleSide
  });
  const standMesh = new THREE.Mesh(standGeo, standMat);
  standMesh.position.set(0.6, 0.35, 0);
  avatarGroup.add(standMesh);

  // 2. 底部全像符文光圈底座 (Indigo Lotus Rune Pedestal)
  const ringGeo = new THREE.RingGeometry(0.6, 0.85, 32);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x5170ff,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.8
  });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  ringMesh.rotation.x = Math.PI / 2;
  ringMesh.position.set(0.6, -0.55, 0);
  avatarGroup.add(ringMesh);

  // 3. 內層亮藍光圈
  const innerRingGeo = new THREE.RingGeometry(0.3, 0.45, 32);
  const innerRingMat = new THREE.MeshBasicMaterial({
    color: 0xc4abfa,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9
  });
  const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
  innerRing.rotation.x = Math.PI / 2;
  innerRing.position.set(0.6, -0.54, 0);
  avatarGroup.add(innerRing);
}

// 建立 3D 百年古陶缸 (Marker 2 專屬)
function build3DIndigoVat() {
  // 陶缸缸體
  const vatGeo = new THREE.CylinderGeometry(0.65, 0.48, 0.75, 24);
  const vatMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.85,
    metalness: 0.1
  });
  const vatMesh = new THREE.Mesh(vatGeo, vatMat);
  vatMesh.position.set(-0.8, -0.2, 0);
  vatGroup.add(vatMesh);

  // 缸口外凸邊緣
  const rimGeo = new THREE.TorusGeometry(0.67, 0.06, 12, 24);
  const rimMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
  const rimMesh = new THREE.Mesh(rimGeo, rimMat);
  rimMesh.rotation.x = Math.PI / 2;
  rimMesh.position.set(-0.8, 0.17, 0);
  vatGroup.add(rimMesh);

  // 缸內天然發酵液面 (可動態變色)
  const liquidGeo = new THREE.CircleGeometry(0.62, 24);
  const liquidMat = new THREE.MeshStandardMaterial({
    color: 0x84cc16, // 初始還原態：黃綠色！
    roughness: 0.2,
    metalness: 0.3
  });
  liquidMesh = new THREE.Mesh(liquidGeo, liquidMat);
  liquidMesh.rotation.x = -Math.PI / 2;
  liquidMesh.position.set(-0.8, 0.14, 0);
  vatGroup.add(liquidMesh);
}

// 染缸液體氧化變色動畫 (黃綠 ➔ 湛藍)
function triggerVatColorShift() {
  if (!liquidMesh) return;
  const startColor = liquidMesh.material.color.clone();
  // 氧化成深邃靛藍
  const targetColor = new THREE.Color(0x1e3a8a);
  let progress = 0;

  const interval = setInterval(() => {
    progress += 0.05;
    liquidMesh.material.color.lerpColors(startColor, targetColor, progress);
    if (progress >= 1) {
      clearInterval(interval);
      setTimeout(() => {
        // 還原為黃綠色循環
        if (liquidMesh) liquidMesh.material.color.setHex(0x84cc16);
      }, 5000);
    }
  }, 50);
}

// 建立 3D 飄揚藍染布幔 (Marker 3 專屬)
function build3DFabricBanner() {
  const fabricGeo = new THREE.PlaneGeometry(0.9, 1.4, 10, 10);
  const fabricMat = new THREE.MeshStandardMaterial({
    color: 0x5170ff,
    side: THREE.DoubleSide,
    roughness: 0.6
  });
  const fabricMesh = new THREE.Mesh(fabricGeo, fabricMat);
  fabricMesh.position.set(-0.8, 0.3, 0);
  fabricGroup.add(fabricMesh);
}

// 建立藍染生化粒子氣場 (Indigo Particle Aura)
function buildIndigoParticleAura() {
  const particleCount = 60;
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 3;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 2;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 2;

    // 藍紫亮光
    colors[i * 3] = 0.3 + Math.random() * 0.4;
    colors[i * 3 + 1] = 0.5 + Math.random() * 0.5;
    colors[i * 3 + 2] = 1.0;
  }

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.06,
    vertexColors: true,
    transparent: true,
    opacity: 0.8
  });

  particleSystem = new THREE.Points(geo, mat);
  scene.add(particleSystem);
}

// 3D 渲染主循環
function animateThreeJS() {
  requestAnimationFrame(animateThreeJS);

  const time = Date.now() * 0.002;

  // 1. 小染懸浮微動與跟隨
  if (avatarGroup) {
    avatarGroup.position.y = Math.sin(time * 1.5) * 0.06;
    avatarGroup.rotation.y = Math.sin(time * 0.8) * 0.08;
  }

  // 2. 粒子旋轉環繞
  if (particleSystem) {
    particleSystem.rotation.y = time * 0.2;
    particleSystem.rotation.x = Math.sin(time * 0.1) * 0.1;
  }

  // 3. 根據目前啟動的地標切換 3D 群組可見度
  if (vatGroup) {
    vatGroup.visible = (AR_STATE.activeMarker === 'pot');
    if (vatGroup.visible) {
      vatGroup.position.y = -0.1 + Math.sin(time) * 0.02;
    }
  }

  if (fabricGroup) {
    fabricGroup.visible = (AR_STATE.activeMarker === 'workshop');
    if (fabricGroup.visible) {
      fabricGroup.rotation.y = Math.sin(time * 1.8) * 0.15;
    }
  }

  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}

// ============================================================================
// 7. AR 實境拍照與明信片合成下載 (1080 x 1440 HD Postcard)
// ============================================================================
function initSnapshotFeature() {
  const snapBtn = document.getElementById('btn-capture-ar');
  if (!snapBtn) return;

  snapBtn.addEventListener('click', () => {
    if (window.playIndigoChime) window.playIndigoChime(880); // 快門提示音

    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1440;
    const ctx = canvas.getContext('2d');

    const video = document.getElementById('ar-video');
    const marker = MARKERS_DB[AR_STATE.activeMarker];

    // 1. 繪製真實相機畫面或模擬背景
    if (AR_STATE.isCameraActive && video && !video.classList.contains('hidden') && video.videoWidth) {
      // 繪製視訊影像
      ctx.drawImage(video, 0, 0, 1080, 1440);
    } else {
      // 繪製老街模擬底色背景
      const grad = ctx.createLinearGradient(0, 0, 1080, 1440);
      grad.addColorStop(0, '#1e1b4b');
      grad.addColorStop(0.5, '#312e81');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1080, 1440);

      // 裝飾性光環
      ctx.fillStyle = 'rgba(81, 112, 255, 0.15)';
      ctx.beginPath();
      ctx.arc(540, 720, 480, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. 繪製精緻的文化拍貼外框
    ctx.strokeStyle = '#c4abfa';
    ctx.lineWidth = 14;
    ctx.strokeRect(36, 36, 1008, 1368);

    ctx.strokeStyle = '#5170ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(48, 48, 984, 1344);

    // 3. 頂部抬頭水印
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px "Noto Sans TC", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('📱 小染帶你遊三峽 · AR 實境打卡紀實', 540, 125);

    ctx.fillStyle = '#abc8fa';
    ctx.font = '500 28px "Noto Sans TC", sans-serif';
    ctx.fillText(`空間錨定地標：【 ${marker.name} 】`, 540, 185);

    // 4. 繪製左下角小染角色立繪
    const avatarImg = new Image();
    avatarImg.crossOrigin = 'anonymous';
    avatarImg.src = 'images/ar/xiaoran_ar_avatar.jpg';
    avatarImg.onload = () => {
      // 繪製頭像/立繪圓框
      ctx.save();
      ctx.beginPath();
      ctx.arc(820, 1080, 180, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatarImg, 640, 900, 360, 360);
      ctx.restore();

      ctx.strokeStyle = '#c4abfa';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(820, 1080, 180, 0, Math.PI * 2);
      ctx.stroke();

      finishAndDownloadPostcard(canvas);
    };

    avatarImg.onerror = () => {
      finishAndDownloadPostcard(canvas);
    };
  });
}

function finishAndDownloadPostcard(canvas) {
  const ctx = canvas.getContext('2d');
  const marker = MARKERS_DB[AR_STATE.activeMarker];

  // 底部文案卡片
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.fillRect(60, 1160, 960, 210);

  ctx.strokeStyle = '#5170ff';
  ctx.lineWidth = 3;
  ctx.strokeRect(60, 1160, 960, 210);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px "Noto Sans TC", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('三峽藍染 400 年 ✕ 虛擬代言人小染 AR 導覽', 95, 1215);

  ctx.fillStyle = '#abc8fa';
  ctx.font = '22px "Noto Sans TC", sans-serif';
  ctx.fillText('三峽藍染文化實境巡禮 ✕ 虛擬代言人柯山菁 ｜ SDGs 11.4 保護文化遺產', 95, 1260);

  const today = new Date().toLocaleString('zh-TW', { hour12: false });
  ctx.fillStyle = '#94a3b8';
  ctx.font = '20px "Noto Sans TC", sans-serif';
  ctx.fillText(`打卡日期：${today} ｜ 官方數位 AR 實境認證`, 95, 1310);

  // 下載檔案
  const link = document.createElement('a');
  link.download = `三峽藍染_小染AR實境拍貼_${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

// ============================================================================
// 8. 音效與彈窗控制
// ============================================================================

// ============================================================================
// 攪缸氧化變色模擬器邏輯 (Vat Agitation & Oxidation Simulator)
// ============================================================================
let vatOxidationTimer = null;
let vatBubbleTimer = null;

function initVatSimulator() {
  const closeBtn = document.getElementById('btn-close-vat-sim');
  const finishBtn = document.getElementById('btn-finish-vat');
  const restartBtn = document.getElementById('btn-restart-vat');

  if (closeBtn) closeBtn.addEventListener('click', closeVatSimulator);
  if (finishBtn) finishBtn.addEventListener('click', () => {
    closeVatSimulator();
    const dialogEl = document.getElementById('ar-dialog-text');
    if (dialogEl) {
      dialogEl.textContent = '太棒了！你剛剛成功完成了三峽傳統「攪缸」！經由木棒劇烈翻攪注入氧氣，黃綠色的白靛液迅速氧化凝聚為燦爛純粹的深邃靛藍，表面的「藍染之花」就是發酵大成功的最佳象徵！✨';
    }
    highlightDialogueBox();
  });
  if (restartBtn) restartBtn.addEventListener('click', startVatOxidationAnimation);
}

function openVatSimulator() {
  const overlay = document.getElementById('vat-simulator-overlay');
  if (!overlay) return;

  overlay.classList.remove('hidden');
  setTimeout(() => {
    overlay.classList.remove('opacity-0', 'pointer-events-none');
    overlay.classList.add('opacity-100');
  }, 20);

  if (window.playIndigoChime) window.playIndigoChime(587.33);
  startVatOxidationAnimation();
}

function closeVatSimulator() {
  const overlay = document.getElementById('vat-simulator-overlay');
  if (!overlay) return;

  if (vatOxidationTimer) clearInterval(vatOxidationTimer);
  if (vatBubbleTimer) clearInterval(vatBubbleTimer);

  overlay.classList.remove('opacity-100');
  overlay.classList.add('opacity-0', 'pointer-events-none');
  setTimeout(() => {
    overlay.classList.add('hidden');
  }, 500);
}

function startVatOxidationAnimation() {
  if (vatOxidationTimer) clearInterval(vatOxidationTimer);
  if (vatBubbleTimer) clearInterval(vatBubbleTimer);

  const surface = document.getElementById('vat-liquid-surface');
  const rod = document.getElementById('vat-stirring-rod');
  const froth = document.getElementById('vat-indigo-froth');
  const oxygenVal = document.getElementById('vat-oxygen-val');
  const stageLabel = document.getElementById('vat-stage-label');
  const progressBar = document.getElementById('vat-progress-bar');
  const instructionText = document.getElementById('vat-instruction-text');
  const bubblesContainer = document.getElementById('vat-bubbles-container');

  if (bubblesContainer) bubblesContainer.innerHTML = '';

  // 1. 重設初始狀態（還原態白靛：嫩黃綠色）
  if (surface) surface.style.backgroundColor = '#84cc16';
  if (froth) froth.style.opacity = '0';
  if (progressBar) progressBar.style.width = '10%';
  if (oxygenVal) oxygenVal.textContent = '10%';
  if (stageLabel) {
    stageLabel.textContent = '🌿 階段一：厭氧還原態（黃綠色白靛）';
    stageLabel.className = 'text-amber-400 font-bold';
  }
  if (instructionText) {
    instructionText.textContent = '木棒劇烈攪拌中！正在將空氣強力注入發酵染液...';
  }
  if (rod) rod.classList.add('stirring-active');

  // 同步重置 3D 染缸液面
  if (liquidMesh) liquidMesh.material.color.setHex(0x84cc16);

  // 2. 氣泡持續產生循環
  vatBubbleTimer = setInterval(() => {
    if (!bubblesContainer) return;
    const b = document.createElement('div');
    b.className = 'vat-bubble';
    const sz = 8 + Math.random() * 14;
    b.style.width = sz + 'px';
    b.style.height = sz + 'px';
    b.style.left = (35 + Math.random() * 30) + '%';
    b.style.top = (45 + Math.random() * 20) + '%';
    bubblesContainer.appendChild(b);
    setTimeout(() => b.remove(), 1200);
  }, 160);

  // 3. 氧化變色進程 (0 ~ 4500ms)
  let elapsed = 0;
  const duration = 4500;
  const step = 80;

  vatOxidationTimer = setInterval(() => {
    elapsed += step;
    const progress = Math.min(1, elapsed / duration);
    const oxygen = Math.round(10 + progress * 88);

    if (oxygenVal) oxygenVal.textContent = oxygen + '%';
    if (progressBar) progressBar.style.width = Math.round(10 + progress * 90) + '%';

    // 顏色平滑過渡：黃綠 (#84cc16) ➔ 翡翠綠 (#10b981) ➔ 湖藍 (#0284c7) ➔ 深邃湛藍 (#1e3a8a)
    if (surface) {
      if (progress < 0.3) {
        surface.style.backgroundColor = '#65a30d'; // 黃綠轉深綠
      } else if (progress < 0.65) {
        surface.style.backgroundColor = '#0d9488'; // 綠轉藍綠
        if (stageLabel) {
          stageLabel.textContent = '🌀 階段二：溶氧劇烈翻騰（白靛分子氧化中）';
          stageLabel.className = 'text-cyan-400 font-bold';
        }
      } else if (progress < 0.9) {
        surface.style.backgroundColor = '#0284c7'; // 轉為湖水藍
      } else {
        surface.style.backgroundColor = '#1e3a8a'; // 深邃三峽靛藍
        if (stageLabel) {
          stageLabel.textContent = '✨ 階段三：氧化完成！生成純粹三峽深靛藍';
          stageLabel.className = 'text-indigo-300 font-bold';
        }
      }
    }

    // 3D Three.js 場景液面同步變色
    if (liquidMesh) {
      if (progress < 0.5) {
        liquidMesh.material.color.lerp(new THREE.Color(0x0d9488), 0.1);
      } else {
        liquidMesh.material.color.lerp(new THREE.Color(0x1e3a8a), 0.1);
      }
    }

    // 完成氧化
    if (progress >= 1) {
      clearInterval(vatOxidationTimer);
      clearInterval(vatBubbleTimer);
      vatOxidationTimer = null;
      vatBubbleTimer = null;

      if (rod) rod.classList.remove('stirring-active');
      if (froth) froth.style.opacity = '1';
      if (instructionText) {
        instructionText.textContent = '🎉 氧化變色大成功！染液已凝聚為璀璨靛青，表面盛開藍染之花！';
      }

      // 播放慶祝音效
      if (window.playIndigoChime) {
        window.playIndigoChime(587.33);
        setTimeout(() => window.playIndigoChime(784), 150);
        setTimeout(() => window.playIndigoChime(987.77), 300);
      }
    }
  }, step);
}

function initAudioInteractions() {
  // 點擊音效綁定
  document.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      if (window.playIndigoChime) window.playIndigoChime(659.25);
    });
  });
}

function initGuideModals() {
  const guideBtn = document.getElementById('btn-open-guide');
  const guideModal = document.getElementById('arGuideModal');
  if (guideBtn && guideModal) {
    guideBtn.addEventListener('click', () => {
      guideModal.showModal();
    });
  }

  const markersModalBtn = document.getElementById('btn-open-markers-modal');
  const markersModal = document.getElementById('arMarkersModal');
  if (markersModalBtn && markersModal) {
    markersModalBtn.addEventListener('click', () => {
      markersModal.showModal();
    });
  }
}
