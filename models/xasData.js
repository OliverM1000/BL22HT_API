const mongoose = require('mongoose');
const Joi = require('joi');
const { sample } = require('lodash');


const XasData = new mongoose.model('XasData', new mongoose.Schema({
    scanSetup: { type: mongoose.Schema.Types.ObjectId, ref: 'ScanSetup', required: true },
    sample: { type: mongoose.Schema.Types.ObjectId, ref: 'Sample', required: true },
    
    encoderResolution: {type: Number },
    encoderOffset: { type: Number },
    latticeSpacing: { type:Number },
    
    adcOffset1: { type: Number },
    adcOffset2: { type: Number },
    adcOffset3: { type: Number },
    adcOffset4: { type: Number },

    encoder: [{ type: Number }],
    energy: [{ type: Number }],
    adc1: [{ type: Number }],
    adc2: [{ type: Number }],
    adc3: [{ type: Number }],
    adc4: [{ type: Number }],
    time: [{ type: Number }],
    gate: [{ type: Number }],    
}));

const XasMetaData = new mongoose.model('XasMetaData', new mongoose.Schema({
    slitVertical: {type: Number},
    slitHorizontal: {type: Number},    
    monoDetune: {type, Number},
    ic_0 : { type: mongoose.Schema.Types.ObjectId, ref: 'IcMetaData', default: null },
    ic_1 : { type: mongoose.Schema.Types.ObjectId, ref: 'IcMetaData', default: null },
    ic_2 : { type: mongoose.Schema.Types.ObjectId, ref: 'IcMetaData', default: null },
}));

const IcMetaData = new mongoose.model('IcMetaData', new mongoose.Schema({
    gas1: {type: String},    
    gas2: {type: String},

    gas1P: {type: Number},
    gas2P: {type: Number},

    ampGain: { type: String},
    ampOffset: { type: String},

    voltage: {type: Number},
}));





function validateXasData(xasData){
    const schema = Joi.object({
        scanSetup: Joi.string().hex().length(24),
        sample: Joi.string().hex().length(24),

        encoderResolution: Joi.number(),
        encoderOffset: Joi.number(),
        latticeSpacing: Joi.number(),

        adcOffset1: Joi.number(),
        adcOffset2: Joi.number(),
        adcOffset3: Joi.number(),
        adcOffset4: Joi.number(),

        encoder: Joi.array().items(Joi.number()),
        energy: Joi.array().items(Joi.number()),
        adc1: Joi.array().items(Joi.number()),
        adc2: Joi.array().items(Joi.number()),
        adc3: Joi.array().items(Joi.number()),
        adc4: Joi.array().items(Joi.number()),
        time: Joi.array().items(Joi.number()),
        gate: Joi.array().items(Joi.number()),

    });

    return schema.validate(xasData);
};

exports.XasData = XasData;
exports.validate= validateXasData;
