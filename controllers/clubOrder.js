const CLubOrder = require("../models/ClubOrder");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const cloudinary = require("cloudinary").v2;
const User = require("../models/User");
const uploadToCloudinary = require("../helper/uploadCoudinary");
exports.addClubOrder = async (req, res, next) => {
  try {
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
      clubMemberCode,
    } = req.body;

    let SportData = sports.split(",");

    if (!req.files.logo) {
      return next(new ApiError("Please Add Club Images and Logo", 409));
    }
    console.log(lat, long);
    // const place_name = await getLocationName(Number(lat), Number(long));
    const place_name =
      "Awlad Nijm Bahjurah, Nag Hammadi, Qena Governorate, Egypt";

    console.log("error");
    console.log(place_name);
    if (!place_name) return next(new ApiError("Location Not Found", 404));
    console.log("bufffer");
    console.log();
    const logoBuffer = req.files.logo[0].buffer;

    const logoUrl = logoBuffer ? await uploadToCloudinary(logoBuffer) : null;

    const imgs_path = await Promise.all(
      req.files.clubImg.map(async (img) => {
        return await uploadToCloudinary(img.buffer);
      })
    );

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ApiError("Club  With This Email Already Exists", 409));
    }

    const existingClub = await CLubOrder.findOne({ email });
    if (existingClub) {
      return next(new ApiError("Club  With This Email Already Exists", 409));
    }

    const clubOrder = await CLubOrder.create({
      name,
      country: `${place_name.split(",").pop()}`,
      city: `${place_name.split(",").slice(-2, -1)[0]}`,
      location: place_name,
      description,
      gender,
      email,
      password,
      images: imgs_path || [],
      lat: Number(lat),
      long: Number(long),
      logo: logoUrl,
      mapUrl,
      commission,
      sports: [...SportData],
      clubMemberCode: clubMemberCode,
    });

    res.status(201).json({ success: true, data: clubOrder });
  } catch (e) {
    console.log("error");
    console.log(e);
  }
};
