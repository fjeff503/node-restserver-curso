//requires
const express = require('express');
const app = express();
const User = require('../model/user');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const { validarToken, validarRole } = require('../middlewares/autentication');

//-------------------------MOSTRAR----------------------------//
app.get('/user', [validarToken, validarRole], function (req, res) {
    //establecemos los paremetros para la consulta
    const where = {
        estado: true
    }
    const limite = parseInt(req.query.limite) || 10;
    const pagina = parseInt(req.query.pagina) || 1;

    //realizamos la busqueda
    const findUsers = async () => {
        const users = await User.paginate(where, {
            limit: limite,
            page: pagina
        });
        const count = await User.count(where);
        const resp = {
            users,
            count
        };
        return resp;
    };

    //ejecutamos la busqueda
    findUsers().then((data) => {
        if (!data) {
            res.status(404).json({
                ok: false,
                message: 'No se encuentran usuarios en la base de datos',
                user
            });
        } else {
            res.json({
                ok: true,
                message: 'Lista de usuarios',
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
app.post('/user', [validarToken, validarRole], function (req, res) {
    //traemos la data del form
    const body = req.body;

    //creamos el objeto para almacenar
    const user = new User({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role,
        estado: body.estado,
        google: body.google
    });

    //funcion async para almacenar
    const saveUser = async () => {
        const userSaved = await user.save();
        return userSaved;
    };

    //ejecutamos la funcion para guardar
    saveUser().then((user) => {
        res.json({
            ok: true,
            message: user
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
app.put('/user/:id', [validarToken, validarRole], function (req, res) {
    const body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);
    const id = req.params.id;

    const updateUser = async () => {
        //verificamos que el usuario exista
        const user = await User.findById(id);
        if (!user) {
            res.status(400).json({
                ok: false,
                message: 'El usuario no existe en la base de datos'
            });
        }
        ///si el usuario existe le pasamos los nuevos valores
        user.nombre = body.nombre;
        user.email = body.email;
        user.img = body.img;
        user.role = body.role;
        user.estado = body.estado;

        //modificamos el usuario
        const updatedUser = await user.save();

        //retornamos el nuevo objeto modificado
        return updatedUser;
    }

    //ejecutamos la funcion
    updateUser().then((user) => {
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

//------------------------ELIMINAR---------------------------//
app.delete('/user/:id', [validarToken, validarRole], function (req, res) {
    const id = req.params.id;

    const deleteUser = async () => {
        //verificamos que el usuario exista
        const user = await User.findById(id);
        if (!user) {
            res.status(400).json({
                ok: false,
                message: 'El usuario no existe en la base de datos'
            });
        }

        //modificamos el usuario
        const deletedUser = await User.findByIdAndUpdate(id, {
            estado: false
        }, {
            new: true,
            runValidators: true,
            context: 'query'
        });
        return deletedUser;
    }

    //ejecutamos la funcion
    deleteUser().then((user) => {
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