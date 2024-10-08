const router = require("express").Router();
const imgUploader = require("../middlewares/imgUploader");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const {
  addClub,
  getOrders,
  getSubClubsForSuberAdmin,
  getSuberAdminClubs,
  deleteSuperadminClub,
  getOrder,
  acceptOrder,
  refuseOrder,
  getAllTransferOrders,
  acceptTransfer,
  refuseTransfer,
  getAllTransfers,
  deleteGlobalDiscount,
  getAllGlobalDiscounts,
  getGlobalDiscountById,
  createGlobalDiscount,
  updateGlobalDiscount,
  getClubForPackages,
  getAppData,
  deleteSupportMessage,
  getSupportMessage,
  updateCommonQuestion,
  getAllCommonQuestions,
  deleteCommonQuestion,
  createCommonQuestion,
  DeterminePackageCommission,
  getPackagesCommission,
  updateAppBanner,
} = require("../controllers/owner");

/**
 * @swagger
 * /owner/add-suberadmin:
 *   post:
 *     summary: Add a new club
 *     tags:
 *       - Owner
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - lat
 *               - long
 *               - description
 *               - gender
 *               - commission
 *               - sports
 *               - mapUrl
 *               - clubImg
 *               - logo
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the club
 *               email:
 *                 type: string
 *                 description: The email of the club
 *               password:
 *                 type: string
 *                 description: The password for the club's user account
 *               lat:
 *                 type: number
 *                 description: Latitude of the club's location
 *               long:
 *                 type: number
 *                 description: Longitude of the club's location
 *               description:
 *                 type: string
 *                 description: Description of the club
 *               gender:
 *                 type: string
 *                 description: Gender specification for the club (e.g., male, female, unisex)
 *               commission:
 *                 type: number
 *                 description: Commission percentage for the club
 *               sports:
 *                 type: string
 *                 description: Comma-separated list of sports offered by the club
 *               mapUrl:
 *                 type: string
 *                 description: URL to the club's location on the map
 *               ClubAdd:
 *                 type: string
 *                 description: Optional ID of the club to be added
 *               clubMemberCode:
 *                 type: string
 *                 description: Optional code for club members
 *               clubImg:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Images of the club
 *               logo:
 *                 type: string
 *                 format: binary
 *                 description: Logo of the club
 *     responses:
 *       201:
 *         description: Club successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 club:
 *                   $ref: '#/components/schemas/Club'
 *       404:
 *         description: Location not found
 *       409:
 *         description: Conflict - Either the email already exists or club images and logo are missing
 *       500:
 *         description: Server error
 */

router.post(
  "/add-suberadmin",
  upload.fields([{ name: "clubImg" }, { name: "logo", maxCount: 1 }]),
  addClub
);

/**
 * @swagger
 * /owner/get-subs/{suberadminId}:
 *   get:
 *     summary: Get sub-clubs of a specific club.
 *     description: Retrieves a list of sub-clubs associated with a specific club, including information about cities and subscription counts.
 *     tags:
 *       - Owner
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the club whose sub-clubs are to be retrieved.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of sub-clubs.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     cities:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: List of cities where sub-clubs are located.
 *                     subsCount:
 *                       type: integer
 *                       description: Total number of sub-clubs.
 *                     subsSubscriptions:
 *                       type: integer
 *                       description: Total number of subscriptions for sub-clubs (currently hardcoded to 0).
 *                     clubs:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: The ID of the club.
 *                           name:
 *                             type: string
 *                             description: The name of the club.
 *                           city:
 *                             type: string
 *                             description: The city where the club is located.
 *                           description:
 *                             type: string
 *                             description: A description of the club.
 *                           gender:
 *                             type: string
 *                             description: The gender focus of the club (e.g., male, female, mixed).
 *                           lat:
 *                             type: number
 *                             format: float
 *                             description: The latitude of the club's location.
 *                           long:
 *                             type: number
 *                             format: float
 *                             description: The longitude of the club's location.
 *                           logo:
 *                             type: string
 *                             description: URL of the club logo.
 *                           images:
 *                             type: array
 *                             items:
 *                               type: string
 *                             description: URLs of the club images.
 *                           mapUrl:
 *                             type: string
 *                             description: URL of the map location.
 *                           commission:
 *                             type: number
 *                             format: float
 *                             description: The commission rate for the club.
 *                           sports:
 *                             type: array
 *                             items:
 *                               type: string
 *                             description: List of sports available at the club.
 *                           location:
 *                             type: string
 *                             description: The full location of the club.
 *                           type:
 *                             type: string
 *                             description: The type of the club (e.g., admin).
 *                           clubMemberCode:
 *                             type: string
 *                             description: The club member code.
 *       404:
 *         description: Club not found.
 *       500:
 *         description: Internal server error.
 */

router.get("/get-subs/:id", getSubClubsForSuberAdmin);

/**
 * @swagger
 * /owner/delete-superadmin/{id}:
 *   delete:
 *     summary: Delete a superadmin club and all its sub-clubs
 *     tags:
 *       - Owner
 *     description: Deletes a superadmin club by its ID along with all associated sub-clubs.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the superadmin club to delete
 *     responses:
 *       200:
 *         description: Superadmin club and all its sub-clubs deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Superadmin club and all its sub-clubs deleted successfully
 *       400:
 *         description: The specified club is not a superadmin club
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: The specified club is not a superadmin club
 *       404:
 *         description: Superadmin club not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Superadmin Club not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.delete("/delete-superadmin/:id", deleteSuperadminClub);

/**
 * @swagger
 * /owner/get-suberadmin-clubs:
 *   get:
 *     summary: Get all clubs associated with suberadmin
 *     tags:
 *       - Owner
 *     responses:
 *       200:
 *         description: Successfully retrieved all suberadmin clubs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     cities:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: List of cities where suberadmin clubs are located
 *                     subsCount:
 *                       type: integer
 *                       description: Total number of suberadmin clubs
 *                     subsSubscriptions:
 *                       type: integer
 *                       description: Total number of subscriptions for suberadmin clubs
 *                     clubs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Club'
 *       500:
 *         description: Server error
 */
router.get("/get-suberadmin-clubs", getSuberAdminClubs);

/**
 * @swagger
 * /owner/get-orders:
 *   get:
 *     summary: Get sub-clubs of a specific club.
 *     description: Retrieves a list of sub-clubs associated with a specific club, including information about cities and subscription counts.
 *     tags:
 *       - Owner
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the club whose sub-clubs are to be retrieved.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 */

router.get("/get-orders", getOrders);

/**
 * @swagger
 * /owner/get-order/{orderId}:
 *   get:
 *     summary: Get a single order by ID
 *     tags:
 *       - Owner
 *     parameters:
 *       - name: orderId
 *         in: path
 *         required: true
 *         description: The ID of the order to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the order
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.get("/get-order/:orderId", getOrder);

/**
 * @swagger
 * /owner/accept-order/{orderId}:
 *   post:
 *     summary: Accept an order and create a new club
 *     tags:
 *       - Owner
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the order to accept
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: The message to include in the acceptance email
 *     responses:
 *       200:
 *         description: Order accepted and club created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Order accepted and club created"
 *                 club:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "605c72efb20c8e23f81e0b1f"
 *                     name:
 *                       type: string
 *                       example: "Fit Club"
 *                     # Add other properties of the club model as needed
 *       400:
 *         description: Bad request, club with this email already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "A club with this email already exists"
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Order not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
router.post("/accept-order/:orderId", acceptOrder);

/**
 * @swagger
 * /owner/refuse-order/{orderId}:
 *   post:
 *     summary: Refuse an order and notify the user via email
 *     tags:
 *       - Owner
 *     parameters:
 *       - name: orderId
 *         in: path
 *         required: true
 *         description: The ID of the order to refuse
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully refused the order and sent the email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Order refused and email sent"
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Order not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An unexpected error occurred"
 */
router.post("/refuse-order/:orderId", refuseOrder);

/**
 * @swagger
 * /owner/transfer-orders:
 *   get:
 *     summary: Retrieve all transfer orders
 *     description: Fetches a list of all transfer orders in the system.
 *     tags:
 *       - Owner
 *     responses:
 *       200:
 *         description: A list of transfer orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: The unique ID of the transfer order
 *                         example: 64f85e87e69bdf1a479efc12
 *                       amount:
 *                         type: number
 *                         description: The transfer amount
 *                         example: 500
 *                       transferCause:
 *                         type: string
 *                         description: The reason for the transfer
 *                         example: Payment for services
 *                       iban:
 *                         type: string
 *                         description: The IBAN linked to the bank account
 *                         example: GB33BUKB20201555555555
 *                       ownerName:
 *                         type: string
 *                         description: The name of the bank account owner
 *                         example: John Doe
 *                       club:
 *                         type: string
 *                         description: The ID of the club related to the transfer
 *                         example: 64f85b96e69bdf1a479efc11
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-09-04T14:48:00.000Z
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-09-04T14:48:00.000Z
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error
 */
router.get("/transfer-orders", getAllTransferOrders);

/**
 * @swagger
 * /owner/transfers:
 *   get:
 *     summary: Retrieve all transfer orders
 *     description: Fetches a list of all transfer orders in the system.
 *     tags:
 *       - Owner
 *     responses:
 *       200:
 *         description: A list of transfer orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: The unique ID of the transfer order
 *                         example: 64f85e87e69bdf1a479efc12
 *                       amount:
 *                         type: number
 *                         description: The transfer amount
 *                         example: 500
 *                       transferCause:
 *                         type: string
 *                         description: The reason for the transfer
 *                         example: Payment for services
 *                       iban:
 *                         type: string
 *                         description: The IBAN linked to the bank account
 *                         example: GB33BUKB20201555555555
 *                       ownerName:
 *                         type: string
 *                         description: The name of the bank account owner
 *                         example: John Doe
 *                       club:
 *                         type: string
 *                         description: The ID of the club related to the transfer
 *                         example: 64f85b96e69bdf1a479efc11
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-09-04T14:48:00.000Z
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-09-04T14:48:00.000Z
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error
 */
router.get("/transfers", getAllTransfers);
/**
 * @swagger
 * /owner/accept-transfer-order/{id}:
 *   post:
 *     summary: Accept a transfer order
 *     description: Uploads a PDF, accepts the transfer, and removes the original transfer order.
 *     tags:
 *       - Owner
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the transfer order to be accepted
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 1000
 *               pdf:
 *                 type: string
 *                 format: binary
 *                 description: The PDF file to be uploaded
 *     responses:
 *       200:
 *         description: Transfer successfully accepted and saved
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
 *                     _id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c85"
 *                     amount:
 *                       type: number
 *                       example: 1000
 *                     pdf:
 *                       type: string
 *                       example: "https://res.cloudinary.com/demo/image/upload/v1609459200/sample.pdf"
 *                     status:
 *                       type: string
 *                       example: "accepted"
 *                     club:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c85"
 *       400:
 *         description: Bad request, e.g., no PDF provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Please provide a PDF"
 *       404:
 *         description: Transfer order not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Transfer order not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error processing transfer"
 */

router.post(
  "/accept-transfer-order/:id",
  imgUploader.single("pdf"),
  acceptTransfer
);

/**
 * @swagger
 * /owner/refuse-transfer-order/{id}:
 *   post:
 *     summary: Refuse a transfer order
 *     description: Marks a transfer order as refused and provides a reason for refusal.
 *     tags:
 *       - Owner
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the transfer order to be refused
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refusedReason:
 *                 type: string
 *                 example: "Missing required documents"
 *                 description: Reason for refusing the transfer order
 *     responses:
 *       200:
 *         description: Transfer successfully refused and saved
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
 *                     _id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c85"
 *                     amount:
 *                       type: number
 *                       example: 1000
 *                     refusedReason:
 *                       type: string
 *                       example: "Missing required documents"
 *                     status:
 *                       type: string
 *                       example: "rejected"
 *                     club:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c85"
 *       400:
 *         description: Bad request, e.g., no refusal reason provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Please provide a refusal reason"
 *       404:
 *         description: Transfer order not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Transfer order not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error processing refusal"
 */

router.post("/refuse-transfer-order/:id", refuseTransfer);

/**
 * @swagger
 * /owner/discounts/:
 *   get:
 *     summary: Get all global discount codes
 *     description: Fetch all discount codes that are global (applicable to all clubs).
 *     tags:
 *       - Owner
 *     responses:
 *       200:
 *         description: Successfully retrieved all global discount codes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: number
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "60d21b4667d0d8992e610c85"
 *                       code:
 *                         type: string
 *                         example: "SUMMER20"
 *                       discountPercentage:
 *                         type: number
 *                         example: 20
 *                       validFrom:
 *                         type: string
 *                         example: "2023-01-01T00:00:00Z"
 *                       validTo:
 *                         type: string
 *                         example: "2023-12-31T23:59:59Z"
 *                       global:
 *                         type: boolean
 *                         example: true
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error fetching global discounts"
 */
router.get("/discounts/", getAllGlobalDiscounts);

/**
 * @swagger
 * /owner/discounts/{id}:
 *   get:
 *     summary: Get a specific global discount code by ID
 *     description: Fetch a single global discount code by its ID.
 *     tags:
 *       - Owner
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the global discount code
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the global discount code
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
 *                     _id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c85"
 *                     code:
 *                       type: string
 *                       example: "SUMMER20"
 *                     discountPercentage:
 *                       type: number
 *                       example: 20
 *                     validFrom:
 *                       type: string
 *                       example: "2023-01-01T00:00:00Z"
 *                     validTo:
 *                       type: string
 *                       example: "2023-12-31T23:59:59Z"
 *                     global:
 *                       type: boolean
 *                       example: true
 *       404:
 *         description: Global discount code not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Global discount code not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error fetching global discount"
 */
router.get("/discounts/:id", getGlobalDiscountById);

/**
 * @swagger
 * /owner/create-discount:
 *   post:
 *     summary: Create a new global discount code
 *     description: Owner creates a discount code that is applicable to all clubs.
 *     tags:
 *       - Owner
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - discountPercentage
 *             properties:
 *               code:
 *                 type: string
 *                 example: "WINTER25"
 *               discountPercentage:
 *                 type: number
 *                 example: 25
 *               validFrom:
 *                 type: string
 *                 example: "2023-11-01T00:00:00Z"
 *               validTo:
 *                 type: string
 *                 example: "2024-01-31T23:59:59Z"
 *     responses:
 *       201:
 *         description: Successfully created the global discount code
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
 *                     _id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c85"
 *                     code:
 *                       type: string
 *                       example: "WINTER25"
 *                     discountPercentage:
 *                       type: number
 *                       example: 25
 *                     validFrom:
 *                       type: string
 *                       example: "2023-11-01T00:00:00Z"
 *                     validTo:
 *                       type: string
 *                       example: "2024-01-31T23:59:59Z"
 *                     global:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Code and discount percentage are required"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error creating global discount"
 */
router.post("/create-discount", createGlobalDiscount);

/**
 * @swagger
 * /owner/update-discount/{id}:
 *   put:
 *     summary: Update a global discount code
 *     description: Modify the details of an existing global discount code by its ID.
 *     tags:
 *       - Owner
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the global discount code to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 example: "WINTER25"
 *               discountPercentage:
 *                 type: number
 *                 example: 25
 *               validFrom:
 *                 type: string
 *                 example: "2023-11-01T00:00:00Z"
 *               validTo:
 *                 type: string
 *                 example: "2024-01-31T23:59:59Z"
 *     responses:
 *       200:
 *         description: Successfully updated the global discount code
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
 *                     _id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c85"
 *                     code:
 *                       type: string
 *                       example: "WINTER25"
 *                     discountPercentage:
 *                       type: number
 *                       example: 25
 *                     validFrom:
 *                       type: string
 *                       example: "2023-11-01T00:00:00Z"
 *                     validTo:
 *                       type: string
 *                       example: "2024-01-31T23:59:59Z"
 *                     global:
 *                       type: boolean
 *                       example: true
 *       404:
 *         description: Global discount code not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Global discount code not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error updating global discount"
 */

router.put("/update-discount/:id", updateGlobalDiscount);

/**
 * @swagger
 * /owner/delete-discount/{id}:
 *   delete:
 *     summary: Delete a global discount code
 *     description: Remove a global discount code by its ID.
 *     tags:
 *       - Owner
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the global discount code to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully deleted the global discount code
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Global discount code successfully deleted"
 *       404:
 *         description: Global discount code not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Global discount code not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error deleting global discount"
 */
router.delete("/delete-discount/:id", deleteGlobalDiscount);

/**
 * @swagger
 * /owner/get_clubs_for_packages/{sportsType}:
 *   get:
 *     summary: Get package and subscription details for all clubs
 *     description: Retrieve the number of subscriptions and packages (paddle, yoga, weight fitness, and another) for each club.
 *     tags:
 *       - Owner
 *     responses:
 *       200:
 *         description: Success - returns an array with club details including package and subscription counts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   club:
 *                     type: string
 *                     description: Name of the club
 *                     example: "Fitness Club"
 *                   subscriptionCount:
 *                     type: integer
 *                     description: Number of active subscriptions for the club
 *                     example: 120
 *                   type:
 *                     type: string
 *                     description: Type of club (e.g., gym, yoga studio, etc.)
 *                     example: "gym"
 *                   packagesCount:
 *                     type: integer
 *                     description: Total number of packages (paddle, yoga, weight fitness, and another) offered by the club
 *                     example: 15
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message explaining the failure
 *                   example: "Internal server error."
 */
router.get("/get_clubs_for_packages/:sport", getClubForPackages);

/**
 * @swagger
 * /owner/get-appData:
 *   get:
 *     summary: Get app data
 *     description: Retrieve The app Data
 *     tags:
 *       - Owner
 *     responses:
 *       200:
 */
router.get("/get-appData", getAppData);

/**
 * @swagger
 * /owner/delete-support-message{id}:
 *   delete:
 *     summary: Delete a Paddle package by ID
 *     tags:
 *       - Owner
 *     description: Deletes the Paddle package with the specified ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the Paddle package to delete
 *     responses:
 *       200:
 *         description: Paddle package deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Paddle package deleted successfully"
 *       404:
 *         description: Paddle package not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Paddle package not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
router.delete("/delete-support-message/:id", deleteSupportMessage);
/**
 * @swagger
 * /owner/get-support-messages:
 *   get:
 *     summary: Retrieve all support messages
 *     tags:
 *       - Owner
 *     description: Fetches all support messages from the database.
 *     responses:
 *       200:
 *         description: Successfully retrieved all support messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "607f1f77bcf86cd799439011"
 *                       name:
 *                         type: string
 *                         example: "John Doe"
 *                       email:
 *                         type: string
 *                         example: "johndoe@example.com"
 *                       message:
 *                         type: string
 *                         example: "I need help with my account."
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2023-09-30T12:34:56.789Z"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *
 */
router.get("/get-support-messages", getSupportMessage);

/**
 * @swagger
 * /owner/create-common-question:
 *   post:
 *     summary: Create a new common question
 *     tags:
 *       - Owner
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *                 example: "What is the refund policy?"
 *               answer:
 *                 type: string
 *                 example: "Our refund policy is..."
 *     responses:
 *       201:
 *         description: Common question created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/CommonQuestions'
 *       500:
 *         description: Server error
 */
router.post("/create-common-question", createCommonQuestion);

/**
 * @swagger
 * /owner/update-common-question/{id}:
 *   put:
 *     summary: Update an existing common question
 *     tags:
 *       - Owner
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "60c72b2f9fd99b34d8e8fcb3"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *                 example: "What is the updated refund policy?"
 *               answer:
 *                 type: string
 *                 example: "Our updated refund policy is..."
 *     responses:
 *       200:
 *         description: Common question updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/CommonQuestions'
 *       404:
 *         description: Common question not found
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
 *                   example: "Common question not found"
 *       500:
 *         description: Server error
 */
router.put("/update-common-question/:id", updateCommonQuestion);

/**
 * @swagger
 * /owner/get-all-questions:
 *   get:
 *     summary: Get all common questions
 *     tags:
 *       - Owner
 *     responses:
 *       200:
 *         description: Successfully retrieved all common questions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CommonQuestions'
 *       500:
 *         description: Server error
 */
router.get("/get-all-questions", getAllCommonQuestions);

/**
 * @swagger
 * /owner/delete-common-question/{id}:
 *   delete:
 *     summary: Delete a common question by ID
 *     tags:
 *       - Owner
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "60c72b2f9fd99b34d8e8fcb3"
 *     responses:
 *       200:
 *         description: Common question deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Common question deleted successfully"
 *       404:
 *         description: Common question not found
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
 *                   example: "Common question not found"
 *       500:
 *         description: Server error
 */
router.delete("/delete-common-question/:id", deleteCommonQuestion);

/**
 * @swagger
 * /owner/update-commission-package:
 *   post:
 *     summary: Update the commission for different types of fitness packages
 *     description: This endpoint allows the admin to update the commission for different package types such as weight fitness, yoga, paddle, and others.
 *     tags:
 *       - Owner
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - commission
 *               - type
 *             properties:
 *               commission:
 *                 type: number
 *                 example: 5.5
 *                 description: The new commission rate to be applied to the packages.
 *               type:
 *                 type: string
 *                 enum: [weight, yoga, paddle, another]
 *                 example: "weight"
 *                 description: The type of packages for which the commission will be updated.
 *     responses:
 *       200:
 *         description: Commission updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Commission updated successfully for weight packages.
 *       400:
 *         description: Bad request, missing fields or invalid package type.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Missing commission or type.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error.
 *                 error:
 *                   type: object
 *                   description: Details about the server error.
 */
router.post("/update-commission-package", DeterminePackageCommission);

/**
 * @swagger
 * /owner/get-commission-packages:
 *   get:
 *     summary: Get all Packages Commission and Yoga Type
 *     description: This endpoint allows the admin to update the commission for different package types such as weight fitness, yoga, paddle, and others.
 *     tags:
 *       - Owner
 */

router.get("/get-commission-packages", getPackagesCommission);

/**
 * @swagger
 * /owner/update-app-banners:
 *   post:
 *     summary: Upload and update app banners
 *     description: This endpoint allows the admin to upload and update the banners for the app. Images are uploaded to Cloudinary, and the URLs are saved in the app settings.
 *     tags:
 *       - Owner
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               banners:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Array of image files to be uploaded as app banners.
 *     responses:
 *       200:
 *         description: App banners uploaded and updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: [
 *                     "https://cloudinary.com/example1.jpg",
 *                     "https://cloudinary.com/example2.jpg"
 *                   ]
 *       400:
 *         description: No banners provided in the request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Please Add AppBanners"
 *       409:
 *         description: Conflict or validation error in processing banners.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Please Add AppBanners"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error.
 *                 error:
 *                   type: object
 *                   description: Details about the server error.
 */

router.post(
  "/update-app-banners",
  upload.fields([{ name: "banners" }]),
  updateAppBanner
);
module.exports = router;
