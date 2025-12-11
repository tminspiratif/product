class GenerateElement {
  // 1. Deklarasi properti instance (Opsional di JS modern, tapi baik untuk kejelasan)
  chapterContent;

  /**
   * Konstruktor: Menerima elemen DOM induk.
   * @param {HTMLElement} element Elemen DOM tempat konten akan disuntikkan.
   */
  constructor(element) {
    this.chapterContent = element;
  }

  getElement() {
    return this.chapterContent;
  }

  static createContentElement(elements, toElement) {
    elements.forEach((element) => {
      switch (element.type) {
        case "video":
          toElement.createVideo(element);
          break;
        case "rich-text":
          toElement.createRichText(element);
          break;
        case "note":
        case "info":
        case "warning":
        case "tips":
          toElement.createAlert(element);
          break;
        case "grid-row":
          toElement.createGridRow(element);
          break;
        case "paragraph":
          toElement.createParagraph(element);
          break;
        case "heading":
          toElement.createHeading(element);
          break;
        case "subheading":
          toElement.createSubheading(element);
          break;
        case "code-block":
          toElement.createCodeBlock(element);
        case "spacer":
          toElement.createSpacer(element);
          break;
        case "bullet-list":
          toElement.createBulletList(element);
          break;
        case "numbered-list":
          toElement.createNumberedList(element);
          break;
        case "steps":
          toElement.createSteps(element);
          break;
        case "general-table":
          toElement.createGeneralTable(element);
          break;
        case "parameter-table":
          toElement.createParameterTable(element);
          break;
        case "image":
          toElement.createImage(element);
          break;
        case "link":
          toElement.createLink(element);
          break;
        default:
          break;
      }
    });
  }

  static createSectionLevel(elements, startNode) {
    let level = 1;
    function generate(el, i, startNode) {
      let newnode = (startNode ? startNode : "") + "-" + (i + 1);
      if (newnode.startsWith("-")) {
        newnode = newnode.substring(1);
      }
      el.sectionId = newnode;
      el.level = el.type === "heading" ? 1 : el.type === "subheading" ? 2 : 3;
      level += 1;
      if (el.type === "grid-row") {
        el.content.columns.forEach((col, j) => {
          newnode += "-" + (j + 1);
          GenerateElement.createSectionLevel(col.children, newnode);
        });
      }
    }
    elements.forEach((el, i) => {
      generate(el, i, startNode);
    });
  }

  /**
   * Mengubah objek konfigurasi kolom grid menjadi string yang ringkas dan mudah dibaca
   * yang menunjukkan pengaturan breakpoint responsif yang aktif.
   * * Digunakan untuk tujuan tampilan (misalnya, label atau tooltip) di UI.
   * Asumsi: Konfigurasi grid didasarkan pada 12 kolom (seperti Bootstrap).
   * * @param {object} column Objek konfigurasi kolom.
   * @param {?number} column.xs Ukuran kolom untuk breakpoint ekstra-kecil (XS).
   * @param {?number} column.sm Ukuran kolom untuk breakpoint kecil (SM).
   * @param {?number} column.md Ukuran kolom untuk breakpoint menengah (MD).
   * @param @param {?number} column.lg Ukuran kolom untuk breakpoint besar (LG).
   * @param {?number} column.xl Ukuran kolom untuk breakpoint ekstra-besar (XL).
   * @param {?number} column.xxl Ukuran kolom untuk breakpoint ekstra-ekstra-besar (XXL).
   * @returns {string} String format deskriptif dari breakpoint yang aktif, contoh: "(SM:6, MD:4, LG:3)".
   */
  static #formatGridBreakpoints(column) {
    const parts = [];
    if (column.xs !== null) parts.push(`XS:${column.xs}`);
    if (column.sm !== null) parts.push(`SM:${column.sm}`);
    if (column.md !== null) parts.push(`MD:${column.md}`);
    if (column.lg !== null) parts.push(`LG:${column.lg}`);
    if (column.xl !== null) parts.push(`XL:${column.xl}`);
    if (column.xxl !== null) parts.push(`XXL:${column.xxl}`);

    return parts.length > 0 ? `(${parts.join(", ")})` : "(Default Penuh)";
  }
  /**
   * Menghasilkan string kelas CSS yang diperlukan untuk mengontrol lebar kolom
   * berdasarkan pengaturan breakpoint yang diberikan (menggunakan sistem 12 kolom).
   * * Kelas yang dihasilkan digunakan untuk styling dan layout Flexbox/Grid CSS.
   * * @param {object} column Objek konfigurasi kolom (sama dengan format input formatGridBreakpoints).
   * @param {?number} column.xs Ukuran kolom untuk XS.
   * @param {?number} column.sm Ukuran kolom untuk SM.
   * @param {?number} column.md Ukuran kolom untuk MD.
   * @param {?number} column.lg Ukuran kolom untuk LG.
   * @param {?number} column.xl Ukuran kolom untuk XL.
   * @param {?number} column.xxl Ukuran kolom untuk XXL.
   * @returns {string} String kelas CSS yang digabungkan, contoh: "ug-grid-row-item ug-grid-12 ug-grid-md-6".
   */
  static #getGridClasses(column) {
    let classes = "ug-grid-row-item";

    // Perhatikan: Kelas XS tidak memiliki prefix '-xs-' (mirip Bootstrap)
    if (column.xs !== null) classes += ` ug-grid-${column.xs}`;

    if (column.sm !== null) classes += ` ug-grid-sm-${column.sm}`;
    if (column.md !== null) classes += ` ug-grid-md-${column.md}`;
    if (column.lg !== null) classes += ` ug-grid-lg-${column.lg}`;
    if (column.xl !== null) classes += ` ug-grid-xl-${column.xl}`;
    if (column.xxl !== null) classes += ` ug-grid-xxl-${column.xxl}`;

    // Penggunaan .trim() memastikan tidak ada spasi di awal atau akhir string
    return classes.trim();
  }

  /**
   * Metode Privat: Memetakan tipe alert ke kelas CSS Kustom (disarankan menggunakan 'danger' untuk 'warning').
   * Kelas yang dikembalikan adalah bagian dari set gaya kustom/pribadi.
   * Menggunakan `#` menjadikannya metode privat (ES2020).
   * @param {string} type Tipe alert (info, warning, tips, note).
   * @returns {string} Kelas CSS kustom yang sesuai (misal: 'info', 'danger', 'success').
   */
  static #getTypeAlertClass(type) {
    switch (type) {
      case "info":
        return "info";
      case "warning":
        return "danger";
      case "tips":
        return "success";
      case "note":
        return "secondary";
      default:
        return "light";
    }
  }

  /**
   * Metode Privat: Mengambil label dan ikon yang sesuai untuk Card Alert.
   * Menggunakan `#` menjadikannya metode privat (ES2020).
   * @param {string} type Tipe alert (info, warning, tips, note).
   * @returns {string} String berisi ikon dan label (misal: '💡 Info').
   */
  static #getCardIcon(type) {
    switch (type) {
      case "info":
        return "💡 Info";
      case "warning":
        return "⚠️ Warning";
      case "tips":
        return "✅ Tips";
      case "note":
        return "📝 Catatan";
      default:
        return "";
    }
  }

  /**
   * Membuat dan mengembalikan elemen promosi sidebar (div) lengkap dengan isinya.
   * * @returns {HTMLElement} Elemen div promosi.
   */
  static createPromotion() {
    const promotionContainer = document.createElement("div");
    promotionContainer.className = "promotion-sidebar mt-4 p-3 border rounded";
    const headline = document.createElement("p");
    headline.className = "fw-bold mb-1 text-primary small";
    headline.textContent = "Butuh Dokumentasi Cepat?";
    const description = document.createElement("p");
    description.className = "small text-muted mb-3";
    description.textContent =
      "Buat panduan elegan dan siap pakai dalam hitungan menit.";
    const ctaButton = document.createElement("a");
    ctaButton.href = "#solusi-dokumentasi";
    ctaButton.className = "btn btn-primary btn-sm w-100";
    ctaButton.textContent = "Buat Dokumentasi →";
    promotionContainer.appendChild(headline);
    promotionContainer.appendChild(description);
    promotionContainer.appendChild(ctaButton);

    return promotionContainer;
  }

  // --- METODE STATIC (TIDAK MEMBUTUHKAN INSTANCE) ---

  /**
   * Mengatur judul header di DOM.
   * @param {string} text Teks judul.
   */
  static setTitleDoc(text) {
    const ugTitleHeader = document.getElementById("ug-title-header");
    // Cek jika elemen ditemukan
    if (ugTitleHeader) {
      ugTitleHeader.textContent = "📚 " + text; // Gunakan textContent untuk keamanan
    }
  }

  /**
   * Membuat dan memasukkan tautan navigasi bab.
   * @param {string} text Teks tautan.
   * @param {string} [url="#"] URL tautan.
   */
  static createChapterNav(text, articleId, openId) {
    const ugChapterNav = document.getElementById("chapter-nav");
    const ugChapterNavCanva = document.getElementById("offcanvasChapterNav");
    if (!ugChapterNav) return;

    const newLink = document.createElement("a");
    newLink.className =
      "nav-link doc-link" + (openId === articleId ? " active" : "");
    newLink.href = "#";
    newLink.setAttribute("data-chapter", articleId);
    newLink.textContent = text;

    ugChapterNav.appendChild(newLink);
    if (ugChapterNavCanva) {
      const newLinkClone = newLink.cloneNode(true);
      ugChapterNavCanva.appendChild(newLinkClone);
    }
  }

  static createChapterTagNav(text) {
    const ugChapterNav = document.getElementById("chapter-nav");
    const ugChapterNavCanva = document.getElementById("offcanvasChapterNav");
    if (!ugChapterNav) return;

    const newLink = document.createElement("a");
    newLink.className = "nav-link doc-link tag-name";
    newLink.href = "#";
    newLink.textContent = text;

    ugChapterNav.appendChild(newLink);
    if (ugChapterNavCanva) {
      const newLinkClone = newLink.cloneNode(true);
      ugChapterNavCanva.appendChild(newLinkClone);
    }
  }

  // --- METODE INSTANCE (MEMBUTUHKAN chapterContent) ---

  /**
   * Membuat elemen Alert (Info, Warning, dll.).
   * @param {object} item Objek data alert.
   */
  createAlert(item) {
    const classetype = GenerateElement.#getTypeAlertClass(item.type);
    const alertDiv = document.createElement("div");
    alertDiv.className = `ug-alert-preview alert ${classetype}`;
    const strongElement = document.createElement("strong");
    strongElement.innerHTML = GenerateElement.#getCardIcon(item.type);
    const textNode = document.createTextNode(" " + item.content);

    alertDiv.appendChild(strongElement);
    alertDiv.appendChild(textNode);
    this.chapterContent.appendChild(alertDiv);
  }

  /**
   * Membuat elemen Heading (h2).
   * @param {object} item Objek data heading.
   */
  createHeading(item) {
    const sectionElement = document.createElement("section");
    sectionElement.id = item.sectionId;
    sectionElement.setAttribute("data-level", item.level);
    const h2Element = document.createElement("h2");
    h2Element.textContent = item.content.text;
    h2Element.className = `ug-heading-h2`;
    h2Element.setAttribute(
      "data-section-title",
      item.content.text /* .substring(0, 10) + "..." */
    );
    if (item.content.margin) {
      h2Element.classList.add("with-margin");
    }
    sectionElement.appendChild(h2Element);
    this.chapterContent.appendChild(sectionElement);
  }

  /**
   * Membuat elemen Subheading (h3).
   * @param {object} item Objek data subheading.
   */
  createSubheading(item) {
    const sectionElement = document.createElement("section");
    sectionElement.id = item.sectionId;
    sectionElement.setAttribute("data-level", item.level);
    const h3Element = document.createElement("h3");
    h3Element.textContent = item.content.text;
    h3Element.className = `ug-heading-h3`;
    h3Element.setAttribute(
      "data-section-title",
      item.content.text /* .substring(0, 10) + "..." */
    );

    if (item.content.margin) {
      h3Element.classList.add("with-margin");
    }
    sectionElement.appendChild(h3Element);
    this.chapterContent.appendChild(sectionElement);
  }

  /**
   * Membuat elemen Paragraf (<p>).
   * @param {object} item Objek data paragraf.
   */
  createParagraph(item) {
    const pElement = document.createElement("p");
    pElement.textContent = item.content.text;
    pElement.className = `ug-paragraph`;

    if (item.content.align) {
      pElement.classList.add(`with-align-${item.content.align}`);
    }
    if (item.content.indent) {
      pElement.classList.add("with-indent");
    }
    if (item.content.margin) {
      pElement.classList.add("with-margin");
    }
    this.chapterContent.appendChild(pElement);
  }

  // --- TEMPLATE UNTUK METODE KOSONG LAINNYA ---

  createRichText(item) {
    const spaceElement = document.createElement("div");
    spaceElement.className = `ug-rich-text`;
    spaceElement.innerHTML = item.content;
    this.chapterContent.appendChild(spaceElement);
  }

  /**
   * Membuat elemen Spasi untuk jarak antar elemen.
   * @param {object} item Objek data spasi.
   */
  createSpacer(item) {
    const spaceElement = document.createElement("div");
    spaceElement.textContent = "";
    spaceElement.className = `ug-space`;
    const height = item.content * 1.5;
    spaceElement.style.height = height + "rem";
    spaceElement.style.width = "100%";
    this.chapterContent.appendChild(spaceElement);
  }

  /**
   * Membuat elemen Bullet List (<ul>) dan memasukkan item-item list (<li>).
   * @param {object} item Objek data yang berisi array item di item.content.
   */
  createBulletList(item) {
    const ulElement = document.createElement("ul");
    ulElement.classList.add("ug-bullet-list");
    item.content.forEach((ilist) => {
      const liElement = document.createElement("li");
      liElement.classList.add("ug-list-group-item");
      const textNode = document.createTextNode(ilist);
      liElement.appendChild(textNode);
      ulElement.appendChild(liElement);
    });
    this.chapterContent.appendChild(ulElement);
  }

  /**
   * Membuat elemen Numbered List (Ordered List / <ol>) dan memasukkan item-item list (<li>).
   * @param {object} item Objek data yang berisi array item di item.content.
   */
  createNumberedList(item) {
    const olElement = document.createElement("ol");
    olElement.classList.add("ug-numbered-list");
    item.content.forEach((ilist) => {
      const liElement = document.createElement("li");
      liElement.classList.add("ug-list-group-item");
      const textNode = document.createTextNode(ilist);
      liElement.appendChild(textNode);
      olElement.appendChild(liElement);
    });
    this.chapterContent.appendChild(olElement);
  }

  /**
   * Membuat elemen Steps (Daftar Langkah-Langkah Bernomor dengan styling kustom).
   * @param {object} item Objek data yang berisi array langkah-langkah di item.content.
   */
  createSteps(item) {
    const olElement = document.createElement("ol");
    olElement.classList.add("ug-steps");
    if (item.content.orientation) {
      olElement.classList.add("ug-steps-" + item.content.orientation);
    }
    item.content.items.forEach((step, i) => {
      const liElement = document.createElement("li");
      liElement.classList.add("ug-steps-item");
      if (step.description) {
        liElement.classList.add("ug-steps-item-desction");
      }
      const indicatorSpan = document.createElement("span");
      indicatorSpan.classList.add("ug-steps-indicator");
      indicatorSpan.textContent = i + 1;
      const contentSpan = document.createElement("div");
      contentSpan.classList.add("ug-steps-content");
      const textDiv = document.createElement("div");
      textDiv.classList.add("ug-steps-content-text");
      textDiv.textContent = step.text;
      contentSpan.appendChild(textDiv);
      if (step.description) {
        const descriptionContent = document.createElement("div");
        descriptionContent.classList.add("ug-steps-content-description");
        descriptionContent.textContent = step.description;
        contentSpan.appendChild(descriptionContent);
      }
      liElement.appendChild(indicatorSpan);
      liElement.appendChild(contentSpan);
      olElement.appendChild(liElement);
    });
    this.chapterContent.appendChild(olElement);
  }

  /**
   * Membuat elemen Code Block (<pre> dan <code>) dan menerapkan syntax highlighting PrismJS.
   * @param {object} item Objek data yang berisi properti content.code dan content.language.
   */
  createCodeBlock(item) {
    const codeContent = item.content.code || "";
    const language = item.content.language || "none";
    const preElement = document.createElement("pre");
    preElement.classList.add("ug-pre-code-block");
    preElement.classList.add("line-numbers");
    const codeElement = document.createElement("code");
    codeElement.classList.add("ug-code-block");
    codeElement.classList.add(`language-${language}`);
    codeElement.textContent = codeContent;
    preElement.appendChild(codeElement);
    this.chapterContent.appendChild(preElement);
    if (window.Prism) {
      Prism.highlightElement(codeElement);
    } else {
      console.warn("PrismJS tidak ditemukan. Code block tidak di-highlight.");
    }
  }

  /**
   * Membuat elemen Parameter Table (Tabel dengan thead dan tbody)
   * @param {object} item Objek data yang berisi header dan baris di item.content.
   */
  createParameterTable(item) {
    const tableWrapper = document.createElement("div");
    tableWrapper.classList.add("ug-param-table-wrapper");
    const tableElement = document.createElement("table");
    tableElement.classList.add(
      "ug-table-parameter",
      "table",
      "table-bordered",
      "table-hover"
    );
    const thead = document.createElement("thead");
    thead.classList.add("ug-param-table-head");
    const headerRow = document.createElement("tr");
    item.content.header.forEach((headerTitle) => {
      const th = document.createElement("th");
      th.setAttribute("scope", "col");
      th.classList.add("ug-param-header-cell");
      th.textContent = headerTitle;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    tableElement.appendChild(thead);
    const tbody = document.createElement("tbody");
    tbody.classList.add("ug-table-body");
    item.content.rows.forEach((row) => {
      const tr = document.createElement("tr");
      tr.classList.add("ug-param-table-row");
      row.cells.forEach((cell) => {
        const td = document.createElement("td");
        td.classList.add("ug-param-table-cell");
        td.textContent = cell;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    tableElement.appendChild(tbody);
    tableWrapper.appendChild(tableElement);
    this.chapterContent.appendChild(tableWrapper);
  }

  /**
   * Membuat elemen General Table (Tabel dengan thead dan tbody untuk data umum)
   * @param {object} item Objek data yang berisi header dan baris di item.content.
   */
  createGeneralTable(item) {
    const tableWrapper = document.createElement("div");
    tableWrapper.classList.add("ug-table-wrapper");
    const tableElement = document.createElement("table");
    tableElement.classList.add("ug-table-general");
    const thead = document.createElement("thead");
    thead.classList.add("ug-table-head");
    const headerRow = document.createElement("tr");
    item.content.header.forEach((headerTitle) => {
      const th = document.createElement("th");
      th.setAttribute("scope", "col");
      th.classList.add("ug-table-header-cell");
      th.textContent = headerTitle;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    tableElement.appendChild(thead);
    const tbody = document.createElement("tbody");
    tbody.classList.add("ug-table-body");
    item.content.rows.forEach((row) => {
      const tr = document.createElement("tr");
      tr.classList.add("ug-table-row");
      row.cells.forEach((cell) => {
        const td = document.createElement("td");
        td.classList.add("ug-table-cell");
        td.textContent = cell;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    tableElement.appendChild(tbody);
    tableWrapper.appendChild(tableElement);
    this.chapterContent.appendChild(tableWrapper);
  }

  /**
   * Membuat elemen Tautan (Link / <a>)
   * @param {object} item Objek data yang berisi url, target, dan text di item.content.
   */
  createLink(item) {
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", item.content.url || "#");
    if (item.content.target) {
      linkElement.setAttribute("target", item.content.target);
    }
    linkElement.textContent = item.content.text || item.content.url;
    if (item.content.target === "_blank") {
      const iconElement = document.createElement("i");
      iconElement.classList.add(
        "bi",
        "bi-box-arrow-up-right",
        "ug-element-ms-1"
      );
      linkElement.appendChild(iconElement);
    }
    linkElement.classList.add("ug-link");
    this.chapterContent.appendChild(linkElement);
  }

  /**
   * Membuat elemen Gambar (<img>) dan caption (<div>) di bawahnya.
   * @param {object} item Objek data yang berisi url, altText, dan caption di item.content.
   */
  createImage(item) {
    const imgElement = document.createElement("img");
    imgElement.setAttribute("src", item.content.url || "");
    imgElement.setAttribute("alt", item.content.altText || "");
    imgElement.style.width = "100%";
    imgElement.classList.add("ug-image");
    this.chapterContent.appendChild(imgElement);
    if (item.content.caption) {
      const captionDiv = document.createElement("div");
      captionDiv.classList.add("ug-image-caption");
      captionDiv.textContent = item.content.caption;
      this.chapterContent.appendChild(captionDiv);
    }
  }

  /**
   * Metode Privat: Membuat struktur kolom tunggal (wrapper dan content).
   * @param {object} columnData Objek data untuk satu kolom.
   * @returns {HTMLElement} Elemen div wrapper kolom yang sudah terkonfigurasi.
   */
  #createGridColumn(columnData) {
    const colWrapper = document.createElement("div");
    colWrapper.classList.add("ug-grid-col-wrapper");
    colWrapper.classList.add(
      ...GenerateElement.#getGridClasses(columnData).split(" ")
    );
    if (columnData.style && typeof columnData.style === "object") {
      for (const prop in columnData.style) {
        colWrapper.style[prop] = columnData.style[prop];
      }
    }

    const colContent = document.createElement("div");
    colContent.classList.add("ug-grid-col-content");
    const contentGrid = new GenerateElement(colContent);
    createContentElement(columnData.children, contentGrid);
    colWrapper.appendChild(contentGrid.getElement());
    return colWrapper;
  }

  /**
   * Membuat elemen Grid Row (Baris Grid) lengkap dengan semua kolom di dalamnya.
   * Fungsi ini mencerminkan logika *ngFor Angular.
   * @param {object} item Objek data yang berisi array kolom di item.content.columns.
   */
  createGridRow(item) {
    const gridContainer = document.createElement("div");
    gridContainer.classList.add("ug-grid-container");
    const rowPreview = document.createElement("div");
    rowPreview.classList.add("ug-grid-row-preview");
    if (item.content.align) {
      rowPreview.classList.add("ug-" + item.content.align);
    }
    item.content.columns.forEach((columnData, i) => {
      const columnElement = this.#createGridColumn(columnData);
      rowPreview.appendChild(columnElement);
    });
    gridContainer.appendChild(rowPreview);
    this.chapterContent.appendChild(gridContainer);
  }

  /**
   * Membuat elemen Video (embed code, link URL, dan deskripsi)
   * @param {object} item Objek data yang berisi embedCode, url, dan description di item.content.
   */
  createVideo(item) {
    const videoContainer = document.createElement("div");
    videoContainer.classList.add("ug-video-container");
    if (item.content.embedCode) {
      const embedWrapper = document.createElement("div");
      embedWrapper.classList.add("ug-video-embed-wrapper");
      const embedDiv = document.createElement("div");
      embedDiv.innerHTML = item.content.embedCode;
      embedWrapper.appendChild(embedDiv);
      videoContainer.appendChild(embedWrapper);
    }
    if (item.content.url) {
      const urlLinkDiv = document.createElement("div");
      urlLinkDiv.classList.add("ug-video-url-link");
      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", item.content.url);
      linkElement.setAttribute("target", "_blank");
      linkElement.classList.add("ug-element-text-decoration-none");
      linkElement.textContent = "Lihat Video";
      const iconElement = document.createElement("i");
      iconElement.classList.add("bi", "bi-box-arrow-up-right");

      linkElement.appendChild(iconElement);
      urlLinkDiv.appendChild(linkElement);
      videoContainer.appendChild(urlLinkDiv);
    }
    if (item.content.description) {
      const descriptionDiv = document.createElement("div");
      descriptionDiv.classList.add("ug-video-description");
      descriptionDiv.textContent = item.content.description;
      videoContainer.appendChild(descriptionDiv);
    }
    this.chapterContent.appendChild(videoContainer);
  }
}
