const CONFIG = {
  girlfriendName: "Pookie",
  fromName: "your biggest fan",
  login: {
    username: "POOKI3",
    password: "03-08-83",
  },
  recovery: {
    twoFactorCode: "MYB4BYY",
    questions: [
      {
        prompt: "Where was our first date?",
        type: "choice",
        options: ["San Francisco", "Napa", "Berkeley"],
        answer: "C",
      },
      {
        prompt: "What is the square root of 344,847,294,169?",
        type: "text",
        answer: "587237",
      },
      {
        prompt: "What are Knives' pronouns?",
        type: "choice",
        impossible: true,
        options: [
          "She/Her",
          "They/Them",
          "Alyssa/Alyssa (no pronouns, just name all the time)",
        ],
      },
    ],
    captchaCorrectCells: ["B2", "B4", "D3", "D4"],
  },
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
    mode: "emailjs",
    toEmail: "her-email@example.com",
    publicKey: "wsWuYon37VHRG4dW6",
    serviceId: "service_pgposny",
    templateId: "template_q4wexjn",
  },
};

const stages = [...document.querySelectorAll(".stage")];
const coverStage = document.querySelector(".stage-cover");
const envelopeScene = document.querySelector("#envelopeScene");
const flipEnvelope = document.querySelector("#flipEnvelope");
const heartButton = document.querySelector("#heartButton");
const loginForm = document.querySelector("#loginForm");
const loginPanel = document.querySelector(".login-panel");
const loginStatus = document.querySelector("#loginStatus");
const usernameInput = document.querySelector("#usernameInput");
const passwordInput = document.querySelector("#passwordInput");
const doorSystem = document.querySelector("#doorSystem");
const retryLogin = document.querySelector("#retryLogin");
const recoveryPanel = document.querySelector("#recoveryPanel");
const recoveryContent = document.querySelector("#recoveryContent");
const extraTapeLayer = document.querySelector("#extraTapeLayer");

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
const finalCardFrame = document.querySelector("#finalCardFrame");
const finalSlideshow = document.querySelector("#finalSlideshow");
const finalSlideshowTrack = document.querySelector("#finalSlideshowTrack");
const FINAL_CARD_FRAMES = Array.from(
  { length: 13 },
  (_, index) =>
    `assets/handdrawn/final-card-open-${String(index + 1).padStart(2, "0")}.png?v=final-3`,
);
const FINAL_FRAME_INTERVAL_MS = 190;
const FINAL_SLIDESHOW_PHOTO_COUNT = 88;
const FINAL_SLIDESHOW_PHOTOS = Array.from(
  { length: FINAL_SLIDESHOW_PHOTO_COUNT },
  (_, index) =>
    `assets/final-slideshow/slide-${String(index + 1).padStart(3, "0")}.jpg?v=slideshow-1`,
);
const CARD_TRACK_SRC = "assets/audio/how-much-longer.mp3?v=audio-1";
const LOGIN_INTERRUPT_SOUND_SRC = "assets/audio/windows-default.wav?v=audio-1";
const DOOR_SLIDE_SOUND_SRC = "assets/audio/sliding-metal-door-sfx.mp3?v=audio-2";
const INCORRECT_SOUND_SRC = "assets/audio/incorrect-boop-bass.wav?v=audio-4";
const CLICK_SOUND_SRC = "assets/audio/mouse-click.wav?v=audio-4";
const TAPE_ROLL_SOUND_SRCS = [
  "assets/audio/packing-tape-roll-a.mp3?v=audio-3",
  "assets/audio/packing-tape-roll-b.mp3?v=audio-3",
];
const INITIAL_TAPE_SOUND_VOLUME = 0.36;
const EXTRA_TAPE_SOUND_VOLUME = 0.11;
const EXTRA_TAPE_ENTITY_LIMIT = 100;

let questionIndex = 0;
let selectedCaptchaTiles = new Set();
let twoFactorCode = "";
let audio = null;
let loginInterruptSound = null;
let doorSlideSound = null;
let incorrectSound = null;
let clickSound = null;
let tapeTimer = null;
let extraTapeTimer = null;
let tapeSoundIndex = 0;
let tapeSoundTimers = [];
let lastTapeExitSide = "";
let recoveryQuestionIndex = 0;
let impossibleRecoveryGuesses = new Set();
let selectedRecoveryCaptchaCells = new Set();
let recoveryCaptchaMissed = false;
let recoveryCaptchaNextAction = "questions";
let recoveryStatusTimer = null;
let recoveryStatusFadeTimer = null;
let finalFrameTimer = null;
let cardUnlockedAfterRecovery = false;

if (signatureLine) {
  signatureLine.textContent = `- ${CONFIG.fromName}`;
}
usernameInput.value = CONFIG.login.username;
FINAL_CARD_FRAMES.forEach((src) => {
  const image = new Image();
  image.src = src;
});
renderFinalSlideshow();

function setStage(name) {
  if (name !== "final") {
    stopFinalAnimation();
    hideFinalSlideshow();
  }

  stages.forEach((stage) => {
    stage.classList.toggle("is-active", stage.dataset.stage === name);
  });

  window.setTimeout(syncCardTrack, 0);
}

function setStatus(element, message, kind = "") {
  element.textContent = message;
  element.classList.toggle("is-error", kind === "error");
  element.classList.toggle("is-success", kind === "success");
}

function setRecoveryCardMode(mode = "") {
  recoveryContent.className = mode ? `recovery-card ${mode}` : "recovery-card";
}

function showRecoveryIncorrect(status, target) {
  window.clearTimeout(recoveryStatusTimer);
  window.clearTimeout(recoveryStatusFadeTimer);
  playIncorrectSound();
  setStatus(status, "Incorrect answer", "error");
  status.classList.remove("is-fading-away");

  if (target) {
    target.classList.remove("is-answer-wrong");
    void target.offsetWidth;
    target.classList.add("is-answer-wrong");
    window.setTimeout(() => {
      target.classList.remove("is-answer-wrong");
    }, 520);
  }

  recoveryStatusTimer = window.setTimeout(() => {
    if (status.textContent === "Incorrect answer") {
      status.classList.add("is-fading-away");
      recoveryStatusFadeTimer = window.setTimeout(() => {
        if (status.textContent === "Incorrect answer") {
          setStatus(status, "");
          status.classList.remove("is-fading-away");
        }
      }, 1050);
    }
  }, 4000);
}

function normalize(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\w\s()]/g, "")
    .replace(/\s+/g, " ");
}

flipEnvelope.addEventListener("click", () => {
  envelopeScene.classList.add("is-flipped");
});

heartButton.addEventListener("pointerenter", () => {
  envelopeScene.classList.add("is-heart-hovered");
});

heartButton.addEventListener("pointerleave", () => {
  envelopeScene.classList.remove("is-heart-hovered");
});

heartButton.addEventListener("focus", () => {
  envelopeScene.classList.add("is-heart-hovered");
});

heartButton.addEventListener("blur", () => {
  envelopeScene.classList.remove("is-heart-hovered");
});

heartButton.addEventListener("click", () => {
  if (cardUnlockedAfterRecovery) {
    envelopeScene.classList.add("is-login-open");
    window.setTimeout(enterFinalCard, 260);
    return;
  }

  stopMusic();
  playLoginInterruptSound();
  envelopeScene.classList.add("is-login-open");
  coverStage.classList.add("is-auth-open");
  usernameInput.value = CONFIG.login.username;
  passwordInput.value = "";
  setStatus(loginStatus, "");
  window.setTimeout(() => passwordInput.focus(), 160);
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const usernameMatches =
    usernameInput.value.trim().toUpperCase() === CONFIG.login.username;
  const passwordMatches = passwordInput.value === CONFIG.login.password;

  if (usernameMatches && passwordMatches) {
    setStatus(loginStatus, "credentials accepted", "success");
    window.setTimeout(enterFinalCard, 720);
    return;
  }

  triggerLockdown();
});

function triggerLockdown() {
  cardUnlockedAfterRecovery = false;
  stopMusic();
  window.clearTimeout(tapeTimer);
  clearTapeSoundTimers();
  stopExtraTapePasses();
  clearExtraTapes();
  recoveryPanel.hidden = true;
  loginPanel.classList.remove("is-rejected");
  doorSystem.classList.remove("is-closed", "is-taped", "is-recovering");
  void loginPanel.offsetWidth;
  void doorSystem.offsetWidth;
  loginPanel.classList.add("is-rejected");
  playIncorrectSound();
  setStatus(loginStatus, "incorrect password", "error");
  retryLogin.hidden = false;
  doorSystem.classList.add("is-closed");
  playDoorSlideSound();
  scheduleInitialTapeSounds();
  tapeTimer = window.setTimeout(() => {
    if (doorSystem.classList.contains("is-closed")) {
      doorSystem.classList.add("is-taped");
    }
  }, 2850);
}

retryLogin.addEventListener("click", () => {
  startRecoveryFlow();
});

function startRecoveryFlow() {
  window.clearTimeout(tapeTimer);
  doorSystem.classList.add("is-closed", "is-taped", "is-recovering");
  loginPanel.classList.remove("is-rejected");
  retryLogin.hidden = true;
  recoveryQuestionIndex = 0;
  impossibleRecoveryGuesses = new Set();
  selectedRecoveryCaptchaCells = new Set();
  recoveryCaptchaMissed = false;
  recoveryCaptchaNextAction = "questions";
  recoveryPanel.hidden = false;
  renderRecoveryHumanPrompt();
  startExtraTapePasses();
}

function renderRecoveryHumanPrompt() {
  window.clearTimeout(recoveryStatusTimer);
  window.clearTimeout(recoveryStatusFadeTimer);
  setRecoveryCardMode("recovery-human-card");
  recoveryContent.innerHTML = `
    <p class="panel-kicker">Password recovery</p>
    <h2>Please verify that you are human</h2>
    <div class="recaptcha-row">
      <button class="recaptcha-check" id="recoveryHumanCheck" type="button" aria-label="I'm not a robot">
        <span class="recaptcha-box" aria-hidden="true"></span>
        <span class="recaptcha-label">I'm not a robot</span>
        <span class="recaptcha-brand" aria-hidden="true">reCAPTCHA</span>
      </button>
    </div>
  `;

  recoveryContent
    .querySelector("#recoveryHumanCheck")
    .addEventListener("click", () => {
      const button = recoveryContent.querySelector("#recoveryHumanCheck");
      button.classList.add("is-checked");
      window.setTimeout(renderRecoveryCaptcha, 260);
    });
}

function renderRecoveryQuestion() {
  window.clearTimeout(recoveryStatusTimer);
  window.clearTimeout(recoveryStatusFadeTimer);
  setRecoveryCardMode();
  const question = CONFIG.recovery.questions[recoveryQuestionIndex];
  const count = `${recoveryQuestionIndex + 1} / ${CONFIG.recovery.questions.length}`;
  const inputMarkup =
    question.type === "text"
      ? `<input id="recoveryTextAnswer" name="answer" type="text" inputmode="numeric" autocomplete="off" />`
      : renderRecoveryChoices(question.options);

  recoveryContent.innerHTML = `
    <p class="panel-kicker">password recovery</p>
    <h2>${question.prompt}</h2>
    <form class="recovery-form" id="recoveryQuestionForm" autocomplete="off">
      <div class="checkpoint-header">
        <span>security question</span>
        <span>${count}</span>
      </div>
      ${inputMarkup}
      <div class="recovery-actions">
        <button class="primary-btn" type="submit">Submit</button>
      </div>
      <p class="status-line" id="recoveryStatus"></p>
    </form>
  `;

  const form = recoveryContent.querySelector("#recoveryQuestionForm");
  form.addEventListener("submit", handleRecoveryQuestionSubmit);

  const textAnswer = recoveryContent.querySelector("#recoveryTextAnswer");
  if (textAnswer) {
    window.setTimeout(() => textAnswer.focus(), 120);
  }
}

function renderRecoveryChoices(options) {
  const letters = ["A", "B", "C"];
  return `
    <div class="recovery-options">
      ${options
        .map(
          (option, index) => `
            <label class="recovery-option">
              <input type="radio" name="answer" value="${letters[index]}" />
              <span>${letters[index]}. ${option}</span>
            </label>
          `,
        )
        .join("")}
    </div>
  `;
}

function handleRecoveryQuestionSubmit(event) {
  event.preventDefault();
  const question = CONFIG.recovery.questions[recoveryQuestionIndex];
  const status = recoveryContent.querySelector("#recoveryStatus");

  if (question.impossible) {
    const answer = recoveryContent.querySelector("input[name='answer']:checked");
    if (!answer) {
      playIncorrectSound();
      setStatus(status, "Pick the least suspicious option.", "error");
      return;
    }

    impossibleRecoveryGuesses.add(answer.value);
    showRecoveryIncorrect(status, answer.closest(".recovery-option"));
    if (impossibleRecoveryGuesses.size < question.options.length) {
      answer.checked = false;
      return;
    }

    window.setTimeout(renderRecoveryFailurePrompt, 1000);
    return;
  }

  const submitted =
    question.type === "text"
      ? recoveryContent.querySelector("#recoveryTextAnswer").value.trim()
      : recoveryContent.querySelector("input[name='answer']:checked")?.value;

  if (!submitted) {
    playIncorrectSound();
    setStatus(status, "The door is waiting for an answer.", "error");
    return;
  }

  const correct =
    question.type === "text"
      ? submitted === question.answer
      : submitted === question.answer;

  if (!correct) {
    const textAnswer = recoveryContent.querySelector("#recoveryTextAnswer");
    const selectedOption = recoveryContent.querySelector("input[name='answer']:checked");
    const wrongTarget =
      question.type === "text" ? textAnswer : selectedOption?.closest(".recovery-option");
    showRecoveryIncorrect(status, wrongTarget);
    if (textAnswer) {
      textAnswer.select();
    }
    return;
  }

  setStatus(status, "Accepted.", "success");
  recoveryQuestionIndex += 1;
  window.setTimeout(renderRecoveryQuestion, 560);
}

function renderRecoveryFailurePrompt() {
  window.clearTimeout(recoveryStatusTimer);
  window.clearTimeout(recoveryStatusFadeTimer);
  setRecoveryCardMode("recovery-failure-card");
  recoveryContent.innerHTML = `
    <p class="panel-kicker">Password recovery</p>
    <h2>Recovery questions failed</h2>
    <p class="soft-copy recovery-failure-reason">Reason: too many attempts</p>
    <div class="recovery-actions">
      <button class="primary-btn" id="tryRecoveryEmail" type="button">Try Recovery Email</button>
    </div>
  `;

  recoveryContent
    .querySelector("#tryRecoveryEmail")
    .addEventListener("click", renderRecoveryEmailPrompt);
}

function renderRecoveryEmailPrompt() {
  window.clearTimeout(recoveryStatusTimer);
  window.clearTimeout(recoveryStatusFadeTimer);
  setRecoveryCardMode();
  recoveryContent.innerHTML = `
    <p class="panel-kicker">Password recovery</p>
    <h2>Enter the recovery email associated with your account</h2>
    <form class="recovery-form" id="recoveryEmailForm" autocomplete="off">
      <label class="paint-field">
        <span>email</span>
        <input id="recoveryEmailInput" name="email" type="email" autocomplete="email" placeholder="name@example.com" required />
      </label>
      <div class="recovery-actions">
        <button class="primary-btn" type="submit">Send code</button>
      </div>
      <p class="status-line" id="recoveryStatus"></p>
    </form>
  `;

  const form = recoveryContent.querySelector("#recoveryEmailForm");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = recoveryContent.querySelector("#recoveryStatus");
    const submitButton = form.querySelector("button[type='submit']");
    const email = recoveryContent.querySelector("#recoveryEmailInput").value.trim();
    if (!email) {
      setStatus(status, "Email required.", "error");
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Sending...";
    setStatus(status, "");
    const configured = canSendEmail(email);
    const delivered = await sendTwoFactorCode(CONFIG.recovery.twoFactorCode, email, {
      subject: "Recover your account",
      body: `Your one-time passcode is ${CONFIG.recovery.twoFactorCode}`,
    });

    if (configured && !delivered) {
      submitButton.disabled = false;
      submitButton.textContent = "Send code";
      setStatus(status, "Email failed to send. Check the EmailJS setup.", "error");
      return;
    }

    if (!delivered) {
      submitButton.disabled = false;
      submitButton.textContent = "Send code";
      setStatus(status, "Email service is not configured.", "error");
      return;
    }

    window.setTimeout(renderRecoveryCodePrompt, 720);
  });

  window.setTimeout(() => recoveryContent.querySelector("#recoveryEmailInput").focus(), 120);
}

function renderRecoveryCodePrompt() {
  window.clearTimeout(recoveryStatusTimer);
  window.clearTimeout(recoveryStatusFadeTimer);
  setRecoveryCardMode();
  recoveryContent.innerHTML = `
    <p class="panel-kicker">Password recovery</p>
    <h2>A recovery code was sent to your inbox</h2>
    <form class="recovery-form" id="recoveryCodeForm" autocomplete="off">
      <label class="paint-field">
        <span>code</span>
        <input id="recoveryCodeInput" name="code" type="text" maxlength="7" autocapitalize="characters" autocomplete="one-time-code" placeholder="enter code" />
      </label>
      <div class="recovery-actions">
        <button class="primary-btn" type="submit">Verify</button>
      </div>
      <p class="status-line" id="recoveryStatus"></p>
    </form>
  `;

  const form = recoveryContent.querySelector("#recoveryCodeForm");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const guess = recoveryContent
      .querySelector("#recoveryCodeInput")
      .value.trim()
      .toUpperCase();

    if (guess !== CONFIG.recovery.twoFactorCode) {
      playIncorrectSound();
      setStatus(recoveryContent.querySelector("#recoveryStatus"), "That code did not unlock recovery.", "error");
      recoveryContent.querySelector("#recoveryCodeInput").select();
      return;
    }

    setStatus(recoveryContent.querySelector("#recoveryStatus"), "Code accepted.", "success");
    window.setTimeout(renderRecoveryPasswordSuccess, 560);
  });

  window.setTimeout(() => recoveryContent.querySelector("#recoveryCodeInput").focus(), 120);
}

function renderRecoveryPasswordSuccess() {
  setRecoveryCardMode("recovery-success-card");
  recoveryContent.innerHTML = `
    <div class="recovery-complete recovery-password-success">
      <h2>Success!</h2>
      <p class="password-reveal">Your password was &quot;${CONFIG.login.password}&quot; &lt;3</p>
      <div class="recovery-actions">
        <button class="primary-btn" id="continueToCard" type="button">Continue</button>
      </div>
    </div>
  `;

  recoveryContent
    .querySelector("#continueToCard")
    .addEventListener("click", returnToCard);
}

function renderRecoveryCaptcha() {
  selectedRecoveryCaptchaCells = new Set();
  recoveryCaptchaMissed = false;
  const cells = makeCaptchaCells();

  setRecoveryCardMode("has-captcha-dialog");
  recoveryContent.innerHTML = `
    <div class="recovery-captcha-dialog" role="dialog" aria-labelledby="recoveryCaptchaTitle">
      <div class="recovery-captcha-prompt">
        <span>Select all squares with</span>
        <strong id="recoveryCaptchaTitle">cutie patooties</strong>
        <span>If there are none, click skip</span>
      </div>
    <div class="recovery-captcha-board">
      <img
        class="recovery-captcha-art"
        src="assets/handdrawn/captcha-cutie-grid-only.png"
        alt="A road photo split into sixteen cells"
      />
      <div class="recovery-captcha-hotspots" id="recoveryCaptchaGrid">
        ${cells
          .map(
            (cell) => `
              <button
                class="recovery-captcha-cell"
                type="button"
                data-cell="${cell}"
                aria-label="Cell ${cell}"
              ></button>
            `,
          )
          .join("")}
      </div>
    </div>
      <div class="recovery-captcha-footer">
        <div class="recovery-captcha-tools" aria-hidden="true">
          <button type="button" tabindex="-1">&#8635;</button>
          <button type="button" tabindex="-1">&#9835;</button>
          <button type="button" tabindex="-1">i</button>
        </div>
        <p class="status-line recovery-captcha-status" id="recoveryStatus">0 selected</p>
        <button class="captcha-verify-btn" id="recoveryCaptchaSubmit" type="button">VERIFY</button>
      </div>
    </div>
  `;

  recoveryContent.querySelectorAll(".recovery-captcha-cell").forEach((cell) => {
    cell.addEventListener("click", () => toggleRecoveryCaptchaCell(cell));
  });

  recoveryContent
    .querySelector("#recoveryCaptchaSubmit")
    .addEventListener("click", handleRecoveryCaptchaSubmit);
}

function makeCaptchaCells() {
  const columns = ["A", "B", "C", "D"];
  const cells = [];
  for (let row = 1; row <= 4; row += 1) {
    columns.forEach((column) => cells.push(`${column}${row}`));
  }
  return cells;
}

function toggleRecoveryCaptchaCell(cell) {
  const name = cell.dataset.cell;
  if (selectedRecoveryCaptchaCells.has(name)) {
    selectedRecoveryCaptchaCells.delete(name);
  } else {
    selectedRecoveryCaptchaCells.add(name);
  }

  cell.classList.toggle("is-selected", selectedRecoveryCaptchaCells.has(name));
  cell.classList.remove("is-wrong");
  const status = recoveryContent.querySelector("#recoveryStatus");
  setStatus(status, `${selectedRecoveryCaptchaCells.size} selected`);
}

function handleRecoveryCaptchaSubmit() {
  const expected = CONFIG.recovery.captchaCorrectCells.slice().sort().join(",");
  const actual = [...selectedRecoveryCaptchaCells].sort().join(",");
  const status = recoveryContent.querySelector("#recoveryStatus");

  if (actual !== expected) {
    recoveryCaptchaMissed = true;
    playIncorrectSound();
    setStatus(status, "Not quite. The selected squares flashed red.", "error");
    recoveryContent.querySelectorAll(".recovery-captcha-cell.is-selected").forEach((cell) => {
      cell.classList.remove("is-wrong");
      void cell.offsetWidth;
      cell.classList.add("is-wrong");
    });
    return;
  }

  setStatus(status, "Verified.", "success");
  if (recoveryCaptchaNextAction === "questions") {
    window.setTimeout(renderRecoveryQuestion, 560);
    return;
  }

  stopExtraTapePasses();
  window.setTimeout(returnToCard, 560);
}

function returnToCard() {
  stopExtraTapePasses();
  clearTapeSoundTimers();
  clearExtraTapes();
  recoveryPanel.hidden = true;
  setRecoveryCardMode();
  recoveryContent.innerHTML = "";
  setStage("cover");
  coverStage.classList.remove("is-auth-open");
  envelopeScene.classList.remove("is-flipped", "is-heart-hovered", "is-login-open");
  loginPanel.classList.remove("is-rejected");
  setStatus(loginStatus, "");
  passwordInput.value = "";
  retryLogin.hidden = true;
  cardUnlockedAfterRecovery = true;
  if (doorSystem.classList.contains("is-closed")) {
    playDoorSlideSound();
  }
  doorSystem.classList.remove("is-closed", "is-taped", "is-recovering");
  syncCardTrack();
}

function enterFinalCard() {
  cardUnlockedAfterRecovery = false;
  window.clearTimeout(tapeTimer);
  clearTapeSoundTimers();
  stopExtraTapePasses();
  clearExtraTapes();
  hideFinalSlideshow();
  recoveryPanel.hidden = true;
  setRecoveryCardMode();
  recoveryContent.innerHTML = "";
  coverStage.classList.remove("is-auth-open");
  envelopeScene.classList.remove("is-heart-hovered", "is-login-open");
  loginPanel.classList.remove("is-rejected");
  doorSystem.classList.remove("is-closed", "is-taped", "is-recovering");
  retryLogin.hidden = true;
  passwordInput.value = "";
  setStatus(loginStatus, "");
  setStage("final");
  playFinalCardAnimation();
}

function playFinalCardAnimation() {
  if (!finalCardFrame) {
    return;
  }

  stopFinalAnimation();
  let frameIndex = 0;
  finalCardFrame.src = FINAL_CARD_FRAMES[frameIndex];
  finalCardFrame.classList.remove("is-static");

  finalFrameTimer = window.setInterval(() => {
    frameIndex += 1;
    if (frameIndex >= FINAL_CARD_FRAMES.length) {
      stopFinalAnimation();
      finalCardFrame.src = FINAL_CARD_FRAMES[FINAL_CARD_FRAMES.length - 1];
      finalCardFrame.classList.add("is-static");
      revealFinalSlideshow();
      return;
    }

    finalCardFrame.src = FINAL_CARD_FRAMES[frameIndex];
  }, FINAL_FRAME_INTERVAL_MS);
}

function stopFinalAnimation() {
  window.clearInterval(finalFrameTimer);
  finalFrameTimer = null;
}

function renderFinalSlideshow() {
  if (!finalSlideshowTrack || !FINAL_SLIDESHOW_PHOTOS.length) {
    return;
  }

  const fragment = document.createDocumentFragment();
  const photoLoop = [...FINAL_SLIDESHOW_PHOTOS, ...FINAL_SLIDESHOW_PHOTOS];

  photoLoop.forEach((src, index) => {
    const tile = document.createElement("figure");
    const image = document.createElement("img");

    tile.className = "final-slide-tile";
    image.src = src;
    image.alt = "";
    image.decoding = "async";
    image.loading = index < 16 ? "eager" : "lazy";

    tile.appendChild(image);
    fragment.appendChild(tile);
  });

  finalSlideshowTrack.replaceChildren(fragment);
}

function revealFinalSlideshow() {
  if (!finalSlideshow || !finalSlideshowTrack || !FINAL_SLIDESHOW_PHOTOS.length) {
    return;
  }

  finalSlideshow.classList.add("is-visible");
  finalSlideshowTrack.classList.add("is-drifting");
}

function hideFinalSlideshow() {
  if (!finalSlideshow || !finalSlideshowTrack) {
    return;
  }

  finalSlideshow.classList.remove("is-visible");
  finalSlideshowTrack.classList.remove("is-drifting");
}

function startExtraTapePasses() {
  stopExtraTapePasses();
  lastTapeExitSide = "";
  scheduleExtraTapePass(0);
}

function stopExtraTapePasses() {
  window.clearTimeout(extraTapeTimer);
  extraTapeTimer = null;
}

function scheduleExtraTapePass(delay) {
  extraTapeTimer = window.setTimeout(() => {
    if (!doorSystem.classList.contains("is-recovering")) {
      return;
    }

    createExtraTapePass();
    scheduleExtraTapePass(6400);
  }, delay);
}

function createExtraTapePass() {
  const path = makeTapePath();
  const dx = path.end.x - path.start.x;
  const dy = path.end.y - path.start.y;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  const length = Math.hypot(dx, dy);
  const upsideDown = Math.random() < 0.5;
  const track = document.createElement("div");
  const line = document.createElement("span");
  const roll = document.createElement("img");

  track.className = "extra-tape-track";
  line.className = "extra-tape-line";
  roll.className = "extra-tape-roll";
  roll.src = "assets/handdrawn/security-tape-roll-v2.png";
  roll.alt = "";

  track.style.setProperty("--start-x", `${path.start.x}px`);
  track.style.setProperty("--start-y", `${path.start.y}px`);
  track.style.setProperty("--path-angle", `${angle}deg`);
  track.style.setProperty("--path-length", `${length}px`);
  track.style.setProperty("--tape-flip", upsideDown ? "-1" : "1");
  track.style.setProperty("--roll-turns", `${upsideDown ? -720 : 720}deg`);

  track.append(line, roll);
  extraTapeLayer.appendChild(track);
  lastTapeExitSide = path.endSide;

  window.requestAnimationFrame(() => {
    track.classList.add("is-running");
    playTapeRollSound("extra");
  });

  window.setTimeout(() => {
    roll.style.opacity = "0";
  }, 1500);

  window.setTimeout(() => {
    while (extraTapeLayer.children.length > EXTRA_TAPE_ENTITY_LIMIT) {
      extraTapeLayer.firstElementChild?.remove();
    }
  }, 1700);
}

function scheduleInitialTapeSounds() {
  clearTapeSoundTimers();
  [850, 1550].forEach((delay) => {
    const timer = window.setTimeout(() => {
      if (doorSystem.classList.contains("is-closed")) {
        playTapeRollSound("initial");
      }
    }, delay);
    tapeSoundTimers.push(timer);
  });
}

function clearTapeSoundTimers() {
  tapeSoundTimers.forEach((timer) => window.clearTimeout(timer));
  tapeSoundTimers = [];
}

function makeTapePath() {
  const sides = ["top", "right", "bottom", "left"];
  const forbiddenStart = oppositeSide(lastTapeExitSide);
  const startOptions = forbiddenStart
    ? sides.filter((side) => side !== forbiddenStart)
    : sides;
  const startSide = randomItem(startOptions);
  const endSide = randomItem(sides.filter((side) => side !== startSide));

  return {
    start: pointOutsideSide(startSide),
    end: pointOutsideSide(endSide),
    startSide,
    endSide,
  };
}

function pointOutsideSide(side) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const xOvershoot = width / 3;
  const yOvershoot = height / 3;
  const crossX = randomBetween(-width * 0.12, width * 1.12);
  const crossY = randomBetween(-height * 0.12, height * 1.12);

  if (side === "top") {
    return { x: crossX, y: -yOvershoot };
  }
  if (side === "right") {
    return { x: width + xOvershoot, y: crossY };
  }
  if (side === "bottom") {
    return { x: crossX, y: height + yOvershoot };
  }
  return { x: -xOvershoot, y: crossY };
}

function oppositeSide(side) {
  if (side === "top") return "bottom";
  if (side === "right") return "left";
  if (side === "bottom") return "top";
  if (side === "left") return "right";
  return "";
}

function clearExtraTapes() {
  extraTapeLayer.innerHTML = "";
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return entities[character];
  });
}

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
    playIncorrectSound();
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
    playIncorrectSound();
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

function canSendEmail(toEmail = CONFIG.twoFactor.toEmail) {
  const settings = CONFIG.twoFactor;
  return Boolean(
    settings.mode === "emailjs" &&
      settings.publicKey &&
      settings.serviceId &&
      settings.templateId &&
      toEmail &&
      window.emailjs,
  );
}

async function sendTwoFactorCode(
  code,
  toEmail = CONFIG.twoFactor.toEmail,
  options = {},
) {
  const settings = CONFIG.twoFactor;
  const subject = options.subject || "Your Pookie Card code";
  const body = options.body || `Your one-time passcode is ${code}`;

  if (!canSendEmail(toEmail)) {
    return false;
  }

  try {
    window.emailjs.init({ publicKey: settings.publicKey });
    await window.emailjs.send(settings.serviceId, settings.templateId, {
      to_email: toEmail,
      subject,
      body,
      message: body,
      code,
      passcode: code,
      recovery_code: code,
      one_time_passcode: code,
      password: CONFIG.login.password,
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
    playIncorrectSound();
    setStatus(twoFactorStatus, "That code did not open the vault.", "error");
    codeInput.select();
    return;
  }

  setStatus(twoFactorStatus, "Access granted.", "success");
  window.setTimeout(enterFinalCard, 520);
});

function startMusic() {
  const track = getCardTrackAudio();
  if (track.isMuted || !isCardOnScreenForMusic() || !track.paused) {
    return;
  }

  track.currentTime = 0;
  void track.play().catch(() => {
    track.pause();
    track.currentTime = 0;
  });
}

function stopMusic() {
  if (!audio) {
    return;
  }

  audio.pause();
  audio.currentTime = 0;
}

function syncCardTrack() {
  if (isCardOnScreenForMusic()) {
    startMusic();
    return;
  }

  stopMusic();
}

function isCardOnScreenForMusic() {
  const activeStage = document.querySelector(".stage.is-active")?.dataset.stage;
  if (activeStage === "final") {
    return true;
  }

  return (
    activeStage === "cover" &&
    !coverStage.classList.contains("is-auth-open") &&
    !doorSystem.classList.contains("is-closed") &&
    recoveryPanel.hidden
  );
}

function getCardTrackAudio() {
  if (!audio) {
    audio = new Audio(CARD_TRACK_SRC);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0.52;
    audio.isMuted = false;
    audio.setMuted = (value) => {
      audio.isMuted = value;
      audio.muted = value;
      syncCardTrack();
    };
  }

  return audio;
}

function getLoginInterruptSound() {
  if (!loginInterruptSound) {
    loginInterruptSound = new Audio(LOGIN_INTERRUPT_SOUND_SRC);
    loginInterruptSound.preload = "auto";
    loginInterruptSound.volume = 0.84;
  }

  return loginInterruptSound;
}

function getDoorSlideSound() {
  if (!doorSlideSound) {
    doorSlideSound = new Audio(DOOR_SLIDE_SOUND_SRC);
    doorSlideSound.preload = "auto";
    doorSlideSound.volume = 0.88;
  }

  return doorSlideSound;
}

function getIncorrectSound() {
  if (!incorrectSound) {
    incorrectSound = new Audio(INCORRECT_SOUND_SRC);
    incorrectSound.preload = "auto";
    incorrectSound.volume = 0.76;
  }

  return incorrectSound;
}

function getClickSound() {
  if (!clickSound) {
    clickSound = new Audio(CLICK_SOUND_SRC);
    clickSound.preload = "auto";
    clickSound.volume = 0.2;
  }

  return clickSound;
}

function playOneShot(sound) {
  sound.pause();
  sound.currentTime = 0;
  void sound.play().catch(() => {});
}

function playLoginInterruptSound() {
  playOneShot(getLoginInterruptSound());
}

function playDoorSlideSound() {
  playOneShot(getDoorSlideSound());
}

function playIncorrectSound() {
  playOneShot(getIncorrectSound());
}

function playClickSound() {
  playOneShot(getClickSound());
}

function playTapeRollSound(kind = "extra") {
  const src = TAPE_ROLL_SOUND_SRCS[tapeSoundIndex % TAPE_ROLL_SOUND_SRCS.length];
  tapeSoundIndex += 1;

  const sound = new Audio(src);
  sound.preload = "auto";
  sound.volume =
    kind === "initial" ? INITIAL_TAPE_SOUND_VOLUME : EXTRA_TAPE_SOUND_VOLUME;
  void sound.play().catch(() => {});
}

if (soundToggle) {
  soundToggle.addEventListener("click", () => {
    const track = getCardTrackAudio();
    track.setMuted(!track.isMuted);
    soundToggle.textContent = track.isMuted ? "Play music" : "Mute music";
  });
}

window.addEventListener("click", () => {
  window.setTimeout(syncCardTrack, 0);
});

window.addEventListener(
  "mousedown",
  (event) => {
    if (event.button === 0) {
      playClickSound();
    }
  },
  { capture: true },
);

window.addEventListener("keydown", () => {
  window.setTimeout(syncCardTrack, 0);
});

syncCardTrack();
