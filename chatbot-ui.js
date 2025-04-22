// chatbot-ui.js

const ChatbotUI = {
    /**
     * Crea gli elementi DOM base per il chatbot (bottone e finestra).
     * @param {function} toggleCallback - La funzione da chiamare quando si clicca il bottone flottante o il bottone di chiusura.
     * @returns {object} Un oggetto contenente i riferimenti agli elementi DOM principali creati.
     */
    createDOM(toggleCallback) {
        console.log("Chatbot UI: Creazione DOM...");

        // --- Bottone Flottante ---
        const toggleButton = document.createElement('button');
        toggleButton.className = 'chatbot-toggle-button';
        toggleButton.innerHTML = '<span>?</span>'; // Icona iniziale
        toggleButton.onclick = toggleCallback; // Collega alla funzione del core

        // --- Contenitore Chat ---
        const chatContainer = document.createElement('div');
        chatContainer.className = 'chatbot-container';

        // --- Header ---
        const header = document.createElement('div');
        header.className = 'chatbot-header';
        header.innerHTML = `
            <span>Chatbot</span>
            <button class="chatbot-close-button">&times;</button>
        `;
        const closeButton = header.querySelector('.chatbot-close-button');
        if (closeButton) {
            closeButton.onclick = toggleCallback; // Collega anche il bottone close
        }

        // --- Area Messaggi ---
        const messageArea = document.createElement('div');
        messageArea.className = 'chatbot-message-area';

        // --- Footer (Input e Bottone Invia) ---
        const footer = document.createElement('div');
        footer.className = 'chatbot-footer';
        const messageInput = document.createElement('input');
        messageInput.type = 'text';
        messageInput.placeholder = 'Scrivi un messaggio...';
        messageInput.className = 'chatbot-input';
        const sendButton = document.createElement('button');
        sendButton.className = 'chatbot-send-button';
        sendButton.textContent = 'Invia';

        footer.appendChild(messageInput);
        footer.appendChild(sendButton);

        // Assembla il contenitore
        chatContainer.appendChild(header);
        chatContainer.appendChild(messageArea);
        chatContainer.appendChild(footer);

        console.log("Chatbot UI: DOM creato.");

        // Restituisce i riferimenti agli elementi chiave
        return {
            toggleButton,
            chatContainer,
            header,
            messageArea,
            footer,
            messageInput,
            sendButton,
            closeButton
        };
    },

    /**
     * Mostra/nasconde la finestra della chat e aggiorna l'icona del bottone flottante.
     * @param {HTMLElement} chatContainer - L'elemento contenitore della chat.
     * @param {HTMLElement} toggleButton - Il bottone flottante.
     * @param {boolean} isOpen - Lo stato desiderato (true = aperto, false = chiuso).
     */
    toggleVisibility(chatContainer, toggleButton, isOpen) {
        if (!chatContainer || !toggleButton) return;
        chatContainer.style.display = isOpen ? 'flex' : 'none';
        toggleButton.innerHTML = isOpen ? '<span>&times;</span>' : '<span>?</span>';
        console.log(`Chatbot UI: Visibilità aggiornata a ${isOpen}`);
    },

    /**
     * Aggiunge un messaggio all'area di visualizzazione.
     * @param {HTMLElement} messageArea - L'elemento dove aggiungere i messaggi.
     * @param {string} text - Il testo del messaggio.
     * @param {'user' | 'bot'} sender - Chi ha inviato il messaggio.
     */
    displayMessage(messageArea, text, sender) {
        if (!messageArea || !text) return;
        const messageElement = document.createElement('div');
        messageElement.classList.add('chatbot-message', `chatbot-message-${sender}`);
        messageElement.textContent = text;
        messageArea.appendChild(messageElement);

        // Scroll automatico
        messageArea.scrollTop = messageArea.scrollHeight;
        console.log(`Chatbot UI: Messaggio [${sender}] visualizzato: ${text}`);
    },

    /**
     * Pulisce il campo di input.
     * @param {HTMLInputElement} inputElement - L'elemento input da pulire.
     */
    clearInput(inputElement) {
        if (inputElement) {
            inputElement.value = '';
            console.log("Chatbot UI: Input pulito.");
        }
    },

    /**
     * Restituisce il valore attuale del campo di input.
     * @param {HTMLInputElement} inputElement - L'elemento input.
     * @returns {string} Il valore dell'input.
     */
    getInputValue(inputElement) {
        return inputElement ? inputElement.value : '';
    }
};

// Rendi disponibile globalmente
window.ChatbotUI = ChatbotUI; 