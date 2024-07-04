
export const TaskAllocationType = {
    allRegionManagers: "all_region_managers",
    allStoreManagers: "all_store_managers",
    allWorkers: "all_workers",
    custom: "custom",
}
export const RepeatType = {
    Once: "One Time",
    Weekly: "weekly",
    Monthly: "monthly",
    Yearly: "yearly",
    // Hourly:"hourly",
    // Daily:"daily",
    // every:"every"
}
export const Weeks = {
    First: "first Week",
    Second: "second Week",
    Third: "third Week",
    Fourth: "forth Week"
}
export const Days = {
    Sunday: "Sunday",
    Monday: "Monday",
    Tuesday: "Tuesday",
    Wednsday: "Wednsday",
    Thursday: "Thursday",
    Friday: "Friday",
    Saturday: "Saturday",

}

export const Months = {
    January: "January",
    February: "February",
    March: "March",
    April: "April",
    May: "May",
    June: "June",
    July: "July",
    August: "August",
    September: "September",
    Octomber: "Octomber",
    November: "November",
    December: "December",
}
export const TaskStatusENUM = {
    Done: "Done",
    Pending: "pending",
    NotDone: "Not Done",
    approve: "Approve",
    ICanNotDo: "I can not do",
    Late: "Late",
    InProgress:"InProgress"
};
export const TaskPriorityENUM = {
    NORMAL: "NORMAL",
    HIGH: "HIGH",
    LOW: "LOW",
};

export const FEEDBACK_TEXT = { id: 1, name: "text" }
export const FEEDBACK_NUMBER = { id: 2, name: "number" }
export const FEEDBACK_CHECKBOXES = { id: 3, name: "checkboxes" }
export const FEEDBACK_RADIO = { id: 4, name: "radio" }
export const FEEDBACK_QR = { id: 5, name: "qr" }
export const FEEDBACK_PHOTO = { id: 6, name: "photo" }
export const FEEDBACK_VIDEO = { id: 7, name: "video" }
export const FEEDBACK_BRANCH = { id: 8, name: "branch" }

export const TaskApproveEnum = {
    CanApprove: "CanApprove",
    HalfPending: "HalfPending",
    HalfIssue: "HalfIssue",
};
export const TASK_FILTER_STATUS = {
    All: "All",
    Now: "Now",
    Late: "Late",
    ToApprove: "To_Approve",
    Done: "Done"
};

export const QUEST_ACTION_STATUS = {
    None: "None",
    Next: "Next",
    GoTo: "GoTo",
    Done: "Done"
}

export const QUEST_STATUS = {
    Draft: "Draft",
    Published: "Published",
    Replaced: "Replaced"
}