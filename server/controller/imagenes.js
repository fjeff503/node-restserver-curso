//requires
const express = require('express');
const fs = require('fs');
const app = express();
const path = require('path');
const { validarTokenImg } = require('../middlewares/autentication');

app.get('/imagen/:tipo/:img', validarTokenImg, (req, res) => {
    //traemos los datos para ubicar la imagen exacta
    const tipo = req.params.tipo;
    const img = req.params.img;

    //ubicamos donde esta el archivo
    const pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${img}`);

    //si existe 
    if (fs.existsSync(pathImagen)) {
        //envio la imagen
        res.sendFile(pathImagen);
    } else {
        const noImgPath = path.resolve(__dirname, '../assets/no-image.jpg')
        res.sendFile(noImgPath);
    }


});

module.exports = app;