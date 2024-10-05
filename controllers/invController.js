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
};

module.exports = invCont