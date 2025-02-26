const auth = require('../middleware/auth');
const mongoose = require('mongoose');
const express = require("express");
const router = express.Router();
const ShortUniqueId = require('short-unique-id');
const { SampleFrame } = require('../models/sampleFrame');
const { User } = require('../models/user');
const { SamplePlate } = require('../models/samplePlate');
const { Sample } = require('../models/sample');
const { ScanSetup } = require('../models/scanSetup');



/*
router.get("/tag", (req, res) => {
    const uid = new ShortUniqueId({ length: 6, dictionary: "alpha_upper" });
    const tag = uid.formattedUUID("$r4-$r4");
    res.send({ tag: tag });
    console.log(`New Tag Issued: ${tag}`);
});
*/


router.get("/frame", auth, async (req, res) => {
    // Find an uncommited SampleFrame.
    // If no uncommited SampleFrame exists, create a new one.
    
    let frame = await SampleFrame
        .findOne({ user: req.user._id, committed: false })
        .populate({ path: 'samplePlateL', populate: { path: 'samples', populate: { path: 'scanSetups' } } })
        .populate({ path: 'samplePlateR', populate: { path: 'samples', populate: { path: 'scanSetups' } } });
    if (frame) return res.send(frame);

    //const uid = new ShortUniqueId({ length: 6, dictionary: "alpha_upper" });
    //const tag = uid.formattedUUID("$r4-$r4");
    frame = {
        tag: "AAAA-AAAA",
        user: req.user._id,
        samplePlateL: null,
        samplePlateR: null,
        description: ""
    };
    return res.send(frame);
});


router.post("/frame", auth, async (req, res) => {
    let user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).send("Invalid User ID.");

    let frame = await SampleFrame.findOne({ tag: req.body.tag });
    if (frame) return res.status(400).send("SampleFrame already committed.");

    frame = new SampleFrame({
        tag: req.body.tag,
        user: req.user._id,
        description: req.body.description,
    });
    await frame.save();

    if (req.body.samplePlateTypeL) {
        let samplePlateL = new SamplePlate({
            type: req.body.samplePlateTypeL,
            sampleFrame: frame._id
        });
        await samplePlateL.save();

        frame.set({ samplePlateL: samplePlateL._id });
        await frame.save();
    }

    if (req.body.samplePlateTypeR) {
        let samplePlateR = new SamplePlate({
            type: req.body.samplePlateTypeR,
            sampleFrame: frame._id
        });
        await samplePlateR.save();

        frame.set({ samplePlateR: samplePlateR._id });
        await frame.save();
    }


    user.sample_frames.push(frame._id);
    await user.save();

    res.send(frame);
});


router.put("/frame/", auth, async (req, res) => {
    let user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).send("Invalid User ID.");

    console.log("put", req.body);

    if (req.user._id !== req.body.user) {
        console.log("ERROR User ID");
        return res.status(400).send("Inconsistent data.");
    }

    let frame = await SampleFrame.findOne({ user: req.user._id, tag: req.body.tag, committed: false });
    if (!frame) {
        console.log("ERROR frame is NULL");
        return res.status(400).send("Inconsistent data.");
    }

    frame.set({ committed: true });
    await frame.save();

    res.send(frame);
});



router.delete("/frame/:tag", auth, async (req, res) => {
    let user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).send("Invalid User ID.");

    let frame = await SampleFrame.findOne({ tag: req.params.tag, committed: false })
        .populate({ path: 'samplePlateL', populate: { path: 'samples', populate: { path: 'scanSetups' } } })
        .populate({ path: 'samplePlateR', populate: { path: 'samples', populate: { path: 'scanSetups' } } });
    if (!frame) return res.status(400).send("Invalid Tag.");

    //verify ownership
    if (!frame.user.equals(user._id))
        return res.status(404).send("Frame is not owned by user.");

    if (frame.samplePlateL) {
        frame.samplePlateL.samples.map(async (sample) => {
            sample.scanSetups.map(async (scan) => {
                await ScanSetup.deleteOne({ _id: scan._id });
            })
            await Sample.deleteOne({ _id: sample._id });
        })
        await SamplePlate.deleteOne({ _id: frame.samplePlateL._id });
    }

    if (frame.samplePlateR) {
        frame.samplePlateR.samples.map(async (sample) => {
            sample.scanSetups.map(async (scan) => {
                await ScanSetup.deleteOne({ _id: scan._id });
            })
            await Sample.deleteOne({ _id: sample._id });
        })
        await SamplePlate.deleteOne({ _id: frame.samplePlateR._id });
    }

    await User.updateOne({ _id: user._id }, { $pull: { sample_frames: frame._id } })

    await SampleFrame.deleteOne({ _id: frame._id });

    res.send(frame);
});


router.delete("/sample/:id", auth, async (req, res) => {
    console.log('DELETE sample');

    let user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).send("Invalid User ID.");

    let sample = await Sample.findById({ _id: req.params.id });
    if ((!sample)) return res.status(400).send("Invalid Sample ID.");

    //verify ownership
    let samplePlate = await SamplePlate.findById({ _id: sample.samplePlate }).select('sampleFrame');
    let sampleFrame = await SampleFrame.findById({ _id: samplePlate.sampleFrame }).select('user');
    if (!sampleFrame.user.equals(user._id))
        return res.status(404).send("Sample is not owned by user.");

    await SamplePlate.updateOne({ _id: sample.SamplePlate }, { $pull: { samples: sample._id } });
    for (let i = 0; i < sample.scanSetups.length; i++) {
        await ScanSetup.deleteOne({ _id: sample.scanSetups[i] });
    }
    await Sample.deleteOne({ _id: sample._id });

    res.send(sample);
})


router.delete("/scan/:id", auth, async (req, res) => {
    let user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).send("Invalid User ID.");


    // to do: verify ownership


    let scan = await ScanSetup.findById({ _id: req.params.id });
    if (!scan) return res.status(400).send("Invalid Scan ID.");

    await Sample.updateOne({ _id: scan.sample }, { $pull: { scanSetups: scan._id } });
    await ScanSetup.deleteOne({ _id: scan._id });

    res.send(scan);
});





router.post("/sample", auth, async (req, res) => {
    let user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).send("Invalid User ID.");

    let plate = await SamplePlate.findById(req.body.id);
    if (!plate) return res.status(400).send("No such Sample-Plate.");

    sample = new Sample({
        samplePlate: req.body.id,
        position: req.body.position,
        description: req.body.description,
    });
    await sample.save();


    plate.samples.push(sample._id);
    await plate.save();

    res.send(sample);
});


router.post("/scan", auth, async (req, res) => {
    let user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).send("Invalid User ID.");


    let sample = await Sample.findById(req.body.sampleId);
    if (!sample) return res.status(400).send("No such Sample.");

    scan = new ScanSetup({
        sample: req.body.sampleId,
        element: req.body.element,
        edge: req.body.edge,
        range: req.body.range,
        setup: req.body.setup,
        sweeps: req.body.sweeps,
    });
    await scan.save();

    sample.scanSetups.push(scan._id);
    await sample.save();

    console.log(scan);

    res.send(scan);
});

module.exports = router;