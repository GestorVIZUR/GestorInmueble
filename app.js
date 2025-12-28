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
  orderBy,
  limit
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
    if (loginScreen) {
      loginScreen.style.opacity = "0";
      setTimeout(() => loginScreen.classList.add("hidden"), 300);
    }
    if (appContent) {
      appContent.classList.remove("hidden");
    }
    await init(); 
  } else {
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
    try {
      await signInWithEmailAndPassword(auth, loginEmail.value, loginPassword.value);
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
      window.scrollTo(0, 0); 
    } else {
      p.style.display = "none";
    }
  });
}

if (tabEdificios) tabEdificios.addEventListener("change", () => showPage(pageEdificios));
if (tabUnidades) tabUnidades.addEventListener("change", () => showPage(pageUnidades));
if (tabInquilinos) tabInquilinos.addEventListener("change", () => showPage(pageInquilinos));
if (tabRecibos) tabRecibos.addEventListener("change", () => showPage(pageRecibos));

const backButtons = document.querySelectorAll(".back-button");
backButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.target;
    if (target === "edificios" && tabEdificios) {
      tabEdificios.checked = true;
      showPage(pageEdificios);
    } else if (target === "unidades" && tabUnidades) {
      tabUnidades.checked = true;
      showPage(pageUnidades);
    }
  });
});

// ========================= REFERENCIAS DOM GLOBALES =========================

// -- EDIFICIOS (Formulario Principal) --
const buildingForm = document.getElementById("building-form");
const buildingIdHiddenInput = document.getElementById("building-id-hidden"); 
const buildingExtraFieldsDiv = document.getElementById("building-extra-fields");
const buildingNameInput = document.getElementById("building-name");
const buildingTypeSelect = document.getElementById("building-type");
const buildingAddressInput = document.getElementById("building-address");
const buildingGasCodeInput = document.getElementById("building-gas-code"); // Gas sigue simple
const buildingMapsUrlInput = document.getElementById("building-maps-url");

// Botones y Contenedores DINÁMICOS (Principal)
const btnAddWater = document.getElementById("btn-add-water");
const btnAddElectricity = document.getElementById("btn-add-electricity");
const btnAddInternet = document.getElementById("btn-add-internet");
const waterListContainer = document.getElementById("water-list-container");
const electricityListContainer = document.getElementById("electricity-list-container");
const internetListContainer = document.getElementById("internet-list-container");

const buildingGrid = document.getElementById("building-grid");
const buildingSearchInput = document.getElementById("building-search");
const buildingSearchOptions = document.getElementById("building-search-options");

// -- RESUMEN EDIFICIO --
const buildingSummarySection = document.getElementById("building-summary");
const summaryBuildingName = document.getElementById("summary-building-name");
const summaryBuildingType = document.getElementById("summary-building-type");
const summaryBuildingAddress = document.getElementById("summary-building-address");
const summaryGasCode = document.getElementById("summary-gas-code");
const summaryMapsUrl = document.getElementById("summary-maps-url");
// Contenedores Resumen Dinámicos
const summaryWaterList = document.getElementById("summary-water-list");
const summaryElectricityList = document.getElementById("summary-electricity-list");
const summaryInternetList = document.getElementById("summary-internet-list");

const summaryOpenServicesBtn = document.getElementById("summary-open-services");
const summaryOpenMapBtn = document.getElementById("summary-open-map");

// -- UNIDADES --
const selectedBuildingLabel = document.getElementById("selected-building");
const unitList = document.getElementById("unit-list");
const unitsSummaryBuildingType = document.getElementById("units-summary-building-type");
const unitsSummaryBuildingAddress = document.getElementById("units-summary-building-address");
const unitsSummaryWaterCode = document.getElementById("units-summary-water-code");
const unitsSummaryGasCode = document.getElementById("units-summary-gas-code");
const unitsSummaryInternetCode = document.getElementById("units-summary-internet-code");
const unitsSummaryInternetCompany = document.getElementById("units-summary-internet-company");
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

// ========================= MODALES =========================

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

// Services Modal (Pequeño)
const buildingServicesModal = document.getElementById("building-services-modal");
const buildingServicesForm = document.getElementById("building-services-form");
const modalBuildingIdInput = document.getElementById("modal-building-id");
const modalBuildingNameLabel = document.getElementById("modal-building-name");
const modalGasCodeInput = document.getElementById("modal-gas-code");

// Botones y Contenedores DINÁMICOS (Modal Servicios)
const btnAddWaterSrv = document.getElementById("btn-add-water-srv");
const btnAddElectricitySrv = document.getElementById("btn-add-electricity-srv");
const btnAddInternetServices = document.getElementById("btn-add-internet-services");
const waterListServices = document.getElementById("water-list-services");
const electricityListServices = document.getElementById("electricity-list-services");
const internetListServices = document.getElementById("internet-list-services");

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
let editingTenantId = null;
let unitHasActiveTenant = false;
let buildingsCache = [];
let filteredBuildings = [];

// ========================= UTILIDADES UI =========================
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

function llenarFormularioInquilino(id, data) {
  editingTenantId = id;
  tenantNameInput.value = data.nombre || "";
  tenantDocInput.value = data.documento || "";
  tenantPhoneInput.value = data.telefono || "";
  tenantEmailInput.value = data.email || "";
  tenantStartDateInput.value = data.fechaInicio || "";
  tenantEndDateInput.value = data.fechaFin || "";
  tenantMonthlyAmountInput.value = data.montoAlquiler || "";
  tenantNotesInput.value = data.notas || "";

  const btnSubmit = tenantForm.querySelector("button[type='submit']");
  if(btnSubmit) {
      btnSubmit.innerHTML = `<span class="material-symbols-outlined">edit</span> Actualizar Datos`;
      btnSubmit.classList.remove("btn-primary");
      btnSubmit.classList.add("btn-warning");
  }
}

function resetTenantForm() {
  tenantForm.reset();
  editingTenantId = null;
  const btnSubmit = tenantForm.querySelector("button[type='submit']");
  if(btnSubmit) {
      btnSubmit.innerHTML = `<span class="material-symbols-outlined">save</span> Guardar Inquilino`;
      btnSubmit.classList.add("btn-primary");
      btnSubmit.classList.remove("btn-warning");
  }
}

// ========================= LÓGICA DINÁMICA GENÉRICA (AGUA, LUZ, INTERNET) =========================

// Función maestra para pintar filas de servicio
function renderServiceRow(data = {}, containerId, placeholderType = "Empresa") {
  const container = document.getElementById(containerId);
  if (!container) return;

  const div = document.createElement("div");
  div.className = "internet-row"; // Usamos la clase CSS existente para diseño
  
  let ph1 = placeholderType; 
  let ph2 = "Código / Medidor";
  
  div.innerHTML = `
    <input type="text" class="srv-company" placeholder="${ph1}" value="${data.empresa || ''}">
    <input type="text" class="srv-code" placeholder="${ph2}" value="${data.codigo || ''}">
    <input type="number" class="srv-price" placeholder="Costo" value="${data.precio || ''}">
    <button type="button" class="btn-remove-row"><span class="material-symbols-outlined">delete</span></button>
  `;

  div.querySelector(".btn-remove-row").addEventListener("click", () => div.remove());
  container.appendChild(div);
}

// Función maestra para leer los datos antes de guardar
function getServicesFromContainer(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return [];

  const rows = container.querySelectorAll(".internet-row");
  const services = [];
  rows.forEach(row => {
    const empresa = row.querySelector(".srv-company").value.trim();
    const codigo = row.querySelector(".srv-code").value.trim();
    const precio = row.querySelector(".srv-price").value;
    
    if (empresa || codigo) {
      services.push({ empresa, codigo, precio });
    }
  });
  return services;
}

// EVENTOS ADD BUTTONS (Formulario Principal)
if (btnAddWater) btnAddWater.addEventListener("click", () => renderServiceRow({}, "water-list-container", "Cooperativa"));
if (btnAddElectricity) btnAddElectricity.addEventListener("click", () => renderServiceRow({}, "electricity-list-container", "Distribuidora"));
if (btnAddInternet) btnAddInternet.addEventListener("click", () => renderServiceRow({}, "internet-list-container", "Proveedor"));

// EVENTOS ADD BUTTONS (Modal Servicios Pequeño)
if (btnAddWaterSrv) btnAddWaterSrv.addEventListener("click", () => renderServiceRow({}, "water-list-services", "Cooperativa"));
if (btnAddElectricitySrv) btnAddElectricitySrv.addEventListener("click", () => renderServiceRow({}, "electricity-list-services", "Distribuidora"));
if (btnAddInternetServices) btnAddInternetServices.addEventListener("click", () => renderServiceRow({}, "internet-list-services", "Proveedor"));


// ========================= MAPAS =========================
function buildEmbedMapUrlFromInput(input) {
  const trimmed = input.trim();
  const coordMatch = trimmed.match(/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/);
  if (coordMatch) {
    return `https://maps.google.com/maps?q=${trimmed}&z=15&output=embed`;
  }
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
    mapExternalLink.href = trimmed.startsWith("http") 
      ? trimmed 
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`;
    mapExternalLink.classList.remove("hidden");
  }
  
  const embedSrc = buildEmbedMapUrlFromInput(trimmed);
  mapIframe.src = embedSrc;
  if(mapPreviewHint) mapPreviewHint.textContent = "Vista previa cargada.";
}

// ========================= MODALES (Lógica Apertura) =========================

function openBuildingModal() {
  buildingForm.reset();
  if (buildingIdHiddenInput) buildingIdHiddenInput.value = "";
  
  // Limpiar contenedores
  if(waterListContainer) waterListContainer.innerHTML = "";
  if(electricityListContainer) electricityListContainer.innerHTML = "";
  if(internetListContainer) internetListContainer.innerHTML = "";
  
  // Agregar una fila vacía por defecto a cada uno
  renderServiceRow({}, "water-list-container", "Cooperativa");
  renderServiceRow({}, "electricity-list-container", "Distribuidora");
  renderServiceRow({}, "internet-list-container", "Proveedor");
  
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
  buildingGasCodeInput.value = data.codigoGas || ""; // Gas simple
  buildingMapsUrlInput.value = data.mapsUrl || "";

  // Helper para cargar listas
  const loadList = (list, containerId, ph) => {
      const container = document.getElementById(containerId);
      container.innerHTML = "";
      if (list && list.length > 0) {
          list.forEach(item => renderServiceRow(item, containerId, ph));
      } else {
          renderServiceRow({}, containerId, ph);
      }
  };

  // Compatibilidad Agua
  let waterData = data.waterServices || [];
  if (waterData.length === 0 && data.codigoAgua) waterData.push({ empresa: "Agua", codigo: data.codigoAgua });
  
  // Compatibilidad Internet
  let netData = data.internetServices || [];
  if (netData.length === 0 && (data.empresaInternet || data.codigoInternet)) {
      netData.push({ empresa: data.empresaInternet, codigo: data.codigoInternet, precio: data.internetPrice });
  }

  loadList(waterData, "water-list-container", "Cooperativa");
  loadList(data.electricityServices, "electricity-list-container", "Distribuidora");
  loadList(netData, "internet-list-container", "Proveedor");

  if (buildingExtraFieldsDiv) buildingExtraFieldsDiv.style.display = "contents";
  const titleEl = buildingModal.querySelector("h3");
  if(titleEl) titleEl.textContent = "Editar Información";
  buildingModal.classList.add("visible");
}

function closeBuildingModal() { buildingModal.classList.remove("visible"); }
if (openBuildingModalBtn) openBuildingModalBtn.addEventListener("click", openBuildingModal);
if (buildingModalCloseBtn) buildingModalCloseBtn.addEventListener("click", closeBuildingModal);
if (buildingModalCancelBtn) buildingModalCancelBtn.addEventListener("click", closeBuildingModal);


// --- Modal Servicios (Pequeño) ---
function openBuildingServicesModal(buildingId, data) {
  modalBuildingIdInput.value = buildingId;
  modalBuildingNameLabel.textContent = data?.nombre || "";
  modalGasCodeInput.value = data?.codigoGas || "";

  const loadList = (list, containerId, ph) => {
      const container = document.getElementById(containerId);
      container.innerHTML = "";
      if (list && list.length > 0) {
          list.forEach(item => renderServiceRow(item, containerId, ph));
      } else {
          renderServiceRow({}, containerId, ph);
      }
  };

  let waterData = data.waterServices || [];
  if (waterData.length === 0 && data.codigoAgua) waterData.push({ empresa: "Agua", codigo: data.codigoAgua });
  
  let netData = data.internetServices || [];
  if (netData.length === 0 && (data.empresaInternet || data.codigoInternet)) {
      netData.push({ empresa: data.empresaInternet, codigo: data.codigoInternet, precio: data.internetPrice });
  }

  loadList(waterData, "water-list-services", "Cooperativa");
  loadList(data.electricityServices, "electricity-list-services", "Distribuidora");
  loadList(netData, "internet-list-services", "Proveedor");
  
  buildingServicesModal.classList.add("visible");
}

function closeServices() { buildingServicesModal.classList.remove("visible"); }
if (buildingServicesCloseBtn) buildingServicesCloseBtn.addEventListener("click", closeServices);
if (buildingServicesCancelBtn) buildingServicesCancelBtn.addEventListener("click", closeServices);


// --- Modal Mapa ---
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

// --- Modal Unidades ---
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


// ========================= DATA GRID =========================
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
    
    // Iconos inteligentes
    if ((b.waterServices && b.waterServices.length > 0) || b.codigoAgua) icons.push(`<span class="material-symbols-outlined" style="font-size:16px;" title="Agua">water_drop</span>`);
    if ((b.electricityServices && b.electricityServices.length > 0)) icons.push(`<span class="material-symbols-outlined" style="font-size:16px;" title="Luz">bolt</span>`);
    if (b.codigoGas) icons.push(`<span class="material-symbols-outlined" style="font-size:16px;" title="Gas">propane</span>`);
    if ((b.internetServices && b.internetServices.length > 0) || b.codigoInternet) icons.push(`<span class="material-symbols-outlined" style="font-size:16px;" title="Internet">wifi</span>`);
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

    tr.addEventListener("click", () => seleccionarEdificio(b.id, b, { irAUnidades: true }));
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

// GUARDAR (Formulario Principal)
if (buildingForm) buildingForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = buildingIdHiddenInput.value;
  
  const waterServices = getServicesFromContainer("water-list-container");
  const electricityServices = getServicesFromContainer("electricity-list-container");
  const internetServices = getServicesFromContainer("internet-list-container");

  const data = {
    nombre: buildingNameInput.value.trim(),
    tipo: buildingTypeSelect.value,
    direccion: buildingAddressInput.value.trim(),
    codigoGas: buildingGasCodeInput.value,
    mapsUrl: buildingMapsUrlInput.value,
    waterServices,
    electricityServices,
    internetServices
  };

  if (!id) {
    data.creadoEn = new Date();
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

// GUARDAR (Modal Servicios Rápido)
if (buildingServicesForm) buildingServicesForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = modalBuildingIdInput.value;
  
  const waterServices = getServicesFromContainer("water-list-services");
  const electricityServices = getServicesFromContainer("electricity-list-services");
  const internetServices = getServicesFromContainer("internet-list-services");

  const data = {
    codigoGas: modalGasCodeInput.value,
    waterServices,
    electricityServices,
    internetServices
  };
  await updateDoc(doc(db, "buildings", id), data);
  if (selectedBuildingId === id) { 
      Object.assign(selectedBuildingData, data); 
      actualizarResumenEdificio(); 
  }
  closeServices();
});

// GUARDAR (Mapa)
if (buildingMapForm) buildingMapForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = modalMapBuildingIdInput.value;
  const mapsUrl = modalMapsUrlInput.value;
  await updateDoc(doc(db, "buildings", id), { mapsUrl });
  if (selectedBuildingId === id) { selectedBuildingData.mapsUrl = mapsUrl; actualizarResumenEdificio(); }
  closeMap();
});


// ========================= SELECCIÓN Y RESUMEN =========================

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
    if(tabUnidades) tabUnidades.checked = true;
    showPage(pageUnidades);
  }
}

function actualizarResumenEdificio() {
  const d = selectedBuildingData;
  if (!d) return;
  if (buildingSummarySection) buildingSummarySection.classList.remove("hidden");

  if (summaryBuildingName) summaryBuildingName.textContent = d.nombre;
  if (summaryBuildingType) summaryBuildingType.textContent = d.tipo;
  if (summaryBuildingAddress) summaryBuildingAddress.textContent = d.direccion;
  if (summaryGasCode) summaryGasCode.textContent = d.codigoGas || "—";
  
  if (summaryMapsUrl) {
    summaryMapsUrl.textContent = d.mapsUrl || "Sin mapa";
    summaryMapsUrl.title = d.mapsUrl || "";
    summaryMapsUrl.onclick = d.mapsUrl ? () => window.open(d.mapsUrl, '_blank') : null;
    summaryMapsUrl.style.cursor = d.mapsUrl ? "pointer" : "default";
    summaryMapsUrl.classList.toggle("link-style", !!d.mapsUrl);
  }

  // Helper renderizador de etiquetas
  const renderTags = (list, container) => {
      container.innerHTML = "";
      if (!list || list.length === 0) {
          container.innerHTML = '<span class="hint">No registrado</span>';
          return;
      }
      list.forEach(item => {
          const div = document.createElement("div");
          div.className = "service-tag"; 
          const precioHtml = item.precio ? `<div class="separator"></div><span class="price">Bs. ${item.precio}</span>` : "";
          
          div.innerHTML = `
             <strong>${item.empresa || "Servicio"}</strong>
             <div class="separator"></div>
             <span class="code">${item.codigo || "?"}</span>
             ${precioHtml}
          `;
          container.appendChild(div);
      });
  };

  // 1. Agua (Compatibilidad)
  let waterData = d.waterServices || [];
  if (waterData.length === 0 && d.codigoAgua) waterData.push({ empresa: "Agua", codigo: d.codigoAgua }); 
  renderTags(waterData, summaryWaterList);

  // 2. Luz
  renderTags(d.electricityServices, summaryElectricityList);

  // 3. Internet (Compatibilidad)
  let netData = d.internetServices || [];
  if (netData.length === 0 && (d.empresaInternet || d.codigoInternet)) {
      netData.push({ empresa: d.empresaInternet, codigo: d.codigoInternet, precio: d.internetPrice });
  }
  renderTags(netData, summaryInternetList);

  // Resumen Pequeño en Unidades
  if (selectedBuildingLabel) selectedBuildingLabel.textContent = d.nombre;
  if (invoiceBuildingLabel) invoiceBuildingLabel.textContent = d.nombre;
  if (unitsSummaryBuildingType) unitsSummaryBuildingType.textContent = d.tipo;
  if (unitsSummaryBuildingAddress) unitsSummaryBuildingAddress.textContent = d.direccion;
  
  // Resumen mini para Agua/Luz en Unidades
  if (unitsSummaryWaterCode) {
      unitsSummaryWaterCode.textContent = waterData.length > 0 ? `${waterData.length} medidor(es)` : "—";
  }
  if (unitsSummaryInternetCode) {
      unitsSummaryInternetCode.textContent = netData.length > 0 ? `${netData.length} conexión(es)` : "—";
  }
  if (unitsSummaryGasCode) unitsSummaryGasCode.textContent = d.codigoGas || "—";
}

// Botones de Acción del Resumen
if (summaryOpenServicesBtn) {
  summaryOpenServicesBtn.addEventListener("click", () => {
    if (!selectedBuildingId) return alert("Selecciona un inmueble.");
    openBuildingServicesModal(selectedBuildingId, selectedBuildingData);
  });
}
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

// ========================= INQUILINOS =========================
async function cargarInquilinos(unitId) {
  tenantList.innerHTML = "";
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
    if (data.activo) {
        unitHasActiveTenant = true;
        activeFound = { id: data.id, ...data };
    }

    const li = document.createElement("li");
    const isActive = data.activo;
    
    const badgeStyle = isActive
      ? "background:var(--success-bg); color:var(--success);"
      : "background:var(--bg-body); color:var(--text-muted);";

    li.innerHTML = `
      <div class="item-main" style="cursor:pointer;">
        <strong>${data.nombre}</strong>
        <div style="margin-top:0.2rem;">
          <span class="mui-pill" style="${badgeStyle}; font-size:0.7rem;">${isActive ? "ACTIVO" : "HISTÓRICO"}</span>
          <span style="margin-left:0.5rem; font-size:0.85rem;">Bs. ${Number(data.montoAlquiler).toFixed(2)}</span>
        </div>
      </div>
      
      <div style="display:flex; gap:0.5rem; align-items:center;">
         <button class="icon-button btn-goto-receipts" title="Ver Recibos y Pagos" type="button">
            <span class="material-symbols-outlined">receipt_long</span>
         </button>

         ${isActive ? `<button class="btn btn-xs btn-outline btn-rescindir" style="color:var(--danger); border-color:var(--danger-bg);" type="button">Finalizar</button>` : ''}
      </div>
    `;

    const itemMain = li.querySelector(".item-main");
    itemMain.addEventListener("click", () => {
      llenarFormularioInquilino(data.id, data);
      if (isActive) activarInquilino(data.id, data, false); 
    });

    const btnReceipts = li.querySelector(".btn-goto-receipts");
    btnReceipts.addEventListener("click", (e) => {
      e.stopPropagation(); 
      activarInquilino(data.id, data, true);
    });

    if (isActive) {
      li.querySelector(".btn-rescindir").addEventListener("click", (e) => {
        e.stopPropagation(); 
        rescindirContrato(data.id, unitId);
      });
    }
    
    tenantList.appendChild(li);
  });

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
      await updateDoc(doc(db, "tenants", editingTenantId), data);
      alert("Datos del inquilino actualizados.");
    } else {
      if (unitHasActiveTenant) {
        alert("⛔ ERROR: Esta unidad ya tiene un inquilino ACTIVO.\n\nDebes finalizar el contrato actual antes de registrar uno nuevo.");
        return; 
      }
      data.activo = true;
      data.creadoEn = new Date();
      
      await updateDoc(doc(db, "units", selectedUnitId), { estado: "ocupado" });
      const ref = await addDoc(collection(db, "tenants"), data);
      
      generarPDFContratoAlquiler({ 
        numeroContrato: ref.id, 
        buildingNombre: selectedBuildingName, 
        unitNombre: selectedUnitName, 
        tenantNombre: data.nombre, 
        ...data 
      });
    }
    resetTenantForm();
    cargarUnidades(selectedBuildingId); 
    cargarInquilinos(selectedUnitId);   

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
  receiptContractAmountLabel.textContent = `Bs. ${Number(data.montoAlquiler).toFixed(2)}`;
  if (invoiceAmountInput) invoiceAmountInput.value = data.montoAlquiler;
  setInvoiceFormEnabled(true);
}

// Variables Calendario
let currentDate = new Date(); 
let currentInvoices = []; 

async function cargarRecibos(unitId) {
  if (!activeTenantId) return;
  invoiceList.innerHTML = '<li style="padding:1rem;">Cargando...</li>';
  
  const q = query(
    collection(db, "invoices"),
    where("unitId", "==", unitId),
    where("tenantId", "==", activeTenantId)
  );

  try {
    const snap = await getDocs(q);
    currentInvoices = []; 

    if (snap.empty) {
      invoiceList.innerHTML = '<li style="justify-content:center; color:var(--text-muted);">Sin movimientos.</li>';
    } else {
      invoiceList.innerHTML = ""; 
    }

    snap.forEach((d) => {
      const data = { id: d.id, ...d.data() };
      currentInvoices.push(data);
    });

    currentInvoices.sort((a, b) => {
        const tA = a.creadoEn && a.creadoEn.seconds ? a.creadoEn.seconds : 0;
        const tB = b.creadoEn && b.creadoEn.seconds ? b.creadoEn.seconds : 0;
        return tB - tA;
    });

    currentInvoices.forEach(data => renderInvoiceListItem(data));
    renderCalendar();

  } catch (err) {
    console.error("Error cargando recibos:", err);
    invoiceList.innerHTML = '<li style="color:var(--danger);">Error de conexión.</li>';
  }
}

function renderInvoiceListItem(data) {
    const li = document.createElement("li");
    let stColor = "var(--warning)", icon = "schedule";
    if (data.estado === "pagado") { stColor = "var(--success)"; icon = "check_circle"; }
    else if (data.estado === "pendiente") { stColor = "var(--danger)"; icon = "priority_high"; }

    const numDisplay = data.numero ? String(data.numero).padStart(6, '0') : "---";

    li.innerHTML = `
      <div class="item-main">
         <div style="display:flex; justify-content:space-between; width:100%;">
            <strong style="font-size:0.9rem;">Bs. ${Number(data.monto).toFixed(2)}</strong>
            <span style="color:${stColor}; font-size:0.7rem; display:flex; align-items:center; gap:0.2rem;">
              <span class="material-symbols-outlined" style="font-size:12px;">${icon}</span> ${data.estado}
            </span>
         </div>
         <div style="font-size:0.75rem; color:var(--text-muted);">
           #${numDisplay} · ${data.fechaDia}/${data.fechaMes}/${data.fechaAnio}
         </div>
      </div>
      <button class="icon-button btn-pdf" style="padding:0.2rem;"><span class="material-symbols-outlined" style="font-size:18px;">print</span></button>
    `;
    li.querySelector(".btn-pdf").addEventListener("click", () => generarPDFRecibo({ ...data, numeroComprobante: data.id }));
    invoiceList.appendChild(li);
}

function renderCalendar() {
  const calendarBody = document.getElementById("calendar-body");
  const monthYearLabel = document.getElementById("cal-month-year");
  const finExpected = document.getElementById("fin-expected");
  const finPaid = document.getElementById("fin-paid");
  const finPending = document.getElementById("fin-pending");
  
  if (!calendarBody) return;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); 
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  monthYearLabel.textContent = `${monthNames[month]} ${year}`;

  const firstDayIndex = new Date(year, month, 1).getDay(); 
  const lastDay = new Date(year, month + 1, 0).getDate(); 
  
  calendarBody.innerHTML = "";

  const showPaid = document.querySelector('input[data-filter="pagado"]')?.checked ?? true;
  const showPending = document.querySelector('input[data-filter="pendiente"]')?.checked ?? true;

  const alquilerContrato = activeTenantData ? Number(activeTenantData.montoAlquiler) : 0;
  let totalPagadoReal = 0;
  const monthInvoices = currentInvoices.filter(inv => 
    parseInt(inv.fechaMes) === (month + 1) && 
    parseInt(inv.fechaAnio) === year
  );
  
  monthInvoices.forEach(inv => {
    if (inv.estado === 'pagado' || inv.estado === 'parcial') {
        totalPagadoReal += Number(inv.monto);
    }
  });

  let diferencia = alquilerContrato - totalPagadoReal;
  
  if(finExpected) finExpected.textContent = `Bs. ${alquilerContrato}`;
  if(finPaid) finPaid.textContent = `Bs. ${totalPagadoReal}`;
  
  if(finPending) {
    const container = finPending.parentElement;
    const label = container.querySelector(".fin-label");
    container.style.color = ""; 

    if (diferencia > 0) {
        if(label) label.textContent = "Pendiente";
        finPending.textContent = `Bs. ${diferencia}`;
        container.className = "fin-item danger";
    } else if (diferencia === 0) {
        if(label) label.textContent = "Pendiente";
        finPending.textContent = "Bs. 0";
        container.className = "fin-item success";
    } else {
        if(label) label.textContent = "Saldo Extra";
        finPending.textContent = `Bs. ${Math.abs(diferencia)}`;
        container.className = "fin-item"; 
        container.style.color = "var(--primary)";
        container.style.fontWeight = "bold";
    }
  }

  for (let i = 0; i < firstDayIndex; i++) {
    const div = document.createElement("div");
    div.classList.add("day-cell", "empty");
    calendarBody.appendChild(div);
  }

  for (let i = 1; i <= lastDay; i++) {
    const cell = document.createElement("div");
    cell.classList.add("day-cell");
    
    const today = new Date();
    if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
      cell.classList.add("today");
    }

    const dayNumber = document.createElement("div");
    dayNumber.className = "day-number";
    dayNumber.textContent = i;
    cell.appendChild(dayNumber);

    const dayEvents = monthInvoices.filter(inv => parseInt(inv.fechaDia) === i);

    dayEvents.forEach(evt => {
      if (evt.estado === 'pagado' && !showPaid) return;
      if (evt.estado === 'pendiente' && !showPending) return;

      const pill = document.createElement("div");
      pill.className = `cal-event status-${evt.estado}`; 
      pill.innerHTML = `<span>Bs. ${evt.monto}</span>`;
      pill.title = `${evt.notas || 'Sin concepto'}`;
      
      pill.addEventListener("click", (e) => {
        e.stopPropagation();
        if(evt.estado !== 'pagado') {
             if(confirm(`¿Marcar recibo de Bs. ${evt.monto} como PAGADO?`)) marcarComoPagado(evt.id);
        } else {
           generarPDFRecibo({...evt, numeroComprobante: evt.id});
        }
      });
      cell.appendChild(pill);
    });

    if (i === 1 && diferencia > 0 && showPending) {
       const debtPill = document.createElement("div");
       debtPill.className = "cal-event status-pendiente"; 
       debtPill.style.border = "1px dashed var(--danger)"; 
       debtPill.innerHTML = `<span>⚠️ Falta Bs. ${diferencia}</span>`;
       debtPill.title = "Saldo restante para completar el alquiler";
       
       debtPill.addEventListener("click", (e) => {
         e.stopPropagation();
         prepararCobroDeuda(diferencia);
       });
       cell.appendChild(debtPill);
    }
    calendarBody.appendChild(cell);
  }
}

function prepararCobroDeuda(monto) {
  const dayInput = document.getElementById("invoice-day");
  const monthInput = document.getElementById("invoice-month");
  const yearInput = document.getElementById("invoice-year");
  const amountInput = document.getElementById("invoice-amount");
  const notesInput = document.getElementById("invoice-notes");
  const statusInput = document.getElementById("invoice-status");

  const today = new Date();
  dayInput.value = today.getDate();
  monthInput.value = today.getMonth() + 1;
  yearInput.value = today.getFullYear();
  
  amountInput.value = monto; 
  statusInput.value = "pagado"; 
  notesInput.value = "Saldo restante Alquiler";
  
  document.querySelector(".receipt-form").scrollIntoView({ behavior: "smooth" });
  amountInput.focus();
}

async function marcarComoPagado(invoiceId) {
    try {
        await updateDoc(doc(db, "invoices", invoiceId), { estado: "pagado" });
        cargarRecibos(selectedUnitId); 
    } catch(e) {
        alert("Error al actualizar");
    }
}

document.getElementById("cal-prev")?.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});
document.getElementById("cal-next")?.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});
document.querySelectorAll('.calendar-filters input').forEach(chk => {
    chk.addEventListener("change", renderCalendar);
});

// GUARDAR RECIBO (Con Numeración Correlativa)
if (invoiceForm) invoiceForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!activeTenantId) return alert("Error: No hay inquilino activo");

  let nuevoNumero = 1;
  try {
      const qLast = query(collection(db, "invoices"), orderBy("numero", "desc"), limit(1));
      const snapLast = await getDocs(qLast);
      if(!snapLast.empty) {
          const lastData = snapLast.docs[0].data();
          if(lastData.numero) nuevoNumero = Number(lastData.numero) + 1;
      }
  } catch(err) {
      console.log("Primer recibo o base de datos nueva.");
  }

  const data = {
    buildingId: selectedBuildingId, unitId: selectedUnitId, tenantId: activeTenantId,
    buildingNombre: selectedBuildingName, unitNombre: selectedUnitName, tenantNombre: activeTenantName,
    fechaDia: invoiceDayInput.value, fechaMes: invoiceMonthInput.value, fechaAnio: invoiceYearInput.value,
    monto: Number(invoiceAmountInput.value), estado: invoiceStatusSelect.value, notas: invoiceNotesInput.value,
    numero: nuevoNumero,
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
  add("Monto Mensual", `Bs. ${Number(info.montoAlquiler).toFixed(2)}`);
  y += 10; doc.text("Notas:", 20, y); y += 7;
  doc.setFontSize(10); doc.text(doc.splitTextToSize(info.notas || "Sin observaciones.", 170), 20, y);
  doc.save(`Contrato_${info.tenantNombre}.pdf`);
}

function generarPDFRecibo(info) {
  // 1. PRE-CÁLCULO DE ALTURA
  const tempDoc = new jsPDF();
  tempDoc.setFont("helvetica", "normal");
  tempDoc.setFontSize(10);
  
  const maxWidthTexto = 135;
  const lineHeight = 5; 
  
  const montoTexto = numeroALetras(info.monto);
  const textoMontoCompleto = `Bs. ${Number(info.monto).toFixed(2)}  (${montoTexto})`;
  const lineasMonto = tempDoc.splitTextToSize(textoMontoCompleto, maxWidthTexto);
  const alturaMonto = lineasMonto.length * lineHeight;
  
  const conceptoRaw = `${info.notas || "Alquiler"} - Inmueble: ${info.buildingNombre} - Unidad: ${info.unitNombre}`;
  const lineasConcepto = tempDoc.splitTextToSize(conceptoRaw, maxWidthTexto);
  const alturaConcepto = lineasConcepto.length * lineHeight;
  
  let cursorY = 40;            
  cursorY += 12;               
  cursorY += Math.max(12, alturaMonto + 2); 
  cursorY += alturaConcepto;   
  cursorY += 10;               
  
  const alturaFooter = 15;     
  const margenFinal = 10;      
  
  const alturaNecesaria = cursorY + alturaFooter + margenFinal;
  const alturaHoja = Math.max(110, alturaNecesaria);

  // 2. GENERACIÓN PDF REAL
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [210, alturaHoja] 
  });

  const margen = 5;
  const altoMarco = alturaHoja - (margen * 2);
  
  doc.setLineWidth(0.5); doc.setDrawColor(0);
  doc.rect(margen, margen, 200, altoMarco); 

  doc.setFillColor(240, 240, 240);
  doc.rect(margen, margen, 200, 20, 'F'); doc.rect(margen, margen, 200, 20);

  doc.setFont("helvetica", "bold"); doc.setFontSize(18);
  doc.text("RECIBO DE ALQUILER", 10, 18);
  
  doc.setFontSize(12);
  const numRecibo = info.numero ? String(info.numero).padStart(6, '0') : "---";
  doc.text(`Nº: ${numRecibo}`, 195, 12, { align: "right" });
  
  doc.setFontSize(10); doc.setFont("helvetica", "normal");
  doc.text(`Fecha: ${info.fechaDia}/${info.fechaMes}/${info.fechaAnio}`, 195, 20, { align: "right" });

  let y = 40;
  const xLabel = 15; 
  const xValue = 55; 
  
  doc.setFont("helvetica", "bold"); doc.text("RECIBÍ DE:", xLabel, y);
  doc.setFont("helvetica", "normal"); doc.text(info.tenantNombre.toUpperCase(), xValue, y);
  doc.line(xValue - 2, y + 2, 195, y + 2);
  
  y += 12; 

  doc.setFont("helvetica", "bold"); doc.text("LA SUMA DE:", xLabel, y);
  doc.setFont("helvetica", "normal");
  doc.text(lineasMonto, xValue, y); 
  doc.line(xValue - 2, y + alturaMonto - 3, 195, y + alturaMonto - 3);

  y += Math.max(12, alturaMonto + 2); 

  doc.setFont("helvetica", "bold"); doc.text("CONCEPTO:", xLabel, y);
  doc.setFont("helvetica", "normal");
  doc.text(lineasConcepto, xValue, y); 
  doc.line(xValue - 2, y + alturaConcepto - 3, 195, y + alturaConcepto - 3);

  y += alturaConcepto + 10;

  doc.setDrawColor(0); doc.setLineWidth(0.5);
  doc.rect(15, y, 60, 15);
  doc.setFontSize(10); doc.setFont("helvetica", "bold");
  doc.text("MONTO TOTAL", 45, y + 5, { align: "center" });
  doc.setFontSize(14);
  doc.text(`Bs. ${Number(info.monto).toFixed(2)}`, 45, y + 12, { align: "center" });

  doc.line(120, y + 12, 190, y + 12);
  doc.setFontSize(8); doc.setFont("helvetica", "normal");
  doc.text("FIRMA / CONFORME", 155, y + 16, { align: "center" });

  doc.save(`Recibo_${info.tenantNombre.replace(/\s+/g, '_')}_${info.fechaMes}-${info.fechaAnio}.pdf`);
}

function numeroALetras(num) {
    if (!num) return "CERO BOLIVIANOS";
    const parteEntera = Math.floor(num);
    const parteDecimal = Math.round((num - parteEntera) * 100);
    const centavos = String(parteDecimal).padStart(2, '0') + "/100 BOLIVIANOS";
    
    if (parteEntera === 0) return "CERO " + centavos;
    
    const unidades = ["", "UN", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"];
    const decenas = ["", "DIEZ", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];
    const diezY = ["DIEZ", "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISEIS", "DIECISIETE", "DIECIOCHO", "DIECINUEVE"];
    const centenas = ["", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS", "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS"];

    function leerTres(n) {
        let u = n % 10;
        let d = Math.floor(n / 10) % 10;
        let c = Math.floor(n / 100);
        let texto = "";

        if (c === 1 && d === 0 && u === 0) texto += "CIEN ";
        else texto += centenas[c] + " ";

        if (d === 1) {
            texto += diezY[u] + " ";
            return texto; 
        } else if (d > 1) {
            texto += decenas[d];
            if (u > 0) texto += " Y " + unidades[u];
        } else {
            if (u > 0) texto += unidades[u];
        }
        return texto;
    }

    let textoFinal = "";
    
    const miles = Math.floor(parteEntera / 1000);
    const resto = parteEntera % 1000;

    if (miles > 0) {
        if (miles === 1) textoFinal += "MIL ";
        else textoFinal += leerTres(miles) + " MIL ";
    }

    if (resto > 0) textoFinal += leerTres(resto);

    return textoFinal.trim() + " " + centavos;
}

// ========================= INIT =========================
async function init() {
  await cargarEdificios();
  showPage(pageEdificios); 
  console.log("Sistema cargado y listo.");
}
