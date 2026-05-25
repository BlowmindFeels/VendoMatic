const params    = new URLSearchParams(location.search);
const machineId = params.get("id");

const SLOT_DEFAULTS = [
  { emoji: "🥤", name: "Refresco",   qty: 0 },
  { emoji: "💧", name: "Agua",        qty: 0 },
  { emoji: "🥔", name: "Papas",       qty: 0 },
  { emoji: "🍫", name: "Chocolate",   qty: 0 },
  { emoji: "🧃", name: "Jugo",        qty: 0 },
  { emoji: "☕", name: "Café",         qty: 0 },
];

let machine = null;
let slots   = [];
let userRol = null;

function storageKey() { return `vm_slots_${machineId}`; }

function loadSlots() {
  const saved = localStorage.getItem(storageKey());
  return saved ? JSON.parse(saved) : SLOT_DEFAULTS.map(s => ({ ...s }));
}

function saveSlots() {
  localStorage.setItem(storageKey(), JSON.stringify(slots));
}

function totalStock() {
  return slots.reduce((sum, s) => sum + s.qty, 0);
}

function maxPerSlot() {
  return Math.max(1, Math.ceil(machine.capacidad / slots.length));
}

function calcEstado(total, cap) {
  const pct = cap > 0 ? total / cap : 0;
  if (pct >= 0.8) return "Llena";
  if (pct >= 0.5) return "Media";
  if (pct >= 0.2) return "Baja";
  if (pct >  0  ) return "Crítica";
  return "Vacía";
}

function updateMeter(total) {
  const cap  = machine.capacidad;
  const pct  = cap > 0 ? Math.min(100, Math.round((total / cap) * 100)) : 0;
  const fill = document.getElementById("meterFill");
  const lbl  = document.getElementById("stockLabel");
  fill.style.width = pct + "%";
  fill.className = "vm-meter-fill " + (
    pct >= 80 ? "fill-green" : pct >= 50 ? "fill-yellow" : pct >= 20 ? "fill-orange" : "fill-red"
  );
  lbl.textContent = `${total} / ${cap}`;
}

function updateLedStatus(estado) {
  const el = document.getElementById("ledStatus");
  el.textContent = "● " + estado.toUpperCase();
  el.className = "vm-led-status led-" + estado.toLowerCase().replace("í", "i").replace("é", "e");
}

async function syncEstado() {
  const total  = totalStock();
  const estado = calcEstado(total, machine.capacidad);
  updateMeter(total);
  updateLedStatus(estado);
  await fetch(`/maquinas/${machineId}/estado`, {
    method:  "PATCH",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ estado }),
  });
}

function renderSlots() {
  const grid = document.getElementById("slotsGrid");
  const max  = maxPerSlot();
  grid.innerHTML = "";

  slots.forEach((slot, i) => {
    const pct  = max > 0 ? Math.round((slot.qty / max) * 100) : 0;
    const card = document.createElement("div");
    card.className = "vm-slot" + (slot.qty > 0 ? " vm-slot--stocked" : "");
    card.innerHTML = `
      <div class="vm-slot-fill-bar"><div style="height:${pct}%" class="vm-slot-fill-inner"></div></div>
      <div class="vm-slot-emoji">${slot.emoji}</div>
      <div class="vm-slot-name">${slot.name}</div>
      <div class="vm-slot-qty-label">${slot.qty}<span>/${max}</span></div>
      <div class="vm-slot-controls">
        <button class="vm-ctrl minus" data-i="${i}" ${slot.qty <= 0 ? "disabled" : ""}>−</button>
        ${userRol === "admin" ? `<button class="vm-ctrl plus" data-i="${i}" ${slot.qty >= max ? "disabled" : ""}>+</button>` : ""}
      </div>`;
    grid.appendChild(card);
  });

  grid.querySelectorAll(".vm-ctrl").forEach(btn => {
    btn.addEventListener("click", () => {
      const i   = parseInt(btn.dataset.i);
      const max = maxPerSlot();
      if (btn.classList.contains("plus")  && slots[i].qty < max) slots[i].qty++;
      if (btn.classList.contains("minus") && slots[i].qty > 0)   slots[i].qty--;
      saveSlots();
      renderSlots();
      syncEstado();
    });
  });
}

async function init() {
  if (!machineId) { location.href = "/"; return; }

  const authRes = await fetch("/auth/me");
  if (!authRes.ok) { location.href = "/login.html"; return; }
  const user = await authRes.json();
  userRol = user.rol;
  document.getElementById("vmUser").textContent  = user.username;
  document.getElementById("vmRole").textContent  = user.rol;
  document.getElementById("vmLogout").addEventListener("click", async () => {
    await fetch("/auth/logout", { method: "POST" });
    location.href = "/login.html";
  });

  const res = await fetch(`/maquinas/${machineId}`);
  if (!res.ok) { location.href = "/"; return; }
  machine = await res.json();

  document.title                              = `Máquina: ${machine.nombre}`;
  document.getElementById("vmTitle").textContent = machine.nombre;
  document.getElementById("vmSub").textContent   = `${machine.ubicacion}  ·  Capacidad máx: ${machine.capacidad}`;
  document.getElementById("ledName").textContent  = machine.nombre.toUpperCase().slice(0, 18);
  updateLedStatus(machine.estado);

  slots = loadSlots();
  renderSlots();
  updateMeter(totalStock());
}

init();
