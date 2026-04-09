import { AcademicSemester } from "./academicSemester.interface.js";
import { AcademicSemesterModel } from "./academicSemester.model.js";
import { model } from "mongoose";
import { isCorrectSemester as correctSemesterCheker } from "./utils/academicSemester.mapper.js";

// Service function to create a new academic semester
const createSemesterIntoDB = async (semesterData: AcademicSemester) => {
    // Validate the semester name and code combination
    correctSemesterCheker(semesterData.name, semesterData.code);

    const semester = await AcademicSemesterModel.create(semesterData);
    return semester;
}
// Service function to get all academic semesters
const getAllSemestersFromDB = async () => {
    const semesters = await AcademicSemesterModel.find({ isDeleted: false });
    return semesters;
}
// Service function to get all deleted academic semesters
const getAllDeletedSemestersFromDB = async () => {
    const semesters = await AcademicSemesterModel.find({ isDeleted: true });
    return semesters;
}

// get single semester by id 
const getSemesterByIdFromDB = async (id: string) => {
    const semester = await AcademicSemesterModel.findById(id);
    return semester;
}

// update semester info
const updateSemesterInfoInDB = async (id: string, updatedData: Partial<Omit<AcademicSemester, 'id'>>) => {
    // before updating check its deleted or not if not then update it and also validate the updated semester name and code combination
    const existingSemester = await AcademicSemesterModel.findOne({ _id: id, isDeleted: false });
    if (!existingSemester) {
        return null; // No semester found with the specified ID or it is already deleted
    }
    const updatedSemester = await AcademicSemesterModel.findByIdAndUpdate(id, updatedData, { returnDocument: 'after' });
    return updatedSemester;
}

// delete semester from database
const deleteSemesterFromDB = async (id: string) => {
    //check if the semester is already deleted, if not then delete it and also delete all students associated with this semester by marking them as deleted
    const deletedSemester = await AcademicSemesterModel.findByIdAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true }, { returnDocument: 'after' });
    // Also delete all students associated with this semester by marking them as deleted
    if (!deletedSemester) {
        return null; // No semester found with the specified ID or it is already deleted
    }
    await model('Student').updateMany({ admissionSemester: id }, { isDeleted: true })

    return deletedSemester; // This will return the deleted semester document if it was found and deleted, or null if no document with the specified ID was found
}
// Restore all deleted semesters from the database
const restoreDeletedSemestersInDB = async () => {
    //1st check if there are any deleted semesters, if there are then restore them by setting isDeleted to false
    const deletedSemesters = await AcademicSemesterModel.find({ isDeleted: true });
    if (deletedSemesters.length === 0) {
        return null; // No deleted semesters found to restore
    }
    await AcademicSemesterModel.updateMany(
        { isDeleted: true },  // Filter to find all documents that are currently marked as deleted
        { isDeleted: false } // Update operation to set isDeleted to false, effectively restoring the deleted semesters
    );

    //then show latest restored semesters by finding them again with isDeleted false and also sort them by updatedAt in descending order to show the latest restored semesters first    
    const latestRestoredSemesters = await AcademicSemesterModel.find({ isDeleted: false }).sort({ updatedAt: -1 });
    return latestRestoredSemesters; // This will return the result of the update operation, which includes information about how many documents were modified
}

//Restore a single deleted semester by ID
const restoreDeletedSemesterByIdInDB = async (id: string) => {
    const restoredSemester = await AcademicSemesterModel.findByIdAndUpdate(id, { isDeleted: false }, { returnDocument: 'after' });
    return restoredSemester; // This will return the restored semester document if it was found and restored, or null if no document with the specified ID was found
}

export const AcademicSemesterService = {
    createSemesterIntoDB,
    getAllSemestersFromDB,
    getAllDeletedSemestersFromDB,
    getSemesterByIdFromDB,
    updateSemesterInfoInDB,
    deleteSemesterFromDB,
    restoreDeletedSemestersInDB,
    restoreDeletedSemesterByIdInDB
}