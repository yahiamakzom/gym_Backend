// const expressAsyncHandler = require("express-async-handler");
// const userSub = require("../models/userSub");
// module.exports = expressAsyncHandler(async (req, res, next) => {
//   await userSub.find({ expired: false }).then(async (subs) => {
//     if (subs.length) {
//       subs.forEach(async (sub) => {
//         const end_date = sub.end_date;
//         const freezenDate = sub.freezenDate || Date.now()
//         if (end_date.getTime() < Date.now()) {
//           await userSub.findByIdAndUpdate(sub.id, { expired: true });
//         }
//         if (freezenDate.getTime() < Date.now()) {
//           await userSub.findByIdAndUpdate(sub.id, { isfreezen: false });
//         }
//       });
//     }
//   });
//   next();
// });
const expressAsyncHandler = require("express-async-handler");
const userSub = require("../models/userSub");
const moment = require("moment");

module.exports = expressAsyncHandler(async (req, res, next) => {
  await userSub.find({ expired: false }).then(async (subs) => {
    if (subs.length) {
      subs.forEach(async (sub) => { 
        const now = moment.utc();
        const end_date = moment.utc(sub.end_date).endOf("minute");
        const freezenDate = sub.freezenDate
          ? moment(sub.freezenDate).utc()
          : moment().utc;

        if (end_date && end_date.isBefore(now)) {
          await userSub.findByIdAndUpdate(sub.id, { expired: true });
        }
        if (freezenDate && freezenDate.isBefore(now)) {
          await userSub.findByIdAndUpdate(sub.id, { isfreezen: false });
        }
      });
    }
  });
  next();
});
