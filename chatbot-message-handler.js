// chatbot-message-handler.js

const ChatbotMessageHandler = {
    /**
     * Inizializza gli event listener per l'input e l'invio dei messaggi.
     * @param {HTMLInputElement} inputElement - L'elemento input.
     * @param {HTMLButtonElement} sendButton - Il bottone di invio.
     * @param {function} sendMessageCallback - La funzione (nel core) da chiamare quando un messaggio valido viene inviato.
     */
    initializeMessageHandler(inputElement, sendButton, sendMessageCallback) {

        // Gestore comune per inviare il messaggio
        const handleSend = () => {
            const text = ChatbotUI.getInputValue(inputElement); // Usa la funzione UI per ottenere il valore
            if (text.trim()) {
                sendMessageCallback(text.trim());
            } 
        };

        // Event listener per il click sul bottone
        sendButton.addEventListener('click', handleSend);

        // Event listener per il tasto Invio nell'input
        inputElement.addEventListener('keypress', (event) => {
            // Controlla se il tasto premuto è Invio (Enter)
            if (event.key === 'Enter') {
                event.preventDefault(); // Previene il comportamento di default (es. a capo in textarea)
                
                // Controlla se il bottone di invio è disabilitato
                if (sendButton.disabled) {
                    console.log("MessageHandler: Invio bloccato (bottone disabilitato).");
                    return; // Non fare nulla se il bottone è disabilitato
                }

                handleSend();
            }
        });

    }
};

// Rendi disponibile globalmente
window.ChatbotMessageHandler = ChatbotMessageHandler; 