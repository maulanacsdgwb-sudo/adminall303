"use strict";

// ========================================
// KONFIGURASI STORAGE
// ========================================

const STORAGE_KEYS = {
  codes: "luckySpinCodes",
  rewards: "luckySpinRewards",
  settings: "luckySpinSettings"
};

// ========================================
// UTILITAS DASAR
// ========================================

function readStorage(key, fallbackValue = []) {
  const savedData = localStorage.getItem(key);

  if (!savedData) {
    return fallbackValue;
  }

  try {
    return JSON.parse(savedData);
  } catch (error) {
    console.error(`Gagal membaca storage: ${key}`, error);
    return fallbackValue;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify(value)
    );

    return true;
  } catch (error) {
    console.error(`Gagal menyimpan storage: ${key}`, error);
    return false;
  }
}

// ========================================
// GENERATE ID UNIK
// ========================================

function generateUniqueId() {
  return `LS-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`;
}

// ========================================
// GENERATE KODE BONUS
// ========================================

function generateBonusCode(prefix = "SPIN") {
  const randomPart = Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase();

  const timePart = Date.now()
    .toString()
    .slice(-4);

  return `${prefix}-${randomPart}-${timePart}`;
}

// ========================================
// AMBIL SEMUA KODE
// ========================================

function getAllCodes() {
  return readStorage(
    STORAGE_KEYS.codes,
    []
  );
}

// ========================================
// SIMPAN SEMUA KODE
// ========================================

function saveAllCodes(codes) {
  return writeStorage(
    STORAGE_KEYS.codes,
    codes
  );
}

// ========================================
// TAMBAH KODE BARU
// ========================================

function addCode(codeData) {
  const codes = getAllCodes();

  const newCode = {
    id: generateUniqueId(),
    code: codeData.code,
    username: codeData.username,
    reward: codeData.reward,
    spins: Number(codeData.spins),
    remainingSpins: Number(codeData.spins),
    expiredDate: codeData.expiredDate,
    note: codeData.note || "",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    usedAt: null
  };

  codes.unshift(newCode);

  const saved = saveAllCodes(codes);

  return saved ? newCode : null;
}

// ========================================
// CARI KODE BERDASARKAN ID
// ========================================

function getCodeById(id) {
  const codes = getAllCodes();

  return codes.find((item) => {
    return item.id === id;
  }) || null;
}

// ========================================
// CARI KODE BERDASARKAN KODE BONUS
// ========================================

function getCodeByCode(code) {
  const codes = getAllCodes();

  return codes.find((item) => {
    return item.code.toUpperCase() ===
      String(code).trim().toUpperCase();
  }) || null;
}

// ========================================
// CEK KODE SUDAH ADA
// ========================================

function isCodeExists(code) {
  return Boolean(getCodeByCode(code));
}

// ========================================
// UPDATE DATA KODE
// ========================================

function updateCodeById(id, updatedData) {
  const codes = getAllCodes();

  const codeIndex = codes.findIndex((item) => {
    return item.id === id;
  });

  if (codeIndex === -1) {
    return null;
  }

  codes[codeIndex] = {
    ...codes[codeIndex],
    ...updatedData
  };

  const saved = saveAllCodes(codes);

  return saved ? codes[codeIndex] : null;
}

// ========================================
// HAPUS SATU KODE
// ========================================

function deleteCodeById(id) {
  const codes = getAllCodes();

  const filteredCodes = codes.filter((item) => {
    return item.id !== id;
  });

  if (filteredCodes.length === codes.length) {
    return false;
  }

  return saveAllCodes(filteredCodes);
}

// ========================================
// HAPUS SEMUA KODE
// ========================================

function clearAllCodes() {
  localStorage.removeItem(STORAGE_KEYS.codes);
  return true;
}

// ========================================
// CEK KODE KEDALUWARSA
// ========================================

function isCodeExpired(codeData) {
  if (!codeData || !codeData.expiredDate) {
    return false;
  }

  const expiredDate = new Date(
    `${codeData.expiredDate}T23:59:59`
  );

  return new Date() > expiredDate;
}

// ========================================
// PERBARUI STATUS KODE
// ========================================

function refreshCodeStatuses() {
  const codes = getAllCodes();

  let hasChanges = false;

  const updatedCodes = codes.map((item) => {
    if (
      item.status === "ACTIVE" &&
      isCodeExpired(item)
    ) {
      hasChanges = true;

      return {
        ...item,
        status: "EXPIRED"
      };
    }

    if (
      item.remainingSpins <= 0 &&
      item.status !== "USED"
    ) {
      hasChanges = true;

      return {
        ...item,
        status: "USED",
        usedAt:
          item.usedAt || new Date().toISOString()
      };
    }

    return item;
  });

  if (hasChanges) {
    saveAllCodes(updatedCodes);
  }

  return updatedCodes;
}

// ========================================
// VALIDASI KODE UNTUK CUSTOMER
// ========================================

function validateCustomerCode(code, username = "") {
  refreshCodeStatuses();

  const codeData = getCodeByCode(code);

  if (!codeData) {
    return {
      valid: false,
      message: "Kode tidak ditemukan."
    };
  }

  if (
    username &&
    codeData.username.toLowerCase() !==
      username.trim().toLowerCase()
  ) {
    return {
      valid: false,
      message:
        "Kode tidak sesuai dengan username customer."
    };
  }

  if (codeData.status === "EXPIRED") {
    return {
      valid: false,
      message: "Kode sudah kedaluwarsa."
    };
  }

  if (
    codeData.status === "USED" ||
    codeData.remainingSpins <= 0
  ) {
    return {
      valid: false,
      message: "Kode sudah digunakan."
    };
  }

  if (codeData.status !== "ACTIVE") {
    return {
      valid: false,
      message: "Kode tidak aktif."
    };
  }

  return {
    valid: true,
    message: "Kode berhasil diverifikasi.",
    data: codeData
  };
}

// ========================================
// GUNAKAN SATU SPIN
// ========================================

function useOneSpin(code) {
  refreshCodeStatuses();

  const codeData = getCodeByCode(code);

  if (!codeData) {
    return {
      success: false,
      message: "Kode tidak ditemukan."
    };
  }

  if (
    codeData.status !== "ACTIVE" ||
    codeData.remainingSpins <= 0
  ) {
    return {
      success: false,
      message: "Kode sudah tidak dapat digunakan."
    };
  }

  const remainingSpins =
    codeData.remainingSpins - 1;

  const updatedData = {
    remainingSpins: remainingSpins,
    status:
      remainingSpins <= 0
        ? "USED"
        : "ACTIVE",
    usedAt:
      remainingSpins <= 0
        ? new Date().toISOString()
        : codeData.usedAt
  };

  const updatedCode = updateCodeById(
    codeData.id,
    updatedData
  );

  if (!updatedCode) {
    return {
      success: false,
      message: "Gagal memperbarui kode."
    };
  }

  return {
    success: true,
    message: "Satu kesempatan spin digunakan.",
    data: updatedCode
  };
}

// ========================================
// STATISTIK
// ========================================

function getCodeStatistics() {
  const codes = refreshCodeStatuses();

  const totalCodes = codes.length;

  const activeCodes = codes.filter((item) => {
    return item.status === "ACTIVE";
  }).length;

  const usedCodes = codes.filter((item) => {
    return item.status === "USED";
  }).length;

  const expiredCodes = codes.filter((item) => {
    return item.status === "EXPIRED";
  }).length;

  const totalRewards = codes.filter((item) => {
    return item.reward &&
      item.reward.toUpperCase() !== "ZONK";
  }).length;

  return {
    totalCodes,
    activeCodes,
    usedCodes,
    expiredCodes,
    totalRewards
  };
}

// ========================================
// REWARD DEFAULT
// ========================================

function getDefaultRewards() {
  return [
    {
      id: "reward-1",
      name: "SALDO 10.000",
      icon: "🎟️",
      active: true
    },
    {
      id: "reward-2",
      name: "SALDO 20.000",
      icon: "🎟️",
      active: true
    },
    {
      id: "reward-3",
      name: "SALDO 50.000",
      icon: "💰",
      active: true
    },
    {
      id: "reward-4",
      name: "SALDO 100.000",
      icon: "💰",
      active: true
    },
    {
      id: "reward-5",
      name: "JACKPOT 500.000",
      icon: "💎",
      active: true
    },
    {
      id: "reward-6",
      name: "ZONK",
      icon: "😅",
      active: true
    }
  ];
}

// ========================================
// AMBIL DAFTAR HADIAH
// ========================================

function getRewards() {
  const savedRewards = readStorage(
    STORAGE_KEYS.rewards,
    null
  );

  if (
    !Array.isArray(savedRewards) ||
    savedRewards.length === 0
  ) {
    const defaultRewards = getDefaultRewards();

    writeStorage(
      STORAGE_KEYS.rewards,
      defaultRewards
    );

    return defaultRewards;
  }

  return savedRewards;
}

// ========================================
// SIMPAN DAFTAR HADIAH
// ========================================

function saveRewards(rewards) {
  return writeStorage(
    STORAGE_KEYS.rewards,
    rewards
  );
}

// ========================================
// RESET SELURUH DATA LATIHAN
// ========================================

function resetLuckySpinStorage() {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });

  getRewards();

  return true;
}

// ========================================
// INISIALISASI STORAGE
// ========================================

function initializeStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.codes)) {
    saveAllCodes([]);
  }

  getRewards();
  refreshCodeStatuses();
}

initializeStorage();
