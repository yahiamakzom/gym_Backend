const asyncHandler = require("express-async-handler");
const Representative = require("../models/Representative ");
exports.getClubs = asyncHandler(async (req, res, next) => {
  try {
    const repId = req.body.id;

    const representative = await Representative.findById(repId).populate(
      "clups"
    );

    if (!representative) {
      console.log(`Representative with ID '${repId}' not found.`);
      res.status(401).json({message :"Not Found"})
      return null;
    }

    const formattedClubs = representative.clups.map((club) => ({
      _id: club._id,
      name: club.name,
      logo: club.logo,
    }));

    res.status(200).json({clubs: formattedClubs });
  } catch (error) {
    console.error("Error fetching clubs for representative:", error);
    throw error;
  }
  throw error;
});
