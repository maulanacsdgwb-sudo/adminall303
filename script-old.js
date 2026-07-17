"use strict";

/*
  LOGIN DEMO

  Username: admin
  Password: au328

  CATATAN:
  Ini hanya versi percobaan GitHub Pages.
  Username dan password dapat dilihat dari source code browser.
*/

const ADMIN_ACCOUNT = {
  username: "admin",
  password: "au328"
};

const STORAGE_KEYS = {
  session: "au328_admin_session",
  luckyCodes: "au328_lucky_codes"
};

const loginPage = document.getElementById("loginPage");
const dashboardPage = document.getElementById("dashboardPage");

const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

const adminUsername = document.getElementById("adminUsername");
const adminPassword = document.getElementById("adminPassword");

const togglePassword = document.getElementById("togglePassword");
const logoutButton = document.getElementById("logoutButton");
const currentAdmin = document.getElementById("currentAdmin");

const generateForm = document.getElementById("generateForm");
const memberUsername = document.getElementById("memberUsername");
const rewardSelect = document.getElementById("rewardSelect");
const expiredDate = document.getElementById("expiredDate");
const spinAmount = document.getElementById("spinAmount");
const adminNote = document.getElementById("adminNote");

const codeResult = document.getElementById("codeResult");
const generatedCode = document.getElementById("generatedCode");
const resultUsername = document.getElementById("resultUsername");
const resultReward = document.getElementById("resultReward");
const resultSpin = document.getElementById("resultSpin");
const resultExpired = document.getElementById("resultExpired");

const copyCodeButton = document.getElementById("copyCodeButton");
const copyMessage = document.getElementById("copyMessage");

const historyTableBody =
  document.getElementById("historyTableBody");

const emptyHistory = document.getElementById("emptyHistory");
const deleteAllButton = document.getElementById("deleteAllButton");

const tabButtons = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");


function getStoredCodes() {
  try {
    const storedData = localStorage.getItem(
      STORAGE_KEYS.luckyCodes
    );

    return storedData ? JSON.parse(storedData) : [];
  } catch (error) {
    console.error("Gagal membaca data:", error);
    return [];
  }
}


function saveCodes(codes) {
  localStorage.setItem(
    STORAGE_KEYS.luckyCodes,
    JSON.stringify(codes)
  );
}


function createUniqueCode() {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let randomPart = "";

  for (let index = 0; index < 8; index += 1) {
    const randomIndex = Math.floor(
      Math.random() * characters.length
    );

    randomPart += characters[randomIndex];
  }

  const datePart = new Date()
    .getTime()
    .toString()
    .slice(-4);

  return `AU328-LS-${randomPart}-${datePart}`;
}


function formatDate(dateValue) {
  if (!dateValue) {
    return "-";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}


function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function showDashboard(username) {
  loginPage.classList.add("hidden");
  dashboardPage.classList.remove("hidden");

  currentAdmin.textContent = username;

  renderHistory();
}


function showLogin() {
  dashboardPage.classList.add("hidden");
  loginPage.classList.remove("hidden");

  loginForm.reset();
  loginMessage.textContent = "";
}


function checkSession() {
  const session = localStorage.getItem(
    STORAGE_KEYS.session
  );

  if (session) {
    showDashboard(session);
  } else {
    showLogin();
  }
}


loginForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const username = adminUsername.value.trim();
  const password = adminPassword.value;

  const usernameCorrect =
    username === ADMIN_ACCOUNT.username;

  const passwordCorrect =
    password === ADMIN_ACCOUNT.password;

  if (!usernameCorrect || !passwordCorrect) {
    loginMessage.textContent =
      "Username atau password admin salah.";

    return;
  }

  localStorage.setItem(
    STORAGE_KEYS.session,
    username
  );

  loginMessage.textContent = "";

  showDashboard(username);
});


togglePassword.addEventListener("click", function () {
  const passwordIsHidden =
    adminPassword.type === "password";

  adminPassword.type =
    passwordIsHidden ? "text" : "password";

  togglePassword.textContent =
    passwordIsHidden ? "🙈" : "👁";
});


logoutButton.addEventListener("click", function () {
  localStorage.removeItem(STORAGE_KEYS.session);

  codeResult.classList.add("hidden");

  showLogin();
});


generateForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const username = memberUsername.value.trim();
  const reward = rewardSelect.value;
  const expired = expiredDate.value;
  const spins = Number(spinAmount.value);
  const note = adminNote.value.trim();

  if (!username) {
    alert("Username member wajib diisi.");
    return;
  }

  if (!reward) {
    alert("Silakan pilih hadiah.");
    return;
  }

  if (!expired) {
    alert("Silakan pilih masa berlaku kode.");
    return;
  }

  const expirationTime = new Date(expired).getTime();

  if (expirationTime <= Date.now()) {
    alert(
      "Masa berlaku harus lebih besar dari waktu sekarang."
    );
    return;
  }

  const luckyCode = {
    id: crypto.randomUUID
      ? crypto.randomUUID()
      : String(Date.now()),

    code: createUniqueCode(),
    username,
    reward,
    spins,
    note,
    expiredAt: expired,
    status: "active",
    createdAt: new Date().toISOString(),
    createdBy:
      localStorage.getItem(STORAGE_KEYS.session)
      || "admin"
  };

  const codes = getStoredCodes();

  codes.unshift(luckyCode);

  saveCodes(codes);

  showGeneratedCode(luckyCode);
  renderHistory();

  generateForm.reset();
  setDefaultExpiredDate();
});


function showGeneratedCode(luckyCode) {
  generatedCode.textContent = luckyCode.code;
  resultUsername.textContent = luckyCode.username;
  resultReward.textContent = luckyCode.reward;
  resultSpin.textContent = `${luckyCode.spins} kali`;
  resultExpired.textContent =
    formatDate(luckyCode.expiredAt);

  copyMessage.textContent = "";

  codeResult.classList.remove("hidden");

  codeResult.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}


copyCodeButton.addEventListener("click", async function () {
  const code = generatedCode.textContent.trim();

  try {
    await navigator.clipboard.writeText(code);

    copyMessage.textContent =
      "Kode berhasil disalin.";
  } catch (error) {
    console.error(error);

    const temporaryInput =
      document.createElement("textarea");

    temporaryInput.value = code;
    document.body.appendChild(temporaryInput);

    temporaryInput.select();
    document.execCommand("copy");

    temporaryInput.remove();

    copyMessage.textContent =
      "Kode berhasil disalin.";
  }

  setTimeout(function () {
    copyMessage.textContent = "";
  }, 2500);
});


function getCodeStatus(item) {
  if (item.status === "used") {
    return "Digunakan";
  }

  if (
    new Date(item.expiredAt).getTime()
    <= Date.now()
  ) {
    return "Kadaluarsa";
  }

  return "Aktif";
}


function renderHistory() {
  const codes = getStoredCodes();

  historyTableBody.innerHTML = "";

  if (codes.length === 0) {
    emptyHistory.style.display = "block";
    return;
  }

  emptyHistory.style.display = "none";

  codes.forEach(function (item) {
    const row = document.createElement("tr");

    const status = getCodeStatus(item);

    row.innerHTML = `
      <td class="table-code">
        ${escapeHtml(item.code)}
      </td>

      <td>
        ${escapeHtml(item.username)}
      </td>

      <td>
        ${escapeHtml(item.reward)}
      </td>

      <td>
        ${escapeHtml(item.spins)}x
      </td>

      <td>
        ${escapeHtml(formatDate(item.expiredAt))}
      </td>

      <td class="table-status">
        ${escapeHtml(status)}
      </td>

      <td>
        <button
          type="button"
          class="small-delete-button"
          data-id="${escapeHtml(item.id)}"
        >
          Hapus
        </button>
      </td>
    `;

    historyTableBody.appendChild(row);
  });
}


historyTableBody.addEventListener(
  "click",
  function (event) {
    const deleteButton =
      event.target.closest(".small-delete-button");

    if (!deleteButton) {
      return;
    }

    const itemId = deleteButton.dataset.id;

    const confirmed = window.confirm(
      "Hapus kode ini dari riwayat?"
    );

    if (!confirmed) {
      return;
    }

    const updatedCodes = getStoredCodes().filter(
      function (item) {
        return item.id !== itemId;
      }
    );

    saveCodes(updatedCodes);
    renderHistory();
  }
);


deleteAllButton.addEventListener(
  "click",
  function () {
    const codes = getStoredCodes();

    if (codes.length === 0) {
      alert("Riwayat masih kosong.");
      return;
    }

    const confirmed = window.confirm(
      "Yakin ingin menghapus semua riwayat kode?"
    );

    if (!confirmed) {
      return;
    }

    localStorage.removeItem(
      STORAGE_KEYS.luckyCodes
    );

    codeResult.classList.add("hidden");

    renderHistory();
  }
);


tabButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    const targetTab = button.dataset.tab;

    tabButtons.forEach(function (tabButton) {
      tabButton.classList.remove("active");
    });

    tabContents.forEach(function (content) {
      content.classList.remove("active");
    });

    button.classList.add("active");

    document
      .getElementById(targetTab)
      .classList.add("active");

    if (targetTab === "historyTab") {
      renderHistory();
    }
  });
});


function setDefaultExpiredDate() {
  const tomorrow = new Date();

  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 0, 0);

  const year = tomorrow.getFullYear();

  const month = String(
    tomorrow.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    tomorrow.getDate()
  ).padStart(2, "0");

  const hours = String(
    tomorrow.getHours()
  ).padStart(2, "0");

  const minutes = String(
    tomorrow.getMinutes()
  ).padStart(2, "0");

  expiredDate.value =
    `${year}-${month}-${day}T${hours}:${minutes}`;
}


setDefaultExpiredDate();
checkSession();
