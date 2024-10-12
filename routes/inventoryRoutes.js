// Needed Resources 
const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities/index")
const invController = require("../controllers/invController")
const regValidate = require('../utilities/inventory-validation')

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to build inventory by specific item view
router.get("/detail/:invId", invController.buildByInvId);

// Route for intentional error
router.get("/intentional-error", invController.intentionalError);

// Route for Management View
router.get("/", invController.managementView)

// Route for Adding Classification
router.get("/add-classification", invController.createClassification)

// Route for Adding Vehicle to Inventory
router.get("/add-vehicle", invController.createVehicle)

// Process the classification
router.post(
    "/add-classification",
    regValidate.classificationRules(),
    regValidate.checkClassData,
    utilities.handleErrors(invController.registerClassification)
  )

// Process the Vehicle
router.post(
    "/add-vehicle",
    regValidate.vehicleRules(),
    regValidate.checkVehicleData,
    utilities.handleErrors(invController.registerVehicle)
  )

module.exports = router;