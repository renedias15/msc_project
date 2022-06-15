const mongoose=require('mongoose')

const Schema = mongoose.Schema

const orderSchema = new Schema({
   customerId:{
                type:String
            },
    items:{
            type: Object
        },
    date:{type : Date, default: Date.now}
})

module.exports = mongoose.model('order', orderSchema)