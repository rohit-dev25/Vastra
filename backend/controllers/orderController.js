import orderModel from '../models/orderModel.js'
import userModel from '../models/userModel.js'
import Stripe from 'stripe'
import razorpay from 'razorpay'


const currency = 'usd'
const delivery_fee = 10

//gateway initialization
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_SECRET_KEY,
})


//placing order using COD method
const placeOrder = async (req, resp) => {
    try {
        const { userId, items, amount, address } = req.body

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: 'COD',
            payment: false,
            date: Date.now()
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        await userModel.findByIdAndUpdate(userId, { cartData: {} })

        resp.json({ success: true, message: "Order Placed" })

    } catch (error) {
        console.log(error)
        resp.json({ success: false, message: error.message })
    }
}

//placing order using stripe
const placeOrderStripe = async (req, resp) => {
    try {
        const { userId, items, amount, address } = req.body
        const { origin } = req.headers

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: 'Stripe',
            payment: false,
            date: Date.now()
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        const line_items = items.map((item) => ({
            price_data: {
                currency: currency,
                product_data: {
                    name: item.name
                },
                unit_amount: Math.round(item.price * 100)
            },
            quantity: item.quantity
        }))

        line_items.push({
            price_data: {
                currency: currency,
                product_data: {
                    name: 'Delivery Charges'
                },
                unit_amount: Math.round(delivery_fee * 100)
            },
            quantity: 1
        })

        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode: 'payment'
        })

        resp.json({ success: true, session_url: session.url })

    } catch (error) {
        console.log(error)
        resp.json({ success: false, message: error.message })
    }
}

//verify stripe payment, called by the frontend /verify page after redirect
const verifyStripe = async (req, resp) => {
    const { orderId, success, userId } = req.body

    try {
        if (success === "true") {
            await orderModel.findByIdAndUpdate(orderId, { payment: true })
            await userModel.findByIdAndUpdate(userId, { cartData: {} })
            resp.json({ success: true })
        } else {
            await orderModel.findByIdAndDelete(orderId)
            resp.json({ success: false })
        }
    } catch (error) {
        console.log(error)
        resp.json({ success: false, message: error.message })
    }
}

//placing order using razorpay
const placeOrderRazorpay = async (req, resp) => {
    try {
        const { userId, items, amount, address } = req.body

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: 'Razorpay',
            payment: false,
            date: Date.now()
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        const options = {
            amount: Math.round(amount * 100),
            currency: process.env.CURRENCY || 'USD',
            receipt: newOrder._id.toString()
        }

        razorpayInstance.orders.create(options, (error, order) => {
            if (error) {
                console.log(error)
                return resp.json({ success: false, message: error.message })
            }
            resp.json({ success: true, order })
        })

    } catch (error) {
        console.log(error)
        resp.json({ success: false, message: error.message })
    }
}

//verify razorpay payment, called by the frontend after checkout completes
const verifyRazorpay = async (req, resp) => {
    try {
        const { userId, razorpay_order_id } = req.body

        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)

        if (orderInfo.status === 'paid') {
            await orderModel.findByIdAndUpdate(orderInfo.receipt, { payment: true })
            await userModel.findByIdAndUpdate(userId, { cartData: {} })
            resp.json({ success: true, message: "Payment Successful" })
        } else {
            resp.json({ success: false, message: "Payment Failed" })
        }

    } catch (error) {
        console.log(error)
        resp.json({ success: false, message: error.message })
    }
}

//all data for admin panel
const allOrders = async (req, resp) => {
    try {
        const orders = await orderModel.find({})
        resp.json({ success: true, orders })
    } catch (error) {
        console.log(error)
        resp.json({ success: false, message: error.message })
    }
}
//user order data for frontend
const userOrders = async (req, resp) => {
    try {
        const { userId } = req.body
        const orders = await orderModel.find({ userId })
        resp.json({ success: true, orders })
    } catch (error) {
        console.log(error)
        resp.json({ success: false, message: error.message })
    }
}

//update order status from admin panel
const updateStatus = async (req, resp) => {
    try {
        const { orderId, status } = req.body
        await orderModel.findByIdAndUpdate(orderId, { status })
        resp.json({ success: true, message: "Status Updated" })
    } catch (error) {
        console.log(error)
        resp.json({ success: false, message: error.message })
    }
}
export { placeOrder, placeOrderRazorpay, placeOrderStripe, allOrders, userOrders, updateStatus, verifyStripe, verifyRazorpay }