document.addEventListener("DOMContentLoaded", function () {
    // Elementi principali
    const sections = document.querySelectorAll(".section");
    const animatedElements = document.querySelectorAll("[data-reanimate]");
    const header = document.querySelector('.header');
    const navLinks = document.querySelectorAll('.nav-menu a');
    const languageBar = document.getElementById('language-bar');
    
    let lastScrollTop = 0;
    let ticking = false;

    // Configurazione
    const SCROLL_OFFSET = 100; // Offset per il calcolo della sezione attiva
    const VISIBILITY_THRESHOLD = 0.3; // 30% della sezione deve essere visibile

    // Funzione per verificare se un elemento è visibile nel viewport
    function isElementVisible(el) {
        const rect = el.getBoundingClientRect();
        const visibilityHeight = rect.height * VISIBILITY_THRESHOLD;
        
        return (
            rect.top <= (window.innerHeight - visibilityHeight) && 
            rect.bottom >= visibilityHeight
        );
    }

    // Funzione principale per gestire lo scroll
    function handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Gestione header
        header.classList.toggle('scrolled', scrollTop > 100);
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;

        // Gestione sezioni attive nel menu
        const activeSections = new Set();
        
        sections.forEach((section, index) => {
            const sectionId = section.getAttribute('id');
            
            // Animazione sezione
            if (isElementVisible(section)) {
                section.classList.add("animate");
                activeSections.add(sectionId);
            } else {
                section.classList.remove("animate");
            }
        });

        // Aggiorna i link attivi nel menu
        navLinks.forEach(link => {
            const targetId = link.getAttribute('href').substring(1);
            link.classList.toggle('active', activeSections.has(targetId));
        });

        // Animazione elementi
        animatedElements.forEach(element => {
            if (isElementVisible(element)) {
                element.classList.add("animate");
                if (element.classList.contains("skill-progress")) {
                    const targetWidth = element.dataset.originalWidth || element.style.width;
                    element.style.width = "0";
                    void element.offsetWidth;
                    element.style.width = targetWidth;
                }
            } else {
                element.classList.remove("animate");
                if (element.classList.contains("skill-progress") && !element.dataset.originalWidth) {
                    element.dataset.originalWidth = element.style.width;
                    element.style.width = "0";
                }
            }
        });
    }

    // Gestione scroll ottimizzata
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    });

    // Smooth scroll per i link del menu
    navLinks.forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                // Calcola la posizione con offset per l'header
                const targetPosition = targetSection.offsetTop - header.offsetHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Aggiorna manualmente lo stato attivo dopo lo scroll
                setTimeout(() => {
                    handleScroll();
                }, 1000);
            }
        });
    });

    // Gestione cambio lingua
    function changeLanguage(lang) {
        // Imposta l'attributo lang sul documento
        document.documentElement.setAttribute('data-lang', lang);
        
        // Mostra/nascondi elementi in base alla lingua
        document.querySelectorAll('[data-lang]').forEach(element => {
            element.style.display = element.getAttribute('data-lang') === lang ? '' : 'none';
        });

        // Aggiorna lo stato delle lingue
        document.querySelectorAll('#language-bar a').forEach(link => {
            const isActive = link.id === `len-${lang}`;
            link.classList.toggle('active', isActive);
            link.classList.toggle('disactive', !isActive);
        });
    }

    function initializeLanguage() {
        const urlParams = new URLSearchParams(window.location.search);
        const langParam = urlParams.get('len');
        const savedLang = localStorage.getItem('preferredLanguage');
        
        // Determina la lingua da usare (parametro URL > localStorage > default 'en')
        let lang = langParam || savedLang || 'en';
        
        // Mostra l'animazione solo se non c'è nessuna preferenza
        if (!langParam && !savedLang) {
            languageBar.classList.add('language-bar-shake');
        }

        changeLanguage(lang);
        localStorage.setItem('preferredLanguage', lang);
        
        // Aggiorna l'URL senza ricaricare
        if (langParam) {
            const url = new URL(window.location);
            url.searchParams.set('len', lang);
            window.history.replaceState({}, '', url);
        }
    }

    // Eventi per cambio lingua
    document.querySelectorAll('#language-bar a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const lang = this.id.split('-')[1];
            changeLanguage(lang);
            localStorage.setItem('preferredLanguage', lang);
            
            // Aggiorna l'URL
            const url = new URL(window.location);
            url.searchParams.set('len', lang);
            window.history.pushState({}, '', url);
        });
    });

    // Inizializzazioni
    initializeLanguage();
    handleScroll(); // Esegui subito per impostare lo stato iniziale
});