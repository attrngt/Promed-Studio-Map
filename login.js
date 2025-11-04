const loginButton = document.querySelector("button");
const homeSection = document.querySelector("#home .wrapper");
const loginMessage = document.getElementById("loginMessage");

// Tambahkan event klik pada tombol login
loginButton.addEventListener("click", () => {
  // Tampilkan pesan dan ubah gaya sedikit biar interaktif
  loginMessage.textContent = "Loading..";
  loginMessage.style.color = "purple";
  loginMessage.style.display = "block";

  // Jalankan animasi keluar sebelum redirect
  homeSection.classList.add("zoomOutDown");
  setTimeout(() => {
    window.location.href = "map/map.html";
  }, 800); // sesuaikan dengan durasi animasi CSS
});
