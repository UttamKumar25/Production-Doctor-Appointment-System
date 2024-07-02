
//2 new routes

const express=require('express')
//router objecta
const router=express.Router()

const { loginController, registerController, authController , applyDoctorController,getAllNotificationController, deleteAllNotificationController, getAllDoctorsController, bookAppointmentController, bookingAvailbilityController, userAppointmentsController} = require('../controllers/userCtrl')
const authMiddleware = require('../middlewares/authMiddleware')


//1st login ka  || method=POST
router.post('/login',loginController)

//2nd register ke liye
router.post('/register', registerController)


//auth ||post
router.post('/getUserData', authMiddleware, authController)
//apply doctor ||post
router.post('/apply-doctor', authMiddleware, applyDoctorController)

//notification doctor ||post
router.post('/get-all-notification', authMiddleware, getAllNotificationController)

//notification doctor ||post
router.post('/delete-all-notification', authMiddleware, deleteAllNotificationController)

//GET ALL DOCTORS
router.get('/getAllDoctors', authMiddleware, getAllDoctorsController)

//BOOK APPOINTMENT
router.post('/book-appointment', authMiddleware, bookAppointmentController)

//BOOking availability
router.post('/booking-availbility',authMiddleware, bookingAvailbilityController)


//appointment list
router.get('/user-appointments',authMiddleware,userAppointmentsController)

//export it

module.exports=router;