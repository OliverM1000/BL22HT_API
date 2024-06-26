const bcrypt = require('bcrypt');
const { User } = require("../models/user");
const mongoose = require('mongoose');
const express = require("express");
const Joi = require('joi');
const router = express.Router();


router.post("/", async (req, res) => {    
    const { error } = validate(req.body)
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send("Invalid username or password");

    const pwasswordIsValid = await bcrypt.compare(req.body.password, user.password);
    if (!pwasswordIsValid) return res.status(400).send("Invalid username or password");

    const token = user.generateAuthToken();

    res.send(token);
});


function validate(req) {
    const schema = Joi.object({
        email: Joi.string().email({ tlds: { allow: false } }).required(),
        password: Joi.string().min(8).max(255).required()
    });

    return schema.validate(req);
};


module.exports = router;