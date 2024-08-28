const CLubOrder = require("../models/ClubOrder");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const cloudinary = require("cloudinary").v2;
const User = require("../models/User");
exports.addClubOrder = asyncHandler(async (req, res, next) => {
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
    return next(new ApiError("Club  With This Email Already Exists", 409));

  const existingClub = await CLubOrder({ email });
  if (existingClub)
    return next(new ApiError("Club  With This Email Already Exists", 409));

  const clubOrder = await CLubOrder.create({
    name,
    country: `${place_name.split(",").pop()}`,
    city: `${place_name.split(",").slice(-2, -1)[0]}`,
    location: place_name,
    description,
    gender,
    email,
    password,
    images: imgs_path,
    lat: Number(lat),
    long: Number(long),
    logo,
    mapUrl,
    commission,
    sports: [...SportData],
    clubMemberCode: clubMemberCode,
  });

  res.status(201).json({ success: true, data: clubOrder });
});
