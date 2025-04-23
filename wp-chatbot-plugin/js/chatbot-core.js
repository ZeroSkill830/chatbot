class Chatbot {
    constructor() {
        this.isOpen = false;
        this.elements = {}; // Conterrà riferimenti a elementi DOM importanti (contenitore, input, area messaggi, etc.)
        this.config = {}; // Per configurazioni future

        // Bind `this` per i metodi usati come callback
        this.toggleChat = this.toggleChat.bind(this);
        this.handleSendMessage = this.handleSendMessage.bind(this);
    }

    async initialize(config = {}) {
        this.config = config;
        // Estrai le funzioni e gli URL passati da init.js
        const { loadCSSInShadow, chatbotStyleURLs /*, loadGoogleFontInShadow - non usato in WP */ } = config;

        try {
           
            // 1. Creare Host, Shadow DOM e UI base (da chatbot-ui.js)
            this.elements = ChatbotUI.createDOM(
                this.toggleChat,      // Callback per toggle
                this.handleSendMessage // Callback per invio messaggio (quick actions)
            );

            // 2. Aggiungere l'host al body
            document.body.appendChild(this.elements.hostElement);

            // 3. Caricare CSS *nello* Shadow DOM
            const cssPromises = chatbotStyleURLs.map(url => {
                console.log(`Chatbot Core (WP): Preparazione chiamata a loadCSSInShadow per ${url}`); // Log per ogni URL
                return loadCSSInShadow(url, this.elements.shadowRoot);
            });
            await Promise.all(cssPromises);

            // 4. Inizializzare Lottie (DOPO caricamento CSS)
            this.elements.lottieAnimation = initLottieAnimation(
                this.elements.lottieContainer, 
                this.elements.toggleButton
            );

            // 5. Inizializzare il gestore messaggi
            ChatbotMessageHandler.initializeMessageHandler(
                this.elements.messageInput,
                this.elements.sendButton,
                this.handleSendMessage // Passa la funzione di core come callback
            );

        } catch (error) {
            console.error("Chatbot Core: Errore durante l'inizializzazione", error);
        }
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        // Chiamare la funzione UI per aggiornare la visibilità
        ChatbotUI.toggleVisibility(
            this.elements.chatContainer,
            this.elements.toggleButton,
            this.isOpen,
            this.elements.lottieAnimation // Passa l'animazione Lottie
        );
    }

    handleSendMessage(text) {
        if (!text.trim()) return;

        // 1. Mostra messaggio utente (usando la UI)
        ChatbotUI.displayMessage(this.elements.messageArea, text, 'user');

        // 2. Pulisci input (usando la UI)
        ChatbotUI.clearInput(this.elements.messageInput);

        // 3. Mostra indicatore di scrittura
        const typingIndicator = ChatbotUI.displayTypingIndicator(
            this.elements.messageArea, 
            this.elements.sendButton, 
            this.elements.quickActionsContainer
        );

        // 4. Genera e mostra risposta bot (logica semplice per ora)
        // Simula un piccolo ritardo per la risposta
        setTimeout(() => {
            // Rimuovi indicatore di scrittura
            ChatbotUI.removeTypingIndicator(
                typingIndicator, 
                this.elements.sendButton, 
                this.elements.quickActionsContainer
            );

            const botResponse = `Hai detto: ${text}`;
            ChatbotUI.displayMessage(this.elements.messageArea, botResponse, 'bot');
        }, 1500); // Aumentato leggermente il timeout per vedere l'indicatore
    }
}

// Rendi la classe disponibile globalmente (semplifica il caricamento dal loader per ora)
window.Chatbot = Chatbot; 