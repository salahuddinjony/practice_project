import express from 'express'
import { UserRoute } from '../modules/user/user.route.js'
import { StudentRoute } from '../modules/student/student.route.js'

const router = express.Router()

const moduleRoutes = [
    { path: '/users', route: UserRoute },
    { path: '/students', route: StudentRoute }


]
for (const moduleRoute of moduleRoutes) {
    router.use(moduleRoute.path, moduleRoute.route)
}


export default router