const mongoose = require('mongoose');
const Joi = require('joi');


const ScanSetup = new mongoose.model("ScanSetup", new mongoose.Schema({
    sample: { type: mongoose.Schema.Types.ObjectId, ref: 'Samples', required: true },
    element: { type: String, minLength: 1, maxLength: 3, required: true },
    edge: { type: String, enum: ['K', 'L-1', 'L-2', 'L-3'], required: true },
    range: { type: String, enum: ['XANES', 'EXAFS'], required: true },
    setup: { type: String, enyn: ['FY', 'transmission'], required: true },
    sweeps: { type: Number, min: 1, max: 999, required: true }
}));


function validateScanSetup(scanSetup) {
    const schema = Joi.object({
        sample: Joi.string().hex().length(24),
        element: Joi.string().min().max(3).required(),
        edge: Joi.string().valid('K', 'L-1', 'L-2', 'L-3').required(),
        range: Joi.string().valid('XANES', 'EXAFS').required(),
        setup: Joi.string().valid('FY', 'transmission').required(),
        sweeps: Joi.number().integer().min(1).max(999),
    });

    return schema.validate(scanSetup);
}


exports.ScanSetup = ScanSetup;
exports.validate = validateScanSetup;