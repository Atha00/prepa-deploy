require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json()); // sans cette ligne req.body est undefined

// connection à la BDD
mongoose.connect(process.env.MONGODB);

const User = require("./models/User");
const Offer = require("./models/Offer");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API,
  api_secret: process.env.CLOUD_SECRET,
});

app.get("/", (req, res) => {
  try {
    return res.status(200).json("Bienvenue sur Vinted");
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

const userRoutes = require("./routes/user");
app.use(userRoutes);
const offerRoutes = require("./routes/offer");
app.use(offerRoutes);

app.get("/offers", async (req, res) => {
  try {
    const filters = {};

    // une idée pour la pagination :
    // let limit = 10;
    // let page = 1;
    // let skip = 0;
    // if (req.query.limit) {
    //   limit = req.query.limit;
    // }
    // if (req.query.page) {
    //   skip = (page - 1) * limit;
    // }
    // exemple de select et de regexp : filtre par product_name
    // const offers = await Offer.find({ product_name: /pantalon/i }).select(
    //   "product_name product_price -_id"
    // );
    // const offers = await Offer.find({
    //   product_name: new RegExp("pantalon", "i"),
    // }).select("product_name product_price -_id");
    // Tri par prix :
    // $gte : greater than or equal
    // $gt : greater than
    // $lte : lower than or equal
    // $lt : lower than
    // const offers = await Offer.find({
    //   product_price: { $lt: 111, $gt: 50 },
    // }).select("product_name product_price -_id");

    // trier les offres par prix :
    // pour trier par prix croissant : "asc" // 1
    // pour trier par prix décroissant : "desc" // -1
    // const offers = await Offer.find()
    //   .sort({ product_price: "desc" })
    //   .select("product_name product_price -_id");
    // pour mettre en place la pagination, il va falloir jouer sur deux paramètres :
    // - le premier : limiter le nombre d'offres : limit
    // - le second : sauter un certain nombnre de resultats
    // const offers = await Offer.find({
    //   product_price: { $lte: 50 },
    //   product_name: /pantalon/i,
    // })
    //   .select("product_name product_price -_id")
    //   .limit(limit)
    //   .skip(skip)
    //   .sort({ product_price: "asc" });
    // avec une limit 5 :
    // page 1 : skip => 0
    // page 2 : skip => 5
    // page 3 : skip => 10
    // page 4 : skip => 15
    // skip = (page - 1) * limit;
    // return res.status(200).json(offers);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.all(/.*/, (req, res) => {
  return res.status(404).json("Not found");
});

app.listen(3000, () => {
  console.log("Server started 🔥🔥🔥");
});
