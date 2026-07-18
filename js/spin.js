"use strict";

/* =====================================================
   ELEMENTS
===================================================== */

const verificationForm = document.getElementById(
  "verificationForm"
);

const spinUsernameInput = document.getElementById(
  "spinUsername"
);

const spinCodeInput = document.getElementById(
  "spinCode"
);

const spinUsernameError = document.getElementById(
  "spinUsernameError"
);

const spinCodeError = document.getElementById(
  "spinCodeError"
);

const verifyButton = document.getElementById(
  "verifyButton"
);

const verifyButtonText = verifyButton.querySelector(
  ".button-text"
);

const verifyLoader = document.getElementById(
  "verifyLoader"
);

const codeInformation = document.getElementById(
  "codeInformation"
);

const verifiedUsername = document.getElementById(
  "verifiedUsername"
);

const verifiedCode = document.getElementById(
  "verifiedCode"
);

const verifiedReward = document.getElementById(
  "verifiedReward"
);

const remainingSpinText = document.getElementById(
  "remainingSpinText"
);

const verifiedExpired = document.getElementById(
  "verifiedExpired"
);

const changeCodeButton = document.getElementById(
  "changeCodeButton"
);

const wheelLockOverlay = document.getElementById(
  "wheelLockOverlay"
);

const wheelInstruction = document.getElementById(
  "wheelInstruction"
);

const spinCounter = document.getElementById(
  "spinCounter"
);

const spinButton = document.getElementById(
  "spinButton"
);

const spinButtonText = document.getElementById(
  "spinButtonText"
);

const spinMessage = document.getElementById(
  "spinMessage"
);

const resultModal = document.getElementById(
  "resultModal"
);

const modalCloseButton = document.getElementById(
  "modalCloseButton"
);

const modalActionButton = document.getElementById(
  "modalActionButton"
);

const resultIcon = document.getElementById(
  "resultIcon"
);

const resultTitle = document.getElementById(
  "resultTitle"
);

const resultPrize = document.getElementById(
  "resultPrize"
);

const modalUsername = document.getElementById(
  "modalUsername"
);

const modalRemainingSpin = document.getElementById(
  "modalRemainingSpin"
);

const spinToast = document.getElementById(
  "spinToast"
);

const confettiContainer = document.getElementById(
  "confettiContainer"
);

const spinAudio = document.getElementById(
  "spinAudio"
);

const winAudio = document.getElementById(
  "winAudio"
);


/* =====================================================
   STATE
===================================================== */

let activeCodeData = null;
let spinProcessActive = false;
let toastTimeout = null;


/* =====================================================
   FORMAT DATE
===================================================== */

function formatSpinDate(dateString) {
  if (!dateString) {
    return "-";
  }

  const date = new Date(
    `${dateString}T00:00:00`
  );

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(date);
}


/* =====================================================
   TOAST
===================================================== */

function showSpinToast(message, type = "success") {
  if (!spinToast) {
    return;
  }

  spinToast.textContent = message;
  spinToast.className = `toast ${type} show`;

  clearTimeout(toastTimeout);

  toastTimeout = setTimeout(() => {
    spinToast.classList.remove("show");
  }, 2800);
}


/* =====================================================
   AUDIO
===================================================== */

function playAudio(audioElement) {
  if (!audioElement) {
    return;
  }

  audioElement.currentTime = 0;

  audioElement.play().catch(() => {
    // Browser bisa memblokir audio otomatis.
  });
}

function stopAudio(audioElement) {
  if (!audioElement) {
    return;
  }

  audioElement.pause();
  audioElement.currentTime = 0;
}


/* =====================================================
   FORM ERROR
===================================================== */

function clearSpinErrors() {
  spinUsernameError.textContent = "";
  spinCodeError.textContent = "";

  spinUsernameInput.classList.remove(
    "input-error"
  );

  spinCodeInput.classList.remove(
    "input-error"
  );
}

function showSpinFieldError(
  inputElement,
  errorElement,
  message
) {
  inputElement.classList.add("input-error");
  errorElement.textContent = message;
}


/* =====================================================
   FORM VALIDATION
===================================================== */

function validateVerificationForm() {
  clearSpinErrors();

  const username =
    spinUsernameInput.value.trim();

  const code =
    spinCodeInput.value.trim();

  let valid = true;

  if (!username) {
    showSpinFieldError(
      spinUsernameInput,
      spinUsernameError,
      "Username wajib diisi."
    );

    valid = false;
  }

  if (username && username.length < 3) {
    showSpinFieldError(
      spinUsernameInput,
      spinUsernameError,
      "Username minimal 3 karakter."
    );

    valid = false;
  }

  if (!code) {
    showSpinFieldError(
      spinCodeInput,
      spinCodeError,
      "Kode bonus wajib diisi."
    );

    valid = false;
  }

  return valid;
}


/* =====================================================
   VERIFY LOADING
===================================================== */

function setVerifyLoading(isLoading) {
  verifyButton.disabled = isLoading;

  verifyButtonText.classList.toggle(
    "hidden",
    isLoading
  );

  verifyLoader.classList.toggle(
    "hidden",
    !isLoading
  );
}


/* =====================================================
   ACTIVE CODE UI
===================================================== */

function updateActiveCodeDisplay() {
  if (!activeCodeData) {
    return;
  }

  verifiedUsername.textContent =
    activeCodeData.username;

  verifiedCode.textContent =
    activeCodeData.code;

  verifiedReward.textContent =
    activeCodeData.reward;

  remainingSpinText.textContent =
    activeCodeData.remainingSpins;

  verifiedExpired.textContent =
    formatSpinDate(
      activeCodeData.expiredDate
    );

  spinCounter.textContent =
    activeCodeData.remainingSpins;

  wheelInstruction.textContent =
    `Kode aktif untuk ${activeCodeData.username}. ` +
    `Hadiah: ${activeCodeData.reward}.`;

  codeInformation.classList.remove("hidden");
  wheelLockOverlay.classList.add("hidden");

  spinButton.disabled =
    activeCodeData.remainingSpins <= 0;

  spinButtonText.textContent =
    activeCodeData.remainingSpins > 0
      ? "SPIN SEKARANG"
      : "SPIN HABIS";
}


/* =====================================================
   RESET CODE
===================================================== */

function resetActiveCode() {
  if (spinProcessActive || isWheelSpinning()) {
    showSpinToast(
      "Tunggu roda selesai berputar.",
      "error"
    );

    return;
  }

  activeCodeData = null;

  verificationForm.reset();

  clearSpinErrors();

  codeInformation.classList.add("hidden");
  wheelLockOverlay.classList.remove("hidden");

  spinCounter.textContent = "0";
  spinButton.disabled = true;
  spinButtonText.textContent = "SPIN SEKARANG";

  wheelInstruction.textContent =
    "Verifikasi kode terlebih dahulu untuk membuka roda.";

  spinMessage.textContent = "";

  resetWheelRotation();

  spinUsernameInput.focus();
}


/* =====================================================
   VERIFY CODE
===================================================== */

async function handleVerification(event) {
  event.preventDefault();

  if (!validateVerificationForm()) {
    showSpinToast(
      "Periksa kembali data yang dimasukkan.",
      "error"
    );

    return;
  }

  setVerifyLoading(true);

  await new Promise((resolve) => {
    setTimeout(resolve, 650);
  });

  const username =
    spinUsernameInput.value.trim();

  const code =
    spinCodeInput.value.trim();

  const validation =
    validateCustomerCode(code, username);

  setVerifyLoading(false);

  if (!validation.valid) {
    showSpinFieldError(
      spinCodeInput,
      spinCodeError,
      validation.message
    );

    showSpinToast(
      validation.message,
      "error"
    );

    return;
  }

  activeCodeData = validation.data;

  spinUsernameInput.value =
    activeCodeData.username;

  spinCodeInput.value =
    activeCodeData.code;

  updateActiveCodeDisplay();

  showSpinToast(
    "Kode berhasil diverifikasi.",
    "success"
  );
}


/* =====================================================
   RESULT TYPE
===================================================== */

function isZonkPrize(prizeName) {
  return String(prizeName)
    .trim()
    .toUpperCase() === "ZONK";
}

function getPrizeIcon(prizeName) {
  const normalizedPrize = String(prizeName)
    .toUpperCase();

  if (normalizedPrize.includes("JACKPOT")) {
    return "💎";
  }

  if (normalizedPrize.includes("SALDO")) {
    return "💰";
  }

  if (normalizedPrize.includes("SALDO")) {
    return "🎟️";
  }

  if (normalizedPrize.includes("ZONK")) {
    return "😅";
  }

  return "🎁";
}


/* =====================================================
   RESULT MODAL
===================================================== */

function showResultModal(prizeName) {
  const zonk = isZonkPrize(prizeName);

  resultIcon.textContent =
    getPrizeIcon(prizeName);

  resultTitle.textContent =
    zonk
      ? "Belum Beruntung"
      : "Selamat!";

  resultPrize.textContent =
    prizeName;

  modalUsername.textContent =
    activeCodeData?.username || "-";

  modalRemainingSpin.textContent =
    activeCodeData?.remainingSpins ?? 0;

  resultModal.classList.remove("hidden");

  document.body.style.overflow = "hidden";

  if (!zonk) {
    createConfetti();
    playAudio(winAudio);
  }
}

function closeResultModal() {
  resultModal.classList.add("hidden");

  document.body.style.overflow = "";

  clearConfetti();
}


/* =====================================================
   CONFETTI
===================================================== */

function createConfetti() {
  clearConfetti();

  const colors = [
    "#ff2fa8",
    "#8d4dff",
    "#35e0ff",
    "#ffd54a",
    "#47ff95",
    "#ffffff"
  ];

  const totalPieces = 90;

  for (let index = 0; index < totalPieces; index++) {
    const piece = document.createElement("span");

    piece.className = "confetti-piece";

    const leftPosition =
      Math.random() * 100;

    const delay =
      Math.random() * 0.8;

    const duration =
      2.5 + Math.random() * 2.7;

    const horizontalMovement =
      `${Math.random() * 260 - 130}px`;

    const rotation =
      `${Math.random() * 1000 - 500}deg`;

    piece.style.left =
      `${leftPosition}%`;

    piece.style.background =
      colors[
        Math.floor(
          Math.random() * colors.length
        )
      ];

    piece.style.animationDelay =
      `${delay}s`;

    piece.style.animationDuration =
      `${duration}s`;

    piece.style.setProperty(
      "--confetti-x",
      horizontalMovement
    );

    piece.style.setProperty(
      "--confetti-rotation",
      rotation
    );

    if (Math.random() > 0.5) {
      piece.style.borderRadius = "50%";
    }

    confettiContainer.appendChild(piece);
  }

  setTimeout(clearConfetti, 6000);
}

function clearConfetti() {
  confettiContainer.innerHTML = "";
}


/* =====================================================
   SPIN BUTTON STATE
===================================================== */

function setSpinLoading(isLoading) {
  spinProcessActive = isLoading;

  spinButton.disabled =
    isLoading ||
    !activeCodeData ||
    activeCodeData.remainingSpins <= 0;

  spinButtonText.textContent =
    isLoading
      ? "SEDANG BERPUTAR..."
      : activeCodeData?.remainingSpins > 0
        ? "SPIN SEKARANG"
        : "SPIN HABIS";
}


/* =====================================================
   REFRESH ACTIVE CODE
===================================================== */

function refreshActiveCode() {
  if (!activeCodeData) {
    return null;
  }

  const refreshedCode =
    getCodeByCode(activeCodeData.code);

  if (!refreshedCode) {
    activeCodeData = null;
    return null;
  }

  activeCodeData = refreshedCode;

  return activeCodeData;
}


/* =====================================================
   SPIN PROCESS
===================================================== */

async function handleSpin() {
  if (spinProcessActive || isWheelSpinning()) {
    return;
  }

  if (!activeCodeData) {
    showSpinToast(
      "Verifikasi kode terlebih dahulu.",
      "error"
    );

    return;
  }

  const validation = validateCustomerCode(
    activeCodeData.code,
    activeCodeData.username
  );

  if (!validation.valid) {
    showSpinToast(
      validation.message,
      "error"
    );

    resetActiveCode();
    return;
  }

  activeCodeData = validation.data;

  if (activeCodeData.remainingSpins <= 0) {
    showSpinToast(
      "Kesempatan spin sudah habis.",
      "error"
    );

    updateActiveCodeDisplay();
    return;
  }

  const selectedPrize =
    activeCodeData.reward;

  if (getPrizeIndexByName(selectedPrize) === -1) {
    showSpinToast(
      "Hadiah tidak tersedia di roda.",
      "error"
    );

    return;
  }

  setSpinLoading(true);

  spinMessage.textContent =
    "Roda sedang mencari keberuntunganmu...";

  playAudio(spinAudio);

  try {
    await spinWheelToPrize(selectedPrize, {
      duration: 6500
    });

    stopAudio(spinAudio);

    const spinUsage =
      useOneSpin(activeCodeData.code);

    if (!spinUsage.success) {
      throw new Error(spinUsage.message);
    }

    activeCodeData = spinUsage.data;

    updateActiveCodeDisplay();

    spinMessage.textContent =
      `Hasil spin: ${selectedPrize}`;

    showResultModal(selectedPrize);
  } catch (error) {
    stopAudio(spinAudio);

    spinMessage.textContent =
      "Terjadi kesalahan saat memutar roda.";

    showSpinToast(
      error.message ||
        "Spin gagal diproses.",
      "error"
    );
  } finally {
    refreshActiveCode();

    if (activeCodeData) {
      updateActiveCodeDisplay();
    }

    setSpinLoading(false);
  }
}


/* =====================================================
   KEYBOARD CONTROL
===================================================== */

function handleKeyboard(event) {
  if (
    event.key === "Escape" &&
    !resultModal.classList.contains("hidden")
  ) {
    closeResultModal();
  }
}


/* =====================================================
   INPUT NORMALIZATION
===================================================== */

function normalizeCodeInput() {
  spinCodeInput.value =
    spinCodeInput.value
      .toUpperCase()
      .replace(/\s+/g, "");
}


/* =====================================================
   EVENT LISTENERS
===================================================== */

verificationForm.addEventListener(
  "submit",
  handleVerification
);

changeCodeButton.addEventListener(
  "click",
  resetActiveCode
);

spinButton.addEventListener(
  "click",
  handleSpin
);

modalCloseButton.addEventListener(
  "click",
  closeResultModal
);

modalActionButton.addEventListener(
  "click",
  closeResultModal
);

resultModal
  .querySelector(".modal-backdrop")
  .addEventListener(
    "click",
    closeResultModal
  );

spinUsernameInput.addEventListener(
  "input",
  () => {
    spinUsernameInput.classList.remove(
      "input-error"
    );

    spinUsernameError.textContent = "";
  }
);

spinCodeInput.addEventListener(
  "input",
  () => {
    normalizeCodeInput();

    spinCodeInput.classList.remove(
      "input-error"
    );

    spinCodeError.textContent = "";
  }
);

document.addEventListener(
  "keydown",
  handleKeyboard
);


/* =====================================================
   INITIALIZATION
===================================================== */

function initializeSpinPage() {
  resetActiveCode();

  const rewards = getRewards()
    .filter((reward) => reward.active !== false)
    .map((reward) => ({
      name: reward.name,
      icon: reward.icon
    }));

  if (rewards.length >= 2) {
    setWheelPrizes(rewards);
  }
}

initializeSpinPage();
