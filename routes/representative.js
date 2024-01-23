const router = require("express").Router(); 
const {getClubs} = require('../controllers/representative')



router.post("/clubs" ,getClubs)



module.exports = router;
