
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
    const updatedFaculty = await AcademicFacultyModel.findByIdAndUpdate(id, updatedData, { returnDocument: 'after' });
    return updatedFaculty;
}

// delete faculty from database
const deleteAcademicFacultyFromDB = async (id: string) => {
    const deletedFaculty = await AcademicFacultyModel.findByIdAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true }, { returnDocument: 'after' });
    if (!deletedFaculty) {
        return null; // No faculty found with the specified ID or it is already deleted
    }
    //also mark all departments under this faculty as deleted
    // await model('AcademicDept').updateMany({ academicFaculty: id }, { isDeleted: true })

    //also can use model name to update many departments under this faculty as deleted
    await AcademicDeptModel.updateMany({ academicFaculty: id }, { isDeleted: true })

    return deletedFaculty; // This will return the deleted faculty document if it was found and deleted, or null if no document with the specified ID was found
}
export const AcademicFacultyService = {
    createAcademicFacultyIntoDB,
    getAllAcademicFacultiesFromDB,
    getAcademicFacultyByIdFromDB,
    updateAcademicFacultyInfoInDB,
    deleteAcademicFacultyFromDB
}