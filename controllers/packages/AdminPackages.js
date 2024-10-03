// weightFitnessController.js
const asyncHandler = require("express-async-handler");
const WeightFitnessPackage = require("../../models/package/weightFitness");
const YogaPackage = require("../../models/package/yoga");
const PaddlePackage = require("../../models/package/paddle");
const ClubHours = require("../../models/clubHours"); 
const AnotherActivityPackage =require('../../models/package/anotherActivity')
// Create a new weight and fitness package for a specific club
const createWeightFitnessPackage = asyncHandler(async (req, res) => {
  const {
    club,
    packageName,
    packageType,
    price,
    description,
    freezeTime,
    freezeCountTime,
    // Discount fields directly from the body
    discountForAll,
    discountFrom,
    discountTo,
    priceAfterDiscount,
    discountApplicableToNewMembersOnly,
    discountStopDays,
  } = req.body;

  // Check if the package already exists for the club with the same name and type
  const existingPackage = await WeightFitnessPackage.findOne({
    club,
    packageName,
    packageType,
  });
  if (existingPackage) {
    res.status(400);
    throw new Error(
      "Package with the same name and type already exists for this club"
    );
  }

  const newPackage = new WeightFitnessPackage({
    club,
    packageName,
    packageType,
    price,
    description,
    freezeTime,
    freezeCountTime,
    // Embed the discount details directly
    discount: {
      discountForAll,
      discountFrom,
      discountTo,
      priceAfterDiscount,
      discountApplicableToNewMembersOnly,
      discountStopDays,
    },
  });

  await newPackage.save();
  res
    .status(201)
    .json({ message: "Package created successfully", data: newPackage });
});

const getWeightFitnessPackagesForClub = asyncHandler(async (req, res) => {
  const { clubId } = req.params;

  const packages = await WeightFitnessPackage.find({ club: clubId });

  res.status(200).json({ status: true, data: packages });
});

const getWeightFitnessPackageById = asyncHandler(async (req, res) => {
  const { clubId, id } = req.params;

  // Fetch the package by ID and ensure it belongs to the specified club
  const package = await WeightFitnessPackage.findOne({
    _id: id,
    club: clubId,
  }).populate("club");
  if (!package) {
    res.status(404);
    throw new Error("Package not found");
  }
  res.status(200).json(package);
});

const updateWeightFitnessPackage = asyncHandler(async (req, res) => {
  const { id } = req.params; // Get the package ID from the URL parameters
  const {
    packageName,
    packageType,
    price,
    discountForAll,
    discountFrom,
    discountTo,
    priceAfterDiscount,
    discountApplicableToNewMembersOnly,
    discountStopDays,
    description,
    freezeTime,
    freezeCountTime,
  } = req.body;

  // Find the package by ID
  const existingPackage = await WeightFitnessPackage.findById(id);
  if (!existingPackage) {
    res.status(404);
    res.status(404).json({ message: "Package not found" });
  }

  // Update package fields
  existingPackage.packageName = packageName || existingPackage.packageName;
  existingPackage.packageType = packageType || existingPackage.packageType;
  existingPackage.price = price || existingPackage.price;

  // Update discount object if any discount-related fields are provided
  if (discountForAll !== undefined)
    existingPackage.discount.discountForAll = discountForAll;
  if (discountFrom) existingPackage.discount.discountFrom = discountFrom;
  if (discountTo) existingPackage.discount.discountTo = discountTo;
  if (priceAfterDiscount)
    existingPackage.discount.priceAfterDiscount = priceAfterDiscount;
  if (discountApplicableToNewMembersOnly !== undefined)
    existingPackage.discount.discountApplicableToNewMembersOnly =
      discountApplicableToNewMembersOnly;
  if (discountStopDays)
    existingPackage.discount.discountStopDays = discountStopDays;

  existingPackage.description = description || existingPackage.description;
  existingPackage.freezeTime = freezeTime || existingPackage.freezeTime;
  existingPackage.freezeCountTime =
    freezeCountTime || existingPackage.freezeCountTime;

  await existingPackage.save();

  res
    .status(200)
    .json({ message: "Package updated successfully", data: existingPackage });
});

// Delete a weight and fitness package by ID for a specific club
const deleteWeightFitnessPackage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Find and delete the package by ID
  const package = await WeightFitnessPackage.findByIdAndDelete(id);

  // If package not found, return a 404 response
  if (!package) {
    res.status(404);
    return res.status(404).json({ message: "Package not found" });
  }

  // Send success response
  res.status(200).json({
    success: true,
    message: "Package deleted successfully",
  });
});

//  yoga

const createYogaPackage = asyncHandler(async (req, res) => {
  const {
    club,
    packageName,
    yogaType,
    daysOfWeek,
    sessionsPerDay, // Expect an array of sessions, each with its own price, seats, and discount
    description,
  } = req.body;

  // Validate sessionsPerDay array and ensure each session contains price, numberOfSeats, and discount
  if (
    !sessionsPerDay ||
    !Array.isArray(sessionsPerDay) ||
    sessionsPerDay.length === 0
  ) {
    res.status(400);
    throw new Error(
      "Please provide at least one session with price, seats, and discount information."
    );
  }

  // Check if the package already exists for the club with the same name and type
  const existingPackage = await YogaPackage.findOne({
    club,
    packageName,
    yogaType,
  });

  if (existingPackage) {
    res.status(400);
    throw new Error(
      "Package with the same name and type already exists for this club"
    );
  }

  // Prepare the sessions with their specific prices, seats, and discount objects
  const preparedSessions = sessionsPerDay.map((session) => {
    const { startTime, endTime, price, numberOfSeats, discount } = session;

    const discountData = {
      discountForAll: discount.discountForAll || false,
      discountFrom: discount.discountFrom
        ? new Date(discount.discountFrom)
        : undefined,
      discountTo: discount.discountdiscountTo
        ? new Date(discount.discountTo)
        : undefined,
      priceAfterDiscount: discount.priceAfterDiscount || undefined,
      discountApplicableToNewMembersOnly:
        discount.discountApplicableToNewMembersOnly || false,
      discountStopDays: discount.discountStopDays || undefined,
    };

    return {
      startTime,
      endTime,
      price,
      numberOfSeats,
      discount: discountData, // Assign the constructed discount object for each session
    };
  });

  // Create the new yoga package with sessions
  const newPackage = new YogaPackage({
    club,
    packageName,
    yogaType,
    daysOfWeek,
    sessionsPerDay: preparedSessions, // Pass the prepared sessions with their respective details
    description,
  });

  await newPackage.save();
  res
    .status(201)
    .json({ message: "Yoga package created successfully", data: newPackage });
});

// Update an existing Yoga package by ID
const updateYogaPackage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    packageName,
    yogaType,
    daysOfWeek,
    sessionsPerDay, // Array of sessions with updated session details
    description,
  } = req.body;

  // Find the existing package by ID
  const package = await YogaPackage.findById(id);
  if (!package) {
    res.status(404);
    throw new Error("Yoga package not found");
  }

  // Validate the sessionsPerDay array (if provided) and ensure each session has required fields
  let updatedSessions = package.sessionsPerDay;
  if (sessionsPerDay && Array.isArray(sessionsPerDay)) {
    updatedSessions = sessionsPerDay.map((session, index) => {
      const existingSession = package.sessionsPerDay[index] || {};

      const {
        startTime,
        endTime,
        price,
        numberOfSeats,
        discountForAll,
        discountFrom,
        discountTo,
        priceAfterDiscount,
        discountApplicableToNewMembersOnly,
        discountStopDays,
      } = session;

      const updatedDiscount = {
        discountForAll:
          discountForAll !== undefined
            ? discountForAll
            : existingSession.discount?.discountForAll,
        discountFrom: discountFrom
          ? new Date(discountFrom)
          : existingSession.discount?.discountFrom,
        discountTo: discountTo
          ? new Date(discountTo)
          : existingSession.discount?.discountTo,
        priceAfterDiscount:
          priceAfterDiscount || existingSession.discount?.priceAfterDiscount,
        discountApplicableToNewMembersOnly:
          discountApplicableToNewMembersOnly !== undefined
            ? discountApplicableToNewMembersOnly
            : existingSession.discount?.discountApplicableToNewMembersOnly,
        discountStopDays:
          discountStopDays || existingSession.discount?.discountStopDays,
      };

      return {
        startTime: startTime || existingSession.startTime,
        endTime: endTime || existingSession.endTime,
        price: price || existingSession.price,
        numberOfSeats: numberOfSeats || existingSession.numberOfSeats,
        discount: updatedDiscount, // Update the discount for each session
      };
    });
  }

  // Update package details
  package.packageName = packageName || package.packageName;
  package.yogaType = yogaType || package.yogaType;
  package.daysOfWeek = daysOfWeek || package.daysOfWeek;
  package.sessionsPerDay = updatedSessions; // Update the sessions array
  package.description = description || package.description;

  // Save the updated package
  await package.save();

  res
    .status(200)
    .json({ message: "Yoga package updated successfully", data: package });
});

const deleteYogaPackageById = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPackage = await YogaPackage.findByIdAndDelete(id);

    if (!deletedPackage) {
      return res.status(404).json({ message: "Yoga package not found" });
    }

    res.status(200).json({ message: "Yoga package deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting yoga package", error });
  }
};

const getYogaPackagesByClub = async (req, res) => {
  try {
    const { clubId } = req.params;
    const yogaPackages = await YogaPackage.find({ club: clubId });

    if (!yogaPackages) {
      return res
        .status(404)
        .json({ message: "No yoga packages found for this club" });
    }

    res.status(200).json({ status: "success", data: yogaPackages });
  } catch (error) {
    res.status(500).json({ message: "Error fetching yoga packages", error });
  }
};

// paddle

const createPaddlePackage = asyncHandler(async (req, res) => {
  const {
    club,
    packageName,
    sessionDuration,
    price,
    discount,
    description,
    availableSeats,
  } = req.body;

  // Create a new paddle package
  const newPackage = new PaddlePackage({
    club,
    packageName,
    sessionDuration,
    price,
    discount,
    description,
    
    availableSlots: [],
  });

  await newPackage.save();

  // const createSlotsForDay = async (
  //   packageId,
  //   clubId,
  //   day,
  //   sessionDuration,
  //   numberOfSeats
  // ) => {
  //   const hours = await ClubHours.findOne({ club: clubId, day });
  //   if (!hours || !hours.isOpen) {
  //     return;
  //   }

  //   const startTime = hours.openTime;
  //   const endTime = hours.closeTime;

  //   const createDailySlots = (startTime, endTime, duration, numberOfSeats) => {
  //     const slots = [];
  //     let currentTime = new Date(startTime);

  //     while (currentTime < endTime) {
  //       const slotStart = new Date(currentTime);
  //       const slotEnd = new Date(currentTime.getTime() + duration * 60000);

  //       slots.push({
  //         startTime: slotStart,
  //         endTime: slotEnd,
  //         numberOfSeats,
  //         availableSeats: numberOfSeats,
  //       });

  //       currentTime = new Date(currentTime.getTime() + duration * 60000);
  //     }

  //     return slots;
  //   };

  //   const slots = createDailySlots(
  //     startTime,
  //     endTime,
  //     sessionDuration,
  //     numberOfSeats
  //   );

  //   const package = await PaddlePackage.findById(packageId);
  //   if (!package) {
  //     throw new Error("Package not found");
  //   }

  //   const existingDay = package.availableSlots.find(
  //     (slot) => slot.date.toDateString() === new Date(day).toDateString()
  //   );
  //   if (existingDay) {
  //     existingDay.slots = slots;
  //   } else {
  //     package.availableSlots.push({ date: new Date(day), slots });
  //   }

  //   await package.save();
  // };

  // // Create slots for each day based on the club’s operational hours
  // for (const slot of availableSlots) {
  //   await createSlotsForDay(
  //     newPackage._id,
  //     club,
  //     slot.date,
  //     sessionDuration,
  //     slot.numberOfSeats
  //   );
  // }

  res
    .status(201)
    .json({ message: "Paddle package created successfully", data: newPackage });
});

const deletePaddlePackage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const package = await PaddlePackage.findById(id);
  if (!package) {
    res.status(404).json({ message: "Paddle package not found" });
    return;
  }

  await PaddlePackage.findByIdAndDelete(id);
  res.status(200).json({ message: "Paddle package deleted successfully" });
});

const getAllPaddlePackagesForClub = asyncHandler(async (req, res) => {
  const { clubId } = req.params;

  const packages = await PaddlePackage.find({ club: clubId });
  if (!packages.length) {
    res.status(404).json({ message: "No paddle packages found for this club" });
  } else {
    res.status(200).json(packages);
  }
});

const updatePaddlePackage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { packageName, sessionDuration, price, discount, description } =
    req.body;

  // Find the paddle package by ID
  const paddlePackage = await PaddlePackage.findById(id);
  if (!paddlePackage) {
    res.status(404);
    throw new Error("Paddle package not found");
  }

  // Update the package fields except availableSlots
  if (packageName !== undefined) paddlePackage.packageName = packageName;
  if (sessionDuration !== undefined)
    paddlePackage.sessionDuration = sessionDuration;
  if (price !== undefined) paddlePackage.price = price;
  if (discount !== undefined) {
    const {
      discountForAll,
      discountFrom,
      discountTo,
      priceAfterDiscount,
      discountApplicableToNewMembersOnly,
      discountStopDays,
    } = discount;
    paddlePackage.discount = {
      discountForAll,
      discountFrom,
      discountTo,
      priceAfterDiscount,
      discountApplicableToNewMembersOnly,
      discountStopDays,
    };
  }
  if (description !== undefined) paddlePackage.description = description;

  // Save the updated package
  await paddlePackage.save();

  res.status(200).json({
    message: "Paddle package updated successfully",
    data: paddlePackage,
  });
});
  
//another package  




// Create a new package
const createAnotherPackage = asyncHandler(async (req, res) => {
  const {
    club,
    packageName,
    activityName,
    packageType,
    price,
    discount,
    description,
    seetsCount
  } = req.body;

  const newPackage = new AnotherActivityPackage({
    club,
    packageName,
    activityName,
    packageType,
    price,
    discount,
    description,
    seetsCount ,
    availableSlots: [],
  });

  await newPackage.save();
  res
    .status(201)
    .json({ message: "Package created successfully", data: newPackage });
});

// Get all packages
const getAllPackages = asyncHandler(async (req, res) => {
  const packages = await AnotherActivityPackage.find({});
  res.status(200).json({ success: true, data: packages });
});

// Get a single package by ID
const getPackageById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const package = await AnotherActivityPackage.findById(id);

  if (!package) {
    return res.status(404).json({ message: "Package not found" });
  }

  res.status(200).json({ success: true, data: package });
});

// Update an existing package
const updatePackage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const updatedPackage = await AnotherActivityPackage.findByIdAndUpdate(
    id,
    updateData,
    { new: true }
  );

  if (!updatedPackage) {
    return res.status(404).json({ message: "Package not found" });
  }

  res.status(200).json({ success: true, data: updatedPackage });
});

// Delete a package by ID
const deletePackage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const package = await AnotherActivityPackage.findById(id);

  if (!package) {
    return res.status(404).json({ message: "Package not found" });
  }

  await package.remove();
  res.status(200).json({ message: "Package deleted successfully" });
});






module.exports = {
  createWeightFitnessPackage,
  getWeightFitnessPackagesForClub,
  updateWeightFitnessPackage,
  deleteWeightFitnessPackage,

  // yoga
  createYogaPackage,
  updateYogaPackage,
  getYogaPackagesByClub,
  deleteYogaPackageById,
  //  paddle
  createPaddlePackage,
  deletePaddlePackage,
  getAllPaddlePackagesForClub,
  updatePaddlePackage, 
  // another packages 



  createAnotherPackage,
  getAllPackages,
  getPackageById,
  updatePackage,
  deletePackage,
}