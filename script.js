const tabs = document.querySelectorAll(".tab");
const posts = document.querySelectorAll(".post-card");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const filter = tab.dataset.filter;

    tabs.forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");

    posts.forEach((post) => {
      const shouldShow = filter === "all" || post.dataset.category === filter;
      post.classList.toggle("is-hidden", !shouldShow);
    });
  });
});

const canvas = document.getElementById("performanceChart");
const ctx = canvas.getContext("2d");
const points = [1000000, 1000000, 1000000, 1000000, 1000000, 1000000];

function formatYen(value) {
  return `¥${Math.round(value).toLocaleString("ja-JP")}`;
}

function drawChart() {
  const width = canvas.width;
  const height = canvas.height;
  const padding = 34;
  const min = Math.min(...points) - 50000;
  const max = Math.max(...points) + 50000;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#fffdf4";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(23, 20, 15, 0.12)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i += 1) {
    const y = padding + ((height - padding * 2) / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
  }

  const coords = points.map((value, index) => {
    const x = padding + ((width - padding * 2) / (points.length - 1)) * index;
    const y = height - padding - ((value - min) / (max - min)) * (height - padding * 2);
    return { x, y };
  });

  ctx.beginPath();
  coords.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.lineTo(width - padding, height - padding);
  ctx.lineTo(padding, height - padding);
  ctx.closePath();
  const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
  gradient.addColorStop(0, "rgba(239, 59, 50, 0.32)");
  gradient.addColorStop(1, "rgba(255, 217, 40, 0.02)");
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.beginPath();
  coords.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.strokeStyle = "#ef3b32";
  ctx.lineWidth = 7;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.stroke();

  coords.forEach((point, index) => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, index === coords.length - 1 ? 9 : 6, 0, Math.PI * 2);
    ctx.fillStyle = index === coords.length - 1 ? "#1463ff" : "#ffd928";
    ctx.fill();
    ctx.strokeStyle = "#17140f";
    ctx.lineWidth = 3;
    ctx.stroke();
  });

  ctx.fillStyle = "#17140f";
  ctx.font = "700 20px system-ui, sans-serif";
  ctx.fillText("100万円チャレンジ", padding, 34);
  ctx.font = "900 34px system-ui, sans-serif";
  ctx.fillText(formatYen(points[points.length - 1]), padding, 76);
}

drawChart();
