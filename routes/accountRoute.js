// Needed Resources 
const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities/index")
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation')
const loginValidate = require('../utilities/login-validation')
const updateValidate = require('../utilities/update-validation')


router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement))

router.get("/login", utilities.handleErrors(accountController.buildLogin));

router.get("/register", utilities.handleErrors(accountController.buildRegister));

router.get("/logout", utilities.handleErrors(accountController.buildLogout));

router.get("/update", utilities.handleErrors(accountController.buildUpdate));

// Process the registration data
router.post(
    "/register",
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
  )

// Process the login attempt
router.post(
  "/login",
  loginValidate.loginRules(),
  loginValidate.checkRegData,
  utilities.handleErrors(accountController.accountLogin)
)

// Process the update attempt
router.post(
  "/update",
  updateValidate.updateRules(),
  updateValidate.checkRegData,
  utilities.handleErrors(accountController.updateAccount)
)

module.exports = router;