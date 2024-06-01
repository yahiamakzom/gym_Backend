const router = require("express").Router()

const { Login, Register ,ClubLogin  ,ClubMemberLogin} = require("../controllers/auth")

const { LoginValidator, RegisterValidator  } = require("../utils/validators/auth")


router.post("/login", LoginValidator , Login)
router.post("/register", RegisterValidator, Register)
router.post("/club-login", ClubLogin)
router.post("/club-member", ClubMemberLogin)


module.exports = router