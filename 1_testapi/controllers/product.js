const Product = require("../models/product");
const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");
const { sortBy } = require("lodash");

exports.getProductById = (req, res, next, id) => {
  Product.findById(id).exec((err, product) => {
    if (err) {
      return res.status(400).json({
        error: "PRODUCT NOT FOUND",
      });
    }
    req.product = product;
    next();
  });
};

exports.createProduct = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        error: "THERE WAS A PROBLEM WITH FILE",
      });
    }

    //destructing the fields for putting restrictions
    const { name, description } = fields;

    if (!name || !description) {
      return res.status(400).json({
        error: "ALL FIELDS ARE MANDATORY",
      });
    }

    let product = new Product(fields);

    //handling the file
    if (file.photo) {
      if (file.photo.size > 3000000) {
        return res.status(400).json({
          error: "FILE SIZE TOO BIG",
        });
      }
      product.photo.data = fs.readFileSync(file.photo.path);
      product.photo.contentType = file.photo.type;
    }

    //saving the file/photo to DB
    product.save((err, product) => {
      if (err) {
        return res.status(400).json({
          error: "FAILED TO SAVE THE FILE IN DB",
        });
      }
      res.json(product);
    });
  });
};

exports.getProduct = (req, res) => {
  req.product.photo = undefined;
  return res.json(req.product);
};

//middleware for checking the photo has some data or not and to be loaded simultaneously when the getproduct route works
exports.photo = (req, res, next) => {
  if (req.product.photo.data) {
    res.set("Content-Type", req.product.photo.contentType);
    return res.send(req.product.photo.data);
  }
  next();
};

exports.deleteProduct = (req, res) => {
  //grabbing the product id
  let product = req.product;
  product.remove((err, deletedProduct) => {
    if (err) {
      return res.status(400).json({
        error: "FAILED TO DELETE THE PRODUCT",
      });
    }
    res.json({
      message: "SUCCESS!!! PRODUCT DELETED",
      deletedProduct,
    });
  });
};

exports.updateProduct = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        error: "THERE WAS A PROBLEM WITH FILE",
      });
    }

    //updation of the product
    let product = req.product;
    //updating the product with the required fields
    product = _.extend(product, fields);

    //handling the file
    if (file.photo) {
      if (file.photo.size > 3000000) {
        return res.status(400).json({
          error: "FILE SIZE TOO BIG",
        });
      }
      product.photo.data = fs.readFileSync(file.photo.path);
      product.photo.contentType = file.photo.type;
    }
    //console.log(product);

    //saving the file/photo to DB
    product.save((err, product) => {
      if (err) {
        return res.status(400).json({
          error: "FAILED TO UPDATE THE PRODUCT IN DB",
        });
      }
      res.json(product);
    });
  });
};

//product listing
exports.getAllProducts = (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 8;
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id";

  Product.find()
    .select("-photo")
    .sort([[sortBy, "asc"]])
    .limit(limit)
    .exec((err, products) => {
      if (err) {
        return res.status(400).json({
          error: "NO PRODUCTS FOUND",
        });
      }
      res.json(products);
    });
};
