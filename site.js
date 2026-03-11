(() => {
  // Keep these values aligned with the native app's URL scheme and store listing.
  const config = {
    domain: "https://nullzair.in",
    appScheme: "campusfind",
    storeUrl: "",
    autoOpenDelayMs: 180,
    fallbackMessageDelayMs: 1600,
    gameRoundMs: 6000
  };

  const pageMode = document.body.dataset.page || "home";
  const homeView = document.getElementById("homeView");
  const deepLinkView = document.getElementById("deepLinkView");
  const canonicalLink = document.getElementById("canonicalLink");
  const descriptionMeta = document.querySelector('meta[name="description"]');
  const linkEyebrow = document.getElementById("linkEyebrow");
  const linkTitle = document.getElementById("linkTitle");
  const linkCopy = document.getElementById("linkCopy");
  const metaLabel = document.getElementById("metaLabel");
  const metaValue = document.getElementById("metaValue");
  const openAppLink = document.getElementById("openAppLink");
  const copyLinkButton = document.getElementById("copyLinkButton");
  const storeLink = document.getElementById("storeLink");
  const backHomeLink = document.getElementById("backHomeLink");
  const linkNote = document.getElementById("linkNote");

  const route = resolveRoute();

  if (route.type === "item") {
    renderItemDeepLink(route.itemId);
  } else if (pageMode === "fallback" && window.location.pathname !== "/") {
    renderNotFound(window.location.pathname);
  } else {
    renderHome();
  }

  function resolveRoute() {
    const normalizedPath = normalizePath(window.location.pathname);
    const itemMatch = normalizedPath.match(/^\/item\/([^/]+)$/);

    if (itemMatch) {
      return {
        type: "item",
        itemId: safeDecode(itemMatch[1])
      };
    }

    return { type: "home" };
  }

  function normalizePath(pathname) {
    if (!pathname || pathname === "/") {
      return "/";
    }

    return pathname.replace(/\/+$/, "");
  }

  function safeDecode(value) {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }

  function renderHome() {
    document.body.dataset.view = "home";
    document.title = "nullzair.in";

    if (descriptionMeta) {
      descriptionMeta.setAttribute("content", "nullzair.in home page and deep-link landing page.");
    }

    if (canonicalLink) {
      canonicalLink.setAttribute("href", config.domain + "/");
    }

    if (homeView) {
      homeView.hidden = false;
    }

    if (deepLinkView) {
      deepLinkView.hidden = true;
    }

    initMathGame();
  }

  function renderItemDeepLink(itemId) {
    const webUrl = buildWebUrl(itemId);
    const appUrl = buildAppUrl(itemId);

    document.body.dataset.view = "link";
    document.title = "Open item " + itemId + " | nullzair.in";

    if (descriptionMeta) {
      descriptionMeta.setAttribute("content", "Open shared item " + itemId + " in the mobile app.");
    }

    if (canonicalLink) {
      canonicalLink.setAttribute("href", webUrl);
    }

    if (homeView) {
      homeView.hidden = true;
    }

    if (deepLinkView) {
      deepLinkView.hidden = false;
    }

    setLinkCard({
      eyebrow: "App link",
      title: "Open item in the mobile app",
      copy: "Trying to open the app now. If nothing happens, use the button below.",
      label: "Item ID",
      value: itemId,
      note: "Share this HTTPS link. Verified app links can open the app directly without showing this page."
    });

    wireActions({
      webUrl,
      appUrl,
      primaryLabel: "Open app",
      openVisible: true
    });

    if (isProbablyMobile()) {
      window.setTimeout(() => {
        attemptAppOpen(appUrl);
        window.setTimeout(() => {
          linkCopy.textContent = "If the app did not open, tap Open app again or install the app first.";
        }, config.fallbackMessageDelayMs);
      }, config.autoOpenDelayMs);
    } else {
      linkCopy.textContent = "This is an app link. Open it on your phone to jump into the app.";
      linkNote.textContent = "Desktop browsers stay on the web page. Mobile devices can use the app link button.";
    }
  }

  function renderNotFound(pathname) {
    document.body.dataset.view = "link";
    document.title = "Not found | nullzair.in";

    if (descriptionMeta) {
      descriptionMeta.setAttribute("content", "This path does not exist on nullzair.in.");
    }

    if (canonicalLink) {
      canonicalLink.setAttribute("href", config.domain + "/");
    }

    if (homeView) {
      homeView.hidden = true;
    }

    if (deepLinkView) {
      deepLinkView.hidden = false;
    }

    setLinkCard({
      eyebrow: "404",
      title: "That page does not exist",
      copy: "The link you opened is not a supported web route on this site.",
      label: "Path",
      value: pathname,
      note: "Supported shared links should look like https://nullzair.in/item/123."
    });

    wireActions({
      webUrl: config.domain + pathname,
      appUrl: config.domain + "/",
      primaryLabel: "Go home",
      openVisible: false
    });
  }

  function setLinkCard(content) {
    linkEyebrow.textContent = content.eyebrow;
    linkTitle.textContent = content.title;
    linkCopy.textContent = content.copy;
    metaLabel.textContent = content.label;
    metaValue.textContent = content.value;
    linkNote.textContent = content.note;
    backHomeLink.href = "/";
  }

  function wireActions(options) {
    openAppLink.textContent = options.primaryLabel;
    openAppLink.href = options.appUrl;
    openAppLink.hidden = !options.openVisible;
    copyLinkButton.dataset.copyValue = options.webUrl;

    if (config.storeUrl) {
      storeLink.hidden = false;
      storeLink.href = config.storeUrl;
    } else {
      storeLink.hidden = true;
      storeLink.removeAttribute("href");
    }
  }

  function buildWebUrl(itemId) {
    return config.domain + "/item/" + encodeURIComponent(itemId);
  }

  function buildAppUrl(itemId) {
    return config.appScheme + "://item/" + encodeURIComponent(itemId);
  }

  function attemptAppOpen(appUrl) {
    window.location.assign(appUrl);
  }

  function isProbablyMobile() {
    const userAgent = navigator.userAgent || "";
    return (
      /Android|iPhone|iPad|iPod/i.test(userAgent) ||
      (navigator.maxTouchPoints > 1 && /Macintosh/i.test(userAgent))
    );
  }

  copyLinkButton.addEventListener("click", async () => {
    const value = copyLinkButton.dataset.copyValue || window.location.href;
    const copied = await copyText(value);

    copyLinkButton.textContent = copied ? "Copied" : "Copy failed";
    window.setTimeout(() => {
      copyLinkButton.textContent = "Copy link";
    }, 1400);
  });

  async function copyText(value) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(value);
        return true;
      } catch {
        return legacyCopy(value);
      }
    }

    return legacyCopy(value);
  }

  function legacyCopy(value) {
    const field = document.createElement("textarea");
    field.value = value;
    field.setAttribute("readonly", "");
    field.style.position = "absolute";
    field.style.left = "-9999px";
    document.body.appendChild(field);
    field.select();

    let copied = false;

    try {
      copied = document.execCommand("copy");
    } catch {
      copied = false;
    }

    document.body.removeChild(field);
    return copied;
  }

  function initMathGame() {
    const toggle = document.getElementById("gameToggle");
    const wrap = document.getElementById("gameWrap");
    const questionEl = document.getElementById("question");
    const optionsEl = document.getElementById("options");
    const scoreEl = document.getElementById("score");
    const streakEl = document.getElementById("streak");
    const feedbackEl = document.getElementById("feedback");
    const timerBar = document.getElementById("timerBar");

    if (!toggle || toggle.dataset.ready === "true") {
      return;
    }

    toggle.dataset.ready = "true";

    let score = 0;
    let streak = 0;
    let answer = 0;
    let timerId = 0;
    let animationId = 0;
    let timerStart = 0;

    const operators = ["+", "-", "x"];

    function rand(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function newRound() {
      const operator = operators[rand(0, operators.length - 1)];
      let left = 0;
      let right = 0;
      let correct = 0;

      if (operator === "+") {
        left = rand(2, 50);
        right = rand(2, 50);
        correct = left + right;
      } else if (operator === "-") {
        left = rand(10, 60);
        right = rand(2, left - 1);
        correct = left - right;
      } else {
        left = rand(2, 12);
        right = rand(2, 12);
        correct = left * right;
      }

      answer = correct;
      questionEl.textContent = left + " " + operator + " " + right + " = ?";

      const choices = new Set([correct]);
      while (choices.size < 4) {
        const offset = rand(1, 10) * (Math.random() < 0.5 ? -1 : 1);
        const fake = correct + offset;
        if (fake > 0) {
          choices.add(fake);
        }
      }

      const shuffled = Array.from(choices).sort(() => Math.random() - 0.5);
      optionsEl.innerHTML = "";

      shuffled.forEach((value) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = String(value);
        button.addEventListener("click", () => pick(value, button));
        optionsEl.appendChild(button);
      });

      feedbackEl.innerHTML = "&nbsp;";
      startTimer();
    }

    function startTimer() {
      clearTimeout(timerId);
      cancelAnimationFrame(animationId);
      timerStart = Date.now();
      timerBar.style.width = "100%";

      function tick() {
        const elapsed = Date.now() - timerStart;
        const remaining = Math.max(0, 1 - elapsed / config.gameRoundMs) * 100;
        timerBar.style.width = remaining + "%";

        if (remaining > 0) {
          animationId = requestAnimationFrame(tick);
        }
      }

      animationId = requestAnimationFrame(tick);

      timerId = window.setTimeout(() => {
        streak = 0;
        streakEl.textContent = String(streak);
        feedbackEl.textContent = "Time is up. It was " + answer + ".";
        disableButtons();
        window.setTimeout(newRound, 1200);
      }, config.gameRoundMs);
    }

    function pick(value, button) {
      clearTimeout(timerId);
      cancelAnimationFrame(animationId);
      disableButtons();

      if (value === answer) {
        button.classList.add("correct");
        streak += 1;
        score += 1 + Math.floor(streak / 3);
        feedbackEl.textContent = streak > 1 ? "Correct. Streak " + streak + "." : "Correct.";
      } else {
        button.classList.add("wrong");
        Array.from(optionsEl.children).forEach((optionButton) => {
          if (Number(optionButton.textContent) === answer) {
            optionButton.classList.add("correct");
          }
        });
        streak = 0;
        feedbackEl.textContent = "Nope. It was " + answer + ".";
      }

      scoreEl.textContent = String(score);
      streakEl.textContent = String(streak);
      window.setTimeout(newRound, 1000);
    }

    function disableButtons() {
      Array.from(optionsEl.children).forEach((button) => {
        button.disabled = true;
      });
    }

    toggle.addEventListener("click", () => {
      const active = wrap.classList.toggle("active");

      if (active) {
        toggle.innerHTML = "&#9632; close game";
        score = 0;
        streak = 0;
        scoreEl.textContent = "0";
        streakEl.textContent = "0";
        newRound();
      } else {
        toggle.innerHTML = "&#9654; quick math";
        clearTimeout(timerId);
        cancelAnimationFrame(animationId);
      }
    });
  }
})();
