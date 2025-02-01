const bcrypt = require("bcrypt");
const User = require("../models/User");
const Representative = require("../models/Representative ");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const { sign } = require("jsonwebtoken");
const Clubs = require("../models/Club");
const ClubUser = require("../models/ClubUser");

exports.Register = asyncHandler(async (req, res, next) => {
  const {
    username,
    phone,
    password,
    role,
    home_location,
    email,
    gender,
    weight,
    height,
    lat,
    age,
    long,
  } = req.body;

  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ApiError("Email Or Phone Already Exists", 409));
  }

  // Generate a random code
  const code = Math.floor(Math.random() * 1000000);

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create the user object with default values
  const userObject = {
    email,
    username,
    phone,
    role,
    password: hashedPassword,
    home_location,
    code,
    age,
    gender,
    wallet: 0,
  };

  // Update lat and long if provided in the request body
  if (lat !== undefined && long !== undefined) {
    userObject.weight = weight;
    userObject.height = height;
  }
  if (height !== undefined && weight !== undefined) {
    userObject.lat = lat;
    userObject.long = long;
  }

  // Create the user
  const newUser = await User.create(userObject);

  // Generate JWT token
  const token = sign({ id: newUser.id, role: newUser.role }, process.env.TOKEN);
  newUser.token = token;

  res.status(201).json({ user: newUser });
});

exports.Login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const representative = await Representative.findOne({ email, password });
    if (representative) {
      console.log(representative);
      res
        .status(200)
        .json({ user: representative, token: representative.token });

      return;
    }

    const user = await User.findOne({ email });

    if (!user) {
      return next(new ApiError("User not found", 404));
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return next(new ApiError("Password Not Match", 400));
    }

    const token = sign({ id: user.id, role: user.role }, process.env.TOKEN);
    delete user._doc.password;
    user.token = token;
    console.log(token);
    const club = await Clubs.findById(user.club);
    console.log(club);
    if (club) {
      console.log(club);
      if ((club.isAddClubs = true)) {
        const allClubsAdded = await Clubs.find({ ClubAdd: club._id });

        if (allClubsAdded.length > 0) {
          user.role = "clubManger";
          return res.json({ user, token });
        }
      } else {
        user.role = "client";
      }
    }

    res.json({ user, token });
  } catch (error) {
    console.error(error);
    return next(new ApiError("Internal Server Error", 500));
  }
});

// exports.ClubLogin = asyncHandler(async (req, res, next) => {
//   const { email, id } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     console.log(user);
//     if (!user) {
//       return next(new ApiError("User not found", 404));
//     }

//     const token = sign({ id: user.id, role: user.role }, process.env.TOKEN);
//     delete user._doc.password;
//     user.token = token;

//     const club = await Clubs.findById(user.club);

//     if (!club) {
//       return next(new ApiError("User not found", 404));
//     }
//     if (club._id != id) {
//       return next(new ApiError("User not found", 404));
//     }
//     console.log(club._id, id, "result of ", club._id == id);

//     res.json({ user, token });
//   } catch (error) {
//     console.error(error);
//     return next(new ApiError("Internal Server Error", 500));
//   }
// });

// exports.ClubMemberLogin = asyncHandler(async (req, res, next) => {
//   const { clubMemberCode } = req.body;

//   try {
//     const club = await Clubs.findOne({ clubMemberCode });

//     if (!club) {
//       return res.status(404).json({});
//     }
//     const user = await User.findOne({ club: club._id });

//     console.log("user", user);
//     if (!user) {
//       return res.status(404).json({});
//     }
//     const token = sign({ id: user.id, role: user.role }, process.env.TOKEN);
//     delete user._doc.password;
//     user.token = token;

//     res.json({ user, token });
//   } catch (error) {
//     console.log("errrororoorororoor");
//     console.error(error);
//     return next(new ApiError("Internal Server Error", 500));
//   }
// });

exports.LoginControlPanel = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (user) {
      // Generate JWT token
      const token = sign({ id: user.id }, process.env.TOKEN);

      // Remove password from the user object
      const userResponse = { ...user._doc, token };
      delete userResponse.password;

      if (user.role === "admin") {
        if (user.password !== password) {
          return res.status(400).json({
            error: "Invalid password",
            success: false,
          });
        }

        return res.status(200).json({
          role: "owner",
          id: user.id,
          token,
          status: true,
          message: "Login successful",
        });
      }
    } else {
      const clubUser = await ClubUser.findOne({ email });
      
      if (!clubUser) {
        return res
          .status(404)
          .json({ error: "User not found", success: false });
      }

      const isPasswordValid = await bcrypt.compare(password, clubUser.password);
      if (!isPasswordValid) {
        return res
          .status(400)
          .json({ error: "Invalid password", success: false });
      }

      // Generate JWT token
      const token = sign({ id: clubUser.id }, process.env.TOKEN);

      // Remove password from the clubUser object
      const clubUserResponse = { ...clubUser._doc, token };
      delete clubUserResponse.password;

      const club = await Clubs.findById(clubUser.club);
      if (!club) {
        return res
          .status(404)
          .json({ error: "Club not found", success: false });
      }

      // Fetch sub-clubs associated with the found club
      const subClubs = await club.getSubClubs();

      return res.status(200).json({
        status: true,
        role: "suberadmin",
        token,
        id: club._id,
        message: "Login successful",
      });
    }
  } catch (error) {
    console.error(error);
    return next(new ApiError("Internal Server Error", 500));
  }
});
