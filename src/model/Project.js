const { Schema, model } = require('mongoose');

const ProjectSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    idProj: {
        type: Number,
        required: true
    },
    inicio: {
        type: Date,
        required: true
    },
    termino: {
        type: Date,
        required: true
    },
    ativo: {
        type: Boolean,
        required: false
    }
},
    {
        timestamps: true,
    });

module.exports = model('Project', ProjectSchema);