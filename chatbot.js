class Chatbot {
    constructor() {
        console.log("Chatbot istanziato!");
        this.chatContainer = null;
        this.toggleButton = null;
        this.isOpen = false;
    }

    // Metodo per creare l'UI (bottone e finestra chat)
    createUI() {
        console.log("Creazione UI del chatbot...");

        // Crea il bottone flottante
        this.toggleButton = document.createElement('button');
        this.toggleButton.className = 'chatbot-toggle-button';
        this.toggleButton.innerHTML = '<span>?</span>'; // Icona o testo
        this.toggleButton.onclick = () => this.toggleChat();
        document.body.appendChild(this.toggleButton);

        // Crea il contenitore della chat (inizialmente nascosto)
        this.chatContainer = document.createElement('div');
        this.chatContainer.className = 'chatbot-container';
        // Aggiungeremo qui header, area messaggi, input
        this.chatContainer.innerHTML = '<p>Contenuto Chat (da implementare)</p>';
        document.body.appendChild(this.chatContainer);

        console.log("UI del chatbot creata.");
    }

    // Metodo per aprire/chiudere la chat
    toggleChat() {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.chatContainer.style.display = 'flex';
            this.toggleButton.innerHTML = '<span>&times;</span>'; // Cambia icona a 'X'
        } else {
            this.chatContainer.style.display = 'none';
            this.toggleButton.innerHTML = '<span>?</span>'; // Torna all'icona originale
        }
        console.log(`Chatbot ${this.isOpen ? 'aperto' : 'chiuso'}`);
    }

    // Metodo per caricare gli stili CSS dinamicamente
    static loadCSS(url) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = url;
            link.onload = () => {
                console.log(`CSS caricato: ${url}`);
                resolve();
            };
            link.onerror = (error) => {
                console.error(`Errore nel caricamento del CSS: ${url}`, error);
                reject(error);
            };
            document.head.appendChild(link);
        });
    }
}

// Esporta la classe se necessario (lo useremo nel loader)
// Potremmo anche non esportare e accedere tramite una variabile globale definita nel loader
// window.MyChatbot = Chatbot; // Esempio con variabile globale

// Per ora, non esportiamo nulla, sarà gestito dal loader 