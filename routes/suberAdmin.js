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



const {
  createWeightFitnessPackage,
  getWeightFitnessPackagesForClub,
  updateWeightFitnessPackage,
  deleteWeightFitnessPackage,
  // yoga
  updateYogaPackage,
  createYogaPackage,
  deleteYogaPackageById,
  getYogaPackagesByClub,
  createPaddlePackage,
  deletePaddlePackage,
  getAllPaddlePackagesForClub,
  updatePaddlePackage,
} = require("../controllers/packages/SuberAdminPackages");
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
 *       - Suber Admin
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




/**
 * @swagger
 * /suberadmin/create-package-weightFitness:
 *   post:
 *     summary: Create a new Weight and Fitness package
 *     tags:
 *       - Suber Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               club:
 *                 type: string
 *                 description: The ID of the club
 *                 example: 64f1a1e3e77e48cd43b3177b
 *               packageName:
 *                 type: string
 *                 description: The name of the package
 *                 example: Premium Fitness Package
 *               packageType:
 *                 type: string
 *                 description: The type of the package (monthly, yearly, weekly, daily)
 *                 enum: [monthly, yearly, weekly, daily]
 *                 example: monthly
 *               price:
 *                 type: number
 *                 description: The price of the package
 *                 example: 120
 *               description:
 *                 type: string
 *                 description: Description of the package
 *                 example: A premium monthly package offering access to all fitness facilities.
 *               freezeTime:
 *                 type: number
 *                 description: Number of days for which the package can be frozen
 *                 example: 5
 *               freezeCountTime:
 *                 type: number
 *                 description: Number of times the package can be frozen
 *                 example: 2
 *               discountForAll:
 *                 type: boolean
 *                 description: Whether the discount applies to all members
 *                 example: true
 *               discountFrom:
 *                 type: string
 *                 format: date-time
 *                 description: Start date for the discount period
 *                 example: 2024-09-01T00:00:00Z
 *               discountTo:
 *                 type: string
 *                 format: date-time
 *                 description: End date for the discount period
 *                 example: 2024-09-30T23:59:59Z
 *               priceAfterDiscount:
 *                 type: number
 *                 description: Price after applying the discount
 *                 example: 100
 *               discountApplicableToNewMembersOnly:
 *                 type: boolean
 *                 description: True if discount only applies to new members
 *                 example: false
 *               discountStopDays:
 *                 type: number
 *                 description: Number of days the discount will be stopped
 *                 example: 7
 *     responses:
 *       201:
 *         description: Package created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Package created successfully
 *                 data:
 *                   $ref: '#/components/schemas/WeightFitnessPackage'
 *       400:
 *         description: Bad Request - Package with the same name and type already exists for this club
 *       500:
 *         description: Internal Server Error
 */
router.post("/create-package-weightFitness", createWeightFitnessPackage);

/**
 * @swagger
 * /suberadmin/get-weightFitness/{clubId}:
 *   get:
 *     summary: Get all Weight and Fitness packages for a specific club
 *     tags:
 *       - Suber Admin
 *     parameters:
 *       - in: path
 *         name: clubId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the club
 *         example: 64f1a1e3e77e48cd43b3177b
 *     responses:
 *       200:
 *         description: A list of weight and fitness packages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WeightFitnessPackage'
 *       404:
 *         description: No packages found for the specified club
 *       500:
 *         description: Internal Server Error
 */
router.get("/get-weightFitness/:clubId", getWeightFitnessPackagesForClub);

/**
 * @swagger
 * /suberadmin/update-weightFitness/{id}:
 *   put:
 *     summary: Update a Weight and Fitness package by ID
 *     tags:
 *       - Suber Admin
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the package to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               packageName:
 *                 type: string
 *                 description: The name of the package
 *               packageType:
 *                 type: string
 *                 enum:
 *                   - monthly
 *                   - yearly
 *                   - weekly
 *                   - daily
 *                 description: The type of the package
 *               price:
 *                 type: number
 *                 format: float
 *                 description: The price of the package
 *               discountForAll:
 *                 type: boolean
 *                 description: Whether the discount applies to all members
 *               discountFrom:
 *                 type: string
 *                 format: date-time
 *                 description: Start date for the discount period
 *               discountTo:
 *                 type: string
 *                 format: date-time
 *                 description: End date for the discount period
 *               priceAfterDiscount:
 *                 type: number
 *                 format: float
 *                 description: Price after applying the discount
 *               discountApplicableToNewMembersOnly:
 *                 type: boolean
 *                 description: True if discount only applies to new members
 *               discountStopDays:
 *                 type: integer
 *                 description: Number of days to stop discount
 *               description:
 *                 type: string
 *                 description: Description of the package
 *               freezeTime:
 *                 type: number
 *                 description: Freeze time in days
 *               freezeCountTime:
 *                 type: number
 *                 description: Number of times the package can be frozen
 *     responses:
 *       '200':
 *         description: Package updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Package updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/WeightFitnessPackage'
 *       '404':
 *         description: Package not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Package not found
 *       '400':
 *         description: Bad request if invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid input
 *
 * components:
 *   schemas:
 *     WeightFitnessPackage:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 64c25b9f7684c908b3c3f07f
 *         club:
 *           type: string
 *           example: 64c25b9f7684c908b3c3f07e
 *         packageName:
 *           type: string
 *           example: Premium Fitness Package
 *         packageType:
 *           type: string
 *           enum:
 *             - monthly
 *             - yearly
 *             - weekly
 *             - daily
 *           example: yearly
 *         price:
 *           type: number
 *           format: float
 *           example: 199.99
 *         discount:
 *           type: object
 *           properties:
 *             discountForAll:
 *               type: boolean
 *               example: false
 *             discountFrom:
 *               type: string
 *               format: date-time
 *               example: 2024-02-01T00:00:00Z
 *             discountTo:
 *               type: string
 *               format: date-time
 *               example: 2024-02-28T23:59:59Z
 *             priceAfterDiscount:
 *               type: number
 *               format: float
 *               example: 149.99
 *             discountApplicableToNewMembersOnly:
 *               type: boolean
 *               example: true
 *             discountStopDays:
 *               type: integer
 *               example: 10
 *         description:
 *           type: string
 *           example: A premium fitness package with additional benefits.
 *         freezeTime:
 *           type: number
 *           example: 30
 *         freezeCountTime:
 *           type: number
 *           example: 2
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

router.put("/update-weightFitness/:id", updateWeightFitnessPackage);

/**
 * @swagger
 * /suberadmin/delete-weight-Fitness/{id}:
 *   delete:
 *     summary: Delete a Weight and Fitness package by ID
 *     description: Deletes a specific Weight and Fitness package based on its unique identifier.
 *     tags:
 *       - Suber Admin
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the Weight and Fitness package to be deleted
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Package successfully deleted
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
 *                   example: "Package deleted successfully"
 *       '404':
 *         description: Package not found
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
 *                   example: "Package not found"
 *       '500':
 *         description: Server error
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
router.delete("/delete-weight-Fitness/:id", deleteWeightFitnessPackage);

/**
 * @swagger
 * /suberadmin/yoga-create:
 *   post:
 *     summary: Create a new Yoga package for a specific club
 *     tags:
 *       - Suber Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               club:
 *                 type: string
 *                 description: The ID of the club
 *                 example: 64c9f8a6a2f02e4c9e4e4c9e
 *               packageName:
 *                 type: string
 *                 description: The name of the yoga package
 *                 example: Morning Yoga
 *               yogaType:
 *                 type: string
 *                 description: The type of yoga (e.g., Hatha, Vinyasa)
 *                 example: Vinyasa
 *               daysOfWeek:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Days of the week when the yoga sessions are held
 *                 example: ["Monday", "Wednesday", "Friday"]
 *               sessionsPerDay:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     startTime:
 *                       type: string
 *                       description: Start time of the session
 *                       example: "08:00 AM"
 *                     endTime:
 *                       type: string
 *                       description: End time of the session
 *                       example: "09:00 AM"
 *                 description: Sessions per day with start and end times
 *               price:
 *                 type: number
 *                 description: Price of the yoga package
 *                 example: 150
 *               numberOfSeats:
 *                 type: number
 *                 description: Number of seats available for the package
 *                 example: 10
 *               discountForAll:
 *                 type: boolean
 *                 description: Whether the discount applies to all members
 *                 example: false
 *               discountFrom:
 *                 type: string
 *                 format: date-time
 *                 description: Start date for the discount period
 *                 example: "2024-09-01T00:00:00Z"
 *               discountTo:
 *                 type: string
 *                 format: date-time
 *                 description: End date for the discount period
 *                 example: "2024-09-30T23:59:59Z"
 *               priceAfterDiscount:
 *                 type: number
 *                 description: Price after applying the discount
 *                 example: 120
 *               discountApplicableToNewMembersOnly:
 *                 type: boolean
 *                 description: True if discount only applies to new members
 *                 example: true
 *               discountStopDays:
 *                 type: number
 *                 description: Number of days the discount is applicable
 *                 example: 10
 *               description:
 *                 type: string
 *                 description: Additional description for the package
 *                 example: This yoga package focuses on improving flexibility and mindfulness.
 *     responses:
 *       201:
 *         description: Yoga package created successfully
 *       400:
 *         description: Bad request
 */
router.post("/yoga-create", createYogaPackage);

/**
 * @swagger
 * /suberadmin/yoga-update/{id}:
 *   put:
 *     summary: Update an existing Yoga package by ID
 *     tags:
 *       - Suber Admin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the yoga package to update
 *         schema:
 *           type: string
 *           example: 64c9f8a6a2f02e4c9e4e4c9e
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               packageName:
 *                 type: string
 *                 description: The name of the yoga package
 *                 example: Morning Yoga
 *               yogaType:
 *                 type: string
 *                 description: The type of yoga (e.g., Hatha, Vinyasa)
 *                 example: Vinyasa
 *               daysOfWeek:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Days of the week when the yoga sessions are held
 *                 example: ["Monday", "Wednesday", "Friday"]
 *               sessionsPerDay:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     startTime:
 *                       type: string
 *                       description: Start time of the session
 *                       example: "08:00 AM"
 *                     endTime:
 *                       type: string
 *                       description: End time of the session
 *                       example: "09:00 AM"
 *                 description: Sessions per day with start and end times
 *               price:
 *                 type: number
 *                 description: Price of the yoga package
 *                 example: 150
 *               numberOfSeats:
 *                 type: number
 *                 description: Number of seats available for the package
 *                 example: 10
 *               discountForAll:
 *                 type: boolean
 *                 description: Whether the discount applies to all members
 *                 example: false
 *               discountFrom:
 *                 type: string
 *                 format: date-time
 *                 description: Start date for the discount period
 *                 example: "2024-09-01T00:00:00Z"
 *               discountTo:
 *                 type: string
 *                 format: date-time
 *                 description: End date for the discount period
 *                 example: "2024-09-30T23:59:59Z"
 *               priceAfterDiscount:
 *                 type: number
 *                 description: Price after applying the discount
 *                 example: 120
 *               discountApplicableToNewMembersOnly:
 *                 type: boolean
 *                 description: True if discount only applies to new members
 *                 example: true
 *               discountStopDays:
 *                 type: number
 *                 description: Number of days the discount is applicable
 *                 example: 10
 *               description:
 *                 type: string
 *                 description: Additional description for the package
 *                 example: This yoga package focuses on improving flexibility and mindfulness.
 *     responses:
 *       200:
 *         description: Yoga package updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Yoga package not found
 */
router.put("/yoga-update/:id", updateYogaPackage);

/**
 * @swagger
 * /suberadmin/delete-yoga-package/{id}:
 *   delete:
 *     summary: Delete a Yoga package by ID
 *     tags:
 *       - Suber Admin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the yoga package to delete
 *         schema:
 *           type: string
 *           example: 64c9f8a6a2f02e4c9e4e4c9e
 *     responses:
 *       200:
 *         description: Yoga package deleted successfully
 *       404:
 *         description: Yoga package not found
 *       500:
 *         description: Error deleting yoga package
 */
router.delete("/delete-yoga-package/:id", deleteYogaPackageById);

/**
 * @swagger
 * /suberadmin/yoga-packages/{clubId}:
 *   get:
 *     summary: Get all Yoga packages for a specific club
 *     tags:
 *       - Suber Admin
 *     parameters:
 *       - in: path
 *         name: clubId
 *         required: true
 *         description: The ID of the club
 *         schema:
 *           type: string
 *           example: 64c9f8a6a2f02e4c9e4e4c9e
 *     responses:
 *       200:
 *         description: A list of yoga packages for the specified club
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: The ID of the yoga package
 *                   packageName:
 *                     type: string
 *                     description: Name of the yoga package
 *                   yogaType:
 *                     type: string
 *                     description: Type of yoga
 *                   daysOfWeek:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: Days of the week for sessions
 *                   sessionsPerDay:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         startTime:
 *                           type: string
 *                           description: Start time of the session
 *                         endTime:
 *                           type: string
 *                           description: End time of the session
 *                   price:
 *                     type: number
 *                     description: Price of the package
 *                   numberOfSeats:
 *                     type: number
 *                     description: Number of seats available
 *                   discountForAll:
 *                     type: boolean
 *                     description: Discount applies to all
 *                   discountFrom:
 *                     type: string
 *                     format: date-time
 *                     description: Discount start date
 *                   discountTo:
 *                     type: string
 *                     format: date-time
 *                     description: Discount end date
 *                   priceAfterDiscount:
 *                     type: number
 *                     description: Price after discount
 *                   discountApplicableToNewMembersOnly:
 *                     type: boolean
 *                     description: Discount for new members only
 *                   discountStopDays:
 *                     type: number
 *                     description: Number of discount days
 *                   description:
 *                     type: string
 *                     description: Description of the package
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: Package creation date
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     description: Package last update date
 *       404:
 *         description: No yoga packages found for the club
 *       500:
 *         description: Error fetching yoga packages
 */
router.get("/yoga-packages/:clubId", getYogaPackagesByClub);

/**
 * @swagger
 * /suberadmin/paddle-create:
 *   post:
 *     summary: Create a new paddle package
 *     tags:
 *       - Suber Admin
 *     requestBody:
 *       description: Data to create a new paddle package
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               club:
 *                 type: string
 *                 description: ID of the club
 *                 example: 609c1f2f8f8d4d3a5c9a8b12
 *               packageName:
 *                 type: string
 *                 description: Name of the paddle package
 *                 example: "Morning Yoga"
 *               sessionDuration:
 *                 type: string
 *                 enum:
 *                   - "30 minutes"
 *                   - "45 minutes"
 *                   - "60 minutes"
 *                   - "90 minutes"
 *                   - "120 minutes"
 *                 description: Duration of each session
 *                 example: "60 minutes"
 *               price:
 *                 type: number
 *                 description: Price of the package
 *                 example: 50
 *               discount:
 *                 type: object
 *                 properties:
 *                   discountForAll:
 *                     type: boolean
 *                     example: true
 *                   discountFrom:
 *                     type: string
 *                     format: date
 *                     example: "2024-09-01"
 *                   discountTo:
 *                     type: string
 *                     format: date
 *                     example: "2024-09-30"
 *                   priceAfterDiscount:
 *                     type: number
 *                     example: 40
 *                   discountApplicableToNewMembersOnly:
 *                     type: boolean
 *                     example: false
 *                   discountStopDays:
 *                     type: number
 *                     example: 5
 *               description:
 *                 type: string
 *                 description: Description of the package
 *                 example: "Includes yoga sessions every morning"
 *               availableSlots:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     date:
 *                       type: string
 *                       format: date
 *                       description: The date to create slots for
 *                       example: "2024-09-01"
 *                     numberOfSeats:
 *                       type: number
 *                       description: Number of seats available per slot
 *                       example: 5
 *     responses:
 *       201:
 *         description: Paddle package created successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Club hours not found or Package not found
 */
router.post("/paddle-create", createPaddlePackage);

/**
 * @swagger
 * /suberadmin/get-paddle-packages/{clubId}:
 *   get:
 *     summary: Get all paddle packages for a specific club
 *     tags:
 *       - Suber Admin
 *     parameters:
 *       - in: path
 *         name: clubId
 *         required: true
 *         schema:
 *           type: string
 *           example: 609c1f2f8f8d4d3a5c9a8b12
 *     responses:
 *       200:
 *         description: List of paddle packages for the specified club
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PaddlePackage'
 *       404:
 *         description: No paddle packages found for this club
 */
router.get("/get-paddle-packages/:clubId", getAllPaddlePackagesForClub);

/**
 * @swagger
 * /suberadmin/delete-paddle-package/{id}:
 *   delete:
 *     summary: Delete a paddle package
 *     tags:
 *       - Suber Admin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 609c1f2f8f8d4d3a5c9a8b12
 *     responses:
 *       200:
 *         description: Paddle package deleted successfully
 *       404:
 *         description: Paddle package not found
 */
router.delete("/delete-paddle-package/:id", deletePaddlePackage);

/**
 * @swagger
 * /suberadmin/update-paddle-package/{id}:
 *   put:
 *     summary: Update a paddle package
 *     tags:
 *       - Suber Admin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 609c1f2f8f8d4d3a5c9a8b12
 *     requestBody:
 *       description: Data to update the paddle package, excluding availableSlots
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               packageName:
 *                 type: string
 *                 description: Name of the paddle package
 *                 example: "Afternoon Paddle"
 *               sessionDuration:
 *                 type: string
 *                 enum:
 *                   - "30 minutes"
 *                   - "45 minutes"
 *                   - "60 minutes"
 *                   - "90 minutes"
 *                   - "120 minutes"
 *                 description: Duration of each session
 *                 example: "60 minutes"
 *               price:
 *                 type: number
 *                 description: Price of the package
 *                 example: 55
 *               discount:
 *                 type: object
 *                 properties:
 *                   discountForAll:
 *                     type: boolean
 *                     example: true
 *                   discountFrom:
 *                     type: string
 *                     format: date
 *                     example: "2024-09-01"
 *                   discountTo:
 *                     type: string
 *                     format: date
 *                     example: "2024-09-30"
 *                   priceAfterDiscount:
 *                     type: number
 *                     example: 45
 *                   discountApplicableToNewMembersOnly:
 *                     type: boolean
 *                     example: false
 *                   discountStopDays:
 *                     type: number
 *                     example: 7
 *               description:
 *                 type: string
 *                 description: Description of the package
 *                 example: "Includes paddle sessions every afternoon"
 *     responses:
 *       200:
 *         description: Paddle package updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Paddle package not found
 */
router.put("/update-paddle-package/:id", updatePaddlePackage);
module.exports = router;
