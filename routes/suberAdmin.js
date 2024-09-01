const router = require("express").Router();
const imgUploader = require("../middlewares/imgUploader");

const {
  addSubClub,
  getSubClubs,
  deleteSubClub,
  getSubClub,
  editSubClub,
  addDiscount,
  deleteDiscount
} = require("../controllers/suberAdmin");

/**
 * @swagger
 * suberadmin/add-sub:
 *   post:
 *     summary: Add a new sub-club
 *     description: Creates a new sub-club under a specified admin club. Requires image uploads for club images and a logo.
 *     tags:
 *       - Suber Admin
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               suberAdminId:
 *                 type: string
 *                 description: The ID of the super admin club.
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
 *               commission:
 *                 type: number
 *                 format: float
 *                 description: The commission rate for the sub-club.
 *               sports:
 *                 type: string
 *                 description: Comma-separated list of sports available at the club.
 *               mapUrl:
 *                 type: string
 *                 description: URL of the map location.
 *               clubMemberCode:
 *                 type: string
 *                 description: Unique code for the club member.
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
 *       201:
 *         description: Successfully created a new sub-club.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates the success of the operation.
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: The ID of the newly created sub-club.
 *                     name:
 *                       type: string
 *                       description: The name of the sub-club.
 *                     location:
 *                       type: string
 *                       description: The location of the sub-club.
 *                     description:
 *                       type: string
 *                       description: Description of the sub-club.
 *                     gender:
 *                       type: string
 *                       description: Gender focus of the sub-club.
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
 *                     mapUrl:
 *                       type: string
 *                       description: URL of the map location.
 *                     commission:
 *                       type: number
 *                       format: float
 *                       description: The commission rate for the sub-club.
 *                     sports:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: List of sports available at the club.
 *                     clubMemberCode:
 *                       type: string
 *                       description: The unique code for the club member.
 *       404:
 *         description: Location not found or ClubsuberAdmin not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *       409:
 *         description: Club already exists or missing images and logo.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 */

router.post(
  "/add-sub",
  imgUploader.fields([{ name: "clubImg" }, { name: "logo", maxCount: 1 }]),
  addSubClub
);

/**
 * @swagger
 * /suberadmin/get-subs/{id}:
 *   get:
 *     summary: Get sub-clubs of a specific club.
 *     description: Retrieves a list of sub-clubs associated with a specific club, including information about cities and subscription counts.
 *     tags:
 *       - Suber Admin
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

router.get("/get-subs/:id", getSubClubs);

/**
 * @swagger
 * suberadmin/delete-sub/{id}:
 *   delete:
 *     summary: Delete a sub-club.
 *     description: Removes a specific sub-club from the database by its ID and updates the parent club if necessary.
 *     tags:
 *       - Suber Admin
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the sub-club to be deleted.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully deleted the sub-club.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the deletion was successful.
 *                 message:
 *                   type: string
 *                   description: Confirmation message for successful deletion.
 *       404:
 *         description: Sub-club not found.
 *       500:
 *         description: Internal server error.
 */

router.delete("/delete-sub/:id", deleteSubClub);

/**
 * @swagger
 * suberadmin/get-sub/{id}:
 *   get:
 *     summary: Get details of a specific sub-club.
 *     description: Retrieves the details of a sub-club by its ID.
 *     tags:
 *       - Suber Admin
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the sub-club to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the sub-club details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the retrieval was successful.
 *                 data:
 *                   type: object
 *                   description: Details of the retrieved sub-club.
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: The ID of the sub-club.
 *                     name:
 *                       type: string
 *                       description: The name of the sub-club.
 *                     description:
 *                       type: string
 *                       description: A description of the sub-club.
 *                     location:
 *                       type: string
 *                       description: The location of the sub-club.
 *                     lat:
 *                       type: number
 *                       format: float
 *                       description: The latitude of the sub-club's location.
 *                     long:
 *                       type: number
 *                       format: float
 *                       description: The longitude of the sub-club's location.
 *                     images:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: URLs of the sub-club images.
 *                     logo:
 *                       type: string
 *                       description: URL of the sub-club logo.
 *                     mapUrl:
 *                       type: string
 *                       description: URL of the map location.
 *                     commission:
 *                       type: number
 *                       format: float
 *                       description: Commission rate for the sub-club.
 *                     sports:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: List of sports available at the sub-club.
 *                     clubMemberCode:
 *                       type: string
 *                       description: The club member code of the sub-club.
 *       404:
 *         description: Sub-club not found.
 *       500:
 *         description: Internal server error.
 */

router.get("/get-sub/:id", getSubClub);




/**
 * @swagger
 * suberadmin/edit-sub/{id}:
 *   put:
 *     summary: Edit details of a specific sub-club.
 *     description: Updates the details of a sub-club, including images, description, location, and more.
 *     tags:
 *       - Suber Admin
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the sub-club to edit.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               lat:
 *                 type: number
 *                 format: float
 *                 description: The latitude of the sub-club's location.
 *               long:
 *                 type: number
 *                 format: float
 *                 description: The longitude of the sub-club's location.
 *               description:
 *                 type: string
 *                 description: A description of the sub-club.
 *               gender:
 *                 type: string
 *                 description: The gender focus of the sub-club (e.g., male, female, mixed).
 *               commission:
 *                 type: number
 *                 format: float
 *                 description: Commission rate for the sub-club.
 *               sports:
 *                 type: string
 *                 description: Comma-separated list of sports available at the sub-club.
 *               mapUrl:
 *                 type: string
 *                 description: URL of the map location.
 *               clubMemberCode:
 *                 type: string
 *                 description: The club member code of the sub-club.
 *               clubImg:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Images of the sub-club.
 *               logo:
 *                 type: string
 *                 format: binary
 *                 description: Logo of the sub-club.
 *     responses:
 *       200:
 *         description: Successfully updated the sub-club details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the update was successful.
 *                 data:
 *                   type: object
 *                   description: Details of the updated sub-club.
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: The ID of the sub-club.
 *                     name:
 *                       type: string
 *                       description: The name of the sub-club.
 *                     description:
 *                       type: string
 *                       description: A description of the sub-club.
 *                     location:
 *                       type: string
 *                       description: The location of the sub-club.
 *                     lat:
 *                       type: number
 *                       format: float
 *                       description: The latitude of the sub-club's location.
 *                     long:
 *                       type: number
 *                       format: float
 *                       description: The longitude of the sub-club's location.
 *                     images:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: URLs of the sub-club images.
 *                     logo:
 *                       type: string
 *                       description: URL of the sub-club logo.
 *                     mapUrl:
 *                       type: string
 *                       description: URL of the map location.
 *                     commission:
 *                       type: number
 *                       format: float
 *                       description: Commission rate for the sub-club.
 *                     sports:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: List of sports available at the sub-club.
 *                     clubMemberCode:
 *                       type: string
 *                       description: The club member code of the sub-club.
 *       400:
 *         description: Bad request if any required fields are missing or invalid.
 *       404:
 *         description: Sub-club not found.
 *       500:
 *         description: Internal server error.
 */

router.put(
  "/edit-sub/:id",
  imgUploader.fields([{ name: "clubImg" }, { name: "logo", maxCount: 1 }]),
  editSubClub
);





/**
 * @swagger
 * /suberadmin/add-discount/{suberadminclub Id}:
 *   post:
 *     summary: Add a discount code to a club
 *     description: Creates a new discount code and associates it with a specified club. The discount code includes details such as the discount percentage, start date, and end date of validity.
 *     tags:
 *       - Suber Admin
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the club to which the discount code will be added
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
 *                 description: The unique discount code to be created
 *               discountPercentage:
 *                 type: number
 *                 format: float
 *                 description: The discount percentage (0-100)
 *               validFrom:
 *                 type: string
 *                 format: date-time
 *                 description: The start date and time from which the discount code is valid. If not provided, defaults to the current date and time
 *               validTo:
 *                 type: string
 *                 format: date-time
 *                 description: The end date and time until which the discount code is valid. Optional; if not provided, the discount code does not expire
 *             required:
 *               - code
 *               - discountPercentage
 *     responses:
 *       '201':
 *         description: Discount code successfully created and associated with the club
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
 *                   example: "Discount code added successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "SUMMER20"
 *                     discountPercentage:
 *                       type: number
 *                       format: float
 *                       example: 20
 *                     validFrom:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-08-01T00:00:00Z"
 *                     validTo:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-12-31T23:59:59Z"
 *                     club:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c85"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-08-01T12:00:00Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-08-01T12:00:00Z"
 *       '400':
 *         description: Invalid request data or discount percentage
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
 *                   example: "Invalid discount percentage or request data"
 *       '404':
 *         description: Club not found
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
 *                   example: "Club Not Found"
 */

router.post("/add-discount/:id", addDiscount);



/**
 * @swagger
 * /suberadmin/delete-discount/{id}:
 *   delete:
 *     summary: Delete a discount code
 *     description: Deletes a discount code from the database by its ID.
 *     tags:
 *       - Club
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the discount code to delete
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Discount code deleted successfully
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
 *                   example: "Discount code deleted successfully"
 *       '404':
 *         description: Discount code not found
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
 *                   example: "Discount code not found"
 *       '500':
 *         description: Internal server error
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
 *                   example: "Internal server error"
 */

router.delete("/delete-discount/:id", deleteDiscount);
module.exports = router;
