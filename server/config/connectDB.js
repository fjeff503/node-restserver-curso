//requires
const mongoose = require('mongoose');
const uri = process.env.URLDB;
const db = mongoose.connection;

//up connection
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

//events
db.on('error', (error) => {
    console.error(error);
});

db.once('open', () => {
    console.info('Conectado a la base de datos ', uri);
});