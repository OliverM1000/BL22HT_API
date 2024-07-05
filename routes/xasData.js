const auth = require('../middleware/auth');
const {XasData, validate} = require('../models/xasData');
const {Sample} = require('../models/sample');
const {ScanSetup} = require('../models/scanSetup');
const { User } = require('../models/user');
const mongoose = require('mongoose');
const express = require("express");
const router = express.Router();
const _ = require('lodash');


router.get("/:id", auth, async(req, res) => {
    let user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).send("Invalid User ID.");

    const xasData = await XasData
    .findById(req.params.id)
    .populate({ path: 'sample'})
    .populate({ path: 'scanSetup'});

    if(!xasData) return res.status(400).send("Inconsistend data.");

    res.send(xasData);
});


router.post("/", auth, async(req, res) => {
    let user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).send("Invalid User ID.");

    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let scanSetup = await ScanSetup.findById(req.body.scanSetup);
    if(!scanSetup) return res.status(400).send("Invalid Scan-Setup");

    let sample = await Sample.findById(req.body.sample);
    if(!sample) return res.status(400).send("Invalid Sample");



    let xasData = new XasData({
        scanSetup: req.body.scanSetup,
        sample: req.body.sample,

        encoderResolution: req.body.encoderResolution,
        encoderOffset: req.body.encoderOffset,
        latticeSpacing: req.body.latticeSpacing,

        adcOffset1: req.body.adcOffset1,
        adcOffset2: req.body.adcOffset2,
        adcOffset3: req.body.adcOffset3,
        adcOffset4: req.body.adcOffset4,

        encoder: req.body.encoder,
        energy: req.body.energy,
        adc1: req.body.adc1,
        adc2: req.body.adc2,
        adc3: req.body.adc3,
        adc4: req.body.adc4,
        time: req.body.time,
        gate: req.body.gate
    });

    xasData = await xasData.save();
    res.send(_.pick(xasData, ['_id', 'sample', 'scanSetup']));
});