const express=require('express')
const authMiddleware=require('../middlewares/authMiddleware')
const { getDoctorInfoController, updateProfileController, getDoctorByIdController,doctorAppointmentsController, updateStatusController} = require('../controllers/doctorCtrl')
const router=express.Router()

//POST SINGLE DOCTOR INFO
router.post('/getDoctorInfo', authMiddleware, getDoctorInfoController)

//POST UPDATE PROFILE
router.post('/updateProfile', authMiddleware, updateProfileController)

//POST get sINGLE DOCTOR INFO
router.post('/getDoctorById', authMiddleware, getDoctorByIdController)

//GET APPOINTMENTS
router.get('/doctor-appointments', authMiddleware, doctorAppointmentsController)

//POST UPDATE STAUS
router.post('/update-status', authMiddleware, updateStatusController)

module.exports=router