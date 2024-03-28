const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Club",
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: [true, "Please Enter Club Name"],
        trim: true,
      },
      gender: {
        type: String,
        required: [true, "Please Enter Gender"],
        enum: ["male", "female", "both"],
      },
      mapUrl: {
        type: String,
        default:"https://www.google.com/maps/@24.7207538,46.4222781,9.96z?entry=ttu"
      },
      // days: {
      //     type: String,
      //     required:[true,"please add Days"]
      // },
      from: {
        type: String,
      },
      to: {
        type: String,
      },
      allDay: {
        type: Boolean,
        default: false,
      },
      country: {
        type: String,
        required: [true, "Please Enter country Name"],
        trim: true,
      },
      city: {
        type: String,
        required: [true, "Please Enter city Name"],
        trim: true,
      },
      lat: {
        type: String,
        required: [true, "please add club lat"],
      },
      long: {
        type: String,
        required: [true, "please add club long"],
      },
      description: {
        type: String,
        required: [true, "Please Enter Description "],
      },
      sports: Array,
      WorkingDays: Array,
      images: Array,
      location: {
        type: String,
        trim: true,
      },
      logo: String,
      commission: {
        type: Number,
        required: [true, "Please Enter Commmission Of Club"],
      },

      discounts: [
        {
          discountCode: {
            type: String,
            default: null,
          },
          discountQuantity: {
            type: Number,
            default: null,
          },
        },
      ],
      evaluation: {
        evaluators: [
          {
            user: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User", // Assuming you have a User model
            },
            rating: {
              type: Number,
              min: 1,
              max: 5,
            },
          },
        ],
        averageRating: {
          type: Number,
          default: null,
        },
      },
    },

    { timestamps: true }
  )
);
