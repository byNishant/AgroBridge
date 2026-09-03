// Centralized app state and mock data store.
// All three modules read from / write to this single reactive store.
import { reactive } from "./tiny-reactive.js";

const today = new Date();
const todayISO = today.toISOString().split("T")[0];
const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const todayShort = dayNames[today.getDay()];

// Pre-populated sample data so the app looks alive on first load.
const seedTokens = [
  {
    id: "AB-108",
    farmerName: "Ramesh Singh",
    mobile: "9876543210",
    khasraId: "1234-5678-9012",
    crop: "wheat",
    quantity: 40,
    date: todayISO,
    dateShort: todayShort,
    slot: "10:00 AM – 11:00 AM",
    gate: "Gate 2",
    status: "entered",
    scanned: false,
  },
  {
    id: "AB-109",
    farmerName: "Suresh Kumar",
    mobile: "9812345678",
    khasraId: "4321-8765-1234",
    crop: "paddy",
    quantity: 55,
    date: todayISO,
    dateShort: todayShort,
    slot: "09:00 AM – 10:00 AM",
    gate: "Gate 1",
    status: "completed",
    scanned: false,
  },
  {
    id: "AB-110",
    farmerName: "Kamla Devi",
    mobile: "9899887766",
    khasraId: "9988-7766-5544",
    crop: "mustard",
    quantity: 22,
    date: todayISO,
    dateShort: todayShort,
    slot: "11:00 AM – 12:00 PM",
    gate: "Gate 2",
    status: "weighing",
    scanned: false,
  },
  {
    id: "AB-111",
    farmerName: "Arjun Patel",
    mobile: "9700081234",
    khasraId: "5566-7788-9900",
    crop: "wheat",
    quantity: 38,
    date: todayISO,
    dateShort: todayShort,
    slot: "01:00 PM – 02:00 PM",
    gate: "Gate 3",
    status: "booked",
    scanned: false,
  },
  {
    id: "AB-112",
    farmerName: "Bhola Yadav",
    mobile: "9630011223",
    khasraId: "1100-2200-3300",
    crop: "paddy",
    quantity: 60,
    date: todayISO,
    dateShort: todayShort,
    slot: "02:00 PM – 03:00 PM",
    gate: "Gate 1",
    status: "booked",
    scanned: false,
  },
];

export const store = reactive({
  // Navigation
  activeTab: "farmer",

  // Language
  lang: "en",

  // Token counter — next token number
  tokenCounter: 113,

  // All tokens / queue entries
  tokens: seedTokens,

  // The most recently booked token (for farmer confirmation view)
  lastBookedToken: null,

  // Admin capacity settings
  maxTrucksPerHour: 30,
  trucksThisHour: 12,

  // KPI values (derived from tokens but stored for live update)
  vehiclesInside: 1,
  avgWaitTime: 14,
  tonnageToday: 4200,
});

// Crop labels by language
export const cropLabels = {
  en: { wheat: "Wheat", paddy: "Paddy", mustard: "Mustard" },
  hi: { wheat: "गेहूं", paddy: "धान", mustard: "सरसों" },
};

// Crop emoji/icon for visual flair
export const cropIcons = {
  wheat: "🌾",
  paddy: "🌾",
  mustard: "🌻",
};

// Time slot definitions
export const timeSlots = [
  { id: "s1", value: "09:00 AM – 10:00 AM", labelKey: "slot_morning_1", group: "morning" },
  { id: "s2", value: "10:00 AM – 11:00 AM", labelKey: "slot_morning_2", group: "morning" },
  { id: "s3", value: "11:00 AM – 12:00 PM", labelKey: "slot_morning_3", group: "morning" },
  { id: "s4", value: "01:00 PM – 02:00 PM", labelKey: "slot_afternoon_1", group: "afternoon" },
  { id: "s5", value: "02:00 PM – 03:00 PM", labelKey: "slot_afternoon_2", group: "afternoon" },
];

// Gates
export const gates = ["Gate 1", "Gate 2", "Gate 3"];

// Status ordering for the 4-stage tracker
export const statusOrder = ["booked", "entered", "weighing", "completed"];
export const statusLabelKeys = {
  booked: "status_booked",
  entered: "status_entered",
  weighing: "status_weighing",
  completed: "status_completed",
};