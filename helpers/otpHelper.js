const otpGenerator = require('otp-generator');
require('dotenv').config();
const client = require('twilio')(process.env.TWILIO_SID,process.env.TWILIO_AUTH_TOKEN);

const generateOtp = ()=>{
    return otpGenerator.generate(6,{
        upperCase:false,
        specialChars:false,
        upperCaseAlphabets:false,
        lowerCaseAlphabets:false
    });
};

const sendOtp = async (mobileNumber,otp)=>{
    try {
        await client.messages.create({
            body:`Your otp for Stepping Stones sign up is ${otp}`,
            from:'+13253264559',
            to:`+91${mobileNumber}`
        })
    } catch (error) {
        console.log(error.message);
        throw new Error("Failed to send OTP");
    }
}

module.exports = {
    generateOtp,
    sendOtp
}
