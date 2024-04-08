const Club = require("../models/Club");
const asyncHandler = require("express-async-handler");
const Subscriptions = require("../models/Subscriptions");
const ApiError = require("../utils/ApiError");
const User = require("../models/User");
const userSub = require("../models/userSub");
const { getLocationName } = require("../utils/Map");
const cloudinary = require("cloudinary").v2;
const moment = require("moment");
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

exports.addSubscreptions = asyncHandler(async (req, res, next) => {
  const clubId = req.user.id;
  const {
    name,
    price,
    type,
    numberType,
    freezeCountTime,
    freezeTime,
    gymsCount,
  } = req.body;

  // Find the club by ID and populate the club field to access its commission
  const club = await User.findById(clubId).populate("club");

  if (!club) {
    return next(new ApiError("Club not found", 404));
  }

  // Calculate the price with commission percentage
  const commissionPercentage = club.club ? club.club.commission : 0; // Default to 0 if club is not found

  const priceWithCommission = Math.ceil(
    price * (1 + commissionPercentage / 100)
  );

  // Check if subscription with the same name, type, and numberType exists
  const exists = await Subscriptions.findOne({
    club: club.club,
    type,
    numberType,
  });
  if (exists) {
    return next(new ApiError("Subscription found with this name", 403));
  }

  if (
    (club.club.sports.length === 1 && club.club.sports[0] === "بادل") ||
    (club.club.sports.length === 1 && club.club.sports[0] === "الأنشطة الأخرى")
  ) {
    let clubOpen = club.club.from;
    let clubStop = club.club.to;
    const isAllDay = club.club.allDay;
    let clubOpenTime = moment(clubOpen, "hh:mm A");
    let clubStopTime = moment(clubStop, "hh:mm A");
    let duration = moment.duration(clubStopTime.diff(clubOpenTime));
    let totalMinutes = duration.asMinutes();

    // Convert total minutes to hours (rounding down to the nearest integer)
    let totalHours = Math.floor(totalMinutes / 60);
    if (isAllDay) {
      totalHours = 24;

      clubOpenTime = moment().set({ hour: 7, minute: 0, second: 0 }); // Set clubOpenTime to 7:00 AM today
      clubStopTime = moment(clubOpenTime).add(1, "day");
    }
    console.log("Duration in hours:", totalHours);
    console.log(type);

    let subscriptionType = type;
    let subscriptionDuration;

    if (subscriptionType === "30Minutes") {
      subscriptionDuration = 0.5; // 30 minutes
    } else if (subscriptionType === "60Minutes") {
      subscriptionDuration = 1; // 60 minutes
    } else if (subscriptionType === "90Minutes") {
      subscriptionDuration = 1.5; // 90 minutes
    }

    let numberOfSubscriptions = Math.floor(totalHours / subscriptionDuration);
    let subs = [];

    console.log(numberOfSubscriptions);
    console.log(isAllDay);

    try {
      for (let i = 0; i < numberOfSubscriptions; i++) {
        let startData = moment(clubOpenTime).toDate(); // Convert to Date object
        startData.setHours(startData.getHours() + i * subscriptionDuration);

        let endData = moment(clubOpenTime).toDate(); // Convert to Date object
        endData.setHours(endData.getHours() + (i + 1) * subscriptionDuration);

        const sub = await Subscriptions.create({
          club: club.club,
          name,
          price: priceWithCommission,
          type,
          startData,
          endData,
          gymsCount: gymsCount,
          gymsCountFixed: gymsCount,
        });
        subs.push(sub);
        console.log(sub);
      }
    } catch (error) {
      console.error(error);
      return next(new ApiError("Internal Server Error", 500));
    } finally {
      res.status(201).json({ sub: subs });
      return;
    }
  }

  // // Create the subscription
  const sub = await Subscriptions.create({
    club: club.club,
    name,
    price: priceWithCommission,
    type,
    numberType,
    freezeTime,
    freezeCountTime,
  });

  console.log(sub);
  res.status(201).json({ sub });
});

exports.getSubscriptions = asyncHandler(
  async (req, res, next) =>
    await User.findById(req.user.id).then(
      async (club) =>
        await userSub
          .find({ club: club.club })
          .populate({ path: "user", select: "username home_location code" })
          .populate({ path: "club", select: "name  location" })
          .populate({ path: "subscription", select: "name " })
          .then((all) => res.json({ all }))
    )
);

exports.searchSubscreptions = asyncHandler(async (req, res, next) => {
  await User.findById(req.user.id).then(async (user) => {
    await userSub
      .findOne({ code: req.query.code, club: user.club })
      .populate({ path: "user", select: "username  code" })
      .populate({ path: "subscription", select: "name price " })
      .then((player) =>
        player
          ? res.json({ player })
          : next(new ApiError("player not found", 404))
      );
  });
});

exports.editClub = asyncHandler(async (req, res, next) => {
  const club_id = req.user.id;
  const {
    name,
    lat,
    long,
    description,
    gender,
    from,
    to,
    allDay,
    checkedDays,
    checkedItemsSports,
    discountCode,
    discountQuantity,
    mapUrl,
  } = req.body;
  const uniqueCheckedDays = checkedDays.split(",");
  const uniqueCheckedItemsSports = checkedItemsSports.split(",");
  console.log(uniqueCheckedDays, uniqueCheckedItemsSports);
  let imgs_path =
    req.files &&
    req.files.clubImg &&
    (await Promise.all(
      req.files.clubImg.map(async (img) => {
        const uploadImg = await cloudinary.uploader.upload(img.path);
        return uploadImg.secure_url;
      })
    ));
  let logo =
    req.files &&
    req.files.logo &&
    (await cloudinary.uploader.upload(req.files.logo[0].path)).secure_url;
  let place_name;
  if (lat && long) {
    place_name = await getLocationName(lat, long);
    if (!place_name) return next(new ApiError("Location Not Found", 404));
  }
  let newDiscount = { discountCode: null, discountQuantity: null };
  if (discountCode && discountQuantity) {
    newDiscount = {
      discountCode: discountCode,
      discountQuantity: discountQuantity,
    };
  }

  await User.findById(club_id).then(async (club) => {
    if (!club) return next(new ApiError("Club Not Found", 404));
    if (allDay == "false" || allDay == undefined) {
      await Club.findByIdAndUpdate(
        club.club,
        {
          $push: { discounts: newDiscount },
          name: name && name,
          country:
            place_name &&
            `${place_name.split(",")[place_name.split(",").length - 1]}`,
          city:
            place_name &&
            `${place_name.split(",")[place_name.split(",").length - 2]}`,
          location: place_name && place_name,
          description: description && description,
          gender: gender && gender,
          images: imgs_path && imgs_path,
          logo: logo && logo,
          lat: place_name && Number(lat),
          long: place_name && Number(long),
          from: from && from,
          to: to && to,
          allDay: false,
          mapUrl: mapUrl && mapUrl,

          WorkingDays: uniqueCheckedDays,
          sports: uniqueCheckedItemsSports,
        },
        { new: true }
      ).then((newclub) => {
        console.log(newclub);
        res.json({ club: newclub });
      });
    } else {
      await Club.findByIdAndUpdate(
        club.club,
        {
          $push: { discounts: newDiscount },

          name: name && name,
          country:
            place_name &&
            `${place_name.split(",")[place_name.split(",").length - 1]}`,
          city:
            place_name &&
            `${place_name.split(",")[place_name.split(",").length - 2]}`,
          location: place_name && place_name,
          description: description && description,
          gender: gender && gender,
          images: imgs_path && imgs_path,
          logo: logo && logo,
          lat: place_name && Number(lat),
          long: place_name && Number(long),
          allDay,
          from: null,
          mapUrl: mapUrl && mapUrl,
          to: null,
          WorkingDays: uniqueCheckedDays,
          sports: uniqueCheckedItemsSports,
        },
        { new: true }
      ).then((newclub) => {
        console.log(newclub);
        res.json({ club: newclub });
      });
    }
  });
});

exports.editSubscription = asyncHandler(async (req, res, next) => {
  const { id } = req.user;
  const { subId } = req.params;
  await User.findById(id).then(async (club) => {
    await Subscriptions.findById(subId).then(async (sub) => {
      if (!sub) return next(new ApiError("Subscription not found", 404));
      const { name, price, type } = req.body;
      await Subscriptions.findByIdAndUpdate(
        subId,
        { name: name && name, price: price && price, type: type && type },
        { new: true }
      ).then((newsub) => res.json({ sub: newsub }));
    });
  });
});

exports.deleteSubscription = asyncHandler(async (req, res, next) => {
  const { id } = req.user;
  const { subId } = req.params;
  await User.findById(id).then(async (club) => {
    await Subscriptions.findById(subId).then(async (sub) => {
      if (!sub) return next(new ApiError("Subscription not found", 404));
      await userSub
        .findOne({ subscription: sub.id, expired: false })
        .then(async (userSub) => {
          if (userSub)
            return next(
              new ApiError(
                "Can't Delete This Subscription Because Already Have Players Subscriptions",
                409
              )
            );
          else
            await Subscriptions.findByIdAndDelete(subId).then(() =>
              res.sendStatus(200)
            );
        });
    });
  });
});

exports.clubReports;
