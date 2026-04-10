import { Schema, model, connect } from 'mongoose';
import { guradian, localGuardian, Student, userName } from './student.interface.js';
import validator from 'validator' // Importing the validator library to use its functions for validating input data, such as checking if a string is a valid email address or if it contains only letters.
import bcrypt from 'bcrypt' // Importing the bcrypt library to use its functions for hashing passwords, which is a common practice for securely storing user passwords in a database.
import config from '../../config/index.js'
// import { config } from 'zod/v4/core';
// import { number } from 'joi';


// Define schema for Student
export const userNameSchema = new Schema<userName>({
    firstName: {
        type: String,
        trim: true,
        required: [true, 'First name is required'],
        maxLength: [20, 'First name cannot exceed 20 characters'],
        // Custom validator to allow only letters in the first name
        validate: {
            validator: function (value: string) {
                return /^[A-Za-z]+$/.test(value); // Regular expression to allow only letters
            },
            message: '{VALUE} is not a valid first name. First name should contain only letters.'

        }
    },
    middleName: {
        type: String,
        trim: true,
        maxLength: [10, 'Middle name cannot exceed 10 characters'],
        validate: {
            validator: (value: string) => {
                return validator.isAlpha(value) // This will allow only letters in the middle name, but no special characters or spaces.

            },
            message: '{VALUE} is not a valid middle name. Middle name should contain only letters and numbers.'
        }


    },
    lastName: {
        type: String, trim: true,
        validate: {
            validator: (value: string) => {
                return validator.isAlpha(value)

            },
            message: '{VALUE} is not a valid last name. Last name should contain only letters and numbers.'


        },
        required: [true, 'Last name is required'], maxLength: [15, 'Last name cannot exceed 15 characters']
    },
}, { _id: false }) // Disable _id for subdocument

// Define schema for Guardian and Local Guardian, these will be used as subdocuments in the main Student schema, which allows us to embed the guardian information directly within the student document in the database. This can simplify data retrieval and management since we can access all related information in a single document.
export const guradianSchema = new Schema<guradian>({
    fatherName: { type: String, trim: true, required: [true, 'Father name is required'] },
    fatherOccupation: { type: String, trim: true, required: [true, 'Father occupation is required'] },
    fatherContactNo: { type: String, validate: { validator: (value: string) => validator.isMobilePhone(value, 'bn-BD'), message: '{VALUE} is not a valid Bangladeshi contact number.' }, trim: true, required: [true, 'Father contact number is required'] },
    motherName: { type: String, trim: true, required: [true, 'Mother name is required'] },
    motherOccupation: { type: String, trim: true, required: [true, 'Mother occupation is required'] },
    motherContactNo: { type: String, validate: { validator: (value: string) => validator.isMobilePhone(value, 'bn-BD'), message: '{VALUE} is not a valid Bangladeshi contact number.' }, trim: true, required: [true, 'Mother contact number is required'] },
}, { _id: false }) // Disable _id for subdocument
// Local Guardian Schema
export const localGuardianSchema = new Schema<localGuardian>({
    name: { type: String, trim: true, required: [true, 'local Guardian name is required'] },
    occupation: { type: String, trim: true, required: [true, 'Occupation is required'] },
    contactNo: { type: String, validate: { validator: (value: string) => validator.isMobilePhone(value, 'bn-BD'), message: '{VALUE} is not a valid Bangladeshi contact number.' }, trim: true, required: [true, 'Contact number is required'] },
    address: { type: String, trim: true, required: [true, 'Address is required'] },
}, { _id: false }
)


// Main Student Schema
const studentSchema = new Schema<Student>({
    id: { type: String, required: [true, 'Student ID is required'], unique: [true, 'Student ID must be unique'] },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Associated user is required'],
        unique: [true, 'User ID must be unique']
    }, // This field will store the ObjectId of the associated user document in the database, allowing us to establish a relationship between the student and the user.
    name: {
        type: userNameSchema,
        trim: true,
        required: [true, 'Name is required']
    },
    gender: {
        type: String,
        enum: {
            values: ['male', 'female', 'other'],
            message: "'{VALUE}' is not a valid gender. Gender must be one of 'male', 'female', or 'other'."

        },
        trim: true,
        required: [true, 'Gender is required']
    },
    dateOfBirth: { type: Date, required: [true, 'Date of birth is required'] },
    email: {
        type: String,
        trim: true,
        required: [true, 'Email is required'],
        unique: [true, 'Email must be unique'],
        immutable: true, // This will make the email field unchangeable after it's set for the first time
        // validate: {
        //     validator: (value: string) => {
        //         return validator.isEmail(value) // Using the isEmail function from the validator library to check if the provided email is valid.
        //     },
        //     message: '{VALUE} is not a valid email address.'
        // }
    },
    contactNo: {
        type: String,
        trim: true,
        required: [true, 'Contact number is required'],
        validate: {
            validator: (value: string) => {
                return validator.isMobilePhone(value, 'bn-BD') // Using the isMobilePhone function from the validator library to check if the provided contact number is a valid Bangladeshi mobile phone number.
            },
            message: (props: any) => {
                const value = props.value;

                if (value.length !== 11) {
                    return `${value} must be exactly 11 digits long.`;
                }

                if (!/^01\d{9}$/.test(value)) {
                    return `${value} must start with 01 and contain only digits.`;
                }

                return `${value} is not a valid Bangladeshi contact number.`;
            }
        }
    },
    emergencyContactNo: { type: String, validate: { validator: (value: string) => validator.isMobilePhone(value, 'bn-BD'), message: '{VALUE} is not a valid Bangladeshi contact number.' }, trim: true, required: [true, 'Emergency contact number is required'] },
    bloodGroup: {
        type: String, enum: {
            values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
            trim: true,
            message: "Blood group must be one of 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', or 'O-'"
        }
    },
    presentAddress: { type: String, trim: true, required: [true, 'Present address is required'] },
    permanentAddress: { type: String, trim: true, required: [true, 'Permanent address is required'] },
    guardian: {
        type: guradianSchema,
        required: [true, 'Guardian information is required']
    },
    localGuardian: {
        type: localGuardianSchema,
        required: [true, 'Local guardian information is required']
    },
    profileImage: { type: String },
    admissionSemester: { 
        type: Schema.Types.ObjectId,
         ref: 'AcademicSemester', 
         required: [true, 'Admission semester is required'],
         unique: false // This field does not need to be unique since multiple students can be admitted in the same semester, so we set unique to false to allow for duplicate values in this field.
        },
    academicDept: { type: Schema.Types.ObjectId, ref: 'AcademicDept', required: [true, 'Academic department is required'] },    
    isDeleted: { type: Boolean, default: false, select: false } // This field will be used to mark a student as deleted without actually removing the document from the database, which allows for soft deletion and easier data recovery if needed.
}, {
    timestamps: true, // This will automatically add createdAt and updatedAt fields to the schema
    toJSON: { // This will ensure that virtuals are included when converting documents to JSON
        virtuals: true,
    }
});

//virtual for full name, this will allow us to get the full name of the student by concatenating the first name, middle name (if it exists), and last name. This is useful for displaying the student's full name in API responses or in the user interface without having to store it as a separate field in the database.
studentSchema.virtual('fullName').get(function (this: any) {
    return `${this.name.firstName} ${this.name.middleName ? this.name.middleName + ' ' : ''}${this.name.lastName}`;
})

// middleware or hooks 

//pre hook for save method, this will run before saving data to the database, we can use this to perform any necessary operations or validations before the data is actually saved. In this case, it simply logs the document being saved and a message indicating that the hook is running.
studentSchema.pre('save', async function () {


    // console.log(this, 'Hook before saving data') 
})

//post hook for save method, this will run after saving data to the database, we can use this to perform any necessary operations or actions after the data has been saved. In this case, it simply logs the document that was saved and a message indicating that the hook has completed.
studentSchema.post('save', function (doc, next) {
    // console.log(this, 'Hook after saving data');
    (doc as any).password = undefined // This will remove the password field from the document before it is sent back in the response, ensuring that the hashed password is not exposed in any API responses or logs.
    next() // Call the next middleware function in the stack, if there are any. This is important to ensure that the request continues to be processed after the hook has completed its operations.
})

//for update hooks, we can use pre and post hooks for findOneAndUpdate method, this will run before and after updating data in the database, we can use this to perform any necessary operations or validations before and after the data is updated. In this case, it simply logs the document being updated and a message indicating that the hook is running.
studentSchema.pre('findOneAndUpdate', function () {

    const update = this.getUpdate() as any;

    const restrictedFields = ['email', 'isDeleted'];

    for (const field of restrictedFields) {

        if (
            update?.[field] !== undefined ||
            update?.$set?.[field] !== undefined
        ) {
            throw new Error(`${field} field cannot be updated`);
        }
    }
});

// post hook for findOneAndUpdate method, this will run after updating data in the database, we can use this to perform any necessary operations or actions after the data has been updated. In this case, it simply logs the document that was updated and a message indicating that the hook has completed.
studentSchema.post('findOneAndUpdate', function () {
    // console.log(this, 'Hook after updating data')
})
// studentSchema.pre('findOne', function () {
//     this.findOne({ isDeleted: { $ne: true } }) // This will add a condition to the query to only return documents where the isDeleted field is false, effectively filtering out any documents that have been marked as deleted.
//     // this.where({ isDeleted: { $ne: true } }) // This will add a condition to the query to only return documents where the isDeleted field is false, effectively filtering out any documents that have been marked as deleted.
// })
// studentSchema.pre('aggregate', function () {
//     //here unshift is used to add a new stage at the beginning of the aggregation pipeline, which will filter out any documents that have been marked as deleted (isDeleted: true) before any other stages in the pipeline are executed. This ensures that the aggregation results only include active documents and exclude any that have been marked as deleted.
//     this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } }) // This will add a match stage at the beginning of the aggregation pipeline to filter out any documents that have been marked as deleted, ensuring that only active documents are included in the aggregation results.
// })
//middleware for find method, this will run before finding data in the database, we can use this to perform any necessary operations or validations before the data is retrieved. In this case, it simply logs the query being executed and a message indicating that the hook is running.
// studentSchema.pre('find', function () {
//     // console.log(this.getQuery(), 'Hook before finding data')
//     this.find({ isDeleted: { $ne: true } }) // This will add a condition to the query to only return documents where the isDeleted field is false, effectively filtering out any documents that have been marked as deleted.
//     // this.where({ isDeleted: { $ne: true } }) // This will add a condition to the query to only return documents where the isDeleted field is false, effectively filtering out any documents that have been marked as deleted.
// })

// // post hook for find method, this will run after finding data in the database, we can use this to perform any necessary operations or actions after the data has been retrieved. In this case, it simply logs the document that was found and a message indicating that the hook has completed.
// studentSchema.post('find', function (docs, next) {
//     docs.forEach((doc: any) => {
//         if(doc.isDeleted) {
//             doc = undefined // This will remove the isDeleted field from the document before it is sent back in the response, ensuring that the deleted status is not exposed in any API responses or logs.
//         }
//     });
//     next();
// });
// Create the Student model
export const StudentModel = model<Student>('Student', studentSchema);
