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
  { date: "5/15", value: 1073384.39 },
  { date: "5/18", value: 1027479.25 },
  { date: "5/19", value: 1026949.5 },
  { date: "5/20", value: 1026483.73 },
  { date: "5/21", value: 1041901.98 },
  { date: "5/22", value: 1059394.13 },
  { date: "5/23", value: 1059670.2 },
  { date: "5/24", value: 1059670.2 },
  { date: "5/25", value: 1059166.12 },
  { date: "5/26", value: 1030833.63 },
];
const lastUpdated = "2026.05.26 EST";
const startCapital = 1000000;

function formatYen(value) {
  return `¥${value.toLocaleString("ja-JP", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatAxisYen(value) {
  return `¥${Math.round(value).toLocaleString("ja-JP")}`;
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
  const values = points.map((point) => point.value);
  const latest = values[values.length - 1];
  const totalPnl = latest - startCapital;
  const totalPnlPercent = (totalPnl / startCapital) * 100;
  const padding = { top: 96, right: 34, bottom: 68, left: 98 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const rawMin = Math.min(...values, startCapital);
  const rawMax = Math.max(...values, startCapital);
  const min = Math.floor((rawMin - 15000) / 10000) * 10000;
  const max = Math.ceil((rawMax + 15000) / 10000) * 10000;
  const xFor = (index) => padding.left + (chartWidth / (points.length - 1)) * index;
  const yFor = (value) => padding.top + chartHeight - ((value - min) / (max - min)) * chartHeight;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#fffdf4";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#17140f";
  ctx.font = "700 18px system-ui, sans-serif";
  ctx.fillText(`100万円チャレンジ / ${lastUpdated}`, padding.left, 30);
  ctx.font = "900 30px system-ui, sans-serif";
  ctx.fillText(formatYen(latest), padding.left, 64);
  ctx.font = "700 16px system-ui, sans-serif";
  ctx.fillText(`通算損益 ${formatSignedYen(totalPnl)} / ${totalPnlPercent >= 0 ? "+" : ""}${totalPnlPercent.toFixed(1)}%`, padding.left, 88);

  ctx.strokeStyle = "rgba(23, 20, 15, 0.2)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top);
  ctx.lineTo(padding.left, padding.top + chartHeight);
  ctx.lineTo(width - padding.right, padding.top + chartHeight);
  ctx.stroke();

  ctx.strokeStyle = "rgba(23, 20, 15, 0.12)";
  ctx.fillStyle = "rgba(23, 20, 15, 0.72)";
  ctx.font = "700 12px system-ui, sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  const yTickCount = 5;
  for (let i = 0; i < yTickCount; i += 1) {
    const value = min + ((max - min) / (yTickCount - 1)) * i;
    const y = yFor(value);
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
    ctx.fillText(formatAxisYen(value), padding.left - 12, y);
  }

  const baselineY = yFor(startCapital);
  ctx.save();
  ctx.setLineDash([8, 7]);
  ctx.strokeStyle = "rgba(36, 88, 211, 0.45)";
  ctx.beginPath();
  ctx.moveTo(padding.left, baselineY);
  ctx.lineTo(width - padding.right, baselineY);
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = "#2458d3";
  ctx.textAlign = "left";
  ctx.fillText("開始 ¥1,000,000", padding.left + 8, baselineY - 12);

  ctx.fillStyle = "rgba(23, 20, 15, 0.72)";
  ctx.font = "700 12px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  points.forEach((point, index) => {
    const x = xFor(index);
    ctx.beginPath();
    ctx.moveTo(x, padding.top + chartHeight);
    ctx.lineTo(x, padding.top + chartHeight + 6);
    ctx.strokeStyle = "rgba(23, 20, 15, 0.24)";
    ctx.stroke();
    ctx.fillText(point.date, x, padding.top + chartHeight + 12);
  });

  ctx.save();
  ctx.fillStyle = "rgba(23, 20, 15, 0.76)";
  ctx.font = "800 13px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.translate(20, padding.top + chartHeight / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("金額（円）", 0, 0);
  ctx.restore();

  ctx.fillStyle = "rgba(23, 20, 15, 0.76)";
  ctx.font = "800 13px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("日付（EST）", padding.left + chartWidth / 2, height - 16);

  const coords = points.map((point, index) => ({
    x: xFor(index),
    y: yFor(point.value),
  }));

  ctx.beginPath();
  coords.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.lineTo(width - padding.right, padding.top + chartHeight);
  ctx.lineTo(padding.left, padding.top + chartHeight);
  ctx.closePath();
  const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
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

  const latestPoint = coords[coords.length - 1];
  ctx.fillStyle = "#17140f";
  ctx.font = "900 14px system-ui, sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.fillText("5/26", latestPoint.x - 12, latestPoint.y - 12);
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
