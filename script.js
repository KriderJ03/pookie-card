const CONFIG = {
  girlfriendName: "Pookie",
  fromName: "your biggest fan",
  quiz: [
    {
      prompt: "What does CSS stand for?",
      answers: ["cascading style sheets", "cascading stylesheet", "cascade style sheets"],
    },
    {
      prompt: "What language makes a web page come alive in the browser?",
      answers: ["javascript", "java script", "js"],
    },
    {
      prompt: "For huge inputs, which usually grows slower: O(log n) or O(n)?",
      answers: ["o(log n)", "log n", "ologn", "log"],
    },
  ],
  captcha: {
    correctTiles: [1, 4, 7],
    photos: [
      "compiler",
      "pink-heart",
      "keyboard",
      "coffee",
      "logic-heart",
      "desk",
      "sunset",
      "binary-heart",
      "notebook",
    ],
  },
  twoFactor: {
    mode: "demo", // Change to "emailjs" after adding the values below.
    toEmail: "her-email@example.com",
    publicKey: "",
    serviceId: "",
    templateId: "",
  },
};

const stages = [...document.querySelectorAll(".stage")];
const cardTrigger = document.querySelector("#cardTrigger");
const loginForm = document.querySelector("#loginForm");
const loginPanel = document.querySelector(".login-panel");
const loginStatus = document.querySelector("#loginStatus");
const doorSystem = document.querySelector("#doorSystem");

const questionText = document.querySelector("#questionText");
const questionCount = document.querySelector("#questionCount");
const questionForm = document.querySelector("#questionForm");
const answerInput = document.querySelector("#answerInput");
const questionStatus = document.querySelector("#questionStatus");

const captchaGrid = document.querySelector("#captchaGrid");
const captchaCount = document.querySelector("#captchaCount");
const captchaSubmit = document.querySelector("#captchaSubmit");
const captchaStatus = document.querySelector("#captchaStatus");

const twoFactorMessage = document.querySelector("#twoFactorMessage");
const twoFactorForm = document.querySelector("#twoFactorForm");
const twoFactorStatus = document.querySelector("#twoFactorStatus");
const codeInput = document.querySelector("#codeInput");
const resendCode = document.querySelector("#resendCode");
const soundToggle = document.querySelector("#soundToggle");
const signatureLine = document.querySelector("#signatureLine");

let questionIndex = 0;
let selectedCaptchaTiles = new Set();
let twoFactorCode = "";
let audio = null;

signatureLine.textContent = `- ${CONFIG.fromName}`;

function setStage(name) {
  stages.forEach((stage) => {
    stage.classList.toggle("is-active", stage.dataset.stage === name);
  });
}

function setStatus(element, message, kind = "") {
  element.textContent = message;
  element.classList.toggle("is-error", kind === "error");
  element.classList.toggle("is-success", kind === "success");
}

function normalize(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\w\s()]/g, "")
    .replace(/\s+/g, " ");
}

cardTrigger.addEventListener("click", () => {
  setStage("auth");
  window.setTimeout(() => document.querySelector("#passwordInput").focus(), 380);
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  loginPanel.classList.remove("is-rejected");
  void loginPanel.offsetWidth;
  loginPanel.classList.add("is-rejected");
  setStatus(loginStatus, "Password rejected. Deploying backup protocol.", "error");
  doorSystem.classList.add("is-closed");

  window.setTimeout(() => {
    setStage("quiz");
    renderQuestion();
  }, 1350);
});

function renderQuestion() {
  const question = CONFIG.quiz[questionIndex];
  questionText.textContent = question.prompt;
  questionCount.textContent = `${questionIndex + 1} / ${CONFIG.quiz.length}`;
  answerInput.value = "";
  setStatus(questionStatus, "");
  window.setTimeout(() => answerInput.focus(), 120);
}

questionForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const question = CONFIG.quiz[questionIndex];
  const guess = normalize(answerInput.value);
  const correct = question.answers.map(normalize).includes(guess);

  if (!correct) {
    setStatus(questionStatus, "Not quite. Try that one again.", "error");
    answerInput.select();
    return;
  }

  setStatus(questionStatus, "Accepted.", "success");
  questionIndex += 1;

  if (questionIndex < CONFIG.quiz.length) {
    window.setTimeout(renderQuestion, 520);
  } else {
    window.setTimeout(() => {
      renderCaptcha();
      setStage("captcha");
    }, 640);
  }
});

function renderCaptcha() {
  selectedCaptchaTiles = new Set();
  captchaGrid.innerHTML = "";
  setStatus(captchaStatus, "");
  updateCaptchaCount();

  CONFIG.captcha.photos.forEach((seed, index) => {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "captcha-tile";
    tile.dataset.index = String(index);
    tile.setAttribute("aria-label", `Captcha photo ${index + 1}`);

    const image = document.createElement("img");
    image.src = `https://picsum.photos/seed/pookie-${seed}/480/480`;
    image.alt = "";
    image.loading = "eager";

    tile.appendChild(image);

    if (CONFIG.captcha.correctTiles.includes(index)) {
      const marker = document.createElement("span");
      marker.className = "heart-mark";
      marker.setAttribute("aria-hidden", "true");
      tile.appendChild(marker);
    }

    tile.addEventListener("click", () => toggleCaptchaTile(index, tile));
    captchaGrid.appendChild(tile);
  });
}

function toggleCaptchaTile(index, tile) {
  if (selectedCaptchaTiles.has(index)) {
    selectedCaptchaTiles.delete(index);
  } else {
    selectedCaptchaTiles.add(index);
  }

  tile.classList.toggle("is-selected", selectedCaptchaTiles.has(index));
  updateCaptchaCount();
}

function updateCaptchaCount() {
  const count = selectedCaptchaTiles.size;
  captchaCount.textContent = `${count} selected`;
}

captchaSubmit.addEventListener("click", () => {
  const expected = [...CONFIG.captcha.correctTiles].sort().join(",");
  const actual = [...selectedCaptchaTiles].sort().join(",");

  if (actual !== expected) {
    setStatus(captchaStatus, "The robots remain suspicious.", "error");
    return;
  }

  setStatus(captchaStatus, "Human-ish status confirmed.", "success");
  window.setTimeout(async () => {
    setStage("two-factor");
    await issueTwoFactorCode();
  }, 580);
});

function makeCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function issueTwoFactorCode() {
  twoFactorCode = makeCode();
  codeInput.value = "";
  setStatus(twoFactorStatus, "");
  twoFactorMessage.textContent = `Sending a code to ${CONFIG.twoFactor.toEmail}...`;

  const delivered = await sendTwoFactorCode(twoFactorCode);
  if (delivered) {
    twoFactorMessage.textContent = `A code was sent to ${CONFIG.twoFactor.toEmail}.`;
  } else {
    twoFactorMessage.textContent = `Demo mode code: ${twoFactorCode}`;
  }

  window.setTimeout(() => codeInput.focus(), 160);
}

async function sendTwoFactorCode(code) {
  const settings = CONFIG.twoFactor;
  const isConfigured =
    settings.mode === "emailjs" &&
    settings.publicKey &&
    settings.serviceId &&
    settings.templateId &&
    settings.toEmail &&
    window.emailjs;

  if (!isConfigured) {
    return false;
  }

  try {
    window.emailjs.init({ publicKey: settings.publicKey });
    await window.emailjs.send(settings.serviceId, settings.templateId, {
      to_email: settings.toEmail,
      code,
      passcode: code,
      girlfriend_name: CONFIG.girlfriendName,
      from_name: CONFIG.fromName,
    });
    return true;
  } catch (error) {
    console.warn("EmailJS send failed", error);
    return false;
  }
}

resendCode.addEventListener("click", () => {
  void issueTwoFactorCode();
});

twoFactorForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (codeInput.value.trim() !== twoFactorCode) {
    setStatus(twoFactorStatus, "That code did not open the vault.", "error");
    codeInput.select();
    return;
  }

  setStatus(twoFactorStatus, "Access granted.", "success");
  window.setTimeout(() => {
    setStage("final");
    startMusic();
  }, 520);
});

function startMusic() {
  if (audio) {
    audio.setMuted(false);
    return;
  }

  audio = createMusicEngine();
  audio.start();
}

function createMusicEngine() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) {
    return {
      start() {},
      setMuted() {},
      isMuted: false,
    };
  }

  const context = new AudioContext();
  const master = context.createGain();
  master.gain.value = 0.055;
  master.connect(context.destination);

  const notes = [
    392, 494, 587, 494, 440, 523, 659, 523,
    392, 494, 587, 784, 659, 587, 523, 494,
  ];
  let step = 0;
  let timer = null;
  let muted = false;

  function playNote(frequency) {
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = step % 4 === 0 ? "triangle" : "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

    oscillator.connect(gain);
    gain.connect(master);
    oscillator.start(now);
    oscillator.stop(now + 0.32);
  }

  function tick() {
    playNote(notes[step % notes.length]);
    step += 1;
  }

  return {
    isMuted: muted,
    start() {
      context.resume();
      tick();
      timer = window.setInterval(tick, 360);
    },
    setMuted(value) {
      muted = value;
      master.gain.value = muted ? 0 : 0.055;
      this.isMuted = muted;
      if (!timer && !muted) {
        this.start();
      }
    },
  };
}

soundToggle.addEventListener("click", () => {
  if (!audio) {
    return;
  }

  audio.setMuted(!audio.isMuted);
  soundToggle.textContent = audio.isMuted ? "Play music" : "Mute music";
});
