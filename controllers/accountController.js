const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  }

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      title: "Register",
      nav,
      errors: null,
    })
  }

/* ****************************************
*  Deliver account management view
* *************************************** */
async function buildAccountManagement(req, res, next) {
  let nav = await utilities.getNav()
  const {account_firstname, account_type} = req.session.user || {}
  res.render("account/account-management", {
    title: "Account Management",
    nav,
    errors: null,
    account_firstname,
    account_type,
  })
}

/* ****************************************
*  Deliver account management view
* *************************************** */
async function buildUpdate(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/update", {
    title: "Update Account",
    nav,
    errors: null,
  })
}
  

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body
  
    // Hash the password before storing
    let hashedPassword
    try {
      // regular password and cost (salt is generated automatically)
      hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
      req.flash("notice", 'Sorry, there was an error processing the registration.')
      res.status(500).render("account/register", {
        title: "Registration",
        nav,
        errors: null,
      })
    }

    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )
  
    if (regResult) {
      req.flash(
        "notice",
        `Congratulations, you\'re registered ${account_firstname}. Please log in.`
      )
      res.status(201).render("account/login", {
        title: "Login",
        nav,
      })
    } else {
      req.flash("notice", "Sorry, the registration failed.")
      res.status(501).render("account/register", {
        title: "Registration",
        nav,
      })
    }
  }

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
   req.flash("notice", "Please check your credentials and try again.")
   res.status(400).render("account/login", {
    title: "Login",
    nav,
    errors: null,
    account_email,
   })
  return
  }
  try {
   if (await bcrypt.compare(account_password, accountData.account_password)) {
   delete accountData.account_password
   req.session.user = accountData
   req.session.loggedin = true

   const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
   if(process.env.NODE_ENV === 'development') {
     res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
     } else {
       res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
     }
   return res.redirect("/account/")
   }
  } catch (error) {
   return new Error('Access Forbidden')
  }
 }

 /* ****************************************
 *  Process logout request
 * ************************************ */
async function buildLogout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.log(err)
      return res.redirect('/account')
    }
    res.clearCookie('jwt')
    res.redirect('/')
  })
}

/* ****************************************
 *  Process password change
 * ************************************ */

async function updatePassword(req, res) {
  const {current_password, new_password} = req.body
  const accountId = req.session.user.id
  const errors = []

  if(!new_password || new_password.length < 12) {
    errors.push("Password must be at least 12 characters.")
  }

  if(errors.length > 0) {
    req.flash('errors', errors)
    return res.render('account/update-account', {account_id: accountId})
  }

  try {
    const hashedPassword = await bcrypt.hash(new_password, 10)

    const passwordResult = await accountModel.updatePassword(accountId, hashedPassword)

    if(passwordResult) {
      req.flash('success', 'Password updated successfully!')
    } else {
      req.flash('error', 'Error while updating password.')
    }

    return res.redirect('/account/account-management')
  } catch(error) {
    console.error('Error updating password: ', error)
    req.flash('error', 'Error while updating password.')
    return res.render('account/update-account', {account_id: accountId,})
  }

}

/* ****************************************
 *  Process account change
 * ************************************ */

async function updateAccount(req, res) {
  const {account_firstname, account_lastname, account_email} = req.body
  const accountId = req.session.user.id

  const regResult = await accountModel.updateAccount(
    account_firstname,
    account_lastname,
    account_email,
    accountId
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re account has been updated ${account_firstname}.`
    )
    res.status(201).render("account/", {
      title: "Account Management",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("account/update", {
      title: "Update Account",
      nav,
    })
  }
}


  module.exports = { buildLogin, buildRegister, buildAccountManagement, registerAccount, accountLogin, buildLogout, updatePassword, updateAccount, buildUpdate }