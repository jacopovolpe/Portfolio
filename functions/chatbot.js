// functions/chatbot.js
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
            body: JSON.stringify({ error: "Configurazione mancante: chiave API o informazioni su Jacopo Volpe." }),
        };
    }

    // URL dell'API di Gemini
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

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

    // Verifica che il payload contenga il campo contents
    if (payload.contents?.length > 0 && payload.contents[0].parts?.length > 0) {
        const question = payload.contents[0].parts[0].text;
        
        // Chiedi al modello di determinare la lingua
        let responseIntro = `Determina la lingua della domanda e rispondi nello stesso idioma.
        Se la domanda è in italiano, rispondi in prima persona, in modo naturale e cortese.
        Se la domanda è in inglese, rispondi in first person, naturally and politely.`;
        
        payload.contents[0].parts[0].text = `
            Ti fornisco alcune informazioni su di me in modo che tu possa rispondere come se fossi io.
            
            Informazioni personali:
            ${InfoContent}
            
            ${responseIntro}
            
            Domanda: ${question}
        `;
        
        // Formatta elenchi e tabelle in HTML
        if (/\n- |\n\d+\. |\|/.test(InfoContent)) {
            payload.contents[0].parts[0].text += "\n\nRisposta in formato HTML:";
        }
    }
    

    // Effettua la chiamata API a Gemini
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        // Verifica se la risposta è valida
        if (!response.ok) {
            const errorData = await response.json();
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: `Errore da Gemini: ${errorData.error?.message || "Errore sconosciuto"}` }),
            };
        }

        // Converti la risposta in JSON
        const responseData = await response.json();

        // Restituisci la risposta
        return {
            statusCode: 200,
            body: JSON.stringify({
                response: responseData.candidates[0]?.content?.parts[0]?.text || "Nessuna risposta valida da Gemini.",
            }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: `Errore durante la chiamata API: ${error.message}` }),
        };
    }
};
