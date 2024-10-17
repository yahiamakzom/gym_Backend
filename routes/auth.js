const router = require("express").Router();

const {
  Login,
  Register,
  // ClubLogin,
  // ClubMemberLogin,
  LoginControlPanel,
} = require("../controllers/auth");

const {
  LoginValidator,
  RegisterValidator,
} = require("../utils/validators/auth");

router.post("/login", LoginValidator, Login); 

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Register a new user by providing user details such as email, username, phone, password, and other optional information like location and gender. It also returns a JWT token upon successful registration.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - phone
 *               - password
 *               - email
 *               - role
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               phone:
 *                 type: string
 *                 example: "1234567890"
 *               password:
 *                 type: string
 *                 example: StrongPassword123
 *               role:
 *                 type: string
 *                 example: user
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 example: male
 *               home_location:
 *                 type: string
 *                 example: 123 Main St, Springfield
 *               lat:
 *                 type: number
 *                 example: 37.7749
 *               long:
 *                 type: number
 *                 example: -122.4194
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 61234abcde56789fghij1234
 *                     email:
 *                       type: string
 *                       example: johndoe@example.com
 *                     username:
 *                       type: string
 *                       example: johndoe
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
 *       409:
 *         description: Email or phone already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Email Or Phone Already Exists
 *       400:
 *         description: Bad Request - Invalid or missing fields
 *       500:
 *         description: Internal Server Error
 */

router.post("/register", RegisterValidator, Register);
// router.post("/club-login", ClubLogin);
// router.post("/club-member", ClubMemberLogin);

// controle panel

/**
 * @swagger
 * auth/control_panel_login:
 *   post:
 *     summary: Login to the control panel
 *     description: Authenticates a user with email and password, then retrieves the club and its sub-clubs associated with the user.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email of the user.
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 description: The password of the user.
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Successfully authenticated and retrieved club data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the login was successful.
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: A success message.
 *                   example: "Login successful"
 *                 data:
 *                   type: array
 *                   description: List of sub-clubs associated with the user's club.
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: The ID of the sub-club.
 *                         example: "60c72b2f9b7f4a5f3c8b4567"
 *                       name:
 *                         type: string
 *                         description: The name of the sub-club.
 *                         example: "Sub Club Name"
 *                       type:
 *                         type: string
 *                         description: The type of the sub-club (admin, superadmin).
 *                         example: "admin"
 *                       gender:
 *                         type: string
 *                         description: The gender focus of the sub-club.
 *                         example: "both"
 *                       city:
 *                         type: string
 *                         description: The city where the sub-club is located.
 *                         example: "New York"
 *                       country:
 *                         type: string
 *                         description: The country where the sub-club is located.
 *                         example: "USA"
 *                       description:
 *                         type: string
 *                         description: A description of the sub-club.
 *                         example: "A great place for all sports enthusiasts."
 *       400:
 *         description: Invalid password.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating an invalid password.
 *                   example: "Invalid password"
 *                 success:
 *                   type: boolean
 *                   description: Indicates the failure of the request.
 *                   example: false
 *       404:
 *         description: User not found or Club not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating user or club not found.
 *                   example: "User not found"
 *                 success:
 *                   type: boolean
 *                   description: Indicates the failure of the request.
 *                   example: false
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating server error.
 *                   example: "Internal Server Error"
 *                 success:
 *                   type: boolean
 *                   description: Indicates the failure of the request.
 *                   example: false
 */

router.post("/control_panel_login", LoginValidator, LoginControlPanel);

module.exports = router;
