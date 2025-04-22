document.addEventListener('DOMContentLoaded', function() {
    // Assicurati che la classe Chatbot sia disponibile (caricata da chatbot-core.js)
    if (typeof Chatbot === 'function') {
        const chatbot = new Chatbot();
        chatbot.initialize();
    } else {
        console.error('Classe Chatbot non trovata. Assicurati che chatbot-core.js sia caricato prima di chatbot-init.js');
    }
}); 