/**
 * Mengatur interaktivitas pada objek Document yang di-parse.
 * Catatan: Event listener yang dipasang di sini HILANG saat DOM dipindahkan (importNode).
 * Untuk membuat interaktivitas berfungsi di jendela baru, fungsi ini harus dijalankan
 * di konteks jendela baru SETELAH DOM diimpor.
 * * @param {object} genEl - Objek dengan method untuk membuat elemen (misalnya createPromotion)
 * @param {Document} element - Objek Document (hasil DOMParser)
 * @returns {object} - Objek yang berisi fungsi-fungsi navigasi
 */
function configPageRender(genEl, element) {

    // --- FUNGSI UTILITAS ---
    
    function updateRightSidebar(chapterId) {
        const sectionNav = element.querySelector("#section-nav");
        if (!sectionNav) return;
        sectionNav.innerHTML = "";
        const activeChapter = element.querySelector("#" + chapterId);
        if (!activeChapter) return;
        const sections = activeChapter.querySelectorAll("[data-level]");

        sections.forEach((section) => {
            const sectionId = section.id;
            const rawLevel = section.getAttribute("data-level");
            const level = parseInt(rawLevel || '0', 10);
            const titleElement = section.querySelector(`[data-section-title]`);
            
            let sectionTitle;
            if (titleElement) {
                sectionTitle = titleElement.getAttribute("data-section-title") || titleElement.textContent;
            } else {
                sectionTitle = "Bagian Tanpa Judul";
            }
            
            const link = element.createElement("a"); // Menggunakan element.createElement karena di Document lain
            link.className = `nav-link tree-nav-link doc-link level-${level} text-truncate`;
            link.href = `#${sectionId}`;
            link.textContent = sectionTitle;

            if (level === 1) {
                const icon = element.createElement("i");
                icon.className = "bi bi-arrow-right me-2";
                link.prepend(icon);
            } else if (level === 2) {
                const icon = element.createElement("i");
                icon.className = "bi bi-dot me-1";
                link.prepend(icon);
            }

            // Event listener ini seharusnya menargetkan elemen di DOKUMEN BARU,
            // tetapi saat ini menggunakan 'document' global. INI HARUS DIPERBAIKI NANTI!
            link.addEventListener("click", (e) => {
                e.preventDefault();
                // Menggunakan document.getElementById berpotensi salah jika DOM belum disisipkan
                const targetElement = element.getElementById(sectionId); 
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: "smooth" });
                }
            });

            sectionNav.appendChild(link);
        });
        
        // Asumsi genEl.createPromotion() juga membuat elemen di konteks 'element'
        sectionNav.appendChild(genEl.createPromotion()); 
    }

    function setNaviageUrl(e, idnav) {
        if (e.target.tagName === "A") {
            e.preventDefault();
            const targetLink = e.target;
            const chapterId = targetLink.getAttribute("data-chapter");
            
            element
                .querySelectorAll(`#${idnav} .doc-link`)
                .forEach((link) => link.classList.remove("active"));
                
            targetLink.classList.add("active");
            
            element.querySelectorAll(".article-content").forEach((article) => {
                if (article.id === chapterId) {
                    article.style.display = "block";
                    // Hanya bisa mengakses scrollTop jika .main-content ada
                    const mainContent = element.querySelector(".main-content");
                    if (mainContent) {
                         mainContent.scrollTop = 0;
                    }
                } else {
                    article.style.display = "none";
                }
            });
            updateRightSidebar(chapterId);
            setupRightSidebarScrollSpy(chapterId);
        }
    }

    // CATATAN PENTING: Scroll Spy ini menggunakan objek global window dan document.
    // Jika dijalankan di konteks DOMParser, ini TIDAK akan berfungsi karena 
    // objek window dan document merujuk pada window UTAMA, bukan jendela yang di-parse.
    function setupRightSidebarScrollSpy(chapterId) {
        const sections = document.querySelectorAll(`#${chapterId} [data-level]`);
        
        const windowAny = window; // Menggunakan window global

        window.removeEventListener("scroll", windowAny.currentScrollHandler);

        function onScroll() {
            let current = "";
            const scrollY = window.scrollY;
            const offset = 150; 

            sections.forEach((section) => {
                if (section.offsetTop <= scrollY + offset) {
                    current = section.id;
                }
            });

            document.querySelectorAll("#section-nav .doc-link").forEach((link) => {
                link.classList.remove("active");
                if (link.getAttribute("href") === `#${current}`) {
                    link.classList.add("active");
                }
            });
        }

        windowAny.currentScrollHandler = onScroll;
        windowAny.addEventListener("scroll", windowAny.currentScrollHandler);
    }
    
    function toggleTheme(istheme) {
        // Mendapatkan elemen yang sudah di-query di bawah
        if (istheme === "dark") {
            // --- Beralih ke LIGHT MODE ---
            html.setAttribute("data-bs-theme", "light");
            localStorage.setItem("theme", "light");
            themeIcon.className = "bi bi-sun-fill";

            if (prismLight) prismLight.disabled = false;
            if (prismDark) prismDark.disabled = true;
        } else {
            // --- Beralih ke DARK MODE ---
            html.setAttribute("data-bs-theme", "dark");
            localStorage.setItem("theme", "dark");
            themeIcon.className = "bi bi-moon-fill";

            if (prismLight) prismLight.disabled = true;
            if (prismDark) prismDark.disabled = false;
        }
    }
    
    // --- VARIABEL UTAMA (Berada di konteks 'element' yang di-parse) ---

    // Catatan: QuerySelector di sini menargetkan objek Document yang di-parse
    const themeToggle = element.querySelector("#theme-toggle");
    const html = element.documentElement; // Elemen <html> dari dokumen yang di-parse
    const themeIcon = element.querySelector("#theme-icon");

    const prismLight = element.querySelector("#prism-light-theme");
    const prismDark = element.querySelector("#prism-dark-theme");

    const theme = localStorage.getItem("theme") || "light";

    // --- PEMASANGAN EVENT LISTENER (Berada di konteks 'element' yang di-parse) ---
    
    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            console.log('a');
            toggleTheme(html.getAttribute("data-bs-theme"));
        });
    }

    toggleTheme(theme === "dark" ? "light" : "dark"); // Initial theme setup

    const scrollButton = element.querySelector("#scrollToTopBtn");
    const scrollThreshold = 300;
    
    // FUNGSI INI MENGGUNAKAN WINDOW GLOBAL, TIDAK BERFUNGSI PADA OBJEK DOM PARSED
    function toggleScrollButton() {
        if (window.scrollY > scrollThreshold) {
            scrollButton.style.display = "block";
        } else {
            scrollButton.style.display = "none";
        }
    }

    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }
    
    // Event listener ini menargetkan WINDOW GLOBAL, bukan dokumen yang di-parse!
    // window.addEventListener("scroll", toggleScrollButton); 
    
    if (scrollButton) {
        // Event listener ini dipasang pada elemen di DOM parsed, tapi hanya berfungsi 
        // setelah elemen dipindahkan ke DOM aktif
        scrollButton.addEventListener("click", scrollToTop); 
    }
    
    // toggleScrollButton(); // Dipanggil sekali di konteks window global

    return {
        setNaviageUrl,
        updateRightSidebar,
        setupRightSidebarScrollSpy
    }
}
