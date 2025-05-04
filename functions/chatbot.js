// functions/chatbot.js
exports.handler = async (event, context) => 
    {
        // Verifica che il metodo della richiesta sia POST
        if (event.httpMethod !== "POST")
            {
                return {
                    statusCode: 405,
                    body: JSON.stringify({ error: "Metodo non consentito. Usa POST." }),
                };
            }

        // Ottieni la chiave API e il contenuto di my_info dalle variabili d'ambiente
        const apiKey = process.env.GEMINI_KEY;
        const infoContent = process.env.MY_INFO;

        if (!apiKey || !infoContent) 
            {
                return {
                    statusCode: 500,
                    body: JSON.stringify({ error: "Configurazione mancante: chiave API o informazioni su Jacopo Volpe." }),
                };
            }

        // URL dell'API di Gemini
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        // Estrai il payload dalla richiesta
        let payload;
        try 
            {
                payload = JSON.parse(event.body);
            } 
        catch (error) 
            {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: "Payload JSON non valido." }),
                };
            }

        // Verifica che il payload contenga i campi necessari
        if (payload.contents?.length > 0 && payload.contents[0].parts?.length > 0)
            {
                const currentQuestion = payload.contents[0].parts[0].text;
                
                const promptText = `
                    # ISTRUZIONI PRINCIPALI
                    Sei un assistente personale che rappresenta Jacopo Volpe. Rispondi alle domande come se fossi Jacopo stesso.
                    La tua risposta deve essere:
                    - In prima persona singolare (io, me, mio)
                    - Nella stessa lingua della domanda (italiano o inglese)
                    - Naturale, amichevole e professionale
                    - Formattata in HTML dentro un elemento <div>
                    - Concisa e diretta (senza introduzioni o conclusioni)
                    
                    # CONTESTO PERSONALE
                    ${infoContent}
                    
                    # LINEE GUIDA PER LE RISPOSTE
                    - NON menzionare percentuali (<level>) presenti nelle informazioni
                    - NON riferirti a te stesso come "Jacopo Volpe" o "Jacopo" ma usa sempre la prima persona
                    - NON iniziare con frasi come "Come Jacopo, io..." o "In qualità di Jacopo..."
                    - Evidenzia i punti di forza, competenze e risultati pertinenti alla domanda
                    - Se la domanda è in italiano, rispondi in italiano
                    - Se la domanda è in inglese, rispondi in inglese
                    - Se la domanda non è chiara o non ha senso, chiedi cortesemente chiarimenti
                    - Se ti vengono chieste informazioni non presenti nel contesto, rispondi onestamente che non hai quell'informazione specifica
                    
                    # GESTIONE DEI LINK
                    Quando fai riferimento a documenti o link presenti nelle informazioni, formattali correttamente in HTML:
                    - Esempio: <a href="doc/Report_LLM.pdf">il report del progetto NLP</a>
                    - Non includere URL completi, usa solo i percorsi relativi come nell'esempio
                    
                    # STRUTTURA DELLA RISPOSTA
                    - Usa paragrafi brevi e ben distinti
                    - Utilizza elenchi puntati (<ul><li>) quando appropriato
                    - Enfatizza (<strong>) le parole chiave più importanti
                    - Mantieni un tono professionale ma cordiale
                    
                    # DOMANDA DA RISPONDERE
                    ${currentQuestion}
                `;

                // Sovrascrive il testo originale con il prompt elaborato
                payload.contents[0].parts[0].text = promptText;
            }
        
            console.log("Payload:", payload);
            console.log('Prompt: ', payload.contents[0].parts[0].text);

            // Effettua la chiamata API a Gemini
            try 
                {
                    const response = await fetch(url,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(payload),
                        });

                    // Verifica se la risposta è valida
                    if (!response.ok) 
                        {
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
                }
            catch (error) 
                {
                    return {
                        statusCode: 500,
                        body: JSON.stringify({ error: `Errore durante la chiamata API: ${error.message}` }),
                    };
                }
    };