const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const PORT = 3001;

// Middleware pour analyser les données brutes du corps de la requête
app.use(bodyParser.raw({ type: '/', limit: '10mb' }));

// Fonction pour traiter les données reçues
function processData(data) {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} - ${data.toString('hex')}\n`;

    fs.appendFile('data.log', logEntry, (err) => {
        if (err) {
            console.error('Erreur lors de l\'enregistrement des données :', err);
        } else {
            console.log('Données enregistrées.');
        }
    });
}

// Route pour recevoir les données
app.post('/receive-data', (req, res) => {
    const rawData = req.body;
    console.log('Données brutes reçues :', rawData);
    processData(rawData);
    res.sendStatus(200);
});

// Route pour visualiser les données
app.get('/view-data', (req, res) => {
    fs.readFile('data.log', 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Erreur lors de la lecture des données.');
        } else {
            res.send(`<pre>${data}</pre>`);
        }
    });
});
app.get('/test',(req,res) => {
    res.status(200).send('serveur fonctionne')
  })

// Démarrer le serveur web
app.listen(PORT,'0.0.0.0', () => {
    console.log(`Serveur web en écoute sur le port ${PORT}`);
});
