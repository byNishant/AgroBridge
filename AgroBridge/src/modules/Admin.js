// Mandi Admin Dashboard Module
// Enterprise-style desktop panel with KPIs, capacity controller, congestion indicator, and live queue table.
import { store, cropLabels, cropIcons, statusOrder, statusLabelKeys } from "../store.js";
import { t, App } from "../App.js";
import { icon } from "../icons.js";

export function renderAdmin() {
  const state = store.get();
  const lang = state.lang;

  // Derive KPIs from current state
  const slotsToday = state.tokens.length;
  const vehiclesInside = state.vehiclesInside;
  const avgWait = state.avgWaitTime;
  const tonnage = state.tonnageToday;

  // Compute congestion level based on vehicles vs capacity ratio
  const ratio = state.trucksThisHour / state.maxTrucksPerHour;
  let congestionLevel, congestionClass, congestionText;
  if (ratio < 0.5) {
    congestionLevel = "green";
    congestionClass = "congestion-green";
    congestionText = t("congestion_smooth");
  } else if (ratio < 0.8) {
    congestionLevel = "amber";
    congestionClass = "congestion-amber";
    congestionText = t("congestion_moderate");
  } else {
    congestionLevel = "red";
    congestionClass = "congestion-red";
    congestionText = t("congestion_congested");
  }

  const availableSlots = Math.max(0, state.maxTrucksPerHour - state.trucksThisHour);
  const sliderPercent = (state.maxTrucksPerHour / 60) * 100;

  return `
    <div class="animate-fade-up">
      <!-- Header -->
      <div class="mb-6">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold mb-3">
          ${icon("chart", "w-3.5 h-3.5")}
          ${t("admin_title")}
        </div>
        <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-1">${t("admin_title")}</h2>
        <p class="text-slate-500 text-sm">${t("admin_subtitle")}</p>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        ${renderKPICard("kpi_slots", slotsToday, "truck", "brand")}
        ${renderKPICard("kpi_vehicles", vehiclesInside, "truck", "accent")}
        ${renderKPICard("kpi_wait", `${avgWait} <span class="text-base font-bold">${t("minutes")}</span>`, "clock", "blue")}
        ${renderKPICard("kpi_tonnage", `${tonnage.toLocaleString()} <span class="text-base font-bold">${t("qtl")}</span>`, "scale", "brand")}
      </div>

      <!-- Capacity + Congestion row -->
      <div class="grid lg:grid-cols-3 gap-4 mb-6">
        <!-- Capacity controller (2/3 width) -->
        <div class="lg:col-span-2 bg-white rounded-2xl card-shadow p-6 border border-slate-100">
          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="text-base font-bold text-slate-800 flex items-center gap-2">
                ${icon("settings", "w-5 h-5 text-brand-600")}
                ${t("capacity_heading")}
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">${t("capacity_subheading")}</p>
            </div>
          </div>

          <!-- Slider -->
          <div class="space-y-4">
            <div class="flex items-baseline justify-between">
              <span class="text-sm font-semibold text-slate-600">${t("capacity_label")}</span>
              <div class="flex items-baseline gap-1">
                <span id="capacityValue" class="text-3xl font-extrabold text-brand-700">${state.maxTrucksPerHour}</span>
                <span class="text-sm text-slate-400">${t("trucks")}</span>
              </div>
            </div>

            <input
              type="range"
              min="5"
              max="60"
              value="${state.maxTrucksPerHour}"
              oninput="window.__agroUpdateCapacity(this.value)"
              class="agro-slider"
              style="--val: ${sliderPercent}%"
            />

            <div class="flex items-center justify-between text-xs text-slate-400">
              <span>5</span>
              <span>60</span>
            </div>

            <!-- Available slots indicator -->
            <div class="flex items-center justify-between py-3 px-4 rounded-xl bg-brand-50 border border-brand-100">
              <div class="flex items-center gap-2">
                ${icon("checkCircle", "w-5 h-5 text-brand-600")}
                <span class="text-sm font-semibold text-brand-700">${t("capacity_available")}</span>
              </div>
              <div class="flex items-baseline gap-1">
                <span id="availableSlots" class="text-xl font-extrabold text-brand-700">${availableSlots}</span>
                <span class="text-xs text-brand-600">/ ${state.maxTrucksPerHour} ${t("trucks")}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Congestion status (1/3 width) -->
        <div class="bg-white rounded-2xl card-shadow p-6 border border-slate-100 flex flex-col">
          <h3 class="text-base font-bold text-slate-800 flex items-center gap-2 mb-4">
            ${icon("activity", "w-5 h-5 text-brand-600")}
            ${t("congestion_heading")}
          </h3>

          <!-- Congestion badge -->
          <div class="flex-1 flex flex-col items-center justify-center">
            <div class="relative mb-4">
              <div class="w-24 h-24 rounded-full flex items-center justify-center ${congestionLevel === 'green' ? 'bg-brand-100' : congestionLevel === 'amber' ? 'bg-accent-100' : 'bg-red-100'}">
                <div class="w-16 h-16 rounded-full flex items-center justify-center ${congestionLevel === 'green' ? 'bg-brand-500' : congestionLevel === 'amber' ? 'bg-accent-500' : 'bg-red-500'}">
                  ${icon("activity", "w-8 h-8 text-white")}
                </div>
              </div>
              <div class="absolute inset-0 rounded-full pulse-ring ${congestionLevel === 'green' ? 'bg-brand-400' : congestionLevel === 'amber' ? 'bg-accent-400' : 'bg-red-400'}"></div>
            </div>

            <div class="flex items-center gap-2 mb-2">
              <span class="congestion-dot ${congestionClass}"></span>
              <span class="text-lg font-extrabold ${congestionLevel === 'green' ? 'text-brand-700' : congestionLevel === 'amber' ? 'text-accent-700' : 'text-red-600'}">${congestionText}</span>
            </div>

            <p class="text-xs text-slate-400 text-center">
              ${state.trucksThisHour} ${t("of")} ${state.maxTrucksPerHour} ${t("trucks")}
            </p>
          </div>
        </div>
      </div>

      <!-- Live procurement queue table -->
      <div class="bg-white rounded-2xl card-shadow border border-slate-100 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 class="text-base font-bold text-slate-800 flex items-center gap-2">
              ${icon("users", "w-5 h-5 text-brand-600")}
              ${t("queue_heading")}
            </h3>
            <p class="text-xs text-slate-500 mt-0.5">${t("queue_subheading")}</p>
          </div>
          <div class="flex items-center gap-2 text-xs text-slate-400">
            <span class="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
            Live
          </div>
        </div>

        <!-- Table (desktop) / Cards (mobile) -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-slate-100 bg-slate-50/50">
                <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">${t("col_token")}</th>
                <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">${t("col_farmer")}</th>
                <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">${t("col_crop")}</th>
                <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">${t("col_weight")}</th>
                <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">${t("col_slot")}</th>
                <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">${t("col_status")}</th>
                <th class="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">${t("col_actions")}</th>
              </tr>
            </thead>
            <tbody id="queueBody">
              ${state.tokens.map((tk) => renderQueueRow(tk, lang)).join("")}
            </tbody>
          </table>
        </div>

        <!-- Mobile cards -->
        <div class="md:hidden divide-y divide-slate-100">
          ${state.tokens.map((tk) => renderQueueCard(tk, lang)).join("")}
        </div>
      </div>
    </div>
  `;
}

// ===== KPI Card =====
function renderKPICard(labelKey, value, iconName, colorScheme) {
  const colorMap = {
    brand: { bg: "bg-brand-50", text: "text-brand-700", icon: "text-brand-600" },
    accent: { bg: "bg-accent-50", text: "text-accent-700", icon: "text-accent-600" },
    blue: { bg: "bg-blue-50", text: "text-blue-700", icon: "text-blue-600" },
  };
  const c = colorMap[colorScheme] || colorMap.brand;

  return `
    <div class="bg-white rounded-2xl card-shadow p-5 border border-slate-100 hover:card-shadow-lg transition-shadow stagger-1">
      <div class="flex items-center justify-between mb-3">
        <div class="w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center ${c.icon}">
          ${icon(iconName, "w-5 h-5")}
        </div>
      </div>
      <p class="text-2xl sm:text-3xl font-extrabold text-slate-800 leading-none">${value}</p>
      <p class="text-xs text-slate-500 font-medium mt-1.5">${t(labelKey)}</p>
    </div>
  `;
}

// ===== Queue Table Row (desktop) =====
function renderQueueRow(tk, lang) {
  const cropName = cropLabels[lang][tk.crop] || tk.crop;
  const cropIcon = cropIcons[tk.crop] || "🌾";
  const statusIdx = statusOrder.indexOf(tk.status);
  const statusClass = `status-${tk.status}`;
  const nextAction = getNextAction(tk.status);
  const actionLabelKey = nextAction ? nextAction.labelKey : null;
  const actionFn = nextAction ? nextAction.fn : null;

  return `
    <tr class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors" data-token-id="${tk.id}">
      <td class="px-6 py-4">
        <span class="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-sm font-extrabold text-slate-700">#${tk.id}</span>
      </td>
      <td class="px-6 py-4 text-sm font-semibold text-slate-800">${tk.farmerName}</td>
      <td class="px-6 py-4 text-sm text-slate-600">${cropIcon} ${cropName}</td>
      <td class="px-6 py-4 text-sm font-semibold text-slate-700">${tk.quantity}</td>
      <td class="px-6 py-4 text-sm text-slate-600">${tk.slot}</td>
      <td class="px-6 py-4">
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${statusClass}">
          ${icon("check", "w-3 h-3")}
          ${t(statusLabelKeys[tk.status])}
        </span>
      </td>
      <td class="px-6 py-4 text-right">
        ${actionLabelKey ? `
          <button
            onclick="${actionFn}('${tk.id}')"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition-colors"
          >
            ${icon("arrowRight", "w-3.5 h-3.5")}
            ${t(actionLabelKey)}
          </button>
        ` : `
          <span class="inline-flex items-center gap-1 text-xs text-brand-600 font-semibold">
            ${icon("checkCircle", "w-4 h-4")}
            ${t("status_completed")}
          </span>
        `}
      </td>
    </tr>
  `;
}

// ===== Queue Card (mobile) =====
function renderQueueCard(tk, lang) {
  const cropName = cropLabels[lang][tk.crop] || tk.crop;
  const cropIcon = cropIcons[tk.crop] || "🌾";
  const statusClass = `status-${tk.status}`;
  const nextAction = getNextAction(tk.status);
  const actionLabelKey = nextAction ? nextAction.labelKey : null;
  const actionFn = nextAction ? nextAction.fn : null;

  return `
    <div class="p-4 space-y-3" data-token-id="${tk.id}">
      <div class="flex items-center justify-between">
        <span class="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-sm font-extrabold text-slate-700">#${tk.id}</span>
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${statusClass}">
          ${t(statusLabelKeys[tk.status])}
        </span>
      </div>
      <div class="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p class="text-xs text-slate-400">${t("col_farmer")}</p>
          <p class="font-semibold text-slate-800">${tk.farmerName}</p>
        </div>
        <div>
          <p class="text-xs text-slate-400">${t("col_crop")}</p>
          <p class="font-semibold text-slate-800">${cropIcon} ${cropName}</p>
        </div>
        <div>
          <p class="text-xs text-slate-400">${t("col_weight")}</p>
          <p class="font-semibold text-slate-800">${tk.quantity} ${t("qtl")}</p>
        </div>
        <div>
          <p class="text-xs text-slate-400">${t("col_slot")}</p>
          <p class="font-semibold text-slate-800">${tk.slot}</p>
        </div>
      </div>
      ${actionLabelKey ? `
        <button
          onclick="${actionFn}('${tk.id}')"
          class="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition-colors"
        >
          ${icon("arrowRight", "w-3.5 h-3.5")}
          ${t(actionLabelKey)}
        </button>
      ` : `
        <div class="flex items-center justify-center gap-1 text-xs text-brand-600 font-semibold py-2">
          ${icon("checkCircle", "w-4 h-4")}
          ${t("status_completed")}
        </div>
      `}
    </div>
  `;
}

// Determine the next action for a token based on its current status
function getNextAction(status) {
  switch (status) {
    case "booked":
      return { labelKey: "action_mark_entry", fn: "window.__agroMarkEntry" };
    case "entered":
      return { labelKey: "action_weighing", fn: "window.__agroStartWeighing" };
    case "weighing":
      return { labelKey: "action_payment", fn: "window.__agroCompletePayment" };
    default:
      return null;
  }
}

// ===== Action handlers =====

window.__agroUpdateCapacity = function (val) {
  const state = store.get();
  const numVal = parseInt(val, 10);
  const sliderPercent = (numVal / 60) * 100;
  const available = Math.max(0, numVal - state.trucksThisHour);

  // Update slider visual
  const slider = document.querySelector(".agro-slider");
  if (slider) slider.style.setProperty("--val", `${sliderPercent}%`);

  // Update displayed values live without full re-render
  const capVal = document.getElementById("capacityValue");
  if (capVal) capVal.textContent = numVal;

  const availEl = document.getElementById("availableSlots");
  if (availEl) availEl.textContent = available;

  // Update store (triggers re-render for congestion badge)
  store.set({ maxTrucksPerHour: numVal });
};

window.__agroMarkEntry = function (tokenId) {
  const state = store.get();
  const updatedTokens = state.tokens.map((tk) =>
    tk.id === tokenId ? { ...tk, status: "entered" } : tk
  );
  store.set({
    tokens: updatedTokens,
    vehiclesInside: state.vehiclesInside + 1,
  });
};

window.__agroStartWeighing = function (tokenId) {
  const state = store.get();
  const updatedTokens = state.tokens.map((tk) =>
    tk.id === tokenId ? { ...tk, status: "weighing" } : tk
  );
  store.set({ tokens: updatedTokens });
};

window.__agroCompletePayment = function (tokenId) {
  const state = store.get();
  const token = state.tokens.find((tk) => tk.id === tokenId);
  const updatedTokens = state.tokens.map((tk) =>
    tk.id === tokenId ? { ...tk, status: "completed" } : tk
  );
  store.set({
    tokens: updatedTokens,
    vehiclesInside: Math.max(0, state.vehiclesInside - 1),
    tonnageToday: state.tonnageToday + (token ? token.quantity : 0),
  });
};
