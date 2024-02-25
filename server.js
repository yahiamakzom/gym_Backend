const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const PORT = process.env.PORT || 8080;
const path = require("path");
const DB = require("./config/DB.config");
const verifyRoles = require("./middlewares/verifyRoles");
const validateSub = require("./middlewares/validateSub");
const Rules = require("./models/Rules");
app.use(express.static(path.join(__dirname, "images")));
app.use(express.static("public"));
app.use(express.json());
process.env.NODE_ENV !== app.use(require("morgan")("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(validateSub);
app.use("/auth", require("./routes/auth"));
app.use(
  "/admin",
  require("./middlewares/verifyRoles")("admin"),
  require("./routes/admin")
);
app.use("/representative", require("./routes/representative"));
app.use("/user", require("./routes/user"));
app.use("/club", verifyRoles("club"), require("./routes/club"));
app.use("*", (req, res, next) =>
  res.status(404).json({ message: "Page Not Found" })
);
app.use(require("./middlewares/globalError"));
// ss

app.get("/rule", async (req, res) => {
  try {
    const rules = await Rules.find();

    res.send(rules);
  } catch (error) {
    console.error("Error fetching rules:", error);
    res.status(500).json({ error: "Failed to fetch rules" });
  }
});
DB.then((con) => {
  app.listen(PORT, () =>
    console.log(
      "Listening On   " + PORT + " DB Connect To" + con.connection.host
    )
  );
}).catch((err) => {
  throw new Error(
    "Error Happend While Connecting TO DataBase\n" + err.message,
    err.status
  );
});
