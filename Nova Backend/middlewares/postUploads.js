import multer from 'multer';
import supabaseStorage from './supabaseStorage.js';

const storage = supabaseStorage({ folder: 'posts' });
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, WebP images or MP4/MOV videos are allowed.'), false);
  }
};
export const uploadPostMedia = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 },
}).single('media');
export const deriveMediaType = (mimetype) => {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  return null;
};
