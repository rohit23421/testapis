const router = require("express").Router();
const Movie = require("../models/Movie");
const verify = require("../verifyToken");

//CREATE
router.post("/", verify, async (req, res) => {
  if (req.user.isAdmin) {
    const newMovie = new Movie(req.body);

    try {
      //save the movie and return it
      const savedMovie = await newMovie.save();
      res.status(200).json({
        success: true,
        savedMovie,
      });
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res
      .status(403)
      .json("ACCESS DENIED, THIS ACTION REQUIRES ADMIN PRIVILEGES");
  }
});

//UPDATE
router.put("/:id", verify, async (req, res) => {
  if (req.user.isAdmin) {
    try {
      //update the movie and return it
      const updatedMovie = await Movie.findByIdAndUpdate(
        req.params.id,
        //updating the movie from the req.body input
        { $set: req.body },
        //returning the new updated movie
        { new: true }
      );
      res.status(200).json({
        success: true,
        updatedMovie,
      });
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res
      .status(403)
      .json("ACCESS DENIED, THIS ACTION REQUIRES ADMIN PRIVILEGES");
  }
});

//DELETE
router.delete("/:id", verify, async (req, res) => {
  if (req.user.isAdmin) {
    try {
      //delete the movie and return a response
      await Movie.findByIdAndDelete(req.params.id);
      res.status(200).json("THE MOVIE HAS BEEN DELETED");
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res
      .status(403)
      .json("ACCESS DENIED, THIS ACTION REQUIRES ADMIN PRIVILEGES");
  }
});

//GET
router.get("/find/:id", verify, async (req, res) => {
  try {
    //get the movie with the id passed in the params(url)
    const movie = await Movie.findById(req.params.id);
    res.status(200).json(movie);
  } catch (error) {
    res.status(500).json(error);
  }
});

//GET RANDOM
router.get("/random", verify, async (req, res) => {
  //query the data by taking the query part from the url and then use it to perform actions
  const type = req.query.type;
  //movie variable to store the movie/webSeries after checking the isSeries boolean type and then storing the array of movies/webSeries
  let movie;
  try {
    if (type === "series") {
      movie = await Movie.aggregate([
        { $match: { isSeries: true } },
        { $sample: { size: 1 } },
      ]);
    } else {
      movie = await Movie.aggregate([
        { $match: { isSeries: false } },
        { $sample: { size: 1 } },
      ]);
    }
    res.status(200).json(movie);
  } catch (error) {
    res.status(500).json(error);
  }
});

//GET ALL
router.get("/", verify, async (req, res) => {
  if (req.user.isAdmin) {
    try {
      //get all the movie/webSeries and return
      const movies = await Movie.find();
      res.status(200).json(movies.reverse());
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res
      .status(403)
      .json("ACCESS DENIED, THIS ACTION REQUIRES ADMIN PRIVILEGES");
  }
});

module.exports = router;
