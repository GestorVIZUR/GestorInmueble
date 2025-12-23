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

// Intentamos obtener la app ya inicializada en app.js
// Si da error, asegúrate de que app.js cargue antes o tenga la config. 
// En este flujo modular, getApp() suele funcionar bien si app.js ya corrió.
const app = getApp();
const db = getFirestore(app);

// =======================================================
//  REFERENCIAS DOM
// =======================================================
const staffModuleRoot = document.getElementById("staff-module-root");
const currentBuildingHidden = document.getElementById("current-building-id");
// Labels para mostrar contexto en el modal
const staffBuildingLabel = document.getElementById("staff-building-label");

// Resúmenes en otras pestañas (Inmuebles / Unidades)
const summaryStaffCount = document.getElementById("summary-staff-count");
const summaryStaffNames = document.getElementById("summary-staff-names");
const unitsSummaryStaff = document.getElementById("units-summary-staff");
const unitsStaffList = document.getElementById("units-staff-list");

// Modal de personal
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

// Variable interna para controlar el contenedor del grid
let staffGridContainer = null;

// =======================================================
//  FUNCIONES DE RESUMEN (Actualizan textos en la UI)
// =======================================================
function actualizarResumenStaff(total, nombresActivos) {
  if (!Array.isArray(nombresActivos)) nombresActivos = [];

  // 1. Resumen en Tab Inmuebles (Tarjeta superior)
  if (summaryStaffCount) {
    summaryStaffCount.textContent = String(total ?? 0);
  }
  if (summaryStaffNames) {
    if (total === 0) {
      summaryStaffNames.textContent = "Sin personal registrado";
    } else if (nombresActivos.length === 0) {
      summaryStaffNames.textContent =
        total === 1
          ? "1 registrado (inactivo)"
          : `${total} registrados (ninguno activo)`;
    } else {
      const todos = nombresActivos.join(", ");
      if (total === nombresActivos.length) {
        summaryStaffNames.textContent = `${total} activos: ${todos}`;
      } else {
        summaryStaffNames.textContent = `${total} registrados, activos: ${todos}`;
      }
    }
  }

  // 2. Resumen en Tab Unidades (Context Card)
  if (unitsSummaryStaff) {
    if (total === 0) {
      unitsSummaryStaff.textContent = "Sin personal asignado";
    } else if (nombresActivos.length === 0) {
      unitsSummaryStaff.textContent = "Sin personal activo";
    } else {
      const primeros = nombresActivos.slice(0, 2).join(", ");
      const extra =
        nombresActivos.length > 2 ? ` y ${nombresActivos.length - 2} más` : "";
      unitsSummaryStaff.textContent = `${primeros}${extra}`;
    }
  }
}

// =======================================================
//  UI: INICIALIZACIÓN
// =======================================================
function initStaffUI() {
  if (!staffModuleRoot) return;
  // Preparamos el contenedor con la clase de estilo "mui-data-grid"
  staffModuleRoot.innerHTML = `
    <div style="margin-top: 0.5rem;">
      <div id="staff-grid-container" class="mui-data-grid">
        <div style="padding:1rem; color:var(--text-muted);">Cargando...</div>
      </div>
    </div>
  `;
  staffGridContainer = staffModuleRoot.querySelector("#staff-grid-container");
}

// =======================================================
//  CORE: CARGAR PERSONAL
// =======================================================
async function cargarPersonalEdificio(buildingId) {
  // Limpieza inicial
  if (staffGridContainer) staffGridContainer.innerHTML = "";
  if (unitsStaffList) unitsStaffList.innerHTML = "";

  // Si no hay edificio seleccionado
  if (!buildingId) {
    if (staffGridContainer) {
      staffGridContainer.innerHTML = '<div style="padding:1.5rem; text-align:center; color:var(--text-muted);">Selecciona un inmueble para gestionar su personal.</div>';
    }
    actualizarResumenStaff(0, []);
    return;
  }

  // Consulta Firestore
  const qStaff = query(
    collection(db, "staff"),
    where("buildingId", "==", buildingId)
  );

  let snapshot;
  try {
    snapshot = await getDocs(qStaff);
  } catch (e) {
    console.error("Error cargando staff:", e);
    if (staffGridContainer) staffGridContainer.innerHTML = '<div style="padding:1rem; color:var(--danger);">Error cargando datos.</div>';
    return;
  }

  // Si no hay datos
  if (snapshot.empty) {
    if (staffGridContainer) {
      staffGridContainer.innerHTML = '<div style="padding:1.5rem; text-align:center; color:var(--text-muted);">No hay personal registrado en este inmueble.</div>';
    }
    if (unitsStaffList) {
      unitsStaffList.innerHTML = '<li style="color:var(--text-muted); justify-content:center;">Sin personal asignado.</li>';
    }
    actualizarResumenStaff(0, []);
    return;
  }

  // Construir Tabla
  const nombresActivos = [];
  let total = 0;

  const table = document.createElement("table");
  table.className = "mui-data-grid-table"; // Usamos la clase CSS nueva

  const thead = document.createElement("thead");
  thead.innerHTML = `
    <tr>
      <th>Nombre / Cargo</th>
      <th>Contacto & Costo</th>
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
    
    // Configuración visual del estado (Pill)
    const isActive = data.activo;
    const pillColor = isActive ? "var(--success)" : "var(--text-muted)";
    const pillBg = isActive ? "var(--success-bg)" : "var(--bg-body)";
    const estadoTexto = isActive ? "ACTIVO" : "INACTIVO";

    // Fila Principal
    const tr = document.createElement("tr");

    // Columna 1: Nombre y Estado
    const tdMain = document.createElement("td");
    tdMain.innerHTML = `
      <div style="display:flex; align-items:center; gap:0.5rem;">
        <span style="font-weight:600; font-size:0.95rem; color:var(--text-main);">${data.nombre || "Sin nombre"}</span>
        <span class="mui-pill" style="color:${pillColor}; background:${pillBg}; font-size:0.7rem;">
          ${estadoTexto}
        </span>
      </div>
      ${
        data.notas 
        ? `<div style="font-size:0.8rem; color:var(--text-muted); margin-top:0.25rem;">${data.notas}</div>` 
        : ''
      }
    `;
    tr.appendChild(tdMain);

    // Columna 2: Detalles
    const tdDetails = document.createElement("td");
    tdDetails.innerHTML = `
      <div style="font-size:0.9rem;">
        <div style="display:flex; align-items:center; gap:0.4rem; color:var(--text-muted); margin-bottom:0.25rem;">
          <span class="material-symbols-outlined" style="font-size:16px;">call</span>
          ${data.telefono || "—"}
        </div>
        <div style="display:flex; align-items:center; gap:0.4rem; font-weight:500; color:var(--text-main);">
          <span class="material-symbols-outlined" style="font-size:16px; color:var(--success);">payments</span>
          $${sueldo.toFixed(2)}
        </div>
      </div>
    `;
    tr.appendChild(tdDetails);

    // Columna 3: Acciones
    const tdActions = document.createElement("td");
    tdActions.style.textAlign = "right";
    tdActions.style.whiteSpace = "nowrap";

    // Botón Toggle (Activar/Desactivar)
    const toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.className = "icon-button";
    toggleBtn.title = isActive ? "Desactivar" : "Activar";
    toggleBtn.innerHTML = `
      <span class="material-symbols-outlined" style="color: ${isActive ? 'var(--text-muted)' : 'var(--success)'}">
        ${isActive ? "toggle_on" : "toggle_off"}
      </span>
    `;
    toggleBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      try {
        await updateDoc(doc(db, "staff", id), { activo: !isActive });
        cargarPersonalEdificio(buildingId); // Recargar
      } catch (err) {
        console.error(err);
        alert("Error al actualizar estado.");
      }
    });

    // Botón Editar
    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "icon-button";
    editBtn.title = "Editar";
    editBtn.innerHTML = `<span class="material-symbols-outlined">edit</span>`;
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
    deleteBtn.className = "icon-button";
    deleteBtn.title = "Eliminar";
    deleteBtn.innerHTML = `<span class="material-symbols-outlined" style="color:var(--danger);">delete</span>`;
    deleteBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      if(confirm(`¿Eliminar a ${data.nombre} permanentemente?`)){
        try {
          await deleteDoc(doc(db, "staff", id));
          cargarPersonalEdificio(buildingId);
        } catch (err) {
          console.error(err);
          alert("Error al eliminar.");
        }
      }
    });

    tdActions.appendChild(toggleBtn);
    tdActions.appendChild(editBtn);
    tdActions.appendChild(deleteBtn);
    tr.appendChild(tdActions);
    tbody.appendChild(tr);

    // -- Lógica para lista COMPACTA (solo lectura) en Tab Unidades --
    if (unitsStaffList) {
      const li = document.createElement("li");
      li.style.display = "flex";
      li.style.justifyContent = "space-between";
      li.style.alignItems = "center";
      
      const phoneLink = data.telefono 
        ? `<a href="tel:${data.telefono}" style="text-decoration:none; color:var(--primary); font-size:0.8rem; display:flex; gap:0.2rem; align-items:center;"><span class="material-symbols-outlined" style="font-size:14px;">call</span>Llamar</a>` 
        : '';

      li.innerHTML = `
        <div style="display:flex; flex-direction:column;">
          <span style="font-weight:500;">${data.nombre}</span>
          <span style="font-size:0.75rem; color:${isActive?'var(--success)':'var(--text-muted)'};">${isActive?'Disponible':'No disponible'}</span>
        </div>
        ${phoneLink}
      `;
      unitsStaffList.appendChild(li);
    }

    if (isActive) {
      nombresActivos.push(data.nombre || "Sin nombre");
    }
  });

  table.appendChild(tbody);
  if (staffGridContainer) staffGridContainer.appendChild(table);

  actualizarResumenStaff(total, nombresActivos);
}

// =======================================================
//  MODAL: ABRIR / CERRAR / GUARDAR
// =======================================================
function abrirStaffModal(opciones = {}) {
  if (!staffModal || !staffModalForm) return;

  const { buildingId, buildingNombre, staffId, data } = opciones;

  // Sincronizar campo oculto si viene el ID
  if (buildingId && currentBuildingHidden) {
    currentBuildingHidden.value = buildingId;
  }

  // Llenar campos
  staffModalIdInput.value = staffId || "";
  staffModalNameInput.value = data?.nombre || "";
  staffModalPhoneInput.value = data?.telefono || "";
  staffModalSalaryInput.value = data?.sueldo != null ? String(data.sueldo) : "";
  staffModalNotesInput.value = data?.notas || "";
  staffModalActiveSelect.value = data?.activo === false ? "false" : "true";

  // Título del modal
  if (staffModalBuildingNameLabel) {
    staffModalBuildingNameLabel.textContent = buildingNombre || staffBuildingLabel?.textContent || "Inmueble Actual";
  }

  staffModal.classList.add("visible");
}

function cerrarStaffModal() {
  if (!staffModal) return;
  staffModal.classList.remove("visible");
}

// Event Listeners Modal
if (staffModalCloseBtn) staffModalCloseBtn.addEventListener("click", cerrarStaffModal);
if (staffModalCancelBtn) staffModalCancelBtn.addEventListener("click", cerrarStaffModal);

if (staffModalForm) {
  staffModalForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const buildingId = currentBuildingHidden?.value || "";
    // Intentar recuperar nombre del label si no tenemos otro origen
    const buildingNombre = staffBuildingLabel?.textContent || "";

    if (!buildingId) {
      alert("Error: No se ha identificado el inmueble.");
      return;
    }

    const staffId = staffModalIdInput.value || null;
    const nombre = staffModalNameInput.value.trim();
    const telefono = staffModalPhoneInput.value.trim();
    const notas = staffModalNotesInput.value.trim();
    const sueldoRaw = staffModalSalaryInput.value.trim();
    const activo = staffModalActiveSelect.value === "true";

    if (!nombre) {
      alert("El nombre es obligatorio.");
      return;
    }

    const sueldo = sueldoRaw !== "" && !isNaN(Number(sueldoRaw)) ? Number(sueldoRaw) : 0;
    if (sueldo < 0) {
      alert("El sueldo no puede ser negativo.");
      return;
    }

    try {
      if (staffId) {
        // Editar
        const staffRef = doc(db, "staff", staffId);
        await updateDoc(staffRef, { nombre, telefono, notas, sueldo, activo });
      } else {
        // Crear
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
    } catch (error) {
      console.error("Error guardando personal:", error);
      alert("Hubo un error al guardar. Revisa la consola.");
    }
  });
}

// =======================================================
//  EVENTS & INIT
// =======================================================

// 1. Escuchar cambio de ID en el input oculto (comunicación con app.js)
if (currentBuildingHidden) {
  currentBuildingHidden.addEventListener("change", () => {
    const buildingId = currentBuildingHidden.value || "";
    cargarPersonalEdificio(buildingId);
  });
}

// 2. Evento personalizado "Nuevo Personal" (disparado desde el botón en la tabla de edificios)
window.addEventListener("openStaffModalForBuilding", (event) => {
  const detail = event.detail || {};
  const buildingId = detail.buildingId || "";
  const buildingNombre = detail.buildingNombre || "";

  if (!buildingId) {
    alert("No se encontró el inmueble.");
    return;
  }
  abrirStaffModal({ buildingId, buildingNombre });
});

// 3. Inicializar al cargar
function init() {
  initStaffUI();
  
  // Si al cargar la página ya hay un ID (ej. persistencia), cargamos datos
  if (currentBuildingHidden && currentBuildingHidden.value) {
    cargarPersonalEdificio(currentBuildingHidden.value);
  }
}

// Arrancar módulo
init();
