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
  userUnfreeze,
  evaluateClub,
  walletDiscountSubscription,
  filterClubsBySubscriptionType,
  deleteUser,
  updateUserLocation,
  resetPassowrd,
  forgetPassowrd,
  getClubsByGet,
  AddClubOrder,
  getOrderClubs,
  getOrderClub,
  AddOrderClub,
} = require("../controllers/user");
const router = require("express").Router();
const verifyToken = require("../middlewares/verifyToken");
const upload = require("../middlewares/upload");
const imgUploader = require("../middlewares/imgUploader");

router.post("/clubs", getClubs);
router.get("/clubs", getClubsByGet);
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
router.post("/update-location", verifyToken, updateUserLocation);
// get club by its catogery
router.post("/clubs_by_activity", getClubByActivity);
// this wallet depost is deprecated and doesn't use real payments
router.post("/wallet_deposit", verifyToken, walletDeposit);
router.get("/wallet", verifyToken, getUserWallet);
router.post("/evaluation", verifyToken, evaluateClub);
router.get("/booking", verifyToken, userBooking);
router.put("/fav/:club_id", verifyToken, addOrRemoveFav);
router.get("/isfav/:club_id", verifyToken, isFav);
router.get("/fav", verifyToken, getUserFav);
router.get("/profile", verifyToken, getprofile);
router.post("/freeze", verifyToken, userFreezing);
router.post("/unfreeze", verifyToken, userUnfreeze);
/**
 * @swagger
 * user/delete-user/{userId}:
 *   delete:
 *     summary: Delete a user
 *     description: Deletes a user by ID along with their associated subscriptions and favorites. Returns a success message upon successful deletion.
 *     tags:
 *       - User
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the user to delete.
 *         schema:
 *           type: string
 *           example: 61234abcde56789fghij1234
 *     responses:
 *       200:
 *         description: User and associated data deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User and associated data deleted successfully
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */

router.delete("/delete-user/:userId", deleteUser);
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
router.post("/pay_wallet", verifyToken, walletDiscountSubscription);
router.post("/check-pay/:paymentId/:subId", verifyToken, checkPayment);
router.post("/check-pay-new/:paymentId", verifyToken, checkPaymentNew);
router.post("/wallet_confirm", verifyToken, confirmDeposit);
router.post("/make_sub/:subId", verifyToken, userMakeSub);
router.post("/confirm_payment/:subId", verifyToken, confirmPayment);
router.post("/pay-visa", verifyToken, hyperCheckout);
router.get("/activities", GetActivities);
router.post("/filter_by_subscriptionType", filterClubsBySubscriptionType);
router.post("/forget_password", forgetPassowrd);
router.post(
  "/club_order",
  imgUploader.fields([{ name: "clubImg" }, { name: "logo", maxCount: 1 }]),
  AddClubOrder
);
router.get("/club_order", getOrderClubs);
router.post("/get_club_order", getOrderClub);
router.post(
  "/add_order_data",
  imgUploader.fields([{ name: "clubImg" }, { name: "logo", maxCount: 1 }]),
  AddOrderClub
);
router.post("/reset_password", resetPassowrd);
module.exports = router;
