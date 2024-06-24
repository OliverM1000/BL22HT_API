const mongoose = require('mongoose');
const Joi = require('joi');

const Sample = new mongoose.model('Sample', new mongoose.Schema({
    samplePlate: { type: mongoose.Schema.Types.ObjectId, ref: 'SamplePlate', required: true },
    description: { type: String, maxLength: 4096 },
    position: { type: String, length: 1, required: true },
    scanSetups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ScanSetup', default: null }]
}));


function validateSample(sample) {
    const schema = Joi.object({
        samplePlate: Joi.string().hex().length(24),
        position: Joi.string().length(1).required(),
        description: Joi.string().max(4096),
        scanSetups: Joi.array().items(Joi.string().hex().length(24))
    });

    return schema.validate(sample);
};

exports.Sample = Sample;
exports.validate = validateSample;