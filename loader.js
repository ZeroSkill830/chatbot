(function () {
    // Flag per caricamento locale vs remoto
    const LOAD_REMOTELY = true; // Imposta a true per caricare da GitHub Pages

    // Definisci BASE_URL dinamicamente
    const BASE_URL = LOAD_REMOTELY ? "https://zeroskill830.github.io/chatbot" : ".";

    // Esponi BASE_URL globalmente per altri script (es. Lottie path)
    window.CHATBOT_BASE_URL = BASE_URL;

    // Lista degli script da caricare in ordine (usa BASE_URL)
    const chatbotScripts = [
        `${BASE_URL}/wine-experience.js`,         // Prima l'esperienza dei vini
        `${BASE_URL}/chatbot-ui.js`,          // Poi la UI
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
        `${BASE_URL}/styles/wine-experience.css`, // Aggiungo il CSS per l'esperienza dei vini
        `${BASE_URL}/styles/wine-tasting-modal.css`, // CSS per il modal di degustazione
        `${BASE_URL}/styles/mode-selection-modal.css`, // CSS per la modale di selezione livello
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

    // Funzione per ottenere il token di autenticazione
    async function fetchAuthToken() {
        const tokenUrl = 'https://macaw-eager-gradually.ngrok-free.app/auth/token'; // <-- CONFIGURARE QUESTO URL!
        console.log("Loader: Tentativo di ottenere token da", tokenUrl);
        try {
            // Assumiamo un metodo POST senza corpo, da adattare se necessario
            const response = await fetch(tokenUrl, {
                method: 'POST', // o 'GET', a seconda dell'API
                headers: {
                    'Content-Type': 'application/json',
                    // Aggiungere altri header se richiesti dall'API auth/token
                },
                body: JSON.stringify({ clientId: 'discord' }) // Aggiungere corpo se necessario
            });

            if (!response.ok) {
                throw new Error(`Errore HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json(); 
            // Assumiamo che il token sia in una proprietà 'accessToken' o 'token'
            const token = data.accessToken || data.token;
            if (!token) {
                 throw new Error("Token non trovato nella risposta dell'API.");
            }
            console.log("Loader: Token ottenuto con successo.");
            window.chatbotAuthToken = token; // Memorizza il token globalmente
            return token;
        } catch (error) {
            console.error("Loader: Impossibile ottenere il token di autenticazione:", error);
            window.chatbotAuthToken = null; // Assicura che sia null in caso di errore
            // Potrebbe essere utile impedire ulteriori inizializzazioni o mostrare un errore
            return null;
        }
    }

    // Funzione per inizializzare il chatbot (modificata)
    async function initializeChatbot() {
        try {
            // *** NUOVO: Ottieni prima il token ***
            const authToken = await fetchAuthToken();
            if (!authToken) {
                console.error("Loader: Inizializzazione interrotta - Token non disponibile.");
                return;
            }

            // Carica tutti gli script in ordine
            for (const scriptUrl of chatbotScripts) {
                await loadScript(scriptUrl);
            }

            if (typeof ChatbotUI === 'undefined' || typeof Chatbot === 'undefined') {
                console.error("Loader: ChatbotUI o Chatbot non definiti dopo caricamento script.");
                return;
            }

            // Crea l'istanza del Chatbot
            const chatbotInstance = new Chatbot();
            window.chatbotInstance = chatbotInstance;

            // Carica Lottie prima di chatbot-lottie.js
            const lottieURL = "https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js";
            await loadScript(lottieURL);
            console.log("Loader: Libreria Lottie caricata.");


            await chatbotInstance.initialize({ 
                loadCSSInShadow, 
                loadGoogleFontInShadow, 
                chatbotStyleURLs
            });

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