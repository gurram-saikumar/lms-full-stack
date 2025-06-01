import { v2 as cloudinary } from 'cloudinary'
import Course from '../models/Course.js';
import Purchase from '../models/Purchase.js';
import User from '../models/User.js';
import { clerkClient } from '@clerk/express'

// update role to educator
export const updateRoleToEducator = async (req, res) => {

    try {

        const userId = req.auth.userId

        await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata: {
                role: 'educator',
            },
        })

        res.json({ success: true, message: 'You can publish a course now' })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }

}

// Add New Course
export const addCourse = async (req, res) => {

    try {

        const { courseData } = req.body

        const imageFile = req.file

        const educatorId = req.auth.userId

        if (!imageFile) {
            return res.json({ success: false, message: 'Thumbnail Not Attached' })
        }

        const parsedCourseData = await JSON.parse(courseData)

        parsedCourseData.educatorId = educatorId

        const newCourse = await Course.create(parsedCourseData)

        const imageUpload = await cloudinary.uploader.upload(imageFile.path)

        await newCourse.update({ courseThumbnail: imageUpload.secure_url })

        res.json({ success: true, message: 'Course Added' })

    } catch (error) {

        res.json({ success: false, message: error.message })

    }
}

// Get Educator Courses
export const getEducatorCourses = async (req, res) => {
    try {

        const educator = req.auth.userId

        const courses = await Course.findAll({ 
            where: { educatorId: educator }
        })

        res.json({ success: true, courses })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Get Educator Dashboard Data ( Total Earning, Enrolled Students, No. of Courses)
export const educatorDashboardData = async (req, res) => {
    try {
        const educator = req.auth.userId;

        const courses = await Course.findAll({ 
            where: { educatorId: educator }
        });

        const totalCourses = courses.length;

        const courseIds = courses.map(course => course.id);

        // Calculate total earnings from purchases
        const purchases = await Purchase.findAll({
            where: {
                courseId: courseIds,
                status: 'completed'
            }
        });

        const totalEarnings = purchases.reduce((sum, purchase) => sum + Number(purchase.amount), 0);

        // Collect unique enrolled student IDs with their course titles
        const enrolledStudentsData = [];
        for (const course of courses) {
            const students = await course.getEnrolledStudents({
                attributes: ['name', 'imageUrl']
            });

            students.forEach(student => {
                enrolledStudentsData.push({
                    courseTitle: course.courseTitle,
                    student
                });
            });
        }

        res.json({
            success: true,
            dashboardData: {
                totalEarnings,
                enrolledStudentsData,
                totalCourses
            }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get Enrolled Students Data with Purchase Data
export const getEnrolledStudentsData = async (req, res) => {
    try {
        const educator = req.auth.userId;

        // Fetch all courses created by the educator
        const courses = await Course.findAll({ 
            where: { educatorId: educator }
        });

        // Get the list of course IDs
        const courseIds = courses.map(course => course.id);

        // Fetch purchases with user and course data
        const purchases = await Purchase.findAll({
            where: {
                courseId: courseIds,
                status: 'completed'
            },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['name', 'imageUrl']
                },
                {
                    model: Course,
                    as: 'course',
                    attributes: ['courseTitle']
                }
            ]
        });

        // enrolled students data
        const enrolledStudents = purchases.map(purchase => ({
            student: purchase.user,
            courseTitle: purchase.course.courseTitle,
            purchaseDate: purchase.createdAt
        }));

        res.json({
            success: true,
            enrolledStudents
        });

    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
};
