const CLIENT_ID = '82e27b7d2fe5c86';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const imageInput = document.getElementById('imageInput');
const preview = document.getElementById('preview');
const output = document.getElementById('output');
const uploadBtn = document.getElementById('uploadBtn');
const testBtn = document.getElementById('testBtn');
const testArea = document.getElementById('testArea');
const log = document.getElementById('log');

function logMessage(msg) {
  console.log(msg);
  log.textContent += `\n${msg}`;
  log.scrollTop = log.scrollHeight;
}

let img = new Image();
let splitY = [0];
let segments = [];

imageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      splitY = [0, img.height];
      segments = [];
      preview.innerHTML = '';
      logMessage(`이미지 로드 완료: ${img.width}x${img.height}`);
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const y = Math.round((e.clientY - rect.top) * (canvas.height / rect.height));
  if (!splitY.includes(y)) {
    splitY.push(y);
    splitY = splitY.filter(v => v >= 0 && v <= img.height);
    splitY = [...new Set(splitY)].sort((a, b) => a - b);
    renderLines();
    updateSegments();
    logMessage(`분할선 추가: y = ${y}`);
  }
});

function renderLines() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 2;
  splitY.forEach((y) => {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  });
}

function updateSegments() {
  preview.innerHTML = '';
  segments = [];
  for (let i = 0; i < splitY.length - 1; i++) {
    const top = splitY[i];
    const bottom = splitY[i + 1];
    const h = bottom - top;

    const segmentCanvas = document.createElement('canvas');
    segmentCanvas.width = canvas.width;
    segmentCanvas.height = h;
    const segmentCtx = segmentCanvas.getContext('2d');
    segmentCtx.drawImage(img, 0, top, canvas.width, h, 0, 0, canvas.width, h);

    const base64 = segmentCanvas.toDataURL("image/png").replace(/^data:image\/png;base64,/, "");
    segments.push({ base64, link: '', alt: '', isLink: false, url: '' });

    const div = document.createElement('div');
    div.className = 'preview-item';
    div.innerHTML = `
      <img src="data:image/png;base64,${segments[i].base64}" width="100%" /><br />
      <label>alt: <input type="text" class="alt-input" data-index="${i}" /></label><br />
      <label><input type="checkbox" class="link-toggle" data-index="${i}" /> 링크 걸기</label><br />
      <input type="text" class="link-input" data-index="${i}" style="width: 100%; display: none;" placeholder="https://example.com" />
    `;
    preview.appendChild(div);
  }
  logMessage(`총 ${segments.length}개 조각 생성됨.`);
}

preview.addEventListener('input', (e) => {
  const index = e.target.dataset.index;
  if (e.target.classList.contains('alt-input')) {
    segments[index].alt = e.target.value;
  } else if (e.target.classList.contains('link-input')) {
    segments[index].link = e.target.value;
  }
});

preview.addEventListener('change', (e) => {
  const index = e.target.dataset.index;
  if (e.target.classList.contains('link-toggle')) {
    const checked = e.target.checked;
    segments[index].isLink = checked;
    const linkInput = preview.querySelector(`.link-input[data-index='${index}']`);
    if (linkInput) linkInput.style.display = checked ? 'block' : 'none';
  }
});

async function uploadToImgur(base64, index) {
  logMessage(`(${index + 1}) Imgur 업로드 시작...`);
  const response = await fetch("https://api.imgur.com/3/image", {
    method: "POST",
    headers: {
      Authorization: `Client-ID ${CLIENT_ID}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ image: base64 })
  });
  const data = await response.json();
  if (data.success) {
    logMessage(`(${index + 1}) 업로드 완료: ${data.data.link}`);
    return data.data.link;
  } else {
    logMessage(`(${index + 1}) 업로드 실패: ${JSON.stringify(data)}`);
    throw new Error("Imgur upload failed");
  }
}

uploadBtn.addEventListener('click', async () => {
  output.value = '이미지를 Imgur에 업로드 중입니다...';
  testBtn.disabled = true;
  testArea.innerHTML = '';

  try {
    for (let i = 0; i < segments.length; i++) {
      segments[i].url = await uploadToImgur(segments[i].base64, i);
    }

    const rows = segments.map(seg => {
      const imgTag = `<img src="${seg.url}" width="100%" alt="${seg.alt}" style="display: block; border: 0;">`;
      const content = seg.isLink ? `<a href="${seg.link}" target="_blank" style="display: block;">${imgTag}</a>` : imgTag;
      return `<tr><td style="padding: 0; line-height: 0;">${content}</td></tr>`;
    }).join('\n');

    const html = `<table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 1080px; margin: 0 auto; border-collapse: collapse;">\n${rows}\n</table>`;
    output.value = html;
    testBtn.disabled = false;
    logMessage("✅ HTML 코드 생성 완료");
  } catch (err) {
    logMessage("❌ 오류 발생: " + err.message);
  }
});

testBtn.addEventListener('click', () => {
  const code = output.value;
  testArea.innerHTML = code;
  logMessage("🔍 테스트 렌더링 완료");
});
