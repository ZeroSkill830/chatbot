// chatbot-message-handler.js

const ChatbotMessageHandler = {
    /**
     * Inizializza gli event listener per l'input e l'invio dei messaggi.
     * @param {HTMLInputElement} inputElement - L'elemento input.
     * @param {HTMLButtonElement} sendButton - Il bottone di invio.
     * @param {function} sendMessageCallback - La funzione (nel core) da chiamare quando un messaggio valido viene inviato.
     */
    initializeMessageHandler(inputElement, sendButton, sendMessageCallback) {
        if (!inputElement || !sendButton || typeof sendMessageCallback !== 'function') {
            console.error("MessageHandler: Elementi input/bottone o callback mancanti.");
            return;
        }

        console.log("MessageHandler: Inizializzazione listeners...");

        // Gestore comune per inviare il messaggio
        const handleSend = () => {
            const text = ChatbotUI.getInputValue(inputElement); // Usa la funzione UI per ottenere il valore
            if (text.trim()) {
                sendMessageCallback(text.trim());
                // La pulizia dell'input verrà fatta dal core dopo aver mostrato il messaggio utente
                // ChatbotUI.clearInput(inputElement); 
            } else {
                console.log("MessageHandler: Messaggio vuoto, invio ignorato.");
            }
        };

        // Event listener per il click sul bottone
        sendButton.addEventListener('click', handleSend);

        // Event listener per il tasto Invio nell'input
        inputElement.addEventListener('keypress', (event) => {
            // Controlla se il tasto premuto è Invio (Enter)
            if (event.key === 'Enter') {
                event.preventDefault(); // Previene il comportamento di default (es. a capo in textarea)
                handleSend();
            }
        });

        console.log("MessageHandler: Listeners inizializzati.");
    }
    
    // Non c'è più una funzione handleSendMessage specifica qui,
    // perché la logica è stata spostata nel core (`handleSendMessage` in `chatbot-core.js`)
    // che viene passato come `sendMessageCallback`.
};

// Rendi disponibile globalmente
window.ChatbotMessageHandler = ChatbotMessageHandler; 