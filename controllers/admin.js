const Club = require("../models/Club");
const Blog = require("../models/Blog");
const Opinion = require("../models/Opinion");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const bcrypt = require("bcrypt");
const Rules = require("../models/Rules");
const axios = require("axios");
const UserReports = require("../models/userReports");
const { getLocationName } = require("../utils/Map");
const Subscriptions = require("../models/Subscriptions");
const userSub = require("../models/userSub");
const Representative = require("../models/Representative ");
const cloudinary = require("cloudinary").v2;
const { sign } = require("jsonwebtoken");
const Activities = require("../models/Activities");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// exports.addClub = asyncHandler(async (req, res, next) => {
//   const {
//     name,
//     email,
//     password,
//     lat,
//     long,
//     description,
//     gender,
//     from,
//     to,
//     allDay,
//     commission,
//     repreentative_id,
//     sports,
//     days,
//     discountCode,
//     discountQuantity
//   } = req.body;

//   let SportData = sports.split(",");
//   let Days = days.split(",");
//   if (!req.files.clubImg)
//     return next(new ApiError("Please Add Club Imgs", 409));
//   if (!req.files.logo) return next(new ApiError("Please Add Club logo", 409));
//   const place_name = await getLocationName(lat, long);
//   if (!place_name) return next(new ApiError("Location Not Found", 404));
//   console.log(place_name);
//   const imgs_path = await Promise.all(
//     req.files.clubImg.map(async (img) => {
//       const uploadImg = await cloudinary.uploader.upload(img.path);
//       return uploadImg.secure_url;
//     })
//   );
//   const logo = (await cloudinary.uploader.upload(req.files.logo[0].path))
//     .secure_url;
//   await User.findOne({ email }).then(async (user) => {
//     if (user) return next(new ApiError("User With This Email is Exists", 409));
//     console.log(allDay);
//     if (allDay == "false" || allDay == undefined) {
//       await Club.create({
//         name: name.trim(),
//         country: `${place_name
//           .split(",")
//           [place_name.split(",").length - 1].trim()}`,
//         city: `${place_name
//           .split(",")
//           [place_name.split(",").length - 2].trim()}`,
//         location: place_name,
//         description,
//         gender,
//         images: imgs_path,
//         lat: Number(lat),
//         long: Number(long),
//         logo,
//         from,
//         to,
//         allDay: false,
//         commission,
//         sports: [...SportData],
//         WorkingDays: [...Days],

//         discounts: [{ discountCode, discountQuantity }]
//       }).then(async (club) => {
//         console.log(club)

//         let representative = await Representative.findById(repreentative_id);
//         if (representative) {
//           representative.clups.push(club.id);
//           representative.save();
//           console.log(representative);
//         }

//         await User.create({
//           email,
//           password: await bcrypt.hash(password, 10),
//           role: "club",
//           club: club.id,
//           home_location: place_name,
//           username: name,
//         });
//         res.status(201).json({ club });
//       });
//     } else {
//       await Club.create({
//         name: name.trim(),
//         country: `${place_name
//           .split(",")
//           [place_name.split(",").length - 1].trim()}`,
//         city: `${place_name
//           .split(",")
//           [place_name.split(",").length - 2].trim()}`,
//         location: place_name,
//         description,
//         gender,
//         images: imgs_path,
//         lat: Number(lat),
//         long: Number(long),
//         logo,
//         allDay,
//         from: null,
//         to: null,
//         commission,
//         sports: [...SportData],
//         WorkingDays: [...Days],
//         discounts: [{ discountCode, discountQuantity }]

//       }).then(async (club) => {
//         console.log(club)
//         let representative = await Representative.findById(repreentative_id);
//         if (representative) {
//           representative.clups.push(club.id);
//           representative.save();
//           console.log(representative);
//         }
//         await User.create({
//           email,
//           password: await bcrypt.hash(password, 10),
//           role: "club",
//           club: club.id,
//           home_location: place_name,
//           username: name,
//         });
//         res.status(201).json({ club });
//       });
//     }
//   });
// });

exports.addClub = asyncHandler(async (req, res, next) => {
  const {
    name,
    email,
    password,
    lat,
    long,
    description,
    gender,
    from,
    to,
    allDay,
    commission,
    repreentative_id,
    sports,
    days,
    discountCode,
    discountQuantity,
    mapUrl,
    ClubAdd,
    isAddClubs,
    clubMemberCode
  } = req.body;

  let SportData = sports.split(",");
  let Days = days.split(",");
  if (!req.files.clubImg)
    return next(new ApiError("Please Add Club Imgs", 409));
  if (!req.files.logo) return next(new ApiError("Please Add Club logo", 409));
  const place_name = await getLocationName(lat, long);
  if (!place_name) return next(new ApiError("Location Not Found", 404));
  console.log(place_name);
  const imgs_path = await Promise.all(
    req.files.clubImg.map(async (img) => {
      const uploadImg = await cloudinary.uploader.upload(img.path);
      return uploadImg.secure_url;
    })
  );
  const logo = (await cloudinary.uploader.upload(req.files.logo[0].path))
    .secure_url;
  await User.findOne({ email }).then(async (user) => {
    if (user) return next(new ApiError("User With This Email is Exists", 409));
    console.log(allDay);
    if (allDay == "false" || allDay == undefined) {
      await Club.create({
        name: name,
        country: `${place_name.split(",")[place_name.split(",").length - 1]}`,
        city: `${place_name.split(",")[place_name.split(",").length - 2]}`,
        location: place_name,
        description,
        gender,
        images: imgs_path,
        lat: Number(lat),
        long: Number(long),
        logo,
        from,
        to,
        allDay: false,
        commission,
        sports: [...SportData],
        WorkingDays: [...Days],
        mapUrl,
        ClubAdd: ClubAdd || "",
        isAddClubs: isAddClubs || false,
        clubMemberCode: clubMemberCode ,

        discounts: [{ discountCode, discountQuantity }],
      }).then(async (club) => {
        console.log(club);

        let representative = await Representative.findById(repreentative_id);
        if (representative) {
          representative.clups.push(club.id);
          representative.save();
          console.log(representative);
        }

        await User.create({
          email,
          password: await bcrypt.hash(password, 10),
          role: "club",
          club: club.id,
          home_location: place_name,
          username: name,
        });
        res.status(201).json({ club });
      });
    } else {
      await Club.create({
        name: name,
        country: `${place_name.split(",")[place_name.split(",").length - 1]}`,
        city: `${place_name.split(",")[place_name.split(",").length - 2]}`,
        location: place_name,
        description,
        gender,
        images: imgs_path,
        lat: Number(lat),
        long: Number(long),
        logo,
        allDay,
        from: null,
        to: null,
        mapUrl,
        commission,
        ClubAdd: ClubAdd || "",
        sports: [...SportData],
        WorkingDays: [...Days],
        isAddClubs: isAddClubs || false,
        clubMemberCode: clubMemberCode ,
        discounts: [{ discountCode, discountQuantity }],
      }).then(async (club) => {
        console.log(club);
        let representative = await Representative.findById(repreentative_id);
        if (representative) {
          representative.clups.push(club.id);
          representative.save();
          console.log(representative);
        }
        let hashedPassword = await bcrypt.hash(password, 10);
        if (ClubAdd) {
          const user = await User.findOne({ club: ClubAdd });
          hashedPassword = user.password;
        }
        await User.create({
          email,
          password: hashedPassword,
          role: "club",
          club: club.id,
          home_location: place_name,
          username: name,
        });
        res.status(201).json({ club });
      });
    }
  });
});

// exports.editClub = asyncHandler(async (req, res, next) => {
//   const { club_id } = req.params;
//   const { name, lat, long, description, gender, from, to, days, commission ,checkedDays,checkedItemsSports } =
//     req.body;

// const uniqueCheckedDays = checkedDays.split(',')
// const uniqueCheckedItemsSports =checkedItemsSports.split(',')
// console.log(uniqueCheckedItemsSports)
// console.log(uniqueCheckedDays)
//   let imgs_path =
//     req.files &&
//     req.files.clubImg &&
//     (await Promise.all(
//       req.files.clubImg.map(async (img) => {
//         const uploadImg = await cloudinary.uploader.upload(img.path);
//         return uploadImg.secure_url;
//       })
//     ));
//   let logo =
//     req.files &&
//     req.files.logo &&
//     (await cloudinary.uploader.upload(req.files.logo[0].path)).secure_url;
//   let place_name;
//   if (lat && long) {
//     place_name = await getLocationName(lat, long);
//     if (!place_name) return next(new ApiError("Location Not Found", 404));
//   }
//   await Club.findById(club_id).then(async (club) => {
//     if (!club) return next(new ApiError("Club Not Found", 404));
//     await Club.findByIdAndUpdate(
//       club_id,
//       {
//         name: name && name,
//         country:
//           place_name &&
//           `${place_name.split(",")[place_name.split(",").length - 1].trim()}`,
//         city:
//           place_name &&
//           `${place_name.split(",")[place_name.split(",").length - 2].trim()}`,
//         location: place_name && place_name,
//         description: description && description,
//         gender: gender && gender,
//         images: imgs_path && imgs_path,
//         logo: logo && logo,
//         lat: place_name && Number(lat),
//         long: place_name && Number(long),
//         from: from && from,
//         to: to && to,
//         days: days && days,
//         commission: commission && commission,
//       },
//       { new: true }
//     ).then((club) => res.json({ club }));
//   });
// });

exports.editClub = asyncHandler(async (req, res, next) => {
  try {
    const { club_id } = req.params;
    const {
      name,
      lat,
      long,
      description,
      gender,
      mapUrl,
      from,
      to,
      days,
      commission,
      checkedDays,
      checkedItemsSports,
      isAddClubs,
    } = req.body;

    // Split the checkedDays and checkedItemsSports strings into arrays
    const uniqueCheckedDays = checkedDays ? checkedDays.split(",") : [];
    const uniqueCheckedItemsSports = checkedItemsSports
      ? checkedItemsSports.split(",")
      : [];

    console.log(lat, long, name);

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

    let club = await Club.findById(club_id);
    if (!club) return next(new ApiError("Club Not Found", 404));

    // Update club with new data
    club.name = name || club.name;
    club.country =
      place_name &&
      `${place_name.split(",")[place_name.split(",").length - 1]}`;
    club.city =
      place_name &&
      `${place_name.split(",")[place_name.split(",").length - 2]}`;
    club.location = place_name && place_name;
    club.description = description || club.description;
    club.gender = gender || club.gender;
    club.images = imgs_path || club.images;
    club.logo = logo || club.logo;
    club.lat = place_name && Number(lat);
    club.long = place_name && Number(long);
    club.from = from || club.from;
    club.to = to || club.to;
    club.mapUrl = mapUrl || club.mapUrl;
    club.WorkingDays = uniqueCheckedDays || club.WorkingDays; // Update WorkingDays field
    club.commission = commission || club.commission;
    club.sports = uniqueCheckedItemsSports || club.sports;
    club.isAddClubs = isAddClubs || club.isAddClubs;
    // Save the updated club
    club = await club.save();
    res.json({ club });
    console.log(club);
  } catch (error) {
    console.error(error); // Log the error for debugging
    next(error);
  }
});

exports.deleteClub = asyncHandler(async (req, res, next) => {
  await Club.findById(req.params.club_id).then(async (club) => {
    if (!club) return next(new ApiError("Club Not Found", 404));
    await Club.findByIdAndDelete(club.id).then(async () => {
      await Subscriptions.deleteMany({ club: req.params.club_id });
      await userSub.deleteMany({ club: req.params.club_id });
      await User.findOneAndDelete({ club: req.params.club_id }).then(() =>
        res.sendStatus(200)
      );
    });
  });
});

// Add Rule
exports.addRule = asyncHandler(async (req, res, next) => {
  const { type } = req.query;
  if (type === "uses" || type === "privacy" || type === "wallet") {
    const { textBody } = req.body;
    if (!textBody.length)
      return next(new ApiError("Please Add a textBody", 400));
    await Rules.findOne({ type }).then(async (rule) => {
      if (rule)
        await Rules.findOneAndUpdate({ type }, { textBody }).then((uses) =>
          res.json(uses)
        );
      else
        await Rules.create({ textBody, type }).then((uses) => res.json(uses));
    });
  } else if (type === "contact_number") {
    const { phone1, phone2, location1, location2 } = req.body;
    await Rules.findOne({ type }).then(async (rule) => {
      if (rule)
        await Rules.findOneAndUpdate(
          { type },
          {
            phone1: phone1 && phone1,
            phone2: phone2 && phone2,
            location1: location1 && location1,
            location2: location2 && location2,
          },
          { new: true }
        ).then((uses) => res.json(uses));
      else
        await Rules.create({
          phone1: phone1 && phone1,
          phone2: phone2 && phone2,
          type,
          location1: location1 && location1,
          location2: location2 && location2,
        }).then((uses) => res.json(uses));
    });
  } else if (type === "main_img") {
    const main_img =
      req.file && (await cloudinary.uploader.upload(req.file.path)).secure_url;
    if (!main_img) return next(new ApiError("Please Add a main_img", 400));
    await Rules.findOne({ type }).then(async (rule) => {
      if (rule)
        await Rules.findOneAndUpdate({ type }, { main_img }).then((main_img) =>
          res.json(main_img)
        );
      else
        await Rules.create({ main_img, type }).then((main_img) =>
          res.json(main_img)
        );
    });
  } else if (type === "main_logo") {
    const main_logo =
      req.file && (await cloudinary.uploader.upload(req.file.path)).secure_url;
    if (!main_logo) return next(new ApiError("Please Add a main_logo", 400));
    await Rules.findOne({ type }).then(async (rule) => {
      if (rule)
        await Rules.findOneAndUpdate({ type }, { main_logo }).then((main_img) =>
          res.json(main_img)
        );
      else
        await Rules.create({ main_logo, type }).then((main_img) =>
          res.json(main_img)
        );
    });
  } else if (type === "app_bg") {
    const app_bg =
      req.file && (await cloudinary.uploader.upload(req.file.path)).secure_url;
    if (!app_bg && !req.body.bg_color)
      return next(new ApiError("Please Add a app_bg or bg_color", 400));
    await Rules.findOne({ type }).then(async (rule) => {
      if (rule)
        await Rules.findOneAndUpdate(
          { type },
          app_bg
            ? { app_bg, app_bg_type: "img" }
            : req.body.bg_color && {
                app_bg: "req.body.bg_color",
                app_bg_type: "color",
              },
          { new: true }
        ).then((app_bg) => res.json({ app_bg }));
      else
        await Rules.create(
          app_bg
            ? { app_bg, app_bg_type: "img", type }
            : req.body.bg_color && {
                app_bg: req.body.bg_color,
                app_bg_type: "color",
                type,
              }
        ).then((app_bg) => res.json({ app_bg }));
    });
  } else if (type === "banner") {
    const banner_imgs = await Promise.all(
      req.files.map((file) => cloudinary.uploader.upload(file.path))
    ).then((results) => results.map((result) => result.secure_url));

    if (!banner_imgs || banner_imgs.length === 0) {
      return next(new ApiError("Please add at least one banner image", 400));
    }

    await Rules.findOne({ type }).then(async (rule) => {
      if (rule) {
        await Rules.findOneAndUpdate(
          { type },
          { banner_img: banner_imgs },
          { new: true }
        ).then((banner) => res.json({ banner }));
      } else {
        await Rules.create({ banner_img: banner_imgs, type }).then((banner) =>
          res.json({ banner })
        );
      }
    });
  } else if (type === "payment") {
    const { payment_type } = req.body;
    if (payment_type === "paypal") {
      const { clientId, clientSecert, mode } = req.body;
      await axios
        .post(
          `${
            mode === "Sandbox"
              ? "https://api.sandbox.paypal.com/v1/oauth2/token"
              : "https://api.paypal.com/v1/oauth2/token"
          }`,
          null,
          {
            params: {
              grant_type: "client_credentials",
            },
            auth: {
              username: clientId,
              password: clientSecert,
            },
          }
        )
        .then(async (response) => {
          if (response.status === 200) {
            await Rules.findOne({ type, payment_type, mode }).then(
              async (exists) => {
                if (exists)
                  await Rules.findOneAndUpdate(
                    { type, payment_type, mode },
                    { clientId, clientSecert, mode }
                  ).then(async (payment) => res.status(201).json({ payment }));
                else
                  await Rules.create({
                    type,
                    payment_type,
                    clientId,
                    clientSecert,
                    mode,
                    active: false,
                  }).then(async (payment) => res.status(201).json({ payment }));
              }
            );
          }
        })
        .catch((err) => {
          console.log(err.message);
          return next(new ApiError(err.message, 401));
        });
    }
  } else if (type === "whatsapp") {
    const { whatsapp } = req.body;
    if (!whatsapp) return next(new ApiError("Whatsapp Required", 400));
    await Rules.findOne({ type }).then(async (rule) => {
      if (rule)
        await Rules.findOneAndUpdate({ type }, { whatsapp }).then((whatsapp) =>
          res.json({ whatsapp })
        );
      else
        await Rules.create({ whatsapp, type }).then((whatsapp) =>
          res.json({ whatsapp })
        );
    });
  } else if (type === "instagram") {
    const { instagram } = req.body;
    if (!instagram) return next(new ApiError("Instagram Required", 400));
    await Rules.findOne({ type }).then(async (rule) => {
      if (rule)
        await Rules.findOneAndUpdate({ type }, { instagram }).then(
          (instagram) => res.json({ instagram })
        );
      else
        await Rules.create({ instagram, type }).then((instagram) =>
          res.json({ instagram })
        );
    });
  } else if (type === "twitter") {
    const { twitter } = req.body;
    if (!twitter) return next(new ApiError("twitter Required", 400));
    await Rules.findOne({ type }).then(async (rule) => {
      if (rule)
        await Rules.findOneAndUpdate({ type }, { twitter }).then((twitter) =>
          res.json({ twitter })
        );
      else
        await Rules.create({ twitter, type }).then((twitter) =>
          res.json({ twitter })
        );
    });
  } else if (type === "questions") {
    const { question, answer } = req.body;
    if (!question || !answer)
      return next(new ApiError("Please Add Question And Answer", 400));
    await Rules.findOne({ type }).then(async (rule) => {
      if (rule)
        await Rules.findOneAndUpdate(
          { type },
          { $push: { questions: { question, answer } } }
        ).then((questions) => res.json({ questions }));
      else
        await Rules.create({ questions: [{ question, answer }], type }).then(
          (questions) => res.json({ questions })
        );
    });
  } else return next(new ApiError("Invalid Type To Be Modify", 403));
});
// Payment Activate With Paypal
exports.activePayment = asyncHandler(async (req, res, next) => {
  const { payment_id } = req.params;
  await Rules.findById(payment_id).then(async (payment) => {
    if (!payment_id) return next(new ApiError("Payment Not Found", 404));
    if (payment.mode === "sandbox") {
      await Rules.updateMany({ mode: "live" }, { active: "false" });
      await Rules.findByIdAndUpdate(payment_id, { active: true }).then(() =>
        res.sendStatus(200)
      );
    } else {
      await Rules.updateMany({ mode: "sandbox" }, { active: "false" });
      await Rules.findByIdAndUpdate(payment_id, { active: true }).then(() =>
        res.sendStatus(200)
      );
    }
  });
});

exports.getUserReports = asyncHandler(
  async (req, res, next) =>
    await UserReports.find({}).then((reports) => res.json({ reports }))
);

// exports.clubReports = asyncHandler(async (req, res, next) => {
//   await Club.find({}).then(async (clubs) => {
//     const filterClubs = await Promise.all(
//       clubs.map(async (club) => {
//         const clubsGain = await Subscriptions.find({ club: club.id }).then(
//           async (subs) => {
//             let all_players = (
//               await userSub.find({ club: club.id, expired: false })
//             ).length;
//             let players_day,
//               players_month,
//               players_week,
//               players_year,
//               players_60Minutes,
//               players_90Minutes,
//               players_30Minutes,
//               players_120Minutes;

//             players_day =
//               players_month =
//               players_year =
//               players_week =
//               players_120Minutes =
//               players_60Minutes =
//               players_90Minutes =
//               players_30Minutes =
//                 0;
//             let day,
//               month,
//               week,
//               year,
//               minutes30,
//               minutes60,
//               minutes90,
//               minutes120,
//               appGyms60Minutes,
//               appGyms120Minutes,
//               appGyms90Minutes,
//               appGyms30Minutes,
//               appGymsDay,
//               appGymsWeek,
//               appGymsMonth,
//               appGymsYear;

//             day =
//               month =
//               year =
//               week =
//               appGyms60Minutes =
//               appGyms120Minutes =
//               appGyms90Minutes =
//               appGyms30Minutes =
//               minutes30 =
//               minutes60 =
//               minutes90 =
//               minutes120 =
//               appGymsMonth =
//               appGymsYear =
//               appGymsWeek =
//               appGymsDay =
//                 0;
//             await Promise.all(
//               subs.map(async (sub) => {
//                 if (sub.type === "يومي") {
//                   players_day = (await userSub.find({ subscription: sub.id }))
//                     .length;
//                   const price = Number(sub.price);
//                   const commission = Number(club.commission);
//                   const commission_price = (price * commission) / 100;
//                   appGymsDay = commission_price;
//                   day = price - commission_price;
//                 } else if (sub.type === "شهري") {
//                   players_month = (await userSub.find({ subscription: sub.id }))
//                     .length;
//                   const price = Number(sub.price);
//                   const commission = Number(club.commission);
//                   console.log(commission);
//                   console.log(price);
//                   const commission_price = (price * commission) / 100;
//                   appGymsMonth = commission_price;
//                   month = price - commission_price;
//                 } else if (sub.type === "اسبوعي") {
//                   players_week = (await userSub.find({ subscription: sub.id }))
//                     .length;
//                   const price = Number(sub.price);
//                   const commission = Number(club.commission);
//                   const commission_price = (price * commission) / 100;
//                   console.log(commission);
//                   console.log(price);
//                   appGymsWeek = commission_price;
//                   week = price - commission_price;
//                 } else if (sub.type === "سنوي") {
//                   players_year = (await userSub.find({ subscription: sub.id }))
//                     .length;
//                   const price = Number(sub.price);
//                   const commission = Number(club.commission);
//                   const commission_price = (price * commission) / 100;
//                   appGymsYear = commission_price;
//                   console.log(commission);
//                   console.log(price);
//                   year = price - commission_price;
//                 } else if (sub.type.trim() === "120Minutes") {
//                   players_120Minutes = (
//                     await userSub.find({ subscription: sub.id })
//                   ).length;
//                   const price = Number(sub.price);
//                   const commission = Number(club.commission);
//                   const commission_price = (price * commission) / 100;
//                   appGyms120Minutes = commission_price;
//                   minutes120 = price - commission_price;
//                 } else if (sub.type.trim() === "90Minutes") {
//                   players_90Minutes = (
//                     await userSub.find({ subscription: sub.id })
//                   ).length;
//                   const price = Number(sub.price);
//                   const commission = Number(club.commission);
//                   const commission_price = (price * commission) / 100;
//                   appGyms90Minutes = commission_price;
//                   minutes90 = price - commission_price;
//                 } else if (sub.type.trim() === "60Minutes") {
//                   players_60Minutes = (
//                     await userSub.find({ subscription: sub.id })
//                   ).length;
//                   const price = Number(sub.price);
//                   const commission = Number(club.commission);
//                   const commission_price = (price * commission) / 100;
//                   appGyms60Minutes = commission_price;
//                   minutes60 = price - commission_price;
//                 } else if (sub.type.trim() === "30Minutes") {
//                   players_30Minutes = (
//                     await userSub.find({ subscription: sub.id })
//                   ).length;
//                   const price = Number(sub.price);
//                   const commission = Number(club.commission);
//                   const commission_price = (price * commission) / 100;
//                   appGyms30Minutes = commission_price;
//                   minutes30 = price - commission_price;
//                 }
//               })
//             );
//             return {
//               club_name: club.name,
//               club_city: club.city,
//               club_players: all_players,
//               day: (day * players_day).toFixed(2),
//               month: (month * players_month).toFixed(2),
//               year: (year * players_year).toFixed(2),
//               week: (week * players_week).toFixed(2),
//               minutes120: (minutes120 * players_120Minutes).toFixed(2),
//               minutes90: (minutes90 * players_90Minutes).toFixed(2),
//               minutes60: (minutes60 * players_60Minutes).toFixed(2),
//               minutes30: (minutes30 * players_30Minutes).toFixed(2),
//               appGyms120Minutes: (
//                 appGyms120Minutes * players_120Minutes
//               ).toFixed(2),
//               appGyms90Minutes: (appGyms90Minutes * players_90Minutes).toFixed(
//                 2
//               ),
//               appGyms60Minutes: (appGyms60Minutes * players_60Minutes).toFixed(
//                 2
//               ),
//               appGyms30Minutes: (appGyms30Minutes * players_30Minutes).toFixed(
//                 2
//               ),

//               appGymsDay: (appGymsDay * players_day).toFixed(2),
//               appGymsMonth: (appGymsMonth * players_month).toFixed(2),
//               appGymsYear: (appGymsYear * players_year).toFixed(2),
//               appGymsWeek: (appGymsWeek * players_week).toFixed(2),
//             };
//           }
//         );
//         return clubsGain;
//       })
//     );
//     console.log(filterClubs);
//     res.json({ clubs_report: filterClubs });
//   });
// });

exports.clubReports = asyncHandler(async (req, res, next) => {
  try {
    const clubs = await Club.find({});
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
          appGyms120Minutes: appGyms120Minutes.toFixed(2),
          appGyms90Minutes: appGyms90Minutes.toFixed(2),
          appGyms60Minutes: appGyms60Minutes.toFixed(2),
          appGyms30Minutes: appGyms30Minutes.toFixed(2),
          appGymsDay: appGymsDay.toFixed(2),
          appGymsMonth: appGymsMonth.toFixed(2),
          appGymsYear: appGymsYear.toFixed(2),
          appGymsWeek: appGymsWeek.toFixed(2),
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

exports.deleteQuestion = asyncHandler(async (req, res, next) => {
  const { question } = req.body;
  if (!question) return next(new ApiError("Add question", 400));
  await Rules.findOne({ type: "questions" }).then(async (ruleType) => {
    let questions =
      ruleType.questions &&
      ruleType.questions.filter((Squestion) => Squestion.question !== question);
    ruleType.questions = questions;
    await ruleType.save();
    res.json({ questions: ruleType });
  });
});

exports.addBlog = asyncHandler(async (req, res, next) => {
  const { name, description, nameblog, content } = req.body;
  if (!req.files.blogImg)
    return next(new ApiError("Please Add blog Imgs", 409));
  const imgs_path = await Promise.all(
    req.files.blogImg.map(async (img) => {
      const uploadImg = await cloudinary.uploader.upload(img.path);
      return uploadImg.secure_url;
    })
  );
  const blog = await Blog.create({
    name: name.trim(),
    description,
    content,
    nameblog,
    images: imgs_path,
  });
  res.status(201).json({ blog });
});

exports.editBlog = asyncHandler(async (req, res, next) => {
  const { name, description, nameblog, content } = req.body;
  const blog_id = req.params.blog_id;

  let imgs_path = [];
  if (req.files && req.files.blogImg) {
    imgs_path = await Promise.all(
      req.files.blogImg.map(async (img) => {
        const uploadImg = await cloudinary.uploader.upload(img.path);
        return uploadImg.secure_url;
      })
    );
  }

  const updatedBlog = await Blog.findByIdAndUpdate(
    blog_id,
    {
      $set: {
        name: name || undefined,
        nameblog: nameblog || undefined,
        content: content || undefined,
        description: description || undefined,
        images: imgs_path,
      },
      //   $push: { images: { $each: imgs_path } },
    },
    { new: true }
  );

  console.log(updatedBlog);
  res.json({ updatedBlog });
});
exports.deleteBlog = asyncHandler(async (req, res, next) => {
  blog_id = req.params.blog_id;
  await Blog.findByIdAndDelete(blog_id).then((blog) => res.json({ blog }));
});
exports.addOpinion = asyncHandler(async (req, res, next) => {
  const { name, description } = req.body;
  if (!req.files.opinionImg)
    return next(new ApiError("Please Add opinion Imgs", 409));
  const imgs_path = await Promise.all(
    req.files.opinionImg.map(async (img) => {
      const uploadImg = await cloudinary.uploader.upload(img.path);
      return uploadImg.secure_url;
    })
  );
  const opinion = await Opinion.create({
    name: name.trim(),
    description,
    images: imgs_path,
  });
  res.status(201).json({ opinion });
});

exports.editOpininon = asyncHandler(async (req, res, next) => {
  const { name, description } = req.body;
  if (!req.files.opinionImg)
    return next(new ApiError("Please Add opinion Imgs", 409));
  const imgs_path = await Promise.all(
    req.files.opinionImg.map(async (img) => {
      const uploadImg = await cloudinary.uploader.upload(img.path);
      return uploadImg.secure_url;
    })
  );
  opinion_id = req.params.opinion_id;
  await Opinion.findByIdAndUpdate(
    opinion_id,
    {
      name: name && name,
      description: description && description,
      images: imgs_path && imgs_path,
    },
    { new: true }
  ).then((opinion) => res.json({ opinion }));
});

exports.deleteOpinion = asyncHandler(async (req, res, next) => {
  opinion_id = req.params.opinion_id;
  await Opinion.findByIdAndDelete(opinion_id).then((opinion) =>
    res.json({ opinion })
  );
});
// add Representative  and delete it
exports.addRepresentative = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Check if the representative with the given email already exists
  const existingRepresentative = await Representative.findOne({
    email,
    password,
  });

  if (existingRepresentative) {
    return next(new ApiError("Representative Already Exists", 409));
  }

  // Generate a random code
  const code = Math.floor(Math.random() * 1000000);

  // Hash the password

  // Create a new representative
  const newRepresentative = await Representative.create({
    name,
    email,
    password,
  });

  // Generate a token
  const token = sign(
    { id: newRepresentative.id, role: "representative" },
    process.env.TOKEN
  );

  // Update the representative with the generated token
  newRepresentative.token = token;

  // Save the updated representative
  await newRepresentative.save();

  // Respond with the representative data and token
  res.status(201).json({ representative: newRepresentative, token });
});

exports.GetRepresentative = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  try {
    const representative = await Representative.findById(id).populate({
      path: "clups",
      select: "logo name _id",
    });

    if (!representative) {
      // If representative is not found, respond with a 404 status
      return res.status(404).json({ error: "Representative not found" });
    }

    // Respond with the representative data and associated club information
    res.status(200).json({
      representative: {
        _id: representative._id,
        name: representative.name,
        email: representative.email,
        password: representative.password,
        commission: representative.commission,
        // Add other representative fields as needed
        clups: representative.clups.map((clubInfo) => ({
          _id: clubInfo._id,
          name: clubInfo.name,
          logo: clubInfo.logo,
        })),
      },
    });
  } catch (error) {
    console.error(error);
    // Handle errors and respond with a 500 status
    res.status(500).json({ error: "Internal Server Error" });
  }
});

exports.GetRepresentatives = asyncHandler(async (req, res, next) => {
  try {
    const representatives = await Representative.find();
    const representativesWithClubs = representatives.map((representative) => ({
      _id: representative._id,
      name: representative.name,
      email: representative.email,
      password: representative.password,
    }));

    res.status(200).json({ representatives: representativesWithClubs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
exports.DeleteRepersentative = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  try {
    // Find the representative by _id and remove it
    const deletedRepresentative = await Representative.findByIdAndRemove(id);

    if (!deletedRepresentative) {
      // If representative is not found, respond with a 404 status
      return res.status(404).json({ error: "Representative not found" });
    }

    // Respond with a success message
    res.status(200).json({ message: "Representative deleted successfully" });
  } catch (error) {
    console.error(error);
    // Handle errors and respond with a 500 status
    res.status(500).json({ error: "Internal Server Error" });
  }
});
exports.AddActivity = asyncHandler(async (req, res, next) => {
  try {
    const activity = await Activities.findOne({
      sportName: req.body.sportName,
    });
    if (activity) {
      return res.status(409).json({ error: "activity is found" });
    } else {
      const newActivity = await Activities.create({
        sportName: req.body.sportName,
      });
      res.status(200).json({ newActivity });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

exports.AddActivity = asyncHandler(async (req, res, next) => {
  try {
    const activity = await Activities.findOne({
      sportName: req.body.sportName,
    });
    if (activity) {
      return res.status(409).json({ error: "activity is found" });
    } else {
      const newActivity = await Activities.create({
        sportName: req.body.sportName,
      });
      res.status(200).json({ newActivity });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
exports.deleteActivity = asyncHandler(async (req, res, next) => {
  try {
    // Get the ID from the request params
    const id = req.params.id;

    const result = await Activities.findByIdAndDelete(id);
    res.status(200).json({ result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

exports.adminCoupon = asyncHandler(async (req, res) => {
  const { discountCode, discountQuantity } = req.body;

  // Validate discount code and quantity
  if (!discountCode || !discountQuantity) {
    return res
      .status(400)
      .json({ error: "Discount code and quantity are required" });
  }

  try {
    // Find clubs that have the discounts field
    const clubsToUpdate = await Club.find({ discounts: { $exists: true } });

    if (clubsToUpdate.length === 0) {
      return res
        .status(404)
        .json({ error: "No clubs found with discounts to update" });
    }

    // Update existing clubs to add the new discount
    const updateResults = await Promise.all(
      clubsToUpdate.map(async (club) => {
        club.discounts.push({ discountCode, discountQuantity });
        return club.save();

        // Skip clubs with empty discounts array
      })
    );

    // Calculate the number of updated clubs
    res.json({ updateResults });
  } catch (error) {
    console.error("Error updating clubs:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

exports.ClubsBankAccount = asyncHandler(async (req, res) => {
  const clubs = await Club.find({});

  const clubsWithBankAccount = [];

  clubs.forEach((club) => {
    if (
      club.bankAccount.bankAccountName &&
      club.bankAccount.bankAccountNumber &&
      club.bankAccount.bankName &&
      club.bankAccount.phone &&
      club.bankAccount.name
    ) {
      const obj = {
        name: club.bankAccount.name,
        phone: club.bankAccount.phone,
        bankName: club.bankAccount.bankName,
        bankAccountName: club.bankAccount.bankAccountName,
        bankAccountNumber: club.bankAccount.bankAccountNumber,
        clubName: club.name,
      };
      clubsWithBankAccount.push(obj);
    }
  });

  console.log(clubsWithBankAccount);

  res.status(200).json({
    data: clubsWithBankAccount,
    success: true,
  });
});
