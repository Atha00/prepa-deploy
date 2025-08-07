const express = require("express");
const router = express.Router();
const uid2 = require("uid2"); // permet de générer des chaine de caractères aléatoires
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

const User = require("../models/User.js");

router.post("/user/signup", async (req, res) => {
  try {
    // console.log(req.body);
    // {
    //   username: 'JohnDoe',
    //   email: 'johndoe@lereacteur.io',
    //   password: 'azerty',
    //   newsletter: true
    // }
    // vérifications :
    // toutes les clefs attendues sont présentes :
    if (
      !req.body.username ||
      !req.body.email ||
      !req.body.password ||
      !req.body.newsletter
    ) {
      return res.status(400).json({ message: "Missing parameters" });
    }
    // le mail n'existe pas déjà en BDD :
    // recherche du mail dans la BDD :
    const existingMail = await User.findOne({ email: req.body.email });
    // si le resultat de la recherche est truthy (donc pas null ici) :
    if (existingMail) {
      return res.status(400).json({ message: "email already used" });
    }
    // création d'un salt et d'un token :
    const salt = uid2(16);
    // console.log(salt); // qwlNBG4QNzziqUxk
    const token = uid2(32);
    // console.log(token); // MbmNfQVcb8CArqnM5R3alWXz0dCfHHW9

    // on ajoute le salt au password (reçu en body), puis le encrypte :
    const hash = SHA256(req.body.password + salt).toString(encBase64);
    // console.log(hash); // GCEr2VbL8duZkAcUzKvYC485yMaiN+vCQMGi8w24M84=

    // création d'un nouvel utilisateur :
    const newUser = new User({
      email: req.body.email,
      account: {
        username: req.body.username,
      },
      newsletter: true,
      salt: salt,
      token: token,
      hash: hash,
    });

    //     console.log("là =>", newUser);
    //     {
    //   email: 'johndoe@lereacteur.io',
    //   account: { username: 'JohnDoe' },
    //   newsletter: true,
    //   token: '2bbzEEOS4WyGMOF7uoEkMoLP1pFCcFZ0',
    //   hash: 'jlh+Kz/xkOY4phFCjnWZsezCH6Z8YRKPwJSKwcO8gnU=',
    //   salt: 'HbiSN8WpxKTvC2qt',
    //   _id: new ObjectId('689311fb4c7a76bd4a4125e7')
    // }
    await newUser.save();
    const responseObj = {
      token: newUser.token,
      _id: newUser._id,
      account: {
        username: newUser.account.username,
      },
    };

    return res.status(201).json(responseObj);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    // console.log(req.body); // { email: 'johndoe@lereacteur.io', password: 'azerty' }
    // ici, il faut retrouver l'utilisateur qui possède cet email en BDD
    const foundUser = await User.findOne({ email: req.body.email });
    // console.log(foundUser);
    // {
    //   account: { username: 'JohnDoe' },
    //   _id: new ObjectId('6893123dc1f8ed8545c47641'),
    //   email: 'johndoe@lereacteur.io',
    //   newsletter: true,
    //   token: 'rVz-jC-hmPdLMBpvNTnn4JawnuxKbPZJ',
    //   hash: 'JoQXguqppt/7v+2kh+NOmfLhpW5RJGQpovH0vamlSa0=',
    //   salt: 'jCq2Z_5TIzHGwIdu',
    //   __v: 0
    // }

    // si aucun utilisateur est trouvé alors, on stop tout !
    if (!foundUser) {
      return res.status(401).json("Unauthorized");
    }
    // re-générer un hash avec le password reçu en body et le salt récupéré en BDD (car on a retrouvé l'utilisateur)
    const newHash = SHA256(req.body.password + foundUser.salt).toString(
      encBase64
    );
    // comparer le nouveau hash généré avec le hash récupéré en BDD (car on a retrouvé l'utilisateur)
    // si ce sont les mêmes, on renvoi (entre autres) le token
    if (newHash === foundUser.hash) {
      const responseObj = {
        token: foundUser.token,
        _id: foundUser._id,
        account: {
          username: foundUser.account.username,
        },
      };
      return res.status(200).json(responseObj);
    } else {
      // sinon, ca dégage (401)
      return res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
