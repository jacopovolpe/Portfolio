document.addEventListener("DOMContentLoaded", function () {
    const sections = document.querySelectorAll(".section");
    function revealSections() {
        sections.forEach((section) => {
            const sectionTop = section.getBoundingClientRect().top;
            if (sectionTop < window.innerHeight * 0.85) {
                section.classList.add("animate");
            }
        });
    }
    window.addEventListener("scroll", revealSections);
    revealSections();
});

document.querySelectorAll('.nav-menu a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const navLinks = document.querySelectorAll('.nav-menu a');
    const sections = document.querySelectorAll('.section');

    function makeActive() {
        sections.forEach((section, index) => {
            const sectionTop = section.getBoundingClientRect().top;
            const sectionBottom = section.getBoundingClientRect().bottom;

            // Se la sezione � visibile nella finestra
            if (sectionTop <= window.innerHeight * 0.5 && sectionBottom >= window.innerHeight * 0.5) {
                navLinks.forEach(link => link.classList.remove('active')); // Rimuovi la classe active da tutti i link
                navLinks[index].classList.add('active'); // Aggiungi la classe active al link corrispondente
            }
        });
    }

    window.addEventListener('scroll', makeActive);
    makeActive(); // Esegui la funzione all'avvio per impostare lo stato iniziale
});

document.addEventListener("DOMContentLoaded", function () {
    // Funzione per cambiare la lingua
    function changeLanguage(lang) {
        // Imposta l'attributo data-lang sul documento
        document.documentElement.setAttribute('data-lang', lang);

        // Mostra/nascondi gli elementi in base alla lingua
        document.querySelectorAll('[data-lang]').forEach(element => {
            if (element.getAttribute('data-lang') === lang) {
                element.style.display = ''; // Mostra l'elemento
            } else {
                element.style.display = 'none'; // Nascondi l'elemento
            }
        });

        // Aggiorna lo stato attivo delle bandiere
        document.querySelectorAll('#language-bar a').forEach(link => {
            link.classList.remove('active');
            link.classList.add('disactive');
        });

        const activeLink = document.getElementById(`len-${lang}`);
        if (activeLink) {
            activeLink.classList.remove('disactive');
            activeLink.classList.add('active');
        }



    }

    // Funzione per inizializzare la lingua
    function initializeLanguage() {
        const urlParams = new URLSearchParams(window.location.search);
        const langParam = urlParams.get('len'); // Ottieni la lingua dall'URL
        const savedLang = localStorage.getItem('preferredLanguage'); // Ottieni la lingua salvata

        // Determina la lingua da utilizzare
        let lang;
        if (langParam)  {
            lang = langParam;
            // Salva la preferenza della lingua nel localStorage
            localStorage.setItem('preferredLanguage', lang);
        }
        else if (savedLang) {
            lang = savedLang
        }
        else  {
            const languageBar = document.getElementById('language-bar');
            languageBar.classList.add('language-bar-shake');

            lang = 'en';
        }

        changeLanguage(lang); // Imposta la lingua
    }

    // Gestione del click sulle bandiere
    document.querySelectorAll('#language-bar a').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault(); // Previeni il comportamento predefinito del link
            const lang = this.getAttribute('id').split('-')[1]; // Ottieni la lingua (es. 'it' o 'en')
            changeLanguage(lang); // Cambia la lingua

            // Aggiorna l'URL senza ricaricare la pagina
            const url = new URL(window.location);
            url.searchParams.set('len', lang);
            window.history.pushState({}, '', url);
        });
    });

    // Inizializza la lingua al caricamento della pagina
    initializeLanguage();
});

document.addEventListener("DOMContentLoaded", function () {
const header = document.querySelector('.header');
let lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;
let isScrolling;

// Funzione per gestire lo scroll
function handleScroll() {
let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

if (scrollTop > lastScrollTop && scrollTop > 100) {
    // Scrolling verso il basso
    header.classList.add('scrolled');
} else if (scrollTop < lastScrollTop && scrollTop <= 100) {
    // Scrolling verso l'alto e siamo in cima alla pagina
    header.classList.remove('scrolled');
}

lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // Evita valori negativi

// Richiedi un nuovo frame di animazione
isScrolling = false;
}

// Aggiungi un listener per l'evento scroll
window.addEventListener('scroll', function () {
if (!isScrolling) {
    window.requestAnimationFrame(handleScroll);
    isScrolling = true;
}
});

// Verifica la posizione iniziale al caricamento della pagina
if (lastScrollTop > 100) {
header.classList.add('scrolled');
} else {
header.classList.remove('scrolled');
}
});

document.addEventListener("DOMContentLoaded", function () {
const animatedElements = document.querySelectorAll("[data-reanimate]");

function isElementPartiallyInViewport(el) {
const rect = el.getBoundingClientRect();
return (
    rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.75 && // 75% della finestra
    rect.bottom >= 0
);
}

function resetAnimationsOnScroll() {
let hasActiveSection = false; // Flag per verificare se c'è almeno una sezione attiva

animatedElements.forEach((element) => {
    if (isElementPartiallyInViewport(element)) {
        // Aggiungi la classe per attivare l'animazione
        element.classList.add("animate");

        // Se è una skill bar, forza il riavvio dell'animazione
        if (element.classList.contains("skill-progress")) {
            const targetWidth = element.dataset.originalWidth || element.style.width; // Usa la larghezza originale
            element.style.width = "0"; // Resetta la larghezza
            void element.offsetWidth; // Forza il reflow per riavviare l'animazione
            element.style.width = targetWidth; // Imposta la larghezza target
        }

        // Imposta il flag su true se l'elemento è una sezione
        if (element.classList.contains("section")) {
            hasActiveSection = true;
        }
    } else {
        // Rimuovi la classe per resettare l'animazione
        element.classList.remove("animate");

        // Se è una skill bar, salva la larghezza originale e resetta la larghezza
        if (element.classList.contains("skill-progress")) {
            if (!element.dataset.originalWidth) {
                element.dataset.originalWidth = element.style.width; // Salva la larghezza originale
            }
            element.style.width = "0"; // Resetta la larghezza
        }
    }
});

// Se nessuna sezione è attiva, attiva la prima sezione visibile
if (!hasActiveSection) {
    const firstVisibleSection = Array.from(animatedElements).find((element) =>
        element.classList.contains("section") && isElementPartiallyInViewport(element)
    );
    if (firstVisibleSection) {
        firstVisibleSection.classList.add("animate");
    }
}
}

window.addEventListener("scroll", resetAnimationsOnScroll);
resetAnimationsOnScroll(); // Esegui la funzione all'avvio per impostare lo stato iniziale
});