
import { AcademicDept } from './academicDept.interface.js';
import AcademicDeptModel from './academicDept.model.js';


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
    const updatedAcademicDept = await AcademicDeptModel.findByIdAndUpdate(id, updatedData, { returnDocument: 'after' }).populate('academicFaculty');
    return updatedAcademicDept;
}

// delete department from database
const deleteAcademicDeptFromDB = async (id: string) => {
    //check if the department is already deleted, if not then delete it and also delete all students associated with this department by marking them as deleted
    const deletedAcademicDept = await AcademicDeptModel.findByIdAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true }, { returnDocument: 'after' }).populate('academicFaculty');
    if (!deletedAcademicDept) {
        return null; // No department found with the specified ID or it is already deleted
    }
    return deletedAcademicDept; // This will return the deleted department document if it was found and deleted, or null if no document with the specified ID was found
}
export const AcademicDeptService = {
    createAcademicDeptIntoDB,
    getAllAcademicDeptsFromDB,
    getAcademicDeptByIdFromDB,
    updateAcademicDeptInfoInDB,
    deleteAcademicDeptFromDB
}