// Gatekeeper Scanner Module
// Smartphone-optimized view for gate security to scan and verify farmer tokens.
import { store, cropLabels, cropIcons, statusOrder, statusLabelKeys } from "../store.js";
import { t, App } from "../App.js";
import { icon } from "../icons.js";

// Local UI state for the gatekeeper module
let gatekeeperState = {
  scanning: false,
  scanResult: null, // null | "success" | "warning" | "invalid"
  scannedToken: null,
};

export function renderGatekeeper() {
  const state = store.get();
  const lang = state.lang;

  return `
    <div class="animate-fade-up max-w-md mx-auto">
      <!-- Header -->
      <div class="text-center mb-6">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold mb-3">
          ${icon("scan", "w-3.5 h-3.5")}
          ${t("gatekeeper_title")}
        </div>
        <h2 class="text-2xl font-extrabold text-slate-800 mb-1">${t("scanner_heading")}</h2>
        <p class="text-slate-500 text-sm">${t("gatekeeper_subtitle")}</p>
      </div>

      ${renderScannerView(lang)}
    </div>
  `;
}

function renderScannerView(lang) {
  // If we have a scan result, show the result card
  if (gatekeeperState.scanResult && gatekeeperState.scannedToken) {
    return renderScanResult(gatekeeperState.scanResult, gatekeeperState.scannedToken, lang);
  }

  // Otherwise show the scanner camera view
  return `
    <div class="bg-white rounded-2xl card-shadow p-6 border border-slate-100">
      <!-- Scanner viewport -->
      <div class="relative w-full aspect-square max-w-xs mx-auto rounded-2xl overflow-hidden bg-slate-900 border-4 border-slate-200">
        <!-- Simulated camera background -->
        <div class="absolute inset-0 bg-gradient-to-b from-slate-800 via-slate-900 to-black"></div>

        <!-- Scanner overlay frame -->
        <div class="absolute inset-8 rounded-xl border-2 border-brand-400/60">
          <!-- Corner accents -->
          <div class="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-brand-400 rounded-tl-lg"></div>
          <div class="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-brand-400 rounded-tr-lg"></div>
          <div class="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-brand-400 rounded-bl-lg"></div>
          <div class="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-brand-400 rounded-br-lg"></div>

          <!-- Scanning line animation -->
          ${gatekeeperState.scanning ? `
            <div class="scanner-line absolute left-0 right-0 h-0.5 bg-brand-400 shadow-lg shadow-brand-400/50" style="top: 8%;"></div>
          ` : ''}

          <!-- Center icon -->
          <div class="absolute inset-0 flex items-center justify-center">
            ${gatekeeperState.scanning
              ? `<div class="text-brand-400 text-sm font-semibold animate-pulse">${t("scanner_frame")}</div>`
              : icon("scan", "w-16 h-16 text-slate-600")
            }
          </div>
        </div>
      </div>

      <p class="text-center text-sm text-slate-500 mt-4 mb-5">${t("scanner_instruction")}</p>

      <!-- Scan buttons -->
      <div class="space-y-2.5">
        <button
          onclick="window.__agroSimulateScan('success')"
          class="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-brand-600 text-white font-bold text-sm shadow-lg shadow-brand-600/30 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all"
        >
          ${icon("scan", "w-5 h-5")}
          ${t("btn_simulate_scan")}
        </button>
        <div class="grid grid-cols-2 gap-2.5">
          <button
            onclick="window.__agroSimulateScan('warning')"
            class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent-50 border border-accent-200 text-accent-700 font-semibold text-xs hover:bg-accent-100 transition-all"
          >
            ${icon("alert", "w-4 h-4")}
            ${t("btn_simulate_early")}
          </button>
          <button
            onclick="window.__agroSimulateScan('invalid')"
            class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 font-semibold text-xs hover:bg-red-100 transition-all"
          >
            ${icon("xCircle", "w-4 h-4")}
            ${t("btn_simulate_invalid")}
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderScanResult(result, token, lang) {
  const cropName = cropLabels[lang][token.crop] || token.crop;
  const cropIcon = cropIcons[token.crop] || "🌾";

  if (result === "success") {
    return `
      <div class="animate-scale-in">
        <!-- Green success card -->
        <div class="bg-white rounded-2xl card-shadow-lg overflow-hidden border-2 border-brand-200">
          <!-- Success header -->
          <div class="bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-4 flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              ${icon("checkCircle", "w-7 h-7 text-white")}
            </div>
            <div>
              <p class="text-white font-extrabold text-lg">${t("scan_success")}</p>
              <p class="text-white/80 text-xs">Token #${token.id}</p>
            </div>
          </div>

          <!-- Token details -->
          <div class="p-6 space-y-3">
            <div class="grid grid-cols-1 gap-3">
              <div class="flex items-center justify-between py-2.5 px-4 rounded-xl bg-slate-50">
                <span class="text-sm text-slate-500 font-medium">${t("farmer_label")}</span>
                <span class="text-sm font-bold text-slate-800">${token.farmerName}</span>
              </div>
              <div class="flex items-center justify-between py-2.5 px-4 rounded-xl bg-slate-50">
                <span class="text-sm text-slate-500 font-medium">${t("crop_label")}</span>
                <span class="text-sm font-bold text-slate-800">${cropIcon} ${cropName}</span>
              </div>
              <div class="flex items-center justify-between py-2.5 px-4 rounded-xl bg-slate-50">
                <span class="text-sm text-slate-500 font-medium">${t("weight_label")}</span>
                <span class="text-sm font-bold text-slate-800">${token.quantity} ${t("qtl")}</span>
              </div>
              <div class="flex items-center justify-between py-2.5 px-4 rounded-xl bg-slate-50">
                <span class="text-sm text-slate-500 font-medium">${t("slot_label")}</span>
                <span class="text-sm font-bold text-slate-800">${token.slot}</span>
              </div>
              <div class="flex items-center justify-between py-2.5 px-4 rounded-xl bg-slate-50">
                <span class="text-sm text-slate-500 font-medium">${t("gate_label")}</span>
                <span class="text-sm font-bold text-slate-800">${token.gate}</span>
              </div>
            </div>

            <!-- Approve button -->
            <button
              onclick="window.__agroApproveEntry('${token.id}')"
              class="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 text-white font-bold text-base shadow-lg shadow-brand-600/30 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              ${icon("check", "w-5 h-5")}
              ${t("btn_approve_entry")}
            </button>
          </div>
        </div>

        <button
          onclick="window.__agroScanAgain()"
          class="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white border-2 border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all"
        >
          ${icon("refresh", "w-4 h-4")}
          ${t("btn_scan_again")}
        </button>
      </div>
    `;
  }

  // Warning or invalid card (red alert)
  const isInvalid = result === "invalid";
  const titleKey = isInvalid ? "scan_invalid" : "scan_warning";
  const msgKey = isInvalid ? "warn_invalid" : "warn_early";

  return `
    <div class="animate-scale-in">
      <div class="bg-white rounded-2xl card-shadow-lg overflow-hidden border-2 border-red-200">
        <!-- Red alert header -->
        <div class="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 flex items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            ${icon("alert", "w-7 h-7 text-white")}
          </div>
          <div>
            <p class="text-white font-extrabold text-lg">${t(titleKey)}</p>
            <p class="text-white/80 text-xs">Token #${token.id}</p>
          </div>
        </div>

        <!-- Warning details -->
        <div class="p-6 space-y-4">
          <div class="flex items-start gap-3 py-3 px-4 rounded-xl bg-red-50 border border-red-100">
            ${icon("alert", "w-5 h-5 text-red-500 flex-shrink-0 mt-0.5")}
            <p class="text-sm font-semibold text-red-700">${t(msgKey)}</p>
          </div>

          ${!isInvalid ? `
            <div class="space-y-2">
              <div class="flex items-center justify-between py-2.5 px-4 rounded-xl bg-slate-50">
                <span class="text-sm text-slate-500 font-medium">${t("farmer_label")}</span>
                <span class="text-sm font-bold text-slate-800">${token.farmerName}</span>
              </div>
              <div class="flex items-center justify-between py-2.5 px-4 rounded-xl bg-slate-50">
                <span class="text-sm text-slate-500 font-medium">${t("slot_label")}</span>
                <span class="text-sm font-bold text-slate-800">${token.slot}</span>
              </div>
            </div>
          ` : ''}

          <button
            onclick="window.__agroScanAgain()"
            class="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-all"
          >
            ${icon("arrowLeft", "w-4 h-4")}
            ${t("btn_scan_again")}
          </button>
        </div>
      </div>
    </div>
  `;
}

// ===== Action handlers =====

window.__agroSimulateScan = function (type) {
  gatekeeperState.scanning = true;
  rerender();

  // Simulate scanning delay
  setTimeout(() => {
    const state = store.get();
    const tokens = state.tokens;

    if (type === "success") {
      // Find a token with status "booked" or "entered" — a valid token for entry
      const validToken = tokens.find((tk) => tk.status === "booked" || tk.status === "entered") || tokens[0];
      gatekeeperState.scannedToken = validToken;
      gatekeeperState.scanResult = "success";
    } else if (type === "warning") {
      // Use a valid token but flag as early arrival
      const token = tokens.find((tk) => tk.status === "booked") || tokens[0];
      gatekeeperState.scannedToken = token;
      gatekeeperState.scanResult = "warning";
    } else {
      // Invalid — use a fake token
      gatekeeperState.scannedToken = { id: "XX-999", farmerName: "Unknown", crop: "wheat", quantity: 0, slot: "N/A", gate: "N/A" };
      gatekeeperState.scanResult = "invalid";
    }

    gatekeeperState.scanning = false;
    rerender();
  }, 1500);
};

window.__agroApproveEntry = function (tokenId) {
  const state = store.get();
  const updatedTokens = state.tokens.map((tk) => {
    if (tk.id === tokenId) {
      // Move from "booked" to "entered" (or keep entered)
      const newStatus = tk.status === "booked" ? "entered" : tk.status;
      return { ...tk, status: newStatus, scanned: true };
    }
    return tk;
  });

  // Update KPI: vehicles inside +1
  store.set({
    tokens: updatedTokens,
    vehiclesInside: state.vehiclesInside + 1,
  });

  // Reset gatekeeper to scanner
  gatekeeperState.scanResult = null;
  gatekeeperState.scannedToken = null;
  rerender();
};

window.__agroScanAgain = function () {
  gatekeeperState.scanResult = null;
  gatekeeperState.scannedToken = null;
  gatekeeperState.scanning = false;
  rerender();
};

function rerender() {
  const root = document.getElementById("app");
  root.innerHTML = App();
}
