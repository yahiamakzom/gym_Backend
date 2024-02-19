const Club = require("../models/Club");
const Blog = require("../models/Blog");
const Opinion = require("../models/Opinion");
const asyncHandler = require("express-async-handler");
const Subscriptions = require("../models/Subscriptions");
const userSub = require("../models/userSub.js");
const User = require("../models/User.js");
const Rules = require("../models/Rules");
const userReports = require("../models/userReports");
const Favorite = require("../models/Favorite");
const ApiError = require("../utils/ApiError");
const paypal = require("paypal-rest-sdk");
const axios = require("axios");
const { calcDistance, calculateDistance } = require("../utils/Map");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const { body, validationResult } = require("express-validator");
const { log } = require("console");
const Activities = require("../models/Activities.js");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

exports.getRules = asyncHandler(async (req, res) => {
  if (req.query.type && req.query.type === "banner") {
    const banner = await Rules.find({ type: "banner" });
    if (!banner) res.json({ banner: "" });
    else {
      const images = banner.map((banner) => banner.banner_img);
      res.json({ banner: images });
    }
  } else if (req.query.type === "app_bg") {
    const app_bg = await Rules.findOne({ type: "app_bg" });
    if (!app_bg) res.json({ app_bg: "" });
    else res.json({ app_bg: app_bg.app_bg });
  } else {
    res.json({ rules: await Rules.find({}) });
  }
});
exports.GetActivities = asyncHandler(async (req, res, next) => {
  try {
    const activities = await Activities.find();
    res.status(200).json({ activities });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
exports.makeReport = asyncHandler(
  async (req, res) =>
    await userReports
      .create({
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        message: req.body.message,
      })
      .then(() => res.sendStatus(201))
);

exports.getClubs = asyncHandler(async (req, res, next) => {
  const { lat, long } = req.body;

  // Retrieve all clubs
  const clubs = await Club.find({});

  // Retrieve subscription prices for type "يومي" for all clubs
  const subscriptionPrices = await Promise.all(
    clubs.map(async (club) => {
      const dailySubscription = await Subscriptions.findOne({
        club: club._id,
        type: "يومي", // Filter by subscription type
      });
      const price = dailySubscription ? dailySubscription.price : null;
      return { clubId: club._id, price };
    })
  );

  const countries = {};
  for (const club of clubs) {
    if (countries[club.country]) {
      countries[club.country].push(club.city);
    } else {
      countries[club.country] = [club.city];
    }
  }

  if (lat && long) {
    const clubsWithDistance = [];
    for (const [index, club] of clubs.entries()) {
      const distance = await calcDistance(
        `${club.lat},${club.long}`,
        `${lat},${long}`
      );
      if (!distance) return next(new ApiError("Invalid distance", 400));
      clubsWithDistance.push({
        ...club.toObject(),
        distance: distance && distance,
        subscriptionPrice: subscriptionPrices[index].price,
      });
    }

    res.json({ Clubs: clubsWithDistance, countries });
  } else {
    const clubsWithPrices = clubs.map((club, index) => ({
      ...club.toObject(),
      subscriptionPrice: subscriptionPrices[index].price,
    }));
    res.json({ Clubs: clubsWithPrices, countries });
  }
});

// exports.getMinClubs=asyncHandler(async (req, res, next) => {
//     try {
//         const minSubscriptions = await Subscriptions.aggregate([
//             {
//               $match: { type: 'يومي' }
//             },
//             {
//               $addFields: {
//                 pricePerDay: { $divide: ['$price', '$numberType'] }
//               }
//             },
//             {
//               $sort: { pricePerDay: 1 }
//             },
//             {
//               $lookup: {
//                 from: 'clubs', // Replace 'clubs' with the actual collection name for clubs
//                 localField: 'club',
//                 foreignField: '_id',
//                 as: 'club'
//               }
//             },
//             {
//               $unwind: '$club'
//             }
//           ]);

//         if(minSubscriptions)
//         return res.json(minSubscriptions);
//         else
//         return res.json([]);
//       } catch (error) {
//         // Handle error if needed
//         console.error(error);
//         throw new Error('Failed to get daily subscriptions.');
//       }
// });

exports.getMinClubs = asyncHandler(async (req, res, next) => {
  try {
    const { lat, long } = req.body;
    const minSubscriptions = await Subscriptions.aggregate([
      {
        $match: { type: "يومي" },
      },
      {
        $addFields: {
          pricePerDay: { $divide: ["$price", "$numberType"] },
        },
      },
      {
        $sort: { pricePerDay: 1 },
      },
      {
        $lookup: {
          from: "clubs", // Replace 'clubs' with the actual collection name for clubs
          localField: "club",
          foreignField: "_id",
          as: "club",
        },
      },
      {
        $unwind: "$club",
      },
    ]);

    const clubs = minSubscriptions.map((subscription) => subscription.club);
    const subscriptionPrices = await Promise.all(
      clubs.map(async (club) => {
        const dailySubscription = await Subscriptions.findOne({
          club: club._id,
          type: "يومي", // Filter by subscription type
        });
        const price = dailySubscription ? dailySubscription.price : null;
        return { clubId: club._id, price };
      })
    );
    //   return res.json({Clubs:clubs});
    const countries = {};
    for (const club of clubs) {
      if (countries[club.country]) {
        countries[club.country].push(club.city);
      } else {
        countries[club.country] = [club.city];
      }
    }
    if (lat && long) {
      const clubsWithDistance = [];
      for (const [index, club] of clubs.entries()) {
        let distance;

        distance = await calcDistance(
          `${club.lat},${club.long}`,
          `${lat},${long}`
        );
        if (!distance) return next(new ApiError("Invalid distance", 400));
        clubsWithDistance.push({
          ...club.toObject(),
          distance: distance && distance,
          subscriptionPrice: subscriptionPrices[index].price,
        });
      }

      res.json({ Clubs: clubsWithDistance, countries });
    } else {
      const clubsWithPrices = [];
      for (const [index, club] of clubs.entries()) {
        clubsWithPrices.push({
          ...club,
          subscriptionPrice: subscriptionPrices[index].price,
        });
      }
      // Sort clubsWithPrices by subscriptionPrice in ascending order
      clubsWithPrices.sort((a, b) => {
        const priceA = a.subscriptionPrice || Number.MAX_SAFE_INTEGER;
        const priceB = b.subscriptionPrice || Number.MAX_SAFE_INTEGER;
        return priceA - priceB;
      });
      res.json({ Clubs: clubsWithPrices, countries });
    }
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get min clubs.");
  }
});

exports.getClub = asyncHandler(async (req, res, next) => {
  const { lat, long } = req.body;
  await Club.findById(req.params.club_id).then(async (club) => {
    await Subscriptions.find({ club: req.params.club_id }).then(
      async (subscriptions) => {
        if (lat && long) {
          let distance = await calcDistance(
            `${club.lat},${club.long}`,
            `${lat},${long}`
          );
          if (!distance) return next(new ApiError("Invalid distance", 400));
          res.json({ club, distance, subscriptions });
        } else res.json({ club, subscriptions });
      }
    );
  });
});

exports.getClubAuth = asyncHandler(async (req, res, next) => {
  const { id } = req.user;
  const { lat, long } = req.query;
  const { club_id } = req.params;
  await Club.findById(club_id).then(async (club) => {
    await Subscriptions.find({ club: req.params.club_id }).then(
      async (subscriptions) =>
        await userSub
          .findOne({ club: club_id, user: id, expired: false })
          .populate({
            path: "subscription",
            select: "name price type numberType",
          })
          .then(async (sub) => {
            if (lat && long) {
              let start_date, end_date;
              if (sub && sub.subscription) {
                const { type, numberType } = sub.subscription;
                const startDate = moment().startOf("day");

                if (type === "شهري") {
                  end_date = moment(startDate)
                    .add(numberType, "months")
                    .endOf("day");
                } else if (type === "سنوي") {
                  end_date = moment(startDate)
                    .add(numberType, "years")
                    .endOf("day");
                } else if (type === "اسبوعي") {
                  end_date = moment(startDate)
                    .add(numberType, "weeks")
                    .endOf("day");
                } else if (type === "يومي") {
                  end_date = moment(startDate)
                    .add(numberType, "days")
                    .endOf("day");
                }

                if (end_date) {
                  start_date = startDate.format("DD-MM-YYYY");
                  end_date = end_date.format("DD-MM-YYYY");
                }
              }
              // let distance = await calcDistance(
              //   `${club.lat},${club.long}`,
              //   `${lat},${long}`
              // );
              let distance;
              distance = calculateDistance(
                `${club.lat}`,
                `${club.long}`,
                `${lat}`,
                `${long}`
              );
              if (!distance) return next(new ApiError("Invalid distance", 400));
              const isFave = await Favorite.findOne({
                club_id: req.params.club_id,
                user: id,
              });
              res.json({
                club,
                isFave: isFave ? true : false,
                distance,
                subscriptions,
                sub: sub ? true : false,
                data: sub
                  ? {
                      id: sub.id,
                      username: (await User.findById(sub.user)).username,
                      club_name: club.name,
                      club_location: club.location,
                      // start_date: `${sub.start_date.getDate()}-${sub.start_date.getMonth() + 1}-${sub.start_date.getFullYear()}`,
                      // end_date: `${sub.end_date.getDate()}-${sub.end_date.getMonth() + 1}-${sub.end_date.getFullYear()}`,
                      start_date,
                      end_date,
                      subscription_id: sub.subscription.id,
                      subscription_name: sub.subscription.name,
                      subscription_price: sub.subscription.price,
                      code: sub.code,
                      expired: sub.expired,
                    }
                  : {},
              });
            } else {
              const user = await User.findById(sub.user);
              res.json({
                club,
                isFave: isFave ? true : false,
                subscriptions,
                sub: sub ? true : false,
                data: sub
                  ? {
                      id: sub.id,
                      username: (await User.findById(sub.user)).username,
                      club_name: club.name,
                      club_location: club.location,
                      start_date: `${sub.start_date.getDate()}-${
                        sub.start_date.getMonth() + 1
                      }-${sub.start_date.getFullYear()}`,
                      end_date: `${sub.end_date.getDate()}-${
                        sub.end_date.getMonth() + 1
                      }-${sub.end_date.getFullYear()}`,
                      subscription_id: sub.subscription.id,

                      subscription_name: sub.subscription.name,
                      subscription_price: sub.subscription.price,
                      code: sub.code,
                      expired: sub.expired,
                    }
                  : {},
              });
            }
          })
    );
  });
});

exports.userMakeSub = asyncHandler(async (req, res, next) => {
  const { subId } = req.params;
  const { id } = req.user;
  const { type } = req.query;
  await Subscriptions.findById(subId).then(async (sub) => {
    const club = sub.club;
    await userSub
      .findOne({ user: id, club, expired: false })
      .then(async (check) => {
        await Subscriptions.findById(subId).then(async (subscription) => {
          if (!subscription)
            return next(new ApiError("Can't find subscription", 404));
          if (type === "paypal") {
            await Rules.findOne({ payment_type: "paypal", active: true }).then(
              (payment) => {
                if (!payment)
                  return next(new ApiError("PayPal Payment Not Found", 404));
                paypal.configure({
                  mode: payment.mode,
                  client_id: payment.clientId,
                  client_secret: payment.clientSecert,
                });
                const paymentData = {
                  intent: "sale",
                  payer: {
                    payment_method: "paypal",
                  },
                  redirect_urls: {
                    return_url: process.env.REDIRECT_URL_SUCCESS,
                    cancel_url: process.env.REDIRECT_URL_CANCEL,
                  },
                  transactions: [
                    {
                      amount: {
                        total: `${subscription.price}`,
                        currency: "USD",
                      },
                      description: "Club Subscription",
                    },
                  ],
                };
                paypal.payment.create(paymentData, (err, payment) => {
                  if (err)
                    return next(new ApiError(err.message, err.statusCode));
                  const approvalUrl = payment.links.find(
                    (link) => link.rel === "approval_url"
                  ).href;
                  res.json({ approvalUrl });
                });
              }
            );
          } else if (type === "wallet") {
            await User.findById(id).then(async (user) => {
              if (user.wallet < subscription.price * 3.75)
                return next(
                  new ApiError("Your Balance in Wallet Not Enough", 400)
                );
              else {
                const start_date = new Date(Date.now());
                let end_date = new Date(Date.now());
                end_date =
                  subscription.type === "يومي"
                    ? end_date.setDate(end_date.getDate() + 1)
                    : subscription.type === "اسبوعي"
                    ? end_date.setDate(end_date.getDate() + 7)
                    : subscription.type === "شهري"
                    ? end_date.setMonth(end_date.getMonth() + 1)
                    : subscription.type === "سنوي" &&
                      end_date.setFullYear(end_date.getFullYear() + 1);
                await userSub
                  .create({
                    user: id,
                    club: subscription.club,
                    subscription,
                    start_date,
                    end_date,
                    code: user.code,
                  })
                  .then(async () => {
                    user.wallet -= Number(subscription.price) * 3.75;
                    await user.save();
                    res.sendStatus(200);
                  });
              }
            });
          }
        });
      });
  });
});

exports.renewClubByWallet = asyncHandler(async (req, res, next) => {
  const { id } = req.user;
  const { subId } = req.params;
  const { userSubId } = req.body;
  await Subscriptions.findById(subId).then(async (sub) => {
    const club = sub.club;

    await Subscriptions.findById(subId).then(async (subscription) => {
      if (!subscription)
        return next(new ApiError("Can't find subscription", 404));
      await User.findById(id).then(async (user) => {
        if (user.wallet < subscription.price * 3.75)
          return next(new ApiError("Your Balance in Wallet Not Enough", 400));
        else {
          const start_date = new Date(Date.now());
          let end_date = new Date(Date.now());
          end_date =
            subscription.type === "يومي"
              ? end_date.setDate(end_date.getDate() + 1)
              : subscription.type === "اسبوعي"
              ? end_date.setDate(end_date.getDate() + 7)
              : subscription.type === "شهري"
              ? end_date.setMonth(end_date.getMonth() + 1)
              : subscription.type === "سنوي" &&
                end_date.setFullYear(end_date.getFullYear() + 1);
          await userSub.findById(userSubId).then(async (sub) => {
            if (!sub)
              return next(
                new ApiError(
                  "Can't Find User Pervious Subscription Please Add userSubId",
                  404
                )
              );
            await userSub
              .findByIdAndUpdate(
                userSubId,
                { start_date, end_date, expired: false },
                { new: true }
              )
              .then((sub) => res.json({ sub }));
          });
        }
      });
    });
  });
});

exports.hyperCheckout = asyncHandler(async (req, res, next) => {
  const { price } = req.body;
  brand = "visa";

  const { id } = req.user;
  const https = require("https");
  const querystring = require("querystring");

  const request = async () => {
    const path = "/v1/checkouts";
    let entityId;

    if (!brand) {
      return Promise.reject(new Error("brand is required"));
    }

    console.log("Brand: " + brand);

    entityId = "8a8294174b7ecb28014b9699220015ca";
    //for test
    // if (brand == "visa" || brand == "mastercard" || brand == "stcpay") {
    //   entityId = "8ac7a4c789cce7da0189cef121f1010e";
    // } else if (brand == "mada") {
    //   entityId = "8ac7a4c789cce7da0189cef21f1b0112";
    // } else if (brand == "applepay") {
    //   entityId = "8ac7a4c88ac93f4f018acc6f1377032b";
    // } else {
    //   return Promise.reject(new Error("brand is not valid"));
    // }
    // for prod
    if (brand == "visa" || brand == "mastercard" || brand == "stcpay") {
      entityId = "8ac9a4c88c152af8018c34bdd8db1eda";
    } else if (brand == "mada") {
      entityId = "8ac9a4c88c152af8018c34be7f601ee3";
    } else if (brand == "applepay") {
      entityId = "8ac9a4c88c152af8018c34bf34461eec";
    } else {
      return Promise.reject(new Error("brand is not valid"));
    }

    const data = querystring.stringify({
      entityId,
      amount: 1,
      currency: "SAR",
      paymentType: "DB",
      //  Also please remove testMode=EXTERNAL and customParameters[3DS2_enrolled]=true from this step's code, as they are only required for testing
      // "customParameters[3DS2_enrolled]": true,
      // merchantTransactionId: req.body["merchantTransactionId"],
      // "customer.email": req.body["customer.email"],
      // "billing.street1": req.body["billing.street1"],
      // "billing.city": req.body["billing.city"],
      // "billing.state": req.body["billing.state"],
      // "billing.country": req.body["billing.country"],
      // "billing.postcode": req.body["billing.postcode"],
      // "customer.givenName": req.body["customer.givenName"],
      // "customer.surname": req.body["customer.surname"],
      merchantTransactionId: Math.floor(Math.random() * 900) + 100,
      "customer.email": "mostafa@gmail.com",
      // "customer.givenName": "Mostafa",
      // "customer.surname": "Mostafa",
      // "billing.street1": "30 March Street",
      // "billing.city": "Naghmade",
      // "billing.state": "Qena",
      // "billing.country": "EG",
      // "billing.postcode": "83511",
    });

    console.log("Data: ");
    console.log(data);

    const options = {
      port: 443,
      host: "eu-prod.oppwa.com",
      // host: "eu-test.oppwa.com",
      path: path,
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": data.length,
        Authorization:
          "Bearer OGFjOWE0Yzg4YzE1MmFmODAxOGMzNGJkNDk5NzFlZDJ8cXRqMnlhR0Y0ZVQ5UHFKcA==",
        // "Bearer OGFjN2E0Yzc4OWNjZTdkYTAxODljZWYwYTYxMTAxMGF8S3czc3lqRk5Hdw==",
      },
    };

    return new Promise((resolve, reject) => {
      const postRequest = https.request(options, function (res) {
        const buf = [];
        res.on("data", (chunk) => {
          buf.push(Buffer.from(chunk));
        });
        res.on("end", () => {
          const jsonString = Buffer.concat(buf).toString("utf8");
          try {
            resolve(JSON.parse(jsonString));
          } catch (error) {
            reject(error);
          }
        });
      });

      postRequest.on("error", reject);
      postRequest.write(data);
      postRequest.end();
    });
  };

  request()
    .then((response) => res.send(response))
    .catch(console.error);
});

exports.checkPaymentNew = asyncHandler(async (req, res, next) => {
  const { brand } = req.body;
  const { paymentId } = req.params;
  const { id } = req.user;
  const https = require("https");
  const querystring = require("querystring");
  let entityId;

  if (!brand) {
    return Promise.reject(new Error("brand is required"));
  }
  //for test
  // if (brand == "visa" || brand == "mastercard" || brand == "stcpay") {
  //   entityId = "8ac7a4c789cce7da0189cef121f1010e";
  // } else if (brand == "mada") {
  //   entityId = "8ac7a4c789cce7da0189cef21f1b0112";
  // } else if (brand == "applepay") {
  //   entityId = "8ac7a4c88ac93f4f018acc6f1377032b";
  // } else {
  //   return Promise.reject(new Error("brand is not valid"));
  // }

  if (brand == "visa" || brand == "mastercard" || brand == "stcpay") {
    entityId = "8ac9a4c88c152af8018c34bdd8db1eda";
  } else if (brand == "mada") {
    entityId = "8ac9a4c88c152af8018c34be7f601ee3";
  } else if (brand == "applepay") {
    entityId = "8ac7a4c88ac93f4f018acc6f1377032b";
  } else {
    return Promise.reject(new Error("brand is not valid"));
  }
  const request = async () => {
    var path = `/v1/checkouts/${paymentId}/payment`;
    // path += "?entityId=8a8294174b7ecb28014b9699220015ca";

    path += `?entityId=${entityId}`;
    const options = {
      port: 443,
      host: "eu-prod.oppwa.com",
      // host: "eu-test.oppwa.com",
      path: path,
      method: "GET",
      headers: {
        Authorization:
          "Bearer OGFjOWE0Yzg4YzE1MmFmODAxOGMzNGJkNDk5NzFlZDJ8cXRqMnlhR0Y0ZVQ5UHFKcA==",
        // "Bearer OGFjN2E0Yzc4OWNjZTdkYTAxODljZWYwYTYxMTAxMGF8S3czc3lqRk5Hdw==",
      },
    };

    return new Promise((resolve, reject) => {
      const postRequest = https.request(options, function (res) {
        const buf = [];
        res.on("data", (chunk) => {
          buf.push(Buffer.from(chunk));
        });
        res.on("end", () => {
          const jsonString = Buffer.concat(buf).toString("utf8");
          try {
            resolve(JSON.parse(jsonString));
          } catch (error) {
            reject(error);
          }
        });
      });
      postRequest.on("error", reject);
      postRequest.end();
    });
  };

  request()
    .then(async (response) => {
      console.log(response);
      console.log(response.result.parameterErrors);
      if (response) {
        res.status(200).json(response);
      } else {
        res.status(422).json({
          status: "cancel",
        });
      }
    })
    .catch(console.error);
});

exports.checkPayment = asyncHandler(async (req, res, next) => {
  const { paymentId, subId } = req.params;
  const { userSubId } = req.query;
  const { id } = req.user;
  console.log(req.query);
  console.log(paymentId, subId, id, userSubId);

  const https = require("https");
  const querystring = require("querystring");

  const request = async () => {
    var path = `/v1/checkouts/${paymentId}/payment`;
    path += "?entityId=8ac9a4c88c152af8018c34bdd8db1eda";

    const options = {
      port: 443,
      host: "eu-prod.oppwa.com",
      // host: "eu-test.oppwa.com",
      path: path,
      method: "GET",
      headers: {
        Authorization:
          "Bearer OGFjOWE0Yzg4YzE1MmFmODAxOGMzNGJkNDk5NzFlZDJ8cXRqMnlhR0Y0ZVQ5UHFKcA==",
      },
    };

    return new Promise((resolve, reject) => {
      const postRequest = https.request(options, function (res) {
        const buf = [];
        res.on("data", (chunk) => {
          buf.push(Buffer.from(chunk));
        });
        res.on("end", () => {
          const jsonString = Buffer.concat(buf).toString("utf8");
          try {
            resolve(JSON.parse(jsonString));
          } catch (error) {
            reject(error);
          }
        });
      });
      postRequest.on("error", reject);
      postRequest.end();
    });
  };

  request()
    .then(async (response) => {
      console.log(response);
      console.log(response.result.parameterErrors);
      if (response.id) {
        const userId = id.trim();
        const subscriptionId = userSubId.trim();
        const userData = await User.findById(userId);

        await Subscriptions.findById(subscriptionId).then(
          async (subscription) => {
            if (!subscription)
              return next(new ApiError("Can't find subscription", 404));
            const start_date = new Date(Date.now());
            let end_date = new Date(Date.now());
            end_date =
              subscription.type === "يومي"
                ? end_date.setDate(end_date.getDate() + 1)
                : subscription.type === "اسبوعي"
                ? end_date.setDate(end_date.getDate() + 7)
                : subscription.type === "شهري"
                ? end_date.setMonth(end_date.getMonth() + 1)
                : subscription.type === "سنوي" &&
                  end_date.setFullYear(end_date.getFullYear() + 1);
            userSub
              .create({
                user: userId,
                club: subscription.club,
                subscription,
                start_date,
                end_date,
                code: userData.code,
              })
              .then(() =>
                res.status(200).json({
                  status: "success",
                })
              );
          }
        );
      } else {
        res.status(422).json({
          status: "cancel",
        });
      }
    })
    .catch(console.error);
});

exports.confirmPayment = asyncHandler(async (req, res, next) => {
  const { subId } = req.params;
  const { paymentId, payerId, userSubId } = req.body;
  const { id } = req.user;
  const userData = await User.findById(id);
  await Subscriptions.findById(subId).then(async (subscription) => {
    if (!subscription)
      return next(new ApiError("Can't find subscription", 404));
    await Rules.findOne({ payment_type: "paypal", active: true }).then(
      (payment) => {
        paypal.configure({
          mode: payment.mode,
          client_id: payment.clientId,
          client_secret: payment.clientSecert,
        });
        paypal.payment.execute(
          paymentId,
          { payer_id: payerId },
          async (error, succesPayment) => {
            if (error) {
              console.log(error);
              res.status(500).send("Payment execution failed");
            } else {
              const start_date = new Date(Date.now());
              let end_date = new Date(Date.now());
              end_date =
                subscription.type === "يومي"
                  ? end_date.setDate(end_date.getDate() + 1)
                  : subscription.type === "اسبوعي"
                  ? end_date.setDate(end_date.getDate() + 7)
                  : subscription.type === "شهري"
                  ? end_date.setMonth(end_date.getMonth() + 1)
                  : subscription.type === "سنوي" &&
                    end_date.setFullYear(end_date.getFullYear() + 1);
              if (userSubId) {
                await userSub.findById(userSubId).then(async (sub) => {
                  if (!sub)
                    return next(
                      new ApiError("Can't Find User Pervious Subscription", 404)
                    );
                  await userSub
                    .findByIdAndUpdate(
                      userSubId,
                      { start_date, end_date, expired: false },
                      { new: true }
                    )
                    .then((sub) => res.json({ sub }));
                });
              } else
                userSub
                  .create({
                    user: id,
                    club: subscription.club,
                    subscription,
                    start_date,
                    end_date,
                    code: userData.code,
                  })
                  .then(() => res.status(200).send("Payment successful"));
            }
          }
        );
      }
    );
  });
});

exports.userFreezing = asyncHandler(async (req, res, next) => {
  const { userSubId, freeze } = req.body;

  const freezeDuration = parseInt(freeze);

  if (isNaN(freezeDuration) || freezeDuration <= 0) {
    return next(new ApiError("Invalid freeze duration", 400));
  }

  const userSub = await userSub.findById(userSubId).populate("subscription");
  if (!userSub) {
    return next(new ApiError("User subscription not found", 404));
  }

  let { freezeCountTime, freezeTime } = userSub.subscription;

  if (freezeCountTime <= 0) {
    return next(new ApiError("Freeze count time must be greater than 0", 400));
  }

  if (freezeDuration > freezeTime) {
    return next(new ApiError("Freeze duration exceeds maximum allowed", 400));
  }

  freezeCountTime--;

  const newEndDate = new Date(userSub.end_date);
  newEndDate.setDate(newEndDate.getDate() + freezeDuration);

  userSub.end_date = newEndDate;

  await userSub.save();

  userSub.subscription.freezeCountTime = freezeCountTime;
  await userSub.subscription.save();

  res
    .status(200)
    .json({ message: "User subscription frozen successfully", newEndDate });
});

exports.getUserWallet = asyncHandler(async (req, res, next) => {
  const { id } = req.user;
  let total_price = 0;
  await User.findById(id).then(async (user) => {
    await userSub.find({ user: id }).then(async (subs) => {
      if (subs.length > 0) {
        const filterSubs = await Promise.all(
          subs.map(async (sub) => {
            const club = (await Club.findById(sub.club)) || {
              name: "",
              logo: "",
            };
            const subscription = await Subscriptions.findById(sub.subscription);
            total_price += Number(subscription.price);
            return {
              _id: sub._id,
              expired: sub.expired,
              code: sub.code,
              club_id: club._id,
              subscriptionId: subscription._id,
              subprice: subscription.price,
              type: subscription.type,
              club_name: club.name,
              club_logo: club.logo,
              start_date: sub.start_date,
              end_date: sub.end_date,
              expired: sub.expired,
            };
          })
        );

        res.json({ subs: filterSubs, wallet: user.wallet, total_price });
      } else {
        res.json({ subs: [], wallet: user.wallet, total_price });
      }
    });
  });
});

exports.depositWallet = asyncHandler(async (req, res, next) => {
  const { amount } = req.body;
  const { type } = req.query;
  if (type === "paypal") {
    await Rules.findOne({ payment_type: "paypal", active: true }).then(
      (payment) => {
        if (!payment)
          return next(new ApiError("PayPal Payment Not Found", 404));
        paypal.configure({
          mode: payment.mode,
          client_id: payment.clientId,
          client_secret: payment.clientSecert,
        });
        const paymentData = {
          intent: "sale",
          payer: {
            payment_method: "paypal",
          },
          redirect_urls: {
            return_url: process.env.REDIRECT_URL_SUCCESS,
            cancel_url: process.env.REDIRECT_URL_CANCEL,
          },
          transactions: [
            {
              amount: {
                total: `${amount}`,
                currency: "USD",
              },
              description: "Wallet Deposit",
            },
          ],
        };
        paypal.payment.create(paymentData, (err, payment) => {
          if (err) return next(new ApiError(err.message, err.statusCode));
          const approvalUrl = payment.links.find(
            (link) => link.rel === "approval_url"
          ).href;
          res.json({ approvalUrl });
        });
      }
    );
  }
});

exports.confirmDeposit = asyncHandler(async (req, res, next) => {
  const { id } = req.user;
  const { paymentId, payerId, amount } = req.body;
  const user = await User.findById(id);
  await Rules.findOne({ payment_type: "paypal", active: true }).then(
    (payment) => {
      paypal.configure({
        mode: payment.mode,
        client_id: payment.clientId,
        client_secret: payment.clientSecert,
      });
      paypal.payment.execute(
        paymentId,
        { payer_id: payerId },
        async (error, succesPayment) => {
          if (error) {
            console.log(error);
            res.status(500).send("Payment execution failed");
          } else {
            user.wallet += Number(amount);
            await user.save();
            res.sendStatus(200);
          }
        }
      );
    }
  );
});

exports.searchClubByName = asyncHandler(async (req, res, next) => {
  const { country, city, gender, sportType } = req.body;
  console.log(req.body);

  await Club.find({
    $or: [
      { country, gender, city: { $regex: new RegExp(`.*${city}.*`, "i") } },
      { sports: { $in: [sportType] } }, // Add this line to filter by sportType
    ],
  }).then((clubs) => res.json({ clubs }));
});
exports.searchClub = asyncHandler(async (req, res, next) => {
  const { search } = req.query; // User input for searching
  const Clubs = await Club.find().or([
    { name: { $regex: search, $options: "i" } },
    { city: { $regex: search, $options: "i" } },
    { location: { $regex: search, $options: "i" } },
  ]);
  const subscriptionPrices = await Promise.all(
    Clubs.map(async (club) => {
      const dailySubscription = await Subscriptions.findOne({
        club: club._id,
        type: "يومي", // Filter by subscription type
      });
      const price = dailySubscription ? dailySubscription.price : null;
      return { clubId: club._id, price };
    })
  );
  const clubsWithPrices = [];
  for (const [index, club] of Clubs.entries()) {
    Clubs[index] = {
      ...Clubs[index].toObject(),
      subscriptionPrice: subscriptionPrices[index].price,
    };
    // clubsWithPrices.push({
    // ...club,
    // subscriptionPrice: subscriptionPrices[index].price,
    // });
  }
  res.json({ Clubs });
});
// find clubs  by Activity
exports.getClubByActivity = asyncHandler(async (req, res, next) => {
  try {
    const filterCondition = req.body.filterCondition;
    console.log(filterCondition);
    const result = await Club.find({
      sports: { $elemMatch: { $eq: filterCondition } },
    });
    res.status(200).json({ result });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});
exports.filterClubs = asyncHandler(async (req, res, next) => {
  const { filter } = req.query;
  const { lat, long } = req.query;
  await Club.find({}).then(async (clubs) => {
    const subscriptionPrices = await Promise.all(
      clubs.map(async (club) => {
        const dailySubscription = await Subscriptions.findOne({
          club: club._id,
          type: "يومي", // Filter by subscription type
        });
        const price = dailySubscription ? dailySubscription.price : null;
        return { clubId: club._id, price };
      })
    );
    if (filter === "nearby") {
      const clubsWithDistance = [];
      for (const [index, club] of clubs.entries()) {
        console.log(club.lat, club.long);
        console.log(lat, long);
        let distance;
        // distance = await calcDistance(
        //   `${club.lat},${club.long}`,
        //   `${lat},${long}`
        // );
        distance = calculateDistance(
          `${club.lat}`,
          `${club.long}`,
          `${lat}`,
          `${long}`
        );
        if (!distance) return next(new ApiError("Invalid distance", 400));
        clubsWithDistance.push({
          ...club.toObject(),
          distance: distance && distance,
          subscriptionPrice: subscriptionPrices[index].price,
        });
      }
      res.json({
        Clubs: clubsWithDistance.sort(
          (a, b) =>
            Number(a.distance.split(" ")[0].replace(",", "")) -
            Number(b.distance.split(" ")[0].replace(",", ""))
        ),
      });
    } else if (filter === "lowest") {
      const clubs = await Club.find({}).lean();
      const subscriptionPrices = await Promise.all(
        clubs.map(async (club) => {
          const dailySubscription = await Subscriptions.findOne({
            club: club._id,
            type: "يومي", // Filter by subscription type
          });
          const price = dailySubscription ? dailySubscription.price : null;
          return { clubId: club._id, price };
        })
      );
      const clubIds = clubs.map((club) => club._id);
      const lowestSubscriptions = await Subscriptions.aggregate([
        {
          $match: {
            club: { $in: clubIds },
          },
        },
        {
          $group: {
            _id: "$club",
            lowestPrice: { $min: "$price" },
          },
        },
      ]);
      const sortedClubs = clubs.map((club) => {
        const lowestSubscription = lowestSubscriptions.find(
          (subscription) => subscription._id.toString() === club._id.toString()
        );
        if (lowestSubscription) {
          club.lowestSubscriptionPrice = lowestSubscription.lowestPrice;
        } else {
          club.lowestSubscriptionPrice = null; // or any default value if there is no subscription
        }

        return club;
      });

      sortedClubs.sort(
        (a, b) => a.lowestSubscriptionPrice - b.lowestSubscriptionPrice
      );

      const clubsWithPrices = [];
      for (const [index, club] of sortedClubs.entries()) {
        clubsWithPrices.push({
          ...club,
          subscriptionPrice: subscriptionPrices[index].price,
        });
      }
      res.json({ Clubs: clubsWithPrices });
    } else if (filter === "best") {
      await Club.aggregate([
        {
          $lookup: {
            from: "usersubs",
            localField: "_id",
            foreignField: "club",
            as: "subscriptions",
          },
        },
        {
          $sort: { subscriptionCount: -1 },
        },
      ]).then((Clubs) => res.json({ Clubs }));
    }
  });
});

exports.userBooking = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  await userSub.find({ user: req.user.id }).then(async (subs) => {
    if (!subs.length > 0) return res.status(200).json({ subs: [] });
    const filterSubs = await Promise.all(
      subs.map(async (sub) => {
        const club = (await Club.findById(sub.club)) || { name: "", logo: "" };
        const subscription = await Subscriptions.findById(sub.subscription);
        const expire_in =
          !sub.expired &&
          Math.ceil(
            Math.abs(sub.end_date - new Date(Date.now())) /
              (1000 * 60 * 60 * 24)
          );
        return {
          _id: sub._id,
          club_id: sub.club,
          club_name: club.name,
          club_days: club.days,
          club_logo: club.logo,
          start_date: sub.start_date,
          end_date: sub.end_date,
          expired: sub.expired,
          price: subscription.price,
          type: subscription.type,
          expire_in: expire_in ? expire_in : "finished",
        };
      })
    );
    res.json({ subs: filterSubs });
  });
});

exports.getUserFav = asyncHandler(async (req, res, next) => {
  await Favorite.find({ user: req.user.id })
    .populate({
      path: "club_id",
      select: "-__v", // Select all fields except __v
    })
    .populate({
      path: "user",
      select: "home_location",
    })
    .then(async (data) => {
      const modifiedData = await Promise.all(
        data.map(async (fav) => {
          // Extract relevant club data
          const clubData = fav.club_id;
          const dailySubscription = await Subscriptions.findOne({
            club: clubData._id,
            type: "يومي", // Filter by subscription type
          });
          const subPrice = dailySubscription ? dailySubscription.price : 0;
          console.log(subPrice);
          // Modify club data if needed
          // Example: clubData.someField = newValue;

          // Add the modified club data to the favorite object
          const modifiedFav = {
            ...fav.toObject(),
            subscriptionPrice: subPrice,
          };
          return modifiedFav;
        })
      );

      res.json({ data: modifiedData });
    });
});
exports.addOrRemoveFav = asyncHandler(async (req, res, next) => {
  const { club_id } = req.params;
  const { id } = req.user;
  await Favorite.findOne({ club_id, user: id }).then(async (fav) => {
    console.log(await Favorite.find({}));
    if (fav)
      await Favorite.findByIdAndDelete(fav.id).then(() => res.sendStatus(200));
    else {
      let price = 0;
      const club = await Club.findById(club_id);
      const subs = await Subscriptions.find({ club: club_id }).sort({
        price: 1,
      });
      if (subs.length) {
        price = subs[0].price;
      }
      await Favorite.create({
        club_id,
        user: id,
        club_logo: club.logo,
        club_name: club.name,
        price,
      }).then(() => res.sendStatus(200));
    }
  });
});
exports.isFav = asyncHandler(async (req, res, next) => {
  const { club_id } = req.params;
  const { id } = req.user;
  await Favorite.findOne({ club_id, user: id }).then(async (fav) => {
    console.log(await Favorite.find({}));
    if (fav) {
      res.status(200).json({ isFav: true });
      return;
    } else {
      res.status(200).json({ isFav: false });
      return;
    }
  });
});

exports.getprofile = asyncHandler(async (req, res, next) => {
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];
  try {
    const decodedToken = jwt.decode(token);
    const userId = decodedToken.id;
    const user = await User.findById(userId);

    if (user) {
      user.token = token;
      return res.json(user);
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (e) {
    res.send(e);
  }
});

exports.updateProfile = async (req, res, next) => {
  try {
    await body("username")
      .optional()
      .notEmpty()
      .withMessage("Username is required.")
      .run(req);
    await body("home_location")
      .optional()
      .notEmpty()
      .withMessage("Home location is required.")
      .run(req);
    await body("phone")
      .optional()
      .notEmpty()
      .withMessage("Phone number is required.")
      .run(req);
    await body("email")
      .optional()
      .notEmpty()
      .withMessage("Email is required.")
      .isEmail()
      .withMessage("Invalid email format.")
      .run(req);
    await body("password")
      .optional()
      .notEmpty()
      .withMessage("Password is required.")
      .isLength({ min: 6 })
      .withMessage("Password should be at least 6 characters long.")
      .run(req);
    await body("gender")
      .optional()
      .notEmpty()
      .withMessage("Gender is required.")
      .run(req);
    await body("role")
      .optional()
      .notEmpty()
      .withMessage("Role is required.")
      .run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, home_location, phone, email, password, gender, role } =
      req.body;

    const token =
      req.headers.authorization && req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.decode(token);
    const userId = decodedToken.id;

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update only the fields that are provided in the request body
    currentUser.username = username || currentUser.username;
    currentUser.home_location = home_location || currentUser.home_location;
    currentUser.phone = phone || currentUser.phone;
    currentUser.email = email || currentUser.email;
    currentUser.password = password || currentUser.password;
    currentUser.gender = gender || currentUser.gender;
    currentUser.role = role || currentUser.role;
    currentUser.photo = currentUser.photo;
    const updatedUser = await currentUser.save();

    return res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({
      message: "Failed to update user profile. Please try again later.",
    });
  }
};
exports.getBlog = asyncHandler(async (req, res, next) => {
  const blog = await Blog.find({});
  return res.json(blog);
});
exports.getBlogById = asyncHandler(async (req, res, next) => {
  const blog = await Blog.findById(req.params.blog_id);
  return res.json(blog);
});
exports.getOpinnion = asyncHandler(async (req, res, next) => {
  const opinion = await Opinion.find({});
  return res.json(opinion);
});

exports.walletDeposit = asyncHandler(async (req, res, next) => {
  const { amount } = req.body;
  const { id } = req.user;
  const userData = await User.findById(id);
  // check if user not found
  if (!userData) return next(new ApiError("User Not Found", 404));

  // we add the amount to the user wallet
  userData.wallet += Number(amount);
  await userData.save();
  res.sendStatus(200);
});

exports.subscriptionConfirmation = asyncHandler(async (req, res, next) => {
  const { subId } = req.body;
  const { id } = req.user;
  const userData = await User.findById(id);
  const subscription = await Subscriptions.findById(subId);
  console.log(subId);
  if (!subscription) return next(new ApiError("Can't find subscription", 404));
  const start_date = new Date(Date.now());
  let end_date = new Date(Date.now());
  end_date =
    subscription.type === "يومي"
      ? end_date.setDate(end_date.getDate() + 1)
      : subscription.type === "اسبوعي"
      ? end_date.setDate(end_date.getDate() + 7)
      : subscription.type === "شهري"
      ? end_date.setMonth(end_date.getMonth() + 1)
      : subscription.type === "سنوي" &&
        end_date.setFullYear(end_date.getFullYear() + 1);
  userSub
    .create({
      user: id,
      club: subscription.club,
      subscription,
      start_date,
      end_date,
      code: userData.code,
    })
    .then(() => res.status(200).send("Payment successful"));
});
