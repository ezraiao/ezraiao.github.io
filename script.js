// ---------- Lab zone explorer ----------
// No real IP addresses or credentials are published here on purpose.
const ZONES = {
  outside: {
    title: "Outside",
    color: "--z0",
    purpose: "The internet side of the edge firewall. Nothing here is trusted, so it only reaches the specific services published in the DMZ and the VPN portal.",
    hosts: ["Public interface of the Palo Alto PA-440", "GlobalProtect VPN portal"],
    rules: ["Inbound only to published DMZ services and the VPN", "RDP is never exposed directly"],
  },
  dmz: {
    title: "DMZ",
    color: "--z1",
    purpose: "Services that outside users need to reach live here, isolated so a compromised web server can't walk into the internal network.",
    hosts: ["IIS web servers behind a load balancer", "Apache Guacamole ZTNA gateway (Docker + PostgreSQL)"],
    rules: ["Cannot open connections into Inside or Secure", "Remote desktop goes through Guacamole after VPN + Duo MFA"],
  },
  interconnect: {
    title: "Interconnect",
    color: "--z2",
    purpose: "The link between the two firewalls. Using two vendors is defense in depth: a flaw or misconfiguration in one doesn't open the whole network.",
    hosts: ["Palo Alto PA-440 (edge)", "FortiGate 61F (internal)"],
    rules: ["Only routed, policy-checked traffic crosses", "NAT kept off where internal services need the real source IP"],
  },
  inside: {
    title: "Inside",
    color: "--z3",
    purpose: "Internal systems and supporting services for users who are already authenticated.",
    hosts: ["Duo Authentication Proxy (RADIUS for VPN MFA)", "Internal workstations"],
    rules: ["Reachable from VPN users after MFA", "No direct path from the DMZ"],
  },
  secure: {
    title: "Secure",
    color: "--z4",
    purpose: "The most sensitive systems: identity and the security tooling that watches everything else.",
    hosts: ["Active Directory domain controller", "Splunk and Security Onion", "n8n SOAR automation (Docker)"],
    rules: ["Smallest set of allowed flows in the lab", "Log forwarding in, management only from approved paths"],
  },
};

const detail = document.getElementById("zone-detail");
const zoneButtons = document.querySelectorAll(".zone");

function renderZone(key) {
  const z = ZONES[key];
  detail.style.setProperty("--c", `var(${z.color})`);
  detail.innerHTML = `
    <h3>${z.title}</h3>
    <p class="purpose">${z.purpose}</p>
    <h4>What lives here</h4>
    <ul>${z.hosts.map((h) => `<li>${h}</li>`).join("")}</ul>
    <h4>Rules of the road</h4>
    <ul>${z.rules.map((r) => `<li>${r}</li>`).join("")}</ul>
  `;
  zoneButtons.forEach((b) => b.setAttribute("aria-selected", String(b.dataset.zone === key)));
}

zoneButtons.forEach((btn, i) => {
  btn.addEventListener("click", () => renderZone(btn.dataset.zone));
  // Arrow-key navigation between zones
  btn.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const next = zoneButtons[(i + (e.key === "ArrowDown" ? 1 : -1) + zoneButtons.length) % zoneButtons.length];
    next.focus();
    renderZone(next.dataset.zone);
  });
});
renderZone("dmz");

// ---------- SOAR pipeline walkthrough ----------
const steps = document.querySelectorAll("#steps .step");
const log = document.getElementById("pipeline-log");
const runBtn = document.getElementById("run-pipeline");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Sample uses an IP from a documentation range (RFC 5737), not a real address.
const SAMPLE_LOG = [
  "Splunk: 214 failed logins from 203.0.113.47 in 5 minutes. Webhook sent to n8n.",
  "n8n: AbuseIPDB confidence 96%, reported 1,180 times. Above the 75% threshold.",
  "Palo Alto: 203.0.113.47 tagged and added to the block group. Traffic dropped.",
  "Discord: “Blocked 203.0.113.47 (AbuseIPDB 96%) after brute-force detection.”",
];

let running = false;
runBtn.addEventListener("click", async () => {
  if (running) return;
  running = true;
  runBtn.disabled = true;
  steps.forEach((s) => s.classList.remove("active", "done"));
  const wait = (ms) => new Promise((r) => setTimeout(r, reduceMotion ? 0 : ms));

  for (let i = 0; i < steps.length; i++) {
    steps[i].classList.add("active");
    log.textContent = SAMPLE_LOG[i];
    await wait(1300);
    steps[i].classList.remove("active");
    steps[i].classList.add("done");
  }
  log.textContent = "Done. Detection to block took seconds, and every action is logged for review.";
  runBtn.textContent = "Run it again";
  runBtn.disabled = false;
  running = false;
});

// ---------- Mobile nav ----------
const toggle = document.querySelector(".nav-toggle");
const nav = document.getElementById("nav");
toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(open));
  toggle.textContent = open ? "Close" : "Menu";
});
nav.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.textContent = "Menu";
  })
);

// ---------- Copy email ----------
const copyBtn = document.getElementById("copy-email");
const copyStatus = document.getElementById("copy-status");
copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(copyBtn.dataset.email);
    copyStatus.textContent = "Email address copied.";
  } catch {
    copyStatus.textContent = `Copy failed. The address is ${copyBtn.dataset.email}`;
  }
});

// ---------- Footer year ----------
document.getElementById("year").textContent = new Date().getFullYear();
