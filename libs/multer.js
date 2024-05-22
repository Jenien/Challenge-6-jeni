import multer from 'multer';
import path from 'path';

let uploadCount = 0; 

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(process.cwd(), 'public/uploads'));
    },
    filename: function (req, file, cb) {
        const uploadCount = Math.floor(Math.random() * 1000) + 1; 
        const randomString = Math.random().toString(36).substring(7); 
        const fileExtension = path.extname(file.originalname); 
        const newFilename = `gambar_${uploadCount}_${randomString}${fileExtension}`; 
        cb(null, newFilename); 
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/jpg','image/png', 'image/jpeg'];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only .png and .jpeg format allowed!'));
        }
    }
}).single('image');

export { upload };
