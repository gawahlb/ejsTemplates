// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to build inventory by specific item view
router.get("/detail/:invId", invController.buildByInvId);

// Route for intentional error
router.get("/intentional-error", invController.intentionalError);

module.exports = router;