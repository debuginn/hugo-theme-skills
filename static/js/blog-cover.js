(function () {
const previewCanvas = document.getElementById("preview");
const ctx = previewCanvas.getContext("2d");
const STATE_KEY = "debuginn_blog_cover_state";

const imageInput = document.getElementById("imageInput");
const imageFileName = document.getElementById("imageFileName");
const titleInput = document.getElementById("titleInput");
const accentInput = document.getElementById("accentInput");
const accentButtons = document.querySelectorAll(".accent-btn[data-accent]");
const pickAccentBtn = document.getElementById("pickAccentBtn");
const customAccentSwatch = document.getElementById("customAccentSwatch");
const glowInput = document.getElementById("glowInput");
const trackingInput = document.getElementById("trackingInput");
const downloadBtn = document.getElementById("downloadBtn");

const COVER_SIZE = { width: 1600, height: 900 };

let centerImage = null;
let persistedImageName = "";
const emptyFileName = imageFileName ? imageFileName.textContent.trim() : "";

function syncAccentButtons() {
  const currentAccent = normalizeHex(accentInput.value);
  let matchedPreset = false;

  accentButtons.forEach((button) => {
    const isActive = button.dataset.accent === currentAccent;
    button.classList.toggle("is-active", isActive);
    if (isActive) matchedPreset = true;
  });

  if (!pickAccentBtn || !customAccentSwatch) return;
  pickAccentBtn.classList.toggle("is-active", !matchedPreset);
  customAccentSwatch.style.background = matchedPreset ? "" : currentAccent;
  customAccentSwatch.classList.toggle("is-custom-color", !matchedPreset);
}

function normalizeHex(value) {
  const v = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v.toLowerCase();
  return "#3a66ff";
}

function loadPersistedState() {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

function savePersistedState() {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify({
      title: titleInput.value,
      accent: accentInput.value,
      glow: glowInput.value,
      tracking: trackingInput.value,
      imageData: centerImage?.src || "",
      imageName: persistedImageName || ""
    }));
  } catch (_) {
    // Ignore storage errors.
  }
}

function updateCanvasSize() {
  previewCanvas.width = COVER_SIZE.width;
  previewCanvas.height = COVER_SIZE.height;

  const maxWidth = 760;
  const displayWidth = Math.min(maxWidth, COVER_SIZE.width);
  previewCanvas.style.width = `${displayWidth}px`;
  previewCanvas.style.height = "auto";
}

function hexToRgba(hex, alpha) {
  const clean = normalizeHex(hex).slice(1);
  const num = Number.parseInt(clean, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function roundedRect(context, x, y, w, h, r) {
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + w, y, x + w, y + h, r);
  context.arcTo(x + w, y + h, x, y + h, r);
  context.arcTo(x, y + h, x, y, r);
  context.arcTo(x, y, x + w, y, r);
  context.closePath();
}

function fitContain(srcW, srcH, dstW, dstH) {
  const ratio = Math.min(dstW / srcW, dstH / srcH);
  return {
    width: srcW * ratio,
    height: srcH * ratio
  };
}

function drawGlowBackground(width, height, accentColor, glowStrength) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = accentColor;
  ctx.fillRect(0, 0, width, height);

  const glowRatio = Math.max(0.2, Math.min(1, glowStrength / 100));
  const innerRadius = Math.max(40, width * (0.035 + glowRatio * 0.045));
  const outerRadius = width * (0.22 + glowRatio * 0.34);
  const midStop = 0.28 + glowRatio * 0.24;

  const glow = ctx.createRadialGradient(
    width / 2,
    height / 2,
    innerRadius,
    width / 2,
    height / 2,
    outerRadius
  );
  glow.addColorStop(0, hexToRgba("#ffffff", 0.28 + glowRatio * 0.4));
  glow.addColorStop(midStop, hexToRgba("#9dd0ff", 0.12 + glowRatio * 0.22));
  glow.addColorStop(1, hexToRgba(accentColor, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);
}

function drawTrackingText(text, centerX, centerY, tracking) {
  const chars = [...text];
  const widths = chars.map((char) => ctx.measureText(char).width);
  const totalWidth = widths.reduce((sum, value) => sum + value, 0) + Math.max(0, chars.length - 1) * tracking;
  let cursorX = centerX - totalWidth / 2;
  const metrics = ctx.measureText(text);
  const ascent = metrics.actualBoundingBoxAscent || 0;
  const descent = metrics.actualBoundingBoxDescent || 0;
  const drawY = centerY + (ascent - descent) / 2;

  chars.forEach((char, index) => {
    ctx.fillText(char, cursorX, drawY);
    cursorX += widths[index] + tracking;
  });
}

function drawBackdropText(width, height, title, tracking) {
  const fontSize = Math.round(width * 0.12);
  ctx.save();
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = `800 ${fontSize}px "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif`;
  drawTrackingText(title || "BLOG", width / 2, height / 2, tracking);
  ctx.restore();
}

function drawCenterImage(width, height, accentColor) {
  const cardSize = Math.round(Math.min(width, height) * 0.36);
  const cardX = Math.round((width - cardSize) / 2);
  const cardY = Math.round((height - cardSize) / 2);

  if (centerImage) {
    const fit = fitContain(centerImage.width, centerImage.height, cardSize, cardSize);
    const drawX = cardX + (cardSize - fit.width) / 2;
    const drawY = cardY + (cardSize - fit.height) / 2;
    ctx.save();
    ctx.shadowColor = hexToRgba("#0b1020", 0.22);
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 18;
    ctx.drawImage(centerImage, drawX, drawY, fit.width, fit.height);
    ctx.restore();
  }

  ctx.strokeStyle = hexToRgba(accentColor, 0.16);
  ctx.lineWidth = Math.max(2, width * 0.003);
  ctx.strokeRect(0, 0, width, height);
}

function render() {
  const { width, height } = COVER_SIZE;
  const accentColor = normalizeHex(accentInput.value);
  const glowStrength = Number.parseInt(glowInput.value, 10) || 68;
  const tracking = Number.parseInt(trackingInput.value, 10) || 0;
  const title = (titleInput.value || "BLOG").trim();

  updateCanvasSize();
  syncAccentButtons();
  drawGlowBackground(width, height, accentColor, glowStrength);
  drawBackdropText(width, height, title, tracking);
  drawCenterImage(width, height, accentColor);
  savePersistedState();
}

function setImageFileName(name) {
  persistedImageName = name || "";
  if (persistedImageName) imageFileName.textContent = persistedImageName;
  else imageFileName.textContent = emptyFileName;
}

function setCenterImage(dataUrl, fileName = "") {
  const img = new Image();
  img.onload = () => {
    centerImage = img;
    setImageFileName(fileName);
    render();
  };
  img.src = dataUrl;
}

imageInput.addEventListener("change", (event) => {
  const [file] = event.target.files || [];
  if (!file) {
    centerImage = null;
    setImageFileName("");
    render();
    return;
  }

  const reader = new FileReader();
  reader.onload = () => setCenterImage(reader.result, file.name);
  reader.readAsDataURL(file);
});

[...accentButtons].forEach((button) => {
  button.addEventListener("click", () => {
    accentInput.value = button.dataset.accent;
    render();
  });
});

if (pickAccentBtn) {
  pickAccentBtn.addEventListener("click", () => {
    if (typeof accentInput.showPicker === "function") accentInput.showPicker();
    else accentInput.click();
  });
}

[titleInput, accentInput, glowInput, trackingInput].forEach((element) => {
  element.addEventListener("input", render);
  element.addEventListener("change", render);
});

downloadBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  const { width, height } = COVER_SIZE;
  link.download = `debuginn-blog-cover-${width}x${height}.png`;
  link.href = previewCanvas.toDataURL("image/png");
  link.click();
});

const savedState = loadPersistedState();

if (savedState) {
  titleInput.value = savedState.title || titleInput.value;
  accentInput.value = normalizeHex(savedState.accent || accentInput.value);
  glowInput.value = savedState.glow || glowInput.value;
  trackingInput.value = savedState.tracking || trackingInput.value;
  persistedImageName = savedState.imageName || "";
}

render();

if (savedState?.imageData) {
  setCenterImage(savedState.imageData, savedState.imageName || "");
}
})();
