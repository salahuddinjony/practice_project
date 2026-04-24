export enum SemesterRegistrationStatus {
    UPCOMING = "UPCOMING",
    ONGOING = "ONGOING",
    COMPLETED = "COMPLETED",
}
const semesterRegistrationStatus = [
    SemesterRegistrationStatus.UPCOMING,
    SemesterRegistrationStatus.ONGOING,
    SemesterRegistrationStatus.COMPLETED,
] as const;
export default semesterRegistrationStatus;
