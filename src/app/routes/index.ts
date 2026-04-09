import express from 'express'
import { UserRoute } from '../modules/user/user.route.js'
import { StudentRoute } from '../modules/student/student.route.js'
import { AcademicSemesterRoute } from '../modules/academicSemester/academicSemester.route.js'
import { AcademicFacultyRoute } from '../modules/academiFaculty/academicFaculty.route.js'
import { AcademicDeptRoute } from '../modules/academicDept/academicDept.route.js'
const router = express.Router()

const moduleRoutes = [
    { path: '/users', route: UserRoute },
    { path: '/students', route: StudentRoute },
    { path: '/academic-semester', route: AcademicSemesterRoute },
    { path: '/academic-faculty', route: AcademicFacultyRoute },
    { path: '/academic-dept', route: AcademicDeptRoute }


]
for (const moduleRoute of moduleRoutes) {
    router.use(moduleRoute.path, moduleRoute.route)
}


export default router