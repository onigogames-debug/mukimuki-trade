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
const points = [
  1073384.39,
  1027479.25,
  1026949.5,
  1026483.73,
  1041901.98,
  1059394.13,
  1059670.2,
  1059670.2,
  1059166.12,
  1030833.63,
];
const lastUpdated = "2026.05.26 EST";
const startCapital = 1000000;

function formatYen(value) {
  return `¥${value.toLocaleString("ja-JP", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatSignedYen(value) {
  const sign = value >= 0 ? "+" : "-";
  return `${sign}${formatYen(Math.abs(value))}`;
}

function drawChart() {
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const padding = 34;
  const min = Math.min(...points, startCapital) - 25000;
  const max = Math.max(...points, startCapital) + 25000;
  const latest = points[points.length - 1];
  const totalPnl = latest - startCapital;
  const totalPnlPercent = (totalPnl / startCapital) * 100;

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
  ctx.fillText(`100万円チャレンジ / ${lastUpdated}`, padding, 34);
  ctx.font = "900 34px system-ui, sans-serif";
  ctx.fillText(formatYen(latest), padding, 76);
  ctx.font = "700 18px system-ui, sans-serif";
  ctx.fillText(`通算損益 ${formatSignedYen(totalPnl)} / ${totalPnlPercent >= 0 ? "+" : ""}${totalPnlPercent.toFixed(1)}%`, padding, 108);
}

drawChart();

function refreshXWidget() {
  const embed = document.querySelector(".x-embed");
  if (!embed) return;

  const markLoaded = () => {
    const hasTimelineFrame = [...embed.querySelectorAll("iframe")].some((frame) =>
      frame.src.includes("twitter.com") || frame.src.includes("x.com"),
    );
    embed.classList.toggle("is-loaded", hasTimelineFrame);
  };

  if (window.twttr?.widgets?.load) {
    window.twttr.widgets.load(embed);
  }

  setTimeout(markLoaded, 2500);
  setTimeout(markLoaded, 6000);
}

window.addEventListener("load", refreshXWidget);
