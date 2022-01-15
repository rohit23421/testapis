const express = require("express");
const router = express.Router();

const {
  getProductById,
  createProduct,
  getProduct,
  photo,
  updateProduct,
  getAllProducts,
  deleteProduct,
} = require("../controllers/product");

//params
router.param("productId", getProductById);

//routes
router.post("/product/create", createProduct);

router.get("/product/:productId", getProduct);
router.get("/product/photo/:productId", photo);

router.put("product/:productId", updateProduct);

router.delete("/product/:productId", deleteProduct);

router.get("/products", getAllProducts);

module.exports = router;
