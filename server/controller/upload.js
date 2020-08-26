//requires
const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const User = require('../model/user');
const Product = require('../model/product');
const fs = require('fs');
const path = require('path');

// default options
app.use(fileUpload({ useTempFiles: true }));

//routes
app.post('/upload/:tipo/:id', function (req, res) {
    //extraemos la informacion que nos servira para asignar la imagen donde debe estar
    let tipo = req.params.tipo;
    let id = req.params.id;

    //si no envia el archivo
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            ok: false,
            message: 'No se ha seleccionado ningun archivo'
        });
    }

    //validamos que recivamos un tipo valido
    const tiposValidos = ['product', 'user'];

    //verificamos que los tipos sean validos
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            message: 'Los tipos permitidos son : ' + tiposValidos.join(', ')
        });
    };

    //traemos el archivo del frontEnd
    const archivo = req.files.archivo;
    //separamos el nombre de la extencion
    const nombreCortado = archivo.name.split('.');
    //extraemos la extencion
    const extension = nombreCortado[nombreCortado.length - 1];

    //extenciones permitidas
    const extencionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    //verificamos que la extencion sea permitida
    if (extencionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            message: 'Las extenciones permitidas son : ' + extencionesValidas.join(', '),
            ext: extension
        });
    }

    //asignar nombre al archivo
    const nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

    //mover el archivo al directorio 
    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (error) => {
        //caso de error al subir el archivo
        if (error)
            return res.status(500).json({
                ok: false,
                error
            });

        //OJO en este punto la imagen esta almacenada

        //verificacmos hacia que carpeta ira el archivo
        if (tipo === 'user') {
            imagenUser(id, res, nombreArchivo);
        } else if (tipo === 'product') {
            imagenProduct(id, res, nombreArchivo);
        }

    });
});


function imagenUser(id, res, nombreArchivo) {
    User.findById(id, (error, user) => {

        //en caso de error de server
        if (error) {
            //si el usuario no existe de igual manera la imagen se sube pero no se asina por lo cual la borraremos
            //llamamos la funcion y le pasamos como se llama la imagen antigua y si es user o product
            borraArchivo(nombreArchivo, 'user');

            return res.status(500).json({
                ok: false,
                error
            });
        };

        //si el usuario no existe 
        if (!user) {
            //si el usuario no existe de igual manera la imagen se sube pero no se asina por lo cual la borraremos
            //llamamos la funcion y le pasamos como se llama la imagen antigua y si es user o product
            borraArchivo(nombreArchivo, 'user');

            return res.status(400).json({
                ok: false,
                message: 'El usuario no existe'
            });
        };

        //llamamos la funcion y le pasamos como se llama la imagen antigua y si es user o product
        borraArchivo(user.img, 'user');

        user.img = nombreArchivo;
        user.save((error, userSaved) => {

            //si tenemos error de server
            if (error) {
                return res.status(500).json({
                    ok: false,
                    error
                });
            }

            //si el usuario no existe 
            if (!userSaved) {
                return res.status(400).json({
                    ok: false,
                    message: 'Usuario no actualizado'
                });
            };

            //en caso todo esta correcto
            res.json({
                ok: true,
                usuario: userSaved
            });
        });
    });
};

function imagenProduct(id, res, nombreArchivo) {
    Product.findById(id, (error, product) => {

        //en caso de error de server
        if (error) {
            //si el usuario no existe de igual manera la imagen se sube pero no se asina por lo cual la borraremos
            //llamamos la funcion y le pasamos como se llama la imagen antigua y si es user o product
            borraArchivo(nombreArchivo, 'product');

            return res.status(500).json({
                ok: false,
                error
            });
        };

        //si el usuario no existe 
        if (!product) {
            //si el usuario no existe de igual manera la imagen se sube pero no se asina por lo cual la borraremos
            //llamamos la funcion y le pasamos como se llama la imagen antigua y si es user o product
            borraArchivo(nombreArchivo, 'product');

            return res.status(400).json({
                ok: false,
                message: 'El producto no existe'
            });
        };

        //llamamos la funcion y le pasamos como se llama la imagen antigua y si es user o product
        borraArchivo(product.img, 'product');

        product.img = nombreArchivo;
        product.save((error, productSaved) => {

            //si tenemos error de server
            if (error) {
                return res.status(500).json({
                    ok: false,
                    error
                });
            }

            //si el product no existe 
            if (!productSaved) {
                return res.status(400).json({
                    ok: false,
                    message: 'Producto no actualizado'
                });
            };

            //en caso todo esta correcto
            res.json({
                ok: true,
                product: productSaved
            });
        });
    });
}

function borraArchivo(nombreImagen, tipo) {
    //traemos en un caso ipotetico si el user subio la imagen antes
    const pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);

    //verificamos si el user ya tenia una imagen
    if (fs.existsSync(pathImagen)) {
        //eliminamos la imagen antigua
        fs.unlinkSync(pathImagen);
    };
}

module.exports = app;