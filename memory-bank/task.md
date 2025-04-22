# Task List: Implementazione UI Moderna (Modulare)

1.  **[x] Creare Struttura Cartelle/File CSS:**
    *   Creare cartella `styles/`.
    *   Creare file CSS vuoti: `chatbot-container.css`, `chatbot-header.css`, `chatbot-message-area.css`, `chatbot-message.css`, `chatbot-footer.css`, `chatbot-input.css`, `chatbot-send-button.css`, `chatbot-toggle-button.css`.

2.  **[x] Aggiornare `loader.js` per Caricare CSS Modulari:**
    *   Modificare `loader.js` per definire una lista di URL CSS nella cartella `styles/`.
    *   Assicurarsi che la funzione `loadCSS` (o una nuova `loadAllCSS`) carichi tutti i file specificati (con percorsi relativi per lo sviluppo locale).

3.  **[x] Implementare Stili Base Contenitore (`styles/chatbot-container.css`):**
    *   Definire stile contenitore: `position`, `bottom`, `right`, `width`, `max-height`, `background-color`, `border-radius`, `box-shadow`, `display: flex`, `flex-direction: column` (ispirato all'immagine).

4.  **[x] Implementare Stili Header (`styles/chatbot-header.css`):**
    *   Stilare `.chatbot-header`: `padding`, `border-bottom`, `display: flex`, `justify-content: space-between`, `align-items: center`.
    *   Stilare titolo (`span`) e bottone chiusura (`.chatbot-close-button`: aspetto, no bordi/sfondo).

5.  **[x] Implementare Stili Area Messaggi (`styles/chatbot-message-area.css`):**
    *   Stilare `.chatbot-message-area`: `flex-grow: 1`, `overflow-y: auto`, `padding`.

6.  **[x] Implementare Stili Messaggi (`styles/chatbot-message.css`):**
    *   Stilare `.chatbot-message`: `padding`, `border-radius`, `margin-bottom`, `max-width`.
    *   Definire `.chatbot-message-user`: `background-color` (es. blu/viola chiaro), `color` (scuro/bianco), `align-self: flex-end`, `margin-left`.
    *   Definire `.chatbot-message-bot`: `background-color` (es. grigio chiaro), `color` (scuro), `align-self: flex-start`, `margin-right`.
    *   Impostare font family, size, line-height.

7.  **[x] Implementare Stili Footer/Input Area (`styles/chatbot-footer.css`):**
    *   Stilare `.chatbot-footer`: `display: flex`, `align-items: center`, `padding`, `border-top`.

8.  **[x] Implementare Stili Input (`styles/chatbot-input.css`):**
    *   Stilare `.chatbot-input`: `flex-grow: 1`, `border: none`, `outline: none`, `padding`, `border-radius`, `background-color` (leggermente diversa), `font-size`.

9.  **[x] Implementare Stili Bottone Invia (`styles/chatbot-send-button.css`):**
    *   Stilare `.chatbot-send-button`: `background: none`, `border: none`, `padding`, `cursor: pointer`, `color` (es. blu/viola), `font-size` (per icona/testo), `margin-left`.

10. **[x] Implementare Stili Bottone Toggle (`styles/chatbot-toggle-button.css`):**
    *   Stilare `.chatbot-toggle-button`: `position`, `bottom`, `right`, `width`, `height`, `background-color` (blu/viola), `color: white`, `border: none`, `border-radius: 50%`, `font-size`, `cursor: pointer`, `box-shadow`, `display: flex`, `align-items: center`, `justify-content: center`.

11. **Refinement e Adattamenti:**
    *   Scegliere font-family globale (es. in `body` o contenitore). Rivedere colori, spaziature per coerenza. Testare scroll, focus input.
