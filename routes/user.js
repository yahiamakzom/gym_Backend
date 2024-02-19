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
  walletDeposit,
  subscriptionConfirmation,
  checkPaymentNew,
  GetActivities,
  getClubByActivity,
  isFav,
  userFreezing,
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
router.post("/renew_club_wallet/:subId", verifyToken, renewClubByWallet);
// get club by its catogery
router.post("/clubs_by_activity", getClubByActivity);
// this wallet depost is deprecated and doesn't use real payments
router.post("/wallet_deposit", verifyToken, walletDeposit);
router.get("/wallet", verifyToken, getUserWallet);
router.get("/booking", verifyToken, userBooking);
router.put("/fav/:club_id", verifyToken, addOrRemoveFav);
router.get("/isfav/:club_id", verifyToken, isFav);
router.get("/fav", verifyToken, getUserFav);
router.get("/profile", verifyToken, getprofile);
router.post("/freeze", verifyToken, userFreezing);
router.patch(
  "/profile",
  [verifyToken, imgUploader.fields([{ name: "photo", maxCount: 1 }])],
  updateProfile
);
router.post(
  "/subscription_confirmation",
  verifyToken,
  subscriptionConfirmation
);
// payment methods
// old
router.post("/wallet", depositWallet);
// not belong to us

router.post("/check-pay/:paymentId/:subId", verifyToken, checkPayment);
router.post("/check-pay-new/:paymentId", verifyToken, checkPaymentNew);
router.post("/wallet_confirm", verifyToken, confirmDeposit);
router.post("/make_sub/:subId", verifyToken, userMakeSub);
router.post("/confirm_payment/:subId", verifyToken, confirmPayment);

// this will be responsilbe for gettign the
router.post("/pay-visa", verifyToken, hyperCheckout);

router.get("/activities", GetActivities);
module.exports = router;
