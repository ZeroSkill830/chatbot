(function() {
    console.log("Loader script eseguito.");

    // -------- MODIFICA NECESSARIA QUI --------
    // Assicurati che questo URL sia corretto per il tuo repository GitHub Pages
    const GITHUB_PAGES_BASE_URL = "https://zeroskill830.github.io/chatbot"; // <-- VERIFICA QUESTO!
    // -----------------------------------------

    // Lista degli script da caricare in ordine
    const chatbotScripts = [
        `${GITHUB_PAGES_BASE_URL}/chatbot-ui.js`,          // Prima la UI
        `${GITHUB_PAGES_BASE_URL}/chatbot-message-handler.js`, // Poi il gestore messaggi
        `${GITHUB_PAGES_BASE_URL}/chatbot-core.js`          // Infine il core che usa gli altri due
    ];
    const chatbotCSSURL = `${GITHUB_PAGES_BASE_URL}/style.css`; // Rinominato da style.css a chatbot-styles.css? Verifica nome file. Lo lascio style.css per ora.

    // Funzione per caricare uno script
    function loadScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.async = true;
            script.onload = () => {
                console.log(`Script caricato: ${url}`);
                resolve();
            };
            script.onerror = (error) => {
                console.error(`Errore nel caricamento dello script: ${url}`, error);
                reject(error);
            };
            document.body.appendChild(script);
        });
    }

    // Funzione per caricare CSS (presa da chatbot-core e messa qui per caricarla prima)
    function loadCSS(url) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = url;
            link.onload = () => {
                console.log(`Loader: CSS caricato: ${url}`);
                resolve();
            };
            link.onerror = (error) => {
                console.error(`Loader: Errore nel caricamento del CSS: ${url}`, error);
                reject(error);
            };
            document.head.appendChild(link);
        });
    }

    // Funzione per inizializzare il chatbot
    async function initializeChatbot() {
        console.log("Loader: Inizializzazione chatbot...");
        try {
            // Carica prima il CSS
            await loadCSS(chatbotCSSURL);

            // Carica tutti gli script del chatbot in sequenza
            for (const scriptURL of chatbotScripts) {
                await loadScript(scriptURL);
            }

            // Assicurati che la classe Chatbot (dal core) sia disponibile
            if (typeof Chatbot === 'undefined') {
                console.error("Loader: La classe Chatbot (core) non è stata definita.");
                return;
            }
             // Assicurati che gli altri moduli siano disponibili (se li esponi globalmente)
             if (typeof ChatbotUI === 'undefined' || typeof ChatbotMessageHandler === 'undefined') {
                 console.error("Loader: Moduli ChatbotUI o ChatbotMessageHandler non definiti globalmente.");
                 return;
             }

            // Crea l'istanza del chatbot
            const chatbotInstance = new Chatbot();

            // Inizializza il chatbot (che ora creerà UI e imposterà handler)
            await chatbotInstance.initialize(); // Passa eventuali config qui

            console.log("Loader: Chatbot inizializzato con successo!");

        } catch (error) {
            console.error("Errore durante l'inizializzazione del chatbot:", error);
        }
    }

    // Assicurati che il DOM sia pronto prima di eseguire l'inizializzazione
    if (document.readyState === 'loading') { // Loading hasn't finished yet
        document.addEventListener('DOMContentLoaded', initializeChatbot);
        console.log("Inizializzazione posticipata a DOMContentLoaded.");
    } else { // `DOMContentLoaded` has already fired
        console.log("DOM già caricato, inizializzazione immediata.");
        initializeChatbot();
    }

})(); // IIFE (Immediately Invoked Function Expression) per evitare conflitti globali 