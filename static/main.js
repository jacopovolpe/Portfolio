document.addEventListener("DOMContentLoaded", function () {
    /*---------------- VARIABILI E COSTANTI GLOBALI ------------------*/
    const VISIBILITY_THRESHOLD = 0.3; // 30% della sezione deve essere visibile
    const HEADER_SCROLL_THRESHOLD = 100;
    const SCROLL_OFFSET = 10; // Offset in px per lo scroll
    
    // Elementi DOM
    const sections = document.querySelectorAll(".section");
    const animatedElements = document.querySelectorAll("[data-reanimate]");
    const header = document.querySelector('.header');
    const navLinks = document.querySelectorAll('.nav-menu a');
    const languageBar = document.getElementById('language-bar');
    
    // Variabili di stato
    let lastScrollTop = 0;
    let ticking = false;

    /*---------------- FUNZIONI DI UTILITÀ ------------------*/
    
    /**
     * Verifica se un elemento è visibile nel viewport
     * @param {HTMLElement} el - Elemento da verificare
     * @returns {boolean} True se l'elemento è visibile
     */
    function isElementVisible(el) {
        const rect = el.getBoundingClientRect();
        const visibilityHeight = rect.height * VISIBILITY_THRESHOLD;
        
        return (
            rect.top <= (window.innerHeight - visibilityHeight) && 
            rect.bottom >= visibilityHeight
        );
    }

    /*---------------- GESTIONE SCROLL E NAVIGAZIONE ------------------*/
    
    /**
     * Gestisce l'animazione degli elementi durante lo scroll
     */
    function handleAnimations() {
        animatedElements.forEach(element => {
            if (isElementVisible(element)) {
                element.classList.add("animate");
                if (element.classList.contains("skill-progress")) {
                    const targetWidth = element.dataset.originalWidth || element.style.width;
                    element.style.width = "0";
                    void element.offsetWidth; // Trigger reflow
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
    
    /**
     * Gestisce l'evidenziazione delle sezioni attive nel menu
     */
    function handleActiveSections() {
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.scrollY >= sectionTop - 150 && 
                window.scrollY < sectionTop + sectionHeight - 150) {
                currentSection = '#' + section.id;
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === currentSection) {
                link.classList.add('active');
            }
        });
    }
    
    /**
     * Funzione principale per gestire gli eventi di scroll
     */
    function handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Gestione header scrollato
        header.classList.toggle('scrolled', scrollTop > HEADER_SCROLL_THRESHOLD);
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        
        // Gestione animazioni e sezioni attive
        handleAnimations();
        handleActiveSections();
    }
    
    /**
     * Scroll fluido a una sezione con offset
     * @param {string} targetId - ID della sezione target
     */
    function smoothScrollTo(targetId) {
        const targetElement = document.querySelector(targetId);
        if (!targetElement) return;
        
        // Calcola la posizione tenendo conto dell'header
        const headerHeight = header.offsetHeight;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
        
        // Aggiorna l'URL senza ricaricare la pagina
        history.pushState(null, null, targetId);
    }

    /*---------------- GESTIONE LINGUA ------------------*/
    
    /**
     * Cambia la lingua del sito
     * @param {string} lang - Lingua da impostare ('it' o 'en')
     */
    function changeLanguage(lang) {
        // Imposta l'attributo lang sul documento
        document.documentElement.setAttribute('data-lang', lang);
        
        // Mostra/nascondi elementi in base alla lingua
        document.querySelectorAll('[data-lang]').forEach(element => {
            element.style.display = element.getAttribute('data-lang') === lang ? '' : 'none';
        });

        // Aggiorna lo stato delle lingue
        document.querySelectorAll('#language-bar a').forEach(link => {
            const isActive = link.id === `lang-${lang}`;
            link.classList.toggle('active', isActive);
            link.classList.toggle('disactive', !isActive);
        });
    }
    
    /**
     * Inizializza la lingua in base a URL, localStorage o default
     */
    function initializeLanguage() {
        const urlParams = new URLSearchParams(window.location.search);
        const langParam = urlParams.get('lang');
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
            url.searchParams.set('lang', lang);
            window.history.replaceState({}, '', url);
        }
    }

    /*---------------- GESTIONE EVENTI ------------------*/
    
    // Ottimizzazione dell'evento scroll
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    });
    
    // Click sui link di navigazione
    navLinks.forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            
            // Se siamo già nella sezione, fai un piccolo aggiustamento
            if (window.location.hash === targetId) {
                const currentPosition = window.pageYOffset;
                const targetElement = document.querySelector(targetId);
                const headerHeight = header.offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + currentPosition - headerHeight;
                
                // Solo se siamo già vicini alla posizione, fai un piccolo scroll
                if (Math.abs(currentPosition - targetPosition) < 50) {
                    window.scrollTo({
                        top: targetPosition - 10, // Piccolo offset aggiuntivo
                        behavior: 'smooth'
                    });
                    return;
                }
            }
            
            smoothScrollTo(targetId);
        });
    });
        
    // Click sulla barra delle lingue
    document.querySelectorAll('#language-bar a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const lang = this.id.split('-')[1];
            changeLanguage(lang);
            localStorage.setItem('preferredLanguage', lang);
            
            // Aggiorna l'URL
            const url = new URL(window.location);
            url.searchParams.set('lang', lang);
            window.history.pushState({}, '', url);
        });
    });
    
    // Gestione del caricamento iniziale con hash nell'URL
    if (window.location.hash) {
        setTimeout(() => {
            smoothScrollTo(window.location.hash);
        }, 100);
    }

    /*---------------- INIZIALIZZAZIONE ------------------*/
    initializeLanguage();
    handleScroll(); // Imposta lo stato iniziale
});