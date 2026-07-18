"use strict";

// ========================================
// KONFIGURASI SESSION
// ========================================

const LOGIN_SESSION_KEY = "luckySpinAdminSession";

// ========================================
// AMBIL ELEMENT HTML
// ========================================

// Sidebar dan navigasi
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const mobileMenuButton = document.getElementById("mobileMenuButton");

const menuItems = document.querySelectorAll(".menu-item");
const contentSections = document.querySelectorAll(".content-section");

const pageTitle = document.getElementById("pageTitle");

// Profil admin
const adminUsername = document.getElementById("adminUsername");
const logoutButton = document.getElementById("logoutButton");

// Statistik
const totalCodeStat = document.getElementById("totalCodeStat");
const activeCodeStat = document.getElementById("activeCodeStat");
const usedCodeStat = document.getElementById("usedCodeStat");
const totalRewardStat = document.getElementById("totalRewardStat");

// Tombol cepat
const quickGenerateButton = document.getElementById(
  "quickGenerateButton"
);

// Form generate
const generateCodeForm = document.getElementById(
  "generateCodeForm"
);

const customerUsernameInput = document.getElementById(
  "customerUsername"
);

const rewardSelect = document.getElementById(
  "rewardSelect"
);

const spinAmountInput = document.getElementById(
  "spinAmount"
);

const expiredDateInput = document.getElementById(
  "expiredDate"
);

const adminNoteInput = document.getElementById(
  "adminNote"
);

// Error form
const customerUsernameError = document.getElementById(
  "customerUsernameError"
);

const rewardError = document.getElementById(
  "rewardError"
);

const spinAmountError = document.getElementById(
  "spinAmountError"
);

const expiredDateError = document.getElementById(
  "expiredDateError"
);

// Hasil generate
const emptyResult = document.getElementById("emptyResult");
const resultContent = document.getElementById("resultContent");

const generatedCodeText = document.getElementById(
  "generatedCode"
);

const resultUsername = document.getElementById(
  "resultUsername"
);

const resultReward = document.getElementById(
  "resultReward"
);

const resultSpin = document.getElementById(
  "resultSpin"
);

const resultExpired = document.getElementById(
  "resultExpired"
);

const copyCodeButton = document.getElementById(
  "copyCodeButton"
);

const copyMessage = document.getElementById(
  "copyMessage"
);

// Riwayat
const codeHistoryBody = document.getElementById(
  "codeHistoryBody"
);

const clearHistoryButton = document.getElementById(
  "clearHistoryButton"
);

// Toast
const toast = document.getElementById("toast");

// ========================================
// CEK SESSION LOGIN
// ========================================

function getLoginSession() {
  const savedSession = sessionStorage.getItem(
    LOGIN_SESSION_KEY
  );

  if (!savedSession) {
    return null;
  }

  try {
    return JSON.parse(savedSession);
  } catch (error) {
    sessionStorage.removeItem(LOGIN_SESSION_KEY);
    return null;
  }
}

function protectAdminPage() {
  const sessionData = getLoginSession();

  if (
    !sessionData ||
    sessionData.isLoggedIn !== true
  ) {
    window.location.href = "index.html";
    return null;
  }

  return sessionData;
}

// ========================================
// PROFIL ADMIN
// ========================================

function loadAdminProfile(sessionData) {
  if (!sessionData) {
    return;
  }

  const username = sessionData.username || "Admin";

  adminUsername.textContent = username;

  const adminAvatar = document.querySelector(
    ".admin-avatar"
  );

  if (adminAvatar) {
    adminAvatar.textContent = username
      .charAt(0)
      .toUpperCase();
  }
}

// ========================================
// NAVIGASI SECTION
// ========================================

const sectionTitles = {
  dashboardSection: "Dashboard",
  generateSection: "Generate Kode",
  historySection: "Riwayat Kode",
  rewardSection: "Daftar Hadiah",
  settingsSection: "Pengaturan"
};

function openSection(sectionId) {
  contentSections.forEach((section) => {
    section.classList.remove("active");
  });

  menuItems.forEach((menuItem) => {
    menuItem.classList.remove("active");
  });

  const selectedSection = document.getElementById(
    sectionId
  );

  const selectedMenu = document.querySelector(
    `[data-section="${sectionId}"]`
  );

  if (selectedSection) {
    selectedSection.classList.add("active");
  }

  if (selectedMenu) {
    selectedMenu.classList.add("active");
  }

  pageTitle.textContent =
    sectionTitles[sectionId] || "Dashboard";

  if (sectionId === "dashboardSection") {
    updateStatistics();
  }

  if (sectionId === "historySection") {
    renderCodeHistory();
  }

  closeMobileSidebar();
}

// ========================================
// SIDEBAR MOBILE
// ========================================

function openMobileSidebar() {
  sidebar.classList.add("open");
  sidebarOverlay.classList.add("show");
}

function closeMobileSidebar() {
  sidebar.classList.remove("open");
  sidebarOverlay.classList.remove("show");
}

// ========================================
// TOAST
// ========================================

let toastTimeout = null;

function showToast(message, type = "success") {
  if (!toast) {
    return;
  }

  toast.textContent = message;
  toast.className = `toast ${type} show`;

  clearTimeout(toastTimeout);

  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}

// ========================================
// FORMAT DATA
// ========================================

function formatDate(dateString) {
  if (!dateString) {
    return "-";
  }

  const date = new Date(
    `${dateString}T00:00:00`
  );

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

function formatDateTime(dateString) {
  if (!dateString) {
    return "-";
  }

  const date = new Date(dateString);

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ========================================
// STATISTIK
// ========================================

function updateStatistics() {
  const statistics = getCodeStatistics();

  totalCodeStat.textContent =
    statistics.totalCodes;

  activeCodeStat.textContent =
    statistics.activeCodes;

  usedCodeStat.textContent =
    statistics.usedCodes;

  totalRewardStat.textContent =
    statistics.totalRewards;
}

// ========================================
// VALIDASI FORM
// ========================================

function clearFormErrors() {
  customerUsernameError.textContent = "";
  rewardError.textContent = "";
  spinAmountError.textContent = "";
  expiredDateError.textContent = "";

  customerUsernameInput.classList.remove(
    "input-error"
  );

  rewardSelect.classList.remove("input-error");
  spinAmountInput.classList.remove("input-error");
  expiredDateInput.classList.remove("input-error");
}

function showFormError(
  inputElement,
  errorElement,
  message
) {
  inputElement.classList.add("input-error");
  errorElement.textContent = message;
}

function validateGenerateForm() {
  clearFormErrors();

  let isValid = true;

  const username =
    customerUsernameInput.value.trim();

  const reward = rewardSelect.value;

  const spins = Number(spinAmountInput.value);

  const expiredDate = expiredDateInput.value;

  if (!username) {
    showFormError(
      customerUsernameInput,
      customerUsernameError,
      "Username customer wajib diisi."
    );

    isValid = false;
  }

  if (username && username.length < 3) {
    showFormError(
      customerUsernameInput,
      customerUsernameError,
      "Username minimal 3 karakter."
    );

    isValid = false;
  }

  if (!reward) {
    showFormError(
      rewardSelect,
      rewardError,
      "Hadiah wajib dipilih."
    );

    isValid = false;
  }

  if (
    !Number.isInteger(spins) ||
    spins < 1 ||
    spins > 20
  ) {
    showFormError(
      spinAmountInput,
      spinAmountError,
      "Jumlah spin harus antara 1 sampai 20."
    );

    isValid = false;
  }

  if (!expiredDate) {
    showFormError(
      expiredDateInput,
      expiredDateError,
      "Tanggal kedaluwarsa wajib dipilih."
    );

    isValid = false;
  }

  if (expiredDate) {
    const selectedDate = new Date(
      `${expiredDate}T23:59:59`
    );

    if (selectedDate < new Date()) {
      showFormError(
        expiredDateInput,
        expiredDateError,
        "Tanggal kedaluwarsa tidak boleh lewat."
      );

      isValid = false;
    }
  }

  return isValid;
}

// ========================================
// TANGGAL DEFAULT
// ========================================

function setDefaultExpiredDate() {
  const tomorrow = new Date();

  tomorrow.setDate(tomorrow.getDate() + 1);

  const year = tomorrow.getFullYear();

  const month = String(
    tomorrow.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    tomorrow.getDate()
  ).padStart(2, "0");

  const formattedDate = `${year}-${month}-${day}`;

  expiredDateInput.value = formattedDate;

  const today = new Date();

  const todayYear = today.getFullYear();

  const todayMonth = String(
    today.getMonth() + 1
  ).padStart(2, "0");

  const todayDay = String(
    today.getDate()
  ).padStart(2, "0");

  expiredDateInput.min =
    `${todayYear}-${todayMonth}-${todayDay}`;
}

// ========================================
// GENERATE KODE UNIK
// ========================================

function createUniqueBonusCode() {
  let newCode = generateBonusCode("SPIN");

  while (isCodeExists(newCode)) {
    newCode = generateBonusCode("SPIN");
  }

  return newCode;
}

// ========================================
// TAMPILKAN HASIL GENERATE
// ========================================

function showGeneratedResult(codeData) {
  emptyResult.classList.add("hidden");
  resultContent.classList.remove("hidden");

  generatedCodeText.textContent =
    codeData.code;

  resultUsername.textContent =
    codeData.username;

  resultReward.textContent =
    codeData.reward;

  resultSpin.textContent =
    codeData.spins;

  resultExpired.textContent =
    formatDate(codeData.expiredDate);

  copyMessage.textContent = "";
}

// ========================================
// PROSES GENERATE KODE
// ========================================

function handleGenerateCode(event) {
  event.preventDefault();

  const isFormValid = validateGenerateForm();

  if (!isFormValid) {
    showToast(
      "Periksa kembali data formulir.",
      "error"
    );

    return;
  }

  const newCodeValue = createUniqueBonusCode();

  const codeData = {
    code: newCodeValue,
    username:
      customerUsernameInput.value.trim(),
    reward: rewardSelect.value,
    spins: Number(spinAmountInput.value),
    expiredDate: expiredDateInput.value,
    note: adminNoteInput.value.trim()
  };

  const savedCode = addCode(codeData);

  if (!savedCode) {
    showToast(
      "Gagal menyimpan kode.",
      "error"
    );

    return;
  }

  showGeneratedResult(savedCode);
  updateStatistics();
  renderCodeHistory();

  showToast(
    "Kode bonus berhasil dibuat.",
    "success"
  );

  generateCodeForm.reset();

  spinAmountInput.value = "1";
  setDefaultExpiredDate();
}

// ========================================
// COPY KODE
// ========================================

async function handleCopyCode() {
  const code = generatedCodeText.textContent.trim();

  if (!code || code === "-") {
    showToast(
      "Belum ada kode untuk disalin.",
      "error"
    );

    return;
  }

  try {
    await navigator.clipboard.writeText(code);

    copyMessage.textContent =
      "Kode berhasil disalin.";

    showToast(
      "Kode berhasil disalin.",
      "success"
    );
  } catch (error) {
    const temporaryInput =
      document.createElement("textarea");

    temporaryInput.value = code;
    temporaryInput.style.position = "fixed";
    temporaryInput.style.opacity = "0";

    document.body.appendChild(temporaryInput);

    temporaryInput.select();

    document.execCommand("copy");

    temporaryInput.remove();

    copyMessage.textContent =
      "Kode berhasil disalin.";

    showToast(
      "Kode berhasil disalin.",
      "success"
    );
  }

  setTimeout(() => {
    copyMessage.textContent = "";
  }, 2200);
}

// ========================================
// STATUS BADGE
// ========================================

function getStatusLabel(status) {
  const statusLabels = {
    ACTIVE: "Aktif",
    USED: "Terpakai",
    EXPIRED: "Kedaluwarsa"
  };

  return statusLabels[status] || status;
}

function getStatusClass(status) {
  const statusClasses = {
    ACTIVE: "status-active",
    USED: "status-used",
    EXPIRED: "status-expired"
  };

  return statusClasses[status] || "";
}

// ========================================
// RENDER RIWAYAT
// ========================================

function renderCodeHistory() {
  const codes = refreshCodeStatuses();

  if (!codes.length) {
    codeHistoryBody.innerHTML = `
      <tr class="empty-table-row">
        <td colspan="7">
          Belum ada riwayat kode.
        </td>
      </tr>
    `;

    return;
  }

  codeHistoryBody.innerHTML = codes
    .map((item) => {
      const safeId = escapeHTML(item.id);
      const safeCode = escapeHTML(item.code);
      const safeUsername = escapeHTML(
        item.username
      );

      const safeReward = escapeHTML(item.reward);

      return `
        <tr>
          <td>
            <strong class="table-code">
              ${safeCode}
            </strong>
          </td>

          <td>
            ${safeUsername}
          </td>

          <td>
            ${safeReward}
          </td>

          <td>
            ${item.remainingSpins}/${item.spins}
          </td>

          <td>
            ${formatDate(item.expiredDate)}
          </td>

          <td>
            <span class="status-badge ${getStatusClass(
              item.status
            )}">
              ${getStatusLabel(item.status)}
            </span>
          </td>

          <td>
            <div class="table-actions">

              <button
                type="button"
                class="table-copy-button"
                data-copy-code="${safeCode}"
                title="Salin kode"
              >
                📋
              </button>

              <button
                type="button"
                class="table-delete-button"
                data-delete-id="${safeId}"
                title="Hapus kode"
              >
                🗑️
              </button>

            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

// ========================================
// AKSI TABEL
// ========================================

async function handleHistoryTableClick(event) {
  const copyButton = event.target.closest(
    "[data-copy-code]"
  );

  const deleteButton = event.target.closest(
    "[data-delete-id]"
  );

  if (copyButton) {
    const code = copyButton.dataset.copyCode;

    try {
      await navigator.clipboard.writeText(code);

      showToast(
        "Kode berhasil disalin.",
        "success"
      );
    } catch (error) {
      showToast(
        "Gagal menyalin kode.",
        "error"
      );
    }

    return;
  }

  if (deleteButton) {
    const id = deleteButton.dataset.deleteId;

    const confirmed = window.confirm(
      "Yakin ingin menghapus kode ini?"
    );

    if (!confirmed) {
      return;
    }

    const deleted = deleteCodeById(id);

    if (!deleted) {
      showToast(
        "Kode gagal dihapus.",
        "error"
      );

      return;
    }

    renderCodeHistory();
    updateStatistics();

    showToast(
      "Kode berhasil dihapus.",
      "success"
    );
  }
}

// ========================================
// HAPUS SEMUA RIWAYAT
// ========================================

function handleClearHistory() {
  const codes = getAllCodes();

  if (!codes.length) {
    showToast(
      "Riwayat kode masih kosong.",
      "error"
    );

    return;
  }

  const confirmed = window.confirm(
    "Yakin ingin menghapus semua riwayat kode?"
  );

  if (!confirmed) {
    return;
  }

  clearAllCodes();

  renderCodeHistory();
  updateStatistics();

  emptyResult.classList.remove("hidden");
  resultContent.classList.add("hidden");

  showToast(
    "Semua riwayat berhasil dihapus.",
    "success"
  );
}

// ========================================
// HAPUS ERROR SAAT MENGETIK
// ========================================

function clearFieldError(
  inputElement,
  errorElement
) {
  inputElement.classList.remove("input-error");
  errorElement.textContent = "";
}

// ========================================
// LOGOUT
// ========================================

function handleLogout() {
  const confirmed = window.confirm(
    "Yakin ingin logout dari admin panel?"
  );

  if (!confirmed) {
    return;
  }

  sessionStorage.removeItem(LOGIN_SESSION_KEY);

  window.location.href = "index.html";
}

// ========================================
// EVENT LISTENER
// ========================================

menuItems.forEach((menuItem) => {
  menuItem.addEventListener("click", () => {
    const sectionId =
      menuItem.dataset.section;

    openSection(sectionId);
  });
});

mobileMenuButton.addEventListener(
  "click",
  openMobileSidebar
);

sidebarOverlay.addEventListener(
  "click",
  closeMobileSidebar
);

quickGenerateButton.addEventListener(
  "click",
  () => {
    openSection("generateSection");

    setTimeout(() => {
      customerUsernameInput.focus();
    }, 150);
  }
);

generateCodeForm.addEventListener(
  "submit",
  handleGenerateCode
);

copyCodeButton.addEventListener(
  "click",
  handleCopyCode
);

codeHistoryBody.addEventListener(
  "click",
  handleHistoryTableClick
);

clearHistoryButton.addEventListener(
  "click",
  handleClearHistory
);

logoutButton.addEventListener(
  "click",
  handleLogout
);

customerUsernameInput.addEventListener(
  "input",
  () => {
    clearFieldError(
      customerUsernameInput,
      customerUsernameError
    );
  }
);

rewardSelect.addEventListener(
  "change",
  () => {
    clearFieldError(
      rewardSelect,
      rewardError
    );
  }
);

spinAmountInput.addEventListener(
  "input",
  () => {
    clearFieldError(
      spinAmountInput,
      spinAmountError
    );
  }
);

expiredDateInput.addEventListener(
  "change",
  () => {
    clearFieldError(
      expiredDateInput,
      expiredDateError
    );
  }
);

// ========================================
// INISIALISASI ADMIN
// ========================================

function initializeAdminPage() {
  const sessionData = protectAdminPage();

  if (!sessionData) {
    return;
  }

  loadAdminProfile(sessionData);
  setDefaultExpiredDate();
  updateStatistics();
  renderCodeHistory();
}

initializeAdminPage();
