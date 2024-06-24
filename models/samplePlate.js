const mongoose = require('mongoose');
const Joi = require('joi');


const SamplePlate = new mongoose.model('SamplePlate', new mongoose.Schema({
    type: { type: Number, required: true },
    description: { type: String, maxLength: 4096 },
    sampleFrame: { type: mongoose.Schema.Types.ObjectId, ref: 'SampleFrame', required: true },
    samples: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sample', default: null }]
}));


function validateSamplePlate(samplePlate) {
    const schema = Joi.object({
        sampleFrame: Joi.string().hex().length(24),
        type: Joi.number().min(0).max(1).required(),
        description: Joi.string().max(4096),
        samples: Joi.array().items(Joi.string().hex().length(24))
    });

    return schema.validate(samplePlate);
};

exports.SamplePlate = SamplePlate;
exports.validate = validateSamplePlate;