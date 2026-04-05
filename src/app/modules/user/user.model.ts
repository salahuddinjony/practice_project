import { Schema, model } from 'mongoose';
import { User } from './user.interface.js';
import { timeStamp } from 'console';
import bcrypt from 'bcrypt';
import config from '../../config/index.js';

export const userSchema = new Schema<User>({
    id: {
        type: Number,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        select: false, // This option ensures that the password field is not included in query results by default, enhancing security by preventing accidental exposure of hashed passwords in API responses or logs.
    },
    needsPasswordReset: {
        type: Boolean,
        default: true,
    },
    role: {
        type: String,
        enum: {
            values: ['admin', 'user', 'faculty'],
            message: 'Role must be one of admin, user, or faculty'

        },
        required: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: {
            values: ['in-progress', 'active', 'inactive', 'pending', 'blocked'],
            message: 'Status must be one of in-progress, active, inactive, pending, or blocked',
        },
        default: 'pending',
    }
}, {
    timestamps: true
}
);
//pre hook for save method, this will run before saving data to the database, we can use this to perform any necessary operations or validations before the data is actually saved. In this case, it simply logs the document being saved and a message indicating that the hook is running.
userSchema.pre('save', async function () {
    //hash password before saving to database
    if (this.isModified('password')) { // Check if the password field has been modified (either during creation or update)
        const saltRounds = Number(config.BCRYPT_SALT_ROUNDS); // Get the number of salt rounds from the configuration, which determines how many times the password will be hashed. A higher number means more security but also more time to hash the password.
        const hashedPassword = await bcrypt.hash(this.password, saltRounds); // Hash the password using bcrypt
        this.password = hashedPassword; // Replace the plain text password with the hashed version before saving to the database
    }
    // console.log(this, 'Hook before saving data') 
})

//post hook for save method, this will run after saving data to the database, we can use this to perform any necessary operations or actions after the data has been saved. In this case, it simply logs the document that was saved and a message indicating that the hook has completed.
userSchema.post('save', function (doc, next) {
    // console.log(this, 'Hook after saving data');
    (doc as any).password = undefined // This will remove the password field from the document before it is sent back in the response, ensuring that the hashed password is not exposed in any API responses or logs.
    next() // Call the next middleware function in the stack, if there are any. This is important to ensure that the request continues to be processed after the hook has completed its operations.
})

// 

// Create the User model using the schema
export const UserModel = model<User>('User', userSchema);