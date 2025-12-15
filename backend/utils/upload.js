import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import dotenv from 'dotenv';
import streamifier from 'streamifier';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Memory storage for multer (we'll upload to Cloudinary in the route)
const storage = multer.memoryStorage();

// For images only
export const uploadImage = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    fieldSize: 50 * 1024 * 1024, // 50MB for non-file fields
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// For videos only
export const uploadVideo = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
    fieldSize: 50 * 1024 * 1024, // 50MB for non-file fields
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'), false);
    }
  }
});

// For multiple images
export const uploadImages = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 10, // max 10 files
    fieldSize: 50 * 1024 * 1024, // 50MB for non-file fields
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// For categories - accepts both images and videos
export const uploadCategoryFiles = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB per file
    fieldSize: 50 * 1024 * 1024, // 50MB for non-file fields
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed!'), false);
    }
  }
});

// For products - accepts both images and videos
export const uploadProductFiles = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB per file
    fieldSize: 50 * 1024 * 1024, // 50MB for non-file fields (like JSON product data)
    fields: 20, // Maximum number of non-file fields
    fieldNameSize: 200, // Maximum field name size
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed!'), false);
    }
  }
});

// Check if Cloudinary is configured
const isCloudinaryConfigured = () => {
  return process.env.CLOUDINARY_CLOUD_NAME && 
         process.env.CLOUDINARY_API_KEY && 
         process.env.CLOUDINARY_API_SECRET;
};

// Helper function to upload buffer to Cloudinary
export const uploadToCloudinary = async (buffer, folder = 'waterjunction', resourceType = 'image') => {
  // If Cloudinary is not configured, return null (handle in routes)
  if (!isCloudinaryConfigured()) {
    console.warn('⚠️  Cloudinary not configured. Image upload skipped. Please configure Cloudinary in .env');
    return null;
  }

  return new Promise((resolve, reject) => {
    try {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: resourceType,
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve(result.secure_url);
          }
        }
      );

      streamifier.createReadStream(buffer).pipe(uploadStream);
    } catch (error) {
      console.error('Cloudinary upload exception:', error);
      reject(error);
    }
  });
};

export default cloudinary;

