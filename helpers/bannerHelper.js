const Banner = require('../models/bannerModel');

const bannerListHelper = async()=>{
    return new Promise(async (resolve, reject) => {
        await Banner.find().then((response) => {
            resolve(response);
        });
    });
}

const addBannerHelper=async(texts, Image) => {
    return new Promise(async (resolve, reject) => {
        const banner = new Banner({
            title: texts.title,
            link: texts.link,
            image: Image,
        });
        await banner.save().then((response) => {
            resolve(response);
        });
    });
}

const deleteBannerHelper =async(deleteId)=>{
    try {
        return new Promise(async (resolve, reject) => {
            await Banner.deleteOne({ _id: deleteId }).then(() => {
                resolve();
            });
        });
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    bannerListHelper,
    addBannerHelper,
    deleteBannerHelper
}