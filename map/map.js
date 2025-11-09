const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const hint = document.getElementById("hint");
const modalOverlay = document.getElementById("underConstructionModal");
const modalBuildingName = document.getElementById("modalBuildingName");
const closeModalBtn = document.getElementById("closeModalBtn");
const loc = document.getElementById("loc");

let isCollidingWithBuilding = null;

const playerImage = new Image();
playerImage.src = "../assets/char33.png"; // sprite 4 baris × 3 kolom

const player = {
  x: 700,
  y: 600,
  size: 64,
  speed: 4,
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
    redirect: "house.html",
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
window.addEventListener("keydown", (e) => (keys[e.key] = true));
window.addEventListener("keyup", (e) => (keys[e.key] = false));

closeModalBtn.addEventListener("click", () => {
  modalOverlay.style.display = "none";
});

// Opsional: Tutup juga saat mengklik di luar konten modal
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) {
    modalOverlay.style.display = "none";
  }
});

// tekan Enter untuk masuk bangunan (dengan efek bounce)
window.addEventListener("keydown", (e) => {
  if (
    e.key === "Enter" &&
    isCollidingWithBuilding &&
    !player.crouching &&
    !player.bouncing
  ) {
    // Cek apakah bangunan sedang dalam pengembangan
    if (isCollidingWithBuilding.underConstruction) {
      // Tampilkan modal kustom
      modalBuildingName.textContent = isCollidingWithBuilding.name;
      modalOverlay.style.display = "flex";
      return; // Hentikan fungsi di sini, tidak ada bounce atau redirect
    }
    // tujuan tersedia
    player.bouncing = true;
    player.bounceFrame = 0; // setelah efek bounce selesai, pindah halaman

    setTimeout(() => {
      window.location.href = isCollidingWithBuilding.redirect;
    }, 500);
  }
});

function movePlayer() {
  if (player.crouching || player.bouncing) return;

  player.moving = false;

  // Logika pergerakan menggunakan keyboard (Arrow Keys dan WASD)
  // Ini juga akan merespons tombol virtual karena tombol virtual memanipulasi keys["Arrow*"]
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

  player.x = Math.max(0, Math.min(canvas.width - player.size, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.size, player.y));
}

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

  if (isCollidingWithBuilding && !player.crouching) {
    hint.style.display = "block";
    hint.textContent = `Tekan [Enter] untuk masuk ke ${isCollidingWithBuilding.name}`;
  } else {
    hint.style.display = "none";
  }
}
function drawBuildingsMock() {
  ctx.fillStyle = "transparent";
  ctx.font = "13px 'snowbell', sans-serif";
  ctx.textAlign = "center";
  ctx.strokeStyle = "black";
  ctx.lineWidth = 3;

  buildings.forEach((b) => {
    // Gambarkan area tabrakan (hitbox) bangunan
    ctx.fillRect(b.x, b.y, b.width, b.height);

    // --- Setup untuk Teks ---
    const textX = b.x + b.width / 2;
    const textY = b.y + b.height / 2 - 20;
    const uppercaseName = b.name.toUpperCase();

    // 1. Gambar Outline (Stroke)
    ctx.strokeText(uppercaseName, textX, textY);

    // 2. Gambar Isi Teks (Fill) di atas Outline
    ctx.fillStyle = "white";
    ctx.fillText(uppercaseName, textX, textY);

    // Kembalikan fillStyle untuk bangunan mock berikutnya
    ctx.fillStyle = "transparent";
  });
}

function drawPlayer() {
  const cols = 4;
  const rows = 4;
  const spriteWidth = playerImage.width / cols;
  const spriteHeight = playerImage.height / rows;

  // efek bounce (mantul halus)
  if (player.bouncing) {
    player.bounceFrame++;
    const t = player.bounceFrame / 15; // durasi ±0.25 detik
    player.scale = 1 + Math.sin(t * Math.PI) * 0.3; // scale naik 15%
    if (player.bounceFrame >= 15) {
      player.bouncing = false;
      player.scale = 1;
    }
  }

  if (player.blinking) {
    player.blinkFrame++;
    const t = player.blinkFrame / 15; // durasi ±0.25 detik
    player.opacity = 0.5 + Math.sin(t * Math.PI) * 0.5; // opacity 0 ~ 1
    if (player.blinkFrame >= 15) {
      player.blinking = false;
      player.blinkFrame = 0;
      player.opacity = 1;
    }
  } else {
    player.opacity = 1;
  }

  // efek idle (gerak halus kecil)
  if (!player.moving && !player.bouncing) {
    player.idleOffset = Math.sin(Date.now() / 300) * 1.5;
  } else {
    player.idleOffset = 0;
  }

  if (player.crouching) {
    player.frameX = 1;
  } else if (player.moving) {
    player.frameCount++;
    if (player.frameCount % 10 === 0) {
      player.frameX = (player.frameX + 1) % cols;
    }
  } else {
    player.frameX = 1;
  }
  // Logika Blink
  if (
    !player.moving &&
    !player.bouncing &&
    !player.blinking &&
    Math.random() < 0.005
  ) {
    // Ditambah Math.random agar tidak selalu berkedip
    player.blinking = true;
    player.blinkFrame = 0;
  }

  const scaledSize = player.size * player.scale;
  const offsetX = player.x - (scaledSize - player.size) / 2;
  const offsetY = player.y - (scaledSize - player.size) / 2;

  ctx.save();
  ctx.globalAlpha = player.opacity; // gunakan opacity untuk kedip
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

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  movePlayer();
  drawPlayer();
  drawBuildingsMock();
  checkBuildingCollision();
  requestAnimationFrame(gameLoop);
}
// Cek apakah layar cukup besar untuk main game
if (window.innerWidth > 900) {
  playerImage.onload = gameLoop;
} else {
  console.log("Mode mobile aktif — canvas dimatikan");
}

playerImage.onload = gameLoop;
