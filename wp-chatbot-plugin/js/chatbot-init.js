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

document.addEventListener('DOMContentLoaded', function () {

    // Recupera i dati passati da PHP (se esistono e contengono cssUrls)
    const cssUrls = (typeof wpChatbotData !== 'undefined' && wpChatbotData.cssUrls)
        ? wpChatbotData.cssUrls
        : [];




    const chatbot = new Chatbot();

    const initConfig = {
        loadCSSInShadow: loadCSSInShadow,
        chatbotStyleURLs: cssUrls
    };
    // Chiama initialize passando la funzione per caricare CSS nello shadow DOM
    // e la lista di URL recuperata da wp_localize_script
    // Nota: Non passiamo loadGoogleFontInShadow perché lo stiamo caricando globalmente via PHP
    chatbot.initialize(initConfig);
}); 