//==========================//
//PUERTO
//==========================//
process.env.PORT = process.env.PORT || 3000;

//==========================//
//ENVIRONMENT
//==========================//
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

//==========================//
//BASE DE DATOS
//==========================//
let uri;

if (process.env.NODE_ENV === 'dev') {
    uri = 'mongodb://localhost:27017/store';
} else {
    uri = process.env.MONGO_URI;
}

process.env.URLDB = uri;

//------------------CADUCIDAD_TOKEN------------------------//
process.env.CADUCIDAD_TOKEN = '48h';
//--------------------------------------------------------//


//-------------------------SEED----------------------------//
process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo';
//--------------------------------------------------------//


//-----------------------CLIENT_ID--------------------------//
process.env.CLIENT_ID = '208399102188-8ql2qfo2hqtq7l4jnlh152s47o1lcq6o.apps.googleusercontent.com';
//--------------------------------------------------------//
