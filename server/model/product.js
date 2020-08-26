//requires
const { model, Schema } = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const mongoosePaginate = require('mongoose-paginate-v2');


const productSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es necesario'],
        unique: true
    },
    priceUni: {
        type: Number,
        required: [true, 'El precio únitario es necesario']
    },
    description: {
        type: String,
        required: false
    },
    disponible: {
        type: Boolean,
        default: true
    },
    img: {
        type: String,
        required: false
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'category',//referencia al Schema que exportamos 
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'//referencia al Schema que exportamos 
    }
});

//para validar campos unicos
productSchema.plugin(uniqueValidator, { message: "{PATH} debe ser unico" });

//para paginacion
productSchema.plugin(mongoosePaginate);

//exportamos el Schema
module.exports = model('Product', productSchema);