// ========================= IMPORTS FIREBASE =========================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// jsPDF viene del script UMD incluido en index.html
const { jsPDF } = window.jspdf;

// ========================= CONFIGURACIÓN FIREBASE =========================
const firebaseConfig = {
  apiKey: "AIzaSyC8rBG_X7q3b487pD0pBZtMygWX4WgVw74", 
  authDomain: "gestor-inmuebles-913af.firebaseapp.com",
  projectId: "gestor-inmuebles-913af",
  storageBucket: "gestor-inmuebles-913af.firebasestorage.app",
  messagingSenderId: "1004246534204",
  appId: "1:1004246534204:web:d4be5fde3b710fc3895b39"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ========================= LÓGICA DE LOGIN / AUTENTICACIÓN =========================
const loginScreen = document.getElementById("login-screen");
const appContent = document.getElementById("app-content");
const loginForm = document.getElementById("login-form");
const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");
const loginError = document.getElementById("login-error");
const btnLogout = document.getElementById("btn-logout");

// Escuchar cambios de estado (Login / Logout)
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // === USUARIO CONECTADO ===
    if (loginScreen) {
      loginScreen.style.opacity = "0";
      setTimeout(() => loginScreen.classList.add("hidden"), 300);
    }
    if (appContent) {
      appContent.classList.remove("hidden");
    }

    // CARGA INICIAL INMEDIATA
    await init(); 
  } else {
    // === USUARIO DESCONECTADO ===
    if (loginScreen) {
      loginScreen.classList.remove("hidden");
      loginScreen.style.opacity = "1";
    }
    if (appContent) appContent.classList.add("hidden");
  }
});

// Evento: Iniciar Sesión
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (loginError) loginError.style.display = "none";
    
    const email = loginEmail.value;
    const password = loginPassword.value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Error login:", error);
      if (loginError) {
        loginError.textContent = "Credenciales incorrectas.";
        loginError.style.display = "block";
      }
    }
  });
}

// Evento: Cerrar Sesión
if (btnLogout) {
  btnLogout.addEventListener("click", async () => {
    try {
      await signOut(auth);
      window.location.reload();
    } catch (error) {
      console.error("Error al salir:", error);
    }
  });
}

// ========================= NAVEGACIÓN (TABS) =========================
const tabEdificios = document.getElementById("tab-edificios");
const tabUnidades = document.getElementById("tab-unidades");
const tabInquilinos = document.getElementById("tab-inquilinos");
const tabRecibos = document.getElementById("tab-recibos");

const pageEdificios = document.querySelector(".page-edificios");
const pageUnidades = document.querySelector(".page-unidades");
const pageInquilinos = document.querySelector(".page-inquilinos");
const pageRecibos = document.querySelector(".page-recibos");

function showPage(page) {
  const all = [pageEdificios, pageUnidades, pageInquilinos, pageRecibos];
  all.forEach((p) => {
    if (!p) return;
    if (p === page) {
      p.style.display = "block";
      window.scrollTo(0, 0); // Scroll al top al cambiar
    } else {
      p.style.display = "none";
    }
  });
}

if (tabEdificios) tabEdificios.addEventListener("change", () => showPage(pageEdificios));
if (tabUnidades) tabUnidades.addEventListener("change", () => showPage(pageUnidades));
if (tabInquilinos) tabInquilinos.addEventListener("change", () => showPage(pageInquilinos));
if (tabRecibos) tabRecibos.addEventListener("change", () => showPage(pageRecibos));

// Botones "Volver"
const backButtons = document.querySelectorAll(".back-button");
backButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.target;
    if (target === "edificios" && tabEdificios) {
      tabEdificios.checked = true; // Activa el radio button
      showPage(pageEdificios);
    } else if (target === "unidades" && tabUnidades) {
      tabUnidades.checked = true;
      showPage(pageUnidades);
    }
  });
});

// ========================= REFERENCIAS DOM GLOBALES =========================
// -- EDIFICIOS --
const buildingForm = document.getElementById("building-form");
const buildingIdHiddenInput = document.getElementById("building-id-hidden"); 
const buildingExtraFieldsDiv = document.getElementById("building-extra-fields");
const buildingNameInput = document.getElementById("building-name");
const buildingTypeSelect = document.getElementById("building-type");
const buildingAddressInput = document.getElementById("building-address");
const buildingWaterCodeInput = document.getElementById("building-water-code");
const buildingGasCodeInput = document.getElementById("building-gas-code");
const buildingInternetCodeInput = document.getElementById("building-internet-code");
const buildingInternetCompanyInput = document.getElementById("building-internet-company");
const buildingInternetPriceInput = document.getElementById("building-internet-price");
const buildingMapsUrlInput = document.getElementById("building-maps-url");

const buildingGrid = document.getElementById("building-grid");
const buildingSearchInput = document.getElementById("building-search");
const buildingSearchOptions = document.getElementById("building-search-options");

// Resumen Edificio
const buildingSummarySection = document.getElementById("building-summary");
const summaryBuildingName = document.getElementById("summary-building-name");
const summaryBuildingType = document.getElementById("summary-building-type");
const summaryBuildingAddress = document.getElementById("summary-building-address");
const summaryWaterCode = document.getElementById("summary-water-code");
const summaryInternetCode = document.getElementById("summary-internet-code");
const summaryInternetCompany = document.getElementById("summary-internet-company");
const summaryInternetPrice = document.getElementById("summary-internet-price");
const summaryGasCode = document.getElementById("summary-gas-code");
const summaryMapsUrl = document.getElementById("summary-maps-url");
const summaryOpenServicesBtn = document.getElementById("summary-open-services");
const summaryOpenMapBtn = document.getElementById("summary-open-map");

// -- UNIDADES --
const selectedBuildingLabel = document.getElementById("selected-building");
const unitList = document.getElementById("unit-list");
const unitsSummaryBuildingType = document.getElementById("units-summary-building-type");
const unitsSummaryBuildingAddress = document.getElementById("units-summary-building-address");
const unitsSummaryWaterCode = document.getElementById("units-summary-water-code");
const unitsSummaryInternetCode = document.getElementById("units-summary-internet-code");
const unitsSummaryInternetCompany = document.getElementById("units-summary-internet-company");
const unitsSummaryGasCode = document.getElementById("units-summary-gas-code");
const unitsSummaryOpenMapBtn = document.getElementById("units-summary-open-map");

// -- INQUILINOS --
const tenantForm = document.getElementById("tenant-form");
const tenantNameInput = document.getElementById("tenant-name");
const tenantDocInput = document.getElementById("tenant-doc");
const tenantPhoneInput = document.getElementById("tenant-phone");
const tenantEmailInput = document.getElementById("tenant-email");
const tenantStartDateInput = document.getElementById("tenant-start-date");
const tenantEndDateInput = document.getElementById("tenant-end-date");
const tenantMonthlyAmountInput = document.getElementById("tenant-monthly-amount");
const tenantNotesInput = document.getElementById("tenant-notes");
const tenantList = document.getElementById("tenant-list");
const selectedUnitLabel = document.getElementById("selected-unit");

// -- RECIBOS --
const invoiceForm = document.getElementById("invoice-form");
const invoiceDayInput = document.getElementById("invoice-day");
const invoiceMonthInput = document.getElementById("invoice-month");
const invoiceYearInput = document.getElementById("invoice-year");
const invoiceAmountInput = document.getElementById("invoice-amount");
const invoiceStatusSelect = document.getElementById("invoice-status");
const invoiceNotesInput = document.getElementById("invoice-notes");
const invoiceList = document.getElementById("invoice-list");
const invoiceBuildingLabel = document.getElementById("receipt-building");
const invoiceUnitLabel = document.getElementById("receipt-unit");
const receiptTenantInfoContainer = document.getElementById("receipt-tenant-info-container");
const receiptContractAmountLabel = document.getElementById("receipt-contract-amount");

// -- STAFF --
const staffBuildingLabel = document.getElementById("staff-building-label");
const currentBuildingHidden = document.getElementById("current-building-id");

// -- MODALES --
// Building Modal
const buildingModal = document.getElementById("building-modal");
const openBuildingModalBtn = document.getElementById("open-building-modal");
const buildingModalCloseBtn = document.getElementById("building-modal-close");
const buildingModalCancelBtn = document.getElementById("building-modal-cancel");

// Unit Modal
const unitModal = document.getElementById("unit-modal");
const openUnitModalBtn = document.getElementById("open-unit-modal");
const unitModalForm = document.getElementById("unit-modal-form");
const unitModalIdInput = document.getElementById("unit-modal-id");
const unitModalNameInput = document.getElementById("unit-modal-name");
const unitModalTypeSelect = document.getElementById("unit-modal-type");
const unitModalStatusSelect = document.getElementById("unit-modal-status");
const unitModalElectricCodeInput = document.getElementById("unit-modal-electricity-code");
const unitModalBuildingNameLabel = document.getElementById("unit-modal-building-name");
const unitModalTitle = document.getElementById("unit-modal-title");
const unitModalCloseBtn = document.getElementById("unit-modal-close");
const unitModalCancelBtn = document.getElementById("unit-modal-cancel");

// Services Modal
const buildingServicesModal = document.getElementById("building-services-modal");
const buildingServicesForm = document.getElementById("building-services-form");
const modalBuildingIdInput = document.getElementById("modal-building-id");
const modalBuildingNameLabel = document.getElementById("modal-building-name");
const modalWaterCodeInput = document.getElementById("modal-water-code");
const modalGasCodeInput = document.getElementById("modal-gas-code");
const modalInternetCodeInput = document.getElementById("modal-internet-code");
const modalInternetCompanyInput = document.getElementById("modal-internet-company");
const modalInternetPriceInput = document.getElementById("modal-internet-price");
const buildingServicesCloseBtn = document.getElementById("building-services-close");
const buildingServicesCancelBtn = document.getElementById("building-services-cancel");

// Map Modal
const buildingMapModal = document.getElementById("building-map-modal");
const buildingMapForm = document.getElementById("building-map-form");
const modalMapBuildingIdInput = document.getElementById("modal-map-building-id");
const modalMapBuildingNameLabel = document.getElementById("map-modal-building-name");
const modalMapsUrlInput = document.getElementById("modal-maps-url");
const mapIframe = document.getElementById("map-iframe");
const mapExternalLink = document.getElementById("map-external-link");
const mapPreviewHint = document.getElementById("map-preview-hint");
const buildingMapCloseBtn = document.getElementById("building-map-close");
const buildingMapCancelBtn = document.getElementById("building-map-cancel");

// ========================= ESTADO GLOBAL =========================
let selectedBuildingId = null;
let selectedBuildingName = null;
let selectedBuildingData = null;

let selectedUnitId = null;
let selectedUnitName = null;

let activeTenantId = null;
let activeTenantName = null;
let activeTenantData = null;

// Variables para control de edición y validación de inquilinos
let editingTenantId = null;
let unitHasActiveTenant = false;

let buildingsCache = [];
let filteredBuildings = [];

// ========================= UTILS UI =========================
function setTenantFormEnabled(enabled) {
  if (!tenantForm) return;
  const elements = tenantForm.querySelectorAll("input, button, textarea");
  elements.forEach((el) => { el.disabled = !enabled; });
  if (!enabled) tenantForm.reset();
}

function setInvoiceFormEnabled(enabled) {
  if (!invoiceForm) return;
  const elements = invoiceForm.querySelectorAll("input, button, select, textarea");
  elements.forEach((el) => { el.disabled = !enabled; });
  if(!enabled && invoiceAmountInput) invoiceAmountInput.value = "";
}

function initYearSelector() {
  if (!invoiceYearInput) return;
  const currentYear = new Date().getFullYear();
  invoiceYearInput.value = currentYear;
}
initYearSelector();

// Funciones para Inquilinos (Autocompletar y Reset)
function llenarFormularioInquilino(id, data) {
  editingTenantId = id; // Estamos en modo edición
  
  tenantNameInput.value = data.nombre || "";
  tenantDocInput.value = data.documento || "";
  tenantPhoneInput.value = data.telefono || "";
  tenantEmailInput.value = data.email || "";
  tenantStartDateInput.value = data.fechaInicio || "";
  tenantEndDateInput.value = data.fechaFin || "";
  tenantMonthlyAmountInput.value = data.montoAlquiler || "";
  tenantNotesInput.value = data.notas || "";

  // Cambiar botón visualmente
  const btnSubmit = tenantForm.querySelector("button[type='submit']");
  if(btnSubmit) {
      btnSubmit.innerHTML = `<span class="material-symbols-outlined">edit</span> Actualizar Datos`;
      btnSubmit.classList.remove("btn-primary");
      btnSubmit.classList.add("btn-warning");
  }
}

function resetTenantForm() {
  tenantForm.reset();
  editingTenantId = null; // Volvemos a modo creación
  const btnSubmit = tenantForm.querySelector("button[type='submit']");
  if(btnSubmit) {
      btnSubmit.innerHTML = `<span class="material-symbols-outlined">save</span> Guardar Inquilino`;
      btnSubmit.classList.add("btn-primary");
      btnSubmit.classList.remove("btn-warning");
  }
}

// ========================= MAPAS (CORREGIDO) =========================
function buildEmbedMapUrlFromInput(input) {
  const trimmed = input.trim();
  // Detectar si son coordenadas (ej: -17.821, -63.176)
  const coordMatch = trimmed.match(/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/);
  
  if (coordMatch) {
    const lat = coordMatch[1];
    const lng = coordMatch[3];
    // URL estándar de Google Maps Embed
    return `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
  }
  
  // URL estándar para búsquedas por texto
  return `https://maps.google.com/maps?q=${encodeURIComponent(trimmed)}&z=15&output=embed`;
}

function updateMapPreview(value) {
  if (!mapIframe) return;
  const trimmed = (value || "").trim();
  
  if (!trimmed) {
    mapIframe.src = "";
    if(mapExternalLink) mapExternalLink.classList.add("hidden");
    if(mapPreviewHint) mapPreviewHint.textContent = "El mapa se actualizará automáticamente.";
    return;
  }
  
  if(mapExternalLink) {
    // Enlace externo
    mapExternalLink.href = trimmed.startsWith("http") 
      ? trimmed 
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`;
      
    mapExternalLink.classList.remove("hidden");
  }
  
  const embedSrc = buildEmbedMapUrlFromInput(trimmed);
  mapIframe.src = embedSrc;
  
  if(mapPreviewHint) mapPreviewHint.textContent = "Vista previa cargada.";
}

// ========================= MODALES (Lógica) =========================
function openBuildingModal() {
  buildingForm.reset();
  if (buildingIdHiddenInput) buildingIdHiddenInput.value = "";
  if (buildingExtraFieldsDiv) buildingExtraFieldsDiv.style.display = "contents"; 
  const titleEl = buildingModal.querySelector("h3");
  if(titleEl) titleEl.textContent = "Registrar Inmueble";
  buildingModal.classList.add("visible");
}

function abrirModalEditarEdificio(id, data) {
  buildingIdHiddenInput.value = id;
  buildingNameInput.value = data.nombre || "";
  buildingTypeSelect.value = data.tipo || "edificio";
  buildingAddressInput.value = data.direccion || "";
  if (buildingExtraFieldsDiv) buildingExtraFieldsDiv.style.display = "none";
  const titleEl = buildingModal.querySelector("h3");
  if(titleEl) titleEl.textContent = "Editar Información";
  buildingModal.classList.add("visible");
}

function closeBuildingModal() { buildingModal.classList.remove("visible"); }
if (openBuildingModalBtn) openBuildingModalBtn.addEventListener("click", openBuildingModal);
if (buildingModalCloseBtn) buildingModalCloseBtn.addEventListener("click", closeBuildingModal);
if (buildingModalCancelBtn) buildingModalCancelBtn.addEventListener("click", closeBuildingModal);

function openBuildingServicesModal(buildingId, data) {
  modalBuildingIdInput.value = buildingId;
  modalBuildingNameLabel.textContent = data?.nombre || "";
  modalWaterCodeInput.value = data?.codigoAgua || "";
  modalGasCodeInput.value = data?.codigoGas || "";
  modalInternetCodeInput.value = data?.codigoInternet || "";
  modalInternetCompanyInput.value = data?.empresaInternet || "";
  modalInternetPriceInput.value = data?.internetPrice || "";
  buildingServicesModal.classList.add("visible");
}
function closeServices() { buildingServicesModal.classList.remove("visible"); }
if (buildingServicesCloseBtn) buildingServicesCloseBtn.addEventListener("click", closeServices);
if (buildingServicesCancelBtn) buildingServicesCancelBtn.addEventListener("click", closeServices);

function openMapForBuilding(buildingId, data) {
  modalMapBuildingIdInput.value = buildingId;
  modalMapBuildingNameLabel.textContent = data?.nombre || "";
  const url = data?.mapsUrl || "";
  modalMapsUrlInput.value = url;
  updateMapPreview(url);
  buildingMapModal.classList.add("visible");
}
function closeMap() { buildingMapModal.classList.remove("visible"); }
if (buildingMapCloseBtn) buildingMapCloseBtn.addEventListener("click", closeMap);
if (buildingMapCancelBtn) buildingMapCancelBtn.addEventListener("click", closeMap);
if (modalMapsUrlInput) modalMapsUrlInput.addEventListener("input", (e) => updateMapPreview(e.target.value));

function openUnitModal(unitId, data) {
  unitModalIdInput.value = unitId || "";
  unitModalNameInput.value = data?.nombre || "";
  unitModalTypeSelect.value = data?.tipo || "departamento";
  unitModalStatusSelect.value = data?.estado || "libre";
  unitModalElectricCodeInput.value = data?.codigoLuz || "";
  unitModalTitle.textContent = unitId ? "Editar Unidad" : "Nueva Unidad";
  unitModalBuildingNameLabel.textContent = selectedBuildingName || "Ninguno";
  unitModal.classList.add("visible");
}
function closeUnitModal() { unitModal.classList.remove("visible"); }
if (unitModalCloseBtn) unitModalCloseBtn.addEventListener("click", closeUnitModal);
if (unitModalCancelBtn) unitModalCancelBtn.addEventListener("click", closeUnitModal);
if (openUnitModalBtn) openUnitModalBtn.addEventListener("click", () => {
  if (!selectedBuildingId) return alert("Selecciona un inmueble primero.");
  openUnitModal(null, {});
});

// ========================= DATA GRID (Inmuebles) =========================
function renderBuildingGrid() {
  if (!buildingGrid) return;
  buildingGrid.innerHTML = "";
  
  if (filteredBuildings.length === 0) {
    buildingGrid.innerHTML = '<div style="padding:1.5rem; text-align:center; color:var(--text-muted);">No se encontraron inmuebles.</div>';
    return;
  }

  const table = document.createElement("table");
  table.className = "mui-data-grid-table";
  table.innerHTML = `
    <thead>
      <tr>
        <th>Nombre / Tipo</th>
        <th>Ubicación / Servicios</th>
        <th style="text-align:right;">Gestión</th>
      </tr>
    </thead>
  `;
  const tbody = document.createElement("tbody");

  filteredBuildings.forEach((b) => {
    const tr = document.createElement("tr");

    let typeColor = "#2563eb", typeBg = "#eff6ff";
    if (b.tipo === 'casa') { typeColor = "#059669"; typeBg = "#ecfdf5"; }
    else if (b.tipo === 'local') { typeColor = "#f59e0b"; typeBg = "#fffbeb"; }

    const td1 = document.createElement("td");
    td1.innerHTML = `
      <div style="display:flex; align-items:center; gap:0.5rem;">
        <span style="font-weight:600; color:var(--text-main); font-size:0.95rem;">${b.nombre}</span>
        <span class="mui-pill" style="color:${typeColor}; background:${typeBg}; text-transform:capitalize;">${b.tipo}</span>
      </div>
      <div class="text-truncate" style="font-size:0.8rem; color:var(--text-muted); margin-top:0.25rem; max-width:200px;">
         ${b.direccion}
      </div>
    `;

    const td2 = document.createElement("td");
    const icons = [];
    if (b.codigoAgua) icons.push(`<span class="material-symbols-outlined" style="font-size:16px;" title="Agua">water_drop</span>`);
    if (b.codigoGas) icons.push(`<span class="material-symbols-outlined" style="font-size:16px;" title="Gas">propane</span>`);
    if (b.codigoInternet) icons.push(`<span class="material-symbols-outlined" style="font-size:16px;" title="Internet">wifi</span>`);
    if (b.mapsUrl) icons.push(`<span class="material-symbols-outlined" style="font-size:16px;" title="Mapa">pin_drop</span>`);
    
    td2.innerHTML = `<div style="display:flex; gap:0.5rem; color:var(--text-muted);">${icons.join("") || "<small>Sin servicios</small>"}</div>`;

    const td3 = document.createElement("td");
    td3.style.textAlign = "right";
    td3.innerHTML = `
      <div style="display:inline-flex; gap:0.25rem;">
        <button class="icon-button btn-edit"><span class="material-symbols-outlined">edit</span></button>
        <button class="icon-button btn-staff"><span class="material-symbols-outlined">badge</span></button>
      </div>
    `;

    // --- EVENTOS DE CLICK Y NAVEGACIÓN ---
    
    // 1. Click en la FILA -> Ir a Unidades
    tr.addEventListener("click", () => seleccionarEdificio(b.id, b, { irAUnidades: true }));

    // 2. Botones (sin activar el click de la fila)
    td3.querySelector(".btn-edit").addEventListener("click", (e) => {
      e.stopPropagation(); abrirModalEditarEdificio(b.id, b);
    });
    td3.querySelector(".btn-staff").addEventListener("click", (e) => {
      e.stopPropagation();
      seleccionarEdificio(b.id, b, { irAUnidades: false });
      document.getElementById("staff-section-edificios").scrollIntoView({ behavior: "smooth" });
    });

    tr.appendChild(td1); tr.appendChild(td2); tr.appendChild(td3);
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  buildingGrid.appendChild(table);
}

// ========================= LÓGICA DE NEGOCIO (INMUEBLES) =========================
async function cargarEdificios() {
  buildingsCache = [];
  try {
    const snap = await getDocs(collection(db, "buildings"));
    snap.forEach(d => buildingsCache.push({ id: d.id, ...d.data() }));
    buildingsCache.sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));

    if (buildingSearchOptions) {
      buildingSearchOptions.innerHTML = "";
      buildingsCache.forEach(b => {
        const opt = document.createElement("option");
        opt.value = b.nombre;
        buildingSearchOptions.appendChild(opt);
      });
    }
    // IMPORTANTE: Llamar aquí para pintar la tabla inmediatamente
    aplicarFiltroEdificios();
  } catch (error) {
    console.error("Error cargando edificios:", error);
  }
}

function aplicarFiltroEdificios() {
  const term = (buildingSearchInput?.value || "").toLowerCase();
  filteredBuildings = term
    ? buildingsCache.filter(b => b.nombre.toLowerCase().includes(term) || b.direccion.toLowerCase().includes(term))
    : buildingsCache;
  renderBuildingGrid();
}
if (buildingSearchInput) buildingSearchInput.addEventListener("input", aplicarFiltroEdificios);

if (buildingForm) buildingForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = buildingIdHiddenInput.value;
  const data = {
    nombre: buildingNameInput.value.trim(),
    tipo: buildingTypeSelect.value,
    direccion: buildingAddressInput.value.trim()
  };

  if (!id) {
    data.creadoEn = new Date();
    data.codigoAgua = buildingWaterCodeInput.value;
    data.codigoGas = buildingGasCodeInput.value;
    data.codigoInternet = buildingInternetCodeInput.value;
    data.empresaInternet = buildingInternetCompanyInput.value;
    data.internetPrice = buildingInternetPriceInput.value;
    data.mapsUrl = buildingMapsUrlInput.value;
    await addDoc(collection(db, "buildings"), data);
  } else {
    await updateDoc(doc(db, "buildings", id), data);
    if (selectedBuildingId === id) {
      Object.assign(selectedBuildingData, data);
      actualizarResumenEdificio();
    }
  }
  closeBuildingModal();
  cargarEdificios();
});

// Guardar Servicios
if (buildingServicesForm) buildingServicesForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = modalBuildingIdInput.value;
  const data = {
    codigoAgua: modalWaterCodeInput.value,
    codigoGas: modalGasCodeInput.value,
    codigoInternet: modalInternetCodeInput.value,
    empresaInternet: modalInternetCompanyInput.value,
    internetPrice: modalInternetPriceInput.value
  };
  await updateDoc(doc(db, "buildings", id), data);
  if (selectedBuildingId === id) { Object.assign(selectedBuildingData, data); actualizarResumenEdificio(); }
  closeServices();
});

// Guardar Mapa
if (buildingMapForm) buildingMapForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = modalMapBuildingIdInput.value;
  const mapsUrl = modalMapsUrlInput.value;
  await updateDoc(doc(db, "buildings", id), { mapsUrl });
  if (selectedBuildingId === id) { selectedBuildingData.mapsUrl = mapsUrl; actualizarResumenEdificio(); }
  closeMap();
});

// SELECCIÓN Y RESUMEN
function seleccionarEdificio(id, data, opts = {}) {
  selectedBuildingId = id;
  selectedBuildingData = data;
  selectedBuildingName = data.nombre;

  if (staffBuildingLabel) staffBuildingLabel.textContent = data.nombre;
  if (currentBuildingHidden) {
    currentBuildingHidden.value = id;
    currentBuildingHidden.dispatchEvent(new Event("change"));
  }

  actualizarResumenEdificio();
  cargarUnidades(id);

  if (opts.irAUnidades) {
    if(tabUnidades) tabUnidades.checked = true; // Activar Tab
    showPage(pageUnidades); // Cambiar vista
  }
}

function actualizarResumenEdificio() {
  const d = selectedBuildingData;
  if (!d) return;
  if (buildingSummarySection) buildingSummarySection.classList.remove("hidden");

  if (summaryBuildingName) summaryBuildingName.textContent = d.nombre;
  if (summaryBuildingType) summaryBuildingType.textContent = d.tipo;
  if (summaryBuildingAddress) summaryBuildingAddress.textContent = d.direccion;
  if (summaryWaterCode) summaryWaterCode.textContent = d.codigoAgua || "—";
  if (summaryGasCode) summaryGasCode.textContent = d.codigoGas || "—";
  if (summaryInternetCode) summaryInternetCode.textContent = d.codigoInternet || "—";
  if (summaryInternetCompany) summaryInternetCompany.textContent = d.empresaInternet || "—";
  if (summaryInternetPrice) summaryInternetPrice.textContent = d.internetPrice ? `$${d.internetPrice}` : "—";
  
  // Truncar visualmente
  if (summaryMapsUrl) {
    summaryMapsUrl.textContent = d.mapsUrl || "Sin mapa";
    summaryMapsUrl.title = d.mapsUrl || ""; // Tooltip con texto completo
  }

  if (selectedBuildingLabel) selectedBuildingLabel.textContent = d.nombre;
  if (invoiceBuildingLabel) invoiceBuildingLabel.textContent = d.nombre;

  // Contexto en Unidades
  if (unitsSummaryBuildingType) unitsSummaryBuildingType.textContent = d.tipo;
  if (unitsSummaryBuildingAddress) unitsSummaryBuildingAddress.textContent = d.direccion;
  if (unitsSummaryInternetCode) unitsSummaryInternetCode.textContent = d.codigoInternet || "—";
  if (unitsSummaryInternetCompany) unitsSummaryInternetCompany.textContent = d.empresaInternet || "—";

  // ACTUALIZAR CÓDIGOS DE AGUA Y GAS EN UNIDADES
  if (unitsSummaryWaterCode) unitsSummaryWaterCode.textContent = d.codigoAgua || "—";
  if (unitsSummaryGasCode) unitsSummaryGasCode.textContent = d.codigoGas || "—";
}
if (summaryOpenServicesBtn) summaryOpenServicesBtn.addEventListener("click", () => openBuildingServicesModal(selectedBuildingId, selectedBuildingData));
if (summaryOpenMapBtn) summaryOpenMapBtn.addEventListener("click", () => openMapForBuilding(selectedBuildingId, selectedBuildingData));
if (unitsSummaryOpenMapBtn) unitsSummaryOpenMapBtn.addEventListener("click", () => openMapForBuilding(selectedBuildingId, selectedBuildingData));

// ========================= UNIDADES =========================
async function cargarUnidades(buildingId) {
  unitList.innerHTML = "";
  const q = query(collection(db, "units"), where("buildingId", "==", buildingId));
  const snap = await getDocs(q);

  if (snap.empty) {
    unitList.innerHTML = '<li style="justify-content:center; color:var(--text-muted);">No hay unidades.</li>';
    return;
  }

  const docs = [];
  snap.forEach(d => docs.push({ id: d.id, ...d.data() }));
  docs.sort((a, b) => a.nombre.localeCompare(b.nombre, undefined, { numeric: true }));

  docs.forEach((data) => {
    const li = document.createElement("li");
    let icon = "home";
    if (data.tipo === "departamento") icon = "apartment";
    if (data.tipo === "local") icon = "storefront";
    const statusColor = data.estado === "ocupado" ? "var(--warning)" : "var(--success)";

    li.innerHTML = `
      <div class="item-main" style="display:flex; align-items:center; gap:0.75rem;">
        <div style="background:#f1f5f9; padding:0.5rem; border-radius:50%;">
           <span class="material-symbols-outlined" style="color:var(--text-muted);">${icon}</span>
        </div>
        <div>
          <strong style="font-size:1rem; color:var(--text-main);">${data.nombre}</strong>
          <div style="font-size:0.8rem; display:flex; gap:0.5rem; align-items:center;">
             <span style="color:${statusColor}; font-weight:600; text-transform:uppercase; font-size:0.7rem;">${data.estado}</span>
             <span style="color:var(--border-color);">|</span>
             <span>Luz: ${data.codigoLuz || "N/A"}</span>
          </div>
        </div>
      </div>
      <div style="display:flex; gap:0.5rem;">
         <button class="icon-button btn-edit"><span class="material-symbols-outlined">edit</span></button>
      </div>
    `;

    // CLICK EN FILA -> IR A INQUILINOS
    li.addEventListener("click", () => seleccionarUnidad(data.id, data, true));

    li.querySelector(".btn-edit").addEventListener("click", (e) => {
      e.stopPropagation(); openUnitModal(data.id, data);
    });

    unitList.appendChild(li);
  });
}

function seleccionarUnidad(id, data, irTab = false) {
  selectedUnitId = id;
  selectedUnitName = data.nombre;

  if (selectedUnitLabel) selectedUnitLabel.textContent = data.nombre;
  if (invoiceUnitLabel) invoiceUnitLabel.textContent = data.nombre;

  // Limpiar selección previa
  activeTenantId = null;
  updateReceiptContext(null);

  cargarInquilinos(id);
  if (irTab) {
    if(tabInquilinos) tabInquilinos.checked = true;
    showPage(pageInquilinos);
  }
}

if (unitModalForm) unitModalForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = unitModalIdInput.value;
  const data = {
    buildingId: selectedBuildingId, buildingNombre: selectedBuildingName,
    nombre: unitModalNameInput.value, tipo: unitModalTypeSelect.value,
    estado: unitModalStatusSelect.value, codigoLuz: unitModalElectricCodeInput.value
  };
  if (id) await updateDoc(doc(db, "units", id), data);
  else await addDoc(collection(db, "units"), { ...data, creadoEn: new Date() });
  closeUnitModal();
  cargarUnidades(selectedBuildingId);
});

// ========================= INQUILINOS (Lógica Renovada) =========================
// ========================= INQUILINOS (CORREGIDO) =========================
async function cargarInquilinos(unitId) {
  tenantList.innerHTML = "";
  // Resetear formulario y estado al cargar para evitar mezclas
  resetTenantForm(); 
  unitHasActiveTenant = false; 

  const q = query(collection(db, "tenants"), where("unitId", "==", unitId));
  const snap = await getDocs(q);

  if (snap.empty) {
    tenantList.innerHTML = '<li style="justify-content:center; color:var(--text-muted);">Sin historial.</li>';
    return;
  }

  const docs = [];
  snap.forEach(d => docs.push({ id: d.id, ...d.data() }));
  docs.sort((a, b) => (b.activo === a.activo) ? 0 : b.activo ? 1 : -1);

  let activeFound = null;

  docs.forEach((data) => {
    // Detectar si hay uno activo para bloquear nuevos registros
    if (data.activo) {
        unitHasActiveTenant = true;
        activeFound = { id: data.id, ...data };
    }

    const li = document.createElement("li");
    const isActive = data.activo;
    
    // Estilos visuales
    const badgeStyle = isActive
      ? "background:var(--success-bg); color:var(--success);"
      : "background:var(--bg-body); color:var(--text-muted);";

    li.innerHTML = `
      <div class="item-main" style="cursor:pointer;">
        <strong>${data.nombre}</strong>
        <div style="margin-top:0.2rem;">
          <span class="mui-pill" style="${badgeStyle}; font-size:0.7rem;">${isActive ? "ACTIVO" : "HISTÓRICO"}</span>
          <span style="margin-left:0.5rem; font-size:0.85rem;">$${Number(data.montoAlquiler).toFixed(2)}</span>
        </div>
      </div>
      
      <div style="display:flex; gap:0.5rem; align-items:center;">
         <button class="icon-button btn-goto-receipts" title="Ver Recibos y Pagos" type="button">
            <span class="material-symbols-outlined">receipt_long</span>
         </button>

         ${isActive ? `<button class="btn btn-xs btn-outline btn-rescindir" style="color:var(--danger); border-color:var(--danger-bg);" type="button">Finalizar</button>` : ''}
      </div>
    `;

    // 1. EVENTO CLIC EN LA FILA -> AUTOCOMPLETAR (SIN REDIRECCIÓN)
    // Al hacer clic en el texto/nombre, llenamos el formulario pero NOS QUEDAMOS AQUI.
    const itemMain = li.querySelector(".item-main");
    itemMain.addEventListener("click", () => {
      llenarFormularioInquilino(data.id, data);
      // Activamos el contexto global, pero pasamos 'false' para no cambiar de pestaña
      if (isActive) activarInquilino(data.id, data, false); 
    });

    // 2. EVENTO BOTÓN RECIBOS -> IR A PESTAÑA RECIBOS
    const btnReceipts = li.querySelector(".btn-goto-receipts");
    btnReceipts.addEventListener("click", (e) => {
      e.stopPropagation(); // Evitar que dispare el autocompletado también
      activarInquilino(data.id, data, true); // 'true' = Lléame a la pestaña recibos
    });

    // 3. EVENTO BOTÓN FINALIZAR
    if (isActive) {
      li.querySelector(".btn-rescindir").addEventListener("click", (e) => {
        e.stopPropagation(); 
        rescindirContrato(data.id, unitId);
      });
    }
    
    tenantList.appendChild(li);
  });

  // Si encontramos uno activo, cargamos sus datos en segundo plano por si el usuario cambia de pestaña manualmente
  if (activeFound) {
    activarInquilino(activeFound.id, activeFound, false);
  } else {
    updateReceiptContext(null);
  }
}

function activarInquilino(id, data, irRecibos = false) {
  activeTenantId = id;
  activeTenantName = data.nombre;
  activeTenantData = data;
  updateReceiptContext(data);
  cargarRecibos(selectedUnitId);

  if (irRecibos) {
    if(tabRecibos) tabRecibos.checked = true;
    showPage(pageRecibos);
  }
}

async function rescindirContrato(id, unitId) {
  if (!confirm("¿Finalizar contrato?")) return;
  const hoy = new Date().toISOString().split('T')[0];
  await updateDoc(doc(db, "tenants", id), { activo: false, fechaFin: hoy });
  await updateDoc(doc(db, "units", unitId), { estado: "libre" });
  cargarInquilinos(unitId);
  cargarUnidades(selectedBuildingId);
}

// LÓGICA DE GUARDAR / ACTUALIZAR INQUILINO
if (tenantForm) tenantForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!selectedUnitId) return alert("Selecciona unidad.");

  const data = {
    buildingId: selectedBuildingId, 
    unitId: selectedUnitId,
    nombre: tenantNameInput.value, 
    documento: tenantDocInput.value,
    telefono: tenantPhoneInput.value, 
    email: tenantEmailInput.value,
    fechaInicio: tenantStartDateInput.value, 
    fechaFin: tenantEndDateInput.value,
    montoAlquiler: Number(tenantMonthlyAmountInput.value), 
    notas: tenantNotesInput.value
  };

  try {
    if (editingTenantId) {
      // === MODO EDICIÓN (ACTUALIZAR EXISTENTE) ===
      await updateDoc(doc(db, "tenants", editingTenantId), data);
      alert("Datos del inquilino actualizados.");
      
    } else {
      // === MODO CREACIÓN (NUEVO CONTRATO) ===
      
      // VALIDACIÓN: Si ya hay uno activo, NO PERMITIR crear otro
      if (unitHasActiveTenant) {
        alert("⛔ ERROR: Esta unidad ya tiene un inquilino ACTIVO.\n\nDebes finalizar el contrato actual antes de registrar uno nuevo.");
        return; 
      }

      data.activo = true;
      data.creadoEn = new Date();
      
      await updateDoc(doc(db, "units", selectedUnitId), { estado: "ocupado" });
      const ref = await addDoc(collection(db, "tenants"), data);
      
      // Generar PDF solo al crear nuevo contrato
      generarPDFContratoAlquiler({ 
        numeroContrato: ref.id, 
        buildingNombre: selectedBuildingName, 
        unitNombre: selectedUnitName, 
        tenantNombre: data.nombre, 
        ...data 
      });
    }

    // Limpiar y recargar
    resetTenantForm();
    cargarUnidades(selectedBuildingId); // Para actualizar estado de la unidad
    cargarInquilinos(selectedUnitId);   // Recargar lista

  } catch (error) {
    console.error("Error al guardar inquilino:", error);
    alert("Hubo un error al guardar.");
  }
});

// ========================= RECIBOS =========================
function updateReceiptContext(data) {
  if (!receiptTenantInfoContainer) return;
  if (!data) {
    receiptTenantInfoContainer.innerHTML = '<p class="hint">No hay inquilino activo.</p>';
    receiptContractAmountLabel.textContent = "—";
    setInvoiceFormEnabled(false);
    return;
  }
  receiptTenantInfoContainer.innerHTML = `
    <div style="font-size:0.95rem;">
      <div style="font-weight:600; color:var(--primary);">${data.nombre}</div>
      <div style="color:var(--text-muted); font-size:0.85rem;">Doc: ${data.documento || "—"}</div>
    </div>
  `;
  receiptContractAmountLabel.textContent = `$${Number(data.montoAlquiler).toFixed(2)}`;
  if (invoiceAmountInput) invoiceAmountInput.value = data.montoAlquiler;
  setInvoiceFormEnabled(true);
}

// ========================= CALENDARIO & RECIBOS (LÓGICA MEJORADA) =========================

// Variables para el calendario
let currentDate = new Date(); // Fecha que muestra el calendario actualmente
let currentInvoices = []; // Almacena los recibos cargados para filtrar localmente

// 1. CARGAR RECIBOS DESDE FIREBASE
async function cargarRecibos(unitId) {
  if (!activeTenantId) return;
  
  // Limpiamos visualmente
  invoiceList.innerHTML = '<li style="padding:1rem;">Cargando...</li>';
  
  const q = query(
    collection(db, "invoices"),
    where("unitId", "==", unitId),
    where("tenantId", "==", activeTenantId),
    orderBy("creadoEn", "desc")
  );

  try {
    const snap = await getDocs(q);
    currentInvoices = []; // Reiniciar cache local

    if (snap.empty) {
      invoiceList.innerHTML = '<li style="justify-content:center; color:var(--text-muted);">Sin movimientos.</li>';
    } else {
      invoiceList.innerHTML = ""; // Limpiar lista
    }

    snap.forEach((d) => {
      const data = { id: d.id, ...d.data() };
      currentInvoices.push(data); // Guardamos en memoria para el calendario
      
      // Renderizar lista lateral (Historial compacto)
      renderInvoiceListItem(data);
    });

    // IMPORTANTE: Una vez cargados los datos, dibujamos el calendario
    renderCalendar();

  } catch (err) {
    console.error("Error cargando recibos:", err);
    invoiceList.innerHTML = '<li style="color:var(--danger);">Error de conexión.</li>';
  }
}

// 2. RENDERIZAR ÍTEM DE LISTA (Lateral)
function renderInvoiceListItem(data) {
    const li = document.createElement("li");
    let stColor = "var(--warning)", icon = "schedule";
    if (data.estado === "pagado") { stColor = "var(--success)"; icon = "check_circle"; }
    else if (data.estado === "pendiente") { stColor = "var(--danger)"; icon = "priority_high"; }

    li.innerHTML = `
      <div class="item-main">
         <div style="display:flex; justify-content:space-between; width:100%;">
            <strong style="font-size:0.9rem;">$${Number(data.monto).toFixed(2)}</strong>
            <span style="color:${stColor}; font-size:0.7rem; display:flex; align-items:center; gap:0.2rem;">
              <span class="material-symbols-outlined" style="font-size:12px;">${icon}</span> ${data.estado}
            </span>
         </div>
         <div style="font-size:0.75rem; color:var(--text-muted);">
           ${data.fechaDia}/${data.fechaMes}/${data.fechaAnio}
         </div>
      </div>
      <button class="icon-button btn-pdf" style="padding:0.2rem;"><span class="material-symbols-outlined" style="font-size:18px;">print</span></button>
    `;
    li.querySelector(".btn-pdf").addEventListener("click", () => generarPDFRecibo({ ...data, numeroComprobante: data.id }));
    invoiceList.appendChild(li);
}

// 3. RENDERIZAR CALENDARIO (Lógica Principal)
function renderCalendar() {
  const calendarBody = document.getElementById("calendar-body");
  const monthYearLabel = document.getElementById("cal-month-year");
  const finExpected = document.getElementById("fin-expected");
  const finPaid = document.getElementById("fin-paid");
  const finPending = document.getElementById("fin-pending");
  
  if (!calendarBody) return;

  // Datos del mes actual seleccionado
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0 = Enero
  
  // Nombre del mes
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  monthYearLabel.textContent = `${monthNames[month]} ${year}`;

  // Cálculos de días
  const firstDayIndex = new Date(year, month, 1).getDay(); // Día semana del 1ro
  const lastDay = new Date(year, month + 1, 0).getDate(); // Total días mes
  
  calendarBody.innerHTML = "";

  // Filtros activos (Checkboxes)
  const showPaid = document.querySelector('input[data-filter="pagado"]')?.checked ?? true;
  const showPending = document.querySelector('input[data-filter="pendiente"]')?.checked ?? true;

  // Variables para el Resumen Financiero del mes
  let totalPagadoMes = 0;
  let totalDeudaMes = 0;

  // Filtrar recibos que pertenecen a ESTE mes y año
  const monthInvoices = currentInvoices.filter(inv => 
    parseInt(inv.fechaMes) === (month + 1) && 
    parseInt(inv.fechaAnio) === year
  );

  // Calcular totales financieros
  monthInvoices.forEach(inv => {
    const monto = Number(inv.monto) || 0;
    if (inv.estado === 'pagado') totalPagadoMes += monto;
    else totalDeudaMes += monto; // Pendiente o parcial cuenta como deuda visual aquí
  });

  // Actualizar Barra Superior Financiera
  const alquiler = activeTenantData ? Number(activeTenantData.montoAlquiler) : 0;
  finExpected.textContent = `$${alquiler.toFixed(0)}`;
  finPaid.textContent = `$${totalPagadoMes.toFixed(0)}`;
  finPending.textContent = `$${(alquiler - totalPagadoMes).toFixed(0)}`; 
  
  // Color dinámico de "Pendiente": Si pagó todo, verde, si no, rojo
  finPending.parentElement.className = (alquiler - totalPagadoMes) <= 0 ? "fin-item success" : "fin-item danger";

  // DIBUJAR GRILLA
  
  // Celdas vacías previas
  for (let i = 0; i < firstDayIndex; i++) {
    const div = document.createElement("div");
    div.classList.add("day-cell", "empty");
    calendarBody.appendChild(div);
  }

  // Celdas de días
  for (let i = 1; i <= lastDay; i++) {
    const cell = document.createElement("div");
    cell.classList.add("day-cell");
    
    // Marcar "Hoy"
    const today = new Date();
    if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
      cell.classList.add("today");
    }

    const dayNumber = document.createElement("div");
    dayNumber.className = "day-number";
    dayNumber.textContent = i;
    cell.appendChild(dayNumber);

    // BUSCAR EVENTOS PARA ESTE DÍA
    const dayEvents = monthInvoices.filter(inv => parseInt(inv.fechaDia) === i);

    dayEvents.forEach(evt => {
      // Aplicar filtros visuales
      if (evt.estado === 'pagado' && !showPaid) return;
      if (evt.estado !== 'pagado' && !showPending) return;

      const pill = document.createElement("div");
      pill.className = `cal-event status-${evt.estado}`;
      pill.innerHTML = `<span>$${evt.monto}</span>`;
      pill.title = `${evt.notas || 'Sin notas'} - ${evt.estado.toUpperCase()}`;
      
      // Al hacer clic en el pill, podemos abrir el PDF o preguntar si quiere marcar pagado
      pill.addEventListener("click", (e) => {
        e.stopPropagation();
        if(evt.estado !== 'pagado') {
           if(confirm(`¿Marcar recibo de $${evt.monto} como PAGADO?`)) {
             marcarComoPagado(evt.id);
           }
        } else {
           generarPDFRecibo({...evt, numeroComprobante: evt.id});
        }
      });

      cell.appendChild(pill);
    });

    calendarBody.appendChild(cell);
  }
}

// 4. FUNCIÓN AUXILIAR: MARCAR PAGADO DESDE CALENDARIO
async function marcarComoPagado(invoiceId) {
    try {
        await updateDoc(doc(db, "invoices", invoiceId), { estado: "pagado" });
        cargarRecibos(selectedUnitId); // Recargar todo
    } catch(e) {
        alert("Error al actualizar");
    }
}

// 5. EVENT LISTENERS PARA NAVEGACIÓN DEL CALENDARIO
document.getElementById("cal-prev")?.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});
document.getElementById("cal-next")?.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

// Filtros
document.querySelectorAll('.calendar-filters input').forEach(chk => {
    chk.addEventListener("change", renderCalendar);
});

if (invoiceForm) invoiceForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!activeTenantId) return alert("Error: No hay inquilino activo");

  const data = {
    buildingId: selectedBuildingId, unitId: selectedUnitId, tenantId: activeTenantId,
    buildingNombre: selectedBuildingName, unitNombre: selectedUnitName, tenantNombre: activeTenantName,
    fechaDia: invoiceDayInput.value, fechaMes: invoiceMonthInput.value, fechaAnio: invoiceYearInput.value,
    monto: Number(invoiceAmountInput.value), estado: invoiceStatusSelect.value, notas: invoiceNotesInput.value,
    creadoEn: new Date()
  };

  const ref = await addDoc(collection(db, "invoices"), data);
  generarPDFRecibo({ ...data, numeroComprobante: ref.id });
  invoiceForm.reset();
  initYearSelector();
  updateReceiptContext(activeTenantData);
  cargarRecibos(selectedUnitId);
});

// ========================= PDF =========================
function generarPDFContratoAlquiler(info) {
  const doc = new jsPDF();
  doc.setFont("helvetica", "bold"); doc.setFontSize(18);
  doc.text("CONTRATO DE ALQUILER", 105, 20, null, null, "center");
  doc.setFontSize(12); doc.setFont("helvetica", "normal");
  let y = 40;
  const add = (l, v) => { doc.text(`${l}: ${v}`, 20, y); y += 10; };
  add("Inmueble", info.buildingNombre); add("Unidad", info.unitNombre);
  add("Inquilino", info.tenantNombre); add("Documento", info.documento || "N/A");
  add("Fecha Inicio", info.fechaInicio); add("Fecha Fin", info.fechaFin);
  add("Monto Mensual", `$${Number(info.montoAlquiler).toFixed(2)}`);
  y += 10; doc.text("Notas:", 20, y); y += 7;
  doc.setFontSize(10); doc.text(doc.splitTextToSize(info.notas || "Sin observaciones.", 170), 20, y);
  doc.save(`Contrato_${info.tenantNombre}.pdf`);
}

function generarPDFRecibo(info) {
  const doc = new jsPDF();
  doc.setFontSize(16); doc.text("RECIBO DE PAGO", 105, 20, null, null, "center");
  doc.setFontSize(12);
  doc.text(`Comprobante: #${info.numeroComprobante.slice(0, 8)}`, 20, 40);
  doc.text(`Fecha: ${info.fechaDia}/${info.fechaMes}/${info.fechaAnio}`, 20, 50);
  doc.text(`Inquilino: ${info.tenantNombre}`, 20, 60);
  doc.text(`Concepto: ${info.notas || "Alquiler"}`, 20, 70);
  doc.setFontSize(14); doc.setFont("helvetica", "bold");
  doc.text(`TOTAL: $${Number(info.monto).toFixed(2)}`, 20, 90);
  doc.save(`Recibo_${info.numeroComprobante}.pdf`);
}

// ========================= INIT =========================
async function init() {
  await cargarEdificios();
  // MOSTRAR PÁGINA INICIAL AL CARGAR
  showPage(pageEdificios); 
  console.log("Sistema cargado y listo.");
}
