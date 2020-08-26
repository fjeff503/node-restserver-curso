const jwt = require('jsonwebtoken');
//==========================//
//VALIDAR TOKEN
//==========================//
const validarToken = (req, res, next) => {
    const token = req.get('Authorization');

    //validamos
    const verificacion = async () => {
        const resp = await jwt.verify(token, process.env.SEED);
        return resp;
    };

    verificacion().then((userDecoded) => {
        req.user = userDecoded.user;//creamos para verificar el role despues
        next();
    }).catch((error) => {
        return res.status(401).json({
            ok: false,
            message: 'Token invalido',
            error
        });
    });
};

//==========================//
//VALIDAR ADMIN_ROLE
//==========================//
const validarRole = (req, res, next) => {
    const role = req.user.role;//utilizamos el role que creamos en la funcion de validar
    if (role === 'ADMIN_ROLE') {
        next();
    } else {
        return res.status(401).json({
            ok: false,
            message: 'Usted no posee permisos para realizar esta accion'
        });
    }

};

//==========================//
//VALIDAR TOKEN PARA IMG
//==========================//
const validarTokenImg = (req, res, next) => {
    const token = req.query.token;

    //validamos
    const verificacion = async () => {
        const resp = await jwt.verify(token, process.env.SEED);
        return resp;
    };

    verificacion().then((userDecoded) => {
        req.user = userDecoded.user;//creamos para verificar el role despues
        next();
    }).catch((error) => {
        return res.status(401).json({
            ok: false,
            message: 'Token invalido',
            error
        });
    });

};
module.exports = {
    validarToken,
    validarRole,
    validarTokenImg
}