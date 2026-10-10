import multer from "multer";

const storage = multer.diskStorage({
    filename: function (req, file, callback) {
        callback(null, file.originalname)
    }
})
//This creates a middleware using your storage config
//
const upload = multer({ storage })

export default upload;