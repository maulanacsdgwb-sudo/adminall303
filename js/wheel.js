"use strict";

/* =====================================================
   WHEEL CONFIGURATION
===================================================== */

const wheelCanvas = document.getElementById("wheelCanvas");
const wheelContext = wheelCanvas.getContext("2d");

const WHEEL_SIZE = wheelCanvas.width;
const WHEEL_CENTER = WHEEL_SIZE / 2;
const WHEEL_RADIUS = WHEEL_SIZE / 2;

let wheelRotation = 0;
let wheelIsSpinning = false;

let wheelPrizes = [
  {
    name: "SALDO 10.000",
    icon: "🎟️"
  },
  {
    name: "SALDO 20.000",
    icon: "🎫"
  },
  {
    name: "SALDO 50.000",
    icon: "💰"
  },
  {
    name: "SALDO 100.000",
    icon: "💵"
  },
  {
    name: "JACKPOT 500.000",
    icon: "💎"
  },
  {
    name: "ZONK",
    icon: "😅"
  }
];

const wheelColors = [
  "#ff2fa8",
  "#8d4dff",
  "#35e0ff",
  "#ff8a3d",
  "#ffd54a",
  "#272a38"
];


/* =====================================================
   CANVAS SCALE
===================================================== */

function setupWheelCanvas() {
  const devicePixelRatio = window.devicePixelRatio || 1;

  const displayWidth = wheelCanvas.clientWidth || WHEEL_SIZE;
  const displayHeight = wheelCanvas.clientHeight || WHEEL_SIZE;

  wheelCanvas.width = displayWidth * devicePixelRatio;
  wheelCanvas.height = displayHeight * devicePixelRatio;

  wheelContext.setTransform(
    devicePixelRatio,
    0,
    0,
    devicePixelRatio,
    0,
    0
  );

  drawWheel();
}


/* =====================================================
   HELPERS
===================================================== */

function degreesToRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function normalizeRotation(rotation) {
  return ((rotation % 360) + 360) % 360;
}

function getSegmentAngle() {
  return 360 / wheelPrizes.length;
}

function splitPrizeText(text, maxLength = 14) {
  const words = text.split(" ");
  const lines = [];

  let currentLine = "";

  words.forEach((word) => {
    const testLine = currentLine
      ? `${currentLine} ${word}`
      : word;

    if (testLine.length > maxLength && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.slice(0, 3);
}


/* =====================================================
   DRAW WHEEL BACKGROUND
===================================================== */

function drawWheelBackground() {
  const width = wheelCanvas.clientWidth || WHEEL_SIZE;
  const height = wheelCanvas.clientHeight || WHEEL_SIZE;

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2;

  wheelContext.save();

  wheelContext.beginPath();
  wheelContext.arc(
    centerX,
    centerY,
    radius - 4,
    0,
    Math.PI * 2
  );

  wheelContext.fillStyle = "#10121b";
  wheelContext.fill();

  wheelContext.restore();
}


/* =====================================================
   DRAW SEGMENT
===================================================== */

function drawWheelSegment({
  index,
  startAngle,
  endAngle,
  centerX,
  centerY,
  radius
}) {
  const color = wheelColors[index % wheelColors.length];

  wheelContext.save();

  wheelContext.beginPath();
  wheelContext.moveTo(centerX, centerY);

  wheelContext.arc(
    centerX,
    centerY,
    radius,
    startAngle,
    endAngle
  );

  wheelContext.closePath();

  const gradient = wheelContext.createRadialGradient(
    centerX,
    centerY,
    radius * 0.15,
    centerX,
    centerY,
    radius
  );

  gradient.addColorStop(0, lightenColor(color, 22));
  gradient.addColorStop(0.62, color);
  gradient.addColorStop(1, darkenColor(color, 28));

  wheelContext.fillStyle = gradient;
  wheelContext.fill();

  wheelContext.lineWidth = Math.max(2, radius * 0.012);
  wheelContext.strokeStyle = "rgba(255,255,255,0.42)";
  wheelContext.stroke();

  wheelContext.restore();
}


/* =====================================================
   DRAW SEGMENT TEXT
===================================================== */

function drawSegmentText({
  prize,
  startAngle,
  endAngle,
  centerX,
  centerY,
  radius
}) {
  const middleAngle = (startAngle + endAngle) / 2;

  wheelContext.save();

  wheelContext.translate(centerX, centerY);
  wheelContext.rotate(middleAngle);

  const fontScale = radius / 325;
  const iconSize = Math.max(22, 34 * fontScale);
  const textSize = Math.max(12, 18 * fontScale);

  wheelContext.textAlign = "center";
  wheelContext.textBaseline = "middle";

  wheelContext.shadowColor = "rgba(0,0,0,0.65)";
  wheelContext.shadowBlur = 8;

  wheelContext.fillStyle = "#ffffff";
  wheelContext.font =
    `${iconSize}px "Segoe UI Emoji", sans-serif`;

  wheelContext.fillText(
    prize.icon || "🎁",
    radius * 0.67,
    -22 * fontScale
  );

  const lines = splitPrizeText(prize.name, 13);

  wheelContext.font =
    `700 ${textSize}px Rajdhani, sans-serif`;

  lines.forEach((line, lineIndex) => {
    const lineOffset =
      (lineIndex - (lines.length - 1) / 2) *
      (textSize + 1);

    wheelContext.fillText(
      line,
      radius * 0.67,
      18 * fontScale + lineOffset
    );
  });

  wheelContext.restore();
}


/* =====================================================
   DRAW INNER RINGS
===================================================== */

function drawWheelRings(centerX, centerY, radius) {
  wheelContext.save();

  wheelContext.beginPath();
  wheelContext.arc(
    centerX,
    centerY,
    radius * 0.94,
    0,
    Math.PI * 2
  );

  wheelContext.lineWidth = Math.max(3, radius * 0.018);
  wheelContext.strokeStyle = "rgba(255,255,255,0.25)";
  wheelContext.stroke();

  wheelContext.beginPath();
  wheelContext.arc(
    centerX,
    centerY,
    radius * 0.26,
    0,
    Math.PI * 2
  );

  wheelContext.lineWidth = Math.max(4, radius * 0.022);
  wheelContext.strokeStyle = "rgba(255,255,255,0.4)";
  wheelContext.stroke();

  wheelContext.restore();
}


/* =====================================================
   DRAW COMPLETE WHEEL
===================================================== */

function drawWheel() {
  const width = wheelCanvas.clientWidth || WHEEL_SIZE;
  const height = wheelCanvas.clientHeight || WHEEL_SIZE;

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2;

  wheelContext.clearRect(0, 0, width, height);

  drawWheelBackground();

  wheelContext.save();

  wheelContext.translate(centerX, centerY);
  wheelContext.rotate(degreesToRadians(wheelRotation));
  wheelContext.translate(-centerX, -centerY);

  const segmentAngle = (Math.PI * 2) / wheelPrizes.length;
  const startingOffset = -Math.PI / 2 - segmentAngle / 2;

  wheelPrizes.forEach((prize, index) => {
    const startAngle =
      startingOffset + index * segmentAngle;

    const endAngle =
      startAngle + segmentAngle;

    drawWheelSegment({
      index,
      startAngle,
      endAngle,
      centerX,
      centerY,
      radius
    });

    drawSegmentText({
      prize,
      startAngle,
      endAngle,
      centerX,
      centerY,
      radius
    });
  });

  drawWheelRings(centerX, centerY, radius);

  wheelContext.restore();
}


/* =====================================================
   COLOR HELPERS
===================================================== */

function hexToRgb(hex) {
  const cleanHex = hex.replace("#", "");

  const value =
    cleanHex.length === 3
      ? cleanHex
          .split("")
          .map((char) => char + char)
          .join("")
      : cleanHex;

  const number = parseInt(value, 16);

  return {
    r: (number >> 16) & 255,
    g: (number >> 8) & 255,
    b: number & 255
  };
}

function rgbToHex(red, green, blue) {
  return `#${[red, green, blue]
    .map((value) =>
      Math.max(0, Math.min(255, value))
        .toString(16)
        .padStart(2, "0")
    )
    .join("")}`;
}

function lightenColor(hex, amount) {
  const { r, g, b } = hexToRgb(hex);

  return rgbToHex(
    r + amount,
    g + amount,
    b + amount
  );
}

function darkenColor(hex, amount) {
  const { r, g, b } = hexToRgb(hex);

  return rgbToHex(
    r - amount,
    g - amount,
    b - amount
  );
}


/* =====================================================
   PRIZE MANAGEMENT
===================================================== */

function setWheelPrizes(prizes) {
  if (!Array.isArray(prizes) || prizes.length < 2) {
    console.warn(
      "Daftar hadiah roda minimal harus berisi 2 item."
    );

    return false;
  }

  wheelPrizes = prizes.map((prize) => ({
    name: String(prize.name || "HADIAH"),
    icon: String(prize.icon || "🎁")
  }));

  drawWheel();

  return true;
}

function getWheelPrizes() {
  return [...wheelPrizes];
}

function getPrizeIndexByName(prizeName) {
  const normalizedPrizeName = String(prizeName)
    .trim()
    .toLowerCase();

  return wheelPrizes.findIndex((prize) => {
    return prize.name
      .trim()
      .toLowerCase() === normalizedPrizeName;
  });
}


/* =====================================================
   EASING
===================================================== */

function easeOutQuint(progress) {
  return 1 - Math.pow(1 - progress, 5);
}


/* =====================================================
   CALCULATE TARGET ROTATION
===================================================== */

function calculateTargetRotation(prizeIndex) {
  const segmentAngle = getSegmentAngle();

  const normalizedCurrentRotation =
    normalizeRotation(wheelRotation);

  const targetSegmentCenter =
    prizeIndex * segmentAngle;

  const targetRotationAtPointer =
    normalizeRotation(-targetSegmentCenter);

  const rotationDifference =
    normalizeRotation(
      targetRotationAtPointer -
      normalizedCurrentRotation
    );

  const minimumTurns = 6;
  const maximumTurns = 9;

  const fullTurns =
    Math.floor(
      Math.random() *
        (maximumTurns - minimumTurns + 1)
    ) + minimumTurns;

  const randomOffsetLimit =
    segmentAngle * 0.26;

  const randomOffset =
    (Math.random() * 2 - 1) *
    randomOffsetLimit;

  return (
    wheelRotation +
    fullTurns * 360 +
    rotationDifference +
    randomOffset
  );
}


/* =====================================================
   SPIN WHEEL
===================================================== */

function spinWheelToPrize(
  prizeName,
  options = {}
) {
  return new Promise((resolve, reject) => {
    if (wheelIsSpinning) {
      reject(
        new Error("Roda sedang berputar.")
      );

      return;
    }

    const prizeIndex =
      getPrizeIndexByName(prizeName);

    if (prizeIndex === -1) {
      reject(
        new Error(
          `Hadiah "${prizeName}" tidak ditemukan di roda.`
        )
      );

      return;
    }

    const duration =
      Number(options.duration) || 6500;

    const onUpdate =
      typeof options.onUpdate === "function"
        ? options.onUpdate
        : null;

    const onComplete =
      typeof options.onComplete === "function"
        ? options.onComplete
        : null;

    const startRotation = wheelRotation;

    const targetRotation =
      calculateTargetRotation(prizeIndex);

    const rotationDistance =
      targetRotation - startRotation;

    const startTime = performance.now();

    wheelIsSpinning = true;

    function animateWheel(currentTime) {
      const elapsedTime =
        currentTime - startTime;

      const progress =
        Math.min(elapsedTime / duration, 1);

      const easedProgress =
        easeOutQuint(progress);

      wheelRotation =
        startRotation +
        rotationDistance *
          easedProgress;

      drawWheel();

      if (onUpdate) {
        onUpdate({
          progress,
          easedProgress,
          rotation: wheelRotation
        });
      }

      if (progress < 1) {
        requestAnimationFrame(animateWheel);
        return;
      }

      wheelRotation =
        normalizeRotation(targetRotation);

      drawWheel();

      wheelIsSpinning = false;

      const result = {
        prize: wheelPrizes[prizeIndex],
        prizeIndex,
        rotation: wheelRotation
      };

      if (onComplete) {
        onComplete(result);
      }

      resolve(result);
    }

    requestAnimationFrame(animateWheel);
  });
}


/* =====================================================
   RANDOM SPIN
===================================================== */

function spinWheelRandom(options = {}) {
  const randomIndex = Math.floor(
    Math.random() * wheelPrizes.length
  );

  const selectedPrize =
    wheelPrizes[randomIndex];

  return spinWheelToPrize(
    selectedPrize.name,
    options
  );
}


/* =====================================================
   WHEEL STATE
===================================================== */

function isWheelSpinning() {
  return wheelIsSpinning;
}

function resetWheelRotation() {
  if (wheelIsSpinning) {
    return false;
  }

  wheelRotation = 0;
  drawWheel();

  return true;
}


/* =====================================================
   RESIZE HANDLER
===================================================== */

let wheelResizeTimeout = null;

window.addEventListener("resize", () => {
  clearTimeout(wheelResizeTimeout);

  wheelResizeTimeout = setTimeout(() => {
    setupWheelCanvas();
  }, 150);
});


/* =====================================================
   INITIALIZATION
===================================================== */

function initializeWheel() {
  setupWheelCanvas();
}

initializeWheel();
