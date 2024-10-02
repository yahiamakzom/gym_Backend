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
  // const place_name = await getLocationName(Number(lat), Number(long));
  const place_name =
    "Awlad Nijm Bahjurah, Nag Hammadi, Qena Governorate, Egypt";

  console.log("error");
  console.log(place_name);
  if (!place_name) return next(new ApiError("Location Not Found", 404));

  const imgs_path = await Promise.all(
    req.files.clubImg.map(async (img) => {
      const uploadImg = await cloudinary.uploader.upload(img.path);
      return uploadImg.secure_url;
    })
  );

  const logo = (await cloudinary.uploader.upload(req.files.logo[0].path))
    .secure_url;

  const existingUser = await User.findOne({ email });
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

    // Send acceptance email with the dynamic message
    const emailSubject = "Your Club Application Has Been Accepted";
    const emailHtml = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { width: 100%; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
            .header { background: #f4f4f4; padding: 10px; border-bottom: 1px solid #ddd; text-align: center; }
            .header h1 { margin: 0; color: #4CAF50; }
            .content { padding: 20px; }
            .footer { text-align: center; margin-top: 20px; font-size: 0.9em; color: #777; }
            .button { display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background: #4CAF50; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Congratulations!</h1>
            </div>
            <div class="content">
              <p>Your application to create the club <strong>"${
                newClub.name
              }"</strong> has been accepted.</p>
              <p>${
                message || "We look forward to your successful journey with us!"
              }</p>
        
            </div>
            <div class="footer">
              <p>Thank you for being part of our community.</p>
            </div>
          </div>
        </body>
      </html>
    `;
    await sendEmail(order.email, emailSubject, emailHtml);
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

    // Optionally update order status instead of deleting

    // Send refusal email
    const emailSubject = "Your Club Application Has Been Refused";
    const emailHtml = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { width: 80%; margin: 0 auto; padding: 20px; }
            .header { background-color: #f8f9fa; padding: 10px; border-radius: 5px; }
            .content { padding: 20px; }
            .footer { margin-top: 20px; font-size: 0.9em; color: #777; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Club Application Status</h1>
            </div>
            <div class="content">
              <p>Dear ${order.email},</p>
              <p>We regret to inform you that your application to create the club "<strong>${
                order.name
              }</strong>" has been <strong>refused</strong>.</p>
              <p>${message || "We are sorry to see you go!"}</p>
            </div>
            <div class="footer">
              <p>Best regards,</p>
              <p>The Club Management Team</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmail(order.email, emailSubject, emailHtml);
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
    return res.status(400).json({ message: "Please provide a PDF" });
  }
  console.log(req.file);

  try {
    // Upload PDF to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "auto",
    });

    // Create new transfer
    const transfer = await Transfers.create({
      amount,
      pdf: result.secure_url,
      status: "accepted",
      club: transferOrder.club,
    });

    await TransferOrder.findByIdAndDelete(req.params.id); // Remove original transfer order

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
        banner: app.banner,
        email: owner.email,
        password: owner.password,
      },
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});
