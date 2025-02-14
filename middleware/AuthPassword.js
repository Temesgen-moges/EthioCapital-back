// // Middleware to hash passwords before saving (if needed)
// // const bcrypt = require("bcrypt");
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
