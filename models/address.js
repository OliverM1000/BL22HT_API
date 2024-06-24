const mongoose = require('mongoose');
const Joi = require('joi');


const addressSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    affiliation: { type: String, minLength: 1, maxLength: 20 },
    street: { type: String, minLength: 4, maxLength: 20, required: true },
    city: { type: String, minLength: 4, maxLength: 20, required: true },
    zip: { type: Number, minLength: 10000, maxLength: 99999, required: true },
    state: { type: String, length: 2, require: true },
    country: { type: String, minLength: 2, maxLength: 20, required: true }
});

const Address = new mongoose.model('Address', addressSchema);


function validateAddress(address) {
    const schema = Joi.object({
        user: Joi.string().hex().length(24).required(),
        affiliation: Joi.string().min(1).max(20),
        street: Joi.string().min(4).max(20).required(),
        city: Joi.string().min(4).max(20).required(),
        zip: Joi.number().integer().min(10000).max(99999),
        state: Joi.string().length(2).required(),
        country: Joi.string().min(3).max(20).required(),
    });

    return result = schema.validate(address);
};


exports.validate = validateAddress;
exports.address = addressSchema;
exports.Address = Address;