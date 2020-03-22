const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../../models/User");
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");

const router = express.Router();

router.post("/register", (req, res) => {
    const { errors, isValid } = validateRegisterInput(req.body);

    if (!isValid) {
        return res.status(400).json(errors);
    }

    User.findOne({ username: req.body.username }).then(user => {
        if (user) {
            errors.username = "Username already exists";
            return res.status(400).json(errors);
        } else {
            const newUser = new User({
                username: req.body.username,
                password: req.body.password
            });

            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw err;
                    newUser.password = hash;
                    newUser.save()
                        .then(user => { 
                            const payload = { 
                                id: user.id, 
                                username: user.username 
                            };
                            jwt.sign(
                                payload,
                                keys.secretOrKey,
                                { expiresIn: 3600 },
                                (err, token) => {
                                    res.json({
                                        success: true,
                                        token: "Bearer " + token
                                    });
                                }
                            );
                        })
                        .catch(err => console.log(err));
                });
            });
        }
    });
});

router.post("/login", (req, res) => {
    const { errors, isValid } = validateLoginInput(req.body);

    if (!isValid) {
        return res.status(400).json(errors);
    }

    const username = req.body.username;
    const password = req.body.password;

    User.findOne({ username }).then(user => {
        if (!user) {
            errors.username = "User not found";
            return res.status(404).json(errors);
        }

        bcrypt.compare(password, user.password).then(isMatch => {
            if (isMatch) {
                const payload = { id: user.id, handle: user.handle };
                jwt.sign(
                    payload,
                    keys.secretOrKey,
                    { expiresIn: 3600 },
                    (err, token) => {
                        res.json({
                        success: true,
                        token: "Bearer " + token
                    });
                    }
                );
            } else {
                errors.password = "Incorrect password";
                return res.status(400).json(errors);
            }
        });
    });
});

router.get("/current", passport.authenticate("jwt", { session: false }),
    (req, res) => {
        User.findById(req.user.id).then(user => {
            const payload = {
                user: {
                    username: user.username,
                    id: user.id
                },
                characters: {}
            };
            user.characters.forEach(character => 
                payload.characters[character.id] = character
            )
            return res.json(payload)
        })
    }
);

module.exports = router;
