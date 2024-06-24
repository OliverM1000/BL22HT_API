const { ScanSetup, validate } = require('../models/scanSetup');
const { Sample } = require('../models/sample');
const mongoose = require('mongoose');
const express = require("express");
const router = express.Router();


router.get("/", async (req, res) => {
    const scanSetups = await ScanSetup.find();
    res.send(scanSetups);
});


router.get("/:id", async (req, res) => {
    const scanSetup = ScanSetup.findById(req.params.id);
    if (!scanSetup) return res.status(404).send("A Scan-Setup with the given ID was not found.");
    res.send(scanSetup);
});


router.post("/", async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const sample = Sample.findById(req.params.sample);
    if (!sample) return res.status(400).send("Invalid Sample ID.");

    let scanSetup = new ScanSetup({
        sample: req.body.sample,
        element: req.body.element,
        edge: req.body.edge,
        range: req.body.range,
        setup: req.body.setup,
        optics: req.body.optics,
        beamWidth: req.body.beamWidth,
        sweeps: req.body.sweeps
    });

    scanSetup = await scanSetup.save();
    res.send(scanSetup);
});


router.put("/:id", async (req, res) => {
    let scanSetup = await ScanSetup.findById(req.params.id);
    if (!scanSetup) return res.status(404).send("A Scan-Setup with the given ID was not found.");

    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    scanSetup.set({
        element: req.body.element,
        edge: req.body.edge,
        range: req.body.range,
        setup: req.body.setup,
        optics: req.body.optics,
        beamWidth: req.body.beamWidth,
        sweeps: req.body.sweeps
    });

    scanSetup = await scanSetup.save();
    res.send(scanSetup);
});


module.exports = router;