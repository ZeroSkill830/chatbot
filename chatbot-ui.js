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
        // toggleButton.innerHTML = '<span>?</span>'; // Rimosso: useremo Lottie

        // Crea il contenitore per l'animazione Lottie
        const lottieContainer = document.createElement('div');
        lottieContainer.className = 'chatbot-toggle-lottie'; // Aggiungi una classe per lo styling
        toggleButton.appendChild(lottieContainer);

        let lottieAnimation = null; // Inizializza a null
        if (typeof initLottieAnimation === 'function') {
            lottieAnimation = initLottieAnimation(lottieContainer, toggleButton);
            console.log("Chatbot UI: Animazione Lottie inizializzata tramite chatbot-lottie.js.");
        } else {
            console.error("Chatbot UI: Funzione initLottieAnimation non trovata. Assicurati che chatbot-lottie.js sia caricato.");
            // Fallback: mostra un'icona statica o testo se Lottie non è disponibile
            toggleButton.innerHTML = '<span>?</span>';
        }
       

        toggleButton.onclick = toggleCallback; // Collega alla funzione del core

        // --- Contenitore Chat ---
        const chatContainer = document.createElement('div');
        chatContainer.className = 'chatbot-container';

        // --- Header ---
        const header = document.createElement('div');
        header.className = 'chatbot-header';
        header.innerHTML = `
            <span>Agento Wine 🍷</span>
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
            closeButton,
            lottieAnimation
        };
    },

    /**
     * Mostra/nasconde la finestra della chat e aggiorna l'icona del bottone flottante.
     * @param {HTMLElement} chatContainer - L'elemento contenitore della chat.
     * @param {HTMLElement} toggleButton - Il bottone flottante.
     * @param {boolean} isOpen - Lo stato desiderato (true = aperto, false = chiuso).
     * @param {object} lottieAnimation - L'istanza dell'animazione Lottie (opzionale, per il nuovo toggle).
     */
    toggleVisibility(chatContainer, toggleButton, isOpen, lottieAnimation) {
        if (!chatContainer || !toggleButton) return;
        chatContainer.style.display = isOpen ? 'flex' : 'none';
        // toggleButton.innerHTML = isOpen ? '<span>&times;</span>' : '<span>?</span>'; // Rimosso
        console.log(`Chatbot UI: Visibilità aggiornata a ${isOpen}`);

        // Imposta l'attributo data per sapere lo stato su hover leave
        toggleButton.setAttribute('data-is-open', isOpen.toString());

        // Controlla l'animazione Lottie: chiama la funzione esterna
        if (typeof setLottieState === 'function' && lottieAnimation) {
            setLottieState(lottieAnimation, isOpen);
        }
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
    },

    /**
     * Mostra l'indicatore di scrittura "..." nell'area messaggi.
     * @param {HTMLElement} messageArea - L'elemento dove aggiungere l'indicatore.
     * @returns {HTMLElement} L'elemento indicatore creato.
     */
    displayTypingIndicator(messageArea) {
        if (!messageArea) return null;
        const indicatorElement = document.createElement('div');
        indicatorElement.classList.add('chatbot-message', 'chatbot-message-typing-indicator'); // Riutilizza la classe base e aggiungi quella specifica

        // Crea i puntini animati
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('span');
            dot.classList.add('chatbot-typing-dot');
            indicatorElement.appendChild(dot);
        }

        messageArea.appendChild(indicatorElement);
        // Scroll automatico per mostrare l'indicatore
        messageArea.scrollTop = messageArea.scrollHeight;
        console.log("Chatbot UI: Indicatore di scrittura visualizzato.");
        return indicatorElement; // Restituisce il riferimento per poterlo rimuovere
    },

    /**
     * Rimuove un elemento (l'indicatore di scrittura) dal DOM.
     * @param {HTMLElement} indicatorElement - L'elemento indicatore da rimuovere.
     */
    removeTypingIndicator(indicatorElement) {
        if (indicatorElement && indicatorElement.parentNode) {
            indicatorElement.parentNode.removeChild(indicatorElement);
            console.log("Chatbot UI: Indicatore di scrittura rimosso.");
        }
    }
};

// Rendi disponibile globalmente
window.ChatbotUI = ChatbotUI; 