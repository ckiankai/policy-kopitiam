// ===== table of contents overlay =====
const tocBtn = document.getElementById("tocBtn");
const tocOverlay = document.getElementById("tocOverlay");
const tocCloseBtn = document.getElementById("tocCloseBtn");

function openTOC() {
  tocOverlay.classList.add("open");
  tocOverlay.setAttribute("aria-hidden", "false");
}

function closeTOC() {
  tocOverlay.classList.remove("open");
  tocOverlay.setAttribute("aria-hidden", "true");
}

// guard so this file works on pages without toc
if (tocBtn && tocOverlay && tocCloseBtn) {
  tocBtn.addEventListener("click", openTOC);
  tocCloseBtn.addEventListener("click", closeTOC);

  tocOverlay.addEventListener("click", (e) => {
    if (e.target === tocOverlay) closeTOC();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeTOC();
  });

  document.querySelectorAll(".toc-link").forEach((link) => {
    link.addEventListener("click", closeTOC);
  });
}

// ===== back to top button =====
const backToTop = document.getElementById("backToTop");

window.addEventListener(
  "scroll",
  () => {
    if (!backToTop) return;
    backToTop.style.display = window.scrollY > 650 ? "inline-block" : "none";
  },
  { passive: true }
);

// ===== glossary tooltip =====
const tooltip = document.getElementById("tooltip");

// short explanations only so it does not feel textbook
const glossary = {
  premium: "Premium: the amount you pay (monthly or yearly) to keep coverage active.",
  deductible: "Deductible: the fixed amount you pay first before insurance starts paying.",
  "co-pay": "Co-pay: the percentage you pay after deductible, insurer pays the rest.",
  rider: "Rider: an add-on that modifies or extends a base policy.",
  exclusion: "Exclusion: situations or conditions the policy does not cover.",
  coverage: "Coverage: what the policy pays for, under what conditions, and up to what limits.",
  "cash-value": "Cash value: the internal value that builds up inside a whole life policy over time. It is not a separate investment account.",
  "surrender-value": "Surrender value: the amount paid if a whole life policy is terminated early, often lower than premiums paid in early years.",
  "guaranteed-value": "Guaranteed value: the minimum benefit contractually promised, assuming premiums are paid as agreed.",
  "non-guaranteed-value": "Non-guaranteed value: benefits that depend on insurer performance and future bonus declarations.",
  "participating-policy": "Participating policy: a policy that may receive bonuses based on the insurer’s participating fund performance.",
  "non-participating-policy": "Non-participating policy: a policy with benefits fully defined at inception, with no bonuses.",
  ci: "Critical Illness: a diagnosis-based trigger for covered conditions.",
  tpd: "Total and Permanent Disability: severe and permanent disability as defined by the policy.",
  death: "Death: Death of the policyholder.",
  lapse: "Lapse: the policy ends because premiums are not paid within required timelines, effects vary by policy.",
  "policy-loan": "Policy Loan: A loan taken against the policy’s cash value. You are borrowing from the insurer, not withdrawing savings.  Interest accrues, and outstanding loans affect benefits if not repaid."
};

function showTooltip(el) {
  if (!tooltip) return;

  const term = el.dataset.term;
  const text = glossary[term];
  if (!text) return;

  tooltip.textContent = text;
  tooltip.style.display = "block";
  tooltip.setAttribute("aria-hidden", "false");

  const rect = el.getBoundingClientRect();
  const padding = 12;

  const left = Math.min(
    Math.max(rect.left, padding),
    window.innerWidth - tooltip.offsetWidth - padding
  );

  const top = Math.min(
    Math.max(rect.bottom + padding, padding),
    window.innerHeight - tooltip.offsetHeight - padding
  );

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

function hideTooltip() {
  if (!tooltip) return;
  tooltip.style.display = "none";
  tooltip.setAttribute("aria-hidden", "true");
}

document.querySelectorAll(".gloss").forEach((el) => {
  el.addEventListener("mouseenter", () => showTooltip(el));
  el.addEventListener("mouseleave", hideTooltip);
  el.addEventListener("click", (e) => {
    e.preventDefault();
    tooltip.style.display === "block" ? hideTooltip() : showTooltip(el);
  });
});

document.addEventListener("click", (e) => {
  if (!e.target.classList.contains("gloss")) hideTooltip();
});

// ===== deductible vs copay simulator =====
const bill = document.getElementById("bill");
const deductible = document.getElementById("deductible");
const copay = document.getElementById("copay");

const billVal = document.getElementById("billVal");
const deductibleVal = document.getElementById("deductibleVal");
const copayVal = document.getElementById("copayVal");

const youPay = document.getElementById("youPay");
const insurerPay = document.getElementById("insurerPay");

function formatSGD(n) {
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
    maximumFractionDigits: 0
  }).format(n);
}

function updateSim() {
  if (![bill, deductible, copay, billVal, deductibleVal, copayVal, youPay, insurerPay].every(Boolean)) {
    return;
  }

  const B = Number(bill.value);
  const D = Number(deductible.value);
  const C = Number(copay.value) / 100;

  const youDeductible = Math.min(D, B);
  const remaining = Math.max(0, B - youDeductible);
  const youCopay = remaining * C;

  const totalYouPay = youDeductible + youCopay;
  const totalInsurerPay = Math.max(0, B - totalYouPay);

  billVal.textContent = formatSGD(B);
  deductibleVal.textContent = formatSGD(D);
  copayVal.textContent = `${Math.round(C * 100)}%`;

  youPay.textContent = formatSGD(Math.round(totalYouPay));
  insurerPay.textContent = formatSGD(Math.round(totalInsurerPay));
}

[bill, deductible, copay].forEach((el) => el && el.addEventListener("input", updateSim));
updateSim();

// ===== scroll reveal by chapter =====
const chapters = document.querySelectorAll(".chapter");

function revealChapter(chapter) {
  const items = chapter.querySelectorAll(".reveal-soft, .reveal-fast");

  items.forEach((el, idx) => {
    const isSoft = el.classList.contains("reveal-soft");
    const baseDelay = isSoft ? 0 : 120;
    const stagger = isSoft ? 120 : 70;

    el.style.transitionDelay = `${baseDelay + idx * stagger}ms`;
    el.classList.add("in");
  });
}

const chapterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        revealChapter(entry.target);
        chapterObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.14,
    rootMargin: "0px 0px -25% 0px"
  }
);

chapters.forEach((ch) => chapterObserver.observe(ch));

// ===== highlight current toc section =====
const sectionIds = [
  "start","what-is","why-matters","need-now","sg-system","protection-vs-money",
  "types","riders","before-buy","after-buy","mistakes","market","glossary","enough","about-links"
];

const sections = sectionIds
  .map((id) => document.getElementById(id))
  .filter(Boolean);

function setActiveTOC(id) {
  document.querySelectorAll(".toc-link").forEach((a) => {
    a.classList.toggle("active", a.dataset.target === id);
  });
}

const sectionObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((e) => e.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (visible && visible.target?.id) {
      setActiveTOC(visible.target.id);
    }
  },
  { threshold: [0.22, 0.35, 0.5, 0.65] }
);

sections.forEach((sec) => sectionObserver.observe(sec));
setActiveTOC("start");

// ===== hero fade handling =====
const hero = document.querySelector(".hero-kopitiam");

if (hero) {
  const io = new IntersectionObserver(
    (entries) => {
      document.body.classList.toggle("hero-off", !entries[0].isIntersecting);
    },
    { threshold: 0.25 }
  );

  io.observe(hero);
}

// ===== hero background soft fade =====
(function () {
  const hero = document.querySelector(".hero-kopitiam");
  const heroBelow = document.querySelector(".hero-below");

  if (!hero || !heroBelow) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        // when the explainer text enters the viewport
        hero.classList.toggle("is-soft", entry.isIntersecting);
      });
    },
    {
      threshold: 0.35
    }
  );

  io.observe(heroBelow);
})();


// ===== products dropdown: hover + click persist =====
(function () {
  const dropdown = document.querySelector(".nav-dropdown");
  const btn = document.querySelector(".nav-dropbtn");

  if (!dropdown || !btn) return;

  function lock() {
    dropdown.classList.add("locked");
    btn.setAttribute("aria-expanded", "true");
  }

  function unlock() {
    dropdown.classList.remove("locked");
    btn.setAttribute("aria-expanded", "false");
  }

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const isLocked = dropdown.classList.contains("locked");
    if (isLocked) unlock();
    else lock();
  });

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) unlock();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") unlock();
  });
})();

// ===== decor, single active decal + continuous drift + tilt =====
(function () {
  const hero = document.querySelector(".hero-kopitiam");
  const layer = document.querySelector(".decor-layer");

  const eggs = document.querySelector(".decor-eggs");
  const coffee = document.querySelector(".decor-coffee");
  const toast = document.querySelector(".decor-toast");
  const milk = document.querySelector(".decor-milk");

  if (!hero || !layer || !eggs || !coffee || !toast || !milk) return;

  const decors = [eggs, coffee, toast, milk];

  function clamp01(x){ return Math.max(0, Math.min(1, x)); }

  function pickActive(t){
    // 4 zones across the full page, not tied to sections
    // tweak cutoffs to taste
    if (t < 0.25) return eggs;
    if (t < 0.50) return coffee;
    if (t < 0.75) return toast;
    return milk;
  }

  function setActive(active){
    decors.forEach(d => d.classList.toggle("is-on", d === active));
  }

function placeAndTilt(el, scrollY){
  const wave = Math.sin(scrollY * 0.003);

  const isEggs = el === eggs;
  const isCoffee = el === coffee;
  const isToast = el === toast;
  const isMilk = el === milk;

  /* --- LEFT / RIGHT ALTERNTION --- */
  let xVW, yVH;

  if (isEggs){
    xVW = -5;   // LEFT
    yVH = 30;
  } else if (isCoffee){
    xVW = 68;    // RIGHT
    yVH = -8;
  } else if (isToast){
    xVW = -10;   // LEFT
    yVH = 45;
  } else if (isMilk){
    xVW = 70;    // RIGHT
    yVH = 32;
  }

  /* --- small lean --- */
  const baseAngle =
    isEggs ? 30 :
    isCoffee ? 11 :
    isToast ? -10 :
    10;

  const tilt = baseAngle + (wave * 2.5); // subtle ±6° max

  el.style.left = `${xVW}vw`;
  el.style.top = `${yVH}vh`;
  el.style.transform = `rotate(${tilt}deg)`;
}



  function update(){
    // only show after hero is fully past
    const heroBottom = hero.getBoundingClientRect().bottom;
    const on = heroBottom <= 0;
    document.body.classList.toggle("hero-off", on);

    if (!on) {
      decors.forEach(d => d.classList.remove("is-on"));
      return;
    }

    const doc = document.documentElement;
    const max = (doc.scrollHeight - window.innerHeight) || 1;
    const t = clamp01(window.scrollY / max);

    const active = pickActive(t);
    setActive(active);

    // keep all decors moving in the background,
    // but only active is visible due to opacity
    decors.forEach(d => placeAndTilt(d, window.scrollY));
  }

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
})();
