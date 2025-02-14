import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure necessary directories exist
const ensureDirExists = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

ensureDirExists("uploads/images");
ensureDirExists("uploads/documents");

// Storage configuration for images
const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/images/");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

// Storage configuration for documents
const documentStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/documents/");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

// File filters for images and documents
const imageFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowedTypes.test(file.mimetype);
    if (extName && mimeType) {
        cb(null, true);
    } else {
        cb(new Error("Only images (jpeg, jpg, png) are allowed!"));
    }
};

const documentFilter = (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowedTypes.test(file.mimetype);
    if (extName && mimeType) {
        cb(null, true);
    } else {
        cb(new Error("Only documents (pdf, doc, docx) are allowed!"));
    }
};

// Multer upload handlers
export const uploadImage = multer({ storage: imageStorage, fileFilter: imageFilter });
export const uploadDocument = multer({ storage: documentStorage, fileFilter: documentFilter });
// Multi-upload handler for both images and documents
export const uploadFiles = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            if (file.mimetype.startsWith("image/")) {
                cb(null, "uploads/images/");
            } else {
                cb(null, "uploads/documents/");
            }
        },
        filename: (req, file, cb) => {
            cb(null, `${Date.now()}-${file.originalname}`);
        },
    }),
});
