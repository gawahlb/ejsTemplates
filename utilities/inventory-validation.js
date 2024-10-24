const utilities = require(".")
  const { body, validationResult } = require("express-validator")
  const validate = {}

  /*  **********************************
  *   Classification Data Validation Rules
  * ********************************* */
  validate.classificationRules = () => {
    return [
      // valid email is required and cannot already exist in the DB
      body("classification_name")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("A valid classification name is required.")
      .isLength({ min: 3 }),
    ]
  }

/*  **********************************
  *  Vehicle Data Validation Rules
  * ********************************* */
validate.vehicleRules = () => {
  return [
   
    body("inv_make")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 3 })
      .withMessage("Please provide a vehicle make."), // on error this message is sent.

    body("inv_model")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 3 })
      .withMessage("Please provide a vehicle model."), // on error this message is sent.

    body("inv_year")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 4, max: 4 })
      .withMessage("Please provide the year the vehicle was made."), // on error this message is sent.
     
    body("inv_description")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a vehicle description."), // on error this message is sent.
      
    body("inv_image")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a vehicle image."), // on error this message is sent.

    body("inv_thumbnail")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a vehicle thumbnail image."), // on error this message is sent.

    body("inv_price")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a vehicle price."), // on error this message is sent.

    body("inv_miles")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide the vehicle mileage."), // on error this message is sent.

    body("inv_color")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide the vehicle color."), // on error this message is sent.

    body("classification_id")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a vehicle classification."), // on error this message is sent.
    
  ]
}





/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkClassData = async (req, res, next) => {
    const { classification_name } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      res.render("inventory/add-classification", {
        errors,
        title: "Create Classification",
        nav,
        classification_name,
      })
      return
    }
    next()
  }


  /* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkVehicleData = async (req, res, next) => {
  const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList();
    res.render("inventory/add-vehicle", {
      errors,
      title: "Create Vehicle",
      nav,
      classificationList,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    })
    return
  }
  next()
}

  /* ******************************
 * Check data and return errors or continue to edit
 * ***************************** */
  validate.checkUpdateData = async (req, res, next) => {
    const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      let inv_id = parseInt(req.params.invId)
      let classificationList = await utilities.buildClassificationList();
      res.render("inventory/edit-vehicle", {
        errors,
        title: "Edit Vehicle",
        nav,
        classificationList,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id,
        inv_id,
      })
      return
    }
    next()
  }

  module.exports = validate