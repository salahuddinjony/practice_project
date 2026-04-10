
import { ca } from "zod/locales";
import AcademicDeptModel from "../academicDept/academicDept.model.js";
import { AcademicFaculty } from "./academicFaculty.interface.js"
import AcademicFacultyModel from "./academicFaculty.model.js"
import mongoose, { model } from "mongoose"
import AppError from "../../errors/AppError.js";
import { StudentModel } from "../student/student.model.js";

// Service function to create a new academic faculty
const createAcademicFacultyIntoDB = async (facultyData: AcademicFaculty) => {
    const faculty = await AcademicFacultyModel.create(facultyData);
    return faculty;
}

// Service function to get all academic faculties
const getAllAcademicFacultiesFromDB = async () => {
    const faculties = await AcademicFacultyModel.find({ isDeleted: false });
    return faculties;
}

// get single faculty by id
const getAcademicFacultyByIdFromDB = async (id: string) => {
    const faculty = await AcademicFacultyModel.findById(id);
    return faculty;
}

// update faculty info
const updateAcademicFacultyInfoInDB = async (id: string, updatedData: Partial<Omit<AcademicFaculty, 'id'>>) => {
    //before updating check its deleted or not if not then update it and also check if the updated name is unique or not
    const existingFaculty = await AcademicFacultyModel.findOne({ _id: id, isDeleted: false });
    if (!existingFaculty) {
        return null; // No faculty found with the specified ID or it is already deleted
    }
    const updatedFaculty = await AcademicFacultyModel.findByIdAndUpdate(id, updatedData, { returnDocument: 'after' });
    return updatedFaculty;
}

// delete faculty from database
const deleteAcademicFacultyFromDB = async (id: string) => {

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const deletedFaculty = await AcademicFacultyModel.findOneAndUpdate(
            { _id: id, isDeleted: false },
            { isDeleted: true },
            { returnDocument: 'after', session }
        );

        if (!deletedFaculty) {
            await session.abortTransaction();
            return null;
        }

        const departments = await AcademicDeptModel.find(
            { academicFaculty: id, isDeleted: false }
        ).select('_id');

        const departmentIds = departments.map(dept => dept._id);

        if (departmentIds.length > 0) {

            await AcademicDeptModel.updateMany(
                { _id: { $in: departmentIds } },
                { isDeleted: true },
                { session }
            );

            await StudentModel.updateMany(
                {
                    academicDept: { $in: departmentIds },
                    isDeleted: false
                },
                { isDeleted: true },
                { session }
            );
        }

        await session.commitTransaction();
        return deletedFaculty;

    } catch (error) {

        await session.abortTransaction();
        throw new AppError('Failed to delete academic faculty', 500);

    } finally {
        await session.endSession();
    }
};

// Restore all deleted faculties from the database
const restoreDeletedAcademicFacultiesInDB = async () => {

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const deletedFaculties = await AcademicFacultyModel.find(
            { isDeleted: true }
        ).select('_id');

        if (deletedFaculties.length === 0) {
            await session.abortTransaction();
            return null;
        }

        const facultyIds = deletedFaculties.map(f => f._id);

        await AcademicFacultyModel.updateMany(
            { _id: { $in: facultyIds } },
            { isDeleted: false },
            { session }
        );

        await session.commitTransaction();

        const restoredFaculties = await AcademicFacultyModel.find({
            _id: { $in: facultyIds }
        });

        return restoredFaculties;

    } catch (error) {

        await session.abortTransaction();
        throw new AppError('Failed to restore deleted academic faculties', 500);

    } finally {
        await session.endSession();
    }
};

//get all deleted faculties from database
const getAllDeletedAcademicFacultiesFromDB = async () => {
    const faculties = await AcademicFacultyModel.find({ isDeleted: true });
    if (faculties.length === 0) {
        return null; // No deleted faculties found
    }
    return {
        count: faculties.length,
        faculties: faculties
    };
}
export const AcademicFacultyService = {
    createAcademicFacultyIntoDB,
    getAllAcademicFacultiesFromDB,
    getAcademicFacultyByIdFromDB,
    updateAcademicFacultyInfoInDB,
    deleteAcademicFacultyFromDB,
    restoreDeletedAcademicFacultiesInDB,
    getAllDeletedAcademicFacultiesFromDB

}