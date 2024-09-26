const Club = require("../models/Club");
const asyncHandler = require("express-async-handler");
const Subscriptions = require("../models/Subscriptions");
const ApiError = require("../utils/ApiError");
const User = require("../models/User");
const userSub = require("../models/userSub");
const { getLocationName } = require("../utils/Map");
const Bank = require("../models/BankData");
const cloudinary = require("cloudinary").v2;
const { scheduleClubWorkOff } = require("../helper/clubDays");
const moment = require("moment");
const DiscountCode = require("../models/DiscountCode");
const CLubOrder = require("../models/ClubOrder");
const ClubHours = require("../models/clubHours");
const TransferOrder = require("../models/TransferOrder");

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

      clubOpenTime = moment().set({ hour: 12, minute: 0, second: 0 }); // Set clubOpenTime to 7:00 AM today
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
    } else {
      subscriptionDuration = 2;
    }

    let numberOfSubscriptions = Math.floor(totalHours / subscriptionDuration);
    let subs = [];

    console.log(numberOfSubscriptions);
    console.log(isAllDay);

    try {
      for (let i = 0; i < numberOfSubscriptions; i++) {
        let startData = moment(clubOpenTime).toDate(); // Convert to Date object
        startData.setTime(
          startData.getTime() + i * subscriptionDuration * 60 * 60 * 1000
        );

        let endData = moment(clubOpenTime).toDate(); // Convert to Date object
        endData.setTime(
          endData.getTime() + (i + 1) * subscriptionDuration * 60 * 60 * 1000
        );

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
    yogaCardData,
    mapUrl,
    isWork,
    daysOf,
  } = req.body;
  const parsedYogaCardData = JSON.parse(yogaCardData);

  // Now you can access the parsedYogaCardData as an object
  console.log(parsedYogaCardData);
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
          yogaSessions: [...parsedYogaCardData],
          WorkingDays: uniqueCheckedDays,
          sports: uniqueCheckedItemsSports,
          isWork: isWork,
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
          yogaSessions: [...parsedYogaCardData],
          isWork: isWork,
          WorkingDays: uniqueCheckedDays,
          sports: uniqueCheckedItemsSports,
        },
        { new: true }
      ).then(async (newclub) => {
        if (daysOf) {
          newclub.isWork = false;
          await newclub.save();
          scheduleClubWorkOff(newclub._id, daysOf);
        }
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

exports.BankData = asyncHandler(async (req, res, next) => {
  try {
    // Find the user by their ID
    const user = await User.findById(req.user.id);

    if (!user) {
      console.log("User not found.");
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // If the user has a club associated with them
    if (user.club) {
      // Find the club using the club ID associated with the user
      const club = await Club.findById(user.club);

      if (!club) {
        console.log("Club not found.");
        return res
          .status(404)
          .json({ success: false, message: "Club not found" });
      }

      // Extract bank account data from req.body
      const { name, phone, bankName, bankAccountNumber, bankAccountName } =
        req.body;

      if (
        !name ||
        !phone ||
        !bankName ||
        !bankAccountNumber ||
        !bankAccountName
      ) {
        return res.status(400).json({
          success: false,
          message: "Please provide all bank account details",
        });
      }

      // Check if the club already has bank account information
      club.bankAccount = {
        name,
        phone,
        bankName,
        bankAccountName,
        bankAccountNumber,
      };

      // Save the club instance with the updated or inserted bank account data
      await club.save();

      res.status(200).json({ success: true, data: club });
    } else {
      console.log("User is not associated with any club.");
      return res.status(404).json({
        success: false,
        message: "User is not associated with any club",
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

exports.getClubBankAccount = async (req, res, next) => {
  try {
    // Find the user by their ID
    const user = await User.findById(req.user.id);

    if (!user) {
      console.log("User not found.");
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // If the user has a club associated with them
    if (user.club) {
      // Find the club using the club ID associated with the user
      const club = await Club.findById(user.club);

      if (!club) {
        console.log("Club not found.");
        return res
          .status(404)
          .json({ success: false, message: "Club not found" });
      }

      // Extract bank account details from the club object
      const bankAccount = club.bankAccount;

      // Return the bank account details in the response
      return res.status(200).json({ success: true, data: bankAccount || {} });
    } else {
      console.log("User is not associated with any club.");
      return res.status(404).json({
        success: false,
        message: "User is not associated with any club",
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
exports.getClubEarns = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const user = await User.findById(userId);

  // Find the club by its ID
  const club = await Club.findById(user.club);
  if (!club) {
    return next(new ApiError("Club Not Found", 404));
  }

  // Fetch all subscriptions belonging to the club
  const subscriptions = await Subscriptions.find({ club: club._id });

  // Initialize variables to store earnings
  let dailyEarnings = 0;
  let monthlyEarnings = 0;
  let yearlyEarnings = 0;

  // Get current date, month, and year
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // Month is zero-based
  const currentYear = currentDate.getFullYear();

  // Iterate over each subscription
  for (const subscription of subscriptions) {
    // Determine if the subscription is daily, monthly, or yearly
    const isDailySubscription = [
      "يومي",
      "60Minutes",
      "30Minutes",
      "90Minutes",
      "120Minutes",
    ].includes(subscription.type);
    const isMonthlySubscription = [
      "يومي",
      "شهري",
      "60Minutes",
      "30Minutes",
      "90Minutes",
      "120Minutes",
    ].includes(subscription.type);
    const isYearlySubscription = [
      "يومي",
      "شهري",
      "سنوي",
      "60Minutes",
      "30Minutes",
      "90Minutes",
      "120Minutes",
    ].includes(subscription.type);

    // Find user subscriptions corresponding to this subscription
    const userSubscriptions = await userSub.find({
      subscription: subscription._id,
      expired: false,
      club: club._id,
    });

    for (const userSubscription of userSubscriptions) {
      const startDate = new Date(userSubscription.start_date);
      if (
        (isDailySubscription &&
          startDate.toDateString() === currentDate.toDateString()) ||
        (isMonthlySubscription && startDate.getMonth() + 1 === currentMonth) ||
        (isYearlySubscription && startDate.getFullYear() === currentYear)
      ) {
        switch (subscription.type) {
          case "يومي":
          case "شهري":
          case "سنوي":
          case "60Minutes":
          case "30Minutes":
          case "90Minutes":
          case "120Minutes":
            yearlyEarnings += subscription.price;

          case "يومي":
          case "شهري":

          case "60Minutes":
          case "30Minutes":
          case "90Minutes":
          case "120Minutes":
            monthlyEarnings += subscription.price;

          case "60Minutes":
          case "30Minutes":
          case "90Minutes":
          case "120Minutes":
            dailyEarnings += subscription.price;
            break;

          default:
            break;
        }
      }
    }
  }

  // Respond with the calculated earnings
  res.status(200).json({
    dailyEarnings: dailyEarnings.toFixed(2),
    monthlyEarnings: monthlyEarnings.toFixed(2),
    yearlyEarnings: monthlyEarnings.toFixed(2),
  });
});

exports.getCLubsReportsAdded = asyncHandler(async (req, res, next) => {
  try {
    let clubs = [];
    const { id } = req.body;
    const allClubs = await Club.find({});
    const clubAdmin = await Club.findById(id);
    if (!clubAdmin) return res.json({ clubs_report: [] });
    allClubs.forEach((club) => {
      if (club.ClubAdd == clubAdmin._id) {
        clubs.push(club);
      }
    });
    if (clubs.length < 0) return res.json({ clubs_report: [] });
    const filterClubs = await Promise.all(
      clubs.map(async (club) => {
        const subscriptions = await Subscriptions.find({ club: club.id });
        let all_players = (
          await userSub.find({ club: club.id, expired: false })
        ).length;

        let players_day = 0,
          players_month = 0,
          players_year = 0,
          players_week = 0,
          players_120Minutes = 0,
          players_90Minutes = 0,
          players_60Minutes = 0,
          players_30Minutes = 0,
          appGymsDay = 0,
          appGymsMonth = 0,
          appGymsYear = 0,
          appGymsWeek = 0,
          appGyms120Minutes = 0,
          appGyms90Minutes = 0,
          appGyms60Minutes = 0,
          appGyms30Minutes = 0,
          day = 0,
          month = 0,
          year = 0,
          week = 0,
          minutes120 = 0,
          minutes90 = 0,
          minutes60 = 0,
          minutes30 = 0;

        for (const sub of subscriptions) {
          let playersCount = (await userSub.find({ subscription: sub.id }))
            .length;
          const price = Number(sub.price);
          const commission = Number(club.commission);
          const commission_price = (price * commission) / 100;

          switch (sub.type.trim()) {
            case "يومي":
              players_day += playersCount;
              appGymsDay += commission_price * playersCount;
              day += (price - commission_price) * playersCount;
              break;
            case "شهري":
              players_month += playersCount;
              appGymsMonth += commission_price * playersCount;
              month += (price - commission_price) * playersCount;
              break;
            case "اسبوعي":
              players_week += playersCount;
              appGymsWeek += commission_price * playersCount;
              week += (price - commission_price) * playersCount;
              break;
            case "سنوي":
              players_year += playersCount;
              appGymsYear += commission_price * playersCount;
              year += (price - commission_price) * playersCount;
              break;
            case "120Minutes":
              players_120Minutes += playersCount;
              appGyms120Minutes += commission_price * playersCount;
              minutes120 += (price - commission_price) * playersCount;
              break;
            case "90Minutes":
              players_90Minutes += playersCount;
              appGyms90Minutes += commission_price * playersCount;
              minutes90 += (price - commission_price) * playersCount;
              break;
            case "60Minutes":
              players_60Minutes += playersCount;
              appGyms60Minutes += commission_price * playersCount;
              minutes60 += (price - commission_price) * playersCount;
              break;
            case "30Minutes":
              players_30Minutes += playersCount;
              appGyms30Minutes += commission_price * playersCount;
              minutes30 += (price - commission_price) * playersCount;
              break;
            default:
              break;
          }
        }

        return {
          club_name: club.name,
          club_city: club.city,
          club_players: all_players,
          day: day.toFixed(2),
          month: month.toFixed(2),
          year: year.toFixed(2),
          week: week.toFixed(2),
          minutes120: minutes120.toFixed(2),
          minutes90: minutes90.toFixed(2),
          minutes60: minutes60.toFixed(2),
          minutes30: minutes30.toFixed(2),
        };
      })
    );

    res.json({ clubs_report: filterClubs });
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

exports.getClubMangerClubs = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const user = await User.findById(userId);
  const club = await Club.findById(user.club);
  if (!club) {
    return next(new ApiError("Club Not Found", 404));
  }
  const allClubs = await Club.find({ ClubAdd: club._id });

  res.json({ clubs: allClubs, success: true });
});

exports.scheduleClubSuspension = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { start, end, isTemporarilyStopped } = req.body;

  const club = await Club.findById(id);
  if (!club) {
    return next(new ApiError("Club Not Found", 404));
  }
  console.log(start, end);

  if (start && end && new Date(start) <= new Date(end)) {
    // Update the stop schedule
    club.stopSchedule.start = new Date(start);
    club.stopSchedule.end = new Date(end);

    club.isTemporarilyStopped = false;
    club.isActive = false;

    await club.save();
  } else {
    club.isTemporarilyStopped = true;
    club.isActive = false;
    await club.save();
  }

  res
    .status(200)
    .json({ success: true, message: "Club status updated", data: club });
});

exports.removeClubSuspension = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const club = await Club.findById(id);
  if (!club) {
    return next(new ApiError("Club Not Found", 404));
  }

  // Remove the suspension
  club.stopSchedule.start = null;
  club.stopSchedule.end = null;
  club.isTemporarilyStopped = false;
  club.isActive = true;

  await club.save();

  res
    .status(200)
    .json({ success: true, message: "Club suspension removed", data: club });
});

exports.addDiscount = asyncHandler(async (req, res, next) => {
  const { id } = req.params; // ID of the club to associate with the discount
  const { code, discountPercentage, validFrom, validTo } = req.body; // Discount details

  // Find the club by ID
  const club = await Club.findById(id);
  if (!club) {
    return next(new ApiError("Club Not Found", 404));
  }

  // Validate the discount percentage
  if (discountPercentage < 0 || discountPercentage > 100) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid discount percentage" });
  }

  // Create a new discount code

  const discountCode = new DiscountCode({
    code,
    discountPercentage,
    validFrom: validFrom ? new Date(validFrom) : Date.now(),
    validTo: validTo ? new Date(validTo) : null,
    club: id,
  });

  // Save the discount code to the database
  await discountCode.save();

  res.status(201).json({
    success: true,

    data: discountCode,
  });
});

exports.getDiscount = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Find the discount code by ID
  const discountCode = await DiscountCode.findById(id);

  // Check if the discount code exists
  if (!discountCode) {
    return res
      .status(404)
      .json({ success: false, message: "Discount code not found" });
  }

  res.status(200).json({
    success: true,

    data: discountCode,
  });
});

exports.getAllDiscounts = asyncHandler(async (req, res, next) => {
  // Retrieve all discount codes from the database
  const id = req.params.id;
  const discounts = await DiscountCode.find({ club: id });

  res.status(200).json({
    success: true,
    count: discounts.length,
    data: discounts,
  });
});

exports.deleteDiscount = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const discounts = await DiscountCode.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Discount codes deleted successfully",
  });
});

exports.addBankAccount = asyncHandler(async (req, res) => {
  const { ownerName, iban, bankName, club } = req.body;

  // Validation: Ensure all fields are provided
  if (!ownerName || !iban || !bankName || !club) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  // Create a new bank account
  const existClubAccount = await Bank.findOne({ club });
  if (existClubAccount) {
    return res
      .status(400)
      .json({ success: false, message: "Bank account already exists" });
  }
  const newBankAccount = new Bank({
    ownerName,
    iban,
    bankName,
    club,
  });

  // Save the bank account to the database
  await newBankAccount.save();

  res.status(201).json({
    success: true,
    message: "Bank account added successfully",
    data: newBankAccount,
  });
});

exports.getBankAccountById = asyncHandler(async (req, res) => {
  const { id } = req.params;
console.log(id)
  const bankAccount = await Bank.findOne({ club:id });

  if (!bankAccount) {
    return res
      .status(200)
      .json({ success: false, message: "Bank account not found" });
  }

  res.status(200).json({
    success: true,
    message: "Bank account retrieved successfully",
    data: bankAccount,
  });
});

exports.updateBankAccount = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { ownerName, iban, bankName } = req.body;

  // Find the bank account by ID and update it
  const updatedBankAccount = await Bank.findByIdAndUpdate(
    id,
    { ownerName, iban, bankName },
    { new: true, runValidators: true }
  );

  if (!updatedBankAccount) {
    return res
      .status(404)
      .json({ success: false, message: "Bank account not found" });
  }

  res.status(200).json({
    success: true,
    message: "Bank account updated successfully",
    data: updatedBankAccount,
  });
});

exports.createClubHours = asyncHandler(async (req, res) => {
  const { club, day, gender, openTime, closeTime, isOpen } = req.body;

  // Validation: Ensure all required fields are provided
  if (!club || !day || !gender || !openTime || !closeTime) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  // Validation: Ensure isOpen is a boolean
  if (typeof isOpen !== "undefined" && typeof isOpen !== "boolean") {
    return res
      .status(400)
      .json({ success: false, message: "isOpen must be a boolean value" });
  }

  // Create a new club hours entry
  const newClubHours = new ClubHours({
    club,
    day,
    gender,
    openTime,
    closeTime,
    isOpen: isOpen !== undefined ? isOpen : true, // Default to true if not provided
  });

  // Save the new club hours to the database
  await newClubHours.save();

  res.status(201).json({
    success: true,
    message: "Club hours added successfully",
    data: newClubHours,
  });
});

exports.getAllClubHours = asyncHandler(async (req, res) => {
  const { clubId } = req.params;

  // Find all club hours for the specified club ID
  const clubHours = await ClubHours.find({ club: clubId });

  if (!clubHours) {
    return res.status(404).json({
      success: false,
      message: "No club hours found for this club",
    });
  }

  res.status(200).json({
    success: true,
    message: "Club hours retrieved successfully",
    data: clubHours,
  });
});

exports.updateClubHours = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { day, gender, openTime, closeTime, isOpen } = req.body; // Updated fields

  // Validate required fields
  if (!day || !gender || !openTime || !closeTime || isOpen === undefined) {
    return res.status(400).json({
      success: false,
      message:
        "All fields are required: day, gender, openTime, closeTime, and isOpen",
    });
  }

  // Update the club hours by ID
  const updatedClubHours = await ClubHours.findByIdAndUpdate(
    id,
    { day, gender, openTime, closeTime, isOpen },
    { new: true, runValidators: true }
  );

  if (!updatedClubHours) {
    return res.status(404).json({
      success: false,
      message: "Club hours not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Club hours updated successfully",
    data: updatedClubHours,
  });
});

exports.createTransferOrder = async (req, res) => {
  try {
    const { clubId } = req.params;
    const { amount, transferCause } = req.body;

    if (!amount || !transferCause) {
      return res
        .status(400)
        .json({ message: "Amount and transfer cause are required" });
    }

    // Find the bank account associated with the club ID
    const bankAccount = await Bank.findOne({ club: clubId });

    if (!bankAccount) {
      return res
        .status(404)
        .json({ message: "Bank account not found for the provided club " });
    }

    // Create the transfer order using the bank account details
    const transferOrder = new TransferOrder({
      amount,
      transferCause,
      iban: bankAccount.iban, // Get IBAN from the bank account
      ownerName: bankAccount.ownerName, // Get owner name from the bank account
      club: clubId,
    });

    // Save the transfer order to the database
    await transferOrder.save();

    // Respond with the created transfer order
    return res
      .status(201)
      .json({ message: "Transfer order created successfully", transferOrder });
  } catch (error) {
    console.error("Error creating transfer order:", error.message);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

exports.isCodeValid = async (req, res) => {
  try {
    const code = req.body.code;
    const id = req.params.id;
    const club = await Club.findById(id);
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }
    club.clubMemberCode == code
      ? res.status(200).json({
          status: true,
          data: { message: "Code is valid", isValid: true },
        })
      : res.status(400).json({
          status: false,
          data: { message: "Code is not valid", isValid: false },
        });
  } catch (error) {
    console.error("Error creating transfer order:", error.message);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
exports.clubReports;
