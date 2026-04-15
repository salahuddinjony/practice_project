import { paginate, parseListQuery } from "../../builder/queryBuilder.js";
import { normalizeMongoUpdatePayload } from "../../utils/mongoPartialUpdate.js";
import { Admin } from "./admin.interface.js";
import AdminModel from "./admin.model.js";

const CreateAdminIntoDB = async (admin: Admin) => {
  const createdAdmin = await AdminModel.create(admin);
  return createdAdmin;
};

// Get all admins from DB
const getAllAdminsFromDB = async (query: Record<string, unknown> = {}) => {
  const parsed = parseListQuery(query, {
    searchableFields: ["name", "email"],
  });
  const { meta, data: admins } = await paginate(AdminModel, parsed);
  return { meta, admins };
};

// Get admin by ID from DB
const getAdminByIdFromDB = async (id: string) => {
  const admin = await AdminModel.findOne({ _id: id, isDeleted: false });
  return admin;
};
//update admin info in DB
const updateAdminInDB = async (id: string, admin: Partial<Admin>) => {
  const updatedAdmin = await AdminModel.findByIdAndUpdate(
    id,
    normalizeMongoUpdatePayload(admin as Record<string, unknown>),
    {
      returnDocument: "after",
    },
  );
  return updatedAdmin;
};

// delete admin from DB
const deleteAdminFromDB = async (id: string) => {
  const deletedAdmin = await AdminModel.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { returnDocument: "after" },
  );
  return deletedAdmin;
};

export const AdminService = {
  CreateAdminIntoDB,
  getAllAdminsFromDB,
  getAdminByIdFromDB,
  updateAdminInDB,
  deleteAdminFromDB,
};
