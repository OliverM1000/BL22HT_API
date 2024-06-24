const { Sample, validate } = require('../models/sample');
const { SamplePlate } = require('../models/samplePlate');
const { ScanSetup } = require('../models/scanSetup');
const mongoose = require('mongoose');
const express = require("express");
const router = express.Router();


router.get("/", async (req, res) => {
    const samples = await Sample.find();
    res.send(samples);
});


router.get("/:id", async (req, res) => {
    const sample = await Sample.findById(req.params.id);
    if (!sample) return res.status(404).send("Invalid  Sample ID.");
    res.send(sample);
});


router.post("/", async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const samplePlate = await SamplePlate.findById(req.body.samplePlate);
    if (!samplePlate) return res.status(400).send("Invalid Sample-Plate ID.")

    let scanSetup;
    if (req.body.scanSetups) {
        for (let i = 0; i < req.body.scanSetups.length; i++) {
            scanSetup = await ScanSetup.findById(req.body.scanSetups[i]);
            if (!scanSetup) return res.status(400).send("Invalid Scan-Setup ID.");
        }
    }

    let sample = new Sample({
        samplePlate: req.body.samplePlate,
        description: req.body.description,
        position: req.body.position,
        scanSetups: req.body.scanSetups,
    });

    sample = await sample.save();
    res.send(sample);
});


router.put("/:id", async (req, res) => {
    let sample = await Sample.findById(req.params.id);
    if (!sample) return res.status(404).send("Invalid Sample ID.");

    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let scanSetup;
    if (req.body.scanSetups) {
        for (let i = 0; i < req.body.scanSetups.length; i++) {
            scanSetup = await ScanSetup.findById(req.body.scanSetups[i]);
            if (!scanSetup) return res.status(400).send("Invalid Scan-Setup ID.");
        }
    }

    sample.set({
        description: req.body.description,
        position: req.body.position,
        scanSetups: req.body.scanSetups,
    });

    sample = await sample.save();
    res.send(sample);
});


module.exports = router;