import { Schema, model, connect, Types } from 'mongoose';

// Define the Student interface using type alias , also can use interface

export type guradian = {
    fatherName: string;
    fatherOccupation: string;
    fatherContactNo: string;
    motherName: string;
    motherOccupation: string;
    motherContactNo: string;
}
export type localGuardian = {
    name: string;
    occupation: string;
    contactNo: string;
    address: string;
} 

export type userName = {
    firstName: string;
    middleName?: string | undefined;
    lastName: string;

}
// main student interface
export type Student = {
    id: string;
    user: Types.ObjectId; // Reference to the User document, this will store the ObjectId of the associated user document in the database, allowing us to establish a relationship between the student and the user.
    name: userName;
    gender: "male" | "female" | "other";
    dateOfBirth: Date;
    email: string;
    contactNo: string;
    emergencyContactNo: string;
    bloodGroup?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-" | undefined;
    presentAddress: string;
    permanentAddress: string;
    guardian: guradian,
    localGuardian: localGuardian,
    profileImage?: string | undefined;
    admissionSemester: Types.ObjectId; // Reference to the AcademicSemester document, this will store the ObjectId of the associated academic semester document in the database, allowing us to establish a relationship between the student and their admission semester.
    academicDept: Types.ObjectId; 
    isDeleted?: boolean; // Optional field to indicate if the student is deleted

}

