const router = require("express").Router();
const {
  removeClubSuspension,
  scheduleClubSuspension,
  addDiscount,
  getDiscount,
  getAllDiscounts,
  deleteDiscount,
  addBankAccount,
  getBankAccountById,
  updateBankAccount,
  createClubHours ,
  getAllClubHours ,
  updateClubHours

} = require("../controllers/club");
/**
 * @swagger
 * /clubs/suspend/{id}:
 *   put:
 *     summary: Schedule a suspension for a club
 *     description: Schedules a suspension for a club with optional temporary status. If `isTemporarilyStopped` is "true", the club is temporarily stopped; otherwise, it is scheduled for deactivation.
 *     tags:
 *       - Club
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the club to suspend
 *         schema:
 *           type: string
 *       - name: start
 *         in: query
 *         required: true
 *         description: The start date for the suspension in ISO 8601 format (e.g., "2024-08-30T00:00:00Z")
 *         schema:
 *           type: string
 *           format: date-time
 *       - name: end
 *         in: query
 *         required: true
 *         description: The end date for the suspension in ISO 8601 format (e.g., "2024-08-31T00:00:00Z")
 *         schema:
 *           type: string
 *           format: date-time
 *       - name: isTemporarilyStopped
 *         in: query
 *         required: false
 *         description: Indicates if the suspension is temporary. Set to "true" for a temporary suspension or omit it to deactivate the club.
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *     responses:
 *       '200':
 *         description: Club suspension successfully scheduled or updated
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
 *                   example: "Club status updated"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c85"
 *                     name:
 *                       type: string
 *                       example: "Fitness Club"
 *                     stopSchedule:
 *                       type: object
 *                       properties:
 *                         start:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-08-30T00:00:00Z"
 *                         end:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-08-31T00:00:00Z"
 *                     isTemporarilyStopped:
 *                       type: boolean
 *                       example: true
 *                     isActive:
 *                       type: boolean
 *                       example: false
 *       '400':
 *         description: Invalid start or end dates
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid start or end dates"
 *       '404':
 *         description: Club not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Club Not Found"
 */
router.put("/suspend/:id", scheduleClubSuspension);

/**
 * @swagger
 * /clubs/remove-suspension/{id}:
 *   put:
 *     summary: Remove the suspension of a club
 *     description: Resets the suspension status of a club and reactivates it if it was previously deactivated.
 *     tags:
 *       - Club
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the club to remove suspension from
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Club suspension successfully removed
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
 *                   example: "Club suspension removed"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c85"
 *                     name:
 *                       type: string
 *                       example: "Fitness Club"
 *                     stopSchedule:
 *                       type: object
 *                       properties:
 *                         start:
 *                           type: string
 *                           format: date-time
 *                           example: null
 *                         end:
 *                           type: string
 *                           format: date-time
 *                           example: null
 *                     isTemporarilyStopped:
 *                       type: boolean
 *                       example: false
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *       '404':
 *         description: Club not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Club Not Found"
 */

router.put("/remove-suspension/:id", removeClubSuspension);

/**
 * @swagger
 * /clubs/add-discount/{id}:
 *   post:
 *     summary: Add a discount code to a club
 *     description: Creates a new discount code and associates it with a specified club. The discount code includes details such as the discount percentage, start date, and end date of validity.
 *     tags:
 *       - Club
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
 * /clubs/get-discount/{id}:
 *   get:
 *     summary: Get a discount code
 *     description: Retrieves the details of a specific discount code by its ID.
 *     tags:
 *       - Club
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the discount code to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Discount code details retrieved successfully
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
 *                   example: "Discount code retrieved successfully"
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
 *                   example: "Discount Code Not Found"
 */

router.get("/get-discount/:id", getDiscount);

/**
 * @swagger
 * /clubs/get-discounts/:id:
 *   get:
 *     summary: Retrieve all discount codes
 *     description: Fetches a list of all discount codes from the database.
 *     tags:
 *       - Club
 *     responses:
 *       '200':
 *         description: Successfully retrieved all discount codes
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
 *                   example: "Discount codes retrieved successfully"
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
 *                         example: "DISCOUNT20"
 *                       discountPercentage:
 *                         type: number
 *                         example: 20
 *                       validFrom:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-01T00:00:00.000Z"
 *                       validTo:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-12-31T23:59:59.000Z"
 *                       club:
 *                         type: string
 *                         example: "60d21b4667d0d8992e610c84"
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Server Error"
 */

router.get("/get-discounts/:id", getAllDiscounts);

/**
 * @swagger
 * /club/delete-discount/{id}:
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

/**
 * @swagger
 * /clubs/add-bankAccount:
 *   post:
 *     summary: Add a new bank account
 *     description: Adds a new bank account for a club by specifying the owner's name, IBAN, bank name, and the club ID.
 *     tags:
 *       - Club
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ownerName
 *               - iban
 *               - bankName
 *               - club
 *             properties:
 *               ownerName:
 *                 type: string
 *                 description: The name of the bank account owner.
 *                 example: John Doe
 *               iban:
 *                 type: string
 *                 description: The International Bank Account Number (IBAN).
 *                 example: DE89370400440532013000
 *               bankName:
 *                 type: string
 *                 description: The name of the bank.
 *                 example: Bank of Example
 *               club:
 *                 type: string
 *                 description: The ID of the club associated with the bank account.
 *                 example: 60d21b4667d0d8992e610c85
 *     responses:
 *       '201':
 *         description: Bank account added successfully
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
 *                   example: 'Bank account added successfully'
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 60d21b4667d0d8992e610c85
 *                     ownerName:
 *                       type: string
 *                       example: John Doe
 *                     iban:
 *                       type: string
 *                       example: DE89370400440532013000
 *                     bankName:
 *                       type: string
 *                       example: Bank of Example
 *                     club:
 *                       type: string
 *                       example: 60d21b4667d0d8992e610c85
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-08-30T14:53:00.000Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-08-30T14:53:00.000Z
 *       '400':
 *         description: Bad request, missing required fields
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
 *                   example: 'All fields are required'
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
 *                   example: 'Internal server error'
 */

router.post("/add-bankAccount", addBankAccount);

/**
 * @swagger
 * /clubs/get-bankAccount/{id}:
 *   get:
 *     summary: Retrieve a bank account by ID
 *     description: Fetches a bank account's details using its unique ID.
 *     tags:
 *       - Club
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The unique ID of the bank account to retrieve
 *         schema:
 *           type: string
 *           example: 60d21b4667d0d8992e610c85
 *     responses:
 *       '200':
 *         description: Bank account retrieved successfully
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
 *                   example: 'Bank account retrieved successfully'
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 60d21b4667d0d8992e610c85
 *                     ownerName:
 *                       type: string
 *                       example: John Doe
 *                     iban:
 *                       type: string
 *                       example: DE89370400440532013000
 *                     bankName:
 *                       type: string
 *                       example: Bank of Example
 *                     club:
 *                       type: string
 *                       example: 60d21b4667d0d8992e610c85
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-08-30T14:53:00.000Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-08-30T14:53:00.000Z
 *       '404':
 *         description: Bank account not found
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
 *                   example: 'Bank account not found'
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
 *                   example: 'Internal server error'
 */

router.get("/get-bankAccount/:id", getBankAccountById);

/**
 * @swagger
 * /clubs/update-bankAccount/{id}:
 *   put:
 *     summary: Update a bank account
 *     description: Updates the details of an existing bank account using its unique ID.
 *     tags:
 *       - Club
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The unique ID of the bank account to update
 *         schema:
 *           type: string
 *           example: 60d21b4667d0d8992e610c85
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ownerName:
 *                 type: string
 *                 description: The name of the bank account owner
 *                 example: John Doe
 *               iban:
 *                 type: string
 *                 description: The IBAN of the bank account
 *                 example: DE89370400440532013000
 *               bankName:
 *                 type: string
 *                 description: The name of the bank
 *                 example: Bank of Example
 *     responses:
 *       '200':
 *         description: Bank account updated successfully
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
 *                   example: 'Bank account updated successfully'
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 60d21b4667d0d8992e610c85
 *                     ownerName:
 *                       type: string
 *                       example: John Doe
 *                     iban:
 *                       type: string
 *                       example: DE89370400440532013000
 *                     bankName:
 *                       type: string
 *                       example: Bank of Example
 *                     club:
 *                       type: string
 *                       example: 60d21b4667d0d8992e610c85
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-08-30T14:53:00.000Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-08-30T15:00:00.000Z
 *       '404':
 *         description: Bank account not found
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
 *                   example: 'Bank account not found'
 *       '400':
 *         description: Bad request, validation error
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
 *                   example: 'All fields are required'
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
 *                   example: 'Internal server error'
 */

router.put("/update-bankAccount/:id", updateBankAccount);




/**
 * @swagger
 * /clubs/club-date:
 *   post:
 *     summary: Create a new club hours entry
 *     description: Adds a new club hours entry for a specific club, specifying the day, gender, open and close times, and whether the club is open on that day.
 *     tags:
 *       - Club 
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
 *                 example: "64f1d2e91b2fbd1d9cfa9c6a"
 *               day:
 *                 type: string
 *                 description: The day of the week
 *                 enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
 *                 example: "Monday"
 *               gender:
 *                 type: string
 *                 description: Gender allowed during these hours
 *                 enum: ["male", "female", "both"]
 *                 example: "both"
 *               openTime:
 *                 type: string
 *                 format: date-time
 *                 description: Opening time in ISO 8601 format
 *                 example: "2024-09-01T08:00:00.000Z"
 *               closeTime:
 *                 type: string
 *                 format: date-time
 *                 description: Closing time in ISO 8601 format
 *                 example: "2024-09-01T20:00:00.000Z"
 *               isOpen:
 *                 type: boolean
 *                 description: Whether the club is open on this day
 *                 example: true
 *     responses:
 *       '201':
 *         description: Club hours added successfully
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
 *                   example: "Club hours added successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "64f1d2e91b2fbd1d9cfa9c6b"
 *                     club:
 *                       type: string
 *                       example: "64f1d2e91b2fbd1d9cfa9c6a"
 *                     day:
 *                       type: string
 *                       example: "Monday"
 *                     gender:
 *                       type: string
 *                       example: "both"
 *                     openTime:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-09-01T08:00:00.000Z"
 *                     closeTime:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-09-01T20:00:00.000Z"
 *                     isOpen:
 *                       type: boolean
 *                       example: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-09-01T06:00:00.000Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-09-01T06:00:00.000Z"
 *       '400':
 *         description: Bad request - missing or invalid fields
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
 *                   example: "All fields are required"
 */


router.post('/club-date', createClubHours); 


/**
 * @swagger
 * /clubs/club-dates/{clubId}:
 *   get:
 *     summary: Retrieve all club hours for a specific club
 *     description: Get all the opening and closing hours for a specific club identified by its ID.
 *     tags:
 *       - Club 
 *     parameters:
 *       - in: path
 *         name: clubId
 *         required: true
 *         description: The ID of the club to get hours for
 *         schema:
 *           type: string
 *           example: "64f1d2e91b2fbd1d9cfa9c6a"
 *     responses:
 *       '200':
 *         description: Club hours retrieved successfully
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
 *                   example: "Club hours retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "64f1d2e91b2fbd1d9cfa9c6b"
 *                       club:
 *                         type: string
 *                         example: "64f1d2e91b2fbd1d9cfa9c6a"
 *                       day:
 *                         type: string
 *                         example: "Monday"
 *                       gender:
 *                         type: string
 *                         example: "both"
 *                       openTime:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-09-01T08:00:00.000Z"
 *                       closeTime:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-09-01T20:00:00.000Z"
 *                       isOpen:
 *                         type: boolean
 *                         example: true
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-09-01T06:00:00.000Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-09-01T06:00:00.000Z"
 *       '404':
 *         description: No club hours found for this club
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
 *                   example: "No club hours found for this club"
 */

router.get('/club-dates/:clubId', getAllClubHours);

/**
 * @swagger
 * /clubs/update-club-date/{id}:
 *   put:
 *     summary: Update club hours by ID
 *     description: Edit the hours for a specific club based on the provided ID.
 *     tags:
 *       - Club 
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the club hours to update
 *         schema:
 *           type: string
 *           example: "64f1d2e91b2fbd1d9cfa9c6b"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               day:
 *                 type: string
 *                 enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
 *                 example: "Monday"
 *               gender:
 *                 type: string
 *                 enum: ["male", "female", "both"]
 *                 example: "both"
 *               openTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-09-01T08:00:00.000Z"
 *               closeTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-09-01T20:00:00.000Z"
 *               isOpen:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       '200':
 *         description: Club hours updated successfully
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
 *                   example: "Club hours updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "64f1d2e91b2fbd1d9cfa9c6b"
 *                     club:
 *                       type: string
 *                       example: "64f1d2e91b2fbd1d9cfa9c6a"
 *                     day:
 *                       type: string
 *                       example: "Monday"
 *                     gender:
 *                       type: string
 *                       example: "both"
 *                     openTime:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-09-01T08:00:00.000Z"
 *                     closeTime:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-09-01T20:00:00.000Z"
 *                     isOpen:
 *                       type: boolean
 *                       example: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-09-01T06:00:00.000Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-09-01T06:00:00.000Z"
 *       '400':
 *         description: Invalid input, object invalid
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
 *                   example: "All fields are required: day, gender, openTime, closeTime, and isOpen"
 *       '404':
 *         description: Club hours not found
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
 *                   example: "Club hours not found"
 */

router.put('/update-club-date/:id', updateClubHours);
module.exports = router;
