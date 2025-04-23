(function() {
    console.log("Loader script eseguito.");

    // Flag per caricamento locale vs remoto
    const LOAD_REMOTELY = false; // Imposta a true per caricare da GitHub Pages

    // Definisci BASE_URL dinamicamente
    const BASE_URL = LOAD_REMOTELY ? "https://zeroskill830.github.io/chatbot" : "chatbot";
    console.log(`Loader: Utilizzo BASE_URL: ${BASE_URL}`);

    // Esponi BASE_URL globalmente per altri script (es. Lottie path)
    window.CHATBOT_BASE_URL = BASE_URL;

    // Lista degli script da caricare in ordine (usa BASE_URL)
    const chatbotScripts = [
        `${BASE_URL}/chatbot-ui.js`,          // Prima la UI
        `${BASE_URL}/chatbot-message-handler.js`, // Poi il gestore messaggi
        `${BASE_URL}/chatbot-core.js`,          // Infine il core che usa gli altri due
        `${BASE_URL}/chatbot-lottie.js`         // Infine il core che usa gli altri due
    ];
    
    // Lista dei CSS da caricare (variables.css per primo!) (usa BASE_URL)
    const chatbotStyleURLs = [
        `${BASE_URL}/styles/variables.css`, // <-- CARICA PRIMA!
        `${BASE_URL}/styles/chatbot-container.css`,
        `${BASE_URL}/styles/chatbot-header.css`,
        `${BASE_URL}/styles/chatbot-message-area.css`,
        `${BASE_URL}/styles/chatbot-message.css`,
        `${BASE_URL}/styles/chatbot-footer.css`,
        `${BASE_URL}/styles/chatbot-input.css`,
        `${BASE_URL}/styles/chatbot-send-button.css`,
        `${BASE_URL}/styles/chatbot-toggle-button.css`,
        // Aggiungere qui eventuali altri file CSS globali se necessario
    ];

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
            // Carica tutti i file CSS prima degli script
            console.log("Loader: Caricamento CSS...");
            for (const cssURL of chatbotStyleURLs) {
                await loadCSS(cssURL);
            }
            console.log("Loader: Tutti i CSS caricati.");

            // Carica la libreria Lottie
            console.log("Loader: Caricamento libreria Lottie...");
            const lottieURL = "https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js";
            await loadScript(lottieURL);
            console.log("Loader: Libreria Lottie caricata.");

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