// chatbot-ui.js


const ChatbotUI = {
    /**
     * Crea gli elementi DOM base per il chatbot (host, shadow root, bottone e finestra).
     * @param {function} toggleCallback - La funzione da chiamare quando si clicca il bottone flottante o il bottone di chiusura.
     * @param {function} sendMessageCallback - La funzione da chiamare per inviare un messaggio (usata dalle quick actions).
     * @returns {object} Un oggetto contenente i riferimenti all'host, allo shadow root e agli elementi DOM principali creati.
     */
    createDOM(toggleCallback, sendMessageCallback) {
        console.log("Chatbot UI: Creazione Host e Shadow DOM...");

        // --- Crea Elemento Host ---
        const hostElement = document.createElement('div');
        hostElement.id = 'chatbot-host'; // Assegna un ID all'host

        // --- Attacca Shadow Root ---
        const shadowRoot = hostElement.attachShadow({ mode: 'open' });
        console.log("Chatbot UI: Shadow DOM creato.");

        // --- Bottone Flottante ---
        const toggleButton = document.createElement('button');
        toggleButton.className = 'chatbot-toggle-button';
        // toggleButton.innerHTML = '<span>?</span>'; // Rimosso: useremo Lottie

        // Crea il contenitore per l'animazione Lottie
        const lottieContainer = document.createElement('div');
        lottieContainer.className = 'chatbot-toggle-lottie'; // Aggiungi una classe per lo styling
        toggleButton.appendChild(lottieContainer);

       
        toggleButton.onclick = toggleCallback; // Collega alla funzione del core

        // --- Contenitore Chat (ora dentro Shadow DOM) ---
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

        // Assembla il contenitore (dentro Shadow DOM)
        chatContainer.appendChild(header);
        chatContainer.appendChild(messageArea);
        chatContainer.appendChild(quickActionsContainer);
        chatContainer.appendChild(footer);

        // --- Branding --- 
        const branding = document.createElement('div');
        branding.className = 'chatbot-branding';
        branding.innerHTML = 'Made with ❤️ from <a href="https://x.com/agentolabs" target="_blank" rel="noopener noreferrer">AgentoLabs</a>'; // Testo con link
        chatContainer.appendChild(branding);

        // --- Popola Quick Actions (dentro Shadow DOM) ---
        const quickActions = [
            "Conosci la nostra azienda 🏡" ,
            "Organizzate visite? 📅",
            "Degustiamo insieme! 🥂",
        ];

        quickActions.forEach(actionText => {
            const button = document.createElement('button');
            button.className = 'chatbot-quick-action-button';
            button.textContent = actionText;
            button.onclick = async () => {
                if (actionText === "Degustiamo insieme! 🥂") {
                    // Usa la classe WineExperience globalmente
                    const wineExperience = new window.WineExperience();
                    await wineExperience.fetchWines();
                } else {
                    // Per le altre quick actions, comportamento normale
                    if (typeof sendMessageCallback === 'function') {
                        sendMessageCallback(actionText);
                    } else {
                        console.error("Chatbot UI: sendMessageCallback non è una funzione valida!");
                    }
                }
            };
            quickActionsContainer.appendChild(button);
        });

        // --- Aggiungi elementi principali allo Shadow Root ---
        shadowRoot.appendChild(toggleButton); // Il bottone ora è nello Shadow DOM
        shadowRoot.appendChild(chatContainer); // Anche la finestra è nello Shadow DOM

        console.log("Chatbot UI: Elementi UI appesi allo Shadow DOM.");

        // Aggiungi l'host al body (l'unico elemento aggiunto fuori dallo shadow)
        // Questo dovrebbe avvenire nella logica di inizializzazione principale (es. in chatbot-core.js o chatbot-init.js)
        // Qui prepariamo solo l'host.
        // document.body.appendChild(hostElement); // RIMOSSO DA QUI

        // Restituisce i riferimenti inclusi host e shadow root
        return {
            hostElement, // L'elemento a cui è attaccato lo shadow root
            shadowRoot,  // Il root dello shadow DOM
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

        // Imposta l'attributo data per sapere lo stato su hover leave
        toggleButton.setAttribute('data-is-open', isOpen.toString());

        // Controlla l'animazione Lottie: chiama la funzione esterna
        if (typeof setLottieState === 'function' && lottieAnimation) {
            setLottieState(lottieAnimation, isOpen);
        }
    },

    /**
     * Helper interno per convertire link stile Markdown in tag <a> HTML.
     * @param {string} text - Il testo da parsare.
     * @returns {string} Il testo con i link convertiti in HTML.
     */
    _parseMarkdownLinks(text) {
        // Regex per trovare [Testo](URL)
        // Cattura: gruppo 1 = Testo, gruppo 2 = URL
        // Corretta regex con escaping appropriato
        const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
        return text.replace(markdownLinkRegex, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    },

    /**
     * Aggiunge un messaggio all'area di visualizzazione, parsando i link Markdown.
     * @param {HTMLElement} messageArea - L'elemento dove aggiungere i messaggi.
     * @param {string} text - Il testo del messaggio (potrebbe contenere link Markdown).
     * @param {'user' | 'bot' | 'error'} sender - Chi ha inviato il messaggio.
     */
    displayMessage(messageArea, text, sender) {
        if (!messageArea || !text) return;
        const messageElement = document.createElement('div');
        messageElement.classList.add('chatbot-message', `chatbot-message-${sender}`);
        
        // --- NUOVO: Parsa il testo per i link prima di inserirlo --- 
        const parsedText = (sender === 'bot' || sender === 'error') ? this._parseMarkdownLinks(text) : text;
        messageElement.innerHTML = parsedText; // Usa il testo parsato
        
        messageArea.appendChild(messageElement);

        // Scroll automatico
        messageArea.scrollTop = messageArea.scrollHeight;
        console.log(`Chatbot UI: Messaggio [${sender}] visualizzato (come HTML, link parsati).`);
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
        }

        // Nascondi quick actions
        if (quickActionsContainer) {
            quickActionsContainer.classList.add('hidden');
        }

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

            // Riabilita il bottone Invia
            if (sendButton) {
                sendButton.disabled = false;
            }

            // Mostra quick actions
            if (quickActionsContainer) {
                quickActionsContainer.classList.remove('hidden');
            }
        }
    }
};

// Rendi disponibile globalmente (necessario se altri script la cercano su window)
window.ChatbotUI = ChatbotUI; 