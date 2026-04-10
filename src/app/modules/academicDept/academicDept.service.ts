
import AppError from '../../errors/AppError.js';
import { StudentModel } from '../student/student.model.js';
import { AcademicDept } from './academicDept.interface.js';
import AcademicDeptModel from './academicDept.model.js';
import mongoose from 'mongoose';


// Service function to create a new academic department
const createAcademicDeptIntoDB = async (academicDeptData: AcademicDept) => {
    const academicDept = await AcademicDeptModel.create(academicDeptData);
    return academicDept;
}

// Service function to get all academic departments
const getAllAcademicDeptsFromDB = async () => {
    const academicDepts = await AcademicDeptModel.find({ isDeleted: false }).populate('academicFaculty');
    return academicDepts;
}

// get single department by id
const getAcademicDeptByIdFromDB = async (id: string) => {
    const academicDept = await AcademicDeptModel.findById(id).populate('academicFaculty');
    return academicDept;
}

// update department info
const updateAcademicDeptInfoInDB = async (id: string, updatedData: Partial<Omit<AcademicDept, 'id'>>) => {
    //before updating check its deleted or not if not then update it and also check if the updated academic faculty reference is valid or not and also check if the name is unique within the same faculty
    const existingDept = await AcademicDeptModel.findOne({ _id: id, isDeleted: false });
    if (!existingDept) {
        return null; // No department found with the specified ID or it is already deleted
    }
    const updatedAcademicDept = await AcademicDeptModel.findByIdAndUpdate(id, updatedData, { returnDocument: 'after' }).populate('academicFaculty');
    return updatedAcademicDept;
}
//get all deleted departments from database
const getAllDeletedAcademicDeptsFromDB = async () => {
    const academicDepts = await AcademicDeptModel.find({ isDeleted: true }).populate('academicFaculty');
    if (academicDepts.length === 0) {
        return null; // No deleted departments found
    }
    return {
        count: academicDepts.length,
        academicDepts: academicDepts
    };
}

// delete department from database
const deleteAcademicDeptFromDB = async (id: string) => {

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const deletedAcademicDept = await AcademicDeptModel.findOneAndUpdate(
            { _id: id, isDeleted: false },
            { isDeleted: true },
            { new: true, session }
        );

        if (!deletedAcademicDept) {
            await session.abortTransaction();
            return null;
        }

        await StudentModel.updateMany(
            {
                academicDept: id,
                isDeleted: false
            },
            { isDeleted: true },
            { session }
        );

        await session.commitTransaction();

        return deletedAcademicDept;

    } catch (error) {

        await session.abortTransaction();
        throw new AppError('Failed to delete academic department', 500);

    } finally {
        await session.endSession();
    }
};

// Restore all deleted departments from the database
const restoreDeletedAcademicDeptsInDB = async () => {
    //1st check if there are any deleted departments, if there are then restore them by setting isDeleted to false
    const deletedDepts = await AcademicDeptModel.find({ isDeleted: true }).select('_id'); // We only need the _id field of the deleted departments to restore them, so we can use select to optimize the query and reduce the amount of data retrieved from the database
    if (deletedDepts.length === 0) {
        return null; // No deleted departments found to restore
    }
    await AcademicDeptModel.updateMany(
        { isDeleted: true },  // Filter to find all documents that are currently marked as deleted
        { isDeleted: false } // Update operation to set isDeleted to false, effectively restoring the deleted departments
    );
    //then show latest restored departments by finding them again with isDeleted false and also sort them by updatedAt in descending order to show the latest restored departments first    
    const latestRestoredDepts = await AcademicDeptModel.find({ isDeleted: false, _id: { $in: deletedDepts } }).select('name academicFaculty updatedAt')
    return latestRestoredDepts; // This will return the result of the update operation, which includes information about how many documents were modified
}

export const AcademicDeptService = {
    createAcademicDeptIntoDB,
    getAllAcademicDeptsFromDB,
    getAcademicDeptByIdFromDB,
    updateAcademicDeptInfoInDB,
    deleteAcademicDeptFromDB,
    restoreDeletedAcademicDeptsInDB,
    getAllDeletedAcademicDeptsFromDB
}