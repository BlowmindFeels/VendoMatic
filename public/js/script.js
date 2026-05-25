const API_URL = "/maquinas";

let editandoId = null;

async function initAuth() {
  const res = await fetch("/auth/me");
  if (!res.ok) { location.href = "/login.html"; return; }
  const user = await res.json();
  document.getElementById("currentUser").textContent = user.username;
  document.getElementById("currentRole").textContent = user.rol;
}

document.getElementById("btnLogout").addEventListener("click", async () => {
  await fetch("/auth/logout", { method: "POST" });
  location.href = "/login.html";
});

initAuth();

const form       = document.getElementById("maquinaForm");
const btnSubmit  = form.querySelector("button[type='submit']");
const btnCancel  = document.getElementById("btnCancelar");

btnCancel.classList.add("hidden");
btnCancel.addEventListener("click", () => {
  editandoId = null;
  btnSubmit.textContent = "Agregar";
  form.reset();
  btnCancel.classList.add("hidden");
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const maquina = {
    nombre:    document.getElementById("nombre").value,
    ubicacion: document.getElementById("ubicacion").value,
    capacidad: document.getElementById("capacidad").value,
    estado:    document.getElementById("estado").value,
  };

  if (editandoId !== null) {
    await fetch(`${API_URL}/${editandoId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(maquina),
    });
    editandoId = null;
    btnSubmit.textContent = "Agregar";
    btnCancel.classList.add("hidden");
  } else {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(maquina),
    });
  }

  form.reset();
  cargarMaquinas();
});

function getLocalStock(id) {
  const saved = localStorage.getItem(`vm_slots_${id}`);
  if (!saved) return null;
  return JSON.parse(saved).reduce((sum, s) => sum + s.qty, 0);
}

function stockBarHtml(stock, capacidad) {
  if (stock === null) return `<span class="stock-none">Sin datos</span>`;
  const pct = Math.min(100, Math.round((stock / capacidad) * 100));
  const color = pct >= 80 ? "var(--success)" : pct >= 50 ? "var(--warning)" : pct >= 20 ? "var(--accent)" : "var(--danger)";
  return `
    <div class="stock-bar-wrap">
      <span class="stock-nums">${stock}/${capacidad}</span>
      <div class="stock-track"><div class="stock-fill" style="width:${pct}%;background:${color}"></div></div>
    </div>`;
}

function estadoBadge(estado) {
  const map = {
    "llena":        "badge-green",
    "media":        "badge-yellow",
    "baja":         "badge-orange",
    "crítica":      "badge-red",
    "vacía":        "badge-gray",
    "activo":       "badge-green",
    "activa":       "badge-green",
    "inactivo":     "badge-gray",
    "inactiva":     "badge-gray",
    "mantenimiento":"badge-blue",
  };
  const cls = map[estado.toLowerCase()] || "badge-gray";
  return `<span class="badge ${cls}">${estado}</span>`;
}

async function cargarMaquinas() {
  const res      = await fetch(API_URL);
  const maquinas = await res.json();
  const tabla    = document.getElementById("tablaMaquinas");
  tabla.innerHTML = "";

  if (!maquinas.length) {
    tabla.innerHTML = `<tr><td colspan="7" class="no-data">Sin registros</td></tr>`;
    return;
  }

  maquinas.forEach((m) => {
    const stock = getLocalStock(m.id);
    tabla.innerHTML += `
      <tr>
        <td data-label="ID">${m.id}</td>
        <td data-label="Nombre"><a href="/maquina.html?id=${m.id}" class="machine-link">${m.nombre}</a></td>
        <td data-label="Ubicación">${m.ubicacion}</td>
        <td data-label="Capacidad">${m.capacidad}</td>
        <td data-label="Stock Actual">${stockBarHtml(stock, m.capacidad)}</td>
        <td data-label="Estado">${estadoBadge(m.estado)}</td>
        <td data-label="Acciones">
          <button class="btn btn-warning btn-small" onclick="editar(${m.id},'${m.nombre}','${m.ubicacion}',${m.capacidad},'${m.estado}')">✏️ Editar</button>
          <button class="btn btn-danger btn-small" onclick="eliminar(${m.id})">🗑️ Eliminar</button>
        </td>
      </tr>`;
  });
}

function editar(id, nombre, ubicacion, capacidad, estado) {
  editandoId = id;
  document.getElementById("nombre").value    = nombre;
  document.getElementById("ubicacion").value = ubicacion;
  document.getElementById("capacidad").value = capacidad;
  document.getElementById("estado").value    = estado;
  btnSubmit.textContent = "Guardar cambios";
  btnCancel.classList.remove("hidden");
  form.scrollIntoView({ behavior: "smooth" });
}

async function eliminar(id) {
  if (!confirm(`¿Eliminar la máquina #${id}?`)) return;
  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  cargarMaquinas();
}

cargarMaquinas();