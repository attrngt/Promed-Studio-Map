/* map.js - updated: dynamic control hints + startup modal before introText */
/* Assumes assets and buildings array present as before */
/*UDAH FIX GAUSAH DIUBAH */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const hint = document.getElementById("hint");
const modalOverlay = document.getElementById("underConstructionModal");
const modalBuildingName = document.getElementById("modalBuildingName");
const closeModalBtn = document.getElementById("closeModalBtn");

const startupModal = document.getElementById("startupModal");
const btnKeyboard = document.getElementById("btnKeyboard");
const btnMouse = document.getElementById("btnMouse");
const controlModeLabel = document.getElementById("controlModeLabel");
const toggleControlModeBtn = document.getElementById("toggleControlModeBtn");
const controlModeWidget = document.getElementById("controlModeWidget");
const introTextEl = document.querySelector(".introText");

let controlMode = null; // 'keyboard' or 'mouse'
let isCollidingWithBuilding = null;
let isModalOpen = false;

// --- HINT / TIMER ---
const CONTROL_TIMEOUT = 3000; //ms
let lastInputTime = Date.now();
let controlHintTimeout = null;

function showControlHint() {
  // don't overwrite the Enter hint (collision hint)
  if (
    hint.style.display !== "none" &&
    hint.textContent.includes("Tekan [Enter]")
  ) {
    return;
  }

  hint.style.display = "block";

  if (controlMode === "keyboard") {
    hint.textContent = "W / A / S / D or Arrow Keys";
  } else if (controlMode === "mouse") {
    hint.textContent = "Klik pada peta untuk bergerak";
  } else {
    // fallback generic
    hint.textContent = "Pilih mode kontrol";
  }
}

function clearControlHintTimeout() {
  if (controlHintTimeout) {
    clearTimeout(controlHintTimeout);
    controlHintTimeout = null;
  }
}

/**
 * resetControlTimer(key)
 * - key: optional keyboard key that triggered the reset (string)
 * Behavior:
 * - In keyboard mode, only keyboard keys count as input.
 * - In mouse mode, calling resetControlTimer() with no param or with 'mouse' counts as input.
 */
function resetControlTimer(key = null) {
  // valid keyboard keys we consider as input (for showing keyboard hint)
  const validKeys = [
    "w",
    "a",
    "s",
    "d",
    "W",
    "A",
    "S",
    "D",
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "Enter",
    " ",
  ];

  // If modal open, do nothing
  if (isModalOpen) return;

  // Decide whether this event should show the hint now
  let shouldShow = false;
  if (controlMode === "keyboard") {
    if (key && validKeys.includes(key)) {
      shouldShow = true;
    } else if (!key) {
      // generic activation (e.g., after selecting mode) -> show hint
      shouldShow = true;
    }
  } else if (controlMode === "mouse") {
    // mouse mode: any explicit call or a 'mouse' marker should trigger hint
    shouldShow = true;
  } else {
    // no mode yet -> show generic
    shouldShow = true;
  }

  if (shouldShow) {
    clearControlHintTimeout();
    showControlHint();
    controlHintTimeout = setTimeout(() => {
      if (!isCollidingWithBuilding) hint.style.display = "none";
      controlHintTimeout = null;
    }, CONTROL_TIMEOUT);
    lastInputTime = Date.now();
  }
}
// --- end hint/timer ---

// Player sprite
const playerImage = new Image();
playerImage.src = "../assets/char33.png";

const player = {
  x: 700,
  y: 600,
  size: 64,
  speed: 5,
  frameX: 1,
  frameY: 0,
  frameCount: 0,
  moving: false,
  crouching: false,
  bouncing: false,
  bounceFrame: 0,
  idleOffset: 0,
  scale: 1,
  blinking: false,
  blinkFrame: 0,
  opacity: 1,
};

// buildings array (paste your building list here if not present)
const buildings = [
  {
    id: "wire",
    name: "Wire",
    x: 60,
    y: 36,
    width: 110,
    height: 140,
    redirect: "wire.html",
    underConstruction: false,
  },
  {
    id: "kuls",
    name: "Kuls",
    x: 384,
    y: 20,
    width: 147,
    height: 70,
    redirect: "#",
    underConstruction: true,
  },
  {
    id: "orfil",
    name: "Orang Film",
    x: 580,
    y: 40,
    width: 180,
    height: 126,
    redirect: "orfil.html",
    underConstruction: false,
  },
  {
    id: "vc",
    name: "Gedung Vc",
    x: 829,
    y: 32,
    width: 110,
    height: 110,
    redirect: "vc.html",
    underConstruction: false,
  },
  {
    id: "oxlab",
    name: "Ox-Lab",
    x: 1190,
    y: 60,
    width: 120,
    height: 100,
    redirect: "#",
    underConstruction: true,
  },
  {
    id: "flui",
    name: "flui",
    x: 90,
    y: 310,
    width: 120,
    height: 110,
    redirect: "../map/flui.html",
    underConstruction: false,
  },
  {
    id: "tobo",
    name: "Tobo",
    x: 290,
    y: 360,
    width: 120,
    height: 120,
    redirect: "#",
    underConstruction: true,
  },
  {
    id: "komik",
    name: "Pojok Komik",
    x: 500,
    y: 360,
    width: 120,
    height: 120,
    redirect: "#",
    underConstruction: true,
  },
  {
    id: "mosaic",
    name: "Mosaic",
    x: 790,
    y: 280,
    width: 120,
    height: 120,
    redirect: "#",
    underConstruction: true,
  },
  {
    id: "icon",
    name: "Icon",
    x: 930,
    y: 180,
    width: 120,
    height: 120,
    redirect: "#",
    underConstruction: true,
  },
  {
    id: "vote",
    name: "Vote",
    x: 45,
    y: 610,
    width: 140,
    height: 130,
    redirect: "#",
    underConstruction: true,
  },
  {
    id: "mvp",
    name: "MVP",
    x: 806,
    y: 525,
    width: 140,
    height: 110,
    redirect: "vc.html",
    underConstruction: true,
  },
  {
    id: "pixel-pals",
    name: "Pixel Pals",
    x: 493,
    y: 572,
    width: 160,
    height: 160,
    redirect: "pipa.html",
    underConstruction: false,
  },
  {
    id: "spice",
    name: "spice",
    x: 1000,
    y: 490,
    width: 140,
    height: 120,
    redirect: "#",
    underConstruction: true,
  },
];

const keys = {};
window.addEventListener("keydown", (e) => {
  if (controlMode === "keyboard") {
    keys[e.key] = true;
    resetControlTimer(e.key);
  }
});
window.addEventListener("keyup", (e) => {
  if (controlMode === "keyboard") keys[e.key] = false;
});

// Modal logic
closeModalBtn.addEventListener("click", () => {
  modalOverlay.style.display = "none";
  isModalOpen = false;
  resetControlTimer();
});
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) {
    modalOverlay.style.display = "none";
    isModalOpen = false;
    resetControlTimer();
  }
});

// Enter behavior for keyboard mode
window.addEventListener("keydown", (e) => {
  if (
    e.key === "Enter" &&
    controlMode === "keyboard" &&
    isCollidingWithBuilding &&
    !player.crouching &&
    !player.bouncing &&
    !isModalOpen
  ) {
    if (isCollidingWithBuilding.underConstruction) {
      modalBuildingName.textContent = isCollidingWithBuilding.name;
      modalOverlay.style.display = "flex";
      isModalOpen = true;
      clearControlHintTimeout();
      hint.style.display = "none";
      return;
    }
    player.bouncing = true;
    player.bounceFrame = 0;
    setTimeout(() => {
      window.location.href = isCollidingWithBuilding.redirect;
    }, 500);
  }
});

// MOUSE MOVEMENT
let mouseTarget = null; // {x,y,arriveCallback}
let showTargetMarker = false;

canvas.addEventListener("click", (e) => {
  if (controlMode !== "mouse" || isModalOpen) return;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;

  const clickedBuilding = buildings.find(
    (b) => x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height
  );
  if (clickedBuilding) {
    if (clickedBuilding.underConstruction) {
      modalBuildingName.textContent = clickedBuilding.name;
      modalOverlay.style.display = "flex";
      isModalOpen = true;
      clearControlHintTimeout();
      hint.style.display = "none";
      return;
    } else {
      mouseTarget = {
        x: clickedBuilding.x + clickedBuilding.width / 2 - player.size / 2,
        y: clickedBuilding.y + clickedBuilding.height / 2 - player.size / 2,
        arriveCallback: () => {
          player.bouncing = true;
          player.bounceFrame = 0;
          setTimeout(() => {
            window.location.href = clickedBuilding.redirect;
          }, 500);
        },
      };
      showTargetMarker = true;
      resetControlTimer(); // mouse input
      return;
    }
  }

  mouseTarget = {
    x: x - player.size / 2,
    y: y - player.size / 2,
    arriveCallback: null,
  };
  showTargetMarker = true;
  resetControlTimer(); // mouse input
});

function moveTowardsTarget() {
  if (!mouseTarget) return;
  const tx = mouseTarget.x;
  const ty = mouseTarget.y;
  const dx = tx - player.x;
  const dy = ty - player.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 2) {
    player.x = tx;
    player.y = ty;
    if (mouseTarget.arriveCallback) {
      mouseTarget.arriveCallback();
      mouseTarget = null;
      showTargetMarker = false;
      return;
    }
    mouseTarget = null;
    showTargetMarker = false;
    return;
  }
  const vx = (dx / dist) * player.speed;
  const vy = (dy / dist) * player.speed;
  player.x += vx;
  player.y += vy;

  if (Math.abs(dx) > Math.abs(dy)) {
    player.frameY = dx > 0 ? 2 : 1;
  } else {
    player.frameY = dy > 0 ? 0 : 3;
  }
  player.moving = true;
  lastInputTime = Date.now();
}

// KEYBOARD MOVEMENT
function movePlayerKeyboard() {
  if (isModalOpen) return;
  if (player.crouching || player.bouncing) return;

  const wasMoving = player.moving;
  player.moving = false;

  const isMovingNow =
    keys["ArrowUp"] ||
    keys["w"] ||
    keys["ArrowDown"] ||
    keys["s"] ||
    keys["ArrowLeft"] ||
    keys["a"] ||
    keys["ArrowRight"] ||
    keys["d"];

  if (isMovingNow) {
    if (keys["ArrowUp"] || keys["w"]) {
      player.y -= player.speed;
      player.frameY = 3;
      player.moving = true;
    }
    if (keys["ArrowDown"] || keys["s"]) {
      player.y += player.speed;
      player.frameY = 0;
      player.moving = true;
    }
    if (keys["ArrowLeft"] || keys["a"]) {
      player.x -= player.speed;
      player.frameY = 1;
      player.moving = true;
    }
    if (keys["ArrowRight"] || keys["d"]) {
      player.x += player.speed;
      player.frameY = 2;
      player.moving = true;
    }

    lastInputTime = Date.now();
    clearControlHintTimeout();
    if (hint.textContent.includes("Gerak:")) hint.style.display = "none";
  } else {
    if (wasMoving && !player.moving) {
      resetControlTimer(); // will show hint again after timeout
    }
  }

  player.x = Math.max(0, Math.min(canvas.width - player.size, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.size, player.y));
}

// COLLISION DETECTION
function checkBuildingCollision() {
  isCollidingWithBuilding = null;
  for (let b of buildings) {
    if (
      player.x + player.size > b.x &&
      player.x < b.x + b.width &&
      player.y + player.size > b.y &&
      player.y < b.y + b.height
    ) {
      isCollidingWithBuilding = b;
      break;
    }
  }

  if (isCollidingWithBuilding && !player.crouching && !isModalOpen) {
    clearControlHintTimeout();
    hint.style.display = "block";
    hint.textContent = `Tekan [Enter] untuk masuk ke ${isCollidingWithBuilding.name}`;
  } else if (!isCollidingWithBuilding && !isModalOpen) {
    if (hint.textContent.includes("Tekan [Enter]")) hint.style.display = "none";
    if (!controlHintTimeout && Date.now() - lastInputTime > 100) {
      resetControlTimer();
    }
  }
}

// DRAWING
function drawBuildingsMock() {
  ctx.fillStyle = "transparent";
  ctx.font = "13px 'snowbell', sans-serif";
  ctx.textAlign = "center";
  ctx.strokeStyle = "black";
  ctx.lineWidth = 3;

  buildings.forEach((b) => {
    ctx.fillRect(b.x, b.y, b.width, b.height);
    const textX = b.x + b.width / 2;
    const textY = b.y + b.height / 2 - 20;
    const uppercaseName = b.name.toUpperCase();
    ctx.strokeText(uppercaseName, textX, textY);
    ctx.fillStyle = "white";
    ctx.fillText(uppercaseName, textX, textY);
    ctx.fillStyle = "transparent";
  });
}

function drawTargetMarker() {
  if (!showTargetMarker || !mouseTarget) return;
  ctx.save();
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 3]);
  ctx.strokeRect(mouseTarget.x, mouseTarget.y, player.size, player.size);
  ctx.restore();
}

function drawPlayer() {
  const cols = 4;
  const rows = 4;
  const spriteWidth = playerImage.width / cols;
  const spriteHeight = playerImage.height / rows;

  if (player.bouncing) {
    player.bounceFrame++;
    const t = player.bounceFrame / 15;
    player.scale = 1 + Math.sin(t * Math.PI) * 0.3;
    if (player.bounceFrame >= 15) {
      player.bouncing = false;
      player.scale = 1;
    }
  }

  if (player.blinking) {
    player.blinkFrame++;
    const t = player.blinkFrame / 15;
    player.opacity = 0.5 + Math.sin(t * Math.PI) * 0.5;
    if (player.blinkFrame >= 15) {
      player.blinking = false;
      player.blinkFrame = 0;
      player.opacity = 1;
    }
  } else {
    player.opacity = 1;
  }

  if (!player.moving && !player.bouncing) {
    player.idleOffset = Math.sin(Date.now() / 300) * 1.5;
  } else {
    player.idleOffset = 0;
  }

  if (player.crouching) {
    player.frameX = 1;
  } else if (player.moving) {
    player.frameCount++;
    if (player.frameCount % 10 === 0)
      player.frameX = (player.frameX + 1) % cols;
  } else {
    player.frameX = 1;
  }

  if (
    !player.moving &&
    !player.bouncing &&
    !player.blinking &&
    Math.random() < 0.005
  ) {
    player.blinking = true;
    player.blinkFrame = 0;
  }

  const scaledSize = player.size * player.scale;
  const offsetX = player.x - (scaledSize - player.size) / 2;
  const offsetY = player.y - (scaledSize - player.size) / 2;

  ctx.save();
  ctx.globalAlpha = player.opacity;
  ctx.imageSmoothingEnabled = false; // pixelated draw
  ctx.drawImage(
    playerImage,
    player.frameX * spriteWidth,
    player.frameY * spriteHeight,
    spriteWidth,
    spriteHeight,
    offsetX,
    offsetY + player.idleOffset,
    scaledSize,
    scaledSize
  );
  ctx.restore();
}

// GAME LOOP
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // movement selection
  player.moving = false;
  if (controlMode === "keyboard") {
    movePlayerKeyboard();
  } else if (controlMode === "mouse") {
    moveTowardsTarget();
  }

  drawPlayer();
  drawBuildingsMock();
  drawTargetMarker();
  checkBuildingCollision();

  requestAnimationFrame(gameLoop);
}

// STARTUP MODAL HANDLERS
function setControlMode(mode) {
  controlMode = mode;
  controlModeLabel.textContent =
    mode === "keyboard" ? "Keyboard" : "Mouse (Click)";
  startupModal.style.display = "none";

  // Reveal introText after user chooses mode (introText initially hidden via CSS)
  if (introTextEl) {
    introTextEl.style.display = "block";
    // small timeout to allow any CSS transition/animation to trigger
    setTimeout(() => {
      introTextEl.style.opacity = 1;
    }, 50);
  }

  resetControlTimer(); // initial hint
  controlModeWidget.style.display = "block";
}

btnKeyboard.addEventListener("click", () => setControlMode("keyboard"));
btnMouse.addEventListener("click", () => setControlMode("mouse"));

toggleControlModeBtn.addEventListener("click", () => {
  const newMode = controlMode === "keyboard" ? "mouse" : "keyboard";
  setControlMode(newMode);
});

controlModeWidget.style.display = "none";

// CARD clicks -> building redirect / modal
const cardTitles = document.querySelectorAll(".card h2");
cardTitles.forEach((h2) => {
  h2.addEventListener("click", () => {
    const cardElement = h2.closest(".card");
    if (!cardElement) return;
    const cardId = cardElement.id;
    const correspondingBuilding = buildings.find((b) => b.id === cardId);
    if (correspondingBuilding) {
      if (correspondingBuilding.underConstruction) {
        modalBuildingName.textContent = correspondingBuilding.name;
        modalOverlay.style.display = "flex";
        isModalOpen = true;
        clearControlHintTimeout();
        return;
      }
      window.location.href = correspondingBuilding.redirect;
    }
  });
});

// Start loop after sprite loads
playerImage.onload = () => {
  gameLoop();
};

// Prevent clicks on modal background from propagating to canvas
startupModal.addEventListener("click", (e) => {
  if (e.target === startupModal) {
    e.stopPropagation();
  }
});
