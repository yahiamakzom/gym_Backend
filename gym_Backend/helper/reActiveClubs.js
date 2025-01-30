const { CronJob } = require("cron");
const Club = require("../models/Club");

const job = new CronJob("0 0 * * *", async () => {
  try {

    const now = new Date();
    const clubsToReactivate = await Club.find({
      isTemporarilyStopped: true,
      "stopSchedule.end": { $lte: now },
    });

    // Reactivate each club
    for (const club of clubsToReactivate) {
      await club.reactivateIfNeeded();
      console.log(`Club ${club._id} has been reactivated.`);
    }

    console.log(`Reactivation job completed for ${clubsToReactivate.length} clubs.`);
  } catch (error) {
    console.error("Error during club reactivation:", error);
  }
});

const startClubReactivationJob = () => {
  job.start();
  console.log("Scheduled job for reactivating clubs has been set up.");
};

module.exports = startClubReactivationJob;
