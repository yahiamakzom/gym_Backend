const { CronJob } = require("cron");
const DiscountCode = require("../models/DiscountCode");

const job = new CronJob("0 0 * * *", async () => {
  try {
    const result = await DiscountCode.deleteExpiredDiscounts();
    console.log(
      `Expired discount codes have been deleted: ${result.deletedCount} removed.`
    );
  } catch (error) {
    console.error("Error deleting expired discount codes:", error);
  }
});

const startDiscountCleanupJob = () => {
  job.start();
  console.log(
    "Scheduled job for cleaning up expired discount codes has been set up."
  );
};

module.exports = startDiscountCleanupJob;
