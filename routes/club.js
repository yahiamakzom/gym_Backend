const router = require("express").Router();

const {
  addSubscreptions,
  getSubscriptions,
  searchSubscreptions,
  editClub,
  getClubEarns,
  getCLubsReportsAdded,
  editSubscription,
  deleteSubscription,
  BankData,
  getClubBankAccount,
  getClubMangerClubs,

} = require("../controllers/club");
const { addSubscreptionvalidatior } = require("../utils/validators/club");
const imgUploader = require("../middlewares/imgUploader");

/**
 * @swagger
 * /club/subscription:
 *   post:
 *     summary: Add a new subscription
 *     description: Creates a new subscription for a club.
 *     tags:
 *       - Club
 *     security:
 *       - bearerAuth: []  # Use this if you are using JWT or similar authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the subscription.
 *               price:
 *                 type: number
 *                 description: The base price of the subscription.
 *               type:
 *                 type: string
 *                 description: The type of subscription (e.g., 30Minutes, 60Minutes).
 *               numberType:
 *                 type: number
 *                 description: The numerical type of the subscription.
 *               freezeCountTime:
 *                 type: number
 *                 description: The number of times the subscription can be frozen.
 *               freezeTime:
 *                 type: number
 *                 description: The duration for which the subscription can be frozen.
 *               gymsCount:
 *                 type: number
 *                 description: The number of gyms included in the subscription.
 *     responses:
 *       201:
 *         description: Subscription successfully created
 *       403:
 *         description: Subscription with the same name, type, and numberType already exists
 *       404:
 *         description: Club not found
 *       500:
 *         description: Internal Server Error
 */
router.post("/subscription", addSubscreptionvalidatior, addSubscreptions);

/**
 * @swagger
 * /club/subscriptions:
 *   get:
 *     summary: Retrieve a list of subscriptions for the authenticated club.
 *     description: Fetches all subscriptions for a club owned by the authenticated user. Each subscription includes details about the user, club, and subscription type.
 *     tags:
 *       - Club
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of subscriptions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 all:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user:
 *                         type: object
 *                         properties:
 *                           username:
 *                             type: string
 *                             description: The username of the user.
 *                           home_location:
 *                             type: string
 *                             description: The home location of the user.
 *                           code:
 *                             type: string
 *                             description: The user code.
 *                       club:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             description: The name of the club.
 *                           location:
 *                             type: string
 *                             description: The location of the club.
 *                       subscription:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             description: The name of the subscription.
 *       401:
 *         description: Unauthorized, missing or invalid token.
 *       500:
 *         description: Internal server error.
 */
router.get("/subscriptions", getSubscriptions);

/**
 * @swagger
 * club/player:
 *   get:
 *     summary: Search for a specific subscription by code.
 *     description: Retrieves a subscription based on a provided code and the authenticated user's club. Returns details about the user and subscription if found.
 *     tags:
 *       - Club
 *     parameters:
 *       - name: code
 *         in: query
 *         description: The unique code for the subscription to search for.
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription details found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 player:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         username:
 *                           type: string
 *                           description: The username of the user.
 *                         code:
 *                           type: string
 *                           description: The code of the user.
 *                     subscription:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           description: The name of the subscription.
 *                         price:
 *                           type: number
 *                           format: float
 *                           description: The price of the subscription.
 *       404:
 *         description: Subscription not found with the provided code.
 *       401:
 *         description: Unauthorized, missing or invalid token.
 *       500:
 *         description: Internal server error.
 */
router.get("/player", searchSubscreptions);

/**
 * @swagger
 * /:
 *   put:
 *     summary: Edit club details.
 *     description: Updates the details of a specific club based on the provided data. Includes image uploads, location updates, and discount settings.
 *     tags:
 *       - Club
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the club.
 *               lat:
 *                 type: number
 *                 format: float
 *                 description: The latitude of the club's location.
 *               long:
 *                 type: number
 *                 format: float
 *                 description: The longitude of the club's location.
 *               description:
 *                 type: string
 *                 description: A description of the club.
 *               gender:
 *                 type: string
 *                 description: The gender focus of the club (e.g., male, female, mixed).
 *               from:
 *                 type: string
 *                 description: The opening time of the club (HH:mm format).
 *               to:
 *                 type: string
 *                 description: The closing time of the club (HH:mm format).
 *               allDay:
 *                 type: string
 *                 enum: [true, false]
 *                 description: Indicates if the club is open all day.
 *               checkedDays:
 *                 type: string
 *                 description: Comma-separated list of checked days.
 *               checkedItemsSports:
 *                 type: string
 *                 description: Comma-separated list of checked sports items.
 *               discountCode:
 *                 type: string
 *                 description: The discount code for the club.
 *               discountQuantity:
 *                 type: number
 *                 format: float
 *                 description: The quantity of the discount.
 *               yogaCardData:
 *                 type: string
 *                 description: JSON string containing yoga card data.
 *               mapUrl:
 *                 type: string
 *                 description: URL of the map location.
 *               isWork:
 *                 type: boolean
 *                 description: Indicates if the club is currently working.
 *               daysOf:
 *                 type: string
 *                 description: Comma-separated list of days when the club is off.
 *               clubImg:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Images of the club.
 *               logo:
 *                 type: string
 *                 format: binary
 *                 description: Logo of the club.
 *     responses:
 *       200:
 *         description: Successfully updated the club details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 club:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: The ID of the club.
 *                     name:
 *                       type: string
 *                       description: The name of the club.
 *                     description:
 *                       type: string
 *                       description: The description of the club.
 *                     location:
 *                       type: string
 *                       description: The location of the club.
 *                     images:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: URLs of the club images.
 *                     logo:
 *                       type: string
 *                       description: URL of the club logo.
 *                     lat:
 *                       type: number
 *                       format: float
 *                       description: The latitude of the club's location.
 *                     long:
 *                       type: number
 *                       format: float
 *                       description: The longitude of the club's location.
 *                     allDay:
 *                       type: boolean
 *                       description: Indicates if the club is open all day.
 *                     from:
 *                       type: string
 *                       description: The opening time of the club.
 *                     to:
 *                       type: string
 *                       description: The closing time of the club.
 *                     isWork:
 *                       type: boolean
 *                       description: Indicates if the club is currently working.
 *                     WorkingDays:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: List of days the club is working.
 *                     sports:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: List of sports available at the club.
 *       404:
 *         description: Club not found or location not found.
 *       500:
 *         description: Internal server error.
 */
router.put(
  "/",
  imgUploader.fields([{ name: "clubImg" }, { name: "logo", maxCount: 1 }]),
  editClub
);

/**
 * @swagger
 * /club/subscription/{subId}:
 *   put:
 *     summary: Edit a subscription.
 *     description: Updates the details of a specific subscription based on the provided subscription ID.
 *     tags:
 *       - Club
 *     parameters:
 *       - name: subId
 *         in: path
 *         required: true
 *         description: The ID of the subscription to be updated.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the subscription.
 *               price:
 *                 type: number
 *                 format: float
 *                 description: The price of the subscription.
 *               type:
 *                 type: string
 *                 description: The type of the subscription.
 *     responses:
 *       200:
 *         description: Successfully updated the subscription.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sub:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: The ID of the subscription.
 *                     name:
 *                       type: string
 *                       description: The name of the subscription.
 *                     price:
 *                       type: number
 *                       format: float
 *                       description: The price of the subscription.
 *                     type:
 *                       type: string
 *                       description: The type of the subscription.
 *       404:
 *         description: Subscription not found.
 *       500:
 *         description: Internal server error.
 */
router.put("/subscription/:subId", editSubscription);

/**
 * @swagger
 * /club/subscription/{subId}:
 *   delete:
 *     summary: Delete a subscription.
 *     description: Deletes a specific subscription based on the provided subscription ID. The subscription cannot be deleted if it is currently associated with active player subscriptions.
 *     tags:
 *       - Club
 *     parameters:
 *       - name: subId
 *         in: path
 *         required: true
 *         description: The ID of the subscription to be deleted.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully deleted the subscription.
 *       404:
 *         description: Subscription not found.
 *       409:
 *         description: Cannot delete the subscription because it is associated with active player subscriptions.
 *       500:
 *         description: Internal server error.
 */
router.delete("/subscription/:subId", deleteSubscription);

/**
 * @swagger
 * /bank_data:
 *   post:
 *     summary: Update bank account information for a club.
 *     description: Allows a user to update the bank account details of the club they are associated with. Requires the user to be authenticated and associated with a club.
 *     tags:
 *       - Club
 *     requestBody:
 *       description: Bank account details to be updated.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               phone:
 *                 type: string
 *                 example: +1234567890
 *               bankName:
 *                 type: string
 *                 example: Example Bank
 *               bankAccountNumber:
 *                 type: string
 *                 example: 1234567890
 *               bankAccountName:
 *                 type: string
 *                 example: John Doe
 *             required:
 *               - name
 *               - phone
 *               - bankName
 *               - bankAccountNumber
 *               - bankAccountName
 *     responses:
 *       200:
 *         description: Successfully updated bank account information.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     bankAccount:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: John Doe
 *                         phone:
 *                           type: string
 *                           example: +1234567890
 *                         bankName:
 *                           type: string
 *                           example: Example Bank
 *                         bankAccountNumber:
 *                           type: string
 *                           example: 1234567890
 *                         bankAccountName:
 *                           type: string
 *                           example: John Doe
 *       400:
 *         description: Bad request due to missing or invalid bank account details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Please provide all bank account details
 *       404:
 *         description: User or club not found, or user is not associated with any club.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 */
router.post("/bank_data", BankData);

/**
 * @swagger
 * /club/bank_data:
 *   get:
 *     summary: Retrieve bank account information for a club.
 *     description: Allows a user to retrieve the bank account details of the club they are associated with. Requires the user to be authenticated and associated with a club.
 *     tags:
 *       - Club
 *     responses:
 *       200:
 *         description: Successfully retrieved bank account information.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: John Doe
 *                     phone:
 *                       type: string
 *                       example: +1234567890
 *                     bankName:
 *                       type: string
 *                       example: Example Bank
 *                     bankAccountNumber:
 *                       type: string
 *                       example: 1234567890
 *                     bankAccountName:
 *                       type: string
 *                       example: John Doe
 *       404:
 *         description: User or club not found, or user is not associated with any club.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 */
router.get("/bank_data", getClubBankAccount);

/**
 * @swagger
 * /club/club_earns:
 *   get:
 *     summary: Retrieve earnings for a club.
 *     description: Retrieves daily, monthly, and yearly earnings for the club associated with the authenticated user.
 *     tags:
 *       - Club
 *     responses:
 *       200:
 *         description: Successfully retrieved club earnings.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     dailyEarnings:
 *                       type: number
 *                       example: 100
 *                     monthlyEarnings:
 *                       type: number
 *                       example: 3000
 *                     yearlyEarnings:
 *                       type: number
 *                       example: 36000
 *       404:
 *         description: User or club not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: User or Club Not Found
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 */
router.get("/club_earns", getClubEarns);

/**
 * @swagger
 * club/clubs-report:
 *   post:
 *     summary: Generate a report for clubs associated with a specific club admin.
 *     description: Retrieves a report for clubs added by a specific club admin. The report includes player counts and earnings based on subscription types for each club.
 *     tags:
 *       - Club
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: The ID of the club admin.
 *             required:
 *               - id
 *           example:
 *             id: "605c72ef2f8b0b001f5b8d1e"
 *     responses:
 *       '200':
 *         description: Successfully retrieved the clubs report.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clubs_report:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       club_name:
 *                         type: string
 *                         description: The name of the club.
 *                       club_city:
 *                         type: string
 *                         description: The city where the club is located.
 *                       club_players:
 *                         type: integer
 *                         description: The total number of players in the club.
 *                       day:
 *                         type: number
 *                         format: float
 *                         description: Earnings from daily subscriptions.
 *                       month:
 *                         type: number
 *                         format: float
 *                         description: Earnings from monthly subscriptions.
 *                       year:
 *                         type: number
 *                         format: float
 *                         description: Earnings from yearly subscriptions.
 *                       week:
 *                         type: number
 *                         format: float
 *                         description: Earnings from weekly subscriptions.
 *                       minutes120:
 *                         type: number
 *                         format: float
 *                         description: Earnings from 120 minutes subscriptions.
 *                       minutes90:
 *                         type: number
 *                         format: float
 *                         description: Earnings from 90 minutes subscriptions.
 *                       minutes60:
 *                         type: number
 *                         format: float
 *                         description: Earnings from 60 minutes subscriptions.
 *                       minutes30:
 *                         type: number
 *                         format: float
 *                         description: Earnings from 30 minutes subscriptions.
 *             example:
 *               clubs_report:
 *                 - club_name: "FitGym"
 *                   club_city: "New York"
 *                   club_players: 150
 *                   day: 500.00
 *                   month: 2000.00
 *                   year: 24000.00
 *                   week: 1000.00
 *                   minutes120: 300.00
 *                   minutes90: 250.00
 *                   minutes60: 200.00
 *                   minutes30: 150.00
 *       '400':
 *         description: Bad request. The request is missing required parameters or has invalid data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the issue with the request.
 *               example:
 *                 message: 'Invalid request data'
 *       '404':
 *         description: Not found. No clubs were found for the specified admin ID or the admin ID does not exist.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating that no clubs or admin was found.
 *               example:
 *                 message: 'No clubs found for the specified admin ID'
 *       '500':
 *         description: Internal server error. An unexpected error occurred while processing the request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating a server issue.
 *               example:
 *                 message: 'Internal server error'
 */

router.post("/clubs-report", getCLubsReportsAdded);

/**
 * @swagger
 * club/clubs-manager:
 *   get:
 *     summary: Retrieve all clubs managed by the authenticated user's club.
 *     description: Fetches a list of all clubs associated with the club managed by the authenticated user.
 *     tags:
 *       - Club
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved the list of clubs managed by the user's club.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clubs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: The unique identifier of the club.
 *                       name:
 *                         type: string
 *                         description: The name of the club.
 *                       city:
 *                         type: string
 *                         description: The city where the club is located.
 *                       ClubAdd:
 *                         type: string
 *                         description: The ID of the club that added this club.
 *                       otherProperties:
 *                         type: object
 *                         additionalProperties: true
 *                         description: Other relevant properties of the club.
 *                 success:
 *                   type: boolean
 *                   description: Indicates whether the request was successful.
 *               required:
 *                 - clubs
 *                 - success
 *       '404':
 *         description: Club not found or the user is not associated with any club.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating that the club was not found.
 *                 success:
 *                   type: boolean
 *                   description: Indicates whether the request was successful.
 *               required:
 *                 - message
 *                 - success
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating an internal server error.
 *                 success:
 *                   type: boolean
 *                   description: Indicates whether the request was successful.
 *               required:
 *                 - message
 *                 - success
 */

router.get("/clubs-manger", getClubMangerClubs);


module.exports = router;
