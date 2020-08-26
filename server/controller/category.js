//requires
const express = require('express');
const app = express();
const Category = require('../model/category');
const { validarToken, validarRole } = require('../middlewares/autentication');

//routes

//-----------------------MOSTRAR ALL-------------------------//
app.get('/category', [validarToken], function (req, res) {
    //establecemos los paremetros para la consulta
    const limite = parseInt(req.query.limite) || 20;
    const pagina = parseInt(req.query.pagina) || 1;
    const where = {};
    //realizamos la busqueda
    const findCategories = async () => {
        const categories = await Category.paginate(where, {
            limit: limite,
            page: pagina,
            sort: 'description',//como lo ordenara
            populate: {
                path: 'user',//el nombre que defino en el Schema
                select: 'nombre email'//los campos que mostrara
            }
        });
        const count = await Category.count(where);
        const resp = {
            categories,
            count
        };
        return resp;
    };

    //ejecutamos la busqueda
    findCategories().then((data) => {
        if (!data) {
            res.status(404).json({
                ok: false,
                message: 'No se encuentran categorias en la base de datos',
                user
            });
        } else {
            res.json({
                ok: true,
                message: 'Lista de categorias',
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
app.get('/category/:id', [validarToken], function (req, res) {
    //establecemos los paremetros para la consulta
    const id = req.params.id;
    //realizamos la busqueda
    const findCategories = async () => {
        const category = await Category.findById(id);
        return category;
    };

    //ejecutamos la busqueda
    findCategories().then((category) => {
        if (!category) {
            res.status(404).json({
                ok: false,
                message: 'La categoria no existe en la base de datos'
            });
        } else {
            res.json({
                ok: true,
                message: category
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
app.post('/category', [validarToken, validarRole], function (req, res) {
    //traemos la data del form
    const body = req.body;
    const user = req.user;
    //creamos el objeto para almacenar
    const category = new Category({
        description: body.description,
        user: user._id
    });

    //funcion async para almacenar
    const saveCategory = async () => {
        const categorySaved = await category.save();
        return categorySaved;
    };

    //ejecutamos la funcion para guardar
    saveCategory().then((category) => {
        res.json({
            ok: true,
            message: category
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
app.put('/category/:id', [validarToken, validarRole], function (req, res) {
    const body = req.body;
    const id = req.params.id;

    const updateCategory = async () => {
        //verificamos que la categoria exista
        const category = await Category.findById(id);
        if (!category) {
            res.status(400).json({
                ok: false,
                message: 'La categoria no existe en la base de datos'
            });
        }

        //guardamos los nuevos valores
        category.description = body.description;

        //modificamos la categoria
        const categoryUpdated = await category.save();

        //retornamos el nuevo objeto modificado
        return categoryUpdated;
    }

    //ejecutamos la funcion
    updateCategory().then((category) => {
        res.json({
            ok: true,
            message: category
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
app.delete('/category/:id', [validarToken, validarRole], function (req, res) {
    const id = req.params.id;

    const deleteCategory = async () => {
        //verificamos que la categoria exista
        const category = await Category.findById(id);
        if (!category) {
            res.status(400).json({
                ok: false,
                message: 'La categoria no existe en la base de datos'
            });
        }

        //eliminamos la categoria
        const deletedCategory = await Category.findByIdAndDelete(id);
        return deletedCategory;
    }

    //ejecutamos la funcion
    deleteCategory().then((user) => {
        res.json({
            ok: true,
            message: user
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
