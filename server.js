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
// app.use(reFreshSuscriptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// Call the function to schedule subscription refreshing
app.use("/auth", require("./routes/auth"));
// app.use(
//   "/admin",
//   // require("./middlewares/verifyRoles")("admin"),
//   require("./routes/admin")
// );

app.use("/user", require("./routes/user"));
app.use("/club", verifyRoles("club"), require("./routes/club"));
app.use("/orders", require("./routes/clubOrder"));
app.use("/suberadmin", require("./routes/suberAdmin"));
app.use('/owner'  , require('./routes/owner'))
app.use("/clubs", require("./routes/global_clubs"));
app.get("/rule/:type", getRuleType);
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
