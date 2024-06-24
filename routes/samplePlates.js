const auth = require('../middleware/auth');
const { SamplePlate, validate } = require("../models/samplePlate");
const { SampleFrame } = require("../models/sampleFrame");
const { Sample } = require("../models/sample");
const mongoose = require('mongoose');
const express = require("express");
const router = express.Router();


router.get("/", async (req, res) => {
    const samplePlates = await SamplePlate.find();
    res.send(samplePlates);
});


router.get("/:id", async (req, res) => {
    const samplePlate = await SamplePlate.findById(req.params.id);
    if (!samplePlate) return res.status(404).send("Invalid Sample-Plate ID.");
    res.send(sampleFrame);
});


router.post("/", async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const sampleFrame = await SampleFrame.findById(req.body.sampleFrame);
    if (!sampleFrame) return res.status(400).send("Invalid Sample-Frame ID.");

    let sample;
    if (req.body.samples) {
        for (let i = 0; i < req.body.samples.length; i++) {
            sample = await Sample.findById(req.body.samples[i]);
            if (!sample) return res.status(400).send("Invalid Sample ID.");
        }
    }

    let samplePlate = new SamplePlate({
        sampleFrame: req.body.sampleFrame,
        type: req.body.type,
        description: req.body.description,
        samples: req.body.samples
    });

    samplePlate = await samplePlate.save();
    res.send(samplePlate);
});


router.put("/:id", async (req, res) => {
    let samplePlate = await SamplePlate.findById(req.params.id);
    if (!samplePlate) return res.status(404).send("Invalid Sample-Plate ID.");

    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let sample;
    if (req.body.samples) {
        for (let i = 0; i < req.body.samples.length; i++) {
            sample = await Sample.findById(req.body.samples[i]);
            if (!sample) return res.status(400).send("Invalid Sample ID.");
        }
    }

    samplePlate.set({
        type: req.body.type,
        description: req.body.description,
        samples: req.body.samples
    });

    samplePlate = await samplePlate.save();
    res.send(samplePlate);
});


module.exports = router;