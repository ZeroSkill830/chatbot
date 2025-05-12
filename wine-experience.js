console.log('wine-experience.js: Inizio caricamento file');

// Gestione della logica specifica per l'esperienza dei vini
const WineExperience = class {
    constructor() {
        console.log('WineExperience: Costruttore chiamato');
        this.apiEndpoint = 'https://macaw-eager-gradually.ngrok-free.app/api/wine-knowledge/wines';
        this.tastingEndpoint = 'https://macaw-eager-gradually.ngrok-free.app/api/wine-tasting';
        this.wineStages = new Map(); // Mappa per memorizzare gli stage di ogni vino
        this.currentChunkIndex = 0; // Indice del chunk corrente
        this.chunkTimeouts = []; // Array per memorizzare i timeout dei chunks
        this.typingIndicator = null; // Riferimento all'indicatore di digitazione
        
        // Aggiungi listener per il bottone di toggle del chatbot
        this.setupToggleButtonListener();
    }
    
    // Metodo per configurare il listener del bottone toggle
    setupToggleButtonListener() {
        // Attendi che il DOM sia completamente caricato
        document.addEventListener('DOMContentLoaded', () => {
            this.attachToggleButtonListener();
        });
        
        // Se il DOM è già caricato, attacca subito il listener
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            this.attachToggleButtonListener();
        }
    }
    
    // Attacca il listener al bottone di toggle
    attachToggleButtonListener() {
        const chatbotHost = document.querySelector('#chatbot-host');
        if (chatbotHost && chatbotHost.shadowRoot) {
            // Cerca il bottone toggle nel shadow DOM
            const toggleButton = chatbotHost.shadowRoot.querySelector('.chatbot-toggle-button');
            if (toggleButton) {
                toggleButton.addEventListener('click', () => {
                    // Quando il bottone toggle viene cliccato, chiudi tutte le modali
                    this.closeAllModals();
                });
                console.log('Listener aggiunto al bottone toggle del chatbot');
            } else {
                console.log('Bottone toggle non trovato nel shadow DOM');
                // Se non lo troviamo al primo tentativo, proviamo a monitorare le modifiche al DOM
                this.observeShadowRoot(chatbotHost.shadowRoot);
            }
        } else {
            console.log('Shadow root non trovato, riprovo più tardi');
            // Riprova dopo un breve ritardo
            setTimeout(() => this.attachToggleButtonListener(), 1000);
        }
    }
    
    // Osserva il shadow root per individuare il bottone quando viene aggiunto
    observeShadowRoot(shadowRoot) {
        const observer = new MutationObserver((mutations) => {
            const toggleButton = shadowRoot.querySelector('.chatbot-toggle-button');
            if (toggleButton) {
                toggleButton.addEventListener('click', () => {
                    this.closeAllModals();
                });
                console.log('Listener aggiunto al bottone toggle (via observer)');
                observer.disconnect(); // Smetti di osservare una volta trovato
            }
        });
        
        observer.observe(shadowRoot, { childList: true, subtree: true });
    }
    
    // Chiudi tutte le modali
    closeAllModals() {
        const chatbotHost = document.querySelector('#chatbot-host');
        if (chatbotHost && chatbotHost.shadowRoot) {
            // Chiudi la modale di preview
            const previewModal = chatbotHost.shadowRoot.querySelector('.wine-modal-overlay');
            if (previewModal) {
                previewModal.remove();
            }
            
            // Chiudi la modale dei chunks
            const chunksModal = chatbotHost.shadowRoot.querySelector('.wine-tasting-modal-overlay');
            if (chunksModal) {
                // Annulla tutti i timeout attivi
                this.chunkTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
                chunksModal.remove();
            }
        }
    }

    async fetchWines() {
        try {
            const response = await fetch(this.apiEndpoint, {
                headers: {
                    'ngrok-skip-browser-warning': 'true',
                    'Authorization': `Bearer ${window.chatbotAuthToken}`
                }
            });
            if (!response.ok) {
                throw new Error('Errore nel recupero dei dati dei vini');
            }
            const wines = await response.json();

            // Memorizza gli stage per ogni vino
            wines.wines.forEach(wine => {
                wine.image = 'https://cdn.pixabay.com/photo/2013/07/12/16/28/wine-150955_1280.png';
                if (wine.stages && Array.isArray(wine.stages)) {
                    this.wineStages.set(wine.name, wine.stages);
                }
            });

            const winesElement = this.formatWinesForDisplay({ wines: wines.wines });

            // Accedi all'area messaggi attraverso lo Shadow DOM
            const chatbotHost = document.querySelector('#chatbot-host');
            if (chatbotHost && chatbotHost.shadowRoot) {
                const messageArea = chatbotHost.shadowRoot.querySelector('.chatbot-message-area');
                if (messageArea) {
                    messageArea.appendChild(winesElement);
                    messageArea.scrollTop = messageArea.scrollHeight;
                } else {
                    console.error('Area messaggi non trovata nello Shadow DOM');
                }
            } else {
                console.error('Host del chatbot o Shadow Root non trovati');
            }

            return winesElement;
        } catch (error) {
            console.error('Errore:', error);
            return 'Mi dispiace, si è verificato un errore nel recupero dei vini.';
        }
    }

    async startWineTasting(wineName, stageName = null) {
        try {
            const stages = this.wineStages.get(wineName);
            if (!stages || !stages.length) {
                throw new Error(`Nessuno stage disponibile per il vino ${wineName}`);
            }

            // Determina lo stage da usare: quello fornito o il primo
            const targetStage = stageName && stages.includes(stageName) ? stageName : stages[0];
            if (!targetStage) {
                throw new Error(`Stage non valido o non trovato per ${wineName}`);
            }

            const response = await fetch(this.tastingEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true',
                    'Authorization': `Bearer ${window.chatbotAuthToken}`
                },
                body: JSON.stringify({
                    mode: 'beginner',
                    wineName: wineName,
                    userId: 'user',
                    stage: targetStage, // Usa lo stage target
                    language: window.chatbotLanguage || 'it'
                })
            });

            if (!response.ok) {
                throw new Error('Errore nell\'avvio della degustazione');
            }

            const result = await response.json();

            // Mostra la modale con le informazioni dello stage
            this.showStageModal(result);

        } catch (error) {
            console.error('Errore durante l\'avvio della degustazione:', error);
            throw error;
        }
    }

    // Mostra una modale a schermo intero con le informazioni dello stage
    showStageModal(stageData) {
        // Crea gli elementi della modale
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'wine-modal-overlay';

        const modalElement = document.createElement('div');
        modalElement.className = 'wine-modal';

        // Aggiungi l'immagine dello stage
        const stageImageContainer = document.createElement('div');
        stageImageContainer.className = 'stage-image-container';

        // Aggiungi il titolo dello stage
        const modalTitle = document.createElement('h2');
        modalTitle.className = 'wine-modal-title';
        modalTitle.textContent = `${stageData.currentStage.charAt(0).toUpperCase() + stageData.currentStage.slice(1)}`;
        modalElement.appendChild(modalTitle);

        const stageImage = document.createElement('img');
        stageImage.className = 'stage-image';
        // Seleziona l'immagine in base allo stage corrente
        stageImage.src = `./imgs/${stageData.currentStage}.png`;
        stageImage.alt = `${stageData.currentStage} stage`;

        stageImageContainer.appendChild(stageImage);
        modalElement.appendChild(stageImageContainer);

        // Aggiungi il testo di anteprima
        const modalText = document.createElement('p');
        modalText.className = 'wine-modal-text';
        modalText.textContent = stageData.previewText;
        modalElement.appendChild(modalText);

        // Aggiungi il bottone "Avanti"
        const modalButton = document.createElement('button');
        modalButton.className = 'wine-modal-button';
        modalButton.textContent = 'Avanti';
        modalButton.addEventListener('click', () => {
            // Accedi all'area messaggi attraverso lo Shadow DOM per rimuovere la modale
            const chatbotHost = document.querySelector('#chatbot-host');
            if (chatbotHost && chatbotHost.shadowRoot) {
                const modalInShadow = chatbotHost.shadowRoot.querySelector('.wine-modal-overlay');
                if (modalInShadow) {
                    modalInShadow.remove();
                }
            }

            // Mostra la modal con i chunks invece di reindirizzare a una nuova pagina
            this.showChunksModal(stageData);
        });
        modalElement.appendChild(modalButton);

        // Aggiungi la modale al DOM attraverso lo Shadow Root
        modalOverlay.appendChild(modalElement);

        // Inserisci la modale nello shadow root invece che nel body
        const chatbotHost = document.querySelector('#chatbot-host');
        if (chatbotHost && chatbotHost.shadowRoot) {
            chatbotHost.shadowRoot.appendChild(modalOverlay);
        } else {
            console.error('Host del chatbot o Shadow Root non trovati per aggiungere la modale');
            // Fallback al body se lo shadow root non è disponibile
            document.body.appendChild(modalOverlay);
        }
    }

    // Crea un indicatore di digitazione
    createTypingIndicator(container) {
        const indicatorElement = document.createElement('div');
        indicatorElement.className = 'chatbot-message-typing-indicator typing-indicator';

        // Crea i tre puntini animati
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('span');
            dot.className = 'chatbot-typing-dot';
            indicatorElement.appendChild(dot);
        }

        container.appendChild(indicatorElement);

        // Scorri in basso per mostrare l'indicatore
        const modalBody = container.closest('.wine-tasting-modal-body');
        if (modalBody) {
            modalBody.scrollTop = modalBody.scrollHeight;
        }

        return indicatorElement;
    }

    // Rimuove l'indicatore di digitazione
    removeTypingIndicator(indicator) {
        if (indicator && indicator.parentNode) {
            indicator.parentNode.removeChild(indicator);
            return null;
        }
        return indicator;
    }

    // Mostra una modale con i chunks che appaiono uno dopo l'altro ogni 5 secondi
    showChunksModal(stageData) {
        // Reset delle variabili
        this.currentChunkIndex = 0;
        // Cancella eventuali timeout esistenti
        this.chunkTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
        this.chunkTimeouts = [];

        // Ordina i chunks in base a chunkIndex
        const sortedChunks = [...stageData.chunks].sort((a, b) => a.chunkIndex - b.chunkIndex);

        // Crea gli elementi della modale
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'wine-tasting-modal-overlay';

        const modalContent = document.createElement('div');
        modalContent.className = 'wine-tasting-modal wine-chunks-modal';

        // Crea l'header della modale
        const modalHeader = document.createElement('div');
        modalHeader.className = 'wine-tasting-modal-header';

        const modalTitle = document.createElement('div');
        modalTitle.className = 'modal-title-container';

        const title = document.createElement('h2');
        title.textContent = `${stageData.wineName}`;


        modalTitle.appendChild(title);

        const closeButton = document.createElement('button');
        closeButton.className = 'close-button';
        closeButton.innerHTML = '&times;';
        closeButton.addEventListener('click', () => {
            // Cancella tutti i timeout quando si chiude la modale
            this.chunkTimeouts.forEach(timeoutId => clearTimeout(timeoutId));

            // Rimuovi la modale
            const chatbotHost = document.querySelector('#chatbot-host');
            if (chatbotHost && chatbotHost.shadowRoot) {
                const modalElement = chatbotHost.shadowRoot.querySelector('.wine-tasting-modal-overlay');
                if (modalElement) {
                    modalElement.remove();
                }
            }
        });

        modalHeader.appendChild(modalTitle);
        modalHeader.appendChild(closeButton);

        // Crea il corpo della modale
        const modalBody = document.createElement('div');
        modalBody.className = 'wine-tasting-modal-body';

        const chunkContainer = document.createElement('div');
        chunkContainer.className = 'chunks-container';

        modalBody.appendChild(chunkContainer);

        // Crea il footer della modale
        const modalFooter = document.createElement('div');
        modalFooter.className = 'wine-tasting-modal-footer';

        const progressElement = document.createElement('div');
        progressElement.className = 'stage-progress';
        progressElement.textContent = `Stage ${stageData.currentStage} - 0/${sortedChunks.length} passaggi`;

        // Funzione per chiudere la modale
        const closeModalLogic = () => {
            this.chunkTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
            const chatbotHost = document.querySelector('#chatbot-host');
            if (chatbotHost && chatbotHost.shadowRoot) {
                const modalElement = chatbotHost.shadowRoot.querySelector('.wine-tasting-modal-overlay');
                if (modalElement) {
                    modalElement.remove();
                }
            }
        };

        // Crea un contenitore SOLO per il progress inizialmente
        const footerContentWrapper = document.createElement('div');
        footerContentWrapper.className = 'footer-content-wrapper';
        footerContentWrapper.appendChild(progressElement);

        modalFooter.appendChild(footerContentWrapper);

        // Assembla la modale
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalBody);
        modalContent.appendChild(modalFooter);
        modalOverlay.appendChild(modalContent);

        // Inserisci la modale nello shadow root
        const chatbotHost = document.querySelector('#chatbot-host');
        if (chatbotHost && chatbotHost.shadowRoot) {
            chatbotHost.shadowRoot.appendChild(modalOverlay);
        } else {
            console.error('Host del chatbot o Shadow Root non trovati per aggiungere la modale chunks');
            document.body.appendChild(modalOverlay);
        }

        // Funzione ricorsiva per aggiungere i chunks
        const addChunkWithDelay = (index) => {
            // Aggiorna il testo del progresso qui, quando il chunk viene aggiunto
            progressElement.textContent = `Stage ${stageData.currentStage} - ${index + 1}/${sortedChunks.length} passaggi`;

            if (index >= sortedChunks.length) {
                // Tutti i chunk mostrati, abilita il bottone se non è l'ultimo stage
                // o lascialo come 'Fine Degustazione'
                // Potresti voler mostrare/abilitare il bottone qui se era nascosto/disabilitato
                return;
            }

            // Aggiungi il chunk con animazione
            this.addChunkToContainer(sortedChunks[index], chunkContainer, false);

            // Scorri automaticamente verso il nuovo chunk
            modalBody.scrollTop = modalBody.scrollHeight;

            // Se non è l'ultimo chunk, mostra di nuovo l'indicatore di typing
            if (index < sortedChunks.length - 1) {
                // Mostra l'indicatore di digitazione dopo un breve ritardo
                const typingTimeoutId = setTimeout(() => {
                    this.typingIndicator = this.createTypingIndicator(chunkContainer);
                }, 2000); // 2 secondi per leggere il messaggio corrente
                this.chunkTimeouts.push(typingTimeoutId);

                // Programma l'aggiunta del prossimo chunk dopo l'effetto di typing
                const nextChunkTimeoutId = setTimeout(() => {
                    // Rimuovi l'indicatore di digitazione
                    this.typingIndicator = this.removeTypingIndicator(this.typingIndicator);

                    // Procedi al chunk successivo
                    addChunkWithDelay(index + 1);
                }, 5000); // 2s leggere + 3s typing = 5s totali
                this.chunkTimeouts.push(nextChunkTimeoutId);
            } else {
                // Siamo all'ultimo chunk, rimuovi l'indicatore se presente
                this.typingIndicator = this.removeTypingIndicator(this.typingIndicator);

                // --- Logica di fine stage --- 
                const showStageEndControls = () => {
                    // 1. Rimuovi l'indicatore di progresso
                    const progressElement = modalFooter.querySelector('.stage-progress');
                    if (progressElement && progressElement.parentNode) {
                        progressElement.parentNode.removeChild(progressElement);
                    }

                    // 2. Determina se è l'ultimo stage
                    const stages = this.wineStages.get(stageData.wineName) || [];
                    const currentStageIndex = stages.indexOf(stageData.currentStage);
                    const isLastStage = currentStageIndex === -1 || currentStageIndex === stages.length - 1;
                    const nextStageName = !isLastStage ? stages[currentStageIndex + 1] : null;

                    // 3. Crea il bottone "Prossimo Stage" / "Fine Degustazione"
                    const actionButton = document.createElement('button');
                    actionButton.className = isLastStage ? 'close-modal-button' : 'next-stage-button';
                    actionButton.textContent = isLastStage ? 'Fine Degustazione' : 'Prossimo Stage';

                    // Aggiungi la logica di click (usa closeModalLogic definita in showChunksModal)
                    actionButton.addEventListener('click', async () => {
                         // Usa la closeModalLogic definita nello scope padre showChunksModal
                         // Cerca la funzione closeModalLogic definita sopra
                         const closeModalFunc = () => { // Ridefiniamo o troviamo la funzione
                            this.chunkTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
                            const host = document.querySelector('#chatbot-host');
                            if (host && host.shadowRoot) {
                                const modal = host.shadowRoot.querySelector('.wine-tasting-modal-overlay');
                                if (modal) modal.remove();
                            }
                         };
                         closeModalFunc(); // Chiudi la modale corrente

                        if (!isLastStage && nextStageName) {
                            try {
                                await this.startWineTasting(stageData.wineName, nextStageName);
                            } catch (error) {
                                console.error("Errore nel caricare il prossimo stage:", error);
                            }
                        } else {
                            console.log('Degustazione completata per', stageData.wineName);
                        }
                    });
                    
                    // 4. Aggiungi il bottone al footer (prima dell'input)
                    const footerWrapper = modalFooter.querySelector('.footer-content-wrapper');
                    if (footerWrapper) {
                         footerWrapper.appendChild(actionButton); 
                    } else {
                         modalFooter.appendChild(actionButton); // Fallback
                    }

                    // 5. Aggiungi l'input per la chat
                    this.addChatInput(modalFooter, modalBody, stageData);
                };

                // Esegui la logica di fine stage dopo un breve ritardo
                const finalControlsTimeoutId = setTimeout(showStageEndControls, 500); // Breve ritardo
                this.chunkTimeouts.push(finalControlsTimeoutId);
            }
        };

        // Inizia ad aggiungere i chunks
        addChunkWithDelay(0);
    }

    // Aggiunge un singolo chunk al container
    addChunkToContainer(chunk, container, isFirst) {
        const chunkElement = document.createElement('div');
        chunkElement.className = 'chunk-item';

        if (isFirst) {
            chunkElement.classList.add('first-chunk');
        } else {
            // Aggiungi una classe per l'animazione in entrata
            chunkElement.classList.add('new-chunk');
        }

        // Crea l'elemento per il testo del chunk
        const chunkText = document.createElement('div');
        chunkText.className = 'chunk-text';
        chunkText.textContent = chunk.text;
        chunkElement.appendChild(chunkText);

        container.appendChild(chunkElement);
    }

    // Aggiunge l'input per la chat alla fine della modale
    addChatInput(modalFooter, modalBody, stageData) {
        const chatInputContainer = document.createElement('div');
        chatInputContainer.className = 'chat-input-container';

        const textInput = document.createElement('input');
        textInput.type = 'text';
        textInput.placeholder = 'Descrivi le tue sensazioni...';
        textInput.className = 'chat-input';

        const sendButton = document.createElement('button');
        sendButton.textContent = 'Invia';
        sendButton.className = 'chat-send-button';

        const sendMessage = async () => {
            const messageText = textInput.value.trim();
            if (!messageText) return;

            const chunkContainer = modalBody.querySelector('.chunks-container');
            if (!chunkContainer) {
                console.error('Chunk container non trovato!');
                return;
            }

            // Mostra messaggio utente
            const userMessageElement = document.createElement('div');
            userMessageElement.className = 'chatbot-message chatbot-message-user';
            userMessageElement.textContent = messageText;
            chunkContainer.appendChild(userMessageElement);
            modalBody.scrollTop = modalBody.scrollHeight;
            textInput.value = '';
            textInput.disabled = true;
            sendButton.disabled = true;

            // Mostra indicatore typing
            let typingIndicator = this.createTypingIndicator(chunkContainer);
            modalBody.scrollTop = modalBody.scrollHeight;

            const feedbackPayload = {
                sessionId: 'user', // Placeholder
                wineName: stageData.wineName,
                stage: stageData.currentStage,
                feedbackType: "stage",
                feedbackText: messageText
            };

            try {
                const response = await fetch(`${this.tastingEndpoint}/feedback`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': 'true',
                        'Authorization': `Bearer ${window.chatbotAuthToken}`
                    },
                    body: JSON.stringify(feedbackPayload)
                });

                typingIndicator = this.removeTypingIndicator(typingIndicator);

                if (!response.ok) {
                    const errorBody = await response.text();
                    console.error('API Error:', response.status, response.statusText, errorBody);
                    throw new Error(`Errore ${response.status}: ${response.statusText || 'Errore API'}`);
                }

                const result = await response.json();

                // Mostra risposta bot
                const botMessageElement = document.createElement('div');
                botMessageElement.className = 'chatbot-message chatbot-message-bot';
                console.log(result, 'gnegne');    
                if (result.responseToFeedback) {
                    botMessageElement.textContent = result.responseToFeedback;
                } else {
                    console.warn('API response missing responseToFeedBack', result);
                    botMessageElement.textContent = "Grazie per il tuo feedback!"; // Fallback
                }
                chunkContainer.appendChild(botMessageElement);

            } catch (error) {
                console.error('Errore invio feedback:', error);
                if(typingIndicator) { // Rimuovi indicatore se ancora presente
                    typingIndicator = this.removeTypingIndicator(typingIndicator);
                }
                // Mostra messaggio errore
                const errorMessageElement = document.createElement('div');
                errorMessageElement.className = 'chatbot-message chatbot-message-bot';
                errorMessageElement.textContent = `Spiacente, errore: ${error.message}`;
                errorMessageElement.style.color = 'red';
                chunkContainer.appendChild(errorMessageElement);
            } finally {
                // Riabilita input
                textInput.disabled = false;
                sendButton.disabled = false;
                modalBody.scrollTop = modalBody.scrollHeight;
                textInput.focus();
            }
        };

        sendButton.addEventListener('click', sendMessage);
        textInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                sendMessage();
            }
        });

        chatInputContainer.appendChild(textInput);
        chatInputContainer.appendChild(sendButton);
        modalFooter.appendChild(chatInputContainer);
    }

    formatWinesForDisplay(wines) {
        if (!wines || !wines.wines || !Array.isArray(wines.wines)) {
            return 'Mi dispiace, non sono riuscito a recuperare i dati dei vini.';
        }

        // Crea un contenitore per tutti i vini
        const winesContainer = document.createElement('div');
        winesContainer.className = 'wines-container';

        // Aggiungi un titolo
        const title = document.createElement('h3');
        title.textContent = 'Cosa vuoi degustare?';
        title.className = 'wines-title';
        winesContainer.appendChild(title);

        // Crea il contenitore per le card dei vini
        const wineCardsContainer = document.createElement('div');
        wineCardsContainer.className = 'wine-cards-container';
        winesContainer.appendChild(wineCardsContainer);

        // Per ogni vino, crea una card
        wines.wines.forEach(wine => {
            const wineCard = document.createElement('div');
            wineCard.className = 'wine-card';

            // Aggiungi event listener per il click
            wineCard.addEventListener('click', async () => {
                // Impedisci click multipli mentre carica
                if (wineCard.classList.contains('loading')) {
                    return;
                }

                // Aggiungi classe e loader
                wineCard.classList.add('loading');
                const loader = document.createElement('div');
                loader.className = 'wine-card-loader'; // Applicheremo stile CSS
                // Potresti aggiungere un'icona o animazione qui invece del testo
                loader.innerHTML = '<div class="spinner"></div>';
                wineCard.appendChild(loader);

                try {
                    await this.startWineTasting(wine.name);
                } catch (error) {
                    console.error('Errore durante l\'avvio della degustazione:', error);
                    // Potresti mostrare un messaggio di errore sulla card qui se vuoi
                } finally {
                    // Rimuovi classe e loader indipendentemente dal risultato
                    wineCard.classList.remove('loading');
                    if (loader.parentNode === wineCard) { // Controllo sicurezza
                        wineCard.removeChild(loader);
                    }
                }
            });

            // Contenitore per le informazioni del vino
            const wineInfo = document.createElement('div');
            wineInfo.className = 'wine-info';

            // Nome del vino
            const wineName = document.createElement('h4');
            wineName.textContent = wine.name.toUpperCase();
            wineName.className = 'wine-name';
            wineInfo.appendChild(wineName);

            // Produttore
            const wineType = document.createElement('p');
            wineType.textContent = `🍷 ${wine.producer}`;
            wineType.className = 'wine-type';
            wineInfo.appendChild(wineType);

            // Regione
            const quantity = document.createElement('p');
            quantity.textContent = `📍 ${wine.region}`;
            quantity.className = 'wine-quantity';
            wineInfo.appendChild(quantity);

            // Prezzo
            const price = document.createElement('p');
            price.textContent = '$ 11.97';
            price.className = 'wine-price';
            wineInfo.appendChild(price);

            // Immagine del vino
            const wineImage = document.createElement('img');
            wineImage.src = wine.image;
            wineImage.alt = `Immagine di ${wine.name}`;
            wineImage.className = 'wine-image';

            // Assembla la card
            wineCard.appendChild(wineInfo);
            wineCard.appendChild(wineImage);
            wineCardsContainer.appendChild(wineCard);
        });

        return winesContainer;
    }
}


// Rendi la classe disponibile globalmente
console.log('wine-experience.js: Prima di esporre globalmente');
if (typeof window !== 'undefined') {
    window.WineExperience = WineExperience;
    console.log('WineExperience esposto globalmente:', window.WineExperience);
    console.log('Tipo di WineExperience:', typeof window.WineExperience === 'function');
    console.log('È una funzione?', typeof window.WineExperience === 'function');
} else {
    console.error('window non è definito!');
} 