import Course from "../models/Course.js"
import CourseProgress from "../models/CourseProgress.js"
import Purchase from "../models/Purchase.js"
import User from "../models/User.js"
import stripe from "stripe"



// Get User Data
export const getUserData = async (req, res) => {
    try {
        const userId = req.auth.userId
        const user = await User.findByPk(userId)

        if (!user) {
            return res.json({ success: false, message: 'User Not Found' })
        }

        res.json({ success: true, user })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Purchase Course 
export const purchaseCourse = async (req, res) => {
    try {
        const { courseId } = req.body
        const { origin } = req.headers
        const userId = req.auth.userId

        const courseData = await Course.findByPk(courseId)
        const userData = await User.findByPk(userId)

        if (!userData || !courseData) {
            return res.json({ success: false, message: 'Data Not Found' })
        }

        const purchaseData = {
            courseId: courseData.id,
            userId,
            amount: (courseData.coursePrice - courseData.discount * courseData.coursePrice / 100).toFixed(2),
        }

        const newPurchase = await Purchase.create(purchaseData)

        // Stripe Gateway Initialize
        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)
        const currency = process.env.CURRENCY.toLocaleLowerCase()

        // Creating line items to for Stripe
        const line_items = [{
            price_data: {
                currency,
                product_data: {
                    name: courseData.courseTitle
                },
                unit_amount: Math.floor(newPurchase.amount) * 100
            },
            quantity: 1
        }]

        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-enrollments`,
            cancel_url: `${origin}/`,
            line_items: line_items,
            mode: 'payment',
            metadata: {
                purchaseId: newPurchase.id
            }
        })

        res.json({ success: true, session_url: session.url })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Users Enrolled Courses With Lecture Links
export const userEnrolledCourses = async (req, res) => {
    try {
        const userId = req.auth.userId
        const userData = await User.findByPk(userId, {
            include: [{
                model: Course,
                as: 'enrolledCourses'
            }]
        })

        res.json({ success: true, enrolledCourses: userData.enrolledCourses })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Update User Course Progress
export const updateUserCourseProgress = async (req, res) => {
    try {
        const userId = req.auth.userId
        const { courseId, lectureId } = req.body

        const progressData = await CourseProgress.findOne({ 
            where: { userId, courseId }
        })

        if (progressData) {
            const lectureCompleted = progressData.lectureCompleted || []
            if (lectureCompleted.includes(lectureId)) {
                return res.json({ success: true, message: 'Lecture Already Completed' })
            }

            lectureCompleted.push(lectureId)
            await progressData.update({ lectureCompleted })
        } else {
            await CourseProgress.create({
                userId,
                courseId,
                lectureCompleted: [lectureId]
            })
        }

        res.json({ success: true, message: 'Progress Updated' })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// get User Course Progress
export const getUserCourseProgress = async (req, res) => {
    try {
        const userId = req.auth.userId
        const { courseId } = req.body

        const progressData = await CourseProgress.findOne({ 
            where: { userId, courseId }
        })

        res.json({ success: true, progressData })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Add User Ratings to Course
export const addUserRating = async (req, res) => {
    const userId = req.auth.userId;
    const { courseId, rating } = req.body;

    // Validate inputs
    if (!courseId || !userId || !rating || rating < 1 || rating > 5) {
        return res.json({ success: false, message: 'InValid Details' });
    }

    try {
        // Find the course by ID
        const course = await Course.findByPk(courseId);

        if (!course) {
            return res.json({ success: false, message: 'Course not found.' });
        }

        // Check if user has purchased the course
        const purchase = await Purchase.findOne({
            where: {
                userId,
                courseId,
                status: 'completed'
            }
        });

        if (!purchase) {
            return res.json({ success: false, message: 'User has not purchased this course.' });
        }

        // Check if user already rated
        const courseRatings = course.courseRatings || [];
        const existingRatingIndex = courseRatings.findIndex(r => r.userId === userId);

        if (existingRatingIndex > -1) {
            // Update the existing rating
            courseRatings[existingRatingIndex].rating = rating;
        } else {
            // Add a new rating
            courseRatings.push({ userId, rating });
        }

        await course.update({ courseRatings });
        res.json({ success: true, message: 'Rating added successfully' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}