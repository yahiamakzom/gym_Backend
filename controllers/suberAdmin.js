const Clubs = require("../models/Club");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const cloudinary = require("cloudinary").v2;
const User = require("../models/User");
exports.addSubClub = asyncHandler(async (req, res, next) => {
  const {
    suberAdminId,
    name, // Extracting name from req.body
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

  // Ensure both images are provided
  if (!req.files.clubImg || !req.files.logo) {
    return next(new ApiError("Please Add Club Images and Logo", 409));
  }

  // For now, using a hardcoded location name
  // You can replace this with a proper call to `getLocationName()`
  const place_name =
    "Awlad Nijm Bahjurah, Nag Hammadi, Qena Governorate, Egypt";

  // If no place name is found
  if (!place_name) {
    return next(new ApiError("Location Not Found", 404));
  }

  // Upload club images to Cloudinary
  const imgs_path = await Promise.all(
    req.files.clubImg.map(async (img) => {
      const uploadImg = await cloudinary.uploader.upload(img.path);
      return uploadImg.secure_url;
    })
  );

  // Upload logo to Cloudinary
  const logo = (await cloudinary.uploader.upload(req.files.logo[0].path))
    .secure_url;

  // Find the club admin by ID
  const clubSuberAdmin = await Clubs.findOne({ _id: suberAdminId });
  console.log("club", clubSuberAdmin);

  // Check if the club admin exists
  if (!clubSuberAdmin) {
    return next(new ApiError("ClubsuberAdmin Not Found", 404));
  }

  // Check if the club admin has the correct type
  if (clubSuberAdmin.type !== "superadmin") {
    return next(new ApiError("User is not an admin", 403));
  }

  // Check if a club with the same member code already exists
  const clubExist = await Clubs.findOne({ clubMemberCode });
  if (clubExist) {
    return next(new ApiError("Club Already Exist", 409));
  }

  // Create a new club
  const club = await Clubs.create({
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
    type: "admin",
    commission,
    parentClub : clubSuberAdmin._id,
    sports: [...SportData],
    clubMemberCode: clubMemberCode,
  });

  // Send success response
  res.status(201).json({ success: true, data: club });
});

exports.getSubClubs = asyncHandler(async (req, res, next) => {
  const id = req.params.id;

  const club = await Clubs.findOne({ _id: id });
  if (!club) {
    res.status(404).json({ error: "Club Not Found" });
    return;
  }
  const allSubClubs =await club.getSubClubs(); 
  console.log(allSubClubs);

  const cities = [];
  const subsCount = allSubClubs.length;
  const subsSubscriptions = 0;

  for (const subClub of allSubClubs) {
    cities.push(subClub.city);
  }

  return res
    .status(200)
    .json({ data: { cities, subsCount, subsSubscriptions ,clubs:[...allSubClubs ,club] } });
});



exports.deleteSubClub = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  try {
    const deletedSubClub = await Clubs.findByIdAndDelete(id);

    if (!deletedSubClub) {
      return res.status(404).json({ error: "Sub-club not found", success: false });
    }



    return res.status(200).json({ success: true, message: "Sub-club deleted successfully" });
  } catch (error) {
    console.error(error);
    return next(new ApiError("Internal Server Error", 500));
  }
}); 


exports.getSubClub = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  try {
    // Find the sub-club by ID
    const subClub = await Clubs.findById(id);

    if (!subClub) {
      return res.status(404).json({ error: "Sub-club not found", success: false });
    }

    // Optionally, you can fetch related data if needed

    return res.status(200).json({ success: true, data: subClub });
  } catch (error) {
    console.error(error);
    return next(new ApiError("Internal Server Error", 500));
  }
});



exports.editSubClub = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const {
    name,
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

  // Find the existing sub-club by ID
  const subClub = await Clubs.findById(id);
  if (!subClub) {
    return next(new ApiError("Sub-club Not Found", 404));
  }


  let imgs_path = subClub.images; 
  if (req.files.clubImg) {
    imgs_path = await Promise.all(
      req.files.clubImg.map(async (img) => {
        const uploadImg = await cloudinary.uploader.upload(img.path);
        return uploadImg.secure_url;
      })
    );
  }

  let logo = subClub.logo; // Keep existing logo if no new logo is provided
  if (req.files.logo) {
    logo = (await cloudinary.uploader.upload(req.files.logo[0].path)).secure_url;
  }

  // Update sub-club properties
  subClub.name = name || subClub.name;
  subClub.lat = Number(lat) || subClub.lat;
  subClub.long = Number(long) || subClub.long;
  subClub.description = description || subClub.description;
  subClub.gender = gender || subClub.gender;
  subClub.commission = commission || subClub.commission;
  subClub.sports = [...SportData] || subClub.sports;
  subClub.mapUrl = mapUrl || subClub.mapUrl;
  subClub.clubMemberCode = clubMemberCode || subClub.clubMemberCode;
  subClub.images = imgs_path;
  subClub.logo = logo;


  const updatedSubClub = await subClub.save();

  res.status(200).json({ success: true, data: updatedSubClub });
});
