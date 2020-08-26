//requires
require('../config/config');
const express = require('express');
const app = express();
const User = require('../model/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//post del login
app.post('/login', async function (req, res) {
    const body = req.body;
    const where = {
        email: body.email,
        estado: true
    };

    //si no vienen datos
    if (!body.email || !body.password) {
        return res.status(400).json({
            ok: false,
            message: 'El email y contraseña son requeridos'
        });
    }

    //hacer consulta
    await User.findOne(where, (error, user) => {
        //si da error de server
        if (error) {
            return res.status(500).json({
                ok: false,
                message: 'Error del server',
                error
            });
        }

        //si no existe el usuario
        if (!user) {
            return res.status(400).json({
                ok: false,
                message: '(Usuario) o contraseña incorrectos'
            });
        }

        //contraseña no correcta
        if (!bcrypt.compareSync(body.password, user.password)) {
            return res.status(400).json({
                ok: false,
                message: 'Usuario o (contraseña) incorrectos'
            });
        }

        const token = jwt.sign({ user }, process.env.SEED, {
            expiresIn: process.env.CADUCIDAD_TOKEN
        });

        res.json({
            ok: true,
            user,
            token
        });

    });

});

//autenticacion por GOOGLE

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

//funcion para verificar el token y que envia la informacion del payload de google
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

//servicio rest para google auth
app.post('/google', async function (req, res) {
    const token = req.body.idtoken; //idtoken viene de como lo cree en el html

    //ejecutamos la funcion que verificara el token
    const googleUser = await verify(token).catch((error) => {//retornamos en caso de error de server
        return res.status(403).json({
            ok: false,
            error
        });
    });

    //verificamos si el usuario actual existe
    User.findOne({ email: googleUser.email }, (error, user) => {

        //error de server
        if (error) {
            return res.status(500).json({
                ok: false,
                error
            });
        }

        //si el usuario existe
        if (user) {

            //si existe pero tiene una autentificacion normal
            if (user.google === false) {
                return res.status(400).json({
                    ok: false,
                    message: 'Debe usar su autenticación normal'
                });
            } else {//si esta registrado por google renovamos su token
                const token = jwt.sign({ user }, process.env.SEED, {
                    expiresIn: process.env.CADUCIDAD_TOKEN
                });

                return res.json({
                    ok: true,
                    user,
                    token
                });

            }
        } else {//si el usuario no existe en la base de datos

            //creamos el objeto con los datos del usuario
            let usuario = new User({
                nombre: googleUser.nombre,
                email: googleUser.email,
                img: googleUser.img,
                google: true,
                password: ':)'
            });

            //funcion para almacenar el usuario
            const saveUser = async () => {
                const userSaved = await usuario.save();
                return userSaved;
            }

            //ejecutamos la funcion para almacenar
            saveUser().then((user) => {
                //renovamos el token
                const token = jwt.sign({ user }, process.env.SEED, {
                    expiresIn: process.env.CADUCIDAD_TOKEN
                });

                return res.json({
                    ok: true,
                    user,
                    token
                });

            }).catch((error) => {
                return res.status(500).json({
                    ok: false,
                    error
                });
            });
        }
    });
});


module.exports = app;