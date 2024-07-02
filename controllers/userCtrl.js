const userModel = require('../models/userModels');
const bcrypt = require('bcryptjs'); // password hashing
const jwt = require('jsonwebtoken');
const doctorModel = require('../models/doctorModel');
const appointmentModel=require('../models/appointmentModel')
const moment =require('moment')
// Register callback
const registerController = async (req, res) => {
    try {
        const existingUser = await userModel.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(200).send({ message: 'User already exists', success: false });
        }
        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        req.body.password = hashedPassword;
        const newUser = new userModel(req.body);
        await newUser.save();
        res.status(201).send({ message: "Registered successfully", success: true });
    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, message: `Register controller ${error.message}` });
    }
};

// Login callback
const loginController = async (req, res) => {
    try {
        const user = await userModel.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).send({ message: 'User not found', success: false });
        }
        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
            return res.status(401).send({ message: 'Invalid email or password', success: false });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(200).send({ message: 'Login Success', success: true, token });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: `Error in login controller ${error.message}` });
    }
};

// Auth callback
const authController = async (req, res) => {
    try {
        const user = await userModel.findById({ _id: req.body.userId });
        user.password = undefined;
        if (!user) {
            return res.status(404).send({ message: 'User not found', success: false });
        } else {
            res.status(200).send({ success: true, data: user });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Auth error', success: false, error });
    }
};

// Apply doctor callback
const applyDoctorController = async (req, res) => {
    try {
        const newDoctor = new doctorModel({ ...req.body, status: 'pending' });
        await newDoctor.save();
        const adminUser = await userModel.findOne({ isAdmin: true });
        const notification = adminUser.notification;
        notification.push({
            type: 'apply-doctor-request',
            message: `${newDoctor.firstName} ${newDoctor.lastName} has applied for a doctor account`,
            data: {
                doctorId: newDoctor._id,
                name: `${newDoctor.firstName} ${newDoctor.lastName}`,
                onClickPath: '/admin/doctors'
            }
        });
        await userModel.findByIdAndUpdate(adminUser._id, { notification });
        res.status(201).send({ success: true, message: 'Doctor account applied successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, error, message: 'Error while applying for doctor' });
    }
};

// Notification callback
const getAllNotificationController = async (req, res) => {
    try {
        const user = await userModel.findById(req.body.userId);
        const seennotification = user.seennotification;
        const notification = user.notification;
        seennotification.push(...notification);
        user.notification = [];
        user.seennotification = seennotification;
        const updatedUser = await user.save();
        res.status(200).send({ success: true, message: 'All notifications marked as read', data: updatedUser });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Error in notification', success: false, error });
    }
};
//delete notification
const deleteAllNotificationController=async(req, res)=>{
    try {
        const user=await userModel.findOne({_id:req.body.userId})
        user.notification = [];
        user.seennotification =[];
        const updatedUser = await user.save();
        updatedUser.password=undefined
        res.status(200).send({ success: true, message: 'Notifications deleted succesfully', data: updatedUser });
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            message:'unable to delete all notification',
            error
        })
        
    }
}

//GET ALL DOCTOR
const getAllDoctorsController=async(req,res)=>{
    try {
        const doctors=await doctorModel.find({status:'approved'})
        res.status(200).send({ 
            success: true,
            message:"Doctors list fetched succesfully",
            data:doctors,
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            error,
            message:'Error while fetching doctors',
            
        })
    }
}

//BOOK APPOITMENT
const bookAppointmentController=async(req,res)=>{
    try {
        req.body.date=moment(req.body.date,'DD-MM-YYYY').toISOString()
        req.body.time=moment(req.body.time, 'HH:mm').toISOString();
        req.body.status="pending"
        const newAppointment=new appointmentModel(req.body)
        await newAppointment.save()
        const user=await userModel.findOne({_id:req.body.doctorInfo.userId})
        user.notification.push({
            type:'New-appointment-request',
            message:`A new Appointment Request from ${req.body.userInfo.name}`,
            onClickPath:'/user/appointments'
        })
        await user.save()
        res.status(200).send({ 
            success: true,
            message:"Appointment Booked succesfully",

        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            error,
            message:'Error while Booking Appointment',
            
        })
    }
}
// bookingAvailbilityController 
const bookingAvailbilityController=async(req,res)=>{
    try {
        const date=moment(req.body.date, 'DD-MM-YYYY').toISOString()
        const fromTime=moment(req.body.time, 'HH:mm').subtract(1,'hours').toISOString()
        const toTime=moment(req.body.time, 'HH:mm').add(1,'hours').toISOString()
        const doctorId=req.body.doctorId
        const appointments=await appointmentModel.find({doctorId,
            date,
            time:{
                $gte:fromTime,
                $lte:toTime,
            },
        });
        if(appointments.length>0){
            return res.status(200).send({
                message: "Appointments not available at this time",
                success: true,
            });
        }else{
            return res.status(200).send({
                success: true,
                message: "Appointments available",
                
            });
        }


    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            error,
            message:'Error in Booking ',
            
        })
    }
}
const userAppointmentsController=async(req,res)=>{
    try {
        const appointments=await appointmentModel.find({userId:req.body.userId})
        res.status(200).send({
            success: true,
            message: "Users Appointments fetch Successfully",
            data:appointments
        });

    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            error,
            message:'Error in user appointments',
            
        })
    }
}
module.exports = { loginController, registerController, authController, applyDoctorController, getAllNotificationController, deleteAllNotificationController,getAllDoctorsController, bookAppointmentController,bookingAvailbilityController, userAppointmentsController };
