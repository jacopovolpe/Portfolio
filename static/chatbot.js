document.addEventListener('DOMContentLoaded', function () {
    const chatbotIcon = document.getElementById('chatbot-icon');
    const chatbotContainer = document.getElementById('chatbot-container');
    const closeChatbot = document.getElementById('close-chatbot');
    const suggestionButtons = document.querySelectorAll('.suggestion-btn');
    const chatbotInputField = document.getElementById('chatbot-input-field');
    const sendButton = document.getElementById('send-btn');
    const chatbotMessages = document.getElementById('chatbot-messages');

    // Apri/chiudi il chatbot
    chatbotIcon.addEventListener('click', () => {
        chatbotContainer.style.display = 'flex';
    });

    closeChatbot.addEventListener('click', () => {
        chatbotContainer.style.display = 'none';
    });

    // Invia una domanda quando si clicca su un suggerimento
    suggestionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const question = button.innerText;
            sendMessage(question);
        });
    });

    // Invia una domanda quando si preme il pulsante di invio
    sendButton.addEventListener('click', () => {
        const question = chatbotInputField.value;
        if (question.trim() !== '') {
            sendMessage(question);
            chatbotInputField.value = '';
        }
    });

    // Invia una domanda quando si preme "Invio" nella casella di testo
    chatbotInputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const question = chatbotInputField.value;
            if (question.trim() !== '') {
                sendMessage(question);
                chatbotInputField.value = '';
            }
        }
    });

    // Funzione per inviare un messaggio e ricevere una risposta
    async function sendMessage(message) {
        // Aggiungi il messaggio dell'utente al chatbot
        const userMessage = document.createElement('div');
        userMessage.className = 'message user-message';
        userMessage.innerText = message;
        chatbotMessages.appendChild(userMessage);

        // Chiama l'API del chatbot
        const response = await callGemini(message);

        // Aggiungi la risposta del chatbot
        const botMessage = document.createElement('div');
        botMessage.className = 'message bot-message';
        botMessage.innerText = response;
        chatbotMessages.appendChild(botMessage);

        // Scorri verso il basso per mostrare l'ultimo messaggio
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    // Funzione per chiamare l'API del chatbot
    async function callGemini(prompt) {
        body = JSON.stringify({
            contents: [
                {
                    parts: [
                        {
                            text: prompt,
                        },
                    ],
                },
            ],
        });

        console.log(body);
        const response = await fetch("/.netlify/functions/chatbot", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: body,
        });

        const data = await response.json();
        return data.response;
    }
});