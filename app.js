const baseClaimsRows = [
  { provider: "MediLife Hospital", county: "Nairobi", level: "LEVEL 5", ownership: "Private", scheme: "SHA", channel: "Portal", type: "Inpatient", submitted: 7284, approved: 5870, paid: 4921, rejected: 4506, review: 874 },
  { provider: "Lifecare Bungoma", county: "Bungoma", level: "LEVEL 5", ownership: "Private", scheme: "SHA", channel: "API", type: "Outpatient", submitted: 6918, approved: 4912, paid: 4385, rejected: 1284, review: 722 },
  { provider: "Eagle Health Clinic", county: "Nairobi", level: "LEVEL 4", ownership: "Public", scheme: "SHA", channel: "Portal", type: "Outpatient", submitted: 6254, approved: 4687, paid: 3902, rejected: 1044, review: 523 },
  { provider: "Consolata Hospital", county: "Nyeri", level: "LEVEL 5", ownership: "Faith Based", scheme: "Other Insurance", channel: "Portal", type: "Inpatient", submitted: 5866, approved: 4108, paid: 3518, rejected: 1060, review: 698 },
  { provider: "Outspan Hospital", county: "Nyeri", level: "LEVEL 5", ownership: "Private", scheme: "Cash", channel: "Manual Upload", type: "Outpatient", submitted: 5401, approved: 3977, paid: 3188, rejected: 876, review: 548 },
  { provider: "Mbagathi Hospital", county: "Nairobi", level: "LEVEL 4", ownership: "Public", scheme: "SHA", channel: "API", type: "Emergency", submitted: 5088, approved: 3842, paid: 3211, rejected: 690, review: 556 },
  { provider: "Moi Voi County Referral", county: "Taita Taveta", level: "LEVEL 4", ownership: "Public", scheme: "SHA", channel: "Portal", type: "Inpatient", submitted: 4954, approved: 3405, paid: 3006, rejected: 812, review: 737 },
  { provider: "Galaxy Hospital", county: "Isiolo", level: "LEVEL 5", ownership: "Private", scheme: "Other Insurance", channel: "Manual Upload", type: "Outpatient", submitted: 4802, approved: 3290, paid: 2831, rejected: 755, review: 757 },
  { provider: "Mission Care Nursing Home", county: "Nairobi", level: "LEVEL 4", ownership: "Faith Based", scheme: "SHA", channel: "Portal", type: "Maternity", submitted: 4557, approved: 3102, paid: 2694, rejected: 682, review: 773 },
  { provider: "Kilifi County Referral", county: "Kilifi", level: "LEVEL 5", ownership: "Public", scheme: "SHA", channel: "API", type: "Emergency", submitted: 4300, approved: 2998, paid: 2524, rejected: 603, review: 699 }
];

const executiveRows = [
  { level: "LEVEL 4", patients: 110494, sha: 54142, oop: 29834, other: 26518 },
  { level: "LEVEL 5", patients: 94871, sha: 47188, oop: 24935, other: 22748 },
  { level: "LEVEL 6A", patients: 63533, sha: 30496, oop: 17790, other: 15247 },
  { level: "LEVEL 6B", patients: 31893, sha: 15628, oop: 8611, other: 7654 },
  { level: "LEVEL 3", patients: 24689, sha: 10590, oop: 7904, other: 6195 }
];

const rowAttributes = [
  ["Westlands", "MediLife Hospital", "Female", "35-44", "SHA", "Nairobi Metro"],
  ["Kanduyi", "Lifecare Bungoma", "Male", "25-34", "SHA", "Western Health"],
  ["Embakasi East", "Eagle Health Clinic", "Female", "18-24", "SHA", "Nairobi Metro"],
  ["Nyeri Central", "Consolata Hospital", "Male", "45-54", "NHIF Legacy", "Mt Kenya Care"],
  ["Nyeri Central", "Outspan Hospital", "Female", "55-64", "Private Payer", "Mt Kenya Care"],
  ["Dagoretti", "Mbagathi Hospital", "Male", "Under 5", "SHA", "Nairobi Metro"],
  ["Voi", "Moi Voi County Referral", "Female", "65+", "SHA", "Coast Health"],
  ["Isiolo", "Galaxy Hospital", "Male", "5-14", "Private Payer", "Northern Care"],
  ["Kasarani", "Mission Care Nursing Home", "Female", "25-34", "SHA", "Nairobi Metro"],
  ["Kilifi North", "Kilifi County Referral", "Male", "15-17", "SHA", "Coast Health"]
];

baseClaimsRows.forEach((row, index) => {
  const [subCounty, facility, sex, ageCategory, agency, partner] = rowAttributes[index];
  Object.assign(row, { subCounty, facility, sex, ageCategory, agency, partner });
});

const state = {
  page: "healthFinancing",
  financeSubpage: "biometrics",
  biometricsSubpage: "authorizationAttempts",
  filters: {},
  dateIndex: 0,
  sort: { key: "submitted", direction: "desc" },
  focusMetric: null
};

const dateRanges = [
  { label: "Last day", factor: 0.08 },
  { label: "Last 7 days", factor: 0.28 },
  { label: "This month", factor: 1 },
  { label: "Last quarter", factor: 2.65 }
];

const filterOptions = {
  County: ["Nairobi", "Bungoma", "Nyeri", "Taita Taveta", "Isiolo", "Kilifi"],
  "Sub-County": ["Westlands", "Kanduyi", "Embakasi East", "Nyeri Central", "Dagoretti", "Voi", "Isiolo", "Kasarani", "Kilifi North"],
  Facility: baseClaimsRows.map((row) => row.facility),
  Ownership: ["Public", "Private", "Faith Based"],
  "Facility Level": ["LEVEL 3", "LEVEL 4", "LEVEL 5", "LEVEL 6A", "LEVEL 6B"],
  Provider: baseClaimsRows.map((row) => row.provider),
  Scheme: ["SHA", "Cash", "Other Insurance", "NHIF Legacy", "Private Payer"],
  Status: ["Submitted", "Rejected", "Under Review", "Approved", "Paid"],
  "Assessment Period": dateRanges.map((range) => range.label)
};

const filterKey = {
  County: "county",
  "Sub-County": "subCounty",
  Facility: "facility",
  Ownership: "ownership",
  "Facility Level": "level",
  Provider: "provider",
  Scheme: "scheme"
};

const pageTabs = document.querySelectorAll(".dashboard-tab");
const pageContent = document.getElementById("page-content");
const reportTitle = document.getElementById("report-title");
const dateButton = document.getElementById("date-button");
const periodLabel = document.getElementById("period-label");
const dialog = document.getElementById("dialog");
const overlay = document.getElementById("overlay");
const toast = document.getElementById("toast");

function fmt(value) {
  return Math.round(value).toLocaleString("en-US");
}

function pct(value, total) {
  if (!total) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}

function scaled(value) {
  return Math.round(value * dateRanges[state.dateIndex].factor);
}

function getRows() {
  return baseClaimsRows.filter((row) => {
    return Object.entries(state.filters).every(([name, value]) => {
      if (name === "Status" || name === "Assessment Period") return true;
      return row[filterKey[name]] === value;
    });
  });
}

function activeDimensionFilters() {
  return Object.keys(state.filters).filter((key) => key !== "Status" && key !== "Assessment Period");
}

function filteredShare() {
  if (!activeDimensionFilters().length) return 1;
  const allSubmitted = baseClaimsRows.reduce((sum, row) => sum + row.submitted, 0);
  const visibleSubmitted = getRows().reduce((sum, row) => sum + row.submitted, 0);
  return allSubmitted ? visibleSubmitted / allSubmitted : 1;
}

function totals(rows = getRows()) {
  return rows.reduce((acc, row) => {
    acc.submitted += scaled(row.submitted);
    acc.approved += scaled(row.approved);
    acc.paid += scaled(row.paid);
    acc.rejected += scaled(row.rejected);
    acc.review += scaled(row.review);
    return acc;
  }, { submitted: 0, approved: 0, paid: 0, rejected: 0, review: 0 });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove("hidden");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.add("hidden"), 2200);
}

function closeDialog() {
  dialog.classList.add("hidden");
  overlay.classList.add("hidden");
  dialog.innerHTML = "";
}

function openDialog(title, body) {
  dialog.innerHTML = `<div class="dialog-header"><strong>${title}</strong><button id="close-dialog">x</button></div>${body}`;
  dialog.classList.remove("hidden");
  overlay.classList.remove("hidden");
  document.getElementById("close-dialog").addEventListener("click", closeDialog);
}

function kpi(label, key, value, subtext, color) {
  const active = state.focusMetric === key ? " active" : "";
  return `<button class="kpi-card ${color}${active}" data-metric="${key}">
    <span class="label">${label}</span>
    <span class="value">${fmt(value)}</span>
    <span class="subtext">${subtext}</span>
  </button>`;
}

function panel(title, body, extraClass = "") {
  return `<section class="panel ${extraClass}">
    <div class="panel-header">
      <div class="panel-title">${title}</div>
      <div class="chart-actions"><button data-action="drill">up</button><button data-action="drill">down</button><button data-action="filter">filter</button><button data-action="more">...</button></div>
    </div>
    ${body}
  </section>`;
}

function trendChart(seriesA, seriesB, labels, aName, bName) {
  const max = Math.max(...seriesA, ...seriesB, 1);
  const xs = [42, 118, 194, 270, 346, 422, 498];
  const y = (value) => 180 - (value / max) * 130;
  const pointsA = seriesA.map((v, i) => `${xs[i]},${y(v)}`).join(" ");
  const pointsB = seriesB.map((v, i) => `${xs[i]},${y(v)}`).join(" ");
  return `<svg class="chart interactive-chart" viewBox="0 0 560 220" role="img" aria-label="${aName} trend">
    <line x1="42" y1="180" x2="535" y2="180" stroke="#92a9c3" />
    <line x1="42" y1="36" x2="42" y2="180" stroke="#e6edf4" />
    <text x="12" y="184" fill="#6a88a8" font-size="11">0</text>
    <text x="8" y="116" fill="#6a88a8" font-size="11">${fmt(max / 2)}</text>
    <text x="8" y="44" fill="#6a88a8" font-size="11">${fmt(max)}</text>
    <polyline points="${pointsA}" fill="none" stroke="#285a9e" stroke-width="2"/>
    <polyline points="${pointsB}" fill="none" stroke="#72bd4d" stroke-width="2"/>
    ${seriesA.map((v, i) => `<circle class="chart-point" data-tip="${labels[i]} | ${aName}: ${fmt(v)}" cx="${xs[i]}" cy="${y(v)}" r="5" fill="#285a9e"/>`).join("")}
    ${seriesB.map((v, i) => `<circle class="chart-point" data-tip="${labels[i]} | ${bName}: ${fmt(v)}" cx="${xs[i]}" cy="${y(v)}" r="5" fill="#72bd4d"/>`).join("")}
    ${labels.map((d, i) => `<text x="${xs[i] - 14}" y="203" fill="#6a88a8" font-size="11">${d}</text>`).join("")}
    <rect x="68" y="22" width="14" height="4" fill="#285a9e"/><text x="88" y="27" fill="#4b6d90" font-size="11">${aName}</text>
    <rect x="210" y="22" width="14" height="4" fill="#72bd4d"/><text x="230" y="27" fill="#4b6d90" font-size="11">${bName}</text>
  </svg>`;
}

function barChart(items) {
  const max = Math.max(...items.map((item) => item.value), 1);
  return `<svg class="chart interactive-chart" viewBox="0 0 560 220" role="img" aria-label="Claims by status">
    <line x1="40" y1="180" x2="535" y2="180" stroke="#92a9c3" />
    <line x1="40" y1="32" x2="40" y2="180" stroke="#e6edf4" />
    ${items.map((item, i) => {
      const x = 62 + i * 82;
      const h = (item.value / max) * 132;
      return `<rect class="bar" data-status="${item.label}" data-tip="${item.label}: ${fmt(item.value)}" x="${x}" y="${180 - h}" width="48" height="${h}" fill="${item.color}"/>
      <text x="${x + 24}" y="${172 - h}" text-anchor="middle" fill="#4b6d90" font-size="11">${fmt(item.value)}</text>
      <text x="${x + 24}" y="202" text-anchor="middle" fill="#6a88a8" font-size="10">${item.short}</text>`;
    }).join("")}
  </svg>`;
}

function table(headers, rows, heatColumns = [], tableId = "table") {
  return `<table class="data-table" data-table="${tableId}">
    <thead><tr>${headers.map((h) => `<th><button data-sort="${h.key}">${h.label}<span class="sort-mark">${sortMark(h.key)}</span></button></th>`).join("")}</tr></thead>
    <tbody>
      ${rows.map((row) => `<tr>${headers.map((h, index) => {
        const heat = heatColumns.includes(h.key) ? (index % 3 === 0 ? "heat-blue" : index % 3 === 1 ? "heat-green" : "heat-amber") : "";
        const numeric = typeof row[h.key] === "number" || String(row[h.key]).includes("%") ? "num" : "";
        return `<td class="${numeric} ${heat}">${typeof row[h.key] === "number" ? fmt(row[h.key]) : row[h.key]}</td>`;
      }).join("")}</tr>`).join("")}
    </tbody>
  </table>`;
}

function sortMark(key) {
  if (state.sort.key !== key) return "";
  return state.sort.direction === "asc" ? " ^" : " v";
}

function claimsRowsForTable() {
  const rows = getRows().map((row) => ({
    provider: row.provider,
    county: row.county,
    level: row.level,
    submitted: scaled(row.submitted),
    approved: scaled(row.approved),
    approvedPct: pct(scaled(row.approved), scaled(row.submitted)),
    paid: scaled(row.paid),
    paidPct: pct(scaled(row.paid), scaled(row.approved)),
    rejected: scaled(row.rejected)
  }));
  return sortRows(rows);
}

function sortRows(rows) {
  const { key, direction } = state.sort;
  const mult = direction === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const av = parseFloat(String(a[key]).replace(/[%,$,]/g, "")) || a[key];
    const bv = parseFloat(String(b[key]).replace(/[%,$,]/g, "")) || b[key];
    return av > bv ? mult : av < bv ? -mult : 0;
  });
}

function facilityRows() {
  const grouped = {};
  getRows().forEach((row) => {
    grouped[row.level] ||= { level: row.level, submitted: 0, approved: 0, rejected: 0, paid: 0 };
    grouped[row.level].submitted += scaled(row.submitted);
    grouped[row.level].approved += scaled(row.approved);
    grouped[row.level].rejected += scaled(row.rejected);
    grouped[row.level].paid += scaled(row.paid);
  });
  return Object.values(grouped).map((row) => ({
    ...row,
    approvedPct: pct(row.approved, row.submitted),
    rejectedPct: pct(row.rejected, row.submitted),
    paidPct: pct(row.paid, row.approved)
  }));
}

function activationRows() {
  const rows = getRows();
  const byCounty = {};
  rows.forEach((row) => {
    byCounty[row.county] ||= { county: row.county, liveFacilities: 0, level4: 0, level5: 0, lastSync: "Jul 31, 2026" };
    byCounty[row.county].liveFacilities += 1;
    if (row.level === "LEVEL 4") byCounty[row.county].level4 += 1;
    if (row.level === "LEVEL 5") byCounty[row.county].level5 += 1;
  });
  return Object.values(byCounty).sort((a, b) => b.liveFacilities - a.liveFacilities);
}

function inpatientRows() {
  const wards = [
    { ward: "Medical", beds: 320, occupied: 242, cots: 48, incubators: 18 },
    { ward: "Maternity", beds: 280, occupied: 201, cots: 96, incubators: 34 },
    { ward: "Surgical", beds: 235, occupied: 184, cots: 24, incubators: 8 },
    { ward: "Paediatric", beds: 210, occupied: 151, cots: 112, incubators: 21 },
    { ward: "Isolation", beds: 92, occupied: 57, cots: 10, incubators: 4 }
  ];
  const factor = filteredShare();
  return wards.map((row) => ({
    ...row,
    beds: scaled(row.beds * factor),
    occupied: scaled(row.occupied * factor),
    available: scaled((row.beds - row.occupied) * factor),
    cots: scaled(row.cots * factor),
    incubators: scaled(row.incubators * factor),
    occupancy: pct(scaled(row.occupied * factor), scaled(row.beds * factor))
  }));
}

function facilityActivationPage() {
  reportTitle.textContent = "KenyaEMR Taifacare Facility Roll Out Statistics";

  pageContent.innerHTML = `
    <div class="activation-page">
      <div class="activation-banner" aria-hidden="true"></div>
      <div class="activation-spacer"></div>
      <div class="activation-stat-grid">
        ${activationStat("Activated Counties", "4")}
        ${activationStat("Counties with Live Facilities", "4")}
        ${activationStat("Configured Facilities", "708")}
        ${activationStat("Activated Facilities", "405")}
      </div>
    </div>
  `;
  wirePageInteractions();
}

function activationStat(label, value) {
  return `<article class="activation-stat-card">
    <div class="stat-menu">...</div>
    <h2>${label}</h2>
    <div class="stat-value">${value}</div>
  </article>`;
}

function workloadOverviewPage() {
  reportTitle.textContent = "Facility Workload Overview";
  const departments = [
    { department: "Triage", visits: 845 },
    { department: "OPD", visits: 712 },
    { department: "Emergency", visits: 388 },
    { department: "Laboratory", visits: 642 },
    { department: "Radiology", visits: 214 },
    { department: "Pharmacy", visits: 731 },
    { department: "Theatre", visits: 86 },
    { department: "Special Clinic", visits: 309 },
    { department: "Maternity", visits: 156 },
    { department: "Paediatric", visits: 284 }
  ].map((row) => ({ ...row, visits: scaled(row.visits) }));
  const totalVisits = departments.reduce((sum, row) => sum + row.visits, 0);

  pageContent.innerHTML = `
    <div class="section-title">Facility Workload Overview</div>
    <div class="kpi-grid four">
      ${kpi("Total Visits This Month", "totalVisits", totalVisits, "Patients attended across departments", "blue")}
      ${kpi("OPD Visits", "opdVisits", departments[1].visits, "Outpatient department workload", "green")}
      ${kpi("Laboratory Visits", "labVisits", departments[3].visits, "Laboratory service encounters", "blue")}
      ${kpi("Pharmacy Visits", "pharmacyVisits", departments[5].visits, "Pharmacy service encounters", "green")}
    </div>
    <div class="dashboard-grid">
      ${panel("Workload by Department", table([
        { label: "Department", key: "department" },
        { label: "Visits", key: "visits" }
      ], departments, ["visits"], "workload"), "wide")}
      ${panel("Monthly Workload Trend", trendChart([420, 480, 510, 560, 600, 690, 845].map(scaled), [300, 350, 390, 420, 460, 520, 610].map(scaled), ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"], "Total visits", "OPD visits"), "wide")}
    </div>
  `;
  wirePageInteractions();
}

function inpatientOverviewPage() {
  reportTitle.textContent = "Inpatient Overview";
  const rows = inpatientRows();
  const totalBeds = rows.reduce((sum, row) => sum + row.beds, 0);
  const totalCots = rows.reduce((sum, row) => sum + row.cots, 0);
  const totalIncubators = rows.reduce((sum, row) => sum + row.incubators, 0);
  const occupied = rows.reduce((sum, row) => sum + row.occupied, 0);

  pageContent.innerHTML = `
    <div class="section-title">Inpatient Capacity and Occupancy</div>
    <div class="kpi-grid four">
      ${kpi("Total Beds", "beds", totalBeds, "Available inpatient beds", "blue")}
      ${kpi("Total Cots", "cots", totalCots, "Available cots in reporting facilities", "green")}
      ${kpi("Total Incubators", "incubators", totalIncubators, "Available incubators", "blue")}
      ${kpi("Occupied Beds", "occupied", occupied, `${pct(occupied, totalBeds)} of beds occupied`, "green")}
    </div>
    <div class="dashboard-grid">
      ${panel("Beds By Ward", barChart(rows.map((row) => ({
        label: row.ward,
        short: row.ward,
        value: row.beds,
        color: "#285a9e"
      }))))}
      ${panel("Occupied Beds vs Available Beds by Ward", table([
        { label: "Ward", key: "ward" },
        { label: "Total Beds", key: "beds" },
        { label: "Occupied", key: "occupied" },
        { label: "Available", key: "available" },
        { label: "Occupancy", key: "occupancy" }
      ], rows, ["occupancy"], "inpatient"))}
    </div>
  `;
  wirePageInteractions();
}

function prescriptionPage() {
  reportTitle.textContent = "Outpatient Prescriptions";
  const drugs = [
    { item: "Paracetamol 500mg Tab", prescribed: 820, dispensed: 801, stock: 1200 },
    { item: "Amoxicillin 500mg Cap", prescribed: 615, dispensed: 597, stock: 975 },
    { item: "Ibuprofen 400mg Tab", prescribed: 556, dispensed: 546, stock: 650 },
    { item: "Metformin 500mg Tab", prescribed: 540, dispensed: 527, stock: 700 },
    { item: "Amlodipine 5mg Tab", prescribed: 504, dispensed: 496, stock: 680 },
    { item: "Omeprazole 20mg Cap", prescribed: 484, dispensed: 476, stock: 620 }
  ].map((row) => ({ ...row, prescribed: scaled(row.prescribed), dispensed: scaled(row.dispensed), stock: scaled(row.stock) }));

  pageContent.innerHTML = `
    <div class="section-title">Outpatient Prescriptions</div>
    <div class="kpi-grid three">
      ${kpi("Fully Fulfilled", "fullyFulfilled", scaled(56), "Prescriptions fully dispensed", "blue")}
      ${kpi("Partially Fulfilled", "partiallyFulfilled", scaled(28), "Prescriptions partially dispensed", "green")}
      ${kpi("Not Fulfilled", "notFulfilled", scaled(16), "Prescriptions not dispensed", "blue")}
    </div>
    <div class="dashboard-grid">
      ${panel("Prescriptions by Department", barChart([
        { label: "Medical", short: "Medical", value: scaled(56), color: "#285a9e" },
        { label: "Surgical", short: "Surgical", value: scaled(44), color: "#72bd4d" },
        { label: "Paediatric", short: "Paed", value: scaled(38), color: "#8ea9cf" },
        { label: "Maternity", short: "Mat", value: scaled(31), color: "#efd585" },
        { label: "General", short: "Gen", value: scaled(29), color: "#4f8fcc" }
      ]))}
      ${panel("Fulfilment Split", barChart([
        { label: "Fully Fulfilled", short: "Full", value: scaled(56), color: "#72bd4d" },
        { label: "Partially Fulfilled", short: "Partial", value: scaled(28), color: "#efd585" },
        { label: "Not Fulfilled", short: "None", value: scaled(16), color: "#8ea9cf" }
      ]))}
      ${panel("Top 10 Most Prescribed Drugs", table([
        { label: "Item Name", key: "item" },
        { label: "Quantity Prescribed", key: "prescribed" },
        { label: "Quantity Dispensed", key: "dispensed" },
        { label: "Available Stock", key: "stock" }
      ], drugs, ["dispensed"], "prescriptions"), "wide")}
    </div>
  `;
  wirePageInteractions();
}

function maternalChildHealthPage() {
  reportTitle.textContent = "Maternal & Child Health";
  pageContent.innerHTML = `
    <div class="section-title">Maternal & Child Health</div>
    <div class="kpi-grid six">
      ${kpi("Total ANC", "anc", scaled(12), "Total ANC clients", "blue")}
      ${kpi("1st ANC Clients", "firstAnc", scaled(11), "First ANC attendance", "green")}
      ${kpi("Revisits", "revisits", scaled(7), "ANC revisit clients", "blue")}
      ${kpi("Given LLIN", "llin", scaled(5), "Clients issued LLIN", "green")}
      ${kpi("New PNC", "newPnc", scaled(8), "New postnatal clients", "blue")}
      ${kpi("PNC Offered F", "pncF", scaled(7), "PNC clients offered F", "green")}
    </div>
    <div class="dashboard-grid">
      ${panel("Adolescent Pregnancies at First ANC", barChart([
        { label: "10-14 Years", short: "10-14", value: scaled(2), color: "#285a9e" },
        { label: "15-19 Years", short: "15-19", value: scaled(5), color: "#72bd4d" }
      ]))}
      ${panel("Completed 4th and 8th ANC Contacts", barChart([
        { label: "Completed 4th ANC Visit", short: "4th", value: scaled(4), color: "#285a9e" },
        { label: "Completed 8th ANC Visit", short: "8th", value: scaled(2), color: "#72bd4d" }
      ]))}
      ${panel("PNC New and Revisit Clients Offered F", table([
        { label: "Client Type", key: "type" },
        { label: "Offered F", key: "offered" },
        { label: "Not Offered", key: "notOffered" }
      ], [
        { type: "New clients", offered: scaled(8), notOffered: scaled(2) },
        { type: "Revisits", offered: scaled(7), notOffered: scaled(1) }
      ], ["offered"], "pnc"), "wide")}
    </div>
  `;
  wirePageInteractions();
}

function childWelfarePage() {
  reportTitle.textContent = "Child Welfare Clinic & Immunization";
  pageContent.innerHTML = `
    <div class="section-title">Child Welfare Clinic & Immunization</div>
    <div class="kpi-grid three">
      ${kpi("Fully Immunized Children", "fic", scaled(1260), "Children fully immunized", "blue")}
      ${kpi("Monthly Average Immunization", "monthlyImm", scaled(1150), "Average monthly immunization count", "green")}
      ${kpi("Antigens Tracked", "antigens", 6, "BCG, OPV, MR, Penta, Polio, Rota", "blue")}
    </div>
    <div class="dashboard-grid">
      ${panel("Coverage Rate by Antigen", barChart([
        { label: "BCG", short: "BCG", value: 92, color: "#285a9e" },
        { label: "OPV", short: "OPV", value: 88, color: "#72bd4d" },
        { label: "Measles Rubella", short: "MR", value: 81, color: "#8ea9cf" },
        { label: "Penta", short: "Penta", value: 84, color: "#efd585" },
        { label: "Polio", short: "Polio", value: 79, color: "#4f8fcc" }
      ]))}
      ${panel("Monthly Average Immunization Trend", trendChart([780, 820, 930, 980, 1040, 1105, 1150].map(scaled), [640, 700, 760, 820, 910, 980, 1040].map(scaled), ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"], "Immunizations", "FIC"))}
    </div>
  `;
  wirePageInteractions();
}

function maternityPage() {
  reportTitle.textContent = "Maternity";
  pageContent.innerHTML = `
    <div class="section-title">Maternity</div>
    <div class="kpi-grid three">
      ${kpi("Number Admitted", "admitted", scaled(13), "Maternity admissions", "blue")}
      ${kpi("Live Births", "liveBirths", scaled(11), "Live birth outcomes", "green")}
      ${kpi("Maternal Complications", "complications", scaled(5), "Reported maternal complications", "blue")}
    </div>
    <div class="dashboard-grid">
      ${panel("Baby Outcome", barChart([
        { label: "Live Birth", short: "Live", value: scaled(11), color: "#72bd4d" },
        { label: "Fresh Still Birth", short: "Fresh", value: scaled(1), color: "#8ea9cf" },
        { label: "Macerated Birth", short: "Mac", value: scaled(1), color: "#efd585" }
      ]))}
      ${panel("Monthly Deliveries", trendChart([7, 8, 8, 9, 10, 12, 13].map(scaled), [5, 6, 7, 8, 8, 10, 11].map(scaled), ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"], "Deliveries", "Live births"))}
      ${panel("Maternal Complications", barChart([
        { label: "APH", short: "APH", value: scaled(2), color: "#285a9e" },
        { label: "PPH", short: "PPH", value: scaled(3), color: "#72bd4d" },
        { label: "Eclampsia", short: "Ecl", value: scaled(1), color: "#8ea9cf" },
        { label: "Ruptured Uteri", short: "Rupt", value: scaled(1), color: "#efd585" },
        { label: "Sepsis", short: "Sepsis", value: scaled(2), color: "#4f8fcc" }
      ]), "wide")}
    </div>
  `;
  wirePageInteractions();
}

function newbornChildHealthPage() {
  reportTitle.textContent = "Newborn & Child Health";
  pageContent.innerHTML = `
    <div class="section-title">Newborn & Child Health</div>
    <div class="kpi-grid four">
      ${kpi("Normal Birth Weight", "normalWeight", scaled(90), "2.5kg - 3.9kg", "blue")}
      ${kpi("Low Birth Weight", "lowWeight", scaled(55), "Less than 2.5kg", "green")}
      ${kpi("Newborn Deaths", "newbornDeaths", scaled(25), "Newborn deaths by type", "blue")}
      ${kpi("Deliveries", "deliveries", scaled(125), "Delivery records", "green")}
    </div>
    <div class="dashboard-grid">
      ${panel("Number of Deliveries by Mode", barChart([
        { label: "Normal", short: "Normal", value: scaled(88), color: "#72bd4d" },
        { label: "C-section", short: "C-sec", value: scaled(37), color: "#285a9e" }
      ]))}
      ${panel("Newborn Deaths by Type", barChart([
        { label: "Maternal Death", short: "Mat", value: scaled(4), color: "#8ea9cf" },
        { label: "Neonatal Death", short: "Neo", value: scaled(13), color: "#285a9e" },
        { label: "Perinatal Death", short: "Peri", value: scaled(8), color: "#efd585" }
      ]))}
      ${panel("Birth Weight", barChart([
        { label: "Low Birth Weight", short: "Low", value: scaled(55), color: "#8ea9cf" },
        { label: "Normal Birth Weight", short: "Normal", value: scaled(90), color: "#72bd4d" },
        { label: "High Birth Weight", short: "High", value: scaled(12), color: "#285a9e" }
      ]), "wide")}
    </div>
  `;
  wirePageInteractions();
}

function digitizationPage() {
  reportTitle.textContent = "Digitization";
  pageContent.innerHTML = `
    <div class="section-title">Digitization</div>
    <div class="kpi-grid four">
      ${kpi("Digitized Visits", "digitizedVisits", scaled(7240), "Visits captured electronically", "blue")}
      ${kpi("Synced Records", "syncedRecords", scaled(6988), "Records synced to reporting layer", "green")}
      ${kpi("Sync Success Rate", "syncRate", 97, "Percent successfully synced", "blue")}
      ${kpi("Facilities Reporting", "facilitiesReporting", 405, "Activated facilities reporting", "green")}
    </div>
    <div class="dashboard-grid">
      ${panel("Digitized Visits Over Time", trendChart([820, 900, 940, 1010, 1080, 1190, 1300].map(scaled), [780, 860, 900, 970, 1030, 1140, 1250].map(scaled), ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"], "Digitized visits", "Synced records"))}
      ${panel("Digitization by Department", barChart([
        { label: "Triage", short: "Triage", value: scaled(845), color: "#285a9e" },
        { label: "OPD", short: "OPD", value: scaled(712), color: "#72bd4d" },
        { label: "Lab", short: "Lab", value: scaled(642), color: "#8ea9cf" },
        { label: "Pharmacy", short: "Pharm", value: scaled(731), color: "#efd585" }
      ]))}
    </div>
  `;
  wirePageInteractions();
}

function claimsPage() {
  reportTitle.textContent = "Claims Overview";
  const t = totals();
  const factor = dateRanges[state.dateIndex].factor;
  const labels = ["Jul 1", "Jul 5", "Jul 10", "Jul 15", "Jul 20", "Jul 25", "Jul 31"];
  const submittedSeries = [0.13, 0.11, 0.16, 0.14, 0.15, 0.17, 0.14].map((n) => t.submitted * n);
  const paidSeries = [0.11, 0.1, 0.13, 0.12, 0.14, 0.16, 0.12].map((n) => t.paid * n);
  const statusItems = [
    { label: "Submitted", short: "Submitted", value: t.submitted, color: "#285a9e" },
    { label: "Rejected", short: "Rejected", value: t.rejected, color: "#8ea9cf" },
    { label: "Under Review", short: "Review", value: t.review, color: "#efd585" },
    { label: "Approved", short: "Approved", value: t.approved, color: "#72bd4d" },
    { label: "Paid", short: "Paid", value: t.paid, color: "#4f8fcc" }
  ];

  pageContent.innerHTML = `
    <div class="active-filter-strip">${activeFilterText()}</div>
    <div class="section-title">Claims Submitted and Processing Status</div>
    <div class="kpi-grid">
      ${kpi("Claims submitted", "submitted", t.submitted, "Valid claim forms sent this period", "blue")}
      ${kpi("Claims rejected", "rejected", t.rejected, `${pct(t.rejected, t.submitted)} of ${fmt(t.submitted)} submitted claims`, "green")}
      ${kpi("Claims under review", "review", t.review, `${pct(t.review, t.submitted)} awaiting final decision`, "blue")}
      ${kpi("Claims approved", "approved", t.approved, `${pct(t.approved, t.submitted)} of submitted claims`, "green")}
      ${kpi("Claims Paid", "paid", t.paid, `${pct(t.paid, t.approved)} of approved claims`, "blue")}
    </div>

    <div class="dashboard-grid">
      ${panel("Claims Submitted vs Paid Over Time", trendChart(submittedSeries, paidSeries, labels, "Claims submitted", "Claims paid"))}
      ${panel("Claims by Current Status", barChart(statusItems))}
      ${panel("Claims Processing Outcome", outcomePanel(t))}
      ${panel("Claims Submitted by Facility Level", table([
        { label: "Facility Level", key: "level" },
        { label: "Submitted", key: "submitted" },
        { label: "Approved", key: "approved" },
        { label: "% Approved", key: "approvedPct" },
        { label: "Rejected", key: "rejected" },
        { label: "% Rejected", key: "rejectedPct" },
        { label: "Paid", key: "paid" },
        { label: "% Paid", key: "paidPct" }
      ], facilityRows(), ["approvedPct", "rejectedPct", "paidPct"], "facility"))}
      ${panel("Provider Claims Analysis", table([
        { label: "Provider", key: "provider" },
        { label: "County", key: "county" },
        { label: "Facility Level", key: "level" },
        { label: "Claims Submitted", key: "submitted" },
        { label: "Claims Approved", key: "approved" },
        { label: "% Approved", key: "approvedPct" },
        { label: "Claims Paid", key: "paid" },
        { label: "% Paid", key: "paidPct" },
        { label: "Claims Rejected", key: "rejected" }
      ], claimsRowsForTable(), ["approvedPct", "paidPct"], "provider"), "wide")}
    </div>
  `;
  wirePageInteractions();
}

function outcomePanel(t) {
  return `<div class="metric-row">
    <button class="status-card" data-status-filter="Approved"><span>Approved</span><strong>${fmt(t.approved)}</strong></button>
    <button class="status-card" data-status-filter="Rejected"><span>Rejected</span><strong>${fmt(t.rejected)}</strong></button>
    <button class="status-card" data-status-filter="Under Review"><span>Under Review</span><strong>${fmt(t.review)}</strong></button>
  </div>
  <div class="donut-wrap" style="margin-top: 18px;">
    <button class="donut" data-metric="approved" aria-label="Open claims outcome details"></button>
    <div>
      <div class="legend-row"><span class="swatch blue"></span><span>Approved claims</span><strong>${pct(t.approved, t.submitted)}</strong></div>
      <div class="legend-row"><span class="swatch green"></span><span>Paid claims</span><strong>${pct(t.paid, t.submitted)}</strong></div>
      <div class="legend-row"><span class="swatch soft-blue"></span><span>Under review</span><strong>${pct(t.review, t.submitted)}</strong></div>
      <div class="legend-row"><span class="swatch pale"></span><span>Rejected claims</span><strong>${pct(t.rejected, t.submitted)}</strong></div>
    </div>
  </div>`;
}

function healthFinancingPage() {
  reportTitle.textContent = "Health Financing & Revenue";
  pageContent.innerHTML = `
    <div class="subtabs" aria-label="Health Financing and Revenue sections">
      <button class="subtab ${state.financeSubpage === "claims" ? "active" : ""}" data-finance-subpage="claims">Claims</button>
      <button class="subtab ${state.financeSubpage === "biometrics" ? "active" : ""}" data-finance-subpage="biometrics">Biometrics</button>
    </div>
    ${state.financeSubpage === "claims" ? claimsSection() : biometricsPlaceholder()}
  `;
  wirePageInteractions();
}

function biometricsPlaceholder() {
  return `<div class="biometrics-shell">
    <div class="subtabs nested" aria-label="Biometrics sections">
      <button class="subtab ${state.biometricsSubpage === "attemptsSummary" ? "active" : ""}" data-biometrics-subpage="attemptsSummary">Attempts Summary</button>
      <button class="subtab ${state.biometricsSubpage === "providerAnalysis" ? "active" : ""}" data-biometrics-subpage="providerAnalysis">Provider Analysis</button>
      <button class="subtab ${state.biometricsSubpage === "authorizationAttempts" ? "active" : ""}" data-biometrics-subpage="authorizationAttempts">Biometrics Authorizations Attempts</button>
      <button class="subtab ${state.biometricsSubpage === "otpWhitelisting" ? "active" : ""}" data-biometrics-subpage="otpWhitelisting">OTP Whitelisting Requests</button>
    </div>
    ${biometricsContent()}
  </div>`;
}

function biometricsContent() {
  if (state.biometricsSubpage === "providerAnalysis") return biometricsProviderAnalysis();
  if (state.biometricsSubpage === "authorizationAttempts") return biometricsAuthorizationAttempts();
  if (state.biometricsSubpage === "otpWhitelisting") return biometricsOtpWhitelisting();
  return biometricsAttemptsSummary();
}

function biometricsKpi(label, value, subtext, color = "blue") {
  return kpi(label, label.toLowerCase().replace(/[^a-z0-9]+/g, "-"), value, subtext, color);
}

function biometricsAuthKpi(label, value, subtext, color = "blue") {
  const key = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return `<button class="auth-kpi ${color}" data-metric="${key}">
    <span class="auth-kpi-label">${label}</span>
    <strong>${fmt(value)}</strong>
    <span class="auth-kpi-subtext">${subtext}</span>
  </button>`;
}

function biometricsAttemptsSummary() {
  const labels = ["Jul 1", "Jul 5", "Jul 10", "Jul 15", "Jul 20", "Jul 25", "Jul 31"];
  return `
    <div class="section-title">Attempts Summary</div>
    <div class="kpi-grid four">
      ${biometricsKpi("Biometrics only attempts", scaled(6132), "53% of total attempts", "blue")}
      ${biometricsKpi("Biometrics only patients", scaled(3014), "54% of total patients", "green")}
      ${biometricsKpi("OTP Only Attempts", scaled(1002), "9% of total attempts", "blue")}
      ${biometricsKpi("OTP Only Patients", scaled(726), "13% of total patients", "green")}
    </div>
    <div class="kpi-grid four biometrics-kpi-row">
      ${biometricsKpi("Both Biometrics and OTP Attempts", scaled(3175), "27% of total attempts", "blue")}
      ${biometricsKpi("Both Biometrics and OTP Patients", scaled(1055), "19% of total patients", "green")}
      ${biometricsKpi("OTP Edge Cases Attempts", scaled(1260), "11% of total attempts", "blue")}
      ${biometricsKpi("OTP Edge Cases Patients", scaled(755), "14% of total patients", "green")}
    </div>
    <div class="dashboard-grid">
      ${panel("Biometric attempts over time", trendChart([1500, 2200, 3100, 4300, 5100, 5900, 6132].map(scaled), [720, 900, 1300, 1600, 2100, 2600, 3014].map(scaled), labels, "Biometric attempts", "Biometric patients"))}
      ${panel("Edge cases over time", trendChart([260, 340, 520, 710, 880, 1050, 1260].map(scaled), [160, 220, 310, 420, 530, 660, 755].map(scaled), labels, "Edge cases", "Edge case patients"))}
      ${panel("biometric visits over time", trendChart([5200, 6100, 6900, 7600, 8400, 9100, 9880].map(scaled), [4700, 5480, 6210, 6840, 7560, 8190, 8892].map(scaled), labels, "Total biometric visits", "Completed biometric visits"), "wide")}
    </div>
  `;
}

function biometricsProviderRows() {
  return [
    { provider: "MediLife Hospital", level: "LEVEL 5", visitsBio: scaled(1732), visitsOther: scaled(811), patientsBio: scaled(853), patientsOther: scaled(455), bioPct: "53%" },
    { provider: "Lifecare Bungoma", level: "LEVEL 5", visitsBio: scaled(1728), visitsOther: scaled(846), patientsBio: scaled(846), patientsOther: scaled(455), bioPct: "54%" },
    { provider: "Eagle Health Clinic", level: "LEVEL 4", visitsBio: scaled(1693), visitsOther: scaled(782), patientsBio: scaled(874), patientsOther: scaled(493), bioPct: "56%" },
    { provider: "Consolata Hospital", level: "LEVEL 5", visitsBio: scaled(1582), visitsOther: scaled(768), patientsBio: scaled(739), patientsOther: scaled(374), bioPct: "51%" },
    { provider: "Outspan Hospital", level: "LEVEL 5", visitsBio: scaled(1581), visitsOther: scaled(802), patientsBio: scaled(718), patientsOther: scaled(387), bioPct: "54%" }
  ];
}

function biometricsProviderAnalysis() {
  const rows = biometricsProviderRows();
  const totals = rows.reduce((acc, row) => {
    acc.visitsBio += row.visitsBio;
    acc.visitsOther += row.visitsOther;
    acc.patientsBio += row.patientsBio;
    acc.patientsOther += row.patientsOther;
    return acc;
  }, { visitsBio: 0, visitsOther: 0, patientsBio: 0, patientsOther: 0 });
  return `
    <div class="section-title">Provider Analysis</div>
    <div class="kpi-grid four">
      ${biometricsKpi("Total Started Visits (Biometrics)", totals.visitsBio, "Started visits using biometrics", "blue")}
      ${biometricsKpi("Total Started Visits (Others)", totals.visitsOther, "Started visits using other methods", "green")}
      ${biometricsKpi("Unique Patients (Biometrics)", totals.patientsBio, "Unique biometric patients", "blue")}
      ${biometricsKpi("Unique Patients (Others)", totals.patientsOther, "Unique non-biometric patients", "green")}
    </div>
    <div class="dashboard-grid">
      ${panel("Provider analysis", table([
        { label: "Provider", key: "provider" },
        { label: "Facility Level", key: "level" },
        { label: "Biometric Visits", key: "visitsBio" },
        { label: "Other Visits", key: "visitsOther" },
        { label: "Biometric Patients", key: "patientsBio" },
        { label: "Other Patients", key: "patientsOther" },
        { label: "% Biometrics", key: "bioPct" }
      ], rows, ["bioPct"], "biometrics-provider"), "wide")}
      ${panel("Provider level analysis", table([
        { label: "Provider Level", key: "level" },
        { label: "Biometric Visits", key: "visitsBio" },
        { label: "Other Visits", key: "visitsOther" },
        { label: "% Biometrics", key: "bioPct" }
      ], [
        { level: "LEVEL 4", visitsBio: scaled(3386), visitsOther: scaled(1517), bioPct: "54%" },
        { level: "LEVEL 5", visitsBio: scaled(6623), visitsOther: scaled(3227), bioPct: "52%" },
        { level: "LEVEL 6A", visitsBio: scaled(843), visitsOther: scaled(496), bioPct: "47%" }
      ], ["bioPct"], "biometrics-provider-level"), "wide")}
    </div>
  `;
}

function biometricsAuthorizationAttempts() {
  const labels = ["Jun 27", "Jun 28", "Jun 29", "Jun 30", "Jul 1", "Jul 2", "Jul 3"];
  const outcomeRows = [
    { outcome: "SUCCESSFUL", status: "Matched", bioAttempts: 154540, attemptPct: "58.37%", bioPatients: 56202, patientPct: "52.35%", bothAttempts: 22548, bothPatients: 5271 },
    { outcome: "Total", status: "", bioAttempts: 154540, attemptPct: "58.37%", bioPatients: 56202, patientPct: "52.35%", bothAttempts: 22548, bothPatients: 5271 },
    { outcome: "FAILED", status: "Expired", bioAttempts: 84682, attemptPct: "85.73%", bioPatients: 29597, patientPct: "90.71%", bothAttempts: "-", bothPatients: 3032 },
    { outcome: "FAILED", status: "No Match", bioAttempts: 22335, attemptPct: "54.57%", bioPatients: 5000, patientPct: "58.64%", bothAttempts: "-", bothPatients: 3527 },
    { outcome: "FAILED", status: "Other", bioAttempts: 2249, attemptPct: "6.44%", bioPatients: 1055, patientPct: "10.77%", bothAttempts: "-", bothPatients: 1040 },
    { outcome: "Captured Not Prepared", status: "", bioAttempts: 1733, attemptPct: "2.13%", bioPatients: 1342, patientPct: "6.34%", bothAttempts: "-", bothPatients: 19813 },
    { outcome: "Unknown", status: "", bioAttempts: 511, attemptPct: "70.87%", bioPatients: 137, patientPct: "71.78%", bothAttempts: "-", bothPatients: 54 },
    { outcome: "Captured Failed", status: "", bioAttempts: 400, attemptPct: "9.25%", bioPatients: 277, patientPct: "17.58%", bothAttempts: "-", bothPatients: 132 },
    { outcome: "Grand total", status: "", bioAttempts: 290880, attemptPct: "51.92%", bioPatients: 91361, patientPct: "52.06%", bothAttempts: 181640, bothPatients: 38248 }
  ];
  return `
    <section class="auth-dashboard">
      <div class="auth-kpi-groups">
        <div>
          <div class="auth-group-title">Authorization Attempts made</div>
          <div class="auth-kpi-grid">
            ${biometricsAuthKpi("Biometrics Only Attempts", 291134, "52% of 560,670 Total Attempts", "blue")}
            ${biometricsAuthKpi("OTP Only Attempts", 66357, "12% of 560,670 Total Attempts", "green")}
          </div>
        </div>
        <div>
          <div class="auth-group-title">Unique Patients With Authorization Attempts</div>
          <div class="auth-kpi-grid">
            ${biometricsAuthKpi("Biometrics Only Patients", 91405, "52% of 175,799 Total Unique Patients", "blue")}
            ${biometricsAuthKpi("OTP Only Patients", 37549, "21% of 175,799 Total Unique Patients", "green")}
          </div>
        </div>
      </div>

      <div class="auth-content-grid">
        <div class="auth-left-stack">
          <section class="auth-panel compact">
            <h3>Outcomes Analysis of Biometrics Attempts Made</h3>
            <div class="auth-outcomes">
              <button class="status-card"><span>Successful</span><strong>${fmt(172470)}</strong></button>
              <button class="status-card"><span>Failed</span><strong>${fmt(112010)}</strong></button>
              <button class="status-card"><span>Pending</span><strong>${fmt(6400)}</strong></button>
            </div>
          </section>
          <section class="auth-panel trend-panel">
            <div class="panel-header">
            <h3>Biometric visits over time</h3>
              <div class="chart-actions"><button data-action="drill">up</button><button data-action="drill">down</button><button data-action="filter">filter</button><button data-action="more">...</button></div>
            </div>
            ${trendChart([37900, 27400, 66100, 55600, 44200, 53800, 6100], [50, 56, 54, 49, 45, 54, 53], labels, "Biometrics Only Attempts", "% of Total Attempts")}
          </section>
        </div>
        <section class="auth-panel auth-table-panel">
          <h3>Attempts Outcome By Verification Status - Verification Data From August 8th 2025 to Date</h3>
          ${table([
            { label: "Authorization Outcome", key: "outcome" },
            { label: "Verification Status", key: "status" },
            { label: "Biometrics Only Attempts", key: "bioAttempts" },
            { label: "% of Total Attempts", key: "attemptPct" },
            { label: "Biometrics Only Patients", key: "bioPatients" },
            { label: "% of Total Patients", key: "patientPct" },
            { label: "Both Biometrics and OTP Attempts", key: "bothAttempts" },
            { label: "Both Biometrics and OTP Patients", key: "bothPatients" }
          ], outcomeRows, ["attemptPct", "patientPct", "bothPatients"], "biometrics-verification")}
        </section>
      </div>
    </section>
  `;
}

function biometricsOtpWhitelisting() {
  const trendLabels = ["Aug 2025", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  const reasons = [
    { rank: 1, reason: "OLD", patients: 37113 },
    { rank: 2, reason: "MEDICAL_CONDITION", patients: 34909 },
    { rank: 3, reason: "BIOMETRIC_FAILURE", patients: 21704 },
    { rank: 4, reason: "ONCOLOGY_TREATMENT", patients: 15511 },
    { rank: 5, reason: "CONSTRUCTION_WORKER", patients: 8391 },
    { rank: 6, reason: "TECHNICAL_ISSUES", patients: 8372 },
    { rank: 7, reason: "DIALYSIS_TREATMENT", patients: 6956 },
    { rank: 8, reason: "MENTALLY_UNSTABLE", patients: 3588 },
    { rank: 9, reason: "AMPUTEE", patients: 3437 },
    { rank: 10, reason: "OTHER", patients: 2954 },
    { rank: 11, reason: "PRIVACY_CONCERNS", patients: 963 },
    { rank: 12, reason: "EXPIRED", patients: 10 },
    { rank: "Grand total", reason: "", patients: 143907 }
  ];
  return `
    <section class="auth-dashboard otp-dashboard">
      <div class="otp-content-grid">
        <div class="otp-left-stack">
          <button class="otp-total-card" data-metric="otp-whitelisted-patients">
            <span>OTP Whitelisted Patients</span>
            <strong>${fmt(143907)}</strong>
          </button>

          <section class="auth-panel trend-panel">
            <div class="panel-header">
              <h3>OTP Whitelisted Patients Over Time</h3>
              <div class="chart-actions"><button data-action="drill">up</button><button data-action="drill">down</button><button data-action="filter">filter</button><button data-action="more">...</button></div>
            </div>
            ${otpTrendChart([778, 18900, 17900, 14400, 13700, 12900, 11400, 10700, 14700, 12700, 14300, 3600], trendLabels)}
          </section>

        </div>

        <div class="otp-right-stack">
          <section class="auth-panel auth-table-panel otp-reason-panel">
            <h3>OTP Whitelisting By Reason</h3>
            ${table([
              { label: "", key: "rank" },
              { label: "Reason", key: "reason" },
              { label: "OTP Whitelisted Patients", key: "patients" }
            ], reasons, [], "otp-reasons")}
          </section>

          <section class="auth-panel">
            <h3>OTP Whitelisted Patients By Age Groups</h3>
            ${barChart([
              { label: "0-4", short: "0-4", value: 70310, color: "#0060a0" },
              { label: "5-14", short: "5-14", value: 24250, color: "#55bb59" },
              { label: "15-24", short: "15-24", value: 18380, color: "#8ea9cf" },
              { label: "25-49", short: "25-49", value: 21120, color: "#efd585" },
              { label: "50+", short: "50+", value: 9847, color: "#4f8fcc" }
            ])}
          </section>
        </div>
      </div>
    </section>
  `;
}

function otpTrendChart(values, labels) {
  const max = Math.max(...values, 1);
  const xs = values.map((_, index) => 34 + index * 42);
  const y = (value) => 182 - (value / max) * 134;
  const points = values.map((value, index) => `${xs[index]},${y(value)}`).join(" ");
  return `<svg class="chart interactive-chart otp-trend-chart" viewBox="0 0 560 220" role="img" aria-label="OTP whitelisted patients over time">
    <line x1="34" y1="182" x2="526" y2="182" stroke="#8aa6c3" />
    <line x1="34" y1="42" x2="34" y2="182" stroke="#dfe8f1" />
    <text x="8" y="186" fill="#6a88a8" font-size="11">0</text>
    <text x="4" y="150" fill="#6a88a8" font-size="11">1K</text>
    <text x="4" y="112" fill="#6a88a8" font-size="11">5K</text>
    <text x="0" y="76" fill="#6a88a8" font-size="11">10K</text>
    <text x="0" y="46" fill="#6a88a8" font-size="11">100K</text>
    <polyline points="${points}" fill="none" stroke="#285a9e" stroke-width="2"/>
    ${values.map((value, index) => `<circle class="chart-point" data-tip="${labels[index]} | OTP Whitelisted Patients: ${fmt(value)}" cx="${xs[index]}" cy="${y(value)}" r="4" fill="#285a9e"/>`).join("")}
    ${values.map((value, index) => `<text x="${xs[index]}" y="${y(value) - 10}" text-anchor="middle" fill="#4c6c91" font-size="10">${value >= 1000 ? `${(value / 1000).toFixed(value % 1000 ? 1 : 0)}K` : value}</text>`).join("")}
    <circle cx="44" cy="20" r="4" fill="#285a9e"/><text x="56" y="24" fill="#4b6d90" font-size="11">OTP Whitelisted Patients</text>
  </svg>`;
}

function patientRevenueSummary() {
  const factor = filteredShare();
  const rows = executiveRows.map((row) => ({
    ...row,
    patients: scaled(row.patients * factor),
    sha: scaled(row.sha * factor),
    oop: scaled(row.oop * factor),
    other: scaled(row.other * factor),
    shaPct: pct(scaled(row.sha * factor), scaled(row.patients * factor)),
    oopPct: pct(scaled(row.oop * factor), scaled(row.patients * factor)),
    otherPct: pct(scaled(row.other * factor), scaled(row.patients * factor))
  }));
  const t = rows.reduce((acc, row) => {
    acc.patients += row.patients;
    acc.sha += row.sha;
    acc.oop += row.oop;
    acc.other += row.other;
    return acc;
  }, { patients: 0, sha: 0, oop: 0, other: 0 });

  return `
    <div class="section-title">Patient Visits and Revenue Mode Summary</div>
    <div class="kpi-grid four">
      ${kpi("Patients Seen", "patients", t.patients, "Total patients attended during reporting period", "blue")}
      ${kpi("SHA", "sha", t.sha, `${pct(t.sha, t.patients)} of patients seen used SHA`, "green")}
      ${kpi("Out of Pocket", "oop", t.oop, `${pct(t.oop, t.patients)} paid by cash or mobile money`, "blue")}
      ${kpi("Other Insurances", "other", t.other, `${pct(t.other, t.patients)} used non-SHA insurance`, "green")}
    </div>
    <div class="dashboard-grid">
      ${panel("Patients Seen Over Time", trendChart([.12,.14,.13,.15,.12,.18,.16].map((n) => t.patients * n), [.1,.11,.12,.13,.1,.15,.13].map((n) => t.sha * n), ["Jul 1","Jul 5","Jul 10","Jul 15","Jul 20","Jul 25","Jul 31"], "Patients seen", "SHA patients"))}
      ${panel("Payment Mode Distribution", `<div class="donut-wrap"><button class="donut executive" data-metric="sha"></button><div>
        <div class="legend-row"><span class="swatch blue"></span><span>SHA</span><strong>${pct(t.sha, t.patients)}</strong></div>
        <div class="legend-row"><span class="swatch green"></span><span>Out of pocket</span><strong>${pct(t.oop, t.patients)}</strong></div>
        <div class="legend-row"><span class="swatch soft-blue"></span><span>Other insurances</span><strong>${pct(t.other, t.patients)}</strong></div>
      </div></div>`)}
      ${panel("Facility Patient Payment Analysis", table([
        { label: "Facility Level", key: "level" },
        { label: "Patients Seen", key: "patients" },
        { label: "SHA", key: "sha" },
        { label: "% SHA", key: "shaPct" },
        { label: "Out of Pocket", key: "oop" },
        { label: "% OOP", key: "oopPct" },
        { label: "Other Insurance", key: "other" },
        { label: "% Other", key: "otherPct" }
      ], rows, ["shaPct", "oopPct", "otherPct"], "patient-payment"), "wide")}
    </div>
  `;
}

function claimsSection() {
  const t = totals();
  const labels = ["Jul 1", "Jul 5", "Jul 10", "Jul 15", "Jul 20", "Jul 25", "Jul 31"];
  const submittedSeries = [0.13, 0.11, 0.16, 0.14, 0.15, 0.17, 0.14].map((n) => t.submitted * n);
  const paidSeries = [0.11, 0.1, 0.13, 0.12, 0.14, 0.16, 0.12].map((n) => t.paid * n);
  const statusItems = [
    { label: "Submitted", short: "Submitted", value: t.submitted, color: "#285a9e" },
    { label: "Rejected", short: "Rejected", value: t.rejected, color: "#8ea9cf" },
    { label: "Under Review", short: "Review", value: t.review, color: "#efd585" },
    { label: "Approved", short: "Approved", value: t.approved, color: "#72bd4d" },
    { label: "Paid", short: "Paid", value: t.paid, color: "#4f8fcc" }
  ];

  return `
    ${patientRevenueSummary()}
    <div class="section-title finance-section-title">Claims Overview</div>
    <div class="kpi-grid">
      ${kpi("Claims submitted", "submitted", t.submitted, "Valid claim forms sent this period", "blue")}
      ${kpi("Claims rejected", "rejected", t.rejected, `${pct(t.rejected, t.submitted)} of ${fmt(t.submitted)} submitted claims`, "green")}
      ${kpi("Claims under review", "review", t.review, `${pct(t.review, t.submitted)} awaiting final decision`, "blue")}
      ${kpi("Claims approved", "approved", t.approved, `${pct(t.approved, t.submitted)} of submitted claims`, "green")}
      ${kpi("Claims paid", "paid", t.paid, `${pct(t.paid, t.approved)} of approved claims`, "blue")}
    </div>
    <div class="dashboard-grid">
      ${panel("Claims Submitted vs Paid Over Time", trendChart(submittedSeries, paidSeries, labels, "Claims submitted", "Claims paid"))}
      ${panel("Claims by Current Status", barChart(statusItems))}
      ${panel("Claims Submitted by Facility Level", table([
        { label: "Facility Level", key: "level" },
        { label: "Submitted", key: "submitted" },
        { label: "Approved", key: "approved" },
        { label: "% Approved", key: "approvedPct" },
        { label: "Rejected", key: "rejected" },
        { label: "% Rejected", key: "rejectedPct" },
        { label: "Paid", key: "paid" },
        { label: "% Paid", key: "paidPct" }
      ], facilityRows(), ["approvedPct", "rejectedPct", "paidPct"], "facility"))}
      ${panel("Provider Claims Analysis", table([
        { label: "Provider", key: "provider" },
        { label: "County", key: "county" },
        { label: "Facility Level", key: "level" },
        { label: "Claims Submitted", key: "submitted" },
        { label: "Claims Approved", key: "approved" },
        { label: "% Approved", key: "approvedPct" },
        { label: "Claims Paid", key: "paid" },
        { label: "% Paid", key: "paidPct" },
        { label: "Claims Rejected", key: "rejected" }
      ], claimsRowsForTable(), ["approvedPct", "paidPct"], "provider"), "wide")}
    </div>
  `;
}

function placeholderPage(title) {
  claimsPage();
  reportTitle.textContent = title;
  showToast(`${title} uses the same interactive controls in this mockup.`);
}

function activeFilterText() {
  const entries = Object.entries(state.filters).filter(([key]) => key !== "Assessment Period");
  const filters = entries.length ? entries.map(([k, v]) => `${k}: ${v}`).join(" | ") : "All records";
  return `Date: ${dateRanges[state.dateIndex].label} | ${filters}`;
}

function wirePageInteractions() {
  pageContent.querySelectorAll("[data-metric]").forEach((button) => {
    button.addEventListener("click", () => {
      state.focusMetric = state.focusMetric === button.dataset.metric ? null : button.dataset.metric;
      showToast(state.focusMetric ? `Focused on ${button.dataset.metric}` : "Metric focus cleared");
      render();
    });
  });

  pageContent.querySelectorAll("[data-status-filter], .bar").forEach((item) => {
    item.addEventListener("click", () => {
      const status = item.dataset.statusFilter || item.dataset.status;
      if (filterOptions.Status.includes(status)) {
        state.filters.Status = status;
        showToast(`Status filter applied: ${status}`);
        render();
      } else {
        showToast(item.dataset.tip || `${status} selected`);
      }
    });
  });

  pageContent.querySelectorAll("[data-sort]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.sort;
      if (state.sort.key === key) {
        state.sort.direction = state.sort.direction === "asc" ? "desc" : "asc";
      } else {
        state.sort = { key, direction: "desc" };
      }
      render();
    });
  });

  pageContent.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => showToast(`${button.dataset.action} control selected`));
  });

  pageContent.querySelectorAll("[data-tip]").forEach((point) => {
    point.addEventListener("click", () => showToast(point.dataset.tip));
  });

  pageContent.querySelectorAll("[data-finance-subpage]").forEach((button) => {
    button.addEventListener("click", () => {
      state.financeSubpage = button.dataset.financeSubpage;
      state.focusMetric = null;
      render();
    });
  });

  pageContent.querySelectorAll("[data-biometrics-subpage]").forEach((button) => {
    button.addEventListener("click", () => {
      state.biometricsSubpage = button.dataset.biometricsSubpage;
      state.focusMetric = null;
      render();
    });
  });
}

function openFilter(name) {
  if (name === "Assessment Period") {
    openDatePicker();
    return;
  }
  const options = filterOptions[name] || [];
  const body = `<div class="option-grid">
    ${options.map((option) => `<button data-option="${option}">${option}</button>`).join("")}
    <button data-option="">Clear ${name}</button>
  </div>`;
  openDialog(`Filter By ${name}`, body);
  dialog.querySelectorAll("[data-option]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.option) state.filters[name] = button.dataset.option;
      else delete state.filters[name];
      closeDialog();
      render();
    });
  });
}

function openDatePicker() {
  const body = `<div class="option-grid">
    ${dateRanges.map((range, index) => `<button data-date-index="${index}">${range.label}</button>`).join("")}
  </div>`;
  openDialog("Select Reporting Period", body);
  dialog.querySelectorAll("[data-date-index]").forEach((button) => {
    button.addEventListener("click", () => {
      state.dateIndex = Number(button.dataset.dateIndex);
      state.filters["Assessment Period"] = dateRanges[state.dateIndex].label;
      closeDialog();
      render();
    });
  });
}

function updateFilterLabels() {
  document.querySelectorAll(".filter-control button[data-filter]").forEach((button) => {
    const name = button.dataset.filter;
    const value = name === "Assessment Period" ? dateRanges[state.dateIndex].label : state.filters[name];
    button.classList.toggle("selected", Boolean(value));
    if (name === "Assessment Period") {
      button.innerHTML = `<span>${value}</span><span class="calendar-symbol">cal</span>`;
    } else {
      const fallback = button.dataset.placeholder || button.querySelector("span")?.textContent || "options";
      button.innerHTML = `<span>${value || fallback}</span><span>v</span>`;
    }
  });
  periodLabel.textContent = dateRanges[state.dateIndex].label;
}

function render() {
  updateFilterLabels();
  pageTabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.page === state.page));
  if (state.page === "facilityActivation") facilityActivationPage();
  else if (state.page === "workloadOverview") workloadOverviewPage();
  else if (state.page === "inpatientOverview") inpatientOverviewPage();
  else if (state.page === "prescription") prescriptionPage();
  else if (state.page === "maternalChildHealth") maternalChildHealthPage();
  else if (state.page === "childWelfare") childWelfarePage();
  else if (state.page === "maternity") maternityPage();
  else if (state.page === "newbornChildHealth") newbornChildHealthPage();
  else if (state.page === "healthFinancing") healthFinancingPage();
  else if (state.page === "digitization") digitizationPage();
  else placeholderPage(reportTitle.textContent);
}

const pages = {
  facilityActivation: facilityActivationPage,
  workloadOverview: workloadOverviewPage,
  inpatientOverview: inpatientOverviewPage,
  prescription: prescriptionPage,
  maternalChildHealth: maternalChildHealthPage,
  childWelfare: childWelfarePage,
  maternity: maternityPage,
  newbornChildHealth: newbornChildHealthPage,
  healthFinancing: healthFinancingPage,
  digitization: digitizationPage
};

pageTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    state.page = tab.dataset.page;
    state.focusMetric = null;
    render();
  });
});

document.querySelectorAll(".filter-control button[data-filter]").forEach((button) => {
  button.addEventListener("click", () => openFilter(button.dataset.filter));
});

overlay.addEventListener("click", closeDialog);

render();
