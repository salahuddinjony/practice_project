import config from "../../config/index.js";
import { Student } from "../student/student.interface.js";
import { StudentModel } from "../student/student.model.js";
import { User } from "./user.interface.js";
import { UserModel } from "./user.model.js";
import mongoose, { UpdateQuery } from "mongoose";
import AppError from "../../errors/handleAppError.js";
import { UserUtils } from "./user.utils.js";
import { paginate, parseListQuery } from "../../builder/queryBuilder.js";
import { normalizeMongoUpdatePayload } from "../../utils/mongoPartialUpdate.js";
import { AcademicSemesterModel } from "../academicSemester/academicSemester.model.js";
import AcademicDeptModel from "../academicDept/academicDept.model.js";
import { startSession } from "mongoose";
// Service function to create a user in the database
const createStudentIntoDB = async (password: string, StudentData: Student) => {
  // Simulating saving the user data to the database
  const userData: Partial<User> = {};
  userData.password = password ?? config.DEFAULT_USER_PASSWORD;
  userData.role = "student";
  // Use a session to ensure that both user and student creation are atomic operations. If either operation fails, the transaction will be rolled back, preventing partial data from being saved to the database.
  const session = await startSession();
  try {
    // Start a transaction to ensure atomicity of user and student creation. This means that if any part of the process fails (either creating the user or the student), the entire transaction will be rolled back, ensuring data integrity and preventing partial records from being saved to the database.
    session.startTransaction();

    const admissionSemesterId = StudentData.admissionSemester.toString();
    if (!admissionSemesterId) {
      throw new AppError("Admission semester is required", 400);
    }
    if (!mongoose.Types.ObjectId.isValid(admissionSemesterId)) {
      await session.abortTransaction();
      throw new AppError("Invalid admission semester id", 400);
    }
    //check if the admission semester is deleted
    const admissionSemester = await AcademicSemesterModel.findOne({
      _id: admissionSemesterId,
      isDeleted: false,
    }).session(session);
    if (!admissionSemester) {
      await session.abortTransaction();
      throw new AppError("Admission semester is deleted", 400);
    }
    //academicDept
    const academiDeptId = StudentData.academicDept.toString();
    if (!academiDeptId) {
      await session.abortTransaction();
      throw new AppError("Academic department is required", 400);
    }
    if (!mongoose.Types.ObjectId.isValid(academiDeptId)) {
      await session.abortTransaction();
      throw new AppError("Invalid academic department id", 400);
    }
    //check if the academic department is deleted
    const academicDept = await AcademicDeptModel.findOne({
      _id: academiDeptId,
      isDeleted: false,
    }).session(session);
    if (!academicDept) {
      await session.abortTransaction();
      throw new AppError("Academic department is deleted", 400);
    }
    // Generate a unique student ID using the UserUtils.generatedStudentId function, which takes the admission semester ID and the session as parameters. This function will generate a unique student ID based on the admission semester and ensure that it is done within the same transaction to maintain data integrity.
    userData.id = await UserUtils.generatedStudentId(
      admissionSemesterId,
      session,
    );

    // Keep user and student creation atomic to avoid partial records.
    const [createNewUser] = await UserModel.create([userData], { session });

    StudentData.id = createNewUser!.id;
    StudentData.user = createNewUser!._id;
    // Create the student document in the database using the StudentModel, passing in the student data and the session to ensure that it is part of the same transaction as the user creation. This will allow us to maintain data integrity and ensure that both the user and student records are created successfully or rolled back together in case of any errors.
    const [createNewStudent] = await StudentModel.create([StudentData], {
      session,
    });

    await session.commitTransaction();
    return createNewStudent;
  } catch (error) {
    await session.abortTransaction();
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to create student user", 500);
  } finally {
    await session.endSession();
  }
};
// Service function to get all users from the database
const getAllUsersFromDB = async (query: Record<string, unknown>) => {
  const parsed = parseListQuery(query, {
    searchableFields: ["id", "role"],
    baseFilter: { isDeleted: false },
  });
  const { meta, data: users } = await paginate(UserModel, parsed);
  return { meta, users };
};

// Service function to get a user by ID from the database
const getUserByIdFromDB = async (id: string) => {
  // Simulating fetching a user by ID from the database
  const result = await UserModel.findById({ _id: id, isDeleted: false });
  return result;
};

// Service function to update user info in the database
const updateUserInfoInDB = async (
  id: string,
  updatedData: UpdateQuery<User>,
) => {
  const payload =
    typeof updatedData === "object" &&
    updatedData !== null &&
    !Array.isArray(updatedData)
      ? normalizeMongoUpdatePayload(updatedData as Record<string, unknown>)
      : updatedData;
  const updatedUser = await UserModel.findOneAndUpdate(
    { _id: id, isDeleted: false },
    payload,
    {
      returnDocument: "after", // This option ensures that the updated document is returned after the update operation is performed, allowing us to get the latest state of the user after the update.
    },
  );

  if (!updatedUser) {
    return null;
  }

  return updatedUser;
};

// delete user from database
const deleteUserFromDB = async (id: string) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const deletedUser = await UserModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      { returnDocument: "after", session },
    );

    if (!deletedUser) {
      await session.abortTransaction();
      return null;
    }

    // Keep user and related student soft-delete in the same transaction.
    await StudentModel.findOneAndUpdate(
      { user: deletedUser._id, isDeleted: false },
      { isDeleted: true },
      { session },
    );

    await session.commitTransaction();
    return deletedUser;
  } catch (error) {
    await session.abortTransaction();
    throw new AppError("Failed to delete user", 500);
  } finally {
    await session.endSession();
  }
};

// Get all deleted students from the database
const getAllDeletedUsersFromDB = async () => {
  const deletedUsers = await UserModel.find({ isDeleted: true }).select(
    "+isDeleted",
  );
  if (deletedUsers.length === 0) {
    return {
      count: 0,
      users: [],
      message: "There are no deleted users",
    };
  }
  return {
    count: deletedUsers.length,
    message: "Deleted users retrieved successfully",
    users: deletedUsers,
  };
};

// Restore all deleted users from the database
const restoreDeletedUsersInDB = async () => {
  // Set up a session for transaction management
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // 1. Get deleted users
    const deletedUsers = await UserModel.find(
      { isDeleted: true },
      { _id: 1 },
    ).session(session);

    const userIds = deletedUsers.map((user) => user._id);

    // If there are no deleted users, we can abort the transaction and return early
    if (userIds.length === 0) {
      await session.abortTransaction();
      return {
        count: 0,
        users: [],
        message: "There are no deleted users to restore",
      };
    }

    // 2. Restore users
    const restoredUsers = await UserModel.updateMany(
      { _id: { $in: userIds } },
      { isDeleted: false },
      { session },
    );

    // 3. Restore ONLY related students
    await StudentModel.updateMany(
      { user: { $in: userIds }, isDeleted: true },
      { isDeleted: false },
      { session },
    );
    // 4. Find current restored users to return in response
    const restoredUserDocs = await UserModel.find({
      _id: { $in: userIds },
    }).session(session);

    // 5. Commit FIRST, then return
    await session.commitTransaction();

    return {
      count: restoredUsers.modifiedCount,
      message: `${restoredUsers.modifiedCount} user(s) restored successfully`,
      users: restoredUserDocs,
    };
  } catch (error) {
    await session.abortTransaction();
    throw new AppError("Failed to restore deleted users", 500);
  } finally {
    await session.endSession();
  }
};
export const UserService = {
  createStudentIntoDB,
  getAllUsersFromDB,
  getUserByIdFromDB,
  updateUserInfoInDB,
  deleteUserFromDB,
  getAllDeletedUsersFromDB,
  restoreDeletedUsersInDB,
};
