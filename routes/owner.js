const router = require("express").Router();
const imgUploader = require("../middlewares/imgUploader");

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
  imgUploader.fields([{ name: "clubImg" }, { name: "logo", maxCount: 1 }]),
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
 *   patch:
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
router.patch("/refuse-order/:orderId", refuseOrder);

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
module.exports = router;