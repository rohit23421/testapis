const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

//register user
router.post("/register", async (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.SECRET_KEY
    ).toString(),
  });

  try {
    const user = await newUser.save();
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      error,
    });
  }
});

const authorization = (req, res, next) => {
  const accessToken = req.cookies.access_token;
  if (!accessToken) {
    res.status(403).json("PROBLEM WITH COOKIE");
  }
  try {
    const data = jwt.verify(accessToken, process.env.SECRET_KEY);
    req.id = data.id;
    req.isAdmin = data.isAdmin;
    next();
  } catch (error) {
    res.status(403).json("PROBLEM WITH COOKIE FROM TRYCATCH");
  }
};

//login
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    !user && res.status(404).json("USER NOT FOUND,NO SUCH USER IN DB");

    const bytes = CryptoJS.AES.decrypt(user.password, process.env.SECRET_KEY);
    const originalPassword = bytes.toString(CryptoJS.enc.Utf8);

    !originalPassword === req.body.password &&
      res.status(404).json("USER NOT FOUND,NO SUCH USER IN DB");

    const accessToken = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.SECRET_KEY,
      { expiresIn: "5d" }
    );

    const { password, ...info } = user._doc;

    res
      .cookie("access_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      })
      .status(200)
      .json({
        success: true,
        ...info,
        accessToken,
      });
  } catch (error) {
    res.status(500).json({
      error,
    });
  }
});

//LOGOUT
router.get("/logout", authorization, (req, res) => {
  res.clearCookie("access_token").status(200).json({
    success: true,
    message: "SUCCESSFULLY LOGGED OUT",
  });
});

module.exports = router;
