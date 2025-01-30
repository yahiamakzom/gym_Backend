const Club = require("../models/Club");
const cron = require("cron");

async function scheduleClubWorkOff(clubId, days) {
   console.log('enter to task')
  const daysPeriod = parseInt(days);
  console.log(`Scheduling job to run in ${daysPeriod} days.`);

  const club = await Club.findById(clubId);
  console.log(`Initial isWork value: ${club.isWork}`);

  // Calculate the date when the job should run
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + daysPeriod);

  const targetDay = targetDate.getDate();
  const targetMonth = targetDate.getMonth() + 1; // getMonth() is zero-indexed

  // Cron time string to run at 00:00 (midnight) on the target day of the target month
  const cronTime = `0 0 ${targetDay} ${targetMonth} *`;

  console.log(`Cron time set to: ${cronTime}`);

  const job = new cron.CronJob(
    cronTime,
    async function () {
      club.isWork = false;
      await club.save();
      console.log('isWork set to false');
      job.stop(); // Stop the job after execution
    },
    null,
    true,
    "Africa/Cairo"
  );

  job.start();
}

module.exports = {
  scheduleClubWorkOff,
};
