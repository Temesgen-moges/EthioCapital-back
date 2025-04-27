// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema(
//   {
//     role: {
//       type: String,
//       enum: ["investor", "entrepreneur","admin"],
//       required: true,
//     },
//     fullName: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//       match: [
//         /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
//         "Please enter a valid email address.",
//       ],
//     },
//     password: {
//       type: String,
//       required: true,
//       minlength: 6,
//     },
//     companyName: {
//       type: String,
//       trim: true,
//     },
//     industry: {
//       type: String,
//       trim: true,
//     },
//     investmentInterests: {
//       type: [String],
//       default: [],
//     },
//     idDocument: {
//       type: String, // Store file path or URL
//     },
//     bankStatement: {
//       type: String, // Store file path or URL
//     },
//     portfolioEvidence: {
//       type: String, // Store file path or URL
//     },
//     businessPlan: {
//       type: String, // Store file path or URL
//     },
//     fundingPurpose: {
//       type: String,
//       trim: true,
//     },
//     requestedAmount: {
//       type: Number,
//       min: 0,
//     },
//     educationDetails: {
//       type: String,
//       trim: true,
//     },
//     createdAt: {
//       type: Date,
//       default: Date.now,
//     },
//     status: {
//       type: String,
//       enum: ["pending", "approved", "rejected"],
//       default: "pending",
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // Middleware to hash passwords before saving (if needed)
// import bcrypt from "bcrypt";
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

// // Static method to compare passwords
// userSchema.methods.comparePassword = async function (password) {
//   return bcrypt.compare(password, this.password);
// };

// const User = mongoose.model("User", userSchema);

// export default User;


import mongoose from "mongoose";
// import bcrypt from "bcrypt";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["investor", "entrepreneur", "admin"],
      required: true,
      default: "investor",
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address.",
      ],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    companyName: {
      type: String,
      trim: true,
    },
    industry: {
      type: String,
      trim: true,
    },
    investmentInterests: {
      type: [String],
      default: [],
    },
    idDocument: {
      type: String,
    },
    bankStatement: {
      type: String,
    },
    portfolioEvidence: {
      type: String,
    },
    businessPlan: {
      type: String,
    },
    fundingPurpose: {
      type: String,
      trim: true,
    },
    requestedAmount: {
      type: Number,
      min: 0,
    },
    educationDetails: {
      type: String,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
    suppressReservedKeysWarning: true,
  }
);

// Hash password before saving, only if not already hashed
userSchema.pre("save", async function (next) {
  if (this.isModified("password") && !this.password.startsWith("$2b$")) {
    console.log("Hashing password in pre-save hook:", this.password);
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;