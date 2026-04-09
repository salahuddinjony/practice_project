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
    const result = await StudentModel.find({
        isDeleted: false
    })
        .populate('user')
        .populate('admissionSemester')
        .populate({
            path: 'academicDept',
            populate: {
                path: 'academicFaculty',
            }
        })

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
    const result = await StudentModel.findById(id, { isDeleted: false }).populate('user')
        .populate('admissionSemester')
        .populate({
            path: 'academicDept',
            populate: {
                path: 'academicFaculty',
            }
        })
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
    //before updating check its deleted or not if not then update it and also check if the updated admission semester reference is valid or not
    const existingStudent = await StudentModel.findOne({ _id: id, isDeleted: false });
    if (!existingStudent) {
        return null; // No student found with the specified ID or it is already deleted
    }
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

    // 1. Get all deleted students with required references
    const deletedStudents = await StudentModel.find({ isDeleted: true })
        .populate({ path: 'user', select: 'isDeleted' })
        .populate({ path: 'admissionSemester', select: 'isDeleted' })
        .populate({
            path: 'academicDept',
            select: 'isDeleted academicFaculty', // We need to check if the department is deleted and also get the academic faculty reference to check if it is deleted or not
            populate: {
                path: 'academicFaculty',
                select: 'isDeleted'
            }
        });

    if (deletedStudents.length === 0) {
        return {
            count: 0,
            students: [],
            message: 'There are no deleted students to restore'
        };
    }

    // 2. Filter valid students (whose all references are NOT deleted)
    const validStudents = deletedStudents.filter(student => {
        const user = student.user as any;
        const semester = student.admissionSemester as any;
        const dept = student.academicDept as any;

        return (
            user && !user.isDeleted &&
            semester && !semester.isDeleted &&
            dept && !dept.isDeleted &&
            dept.academicFaculty && !dept.academicFaculty.isDeleted
        );
    });

    // 3. If no valid students
    if (validStudents.length === 0) {
        return {
            count: 0,
            students: [],
            message:
                'No students can be restored because their associated user, semester, department, or faculty is still deleted'
        };
    }

    // 4. Extract valid student IDs
    const validStudentIds = validStudents.map(s => s._id);

    // 5. Restore only valid students
    await StudentModel.updateMany(
        { _id: { $in: validStudentIds } },
        { isDeleted: false }
    );

    // 6. Return restored students
    const result = await StudentModel.find({
        _id: { $in: validStudentIds }
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
