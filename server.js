const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
    const { userInput } = req.body;

    if (!userInput) {
        return res.status(400).json({ error: "Eingabe fehlt." });
    }

    try {
        // OpenAI API-Aufruf
        const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer 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`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: `
                            Beim Input handelt es sich um einen Bewerbungstext eines Schauspielers, der Informationen über sich preisgibt. 
                            Deine Aufgabe ist es, die folgenden Informationen aus dem Text zu extrahieren und diese in einem strikt vorgegebenen JSON-Format zurückzugeben.

                            Wichtige Regeln:
                            - Antworte ausschließlich mit der JSON-Datei, keine zusätzlichen Texte oder Kommentare.
                            - Ändere nie den Aufbau der JSON-Datei und füge keine neuen Variablen hinzu.
                            - Generiere eine zufällige, eindeutige ID, bestehend aus 5 bis 7 Ziffern, und füge diese als erste Variable in der JSON-Datei ein.
                            - Wenn eine Information im Text nicht enthalten ist, gib als Wert "None" an.

                            Beispiel:
                            {
                                "ID": "123456",
                                "Vorname": "Beispiel",
                                "Nachname": "Beispiel",
                                "Alter": "Beispiel",
                                "Nationalität": "Beispiel",
                                "Haarfarbe": "Beispiel",
                                "Frisur": "Beispiel"
                            }
                        `
                    },
                    {
                        role: 'user',
                        content: userInput
                    }
                ]
            })
        });

        if (!openAiResponse.ok) {
            throw new Error(`OpenAI API Fehler: ${openAiResponse.statusText}`);
        }

        const openAiData = await openAiResponse.json();
        const assistantMessage = openAiData.choices[0].message.content.trim();

        // Parsing der Antwort
        let jsonData;
        try {
            jsonData = JSON.parse(assistantMessage);

        } catch (error) {
            console.error("Fehler beim Parsen der JSON-Antwort:", error.message);
            return res.status(500).json({ error: "Ungültige JSON-Antwort von OpenAI." });
        }

        //Filter: Webhook-Auslösung
        if (jsonData.Nationalität === "Mexiko" && jsonData.Frisur === "Locken") {
            const webhookResponse = await fetch('https://public.lindy.ai/api/v1/webhooks/lindy/097607b7-b35c-4816-8a8d-a983b79802c5', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(jsonData)
            });
            if (webhookResponse.ok) {
                console.log("Webhook erfolgreich ausgelöst.");
            } else {
                console.error("Webhook fehlgeschlagen:", webhookResponse.statusText);
            }
        }

        // Daten an AWS DynamoDB senden
        const awsResponse = await fetch('https://b21roq8qrb.execute-api.us-east-1.amazonaws.com/creation/actor', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jsonData)
        });

        if (awsResponse.ok) {
            console.log("Daten erfolgreich an AWS DynamoDB gesendet.");
            res.status(200).json({ message: "Erfolgreich verarbeitet." });
        } else {
            throw new Error(`Fehler beim Senden an AWS DynamoDB: ${awsResponse.statusText}`);
        }

        //Error Handling
    } catch (error) {
        console.error("Fehler:", error.message);
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => {
    console.log("Server läuft auf http://localhost:3000");
});
