const CONTACT = {
  label: "8 800 600 88 89",
  href: "tel:+78006008889",
};

const REQUEST_EMAIL = "info@maser.ru";

const documents = {
  machines: {
    slug: "stanki.html",
    title: "Станки",
    homeLabel: "Каталог станков",
    navLabel: "Станки",
    description: "Полный каталог станков с ценами.",
    pageCount: 27,
    pdfHref: "./docs/machines.pdf",
    downloadFileName: "kp-stanki.pdf",
    pagePath: "./docs/machines/pages",
    accentClass: "accent-red",
  },
  materials: {
    slug: "rashodnye-materialy.html",
    title: "Расходные материалы",
    homeLabel: "Каталог доп. оборудования",
    navLabel: "Расходные материалы",
    description: "Дополнительное оборудование и расходные позиции.",
    pageCount: 14,
    pdfHref: "./docs/materials.pdf",
    downloadFileName: "kp-rashodnye-materialy.pdf",
    pagePath: "./docs/materials/pages",
    accentClass: "accent-steel",
  },
};

const escapeHtml = (value) =>
  value.replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };

    return entities[char];
  });

function pageImage(doc, index) {
  const page = String(index + 1).padStart(2, "0");
  return `${doc.pagePath}/page-${page}.jpg`;
}

function navHtml(activeKey) {
  return Object.entries(documents)
    .map(([key, doc]) => {
      const current = key === activeKey ? ' aria-current="page"' : "";
      return `<a href="./${doc.slug}"${current}>${escapeHtml(doc.navLabel)}</a>`;
    })
    .join("");
}

function actionBarHtml(doc, extraClass = "", label = "Контакты и PDF") {
  const className = `header-actions${extraClass ? ` ${extraClass}` : ""}`;

  return `
    <div class="${className}" aria-label="${label}">
      <a class="header-action" href="${CONTACT.href}">${CONTACT.label}</a>
      <a class="header-action header-action-primary" href="#request" data-request-open>Оставить заявку</a>
      <a class="header-action" href="${doc.pdfHref}" download="${doc.downloadFileName}">Скачать PDF</a>
    </div>
  `;
}

function renderDocument() {
  const app = document.querySelector("#document-app");

  if (!app) return;

  const key = app.dataset.doc;
  const doc = documents[key];

  if (!doc) return;

  const pages = Array.from({ length: doc.pageCount }, (_, index) => {
    const src = pageImage(doc, index);
    const loading = index === 0 ? "eager" : "lazy";

    return `
      <figure class="document-page">
        <img
          src="${src}"
          width="1587"
          height="2244"
          alt="${escapeHtml(doc.title)}. Страница ${index + 1}"
          loading="${loading}"
          decoding="async"
        />
        <figcaption>${index + 1} / ${doc.pageCount}</figcaption>
      </figure>
    `;
  }).join("");

  app.className = `site-shell document-shell ${doc.accentClass}`;
  app.innerHTML = `
    <header class="site-header document-header">
      <a class="brand-lockup" href="./index.html" aria-label="На главную">
        <span class="brand-mark">M</span>
        <span>
          <strong>МЕХАНИК.РФ</strong>
          <small>${escapeHtml(doc.title)}</small>
        </span>
      </a>

      <nav class="main-nav" aria-label="Каталоги">
        ${navHtml(key)}
      </nav>

      ${actionBarHtml(doc)}
    </header>

    ${actionBarHtml(doc, "sticky-action-bar", "Быстрые действия")}

    <section class="document-hero" aria-labelledby="document-title">
      <div>
        <a class="back-link" href="./index.html">На главную</a>
        <p class="eyebrow">Каталог</p>
        <h1 id="document-title">${escapeHtml(doc.title)}</h1>
        <p>${escapeHtml(doc.description)}</p>
      </div>
    </section>

    <section class="document-viewer" aria-label="PDF: ${escapeHtml(doc.title)}">
      ${pages}
    </section>

    <section class="contacts-band document-contact" id="contacts">
      <div>
        <p class="eyebrow">Заявка</p>
        <h2>Нужна консультация?</h2>
        <p>Позвоните, и мы подготовим предложение по выбранному каталогу.</p>
      </div>
      <div class="contact-actions">
        <a class="contact-phone" href="${CONTACT.href}">${CONTACT.label}</a>
        <a class="button primary" href="#request" data-request-open>Оставить заявку</a>
      </div>
    </section>
  `;
}

function requestModalHtml() {
  return `
    <div class="request-modal" data-request-modal hidden>
      <div class="request-modal-backdrop" data-request-close></div>
      <section class="request-dialog" role="dialog" aria-modal="true" aria-labelledby="request-title">
        <button class="request-close" type="button" data-request-close aria-label="Закрыть форму"></button>
        <p class="eyebrow">Заявка</p>
        <h2 id="request-title">Оставить заявку</h2>
        <form class="request-form" data-request-form>
          <label class="request-field">
            <span>Как вас зовут</span>
            <input name="name" type="text" autocomplete="name" placeholder="Как вас зовут" required />
          </label>

          <label class="request-field request-phone-field">
            <span>Телефон</span>
            <span class="request-phone-prefix" aria-hidden="true">
              <span class="request-flag">🇷🇺</span>
            </span>
            <input
              name="phone"
              type="tel"
              autocomplete="tel"
              inputmode="tel"
              placeholder="+7 (000) 000-00-00"
              required
            />
          </label>

          <label class="request-field">
            <span>Email</span>
            <input name="email" type="email" autocomplete="email" placeholder="Email" />
          </label>

          <input name="page" type="hidden" value="" />
          <button class="request-submit" type="submit">Отправить заявку</button>
          <p class="request-policy">
            Нажимая на кнопку, вы соглашаетесь<br />
            с Политикой обработки данных
          </p>
        </form>
      </section>
    </div>
  `;
}

function injectRequestStyles() {
  if (document.querySelector("#request-modal-styles")) return;

  const style = document.createElement("style");
  style.id = "request-modal-styles";
  style.textContent = `
    .request-modal[hidden]{display:none}.request-modal{position:fixed;inset:0;z-index:100;display:grid;place-items:center;padding:clamp(18px,4vw,48px)}.request-modal-backdrop{position:absolute;inset:0;background:rgba(236,238,242,.72);-webkit-backdrop-filter:blur(18px) saturate(120%);backdrop-filter:blur(18px) saturate(120%)}.request-dialog{position:relative;width:min(920px,100%);max-height:min(92vh,860px);overflow:auto;padding:clamp(28px,5vw,58px);border:1px solid var(--edge);border-radius:clamp(28px,3vw,48px);background:linear-gradient(145deg,rgba(255,255,255,.96),rgba(244,246,249,.88)),var(--surface-strong);box-shadow:0 46px 130px rgba(32,36,42,.24),inset 0 1px 0 rgba(255,255,255,.98),inset -8px -8px 20px rgba(30,34,40,.08)}.request-close{position:absolute;top:22px;right:22px;width:44px;height:44px;border:0;border-radius:50%;background:rgba(255,255,255,.78);box-shadow:0 12px 30px rgba(64,68,76,.12),inset 0 1px 0 rgba(255,255,255,.96);cursor:pointer}.request-close:before,.request-close:after{position:absolute;top:21px;left:12px;width:20px;height:2px;border-radius:999px;background:var(--ink);content:""}.request-close:before{transform:rotate(45deg)}.request-close:after{transform:rotate(-45deg)}.request-dialog h2{margin-bottom:clamp(24px,3vw,42px);font-size:clamp(36px,4.4vw,76px)}.request-form{display:grid;gap:clamp(18px,2.4vw,34px)}.request-field{position:relative;display:block}.request-field>span:not(.request-phone-prefix){position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}.request-field input{width:100%;min-height:clamp(74px,7vw,118px);padding:0 clamp(24px,4vw,42px);border:1px solid rgba(140,145,154,.28);border-radius:clamp(14px,1.4vw,22px);background:rgba(255,255,255,.72);box-shadow:inset 0 1px 2px rgba(37,40,46,.05),inset 0 -1px 0 rgba(255,255,255,.78);color:var(--ink);font:inherit;font-size:clamp(24px,2.7vw,34px);outline:none}.request-field input::placeholder{color:rgba(82,86,94,.62)}.request-field input:focus{border-color:rgba(215,25,42,.5);background:rgba(255,255,255,.92);box-shadow:0 0 0 4px rgba(215,25,42,.08),inset 0 1px 2px rgba(37,40,46,.04)}.request-phone-field input{padding-left:clamp(112px,12vw,150px)}.request-phone-prefix{position:absolute;top:50%;left:clamp(24px,4vw,42px);z-index:1;display:inline-flex;align-items:center;gap:12px;color:rgba(82,86,94,.72);font-size:clamp(24px,2.4vw,32px);transform:translateY(-50%);pointer-events:none}.request-phone-prefix:after{width:0;height:0;border-top:7px solid currentColor;border-right:7px solid transparent;border-left:7px solid transparent;opacity:.7;content:""}.request-submit{min-height:clamp(78px,7vw,118px);margin-top:clamp(8px,1vw,14px);border:0;border-radius:clamp(15px,1.5vw,22px);background:linear-gradient(145deg,#ff3142,var(--accent-dark)),var(--accent);box-shadow:0 22px 48px var(--accent-glow),inset 0 1px 0 rgba(255,255,255,.44);color:white;cursor:pointer;font:inherit;font-size:clamp(24px,2.8vw,34px);font-weight:700;text-transform:uppercase}.request-submit:hover{transform:translateY(-2px);box-shadow:0 28px 56px rgba(215,25,42,.48),inset 0 1px 0 rgba(255,255,255,.48)}.request-policy{margin:clamp(8px,1.5vw,18px) 0 0;color:var(--ink);font-size:clamp(17px,2vw,28px);font-weight:400;line-height:1.45;text-align:center}.request-modal-open{overflow:hidden}
  `;
  document.head.appendChild(style);
}

function formatRuPhone(value) {
  const digits = value.replace(/\D/g, "").replace(/^8/, "7").replace(/^7?/, "7").slice(0, 11);
  const parts = [
    digits.slice(1, 4),
    digits.slice(4, 7),
    digits.slice(7, 9),
    digits.slice(9, 11),
  ];

  let formatted = "+7";

  if (parts[0]) formatted += ` (${parts[0]}`;
  if (parts[0]?.length === 3) formatted += ")";
  if (parts[1]) formatted += ` ${parts[1]}`;
  if (parts[2]) formatted += `-${parts[2]}`;
  if (parts[3]) formatted += `-${parts[3]}`;

  return formatted;
}

function initRequestModal() {
  injectRequestStyles();

  if (!document.querySelector("[data-request-modal]")) {
    document.body.insertAdjacentHTML("beforeend", requestModalHtml());
  }

  const modal = document.querySelector("[data-request-modal]");
  const form = document.querySelector("[data-request-form]");
  const phoneInput = form?.elements.phone;
  const pageInput = form?.elements.page;

  if (!modal || !form || !phoneInput || !pageInput) return;

  const openButtons = document.querySelectorAll("[data-request-open]");
  const closeButtons = modal.querySelectorAll("[data-request-close]");
  const firstInput = form.elements.name;

  const openModal = (event) => {
    event.preventDefault();
    pageInput.value = document.title || "Каталог МЕХАНИК.РФ";
    modal.hidden = false;
    document.body.classList.add("request-modal-open");
    window.requestAnimationFrame(() => firstInput?.focus());
  };

  const closeModal = () => {
    modal.hidden = true;
    document.body.classList.remove("request-modal-open");
  };

  openButtons.forEach((button) => button.addEventListener("click", openModal));
  closeButtons.forEach((button) => button.addEventListener("click", closeModal));

  phoneInput.addEventListener("input", () => {
    phoneInput.value = formatRuPhone(phoneInput.value);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const subject = `Заявка с сайта МЕХАНИК.РФ: ${data.get("page")}`;
    const body = [
      "Новая заявка с сайта МЕХАНИК.РФ",
      "",
      `Имя: ${data.get("name") || ""}`,
      `Телефон: ${data.get("phone") || ""}`,
      `Email: ${data.get("email") || ""}`,
      `Страница: ${data.get("page") || ""}`,
      `Ссылка: ${window.location.href}`,
    ].join("\n");

    window.location.href = `mailto:${REQUEST_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) {
      closeModal();
    }
  });
}

renderDocument();
initRequestModal();
