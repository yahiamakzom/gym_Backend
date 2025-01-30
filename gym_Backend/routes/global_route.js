const router = require("express").Router();

const Club = require("../models/Club");
const User = require("../models/User");

/**
 * @swagger
 * /global/get-statics/{sender}/{clubId}:
 *   get:
 *     summary: Retrieve statistics based on sender role and club ID.
 *     description: |
 *       This endpoint provides different types of statistics depending on the sender's role.
 *       - **Admin**: Subscription-related statistics.
 *       - **Superadmin**: Additional statistics including subscription and sub-count.
 *       - **Owner**: Total counts of users and clubs with other subscription details.
 *     tags:
 *       - Statistics
 *     parameters:
 *       - in: path
 *         name: sender
 *         required: true
 *         schema:
 *           type: string
 *           enum: [admin, superadmin, owner]
 *         description: The role of the sender (e.g., admin, superadmin, owner).
 *       - in: path
 *         name: clubId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the club.
 *     responses:
 *       200:
 *         description: Successfully retrieved statistics.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates the success of the operation.
 *                 data:
 *                   type: object
 *                   description: The statistics data.
 *                   properties:
 *                     subscriptionCount:
 *                       type: integer
 *                       description: Number of subscriptions.
 *                     allSubscription:
 *                       type: integer
 *                       description: Total number of subscriptions.
 *                     activeSubscriptions:
 *                       type: integer
 *                       description: Number of active subscriptions.
 *                     activeSubscriptionsPercentage:
 *                       type: number
 *                       format: float
 *                       description: Percentage of active subscriptions.
 *                     activeSubscriptionsLast28Days:
 *                       type: integer
 *                       description: Active subscriptions in the last 28 days.
 *                     subCount:
 *                       type: integer
 *                       description: Number of subs (only for superadmin).
 *                     totalUsers:
 *                       type: integer
 *                       description: Total number of users (only for owner).
 *                     totalClubs:
 *                       type: integer
 *                       description: Total number of clubs (only for owner).
 *       404:
 *         description: Resource not found or an error occurred.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *     examples:
 *       admin:
 *         summary: Admin Example
 *         value:
 *           status: true
 *           data:
 *             subscriptionCount: 1
 *             allSubscription: 1
 *             activeSubscriptions: 1
 *             activeSubscriptionsPercentage: 1.0
 *             activeSubscriptionsLast28Days: 1
 *       superadmin:
 *         summary: Superadmin Example
 *         value:
 *           status: true
 *           data:
 *             subCount: 2
 *             subscriptionCount: 1
 *             allSubscription: 1
 *             activeSubscriptions: 1
 *             activeSubscriptionsPercentage: 1.0
 *             activeSubscriptionsLast28Days: 1
 *       owner:
 *         summary: Owner Example
 *         value:
 *           status: true
 *           data:
 *             totalUsers: 100
 *             totalClubs: 10
 *             allSubscription: 1
 *             activeSubscriptions: 1
 *             activeSubscriptionsPercentage: 1.0
 *             activeSubscriptionsLast28Days: 1
 */

router.get("/get-statics/:sender/:clubId", async (req, res) => {
  console.log(req.params.sender, req.params.clubId);

  try {
    const { sender, clubId } = req.params; // Corrected destructuring
    let data;
    if (sender !== "owner") {
      if (clubId === undefined)
        return res
          .status(400)
          .json({ status: false, message: "clubId is required" });
    }
    switch (sender) {
      case "admin":
        data = {
          subscriptionCount: 1,
          allSubscription: 1,
          activeSubscriptions: 1,
          activeSubscriptionsPercentage: 1,
          activeSubscriptionsLast28Days: 1,
        };
        break;

      case "suberadmin":
        data = {
          subCount: 2,
          subscriptionCount: 1,
          allSubscription: 1,
          activeSubscriptions: 1,
          activeSubscriptionsPercentage: 1,
          activeSubscriptionsLast28Days: 1,
        };
        break;

      case "owner":
        data = {
          totalUsers: await User.countDocuments({}),
          totalClubs: await Club.countDocuments({}),
          allSubscription: 1,
          activeSubscriptions: 1,
          activeSubscriptionsPercentage: 1,
          activeSubscriptionsLast28Days: 1,
        };
        break;

      default:
        return res
          .status(400)
          .json({ status: false, message: "Invalid sender type." });
    }

    res.status(200).json({
      status: true,
      data,
    });
  } catch (e) {
    res.status(500).json({ status: false, message: e.message });
  }
});

module.exports = router;
