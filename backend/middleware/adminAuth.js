import jwt from 'jsonwebtoken'

const adminAuth = async (req, resp, next) => {
    try {
        const { token } = req.headers;

        if (!token) {
            return resp.json({ success: false, message: "Not Authorized, login again" })
        }

        const decode = jwt.verify(token, process.env.JWT_SECRET_KEY)
        console.log(decode);
        

        if (decode.email !== process.env.ADMIN_EMAIL) {
            return resp.json({ success: false, message: "Not Authorized, login again" })
        }

        next();

    } catch (error) {
        console.log(error)
        resp.json({ success: false, message: error.message })
    }
}

export default adminAuth