import Course from "../models/Course.js"
import User from "../models/User.js"


// Get All Courses
export const getAllCourse = async (req, res) => {
    try {
        const courses = await Course.findAll({
            where: { isPublished: true },
            attributes: { exclude: ['courseContent', 'enrolledStudents'] },
            include: [{
                model: User,
                as: 'educator',
                attributes: { exclude: ['password'] }
            }]
        });

        res.json({ success: true, courses });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Get Course by Id
export const getCourseId = async (req, res) => {
    const { id } = req.params;

    try {
        const courseData = await Course.findByPk(id, {
            include: [{
                model: User,
                as: 'educator'
            }]
        });

        if (!courseData) {
            return res.json({ success: false, message: 'Course not found' });
        }

        // Remove lectureUrl if isPreviewFree is false
        courseData.courseContent.forEach(chapter => {
            chapter.chapterContent.forEach(lecture => {
                if (!lecture.isPreviewFree) {
                    lecture.lectureUrl = "";
                }
            });
        });

        res.json({ success: true, courseData });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
} 