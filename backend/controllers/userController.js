import bcrypt from 'bcrypt'
import validator from "validator"
import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js'

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET_KEY)
}

//route for user login
const loginUser = async (req, resp) => {
  try {
    const {email,password}=req.body

    const user=await userModel.findOne({email})
    if(!user){
        return resp.json({ success: false, message: "User does not exists" })
    }
    const isMatch=await bcrypt.compare(password,user.password)

    if(isMatch){
        const token=createToken(user._id)
        resp.json({success:true,token})
    }
    else{
        return resp.json({ success: false, message: "Invalid Credentials" })
    }
  } catch (error) {
   return resp.json({ success: false, message: error.message }) 
  }
}

//route for user register
const registerUser = async (req, resp) => {

    try {
        const { name, email, password } = req.body;

        //checking user already exists
        const exists = await userModel.findOne({ email })
        if (exists) {
            return resp.json({ success: false, message: "User already exists" })
        }
        //validating email & password format
        if (!validator.isEmail(email)) {
            return resp.json({ success: false, message: "Please Enter valid email" })
        }
        if (password.length < 8) {
            return resp.json({ success: false, message: "Please Enter strong Password" })
        }
        //hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new userModel({
            name, 
            email,
            password: hashedPassword
        })

        const user = await newUser.save()

        const token = createToken(user._id)
        resp.json({ success: true, token })

    } catch (error) {
        console.log(error)
        resp.json({ success: false, message: error.message })
    }

}

//route for admin login
const adminLogin = async (req, resp) => {
    try {
        const { email, password } = req.body;

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign({ email }, process.env.JWT_SECRET_KEY)
            console.log(token);
            
            resp.json({ success: true, token })
        } else {
            resp.json({ success: false, message: "Invalid Credentials" })
        }

    } catch (error) {
        console.log(error);
        resp.json({ success: false, message: error.message })
    }
}

export { loginUser, registerUser, adminLogin }