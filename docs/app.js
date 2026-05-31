const API_BASE = "https://techrescue.onrender.com";

const qs = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];

function getToken() {
  return localStorage.getItem("token");
}

function decodeToken(token = getToken()) {
  if (!token || !token.includes(".")) return null;
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

function requireAuth(role) {
  const token = getToken();
  const decoded = decodeToken(token);
  if (!token || !decoded || (role && decoded.role !== role)) {
    window.location.href = "Login.html";
    return null;
  }
  return { token, decoded };
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token) headers.Authorization = "Bearer " + token;

  const res = await fetch(API_BASE + path, {
    ...options,
    headers
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message = data?.error || data?.message || "Request failed";
    throw new Error(message);
  }

  return data;
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "Login.html";
}

function setMessage(id, text, type = "") {
  const el = qs("#" + id);
  if (!el) return;
  el.textContent = text;
  el.className = "message" + (type ? " " + type : "");
  if (text && type) showToast(text, type);
}

function statusClass(status = "") {
  return String(status).toLowerCase().replace(/\s+/g, "-");
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function initials(first = "", last = "") {
  const text = `${first?.[0] || ""}${last?.[0] || ""}`.trim();
  return text ? text.toUpperCase() : "--";
}

function setupPublicNav(activePath) {
  const toggle = qs("[data-nav-toggle]");
  const nav = qs("[data-site-nav]");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  qsa("[data-site-nav] a").forEach((link) => {
    if (link.getAttribute("href") === activePath) {
      link.classList.add("active");
    }
  });
}

function renderPublicHeader(activePath = "index.html") {
  document.body.insertAdjacentHTML(
    "afterbegin",
    `<header class="site-header">
      <a class="brand" href="index.html"><span class="brand-mark">TR</span><span>TechRescue</span></a>
      <button class="nav-toggle" type="button" aria-label="Open navigation" aria-expanded="false" data-nav-toggle>
        <span></span><span></span><span></span>
      </button>
      <nav class="site-nav" data-site-nav>
        <a href="feature.html">Features</a>
        <a href="howitwork.html">How It Works</a>
        <a href="testimonial.html">Testimonials</a>
        <a href="pricing.html">Pricing</a>
        <a href="Login.html">Log In</a>
        <a class="nav-button" href="Signup.html">Sign Up</a>
      </nav>
    </header>`
  );
  setupPublicNav(activePath);
}

function renderFooter() {
  document.body.insertAdjacentHTML(
    "beforeend",
    `<footer class="site-footer">Copyright 2026 TechRescue. All rights reserved.</footer>`
  );
}

function addHomeButton() {
  if (qs("#globalHomeButton")) return;
  document.body.insertAdjacentHTML(
    "beforeend",
    `<a id="globalHomeButton" class="home-button" href="index.html" aria-label="Go to TechRescue home">
      <span class="brand-mark">TR</span><span>TechRescue</span>
    </a>`
  );
}

function showToast(text, type = "info") {
  let stack = qs("#toastStack");
  if (!stack) {
    document.body.insertAdjacentHTML("beforeend", `<div id="toastStack" class="toast-stack"></div>`);
    stack = qs("#toastStack");
  }
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = text;
  stack.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 20);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 220);
  }, 3200);
}

function setupAppShell() {
  const shell = qs(".page-shell");
  const sidebar = qs(".sidebar");
  const toggle = qs("[data-shell-toggle]");
  const overlay = qs("[data-shell-overlay]");
  if (!shell || !sidebar || !toggle || !overlay) return;

  const setOpen = (open) => {
    shell.classList.toggle("sidebar-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  };

  toggle.addEventListener("click", () => setOpen(!shell.classList.contains("sidebar-open")));
  overlay.addEventListener("click", () => setOpen(false));
  qsa(".sidebar a").forEach((link) => link.addEventListener("click", () => setOpen(false)));
}

function clientShell(active, content) {
  return `<div class="page-shell">
    <div class="shell-overlay" data-shell-overlay></div>
    <aside class="sidebar">
      <a class="brand" href="index.html"><span class="brand-mark">TR</span><span>TechRescue</span></a>
      <p class="sidebar-kicker">Client Portal</p>
      <nav>
        <a class="${active === "dashboard" ? "active" : ""}" href="client.html">Dashboard</a>
        <a class="${active === "raise" ? "active" : ""}" href="raise-query.html">Raise Query</a>
        <a class="${active === "experts" ? "active" : ""}" href="align-experts.html">Align Experts</a>
        <a class="${active === "field" ? "active" : ""}" href="field-engineers.html">Field Engineers</a>
        <a class="${active === "history" ? "active" : ""}" href="query-history.html">Query History</a>
        <a href="#" onclick="logout()">Logout</a>
      </nav>
    </aside>
    <main class="main">
      <div class="topbar">
        <button class="shell-toggle" type="button" aria-label="Open menu" aria-expanded="false" data-shell-toggle><span></span><span></span><span></span></button>
        <strong>Client Workspace</strong>
        <span class="user-chip" id="userLabel">Loading...</span>
      </div>
      <div class="content">${content}</div>
    </main>
  </div>`;
}

function expertShell(active, content) {
  return `<div class="page-shell">
    <div class="shell-overlay" data-shell-overlay></div>
    <aside class="sidebar">
      <a class="brand" href="index.html"><span class="brand-mark">TR</span><span>TechRescue</span></a>
      <p class="sidebar-kicker">Expert Portal</p>
      <nav>
        <a class="${active === "dashboard" ? "active" : ""}" href="Expert.html">Dashboard</a>
        <a class="${active === "alerts" ? "active" : ""}" href="alerts.html">Alerts</a>
        <a class="${active === "jobs" ? "active" : ""}" href="jobs.html">Jobs</a>
        <a class="${active === "messages" ? "active" : ""}" href="messages.html">Messages</a>
        <a class="${active === "profile" ? "active" : ""}" href="profile.html">Profile</a>
        <a href="#" onclick="logout()">Logout</a>
      </nav>
    </aside>
    <main class="main">
      <div class="topbar">
        <button class="shell-toggle" type="button" aria-label="Open menu" aria-expanded="false" data-shell-toggle><span></span><span></span><span></span></button>
        <strong>Expert Workspace</strong>
        <span class="user-chip" id="userLabel">Loading...</span>
      </div>
      <div class="content">${content}</div>
    </main>
  </div>`;
}

async function loadCurrentUser() {
  try {
    const user = await apiFetch("/me");
    const name = `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email || "Account";
    const label = qs("#userLabel");
    if (label) label.innerHTML = `<span>${initials(user.first_name, user.last_name)}</span>${name}`;
    return user;
  } catch {
    localStorage.removeItem("token");
    window.location.href = "Login.html";
    return null;
  }
}

document.addEventListener("DOMContentLoaded", addHomeButton);
document.addEventListener("DOMContentLoaded", setupAppShell);
