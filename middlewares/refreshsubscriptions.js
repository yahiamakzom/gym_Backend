const expressAsyncHandler = require("express-async-handler");
const Subscription = require("../models/Subscriptions");
const Club = require("../models/Club");
const moment = require("moment");

module.exports = expressAsyncHandler(async (req, res, next) => {
  try {
    const subscriptionTypes = ["90Minutes", "30Minutes", "60Minutes"];
    const subscriptions = await Subscription.find({
      type: { $in: subscriptionTypes },
    });
    const clubIds = [
      ...new Set(subscriptions.map((subscription) => subscription.club)),
    ];
    const clubs = await Club.find({
      _id: { $in: clubIds },
    });

    for (const club of clubs) {
      const clubSubscriptions = subscriptions.filter(
        (subscription) => subscription.club.toString() === club._id.toString()
      );
      if (club.to && club.from && moment(club.to, "HH:mm", true).isValid()) {
        if (moment().isAfter(moment(club.to, "HH:mm"))) {
          for (const subscription of clubSubscriptions) {
            const formattedEndDate = moment.utc(subscription.endData).format(
              "YYYY-MM-DD HH:mm:ss"
            );
            const formattedCurrentDate = moment().format("YYYY-MM-DD HH:mm:ss");
            const isAfterEndDate = moment(formattedCurrentDate).isAfter(
              moment(formattedEndDate)
            );
            if (isAfterEndDate) {
              // Perform desired operations
              subscription.endData = moment(subscription.endData).add(1, "day");
              subscription.startData = moment(subscription.startData).add(
                1,
                "day"
              );
              subscription.gymsCount = subscription.gymsCountFixed;
              await subscription.save();
              console.log(subscription);
            }

            console.log("sdcsdvs");
           console.log(formattedCurrentDate)
           console.log(formattedEndDate)
           console.log(subscription)
            
          }
        } else {
          console.log(moment().isAfter(moment(club.to, "HH:mm")));
          console.log("not end");
        }
      } else {
        const tomorrowMorning = moment().startOf("day").hour(7).add(1, 'days');


        if (moment().isAfter(tomorrowMorning)) {
          for (const subscription of clubSubscriptions) {
            const formattedEndDate = moment.utc(subscription.endData).format(
              "YYYY-MM-DD HH:mm:ss"
            );
            const formattedCurrentDate = moment().format("YYYY-MM-DD HH:mm:ss");
            const isAfterEndDate = moment(formattedCurrentDate).isAfter(
              moment(formattedEndDate)
            );
            if (isAfterEndDate) {
              // Perform desired operations
              subscription.endData = moment(subscription.endData).add(1, "day");
              subscription.startData = moment(subscription.startData).add(
                1,
                "day"
              );
              subscription.gymsCount = subscription.gymsCountFixed;
              await subscription.save();
              console.log(subscription);
            }
            
          }
        } 
        console.log('asdcasd');
        console.log(tomorrowMorning);
        console.log('sdsd')
        console.log(moment().isAfter(tomorrowMorning));
        console.log(moment());
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});
