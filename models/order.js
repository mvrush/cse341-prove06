/*************** This is our Order Model (it stores data in our 'orders' collection) *****************/

const mongoose = require('mongoose'); // brings in mongoose for our usage.

const Schema = mongoose.Schema; // loads the Schema functionality from mongoose.

// next we define our 'order' schema. For products we have an array of documents consisting of 'product' and 'quantity'.
// for 'user' we have a 'name' and 'userId'.
const orderSchema = new Schema({
    products: [
        {
            product: { type: Object, required: true },
            quantity: { type: Number, required: true }
        }
    ],
    user: {
        email: {
            type: String,
            required: true
        },
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User' // refers to the 'User' model.
        }
    }
});

module.exports = mongoose.model('Order', orderSchema);