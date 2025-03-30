// functions/chatbot.js
const fetch = require('node-fetch');

// Cache per mantenere l'ultima conversazione (domanda/risposta)
let conversationHistory = {
    lastQuestion: null,
    lastAnswer: null
};

/**
 * Funzione per generare la risposta dal chatbot
 * @param {string} question - La domanda dell'utente
 * @param {string} infoContent - Informazioni personali da includere nel contesto
 * @param {string} apiKey - Chiave API per Gemini
 * @returns {Promise<{response: string, status: number}>} - Risposta e status
 */
async function generateChatbotResponse(question, infoContent, apiKey) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
    const prompt = `
        Ti fornisco alcune informazioni su di me in modo che tu possa rispondere come se fossi io.
        Se attinente alla domanda, elogia i miei punti di forza e le mie capacità.
        Non far nessun riferimento alla percentuale % <level> presente nelle informazioni che ti ho fornito.
        Non fare riferimento a me come Jacopo Volpe, ma come "io".
        Non fare riferimento a me come Jacopo, ma come "io".
        I link presenti in <document> sono tutti relativi alla pagina attuale. 
        Ad esempio puoi integrarli nella risposta in questo modo:
        Informazioni personali:
            ...
            <document>
                <type>Report</type>
                <link>doc/TirocinioTriennale_JacopoVolpe.pdf</link>
            </document> 
            ...
        Ripsondi:
            puoi scaricare il <a href="doc/TirocinioTriennale_JacopoVolpe.pdf">Report</a> qui.

        Determina la lingua della domanda e rispondi nello stesso idioma.
        Se la domanda è in italiano, rispondi in prima persona, in modo naturale e cortese.
        Se la domanda è in inglese, rispondi in first person, naturally and politely.

        Informazioni personali:
        ${infoContent}
        
        Domanda: ${question}

        ! DAMMI LA RISPOSTA IN FORMATO HTML.
    `;

    const payload = {
        contents: [
            {
                parts: [
                    {
                        text: prompt
                    }
                ]
            }
        ]
    };

    // Se c'è una domanda precedente nella history, aggiungila al contesto
    if (conversationHistory.lastQuestion && conversationHistory.lastAnswer) {
        payload.contents.unshift({
            role: "user",
            parts: [{ text: conversationHistory.lastQuestion }]
        });
        payload.contents.unshift({
            role: "model",
            parts: [{ text: conversationHistory.lastAnswer }]
        });
    }

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "Errore sconosciuto da Gemini");
        }

        const responseData = await response.json();
        const answer = responseData.candidates[0]?.content?.parts[0]?.text || "Nessuna risposta valida da Gemini.";

        // Aggiorna la history della conversazione
        conversationHistory = {
            lastQuestion: question,
            lastAnswer: answer
        };

        return {
            response: answer,
            status: 200
        };
    } catch (error) {
        console.error("Errore durante la chiamata API:", error);
        return {
            response: `Errore durante la generazione della risposta: ${error.message}`,
            status: 500
        };
    }
}

exports.handler = async (event, context) => {
    // Verifica che il metodo della richiesta sia POST
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: "Metodo non consentito. Usa POST." }),
        };
    }

    // Ottieni la chiave API e il contenuto di my_info dalle variabili d'ambiente
    const apiKey = process.env.GEMINI_KEY;
    const InfoContent = process.env.MY_INFO;

    if (!apiKey || !InfoContent) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Configurazione mancante: chiave API o informazioni personali." }),
        };
    }

    // Estrai il payload dalla richiesta
    let payload;
    try {
        payload = JSON.parse(event.body);
    } catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Payload JSON non valido." }),
        };
    }

    // Verifica che il payload contenga il campo contents con la domanda
    if (!payload.contents?.length || !payload.contents[0].parts?.length) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Formato payload non valido. Manca la domanda." }),
        };
    }

    const question = payload.contents[0].parts[0].text;
    
    // Genera la risposta
    const { response, status } = await generateChatbotResponse(question, InfoContent, apiKey);

    // Restituisci la risposta
    return {
        statusCode: status,
        body: JSON.stringify({ response }),
    };
};