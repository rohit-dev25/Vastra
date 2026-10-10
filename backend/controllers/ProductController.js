import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";

//function to add product
const addProduct = async (req, resp) => {
  try {
    const {
      name,
      description,
      price,
      category,
      subCategory,
      sizes,
      bestseller,
    } = req.body;


    const image1 = req.files.image1 && req.files.image1[0];
    const image2 = req.files.image2 && req.files.image2[0];
    const image3 = req.files.image3 && req.files.image3[0];
    const image4 = req.files.image4 && req.files.image4[0];


    const images = [image1, image2, image3, image4].filter(
      (item) => item !== undefined,
    );

    let imagesUrl = await Promise.all(
      images.map(async (item) => {
        let result = await cloudinary.uploader.upload(item.path, {
          resource_type: "image",
        });
        return result.secure_url;
      }),
    );
    console.log(imagesUrl);
    
    
    const productData = {
      name,
      description,
      price: Number(price),
      category,
      subCategory,
      bestseller: bestseller === "true" ? true : false,
      sizes: JSON.parse(sizes),
      image: imagesUrl,
      date: Date.now(),
    };
    const product = new productModel(productData);
    await product.save();

    resp.json({ success: true, message: "Product Added" });

    console.log(
      name,
      description,
      price,
      category,
      subCategory,
      sizes,
      bestseller,
    );
  } catch (error) {
    console.log(error);
    resp.json({ success: false, message: error.message });
  }
};

//list product
const listProducts = async (req, resp) => {
  try {
    const products=await productModel.find({})
    resp.json({success:true,products})
  } catch (error) {
    console.log(error);
    resp.json({success:false,message:error.message})
    
  }
};

//function remove product
const removeProduct = async (req, resp) => {
  try {
    await productModel.findByIdAndDelete(req.body.id)
        resp.json({success:true,message:"Product Removed"})

  } catch (error) {
    console.log(error);
     resp.json({success:false,message:error.message})
  }
};

//finction for single product
const singleProduct = async (req, resp) => {
  try {
    const { productId } = req.body;
    const product = await productModel.findById(productId);
    resp.json({ success: true, product })
  } catch (error) {
    console.log(error);
    resp.json({ success: false, message: error.message })
  }
};

export { listProducts, addProduct, removeProduct, singleProduct };
