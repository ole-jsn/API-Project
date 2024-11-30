document.getElementById('submit_button').addEventListener('click', async (event) => {
    event.preventDefault();

    const userInput = document.getElementById('input_text').value;

    if (userInput.trim() === "") {
        alert("Das Eingabefeld darf nicht leer sein!");
        return;
    }

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer //OpenAI API Key`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: `Beim Input handelt es sich um einen Bewerbungstext eines Schauspielers, der Informationen über sich preisgibt. Deine Aufgabe ist es, die folgenden Informationen aus dem Text zu extrahieren und diese in einem strikt vorgegebenen JSON-Format zurückzugeben.

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
                        }`
                    },
                    {
                        role: 'user',
                        content: userInput
                    }
                ]
            })
        });

        // Antwort von OpenAI weitergeben
        const data = await response.json();

        if (!response.ok) {
            throw new Error(`Fehler: ${response.statusText}`);
        }

        try {
            // Versuche die Antwort von OpenAI zu parsen
            const assistantMessage = data.choices[0].message.content.trim();
            const jsonData = JSON.parse(assistantMessage);

            // Validierung der Struktur
            if (!jsonData.ID || !jsonData.Vorname || !jsonData.Nachname) {
                throw new Error("Ungültige Datenstruktur für die Ziel-API.");
            }

            console.log("Geparste JSON-Daten:", jsonData);

            // Kandidat Filter
            if (jsonData.Nationalität === "Mexiko" && jsonData.Frisur === "Locken") {
                const postWebhook = await fetch('//Lindy AI Webhook URL', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(jsonData)
                });
                if (postWebhook.ok) {
                    console.log("Webhook gesendet!");
                } else {
                    console.log("Webhook Error!")
                }
            }

            const postResponse = await fetch('//AWS API Gateway URL', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(jsonData)
            });

            if (postResponse.ok) {
                console.log("Erfolgreich an die Ziel-API gesendet.");
                window.location.reload(); 
            } else {
                throw new Error(`Fehler beim Senden an die Ziel-API: ${postResponse.statusText}`);
            }

        } catch (error) {
            // Fehler beim Parsen oder Struktur prüfen
            console.error('Fehler beim JSON-Parsen:', error.message, 'Antwort:', data.choices[0].message.content);
            alert('Fehler: Die Antwort von OpenAI ist kein gültiges JSON.');
        }
    } catch (error) {
        console.error("Fehler:", error);
        alert(`Es gab ein Problem: ${error.message}`);
    }
});
