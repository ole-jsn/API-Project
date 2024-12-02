document.getElementById('submit_button').addEventListener('click', async (event) => {
    event.preventDefault();

    const userInput = document.getElementById('input_text').value.trim();

    if (!userInput) {
        alert("Das Eingabefeld darf nicht leer sein!");
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userInput })
        });

        if (response.ok) {
            console.log("Daten erfolgreich an den Server gesendet.");
            window.location.reload();
        } else {
            const errorResponse = await response.json();
            throw new Error(`Serverantwort: ${errorResponse.error || response.statusText}`);
        }
    } catch (error) {
        console.error("Fehler beim Senden:", error.message);
        alert(`Es gab ein Problem: ${error.message}`);
    }
});
