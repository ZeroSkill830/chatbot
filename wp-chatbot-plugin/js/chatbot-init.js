// Funzione helper per caricare CSS nello Shadow DOM (duplicata da loader.js, potrebbe essere messa in un file utility comune)
function loadCSSInShadow(url, shadowRoot) {
    console.log(`WP Init: Tentativo caricamento CSS in Shadow DOM: ${url}`); // Log chiamata funzione
    return new Promise((resolve, reject) => {
        if (!shadowRoot) {
            return reject(new Error("Shadow root non fornito per caricare CSS."));
        }
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = url;
        link.onload = () => {
            console.log(`WP Init: CSS caricato nello Shadow DOM: ${url}`);
            resolve();
        };
        link.onerror = (error) => {
            console.error(`WP Init: Errore nel caricamento del CSS nello Shadow DOM: ${url}`, error);
            reject(error);
        };
        shadowRoot.appendChild(link); // Appendi allo shadow root
    });
}

// Funzione per ottenere il token di autenticazione (adattata per WP)
async function fetchAuthTokenWP() {
    // Recupera dati da PHP
    const tokenUrl = (typeof wpChatbotData !== 'undefined' && wpChatbotData.authTokenUrl) 
                     ? wpChatbotData.authTokenUrl 
                     : null;
    const clientId = (typeof wpChatbotData !== 'undefined' && wpChatbotData.authClientId) 
                     ? wpChatbotData.authClientId 
                     : null;

    if (!tokenUrl || !clientId) {
        console.error("WP Init: URL token o Client ID non configurati in wpChatbotData.");
        return null;
    }

    console.log("WP Init: Tentativo di ottenere token da", tokenUrl);
    try {
        const response = await fetch(tokenUrl, {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ clientId: clientId }) 
        });

        if (!response.ok) {
            throw new Error(`Errore HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const token = data.accessToken || data.token;
        if (!token) {
             throw new Error("Token non trovato nella risposta dell'API.");
        }
        console.log("WP Init: Token ottenuto con successo.");
        window.chatbotAuthToken = token; // Memorizza il token globalmente
        return token;
    } catch (error) {
        console.error("WP Init: Impossibile ottenere il token di autenticazione:", error);
        window.chatbotAuthToken = null;
        return null;
    }
}

document.addEventListener('DOMContentLoaded', async function () {
    
    // *** NUOVO: Ottieni prima il token ***
    const authToken = await fetchAuthTokenWP();
    if (!authToken) {
        console.error("WP Init: Inizializzazione parziale - Token non disponibile.");
        // Considera se bloccare qui o permettere inizializzazione senza token
    }

    // Recupera i dati CSS passati da PHP...
    const cssUrls = (typeof wpChatbotData !== 'undefined' && wpChatbotData.cssUrls)
        ? wpChatbotData.cssUrls
        : [];

    // Crea istanza Chatbot e inizializza
    const chatbot = new Chatbot();
    window.chatbotInstance = chatbot; // Esponi globalmente se necessario

    const initConfig = {
        loadCSSInShadow: loadCSSInShadow,
        chatbotStyleURLs: cssUrls,
        // authToken: authToken // Opzionale: passa token nella config se preferito a globale
    };
    
    await chatbot.initialize(initConfig); // <-- Aggiunto await se initialize è async
}); 