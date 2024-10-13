const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build inventory by detail view
 * ************************** */

invCont.buildByInvId = async function (req, res, next) {
  const inv_id = req.params.invId
  const data = await invModel.getInventoryByInvId(inv_id)
  if (!data || data.length == 0) {
    return res.redirect('/');
  }
  const grid = await utilities.buildDetailGrid(data[0])
  let nav = await utilities.getNav()
  const invName = `${data[0].inv_year} ${data[0].inv_make} ${data[0].inv_model}`;
  res.render("./inventory/detail", {
    title: invName,
    nav,
    grid,
  });
}

/* ***************************
 *  Intentional error view
 * ************************** */

invCont.intentionalError = function(req, res, next) {
  next(new Error("This is an intentional error."));
}

/* ***************************
 *  Management View
 * ************************** */

invCont.managementView = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/management", {
    title: "Management",
    nav,
  });
}

/* ***************************
 *  Add Classification View
 * ************************** */

async function createClassification(req, res, next) {
    let nav = await utilities.getNav()
    res.render("./inventory/add-classification", {
      title: "Create New Classification",
      nav,
      errors: null,
    })
  }

  /* ***************************
 *  Add Vehicle View
 * ************************** */

async function createVehicle(req, res, next) {
  let nav = await utilities.getNav()
  let classificationList = await utilities.buildClassificationList();

  res.render("./inventory/add-vehicle", {
    title: "Create New Vehicle",
    nav,
    classificationList,
    errors: null,
  })
}



/* ****************************************
*  Process Classification
* *************************************** */
async function registerClassification(req, res) {
  let nav = await utilities.getNav()
  const { classification_name } = req.body

  const regResult = await invModel.addClassification(
    classification_name
  )

  if (regResult) {
    req.flash(
      "notice",
      `Successfully added classification: ${classification_name}.`
    )
    res.status(201).render("inventory/management", {
      title: "Management View",
      nav,
    })
  } else {
    req.flash("notice", "Classification creation failed.")
    res.status(501).render("inventory/add-classification", {
      title: "Create Classification",
      nav,
    })
  }
}

/* ****************************************
*  Process Vehicle
* *************************************** */
async function registerVehicle(req, res) {
  let nav = await utilities.getNav()
  const { inv_make, 
          inv_model, 
          inv_year, 
          inv_description, 
          inv_image, 
          inv_thumbnail, 
          inv_price, 
          inv_miles, 
          inv_color, 
          classification_id 
        } = req.body

  const regResult = await invModel.addVehicle(
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
  )

  if (regResult) {
    req.flash(
      "notice",
      `Successfully added vehicle: ${inv_make} ${inv_model}.`
    )
    res.status(201).render("inventory/management", {
      title: "Management View",
      nav,
    })
  } else {
    req.flash("notice", "Vehicle creation failed.")
    let classificationList = await utilities.buildClassificationList();
    res.status(501).render("inventory/add-vehicle", {
      title: "Create Vehicle",
      nav,
      errors:null,
      classificationList,
    })
  }
}

module.exports = {...invCont, createClassification, createVehicle, registerClassification, registerVehicle}