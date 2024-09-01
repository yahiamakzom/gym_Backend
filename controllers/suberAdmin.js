const Clubs = require("../models/Club");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const cloudinary = require("cloudinary").v2;
const User = require("../models/User");
const DiscountCode = require("../models/DiscountCode");
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
    parentClub: clubSuberAdmin._id,
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
  const allSubClubs = await club.getSubClubs();
  console.log(allSubClubs);

  const cities = [];
  const subsCount = allSubClubs.length;
  const subsSubscriptions = 0;

  for (const subClub of allSubClubs) {
    cities.push(subClub.city);
  }

  return res.status(200).json({
    data: {
      cities,
      subsCount,
      subsSubscriptions,
      clubs: [...allSubClubs, club],
    },
  });
});

exports.deleteSubClub = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  try {
    const deletedSubClub = await Clubs.findByIdAndDelete(id);

    if (!deletedSubClub) {
      return res
        .status(404)
        .json({ error: "Sub-club not found", success: false });
    }

    return res
      .status(200)
      .json({ success: true, message: "Sub-club deleted successfully" });
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
      return res
        .status(404)
        .json({ error: "Sub-club not found", success: false });
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
    logo = (await cloudinary.uploader.upload(req.files.logo[0].path))
      .secure_url;
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
  //
  //

  const updatedSubClub = await subClub.save();

  res.status(200).json({ success: true, data: updatedSubClub });
});

exports.addDiscount = asyncHandler(async (req, res, next) => {
  const { id } = req.params; // ID of the club to associate with the discount
  const { code, discountPercentage, validFrom, validTo } = req.body; // Discount details

  // Find the club by ID
  const club = await Clubs.findById(id);
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

  await discountCode.save();

  const subClubs = await club.getSubClubs();
  if (!subClubs || subClubs.length === 0) {
    res.status(201).json({
      success: true,
      message: "Discount code added successfully",
      data: discountCode,
    });
  }
  const discounts = [];
  subClubs.forEach(async (subClub) => {
    const discountCode = new DiscountCode({
      code,
      discountPercentage,
      validFrom: validFrom ? new Date(validFrom) : Date.now(),
      validTo: validTo ? new Date(validTo) : null,
      club: subClub._id,
    });

    await discountCode.save();
    discounts.push(discountCode);
  });

  res.status(201).json({
    success: true,
    message: "Discount code added successfully",
    data: discounts,
  });
});

exports.deleteDiscount = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const club = await Clubs.findById(id);
  if (!club) {
    return next(new ApiError("Club Not Found", 404));
  }
  const discounts = await DiscountCode.findByIdAndDelete(id);
  const subClubs = await club.getSubClubs();
  if (!subClubs || subClubs.length === 0) {
    res.status(200).json({
      success: true,
      message: "Discount codes deleted successfully",
    });
  }

  subClubs.forEach(async (subClub) => {
    const discountCode = await DiscountCode.findByIdAndDelete(subClub._id);
  });

  res.status(200).json({
    success: true,
    message: "Discount codes deleted successfully",
  });
});

exports.updateDiscount = asyncHandler(async (req, res, next) => {
  const { clubId } = req.params; // Assuming you pass club ID as a route parameter
  const { code, discountPercentage, validFrom, validTo } = req.body;

  // Validation: Ensure the discount percentage is within valid range
  if (discountPercentage < 0 || discountPercentage > 100) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid discount percentage" });
  }

  // Find the club by ID
  const club = await Clubs.findById(clubId);
  if (!club) {
    return next(new ApiError("Club Not Found", 404));
  }

  // Find the discount code associated with the club
  const discountCode = await DiscountCode.findOneAndUpdate(
    { club: club._id }, // Use club ID to find the associated discount code
    {
      code,
      discountPercentage,
      validFrom: validFrom ? new Date(validFrom) : Date.now(),
      validTo: validTo ? new Date(validTo) : null,
    },
    { new: true, runValidators: true } // Options: return the updated document and run validators
  );

  if (!discountCode) {
    return res
      .status(404)
      .json({ success: false, message: "Discount code not found for the specified club" });
  }

  // Get and update sub-clubs, if applicable
  const subClubs = await club.getSubClubs(); // Assuming getSubClubs() is a method on Club model
  if (subClubs && subClubs.length > 0) {
    await Promise.all(subClubs.map(async (subClub) => {
      await DiscountCode.findOneAndUpdate(
        { club: subClub._id },
        {
          code,
          discountPercentage,
          validFrom: validFrom ? new Date(validFrom) : Date.now(),
          validTo: validTo ? new Date(validTo) : null,
        },
        { new: true, runValidators: true }
      );
    }));
  }

  res.status(200).json({
    success: true,
    message: "Discount codes updated successfully",
    data: discountCode,
  });
});
