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
} = require("../controllers/user");
const router = require("express").Router();
const verifyToken = require("../middlewares/verifyToken");
const upload = require("../middlewares/upload");
const imgUploader = require("../middlewares/imgUploader");

/**
 * @swagger
 * /user/clubs:
 *   get:
 *     summary: Retrieve clubs with daily packages
 *     description: Fetches clubs that offer daily subscription packages, along with optional filtering based on geographic coordinates (latitude and longitude). If `lat` and `long` are provided, the distance from the user's location to each club will be calculated.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lat:
 *                 type: number
 *                 description: Latitude of the user's current location.
 *               long:
 *                 type: number
 *                 description: Longitude of the user's current location.
 *     responses:
 *       200:
 *         description: A list of clubs with daily packages, optionally filtered by distance.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Clubs:
 *                   type: array
 *                   description: List of clubs with daily packages.
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: Club ID.
 *                       name:
 *                         type: string
 *                         description: Club name.
 *                       country:
 *                         type: string
 *                         description: Club's country.
 *                       city:
 *                         type: string
 *                         description: Club's city.
 *                       distance:
 *                         type: number
 *                         description: Distance between the user's location and the club (only provided if `lat` and `long` are included in the request).
 *                 countries:
 *                   type: object
 *                   additionalProperties:
 *                     type: array
 *                     description: List of cities in each country that have clubs with daily packages.
 *                     items:
 *                       type: string
 *                       description: City name.
 *       400:
 *         description: Invalid distance or missing data in request.
 *       500:
 *         description: Internal server error.
 */

router.get("/clubs", getClubs);
router.get("/minclubs", getMinClubs);
router.get("/blogs", getBlog);
router.get("/blog/:blog_id", getBlogById);
router.get("/opinions", getOpinnion);

/**
 * @swagger
 * /user/club/{club_id}:
 *   get:
 *     summary: Retrieve details of a specific club
 *     description: Fetches details of a club identified by `club_id`, including its associated yoga, paddle, weight fitness, and another activity packages. Optionally calculates the distance from the user's geographic coordinates (latitude and longitude) if provided.
 *     tags:
 *       - User
 *     parameters:
 *       - name: club_id
 *         in: path
 *         required: true
 *         description: The unique identifier of the club.
 *         schema:
 *           type: string
 *       - name: lat
 *         in: query
 *         required: false
 *         description: Latitude for distance calculation.
 *         schema:
 *           type: number
 *           format: float
 *       - name: long
 *         in: query
 *         required: false
 *         description: Longitude for distance calculation.
 *         schema:
 *           type: number
 *           format: float
 *     responses:
 *       '200':
 *         description: Successfully retrieved club details and packages.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 club:
 *                   type: object
 *                   description: The club's details.
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: The unique ID of the club.
 *                     name:
 *                       type: string
 *                       description: The name of the club.
 *                     lat:
 *                       type: number
 *                       description: Latitude of the club.
 *                     long:
 *                       type: number
 *                       description: Longitude of the club.
 *                     country:
 *                       type: string
 *                       description: The country where the club is located.
 *                     city:
 *                       type: string
 *                       description: The city where the club is located.
 *                 distance:
 *                   type: number
 *                   description: Distance from the provided latitude and longitude (only included if lat and long are provided).
 *                 packages:
 *                   type: object
 *                   properties:
 *                     yoga:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           packageName:
 *                             type: string
 *                             description: Name of the yoga package.
 *                           price:
 *                             type: number
 *                             description: Price of the yoga package.
 *                     paddle:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           packageName:
 *                             type: string
 *                             description: Name of the paddle package.
 *                           price:
 *                             type: number
 *                             description: Price of the paddle package.
 *                     weightFitness:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           packageName:
 *                             type: string
 *                             description: Name of the weight fitness package.
 *                           price:
 *                             type: number
 *                             description: Price of the weight fitness package.
 *                     anotherActivity:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           packageName:
 *                             type: string
 *                             description: Name of the activity package.
 *                           price:
 *                             type: number
 *                             description: Price of the activity package.
 *       '404':
 *         description: Club not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Club not found"
 *       '400':
 *         description: Invalid distance calculation.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid distance"
 */

router.get("/club/:club_id", getClub);
/**
 * @swagger
 * /user/club:
 *   get:
 *     summary: Search for clubs by name, city, or location
 *     description: Retrieve a list of clubs that match the search term. This endpoint searches clubs by their name, city, or location using case-insensitive matching.
 *     tags:
 *       - User
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: true
 *         description: The search term to filter clubs by name, city, or location.
 *     responses:
 *       '200':
 *         description: Successfully retrieved the list of matching clubs.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 results:
 *                   type: integer
 *                   example: 5
 *                 clubs:
 *                   type: array
 *                   description: List of clubs that match the search criteria.
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: The unique ID of the club.
 *                       name:
 *                         type: string
 *                         description: The name of the club.
 *                       city:
 *                         type: string
 *                         description: The city where the club is located.
 *                       location:
 *                         type: string
 *                         description: The location of the club.
 *                       sports:
 *                         type: array
 *                         items:
 *                           type: string
 *                         description: List of sports offered by the club.
 *       '400':
 *         description: Search query is missing or invalid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Search query is required"
 *       '404':
 *         description: No clubs found matching the search criteria.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No clubs found matching the search criteria"
 *       '500':
 *         description: Server error occurred while processing the search.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error occurred while searching for clubs"
 */

router.get("/club", searchClub);
router.get("/club_auth/:club_id", verifyToken, getClubAuth);

/**
 * @swagger
 * /user/clubs/search:
 *   post:
 *     summary: Search for clubs by name, location, gender, and sport type
 *     description: Allows users to search for clubs based on the country, city, gender, and sport type. The search will return clubs that match the provided location details or the specified sport type.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               country:
 *                 type: string
 *                 description: The country where the club is located.
 *               city:
 *                 type: string
 *                 description: The city to search for clubs in (supports partial matches).
 *               gender:
 *                 type: string
 *                 description: The gender restriction for the club (if applicable).
 *                 enum:
 *                   - male
 *                   - female
 *                   - mixed
 *               sportType:
 *                 type: string
 *                 description: The type of sport offered by the club (e.g., "Yoga", "Paddle").
 *     responses:
 *       '200':
 *         description: Successfully retrieved the list of matching clubs.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clubs:
 *                   type: array
 *                   description: List of clubs that match the search criteria.
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: The unique ID of the club.
 *                       name:
 *                         type: string
 *                         description: The name of the club.
 *                       country:
 *                         type: string
 *                         description: The country where the club is located.
 *                       city:
 *                         type: string
 *                         description: The city where the club is located.
 *                       gender:
 *                         type: string
 *                         description: Gender restriction for the club (if any).
 *                         enum:
 *                           - male
 *                           - female
 *                           - mixed
 *                       sports:
 *                         type: array
 *                         description: List of sports offered by the club.
 *                         items:
 *                           type: string
 *       '400':
 *         description: Invalid request parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid input data"
 *       '404':
 *         description: No clubs found matching the search criteria.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No clubs found"
 */

router.post("/clubs/search", searchClubByName);
router.get("/clubs/filter", filterClubs);
router.get("/rules", getRules);
router.post("/user_reports", makeReport);
router.post("/renew_club_wallet/:subId", verifyToken, renewClubByWallet);
/**
 * @swagger
 * /user/update-location:
 *   post:
 *     summary: Update user location
 *     description: Updates the user's latitude and longitude based on the provided data.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lat
 *               - long
 *             properties:
 *               lat:
 *                 type: number
 *                 description: The latitude of the user's location.
 *                 example: 37.7749
 *               long:
 *                 type: number
 *                 description: The longitude of the user's location.
 *                 example: -122.4194
 *     responses:
 *       '200':
 *         description: Successfully updated user location.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message indicating that the location was updated.
 *                   example: "User location updated successfully"
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: The unique identifier for the user.
 *                       example: "60b8d4a3c2f5b34a8cd89c3f"
 *                     lat:
 *                       type: number
 *                       description: The updated latitude of the user.
 *                       example: 37.7749
 *                     long:
 *                       type: number
 *                       description: The updated longitude of the user.
 *                       example: -122.4194
 *       '400':
 *         description: Bad request, invalid input data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating bad request.
 *                   example: "Invalid input data"
 *       '401':
 *         description: Unauthorized, token required for authentication.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating unauthorized access.
 *                   example: "Unauthorized access"
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating internal server error.
 *                   example: "Internal Server Error"
 */

router.post("/update-location", verifyToken, updateUserLocation);

/**
 * @swagger
 * /user/clubs_by_activity:
 *   post:
 *     summary: Get clubs by specific activity (sport)
 *     description: Retrieve a list of clubs that offer a specific activity (sport) based on the filter condition provided in the request body.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               filterCondition:
 *                 type: string
 *                 description: The name of the sport/activity to filter clubs by.
 *                 example: "Yoga"
 *     responses:
 *       '200':
 *         description: Successfully retrieved the list of clubs offering the specified activity.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: array
 *                   description: List of clubs offering the specified activity.
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: The unique ID of the club.
 *                       name:
 *                         type: string
 *                         description: The name of the club.
 *                       sports:
 *                         type: array
 *                         description: List of sports offered by the club.
 *                         items:
 *                           type: string
 *                       city:
 *                         type: string
 *                         description: The city where the club is located.
 *       '400':
 *         description: Bad request. Required filterCondition missing or invalid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "filterCondition is required"
 *       '500':
 *         description: Server error occurred while retrieving clubs.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error occurred while retrieving clubs"
 */

router.post("/clubs_by_activity", getClubByActivity);
// this wallet depost is deprecated and doesn't use real payments

/**
 * @swagger
 * /user/wallet_deposit:
 *   post:
 *     summary: Deposit an amount into the user's wallet
 *     description: Allows a user to deposit a specified amount into their wallet and logs the transaction.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - brand
 *             properties:
 *               amount:
 *                 type: number
 *                 description: The amount to deposit into the user's wallet.
 *                 example: 100
 *               brand:
 *                 type: string
 *                 description: The payment method or brand used for the deposit.
 *                 example: "Visa"
 *     responses:
 *       '200':
 *         description: Deposit successful; amount added to the user's wallet.
 *       '404':
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the user was not found.
 *                   example: "User Not Found"
 *       '400':
 *         description: Invalid request parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating invalid input.
 *                   example: "Invalid amount value"
 *       '401':
 *         description: Unauthorized, token required for authentication.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating unauthorized access.
 *                   example: "Unauthorized access"
 */

router.post("/wallet_deposit", verifyToken, walletDeposit);
router.get("/wallet", verifyToken, getUserWallet);

/**
 * @swagger
 * /user/evaluation:
 *   post:
 *     summary: Submit or update a user's evaluation for a club
 *     description: Allows a user to submit a rating for a specific club. If the user has already rated the club, their rating is updated.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clubId
 *               - rating
 *             properties:
 *               clubId:
 *                 type: string
 *                 description: The unique identifier of the club to evaluate.
 *                 example: "6123abcd4567efgh8901ijkl"
 *               rating:
 *                 type: integer
 *                 description: The rating given to the club by the user (e.g., between 1 and 5).
 *                 example: 4
 *     responses:
 *       '200':
 *         description: Rating successfully submitted or updated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the rating was processed successfully.
 *                   example: true
 *                 data:
 *                   type: object
 *                   description: Evaluation details including average rating.
 *                   properties:
 *                     evaluators:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           user:
 *                             type: string
 *                             description: The ID of the user who rated the club.
 *                             example: "5f8d0d55b54764421b7156c2"
 *                           rating:
 *                             type: integer
 *                             description: The user's rating.
 *                             example: 4
 *                     averageRating:
 *                       type: integer
 *                       description: The average rating of the club based on all evaluations.
 *                       example: 4
 *       '404':
 *         description: Club not found with the provided clubId.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates failure due to club not found.
 *                   example: false
 *                 error:
 *                   type: string
 *                   description: Error message indicating the club was not found.
 *                   example: "Club not found"
 *       '400':
 *         description: Missing or invalid parameters in the request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates failure due to missing or invalid parameters.
 *                   example: false
 *                 error:
 *                   type: string
 *                   description: Error message indicating the issue with the request.
 *                   example: "Invalid rating value"
 *       '401':
 *         description: Unauthorized, token required for authentication.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates failure due to missing or invalid token.
 *                   example: false
 *                 error:
 *                   type: string
 *                   description: Error message indicating the user needs to log in.
 *                   example: "Unauthorized access"
 */

router.post("/evaluation", verifyToken, evaluateClub);
router.get("/booking", verifyToken, userBooking);

/**
 * @swagger
 * /user/fav/{club_id}:
 *   post:
 *     summary: Add or remove a favorite club
 *     description: Toggles a club's favorite status for the authenticated user. If the club is already a favorite, it will be removed. Otherwise, the club will be added to the user's favorites.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: club_id
 *         in: path
 *         required: true
 *         description: The ID of the club to be added or removed from favorites.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully added or removed the club from favorites.
 *       '404':
 *         description: Club not found.
 *       '401':
 *         description: Unauthorized. User is not authenticated.
 *       '500':
 *         description: Server error.
 */

router.put("/fav/:club_id", verifyToken, addOrRemoveFav);
/**
 * @swagger
 * /user/isfav/{club_id}:
 *   get:
 *     summary: Check if a club is a favorite
 *     description: Returns a boolean indicating whether the specified club is marked as a favorite by the authenticated user.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: club_id
 *         in: path
 *         required: true
 *         description: The ID of the club to check if it is marked as favorite.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully retrieved favorite status.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isFav:
 *                   type: boolean
 *                   description: Indicates if the club is marked as favorite.
 *                   example: true
 *       '401':
 *         description: Unauthorized. User is not authenticated.
 *       '404':
 *         description: Club not found.
 *       '500':
 *         description: Server error.
 */

router.get("/isfav/:club_id", verifyToken, isFav);

/**
 * @swagger
 * /user/fav:
 *   get:
 *     summary: Get user's favorite clubs
 *     description: Retrieve a list of favorite clubs for the authenticated user. Clubs are populated along with the user's home location.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved the user's favorite clubs.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   description: List of user's favorite clubs.
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: Favorite record ID.
 *                       club_id:
 *                         type: object
 *                         description: The club associated with this favorite.
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: The unique ID of the club.
 *                           name:
 *                             type: string
 *                             description: Name of the club.
 *                           location:
 *                             type: string
 *                             description: Location of the club.
 *                       user:
 *                         type: object
 *                         description: The user who marked the club as favorite.
 *                         properties:
 *                           home_location:
 *                             type: string
 *                             description: The home location of the user.
 *       '401':
 *         description: Unauthorized. User is not authenticated.
 *       '500':
 *         description: Server error.
 */

router.get("/fav", verifyToken, getUserFav);
/**
 * @swagger
 * /user/profile:
 *   get:
 *     summary: Retrieve user profile
 *     description: Fetches the profile details of the authenticated user based on the JWT token provided in the Authorization header.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved user profile.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The unique identifier of the user.
 *                   example: 615f9988b21a12c31a9f1b7a
 *                 name:
 *                   type: string
 *                   description: The user's name.
 *                   example: John Doe
 *                 email:
 *                   type: string
 *                   description: The user's email address.
 *                   example: johndoe@example.com
 *                 token:
 *                   type: string
 *                   description: The JWT token.
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       '401':
 *         description: Unauthorized. Token is missing or invalid.
 *       '404':
 *         description: User not found.
 *       '500':
 *         description: Server error.
 */

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

/**
 * @swagger
 * /user/profile:
 *   patch:
 *     summary: Update user profile
 *     description: Updates the profile of the authenticated user. Fields that are not provided will not be updated.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username of the user.
 *                 example: johndoe
 *               home_location:
 *                 type: string
 *                 description: The home location of the user.
 *                 example: "New York, NY"
 *               phone:
 *                 type: string
 *                 description: The phone number of the user.
 *                 example: "+1234567890"
 *               email:
 *                 type: string
 *                 description: The email address of the user.
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 description: The password of the user.
 *                 example: "newpassword123"
 *               gender:
 *                 type: string
 *                 description: The gender of the user.
 *                 example: "Male"
 *               role:
 *                 type: string
 *                 description: The role of the user.
 *                 example: "admin"
 *     responses:
 *       '200':
 *         description: Successfully updated the user profile.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The unique identifier of the user.
 *                   example: 615f9988b21a12c31a9f1b7a
 *                 username:
 *                   type: string
 *                   description: The updated username of the user.
 *                   example: johndoe
 *                 home_location:
 *                   type: string
 *                   description: The updated home location of the user.
 *                   example: "New York, NY"
 *                 phone:
 *                   type: string
 *                   description: The updated phone number of the user.
 *                   example: "+1234567890"
 *                 email:
 *                   type: string
 *                   description: The updated email address of the user.
 *                   example: johndoe@example.com
 *                 gender:
 *                   type: string
 *                   description: The updated gender of the user.
 *                   example: "Male"
 *                 role:
 *                   type: string
 *                   description: The updated role of the user.
 *                   example: "admin"
 *       '400':
 *         description: Bad request. Validation errors or missing fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         description: Error message.
 *                         example: "Username is required."
 *       '404':
 *         description: User not found.
 *       '500':
 *         description: Server error.
 */

router.patch(
  "/profile",
  [verifyToken, imgUploader.fields([{ name: "photo", maxCount: 1 }])],
  updateProfile
);

/**
 * @swagger
 * /subscription_confirmation:
 *   post:
 *     summary: Confirm a user's subscription
 *     description: Confirms the user's subscription, deducts the appropriate amount, and updates the user subscription data.
 *     tags:
 *       - Subscription
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - packageId
 *               - packageType
 *               - userId
 *               - clubId
 *             properties:
 *               packageId:
 *                 type: string
 *                 description: The ID of the subscription package.
 *                 example: "60a1b1b9d77e1e001fbd5a99"
 *               packageType:
 *                 type: string
 *                 description: The type of the subscription package (e.g., weightFitness).
 *                 example: "weightFitness"
 *               userId:
 *                 type: string
 *                 description: The ID of the user subscribing.
 *                 example: "60a1b1b9d77e1e001fbd5a98"
 *               clubId:
 *                 type: string
 *                 description: The ID of the club to which the user is subscribing.
 *                 example: "60a1b1b9d77e1e001fbd5a97"
 *     responses:
 *       '200':
 *         description: Subscription confirmed and user operation logged successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message indicating the subscription was successful.
 *                   example: "Subscription created successfully"
 *                 subscription:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: string
 *                       description: User ID of the subscriber.
 *                       example: "60a1b1b9d77e1e001fbd5a98"
 *                     club:
 *                       type: string
 *                       description: Club ID the user is subscribed to.
 *                       example: "60a1b1b9d77e1e001fbd5a97"
 *                     start_date:
 *                       type: string
 *                       format: date-time
 *                       description: Subscription start date.
 *                       example: "2024-11-27T12:00:00Z"
 *                     end_date:
 *                       type: string
 *                       format: date-time
 *                       description: Subscription end date.
 *                       example: "2025-11-27T12:00:00Z"
 *                     packageType:
 *                       type: string
 *                       description: Type of subscription package (e.g., weightFitness).
 *                       example: "weightFitness"
 *                     code:
 *                       type: number
 *                       description: Unique subscription code.
 *                       example: 123456
 *       '400':
 *         description: Invalid package type or missing required data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating invalid package type or missing data.
 *                   example: "Invalid package type or missing required data"
 *       '404':
 *         description: User or club not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the user or club was not found.
 *                   example: "User not found"
 *       '401':
 *         description: Unauthorized, token required for authentication.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating unauthorized access.
 *                   example: "Unauthorized access"
 */
router.post(
  "/subscription_confirmation",
  verifyToken,
  subscriptionConfirmation
);


router.post("/wallet", depositWallet);



router.post("/pay_wallet", verifyToken, walletDiscountSubscription);
router.post("/check-pay/:paymentId/:subId", verifyToken, checkPayment);

/**
 * @swagger
 * /user/check-pay-new/{paymentId}:
 *   post:
 *     summary: Check the status of a payment.
 *     description: Retrieves the status of a payment for a specific brand and payment ID.
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the payment to check.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               brand:
 *                 type: string
 *                 description: The brand associated with the payment (e.g., VISA, MasterCard).
 *                 example: "VISA"
 *     responses:
 *       200:
 *         description: Payment status retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   description: The status of the payment (e.g., pending, successful).
 *                   example: "successful"
 *                 result:
 *                   type: object
 *                   description: Detailed result of the payment status.
 *       400:
 *         description: Bad request - missing or invalid parameters (e.g., brand is required).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *                   example: "brand is required"
 *       422:
 *         description: Unprocessable entity - payment status could not be retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   description: Payment status.
 *                   example: "cancel"
 *       500:
 *         description: Internal server error.
 */

router.post("/check-pay-new/:paymentId", verifyToken, checkPaymentNew);
router.post("/wallet_confirm", verifyToken, confirmDeposit);
router.post("/make_sub/:subId", verifyToken, userMakeSub);
router.post("/confirm_payment/:subId", verifyToken, confirmPayment);

/**
 * @swagger
 * /user/pay-visa:
 *   post:
 *     summary: Process a checkout request.
 *     description: Initiates a payment checkout for a given brand and price.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               price:
 *                 type: number
 *                 description: The amount to be processed.
 *                 example: 100.5
 *               brand:
 *                 type: string
 *                 description: The brand for which the payment is being processed.
 *                 example: "VISA"
 *     responses:
 *       200:
 *         description: Checkout successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *                   description: Status of the checkout process.
 *                   example: "success"
 *                 transactionId:
 *                   type: string
 *                   description: Unique transaction identifier.
 *                   example: "1234567890"
 *                 redirectUrl:
 *                   type: string
 *                   description: URL for redirecting the user for further processing.
 *                   example: "https://paymentgateway.com/redirect/12345"
 *       400:
 *         description: Bad request - missing or invalid parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *                   example: "brand is required"
 *       500:
 *         description: Internal server error.
 */

router.post("/pay-visa", verifyToken, hyperCheckout);
router.get("/activities", GetActivities);
/**
 * @swagger
 * /user/filter_by_subscriptionType:
 *   post:
 *     summary: Filter clubs by subscription type
 *     description: Retrieves clubs that have packages of the specified subscription type.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subscriptionType
 *             properties:
 *               subscriptionType:
 *                 type: string
 *                 description: The type of subscription to filter clubs by. Can be one of "weightFitness", "paddle", "yoga", or "another".
 *                 example: "yoga"
 *     responses:
 *       '200':
 *         description: Successfully retrieved clubs with the specified subscription type.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Clubs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: The unique identifier for the club.
 *                         example: "60b8d4a3c2f5b34a8cd89c3f"
 *                       name:
 *                         type: string
 *                         description: The name of the club.
 *                         example: "Fitness Club"
 *                       location:
 *                         type: string
 *                         description: The location of the club.
 *                         example: "123 Fitness St, City"
 *       '400':
 *         description: Bad request, subscription type is required.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating that the subscription type is required.
 *                   example: "Subscription type is required"
 *       '401':
 *         description: Unauthorized, token required for authentication.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating unauthorized access.
 *                   example: "Unauthorized access"
 */

router.post("/filter_by_subscriptionType", filterClubsBySubscriptionType);

/**
 * @swagger
 * /user/forget_password:
 *   post:
 *     summary: Request password reset via OTP
 *     description: Allows a user to request a password reset by generating a one-time password (OTP) and sending it to their email.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email address associated with the user's account.
 *                 example: johndoe@example.com
 *     responses:
 *       '200':
 *         description: OTP sent to the user's email successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                   example: "OTP sent"
 *                 success:
 *                   type: boolean
 *                   description: Indicates whether the OTP was sent successfully.
 *                   example: true
 *                 code:
 *                   type: integer
 *                   description: The OTP code generated for password reset.
 *                   example: 1234
 *       '404':
 *         description: User not found with the provided email.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating that the user was not found.
 *                   example: "User not found"
 *       '500':
 *         description: Server error occurred while sending OTP.
 */

router.post("/forget_password", forgetPassowrd);
// router.post(
//   "/club_order",
//   imgUploader.fields([{ name: "clubImg" }, { name: "logo", maxCount: 1 }]),
//   AddClubOrder
// );
// router.get("/club_order", getOrderClubs);
// router.post("/get_club_order", getOrderClub);
// router.post(
//   "/add_order_data",
//   imgUploader.fields([{ name: "clubImg" }, { name: "logo", maxCount: 1 }]),
//   AddOrderClub
// );

/**
 * @swagger
 * /user/reset_password:
 *   post:
 *     summary: Reset user password
 *     description: Allows a user to reset their password using a one-time password (OTP) sent to their email.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email address of the user.
 *                 example: johndoe@example.com
 *               code:
 *                 type: integer
 *                 description: The one-time password (OTP) sent to the user's email.
 *                 example: 123456
 *               password:
 *                 type: string
 *                 description: The new password to be set for the user. Must be at least 6 characters long.
 *                 example: newpassword123
 *     responses:
 *       '200':
 *         description: Password reset successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                   example: "Password reset successful"
 *                 success:
 *                   type: boolean
 *                   description: Indicates whether the operation was successful.
 *                   example: true
 *       '404':
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *                   example: "User not found"
 *                 success:
 *                   type: boolean
 *                   description: Indicates whether the operation was successful.
 *                   example: false
 *       '400':
 *         description: Password is too short (less than 6 characters).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: "Password should be at least 6 characters"
 *                 success:
 *                   type: boolean
 *                   description: Indicates whether the operation was successful.
 *                   example: false
 *       '500':
 *         description: Server error.
 */

router.post("/reset_password", resetPassowrd);
module.exports = router;
