import { AcademicSemester, months, semesterCodes, semesterNameAndCodeType, semesterNames } from './academicSemester.interface.js';
export const monthEnum: months[] = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"] as const
export const semesterNameEnum: semesterNames[] = ['Autumn', 'Summer', 'Fall'] as const
export const semesterCodeEnum: semesterCodes[] = ['01', '02', '03'] as const
export const semesterNameAndCodeMapper: semesterNameAndCodeType = {
    'Autumn': '01',
    'Summer': '02',
    'Fall': '03'
}