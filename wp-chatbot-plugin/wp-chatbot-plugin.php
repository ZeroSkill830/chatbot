<?php
/**
 * Plugin Name:       WP Chatbot Plugin
 * Plugin URI:        https://x.com/AgentoLabs
 * Description:       Integra un chatbot nel sito WordPress.
 * Version:           1.0.0
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
    $lottie_version = '5.12.2'; // Versione di Lottie

    // Accoda Google Font (Urbanist)
    wp_enqueue_style( 'google-fonts-urbanist', 'https://fonts.googleapis.com/css2?family=Urbanist:ital,wght@0,100..900;1,100..900&display=swap', array(), null );

    // Accoda CSS
    wp_enqueue_style( 'wpcbp-variables', $plugin_url . 'styles/variables.css' );
    wp_enqueue_style( 'wpcbp-container', $plugin_url . 'styles/chatbot-container.css', array('wpcbp-variables') );
    wp_enqueue_style( 'wpcbp-header', $plugin_url . 'styles/chatbot-header.css', array('wpcbp-variables') );
    wp_enqueue_style( 'wpcbp-message-area', $plugin_url . 'styles/chatbot-message-area.css', array('wpcbp-variables') );
    wp_enqueue_style( 'wpcbp-message', $plugin_url . 'styles/chatbot-message.css', array('wpcbp-variables') );
    wp_enqueue_style( 'wpcbp-input', $plugin_url . 'styles/chatbot-input.css', array('wpcbp-variables') );
    wp_enqueue_style( 'wpcbp-quick-actions', $plugin_url . 'styles/chatbot-quick-actions.css', array('wpcbp-variables') );
    wp_enqueue_style( 'wpcbp-send-button', $plugin_url . 'styles/chatbot-send-button.css', array('wpcbp-variables') );
    wp_enqueue_style( 'wpcbp-footer', $plugin_url . 'styles/chatbot-footer.css', array('wpcbp-variables') );
    wp_enqueue_style( 'wpcbp-toggle-button', $plugin_url . 'styles/chatbot-toggle-button.css', array('wpcbp-variables') );

    // Accoda Libreria Lottie da CDN
    wp_enqueue_script( 'lottie-web', 'https://cdnjs.cloudflare.com/ajax/libs/lottie-web/' . $lottie_version . '/lottie.min.js', array(), $lottie_version, true );

    // Accoda JS nel footer con dipendenze corrette
    wp_enqueue_script( 'wpcbp-chatbot-ui', $plugin_url . 'js/chatbot-ui.js', array(), null, true );
    // Lo script lottie custom dipende dalla libreria Lottie e dalla UI
    wp_enqueue_script( 'wpcbp-chatbot-lottie', $plugin_url . 'js/chatbot-lottie.js', array('lottie-web', 'wpcbp-chatbot-ui'), null, true );
    // Handler dipende dalla UI
    wp_enqueue_script( 'wpcbp-chatbot-handler', $plugin_url . 'js/chatbot-message-handler.js', array('wpcbp-chatbot-ui'), null, true );
    // Core dipende da UI, Handler e Lottie (se interagisce con animazioni)
    wp_enqueue_script( 'wpcbp-chatbot-core', $plugin_url . 'js/chatbot-core.js', array('wpcbp-chatbot-ui', 'wpcbp-chatbot-handler', 'wpcbp-chatbot-lottie'), null, true );
    // Init dipende dal Core
    wp_enqueue_script( 'wpcbp-chatbot-init', $plugin_url . 'js/chatbot-init.js', array('wpcbp-chatbot-core'), null, true );

}

// Aggancia la funzione all'hook 'wp_enqueue_scripts'
add_action( 'wp_enqueue_scripts', 'wpcbp_enqueue_chatbot_assets' );

?> 