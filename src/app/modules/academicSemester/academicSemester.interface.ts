export type months = "January" | "February" | "March" | "April" | "May" | "June" | "July" | "August" | "September" | "October" | "November" | "December"
export type semesterCodes = "01" | "02" | "03"
export type semesterNames = "Autumn" | "Summer" | "Fall"
export type semesterNameAndCodeType = {
    [key: string]: String
}
export type AcademicSemester = {
    name: semesterNames;
    code: semesterCodes;
    year: Date;
    startMonth: months;
    endMonth: months;
    isDeleted?: boolean;
}