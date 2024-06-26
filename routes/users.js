const admin = require("../middleware/admin");
const auth = require('../middleware/auth');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const { User, validate: validateUser } = require("../models/user");
const { Address, validate: validateAddress, address } = require("../models/address");
const mongoose = require('mongoose');
const express = require("express");
const router = express.Router();


router.get("/", [auth, admin], async (req, res) => {
    const users = await User.find();
    res.send(users);
});

/*
router.get("/:id", async (req, res) => {
    const user = User.findById(req.params.id);
    if (!user) return res.status(404).send("A User with the given ID was not found.");
    res.send(user);
});
*/

router.get("/me", auth, async (req, res) => {
    const user = await User.findById(req.user._id)
        .populate("shipping_address", "-_id -user -__v")
        .select('-password');
    
    res.send(user);
});


router.post("/", async (req, res) => {
    const { error } = validateUser(req.body)
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send("User already registered.");

    user = new User({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        password: req.body.password,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();

    const token = user.generateAuthToken();
    res.header('x-auth-token', token).send(_.pick(user, ['_id', 'email']));
});


router.put('/me/shipping', auth, async (req, res) => {
    let user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).send("Invalid User ID.");

    if (req.user._id !== req.body.user) {
        return res.status(400).send("Inconsistent data.");
    }

    const { error } = validateAddress(req.body);
    if (error) {
        console.log(error.details[0].message)
        return res.status(400).send(error.details[0].message);
    }

    if (user.shipping_address) {
        let address = await Address.findById(user.shipping_address);
        if (!address) {
            user.set({ shipping_address: null });
            await user.save();
            return res.status(400).send("Inconsistent data.");
        }

        address.set({ ...req.body });
        await address.save();
    }
    else {
        let address = new Address({
            user: req.body.user,
            affiliation: req.body.affiliation,
            street: req.body.street,
            city: req.body.city,
            zip: req.body.zip,
            state: req.body.state,
            country: req.body.country,
        })
        await address.save();
        user.set({ shipping_address: address._id });
        await user.save();
    }

    res.send(address);
});

module.exports = router;
