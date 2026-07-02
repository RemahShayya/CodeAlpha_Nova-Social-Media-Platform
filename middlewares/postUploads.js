import multer from 'multer';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/posts/'),
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop();
    cb(null, `${req.user.id}-${Date.now()}.${ext}`);
  },
});

// Posts allow images AND short videos, unlike profile pictures which are
// image-only — same diskStorage pattern as middlewares/uploads.js, just a
// wider fileFilter and a different destination folder.
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
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB — videos are bigger than profile pics
}).single('media');

// Derives 'image' | 'video' from the uploaded file's mimetype — never
// trust the client to declare this themselves.  Equivalent to a small
// private static helper you'd call right after model binding in .NET.
export const deriveMediaType = (mimetype) => {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  return null;
};
