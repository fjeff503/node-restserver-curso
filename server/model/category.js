//requires
const { model, Schema } = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const mongoosePaginate = require('mongoose-paginate-v2');

//definimos el Schema
const categorySchema = new Schema({
    description: {
        type: String,
        unique: true,
        required: [true, 'La descripción es obligatoria']
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'//referencia al Schema que exportamos 
    }
});

//para validar campos unicos
categorySchema.plugin(uniqueValidator, { message: "{PATH} debe ser unico" });

//para paginacion
categorySchema.plugin(mongoosePaginate);

//exportamos el Schema
module.exports = model('category', categorySchema);