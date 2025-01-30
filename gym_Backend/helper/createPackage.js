// Utility function to create a package for a club
const createPackageForClub = async (
  PackageModel,
  clubId,
  packageData,
  superadminId
) => {
  // Check if a package with the same name and type already exists for this club
  const existingPackage = await PackageModel.findOne({
    club: clubId,
    packageName: packageData.packageName,
    packageType: packageData.packageType,
  });

  if (existingPackage) {
    throw new Error(
      "Package with the same name and type already exists for this club"
    );
  }

  // Create a new package instance
  const newPackage = new PackageModel({
    ...packageData,
    superadminId, 
    club: clubId,
  });


  await newPackage.save();


  newPackage.superadminId = `${superadminId}_${newPackage._id}`;
  await newPackage.save();
};

module.exports = createPackageForClub;
