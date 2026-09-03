// Main entry point — imports styles, initializes the app, and renders the root.
import "./styles.css";
import { App } from "./App.js";

// Mount the app
const root = document.getElementById("app");
root.innerHTML = App();
