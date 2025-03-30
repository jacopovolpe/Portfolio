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

    // Testo della prima risposta del bot (presentation)
    let presentation = "```html <p>Ciao! Sono Jacopo Volpe, laureando in Intelligenza Artificiale all'Università degli Studi di Salerno. Ho conseguito la laurea triennale in Ingegneria Informatica con il massimo dei voti e ora mi sto specializzando nell'ambito dell'Intelligenza Artificiale e Robotica Intelligente. Ho una solida esperienza in programmazione, soprattutto con Python e Spring Boot, e mi occupo di Machine Learning e Deep Learning. Ho lavorato a diversi progetti interessanti, tra cui uno per NTT Data dove ho sviluppato una soluzione basata su microservizi, e altri presso il Mivia Lab dell'Università di Salerno, focalizzati su visione artificiale, robotica cognitiva e elaborazione del linguaggio naturale. Sono appassionato di tecnologia e sempre desideroso di imparare cose nuove!</p> ```";

    // Funzione per "pulire" la risposta da eventuali formattazioni markdown
    function cleanMarkdown(response) {
        return response.replace(/```html/g, '')
                       .replace(/```/g, '')
                       .trim();
    }

    // Funzione per aggiungere un messaggio (user o bot)
    function addMessage(message, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        if (sender === 'user') {
            messageDiv.classList.add('user-message');
            messageDiv.innerText = message;
        } else if (sender === 'bot') {
            messageDiv.classList.add('bot-message');
            // Puliamo il messaggio dal markdown indesiderato prima di mostrarlo
            messageDiv.innerHTML = cleanMarkdown(message);
        }
        chatbotMessages.appendChild(messageDiv);
        // Scroll automatico verso l'ultimo messaggio
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    // Funzioni per nascondere/mostrare i suggerimenti con animazione
    function hideSuggestions() {
        chatbotSuggestions.classList.add('hidden');
    }

    function showSuggestions() {
        chatbotSuggestions.classList.remove('hidden');
    }

    function resetSuggestionsTimer() {
        clearTimeout(suggestionsTimeout);
        // Dopo 15 secondi, se non viene inviato un nuovo messaggio, i suggerimenti riappaiono con effetto fade-in
        suggestionsTimeout = setTimeout(() => {
            showSuggestions();
        }, 15000);
    }

    // Apri/chiudi il chatbot
    chatbotIcon.addEventListener('click', () => {
        chatbotContainer.style.display = 'flex';
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

    // Associa sendMessage al click sul bottone
    sendButton.addEventListener('click', () => {
        const question = chatbotInputField.value;
        if (question.trim() !== '') {
            sendMessage(question);
            chatbotInputField.value = '';
        }
    });

    // Associa sendMessage al tasto "Enter"
    chatbotInputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const question = chatbotInputField.value;
            if (question.trim() !== '') {
                sendMessage(question);
                chatbotInputField.value = '';
            }
        }
    });

    // Invia messaggio
    function sendMessage() {
        const message = inputField.value.trim();
        if (message) {
            addMessage(message, 'user');
            inputField.value = '';
            
            // Mostra lo stato di caricamento
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'message loading';
            loadingDiv.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';
            messagesContainer.appendChild(loadingDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            
            // Invia la richiesta al backend
            fetch('/.netlify/functions/chatbot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: message
                        }]
                    }]
                })
            })
            .then(response => response.json())
            .then(data => {
                // Rimuove lo stato di caricamento
                messagesContainer.removeChild(loadingDiv);
                
                if (data.error) {
                    addMessage(`Errore: ${data.error}`, 'error');
                } else {
                    addMessage(data.response, 'bot');
                }
            })
            .catch(error => {
                messagesContainer.removeChild(loadingDiv);
                addMessage(`Errore di connessione: ${error.message}`, 'error');
            });
        }
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

    // Aggiungi il messaggio di presentazione del bot al caricamento della pagina (pulito dai marker markdown)
    addMessage(presentation, 'bot');
});
