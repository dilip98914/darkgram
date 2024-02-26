const cloudinary = require('cloudinary');

cloudinary.config({
    cloud_name: 'dys1c8h9r',
    api_key: "625229547177958",
    api_secret: "a-yny_wXusSNLEKfBcIa8xpbe28"
    
});

module.exports = async function (image, config) {
    try {
        return await cloudinary.uploader.upload(image, config)
    } catch (err) {
        console.error(err)
        return err;
    }
}