// ========================= IMPORTS FIREBASE =========================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// jsPDF viene del script UMD incluido en index.html
const { jsPDF } = window.jspdf;

// ========================= FIREBASE INIT =========================
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

// ========================= DOM: TABS / PÁGINAS =========================
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
    p.style.display = p === page ? "block" : "none";
  });
}

// Tabs → páginas
if (tabEdificios) tabEdificios.addEventListener("change", () => showPage(pageEdificios));
if (tabUnidades) tabUnidades.addEventListener("change", () => showPage(pageUnidades));
if (tabInquilinos) tabInquilinos.addEventListener("change", () => showPage(pageInquilinos));
if (tabRecibos) tabRecibos.addEventListener("change", () => showPage(pageRecibos));

// Botones "volver"
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

// Página inicial
showPage(pageEdificios);

// ========================= DOM: EDIFICIOS =========================
const buildingForm = document.getElementById("building-form");

// Input oculto para diferenciar Crear de Editar
const buildingIdHiddenInput = document.getElementById("building-id-hidden"); 
// Contenedor de campos extras (Servicios/Mapa)
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

const buildingModal = document.getElementById("building-modal");
const openBuildingModalBtn = document.getElementById("open-building-modal");
const buildingModalCloseBtn = document.getElementById("building-modal-close");
const buildingModalCancelBtn = document.getElementById("building-modal-cancel");

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
const summaryStaffCount = document.getElementById("summary-staff-count");
const summaryStaffNames = document.getElementById("summary-staff-names");
const summaryOpenServicesBtn = document.getElementById("summary-open-services");
const summaryOpenMapBtn = document.getElementById("summary-open-map");

// ========================= DOM: UNIDADES =========================
const selectedBuildingLabel = document.getElementById("selected-building");
const unitList = document.getElementById("unit-list");

const unitsSummaryBuildingName = document.getElementById("units-summary-building-name");
const unitsSummaryBuildingType = document.getElementById("units-summary-building-type");
const unitsSummaryBuildingAddress = document.getElementById("units-summary-building-address");
const unitsSummaryWaterCode = document.getElementById("units-summary-water-code");
const unitsSummaryInternetCode = document.getElementById("units-summary-internet-code");
const unitsSummaryInternetCompany = document.getElementById("units-summary-internet-company");
const unitsSummaryInternetPrice = document.getElementById("units-summary-internet-price");
const unitsSummaryGasCode = document.getElementById("units-summary-gas-code");
const unitsSummaryMapsUrl = document.getElementById("units-summary-maps-url");
const unitsSummaryOpenMapBtn = document.getElementById("units-summary-open-map");

const openUnitModalBtn = document.getElementById("open-unit-modal");

const unitModal = document.getElementById("unit-modal");
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

// ========================= DOM: INQUILINOS =========================
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

// ========================= DOM: RECIBOS (NUEVO UI) =========================
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

// NUEVOS CONTENEDORES PARA EL CONTEXTO DETALLADO
const receiptTenantInfoContainer = document.getElementById("receipt-tenant-info-container");
const receiptContractAmountLabel = document.getElementById("receipt-contract-amount");

// ========================= DOM: STAFF (para staff.js) =========================
const staffBuildingLabel = document.getElementById("staff-building-label");
const staffUnitLabel = document.getElementById("staff-unit-label");
const currentBuildingHidden = document.getElementById("current-building-id");
const currentUnitHidden = document.getElementById("current-unit-id");

// ========================= DOM: MODAL SERVICIOS =========================
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

// ========================= DOM: MODAL MAPA =========================
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
let selectedUnitStatus = null;

let activeTenantId = null;
let activeTenantName = null;
// Guardamos data completa del inquilino activo para reusar (ej. monto)
let activeTenantData = null;

// Cache para edificios (data grid)
let buildingsCache = [];
let filteredBuildings = [];
let buildingCurrentPage = 1;
const BUILDINGS_PER_PAGE = 5;

// ========================= UTILIDADES =========================
function setTenantFormEnabled(enabled) {
  if (!tenantForm) return;
  const elements = tenantForm.querySelectorAll("input, button, textarea");
  elements.forEach((el) => {
    el.disabled = !enabled;
  });
  if (!enabled) {
    tenantNameInput.value = "";
    tenantDocInput.value = "";
    tenantPhoneInput.value = "";
    tenantEmailInput.value = "";
    tenantStartDateInput.value = "";
    if (tenantEndDateInput) tenantEndDateInput.value = "";
    if (tenantMonthlyAmountInput) tenantMonthlyAmountInput.value = "";
    if (tenantNotesInput) tenantNotesInput.value = "";
  }
}

function setInvoiceFormEnabled(enabled) {
  if (!invoiceForm) return;
  const elements = invoiceForm.querySelectorAll("input, button, select, textarea");
  elements.forEach((el) => {
    el.disabled = !enabled;
  });
  
  if(!enabled && invoiceAmountInput) {
    invoiceAmountInput.value = "";
  }
}

function initYearSelector() {
  if (!invoiceYearInput) return;
  const currentYear = new Date().getFullYear();
  invoiceYearInput.value = currentYear;
}
initYearSelector();

// ========================= MAPS UTILS =========================
function buildEmbedMapUrlFromInput(input) {
  const trimmed = input.trim();
  const coordMatch = trimmed.match(/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/);
  if (coordMatch) {
    const lat = coordMatch[1];
    const lng = coordMatch[3];
    return `https://maps.google.com/maps?q=${encodeURIComponent(
      lat + "," + lng
    )}&z=16&output=embed`;
  }
  if (trimmed.includes("google.com/maps") || trimmed.includes("maps.app.goo")) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(
      trimmed
    )}&z=16&output=embed`;
  }
  return `https://maps.google.com/maps?q=${encodeURIComponent(
    trimmed
  )}&z=16&output=embed`;
}

function updateMapPreview(value) {
  if (!mapIframe || !mapExternalLink || !mapPreviewHint) return;
  const trimmed = (value || "").trim();
  if (!trimmed) {
    mapIframe.src = "";
    mapExternalLink.classList.add("hidden");
    mapPreviewHint.textContent =
      "Pega aquí una dirección, un enlace de Google Maps o las coordenadas. El mapa se mostrará a la derecha.";
    return;
  }
  mapExternalLink.href = trimmed;
  mapExternalLink.classList.remove("hidden");
  const embedSrc = buildEmbedMapUrlFromInput(trimmed);
  mapIframe.src = embedSrc;
  mapPreviewHint.textContent =
    "Este mapa corresponde al lugar del enlace/dirección que pegaste. Puedes moverlo y hacer zoom desde aquí.";
}

// ========================= MODALES: OPEN / CLOSE =========================
function openBuildingModal() {
  if (!buildingModal) return;
  if (buildingForm) {
    buildingForm.reset();
    if (buildingIdHiddenInput) buildingIdHiddenInput.value = "";
    if (buildingExtraFieldsDiv) {
      buildingExtraFieldsDiv.classList.remove("hidden-section");
      buildingExtraFieldsDiv.style.display = "contents"; 
    }
    const titleEl = buildingModal.querySelector("h3");
    if(titleEl) titleEl.textContent = "Registrar nuevo inmueble";
    const subTitle = buildingModal.querySelector(".modal-subtitle");
    if(subTitle) subTitle.textContent = "Complete la información general y servicios iniciales.";
  }
  buildingModal.classList.add("visible");
}

function abrirModalEditarEdificio(id, data) {
  if (!buildingModal) return;
  if (buildingIdHiddenInput) buildingIdHiddenInput.value = id;
  if (buildingNameInput) buildingNameInput.value = data.nombre || "";
  if (buildingTypeSelect) buildingTypeSelect.value = data.tipo || "edificio";
  if (buildingAddressInput) buildingAddressInput.value = data.direccion || "";

  if (buildingExtraFieldsDiv) {
    buildingExtraFieldsDiv.classList.add("hidden-section");
    buildingExtraFieldsDiv.style.display = "none";
  }
  const titleEl = buildingModal.querySelector("h3");
  if(titleEl) titleEl.textContent = "Editar información general";
  const subTitle = buildingModal.querySelector(".modal-subtitle");
  if(subTitle) subTitle.textContent = "Solo puede modificar nombre y dirección. Para servicios, use el botón 'Servicios'.";
  buildingModal.classList.add("visible");
}

function closeBuildingModal() {
  if (!buildingModal) return;
  buildingModal.classList.remove("visible");
}

if (openBuildingModalBtn) openBuildingModalBtn.addEventListener("click", openBuildingModal);
if (buildingModalCloseBtn) buildingModalCloseBtn.addEventListener("click", closeBuildingModal);
if (buildingModalCancelBtn) buildingModalCancelBtn.addEventListener("click", closeBuildingModal);

function openBuildingServicesModal(buildingId, data) {
  if (!buildingServicesModal || !buildingServicesForm) return;
  modalBuildingIdInput.value = buildingId;
  modalBuildingNameLabel.textContent = data?.nombre || "Inmueble";
  modalWaterCodeInput.value = data?.codigoAgua || "";
  modalGasCodeInput.value = data?.codigoGas || "";
  modalInternetCodeInput.value = data?.codigoInternet || "";
  modalInternetCompanyInput.value = data?.empresaInternet || "";
  modalInternetPriceInput.value =
    data?.internetPrice != null ? String(data.internetPrice) : "";
  buildingServicesModal.classList.add("visible");
}

function closeBuildingServicesModal() {
  if (!buildingServicesModal) return;
  buildingServicesModal.classList.remove("visible");
}
if (buildingServicesCloseBtn)
  buildingServicesCloseBtn.addEventListener("click", closeBuildingServicesModal);
if (buildingServicesCancelBtn)
  buildingServicesCancelBtn.addEventListener("click", closeBuildingServicesModal);

function openMapForBuilding(buildingId, data) {
  if (!buildingMapModal || !buildingMapForm) return;
  modalMapBuildingIdInput.value = buildingId;
  modalMapBuildingNameLabel.textContent = data?.nombre || "Inmueble";
  const urlValue = data?.mapsUrl || "";
  modalMapsUrlInput.value = urlValue;
  updateMapPreview(urlValue);
  buildingMapModal.classList.add("visible");
}

function closeBuildingMapModal() {
  if (!buildingMapModal) return;
  buildingMapModal.classList.remove("visible");
}
if (buildingMapCloseBtn) buildingMapCloseBtn.addEventListener("click", closeBuildingMapModal);
if (buildingMapCancelBtn) buildingMapCancelBtn.addEventListener("click", closeBuildingMapModal);

if (modalMapsUrlInput) {
  modalMapsUrlInput.addEventListener("input", (e) => {
    updateMapPreview(e.target.value);
  });
}

// Modal unidad
function openUnitModal(unitId, data) {
  if (!unitModal || !unitModalForm) return;

  unitModalIdInput.value = unitId || "";
  unitModalNameInput.value = data?.nombre || "";
  unitModalTypeSelect.value = data?.tipo || "departamento";
  unitModalStatusSelect.value = data?.estado || "libre";
  unitModalElectricCodeInput.value = data?.codigoLuz || "";

  unitModalTitle.textContent = unitId ? "Editar unidad" : "Nueva unidad";
  unitModalBuildingNameLabel.textContent = selectedBuildingName || "Ninguno";

  unitModal.classList.add("visible");
}

function closeUnitModal() {
  if (!unitModal) return;
  unitModal.classList.remove("visible");
}
if (unitModalCloseBtn) unitModalCloseBtn.addEventListener("click", closeUnitModal);
if (unitModalCancelBtn) unitModalCancelBtn.addEventListener("click", closeUnitModal);

if (openUnitModalBtn) {
  openUnitModalBtn.addEventListener("click", () => {
    if (!selectedBuildingId || !selectedBuildingName) {
      alert("Primero selecciona un inmueble en la pestaña Inmuebles.");
      return;
    }
    openUnitModal(null, {});
  });
}

// ========================= RESUMEN DE EDIFICIO =========================
async function actualizarResumenEdificio() {
  if (!selectedBuildingId || !selectedBuildingData) {
    if (buildingSummarySection) buildingSummarySection.classList.add("hidden");
    if (summaryBuildingName) summaryBuildingName.textContent = "Ninguno";
    if (summaryBuildingType) summaryBuildingType.textContent = "—";
    if (summaryBuildingAddress) summaryBuildingAddress.textContent = "—";
    if (summaryWaterCode) summaryWaterCode.textContent = "—";
    if (summaryInternetCode) summaryInternetCode.textContent = "—";
    if (summaryInternetCompany) summaryInternetCompany.textContent = "—";
    if (summaryInternetPrice) summaryInternetPrice.textContent = "—";
    if (summaryGasCode) summaryGasCode.textContent = "—";
    if (summaryMapsUrl) summaryMapsUrl.textContent = "—";
    if (summaryStaffCount) summaryStaffCount.textContent = "—";
    if (summaryStaffNames) summaryStaffNames.textContent = "—";

    if (unitsSummaryBuildingName) unitsSummaryBuildingName.textContent = "Ninguno";
    if (unitsSummaryBuildingType) unitsSummaryBuildingType.textContent = "—";
    if (unitsSummaryBuildingAddress) unitsSummaryBuildingAddress.textContent = "—";
    if (unitsSummaryWaterCode) unitsSummaryWaterCode.textContent = "—";
    if (unitsSummaryInternetCode) unitsSummaryInternetCode.textContent = "—";
    if (unitsSummaryInternetCompany) unitsSummaryInternetCompany.textContent = "—";
    if (unitsSummaryInternetPrice)
      unitsSummaryInternetPrice.textContent = "—";
    if (unitsSummaryGasCode) unitsSummaryGasCode.textContent = "—";
    if (unitsSummaryMapsUrl) unitsSummaryMapsUrl.textContent = "—";

    if (invoiceBuildingLabel) invoiceBuildingLabel.textContent = "Ninguno";
    return;
  }

  const d = selectedBuildingData;

  if (buildingSummarySection) buildingSummarySection.classList.remove("hidden");
  if (summaryBuildingName) summaryBuildingName.textContent = d.nombre || "Sin nombre";
  if (summaryBuildingType) summaryBuildingType.textContent = d.tipo || "—";
  if (summaryBuildingAddress) summaryBuildingAddress.textContent = d.direccion || "—";
  if (summaryWaterCode) summaryWaterCode.textContent = d.codigoAgua || "—";
  if (summaryInternetCode) summaryInternetCode.textContent = d.codigoInternet || "—";
  if (summaryInternetCompany) summaryInternetCompany.textContent = d.empresaInternet || "—";
  if (summaryInternetPrice)
    summaryInternetPrice.textContent =
      d.internetPrice != null && d.internetPrice !== ""
        ? Number(d.internetPrice).toFixed(2)
        : "—";
  if (summaryGasCode) summaryGasCode.textContent = d.codigoGas || "—";
  if (summaryMapsUrl) summaryMapsUrl.textContent = d.mapsUrl || "—";

  // Resumen en Unidades
  if (unitsSummaryBuildingName) unitsSummaryBuildingName.textContent = d.nombre || "Sin nombre";
  if (unitsSummaryBuildingType) unitsSummaryBuildingType.textContent = d.tipo || "—";
  if (unitsSummaryBuildingAddress) unitsSummaryBuildingAddress.textContent = d.direccion || "—";
  if (unitsSummaryWaterCode) unitsSummaryWaterCode.textContent = d.codigoAgua || "—";
  if (unitsSummaryInternetCode) unitsSummaryInternetCode.textContent = d.codigoInternet || "—";
  if (unitsSummaryInternetCompany) unitsSummaryInternetCompany.textContent = d.empresaInternet || "—";
  if (unitsSummaryInternetPrice)
    unitsSummaryInternetPrice.textContent =
      d.internetPrice != null && d.internetPrice !== ""
        ? Number(d.internetPrice).toFixed(2)
        : "—";
  if (unitsSummaryGasCode) unitsSummaryGasCode.textContent = d.codigoGas || "—";
  if (unitsSummaryMapsUrl) unitsSummaryMapsUrl.textContent = d.mapsUrl || "—";

  if (selectedBuildingLabel) selectedBuildingLabel.textContent = d.nombre || "Sin nombre";
  if (invoiceBuildingLabel) invoiceBuildingLabel.textContent = d.nombre || "Sin nombre";
}

// Resumen → abrir servicios / mapa
if (summaryOpenServicesBtn) {
  summaryOpenServicesBtn.addEventListener("click", () => {
    if (!selectedBuildingId || !selectedBuildingData) {
      alert("Primero selecciona un inmueble.");
      return;
    }
    openBuildingServicesModal(selectedBuildingId, selectedBuildingData);
  });
}
if (summaryOpenMapBtn) {
  summaryOpenMapBtn.addEventListener("click", () => {
    if (!selectedBuildingId || !selectedBuildingData) {
      alert("Primero selecciona un inmueble.");
      return;
    }
    openMapForBuilding(selectedBuildingId, selectedBuildingData);
  });
}
if (unitsSummaryOpenMapBtn) {
  unitsSummaryOpenMapBtn.addEventListener("click", () => {
    if (!selectedBuildingId || !selectedBuildingData) {
      alert("Primero selecciona un inmueble.");
      return;
    }
    openMapForBuilding(selectedBuildingId, selectedBuildingData);
  });
}

// ========================= EDIFICIOS: DATA GRID =========================
function actualizarOpcionesAutocompleteEdificios() {
  if (!buildingSearchOptions) return;
  buildingSearchOptions.innerHTML = "";
  buildingsCache
    .slice()
    .sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""))
    .forEach((b) => {
      const opt = document.createElement("option");
      opt.value = b.nombre || "";
      buildingSearchOptions.appendChild(opt);
    });
}

function aplicarFiltroEdificios() {
  const term = (buildingSearchInput?.value || "").trim().toLowerCase();
  if (!term) {
    filteredBuildings = buildingsCache
      .slice()
      .sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));
  } else {
    filteredBuildings = buildingsCache
      .filter((b) => {
        const nombre = (b.nombre || "").toLowerCase();
        const dir = (b.direccion || "").toLowerCase();
        return nombre.includes(term) || dir.includes(term);
      })
      .sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));
  }
  buildingCurrentPage = 1;
  renderBuildingGrid();
}

function irAUnaPaginaEdificios(page) {
  const total = filteredBuildings.length;
  const totalPages = Math.max(1, Math.ceil(total / BUILDINGS_PER_PAGE));
  const newPage = Math.min(Math.max(1, page), totalPages);
  buildingCurrentPage = newPage;
  renderBuildingGrid();
}

function renderBuildingGrid() {
  if (!buildingGrid) return;
  buildingGrid.innerHTML = "";
  const total = filteredBuildings.length;
  if (total === 0) {
    buildingGrid.innerHTML =
      '<div style="padding: 0.75rem;">No hay inmuebles registrados todavía.</div>';
    return;
  }
  const totalPages = Math.max(1, Math.ceil(total / BUILDINGS_PER_PAGE));
  const page = Math.min(buildingCurrentPage, totalPages);
  const startIndex = (page - 1) * BUILDINGS_PER_PAGE;
  const pageRows = filteredBuildings.slice(startIndex, startIndex + BUILDINGS_PER_PAGE);

  const table = document.createElement("table");
  table.className = "mui-data-grid-table";
  const thead = document.createElement("thead");
  thead.innerHTML = `
    <tr>
      <th>Inmueble</th>
      <th>Servicios</th>
      <th style="text-align:right;">Acciones</th>
    </tr>
  `;
  table.appendChild(thead);
  const tbody = document.createElement("tbody");

  pageRows.forEach((b) => {
    const tr = document.createElement("tr");
    const tdMain = document.createElement("td");
    tdMain.className = "mui-col-main";
    const tipo = b.tipo || "—";
    const codigoAguaTexto = b.codigoAgua ? `Agua: ${b.codigoAgua}` : "";
    const codigoGasTexto = b.codigoGas ? `Gas: ${b.codigoGas}` : "";
    const codigoInternetTexto = b.codigoInternet ? `Internet: ${b.codigoInternet}` : "";
    tdMain.innerHTML = `
      <div class="mui-main-title">
        <span>${b.nombre || "Sin nombre"}</span>
        <span class="mui-pill">${tipo}</span>
      </div>
      <div class="mui-main-subtitle">
        ${b.direccion || "Sin dirección"}
      </div>
      <div class="mui-main-meta">
        ${codigoAguaTexto}
        ${codigoGasTexto ? " · " + codigoGasTexto : ""}
        ${codigoInternetTexto ? " · " + codigoInternetTexto : ""}
      </div>
    `;
    tdMain.style.cursor = "pointer";
    tdMain.addEventListener("click", () => {
      seleccionarEdificio(b.id, b, { irAUnidades: true });
    });
    tr.appendChild(tdMain);

    const tdServicios = document.createElement("td");
    const empresaInternetTexto = b.empresaInternet ? `Prov: ${b.empresaInternet}` : "";
    const precioInternetTexto =
      b.internetPrice != null && b.internetPrice !== ""
        ? `Internet $: ${Number(b.internetPrice).toFixed(2)}`
        : "";
    const mapsTexto = b.mapsUrl ? "Mapa ✓" : "Sin mapa";
    tdServicios.innerHTML = `
      <div class="mui-main-meta">
        ${empresaInternetTexto}
        ${precioInternetTexto ? " · " + precioInternetTexto : ""}
        ${mapsTexto ? " · " + mapsTexto : ""}
      </div>
    `;
    tr.appendChild(tdServicios);

    const tdActions = document.createElement("td");
    tdActions.className = "mui-col-actions";

    const editInfoBtn = document.createElement("button");
    editInfoBtn.type = "button";
    editInfoBtn.className = "btn btn-outline btn-xs";
    editInfoBtn.title = "Editar nombre y dirección";
    editInfoBtn.innerHTML = `
      <span class="material-symbols-outlined">edit_square</span>
      <span class="btn-label">Editar</span>
    `;
    editInfoBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      abrirModalEditarEdificio(b.id, b);
    });

    const staffBtn = document.createElement("button");
    staffBtn.type = "button";
    staffBtn.className = "btn btn-info btn-xs";
    staffBtn.innerHTML = `
      <span class="material-symbols-outlined">group</span>
      <span class="btn-label">Personal</span>
    `;
    staffBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      seleccionarEdificioParaPersonal(b.id, b);
      const staffSection = document.getElementById("staff-section-edificios");
      if (staffSection) {
        staffSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });

    const newStaffBtn = document.createElement("button");
    newStaffBtn.type = "button";
    newStaffBtn.className = "btn btn-primary btn-xs";
    newStaffBtn.innerHTML = `
      <span class="material-symbols-outlined">person_add</span>
      <span class="btn-label">Nuevo</span>
    `;
    newStaffBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      window.dispatchEvent(
        new CustomEvent("openStaffModalForBuilding", {
          detail: { buildingId: b.id, buildingNombre: b.nombre || "" }
        })
      );
    });

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "btn btn-warning btn-xs";
    editBtn.innerHTML = `
      <span class="material-symbols-outlined">tune</span>
      <span class="btn-label">Servicios</span>
    `;
    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openBuildingServicesModal(b.id, b);
    });

    const mapBtn = document.createElement("button");
    mapBtn.type = "button";
    mapBtn.className = "btn btn-outline btn-xs";
    mapBtn.innerHTML = `
      <span class="material-symbols-outlined">map</span>
      <span class="btn-label">Mapa</span>
    `;
    mapBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openMapForBuilding(b.id, b);
    });

    tdActions.appendChild(editInfoBtn);
    tdActions.appendChild(staffBtn);
    tdActions.appendChild(newStaffBtn);
    tdActions.appendChild(editBtn);
    tdActions.appendChild(mapBtn);
    tr.appendChild(tdActions);
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  buildingGrid.appendChild(table);

  const footer = document.createElement("div");
  footer.className = "mui-data-grid-footer";
  const from = startIndex + 1;
  const to = startIndex + pageRows.length;
  const infoSpan = document.createElement("span");
  infoSpan.textContent = `Mostrando ${from}-${to} de ${total}`;
  const pager = document.createElement("div");
  pager.className = "pager-buttons";
  const prevBtn = document.createElement("button");
  prevBtn.type = "button";
  prevBtn.className = "btn btn-outline btn-xs";
  prevBtn.textContent = "Anterior";
  prevBtn.disabled = page <= 1;
  prevBtn.addEventListener("click", () => irAUnaPaginaEdificios(page - 1));
  const nextBtn = document.createElement("button");
  nextBtn.type = "button";
  nextBtn.className = "btn btn-outline btn-xs";
  nextBtn.textContent = "Siguiente";
  nextBtn.disabled = page >= totalPages;
  nextBtn.addEventListener("click", () => irAUnaPaginaEdificios(page + 1));
  pager.appendChild(prevBtn);
  pager.appendChild(nextBtn);
  footer.appendChild(infoSpan);
  footer.appendChild(pager);
  buildingGrid.appendChild(footer);
}

async function cargarEdificios() {
  buildingsCache = [];
  const snapshot = await getDocs(collection(db, "buildings"));
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    buildingsCache.push({ id: docSnap.id, ...data });
  });
  actualizarOpcionesAutocompleteEdificios();
  aplicarFiltroEdificios();
}

if (buildingSearchInput) {
  buildingSearchInput.addEventListener("input", () => {
    aplicarFiltroEdificios();
  });
}

// ========================= EDIFICIOS: CRUD =========================
if (buildingForm) {
  buildingForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!buildingNameInput || !buildingTypeSelect || !buildingAddressInput) return;
    const nombre = buildingNameInput.value.trim();
    const tipo = buildingTypeSelect.value || "edificio";
    const direccion = buildingAddressInput.value.trim();
    const codigoAgua = (buildingWaterCodeInput?.value || "").trim();
    const codigoGas = (buildingGasCodeInput?.value || "").trim();
    const codigoInternet = (buildingInternetCodeInput?.value || "").trim();
    const empresaInternet = (buildingInternetCompanyInput?.value || "").trim();
    const internetPriceRaw = (buildingInternetPriceInput?.value || "").trim();
    const mapsUrl = (buildingMapsUrlInput?.value || "").trim();
    const existingId = buildingIdHiddenInput ? buildingIdHiddenInput.value : "";

    if (!nombre) {
      alert("El nombre del inmueble no puede estar vacío.");
      return;
    }
    if (!direccion) {
      alert("La dirección del inmueble no puede estar vacía.");
      return;
    }
    const internetPrice = internetPriceRaw !== "" && !isNaN(Number(internetPriceRaw)) ? Number(internetPriceRaw) : null;
    if (internetPrice !== null && internetPrice < 0) {
      alert("El precio de internet no puede ser negativo.");
      return;
    }
    const nombreLower = nombre.toLowerCase();
    const qDup = query(collection(db, "buildings"), where("nombreLower", "==", nombreLower));
    const snapDup = await getDocs(qDup);
    let existeNombre = false;
    snapDup.forEach((d) => { if (d.id !== existingId) existeNombre = true; });
    if (existeNombre) {
      alert("Ya existe un inmueble con ese nombre. Por favor, elige otro.");
      return;
    }

    try {
      if (existingId) {
        const updateData = { nombre, nombreLower, tipo, direccion };
        const ref = doc(db, "buildings", existingId);
        await updateDoc(ref, updateData);
        if (selectedBuildingId === existingId && selectedBuildingData) {
           Object.assign(selectedBuildingData, updateData);
           actualizarResumenEdificio();
        }
      } else {
        const newData = { nombre, nombreLower, tipo, direccion, codigoAgua, codigoGas, codigoInternet, empresaInternet, internetPrice, mapsUrl, creadoEn: new Date() };
        await addDoc(collection(db, "buildings"), newData);
      }
      buildingForm.reset();
      if(buildingIdHiddenInput) buildingIdHiddenInput.value = "";
      closeBuildingModal();
      await cargarEdificios();
    } catch (error) {
      console.error("Error al guardar inmueble:", error);
      alert("Hubo un error al guardar los datos.");
    }
  });
}

if (buildingServicesForm) {
  buildingServicesForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const buildingId = modalBuildingIdInput.value;
    if (!buildingId) {
      alert("No se encontró el ID del inmueble.");
      return;
    }
    const codigoAgua = modalWaterCodeInput.value.trim();
    const codigoGas = modalGasCodeInput.value.trim();
    const codigoInternet = modalInternetCodeInput.value.trim();
    const empresaInternet = modalInternetCompanyInput.value.trim();
    const internetPriceRaw = modalInternetPriceInput.value.trim();
    const internetPrice = internetPriceRaw !== "" && !isNaN(Number(internetPriceRaw)) ? Number(internetPriceRaw) : null;
    if (internetPrice !== null && internetPrice < 0) {
      alert("El precio de internet no puede ser negativo.");
      return;
    }
    const ref = doc(db, "buildings", buildingId);
    await updateDoc(ref, { codigoAgua, codigoGas, codigoInternet, empresaInternet, internetPrice });
    if (selectedBuildingId === buildingId && selectedBuildingData) {
      selectedBuildingData.codigoAgua = codigoAgua;
      selectedBuildingData.codigoGas = codigoGas;
      selectedBuildingData.codigoInternet = codigoInternet;
      selectedBuildingData.empresaInternet = empresaInternet;
      selectedBuildingData.internetPrice = internetPrice;
      await actualizarResumenEdificio();
    }
    closeBuildingServicesModal();
    await cargarEdificios();
  });
}

if (buildingMapForm) {
  buildingMapForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const buildingId = modalMapBuildingIdInput.value;
    if (!buildingId) {
      alert("No se encontró el ID del inmueble para guardar la ubicación.");
      return;
    }
    const mapsUrl = (modalMapsUrlInput.value || "").trim();
    const ref = doc(db, "buildings", buildingId);
    await updateDoc(ref, { mapsUrl });
    if (selectedBuildingId === buildingId && selectedBuildingData) {
      selectedBuildingData.mapsUrl = mapsUrl;
      await actualizarResumenEdificio();
    }
    await cargarEdificios();
    closeBuildingMapModal();
  });
}

// ========================= SELECCIÓN DE EDIFICIO =========================
function limpiarEstadoUnidadYInquilinos() {
  selectedUnitId = null;
  selectedUnitName = null;
  selectedUnitStatus = null;
  if (selectedUnitLabel) selectedUnitLabel.textContent = "Ninguna";
  if (staffUnitLabel) staffUnitLabel.textContent = "Ninguna";
  if (currentUnitHidden) {
    currentUnitHidden.value = "";
    currentUnitHidden.dispatchEvent(new Event("change"));
  }
  if (tenantList) tenantList.innerHTML = "";
  setTenantFormEnabled(false);

  activeTenantId = null;
  activeTenantName = null;
  activeTenantData = null; // Reset data

  if (invoiceUnitLabel) invoiceUnitLabel.textContent = "Ninguna";
  updateReceiptContext(null); // Limpiar tarjeta de recibos
  if (invoiceList) invoiceList.innerHTML = "";
  setInvoiceFormEnabled(false);
}

function seleccionarEdificio(id, buildingData, opciones = {}) {
  selectedBuildingId = id;
  selectedBuildingData = buildingData || null;
  selectedBuildingName = buildingData?.nombre || null;
  if (selectedBuildingLabel) selectedBuildingLabel.textContent = selectedBuildingName || "Ninguno";
  if (staffBuildingLabel) staffBuildingLabel.textContent = selectedBuildingName || "Ninguno";
  if (currentBuildingHidden) {
    currentBuildingHidden.value = id || "";
    currentBuildingHidden.dispatchEvent(new Event("change"));
  }
  if (invoiceBuildingLabel) invoiceBuildingLabel.textContent = selectedBuildingName || "Ninguno";
  limpiarEstadoUnidadYInquilinos();
  actualizarResumenEdificio();
  cargarUnidades(id);
  if (opciones.irAUnidades && tabUnidades) {
    tabUnidades.checked = true;
    showPage(pageUnidades);
  }
}

function seleccionarEdificioParaPersonal(id, buildingData) {
  seleccionarEdificio(id, buildingData, { irAUnidades: false });
}

// ========================= UNIDADES =========================
async function cargarUnidades(buildingId) {
  if (!unitList) return;
  unitList.innerHTML = "";
  if (!buildingId) {
    const li = document.createElement("li");
    li.textContent = "Primero selecciona un inmueble.";
    unitList.appendChild(li);
    return;
  }
  const qUnits = query(collection(db, "units"), where("buildingId", "==", buildingId));
  const snapshot = await getDocs(qUnits);
  if (snapshot.empty) {
    const li = document.createElement("li");
    li.textContent = "No hay unidades registradas para este inmueble.";
    unitList.appendChild(li);
    return;
  }
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const li = document.createElement("li");
    const estadoTexto = data.estado === "ocupado" ? "OCUPADO" : "LIBRE";
    const main = document.createElement("div");
    main.className = "item-main";
    main.innerHTML = `
      <strong>${data.nombre || "Sin nombre"}</strong>
      <div style="font-size: 0.8rem; color:#cbd5f5;">
        ${data.tipo || "—"} · ${estadoTexto} · Luz: ${data.codigoLuz || "—"}
      </div>
    `;
    main.style.cursor = "pointer";
    main.addEventListener("click", () => {
      seleccionarUnidad(docSnap.id, data.nombre, data.estado);
      if (tabInquilinos) {
        tabInquilinos.checked = true;
        showPage(pageInquilinos);
      }
    });
    li.appendChild(main);
    const actions = document.createElement("div");
    const tenantsBtn = document.createElement("button");
    tenantsBtn.type = "button";
    tenantsBtn.className = "btn btn-outline btn-xs";
    tenantsBtn.textContent = "Inquilinos";
    tenantsBtn.addEventListener("click", () => {
      seleccionarUnidad(docSnap.id, data.nombre, data.estado);
      if (tabInquilinos) {
        tabInquilinos.checked = true;
        showPage(pageInquilinos);
      }
    });
    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "btn btn-warning btn-xs";
    editBtn.textContent = "Editar";
    editBtn.addEventListener("click", () => {
      openUnitModal(docSnap.id, data);
    });
    actions.appendChild(tenantsBtn);
    actions.appendChild(editBtn);
    li.appendChild(actions);
    unitList.appendChild(li);
  });
}

if (unitModalForm) {
  unitModalForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const unitId = unitModalIdInput.value;
    if (!selectedBuildingId || !selectedBuildingName) {
      alert("Primero selecciona un inmueble.");
      return;
    }
    const nombre = unitModalNameInput.value.trim();
    const tipo = unitModalTypeSelect.value || "departamento";
    const estado = unitModalStatusSelect.value || "libre";
    const codigoLuz = unitModalElectricCodeInput.value.trim();
    if (!nombre) {
      alert("El nombre de la unidad no puede estar vacío.");
      return;
    }
    const nombreLower = nombre.toLowerCase();
    const qDup = query(collection(db, "units"), where("buildingId", "==", selectedBuildingId), where("nombreLower", "==", nombreLower));
    const dupSnap = await getDocs(qDup);
    let existeOtro = false;
    dupSnap.forEach((d) => { if (d.id !== unitId) existeOtro = true; });
    if (existeOtro) {
      alert("Ya existe otra unidad con ese nombre en este inmueble.");
      return;
    }
    if (unitId) {
      const ref = doc(db, "units", unitId);
      await updateDoc(ref, { nombre, nombreLower, tipo, estado, codigoLuz });
    } else {
      await addDoc(collection(db, "units"), { buildingId: selectedBuildingId, buildingNombre: selectedBuildingName, nombre, nombreLower, tipo, estado, codigoLuz, creadoEn: new Date() });
    }
    closeUnitModal();
    await cargarUnidades(selectedBuildingId);
  });
}

function seleccionarUnidad(id, nombreUnidad, estado) {
  selectedUnitId = id;
  selectedUnitName = nombreUnidad;
  selectedUnitStatus = estado;
  const estadoTexto = estado === "ocupado" ? "OCUPADO" : "LIBRE";
  if (selectedUnitLabel) selectedUnitLabel.textContent = `${nombreUnidad} (${estadoTexto})`;
  if (staffUnitLabel) staffUnitLabel.textContent = `${nombreUnidad} (${estadoTexto})`;
  if (currentUnitHidden) {
    currentUnitHidden.value = id;
    currentUnitHidden.dispatchEvent(new Event("change"));
  }
  if (invoiceUnitLabel) invoiceUnitLabel.textContent = nombreUnidad;
  
  activeTenantId = null;
  activeTenantName = null;
  activeTenantData = null;
  updateReceiptContext(null); // Limpiar tarjeta de recibos
  if (invoiceList) invoiceList.innerHTML = "";
  setInvoiceFormEnabled(false);
  setTenantFormEnabled(true);
  cargarInquilinos(id);
}

// ========================= NUEVO: LOGICA UI RECIBOS DETALLADA =========================
function updateReceiptContext(tenantData) {
  if (!receiptTenantInfoContainer || !receiptContractAmountLabel) return;
  
  if (!tenantData) {
    // Estado vacío
    receiptTenantInfoContainer.innerHTML = '<p class="hint">Selecciona un inquilino activo para ver los detalles.</p>';
    receiptContractAmountLabel.textContent = "—";
    return;
  }

  // Renderizar detalles
  const html = `
    <div class="tenant-detail-row">
      <span class="tenant-detail-label">Nombre:</span>
      <span class="tenant-detail-value">${tenantData.nombre}</span>
    </div>
    <div class="tenant-detail-row">
      <span class="tenant-detail-label">Documento:</span>
      <span class="tenant-detail-value">${tenantData.documento || "—"}</span>
    </div>
    <div class="tenant-detail-row">
      <span class="tenant-detail-label">Teléfono:</span>
      <span class="tenant-detail-value">${tenantData.telefono || "—"}</span>
    </div>
    <div class="tenant-detail-row">
      <span class="tenant-detail-label">Email:</span>
      <span class="tenant-detail-value">${tenantData.email || "—"}</span>
    </div>
  `;
  receiptTenantInfoContainer.innerHTML = html;

  // Actualizar monto en tarjeta
  const monto = tenantData.montoAlquiler != null ? Number(tenantData.montoAlquiler) : 0;
  receiptContractAmountLabel.textContent = monto.toFixed(2);

  // Pre-llenar formulario de recibo
  if (invoiceAmountInput) {
    invoiceAmountInput.value = monto > 0 ? monto : "";
  }
}

// ========================= INQUILINOS (CONTRATOS) =========================
async function cargarInquilinos(unitId) {
  if (!tenantList) return;
  tenantList.innerHTML = "";
  if (!unitId) {
    const li = document.createElement("li");
    li.textContent = "Primero selecciona una unidad.";
    tenantList.appendChild(li);
    setTenantFormEnabled(false);
    activeTenantId = null;
    activeTenantName = null;
    updateReceiptContext(null);
    setInvoiceFormEnabled(false);
    if (invoiceList) invoiceList.innerHTML = "";
    return;
  }
  const qTenants = query(collection(db, "tenants"), where("unitId", "==", unitId));
  const snapshot = await getDocs(qTenants);
  if (snapshot.empty) {
    const li = document.createElement("li");
    li.textContent = "No hay inquilinos registrados para esta unidad.";
    tenantList.appendChild(li);
    setTenantFormEnabled(true);
    activeTenantId = null;
    activeTenantName = null;
    updateReceiptContext(null);
    setInvoiceFormEnabled(false);
    if (invoiceList) invoiceList.innerHTML = "";
    return;
  }
  setTenantFormEnabled(true);
  let hayActivo = false;

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const id = docSnap.id;
    const li = document.createElement("li");
    const main = document.createElement("div");
    main.className = "item-main";
    const estadoTexto = data.activo ? "ACTIVO" : "HISTÓRICO";
    const fechaInicio = data.fechaInicio || "—";
    const fechaFin = data.fechaFin || "—";
    const monto = data.montoAlquiler != null ? Number(data.montoAlquiler).toFixed(2) : "—";
    main.innerHTML = `
      <strong>${data.nombre || "Sin nombre"}</strong>
      <div style="font-size:0.8rem; color:#666;">
        ${estadoTexto} · Inicio: ${fechaInicio} · Fin: ${fechaFin} · Alquiler: ${monto}
      </div>
      ${data.notas ? `<div style="font-size:0.75rem; color:#888; margin-top:0.2rem;">${data.notas}</div>` : ""}
    `;
    main.style.cursor = "pointer";
    
    // Al hacer clic
    main.addEventListener("click", () => {
      if (!data.activo) {
        alert("Solo los inquilinos activos pueden generar nuevos recibos.");
        return;
      }
      activeTenantId = id;
      activeTenantName = data.nombre || "";
      activeTenantData = data;
      
      updateReceiptContext(data); // ACTUALIZA LA TARJETA
      setInvoiceFormEnabled(true);

      if (tabRecibos) {
        tabRecibos.checked = true;
        showPage(pageRecibos);
      }
      if (selectedUnitId) {
        cargarRecibos(selectedUnitId);
      }
    });
    li.appendChild(main);
    
    const actions = document.createElement("div");
    const viewBtn = document.createElement("button");
    viewBtn.type = "button";
    viewBtn.className = "btn btn-outline btn-xs";
    viewBtn.innerHTML = `<span class="material-symbols-outlined">receipt_long</span><span class="btn-label">Ver recibos</span>`;
    viewBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      activeTenantId = id;
      activeTenantName = data.nombre || "";
      activeTenantData = data;
      
      updateReceiptContext(data); // ACTUALIZA LA TARJETA
      setInvoiceFormEnabled(true);
      
      if (tabRecibos) {
        tabRecibos.checked = true;
        showPage(pageRecibos);
      }
      if (selectedUnitId) {
        cargarRecibos(selectedUnitId);
      }
    });
    actions.appendChild(viewBtn);

    const rescBtn = document.createElement("button");
    rescBtn.type = "button";
    rescBtn.className = "btn btn-danger btn-xs";
    rescBtn.innerHTML = `<span class="material-symbols-outlined">do_not_disturb_on</span><span class="btn-label">Rescindir</span>`;
    rescBtn.disabled = !data.activo;
    rescBtn.addEventListener("click", async (event) => {
      event.stopPropagation();
      const ok = confirm(`¿Deseas rescindir el contrato de ${data.nombre}? La unidad quedará libre y el inquilino pasará a histórico.`);
      if (!ok) return;
      await rescindirContrato(id, unitId);
    });
    actions.appendChild(rescBtn);

    li.appendChild(actions);
    tenantList.appendChild(li);

    if (data.activo) {
      hayActivo = true;
      activeTenantId = id;
      activeTenantName = data.nombre || "";
      activeTenantData = data;
    }
  });

  if (!hayActivo) {
    activeTenantId = null;
    activeTenantName = null;
    activeTenantData = null;
    updateReceiptContext(null);
    setInvoiceFormEnabled(false);
    if (invoiceList) invoiceList.innerHTML = "";
  } else {
    // Si hay activo por defecto al cargar, actualizamos el contexto
    updateReceiptContext(activeTenantData);
    setInvoiceFormEnabled(true);
    if (selectedUnitId) {
      cargarRecibos(selectedUnitId);
    }
  }
}

async function rescindirContrato(tenantId, unitId) {
  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, "0");
  const dd = String(hoy.getDate()).padStart(2, "0");
  const fechaFin = `${yyyy}-${mm}-${dd}`;
  await updateDoc(doc(db, "tenants", tenantId), { activo: false, fechaFin });
  if (unitId) {
    await updateDoc(doc(db, "units", unitId), { estado: "libre" });
  }
  if (activeTenantId === tenantId) {
    activeTenantId = null;
    activeTenantName = null;
    updateReceiptContext(null);
    setInvoiceFormEnabled(false);
    if (invoiceList) invoiceList.innerHTML = "";
  }
  await cargarInquilinos(unitId);
  if (unitId) {
    await cargarRecibos(unitId);
  }
}

if (tenantForm) {
  tenantForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!selectedBuildingId || !selectedUnitId) {
      alert("Selecciona primero inmueble y unidad.");
      return;
    }
    const nombre = tenantNameInput.value.trim();
    const documento = tenantDocInput.value.trim();
    const telefono = tenantPhoneInput.value.trim();
    const email = tenantEmailInput.value.trim();
    const fechaInicio = tenantStartDateInput.value || "";
    const fechaFin = tenantEndDateInput.value || "";
    const montoRaw = tenantMonthlyAmountInput.value.trim();
    const notas = tenantNotesInput.value.trim();
    if (!nombre) {
      alert("El nombre del inquilino no puede estar vacío.");
      return;
    }
    if (fechaInicio && fechaFin) {
      const dInicio = new Date(fechaInicio);
      const dFin = new Date(fechaFin);
      if (dInicio > dFin) {
        alert("La fecha de inicio no puede ser posterior a la fecha de fin.");
        return;
      }
    }
    const montoAlquiler = montoRaw !== "" && !isNaN(Number(montoRaw)) ? Number(montoRaw) : null;
    if (montoAlquiler !== null && montoAlquiler < 0) {
      alert("El monto del alquiler no puede ser negativo.");
      return;
    }
    const qActive = query(collection(db, "tenants"), where("unitId", "==", selectedUnitId), where("activo", "==", true));
    const activeSnap = await getDocs(qActive);
    const deactivatePromises = [];
    activeSnap.forEach((d) => {
      deactivatePromises.push(updateDoc(doc(db, "tenants", d.id), { activo: false }));
    });
    await Promise.all(deactivatePromises);

    const newTenantData = {
      buildingId: selectedBuildingId,
      unitId: selectedUnitId,
      nombre,
      documento,
      telefono,
      email,
      fechaInicio,
      fechaFin,
      montoAlquiler,
      notas,
      activo: true,
      creadoEn: new Date()
    };
    
    const newTenantRef = await addDoc(collection(db, "tenants"), newTenantData);

    generarPDFContratoAlquiler({
      numeroContrato: newTenantRef.id,
      buildingNombre: selectedBuildingName || "",
      unitNombre: selectedUnitName || "",
      tenantNombre: nombre,
      documento,
      telefono,
      email,
      fechaInicio,
      fechaFin,
      montoAlquiler,
      notas
    });

    tenantForm.reset();
    activeTenantId = newTenantRef.id;
    activeTenantName = nombre;
    activeTenantData = newTenantData; // Guardamos para actualizar UI
    
    updateReceiptContext(newTenantData); // ACTUALIZAR TARJETA
    setInvoiceFormEnabled(true);

    await cargarInquilinos(selectedUnitId);
    await cargarRecibos(selectedUnitId);
  });
}

// ========================= RECIBOS =========================
async function cargarRecibos(unitId) {
  if (!invoiceList) return;
  invoiceList.innerHTML = "";
  if (!unitId || !activeTenantId) {
    const li = document.createElement("li");
    li.textContent = "Selecciona un inquilino activo para ver sus recibos.";
    invoiceList.appendChild(li);
    return;
  }
  const qInvoices = query(collection(db, "invoices"), where("unitId", "==", unitId), where("tenantId", "==", activeTenantId));
  const snapshot = await getDocs(qInvoices);
  if (snapshot.empty) {
    const li = document.createElement("li");
    li.textContent = "No hay recibos generados para este inquilino.";
    invoiceList.appendChild(li);
    return;
  }
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const id = docSnap.id;
    const li = document.createElement("li");
    const fechaStr = data.fechaDia && data.fechaMes && data.fechaAnio ? `${String(data.fechaDia).padStart(2, "0")}/${String(data.fechaMes).padStart(2, "0")}/${data.fechaAnio}` : "Fecha no definida";
    const estado = data.estado || "pendiente";
    const monto = data.monto != null ? Number(data.monto).toFixed(2) : "—";
    const notasRecibo = data.notas || "";
    const main = document.createElement("div");
    main.className = "item-main";
    main.innerHTML = `
      <strong>Recibo ${fechaStr}</strong>
      <div style="font-size: 0.8rem; color:#cbd5f5;">
        Estado: ${estado.toUpperCase()} · Monto: ${monto}
      </div>
      ${notasRecibo ? `<div style="font-size:0.75rem; color:#e5e7eb; margin-top:0.2rem;">${notasRecibo}</div>` : ""}
    `;
    if (estado === "pendiente") {
      main.style.color = "#fecaca";
    } else {
      main.style.color = "#bbf7d0";
    }
    li.appendChild(main);
    const actions = document.createElement("div");
    const pdfBtn = document.createElement("button");
    pdfBtn.type = "button";
    pdfBtn.className = "btn btn-outline btn-xs";
    pdfBtn.innerHTML = `<span class="material-symbols-outlined">picture_as_pdf</span><span class="btn-label">Imprimir</span>`;
    pdfBtn.addEventListener("click", () => {
      const infoForPdf = {
        buildingNombre: data.buildingNombre || "",
        unitNombre: data.unitNombre || "",
        tenantNombre: data.tenantNombre || "",
        fechaDia: data.fechaDia,
        fechaMes: data.fechaMes,
        fechaAnio: data.fechaAnio,
        monto: data.monto,
        estado: data.estado,
        notas: data.notas,
        numeroComprobante: id
      };
      generarPDFRecibo(infoForPdf);
    });
    actions.appendChild(pdfBtn);
    if (estado === "pendiente") {
      const payBtn = document.createElement("button");
      payBtn.type = "button";
      payBtn.className = "btn btn-success btn-xs";
      payBtn.innerHTML = `<span class="material-symbols-outlined">done</span><span class="btn-label">Marcar pagado</span>`;
      payBtn.addEventListener("click", async () => {
        const ok = confirm("¿Marcar este recibo como PAGADO?");
        if (!ok) return;
        await marcarReciboPagado(id);
        await cargarRecibos(unitId);
      });
      actions.appendChild(payBtn);
    }
    li.appendChild(actions);
    invoiceList.appendChild(li);
  });
}

async function marcarReciboPagado(invoiceId) {
  const ref = doc(db, "invoices", invoiceId);
  await updateDoc(ref, { estado: "pagado" });
}

function generarPDFContratoAlquiler(info) {
  const docPdf = new jsPDF();
  const fechaHoy = new Date();
  const yyyy = fechaHoy.getFullYear();
  const mm = String(fechaHoy.getMonth() + 1).padStart(2, "0");
  const dd = String(fechaHoy.getDate()).padStart(2, "0");
  const fechaEmision = `${dd}/${mm}/${yyyy}`;
  const fechaInicio = info.fechaInicio || "—";
  const fechaFin = info.fechaFin || "—";
  const montoTexto = info.montoAlquiler != null ? Number(info.montoAlquiler).toFixed(2) : "—";
  const numeroContrato = info.numeroContrato || "N/A";

  docPdf.setFontSize(16);
  docPdf.text("CONTRATO DE ALQUILER", 10, 15);
  docPdf.setFontSize(10);
  docPdf.text(`N° de contrato: ${numeroContrato}`, 10, 22);
  docPdf.text(`Fecha de emisión: ${fechaEmision}`, 10, 27);
  docPdf.text(`Inmueble: ${info.buildingNombre || ""}`, 10, 35);
  docPdf.text(`Unidad: ${info.unitNombre || ""}`, 10, 40);
  docPdf.text(`Inquilino: ${info.tenantNombre || ""}`, 10, 48);
  docPdf.text(`Documento: ${info.documento || ""}`, 10, 53);
  docPdf.text(`Teléfono: ${info.telefono || ""}`, 10, 58);
  docPdf.text(`Email: ${info.email || ""}`, 10, 63);
  docPdf.text(`Fecha inicio contrato: ${fechaInicio}`, 10, 71);
  docPdf.text(`Fecha fin contrato: ${fechaFin}`, 10, 76);
  docPdf.text(`Monto mensual (alquiler): ${montoTexto}`, 10, 81);
  if (info.notas) {
    docPdf.text("Notas / condiciones:", 10, 89);
    const notasLines = docPdf.splitTextToSize(info.notas, 180);
    docPdf.text(notasLines, 10, 94);
  }
  docPdf.text("Ambas partes aceptan las condiciones descritas en este contrato.", 10, 120);
  const nombreArchivo = (info.tenantNombre ? `contrato_${info.tenantNombre.replace(/\s+/g, "_")}` : "contrato_alquiler") + ".pdf";
  docPdf.save(nombreArchivo);
}

function generarPDFRecibo(info) {
  const docPdf = new jsPDF();
  const fechaStr = info.fechaDia && info.fechaMes && info.fechaAnio ? `${String(info.fechaDia).padStart(2, "0")}/${String(info.fechaMes).padStart(2, "0")}/${info.fechaAnio}` : "Sin fecha";
  const numeroComprobante = info.numeroComprobante || info.id || "N/A";

  docPdf.setFontSize(16);
  docPdf.text("RECIBO DE ALQUILER", 10, 15);
  docPdf.setFontSize(10);
  docPdf.text(`N° de comprobante: ${numeroComprobante}`, 10, 22);
  docPdf.text(`Fecha de emisión: ${fechaStr}`, 10, 27);
  docPdf.text(`Inmueble: ${info.buildingNombre || ""}`, 10, 35);
  docPdf.text(`Unidad: ${info.unitNombre || ""}`, 10, 40);
  docPdf.text(`Inquilino: ${info.tenantNombre || ""}`, 10, 45);
  const montoTexto = info.monto != null ? Number(info.monto).toFixed(2) : "—";
  docPdf.text(`Monto: ${montoTexto}`, 10, 55);
  docPdf.text(`Estado del pago: ${(info.estado || "pendiente").toUpperCase()}`, 10, 60);
  if (info.notas) {
    docPdf.text("Notas:", 10, 70);
    const notasLines = docPdf.splitTextToSize(info.notas, 180);
    docPdf.text(notasLines, 10, 75);
  }
  const nombreArchivo = `recibo_${numeroComprobante}.pdf`;
  docPdf.save(nombreArchivo);
}

if (invoiceForm) {
  invoiceForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!selectedBuildingId || !selectedUnitId || !activeTenantId) {
      alert("Selecciona inmueble, unidad e inquilino activo antes de generar un recibo.");
      return;
    }
    const dia = invoiceDayInput.value ? Number(invoiceDayInput.value) : null;
    const mes = invoiceMonthInput.value ? Number(invoiceMonthInput.value) : null;
    const anio = invoiceYearInput.value ? Number(invoiceYearInput.value) : null;
    const montoRaw = invoiceAmountInput.value.trim();
    const estado = invoiceStatusSelect.value || "pendiente";
    const notas = invoiceNotesInput.value.trim();
    const monto = montoRaw !== "" && !isNaN(Number(montoRaw)) ? Number(montoRaw) : null;
    if (monto !== null && monto < 0) {
      alert("El monto del recibo no puede ser negativo.");
      return;
    }
    const buildingNombre = selectedBuildingName || "";
    const unitNombre = selectedUnitName || "";
    const tenantNombre = activeTenantName || "";
    const newInvoice = {
      buildingId: selectedBuildingId,
      unitId: selectedUnitId,
      tenantId: activeTenantId,
      buildingNombre,
      unitNombre,
      tenantNombre,
      fechaDia: dia,
      fechaMes: mes,
      fechaAnio: anio,
      monto,
      estado,
      notas,
      creadoEn: new Date()
    };
    const docRef = await addDoc(collection(db, "invoices"), newInvoice);
    invoiceForm.reset();
    initYearSelector();
    generarPDFRecibo({ ...newInvoice, numeroComprobante: docRef.id });
    await cargarRecibos(selectedUnitId);
  });
}

// ========================= INIT =========================
async function init() {
  setTenantFormEnabled(false);
  setInvoiceFormEnabled(false);
  await cargarEdificios();
}
init();