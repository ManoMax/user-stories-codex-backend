const { Schema, model } = require('mongoose');

const PageSchema = new Schema({
    urlUser: {
        type: String,
        required: true
    },
    telefone: {
        type: String,
        required: false,
        default: null
    },
    foto: {
        type: String,
        required: false,
        default: "https://imgur.com/du1Dm15"
    },
    cargoAtual: {
        type: String,
        required: false,
        default: "Trainee"
    },
    especialidades: {
        type: [String]
    },
    redesSociais: {
        instagram: {
            type: String,
            required: false,
            default: null
        },
        linkedin: {
            type: String,
            required: false,
            default: null
        },
    },
    aniversário: {
        type: Date
    },
    cpf: {
        type: String,
        required: false,
        default: null
    }
},
    {
        timestamps: true,
    });

module.exports = model('Page', PageSchema);