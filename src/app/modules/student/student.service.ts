import { Student } from "./student.interface.js";
import { StudentModel } from "./student.model.js";
import { UserModel } from "../user/user.model.js";
import mongoose from "mongoose";
import { paginate, parseListQuery } from "../../builder/queryBuilder.js";
import { normalizeMongoUpdatePayload } from "../../utils/mongoPartialUpdate.js";

const studentListSearchableFields = [
  "name.firstName",
  "name.middleName",
  "name.lastName",
  "email",
  "guardian.fatherName",
  "guardian.motherName",
  "localGuardian.name",
  "contactNo",
] as const;

// Get all student and search students
const getAllStudentsFromDB = async (query: Record<string, unknown>) => {
  const parsed = parseListQuery(query, {
    searchableFields: [...studentListSearchableFields],
    baseFilter: { isDeleted: false },
  });

  const { meta, data: students } = await paginate(StudentModel, parsed, (q) =>
    q
      .populate("user")
      .populate("admissionSemester")
      .populate({
        path: "academicDept",
        populate: {
          path: "academicFaculty",
        },
      }),
  );

  return { meta, students };
};
//   function to get all deleted students from the database
const getAllDeletedStudentsFromDB = async () => {
  // Simulating fetching all deleted students from the database
  const result = await StudentModel.find({ isDeleted: true });
  // const result = await StudentModel.find().populate('user').populate('admissionSemester')
  return {
    count: result.length,
    students: result,
  };
};

// Service function to get a student by ID from the database
const getStudentByIdFromDB = async (id: string) => {
  // Simulating fetching a student by ID from the database
  const result = await StudentModel.findById(id, { isDeleted: false })
    .populate("user")
    .populate("admissionSemester")
    .populate({
      path: "academicDept",
      populate: {
        path: "academicFaculty",
      },
    });
  return result;
};
//use aggregation pipeline to get student by id, this will allow us to perform more complex queries and operations on the data, such as filtering, grouping, and sorting, which can be useful for retrieving specific information about a student based on their ID.
// const getStudentByIdUsingAggregationFromDB = async (id: string) => {
//     const result = await StudentModel.aggregate([
//         { $match: { _id: id } },
//         // Add more stages to the pipeline as needed for additional processing or transformations
//     ])
//     return result[0] // Assuming the aggregation will return an array, we return the first element which should be the student document matching the ID
// }
//update info
const updateStudentInfoInDB = async (
  id: string,
  updatedData: Partial<Omit<Student, "id" & "email" & "user" & "isDeleted">>,
) => {
  // here partial means the updatedData can have any subset of the Student properties, making it flexible for updates
  //before updating check its deleted or not if not then update it and also check if the updated admission semester reference is valid or not
  const existingStudent = await StudentModel.findOne({
    _id: id,
    isDeleted: false,
  });
  if (!existingStudent) {
    return null; // No student found with the specified ID or it is already deleted
  }
  // Dot-notation partial update so nested objects (name, guardian, localGuardian) merge
  // per-field instead of replacing the whole subdocument.
  const updatedStudentData = normalizeMongoUpdatePayload(
    updatedData as Record<string, unknown>,
  );
  const updatedStudent = await StudentModel.findByIdAndUpdate(
    id,
    updatedStudentData,
    { returnDocument: "after" },
  ); // This option ensures that the updated document is returned after the update operation is completed
  return updatedStudent;
};

// delete student from database
const deleteStudentFromDB = async (id: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const deletedStudent = await StudentModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      {
        returnDocument: "after",
        session,
      },
    );

    if (!deletedStudent) {
      await session.abortTransaction();
      return null;
    }

    await UserModel.findByIdAndUpdate(
      deletedStudent.user,
      { isDeleted: true },
      { session },
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
        path: "admissionSemester",
        select: "+isDeleted",
      })
      .populate({
        path: "academicDept",
        select: "+isDeleted academicFaculty",
        populate: {
          path: "academicFaculty",
          select: "+isDeleted",
        },
      });

    if (deletedStudents.length === 0) {
      await session.abortTransaction();
      return {
        count: 0,
        students: [],
        message: "There are no deleted students to restore",
      };
    }
    // Filter the deleted students to find those that can be restored based on the status of their related admissionSemester and academicDept (including academicFaculty) references. Only students whose related references are not deleted can be restored.
    const validStudents = deletedStudents.filter((student) => {
      const semester = student.admissionSemester as any;
      const dept = student.academicDept as any;

      return (
        semester &&
        !semester.isDeleted &&
        dept &&
        !dept.isDeleted &&
        dept.academicFaculty &&
        !dept.academicFaculty.isDeleted
      );
    });

    if (validStudents.length === 0) {
      await session.abortTransaction();
      return {
        count: 0,
        students: [],
        message: "No students can be restored due to deleted references",
      };
    }
    // Extract the user IDs and student IDs of the valid students that can be restored, which will be used to update their isDeleted status in the database.
    const validUserIds = validStudents.map((s) => s.user).filter(Boolean);

    const validStudentIds = validStudents.map((s) => s._id);

    if (validUserIds.length > 0) {
      await UserModel.updateMany(
        { _id: { $in: validUserIds } },
        { isDeleted: false },
        { session },
      );
    }
    // Update the isDeleted status of the valid students to false, effectively restoring them in the database, and then fetch the restored student documents to return as part of the response.
    await StudentModel.updateMany(
      { _id: { $in: validStudentIds } },
      { isDeleted: false },
      { session },
    );
    // Fetch the restored student documents to return in the response, including their name, email, and admissionSemester information.
    const result = await StudentModel.find({
      _id: { $in: validStudentIds },
    })
      .select("name email admissionSemester")
      .session(session);

    await session.commitTransaction();

    return {
      count: result.length,
      students: result,
      message: "Deleted students restored successfully",
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
  restoreDeletedStudentsInDB,
};
