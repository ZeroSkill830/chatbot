(function() {
    console.log("Loader script eseguito.");

    // Configurazioni (potrebbero venire da attributi data-* dello script tag in futuro)
    const chatbotScriptURL = 'chatbot.js';
    const chatbotCSSURL = 'style.css';

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
            // Carica prima il CSS
            // Usiamo il metodo statico definito (o che definiremo) in Chatbot,
            // ma visto che Chatbot non è ancora caricato, replichiamo la logica qui per ora
            // o la mettiamo in una utility globale.
            // Semplifichiamo: carichiamo il CSS dopo lo script JS principale.

            // Carica lo script principale del chatbot
            await loadScript(chatbotScriptURL);

            // Assicurati che la classe Chatbot sia disponibile
            // (potrebbe essere necessario un piccolo ritardo o un controllo)
            if (typeof Chatbot === 'undefined') {
                console.error("La classe Chatbot non è stata definita o caricata correttamente.");
                return;
            }

            // Ora carica il CSS usando il metodo statico della classe Chatbot
            await Chatbot.loadCSS(chatbotCSSURL);

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