/* =============== NPC RPG DIALOGUE SYSTEM =============== */

function showNPCDialogue(text, yesAction, noAction) {
  const dialog = document.getElementById("npcDialog");
  const textBox = document.getElementById("npcText");
  const yesBtn = document.getElementById("npcYes");
  const noBtn = document.getElementById("npcNo");

  dialog.classList.remove("hidden");
  textBox.textContent = "";

  // Typing animation
  let i = 0;
  function type() {
    if (i < text.length) {
      textBox.textContent += text[i];
      i++;
      setTimeout(type, 25); // speed of typing
    }
  }
  type();

  yesBtn.onclick = () => {
    dialog.classList.add("hidden");
    if (yesAction) yesAction();
  };

  noBtn.onclick = () => {
    dialog.classList.add("hidden");
    if (noAction) noAction();
  };
}

document.getElementById("npcCharacter").addEventListener("click", () => {
  showNPCDialogue(
    "Halo! Aku PIPA. Mau lihat studio Pixel Pals?",
    () =>
      (window.location.href =
        "https://promedui.com/animation-design_pixelpals/"),
    () => console.log("User memilih tidak.")
  );
});
