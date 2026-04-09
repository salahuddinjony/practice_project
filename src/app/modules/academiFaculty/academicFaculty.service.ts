
import AcademicDeptModel from "../academicDept/academicDept.model.js";
import { AcademicFaculty } from "./academicFaculty.interface.js"
import AcademicFacultyModel from "./academicFaculty.model.js"
import { model } from "mongoose"

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

    // 1. Delete faculty
    const deletedFaculty = await AcademicFacultyModel.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { isDeleted: true },
        { new: true }
    );

    if (!deletedFaculty) {
        return null;
    }

    // 2. Get department IDs FIRST (before deleting them)
    const departments = await AcademicDeptModel.find({
        academicFaculty: id,
        isDeleted: false
    }).select('_id');

    const departmentIds = departments.map(dept => dept._id);

    // 3. Delete departments
    await AcademicDeptModel.updateMany(
        { _id: { $in: departmentIds } },
        { isDeleted: true }
    );

    // 4. Delete students under those departments (no need to find first)
    await model('Student').updateMany(
        {
            academicDept: { $in: departmentIds },
            isDeleted: false
        },
        { isDeleted: true }
    );

    return deletedFaculty;
};

// Restore all deleted faculties from the database
const restoreDeletedAcademicFacultiesInDB = async () => {
    //1st check if there are any deleted faculties, if there are then restore them by setting isDeleted to false
    const deletedFaculties = await AcademicFacultyModel.find({ isDeleted: true }).select('_id'); // We only need the _id field of the deleted faculties to restore them, so we can use select to optimize the query and reduce the amount of data retrieved from the database
    if (deletedFaculties.length === 0) {
        return null; // No deleted faculties found to restore
    }
      await AcademicFacultyModel.updateMany(
        { isDeleted: true },  // Filter to find all documents that are currently marked as deleted
        { isDeleted: false } // Update operation to set isDeleted to false, effectively restoring the deleted departments
    );
    // get the restored faculties to return in the response
    const restoredFaculties = await AcademicFacultyModel.find({ isDeleted: false, _id: { $in: deletedFaculties } });
    return restoredFaculties; // This will return the result of the update operation, which includes information about how many documents were matched and modified during the restore process
} 

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