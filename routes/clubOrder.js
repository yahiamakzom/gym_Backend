const router = require("express").Router(); 
const imgUploader = require("../middlewares/imgUploader");

const {addClubOrder} = require("../controllers/clubOrder");
/**
 * @swagger
 * /orders/add-club-order:
 *   post:
 *     summary: Add a new club order
 *     description: Uploads club images and logo, retrieves location information, and creates a new club order in the system.
 *     tags:
 *       - Club Orders
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       description: Form data containing the club's details, images, and logo.
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the club.
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address of the club.
 *               password:
 *                 type: string
 *                 format: password
 *                 description: The password for the club's account.
 *               lat:
 *                 type: string
 *                 description: Latitude of the club's location.
 *               long:
 *                 type: string
 *                 description: Longitude of the club's location.
 *               description:
 *                 type: string
 *                 description: Description of the club.
 *               gender:
 *                 type: string
 *                 enum: [male, female, mixed]
 *                 description: The gender specification of the club (e.g., male, female, mixed).
 *               commission:
 *                 type: number
 *                 description: The commission percentage for the club.
 *               sports:
 *                 type: string
 *                 description: A comma-separated list of sports available at the club.
 *               mapUrl:
 *                 type: string
 *                 description: The URL to the club's map location.
 *               clubMemberCode:
 *                 type: string
 *                 description: A unique code for club members.
 *               clubImg:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Images of the club.
 *               logo:
 *                 type: string
 *                 format: binary
 *                 description: The club's logo image.
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
 *     responses:
 *       201:
 *         description: Club order created successfully
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
 *                   description: The details of the created club order.
 *       400:
 *         description: Bad Request - Missing required fields or images
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
 *                   example: Please provide all required fields and images
 *       404:
 *         description: Location not found
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
 *                   example: Location Not Found
 *       409:
 *         description: Conflict - Club with this email already exists or missing images
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
 *                   example: Club With This Email Already Exists
 *       500:
 *         description: Internal Server Error
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
 *                   example: حدث خطأ في الخادم
 */

router.post(
  "/add-club-order",
  imgUploader.fields([{ name: "clubImg" }, { name: "logo", maxCount: 1 }]),
  addClubOrder
); 


module.exports = router