const cloudinary = require("cloudinary").v2;
const User = require("../models/User");
const Club = require("../models/Club");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const CLubOrder = require("../models/ClubOrder");
const ClubUser = require("../models/ClubUser");
const sendEmail = require("../helper/sendEmail");
const bcrypt = require("bcrypt");
const Transfers = require("../models/Transafers.js");
const TransferOrder = require("../models/TransferOrder.js");
const DiscountCode = require("../models/DiscountCode.js");
const userSubs = require("../models/userSub");
const AnotherPackages = require("../models/package/anotherActivity.js");
const PaddlePackages = require("../models/package/paddle");
const WeightFitnessPackages = require("../models/package/weightFitness");
const YogaPackages = require("../models/package/yoga");
const AppSetting = require("../models/AppSetting");
const Support = require("../models/support.js");
const CommonQuestions = require("../models/CommonQuestions.js");
const uploadToCloudinary = require("../helper/uploadCoudinary.js");
const generatePDF = require("../helper/generatePdf.js");
const generateExcel = require("../helper/generateExcel.js");
const path = require("path");
const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

exports.addClub = asyncHandler(async (req, res, next) => {
  const {
    name,
    email,
    password,
    lat,
    long,
    description,
    gender,
    commission,
    sports,
    mapUrl,
    ClubAdd,
    clubMemberCode,
  } = req.body;

  let SportData = sports.split(",");

  if (!req.files.clubImg || !req.files.logo) {
    return next(new ApiError("Please Add Club Images and Logo", 409));
  }
  console.log(lat, long);
  const place_name =
    "Awlad Nijm Bahjurah, Nag Hammadi, Qena Governorate, Egypt";

  console.log("error");
  console.log(place_name);
  if (!place_name) return next(new ApiError("Location Not Found", 404));

  const imgs_path = await Promise.all(
    req.files.clubImg.map(async (img) => {
      return await uploadToCloudinary(img.buffer);
    })
  );

  const logoBuffer = req.files.logo[0].buffer;
  const logo = logoBuffer ? await uploadToCloudinary(logoBuffer) : null;

  const existingUser = await ClubUser.findOne({ email });
  if (existingUser)
    return next(new ApiError("User With This Email Already Exists", 409));

  const club = await Club.create({
    name,
    country: `${place_name.split(",").pop()}`,
    city: `${place_name.split(",").slice(-2, -1)[0]}`,
    location: place_name,
    description,
    gender,
    images: imgs_path,
    lat: Number(lat),
    long: Number(long),
    logo,
    mapUrl,
    commission,
    sports: [...SportData],
    clubMemberCode: clubMemberCode,
  });

  let hashedPassword = await bcrypt.hash(password, 10);

  await ClubUser.create({
    email,
    password: hashedPassword,

    club: club.id,

    name,
  });

  res.status(201).json({ club });
});

exports.getSubClubsForSuberAdmin = asyncHandler(async (req, res, next) => {
  const id = req.params.id;

  const club = await Club.findOne({ _id: id });
  if (!club) {
    res.status(404).json({ error: "Club Not Found" });
    return;
  }
  const allSubClubs = await club.getSubClubs();

  return res.status(200).json({
    status: true,
    data: {
      allSubClubs,
    },
  });
});

exports.getSuberAdminClubs = asyncHandler(async (req, res, next) => {
  const clubs = await Club.find({ type: "superadmin" });
  console.log(clubs);
  const cities = [];
  const subsCount = clubs.length;
  const subsSubscriptions = 0;

  for (const suberadmin of clubs) {
    cities.push(suberadmin.city);
  }

  return res.status(200).json({
    data: {
      cities,
      subsCount,
      subsSubscriptions,
      clubs: [...clubs],
    },
  });
});

exports.deleteSuperadminClub = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Find the superadmin club by ID
  const superadminClub = await Club.findById(id);

  // If the superadmin club is not found, return a 404 response
  if (!superadminClub) {
    return next(new ApiError("Superadmin Club not found", 404));
  }

  // Ensure that the club is of type superadmin
  if (superadminClub.type !== "superadmin") {
    return next(
      new ApiError("The specified club is not a superadmin club", 400)
    );
  }

  // Find all sub-clubs associated with the superadmin club
  const subClubs = await Club.find({ parentClub: superadminClub._id });

  // Delete all sub-clubs
  for (const subClub of subClubs) {
    await Club.findByIdAndDelete(subClub._id);
  }

  // Delete the superadmin club itself
  await Club.findByIdAndDelete(superadminClub._id);

  // Send success response
  res.status(200).json({
    success: true,
    message: "Superadmin club and all its sub-clubs deleted successfully",
  });
});
exports.getOrders = asyncHandler(async (req, res, next) => {
  const orders = await CLubOrder.find({});
  return res.json({ status: true, data: orders });
});

exports.getOrder = asyncHandler(async (req, res, next) => {
  try {
    // Extract order ID from request parameters
    const { orderId } = req.params;

    // Find the order in the database
    const order = await CLubOrder.findById(orderId);

    // If the order is not found, return a 404 error
    if (!order) {
      return next(new ApiError("Order not found", 404));
    }

    // Respond with the order data
    res.status(200).json({
      status: true,
      data: order,
    });
  } catch (error) {
    next(error); // Pass any errors to the error-handling middleware
  }
});

exports.acceptOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { message } = req.body; // Get the message from the request body

    // Find the order
    const order = await CLubOrder.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Check if a user with this email already exists
    const existingUser = await ClubUser.findOne({ email: order.email });
    if (existingUser)
      return res.status(400).json({
        status: false,
        message: "A club with this email already exists",
      });

    // Create a new Club
    const newClub = await Club.create({
      type: order.type,
      name: order.name,
      gender: order.gender,
      mapUrl: order.mapUrl,
      country: order.country,
      city: order.city,
      clubMemberCode: order.clubMemberCode,
      isWork: order.isWork,
      lat: order.lat,
      long: order.long,
      description: order.description,
      sports: order.sports,
      images: order.images,
      location: order.location,
      logo: order.logo,
      commission: order.commission,
    });
    const hashedPassword = await bcrypt.hash(order.password, 10);
    // Create a new ClubUser and update its reference to the newly created club
    const clubUser = await ClubUser.create({
      email: order.email,
      password: hashedPassword,
      name: newClub.name,
      club: newClub._id,
    });
    await clubUser.save();

    // // Send acceptance email with the dynamic message
    // const emailSubject = "Your Club Application Has Been Accepted";
    // const emailHtml = `
    //   <html>
    //     <head>
    //       <style>
    //         body { font-family: Arial, sans-serif; color: #333; }
    //         .container { width: 100%; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
    //         .header { background: #f4f4f4; padding: 10px; border-bottom: 1px solid #ddd; text-align: center; }
    //         .header h1 { margin: 0; color: #4CAF50; }
    //         .content { padding: 20px; }
    //         .footer { text-align: center; margin-top: 20px; font-size: 0.9em; color: #777; }
    //         .button { display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background: #4CAF50; text-decoration: none; border-radius: 5px; }
    //       </style>
    //     </head>
    //     <body>
    //       <div class="container">
    //         <div class="header">
    //           <h1>Congratulations!</h1>
    //         </div>
    //         <div class="content">
    //           <p>Your application to create the club <strong>"${
    //             newClub.name
    //           }"</strong> has been accepted.</p>
    //           <p>${
    //             message || "We look forward to your successful journey with us!"
    //           }</p>

    //         </div>
    //         <div class="footer">
    //           <p>Thank you for being part of our community.</p>
    //         </div>
    //       </div>
    //     </body>
    //   </html>
    // `;
    // await sendEmail(order.email, emailSubject, emailHtml);
    await CLubOrder.findByIdAndDelete(orderId);
    // Send response
    res.status(200).json({
      status: true,
      message: "Order accepted and club created",
      club: newClub,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refuses an order and sends an email to the club.
 */
exports.refuseOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { message } = req.body;

    // Find the order
    const order = await CLubOrder.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // // Optionally update order status instead of deleting

    // // Send refusal email
    // const emailSubject = "Your Club Application Has Been Refused";
    // const emailHtml = `
    //   <html>
    //     <head>
    //       <style>
    //         body { font-family: Arial, sans-serif; color: #333; }
    //         .container { width: 80%; margin: 0 auto; padding: 20px; }
    //         .header { background-color: #f8f9fa; padding: 10px; border-radius: 5px; }
    //         .content { padding: 20px; }
    //         .footer { margin-top: 20px; font-size: 0.9em; color: #777; }
    //       </style>
    //     </head>
    //     <body>
    //       <div class="container">
    //         <div class="header">
    //           <h1>Club Application Status</h1>
    //         </div>
    //         <div class="content">
    //           <p>Dear ${order.email},</p>
    //           <p>We regret to inform you that your application to create the club "<strong>${
    //             order.name
    //           }</strong>" has been <strong>refused</strong>.</p>
    //           <p>${message || "We are sorry to see you go!"}</p>
    //         </div>
    //         <div class="footer">
    //           <p>Best regards,</p>
    //           <p>The Club Management Team</p>
    //         </div>
    //       </div>
    //     </body>
    //   </html>
    // `;

    // await sendEmail(order.email, emailSubject, emailHtml);
    // delete order
    await CLubOrder.findByIdAndDelete(orderId);
    // Send response
    res
      .status(200)
      .json({ status: true, message: "Order refused and email sent" });
  } catch (error) {
    // Pass errors to the error-handling middleware
    next(error);
  }
};

exports.getAllTransferOrders = asyncHandler(async (req, res, next) => {
  const transferOrders = await TransferOrder.find();
  res.json({ success: true, data: transferOrders });
});
exports.getAllTransfers = asyncHandler(async (req, res, next) => {
  const transfers = await Transfers.find();
  res.json({ success: true, data: transfers });
});
exports.acceptTransfer = asyncHandler(async (req, res, next) => {
  const amount = req.body.amount;
  const transferOrder = await TransferOrder.findById(req.params.id);

  if (!transferOrder) {
    return res.status(404).json({ message: "Transfer order not found" });
  }

  if (!req.file) {
    return res.status(400).json({ message: "Please provide a PDF file" });
  }

  try {
    // Upload PDF to Cloudinary
    const pdfBuffer = req.file.buffer;
    const result = await uploadToCloudinary(pdfBuffer, "pdf");

    if (!result) {
      return res.status(500).json({ message: "Failed to upload PDF" });
    }

    // Create new transfer with the uploaded PDF URL
    const transfer = await Transfers.create({
      amount,
      pdf: result, // Secure URL from Cloudinary
      status: "accepted",
      club: transferOrder.club,
    });

    // Delete the original transfer order
    await TransferOrder.findByIdAndDelete(req.params.id);

    res.json({ success: true, data: transfer });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error processing transfer", error: error.message });
  }
});

exports.refuseTransfer = asyncHandler(async (req, res, next) => {
  const transferOrderId = req.params.id;
  const { refusedReason } = req.body;

  // Validate the request body
  if (!refusedReason) {
    return res.status(400).json({ message: "Please provide a refusal reason" });
  }

  // Find the transfer order
  const transferOrder = await TransferOrder.findById(transferOrderId);
  if (!transferOrder) {
    return res.status(404).json({ message: "Transfer order not found" });
  }

  // Create a refused transfer entry
  const refusedTransfer = await Transfers.create({
    amount: transferOrder.amount,
    refusedReason,
    status: "rejected",
    club: transferOrder.club,
  });

  // Delete the original transfer order
  await TransferOrder.findByIdAndDelete(transferOrderId);

  // Respond with the refused transfer details
  res.json({ success: true, data: refusedTransfer });
});

exports.getAllGlobalDiscounts = asyncHandler(async (req, res) => {
  const globalDiscounts = await DiscountCode.find({ global: true });
  res.status(200).json({
    success: true,
    count: globalDiscounts.length,
    data: globalDiscounts,
  });
});

exports.getGlobalDiscountById = asyncHandler(async (req, res) => {
  const discountCode = await DiscountCode.findOne({
    _id: req.params.id,
    global: true,
  });
  if (!discountCode) {
    return res.status(404).json({ message: "Global discount code not found" });
  }
  res.status(200).json({ success: true, data: discountCode });
});

exports.createGlobalDiscount = asyncHandler(async (req, res) => {
  const { code, discountPercentage, validFrom, validTo } = req.body;

  // Validate required fields
  if (!code || !discountPercentage) {
    return res
      .status(400)
      .json({ message: "Code and discount percentage are required" });
  }

  const newDiscount = await DiscountCode.create({
    code,
    discountPercentage,
    validFrom,
    validTo,
    global: true, // Set to global
  });

  res.status(201).json({ success: true, data: newDiscount });
});

exports.updateGlobalDiscount = asyncHandler(async (req, res) => {
  const { code, discountPercentage, validFrom, validTo } = req.body;

  let discountCode = await DiscountCode.findOne({
    _id: req.params.id,
    global: true,
  });
  if (!discountCode) {
    return res.status(404).json({ message: "Global discount code not found" });
  }

  // Update fields only if they are provided in the request
  discountCode.code = code || discountCode.code;
  discountCode.discountPercentage =
    discountPercentage || discountCode.discountPercentage;
  discountCode.validFrom = validFrom || discountCode.validFrom;
  discountCode.validTo = validTo || discountCode.validTo;

  await discountCode.save();
  res.status(200).json({ success: true, data: discountCode });
});

exports.deleteGlobalDiscount = asyncHandler(async (req, res) => {
  const discountCode = await DiscountCode.findOneAndDelete({
    _id: req.params.id,
    global: true,
  });

  if (!discountCode) {
    return res.status(404).json({ message: "Global discount code not found" });
  }

  res
    .status(200)
    .json({ success: true, message: "Global discount code deleted" });
});

exports.getClubForPackages = asyncHandler(async (req, res) => {
  try {
    const clubs = await Club.find({});
    const { sport } = req.params;
    let filterCondition = "";

    switch (sport) {
      case "paddle":
        filterCondition = "بادل";
        break;
      case "yoga":
        filterCondition = "يوغا";
        break;
      case "weight":
        filterCondition = "أثقال و لياقة";
        break;
      case "another":
        filterCondition = "انشطة اخرى";
        break;
      default:
        filterCondition = "بوكسينغ و كروس فيت";
        break;
    }

    const response = await Promise.all(
      clubs.map(async (club) => {
        const [
          clubSubsLength,
          paddlePackages,
          yogaPackages,
          weightPackages,
          anotherPackages,
        ] = await Promise.all([
          userSubs.find({ club }).countDocuments(),
          PaddlePackages.find({ club }).countDocuments(),
          YogaPackages.find({ club }).countDocuments(),
          WeightFitnessPackages.find({ club }).countDocuments(),
          AnotherPackages.find({ club }).countDocuments(),
        ]);

        return {
          id: club._id,
          sports: club.sports,
          club: club.name,
          subscriptionCount: clubSubsLength,
          type: club.type,
          packagesCount:
            paddlePackages + yogaPackages + weightPackages + anotherPackages,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: response.filter((club) => club.sports.includes(filterCondition)),
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

exports.getAppData = asyncHandler(async (req, res) => {
  try {
    const owner = await User.findOne({ role: "admin" });
    //
    const app = await AppSetting.findOne({});

    res.status(200).json({
      success: true,
      data: {
        name: app.appName,
        logo: app.appLogo,
        banner: app.banners,
        email: owner.email,
        password: owner.password,
      },
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

exports.getSupportMessage = asyncHandler(async (req, res) => {
  try {
    const supportMessages = await Support.find({
      name: { $exists: true, $ne: null },
      email: { $exists: true, $ne: null },
      couse: { $exists: true, $ne: null },
      message: { $exists: true, $ne: null },
    });

    res.status(200).json({
      success: true,
      data: supportMessages,
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

exports.deleteSupportMessage = asyncHandler(async (req, res) => {
  try {
    const id = req.params.id;

    const suportMessage = await Support.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      data: "تم حذف الرسالة بنجاح",
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Adjust the path as necessary

// Create a new common question
exports.createCommonQuestion = asyncHandler(async (req, res) => {
  const { question, answer } = req.body;

  const newQuestion = await CommonQuestions.create({
    question,
    answer,
  });

  res.status(201).json({
    success: true,
    data: newQuestion,
  });
});

// Update an existing common question by ID
exports.updateCommonQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { question, answer } = req.body;

  const updatedQuestion = await CommonQuestions.findByIdAndUpdate(
    id,
    { question, answer },
    { new: true, runValidators: true } // Returns the updated document
  );

  if (!updatedQuestion) {
    res.status(404);
    throw new Error("Common question not found");
  }

  res.status(200).json({
    success: true,
    data: updatedQuestion,
  });
});

// Get all common questions
exports.getAllCommonQuestions = asyncHandler(async (req, res) => {
  const questions = await CommonQuestions.find({});
  res.status(200).json({
    success: true,
    data: questions,
  });
});

// Get a common question by ID
exports.getCommonQuestionById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const question = await CommonQuestions.findById(id);

  if (!question) {
    res.status(404);
    throw new Error("Common question not found");
  }

  res.status(200).json({
    success: true,
    data: question,
  });
});

// Delete a common question by ID
exports.deleteCommonQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const question = await CommonQuestions.findByIdAndDelete(id);

  if (!question) {
    res.status(404);
    throw new Error("Common question not found");
  }

  res.status(200).json({
    success: true,
    message: "Common question deleted successfully",
  });
});

exports.DeterminePackageCommission = asyncHandler(async (req, res) => {
  const { commission, type, yogaTypes } = req.body;
  if (!commission || !type) {
    res.status(400).json({ message: "Missing commission or type" });
    return;
  }
  if (commission < 0 || commission > 100) {
    return res
      .status(400)
      .json({ message: "Commission must be between 0 and 100" });
  }

  const appSetting = await AppSetting.findOne({});
  switch (type) {
    case "weight":
      {
        const packages = await WeightFitnessPackages.find({});
        for (const package of packages) {
          package.commission = commission;
          await package.save();
        }
        appSetting.weightFitnessCommission = commission;
        await appSetting.save();
      }
      break;

    case "yoga":
      {
        const packages = await YogaPackages.find({});
        for (const package of packages) {
          package.commission = commission;
          await package.save();
        }
        appSetting.yogaCommission = commission;
        await appSetting.save();
      }
      break;
    case "paddle":
      {
        const packages = await PaddlePackages.find({});
        for (const package of packages) {
          package.commission = commission;
          await package.save();
        }
        appSetting.paddelCommission = commission;
        await appSetting.save();
      }
      break;
    case "another":
      {
        const packages = await AnotherPackages.find({});
        for (const package of packages) {
          package.commission = commission;
          await package.save();
        }
        appSetting.another = commission;
        await appSetting.save();
      }
      break;

    default: {
      return res.status(400).json({ message: "Invalid type" });
    }
  }
  appSetting.yogaTypes = yogaTypes || [];
  await appSetting.save();

  res.status(200).json({
    success: true,
    message: "Commission updated successfully",
  });
});

exports.getPackagesCommission = asyncHandler(async (req, res) => {
  const appSetting = await AppSetting.findOne({});
  res.status(200).json({
    success: true,
    data: {
      weight: appSetting.weightFitnessCommission,
      yoga: appSetting.yogaCommission,
      paddle: appSetting.paddelCommission,
      another: appSetting.another,
      yogTypes: appSetting.yogaTypes,
    },
  });
});

exports.updateAppBanner = asyncHandler(async (req, res) => {
  const { email, password, appName, banners } = req.body;

  // Find existing app settings and admin
  const appSetting = await AppSetting.findOne({});
  const admin = await User.findOne({ role: "admin" });

  // Validate if app settings and admin exist
  if (!appSetting || !admin) {
    return res.status(404).json({
      success: false,
      message: "App settings or admin not found.",
    });
  }

  // Upload logo if provided
  const appLogo = req.files?.logo
    ? await uploadToCloudinary(req.files.logo[0].buffer)
    : null;

  // Initialize the appBanners array
  const appBanners = [];

  // Upload banners if provided
  if (req.files?.bannersImages && banners) {
    // Ensure banners array matches the uploaded images

    // Process each banner upload and map to the provided banner data
    for (let i = 0; i < req.files.bannersImages.length; i++) {
      const img = req.files.bannersImages[i];
      const bannerInfo = banners[i];

      // Upload the image to Cloudinary
      const imageUrl = await uploadToCloudinary(img.buffer);

      // Add the image URL along with value and isUrl to the appBanners array
      appBanners.push({
        imageUrl,
        value: bannerInfo.value, // Get value from request body
        isUrl: bannerInfo.isUrl, // Get isUrl from request body
      });
    }
  }

  // Update app settings with new banners, logo, and app name
  if (appBanners.length > 0) {
    appSetting.banners = appBanners;
  }
  if (appLogo) {
    appSetting.appLogo = appLogo;
  }
  if (appName) {
    appSetting.appName = appName;
  }

  // Update admin details if provided
  if (email) {
    admin.email = email;
  }
  if (password) {
    admin.password = password;
  }

  // Save the updated data
  await admin.save();
  await appSetting.save();

  // Respond with success
  res.status(200).json({
    success: true,
    data: {
      appBanners: appSetting.banners,
      appLogo: appSetting.appLogo,
      appName: appSetting.appName,
    },
  });
});

exports.getAllUser = asyncHandler(async (req, res) => {
  const users = await User.find({});
  for (const user of users) {
    user.password = undefined;
    if (
      user.role === "admin" ||
      user.role == "club" ||
      user.role == "clubManger"
    ) {
      users.splice(users.indexOf(user), 1);
    }
  }
  res.status(200).json({
    success: true,
    data: users,
  });
});

exports.stopAppTemporarily = asyncHandler(async (req, res, next) => {
  const { start, end, isTemporarilyStopped } = req.body;

  // Fetch the app settings
  const appSetting = await AppSetting.findOne({});
  if (!appSetting) {
    return next(new ApiError("App settings not found", 404));
  }

  // If start and end dates are provided and valid
  if (start && end && new Date(start) <= new Date(end)) {
    appSetting.stopSchedule.start = new Date(start);
    appSetting.stopSchedule.end = new Date(end);
    appSetting.isTemporarilyStopped = false;
    appSetting.isActive = false; // Mark the app as inactive
  } else {
    // If no valid dates are provided, just set the app to temporarily stopped
    appSetting.isTemporarilyStopped = true;
    appSetting.isActive = false; // Mark the app as inactive
  }

  // Save the updated app settings
  await appSetting.save();

  res.status(200).json({
    success: true,
    message: "App status updated",
    data: appSetting,
  });
});

exports.getStats = async (req, res) => {
  try {
    const userCount = await User.countDocuments();

    const last28Days = new Date();
    last28Days.setDate(last28Days.getDate() - 28);
    const recentUserCount = await User.countDocuments({
      createdAt: { $gte: last28Days },
    });

    // Count the total number of clubs
    const clubCount = await Club.countDocuments();

    // Count the clubs of type "admin" and "superadmin"
    const adminClubCount = await Club.countDocuments({ type: "admin" });
    const superAdminClubCount = await Club.countDocuments({
      type: "superadmin",
    });

    // Send the response with counts
    return res.status(200).json({
      status: "success",
      data: {
        userCount,
        recentUserCount,
        clubCount,
        adminClubCount,
        superAdminClubCount,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getGeneralReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { relative } = req.body;

  // Define data dynamically based on `relative`
  let data;
  if (relative) {
    data = [
      [
        "عدد الأندية",
        "عدد الأفرع",
        "المشتركين النشطين",
        "المشتركين غير النشطين",
        "عدد المشتركين الكلي",
        "الأرباح الكلية",
      ],
      ["234", "20", "50", "200", "250", "$5000"],
    ];
  } else {
    data = [
      [
        "عدد الأندية",
        "عدد الأفرع",
        "المشتركين النشطين",
        "المشتركين غير النشطين",
        "عدد المشتركين الكلي",
        "الأرباح الكلية",
      ],
      ["34", "25", "80", "150", "230", "$8000"],
    ];
  }

  try {
    // Generate PDF and Excel files
    const pdfPath = generatePDF(data);
    const excelPath = await generateExcel(data);

    // Convert files to Base64
    const fileToBase64 = (filePath) => {
      return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, fileData) => {
          if (err) {
            reject(err);
          } else {
            resolve(fileData.toString("base64"));
          }
        });
      });
    };

    const pdfBase64 = await fileToBase64(pdfPath);
    const excelBase64 = await fileToBase64(excelPath);

    // Respond with the generated data
    const responseData = {
      message: "Files generated successfully.",
      data: data,
      status: "success",
      pdf: pdfBase64,
      excel: excelBase64,
    };

    res.status(200).json(responseData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

exports.getUsersReport = asyncHandler(async (req, res) => {
  const { relative } = req.body;

  let data;
  if (relative) {
    data = [
      [
        "عدد المشتركين الكلي",
        "المشتركين آخر 28 يوم",
        "المشتركين النشطين",
        "المشتركين غير النشطين",
        "الأرباح آخر 28 يوم",
        "المشتركين المنذرين",
        "الأرباح الكلية",
      ],
      ["نسبي", "1000", "150", "800", "200", "50", "$5000"],
    ];
  } else {
    data = [
      [
        "عدد المشتركين الكلي",
        "المشتركين آخر 28 يوم",
        "المشتركين النشطين",
        "المشتركين غير النشطين",
        "الأرباح آخر 28 يوم",
        "المشتركين المنذرين",
        "الأرباح الكلية",
      ],
      ["مطلق", "1200", "300", "700", "400", "70", "$8000"],
    ];
  }

  try {
    // Generate PDF and Excel files
    const pdfPath = generatePDF(data);
    const excelPath = await generateExcel(data);

    // Convert files to Base64
    const fileToBase64 = (filePath) => {
      return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, fileData) => {
          if (err) {
            reject(err);
          } else {
            resolve(fileData.toString("base64"));
          }
        });
      });
    };

    const pdfBase64 = await fileToBase64(pdfPath);
    const excelBase64 = await fileToBase64(excelPath);

    // Respond with the generated data
    const responseData = {
      message: "Files generated successfully.",
      data: data,
      status: "success",
      pdf: pdfBase64,
      excel: excelBase64,
    };

    res.status(200).json(responseData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

exports.getHomeStatics = asyncHandler(async (req, res) => {
  const { type, id, date } = req.body;

  if (!type || !date) {
    return res.status(400).json({ error: "Type and ID are required." });
  }

  switch (type) {
    case "owner": {
      try {
        return res.status(200).json({
          data: [4, 1, 4, 5, 6, 4, 2, 2, 5, 6, 3, 4],
          diffrence: 50,
          type: "+",
        });
      } catch (error) {
        return res.status(500).json({ error: "Error fetching owner data." });
      }
    }

    case "club": {
      return res.status(200).json({
        data: [9, 8, 4, 5, 6, 4, 2, 2, 5, 6, 3, 4],
        diffrence: 30,
        type: "-",
      });
    }

    default: {
      return res.status(200).json({
        data: [1, 3, 4, 5, 6, 4, 2, 2, 5, 6, 3, 4],
        diffrence: 200,
        type: "-",
      });
    }
  }
});
