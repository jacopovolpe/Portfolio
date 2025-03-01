document.addEventListener('DOMContentLoaded', function () {
    const chatbotIcon = document.getElementById('chatbot-icon');
    const chatbotContainer = document.getElementById('chatbot-container');
    const closeChatbot = document.getElementById('close-chatbot');
    const suggestionButtons = document.querySelectorAll('.suggestion-btn');
    const chatbotInputField = document.getElementById('chatbot-input-field');
    const sendButton = document.getElementById('send-btn');
    const chatbotMessages = document.getElementById('chatbot-messages');
    const chatbotSuggestions = document.getElementById('chatbot-suggestions');

    let suggestionsTimeout;

    // Funzioni per nascondere/mostrare i suggerimenti con animazione
    function hideSuggestions() {
        chatbotSuggestions.classList.add('hidden');
    }

    function showSuggestions() {
        chatbotSuggestions.classList.remove('hidden');
    }

    function resetSuggestionsTimer() {
        clearTimeout(suggestionsTimeout);
        // Se sono nascosti, dopo 15 secondi li riappare con un effetto di fade-in
        suggestionsTimeout = setTimeout(() => {
            showSuggestions();
        }, 15000);
    }

    // Apri/chiudi il chatbot
    chatbotIcon.addEventListener('click', () => {
        chatbotContainer.style.display = 'flex';
        // Applichiamo una leggera animazione di slide quando il container viene mostrato
        chatbotContainer.classList.add('slide-in');
        setTimeout(() => {
            chatbotContainer.classList.remove('slide-in');
        }, 500);
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
        // Nascondi i suggerimenti appena viene inviata la prima domanda
        if (!chatbotSuggestions.classList.contains('hidden')) {
            hideSuggestions();
        }
        // Ripristina il timer per riapparire i suggerimenti dopo 15 secondi di inattività
        resetSuggestionsTimer();

        // Crea e aggiungi il messaggio dell'utente con un'animazione di fade-in
        const userMessage = document.createElement('div');
        userMessage.className = 'message user-message';
        userMessage.innerText = message;
        chatbotMessages.appendChild(userMessage);

        // Scorri verso il basso con effetto smooth (CSS gestisce lo smooth scrolling)
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

        // Chiamata all'API del chatbot
        const response = await callGemini(message);

        // Crea e aggiungi la risposta del chatbot con animazione
        const botMessage = document.createElement('div');
        botMessage.className = 'message bot-message';
        botMessage.innerText = response;
        chatbotMessages.appendChild(botMessage);

        // Scrolla nuovamente verso il basso per mostrare l'ultimo messaggio
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    // Funzione per chiamare l'API del chatbot
    async function callGemini(prompt) {
        try {
            const body = JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: prompt }
                        ]
                    }
                ]
            });

            const response = await fetch("/.netlify/functions/chatbot", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: body,
            });

            if (!response.ok) {
                throw new Error(`Errore nella richiesta: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            if (!data.response) {
                throw new Error("Risposta non valida dal chatbot.");
            }

            return data.response;
        } catch (error) {
            console.error("Errore durante la chiamata al chatbot:", error);
            return "Si è verificato un errore nel recupero della risposta. Riprova più tardi.";
        }
    }

    // Chiamata iniziale di test
    callGemini("Ciao, chi sei?").then((response) => {
        console.log(response);
    });
});
