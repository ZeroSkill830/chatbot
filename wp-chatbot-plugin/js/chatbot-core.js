class Chatbot {
    constructor() {
        this.isOpen = false;
        this.elements = {}; // Conterrà riferimenti a elementi DOM importanti (contenitore, input, area messaggi, etc.)
        this.config = {}; // Per configurazioni future
        this.currentTypingIndicator = null; // Aggiungi variabile di istanza

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

        // 3. Mostra indicatore di scrittura e memorizza riferimento
        if (this.currentTypingIndicator) {
             console.warn("(WP) Rimosso indicatore di scrittura precedente non eliminato.");
             ChatbotUI.removeTypingIndicator(this.currentTypingIndicator, this.elements.sendButton, this.elements.quickActionsContainer);
        }
        this.currentTypingIndicator = ChatbotUI.displayTypingIndicator(
            this.elements.messageArea, 
            this.elements.sendButton, 
            this.elements.quickActionsContainer
        );

        // 4. Innesca la chiamata API
        this.sendMessageToApi(text);
    }

    // Funzione per inviare messaggio all'API (Implementazione Task 3 & 4)
    async sendMessageToApi(messageText) {
        console.log("Chatbot Core (WP): Invio messaggio all'API:", messageText);
        const apiToken = window.chatbotAuthToken;
        const messagesApiUrl = 'https://macaw-eager-gradually.ngrok-free.app/89b90056-4cc4-054a-a3db-9a3c0ded7efc/message'; // <-- PLACEHOLDER - Configurare nel Task 6

        if (!apiToken) {
            console.error("Chatbot Core (WP): Token API non disponibile. Impossibile inviare messaggio.");
            ChatbotUI.displayMessage(this.elements.messageArea, "Errore: Autenticazione fallita.", 'error');
            // Rimuovi indicatore usando la variabile di istanza
            if (this.currentTypingIndicator) {
                ChatbotUI.removeTypingIndicator(this.currentTypingIndicator, this.elements.sendButton, this.elements.quickActionsContainer);
                this.currentTypingIndicator = null;
            }
            return; 
        }

        try {
            // Prepara FormData
            const formData = new FormData();
            formData.append('text', messageText); // Messaggio utente
            formData.append('user', 'user');       // User ID fisso
            formData.append('client', '89b90056-4cc4-054a-a3db-9a3c0ded7efc');      // Client ID fisso

            const response = await fetch(messagesApiUrl, {
                method: 'POST',
                headers: {
                    // 'Content-Type': 'application/json', // Rimosso, il browser lo imposta per FormData
                    'Authorization': `Bearer ${apiToken}`
                },
                 // body: JSON.stringify({ message: messageText }) // Sostituito con formData
                body: formData
            });

            // --- GESTIONE RISPOSTA (Task 4) --- 
            let botReplyText = "";
            let errorMessage = "";

            if (response.ok) {
                try {
                    const data = await response.json();
                    // --- NUOVA ESTRAZIONE RISPOSTA (Task 4) --- 
                    if (Array.isArray(data) && data.length > 0 && data[0].text) {
                        botReplyText = data[0].text;
                        console.log("Chatbot Core (WP): Risposta API estratta:", botReplyText);
                    } else {
                        console.warn("Chatbot Core (WP): Struttura risposta API non riconosciuta o testo mancante.", data);
                        botReplyText = "Ho ricevuto una risposta ma non sono riuscito a leggerla correttamente.";
                    }
                    // --- FINE NUOVA ESTRAZIONE ---
                    
                } catch (jsonError) {
                    console.error("Chatbot Core (WP): Errore parsing JSON dalla risposta API:", jsonError);
                    errorMessage = "Errore nella lettura della risposta del bot.";
                }
            } else {
                console.error(`Chatbot Core (WP): Errore API - Status: ${response.status} ${response.statusText}`);
                errorMessage = `Errore dal server (${response.status}). Riprova più tardi.`;
            }

            // --- AGGIORNAMENTO UI (Task 5) --- 

            // Rimuovi l'indicatore usando la variabile di istanza
            if (this.currentTypingIndicator) {
                ChatbotUI.removeTypingIndicator(
                    this.currentTypingIndicator,
                    this.elements.sendButton,
                    this.elements.quickActionsContainer
                );
                this.currentTypingIndicator = null;
            }

            // Mostra la risposta del bot o il messaggio di errore
            if (errorMessage) {
                ChatbotUI.displayMessage(this.elements.messageArea, errorMessage, 'error');
            } else if (botReplyText) {
                ChatbotUI.displayMessage(this.elements.messageArea, botReplyText, 'bot');
            } else {
                 console.warn("Chatbot Core (WP): Nessuna risposta o errore da mostrare.");
            }
            
        } catch (error) {
            console.error("Chatbot Core (WP): Errore durante la chiamata fetch all'API:", error);
            errorMessage = "Errore di connessione con il bot.";
            // Gestire errore UI anche qui (rimuovi indicatore se presente)
            if (this.currentTypingIndicator) {
                ChatbotUI.removeTypingIndicator(this.currentTypingIndicator, this.elements.sendButton, this.elements.quickActionsContainer);
                this.currentTypingIndicator = null;
            }
            ChatbotUI.displayMessage(this.elements.messageArea, errorMessage, 'error');
        }
    }
}

// Rendi la classe disponibile globalmente (semplifica il caricamento dal loader per ora)
window.Chatbot = Chatbot; 