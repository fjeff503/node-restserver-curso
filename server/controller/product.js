//requires
const express = require('express');
const app = express();
const Product = require('../model/product');
const _ = require('underscore');
const { validarToken } = require('../middlewares/autentication');

//routes

//-----------------------MOSTRAR ALL-------------------------//
app.get('/product', [validarToken], function (req, res) {
    //establecemos los paremetros para la consulta
    const limite = parseInt(req.query.limite) || 20;
    const pagina = parseInt(req.query.pagina) || 1;
    const where = {
        disponible: true
    };
    //realizamos la busqueda
    const findProducts = async () => {
        const products = await Product.paginate(where, {
            limit: limite,
            page: pagina,
            sort: 'nombre',//como lo ordenara
            populate: [{
                path: 'user',//el nombre que defino en el Schema
                select: 'nombre email'//los campos que mostrara
            }, {
                path: 'category',//el nombre que defino en el Schema
                select: 'description'//los campos que mostrara
            }]
        });
        return products;
    };

    //ejecutamos la busqueda
    findProducts().then((data) => {
        if (!data) {
            res.status(404).json({
                ok: false,
                message: 'No se encuentran productos en la base de datos',
                user
            });
        } else {
            res.json({
                ok: true,
                message: 'Lista de productos',
                data
            });
        }
    }).catch((error) => {
        res.status(500).json({
            ok: false,
            message: error
        });
    });

});
//-----------------------------------------------------------//

//-----------------------MOSTRAR ONE-------------------------//
app.get('/product/:id', [validarToken], function (req, res) {
    //establecemos los paremetros para la consulta
    const id = req.params.id;
    //realizamos la busqueda
    const findProduct = async () => {
        const product = await Product.findById(id);
        return product;
    };

    //ejecutamos la busqueda
    findProduct().then((product) => {
        if (!product) {
            res.status(404).json({
                ok: false,
                message: 'El producto no existe en la base de datos'
            });
        } else {
            res.json({
                ok: true,
                message: product
            });
        }
    }).catch((error) => {
        res.status(500).json({
            ok: false,
            message: error
        });
    });

});
//-----------------------------------------------------------//

//------------------BUSCAR WITH PARAMS-----------------------//
app.get('/product/find/:where', [validarToken], function (req, res) {
    //traemos los datos del front
    const termino = req.params.where;
    //creamos como expresion regular basada en termino
    const regex = new RegExp(termino, 'i');
    //establecemos los paremetros para la consulta
    const where = {
        disponible: true,
        nombre: regex
    };
    //realizamos la busqueda
    const findProducts = async () => {
        const products = await Product.paginate(where, {
            sort: 'nombre',//como lo ordenara
            populate: [{
                path: 'user',//el nombre que defino en el Schema
                select: 'nombre email'//los campos que mostrara
            }, {
                path: 'category',//el nombre que defino en el Schema
                select: 'description'//los campos que mostrara
            }]
        });
        return products;
    };

    //ejecutamos la busqueda
    findProducts().then((data) => {
        if (!data) {
            res.status(404).json({
                ok: false,
                message: 'No se encuentran productos en la base de datos',
                user
            });
        } else {
            res.json({
                ok: true,
                message: 'Lista de productos',
                data
            });
        }
    }).catch((error) => {
        res.status(500).json({
            ok: false,
            message: error
        });
    });

});
//-----------------------------------------------------------//

//------------------------GUARDAR----------------------------//
app.post('/product', [validarToken], function (req, res) {
    //traemos la data del form
    const body = req.body;
    const user = req.user;
    //creamos el objeto para almacenar
    const product = new Product({
        nombre: body.nombre,
        priceUni: body.priceUni,
        description: body.description,
        disponible: body.disponible,
        category: body.category,
        user: user._id
    });

    //funcion async para almacenar
    const saveProduct = async () => {
        const productSaved = await product.save();
        return productSaved;
    };

    //ejecutamos la funcion para guardar
    saveProduct().then((product) => {
        res.json({
            ok: true,
            message: product
        });
    }).catch((error) => {
        res.status(400).json({
            ok: false,
            message: error
        });
    });
});
//-----------------------------------------------------------//

//------------------------MODIFICAR--------------------------//
app.put('/product/:id', [validarToken], function (req, res) {
    const body = _.pick(req.body, ['nombre', 'priceUni', 'description', 'category']);
    const id = req.params.id;
    const user = req.user;

    const updateProduct = async () => {
        //verificamos que producto exista
        const product = await Product.findById(id);
        if (!product) {
            res.status(400).json({
                ok: false,
                message: 'El producto no existe en la base de datos'
            });
        }

        ///si el producto existe le pasamos los nuevos valores
        product.nombre = body.nombre;
        product.priceUni = body.priceUni;
        product.description = body.description;
        product.category = body.category;
        product.user = user._id;

        //guardamos los nuevos valores
        const productUpdated = await product.save();

        //retornamos el nuevo objeto modificado
        return productUpdated;
    }

    //ejecutamos la funcion
    updateProduct().then((product) => {
        res.json({
            ok: true,
            message: product
        });
    }).catch((error) => {
        res.status(500).json({
            ok: false,
            message: error
        });
    });
});
//-----------------------------------------------------------//

//------------------------ELIMINAR---------------------------//
app.delete('/product/:id', [validarToken], function (req, res) {
    const id = req.params.id;

    const deleteProduct = async () => {
        //verificamos que el producto exista
        const product = await Product.findById(id);
        if (!product) {
            res.status(400).json({
                ok: false,
                message: 'El producto no existe en la base de datos'
            });
        }

        //modificamos el producto
        const deletedProduct = await Product.findByIdAndUpdate(id, {
            disponible: false
        }, {
            new: true,
            runValidators: true,
            context: 'query'
        });
        return deletedProduct;
    }

    //ejecutamos la funcion
    deleteProduct().then((product) => {
        res.json({
            ok: true,
            message: product
        });
    }).catch((error) => {
        res.status(500).json({
            ok: false,
            message: error
        });
    });
});
//-----------------------------------------------------------//

module.exports = app;