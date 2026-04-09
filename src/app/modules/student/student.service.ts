import e from "express"
import { Student } from "./student.interface.js"
import { StudentModel } from "./student.model.js"
import { UserModel } from "../user/user.model.js"
import { AcademicSemesterModel } from "../academicSemester/academicSemester.model.js"


// // Service function to create a student in the database
// const createStudentIntoDB = async (studentData: Student) => {
//     // Simulating saving the student data to the database
//     const result = await StudentModel.create(studentData)
//     return result // Simulating a successful database save operation
// }

// Service function to get all students from the database
const getAllStudentsFromDB = async () => {
    // Simulating fetching all students from the database
    const result = await StudentModel.find({ isDeleted: false })
    // const result = await StudentModel.find().populate('user').populate('admissionSemester')
    return {
        count: result.length,
        students: result
    }
}
//   function to get all deleted students from the database
const getAllDeletedStudentsFromDB = async () => {
    // Simulating fetching all deleted students from the database
    const result = await StudentModel.find({ isDeleted: true })
    // const result = await StudentModel.find().populate('user').populate('admissionSemester')
    return {
        count: result.length,
        students: result
    }
}

// Service function to get a student by ID from the database
const getStudentByIdFromDB = async (id: string) => {
    // Simulating fetching a student by ID from the database
    const result = await StudentModel.findById(id, { isDeleted: false })
    return result
}
//use aggregation pipeline to get student by id, this will allow us to perform more complex queries and operations on the data, such as filtering, grouping, and sorting, which can be useful for retrieving specific information about a student based on their ID.
// const getStudentByIdUsingAggregationFromDB = async (id: string) => {
//     const result = await StudentModel.aggregate([
//         { $match: { _id: id } },
//         // Add more stages to the pipeline as needed for additional processing or transformations
//     ])
//     return result[0] // Assuming the aggregation will return an array, we return the first element which should be the student document matching the ID 
// }
//update info 
const updateStudentInfoInDB = async (id: string, updatedData: Partial<Omit<Student, 'id' & 'email'>>) => { // here partial means the updatedData can have any subset of the Student properties, making it flexible for updates
    const updatedStudent = await StudentModel.findByIdAndUpdate(id, updatedData, { returnDocument: 'after' }) // This option ensures that the updated document is returned after the update operation is completed
    return updatedStudent
}

// delete student from database
const deleteStudentFromDB = async (id: string) => {

    // Update only if not already deleted
    const deletedStudent = await StudentModel.findOneAndUpdate(
        { _id: id, isDeleted: false }, // Ensure we only delete if the student is not already marked as deleted
        { isDeleted: true },
        { returnDocument: 'after' }
    );

    // Not found or already deleted
    if (!deletedStudent) {
        return null;
    }

    // Soft delete related user also by setting isDeleted to true
    await UserModel.findByIdAndUpdate(
        deletedStudent.user,
        { isDeleted: true }
    );

    return deletedStudent;
};

// Restore all deleted students from the database if admissionSemester is restored
const restoreDeletedStudentsInDB = async () => {


    // 1. Get unique semester IDs directly (optimized)
    const semesterIds = await StudentModel.distinct('admissionSemester', {
        isDeleted: true
    });

    // No deleted students
    if (semesterIds.length === 0) {
        return {
            count: 0,
            students: [],
            message: 'There are no deleted students to restore'
        };
    }

    // 2. Find only restored semesters
    const restoredSemesters = await AcademicSemesterModel.find({
        _id: { $in: semesterIds },
        isDeleted: false
    }).select('_id'); // Only select the _id field to minimize data transfer

    const validSemesterIds = restoredSemesters.map(s => s._id);
    if (validSemesterIds.length === 0) {
        return {
            count: 0,
            students: [],
            message: 'No deleted students can be restored because their admission semesters are still deleted'
        };
    }

    // 3. Restore students with valid admission semesters
    await StudentModel.updateMany(
        {
            isDeleted: true,
            admissionSemester: { $in: validSemesterIds }
        },
        {
            isDeleted: false
        },

    )
    const result = await StudentModel.find({
        isDeleted: false,
        admissionSemester: { $in: validSemesterIds }
    }).select('name email admissionSemester');


    return {
        count: result.length,
        students: result,
        message: 'Deleted students restored successfully'
    };
};
export const StudentService = {
    // createStudentIntoDB,
    getAllStudentsFromDB,
    getAllDeletedStudentsFromDB,
    getStudentByIdFromDB,
    updateStudentInfoInDB,
    deleteStudentFromDB,
    restoreDeletedStudentsInDB

}
