console.log('wine-experience.js: Inizio caricamento file');

// Gestione della logica specifica per l'esperienza dei vini
const WineExperience = class {
    constructor() {
        console.log('WineExperience: Costruttore chiamato');
        this.apiEndpoint = 'https://macaw-eager-gradually.ngrok-free.app/api/wine-knowledge/wines';
        this.tastingEndpoint = 'https://macaw-eager-gradually.ngrok-free.app/api/wine-tasting';
        this.wineStages = new Map(); // Mappa per memorizzare gli stage di ogni vino
        this.tastingModal = new WineTastingModal();
        this.tastingSession = new WineTastingSession();
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
                    wineName: wineName,
                    userId: 'user',
                    stage: stages[0],
                    language: 'it'
                })
            });

            if (!response.ok) {
                throw new Error('Errore nell\'avvio della degustazione');
            }

            const result = await response.json();
            console.log('Dati iniziali ricevuti:', result);
            
            // Inizializza la sessione con gli stage disponibili
            this.tastingSession.initialize(wineName, stages[0], result.chunks, stages);
            
            // Passa i callback al modal
            this.tastingModal.show(result, 
                () => this.handleStageComplete(),
                () => this.handleTastingComplete()
            );

            return result;
        } catch (error) {
            console.error('Errore durante l\'avvio della degustazione:', error);
            throw error;
        }
    }

    async handleStageComplete() {
        console.log('handleStageComplete chiamato');
        try {
            // Marca lo stage corrente come completato
            this.tastingSession.markStageAsComplete();
            
            // Verifica se ci sono altri stage
            const nextStage = this.tastingSession.getNextStage();
            console.log('Prossimo stage:', nextStage);
            
            if (nextStage) {
                // Mostra il loader
                this.tastingModal.showLoader();
                
                // Richiedi il prossimo stage
                const response = await fetch(this.tastingEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': 'true',
                        'Authorization': `Bearer ${window.chatbotAuthToken}`
                    },
                    body: JSON.stringify({
                        wineName: this.tastingSession.wineName,
                        userId: 'user',
                        stage: nextStage
                    })
                });

                if (!response.ok) {
                    throw new Error('Errore nel recupero del prossimo stage');
                }

                const result = await response.json();
                console.log('Nuovi dati ricevuti:', result);
                
                // Nascondi il loader
                this.tastingModal.hideLoader();
                
                // Aggiorna la sessione con i nuovi dati
                this.tastingSession.updateFromApiResponse(result);
                
                // Aggiorna il modal con i nuovi dati
                this.tastingModal.show(result, 
                    () => this.handleStageComplete(),
                    () => this.handleTastingComplete()
                );
                
                return false; // Indica che ci sono altri stage
            }

            // Se non ci sono altri stage, la degustazione è completata
            console.log('Degustazione completata');
            return true;
        } catch (error) {
            console.error('Errore durante il completamento dello stage:', error);
            this.tastingModal.hideLoader();
            throw error;
        }
    }

    async handleTastingComplete() {
        console.log('handleTastingComplete chiamato');
        try {
            // Verifica se tutti gli stage sono stati completati
            if (this.tastingSession.isTastingComplete()) {
                // Resetta la sessione
                this.tastingSession.reset();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Errore durante il completamento della degustazione:', error);
            throw error;
        }
    }

    async requestNextStage() {
        try {
            const nextStage = this.tastingSession.getNextStage();
            if (!nextStage) {
                throw new Error('Nessuno stage successivo disponibile');
            }

            const response = await fetch(this.tastingEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true',
                    'Authorization': `Bearer ${window.chatbotAuthToken}`
                },
                body: JSON.stringify({
                    wineName: this.tastingSession.wineName,
                    userId: 'user',
                    stage: nextStage
                })
            });

            if (!response.ok) {
                throw new Error('Errore nel recupero del prossimo stage');
            }

            const result = await response.json();
            
            // Aggiorna la sessione con il nuovo stage
            this.tastingSession.updateFromApiResponse(result);
            this.tastingSession.markStageAsComplete();
            
            // Aggiorna il modal con i nuovi dati
            this.tastingModal.show(result);

            return result;
        } catch (error) {
            console.error('Errore durante il recupero del prossimo stage:', error);
            throw error;
        }
    }

    async submitFeedback(feedback) {
        try {
            const currentChunk = this.tastingSession.getCurrentChunk();
            if (!currentChunk) {
                throw new Error('Nessun chunk corrente disponibile');
            }

            const response = await fetch(this.tastingEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true',
                    'Authorization': `Bearer ${window.chatbotAuthToken}`
                },
                body: JSON.stringify({
                    wineName: this.tastingSession.wineName,
                    userId: 'user',
                    stage: this.tastingSession.currentStage,
                    chunkIndex: currentChunk.chunkIndex,
                    feedback: feedback
                })
            });

            if (!response.ok) {
                throw new Error('Errore nell\'invio del feedback');
            }

            // Salva il feedback nella sessione
            this.tastingSession.saveFeedback(feedback);

            return true;
        } catch (error) {
            console.error('Errore durante l\'invio del feedback:', error);
            throw error;
        }
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
                try {
                    await this.startWineTasting(wine.name);
                } catch (error) {
                    console.error('Errore durante l\'avvio della degustazione:', error);
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

            // Tipo di vino
            const wineType = document.createElement('p');
            wineType.textContent = 'Wine type: Rosso brut';
            wineType.className = 'wine-type';
            wineInfo.appendChild(wineType);

            // Quantità
            const quantity = document.createElement('p');
            quantity.textContent = 'Quantity: 1.5 L';
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

// Classe per gestire il modal di degustazione
class WineTastingModal {
    constructor() {
        this.modal = null;
        this.currentChunk = null;
        this.stage = null;
        this.wineName = null;
        this.chunks = [];
        this.currentChunkIndex = 0;
        this.isAnimating = false;
        this.onStageComplete = null;
        this.onTastingComplete = null;
        this.loader = null;
        this.init();
    }

    init() {
        // Crea il modal
        this.modal = document.createElement('div');
        this.modal.className = 'wine-tasting-modal';
        this.modal.style.display = 'none';

        // Crea la struttura del modal
        this.modal.innerHTML = `
            <div class="wine-tasting-modal-content">
                <div class="wine-tasting-modal-header">
                    <h2 class="wine-name"></h2>
                    <span class="stage-indicator"></span>
                    <button class="close-button">&times;</button>
                </div>
                <div class="wine-tasting-modal-body">
                    <div class="chunk-content"></div>
                    <div class="feedback-input-container">
                        <textarea class="feedback-input" placeholder="Inserisci il tuo feedback qui..."></textarea>
                    </div>
                </div>
                <div class="wine-tasting-modal-footer">
                    <div class="progress-indicator">
                        <span class="current-chunk">1</span>/<span class="total-chunks">1</span>
                    </div>
                    <button class="next-chunk-button">Avanti</button>
                </div>
                <div class="loader-container" style="display: none;">
                    <div class="loader"></div>
                </div>
            </div>
        `;

        // Aggiungi il modal allo Shadow DOM del chatbot
        const chatbotHost = document.querySelector('#chatbot-host');
        if (chatbotHost && chatbotHost.shadowRoot) {
            chatbotHost.shadowRoot.appendChild(this.modal);
        } else {
            console.error('Chatbot host o Shadow Root non trovato');
        }

        // Salva i riferimenti agli elementi
        this.loader = this.modal.querySelector('.loader-container');

        // Aggiungi gli event listener
        this.addEventListeners();
    }

    addEventListeners() {
        // Gestione chiusura modal
        const closeButton = this.modal.querySelector('.close-button');
        closeButton.addEventListener('click', () => this.close());

        // Gestione navigazione chunks
        const nextButton = this.modal.querySelector('.next-chunk-button');

        nextButton.addEventListener('click', async () => {
            console.log('Pulsante Avanti cliccato');
            console.log('Chunk corrente:', this.currentChunkIndex);
            console.log('Totale chunks:', this.chunks.length);
            
            if (this.currentChunkIndex === this.chunks.length - 1) {
                console.log('Ultimo chunk raggiunto');
                if (this.onStageComplete) {
                    console.log('Chiamando onStageComplete');
                    const isComplete = await this.onStageComplete();
                    console.log('Risultato onStageComplete:', isComplete);
                    if (isComplete) {
                        console.log('Chiudendo il modal');
                        this.close();
                    }
                }
            } else {
                await this.navigateChunk();
            }
        });
    }

    show(data, onStageComplete, onTastingComplete) {
        this.wineName = data.wineName;
        this.stage = data.stage;
        this.chunks = data.chunks;
        this.currentChunkIndex = 0;
        this.onStageComplete = onStageComplete;
        this.onTastingComplete = onTastingComplete;

        this.updateUI();
        this.modal.style.display = 'flex';
    }

    async handleStageTransition() {
        try {
            // Verifica se la degustazione è completata
            if (this.onTastingComplete && await this.onTastingComplete()) {
                this.close();
                return;
            }

            // Aggiorna l'interfaccia per il nuovo stage
            this.updateUI();
        } catch (error) {
            console.error('Errore durante la transizione dello stage:', error);
            // Mostra un messaggio di errore all'utente
            this.showError('Si è verificato un errore durante il passaggio al prossimo stage.');
        }
    }

    showError(message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        
        const header = this.modal.querySelector('.wine-tasting-modal-header');
        header.appendChild(errorElement);
        
        // Rimuovi il messaggio dopo 3 secondi
        setTimeout(() => {
            errorElement.remove();
        }, 3000);
    }

    close() {
        this.modal.style.display = 'none';
        this.reset();
    }

    reset() {
        this.currentChunkIndex = 0;
        this.chunks = [];
        this.wineName = null;
        this.stage = null;
        this.onStageComplete = null;
        this.onTastingComplete = null;
    }

    updateUI() {
        // Aggiorna il nome del vino e lo stage
        this.modal.querySelector('.wine-name').textContent = this.wineName;
        this.modal.querySelector('.stage-indicator').textContent = this.stage;

        // Aggiorna il contenuto del chunk corrente
        this.updateChunkContent();

        // Aggiorna i pulsanti di navigazione
        this.updateNavigationButtons();

        // Aggiorna il progresso
        this.updateProgress();
    }

    updateChunkContent() {
        const chunkContent = this.modal.querySelector('.chunk-content');
        const currentChunk = this.chunks[this.currentChunkIndex];
        
        if (currentChunk) {
            // Crea un contenitore per il testo e il prompt
            const contentContainer = document.createElement('div');
            
            // Aggiungi il testo del chunk
            const textElement = document.createElement('p');
            textElement.textContent = currentChunk.text;
            textElement.className = 'chunk-text';
            contentContainer.appendChild(textElement);
            
            // Se c'è un feedback prompt, aggiungilo
            if (currentChunk.feedbackPrompt) {
                const promptElement = document.createElement('p');
                promptElement.textContent = currentChunk.feedbackPrompt;
                promptElement.className = 'feedback-prompt';
                contentContainer.appendChild(promptElement);
            }
            
            // Sostituisci il contenuto
            chunkContent.innerHTML = '';
            chunkContent.appendChild(contentContainer);
        }
    }

    updateNavigationButtons() {
        const nextButton = this.modal.querySelector('.next-chunk-button');

        nextButton.disabled = this.currentChunkIndex === this.chunks.length - 1;
    }

    updateProgress() {
        const currentChunkSpan = this.modal.querySelector('.current-chunk');
        const totalChunksSpan = this.modal.querySelector('.total-chunks');

        if (currentChunkSpan && totalChunksSpan) {
            currentChunkSpan.textContent = this.currentChunkIndex + 1;
            totalChunksSpan.textContent = this.chunks.length;
        } else {
            console.warn('Elementi di progresso non trovati nel DOM');
        }
    }

    async navigateChunk() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        
        // Ottieni gli elementi correnti
        const textElement = this.modal.querySelector('.chunk-text');
        const promptElement = this.modal.querySelector('.feedback-prompt');
        
        // Aggiungi le classi di uscita
        if (textElement) {
            textElement.classList.add('slide-out-left');
        }
        if (promptElement) {
            promptElement.classList.add('slide-out-left');
        }
        
        // Aspetta che l'animazione di uscita sia completata
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Aggiorna l'indice
        this.currentChunkIndex++;
        console.log('Nuovo indice chunk:', this.currentChunkIndex);
        
        // Aggiorna il contenuto
        this.updateChunkContent();
        
        // Ottieni i nuovi elementi
        const newTextElement = this.modal.querySelector('.chunk-text');
        const newPromptElement = this.modal.querySelector('.feedback-prompt');
        
        // Aggiungi le classi di ingresso
        if (newTextElement) {
            newTextElement.classList.add('slide-in-right');
        }
        if (newPromptElement) {
            newPromptElement.classList.add('slide-in-right');
        }
        
        // Aggiorna il progresso
        this.updateProgress();
        
        // Aspetta che l'animazione di ingresso sia completata
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Rimuovi le classi di animazione
        if (newTextElement) {
            newTextElement.classList.remove('slide-in-right');
        }
        if (newPromptElement) {
            newPromptElement.classList.remove('slide-in-right');
        }
        
        this.isAnimating = false;
    }

    showLoader() {
        this.loader.style.display = 'flex';
    }

    hideLoader() {
        this.loader.style.display = 'none';
    }
}

// Classe per gestire lo stato della degustazione
class WineTastingSession {
    constructor() {
        this.wineName = null;
        this.currentStage = null;
        this.chunks = [];
        this.currentChunkIndex = 0;
        this.feedback = new Map();
        this.stages = []; // Lista degli stage disponibili per il vino
        this.completedStages = new Set();
    }

    initialize(wineName, stage, chunks, stages) {
        this.wineName = wineName;
        this.currentStage = stage;
        this.chunks = chunks;
        this.currentChunkIndex = 0;
        this.stages = stages;
        this.completedStages.clear();
        this.feedback.clear();
        console.log('Sessione inizializzata con stage:', this.stages);
    }

    updateFromApiResponse(response) {
        this.wineName = response.wineName;
        this.currentStage = response.stage;
        this.chunks = response.chunks;
        this.currentChunkIndex = 0;
    }

    extractStagesFromChunks(chunks) {
        const stages = new Set();
        chunks.forEach(chunk => {
            if (chunk.stage) {
                stages.add(chunk.stage);
            }
        });
        return Array.from(stages).sort();
    }

    // Salva il feedback per il chunk corrente
    saveFeedback(feedbackText) {
        const currentChunk = this.chunks[this.currentChunkIndex];
        if (currentChunk) {
            this.feedback.set(currentChunk.chunkIndex, feedbackText);
        }
    }

    // Ottiene il feedback per un chunk specifico
    getFeedback(chunkIndex) {
        return this.feedback.get(chunkIndex) || '';
    }

    // Verifica se il chunk corrente richiede feedback
    requiresFeedback() {
        const currentChunk = this.chunks[this.currentChunkIndex];
        return currentChunk ? currentChunk.expectFeedback : false;
    }

    // Verifica se tutti i chunks dello stage corrente sono stati completati
    isCurrentStageComplete() {
        return this.currentChunkIndex === this.chunks.length - 1;
    }

    // Verifica se tutti gli stage sono stati completati
    isTastingComplete() {
        return this.completedStages.size === this.stages.length;
    }

    // Marca lo stage corrente come completato
    markStageAsComplete() {
        if (this.currentStage) {
            this.completedStages.add(this.currentStage);
        }
    }

    getNextStage() {
        const currentIndex = this.stages.indexOf(this.currentStage);
        console.log('Stage corrente:', this.currentStage);
        console.log('Indice corrente:', currentIndex);
        console.log('Tutti gli stage:', this.stages);
        
        if (currentIndex < this.stages.length - 1) {
            const nextStage = this.stages[currentIndex + 1];
            console.log('Prossimo stage trovato:', nextStage);
            return nextStage;
        }
        console.log('Nessun prossimo stage disponibile');
        return null;
    }

    // Naviga al prossimo chunk
    nextChunk() {
        if (this.currentChunkIndex < this.chunks.length - 1) {
            this.currentChunkIndex++;
            return true;
        }
        return false;
    }

    // Naviga al chunk precedente
    previousChunk() {
        if (this.currentChunkIndex > 0) {
            this.currentChunkIndex--;
            return true;
        }
        return false;
    }

    // Ottiene il chunk corrente
    getCurrentChunk() {
        return this.chunks[this.currentChunkIndex];
    }

    // Resetta lo stato della sessione
    reset() {
        this.wineName = null;
        this.currentStage = null;
        this.chunks = [];
        this.currentChunkIndex = 1;
        this.feedback.clear();
        this.stages = [];
        this.completedStages.clear();
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