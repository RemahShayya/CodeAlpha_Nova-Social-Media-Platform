import multer from "multer";
import supabaseStorage from "./supabaseStorage.js";

const storage = supabaseStorage({ folder: "profile-pictures" });

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, and WebP images are allowed."), false);
  }
};

export const uploadProfilePicture = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
}).single("profilePicture");
