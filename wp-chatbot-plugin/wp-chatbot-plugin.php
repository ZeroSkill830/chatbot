<?php
/**
 * Plugin Name:       WP Chatbot Plugin
 * Plugin URI:        https://example.com/plugins/the-basics/
 * Description:       Integra un chatbot nel sito WordPress.
 * Version:           1.0.0
 * Requires at least: 5.2
 * Requires PHP:      7.2
 * Author:            Il Tuo Nome Qui
 * Author URI:        https://author.example.com/
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
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

    // Accoda CSS
    wp_enqueue_style( 'wpcbp-variables', $plugin_url . 'styles/variables.css' );
    wp_enqueue_style( 'wpcbp-container', $plugin_url . 'styles/chatbot-container.css', array('wpcbp-variables') );
    wp_enqueue_style( 'wpcbp-header', $plugin_url . 'styles/chatbot-header.css', array('wpcbp-variables') );
    wp_enqueue_style( 'wpcbp-message-area', $plugin_url . 'styles/chatbot-message-area.css', array('wpcbp-variables') );
    wp_enqueue_style( 'wpcbp-message', $plugin_url . 'styles/chatbot-message.css', array('wpcbp-variables') );
    wp_enqueue_style( 'wpcbp-input', $plugin_url . 'styles/chatbot-input.css', array('wpcbp-variables') );
    wp_enqueue_style( 'wpcbp-send-button', $plugin_url . 'styles/chatbot-send-button.css', array('wpcbp-variables') );
    wp_enqueue_style( 'wpcbp-footer', $plugin_url . 'styles/chatbot-footer.css', array('wpcbp-variables') );
    wp_enqueue_style( 'wpcbp-toggle-button', $plugin_url . 'styles/chatbot-toggle-button.css', array('wpcbp-variables') );

    // Accoda JS nel footer
    // Nota: WordPress gestisce le dipendenze se specificate. Qui le accodiamo in ordine.
    wp_enqueue_script( 'wpcbp-chatbot-ui', $plugin_url . 'js/chatbot-ui.js', array(), null, true );
    wp_enqueue_script( 'wpcbp-chatbot-handler', $plugin_url . 'js/chatbot-message-handler.js', array('wpcbp-chatbot-ui'), null, true ); // Dipende da UI?
    wp_enqueue_script( 'wpcbp-chatbot-core', $plugin_url . 'js/chatbot-core.js', array('wpcbp-chatbot-handler'), null, true ); // Dipende da UI e Handler?
    wp_enqueue_script( 'wpcbp-chatbot-init', $plugin_url . 'js/chatbot-init.js', array('wpcbp-chatbot-core'), null, true ); // Dipende da Core

}

// Aggancia la funzione all'hook 'wp_enqueue_scripts'
add_action( 'wp_enqueue_scripts', 'wpcbp_enqueue_chatbot_assets' );

?> 