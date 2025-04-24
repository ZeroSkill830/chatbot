(function () {
    // Flag per caricamento locale vs remoto
    const LOAD_REMOTELY = true; // Imposta a true per caricare da GitHub Pages

    // Definisci BASE_URL dinamicamente
    const BASE_URL = LOAD_REMOTELY ? "https://zeroskill830.github.io/chatbot" : ".";

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
        `${BASE_URL}/styles/chatbot-quick-actions.css`,
        // Aggiungere qui eventuali altri file CSS globali se necessario
    ];

    // Funzione per caricare uno script
    function loadScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.async = true;
            script.onload = () => {
                resolve();
            };
            script.onerror = (error) => {
                reject(error);
            };
            document.body.appendChild(script);
        });
    }

    // Funzione per caricare CSS DENTRO lo Shadow DOM
    function loadCSSInShadow(url, shadowRoot) {
        return new Promise((resolve, reject) => {
            if (!shadowRoot) {
                return reject(new Error("Shadow root non fornito per caricare CSS."));
            }
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = url;
            link.onload = () => {
                resolve();
            };
            link.onerror = (error) => {
                reject(error);
            };
            shadowRoot.appendChild(link); // <-- Appendi allo shadow root
        });
    }

    // Funzione per caricare Google Fonts DENTRO lo Shadow DOM
    function loadGoogleFontInShadow(url, shadowRoot) {
        return new Promise((resolve, reject) => {
            if (!shadowRoot) {
                return reject(new Error("Shadow root non fornito per caricare Google Font."));
            }
            // Il preconnect può rimanere nel head, ma il link stylesheet va nello shadow
            const preconnectLink = document.createElement('link');
            preconnectLink.rel = 'preconnect';
            preconnectLink.href = 'https://fonts.gstatic.com';
            document.head.appendChild(preconnectLink);

            const fontLink = document.createElement('link');
            fontLink.rel = 'stylesheet';
            fontLink.href = url;
            fontLink.onload = () => {
                resolve();
            };
            fontLink.onerror = (error) => {
                reject(error);
            };
            shadowRoot.appendChild(fontLink); // <-- Appendi allo shadow root
        });
    }

    // Funzione per inizializzare il chatbot (logica aggiornata per Shadow DOM)
    async function initializeChatbot() {
        try {
            // 1. Carica gli script essenziali per la creazione della UI e Core
            // Assicurati che l'ordine sia corretto per le dipendenze
            await loadScript(`${BASE_URL}/chatbot-ui.js`);
            await loadScript(`${BASE_URL}/chatbot-message-handler.js`); // Se Chatbot dipende da questo
            await loadScript(`${BASE_URL}/chatbot-core.js`); // Contiene la classe Chatbot

            if (typeof ChatbotUI === 'undefined' || typeof Chatbot === 'undefined') {
                console.error("Loader: ChatbotUI o Chatbot non definiti dopo caricamento script.");
                return;
            }

            // 2. Crea l'istanza del Chatbot
            // L'istanza ora gestirà la creazione del DOM interno
            const chatbotInstance = new Chatbot();
            window.chatbotInstance = chatbotInstance; // Rendi globale se necessario

            const lottieURL = "https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js";
            await loadScript(lottieURL);
            // 6. Carica script rimanenti (es. chatbot-lottie.js)
            // Assicurati che chatbot-lottie.js sia caricato DOPO Lottie e DOPO la creazione del DOM
            await loadScript(`${BASE_URL}/chatbot-lottie.js`);

            await chatbotInstance.initialize({ loadCSSInShadow, loadGoogleFontInShadow, chatbotStyleURLs }); // Passa le funzioni/dati necessari

        } catch (error) {
            console.error("Errore durante l'inizializzazione del chatbot:", error);
        }
    }

    // Assicurati che il DOM sia pronto prima di eseguire l'inizializzazione
    if (document.readyState === 'loading') { // Loading hasn't finished yet
        document.addEventListener('DOMContentLoaded', initializeChatbot);
    } else { // `DOMContentLoaded` has already fired
        initializeChatbot();
    }

})(); // IIFE (Immediately Invoked Function Expression) per evitare conflitti globali 