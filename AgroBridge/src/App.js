// App shell — header with brand, language toggle, and role tab switcher.
// Renders the active module (Farmer, Gatekeeper, or Admin) and handles re-renders.
import { store } from "./store.js";
import { translations } from "./i18n.js";
import { icon } from "./icons.js";
import { renderFarmer } from "./modules/Farmer.js";
import { renderGatekeeper } from "./modules/Gatekeeper.js";
import { renderAdmin } from "./modules/Admin.js";

// Translation helper bound to current store language
export function t(key) {
  const lang = store.get().lang;
  return (translations[lang] && translations[lang][key]) || key;
}

// Tab definitions
const tabs = [
  { id: "farmer", labelKey: "nav_farmer", icon: "wheat" },
  { id: "gatekeeper", labelKey: "nav_gatekeeper", icon: "scan" },
  { id: "admin", labelKey: "nav_admin", icon: "chart" },
];

// Render the header (brand + language toggle + tabs)
function renderHeader() {
  const state = store.get();
  const lang = state.lang;

  return `
    <header class="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 no-print">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Brand row -->
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white shadow-md shadow-brand-600/30">
              ${icon("leaf", "w-5 h-5")}
            </div>
            <div>
              <h1 class="text-lg font-extrabold text-brand-700 leading-none tracking-tight">${t("brand")}</h1>
              <p class="text-[10px] text-slate-500 leading-none mt-0.5 hidden sm:block">${t("tagline")}</p>
            </div>
          </div>

          <!-- Language toggle -->
          <button
            onclick="window.__agroToggleLang()"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-brand-300 hover:bg-brand-50 transition-colors text-sm font-semibold text-slate-700"
            aria-label="Toggle language"
          >
            <svg class="w-4 h-4 text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            ${t("lang_label")}
          </button>
        </div>

        <!-- Tab switcher -->
        <nav class="flex gap-1 pb-2 -mb-px overflow-x-auto">
          ${tabs.map(tab => {
            const active = state.activeTab === tab.id;
            const colors = active
              ? "bg-brand-600 text-white shadow-md shadow-brand-600/25"
              : "text-slate-600 hover:bg-slate-100";
            return `
              <button
                onclick="window.__agroSwitchTab('${tab.id}')"
                class="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 ${colors}"
              >
                ${icon(tab.icon, "w-4 h-4")}
                ${t(tab.labelKey)}
              </button>
            `;
          }).join("")}
        </nav>
      </div>
    </header>
  `;
}

// Render the active module content
function renderContent() {
  const tab = store.get().activeTab;
  if (tab === "farmer") return renderFarmer();
  if (tab === "gatekeeper") return renderGatekeeper();
  if (tab === "admin") return renderAdmin();
  return "";
}

// Main App render function
export function App() {
  const state = store.get();
  const langClass = state.lang === "hi" ? "lang-hi" : "";

  return `
    <div class="min-h-screen ${langClass}">
      ${renderHeader()}
      <main class="tab-panel max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8" id="agro-content">
        ${renderContent()}
      </main>
      <footer class="no-print text-center py-6 text-xs text-slate-400 border-t border-slate-100 mt-8">
        AgroBridge &middot; Smart APMC Procurement & Slot Booking &middot; Competition Prototype
      </footer>
    </div>
  `;
}

// ===== Global action handlers (exposed on window) =====

window.__agroToggleLang = function () {
  const current = store.get().lang;
  store.set({ lang: current === "en" ? "hi" : "en" });
};

window.__agroSwitchTab = function (tabId) {
  store.set({ activeTab: tabId });
  setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
};

// Re-render the entire app into the root element
function rerender() {
  const root = document.getElementById("app");
  root.innerHTML = App();
  // Update body language class
  if (store.get().lang === "hi") {
    document.body.classList.add("lang-hi");
  } else {
    document.body.classList.remove("lang-hi");
  }
  // After re-render, call any post-render hooks for the active module
  if (typeof window.__agroPostRender === "function") {
    window.__agroPostRender();
  }
}

// Subscribe to store changes for auto re-render
store.subscribe(() => rerender());

// Set body language class on initial load
if (store.get().lang === "hi") {
  document.body.classList.add("lang-hi");
}
