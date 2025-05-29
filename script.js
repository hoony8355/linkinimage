// Linkin Image JS – 확대/축소 기능 제거, 코드 생성 정확도 향상

const preview = document.getElementById("preview");
const imageWrapper = document.getElementById("image-wrapper");
const container = document.getElementById("image-container");
const testBtn = document.getElementById("test-button");
const codeOptions = document.getElementById("code-options");

let imageWidth = 1080, imageHeight = 6503;
let hotspotIndex = 0;
let resizingElement = null;
let currentResizeButton = null;
let isResizeModePersistent = false;

const colors = ["red", "blue", "green", "orange", "purple", "teal", "brown"];

const imageUpload = document.getElementById("image-upload");
if (imageUpload) {
  imageUpload.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        preview.onload = () => {
          imageWidth = preview.naturalWidth;
          imageHeight = preview.naturalHeight;
        };
        preview.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  });
}

function loadImageFromURL() {
  const url = document.getElementById("image-url").value.trim();
  if (url) {
    preview.crossOrigin = "anonymous";
    preview.onload = () => {
      imageWidth = preview.naturalWidth;
      imageHeight = preview.naturalHeight;
    };
    preview.src = url;
  }
}

function addHotspot() {
  const href = prompt("링크 주소를 입력하세요:") || "#";
  const title = prompt("링크 타이틀을 입력하세요:") || "";
  const div = document.createElement("div");
  div.className = "hotspot";

  const color = colors[hotspotIndex % colors.length];
  hotspotIndex++;

  div.style.left = "10%";
  div.style.top = "10%";
  div.style.width = "20%";
  div.style.height = "5%";
  div.style.borderColor = color;
  div.style.backgroundColor = `rgba(${getRGB(color)}, 0.2)`;

  div.setAttribute("data-href", href);
  div.setAttribute("data-title", title);

  const label = document.createElement("span");
  label.innerText = `${title} (${href})`;
  div.appendChild(label);

  imageWrapper.appendChild(div);

  const controls = document.createElement("div");
  controls.className = "controls";
  controls.style.left = `${div.offsetLeft}px`;
  controls.style.top = `${div.offsetTop - 36}px`;

  const editBtn = document.createElement("button");
  editBtn.innerText = "✏️";
  editBtn.onclick = () => {
    const newHref = prompt("새 링크 주소:", div.getAttribute("data-href")) || "#";
    const newTitle = prompt("새 타이틀:", div.getAttribute("data-title")) || "";
    div.setAttribute("data-href", newHref);
    div.setAttribute("data-title", newTitle);
    label.innerText = `${newTitle} (${newHref})`;
  };

  const resizeBtn = document.createElement("button");
  resizeBtn.innerText = "📐";
  resizeBtn.onclick = () => {
    if (resizingElement === div && isResizeModePersistent) {
      div.classList.remove("resizing");
      resizeBtn.style.background = "";
      resizingElement = null;
      currentResizeButton = null;
      isResizeModePersistent = false;
    } else {
      if (resizingElement) {
        resizingElement.classList.remove("resizing");
        if (currentResizeButton) currentResizeButton.style.background = "";
      }
      resizingElement = div;
      currentResizeButton = resizeBtn;
      isResizeModePersistent = true;
      div.classList.add("resizing");
      resizeBtn.style.background = "#c4f4c4";
    }
  };

  const deleteBtn = document.createElement("button");
  deleteBtn.innerText = "❌";
  deleteBtn.onclick = () => {
    div.remove();
    controls.remove();
  };

  controls.appendChild(editBtn);
  controls.appendChild(resizeBtn);
  controls.appendChild(deleteBtn);
  imageWrapper.appendChild(controls);

  makeDraggable(div, controls);

  setTimeout(() => {
    div.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 100);
}

function getRGB(colorName) {
  const colors = {
    red: "255,0,0",
    blue: "0,0,255",
    green: "0,128,0",
    orange: "255,165,0",
    purple: "128,0,128",
    teal: "0,128,128",
    brown: "165,42,42"
  };
  return colors[colorName] || "0,0,0";
}

function makeDraggable(el, controls) {
  let isDragging = false, startX, startY;
  el.addEventListener("mousedown", function (e) {
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'SPAN') return;
    if (resizingElement === el) return;
    isDragging = true;
    startX = e.offsetX;
    startY = e.offsetY;
  });
  document.addEventListener("mousemove", function (e) {
    if (isDragging) {
      const rect = imageWrapper.getBoundingClientRect();
      const x = ((e.clientX - rect.left - startX) / rect.width) * 100;
      const y = ((e.clientY - rect.top - startY) / rect.height) * 100;
      el.style.left = `${x}%`;
      el.style.top = `${y}%`;
      controls.style.left = `${el.offsetLeft}px`;
      controls.style.top = `${el.offsetTop - 36}px`;
    }
    if (resizingElement && e.buttons === 1) {
      const rect = imageWrapper.getBoundingClientRect();
      const right = ((e.clientX - rect.left) / rect.width) * 100;
      const bottom = ((e.clientY - rect.top) / rect.height) * 100;
      const left = parseFloat(resizingElement.style.left);
      const top = parseFloat(resizingElement.style.top);
      resizingElement.style.width = `${Math.max(right - left, 1)}%`;
      resizingElement.style.height = `${Math.max(bottom - top, 1)}%`;
    }
  });
  document.addEventListener("mouseup", () => {
    isDragging = false;
    if (!isResizeModePersistent && resizingElement) {
      resizingElement.classList.remove("resizing");
      if (currentResizeButton) currentResizeButton.style.background = "";
      resizingElement = null;
      currentResizeButton = null;
    }
  });
}

function generateCode() {
  const codeType = document.querySelector('input[name="code-type"]:checked').value;
  let output = "";

  if (codeType === "css") {
    output += `<div style=\"position: relative; max-width: ${imageWidth}px; margin: auto;\">\n`;
    output += `  <img src=\"${preview.src}\" style=\"width: 100%; display: block;\" alt=\"포스터\" />\n\n`;
    document.querySelectorAll(".hotspot").forEach((el) => {
      const href = el.getAttribute("data-href") || "#";
      const title = el.getAttribute("data-title") || "";
      output += `  <a href=\"${href}\" target=\"_blank\" title=\"${title}\" style=\"position: absolute; left: ${el.style.left}; top: ${el.style.top}; width: ${el.style.width}; height: ${el.style.height}; display: block;\"></a>\n`;
    });
    output += `</div>`;
  } else {
    output += `<img src=\"${preview.src}\" usemap=\"#image-map\" style=\"width: 100%;\">\n<map name=\"image-map\">\n`;
    document.querySelectorAll(".hotspot").forEach((el) => {
      const href = el.getAttribute("data-href") || "#";
      const title = el.getAttribute("data-title") || "";
      const x = parseFloat(el.style.left) / 100 * imageWidth;
      const y = parseFloat(el.style.top) / 100 * imageHeight;
      const w = parseFloat(el.style.width) / 100 * imageWidth;
      const h = parseFloat(el.style.height) / 100 * imageHeight;
      output += `  <area shape=\"rect\" coords=\"${Math.round(x)},${Math.round(y)},${Math.round(x+w)},${Math.round(y+h)}\" href=\"${href}\" alt=\"${title}\" title=\"${title}\" />\n`;
    });
    output += `</map>`;
  }

  document.getElementById("code-output").value = output;
  codeOptions.style.display = "block";
  testBtn.disabled = false;
}

function testGeneratedCode() {
  const win = window.open();
  const codeType = document.querySelector('input[name="code-type"]:checked').value;
  const code = document.getElementById("code-output").value;

  if (codeType === "html") {
    // 원본 이미지 크기로 고정
    const fixedCode = code.replace(
      /<img([^>]+)style="[^"]*"/,
      `<img$1width="${imageWidth}" height="${imageHeight}"`
    );
    win.document.write(`<html><body>${fixedCode}</body></html>`);
  } else {
    win.document.write(`<html><body>${code}</body></html>`);
  }

  win.document.close();
}

