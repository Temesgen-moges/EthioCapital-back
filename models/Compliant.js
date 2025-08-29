import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // title: {
    //     type: String,
    //     required: true
    // },
    description: {
        type: String,
        required: true
    },
    replies: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        message: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    isNew:{
        type: Boolean,
        default: true
    },
    // status: {
    //     type: String,
    //     enum: ['Pending', 'In Progress', 'Resolved'],
    //     default: 'Pending'
    // },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


const Compliant= mongoose.model("Compliant", complaintSchema);

export default Compliant;