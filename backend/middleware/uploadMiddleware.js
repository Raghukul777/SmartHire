const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/'); // Save files in 'uploads' folder
    },
    filename(req, file, cb) {
        // Rename file to: fieldname-timestamp.extension (e.g., resume-123456789.pdf)
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

// Check file type (PDF only)
const checkFileType = (file, cb) => {
    const filetypes = /pdf/; // Allowed extensions
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Error: PDFs Only!'));
    }
};

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

module.exports = upload;