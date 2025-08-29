// // import User from "../../models/User.js";
// // import UserProfile from "../../models/UserProfile.js";
// // import fs from "fs"

// // export const getUsers = async (req, res) => {
// //   try {
// //     console.log("the dispatch is working");

// //     // const { userId } = req.user; 
// //     const users = await User.find();
// //     res.status(200).json(users);
// //   } catch (error) {
// //     console.error("Error getting users:", error);
// //     res.status(500).json({ message: "An error occurred while retrieving users." });
// //   }
// // };

// // export const getUserById = async (req, res) => {
// //   try {
// //     const { userId } = req.user;
// //     const user = await User.findById(userId);
// //     if (!user) {
// //       return res.status(404).json({ message: "User not found." });
// //     }
// //     res.status(200).json(user);
// //   } catch (error) {
// //     console.error("Error getting user by ID:", error);
// //     res.status(500).json({ message: "An error occurred while retrieving the user." });
// //   }
// // };

// // export const getUserProfile = async (req, res) => {
// //   try {
// //     const { userId } = req.user;
// //     console.log("user id for profile", userId);
    
// //     const userProfile = await UserProfile.findOne({user: userId}).populate('user', 'fullName');
// //     if (!userProfile) {
// //       return res.status(404).json({ message: "User profile not found." });
// //     }
// //     res.status(200).json(userProfile);
// //   } catch (error) {
// //     console.error("Error getting user profile:", error);
// //     res.status(500).json({ message: "An error occurred while retrieving the user profile." });
// //   }
// // };

// // export const getEntrepreneursProfile = async (req, res) => {
// //   try {
// //     const {id} = req.params;
// //     const profile = await UserProfile.findById(id).populate('user', 'fullName');

// //     res.status(200).json(profile);
// //   } catch (error) {
// //     console.error("Error getting entrepreneurs:", error);
// //     res.status(500).json({ message: "An error occurred while retrieving entrepreneurs." });
// //   }
// // };

// // export const createProfile = async (req, res) => {
// //   try {
// //     const { userId } = req.user;
// //     console.log("userId", userId);
// //     console.log("req.body", req.body);
// //     console.log("req.files", req.files);
// //     const user = await User.findById(userId);

// //     // Parse each key in req.body (they were stringified on the client)
// //     const parsedData = {};
// //     Object.entries(req.body).forEach(([Key, value]) => {
// //       try {
// //         parsedData[Key] = JSON.parse(value)
// //       } catch (error) {
// //         parsedData[Key] = value;
// //       }
// //     });

// //     // Process file uploads from req.files and integrate them into the file field.
// //     let photo = null;
// //     if (req.file) {
// //       // If you have an uploaded file via multipart/form-data, use its path.
// //       photo = req.file.path;
// //     } else if (req.body.photo) {
// //       // If the client sends the photo as a Base64 string in the body, use it.
// //       photo = req.body.photo;
// //     }

// //     if (!user) {
// //       return res
// //         .status(404)
// //         .json({ message: 'User with id ' + userId + ' not found.' });
// //     }
// //     const newProfile = new UserProfile({
// //       ...parsedData, // All the idea details
// //       user: userId,  // Associate this idea with the user
// //       photo: photo
// //     });

// //     await newProfile.save();

// //     res.status(201).json({ message: 'Profile created successfully!', profile: newProfile });

// //   } catch (error) {
// //     console.error("Error getting user profile:", error);
// //     res.status(500).json({ message: "An error occurred while retrieving the user profile." });
// //   }
// // };

// // export const updateProfile = async (req, res) => {
// //   try {
// //     const { userId } = req.user;
// //     const parsedData = {};
// //     Object.entries(req.body).forEach(([Key,value])=>{
// //       try {
// //         parsedData[Key] = JSON.parse(value);
        
// //       } catch (error) {
// //         parsedData[Key] = value;
// //       }

// //     });
// //     const profile = await UserProfile.findOne({user: userId});
// //     if (!profile) {
// //       return res.status(404).json({ message: 'Profile not found.' });
// //     }

// //     if (req.files["photo"]) {
// //       if (profile.photo) {
// //           fs.unlinkSync(profile.photo); // Delete old image file
// //       }
// //       profile.photo = req.files["photo"][0].path;
// //   }

// //   // Handle document file upload
// //   if (req.files["documents"]) {
// //       profile.documents = req.files["documents"].map((file) => file.path);
// //   }

// //     Object.assign(profile,parsedData);
// //     await profile.save();

// //     res.status(200).json({ message: 'Profile updated successfully!', profile });
// //   } catch (error) {
// //     console.error("Error Updating user profile:", error);
// //     res.status(500).json({ message: "An error occurred while Updating the user profile." });
// //   }
// // };

// // export const deleteProfile = async (req, res) => {
// //   try {
// //     const { userId } = req.user;
// //     const userProfile = await UserProfile.findOne({user: userId});
// //     if (!userProfile) {
// //       return res.status(404).json({ message: "User profile not found." });
// //     }

// //     if(userProfile.photo){
// //       fs.unlinkSync(userProfile.photo);
// //     }

// //     await userProfile.deleteOne();
// //     res.status(200).json({ message: 'Profile deleted successfully!' });
// //   } catch (error) {
// //     console.error("Error Deleting user profile:", error);
// //     res.status(500).json({ message: "An error occurred while deleting the user profile." });
// //   }
// // };

// import User from "../../models/User.js";
// import UserProfile from "../../models/UserProfile.js";
// import fs from "fs"

// export const getUsers = async (req, res) => {
//   try {
//     console.log("the dispatch is working");

//     // const { userId } = req.user; 
//     const users = await User.find();
//     res.status(200).json(users);
//   } catch (error) {
//     console.error("Error getting users:", error);
//     res.status(500).json({ message: "An error occurred while retrieving users." });
//   }
// };

// export const getUserById = async (req, res) => {
//   try {
//     const { userId } = req.user;
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found." });
//     }
//     res.status(200).json(user);
//   } catch (error) {
//     console.error("Error getting user by ID:", error);
//     res.status(500).json({ message: "An error occurred while retrieving the user." });
//   }
// };

// export const getUserProfile = async (req, res) => {
//   try {
//     const { userId } = req.user;
//     console.log("user id for profile", userId);
    
//     const userProfile = await UserProfile.findOne({user: userId}).populate('user', 'fullName');
//     if (!userProfile) {
//       return res.status(404).json({ message: "User profile not found." });
//     }
//     res.status(200).json(userProfile);
//   } catch (error) {
//     console.error("Error getting user profile:", error);
//     res.status(500).json({ message: "An error occurred while retrieving the user profile." });
//   }
// };

// export const getEntrepreneursProfile = async (req, res) => {
//   try {
//     const {id} = req.params;
//     const profile = await UserProfile.findById(id).populate('user', 'fullName');

//     res.status(200).json(profile);
//   } catch (error) {
//     console.error("Error getting entrepreneurs:", error);
//     res.status(500).json({ message: "An error occurred while retrieving entrepreneurs." });
//   }
// };

// export const createProfile = async (req, res) => {
//   try {
//     const { userId } = req.user;
//     console.log("userId", userId);
//     console.log("req.body", req.body);
//     console.log("req.files", req.files);
//     const user = await User.findById(userId);

//     // Parse each key in req.body (they were stringified on the client)
//     const parsedData = {};
//     Object.entries(req.body).forEach(([Key, value]) => {
//       try {
//         parsedData[Key] = JSON.parse(value)
//       } catch (error) {
//         parsedData[Key] = value;
//       }
//     });

//     // Process file uploads from req.files and integrate them into the file field.
//     let photo = null;
//     if (req.file) {
//       // If you have an uploaded file via multipart/form-data, use its path.
//       photo = req.file.path;
//     } else if (req.body.photo) {
//       // If the client sends the photo as a Base64 string in the body, use it.
//       photo = req.body.photo;
//     }

//     if (!user) {
//       return res
//         .status(404)
//         .json({ message: 'User with id ' + userId + ' not found.' });
//     }
//     const newProfile = new UserProfile({
//       ...parsedData, // All the idea details
//       user: userId,  // Associate this idea with the user
//       photo: photo
//     });

//     await newProfile.save();

//     res.status(201).json({ message: 'Profile created successfully!', profile: newProfile });

//   } catch (error) {
//     console.error("Error getting user profile:", error);
//     res.status(500).json({ message: "An error occurred while retrieving the user profile." });
//   }
// };

// export const updateProfile = async (req, res) => {
//   try {
//     const { userId } = req.user;
//     const parsedData = {};
//     Object.entries(req.body).forEach(([Key,value])=>{
//       try {
//         parsedData[Key] = JSON.parse(value);
        
//       } catch (error) {
//         parsedData[Key] = value;
//       }

//     });
//     const profile = await UserProfile.findOne({user: userId});
//     if (!profile) {
//       return res.status(404).json({ message: 'Profile not found.' });
//     }

//     if (req.files["photo"]) {
//       if (profile.photo) {
//           fs.unlinkSync(profile.photo); // Delete old image file
//       }
//       profile.photo = req.files["photo"][0].path;
//   }

//   // Handle document file upload
//   if (req.files["documents"]) {
//       profile.documents = req.files["documents"].map((file) => file.path);
//   }

//     Object.assign(profile,parsedData);
//     await profile.save();

//     res.status(200).json({ message: 'Profile updated successfully!', profile });
//   } catch (error) {
//     console.error("Error Updating user profile:", error);
//     res.status(500).json({ message: "An error occurred while Updating the user profile." });
//   }
// };

// export const deleteProfile = async (req, res) => {
//   try {
//     const { userId } = req.user;
//     const userProfile = await UserProfile.findOne({user: userId});
//     if (!userProfile) {
//       return res.status(404).json({ message: "User profile not found." });
//     }

//     if(userProfile.photo){
//       fs.unlinkSync(userProfile.photo);
//     }

//     await userProfile.deleteOne();
//     res.status(200).json({ message: 'Profile deleted successfully!' });
//   } catch (error) {
//     console.error("Error Deleting user profile:", error);
//     res.status(500).json({ message: "An error occurred while deleting the user profile." });
//   }
// };

import User from "../../models/User.js";
import UserProfile from "../../models/UserProfile.js";
import fs from "fs"

export const getUsers = async (req, res) => {
  try {
    console.log("the dispatch is working");

    // const { userId } = req.user; 
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({ message: "An error occurred while retrieving users." });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error getting user by ID:", error);
    res.status(500).json({ message: "An error occurred while retrieving the user." });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    console.log("user id for profile", userId);
    
    const userProfile = await UserProfile.findOne({user: userId}).populate('user', 'fullName');
    if (!userProfile) {
      return res.status(404).json({ message: "User profile not found." });
    }
    res.status(200).json(userProfile);
  } catch (error) {
    console.error("Error getting user profile:", error);
    res.status(500).json({ message: "An error occurred while retrieving the user profile." });
  }
};

export const getEntrepreneursProfile = async (req, res) => {
  try {
    const {id} = req.params;
    const profile = await UserProfile.findById(id).populate('user', 'fullName');

    res.status(200).json(profile);
  } catch (error) {
    console.error("Error getting entrepreneurs:", error);
    res.status(500).json({ message: "An error occurred while retrieving entrepreneurs." });
  }
};

export const createProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    console.log("userId", userId);
    console.log("req.body", req.body);
    console.log("req.files", req.files);
    const user = await User.findById(userId);

    // Parse each key in req.body (they were stringified on the client)
    const parsedData = {};
    Object.entries(req.body).forEach(([Key, value]) => {
      try {
        parsedData[Key] = JSON.parse(value)
      } catch (error) {
        parsedData[Key] = value;
      }
    });

    // Process file uploads from req.files and integrate them into the file field.
    let photo = null;
    if (req.file) {
      // If you have an uploaded file via multipart/form-data, use its path.
      photo = req.file.path;
    } else if (req.body.photo) {
      // If the client sends the photo as a Base64 string in the body, use it.
      photo = req.body.photo;
    }

    if (!user) {
      return res
        .status(404)
        .json({ message: 'User with id ' + userId + ' not found.' });
    }
    const newProfile = new UserProfile({
      ...parsedData, // All the idea details
      user: userId,  // Associate this idea with the user
      photo: photo
    });

    await newProfile.save();

    res.status(201).json({ message: 'Profile created successfully!', profile: newProfile });

  } catch (error) {
    console.error("Error getting user profile:", error);
    res.status(500).json({ message: "An error occurred while retrieving the user profile." });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const parsedData = {};
    Object.entries(req.body).forEach(([Key,value])=>{
      try {
        parsedData[Key] = JSON.parse(value);
        
      } catch (error) {
        parsedData[Key] = value;
      }

    });
    const profile = await UserProfile.findOne({user: userId});
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found.' });
    }

    if (req.files["photo"]) {
      if (profile.photo) {
          fs.unlinkSync(profile.photo); // Delete old image file
      }
      profile.photo = req.files["photo"][0].path;
  }

  // Handle document file upload
  if (req.files["documents"]) {
      profile.documents = req.files["documents"].map((file) => file.path);
  }

    Object.assign(profile,parsedData);
    await profile.save();

    res.status(200).json({ message: 'Profile updated successfully!', profile });
  } catch (error) {
    console.error("Error Updating user profile:", error);
    res.status(500).json({ message: "An error occurred while Updating the user profile." });
  }
};

export const deleteProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const userProfile = await UserProfile.findOne({user: userId});
    if (!userProfile) {
      return res.status(404).json({ message: "User profile not found." });
    }

    if(userProfile.photo){
      fs.unlinkSync(userProfile.photo);
    }

    await userProfile.deleteOne();
    res.status(200).json({ message: 'Profile deleted successfully!' });
  } catch (error) {
    console.error("Error Deleting user profile:", error);
    res.status(500).json({ message: "An error occurred while deleting the user profile." });
  }
};



// import User from "../../models/User.js";
// import UserProfile from "../../models/UserProfile.js";
// import fs from "fs";

// export const getUsers = async (req, res) => {
//   try {
//     const { _id, role } = req.user;
//     const { role: roleFilter } = req.query;

//     // Verify the authenticated user exists
//     const user = await User.findById(_id);
//     if (!user) {
//       console.log("Authenticated user not found:", _id);
//       return res.status(404).json({ message: "Authenticated user not found." });
//     }

//     // Admins can fetch all users or filtered by role
//     if (role === "admin") {
//       const query = roleFilter ? { role: roleFilter.toLowerCase() } : {};
//       const users = await User.find(query)
//         .select("fullName email role status companyName industry createdAt investmentInterests fundingPurpose requestedAmount")
//         .lean();
//       console.log("Admin fetched users:", users.length);
//       return res.status(200).json(users);
//     }

//     // Non-admins can only fetch their own data
//     const userData = await User.findById(_id)
//       .select("fullName email role status companyName industry createdAt investmentInterests fundingPurpose requestedAmount")
//       .lean();
//     console.log("Non-admin fetched user:", userData.email);
//     return res.status(200).json([userData]);
//   } catch (error) {
//     console.error("[getUsers] Error getting users:", {
//       message: error.message,
//       stack: error.stack,
//     });
//     res.status(500).json({ message: "An error occurred while retrieving users." });
//   }
// };

// // ... other controllers remain unchanged
// export const getUserById = async (req, res) => {
//   try {
//     const { _id } = req.user;
//     const user = await User.findById(_id);
//     if (!user) {
//       return res.status(404).json({ message: "User not found." });
//     }
//     res.status(200).json(user);
//   } catch (error) {
//     console.error("Error getting user by ID:", error);
//     res.status(500).json({ message: "An error occurred while retrieving the user." });
//   }
// };

// export const getUserProfile = async (req, res) => {
//   try {
//     const { _id } = req.user;
//     console.log("user id for profile", _id);
//     const userProfile = await UserProfile.findOne({ user: _id }).populate("user", "fullName");
//     if (!userProfile) {
//       return res.status(404).json({ message: "User profile not found." });
//     }
//     res.status(200).json(userProfile);
//   } catch (error) {
//     console.error("Error getting user profile:", error);
//     res.status(500).json({ message: "An error occurred while retrieving the user profile." });
//   }
// };

// export const getEntrepreneursProfile = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const profile = await UserProfile.findById(id).populate("user", "fullName");
//     if (!profile) {
//       return res.status(404).json({ message: "Entrepreneur profile not found." });
//     }
//     res.status(200).json(profile);
//   } catch (error) {
//     console.error("Error getting entrepreneurs:", error);
//     res.status(500).json({ message: "An error occurred while retrieving entrepreneurs." });
//   }
// };

// export const createProfile = async (req, res) => {
//   try {
//     const { _id } = req.user;
//     console.log("userId", _id);
//     console.log("req.body", req.body);
//     console.log("req.files", req.files);
//     const user = await User.findById(_id);
//     const parsedData = {};
//     Object.entries(req.body).forEach(([key, value]) => {
//       try {
//         parsedData[key] = JSON.parse(value);
//       } catch (error) {
//         parsedData[key] = value;
//       }
//     });
//     let photo = null;
//     if (req.file) {
//       photo = req.file.path;
//     } else if (req.body.photo) {
//       photo = req.body.photo;
//     }
//     if (!user) {
//       return res.status(404).json({ message: `User with id ${_id} not found.` });
//     }
//     const newProfile = new UserProfile({
//       ...parsedData,
//       user: _id,
//       photo: photo,
//     });
//     await newProfile.save();
//     res.status(201).json({ message: "Profile created successfully!", profile: newProfile });
//   } catch (error) {
//     console.error("Error creating user profile:", error);
//     res.status(500).json({ message: "An error occurred while creating the user profile." });
//   }
// };

// export const updateProfile = async (req, res) => {
//   try {
//     const { _id } = req.user;
//     const parsedData = {};
//     Object.entries(req.body).forEach(([key, value]) => {
//       try {
//         parsedData[key] = JSON.parse(value);
//       } catch (error) {
//         parsedData[key] = value;
//       }
//     });
//     const profile = await UserProfile.findOne({ user: _id });
//     if (!profile) {
//       return res.status(404).json({ message: "Profile not found." });
//     }
//     if (req.files["photo"]) {
//       if (profile.photo) {
//         fs.unlinkSync(profile.photo);
//       }
//       profile.photo = req.files["photo"][0].path;
//     }
//     if (req.files["documents"]) {
//       profile.documents = req.files["documents"].map((file) => file.path);
//     }
//     Object.assign(profile, parsedData);
//     await profile.save();
//     res.status(200).json({ message: "Profile updated successfully!", profile });
//   } catch (error) {
//     console.error("Error updating user profile:", error);
//     res.status(500).json({ message: "An error occurred while updating the user profile." });
//   }
// };

// export const deleteProfile = async (req, res) => {
//   try {
//     const { _id } = req.user;
//     const userProfile = await UserProfile.findOne({ user: _id });
//     if (!userProfile) {
//       return res.status(404).json({ message: "User profile not found." });
//     }
//     if (userProfile.photo) {
//       fs.unlinkSync(userProfile.photo);
//     }
//     await userProfile.deleteOne();
//     res.status(200).json({ message: "Profile deleted successfully!" });
//   } catch (error) {
//     console.error("Error deleting user profile:", error);
//     res.status(500).json({ message: "An error occurred while deleting the user profile." });
//   }
// };