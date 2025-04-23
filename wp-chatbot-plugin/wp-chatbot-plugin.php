<?php
/**
 * Plugin Name:       WP Chatbot Plugin
 * Plugin URI:        https://x.com/AgentoLabs
 * Description:       Integra un chatbot nel sito WordPress.
 * Version:           1.0.1
 * Requires at least: 5.2
 * Requires PHP:      7.2
 * Author:            AgentoLabs
 * Author URI:        https://x.com/AgentoLabs
 * License:           GPL v2 or later
 * License URI:       https://x.com/AgentoLabs
 * Text Domain:       wp-chatbot-plugin
 * Domain Path:       /languages
 */

// Previene l'accesso diretto al file
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Funzione per accodare script e stili
function wpcbp_enqueue_chatbot_assets() {
    $plugin_url = plugin_dir_url( __FILE__ );
    $plugin_path = plugin_dir_path( __FILE__ ); // Utile per versioning
    $lottie_version = '5.12.2'; // Versione di Lottie

    // --- Stili --- 

    // Accoda Google Font (Urbanist) - Lo manteniamo globale per semplicità ora
    wp_enqueue_style( 'google-fonts-urbanist', 'https://fonts.googleapis.com/css2?family=Urbanist:ital,wght@0,100..900;1,100..900&display=swap', array(), null );

    // NON accodiamo più i CSS specifici del chatbot qui. Verranno caricati via JS nello Shadow DOM.
    /*
    wp_enqueue_style( 'wpcbp-variables', $plugin_url . 'styles/variables.css', array(), filemtime($plugin_path . 'styles/variables.css') );
    wp_enqueue_style( 'wpcbp-container', $plugin_url . 'styles/chatbot-container.css', array('wpcbp-variables'), filemtime($plugin_path . 'styles/chatbot-container.css') );
    wp_enqueue_style( 'wpcbp-header', $plugin_url . 'styles/chatbot-header.css', array('wpcbp-variables'), filemtime($plugin_path . 'styles/chatbot-header.css') );
    wp_enqueue_style( 'wpcbp-message-area', $plugin_url . 'styles/chatbot-message-area.css', array('wpcbp-variables'), filemtime($plugin_path . 'styles/chatbot-message-area.css') );
    wp_enqueue_style( 'wpcbp-message', $plugin_url . 'styles/chatbot-message.css', array('wpcbp-variables'), filemtime($plugin_path . 'styles/chatbot-message.css') );
    wp_enqueue_style( 'wpcbp-input', $plugin_url . 'styles/chatbot-input.css', array('wpcbp-variables'), filemtime($plugin_path . 'styles/chatbot-input.css') );
    wp_enqueue_style( 'wpcbp-quick-actions', $plugin_url . 'styles/chatbot-quick-actions.css', array('wpcbp-variables'), filemtime($plugin_path . 'styles/chatbot-quick-actions.css') );
    wp_enqueue_style( 'wpcbp-send-button', $plugin_url . 'styles/chatbot-send-button.css', array('wpcbp-variables'), filemtime($plugin_path . 'styles/chatbot-send-button.css') );
    wp_enqueue_style( 'wpcbp-footer', $plugin_url . 'styles/chatbot-footer.css', array('wpcbp-variables'), filemtime($plugin_path . 'styles/chatbot-footer.css') );
    wp_enqueue_style( 'wpcbp-toggle-button', $plugin_url . 'styles/chatbot-toggle-button.css', array('wpcbp-variables'), filemtime($plugin_path . 'styles/chatbot-toggle-button.css') );
    */

    // Lista dei percorsi relativi dei CSS del chatbot (l'ordine è importante!)
    $chatbot_css_files = array(
        'styles/variables.css',
        'styles/chatbot-container.css',
        'styles/chatbot-header.css',
        'styles/chatbot-message-area.css',
        'styles/chatbot-message.css',
        'styles/chatbot-footer.css',
        'styles/chatbot-input.css',
        'styles/chatbot-send-button.css',
        'styles/chatbot-toggle-button.css',
        'styles/chatbot-quick-actions.css',
        // Aggiungere altri se necessario
    );

    // Genera gli URL completi e aggiungi un parametro di versione basato sul timestamp del file
    $chatbot_style_urls = array();
    foreach ( $chatbot_css_files as $file ) {
        $file_path = $plugin_path . $file;
        if ( file_exists( $file_path ) ) {
            $chatbot_style_urls[] = $plugin_url . $file . '?ver=' . filemtime( $file_path );
        }
    }

    // --- Script --- 

    // Accoda Libreria Lottie da CDN
    // Lottie deve essere caricato prima di chatbot-lottie.js
    wp_enqueue_script( 'lottie-web', 'https://cdnjs.cloudflare.com/ajax/libs/lottie-web/' . $lottie_version . '/lottie.min.js', array(), $lottie_version, true );

    // Accoda JS nel footer con dipendenze corrette
    // Nota: Il versioning con filemtime è una buona pratica per il cache busting
    wp_enqueue_script( 'wpcbp-chatbot-ui', $plugin_url . 'js/chatbot-ui.js', array(), filemtime($plugin_path . 'js/chatbot-ui.js'), true );
    wp_enqueue_script( 'wpcbp-chatbot-lottie', $plugin_url . 'js/chatbot-lottie.js', array('lottie-web', 'wpcbp-chatbot-ui'), filemtime($plugin_path . 'js/chatbot-lottie.js'), true );
    wp_enqueue_script( 'wpcbp-chatbot-handler', $plugin_url . 'js/chatbot-message-handler.js', array('wpcbp-chatbot-ui'), filemtime($plugin_path . 'js/chatbot-message-handler.js'), true );
    wp_enqueue_script( 'wpcbp-chatbot-core', $plugin_url . 'js/chatbot-core.js', array('wpcbp-chatbot-ui', 'wpcbp-chatbot-handler', 'wpcbp-chatbot-lottie'), filemtime($plugin_path . 'js/chatbot-core.js'), true );
    
    // Lo script di init dipende dal core
    wp_enqueue_script( 'wpcbp-chatbot-init', $plugin_url . 'js/chatbot-init.js', array('wpcbp-chatbot-core'), filemtime($plugin_path . 'js/chatbot-init.js'), true );

    // Passa l'array di URL CSS allo script di inizializzazione
    wp_localize_script( 'wpcbp-chatbot-init', 'wpChatbotData', array(
        'cssUrls' => $chatbot_style_urls, // Array con gli URL completi e versionati
        // Potremmo passare altre configurazioni qui in futuro
        // 'ajaxUrl' => admin_url( 'admin-ajax.php' ), 
    ) );

}

// Aggancia la funzione all'hook 'wp_enqueue_scripts'
add_action( 'wp_enqueue_scripts', 'wpcbp_enqueue_chatbot_assets' );

?> 