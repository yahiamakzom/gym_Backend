const mongoose = require("mongoose");

const clubSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      default: "superadmin",
      enum: ["admin", "superadmin"],
    },
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
      default:
        "https://www.google.com/maps/@24.7207538,46.4222781,9.96z?entry=ttu",
    },
    isAddClubs: {
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
    ClubAdd: {
      type: String,
    },
    clubMemberCode: {
      type: String,
      // unique: true,
    },
    isWork: {
      type: Boolean,
      default: true,
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
    hours: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ClubHours",
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
    parentClub: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      default: null,
    },
    stopSchedule: {
      start: {
        type: Date,
        default: null,
      },
      end: {
        type: Date,
        default: null,
      },
    },
    isTemporarilyStopped: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

clubSchema.methods.getSubClubs = async function () {
  return await mongoose.model("Club").find({ parentClub: this._id });
};

clubSchema.statics.findSubClubs = async function (superAdminClubId) {
  return await this.find({ parentClub: superAdminClubId });
};

clubSchema.methods.reactivateIfNeeded = async function () {
  const now = new Date();
  if (this.isTemporarilyStopped) {
    if (this.stopSchedule.end && new Date(this.stopSchedule.end) <= now) {
      this.isTemporarilyStopped = false;
      this.isActive = true;
      await this.save();
    }
  }
};

module.exports = mongoose.model("Club", clubSchema);
