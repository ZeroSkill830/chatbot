(function() {
    console.log("Loader script eseguito.");

    // -------- MODIFICA NECESSARIA QUI --------
    // Sostituisci con l'URL reale del tuo repository GitHub Pages
    const GITHUB_PAGES_BASE_URL = "https://zeroskill830.github.io/chatbot"; // <-- CAMBIA QUESTO!
    // -----------------------------------------

    const chatbotScriptURL = `${GITHUB_PAGES_BASE_URL}/chatbot.js`;
    const chatbotCSSURL = `${GITHUB_PAGES_BASE_URL}/style.css`;

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

    // Funzione per inizializzare il chatbot
    async function initializeChatbot() {
        console.log("Inizializzazione chatbot...");
        try {
            // Carica lo script principale del chatbot
            await loadScript(chatbotScriptURL);

            // Assicurati che la classe Chatbot sia disponibile
            // (Aggiungiamo un piccolo ritardo e riproviamo una volta per sicurezza)
            if (typeof Chatbot === 'undefined') {
                await new Promise(resolve => setTimeout(resolve, 100)); 
                if (typeof Chatbot === 'undefined') {
                    console.error("La classe Chatbot non è stata definita o caricata correttamente.");
                    return;
                } 
            }

            // Ora carica il CSS usando il metodo statico della classe Chatbot
            // Assicurati che il metodo esista prima di chiamarlo
            if (Chatbot && typeof Chatbot.loadCSS === 'function') {
                await Chatbot.loadCSS(chatbotCSSURL);
            } else {
                console.error("Metodo Chatbot.loadCSS non trovato.");
                // Potresti voler implementare un fallback qui se necessario
            }

            // Crea l'istanza del chatbot
            const chatbotInstance = new Chatbot();

            // Crea l'UI del chatbot
            chatbotInstance.createUI();

            console.log("Chatbot inizializzato con successo!");

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