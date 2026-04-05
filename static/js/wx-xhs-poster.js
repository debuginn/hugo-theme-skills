(function () {
const previewCanvas = document.getElementById("preview");
const ctx = previewCanvas.getContext("2d");
const EXPORT_SCALE = 2;
const PREVIEW_MAX_SIDE = 720;
const STATE_KEY = "debuginn_wx_xhs_poster_state";

const imageInput = document.getElementById("imageInput");
const imageFileName = document.getElementById("imageFileName");
const sizeSelect = document.getElementById("sizeSelect");
const sizeButtons = document.querySelectorAll(".size-btn[data-size]");
const titleInput = document.getElementById("titleInput");
const subtitleInput = document.getElementById("subtitleInput");
const bgInput = document.getElementById("bgInput");
const bgHexInput = document.getElementById("bgHexInput");
const colorModal = document.getElementById("colorModal");
const modalHexInput = document.getElementById("modalHexInput");
const modalColorPreview = document.getElementById("modalColorPreview");
const modalColorValue = document.getElementById("modalColorValue");
const modalBgButtons = document.querySelectorAll(".modal-bg-btn");
const closeColorModalBtn = document.getElementById("closeColorModalBtn");
const modalEyedropperBtn = document.getElementById("modalEyedropperBtn");
const applyColorBtn = document.getElementById("applyColorBtn");
const customBgSwatch = document.getElementById("customBgSwatch");
const backgroundButtons = document.querySelectorAll(".bg-btn");
const gradientSelect = document.getElementById("gradientSelect");
const schemeButtons = document.querySelectorAll(".scheme-btn[data-scheme]");
const pickColorBtn = document.getElementById("pickColorBtn");
const downloadBtn = document.getElementById("downloadBtn");

let screenshotImage = null;
let modalBackgroundColor = "#ffffff";
let persistedImageName = "";
const emptyFileName = imageFileName ? imageFileName.textContent.trim() : "";

const gradients = {
  cool: ["#4CC9F0", "#3A86FF", "#7B61FF", "#5EEAD4"],
  warm: ["#FFB86B", "#FF8A65", "#FF5E7A", "#FF7CE5"],
  ocean: ["#38BDF8", "#0EA5E9", "#2563EB", "#22D3EE"],
  mono: ["#111827", "#1F2937", "#374151", "#111827"]
};

const layoutPresets = {
  square: {
    width: 1080,
    height: 1080,
    screenshotBox: { x: 86, y: 96, w: 458, h: 900, r: 54 },
    title: { x: 612, y: 438, fontSize: 110 },
    subtitle: { x: 612, y: 560, maxWidth: 400, lineHeight: 34, fontSize: 24 },
    placeholder: { x: 238, y: 540 }
  },
  xhs: {
    width: 1080,
    height: 1440,
    screenshotBox: { x: 109, y: 185, w: 545, h: 1071, r: 59 },
    title: { x: 686, y: 619, fontSize: 101 },
    subtitle: { x: 686, y: 731, maxWidth: 294, lineHeight: 31, fontSize: 22 },
    placeholder: { x: 292, y: 726 }
  }
};

function applyDrawingQuality(context) {
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
}

function fitRect(srcW, srcH, dstX, dstY, dstW, dstH) {
  const srcRatio = srcW / srcH;
  const dstRatio = dstW / dstH;
  let drawW = dstW;
  let drawH = dstH;
  if (srcRatio > dstRatio) {
    drawW = dstW;
    drawH = dstW / srcRatio;
  } else {
    drawH = dstH;
    drawW = dstH * srcRatio;
  }
  const x = dstX + (dstW - drawW) / 2;
  const y = dstY + (dstH - drawH) / 2;
  return { x, y, w: drawW, h: drawH };
}

function loadPersistedState() {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function savePersistedState() {
  try {
    const state = {
      title: titleInput.value,
      subtitle: subtitleInput.value,
      gradient: gradientSelect.value,
      size: sizeSelect.value,
      background: bgHexInput.value,
      imageData: screenshotImage?.src || "",
      imageName: persistedImageName || ""
    };
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch (error) {
    // Ignore storage quota issues.
  }
}

function normalizeHex(value) {
  const v = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v.toLowerCase();
  return null;
}

function drawRoundedClip(context, x, y, w, h, r) {
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + w, y, x + w, y + h, r);
  context.arcTo(x + w, y + h, x, y + h, r);
  context.arcTo(x, y + h, x, y, r);
  context.arcTo(x, y, x + w, y, r);
  context.closePath();
}

function wrapText(context, text, x, y, maxWidth, lineHeight) {
  if (!text) return;
  const chars = [...text];
  let line = "";
  let drawY = y;
  for (const ch of chars) {
    const next = line + ch;
    if (context.measureText(next).width > maxWidth && line) {
      context.fillText(line, x, drawY);
      line = ch;
      drawY += lineHeight;
    } else {
      line = next;
    }
  }
  if (line) context.fillText(line, x, drawY);
}

function syncSchemeButtons() {
  schemeButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.scheme === gradientSelect.value);
  });
}

function syncSizeButtons() {
  sizeButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.size === sizeSelect.value);
  });
}

function syncBackgroundButtons() {
  const currentColor = normalizeHex(bgHexInput.value) || "#ffffff";
  let matchedPreset = false;

  backgroundButtons.forEach((button) => {
    const preset = button.dataset.bg;
    const isMatch = preset === currentColor;
    button.classList.toggle("is-active", isMatch);
    if (isMatch) matchedPreset = true;
  });

  if (customBgSwatch) {
    customBgSwatch.style.background = matchedPreset ? "" : currentColor;
    customBgSwatch.classList.toggle("is-custom-color", !matchedPreset);
  }
}

function syncModalButtons() {
  modalBgButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.modalBg === modalBackgroundColor);
  });
}

function updateModalPreview(color) {
  modalBackgroundColor = normalizeHex(color) || "#ffffff";
  if (modalHexInput) modalHexInput.value = modalBackgroundColor;
  modalColorPreview.style.background = modalBackgroundColor;
  modalColorValue.textContent = modalBackgroundColor;
  syncModalButtons();
}

function openColorModal() {
  updateModalPreview(normalizeHex(bgHexInput.value) || "#ffffff");
  colorModal.hidden = false;
}

function closeColorModal() {
  colorModal.hidden = true;
}

function getCurrentPreset() {
  return layoutPresets[sizeSelect.value] || layoutPresets.square;
}

function updatePreviewCanvasSize(preset) {
  previewCanvas.width = preset.width;
  previewCanvas.height = preset.height;

  const widthRatio = preset.width / preset.height;
  const heightRatio = preset.height / preset.width;
  const displayWidth = preset.width >= preset.height
    ? PREVIEW_MAX_SIDE
    : Math.round(PREVIEW_MAX_SIDE * widthRatio);
  const displayHeight = preset.height >= preset.width
    ? PREVIEW_MAX_SIDE
    : Math.round(PREVIEW_MAX_SIDE * heightRatio);

  previewCanvas.style.width = `${displayWidth}px`;
  previewCanvas.style.height = "auto";
  previewCanvas.style.maxHeight = `${displayHeight}px`;
}

function drawPoster(context, preset, scale = 1) {
  const bgColor = normalizeHex(bgHexInput.value) || "#ffffff";
  bgInput.value = bgColor;
  syncBackgroundButtons();

  context.save();
  context.setTransform(scale, 0, 0, scale, 0, 0);
  context.clearRect(0, 0, preset.width, preset.height);
  context.fillStyle = bgColor;
  context.fillRect(0, 0, preset.width, preset.height);

  if (screenshotImage) {
    const screenshotBox = preset.screenshotBox;
    const target = fitRect(
      screenshotImage.width,
      screenshotImage.height,
      screenshotBox.x, screenshotBox.y, screenshotBox.w, screenshotBox.h
    );
    context.save();
    drawRoundedClip(context, screenshotBox.x, screenshotBox.y, screenshotBox.w, screenshotBox.h, screenshotBox.r);
    context.clip();
    context.drawImage(screenshotImage, target.x, target.y, target.w, target.h);
    context.restore();
  } else {
    const screenshotBox = preset.screenshotBox;
    context.save();
    context.fillStyle = "#eef2f7";
    drawRoundedClip(context, screenshotBox.x, screenshotBox.y, screenshotBox.w, screenshotBox.h, screenshotBox.r);
    context.fill();
    context.fillStyle = "#9aa3af";
    context.font = "600 28px SF Pro Display, PingFang SC, sans-serif";
    context.fillText("上传截图", preset.placeholder.x, preset.placeholder.y);
    context.restore();
  }

  const scheme = gradients[gradientSelect.value] || gradients.cool;
  const titleGradient = context.createLinearGradient(
    preset.title.x,
    preset.title.y,
    preset.title.x + 238,
    preset.title.y + 122
  );
  titleGradient.addColorStop(0, scheme[0]);
  titleGradient.addColorStop(0.34, scheme[1]);
  titleGradient.addColorStop(0.68, scheme[2]);
  titleGradient.addColorStop(1, scheme[3]);

  const title = (titleInput.value || "总览").trim();
  const subtitle = (subtitleInput.value || "").trim();

  context.textAlign = "left";
  context.textBaseline = "top";
  context.fillStyle = titleGradient;
  context.font = `700 ${preset.title.fontSize}px SF Pro Display, PingFang SC, sans-serif`;
  context.fillText(title, preset.title.x, preset.title.y);

  context.fillStyle = "#6e6e73";
  context.font = `400 ${preset.subtitle.fontSize}px SF Pro Display, PingFang SC, sans-serif`;
  wrapText(
    context,
    subtitle,
    preset.subtitle.x,
    preset.subtitle.y,
    preset.subtitle.maxWidth,
    preset.subtitle.lineHeight
  );
  context.restore();
}

function render() {
  const preset = getCurrentPreset();
  updatePreviewCanvasSize(preset);
  applyDrawingQuality(ctx);
  drawPoster(ctx, preset, 1);
  savePersistedState();
}

function setImageFileName(name) {
  persistedImageName = name || "";
  if (persistedImageName) {
    imageFileName.textContent = persistedImageName;
    return;
  }
  imageFileName.textContent = emptyFileName;
}

function setScreenshotImage(dataUrl, fileName = "") {
  const img = new Image();
  img.onload = () => {
    screenshotImage = img;
    setImageFileName(fileName);
    render();
  };
  img.src = dataUrl;
}

function readImage(file) {
  const reader = new FileReader();
  reader.onload = () => {
    setScreenshotImage(reader.result, file.name);
  };
  reader.readAsDataURL(file);
}

imageInput.addEventListener("change", (event) => {
  const [file] = event.target.files || [];
  if (file) {
    readImage(file);
  } else {
    screenshotImage = null;
    setImageFileName("");
    render();
  }
});

[titleInput, subtitleInput, gradientSelect, sizeSelect].forEach((el) => {
  el.addEventListener("input", render);
  el.addEventListener("change", render);
});

sizeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    sizeSelect.value = button.dataset.size;
    syncSizeButtons();
    render();
  });
});

schemeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    gradientSelect.value = button.dataset.scheme;
    syncSchemeButtons();
    render();
  });
});

bgInput.addEventListener("input", () => {
  bgHexInput.value = bgInput.value;
  render();
});

bgHexInput.addEventListener("input", render);

backgroundButtons.forEach((button) => {
  if (button === pickColorBtn) return;
  button.addEventListener("click", () => {
    bgHexInput.value = button.dataset.bg;
    render();
  });
});

pickColorBtn.addEventListener("click", () => {
  openColorModal();
});

modalBgButtons.forEach((button) => {
  button.addEventListener("click", () => {
    updateModalPreview(button.dataset.modalBg);
  });
});

if (modalHexInput) {
  modalHexInput.addEventListener("input", () => {
    const color = normalizeHex(modalHexInput.value);
    if (color) updateModalPreview(color);
  });
}

closeColorModalBtn.addEventListener("click", closeColorModal);

colorModal.addEventListener("click", (event) => {
  if (event.target.dataset.closeModal === "true") {
    closeColorModal();
  }
});

modalEyedropperBtn.addEventListener("click", async () => {
  if (!("EyeDropper" in window)) {
    if (typeof bgInput.showPicker === "function") {
      bgInput.showPicker();
    } else {
      bgInput.click();
    }
    return;
  }

  try {
    const eyeDropper = new EyeDropper();
    const result = await eyeDropper.open();
    if (result && result.sRGBHex) {
      updateModalPreview(result.sRGBHex.toLowerCase());
    }
  } catch (error) {
    // User cancel is expected.
  }
});

applyColorBtn.addEventListener("click", () => {
  bgHexInput.value = modalBackgroundColor;
  bgInput.value = modalBackgroundColor;
  closeColorModal();
  render();
});

downloadBtn.addEventListener("click", () => {
  const preset = getCurrentPreset();
  const exportCanvas = document.createElement("canvas");
  const exportWidth = preset.width * EXPORT_SCALE;
  const exportHeight = preset.height * EXPORT_SCALE;
  exportCanvas.width = exportWidth;
  exportCanvas.height = exportHeight;

  const exportCtx = exportCanvas.getContext("2d");
  if (!exportCtx) return;
  applyDrawingQuality(exportCtx);
  drawPoster(exportCtx, preset, EXPORT_SCALE);

  const link = document.createElement("a");
  link.download = `debuginn-wx-xhs-poster-${exportWidth}x${exportHeight}.png`;

  if (exportCanvas.toBlob) {
    exportCanvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 3000);
    }, "image/png");
    return;
  }

  link.href = exportCanvas.toDataURL("image/png");
  link.click();
});

const savedState = loadPersistedState();

if (savedState) {
  titleInput.value = savedState.title || titleInput.value;
  subtitleInput.value = savedState.subtitle || subtitleInput.value;
  gradientSelect.value = savedState.gradient || gradientSelect.value;
  sizeSelect.value = savedState.size || sizeSelect.value;
  bgHexInput.value = normalizeHex(savedState.background || "") || bgHexInput.value;
  bgInput.value = bgHexInput.value;
  persistedImageName = savedState.imageName || "";
}

syncSizeButtons();
syncSchemeButtons();
render();

if (savedState?.imageData) {
  setScreenshotImage(savedState.imageData, savedState.imageName || "");
}
})();
