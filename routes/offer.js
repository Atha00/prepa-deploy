const express = require("express");
const router = express.Router();
const fileUpload = require("express-fileupload");
const convertToBase64 = require("../utils/convertBase64");
const cloudinary = require("cloudinary").v2;
const isAuthenticated = require("../middlewares/isAuthenticated");

const User = require("../models/User");
const Offer = require("../models/Offer");

router.post(
  "/offer/publish",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    try {
      // console.log(req.user); // OK
      // pour lire un form-data, meme sans image, il vous faudra le middle fileupload
      // destructuration du body :
      // console.log(req.body);
      const { title, description, price, condition, city, brand, size, color } =
        req.body;

      // console.log(uploadResponse);
      // maintenant que toutes les infos sont réunies, nous pouvons créer une offre :
      const newOffer = new Offer({
        product_name: title,
        product_description: description,
        product_price: price,
        product_details: [
          {
            MARQUE: brand,
          },
          {
            TAILLE: size,
          },
          {
            ÉTAT: condition,
          },
          {
            COULEUR: color,
          },
          {
            EMPLACEMENT: city,
          },
        ],

        owner: req.user,
      });
      if (req.files) {
        // console.log(req.files.picture);
        const convertedPicture = convertToBase64(req.files.picture);
        // console.log(convertedPicture); // OK
        const uploadResponse = await cloudinary.uploader.upload(
          convertedPicture
        );
        newOffer.product_image = uploadResponse;
      }
      // console.log(newOffer);
      // ne pas oublier d'enregistrer :
      await newOffer.save();
      return res.status(201).json(newOffer);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
