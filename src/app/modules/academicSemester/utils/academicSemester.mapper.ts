import { semesterCodes, semesterNames } from "../academicSemester.interface.js";
import { semesterNameAndCodeMapper } from "../academicSemester.constant.js";

export const isCorrectSemester = (
    name: semesterNames,
    code: semesterCodes
) => {
    const expectedCode = semesterNameAndCodeMapper[name];

    if (!expectedCode || expectedCode !== code) {
        throw new Error(
            `Invalid semester combination:${name} does not match code:${code}.`
        );
    }



};