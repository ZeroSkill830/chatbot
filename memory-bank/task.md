## Task List per Implementare la Selezione del Livello di Degustazione

### Modifiche a `WineExperience.js`

1.  **Aggiornare la classe `WineExperience`:**
    *   [x] Aggiungere una nuova proprietà `this.currentTastingMode = null;` nel costruttore per memorizzare la modalità di degustazione selezionata.

2.  **Modificare il metodo `startWineTasting`:**
    *   [x] Cambiare la firma del metodo in: `async startWineTasting(wineName, mode = null, stageName = null)`.
    *   [x] All'inizio del metodo, aggiungere la logica per gestire e memorizzare il `mode`.
    *   [x] Nella chiamata `fetch` a `this.tastingEndpoint`, aggiornare il corpo della richiesta per usare `effectiveMode`.
    *   [x] Assicurarsi che quando `startWineTasting` è chiamato per passare allo stage successivo (da `showChunksModal`), non venga passato un `mode`, così da utilizzare `this.currentTastingMode`.

3.  **Creare il metodo `showModeSelectionModal(wineName)`:**
    *   [x] Definire un nuovo metodo `async showModeSelectionModal(wineName)` nella classe `WineExperience`.
    *   [x] **Struttura della Modale:**
        *   [x] Creare un overlay per la modale (es. `mode-selection-modal-overlay`).
        *   [x] Creare il contenitore principale della modale (es. `mode-selection-modal`).
        *   [x] Aggiungere un titolo (es. "Seleziona il tuo livello").
        *   [x] Creare un contenitore per le card di selezione (es. `mode-cards-container`).
    *   [x] **Card "Principiante":**
        *   [x] Creare un elemento card (es. `div` con classe `mode-card beginner-card`).
        *   [x] Aggiungere testo "Principiante".
        *   [ ] Aggiungere un'icona o una breve descrizione se desiderato.
        *   [x] Aggiungere un event listener al click che:
            *   [x] Chiami `this.closeModeSelectionModal()` (o rimuova direttamente la modale).
            *   [x] Chiami `await this.startWineTasting(wineName, 'beginner');`.
            *   [ ] Gestisca eventuali stati di caricamento/errori.
    *   [x] **Card "Esperto":**
        *   [x] Creare un elemento card (es. `div` con classe `mode-card expert-card`).
        *   [x] Aggiungere testo "Esperto".
        *   [ ] Aggiungere un'icona o una breve descrizione se desiderato.
        *   [x] Aggiungere un event listener al click che:
            *   [x] Chiami `this.closeModeSelectionModal()` (o rimuova direttamente la modale).
            *   [x] Chiami `await this.startWineTasting(wineName, 'expert');`.
            *   [ ] Gestisca eventuali stati di caricamento/errori.
    *   [x] **Bottone Annulla/Chiudi (Opzionale):**
        *   [x] Aggiungere un bottone per chiudere la modale.
    *   [x] **Inserimento nel DOM:**
        *   [x] Inserire la modale creata nello **shadow DOM del chatbot esistente** (accedendo tramite `document.querySelector('#chatbot-host').shadowRoot` o una reference simile disponibile in `WineExperience`).
        *   [x] Assicurarsi che solo una modale di selezione sia visibile alla volta.
    *   [x] Definire un metodo helper `closeModeSelectionModal()` per rimuovere la modale dal DOM.

4.  **Modificare il metodo `formatWinesForDisplay`:**
    *   [x] Nell'event listener del click su `wineCard`:
        *   [x] Rimuovere la chiamata diretta: `// await this.startWineTasting(wine.name);`
        *   [x] Aggiungere la chiamata: `this.showModeSelectionModal(wine.name);`
        *   [ ] Adattare/Reintegrare la gestione della classe `loading` in modo appropriato (es. dopo selezione modo, prima di `startWineTasting`). (Da rifinire)

### Creazione e Aggiunta Stili CSS

*   [x] **Creare un nuovo file CSS dedicato** (es. `styles/mode-selection-modal.css`).
*   [x] **Definire gli stili necessari nel nuovo file CSS:**
    *   [x] Stili per `mode-selection-modal-overlay`.
    *   [x] Stili per `mode-selection-modal` (posizionamento, dimensioni, layout interno).
    *   [x] Stili per il titolo della modale.
    *   [x] Stili per `mode-cards-container` (es. flexbox).
    *   [x] Stili per `.mode-card`, `.beginner-card`, `.expert-card` (aspetto, hover, active).
    *   [x] Assicurare responsività degli stili.
*   [x] **Aggiornare `loader.js`:**
    *   [x] Aggiungere il percorso al nuovo file CSS (es. `` `${BASE_URL}/styles/mode-selection-modal.css` ``) all'array `chatbotStyleURLs`.

### Test e Rifiniture

*   [ ] **Test Funzionale:**
    *   [ ] Verifica che la modale di selezione appaia cliccando un vino.
    *   [ ] Verifica avvio degustazione con `mode: 'beginner'`.
    *   [ ] Verifica avvio degustazione con `mode: 'expert'`.
    *   [ ] Verifica che i passaggi a stage successivi usino il `mode` corretto.
*   [ ] **Test UI/UX:**
    *   [ ] Controlla l'aspetto e l'usabilità della modale su diverse dimensioni schermo.
*   [ ] **Gestione Errori:**
    *   [ ] Verifica la gestione di errori post-selezione del `mode`.

### Considerazioni Future (Opzionale)

*   [ ] Animazioni per la modale.
*   [ ] Memorizzare la preferenza del livello utente.
