import { Component, OnInit } from '@angular/core';

declare global {
  interface Window {
    botpressWebChat: any;
  }
}

@Component({
  selector: 'app-chatbot',
  template: '<div id="bp-webchat" class="bp-webchat-container"></div>',
  styleUrls: ['./chatbot.component.scss']
})
export class ChatbotComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    // Charger le script Botpress une fois que le composant est initialisé
    this.loadBotpressScript();
  }

  loadBotpressScript(): void {
    // Créer l'élément script
    const script = document.createElement('script');
    script.src = "https://cdn.botpress.cloud/webchat/v0/inject.js";
    script.async = true;
    
    // Configurer et initialiser le widget lorsque le script est chargé
    script.onload = () => {
      window.botpressWebChat.init({
        "botId": "8369a6e8-d79f-408e-920d-6b5ff55ofbec",        // ⚠️ Remplacez par votre botId
        "clientId": "25f5629e-c307-4c2a-ade6-0ad336646e82",  // ⚠️ Remplacez par votre clientId
        "hostUrl": "https://cdn.botpress.cloud/webchat/v0",
        "messagingUrl": "https://messaging.botpress.cloud",
        "botName": "FilmBot",   // Personnalisez ce nom
        "stylesheet": "https://cdn.botpress.cloud/webchat/v0/themes/default.css",
        "useSessionStorage": true,
        "enableConversationDeletion": true,
        "showConversationButton": true,
        "disableAnimations": false,
        "hideWidget": false,
        "disableNotificationSound": false,
        "closeOnEscape": false,
        "showCloseButton": true,
        "containerWidth": "100%",
        "layoutWidth": "100%",
        "registerQna": true
      });
    };
    
    // Ajouter le script au document
    document.body.appendChild(script);
  }
}