const Subscription = require("../models/Subscriptions");
const Club = require("../models/Club");
const moment = require("moment");
const cron = require("cron");

async function refreshSubscriptions() {
  const subscriptionTypes = [
    "90Minutes",
    "30Minutes",
    "60Minutes",
    "120Minutes",
  ];
  const subscriptions = await Subscription.find({
    type: { $in: subscriptionTypes },
  });

  const clubs = await Club.find({});

  for (const club of clubs) {
    const clubSubscriptions = subscriptions.filter(
      (subscription) => subscription.club.toString() === club._id.toString()
    );

    if (club.to && club.from) {
      const toTime = moment(club.to, "HH:mm");
      const taskTime = moment().set({
        hour: toTime.hours(),
        minute: toTime.minutes(),
        second: 0,
        millisecond: 0,
      });

      
      scheduleTask(taskTime, clubSubscriptions);
    } else {
      const endOfDay = moment()
        .endOf("day")
        .set({ hour: 23, minute: 59, second: 0, millisecond: 0 });

      scheduleTask(endOfDay, clubSubscriptions);
    }
  }
}

function scheduleTask(time, subscriptions) { 

  const job = new cron.CronJob(
    `0 ${time.minute()} ${time.hour()} * * *`, // Cron time string for 17:30 every day
    async function () {
    

      for (const subscription of subscriptions) {
        subscription.endData = moment(subscription.endData).add(1, "day");
        subscription.startData = moment(subscription.startData).add(1, "day");
        subscription.gymsCount = subscription.gymsCountFixed;
        await subscription.save();
        console.log(`Subscription updated: ${subscription._id}`);
      }
    },
    null,
    true,
    "Africa/Cairo"
  );

  job.start();
}

// You can call the refreshSubscriptions function to trigger the scheduling of tasks
// refreshSubscriptions();

module.exports = {
  refreshSubscriptions,
};
