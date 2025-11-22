window.addEventListener("scroll", () => {
  const h = document.documentElement;
  const percent = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
  document.getElementById("scroll-progress").style.width = percent + "%";
});

document.addEventListener("DOMContentLoaded", () => {
  const target = document.getElementById("typeTarget");
  if (!target) return;

  const text = target.textContent.trim();
  target.textContent = ""; // kosongkan dulu

  [...text].forEach((char, i) => {
    const span = document.createElement("span");
    span.textContent = char === " " ? "\u00A0" : char; // spasi non-breaking
    span.classList.add("typing-span");
    span.style.animationDelay = (i * 136) + "ms"; // delay per huruf
    target.appendChild(span);
  });
});

