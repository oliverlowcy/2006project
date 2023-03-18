const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name : process.env.cloudinarycloudname,
    api_key : process.env.cloudinaryapi,
    api_secret : process.env.cloudinarysecret
})

const storage = new CloudinaryStorage({
    cloudinary,
    params:{
        folder: "Eatstagram",
        allowedFormats: ['jpeg','png','jpg']
    }
    
})

module.exports = {cloudinary,storage}