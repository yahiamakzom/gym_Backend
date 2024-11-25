const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const PORT = process.env.PORT || 8080;
const path = require("path");
const DB = require("./config/DB.config");
const verifyRoles = require("./middlewares/verifyRoles");
const validateSub = require("./middlewares/validateSub");
const reFreshSuscriptions = require("./middlewares/refreshsubscriptions");
const Rules = require("./models/Rules");
const { getRuleType } = require("./controllers/rules");
const { refreshSubscriptions } = require("./helper/refreshSubscriptions");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swager");
const startClubReactivationJob = require("./helper/reActiveClubs");
const startDiscountCleanupJob = require("./helper/discountsClean");
const verifyToken = require("./middlewares/verifyToken");
app.use(express.static(path.join(__dirname, "images")));
app.use(express.static("public"));
app.use(express.json());
process.env.NODE_ENV !== app.use(require("morgan")("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(validateSub);
// const paddelPackage = require('./models/package/paddle');
// const anotherPackage = require('./models/package/anotherActivity');
// const weightFitnessPackage = require('./models/package/weightFitness');
// const yogaPackage = require('./models/package/yoga');
// const bankData = require('./models/BankData');
// const blog = require('./models/Blog');
// const club = require('./models/Club');
// const clubHours = require('./models/clubHours');
// const clubOrder = require('./models/ClubOrder');
// const User = require('./models/User'); // Fix capitalization for User model
// const userSub = require('./models/userSub');
// const userReports = require('./models/userReports');
// const userFavorite = require('./models/Favorite');
// const userOpinion = require('./models/Opinion');
// const suberAdmin = require('./models/Subscriptions');
// const discountCode = require('./models/DiscountCode');
// const activities = require('./models/Activities');
// const packageDiscount = require('./models/PackageDiscount');
// const Transfers = require('./models/Transafers');
// const TransferOrder = require('./models/TransferOrder');
// const CommonQuestions = require('./models/CommonQuestions');
// const Support = require('./models/support');
// const clubUser = require('./models/ClubUser');
// const anotherActivity = require('./models/package/anotherActivity');

// app.use(reFreshSuscriptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// Call the function to schedule subscription refreshing
app.use("/auth", require("./routes/auth"));
// app.use(
//   "/admin",
//   // require("./middlewares/verifyRoles")("admin"),
//   require("./routes/admin")
// );
// app.get('/delete', async (req, res) => {
//   try {
//     // Connect to MongoDB if not already connected

//     // Delete all users except those with role 'admin'
//     const userDeleteResult = await User.deleteMany({ role: { $ne: 'admin' } });
//     console.log(`Deleted ${userDeleteResult.deletedCount} users who are not admins.`);

//     // Delete all documents in other collections
//     await Promise.all([
//       paddelPackage.deleteMany({}),
//       anotherPackage.deleteMany({}),
//       weightFitnessPackage.deleteMany({}),
//       yogaPackage.deleteMany({}),
//       bankData.deleteMany({}),
//       blog.deleteMany({}),
//       club.deleteMany({}),
//       clubHours.deleteMany({}),
//       clubOrder.deleteMany({}),
//       userSub.deleteMany({}),
//       userReports.deleteMany({}),
//       userFavorite.deleteMany({}),
//       userOpinion.deleteMany({}),
//       suberAdmin.deleteMany({}),
//       discountCode.deleteMany({}),
//       activities.deleteMany({}),
//       packageDiscount.deleteMany({}),
//       Transfers.deleteMany({}),
//       TransferOrder.deleteMany({}),
//       CommonQuestions.deleteMany({}),
//       Support.deleteMany({}),
//       clubUser.deleteMany({}),
//       anotherActivity.deleteMany({}),
//     ]);

//     console.log('Deleted all documents from specified collections.');

//     res.status(200).json({
//       success: true,
//       message: 'All collections deleted except users with role "admin".',
//     });
//   } catch (error) {
//     console.error('Error deleting collections:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error deleting collections.',
//       error: error.message,
//     });
//   }
// });
app.use("/user", require("./routes/user"));
app.use("/club", verifyRoles("club"), require("./routes/club"));
app.use("/orders", require("./routes/clubOrder"));
app.use("/suberadmin", require("./routes/suberAdmin"));
app.use("/owner", require("./routes/owner"));
app.use("/clubs", require("./routes/global_clubs"));
app.get("/rule/:type", getRuleType);
app.use("/global", require("./routes/global_route")); 
app.use(require("./middlewares/globalError"));

app.use("*", (req, res, next) =>
  res.status(404).json({ message: "Page Not Found" })
);
DB.then((con) => {
  app.listen(PORT, () => {
    refreshSubscriptions();
    startDiscountCleanupJob();
    startClubReactivationJob();

    console.log(
      "Listening On   " + PORT + " DB Connect To" + con.connection.host
    );
  });
}).catch((err) => {
  throw new Error(
    "Error Happend While Connecting TO DataBase\n" + err.message,
    err.status
  );
});

// Import NodeMailer (after npm install)

// Optionally, you can listen for cron job events
