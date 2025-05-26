// JavaScript logic for Image Map Generator with 핫스팟 왼쪽위 외부에 버튼 배치

const preview = document.getElementById("preview");
const container = document.getElementById("image-container");
const testBtn = document.getElementById("test-button");
const codeOptions = document.getElementById("code-options");
let imageWidth = 1080, imageHeight = 6503;
let hotspotIndex = 0;
let resizingElement = null;
let currentResizeButton = null;
let isResizeModePersistent = false;
let isZoomOutMode = false;

const colors = ["red", "blue", "green", "orange", "purple", "teal", "brown"];

document.getElementById("image-upload").addEventListener("change", (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = function (event) {
    preview.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

function loadImageFromURL() {
  const url = document.getElementById("image-url").value;
  if (url) preview.src = url;
}

function toggleZoomOut(zoomBtn) {
  isZoomOutMode = !isZoomOutMode;
  if (isZoomOutMode) {
    preview.style.maxHeight = "80vh";
    preview.style.objectFit = "contain";
    zoomBtn.style.background = "#c4f4c4";
  } else {
    preview.style.maxHeight = "unset";
    preview.style.objectFit = "unset";
    zoomBtn.style.background = "";
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

  const controls = document.createElement("div");
  controls.className = "controls";
  controls.style.position = "absolute";
  controls.style.left = "-80px";
  controls.style.top = "-32px";
  controls.style.zIndex = "10";
  controls.style.display = "flex";
  controls.style.gap = "4px";

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

  const zoomBtn = document.createElement("button");
  zoomBtn.innerText = "🔍";
  zoomBtn.onclick = () => toggleZoomOut(zoomBtn);

  const deleteBtn = document.createElement("button");
  deleteBtn.innerText = "❌";
  deleteBtn.onclick = () => {
    div.remove();
    controls.remove();
  };

  controls.appendChild(editBtn);
  controls.appendChild(resizeBtn);
  controls.appendChild(zoomBtn);
  controls.appendChild(deleteBtn);
  container.appendChild(div);
  container.appendChild(controls);

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
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left - startX) / rect.width) * 100;
      const y = ((e.clientY - rect.top - startY) / rect.height) * 100;
      el.style.left = `${x}%`;
      el.style.top = `${y}%`;
      controls.style.left = `calc(${el.style.left} - 80px)`;
      controls.style.top = `calc(${el.style.top} - 32px)`;
    }
    if (resizingElement && e.buttons === 1) {
      const rect = container.getBoundingClientRect();
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
  const code = document.getElementById("code-output").value;
  win.document.write(`<html><body>${code}</body></html>`);
  win.document.close();
}
