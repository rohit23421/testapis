const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const verify = require("../verifyToken");

//UPDATE
router.put("/:id", verify, async (req, res) => {
  if (req.user.id === req.params.id || req.user.isAdmin) {
    if (req.body.password) {
      req.body.password = CryptoJS.AES.encrypt(
        req.body.password,
        process.env.SECRET_KEY
      ).toString();
    }
    try {
      //find the user and update it with $set command from the input of the req.body
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      //send the updated user
      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(403).json("NOT YOUR ACCOUNT,YOU CAN UPDATE ONLY YOUR ACCOUNT");
  }
});

//DELETE
router.delete("/:id", verify, async (req, res) => {
  if (req.user.id === req.params.id || req.user.isAdmin) {
    try {
      //find the user and delete it
      await User.findByIdAndDelete(req.params.id);
      //send the response for the process
      res.status(200).json("USER HAS BEEN DELETED");
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(403).json("NOT YOUR ACCOUNT,YOU CAN DELETE ONLY YOUR ACCOUNT");
  }
});

//GET
router.get("/find/:id", async (req, res) => {
  try {
    //find the user by id
    const user = await User.findById(req.params.id);
    const { password, ...info } = user._doc;
    //send the user but only leaving the password part
    res.status(200).json({
      success: true,
      info,
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

//GET ALL FOR ONLY ADMIN
router.get("/", verify, async (req, res) => {
  //query new users for the admin
  const query = req.query.new;
  if (req.user.isAdmin) {
    try {
      //find users on the base of queries or find all
      const users = query
        ? await User.find().sort({ _id: -1 }).limit(2)
        : await User.find();
      //send the users
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res
      .status(403)
      .json("ACCESS DENIED, THIS ACTION REQUIRES ADMIN PRIVILEGES");
  }
});

//GET USER STATS
router.get("/stats", async (req, res) => {
  const today = new Date();
  const latYear = today.setFullYear(today.setFullYear() - 1);

  const monthsArray = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  try {
    const data = await User.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
