const expressAsyncHandler = require("express-async-handler");
const Subscription = require("../models/Subscriptions"); // Import the Subscription model
const Club = require("../models/Club");
module.exports = expressAsyncHandler(async (req, res, next) => {
  const subscriptionTypes = ["90Minutes", "30Minutes", "60Minutes"];

  const subscriptions = await Subscription.find({
    type: { $in: subscriptionTypes },
  });

  const clubIds = subscriptions.map((subscription) => subscription.club);

  const clubs = await Club.find({ _id: { $in: clubIds } });

  console.log(
    "Clubs with subscriptions of types '90Minutes', '30Minutes', or '60Minutes':"
  );
  console.log(clubs);
  console.log(subscriptions);

  next();
});
