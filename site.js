const CONTACT = {
  label: "8 800 600 88 89",
  href: "tel:+78006008889",
};

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
      <a class="header-action header-action-primary" href="${CONTACT.href}">Оставить заявку</a>
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
        <a class="button primary" href="${CONTACT.href}">Оставить заявку</a>
      </div>
    </section>
  `;
}

renderDocument();
