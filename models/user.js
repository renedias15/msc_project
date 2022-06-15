const mongoose=require('mongoose')

const userSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    password2: { type: String, required: true },
    address: { type: String, required: true },
    pincode: { type: Number, required: true },
    phoneNo:{type: Number,required:true },
    landmark:{type: String,required:true }

})

module.exports = mongoose.model('user',userSchema)// basically automatically becomes the name of the collection in the db 