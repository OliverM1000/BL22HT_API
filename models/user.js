const config = require('config');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Joi = require('joi');




const userSchema = new mongoose.Schema({
    password: { type: String, minLength: 8, maxLength: 1024, required: true },
    first_name: { type: String, minLength: 3, maxLength: 20, required: true },
    last_name: { type: String, minLength: 3, maxLength: 20, required: true },
    email: { type: String, minLength: 6, maxLength: 255, required: true, unique: true },
    created: { type: Date, default: Date.now },
    isAdmin: { type: Boolean, default: false },
    shipping_address: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', default: null },
    sample_frames: [{ type: mongoose.Schema.Types.ObjectId, ref: "SampleFrame", default: null }]
});

userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({
        _id: this._id,
        isAdmin: this.isAdmin
    }, config.get('jwtPrivateKey'));
    return token;
};

const User = new mongoose.model('User', userSchema);

function validateUser(user) {
    const schema = Joi.object({
        password: Joi.string().min(8).max(255).required(),
        first_name: Joi.string().min(3).max(20).required(),
        last_name: Joi.string().min(3).max(20).required(),
        email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: false } }).required(),
        created: Joi.date(),
        shipping_address: Joi.string().hex().length(24),
    });

    return result = schema.validate(user);
};

exports.validate = validateUser;
exports.userSchema = userSchema;
exports.User = User;
