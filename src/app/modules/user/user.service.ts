import { object } from 'joi'
import config from '../../config/index.js'
import { Student } from '../student/student.interface.js'
import { StudentModel } from '../student/student.model.js'
import { User } from './user.interface.js'
import { AcademicSemesterModel } from '../academicSemester/academicSemester.model.js'
import { UserModel } from './user.model.js'
import { UpdateQuery } from 'mongoose'
import { AcademicSemester } from '../academicSemester/academicSemester.interface.js'
import { get } from 'http'
import AppError from '../../errors/AppError.js'
import { UserUtils } from './user.utils.js'

// Service function to create a user in the database
const createStudentIntoDB = async (password: string, StudentData: Student, next: Function) => {
    // Simulating saving the user data to the database
    const userData: Partial<User> = {}
    userData.password = password ?? config.DEFAULT_USER_PASSWORD
    userData.role = 'student'
    try {
        userData.id = await UserUtils.generatedIStudentd(StudentData.admissionSemester.toString())
    } catch (error) {
        next(new AppError('Failed to generate student ID', 500))
        return
    }


    // Create a new user document in the database with the provided password and role
    const createNewUser = await UserModel.create(userData) // Create a new user document in the database with the provided password and role

    // After creating the user, we can proceed to create the student document and associate it with the created user
    if (Object.keys(createNewUser.toObject()).length) { // Check if the created user object has any keys, which indicates that the user was successfully created

        StudentData.id = createNewUser.id // Assuming the student's ID is the same as the user's ID, we set the student's ID to the created user's ID
        StudentData.user = createNewUser._id // We also set the userId field in the student data to the ObjectId of the created user document, establishing a reference between the student and the user;
        const createNewStudent = await StudentModel.create(StudentData) // Create a new student document in the database with the provided student data
        return createNewStudent // Return the created student document
    }

}
// Service function to get all users from the database
const getAllUsersFromDB = async () => {
    // Simulating fetching all users from the database
    const result = await UserModel.find()
    return result
}
// Service function to get a user by ID from the database
const getUserByIdFromDB = async (id: string) => {
    // Simulating fetching a user by ID from the database
    const result = await UserModel.findById(id)
    return result
}
// Service function to update user info in the database
const updateUserInfoInDB = async (id: string, updatedData: UpdateQuery<User>) => {
    const updatedUser = await UserModel.findByIdAndUpdate(id, updatedData, {
        returnDocument: 'after',
        runValidators: true,
    }) // This option ensures that the updated document is returned after the update operation is completed
    return updatedUser
}

// delete user from database
const deleteUserFromDB = async (id: string) => {
    const deletedUser = await UserModel.findByIdAndUpdate(id, { isDeleted: true }, { returnDocument: 'after' })
    if (deletedUser) {
        await StudentModel.findOneAndUpdate({ user: deletedUser._id }, { isDeleted: true }) // This will find the student document associated with the deleted user and mark it as deleted by setting the isDeleted field to true, ensuring that both the user and the associated student record are marked as deleted in the database.
    } 
    return deletedUser // This will return the deleted user document if it was found and deleted, or null if no document with the specified ID was found
}
export const UserService = {
    createStudentIntoDB,
    getAllUsersFromDB,
    getUserByIdFromDB,
    updateUserInfoInDB,
    deleteUserFromDB
}