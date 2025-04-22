// chatbot-core.js

// Importa (potremmo usare import dinamici o caricare tutto nel loader)
// import { createDOM, displayMessage, toggleVisibility, clearInput, getInputValue } from './chatbot-ui.js';
// import { initializeMessageHandler } from './chatbot-message-handler.js';

class Chatbot {
    constructor() {
        console.log("Chatbot Core: Istanziato");
        this.isOpen = false;
        this.elements = {}; // Conterrà riferimenti a elementi DOM importanti (contenitore, input, area messaggi, etc.)
        this.config = {}; // Per configurazioni future

        // Bind `this` per i metodi usati come callback
        this.toggleChat = this.toggleChat.bind(this);
        this.handleSendMessage = this.handleSendMessage.bind(this);
    }

    async initialize(config = {}) {
        console.log("Chatbot Core: Inizializzazione...");
        this.config = config;

        try {
            // Assumiamo che UI e Handler siano caricati globalmente dal loader per ora
            // In futuro potremmo usare import dinamici
            if (typeof ChatbotUI === 'undefined' || typeof ChatbotMessageHandler === 'undefined') {
                 console.error("Moduli UI o MessageHandler non caricati.");
                 // Aggiungere un ritardo e riprovare?
                 await new Promise(resolve => setTimeout(resolve, 200)); 
                 if (typeof ChatbotUI === 'undefined' || typeof ChatbotMessageHandler === 'undefined') {
                     console.error("Moduli UI o MessageHandler ancora non disponibili dopo il ritardo.");
                     return;
                 }
            }

            // 1. Creare il DOM (da chatbot-ui.js)
            // Passiamo la funzione toggleChat come callback per i bottoni
            this.elements = ChatbotUI.createDOM(this.toggleChat);
            document.body.appendChild(this.elements.toggleButton);
            document.body.appendChild(this.elements.chatContainer);
            console.log("Chatbot Core: DOM creato", this.elements);

            // 2. Inizializzare il gestore messaggi (da chatbot-message-handler.js)
            ChatbotMessageHandler.initializeMessageHandler(
                this.elements.messageInput,
                this.elements.sendButton,
                this.handleSendMessage // Passa la funzione di core come callback
            );
            console.log("Chatbot Core: Gestore messaggi inizializzato.");

            console.log("Chatbot Core: Inizializzazione completata.");

        } catch (error) {
            console.error("Chatbot Core: Errore durante l'inizializzazione", error);
        }
    }

    toggleChat() {
        console.log("Chatbot Core: Toggle richiesto");
        this.isOpen = !this.isOpen;
        // Chiamare la funzione UI per aggiornare la visibilità
        ChatbotUI.toggleVisibility(this.elements.chatContainer, this.elements.toggleButton, this.isOpen);
        console.log(`Chatbot Core: Stato ${this.isOpen ? 'aperto' : 'chiuso'}`);
    }

    handleSendMessage(text) {
        console.log(`Chatbot Core: Messaggio ricevuto da handler - ${text}`);
        if (!text.trim()) return;

        // 1. Mostra messaggio utente (usando la UI)
        ChatbotUI.displayMessage(this.elements.messageArea, text, 'user');

        // 2. Pulisci input (usando la UI)
        ChatbotUI.clearInput(this.elements.messageInput);

        // 3. Genera e mostra risposta bot (logica semplice per ora)
        // Simula un piccolo ritardo per la risposta
        setTimeout(() => {
            const botResponse = `Hai detto: ${text}`;
            ChatbotUI.displayMessage(this.elements.messageArea, botResponse, 'bot');
        }, 500);
    }

    // Metodo statico per caricare CSS (potrebbe rimanere qui o spostato)
    static loadCSS(url) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = url;
            link.onload = () => {
                console.log(`CSS caricato da Core: ${url}`);
                resolve();
            };
            link.onerror = (error) => {
                console.error(`Errore nel caricamento del CSS da Core: ${url}`, error);
                reject(error);
            };
            document.head.appendChild(link);
        });
    }
}

// Rendi la classe disponibile globalmente (semplifica il caricamento dal loader per ora)
window.Chatbot = Chatbot; 