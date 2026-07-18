"use strict";

// ========================================
// KONFIGURASI LOGIN DEMO
// ========================================

const ADMIN_ACCOUNT = {
  username: "admin",
  password: "asdf1234"
};

const LOGIN_SESSION_KEY = "luckySpinAdminSession";
const REMEMBER_USERNAME_KEY = "luckySpinRememberedUsername";

// ========================================
// AMBIL ELEMENT HTML
// ========================================

const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const rememberAdmin = document.getElementById("rememberAdmin");

const usernameError = document.getElementById("usernameError");
const passwordError = document.getElementById("passwordError");
const loginMessage = document.getElementById("loginMessage");

const loginButton = document.getElementById("loginButton");
const buttonText = loginButton.querySelector(".button-text");
const buttonLoader = loginButton.querySelector(".button-loader");

const togglePassword = document.getElementById("togglePassword");

// ========================================
// FUNGSI UTILITAS
// ========================================

function clearErrors() {
  usernameError.textContent = "";
  passwordError.textContent = "";

  usernameInput.classList.remove("input-error");
  passwordInput.classList.remove("input-error");

  loginMessage.textContent = "";
  loginMessage.className = "login-message";
}

function showFieldError(inputElement, errorElement, message) {
  inputElement.classList.add("input-error");
  errorElement.textContent = message;
}

function showLoginMessage(message, type) {
  loginMessage.textContent = message;
  loginMessage.className = `login-message ${type}`;
}

function setLoading(isLoading) {
  loginButton.disabled = isLoading;

  if (isLoading) {
    buttonText.classList.add("hidden");
    buttonLoader.classList.remove("hidden");
  } else {
    buttonText.classList.remove("hidden");
    buttonLoader.classList.add("hidden");
  }
}

function sanitizeInput(value) {
  return value.trim();
}

// ========================================
// INGAT USERNAME
// ========================================

function loadRememberedUsername() {
  const rememberedUsername = localStorage.getItem(
    REMEMBER_USERNAME_KEY
  );

  if (rememberedUsername) {
    usernameInput.value = rememberedUsername;
    rememberAdmin.checked = true;
  }
}

function saveRememberedUsername(username) {
  if (rememberAdmin.checked) {
    localStorage.setItem(
      REMEMBER_USERNAME_KEY,
      username
    );
  } else {
    localStorage.removeItem(
      REMEMBER_USERNAME_KEY
    );
  }
}

// ========================================
// SIMPAN SESSION LOGIN
// ========================================

function createLoginSession(username) {
  const sessionData = {
    username: username,
    loginTime: new Date().toISOString(),
    isLoggedIn: true
  };

  sessionStorage.setItem(
    LOGIN_SESSION_KEY,
    JSON.stringify(sessionData)
  );
}

// ========================================
// VALIDASI FORM
// ========================================

function validateForm(username, password) {
  let isValid = true;

  if (!username) {
    showFieldError(
      usernameInput,
      usernameError,
      "Username wajib diisi."
    );

    isValid = false;
  }

  if (!password) {
    showFieldError(
      passwordInput,
      passwordError,
      "Password wajib diisi."
    );

    isValid = false;
  }

  if (password && password.length < 4) {
    showFieldError(
      passwordInput,
      passwordError,
      "Password minimal 4 karakter."
    );

    isValid = false;
  }

  return isValid;
}

// ========================================
// PROSES LOGIN
// ========================================

async function handleLogin(event) {
  event.preventDefault();

  clearErrors();

  const username = sanitizeInput(usernameInput.value);
  const password = passwordInput.value;

  const isFormValid = validateForm(
    username,
    password
  );

  if (!isFormValid) {
    showLoginMessage(
      "Periksa kembali data login.",
      "error"
    );

    return;
  }

  setLoading(true);

  // Simulasi proses login
  await new Promise((resolve) => {
    setTimeout(resolve, 900);
  });

  const usernameIsCorrect =
    username.toLowerCase() ===
    ADMIN_ACCOUNT.username.toLowerCase();

  const passwordIsCorrect =
    password === ADMIN_ACCOUNT.password;

  if (!usernameIsCorrect || !passwordIsCorrect) {
    setLoading(false);

    passwordInput.value = "";
    passwordInput.focus();

    showFieldError(
      usernameInput,
      usernameError,
      "Username atau password salah."
    );

    showFieldError(
      passwordInput,
      passwordError,
      "Username atau password salah."
    );

    showLoginMessage(
      "Login gagal. Silakan coba kembali.",
      "error"
    );

    return;
  }

  saveRememberedUsername(username);
  createLoginSession(username);

  showLoginMessage(
    "Login berhasil. Mengalihkan ke dashboard...",
    "success"
  );

  setTimeout(() => {
    window.location.href = "admin.html";
  }, 850);
}

// ========================================
// TAMPIL / SEMBUNYIKAN PASSWORD
// ========================================

function handleTogglePassword() {
  const passwordIsHidden =
    passwordInput.type === "password";

  passwordInput.type = passwordIsHidden
    ? "text"
    : "password";

  togglePassword.textContent = passwordIsHidden
    ? "🙈"
    : "👁";

  togglePassword.setAttribute(
    "aria-label",
    passwordIsHidden
      ? "Sembunyikan password"
      : "Tampilkan password"
  );

  passwordInput.focus();
}

// ========================================
// HAPUS ERROR SAAT USER MENGETIK
// ========================================

function clearUsernameError() {
  usernameInput.classList.remove("input-error");
  usernameError.textContent = "";

  if (
    !usernameError.textContent &&
    !passwordError.textContent
  ) {
    loginMessage.textContent = "";
    loginMessage.className = "login-message";
  }
}

function clearPasswordError() {
  passwordInput.classList.remove("input-error");
  passwordError.textContent = "";

  if (
    !usernameError.textContent &&
    !passwordError.textContent
  ) {
    loginMessage.textContent = "";
    loginMessage.className = "login-message";
  }
}

// ========================================
// CEK APAKAH SUDAH LOGIN
// ========================================

function redirectIfAlreadyLoggedIn() {
  const savedSession = sessionStorage.getItem(
    LOGIN_SESSION_KEY
  );

  if (!savedSession) {
    return;
  }

  try {
    const sessionData = JSON.parse(savedSession);

    if (sessionData.isLoggedIn === true) {
      window.location.href = "admin.html";
    }
  } catch (error) {
    sessionStorage.removeItem(LOGIN_SESSION_KEY);
  }
}

// ========================================
// EVENT LISTENER
// ========================================

loginForm.addEventListener(
  "submit",
  handleLogin
);

togglePassword.addEventListener(
  "click",
  handleTogglePassword
);

usernameInput.addEventListener(
  "input",
  clearUsernameError
);

passwordInput.addEventListener(
  "input",
  clearPasswordError
);

// ========================================
// JALANKAN SAAT HALAMAN DIBUKA
// ========================================

redirectIfAlreadyLoggedIn();
loadRememberedUsername();
