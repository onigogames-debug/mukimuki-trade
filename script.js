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
const fallbackPerformance = {
  startCapitalJpy: 1000000,
  generatedAtDisplay: "2026.05.30 05:00:58 JST",
  latest: {
    reportDateDisplay: "2026.05.29 EST",
    label: "5/29",
    jpy: { start: 1103506.27, end: 1124014.05, delta: 20507.78 },
    usd: { start: 6928.29, end: 7057.62, delta: 129.3269 },
    summary: {
      totalTrades: 152,
      totalBuyUsd: 23763.39,
      totalSellUsd: 23799.32,
      totalPnlJpy: 124014.05,
      totalReturnPct: 12.4,
      dailyReturnPct: 1.86,
    },
    positions: [
      { symbol: "US.SPIR", shares: 93 },
      { symbol: "US.SOUN", shares: 3 },
      { symbol: "US.SOFI", shares: 2 },
      { symbol: "US.SATS", shares: 8 },
      { symbol: "US.RIVN", shares: 31 },
      { symbol: "US.QBTS", shares: 3 },
      { symbol: "US.GSAT", shares: 25 },
      { symbol: "US.AMZN", shares: 4 },
    ],
  },
  history: [
    { label: "5/15", jpyEnd: 1073384.39 },
    { label: "5/18", jpyEnd: 1027479.25 },
    { label: "5/19", jpyEnd: 1026949.5 },
    { label: "5/20", jpyEnd: 1026483.73 },
    { label: "5/21", jpyEnd: 1041901.98 },
    { label: "5/22", jpyEnd: 1059394.13 },
    { label: "5/23", jpyEnd: 1059670.2 },
    { label: "5/24", jpyEnd: 1059670.2 },
    { label: "5/25", jpyEnd: 1059166.12 },
    { label: "5/26", jpyEnd: 1030833.63 },
    { label: "5/27", jpyEnd: 1085692.74 },
    { label: "5/28", jpyEnd: 1100567.07 },
    { label: "5/29", jpyEnd: 1124014.05 },
  ],
};
let performanceState = fallbackPerformance;

function getEmbeddedPerformanceData() {
  // Pattern A: build-time inline JSON. This avoids a render-blocking data fetch for
  // the first view and is the best option for LCP on a static homepage.
  const element = document.getElementById("perf-data") || document.getElementById("performance-data");
  if (!element?.textContent) return null;
  try {
    return JSON.parse(element.textContent);
  } catch (error) {
    return null;
  }
}

function asNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

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

function formatUsd(value) {
  if (asNumber(value) === null) return "$0.00";
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatSignedPercent(value, digits = 1) {
  if (asNumber(value) === null) return "0.0%";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}%`;
}

function setPerformanceText(key, value, polarity = null) {
  document.querySelectorAll(`[data-performance="${key}"]`).forEach((element) => {
    element.textContent = value;
    if (polarity) {
      element.classList.toggle("positive", polarity === "positive");
      element.classList.toggle("negative", polarity === "negative");
    }
  });
}

function positionsText(positions = []) {
  if (!positions.length) return "引け後保有なし";
  return positions.map((position) => `${position.symbol} ${position.shares}株`).join(" / ");
}

function getChartPoints(data) {
  const points = Array.isArray(data.history) ? data.history : [];
  const validPoints = points.map((point) => ({
    date: point.label || point.date,
    value: asNumber(point.jpyEnd ?? point.value),
  })).filter((point) => point.date && point.value !== null);

  if (validPoints.length >= 2) return validPoints.slice(-12);
  return fallbackPerformance.history.map((point) => ({
    date: point.label,
    value: point.jpyEnd,
  }));
}

function updatePerformanceText(data) {
  const latest = data.latest || {};
  const summary = latest.summary || {};
  const jpy = latest.jpy || {};
  const usd = latest.usd || {};
  const reportDate = latest.reportDateDisplay || fallbackPerformance.latest.reportDateDisplay;
  const generatedAt = data.generatedAtDisplay || fallbackPerformance.generatedAtDisplay;
  const startCapital = asNumber(data.startCapitalJpy) ?? fallbackPerformance.startCapitalJpy;
  const latestJpy = asNumber(jpy.end) ?? fallbackPerformance.latest.jpy.end;
  const totalPnl = asNumber(summary.totalPnlJpy) ?? latestJpy - startCapital;
  const totalReturn = asNumber(summary.totalReturnPct) ?? (totalPnl / startCapital) * 100;
  const dailyPnl = asNumber(jpy.delta) ?? fallbackPerformance.latest.jpy.delta;
  const dailyReturn = asNumber(summary.dailyReturnPct) ?? fallbackPerformance.latest.summary.dailyReturnPct;
  const polarity = (value) => (value >= 0 ? "positive" : "negative");

  setPerformanceText("report-date", reportDate);
  setPerformanceText("generated-at", generatedAt);
  setPerformanceText("dashboard-updated", `最新データ: ${reportDate} / 更新: ${generatedAt}`);
  setPerformanceText("latest-jpy", formatYen(latestJpy));
  setPerformanceText("total-pnl", formatSignedYen(totalPnl), polarity(totalPnl));
  setPerformanceText("daily-pnl", formatSignedYen(dailyPnl), polarity(dailyPnl));
  setPerformanceText("total-return", formatSignedPercent(totalReturn));
  setPerformanceText("total-return-label", `100万円比 ${formatSignedPercent(totalReturn)}`);
  setPerformanceText("daily-return", `日次 ${formatSignedPercent(dailyReturn)}`);
  setPerformanceText("trade-count", `約定${summary.totalTrades ?? fallbackPerformance.latest.summary.totalTrades}件`);
  setPerformanceText("jpy-range", `${formatYen(jpy.start ?? fallbackPerformance.latest.jpy.start)} → ${formatYen(latestJpy)}`);
  setPerformanceText("usd-range", `${formatUsd(usd.start ?? fallbackPerformance.latest.usd.start)} → ${formatUsd(usd.end ?? fallbackPerformance.latest.usd.end)}`);
  setPerformanceText("trade-flow", `買付 ${formatUsd(summary.totalBuyUsd ?? fallbackPerformance.latest.summary.totalBuyUsd)} / 売却 ${formatUsd(summary.totalSellUsd ?? fallbackPerformance.latest.summary.totalSellUsd)}`);
  setPerformanceText("positions", positionsText(latest.positions || fallbackPerformance.latest.positions));
  setPerformanceText("hero-summary", `今の状態: 100万円比 ${formatSignedPercent(totalReturn)}。約定${summary.totalTrades ?? 0}件、引け後保有は${positionsText(latest.positions || fallbackPerformance.latest.positions)}。`);
  setPerformanceText("latest-title", `${latest.label || fallbackPerformance.latest.label}の実績: 100万円比 ${formatSignedPercent(totalReturn)}`);
}

function drawChart(data = performanceState) {
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const points = getChartPoints(data);
  const values = points.map((point) => point.value);
  const startCapital = asNumber(data.startCapitalJpy) ?? fallbackPerformance.startCapitalJpy;
  const latest = asNumber(data.latest?.jpy?.end) ?? values[values.length - 1];
  const totalPnl = latest - startCapital;
  const totalPnlPercent = (totalPnl / startCapital) * 100;
  const lastUpdated = data.latest?.reportDateDisplay || fallbackPerformance.latest.reportDateDisplay;
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
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = "#17140f";
  ctx.font = "700 18px system-ui, sans-serif";
  ctx.fillText(`資産推移 / ${lastUpdated}`, padding.left, 30);
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
  ctx.fillText("スタート ¥1,000,000", padding.left + 8, baselineY - 12);

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
  ctx.fillText(points[points.length - 1].date, latestPoint.x - 12, latestPoint.y - 12);
}

async function loadPerformanceData() {
  const embeddedPerformance = getEmbeddedPerformanceData();
  if (embeddedPerformance) {
    performanceState = embeddedPerformance;
  } else {
    try {
      // Pattern B: cache-first Service Worker path. This is useful on repeat visits,
      // but the first visit still waits for network, so it is weaker for LCP than A.
      const response = await fetch("/datasets/performance-latest.json", { cache: "force-cache" });
      if (!response.ok) throw new Error(`Performance data returned ${response.status}`);
      performanceState = await response.json();
    } catch (error) {
      performanceState = fallbackPerformance;
    }
  }

  updatePerformanceText(performanceState);
  window.requestAnimationFrame(() => drawChart(performanceState));
}

drawChart(fallbackPerformance);
loadPerformanceData();
