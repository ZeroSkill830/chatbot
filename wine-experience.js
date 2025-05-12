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

            const winesElement = this.formatWinesForDisplay({wines: wines.wines});
            
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

    async startWineTasting(wineName) {
        try {
            const stages = this.wineStages.get(wineName);
            if (!stages || !stages.length) {
                throw new Error(`Nessuno stage disponibile per il vino ${wineName}`);
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
                    stage: stages[0],
                    language: window.chatbotLanguage || 'it' // Usa la lingua globale o default a IT
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
        
        // Aggiungi il titolo dello stage
        const modalTitle = document.createElement('h2');
        modalTitle.className = 'wine-modal-title';
        modalTitle.textContent = `Stage: ${stageData.currentStage.charAt(0).toUpperCase() + stageData.currentStage.slice(1)}`;
        modalElement.appendChild(modalTitle);
        
        // Aggiungi l'immagine dello stage
        const stageImageContainer = document.createElement('div');
        stageImageContainer.className = 'stage-image-container';
        
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
        
        const stageIndicator = document.createElement('span');
        stageIndicator.className = 'stage-indicator';
        stageIndicator.textContent = stageData.currentStage;
        
        modalTitle.appendChild(title);
        modalTitle.appendChild(stageIndicator);
        
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
        
        const progress = document.createElement('div');
        progress.className = 'stage-progress';
        progress.textContent = `Stage ${stageData.currentStage} - 1/${sortedChunks.length} passaggi`;
        
        const closeModalButton = document.createElement('button');
        closeModalButton.className = 'close-modal-button';
        closeModalButton.textContent = 'Chiudi';
        closeModalButton.addEventListener('click', () => {
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
        
        modalFooter.appendChild(progress);
        modalFooter.appendChild(closeModalButton);
        
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
            // Fallback al body se lo shadow root non è disponibile
            document.body.appendChild(modalOverlay);
        }
        
        // Funzione ricorsiva per aggiungere i chunks uno alla volta con il typing indicator
        const addChunkWithDelay = (index) => {
            if (index >= sortedChunks.length) return;
            
            // Se è il primo chunk, aggiungerlo immediatamente
            if (index === 0) {
                this.addChunkToContainer(sortedChunks[index], chunkContainer, true);
                
                // Mostra il typing indicator dopo il primo chunk
                this.typingIndicator = this.createTypingIndicator(chunkContainer);
                
                // Programma l'aggiunta del prossimo chunk dopo 3 secondi di "typing"
                const timeoutId = setTimeout(() => {
                    // Rimuovi l'indicatore di digitazione
                    this.typingIndicator = this.removeTypingIndicator(this.typingIndicator);
                    
                    // Procedi al chunk successivo dopo aver mostrato l'indicatore
                    addChunkWithDelay(index + 1);
                }, 3000); // 3 secondi di typing, poi 2 secondi per leggere = 5 secondi totali
                this.chunkTimeouts.push(timeoutId);
            } else {
                // Aggiorna l'indicatore di progresso
                progress.textContent = `Stage ${stageData.currentStage} - ${index + 1}/${sortedChunks.length} passaggi`;
                
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
                }
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