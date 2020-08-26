//requires
require('./config/config');
require('./config/connectDB');
const port = process.env.PORT;
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//hacer publica la carpeta
app.use(express.static(path.resolve(__dirname, '../public')));

app.use(require('./controller/index'));

app.listen(port, () => {
    console.log('Escuchando peticiones en el puerto ', port);
});