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
