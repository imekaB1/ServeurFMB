const express = require('express');
const bodyParser = require('body-parser');
const binascii = require('binascii'); // Assurez-vous d'installer ce package avec npm install binascii

const app = express();
const port = 3001;

// Middleware pour parser le corps en text/plain en un Buffer
app.use(bodyParser.raw({ type: 'application/octet-stream' }));

// Route pour recevoir l'IMEI et envoyer une réponse initiale
app.post('/data', (req, res) => {
    const imei = req.body;
    console.log(I`MEI reçu : ${imei.toString()}`);

    // Simuler l'envoi d'une réponse initiale comme dans votre serveur TCP
    let message = Buffer.from('\x01', 'utf-8');
    console.log(`Envoi du message initial : ${message.toString()}`);

    // Répondre avec le message initial
    res.send(message);
});

// Route pour recevoir des données supplémentaires et envoyer une réponse finale
app.post('/more-data', (req, res) => {
    const data = req.body;
    const received = binascii.hexlify(data);
    console.log(`Données reçues : ${data.toString()}`);
    console.log(`Données hexadécimales : ${received}`);

    // Supposons que decodethis et getrecord sont des fonctions que vous avez définies
    decodethis(received);
    const record = getrecord(received);
    console.log(`Enregistrement : ${record}`);

    const finalMessage = "0000" + String(record).padStart(4, '0');
    console.log(`Envoi du message final : ${finalMessage}`);

    // Envoyer la réponse finale
    res.send(finalMessage);
});

function decodethis(data) {
    // Implémentez votre logique de décodage ici
    console.log('Décodage des données :', data);
}

function getrecord(data) {
    // Implémentez votre logique pour obtenir un enregistrement ici
    // Retourne un exemple de nombre pour cet exemple
    return 1234;
}

app.get('/test',(req,res) => {
    res.status(200).send('serveur fonctionne')
})
// Démarrage du serveur sur localhost
app.listen(port, 'localhost', () => {
    console.log(`Serveur à l'écoute sur http://localhost:${port} `); });