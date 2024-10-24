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
  const classificationSelect = await utilities.buildClassificationList()
  res.render("./inventory/management", {
    title: "Management",
    nav,
    classificationSelect,
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

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classificationId = parseInt(req.params.classificationId)
  const invData = await invModel.getInventoryByClassificationId(classificationId)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

  /* ***************************
 *  Edit Vehicle View
 * ************************** */

  async function editInvId(req, res, next) {
    let nav = await utilities.getNav()
    const inv_id = parseInt(req.params.invId)
    const itemData = await invModel.getInventoryByInvId(inv_id)
    let classificationList = await utilities.buildClassificationList(itemData.classification_id)
    const itemName = `${itemData[0].inv_make} ${itemData[0].inv_model}`
    res.render("./inventory/edit-vehicle", {
      title: "Edit " + itemName,
      nav,
      classificationList: classificationList,
      errors: null,
      inv_id: itemData[0].inv_id,
      inv_make: itemData[0].inv_make,
      inv_model: itemData[0].inv_model,
      inv_year: itemData[0].inv_year,
      inv_description: itemData[0].inv_description,
      inv_image: itemData[0].inv_image,
      inv_thumbnail: itemData[0].inv_thumbnail,
      inv_price: itemData[0].inv_price,
      inv_miles: itemData[0].inv_miles,
      inv_color: itemData[0].inv_color,
      classification_id: itemData[0].classification_id
    })
  }


/* ***************************
 *  Delete Vehicle View
 * ************************** */

    async function deleteInvId(req, res, next) {
      let nav = await utilities.getNav()
      const inv_id = parseInt(req.params.inv_id)
      const itemData = await invModel.getInventoryByInvId(inv_id)
      const itemName = `${itemData.inv_make} ${itemData.inv_model}`
      res.render("./inventory/delete-confirm", {
        title: "Delete " + itemName,
        nav,
        errors: null,
        inv_id: itemData.inv_id,
        inv_make: itemData.inv_make,
        inv_model: itemData.inv_model,
        inv_year: itemData.inv_year,
        inv_price: itemData.inv_price,
      })
    }

    /* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateVehicle(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const updateVehicle = updateResult[0]
    const itemName = updateVehicle.inv_make + " " + updateVehicle.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-vehicle", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
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
    })
  }
}

module.exports = {...invCont, createClassification, createVehicle, registerClassification, registerVehicle, editInvId, deleteInvId}