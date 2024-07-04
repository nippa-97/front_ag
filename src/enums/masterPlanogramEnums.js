export const shelfLifeEnums = {
    days: 'Days', 
    weeks: 'Weeks', 
    months: 'Months', 
    years: 'Years'
}

export const paceScaleEnums = {
    per_day: 'Per Day', 
    per_week: 'Per Week', 
    per_month: 'Per Month', 
    per_year: 'Per Year'
}

export const MPBoxType = {
    default: 'default', 
    rule:"rule",
}

export const catRectEnums = {
    default: "default",
    rule: "rule",
    parent: "parent",
}

export const catRuleEnums = {
    other: 'other', 
    cat: 'category',
    subcat: 'sub_category', 
    sup: 'supplier', 
    brand: 'brand'
}

export const simulateSnapshotEnums = {
    normal: 'normal',
    implemented: 'implemented'
}

export const notSimulatedReason = {
    heightIssue: 'heightIssue', 
    minQtyIssue: 'minQtyIssue',
    noEnoughSpace: 'noEnoughSpace', 
    noTagMatching: 'noTagMatching', 
    none: 'none'
}

export const impleStatus = {
    NONE: "NONE",
    ACTIVE: "ACTIVE",
    CONFIRMED: "CONFIMED"
}
export const SimulationTypesFE={
    IsleAllocation:"ISleAllocation",
    Normal:"Normal",
    AUI:"AUI",
}

export const markSimUpdateTypes = {
    ReApproval: "ReApproval",
    ForceUpdate: "ForceUpdate"
}

export const prodSaleTypes = {
    num: "Fc",
    perc: "Num"
}

export const prodNotificationType = {
    TestPeriodOver: "Test Period is over",
    NewStarIsBorn: "New Star is born",
    InOut: "In & Out",
    FOutOfShelf: "F-Out of shelf", 
    DeadWalker: "Dead Walker" 
}

export const simulationPushMode = {
    custom: "custom",
    branch_selection: "branch_selection",
}