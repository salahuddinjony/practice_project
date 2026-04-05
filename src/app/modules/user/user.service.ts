import { User } from './user.interface.js'
import { UserModel } from './user.model.js'
import { UpdateQuery } from 'mongoose'

// Service function to create a user in the database
const createUserIntoDB = async (userData: User) => {
    // Simulating saving the user data to the database
    const result = await UserModel.create(userData)
    return result
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
    return deletedUser // This will return the deleted user document if it was found and deleted, or null if no document with the specified ID was found
}
export const UserService = {
    createUserIntoDB,
    getAllUsersFromDB,
    getUserByIdFromDB,
    updateUserInfoInDB,
    deleteUserFromDB
}