async function loadJson(path) {
  const response = await fetch(path + "?t=" + Date.now(), { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.status}`);
  }
  return response.json();
}

function pct(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "-";
  return `${(Number(value) * 100).toFixed(2)}%`;
}

function num(value, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "-";
  return Number(value).toFixed(digits);
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function firstAvailable(...values) {
  return values.find(v => v !== undefined && v !== null);
}

async function main() {
  setText("year", new Date().getFullYear());
  setText("loadedAt", new Date().toLocaleString());

  try {
    const [summary, optimizer] = await Promise.all([
      loadJson("reports/latest-shadow-summary.json"),
      loadJson("reports/latest-optimizer-state.json")
    ]);

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

    const params = firstAvailable(
      optimizer.recommended_params,
      optimizer.recommendations,
      optimizer.params,
      {}
    );
    setText("recommendedParams", JSON.stringify(params, null, 2));

    const notes = document.getElementById("notes");
    const noteItems = [
      `Summary generated: ${firstAvailable(summary.generated_at_utc, summary.generated_at, "unknown")}`,
      `Optimizer generated: ${firstAvailable(optimizer.generated_at_utc, optimizer.generated_at, "unknown")}`,
      `Current posture: ${firstAvailable(optimizer.deployment_mode, "paper_watch_only")}`,
      "Live execution is not hosted from this cPanel site."
    ];

    notes.innerHTML = "";
    for (const item of noteItems) {
      const li = document.createElement("li");
      li.textContent = item;
      notes.appendChild(li);
    }

  } catch (error) {
    console.error(error);
    setText("recommendedParams", error.message);
    const notes = document.getElementById("notes");
    notes.innerHTML = "<li>Could not load one or more report files. Check /reports filenames and JSON validity.</li>";
  }
}

main();
