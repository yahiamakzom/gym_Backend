const expressAsyncHandler = require("express-async-handler");
const userSub = require("../models/userSub");
module.exports = expressAsyncHandler(async (req, res, next) => {
  await userSub.find({ expired: false }).then(async (subs) => {
    if (subs.length) {
      subs.forEach(async (sub) => {
        const end_date = sub.end_date;
        const freezenData = sub.freezenData || Date.now()
        if (end_date.getTime() < Date.now()) {
          await userSub.findByIdAndUpdate(sub.id, { expired: true });
        }
        if (freezenData.getTime() < Date.now()) {
          await userSub.findByIdAndUpdate(sub.id, { isfreezen: false });
        }
      });
    }
  });
  next();
});
