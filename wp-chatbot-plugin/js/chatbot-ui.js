// chatbot-ui.js


const ChatbotUI = {
    /**
     * Crea gli elementi DOM base per il chatbot (bottone e finestra).
     * @param {function} toggleCallback - La funzione da chiamare quando si clicca il bottone flottante o il bottone di chiusura.
     * @param {function} sendMessageCallback - La funzione da chiamare per inviare un messaggio (usata dalle quick actions).
     * @returns {object} Un oggetto contenente i riferimenti agli elementi DOM principali creati.
     */
    createDOM(toggleCallback, sendMessageCallback) {
        console.log("Chatbot UI: Creazione DOM...");

        const hostElement = document.createElement('div');
        hostElement.id = 'chatbot-host';
        console.log("Chatbot UI (createDOM): hostElement creato:", hostElement); // Log creazione host

        // --- Attacca Shadow Root ---
        let shadowRoot = null; // Inizializza a null
        try {
            shadowRoot = hostElement.attachShadow({ mode: 'open' });
            console.log("Chatbot UI (createDOM): shadowRoot creato:", shadowRoot); // Log creazione shadow root
        } catch (e) {
            console.error("Chatbot UI (createDOM): Errore durante attachShadow:", e);
            // Se attachShadow fallisce, non possiamo procedere con l'appendere elementi
            // Restituiamo un oggetto che farà fallire il check in core.js
            return { hostElement }; 
        }

        // Aggiunta verifica esistenza shadowRoot prima di usarlo
        if (!shadowRoot) {
            console.error("Chatbot UI (createDOM): shadowRoot non è valido dopo attachShadow, impossibile procedere.");
            return { hostElement }; // Restituisci oggetto incompleto
        }

        // --- Bottone Flottante ---
        const toggleButton = document.createElement('button');
        toggleButton.className = 'chatbot-toggle-button';
        // toggleButton.innerHTML = '<span>?</span>'; // Rimosso: useremo Lottie

        // Crea il contenitore per l'animazione Lottie
        const lottieContainer = document.createElement('div');
        lottieContainer.className = 'chatbot-toggle-lottie'; // Aggiungi una classe per lo styling
        toggleButton.appendChild(lottieContainer);

       
        toggleButton.onclick = toggleCallback; // Collega alla funzione del core

        // --- Contenitore Chat ---
        const chatContainer = document.createElement('div');
        chatContainer.className = 'chatbot-container';

        // --- Header ---
        const header = document.createElement('div');
        header.className = 'chatbot-header';
        header.innerHTML = `
            <span>Hai bisogno di aiuto? <br> Chiedimi quello che vuoi! 💬</span>
            <button class="chatbot-close-button">&times;</button>
        `;
        const closeButton = header.querySelector('.chatbot-close-button');
        if (closeButton) {
            closeButton.onclick = toggleCallback; // Collega anche il bottone close
        }

        // --- Area Messaggi ---
        const messageArea = document.createElement('div');
        messageArea.className = 'chatbot-message-area';

        // --- Quick Actions Container ---
        const quickActionsContainer = document.createElement('div');
        quickActionsContainer.className = 'chatbot-quick-actions-container';

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
        chatContainer.appendChild(quickActionsContainer);
        chatContainer.appendChild(footer);

        // --- Branding --- 
        const branding = document.createElement('div');
        branding.className = 'chatbot-branding';
        branding.innerHTML = 'Made with ❤️ from <a href="https://x.com/agentolabs" target="_blank" rel="noopener noreferrer">AgentoLabs</a>'; // Testo con link
        chatContainer.appendChild(branding);

        // --- Popola Quick Actions (Esempio) ---
        const quickActions = [
            "Miglior vino rosso? 🍷" ,
            "Fate degustazioni? 🥂",
            "Vini in offerta 🏷️",
        ];

        quickActions.forEach(actionText => {
            const button = document.createElement('button');
            button.className = 'chatbot-quick-action-button';
            button.textContent = actionText;
            button.onclick = () => {
                // Chiama la funzione per inviare il messaggio
                // Usa la callback passata invece di cercare l'istanza globale
                if (typeof sendMessageCallback === 'function') {
                    sendMessageCallback(actionText);
                } else {
                }
            };
            quickActionsContainer.appendChild(button);
        });


        shadowRoot.appendChild(toggleButton); // Il bottone ora è nello Shadow DOM
        shadowRoot.appendChild(chatContainer); // Anche la finestra è nello Shadow DOM


        // Log prima del return per vedere l'oggetto completo
        const elementsToReturn = {
            hostElement,
            shadowRoot,
            toggleButton,
            lottieContainer,
            chatContainer,
            header,
            messageArea,
            quickActionsContainer,
            footer,
            messageInput,
            sendButton,
            closeButton,
            branding
        };

        // Restituisce i riferimenti inclusi host e shadow root
        return elementsToReturn;
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
    },

    /**
     * Pulisce il campo di input.
     * @param {HTMLInputElement} inputElement - L'elemento input da pulire.
     */
    clearInput(inputElement) {
        if (inputElement) {
            inputElement.value = '';
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
     * Mostra l'indicatore di scrittura "..." nell'area messaggi e disabilita il bottone Invia.
     * @param {HTMLElement} messageArea - L'elemento dove aggiungere l'indicatore.
     * @param {HTMLButtonElement} sendButton - Il bottone Invia da disabilitare.
     * @param {HTMLElement} quickActionsContainer - Il contenitore delle quick actions da nascondere.
     * @returns {HTMLElement} L'elemento indicatore creato.
     */
    displayTypingIndicator(messageArea, sendButton, quickActionsContainer) {
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

        // Disabilita il bottone Invia
        if (sendButton) {
            sendButton.disabled = true;
            console.log("Chatbot UI: Bottone Invia disabilitato.");
        }

        // Nascondi quick actions
        if (quickActionsContainer) {
            quickActionsContainer.classList.add('hidden');
            console.log("Chatbot UI: Quick actions nascoste (con classe).");
        }

        console.log("Chatbot UI: Indicatore di scrittura visualizzato.");
        return indicatorElement; // Restituisce il riferimento per poterlo rimuovere
    },

    /**
     * Rimuove un elemento (l'indicatore di scrittura) dal DOM e riabilita il bottone Invia.
     * @param {HTMLElement} indicatorElement - L'elemento indicatore da rimuovere.
     * @param {HTMLButtonElement} sendButton - Il bottone Invia da riabilitare.
     * @param {HTMLElement} quickActionsContainer - Il contenitore delle quick actions da mostrare.
     */
    removeTypingIndicator(indicatorElement, sendButton, quickActionsContainer) {
        if (indicatorElement && indicatorElement.parentNode) {
            indicatorElement.parentNode.removeChild(indicatorElement);
            console.log("Chatbot UI: Indicatore di scrittura rimosso.");

            // Riabilita il bottone Invia
            if (sendButton) {
                sendButton.disabled = false;
                console.log("Chatbot UI: Bottone Invia riabilitato.");
            }

            // Mostra quick actions
            if (quickActionsContainer) {
                quickActionsContainer.classList.remove('hidden');
                console.log("Chatbot UI: Quick actions mostrate (con classe).");
            }
        }
    }
};

// Rendi disponibile globalmente
window.ChatbotUI = ChatbotUI; 