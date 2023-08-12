const {
  getClubs,
  getClub,
  getRules,
  makeReport,
  userMakeSub,
  confirmPayment,
  getClubAuth,
  searchClub,
  searchClubByName,
  filterClubs,
  depositWallet,
  confirmDeposit,
  getUserWallet,
  userBooking,
  addOrRemoveFav,
  getUserFav,
  renewClubByWallet,
  getprofile,
  updateProfile,
  getBlog,
  getOpinnion,
  getBlogById,
  getMinClubs,
  hyperCheckout,
  checkPayment,
} = require("../controllers/user");
const router = require("express").Router();
const verifyToken = require("../middlewares/verifyToken");
const upload = require("../middlewares/upload");
const imgUploader = require("../middlewares/imgUploader");

router.get("/clubs", getClubs);
router.get("/minclubs", getMinClubs);
router.get("/blogs", getBlog);
router.get("/blog/:blog_id", getBlogById);
router.get("/opinions", getOpinnion);
router.get("/club/:club_id", getClub);
router.get("/club", searchClub);
router.get("/club_auth/:club_id", verifyToken, getClubAuth);
router.post("/clubs/search", searchClubByName);
router.get("/clubs/filter", filterClubs);
router.get("/rules", getRules);
router.post("/user_reports", makeReport);
router.post("/make_sub/:subId", verifyToken, userMakeSub);
router.post("/confirm_payment/:subId", verifyToken, confirmPayment);
router.post("/renew_club_wallet/:subId", verifyToken, renewClubByWallet);
router.post("/wallet", depositWallet);
router.post("/wallet_confirm", verifyToken, confirmDeposit);
router.get("/wallet", verifyToken, getUserWallet);
router.get("/booking", verifyToken, userBooking);
router.put("/fav/:club_id", verifyToken, addOrRemoveFav);
router.get("/fav", verifyToken, getUserFav);
router.get("/profile", verifyToken, getprofile);
router.patch(
  "/profile",
  [verifyToken, imgUploader.fields([{ name: "photo", maxCount: 1 }])],
  updateProfile
);
router.post("/pay-visa/:subId", verifyToken, hyperCheckout);
router.post("/check-pay/:id", verifyToken, checkPayment);
module.exports = router;
