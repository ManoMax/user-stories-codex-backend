const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        match: /^\w+([.-]?\w+)*(@codexjr.com.br)+$/
    },
    password: {
        type: String,
        required: true,
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
        default: "membro"
    },
    especialidades: {
        type: [String],
        required: false,
        default: []
    },
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
    aniversário: {
        type: Date,
        required: false,
        default: null
    },
    cpf: {
        type: String,
        required: false,
        default: null
    },
    urlUser: {
        type: String,
        required: false
    },
    token_list: {
        type: [String],
        required: false,
        default: []
    }
},
    {
        timestamps: true,
    });

module.exports = model('User', UserSchema);