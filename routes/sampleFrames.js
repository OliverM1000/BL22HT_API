const auth = require('../middleware/auth');
const { SampleFrame, validate } = require('../models/sampleFrame');
const { User } = require('../models/user');
const { SamplePlate } = require('../models/samplePlate');
const mongoose = require('mongoose');
const express = require("express");
const router = express.Router();


router.get("/", auth, async (req, res) => {
    let user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).send("Invalid User ID.");

    const sampleFrames = await SampleFrame
        .find({ user: req.user._id, committed: true })
        .populate({ path: 'samplePlateL', populate: { path: 'samples', populate: { path: 'scanSetups' } } })
        .populate({ path: 'samplePlateR', populate: { path: 'samples', populate: { path: 'scanSetups' } } });
    if (!sampleFrames) return res.status(400).send("Inconsistent data.");

    res.send(sampleFrames);
});


/*
router.get("/:tag", auth, async (req, res) => {
    const sampleFrame = await SampleFrame.find({ user: req.user._id, tag: req.params.tag });
    if (!sampleFrame) return res.status(404).send("Invalid Sample-Frame TAG.");
    res.send(sampleFrame);
});
*/


router.get("/:tag", auth, async (req, res) => {
    const sampleFrame = await SampleFrame
    .findOne({ tag: req.params.tag })
    .populate({ path: 'user', select: { "_id": 0, "first_name": 1,  "last_name": 1, "email": 1}})
    .populate({ path: 'samplePlateL', populate: { path: 'samples', populate: { path: 'scanSetups' } } })
    .populate({ path: 'samplePlateR', populate: { path: 'samples', populate: { path: 'scanSetups' } } });
    
    if (!sampleFrame) return res.status(404).send("Invalid Sample-Frame TAG.");
    res.send(sampleFrame);
});


router.post("/", auth, async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let sampleFrame = await SampleFrame.findOne({ tag: req.body.tag });
    if (sampleFrame) return res.status(400).send("Sample-Frame already registered.");

    //const user = await User.findById(req.body.user);
    //if (!user) return res.status(400).send("Invalid User.");

    if (req.body.samplePlateL) {
        const samplePlateL = await SamplePlate.findById(req.body.samplePlateL);
        if (!samplePlateL) return res.status(400).send("Invalid Sample-Plate-L.")
    }

    if (req.body.samplePlateR) {
        const samplePlateR = await SamplePlate.findById(req.body.samplePlateR);
        if (!samplePlateR) return res.status(400).send("Invalid Sample-Plate-R.")
    }

    sampleFrame = new SampleFrame({
        tag: req.body.tag,
        user: req.user._id,
        description: req.body.description,
        samplePlateL: req.body.samplePlateL,
        samplePlateR: req.body.samplePlateR
    });

    sampleFrame = await sampleFrame.save();
    res.send(sampleFrame);
});


router.put("/:tag", auth, async (req, res) => {
    let sampleFrame = await SampleFrame.findOne({ user: req.user._id, tag: req.params.tag });
    if (!sampleFrame) return res.status(400).send("Invalid Sample-Frame TAG.");

    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    if (req.body.samplePlateL) {
        const samplePlateL = await SamplePlate.findById(req.body.samplePlateL);
        if (!samplePlateL) return res.status(400).send("Invalid Sample-Plate-L.")
    }

    if (req.body.samplePlateR) {
        const samplePlateR = await SamplePlate.findById(req.body.samplePlateR);
        if (!samplePlateR) return res.status(400).send("Invalid Sample-Plate-R.")
    }

    sampleFrame.set({
        description: req.body.description,
        received: req.body.received,
        dataAvailable: req.body.dataAvailable,
        samplePlateL: req.body.samplePlateL,
        samplePlateR: req.body.samplePlateR
    });

    sampleFrame = await sampleFrame.save();
    res.send(sampleFrame);
});


module.exports = router;