import multer from "multer";

// multer setup for file upload and file storage
const storage = multer.diskStorage({
  destination: function (_, _, cb) {
    cb(null, "./public/images");
  },
  filename: function (_, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

// middleware for file upload
export const upload = multer({
  storage: storage,
  limits: {
    fieldSize: 1024 * 1024 * 1,
  },
});
