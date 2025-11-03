const form = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const usernameError = document.getElementById("usernameError");
const passwordError = document.getElementById("passwordError");
const loginMessage = document.getElementById("loginMessage");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  let valid = true;

  // Reset pesan error dan login
  usernameError.style.display = "none";
  passwordError.style.display = "none";
  loginMessage.textContent = "";
  loginMessage.style.display = "none";
  loginMessage.style.fontSize = "15px";

  if (usernameInput.value.trim() === "") {
    usernameError.textContent = "Username tidak boleh kosong";
    usernameError.style.display = "block";
    valid = false;
  }

  if (passwordInput.value.trim() === "") {
    passwordError.textContent = "Password tidak boleh kosong";
    passwordError.style.display = "block";
    valid = false;
  }

  if (!valid) return;

  // Validasi login manual
  const validUsername = "Promed-25";
  const validPassword = "awawaw";
  const secretUsername = "Kelompok 3";
  const secretPassword = "yeay";

  if (
    usernameInput.value === validUsername &&
    passwordInput.value === validPassword
  ) {
    loginMessage.textContent = "Login berhasil!";
    loginMessage.style.color = "green";
    loginMessage.style.display = "block";

    // Tambahkan animasi zoomOutDown sebelum redirect
    const homeSection = document.querySelector("#home .wrapper");
    homeSection.classList.add("zoomOutDown");
    // setTimeout(() => {
    //   window.location.href = "map/map.html"; // ganti sesuai tujuan
    // }, 800); // sesuai durasi animasi di CSS
  } else if (
    usernameInput.value === secretUsername &&
    passwordInput.value === secretPassword
  ) {
    loginMessage.textContent = "Access Granted!";
    loginMessage.style.color = "green";
    loginMessage.style.display = "block";

    // Tambahkan animasi zoomOutDown sebelum redirect
    const homeSection = document.querySelector("#home .wrapper");
    homeSection.classList.add("zoomOutDown");
    setTimeout(() => {
      window.location.href = "secret/profile.html"; // ganti sesuai tujuan
    }, 800); // sesuai durasi animasi di CSS
  } else {
    loginMessage.textContent = "Username atau password salah!";
    loginMessage.style.color = "red";
    loginMessage.style.display = "block";
  }
});
