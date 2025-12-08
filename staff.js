import { getApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// Reutilizamos la misma app Firebase inicializada en app.js
const app = getApp();
const db = getFirestore(app);

// ----- DOM principal para el módulo de personal -----
const staffModuleRoot = document.getElementById("staff-module-root");
const currentBuildingHidden = document.getElementById("current-building-id");
const currentUnitHidden = document.getElementById("current-unit-id");
const staffBuildingLabel = document.getElementById("staff-building-label");
const staffUnitLabel = document.getElementById("staff-unit-label");

// Resúmenes en otras pestañas
const summaryStaffCount = document.getElementById("summary-staff-count");
const summaryStaffNames = document.getElementById("summary-staff-names");
const unitsSummaryStaff = document.getElementById("units-summary-staff");

// ----- Modal de personal -----
const staffModal = document.getElementById("staff-modal");
const staffModalForm = document.getElementById("staff-modal-form");
const staffModalIdInput = document.getElementById("staff-modal-id");
const staffModalNameInput = document.getElementById("staff-modal-name");
const staffModalPhoneInput = document.getElementById("staff-modal-phone");
const staffModalSalaryInput = document.getElementById("staff-modal-salary");
const staffModalNotesInput = document.getElementById("staff-modal-notes");
const staffModalActiveSelect = document.getElementById("staff-modal-active");
const staffModalBuildingNameLabel = document.getElementById("staff-modal-building-name");
const staffModalCloseBtn = document.getElementById("staff-modal-close");
const staffModalCancelBtn = document.getElementById("staff-modal-cancel");

// Referencias de contenedores
let staffGridContainer = null; // Reemplaza a staffList
let unitsStaffList = null;     // Lista de solo lectura en Unidades

// =======================================================
//  Utilidades de resumen de personal
// =======================================================
function actualizarResumenStaff(total, nombresActivos) {
  if (!Array.isArray(nombresActivos)) nombresActivos = [];

  if (summaryStaffCount) {
    summaryStaffCount.textContent = String(total ?? 0);
  }

  if (summaryStaffNames) {
    if (total === 0) {
      summaryStaffNames.textContent = "Sin personal registrado";
    } else if (nombresActivos.length === 0) {
      summaryStaffNames.textContent =
        total === 1
          ? "1 persona registrada (ninguna activa)"
          : `${total} personas registradas (ninguna activa)`;
    } else {
      const todos = nombresActivos.join(", ");
      if (total === nombresActivos.length) {
        summaryStaffNames.textContent = `${total} activos: ${todos}`;
      } else {
        summaryStaffNames.textContent = `${total} registrados, activos: ${todos}`;
      }
    }
  }

  if (unitsSummaryStaff) {
    if (total === 0) {
      unitsSummaryStaff.textContent = "Sin personal asignado";
    } else if (nombresActivos.length === 0) {
      unitsSummaryStaff.textContent =
        total === 1
          ? "1 persona registrada (ninguna activa)"
          : `${total} personas registradas (ninguna activa)`;
    } else {
      const primeros = nombresActivos.slice(0, 3).join(", ");
      const extra =
        nombresActivos.length > 3 ? ` y ${nombresActivos.length - 3} más` : "";

      const texto =
        nombresActivos.length === 1
          ? `1 activo: ${primeros}`
          : `${nombresActivos.length} activos: ${primeros}${extra}`;

      unitsSummaryStaff.textContent = texto;
    }
  }
}

// =======================================================
//  UI principal en pestaña INMUEBLES (Diseño Data Grid)
// =======================================================
function initStaffUI() {
  if (!staffModuleRoot) return;

  // Estructura limpia para contener el grid
  staffModuleRoot.innerHTML = `
    <div style="margin-top: 0.5rem;">
      <div id="staff-grid-container" class="mui-data-grid">
        </div>
    </div>
  `;

  staffGridContainer = staffModuleRoot.querySelector("#staff-grid-container");
}

// =======================================================
//  Bloque adicional en pestaña UNIDADES (solo lectura)
// =======================================================
function initUnitsStaffBlock() {
  const container = document.getElementById("units-staff-section");
  if (!container) return;
  unitsStaffList = container.querySelector("#units-staff-list");
}

// =======================================================
//  Cargar personal por inmueble
// =======================================================
async function cargarPersonalEdificio(buildingId) {
  // 1. Limpieza inicial
  if (staffGridContainer) staffGridContainer.innerHTML = "";
  if (unitsStaffList) unitsStaffList.innerHTML = "";

  if (!buildingId) {
    if (staffGridContainer) {
      staffGridContainer.innerHTML = '<div style="padding:1rem;">Selecciona un inmueble para ver su personal.</div>';
    }
    actualizarResumenStaff(0, []);
    return;
  }

  // 2. Consulta a Firebase
  const qStaff = query(
    collection(db, "staff"),
    where("buildingId", "==", buildingId)
  );
  const snapshot = await getDocs(qStaff);

  // 3. Si no hay datos
  if (snapshot.empty) {
    if (staffGridContainer) {
      staffGridContainer.innerHTML = '<div style="padding:1rem;">No hay personal registrado para este inmueble.</div>';
    }
    if (unitsStaffList) {
      const li = document.createElement("li");
      li.textContent = "No hay personal registrado.";
      unitsStaffList.appendChild(li);
    }
    actualizarResumenStaff(0, []);
    return;
  }

  // 4. Construir la Tabla (Estilo Data Grid igual que Inmuebles)
  const nombresActivos = [];
  let total = 0;

  const table = document.createElement("table");
  table.className = "mui-data-grid-table";

  const thead = document.createElement("thead");
  thead.innerHTML = `
    <tr>
      <th>Personal</th>
      <th>Detalles Financieros</th>
      <th style="text-align:right;">Acciones</th>
    </tr>
  `;
  table.appendChild(thead);

  const tbody = document.createElement("tbody");

  snapshot.forEach((docSnap) => {
    total += 1;
    const data = docSnap.data();
    const id = docSnap.id;

    const sueldo = Number(data.sueldo || 0);
    const estadoLabel = data.activo ? "ACTIVO" : "INACTIVO";
    
    // Fila de la tabla
    const tr = document.createElement("tr");

    // -- Columna Principal --
    const tdMain = document.createElement("td");
    tdMain.className = "mui-col-main";
    
    tdMain.innerHTML = `
      <div class="mui-main-title">
        <span>${data.nombre || "Sin nombre"}</span>
        <span class="mui-pill" style="${!data.activo ? 'background:#fee2e2; color:#991b1b;' : ''}">
          ${estadoLabel}
        </span>
      </div>
      <div class="mui-main-subtitle">
        Tel: ${data.telefono || "—"}
      </div>
      ${
        data.notas 
        ? `<div class="mui-main-meta" style="margin-top:0.3rem;">Nota: ${data.notas}</div>` 
        : ''
      }
    `;
    tr.appendChild(tdMain);

    // -- Columna Detalles --
    const tdDetails = document.createElement("td");
    tdDetails.innerHTML = `
      <div class="mui-main-meta" style="font-size:0.9rem; color:#333;">
        Sueldo: $${sueldo.toFixed(2)}
      </div>
    `;
    tr.appendChild(tdDetails);

    // -- Columna Acciones --
    const tdActions = document.createElement("td");
    tdActions.className = "mui-col-actions";
    tdActions.style.textAlign = "right";

    // Botón Activar/Desactivar
    const toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.className = "btn btn-xs " + (data.activo ? "btn-outline" : "btn-success");
    toggleBtn.title = data.activo ? "Desactivar personal" : "Activar personal";
    toggleBtn.innerHTML = `
      <span class="material-symbols-outlined">
        ${data.activo ? "block" : "check_circle"}
      </span>
    `;
    toggleBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const staffRef = doc(db, "staff", id);
      await updateDoc(staffRef, { activo: !data.activo });
      await cargarPersonalEdificio(buildingId);
    });

    // Botón Editar
    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "btn btn-xs btn-info";
    editBtn.innerHTML = `
      <span class="material-symbols-outlined">edit</span>
      <span class="btn-label">Editar</span>
    `;
    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      abrirStaffModal({
        buildingId,
        buildingNombre: staffBuildingLabel?.textContent || "",
        staffId: id,
        data
      });
    });

    // Botón Eliminar
    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "btn btn-xs btn-danger";
    deleteBtn.title = "Eliminar registro";
    deleteBtn.innerHTML = `
      <span class="material-symbols-outlined">delete</span>
    `;
    deleteBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const ok = confirm(`¿Eliminar a ${data.nombre} del registro?`);
      if (!ok) return;
      await deleteDoc(doc(db, "staff", id));
      await cargarPersonalEdificio(buildingId);
    });

    tdActions.appendChild(toggleBtn);
    tdActions.appendChild(editBtn);
    tdActions.appendChild(deleteBtn);

    tr.appendChild(tdActions);
    tbody.appendChild(tr);

    // -- Lógica para lista de solo lectura (Unidades) --
    if (unitsStaffList) {
      const li2 = document.createElement("li");
      li2.textContent = `${data.nombre} (${estadoLabel}) - Tel: ${data.telefono || "—"}`;
      unitsStaffList.appendChild(li2);
    }

    if (data.activo) {
      nombresActivos.push(data.nombre || "Sin nombre");
    }
  });

  table.appendChild(tbody);
  
  if (staffGridContainer) {
    staffGridContainer.appendChild(table);
  }

  actualizarResumenStaff(total, nombresActivos);
}

// =======================================================
//  Modal de personal (Funciones de abrir/cerrar/guardar)
// =======================================================
function abrirStaffModal(opciones = {}) {
  if (!staffModal || !staffModalForm) return;

  const { buildingId, buildingNombre, staffId, data } = opciones;

  if (buildingId) {
    if (currentBuildingHidden) {
      currentBuildingHidden.value = buildingId;
      currentBuildingHidden.dispatchEvent(new Event("change"));
    }
    if (staffBuildingLabel) {
      staffBuildingLabel.textContent = buildingNombre || "Ninguno";
    }
  }

  staffModalIdInput.value = staffId || "";
  staffModalNameInput.value = data?.nombre || "";
  staffModalPhoneInput.value = data?.telefono || "";
  staffModalSalaryInput.value = data?.sueldo != null ? String(data.sueldo) : "";
  staffModalNotesInput.value = data?.notas || "";
  staffModalActiveSelect.value = data?.activo === false ? "false" : "true";

  staffModalBuildingNameLabel.textContent =
    buildingNombre || staffBuildingLabel?.textContent || "Ninguno";

  staffModal.classList.add("visible");
}

function cerrarStaffModal() {
  if (!staffModal) return;
  staffModal.classList.remove("visible");
}

if (staffModalCloseBtn) staffModalCloseBtn.addEventListener("click", cerrarStaffModal);
if (staffModalCancelBtn) staffModalCancelBtn.addEventListener("click", cerrarStaffModal);

if (staffModalForm) {
  staffModalForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const buildingId = currentBuildingHidden?.value || "";
    const buildingNombre = staffBuildingLabel?.textContent || "";

    if (!buildingId) {
      alert("Primero selecciona un inmueble para registrar personal.");
      return;
    }

    const staffId = staffModalIdInput.value || null;
    const nombre = staffModalNameInput.value.trim();
    const telefono = staffModalPhoneInput.value.trim();
    const notas = staffModalNotesInput.value.trim();
    const sueldoRaw = staffModalSalaryInput.value.trim();
    const activo = staffModalActiveSelect.value === "true";

    if (!nombre) {
      alert("El nombre del personal es obligatorio.");
      return;
    }

    const sueldo = sueldoRaw !== "" && !isNaN(Number(sueldoRaw)) ? Number(sueldoRaw) : 0;
    
    // Validación de sueldo negativo
    if (sueldo < 0) {
      alert("El sueldo no puede ser negativo.");
      return;
    }

    if (staffId) {
      const staffRef = doc(db, "staff", staffId);
      await updateDoc(staffRef, { nombre, telefono, notas, sueldo, activo });
    } else {
      await addDoc(collection(db, "staff"), {
        buildingId,
        buildingNombre,
        nombre,
        telefono,
        notas,
        sueldo,
        activo,
        creadoEn: new Date()
      });
    }

    cerrarStaffModal();
    await cargarPersonalEdificio(buildingId);
  });
}

// =======================================================
//  Sincronización y Eventos
// =======================================================

// Escuchar cambio de edificio en app.js
if (currentBuildingHidden) {
  currentBuildingHidden.addEventListener("change", () => {
    const buildingId = currentBuildingHidden.value || "";
    cargarPersonalEdificio(buildingId);
  });
}

// Evento "Nuevo Personal" desde el botón del inmueble
window.addEventListener("openStaffModalForBuilding", (event) => {
  const detail = event.detail || {};
  const buildingId = detail.buildingId || "";
  const buildingNombre = detail.buildingNombre || "";

  if (!buildingId) {
    alert("No se encontró el inmueble para registrar personal.");
    return;
  }
  abrirStaffModal({ buildingId, buildingNombre });
});

// =======================================================
//  INIT
// =======================================================
function init() {
  initStaffUI();
  initUnitsStaffBlock();

  if (currentBuildingHidden && currentBuildingHidden.value) {
    cargarPersonalEdificio(currentBuildingHidden.value);
  }
}

init();