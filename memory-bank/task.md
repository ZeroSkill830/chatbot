# Task: Animazione Lottie per Toggle Button

Di seguito sono elencati i passaggi necessari per integrare un'animazione Lottie (jsonLottie) per il bottone di apertura/chiusura del chatbot:

- [X] **1. Integrare Libreria Lottie:**
  - Aggiungere la libreria `lottie-web` al progetto. Si può fare tramite CDN o installando il pacchetto se si usa un bundler.
- [ ] **2. Ottenere l'Animazione Lottie:**
  - Trovare o creare un file JSON Lottie adatto per rappresentare gli stati 'aperto' e 'chiuso' del bottone.
- [ ] **3. Caricare l'Animazione:**
  - Decidere dove caricare il file JSON (es. insieme agli altri asset).
  - Modificare il codice (probabilmente in `chatbot-ui.js` o dove viene creato il bottone) per caricare l'animazione Lottie usando `lottie-web`.
- [ ] **4. Sostituire l'Icona Esistente:**
  - Modificare la funzione che crea il toggle button in `chatbot-ui.js`.
  - Rimuovere l'icona SVG o il testo corrente.
  - Aggiungere un contenitore `div` dove verrà renderizzata l'animazione Lottie.
- [ ] **5. Controllare l'Animazione:**
  - Aggiornare la logica che gestisce il click sul toggle button.
  - Utilizzare l'API di `lottie-web` per controllare la riproduzione dell'animazione (es. `playSegments`) quando il chatbot viene aperto o chiuso.
- [ ] **6. Styling:**
  - Aggiungere/modificare le regole CSS necessarie in `chatbot-toggle-button.css` (o un file dedicato) per dimensionare e posizionare correttamente l'animazione Lottie all'interno del bottone.
- [ ] **7. Testing:**
  - Verificare che l'animazione funzioni correttamente su diversi browser.
  - Assicurarsi che l'animazione cambi stato in modo fluido all'apertura/chiusura.
