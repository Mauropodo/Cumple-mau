const scene = document.querySelector("#scene");
const cardArea = document.querySelector("#card-area");
const card = document.querySelector("#card-wrap");
const turnToggle = document.querySelector("#card-turn-toggle");
const cardFlip = document.querySelector("#card-flip");
const zoomBackdrop = document.querySelector("#zoom-backdrop");
const storyText = document.querySelector("#story-text");
const ritualSigil = document.querySelector("#ritual-sigil");
const invitation = document.querySelector("#invitation");
const ritualPrompt = document.querySelector("#ritual-prompt");
const ritualToggle = document.querySelector("#ritual-accept-toggle");
const skipToInvitation = document.querySelector("#skip-to-invitation");
const baseCard = document.querySelector(".card-image");
const dragon = document.querySelector("#card-dragon");
const fire = document.querySelector("#fire-sweep");
const particles = document.querySelector("#particles");
const fireTongues = document.querySelector("#fire-tongues");
const fireEmbers = document.querySelector("#fire-embers");
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const backdropAspect = 1104 / 736;
let revealTimeline;
let isTransitioning = false;
let isAccepted = false;
let sigilTransitionStarted = false;
let invitationShown = false;
const ambientTweens = [];

// Algunos navegadores restauran la casilla al recargar y activan el estado rojo antes del clic.
const resetRitualToggle = () => {
  if (isAccepted) return;
  ritualToggle.checked = false;
  ritualToggle.disabled = false;
};
resetRitualToggle();
window.addEventListener("pageshow", resetRitualToggle);

const stopAmbientAnimation = () => {
  ambientTweens.forEach((tween) => tween.kill());
  ambientTweens.length = 0;
};

// El salto se ofrece a partir de la segunda apertura de este sitio en el navegador.
try {
  const visitKey = "cum-ritual-has-opened";
  if (window.localStorage.getItem(visitKey)) {
    document.body.classList.add("has-visited-before");
  } else {
    window.localStorage.setItem(visitKey, "1");
  }
} catch {
  // Si el navegador bloquea el almacenamiento local, se conserva el recorrido completo.
}

// Posiciones reproducibles para que el ambiente no cambie bruscamente al recargar.
let seed = 27;
const random = () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

for (let i = 0; i < 42; i += 1) {
  const dot = document.createElement("span");
  dot.className = "particle";
  dot.style.left = `${3 + random() * 94}%`;
  dot.style.top = `${4 + random() * 90}%`;
  dot.style.setProperty("--size", `${1 + random() * 2.2}px`);
  dot.style.setProperty("--opacity", `${0.12 + random() * 0.52}`);
  particles.append(dot);
}

for (let i = 0; i < 13; i += 1) {
  const tongue = document.createElement("span");
  tongue.className = "fire-tongue";
  tongue.style.setProperty("--left", `${4 + i * 7.4}%`);
  tongue.style.setProperty("--width", `${15 + random() * 10}%`);
  tongue.style.setProperty("--height", `${44 + random() * 44}%`);
  tongue.style.setProperty("--base-offset", `${Math.round((random() - .5) * 12)}px`);
  tongue.style.setProperty("--speed", `${.3 + random() * .4}s`);
  fireTongues.append(tongue);
}

for (let i = 0; i < 20; i += 1) {
  const ember = document.createElement("span");
  ember.className = "fire-ember";
  ember.style.setProperty("--left", `${12 + random() * 76}%`);
  ember.style.setProperty("--bottom", `${15 + random() * 28}%`);
  ember.style.setProperty("--size", `${1 + random() * 2.5}px`);
  ember.style.setProperty("--drift", `${-20 + random() * 40}px`);
  ember.style.setProperty("--speed", `${.65 + random() * .8}s`);
  ember.style.setProperty("--delay", `${-random() * 1.5}s`);
  fireEmbers.append(ember);
}

const finishReveal = () => {
  dragon.style.clipPath = "none";
  baseCard.alt = "Carta antigua de pergamino con un dragón bajo un sol radiante y un marco ornamental oscuro";
};

const showInvitation = () => {
  if (invitationShown) return;
  invitationShown = true;
  storyText.style.visibility = "hidden";
  storyText.style.opacity = "0";
  invitation.scrollTop = 0;
  invitation.classList.add("is-visible");
  if (!window.gsap || motionPreference.matches) return;

  gsap.fromTo(invitation.querySelectorAll("[data-reveal]"),
    { autoAlpha: 0, y: 18 },
    {
      autoAlpha: 1,
      y: 0,
      duration: .8,
      stagger: .11,
      ease: "power2.out",
      clearProps: "transform,visibility,opacity"
    });
};

const goDirectlyToInvitation = (event) => {
  event?.preventDefault();
  if (isTransitioning || invitationShown) return;

  isTransitioning = true;
  isAccepted = true;
  sigilTransitionStarted = true;
  turnToggle.disabled = true;
  ritualToggle.disabled = true;
  cardArea.style.pointerEvents = "none";
  storyText.style.pointerEvents = "none";
  if (revealTimeline) revealTimeline.kill();
  if (window.gsap) {
    stopAmbientAnimation();
    gsap.killTweensOf(card);
  }

  scene.classList.add("is-immersed");
  document.body.classList.add("is-skipped");
  ritualSigil.classList.add("is-active", "is-background", "is-red");

  if (window.gsap) {
    const outer = ritualSigil.querySelector(".ritual-sigil__outer");
    const inner = ritualSigil.querySelector(".ritual-sigil__inner");
    gsap.set(ritualSigil.querySelectorAll(".ritual-sigil__layer"), { autoAlpha: 1, scale: 1, rotation: 0 });
    if (!motionPreference.matches) {
      gsap.to(outer, { rotation: "+=360", duration: 16.2, repeat: -1, ease: "none" });
      gsap.to(inner, { rotation: "-=360", duration: 16.2, repeat: -1, ease: "none" });
    }
  } else {
    ritualSigil.classList.add("is-skip-final");
  }

  showInvitation();
};

skipToInvitation.addEventListener("click", goDirectlyToInvitation);

const startSigilTransition = () => {
  if (sigilTransitionStarted) return;
  sigilTransitionStarted = true;
  storyText.style.visibility = "hidden";
  storyText.style.opacity = "0";
  ritualSigil.classList.add("is-active");

  const outer = ritualSigil.querySelector(".ritual-sigil__outer");
  const inner = ritualSigil.querySelector(".ritual-sigil__inner");
  const art = ritualSigil.querySelector(".ritual-sigil__art");
  const redFilter = getComputedStyle(art).getPropertyValue("--sigil-red-filter").trim();
  let slowSpinStarted = false;
  const startSlowSpin = () => {
    if (slowSpinStarted || !window.gsap || motionPreference.matches) return;
    slowSpinStarted = true;
    gsap.to(outer, { rotation: "+=360", duration: 5.4, repeat: -1, ease: "none" });
    gsap.to(inner, { rotation: "-=360", duration: 5.4, repeat: -1, ease: "none" });
  };

  let verySlowSpinStarted = false;
  const startVerySlowSpin = () => {
    if (verySlowSpinStarted || !window.gsap || motionPreference.matches) return;
    verySlowSpinStarted = true;
    gsap.killTweensOf(outer, "rotation");
    gsap.killTweensOf(inner, "rotation");
    gsap.to(outer, { rotation: "+=360", duration: 16.2, repeat: -1, ease: "none" });
    gsap.to(inner, { rotation: "-=360", duration: 16.2, repeat: -1, ease: "none" });
  };

  let sigilFinished = false;
  const finishSigilTransition = () => {
    if (sigilFinished) return;
    sigilFinished = true;
    startVerySlowSpin();
    ritualSigil.classList.add("is-background");
    ritualSigil.classList.add("is-red");
    if (window.gsap) {
      gsap.set(ritualSigil, { opacity: .2 });
      gsap.set(art, { filter: redFilter });
    }
    showInvitation();
  };

  if (!window.gsap || motionPreference.matches) {
    if (!window.gsap && !motionPreference.matches) {
      window.setTimeout(() => ritualSigil.classList.add("is-background"), 4300);
      window.setTimeout(() => ritualSigil.classList.add("is-red"), 5050);
      window.setTimeout(finishSigilTransition, 6050);
    } else {
      finishSigilTransition();
    }
    return;
  }

  const lines = ritualSigil.querySelector(".ritual-sigil__lines");
  const triangle = ritualSigil.querySelector(".ritual-sigil__triangle");

  const sigilTimeline = gsap.timeline({ onComplete: finishSigilTransition })
    .fromTo(lines,
      { autoAlpha: 0, scale: .88 },
      { autoAlpha: 1, scale: 1, duration: .75, ease: "power2.out" })
    .fromTo(outer,
      { autoAlpha: 0, rotation: -95, scale: .94 },
      { autoAlpha: 1, rotation: 0, scale: 1, duration: .9, ease: "power2.out" }, ">-.08")
    .fromTo(triangle,
      { autoAlpha: 0, scale: .88 },
      { autoAlpha: 1, scale: 1, duration: .85, ease: "power2.out" }, ">-.36")
    .fromTo(inner,
      { autoAlpha: 0, rotation: 120, scale: .88 },
      { autoAlpha: 1, rotation: 0, scale: 1, duration: .85, ease: "power2.out" }, ">-.42")
    .to(outer, { rotation: 360, duration: 1.8, ease: "power2.inOut" }, ">-.05")
    .to(inner, { rotation: -360, duration: 1.8, ease: "power2.inOut" }, "<")
    .to(ritualSigil, {
      opacity: .2,
      duration: .75,
      ease: "power2.inOut",
      onStart: startSlowSpin
    })
    .to(art, {
      filter: redFilter,
      duration: .9,
      ease: "power1.inOut",
      onStart: startVerySlowSpin
    });

  window.setTimeout(finishSigilTransition, Math.ceil(sigilTimeline.duration() * 1000) + 250);
};

const showStory = () => {
  if (!window.gsap || motionPreference.matches) {
    storyText.classList.add("is-visible");
    ritualPrompt.classList.add("is-visible");
    return;
  }

  const letters = [];
  const segmenter = typeof Intl.Segmenter === "function"
    ? new Intl.Segmenter("es", { granularity: "grapheme" })
    : null;

  storyText.querySelectorAll("p").forEach((paragraph) => {
    const walker = document.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    textNodes.forEach((node) => {
      const fragment = document.createDocumentFragment();
      const characters = segmenter
        ? Array.from(segmenter.segment(node.textContent), (part) => part.segment)
        : Array.from(node.textContent);

      characters.forEach((character) => {
        if (/\s/.test(character)) {
          fragment.append(document.createTextNode(character));
          return;
        }
        const span = document.createElement("span");
        span.className = "story-letter";
        span.textContent = character;
        fragment.append(span);
        letters.push(span);
      });
      node.replaceWith(fragment);
    });
  });

  const fontReady = document.fonts?.load('40px "Jim Nightshade"') || Promise.resolve();
  Promise.race([
    Promise.resolve(fontReady).catch(() => {}),
    new Promise((resolve) => window.setTimeout(resolve, 1500))
  ]).then(() => {
    storyText.classList.add("is-visible");
    gsap.to(letters, {
      opacity: 1,
      duration: .7,
      stagger: .009,
      ease: "power1.out",
      onComplete: () => gsap.to(ritualPrompt, {
        autoAlpha: 1,
        y: 0,
        duration: .8,
        ease: "power2.out"
      })
    });
  });
};

const finishImmersion = () => {
  scene.classList.add("is-immersed");
  turnToggle.disabled = true;
  if (window.gsap) {
    zoomBackdrop.style.visibility = "visible";
  }
  showStory();
};

const zoomIntoBack = () => {
  const bounds = card.getBoundingClientRect();
  gsap.set(zoomBackdrop, {
    left: bounds.left,
    top: bounds.top,
    width: bounds.width,
    height: bounds.height,
    borderRadius: 8,
    autoAlpha: 1
  });
  card.style.visibility = "hidden";
  gsap.to(zoomBackdrop, {
    left: 0,
    top: 0,
    width: () => window.innerWidth,
    height: () => Math.max(window.innerHeight, window.innerWidth * backdropAspect),
    borderRadius: 0,
    boxShadow: "0 0 0 rgba(0, 0, 0, 0)",
    duration: 1.45,
    ease: "power3.inOut",
    onComplete: finishImmersion
  });
};

window.addEventListener("resize", () => {
  if (!scene.classList.contains("is-immersed") || !window.gsap) return;
  gsap.set(zoomBackdrop, {
    width: window.innerWidth,
    height: Math.max(window.innerHeight, window.innerWidth * backdropAspect)
  });
});

const turnCard = () => {
  if (isTransitioning) return;
  isTransitioning = true;
  scene.classList.add("is-turning");
  turnToggle.disabled = true;
  cardArea.style.pointerEvents = "none";

  if (revealTimeline) revealTimeline.kill();
  finishReveal();

  if (!window.gsap) {
    finishImmersion();
    return;
  }

  stopAmbientAnimation();
  gsap.killTweensOf(card);
  gsap.set(fire, { autoAlpha: 0 });
  gsap.timeline({ onComplete: zoomIntoBack })
    .to(card, {
      x: 0, y: 0, rotationX: 0, rotationY: 0, scale: 1,
      duration: .4, ease: "power2.out", overwrite: true
    }, 0)
    .to(cardFlip, { rotationY: 180, duration: 1.05, ease: "power2.inOut" }, .12)
    .to(document.querySelectorAll(".card-area__orbit, .card-aura, .card-shadow, .instruction"), {
      autoAlpha: 0, duration: .55, ease: "power2.out"
    }, .45)
    .to(document.querySelectorAll(".particles, .scene__grain, .scene__glow"), {
      autoAlpha: 0, duration: .75, ease: "power2.out"
    }, .7);
};

document.addEventListener("pointerdown", (event) => {
  if (!window.gsap || event.button !== 0 || isTransitioning) return;
  if (event.target.closest("#skip-to-invitation")) return;
  const bounds = card.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom) return;
  event.preventDefault();
  turnToggle.checked = true;
  turnCard();
}, true);

ritualToggle.addEventListener("change", () => {
  if (!ritualToggle.checked || isAccepted) return;
  isAccepted = true;
  ritualToggle.disabled = true;
  storyText.style.pointerEvents = "none";

  if (!window.gsap) {
    window.setTimeout(startSigilTransition, 1650);
    return;
  }
  if (motionPreference.matches) {
    gsap.set(storyText, { autoAlpha: 0 });
    startSigilTransition();
    return;
  }

  const acceptanceTimeline = gsap.timeline({ onComplete: startSigilTransition })
    .to(storyText.querySelectorAll(".story-letter"), {
      color: "#a52d2b",
      duration: .4,
      stagger: .0015,
      ease: "sine.inOut"
    })
    .to(storyText, {
      autoAlpha: 0,
      duration: .65,
      ease: "power2.inOut"
    }, ">+.12");

  // Respaldo nativo si el callback de la línea de tiempo se interrumpe.
  window.setTimeout(startSigilTransition, Math.ceil(acceptanceTimeline.duration() * 1000) + 250);
});

if (window.gsap) {
  document.body.classList.add("gsap-ready");
  turnToggle.addEventListener("change", () => {
    if (turnToggle.checked) turnCard();
  });
  const mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    revealTimeline = gsap.timeline({ delay: 1, onComplete: finishReveal });
    revealTimeline
      .set(fire, { autoAlpha: 1 }, 0)
      .fromTo(dragon,
        { clipPath: "inset(0 0 75% 0)" },
        { clipPath: "inset(0 0 21% 0)", duration: 2.4, ease: "power1.inOut" },
        0)
      .fromTo(fire,
        { y: 0 },
        { y: () => card.offsetHeight * .54, duration: 2.4, ease: "power1.inOut" },
        0)
      .to(fire, { autoAlpha: 0, duration: .45, ease: "power2.out" }, 2.15);

    gsap.from(".card-wrap", { y: 34, rotation: -3, scale: .94, duration: 1.5, delay: .18, ease: "power3.out" });
    ambientTweens.push(gsap.to(".card-aura", { scale: 1.13, autoAlpha: .75, duration: 4.5, repeat: -1, yoyo: true, ease: "sine.inOut" }));
    ambientTweens.push(gsap.to(".card-area__orbit--one", { rotation: 338, duration: 90, repeat: -1, ease: "none" }));
    ambientTweens.push(gsap.to(".card-area__orbit--two", { rotation: -328, duration: 120, repeat: -1, ease: "none" }));

    document.querySelectorAll(".particle").forEach((dot, index) => {
      ambientTweens.push(gsap.to(dot, {
        y: -12 - random() * 24,
        x: -8 + random() * 16,
        autoAlpha: .08 + random() * .45,
        duration: 3 + random() * 5,
        delay: index * .055,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      }));
    });
  });

  mm.add("(prefers-reduced-motion: reduce)", () => {
    const timer = window.setTimeout(finishReveal, 1000);
    return () => window.clearTimeout(timer);
  });

  {
    const tiltX = gsap.quickTo(card, "rotationX", { duration: .6, ease: "power2.out" });
    const tiltY = gsap.quickTo(card, "rotationY", { duration: .6, ease: "power2.out" });
    const approach = gsap.quickTo(card, "scale", { duration: .7, ease: "power2.out" });

    const onMove = (event) => {
      if (isTransitioning || (event.pointerType && event.pointerType !== "mouse")) return;
      const bounds = cardArea.getBoundingClientRect();
      const dx = event.clientX - (bounds.left + bounds.width / 2);
      const dy = event.clientY - (bounds.top + bounds.height / 2);
      const radius = Math.max(card.offsetWidth, card.offsetHeight) * 1.05;
      const proximity = gsap.utils.clamp(0, 1, 1 - Math.hypot(dx, dy) / radius);
      const x = gsap.utils.clamp(-1, 1, dx / (card.offsetWidth * .8));
      const y = gsap.utils.clamp(-1, 1, dy / (card.offsetHeight * .8));
      tiltX(-y * 7 * proximity);
      tiltY(x * 7 * proximity);
      approach(1 + proximity * .05);
    };

    const onLeave = () => {
      if (isTransitioning) return;
      tiltX(0);
      tiltY(0);
      approach(1);
    };

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
  }

} else {
  window.setTimeout(finishReveal, 1000);
}

document.body.classList.add("js-ready");
if (window.location?.hash === "#invitation") {
  goDirectlyToInvitation();
  // El salto sirve para llegar desde otras páginas; no debe persistir al recargar.
  window.history.replaceState(null, "", window.location.href.split("#")[0]);
}
