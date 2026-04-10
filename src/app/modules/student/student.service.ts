import e from "express"
import { Student } from "./student.interface.js"
import { StudentModel } from "./student.model.js"
import { UserModel } from "../user/user.model.js"
import { AcademicSemesterModel } from "../academicSemester/academicSemester.model.js"
import mongoose from "mongoose"
import { object } from "joi"



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
const updateStudentInfoInDB = async (id: string, updatedData: Partial<Omit<Student, 'id' & 'email' & 'user' & 'isDeleted'>>) => { // here partial means the updatedData can have any subset of the Student properties, making it flexible for updates
    //before updating check its deleted or not if not then update it and also check if the updated admission semester reference is valid or not
    const existingStudent = await StudentModel.findOne({ _id: id, isDeleted: false });
    if (!existingStudent) {
        return null; // No student found with the specified ID or it is already deleted
    }
    // destructure the updatedData to separate the name, guardian, and localGuardian fields from the other fields, allowing us to handle them separately during the update process, especially since they may require special handling due to their nested structure in the database.
    const { name, guardian, localGuardian, ...otherData } = updatedData;

    // This code is responsible for preparing the updated student data for the update operation. It takes the name, guardian, and localGuardian fields from the updatedData and processes them separately to ensure that only the provided fields are updated in the database. The otherData variable contains the remaining fields that can be directly updated without any special handling.
    const updatedStudentData: Record<string, any> = { ...otherData };

    // If the name field is provided in the updatedData, we iterate through its properties (firstName, middleName, lastName) and add them to the updatedStudentData object with the appropriate dot notation (e.g., 'name.firstName') to ensure that only the specified name fields are updated in the database.
    if (name && Object.keys(name).length > 0) {
        for (const [key, value] of Object.entries(name)) {
            if (value) {
                updatedStudentData[`name.${key}`] = value;
            }
        }
    }
    // Similar to the name field, if the guardian field is provided in the updatedData, we iterate through its properties (fatherName, fatherOccupation, etc.) and add them to the updatedStudentData object with the appropriate dot notation (e.g., 'guardian.fatherName') to ensure that only the specified guardian fields are updated in the database.
    if (guardian && Object.keys(guardian).length > 0) {
        for (const [key, value] of Object.entries(guardian)) {
            if (value) {
                updatedStudentData[`guardian.${key}`] = value;
            }
        }
    }
    // Similar to the name and guardian fields, if the localGuardian field is provided in the updatedData, we iterate through its properties (name, occupation, etc.) and add them to the updatedStudentData object with the appropriate dot notation (e.g., 'localGuardian.name') to ensure that only the specified local guardian fields are updated in the database.
    if (localGuardian && Object.keys(localGuardian).length > 0) {
        for (const [key, value] of Object.entries(localGuardian)) {
            if (value) {
                updatedStudentData[`localGuardian.${key}`] = value;
            }
        }
    }
    const updatedStudent = await StudentModel.findByIdAndUpdate(id, updatedStudentData, { returnDocument: 'after' }) // This option ensures that the updated document is returned after the update operation is completed
    return updatedStudent
}

// delete student from database
const deleteStudentFromDB = async (id: string) => {

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const deletedStudent = await StudentModel.findOneAndUpdate(
            { _id: id, isDeleted: false },
            { isDeleted: true },
            {
                returnDocument: 'after',
                session
            }
        );

        if (!deletedStudent) {
            await session.abortTransaction();
            return null;
        }

        await UserModel.findByIdAndUpdate(
            deletedStudent.user,
            { isDeleted: true },
            { session }
        );

        await session.commitTransaction();
        return deletedStudent;

    } catch (error) {
        await session.abortTransaction();
        throw error;

    } finally {
        await session.endSession();
    }
};

// Restore all deleted students from the database if admissionSemester is restored
const restoreDeletedStudentsInDB = async () => {
    // start a session for transaction management to ensure that all operations related to restoring deleted students are executed atomically, meaning that either all operations succeed or none of them are applied, which helps maintain data integrity in case of any errors during the process.
    const session = await mongoose.startSession();

    try {
        // Start the transaction to ensure that all operations related to restoring deleted students are executed atomically, meaning that either all operations succeed or none of them are applied, which helps maintain data integrity in case of any errors during the process.
        session.startTransaction();
        // Fetch all deleted students from the database, along with their related admissionSemester and academicDept (including academicFaculty) data, to check if they can be restored based on the status of their related references.
        const deletedStudents = await StudentModel.find({ isDeleted: true })
            .populate({
                path: 'admissionSemester',
                select: '+isDeleted'
            })
            .populate({
                path: 'academicDept',
                select: '+isDeleted academicFaculty',
                populate: {
                    path: 'academicFaculty',
                    select: '+isDeleted'
                }
            });

        if (deletedStudents.length === 0) {
            await session.abortTransaction();
            return {
                count: 0,
                students: [],
                message: 'There are no deleted students to restore'
            };
        }
        // Filter the deleted students to find those that can be restored based on the status of their related admissionSemester and academicDept (including academicFaculty) references. Only students whose related references are not deleted can be restored.
        const validStudents = deletedStudents.filter(student => {
            const semester = student.admissionSemester as any;
            const dept = student.academicDept as any;

            return (
                semester && !semester.isDeleted &&
                dept && !dept.isDeleted &&
                dept.academicFaculty && !dept.academicFaculty.isDeleted
            );
        });

        if (validStudents.length === 0) {
            await session.abortTransaction();
            return {
                count: 0,
                students: [],
                message: 'No students can be restored due to deleted references'
            };
        }
        // Extract the user IDs and student IDs of the valid students that can be restored, which will be used to update their isDeleted status in the database.
        const validUserIds = validStudents
            .map(s => s.user)
            .filter(Boolean);

        const validStudentIds = validStudents.map(s => s._id);

        if (validUserIds.length > 0) {
            await UserModel.updateMany(
                { _id: { $in: validUserIds } },
                { isDeleted: false },
                { session }
            );
        }
        // Update the isDeleted status of the valid students to false, effectively restoring them in the database, and then fetch the restored student documents to return as part of the response.
        await StudentModel.updateMany(
            { _id: { $in: validStudentIds } },
            { isDeleted: false },
            { session }
        );
        // Fetch the restored student documents to return in the response, including their name, email, and admissionSemester information.
        const result = await StudentModel.find({
            _id: { $in: validStudentIds }
        })
            .select('name email admissionSemester')
            .session(session);

        await session.commitTransaction();

        return {
            count: result.length,
            students: result,
            message: 'Deleted students restored successfully'
        };

    } catch (error) {
        await session.abortTransaction();
        throw error;

    } finally {
        await session.endSession();
    }
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
