exports.handler = async (event, context) => {
    // Verifica che il metodo della richiesta sia POST
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: "Metodo non consentito. Usa POST." }),
        };
    }

    // Ottieni la chiave API dalla variabile d'ambiente
    const apiKey = process.env.GEMINI_KEY;
    if (!apiKey) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Chiave API non configurata." }),
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