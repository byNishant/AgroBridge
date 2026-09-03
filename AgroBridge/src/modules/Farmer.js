// Farmer Portal Module
// Step 1: Slot booking form with validation
// Step 2: Digital token & gate pass with QR, 4-stage status tracker, SMS simulation
import { store, cropLabels, cropIcons, timeSlots, gates, statusOrder, statusLabelKeys } from "../store.js";
import { t, App } from "../App.js";
import { icon } from "../icons.js";
import { generateQRDataURL } from "../qr.js";

// Local UI state for the farmer module
let farmerState = {
  showToken: false,    // whether to show the token/gate pass view
  validationError: "",
  selectedSlot: null,
  qrDataURL: null,
};

export function renderFarmer() {
  const state = store.get();
  const lang = state.lang;

  // If a token was just booked, show the token/gate pass view
  if (farmerState.showToken && state.lastBookedToken) {
    return renderTokenPass(state.lastBookedToken, lang);
  }

  // Otherwise show the booking form
  return renderBookingForm(lang);
}

// ===== Step 1: Booking Form =====
function renderBookingForm(lang) {
  const today = new Date().toISOString().split("T")[0];

  return `
    <div class="animate-fade-up">
      <!-- Hero section -->
      <div class="mb-6 text-center sm:text-left">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold mb-3">
          ${icon("wheat", "w-3.5 h-3.5")}
          ${t("farmer_title")}
        </div>
        <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-1">${t("booking_heading")}</h2>
        <p class="text-slate-500 text-sm sm:text-base">${t("booking_subheading")}</p>
      </div>

      <!-- Form card -->
      <div class="max-w-2xl mx-auto bg-white rounded-2xl card-shadow p-6 sm:p-8 border border-slate-100">
        <form id="bookingForm" onsubmit="return false;" class="space-y-5">

          <!-- Full Name -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1.5">${t("field_fullname")}</label>
            <input
              type="text"
              id="f_name"
              placeholder="${t('field_fullname_ph')}"
              class="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm transition-all"
            />
          </div>

          <!-- Mobile + ID row -->
          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1.5">${t("field_mobile")}</label>
              <input
                type="tel"
                id="f_mobile"
                placeholder="${t('field_mobile_ph')}"
                maxlength="10"
                class="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm transition-all"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1.5">${t("field_id")}</label>
              <input
                type="text"
                id="f_khasra"
                placeholder="${t('field_id_ph')}"
                class="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm transition-all"
              />
            </div>
          </div>

          <!-- Crop + Quantity row -->
          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1.5">${t("field_crop")}</label>
              <select id="f_crop" class="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm transition-all bg-white">
                <option value="">${t("field_crop_ph")}</option>
                <option value="wheat">${cropIcons.wheat} ${cropLabels[lang].wheat}</option>
                <option value="paddy">${cropIcons.paddy} ${cropLabels[lang].paddy}</option>
                <option value="mustard">${cropIcons.mustard} ${cropLabels[lang].mustard}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1.5">${t("field_quantity")}</label>
              <input
                type="number"
                id="f_qty"
                placeholder="${t('field_quantity_ph')}"
                min="1"
                class="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm transition-all"
              />
            </div>
          </div>

          <!-- Date -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1.5">${t("field_date")}</label>
            <input
              type="date"
              id="f_date"
              value="${today}"
              min="${today}"
              class="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm transition-all"
            />
          </div>

          <!-- Time slot cards -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">${t("field_slot")}</label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5" id="slotCards">
              ${timeSlots.map((slot, i) => `
                <div
                  onclick="window.__agroSelectSlot('${slot.id}')"
                  data-slot-id="${slot.id}"
                  class="slot-card cursor-pointer flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-slate-200 hover:border-brand-300 hover:bg-brand-50/50 transition-all text-sm font-medium text-slate-700"
                >
                  <div class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 slot-icon">
                    ${icon("clock", "w-4 h-4")}
                  </div>
                  <span>${t(slot.labelKey)}</span>
                </div>
              `).join("")}
            </div>
          </div>

          <!-- Validation error -->
          <div id="formError" class="hidden items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
            ${icon("alert", "w-4 h-4")}
            <span id="formErrorText"></span>
          </div>

          <!-- Submit button -->
          <button
            onclick="window.__agroSubmitBooking()"
            class="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 text-white font-bold text-base shadow-lg shadow-brand-600/30 hover:shadow-xl hover:shadow-brand-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            ${icon("check", "w-5 h-5")}
            ${t("btn_book_slot")}
          </button>
        </form>
      </div>
    </div>
  `;
}

// ===== Step 2: Token & Gate Pass =====
function renderTokenPass(token, lang) {
  const cropName = cropLabels[lang][token.crop] || token.crop;
  const cropIcon = cropIcons[token.crop] || "🌾";
  const stageIndex = statusOrder.indexOf(token.status);
  const smsText = `AgroBridge: Your Token #${token.id} is confirmed for ${token.dateShort} ${token.slot} at ${token.gate}.`;

  return `
    <div class="animate-fade-up max-w-2xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-6">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-100 text-brand-700 text-sm font-semibold mb-2 animate-scale-in">
          ${icon("checkCircle", "w-4 h-4")}
          ${t("token_heading")}
        </div>
        <p class="text-slate-500 text-sm">${t("qr_instruction")}</p>
      </div>

      <!-- Gate Pass Card -->
      <div class="bg-white rounded-2xl card-shadow-lg overflow-hidden border border-slate-100">
        <!-- Card header strip -->
        <div class="bg-gradient-to-r from-brand-600 to-brand-700 px-6 py-4 flex items-center justify-between">
          <div class="text-white">
            <p class="text-xs font-medium opacity-90">${t("gate_pass")}</p>
            <p class="text-lg font-extrabold tracking-tight">AgroBridge</p>
          </div>
          ${icon("leaf", "w-8 h-8 text-white opacity-80")}
        </div>

        <!-- Token badge + QR -->
        <div class="p-6 flex flex-col sm:flex-row gap-6 items-center">
          <!-- Left: Token info -->
          <div class="flex-1 w-full space-y-3">
            <!-- Token badge -->
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-100 border-2 border-accent-400">
              <span class="text-xs font-semibold text-accent-700 uppercase tracking-wider">${t("token_badge")}</span>
              <span class="text-2xl font-extrabold text-accent-700">#${token.id}</span>
            </div>

            <!-- Info rows -->
            <div class="grid grid-cols-2 gap-3 pt-2">
              <div class="space-y-0.5">
                <p class="text-xs text-slate-400 font-medium">${t("farmer_name")}</p>
                <p class="text-sm font-semibold text-slate-800">${token.farmerName}</p>
              </div>
              <div class="space-y-0.5">
                <p class="text-xs text-slate-400 font-medium">${t("crop_label")}</p>
                <p class="text-sm font-semibold text-slate-800">${cropIcon} ${cropName}</p>
              </div>
              <div class="space-y-0.5">
                <p class="text-xs text-slate-400 font-medium">${t("qty_label")}</p>
                <p class="text-sm font-semibold text-slate-800">${token.quantity} ${t("qtl")}</p>
              </div>
              <div class="space-y-0.5">
                <p class="text-xs text-slate-400 font-medium">${t("gate_label")}</p>
                <p class="text-sm font-semibold text-slate-800">${token.gate}</p>
              </div>
              <div class="space-y-0.5">
                <p class="text-xs text-slate-400 font-medium">${t("date_label")}</p>
                <p class="text-sm font-semibold text-slate-800">${token.dateShort}</p>
              </div>
              <div class="space-y-0.5">
                <p class="text-xs text-slate-400 font-medium">${t("slot_label")}</p>
                <p class="text-sm font-semibold text-slate-800">${token.slot}</p>
              </div>
            </div>
          </div>

          <!-- Right: QR code -->
          <div class="flex flex-col items-center gap-2">
            <div class="p-3 bg-white rounded-xl border-2 border-slate-100">
              <img id="qrImg" src="${farmerState.qrDataURL || ''}" alt="QR Code" class="w-40 h-40" />
            </div>
            <p class="text-xs text-slate-400 text-center max-w-[180px]">${t("qr_instruction")}</p>
          </div>
        </div>

        <!-- 4-stage status tracker -->
        <div class="px-6 pb-6">
          <h3 class="text-sm font-bold text-slate-700 mb-3">${t("status_tracker")}</h3>
          <div class="flex items-center justify-between relative">
            <!-- Progress line background -->
            <div class="absolute top-5 left-5 right-5 h-1 bg-slate-100 rounded-full"></div>
            <!-- Progress line fill -->
            <div class="absolute top-5 left-5 h-1 bg-brand-500 rounded-full transition-all duration-500" style="width: ${(stageIndex / (statusOrder.length - 1)) * 100}%"></div>
            ${statusOrder.map((status, i) => {
              const isDone = i <= stageIndex;
              const isCurrent = i === stageIndex;
              const labelKey = statusLabelKeys[status];
              const bg = isDone ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-400";
              const ring = isCurrent ? "ring-4 ring-brand-200" : "";
              return `
                <div class="flex flex-col items-center gap-1.5 z-10 flex-1">
                  <div class="w-10 h-10 rounded-full ${bg} ${ring} flex items-center justify-center transition-all duration-300">
                    ${isDone ? icon("check", "w-5 h-5") : icon("clock", "w-4 h-4")}
                  </div>
                  <span class="text-[10px] sm:text-xs font-semibold text-center ${isDone ? 'text-brand-700' : 'text-slate-400'}">${t(labelKey)}</span>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      </div>

      <!-- SMS simulation card -->
      <div class="mt-4 bg-slate-900 rounded-2xl p-5 text-white">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0">
            ${icon("message", "w-5 h-5 text-accent-400")}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-1">
              <h4 class="text-sm font-bold">${t("sms_heading")}</h4>
              <span class="text-xs text-slate-400">${t("sms_simulated")}</span>
            </div>
            <p class="text-xs text-slate-400 mb-2">${t("sms_sent")}: +91 ${token.mobile}</p>
            <div class="bg-slate-800 rounded-xl px-4 py-3">
              <p class="text-sm leading-relaxed">${smsText}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Action: Book another -->
      <div class="mt-6 text-center">
        <button
          onclick="window.__agroBookAnother()"
          class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border-2 border-brand-200 text-brand-700 font-semibold text-sm hover:bg-brand-50 hover:border-brand-400 transition-all"
        >
          ${icon("arrowLeft", "w-4 h-4")}
          ${t("btn_book_new")}
        </button>
      </div>
    </div>
  `;
}

// ===== Action handlers =====

window.__agroSelectSlot = function (slotId) {
  farmerState.selectedSlot = slotId;
  // Update visual selection on slot cards
  document.querySelectorAll(".slot-card").forEach((card) => {
    const id = card.dataset.slotId;
    if (id === slotId) {
      card.classList.remove("border-slate-200", "hover:border-brand-300");
      card.classList.add("border-brand-500", "bg-brand-50", "ring-2", "ring-brand-200");
      card.querySelector(".slot-icon").classList.remove("bg-slate-100", "text-slate-400");
      card.querySelector(".slot-icon").classList.add("bg-brand-600", "text-white");
    } else {
      card.classList.remove("border-brand-500", "bg-brand-50", "ring-2", "ring-brand-200");
      card.classList.add("border-slate-200");
      card.querySelector(".slot-icon").classList.remove("bg-brand-600", "text-white");
      card.querySelector(".slot-icon").classList.add("bg-slate-100", "text-slate-400");
    }
  });
};

window.__agroSubmitBooking = async function () {
  const name = document.getElementById("f_name").value.trim();
  const mobile = document.getElementById("f_mobile").value.trim();
  const khasra = document.getElementById("f_khasra").value.trim();
  const crop = document.getElementById("f_crop").value;
  const qty = document.getElementById("f_qty").value;
  const date = document.getElementById("f_date").value;

  // Validate
  const errorEl = document.getElementById("formError");
  const errorText = document.getElementById("formErrorText");

  if (!name || !mobile || !khasra || !crop || !qty || !date || !farmerState.selectedSlot) {
    errorEl.classList.remove("hidden");
    errorEl.classList.add("flex");
    errorText.textContent = t("validation_required");
    return;
  }

  if (!/^\d{10}$/.test(mobile)) {
    errorEl.classList.remove("hidden");
    errorEl.classList.add("flex");
    errorText.textContent = t("validation_mobile");
    return;
  }

  errorEl.classList.add("hidden");

  // Create token
  const state = store.get();
  const tokenNum = state.tokenCounter;
  const slotObj = timeSlots.find((s) => s.id === farmerState.selectedSlot);
  const gate = gates[tokenNum % gates.length];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dateObj = new Date(date);
  const dateShort = dayNames[dateObj.getDay()];

  const newToken = {
    id: `AB-${tokenNum}`,
    farmerName: name,
    mobile,
    khasraId: khasra,
    crop,
    quantity: parseInt(qty, 10),
    date,
    dateShort,
    slot: slotObj.value,
    gate,
    status: "booked",
    scanned: false,
  };

  // Generate QR code
  const qrPayload = `AGROBRIDGE|${newToken.id}|${name}|${crop}|${qty}|${slotObj.value}|${gate}`;
  const qrURL = await generateQRDataURL(qrPayload, { width: 200 });

  farmerState.qrDataURL = qrURL;
  farmerState.showToken = true;

  // Update store
  store.set({
    tokenCounter: tokenNum + 1,
    tokens: [newToken, ...state.tokens],
    lastBookedToken: newToken,
    tonnageToday: state.tonnageToday + parseInt(qty, 10),
  });
};

window.__agroBookAnother = function () {
  farmerState.showToken = false;
  farmerState.selectedSlot = null;
  farmerState.qrDataURL = null;
  farmerState.validationError = "";
  // Keep lastBookedToken in store so admin sees it, but reset the farmer view
  rerender();
};

function rerender() {
  const root = document.getElementById("app");
  root.innerHTML = App();
}
