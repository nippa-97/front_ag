import React from "react";

const PagesList = {
    //redirect
    RedirectComponent: React.lazy(() => import("../components/common_layouts/Redirect")), 
    
    //auth
    LandingPage: React.lazy(() => import("../components/landingPage/landingpage")),      
    SignInComponent: React.lazy(() => import("../components/signin/signin")),
    ResetPassword: React.lazy(() => import("../components/resetPassword/ResetPassword")),
    NoMatchComponent: React.lazy(() => import("../components/nomatch/nomatch")),
    ConfirmationPassword: React.lazy(() => import("../components/resetPassword/ConfirmationPassword")),
    ProfileSettingsComponent: React.lazy(() => import("../components/common_layouts/profilesettings")),
    
    //master data
    DisplayUnits: React.lazy(() => import("../components/masterdata/displayUnits/DisplayUnits")),
    NewDisplayUnit: React.lazy(() => import("../components/masterdata/displayUnits/newDisplayUnit/NewDisplayUnit")),
    
    Floors: React.lazy(() => import("../components/masterdata/floors/Floors")),
    FloorDetails: React.lazy(() => import("../components/masterdata/floors/floorDetails/FloorDetails")),
    
    ProductsComponent: React.lazy(() => import("../components/masterdata/products/products")),
    AddNewItemComponent: React.lazy(() => import("../components/masterdata/products/AddNew/addnew")),

    DepartmentsComponent: React.lazy(() => import("../components/masterdata/departments/departments")),
    DepartmentDetailsComponent: React.lazy(() => import("../components/masterdata/departments/AddNew/addnew")),
    
    ChainDepartmentsComponent: React.lazy(() => import("../components/masterdata/chainDepartments/departments")),
    ChainDepartmentDetailsComponent: React.lazy(() => import("../components/masterdata/chainDepartments/AddNew/details")),
    AddNewDepartment: React.lazy(() => import("../components/masterdata/chainDepartments/AddNew/addnewdep")),

    TagsComponent: React.lazy(() => import("../components/masterdata/tags/tags")),
    BrandsComponent: React.lazy(() => import("../components/masterdata/brands/brands")),
    SuppliersComponent: React.lazy(() => import("../components/masterdata/suppliers/suppliers")),
    RegionsComponent: React.lazy(() => import("../components/masterdata/regions/regions")),
    BranchesComponent: React.lazy(() => import("../components/masterdata/branches/branches")),
    
    Hierarchy: React.lazy(() => import("../components/masterdata/hierarchy/hierarchy")),
    
    ExcelUploadComponent: React.lazy(() => import("../components/masterdata/excelupload/excelupload")),

    SalesLog: React.lazy(() => import("../components/masterdata/salesLog/salesLog")),
    CatelogueImport: React.lazy(() => import("../components/masterdata/CatelogueImportLog/catelogueImportLog")),
    StoreProducts: React.lazy(() => import("../components/masterdata/storeProducts/storeProducts")),
    NewProducts: React.lazy(() => import("../components/masterdata/newProducts/newProducts")),
    NewProductLogs: React.lazy(() => import("../components/masterdata/newproductlogs/newproductlogs")),
    
    Users: React.lazy(() => import("../components/masterdata/userManagemnt/Users")),
    UserDetails: React.lazy(() => import("../components/masterdata/userManagemnt/UserDetails")),
    UserGroupsComponent: React.lazy(() => import("../components/masterdata/usergroups/usergroups")),

    ManualComplianceComponent: React.lazy(() => import("../components/masterdata/manualcompliance/manualcompliance")),
    MCDetailsComponent: React.lazy(() => import("../components/masterdata/manualcompliance/detailsview/mcdetails")),
    
    //main pages
    NewDashboardComponent: React.lazy(() => import("../components/newdashboard/newdashboard")),
    
    Planograms: React.lazy(() => import("../components/planograms/Planograms")), 
    PlanogramDetails: React.lazy(() => import("../components/planograms/planogramDetails/PlanogramDetails")), 
    PlanDunitComponent: React.lazy(() => import("../components/planograms/planDisplayUnit/plandunit")), 
    
    SelectDept: React.lazy(() => import("../components/newMasterPlanogram/departmentview/selectDept")), 
    MPCategoryView: React.lazy(() => import("../components/newMasterPlanogram/categoryview/catView")), 
    ProdNotificationsComponent: React.lazy(() => import("../components/newMasterPlanogram/notifications/prodnotifications")), 
    CategoryContent: React.lazy(() => import("../components/newMasterPlanogram/categoryview/categorycontent/catContent")), 
    SubcatContent: React.lazy(() => import("../components/newMasterPlanogram/categoryview/scategorycontent/scatcontent")),
    BrandContent: React.lazy(() => import("../components/newMasterPlanogram/categoryview/brandcontent/brandcontent")),

    Tasks: React.lazy(() => import("../components/task/tasks")),
    TaskSummery: React.lazy(() => import("../components/task/taskSummery/taskSummery")),

    QuestionearList: React.lazy(() => import("../components/questionear/questionear")),
    QuestionDetails: React.lazy(() => import("../components/questionear/questiondetails")),
}

export default PagesList;