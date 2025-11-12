const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const hint = document.getElementById("hint");
const modalOverlay = document.getElementById("underConstructionModal");
const modalBuildingName = document.getElementById("modalBuildingName");
const closeModalBtn = document.getElementById("closeModalBtn");
const loc = document.getElementById("loc");

let isCollidingWithBuilding = null;
let isModalOpen = false;

// --- BARU: LOGIKA PETUNJUK KONTROL ---
const CONTROL_TIMEOUT = 3000; //millisecond
let lastInputTime = Date.now();
let controlHintTimeout = null;

function showControlHint() {
  // Pastikan petunjuk bangunan tidak ditampilkan saat petunjuk kontrol ditampilkan
  if (
    hint.style.display !== "none" &&
    hint.textContent.includes("Tekan [Enter]")
  ) {
    return; // Jangan tampilkan petunjuk kontrol jika petunjuk Enter sedang aktif
  }

  hint.style.display = "block";
  hint.textContent = "W,A,S,D or Arrow to move."; // <<< TEKS INSTRUKSI SESUAI PERMINTAAN
}

function resetControlTimer(key = null) {
  // Tombol valid termasuk tombol aksi seperti Enter
  const validKeys = [
    "w",
    "a",
    "s",
    "d",
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "Enter",
  ];

  // Jika key diberikan dan BUKAN tombol valid, anggap sebagai kesalahan
  if (key && !validKeys.includes(key) && !isModalOpen) {
    // Pemain menekan tombol yang salah: tampilkan instruksi kontrol segera
    if (controlHintTimeout) {
      clearTimeout(controlHintTimeout);
    }
    showControlHint();
    // Atur timer agar petunjuk hilang setelah 3 detik
    controlHintTimeout = setTimeout(() => {
      if (!isCollidingWithBuilding) {
        hint.style.display = "none";
      }
      controlHintTimeout = null; // Setel ulang setelah selesai
    }, 3000); // Tampilkan sebentar, lalu sembunyikan jika tidak ada tabrakan bangunan

    // Reset lastInputTime agar timer 4 detik mulai lagi
    lastInputTime = Date.now();
    return;
  }

  // Jika tombol valid atau dipanggil dari gameLoop (pergerakan)
  lastInputTime = Date.now();

  // Sembunyikan petunjuk kontrol jika sedang ditampilkan
  if (hint.textContent.includes("W,A,S,D or Arrow to move.")) {
    hint.style.display = "none";
  }

  // Hentikan timeout yang sedang berjalan
  if (controlHintTimeout) {
    clearTimeout(controlHintTimeout);
    controlHintTimeout = null;
  }

  // Atur ulang timeout baru untuk menampilkan petunjuk kontrol jika pemain diam
  // Hanya jika modal tidak terbuka
  if (!isModalOpen) {
    controlHintTimeout = setTimeout(showControlHint, CONTROL_TIMEOUT);
  }
}

// --- AKHIR LOGIKA PETUNJUK KONTROL ---

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
    _underConstruction: true,
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
  keys[e.key] = true;
  // Panggil resetControlTimer pada setiap penekanan tombol
  // Kecuali jika modal sedang terbuka
  if (!isModalOpen) {
    resetControlTimer(e.key);
  }
});

window.addEventListener("keyup", (e) => (keys[e.key] = false));

// --- LOGIKA TUTUP MODAL ---
closeModalBtn.addEventListener("click", () => {
  modalOverlay.style.display = "none";
  isModalOpen = false; // <<< SET FALSE SAAT MODAL DITUTUP
  resetControlTimer(); // Reset timer setelah modal ditutup
});

// Opsional: Tutup juga saat mengklik di luar konten modal
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) {
    modalOverlay.style.display = "none";
    isModalOpen = false; // <<< SET FALSE SAAT MODAL DITUTUP
    resetControlTimer(); // Reset timer setelah modal ditutup
  }
});

// tekan Enter untuk masuk bangunan (dengan efek bounce)
window.addEventListener("keydown", (e) => {
  // Pindahkan logika Enter ke sini, tapi reset timer sudah ditangani di event listener keydown umum
  if (
    e.key === "Enter" &&
    isCollidingWithBuilding &&
    !player.crouching &&
    !player.bouncing &&
    !isModalOpen
  ) {
    // Pastikan modal tidak terbuka
    // Cek apakah bangunan sedang dalam pengembangan
    if (isCollidingWithBuilding.underConstruction) {
      // Tampilkan modal kustom
      modalBuildingName.textContent = isCollidingWithBuilding.name;
      modalOverlay.style.display = "flex";
      isModalOpen = true; // <<< SET TRUE SAAT MODAL DIBUKA

      // Hentikan timer petunjuk kontrol saat modal terbuka
      if (controlHintTimeout) {
        clearTimeout(controlHintTimeout);
        controlHintTimeout = null;
      }
      hint.style.display = "none"; // Sembunyikan petunjuk [Enter]
      return;
    } // tujuan tersedia
    player.bouncing = true;
    player.bounceFrame = 0; // setelah efek bounce selesai, pindah halaman

    setTimeout(() => {
      window.location.href = isCollidingWithBuilding.redirect;
    }, 500);
  }
});

function movePlayer() {
  if (isModalOpen) return; // <<< BLOKIR PERGERAKAN JIKA MODAL TERBUKA
  if (player.crouching || player.bouncing) return;

  const wasMoving = player.moving; // Simpan status pergerakan sebelumnya
  player.moving = false; // Logika pergerakan menggunakan keyboard (Arrow Keys dan WASD)

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

    // Jika pemain baru mulai bergerak (tombol ditekan)
    // resetControlTimer() sudah menangani ini di event 'keydown'

    // Jika pemain menahan tombol (tetap bergerak)
    if (player.moving) {
      lastInputTime = Date.now(); // Terus update lastInputTime selama bergerak
      // Hapus timer timeout jika ada (agar tidak muncul saat bergerak)
      if (controlHintTimeout) {
        clearTimeout(controlHintTimeout);
        controlHintTimeout = null;
      }
      // Pastikan petunjuk kontrol tersembunyi
      if (hint.textContent.includes("W,A,S,D or Arrow to move.")) {
        hint.style.display = "none";
      }
    }
  } else {
    // Jika pemain berhenti bergerak (tombol dilepas)
    if (wasMoving && !player.moving) {
      // Mulai timer baru 4 detik
      resetControlTimer();
    }
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

  if (isCollidingWithBuilding && !player.crouching && !isModalOpen) {
    // Jika berdekatan dengan bangunan, hentikan timeout petunjuk kontrol dan tampilkan petunjuk Enter
    if (controlHintTimeout) {
      clearTimeout(controlHintTimeout);
      controlHintTimeout = null;
    }
    hint.style.display = "block";
    hint.textContent = `Tekan [Enter] untuk masuk ke ${isCollidingWithBuilding.name}`;
  } else if (!isCollidingWithBuilding && !isModalOpen) {
    // Jika tidak berdekatan DAN modal tidak terbuka
    // Jangan sembunyikan jika petunjuk kontrol sedang aktif karena timeout/kesalahan
    if (hint.textContent.includes("Tekan [Enter]")) {
      hint.style.display = "none";
    }
    // Jika timer belum ada, mulai timer 4 detik (misalnya setelah menjauh dari gedung)
    if (!controlHintTimeout && Date.now() - lastInputTime > 100) {
      // Sedikit buffer
      resetControlTimer();
    }
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
    ctx.fillRect(b.x, b.y, b.width, b.height); // --- Setup untuk Teks ---

    const textX = b.x + b.width / 2;
    const textY = b.y + b.height / 2 - 20;
    const uppercaseName = b.name.toUpperCase(); // 1. Gambar Outline (Stroke)

    // --- INI YANG DIGANTI ---
    ctx.strokeText(uppercaseName, textX, textY); // <-- Saya salah ketik 'T.strokeText' sebelumnya // 2. Gambar Isi Teks (Fill) di atas Outline

    ctx.fillStyle = "white";
    ctx.fillText(uppercaseName, textX, textY); // Kembalikan fillStyle untuk bangunan mock berikutnya

    ctx.fillStyle = "transparent";
  });
}

function drawPlayer() {
  const cols = 4;
  const rows = 4;
  const spriteWidth = playerImage.width / cols;
  const spriteHeight = playerImage.height / rows; // efek bounce (mantul halus)

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
  } // efek idle (gerak halus kecil)

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
  } // Logika Blink
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

  // Logika Cek Timeout sekarang dikelola sepenuhnya oleh resetControlTimer
  // dan setTimeout di dalamnya, tidak perlu pengecekan manual di gameLoop
  // kecuali saat pertama kali memuat.

  requestAnimationFrame(gameLoop);
}

playerImage.onload = () => {
  resetControlTimer(); // Mulai timer 4 detik saat gambar selesai dimuat
  gameLoop(); // Mulai game loop
};

// js responsive
// 1 get class card
const cardTitles = document.querySelectorAll(".card h2");

// 2. Tambahkan event listener untuk setiap H2
cardTitles.forEach((h2) => {
  h2.addEventListener("click", () => {
    // Ambil ID dari elemen card induk (parent)
    // h2.closest('.card') mencari elemen terdekat dengan class 'card'
    const cardElement = h2.closest(".card");
    if (!cardElement) return; // Pastikan elemen card ditemukan

    const cardId = cardElement.id; // Cari data bangunan yang sesuai di array buildings

    const correspondingBuilding = buildings.find((b) => b.id === cardId);

    if (correspondingBuilding) {
      // Cek apakah bangunan sedang dalam pengembangan
      if (correspondingBuilding.underConstruction) {
        // Tampilkan modal Under Construction
        modalBuildingName.textContent = correspondingBuilding.name;
        modalOverlay.style.display = "flex";
        isModalOpen = true; // <<< SET TRUE SAAT MODAL DIBUKA

        // Hentikan timer petunjuk kontrol saat modal terbuka
        if (controlHintTimeout) {
          clearTimeout(controlHintTimeout);
          controlHintTimeout = null;
        }
        return;
      } // Redirect ke halaman yang ditentukan

      window.location.href = correspondingBuilding.redirect;
    }
  });
});
