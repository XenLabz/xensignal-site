async function loadJson(path) {
  const response = await fetch(path + "?t=" + Date.now(), { cache: "no-store" });
  if (!response.ok) throw new Error(`Failed to load ${path}: ${response.status}`);
  return response.json();
}

function pct(value, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "-";
  return `${(Number(value) * 100).toFixed(digits)}%`;
}

function num(value, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "-";
  return Number(value).toFixed(digits);
}

function money(value, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "-";
  const n = Number(value);
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(digits)}`;
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function firstAvailable(...values) {
  return values.find(v => v !== undefined && v !== null);
}

function safeRatio(numerator, denominator) {
  const n = Number(numerator);
  const d = Number(denominator);
  if (!Number.isFinite(n) || !Number.isFinite(d) || d === 0) return null;
  return n / d;
}

function buildStatusNotes(status) {
  const visual = status.visual || {};
  const lifetime = status.lifetime || {};
  const guard = status.guard || {};
  const health = status.health || {};

  return [
    `Experiment: ${firstAvailable(status.experiment, "unknown")}`,
    `Post-reset: ${firstAvailable(visual.rows, 0)} rows, ${firstAvailable(visual.closed, 0)} closed, ${money(firstAvailable(visual.pnl, 0))} simulated P/L`,
    `Lifetime: ${firstAvailable(lifetime.rows, 0)} rows, ${money(firstAvailable(lifetime.pnl, 0))} simulated P/L`,
    `Circuit breaker: ${guard.circuit_active === true ? "ACTIVE" : "clear"}`,
    `Ultra-strict mode: ${guard.ultra_strict === true ? "active" : "off"}`,
    `Guarded stream: ${firstAvailable(guard.guarded_after, "-")} kept / ${firstAvailable(guard.guarded_before, "-")} seen / ${firstAvailable(guard.dropped, 0)} dropped`,
    `Health: trades age ${firstAvailable(health.trades_age_seconds, "-")}s, guarded age ${firstAvailable(health.guarded_age_seconds, "-")}s, raw age ${firstAvailable(health.raw_age_seconds, "-")}s`,
    "Public dashboard is a delayed, sanitized research export. No live execution is hosted here."
  ];
}

function applyStatusExport(status) {
  const visual = status.visual || {};
  const lifetime = status.lifetime || {};
  const guard = status.guard || {};

  const visualWinRate = firstAvailable(visual.win_rate, safeRatio(visual.wins, visual.closed));
  const avgPnl = firstAvailable(visual.avg_pnl, safeRatio(visual.pnl, visual.closed), 0);

  setText("loadedAt", firstAvailable(status.generated_at_utc, status.published_at_utc, new Date().toLocaleString()));
  setText("metricN", firstAvailable(visual.rows, 0));
  setText("metricWins", firstAvailable(visual.wins, 0));
  setText("metricLosses", firstAvailable(visual.losses, 0));
  setText("metricWinRate", visual.closed > 0 ? pct(visualWinRate) : "n/a");
  setText("metricAvgNet", num(avgPnl, 3));
  setText("metricTotalNet", money(firstAvailable(visual.pnl, 0), 2));

  const posture = guard.circuit_active === true
    ? "CIRCUIT BREAKER ACTIVE"
    : guard.ultra_strict === true
      ? "EXP006-F ULTRA STRICT"
      : firstAvailable(status.experiment, "EXP006-F");

  setText("profile", posture);
  setText("deploymentMode", "shadow_research_only");
  setText("engineMayConsume", "false");
  setText("shadowOnly", "true");

  const notes = document.getElementById("notes");
  if (notes) {
    notes.innerHTML = "";
    for (const item of buildStatusNotes(status)) {
      const li = document.createElement("li");
      li.textContent = item;
      notes.appendChild(li);
    }
  }

  const rawButtons = document.querySelectorAll('a[href="reports/latest-shadow-summary.json"]');
  rawButtons.forEach(link => {
    link.href = "reports/xensignal-status.json";
    if (link.textContent.trim().toLowerCase().includes("raw")) link.textContent = "Status JSON";
  });
}

function applyLegacyExports(summary, optimizer) {
  const all = summary.all || summary.summary || summary;

  setText("metricN", firstAvailable(all.n, all.count, "-"));
  setText("metricWins", firstAvailable(all.wins, "-"));
  setText("metricLosses", firstAvailable(all.losses, "-"));
  setText("metricWinRate", pct(firstAvailable(all.win_rate, all.winRate)));
  setText("metricAvgNet", num(firstAvailable(all.avg_net, all.avgNet), 3));
  setText("metricTotalNet", num(firstAvailable(all.total_net, all.totalNet, all.total), 2));

  setText("profile", firstAvailable(optimizer.profile, optimizer.recommended_profile, "STRICT_DEFENSIVE_FILTER"));
  setText("deploymentMode", firstAvailable(optimizer.deployment_mode, "paper_watch_only"));
  setText("engineMayConsume", String(firstAvailable(optimizer.engine_may_consume, false)));
  setText("shadowOnly", String(firstAvailable(optimizer.shadow_only, true)));

  const notes = document.getElementById("notes");
  const noteItems = [
    `Summary generated: ${firstAvailable(summary.generated_at_utc, summary.generated_at, "unknown")}`,
    `Optimizer generated: ${firstAvailable(optimizer.generated_at_utc, optimizer.generated_at, "unknown")}`,
    `Current posture: ${firstAvailable(optimizer.deployment_mode, "paper_watch_only")}`,
    "Live execution is not hosted from this cPanel site."
  ];

  if (notes) {
    notes.innerHTML = "";
    for (const item of noteItems) {
      const li = document.createElement("li");
      li.textContent = item;
      notes.appendChild(li);
    }
  }
}

async function main() {
  setText("year", new Date().getFullYear());
  setText("loadedAt", new Date().toLocaleString());

  try {
    const status = await loadJson("reports/xensignal-status.json");
    applyStatusExport(status);
    return;
  } catch (statusError) {
    console.warn("Falling back to legacy dashboard exports:", statusError);
  }

  try {
    const [summary, optimizer] = await Promise.all([
      loadJson("reports/latest-shadow-summary.json"),
      loadJson("reports/latest-optimizer-state.json")
    ]);
    applyLegacyExports(summary, optimizer);
  } catch (error) {
    console.error(error);
    const notes = document.getElementById("notes");
    if (notes) {
      notes.innerHTML = "<li>Could not load report files. Check /reports filenames and JSON validity.</li>";
    }
  }
}

main();