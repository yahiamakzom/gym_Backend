const bcrypt = require("bcrypt");
const User = require("../models/User");
const Representative = require("../models/Representative ");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const { sign } = require("jsonwebtoken");
// exports.Register = asyncHandler(async (req, res, next) => {
//   const {
//     username,
//     phone,
//     password,
//     role,
//     home_location,
//     email,
//     gender,
//     lat,
//     long,
//   } = req.body;

//   if (!lat || !long) {
//     lat = "24.7136";
//     long = "46.6753";
//   }
//   await User.findOne({ email }).then(async (user) => {
//     const code = Math.floor(Math.random() * 1000000);
//     if (user) return next(new ApiError("Email Or Phone Already Exists", 409));
//     await User.create({
//       email,
//       username,
//       phone,
//       role,
//       password: await bcrypt.hash(password, 10),
//       home_location,

//       code,
//       gender,
//       wallet: 0,
//       lat,
//       long,
//     }).then((user) => res.status(201).json({ user }));
//     const token = sign({ id: user.id, role: user.role }, process.env.TOKEN);
//     user.token = token;
//   });
// });
exports.Register = asyncHandler(async (req, res, next) => {
  const {
    username,
    phone,
    password,
    role,
    home_location,
    email,
    gender,
    lat,
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
    gender,
    wallet: 0,
  };

  // Update lat and long if provided in the request body
  if (lat !== undefined && long !== undefined) {
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
    res.json({ user, token });
  } catch (error) {
    console.error(error);
    return next(new ApiError("Internal Server Error", 500));
  }
});
