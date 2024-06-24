const mongoose = require('mongoose');
const Joi = require('joi');


const SampleFrame = new mongoose.model('SampleFrame', new mongoose.Schema({
    tag: { type: String, length: 7, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, maxLength: 4096 },
    created: { type: Date, default: Date.now },
    received: { type: Date },
    dataAvailable: { type: Boolean, default: false },
    samplePlateL: { type: mongoose.Schema.Types.ObjectId, ref: 'SamplePlate', default: null },
    samplePlateR: { type: mongoose.Schema.Types.ObjectId, ref: 'SamplePlate', default: null },
    committed: { type: Boolean, required: true, default: false }
}));


function validateSampleFrame(sampleFrame) {
    const schema = Joi.object({
        tag: Joi.string().length(7).required(),
        user: Joi.string().hex().length(24).required(),
        description: Joi.string().max(4096),
        created: Joi.date(),
        received: Joi.date(),
        dataAvailable: Joi.boolean(),
        samplePlateL: Joi.string().hex().length(24),
        samplePlateR: Joi.string().hex().length(24),
        commited: Joi.boolean()
    });

    return schema.validate(sampleFrame);
}


exports.SampleFrame = SampleFrame;
exports.validate = validateSampleFrame;