import { Schema, Query } from 'mongoose';
export const restrictUpdateFieldsChecker = (
  schema: Schema,
  updateMethods: string[] = [
    "findOneAndUpdate",
    "updateOne",
    "updateMany",
  ],
  restrictedFields: string[] = []
) => {
  const checkUpdate = function (this: Query<any, any>) {
    const update = this.getUpdate() as any;

    const flatUpdate = {
      ...update,
      ...(update?.$set || {}),
    };

    for (const field of restrictedFields) {
      if (flatUpdate?.[field] !== undefined) {
        throw new Error(`${field} field cannot be updated`);
      }
    }
  };

  // Apply to all methods dynamically
  updateMethods.forEach((method) => {
    schema.pre(method as any, checkUpdate);
  });
};