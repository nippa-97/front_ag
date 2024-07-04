import { alertService } from './alert.service';
import { basePath } from './common.service';
// import { persistService } from './persist.service';
import { validateSets } from '../components/UiComponents/ValidateSets';
import i18n from "../_translations/i18n";

//using backend paths
//object keys - ptype: call type, url: back path, queryparam: is using query params, data: is sending data object, auth: is must send authentication keys
const submitCollection = {
    checkstat: { ptype: "GET", url: basePath+"/service/system/Health", queryparam: false, data: false },
    signin:{ ptype: "POST", url: basePath+"/service/login/signIn", queryparam: false, data: true },

    login:{ ptype: "POST", url: basePath+"/userManagement/service/login/login", queryparam: false, data: true, auth: true },
    logout:{ ptype: "POST", url: basePath+"/userManagement/service/login/logout", queryparam: false, data: true, auth: true },
    saveNotificationToken:{ ptype: "POST", url: basePath+"/userManagement/service/userNotificationToken/saveNotificationToken", queryparam: false, data: true, auth: true },
    findNotificationTokenForUs:{ ptype: "POST", url: basePath+"/userManagement/service/userNotificationToken/findNotificationTokenForUs", queryparam: false, data: true, auth: true },
    getSystemUSerRoll: { ptype: "GET", url: basePath + "/userManagement/service/role/system-user-rolls", queryparam: false, data: false, auth: true},
    getUSerRollHierachy : { ptype: "GET", url: basePath + "/userManagement/service/role/user-roll-hierachy", queryparam: false, data: false, auth: true},
    saveUSerRollHierachy:{ ptype: "POST", url: basePath+"/userManagement/service/role/save-user-rolls", queryparam: false, data: true, auth: true },
    userresetpw:{ ptype: "POST", url: basePath+"/userManagement/service/user/passwordReset", queryparam: false, data: true, auth: true },
    deleteUserDeviceToken:{ ptype: "POST", url: basePath+"/userManagement/service/userNotificationToken/deleteUserDeviceToken", queryparam: false, data: true, auth: true },
    getGlobalSetting:{ ptype: "GET", url: basePath+"/userManagement/service/global/getGlobalSetting", queryparam: false, data: false, auth: true },
    updateUserLanguage:{ ptype: "POST", url: basePath+"/service/userStoreMS/updateUserLanguage", queryparam: false, data: true, auth: true },

    searchNotifications: { ptype: "POST", url: basePath+"/notifications/search", queryparam: false, data: true, auth: true },
    updateNotification: { ptype: "POST", url: basePath+"/notifications/update-read-status", queryparam: false, data: true, auth: true },

    searchDisplayUnit:{ ptype: "POST", url: basePath+"/service/field/allField", queryparam: false, data: true, auth: true },
    saveDisplayUnit:{ ptype: "POST", url: basePath+"/service/field/saveField", queryparam: false, data: true, auth: true },
    updateDisplayUnit:{ ptype: "POST", url: basePath+"/service/field/updateField", queryparam: false, data: true, auth: true },
    deleteDisplayUnit:{ ptype: "POST", url: basePath+"/service/field/deleteField", queryparam: false, data: true, auth: true },
    findDunitByID:{ ptype: "GET", url: basePath+"/service/field/findFieldById", queryparam: true, data: false, auth: true },

    searchFloors:{ ptype: "POST", url: basePath+"/service/flow/allFlow", queryparam: false, data: true, auth: true },
    saveFloors:{ ptype: "POST", url: basePath+"/service/flow/saveFlow", queryparam: false, data: true, auth: true },
    updateFloors:{ ptype: "POST", url: basePath+"/service/flow/updateFlow", queryparam: false, data: true, auth: true },
    deleteFloors:{ ptype: "POST", url: basePath+"/service/flow/deleteFlow", queryparam: false, data: true, auth: true },
    findFloorByID:{ ptype: "GET", url: basePath+"/service/flow/findFlowById", queryparam: true, data: false, auth: true },

    searchDepatments:{ ptype: "POST", url: basePath+"/service/master/departmentFindAll", queryparam: false, data: true, auth: true },
    saveDepatments:{ ptype: "POST", url: basePath+"/service/master/departmentSave", queryparam: false, data: true, auth: true },
    updateDepatments:{ ptype: "POST", url: basePath+"/service/master/departmentUpdate", queryparam: false, data: true, auth: true },
    deleteDepatments:{ ptype: "POST", url: basePath+"/service/master/departmentDelete", queryparam: false, data: true, auth: true },
    findDepatByID:{ ptype: "GET", url: basePath+"/service/master/departmentFindById", queryparam: true, data: false, auth: true },

    //
    searchChainDepatments:{ ptype: "POST", url: basePath+"/service/master/chainDepartmentFindAll", queryparam: false, data: true, auth: true },
    saveChainDepatments:{ ptype: "POST", url: basePath+"/service/master/chainDepartmentSave", queryparam: false, data: true, auth: true },
    updateChainDepatments:{ ptype: "POST", url: basePath+"/service/master/chainDepartmentUpdate", queryparam: false, data: true, auth: true },
    deleteChainDepatments:{ ptype: "POST", url: basePath+"/service/master/deleteAllCategories", queryparam: false, data: true, auth: true },
    findChainDepatByID:{ ptype: "GET", url: basePath+"/service/master/chainDepartmentFindById", queryparam: true, data: false, auth: true },
    findAllBrands:{ ptype: "POST", url: basePath+"/service/master/brandFindAll", queryparam: false, data: true, auth: true },
    getAllCategoriesFromDepartment:{ ptype: "POST", url: basePath+"/service/master/getAllCategories", queryparam: false, data: true, auth: true },
    getSubCategories:{ ptype: "POST", url: basePath+"/service/master/getSubCategories", queryparam: false, data: true, auth: true },
    saveSubCategories:{ ptype: "POST", url: basePath+"/service/master/SaveSubCategories", queryparam: false, data: true, auth: true },
    deleteSubCategory:{ ptype: "POST", url: basePath+"/service/master/deleteSubCategory", queryparam: false, data: true, auth: true },
    getSubCategoryBrands:{ ptype: "POST", url: basePath+"/service/master/getSubCategoryBrands", queryparam: false, data: true, auth: true },
    saveSubCategoryBrands:{ ptype: "POST", url: basePath+"/service/master/saveSubCategoryBrands", queryparam: false, data: true, auth: true },
    getDepartmentIcons:{ ptype: "GET", url: basePath+"/service/master/getDepartmentIcons", queryparam: false, data: false, auth: true },
    //
    searchSuppliers:{ ptype: "POST", url: basePath+"/service/master/supplierFindAll", queryparam: false, data: true, auth: true },
    saveSupplier:{ ptype: "POST", url: basePath+"/service/master/supplierSave", queryparam: false, data: true, auth: true },
    updateSupplier:{ ptype: "POST", url: basePath+"/service/master/supplierUpdate", queryparam: false, data: true, auth: true },
    deleteSupplier:{ ptype: "POST", url: basePath+"/service/master/supplierDelete", queryparam: false, data: true, auth: true },
    findSupplierByID:{ ptype: "GET", url: basePath+"/service/master/supplierFindById", queryparam: true, data: false, auth: true },
    //
    searchBrand:{ ptype: "POST", url: basePath+"/service/master/brandFindAll", queryparam: false, data: true, auth: true },
    saveBrand:{ ptype: "POST", url: basePath+"/service/master/brandSave", queryparam: false, data: true, auth: true },
    updateBrand:{ ptype: "POST", url: basePath+"/service/master/brandUpdate", queryparam: false, data: true, auth: true },
    deleteBrand:{ ptype: "POST", url: basePath+"/service/master/brandDelete", queryparam: false, data: true, auth: true },
    findBrandByID:{ ptype: "GET", url: basePath+"/service/master/brandFindById", queryparam: true, data: false, auth: true },
    //

    searchTags:{ ptype: "POST", url: basePath+"/service/master/tagFindAll", queryparam: false, data: true, auth: true },
    saveTags:{ ptype: "POST", url: basePath+"/service/master/tagSave", queryparam: false, data: true, auth: true },
    updateTags:{ ptype: "POST", url: basePath+"/service/master/tagUpdate", queryparam: false, data: true, auth: true },
    deleteTags:{ ptype: "POST", url: basePath+"/service/master/tagDelete", queryparam: false, data: true, auth: true },
    findTagByID:{ ptype: "GET", url: basePath+"/service/master/tagFindById", queryparam: true, data: false, auth: true },

    searchProds:{ ptype: "POST", url: basePath+"/service/product/find", queryparam: false, data: true, auth: true },
    findNames:{ ptype: "POST", url: basePath+"/service/product/findNames", queryparam: false, data: true, auth: true },
    masterProductFind:{ ptype: "POST", url: basePath+"/service/product/masterProductFind", queryparam: false, data: true, auth: true },
    findFieldDepartmentProduct:{ ptype: "POST", url: basePath+"/service/product/findFieldDepartmentProduct", queryparam: false, data: true, auth: true },
    saveProds:{ ptype: "POST", url: basePath+"/service/product/save", queryparam: false, data: true, auth: true },
    updateProds:{ ptype: "POST", url: basePath+"/service/product/update", queryparam: false, data: true, auth: true },
    deleteProds:{ ptype: "POST", url: basePath+"/service/product/delete", queryparam: false, data: true, auth: true },
    findProdByID:{ ptype: "GET", url: basePath+"/service/product/findById", queryparam: true, data: false, auth: true },
    updateProdDimention:{ ptype: "POST", url: basePath+"/service/product/updateProductDimension", queryparam: false, data: true, auth: true },
    getProdUsage:{ ptype: "POST", url: basePath+"/service/product/getProductUsageInShelf", queryparam: false, data: true, auth: true },
    findProdImageData:{ ptype: "GET", url: basePath+"/service/product/findBiggerPictureProduct", queryparam: true, data: false, auth: true },
    hasSnapShot:{ ptype: "POST", url: basePath+"/service/product/hasSnapShot", queryparam: false, data: true, auth: true },

    getImagePutURL:{ ptype: "POST", url: basePath+"/service/image/getPresignedPutUrl", queryparam: false, data: true, auth: true },
    getImageGETURL:{ ptype: "POST", url: basePath+"/service/image/getPresignedGetUrl", queryparam: false, data: true, auth: true },

    getActiveLayout:{ ptype: "GET", url: basePath+"/service/planogram/findActiveLayoutByStore", queryparam: true, data: false, auth: true },
    searchPlanograms:{ ptype: "POST", url: basePath+"/service/planogram/floorLayoutFindAll", queryparam: false, data: true, auth: true },
    newSearchPlanograms:{ ptype: "POST", url: basePath+"/service/planogram/findStoreAndFloorLayoutByChain", queryparam: false, data: true, auth: true },
    findPLanogramByID:{ ptype: "GET", url: basePath+"/service/planogram/floorLayoutFindByIdWithRelation", queryparam: true, data: false, auth: true },
    savePlanogram:{ ptype: "POST", url: basePath+"/service/planogram/floorLayoutSave", queryparam: false, data: true, auth: true },
    updateFloorLayout:{ ptype: "POST", url: basePath+"/service/planogram/floorLayoutUpdate", queryparam: false, data: true, auth: true },
    deleteFloorLayout:{ ptype: "POST", url: basePath+"/service/planogram/floorLayoutDelete", queryparam: false, data: true, auth: true },
    crudSingleFloorField:{ ptype: "POST", url: basePath+"/service/planogram/crudFlowLayoutFields", queryparam: false, data: true, auth: true },
    getSingleFloorFieldByRelation:{ ptype: "GET", url: basePath+"/service/planogram/findFloorLayoutFieldByIdWithRelation", queryparam: true, data: false, auth: true },
    getSingleFloorField:{ ptype: "GET", url: basePath+"/service/planogram/findFloorLayoutFieldById", queryparam: true, data: false, auth: true },
    changePlanogramStatus: { ptype: "POST", url: basePath+"/service/planogram/planogramLayoutStatusChange", queryparam: false, data: true, auth: true },
    newSavePlanogram: { ptype: "POST", url: basePath+"/service/planogram/planogramNewVersionSave", queryparam: false, data: true, auth: true },
    findPlanogramCurrentSales: { ptype: "POST", url: basePath+"/service/planogram/findPlanogramCurrentSales", queryparam: false, data: true, auth: true },
    getOtherFieldsProductQty: { ptype: "POST", url: basePath+"/service/planogram/getOtherFieldsProductQty", queryparam: false, data: true, auth: true },
    findActiveFieldByUUID:{ ptype: "GET", url: basePath+"/service/planogram/findActiveLayoutPlanogramFieldByUUID", queryparam: true, data: false, auth: true },
    findActiveLayoutByStore:{ ptype: "GET", url: basePath+"/service/planogram/findActiveLayoutByStore", queryparam: true, data: false, auth: true },
    findPlanogramEditmodeSales: { ptype: "POST", url: basePath+"/service/planogram/findPlanogramEditingModeSales", queryparam: false, data: true, auth: true },
    findPlanogramOverViewSales: { ptype: "POST", url: basePath+"/service/planogram/findPlanogramOverViewSales", queryparam: false, data: true, auth: true },
    findFloorLayoutChanges: { ptype: "POST", url: basePath+"/service/planogram/findFloorLayoutChanges", queryparam: false, data: true, auth: true },
    findFloorFieldWithAiImage: { ptype: "GET", url: basePath+"/service/planogram/findFloorFieldWithAiImage", queryparam: true, data: false, auth: true },
    findFloorFloorFieldSuggestionProducts: { ptype: "POST", url: basePath+"/service/planogram/findFloorFloorFieldSuggestionProducts", queryparam: false, data: true, auth: true },
    loadDeptProdChangesList: { ptype: "POST", url: basePath + "/service/dashboard/findSalesByFloorLayoutId", queryparam: false, data: false, auth: true},
    getFLDepartments: { ptype: "POST", url: basePath + "/service/store/flDepartments", queryparam: false, data: true, auth: true},
    findPlanogramVersionList: { ptype: "POST", url: basePath+"/service/planogram/findPlanogramVersionList", queryparam: false, data: true, auth: true },
    findStoreByFloorLayoutId: { ptype: "GET", url: basePath+"/service/planogram/findStoreByFloorLayoutId", queryparam: true, data: false, auth: true },
    getProdInfoReport: { ptype: "GET", url: basePath+"/service/report/getProductInfo", queryparam: true, data: false, auth: true },
    getconfimplanogramList:{ ptype: "GET", url: basePath+"/service/planogram/ConfimplanogramList", queryparam: false, data: false, auth: true },
    bulkPlanogramLayoutActivate: { ptype: "POST", url: basePath+"/service/planogram/bulkLayoutActivation", queryparam: false, data: true, auth: true },
    findFloorLayoutBulkFieldByIdsWithRelation: { ptype: "POST", url: basePath+"/service/planogram/findFloorLayoutBulkFieldByIdsWithRelation", queryparam: false, data: true, auth: true },
    crudFloorLayoutBulkField: { ptype: "POST", url: basePath+"/service/planogram/crudFloorLayoutBulkField", queryparam: false, data: true, auth: true },
    findActiveLayoutPlanogramBulkFieldByUUIDs: { ptype: "POST", url: basePath+"/service/planogram/findActiveLayoutPlanogramBulkFieldByUUIDs", queryparam: false, data: true, auth: true },
    deleteStoreTags: { ptype: "POST", url: basePath+"/service/planogram/deleteStoreTags", queryparam: false, data: true, auth: true },
    loadPlanogramClipboardData: { ptype: "POST", url: basePath+"/service/planogram/loadPlanogramClipboardData", queryparam: false, data: true, auth: true },
    planogramNewVersionSaveForBulkField: { ptype: "POST", url: basePath+"/service/planogram/planogramNewVersionSaveForBulkField", queryparam: false, data: true, auth: true },
    loadDepartmentBulkField: { ptype: "POST", url: basePath+"/service/planogram/loadDepartmentBulkField", queryparam: false, data: true, auth: true },
    findFloorLayoutFloorFieldSuggestionProductsForBulkField: { ptype: "POST", url: basePath+"/service/planogram/findFloorLayoutFloorFieldSuggestionProductsForBulkField", queryparam: false, data: true, auth: true },
    findPlanogramOverViewSalesCR: { ptype: "POST", url: basePath+"/service/planogram/findPlanogramOverViewSalesCR", queryparam: false, data: true, auth: true },
    loadPlanogramPercentageSuggestion: { ptype: "POST", url: basePath+"/service/planogram/loadPlanogramPercentageSuggestion", queryparam: false, data: true, auth: true },
    sendEmailWithFile: { ptype: "POST", url: basePath+"/service/email/sendEmailWithFile", queryparam: false, data: true, auth: true },

    sendQREmail: { ptype: "POST", url: basePath+"/service/planogram/sendFieldQR", queryparam: false, data: true, auth: true },

    uploadExcel: { ptype: "POST", url: basePath+"/service/saleInsert/salesInsert", queryparam: false, data: true, auth: true },

    filterdashboard: { ptype: "POST", url: basePath + "/service/dashboard/get-sales", queryparam: false, data: true, auth: true},
    storeSales: { ptype: "POST", url: basePath + "/service/dashboard/get-sales/store", queryparam: false, data: true, auth: true},
    getChartsData: { ptype: "POST", url: basePath + "/service/dashboard/get-chart-data", queryparam: false, data: true, auth: true},
    getDepartments: { ptype: "GET", url: basePath + "/service/dashboard/get-departments", queryparam: false, data: false, auth: true},
    getStores: { ptype: "GET", url: basePath + "/userManagement/service/branch/getAllStore", queryparam: false, data: false, auth: true},
    getStoreTags: { ptype: "GET", url: basePath + "/service/dashboard/getStoreTags", queryparam: false, data: false, auth: true},


    getRegions: { ptype: "POST", url: basePath + "/userManagement/service/region/filter-region", queryparam: false, data: true, auth: true},
    saveRegions: { ptype: "POST", url: basePath + "/userManagement/service/region/save-region", queryparam: false, data: true, auth: true},
    updateRegions: { ptype: "POST", url: basePath + "/userManagement/service/region/update-region", queryparam: false, data: true, auth: true},
    getRegionUsers: {ptype: "GET", url: basePath +"/userManagement/service/region/region-users", queryparam: false, data: true, auth: true},
    deleteRegions:{ptype: "POST", url: basePath+"/userManagement/service/region/delete-region", queryparam: false, data: true, auth: true },

    getBranches: { ptype: "POST", url: basePath + "/userManagement/service/branch/filter-branch", queryparam: false, data: true, auth: true},
    saveBranches: { ptype: "POST", url: basePath + "/userManagement/service/branch/save-branch", queryparam: false, data: true, auth: true},
    updateBranches: { ptype: "POST", url: basePath + "/userManagement/service/branch/update-branch", queryparam: false, data: true, auth: true},
    deleteBranches: { ptype: "POST", url: basePath + "/userManagement/service/branch/delete-branch", queryparam: false, data: false, auth: true},
    getRegionChainBranches: { ptype: "GET", url: basePath + "/userManagement/service/branch/regions-for-chain", queryparam: false, data: true, auth: true},
    getBranchUsers: { ptype: "GET", url: basePath + "/userManagement/service/branch/branch-users", queryparam: false, data: false, auth: true},
    saveStoreTags: { ptype: "POST", url: basePath + "/service/dashboard/saveStoreTags", queryparam: false, data: true, auth: true},
    updateStoreTags: { ptype: "POST", url: basePath + "/service/dashboard/updateStoreTags", queryparam: false, data: true, auth: true},
    findStoreTags: { ptype: "POST", url: basePath + "/service/dashboard/findStoreTags", queryparam: false, data: true, auth: true},


    //list
    storeListWithDefaultFieldCount:{ ptype: "GET", url: basePath+"/service/store/storeListWithDefaultFieldCount", queryparam: true, data: false, auth: true },
    getStoreList: { ptype: "POST", url: basePath + "/userManagement/service/user/findUserStores", queryparam: false, data: true, auth: true},
    getRegionList: { ptype: "POST", url: basePath + "/userManagement/service/user/findUserRegions", queryparam: false, data: true, auth: true},
    //task
    saveTaskAssign:{ ptype: "POST", url: basePath + "/task/service/task/saveTaskAllocation", queryparam: false, data: true, auth: true},
    getSingleTask:{ ptype: "GET", url: basePath+"/task/service/feed/getSingleTask", queryparam: true, data: false, auth: true },
    getTaskAssignees:{ ptype: "GET", url: basePath+"/task/service/task/findTaskAllocationsByTaskIdAndUser", queryparam: true, data: false, auth: true },
    getTasks: { ptype: "POST", url: basePath + "/task/service/feed/getFeed", queryparam: false, data: true, auth: true},
    getCatogories: { ptype: "POST", url: basePath + "/task/service/task/get-category-list", queryparam: false, data: true, auth: true},
    getTaskRegionList: { ptype: "GET", url: basePath + "/userManagement/service/userRoll/findRegionManagers", queryparam: false, data: false, auth: true},
    getTaskStoreList: { ptype: "POST", url: basePath + "/userManagement/service/userRoll/findStoreManagers", queryparam: false, data: true, auth: true},
    getTaskWorkerList: { ptype: "POST", url: basePath + "/userManagement/service/userRoll/findStoreUsers", queryparam: false, data: true, auth: true},
    savetask:{ ptype: "POST", url: basePath + "/task/service/task/saveTask", queryparam: false, data: true, auth: true},
    updatetask:{ ptype: "POST", url: basePath + "/task/service/task/updateTask", queryparam: false, data: true, auth: true},
    deletetask:{ ptype: "POST", url: basePath + "/task/service/task/deleteTask", queryparam: false, data: true, auth: true},
    findTaskByID:{ ptype: "GET", url: basePath+"/task/service/task/findTaskInfoWithRelations", queryparam: true, data: false, auth: true },
    findTaskSummery:{ ptype: "POST", url: basePath + "/task/service/task/findTaskSummery", queryparam: false, data: true, auth: true},
    getSubTask:{ ptype: "GET", url: basePath+"/task/service/task/get-attended-task", queryparam: true, data: false, auth: true },
    taskaddComment:{ ptype: "POST", url: basePath + "/task/service/task/add-comment", queryparam: false, data: true, auth: true},
    taskgetComment:{ ptype: "POST", url: basePath + "/task/service/task/get-comments", queryparam: false, data: true, auth: true},
    taskredo:{ ptype: "POST", url: basePath + "/task/service/task/task-redo", queryparam: false, data: true, auth: true},
    approveTask :{ ptype: "POST", url: basePath + "/task/service/task/approveTask", queryparam: false, data: true, auth: true},
    getFeedChartCounts :{ ptype: "GET", url: basePath + "/task/service/feed/getFeedChartCounts", queryparam: true, data: false, auth: true},
    markAllocationDetailAsIcant :{ ptype: "POST", url: basePath + "/task/service/task/markAllocationDetailAsIcant", queryparam: false, data: true, auth: true},
    
    //userManagement
    getUserRoles: { ptype: "GET", url: basePath + "/userManagement/service/user/lower-user-roles", queryparam: false, data: false, auth: true},
    getUserBranches:{ ptype: "GET", url: basePath+"/userManagement/service/branch/branches-by-region", queryparam: true, data: false, auth: true },
    UserCrud: { ptype: "POST", url: basePath + "/userManagement/service/user/user-crud", queryparam: false, data: true, auth: true},
    searchUsers:{ ptype: "POST", url: basePath+"/userManagement/service/user/get-users", queryparam: false, data: true, auth: true },
    findUserByID:{ ptype: "GET", url: basePath+"/userManagement/service/user/get-user-by-id", queryparam: true, data: false, auth: true },
    checkBranchHasManager: { ptype: "GET", url: basePath+"/userManagement/service/branch/check-branch-has-manager", queryparam: true, data: false, auth: true },
    checkRegionHasManager: { ptype: "GET", url: basePath+"/userManagement/service/region/check-region-has-manager", queryparam: true, data: false, auth: true },
    //user groups
    crudGroup:{ ptype: "POST", url: basePath+"/userManagement/service/group/crudGroup", queryparam: false, data: true, auth: true },
    findAllGroup:{ ptype: "POST", url: basePath+"/userManagement/service/group/findAllGroup", queryparam: false, data: true, auth: true },
    findGroupOnly:{ ptype: "POST", url: basePath+"/userManagement/service/group/findGroupOnly", queryparam: false, data: true, auth: true },
    findAllUsersByFilter:{ ptype: "POST", url: basePath+"/userManagement/service/userRoll/findAllUsersByFilter", queryparam: false, data: true, auth: true },
    //new dashboard
    findLineChart: { ptype: "POST", url: basePath + "/service/dashboardV2/findLineChart", queryparam: false, data: true, auth: true},
    findFilterWiseLineChart: { ptype: "POST", url: basePath + "/service/dashboardV2/findFilterWiseLineChart", queryparam: false, data: true, auth: true},
    findStoreData: { ptype: "POST", url: basePath + "/service/dashboardV2/findStoreData", queryparam: false, data: true, auth: true},
    findDepartmentData: { ptype: "POST", url: basePath + "/service/dashboardV2/findDepartmentData", queryparam: false, data: true, auth: true},
    findProductData: { ptype: "POST", url: basePath + "/service/dashboardV2/findProductData", queryparam: false, data: true, auth: true},
    findLayoutChanges: { ptype: "POST", url: basePath + "/service/dashboardV2/findLayoutChanges", queryparam: false, data: true, auth: true},
    findAllProductsOfSpecificStoreOrDepartment: { ptype: "POST", url: basePath + "/service/product/findAllProductsOfSpecificStoreOrDepartment", queryparam: false, data: true, auth: true},
    dashboardFiltersFind: { ptype: "POST", url: basePath + "/service/dashboardFilters/find", queryparam: false, data: true, auth: true},
    dashboardFiltersSave: { ptype: "POST", url: basePath + "/service/dashboardFilters/save", queryparam: false, data: true, auth: true},
    dashboardFiltersEdit: { ptype: "POST", url: basePath + "/service/dashboardFilters/update", queryparam: false, data: true, auth: true},
    dashboardFiltersDelete: { ptype: "POST", url: basePath + "/service/dashboardFilters/delete", queryparam: false, data: true, auth: true},
    //task questinear
    getQuestionnaireList: { ptype: "POST", url: basePath + "/task/service/questionnaire/GetQuestionnaireList", queryparam: false, data: true, auth: true},
    getSpecificQuestionnaire: { ptype: "POST", url: basePath + "/task/service/questionnaire/GetSpecificQuestionnaire", queryparam: false, data: true, auth: true},
    updateQuestion: { ptype: "POST", url: basePath + "/task/service/questionnaire/UpdateQuestion", queryparam: false, data: true, auth: true},
    updateSpecificQuestionnaire: { ptype: "POST", url: basePath + "/task/service/questionnaire/UpdateSpecificQuestionnaire", queryparam: false, data: true, auth: true},
    deleteSpecificQuestionnaire: { ptype: "POST", url: basePath + "/task/service/questionnaire/DeleteSpecificQuestionnaire", queryparam: false, data: true, auth: true},
    publishSpecificQuestionnaire: { ptype: "POST", url: basePath + "/task/service/questionnaire/PublishSpecificQuestionnaire", queryparam: false, data: true, auth: true},
    unpublishSpecificQuestionnaire: { ptype: "POST", url: basePath + "/task/service/questionnaire/UnpublishSpecificQuestionnaire", queryparam: false, data: true, auth: true},
    //get questionnaire
    getuestionnaire: { ptype: "POST", url: basePath + "/task/service/questionnaire/GetPublishedQuestionnaireList", queryparam: false, data: true, auth: true},
     //get saleslog
    autoSalesProductLog: { ptype: "POST", url: basePath + "/service/saleInsert/autoSalesProductLog", queryparam: false, data: true, auth: true},
    autoSalesSyncLog: { ptype: "POST", url: basePath + "/service/saleInsert/autoSalesSyncLog", queryparam: false, data: true, auth: true},
    autoImportedSalesLog: { ptype: "POST", url: basePath + "/service/saleInsert/autoImportedSalesLog", queryparam: false, data: true, auth: true},
    manualTriggerSales: { ptype: "POST", url: basePath + "/service/saleInsert/manualTrigger-v2", queryparam: false, data: false, auth: true},
    forceIssueSync: { ptype: "GET", url: basePath + "/service/saleInsert/forceIssueSync", queryparam: false, data: false, auth: true},
    getSpecificTaskDetailReport:{ ptype: "POST", url: basePath + "/task/service/reports/getSpecificTaskDetailReport", queryparam: false, data: true, auth: true},
    GetTileInfoSales:{ ptype: "GET", url: basePath+"/service/saleInsert/tilesInfo", queryparam: true, data: false, auth: true },
    GetWarningInfoSales:{ ptype: "GET", url: basePath+"/service/saleInsert/warningInfo", queryparam: true, data: false, auth: true },
    saleLogReverse:{ ptype: "POST", url: basePath + "/service/saleInsert/reverseSales", queryparam: false, data: true, auth: true},
    //Complience
    fieldComplienceList: { ptype: "POST", url: basePath + "/service/manualCompliance/fieldComplienceList", queryparam: false, data: true, auth: true},
    singleComplienceDetails: { ptype: "GET", url: basePath+"/service/manualCompliance/singleComplienceDetails", queryparam: true, data: false, auth: true },
    getChainList: { ptype: "GET", url: basePath + "/service/chain/getChainList", queryparam: false, data: false, auth: true},
    getDepartmentList: { ptype: "GET", url: basePath + "/service/department/findAll", queryparam: false, data: false, auth: true},
    getStoreListAll: { ptype: "GET", url: basePath + "/service/store/storeList", queryparam: false, data: false, auth: true},
    updateComplience: { ptype: "POST", url: basePath + "/service/manualCompliance/updateComplience", queryparam: false, data: true, auth: true},
    findProductListByFloorLayoutHasAisleField: { ptype: "GET", url: basePath+"/service/planogram/findProductListByFloorLayoutHasAisleField", queryparam: true, data: false, auth: true },
    redoRequestComplience: { ptype: "POST", url: basePath + "/service/manualCompliance/redoRequestComplience", queryparam: false, data: true, auth: true},
    getAllAvailableProducts: { ptype: "GET", url: basePath + "/service/product/getAllAvailableProducts", queryparam: false, data: false, auth: true},
    getProductUsageInShelfFromProduct:{ ptype: "POST", url: basePath + "/service/product/getProductUsageInShelfFromProduct", queryparam: false, data: true, auth: true},

    mpDepartmentList: { ptype: "POST", url: basePath + "/service/masterPlanogram/departmentList", queryparam: false, data: true, auth: true},
    mpCategoryList: { ptype: "POST", url: basePath + "/service/masterPlanogram/categoryList", queryparam: false, data: true, auth: true},
    mpCategoryPercentage: { ptype: "POST", url: basePath + "/service/masterPlanogram/categoryPercentage", queryparam: false, data: true, auth: true},
    mpCategoryNewProdCount: { ptype: "POST", url: basePath + "/service/masterPlanogram/categoryNewProductCount", queryparam: false, data: true, auth: true},
    mpFieldList: { ptype: "POST", url: basePath + "/service/masterPlanogram/fieldList", queryparam: false, data: true, auth: true},
    mpTagList: { ptype: "GET", url: basePath + "/service/masterPlanogram/storeTagList", queryparam: true, data: false, auth: true},
    mpSubCategoryList: { ptype: "POST", url: basePath + "/service/masterPlanogram/subCategoryList", queryparam: false, data: true, auth: true},
    mpCatNewProductCount: { ptype: "POST", url: basePath + "/service/masterPlanogram/newProdCountCatSubCat", queryparam: false, data: true, auth: true},
    mpSubCategoryPercentage: { ptype: "POST", url: basePath + "/service/masterPlanogram/subCategoryPercentage", queryparam: false, data: true, auth: true},
    mpSubCategoryNewProdCount: { ptype: "POST", url: basePath + "/service/masterPlanogram/subCategoryNewProductCount", queryparam: false, data: true, auth: true},
    mpBrandList: { ptype: "POST", url: basePath + "/service/masterPlanogram/brandList", queryparam: false, data: true, auth: true},
    mpBrandPercentage: { ptype: "POST", url: basePath + "/service/masterPlanogram/brandPercentage", queryparam: false, data: true, auth: true},
    mpBrandNewProdCount: { ptype: "POST", url: basePath + "/service/masterPlanogram/brandNewProductCount", queryparam: false, data: true, auth: true},
    mpProductList: { ptype: "POST", url: basePath + "/service/masterPlanogram/productList", queryparam: false, data: true, auth: true},
    mpProductPercentage: { ptype: "POST", url: basePath + "/service/masterPlanogram/productPercentage", queryparam: false, data: true, auth: true},
    mpSupplierList:{ ptype: "POST", url: basePath + "/service/masterPlanogram/supplierList", queryparam: false, data: true, auth: true},
    mpSimulation:{ ptype: "POST", url: basePath + "/service/masterPlanogram/heavyProcess/simulation", queryparam: false, data: true, auth: true},
    pushToStore:{ ptype: "POST", url: basePath + "/service/masterPlanogram/pushToStore", queryparam: false, data: true, auth: true},
    saveChangesofSimulation:{ ptype: "POST", url: basePath + "/service/masterPlanogram/saveChanges", queryparam: false, data: true, auth: true},
    getDepartmentMetaData: { ptype: "GET", url: basePath + "/service/masterPlanogram/getDepartmentMetaData", queryparam: true, data: false, auth: true},
    updateDepartmentMetaData:{ ptype: "POST", url: basePath + "/service/masterPlanogram/updateDepartmentMetaData", queryparam: false, data: true, auth: true},
    loadMp:{ ptype: "POST", url: basePath + "/service/masterPlanogram/loadMp", queryparam: false, data: true, auth: true},
    newMpVer:{ ptype: "POST", url: basePath + "/service/masterPlanogram/newMpVer", queryparam: false, data: true, auth: true},
    editVerName:{ ptype: "POST", url: basePath + "/service/masterPlanogram/editVerName", queryparam: false, data: true, auth: true},
    mpVerList:{ ptype: "POST", url: basePath + "/service/masterPlanogram/mpVerList", queryparam: false, data: true, auth: true},
    getMp:{ ptype: "POST", url: basePath + "/service/masterPlanogram/getMp", queryparam: false, data: true, auth: true},
    deleteMpVer:{ ptype: "POST", url: basePath + "/service/masterPlanogram/deleteMpVer", queryparam: false, data: true, auth: true},
    vmpDuplicate:{ ptype: "POST", url: basePath + "/service/masterPlanogram/vmpDuplicate", queryparam: false, data: true, auth: true},
    saleCycleProductList:{ ptype: "POST", url: basePath + "/service/masterPlanogram/saleCycleProductList", queryparam: false, data: true, auth: true},
    updateMasterProductInfo:{ ptype: "POST", url: basePath + "/service/masterPlanogram/updateMasterProductInfo", queryparam: false, data: true, auth: true},
    saveNewCategories: { ptype: "POST", url: basePath + "/service/masterPlanogram/saveNewCategories", queryparam: false, data: true, auth: true},
    saveSubCategory: { ptype: "POST", url: basePath + "/service/masterPlanogram/saveSubCategory", queryparam: false, data: true, auth: true},
    saveMpBrands: { ptype: "POST", url: basePath + "/service/masterPlanogram/saveMpBrands", queryparam: false, data: true, auth: true},
    getFullListOfSubCategories: { ptype: "POST", url: basePath + "/service/master/getFullListOfSubCategories", queryparam: false, data: true, auth: true},
    updateProductListChangesAgainstBrand: { ptype: "POST", url: basePath + "/service/masterPlanogram/updateProductListChangesAgainstBrand", queryparam: false, data: true, auth: true},
    loadCategoryData: { ptype: "POST", url: basePath + "/service/masterPlanogram/loadCategoryData", queryparam: false, data: true, auth: true},
    loadSubCategoryData: { ptype: "POST", url: basePath + "/service/masterPlanogram/loadSubCategoryData", queryparam: false, data: true, auth: true},
    loadBrandData: { ptype: "POST", url: basePath + "/service/masterPlanogram/loadBrandData", queryparam: false, data: true, auth: true},
    loadCategoryCardsData: { ptype: "POST", url: basePath + "/service/masterPlanogram/loadCategoryCardsData", queryparam: false, data: true, auth: true},
    loadSubCategoryCardsData: { ptype: "POST", url: basePath + "/service/masterPlanogram/loadSubCategoryCardsData", queryparam: false, data: true, auth: true},
    loadBrandCardsData: { ptype: "POST", url: basePath + "/service/masterPlanogram/loadBrandCardsData", queryparam: false, data: true, auth: true},
    mostFrequentlyUsedFieldCount: { ptype: "POST", url: basePath + "/service/masterPlanogram/mostFrequentlyUsedFieldCount", queryparam: false, data: true, auth: true},
    saveMpProductChanges: { ptype: "POST", url: basePath + "/service/masterPlanogram/saveMpProductChanges", queryparam: false, data: true, auth: true},
    newProductCountsForBrands: { ptype: "GET", url: basePath + "/service/masterPlanogram/newProductCountsForBrands", queryparam: true, data: false, auth: true},
    updateProductType: { ptype: "POST", url: basePath + "/service/dbDataPrePreparation/updateProductType", queryparam: false, data: true, auth: true},
    saveSimulationSnapshot: { ptype: "POST", url: basePath + "/service/masterPlanogram/heavyProcess/saveSimulationSnapshot", queryparam: false, data: true, auth: true},
    updateMpSnapShot: { ptype: "POST", url: basePath + "/service/masterPlanogram/updateMpSnapShot", queryparam: false, data: true, auth: true},
    clearSimulationSnapshot: { ptype: "GET", url: basePath + "/service/masterPlanogram/clearSimulationSnapshot", queryparam: true, data: false, auth: true},
    saveComparePlanogramAndSimulation: { ptype: "POST", url: basePath + "/service/masterplanogram/comparePlanogramAndSimulation", queryparam: false, data: true, auth: true},

    searchMPProducts: { ptype: "POST", url: basePath + "/service/product/searchMPProducts", queryparam: false, data: true, auth: true},
    searchMPArchiveProducts: { ptype: "POST", url: basePath + "/service/product/searchMPArchiveProducts", queryparam: false, data: true, auth: true},
    updateRequiredDataOfProductFromMP: { ptype: "POST", url: basePath + "/service/product/updateRequiredDataOfProductFromMP", queryparam: false, data: true, auth: true},
    archiveProduct: { ptype: "POST", url: basePath + "/service/product/archiveProduct", queryparam: false, data: true, auth: true},
    sendProductToMP: { ptype: "POST", url: basePath + "/service/product/sendProductToMP", queryparam: false, data: true, auth: true},
    restoreProduct: { ptype: "POST", url: basePath + "/service/product/restoreProduct", queryparam: false, data: true, auth: true},
    getMPNewProductsCount: { ptype: "GET", url: basePath + "/service/product/getMPNewProductsCount", queryparam: false, data: false, auth: true},
    getCatelogImportCount: { ptype: "GET", url: basePath + "/service/fileReadAndImport/getCatelogImportCount", queryparam: false, data: false, auth: true},
    findProdByCategoryLevel: { ptype: "POST", url: basePath + "/service/product/findByCategoryLevel", queryparam: false, data: true, auth: true},
    getDefaultNewProductFilters: { ptype: "GET", url: basePath + "/service/product/getDefaultNewProductFilters", queryparam: true, data: false, auth: true},

   

    getCatelogImportStatusLog: { ptype: "POST", url: basePath + "/service/fileReadAndImport/getCatelogImportStatusLog", queryparam: false, data: true, auth: true},
    getCatelogFileImportErrorLog: { ptype: "POST", url: basePath + "/service/fileReadAndImport/getCatelogFileImportErrorLog", queryparam: false, data: true, auth: true},
    getCatelogImportStatusLogStat: { ptype: "POST", url: basePath + "/service/fileReadAndImport/getCatelogImportStatusLogStat", queryparam: false, data: true, auth: true},
    getFileImportErrorLogStats: { ptype: "POST", url: basePath + "/service/fileReadAndImport/getFileImportErrorLogStats", queryparam: false, data: true, auth: true},
    markAsResolvedErrorLog: { ptype: "POST", url: basePath + "/service/fileReadAndImport/markAsResolvedErrorLog", queryparam: false, data: true, auth: true},
    markAsApprovedErrorLog: { ptype: "POST", url: basePath + "/service/fileReadAndImport/markAsApprovedErrorLog", queryparam: false, data: true, auth: true},
    pickAndImportProductCatelogFiles: { ptype: "POST", url: basePath + "/service/fileReadAndImport/pickAndImportProductCatelogFiles", queryparam: false, data: false, auth: true},
    approveSubCategoryData: { ptype: "POST", url: basePath + "/service/fileReadAndImport/approveSubCategoryData", queryparam: false, data: true, auth: true},
    approveBrandData: { ptype: "POST", url: basePath + "/service/fileReadAndImport/approveBrandData", queryparam: false, data: true, auth: true},
    approveSupplierData: { ptype: "POST", url: basePath + "/service/fileReadAndImport/approveSupplierData", queryparam: false, data: true, auth: true},
    markAsUnresolvedErrorLog: { ptype: "POST", url: basePath + "/service/fileReadAndImport/markAsUnresolvedErrorLog", queryparam: false, data: true, auth: true},
    AddNewCategoryToDepartment:{ ptype: "POST", url: basePath+"/service/master/saveCategory", queryparam: false, data: true, auth: true },
    AddNewSubCategoryToCategory:{ ptype: "POST", url: basePath+"/service/master/SaveSubCategory", queryparam: false, data: true, auth: true },
    approveDepartmentImportUpdate:{ ptype: "POST", url: basePath+"/service/master/approveDepartmentImportUpdate", queryparam: false, data: true, auth: true },
    approveCategoryImportUpdate:{ ptype: "POST", url: basePath+"/service/master/approveCategoryImportUpdate", queryparam: false, data: true, auth: true },
    approveSubCategoryImportUpdate:{ ptype: "POST", url: basePath+"/service/master/approveSubCategoryImportUpdate", queryparam: false, data: true, auth: true },
    findCategoryById:{ ptype: "GET", url: basePath+"/service/master/findCategoryById", queryparam: true, data: false, auth: true },
    findSubCategoryById:{ ptype: "GET", url: basePath+"/service/master/findSubCategoryById", queryparam: true, data: false, auth: true },
    approveSupplierImportUpdate:{ ptype: "POST", url: basePath+"/service/master/approveSupplierImportUpdate", queryparam: false, data: true, auth: true },
    approveBrandImportUpdate:{ ptype: "POST", url: basePath+"/service/master/approveBrandImportUpdate", queryparam: false, data: true, auth: true },
    findProducByIdForImportApprove:{ ptype: "GET", url: basePath+"/service/product/findProducByIdForImportApprove", queryparam: true, data: false, auth: true },
    approveProductImportUpdate:{ ptype: "POST", url: basePath+"/service/product/approveProductImportUpdate", queryparam: false, data: true, auth: true },

    storeProductsFind: { ptype: "POST", url: basePath + "/service/storeproduct/findAll", queryparam: false, data: true, auth: true},
    storeProductSave: { ptype: "POST", url: basePath + "/service/storeproduct/save", queryparam: false, data: true, auth: true},
    storeProductUpdate: { ptype: "POST", url: basePath + "/service/storeproduct/update", queryparam: false, data: true, auth: true},
    storeProductDelete: { ptype: "POST", url: basePath + "/service/storeproduct/delete", queryparam: false, data: true, auth: true},

    loadHierachyIssues: { ptype: "GET", url: basePath + "/service/product/findHierachyIssue", queryparam: true, data: false, auth: true},
    loadHierachyIssueProducts: { ptype: "POST", url: basePath + "/service/product/findHierachyIssueProducts", queryparam: false, data: true, auth: true},
    resolveHierachyIssue: { ptype: "POST", url: basePath + "/service/product/resolveHierachyIssue", queryparam: false, data: true, auth: true},
    resolveCustomHierachyIssue: { ptype: "POST", url: basePath + "/service/product/customResolveHierachyIssue", queryparam: false, data: true, auth: true},
    importHierarchyIssueChangedLog: { ptype: "GET", url: basePath + "/service/product/importHierarchyIssueChangedLog", queryparam: true, data: false, auth: true},

    //bulk delete
    bulkDepartmentDelete:{ ptype: "POST", url: basePath+"/service/master/bulkDepartmentDelete", queryparam: false, data: true, auth: true },
    bulkCategoryDelete:{ ptype: "POST", url: basePath+"/service/master/bulkCategoryDelete", queryparam: false, data: true, auth: true },
    bulkCategoryParentUpdate:{ ptype: "POST", url: basePath+"/service/master/bulkCategoryParentUpdate", queryparam: false, data: true, auth: true },
    bulkSubCategoryParentUpdate:{ ptype: "POST", url: basePath+"/service/master/bulkSubCategoryParentUpdate", queryparam: false, data: true, auth: true },
    bulkSubCategoryDelete:{ ptype: "POST", url: basePath+"/service/master/bulkSubCategoryDelete", queryparam: false, data: true, auth: true },
    bulkUpdateLog: { ptype: "GET", url: basePath + "/service/product/bulkUpdateLog", queryparam: true, data: false, auth: true},
    ExcelImportbulkUpdateLog: { ptype: "GET", url: basePath + "/service/product/bulkIsBlockIsArchivedUpdateLog", queryparam: true, data: false, auth: true},
    

    //vmp rule section - watch tab
    getvmpIssueCount:{ ptype: "POST", url: basePath+"/service/masterPlanogram/vmpIssueCount", queryparam: false, data: true, auth: true },
    getvmpHierarchyIssues:{ ptype: "POST", url: basePath+"/service/masterPlanogram/vmpHierarchyIssues", queryparam: false, data: true, auth: true },
    vmpGetDepartmentProducts:{ ptype: "POST", url: basePath+"/service/masterPlanogram/vmpGetDepartmentProducts", queryparam: false, data: true, auth: true },
    vmpGetDepartmentNewProducts:{ ptype: "POST", url: basePath+"/service/masterPlanogram/vmpGetDepartmentNewProducts", queryparam: false, data: true, auth: true },
    vmpGetDepartmentArchivedProducts:{ ptype: "POST", url: basePath+"/service/masterPlanogram/vmpGetDepartmentArchivedProducts", queryparam: false, data: true, auth: true },
    
    loadDynamicColors:{ ptype: "POST", url: basePath+"/service/master/getDynamicColors", queryparam: false, data: true, auth: true },
    //dep cat stackable
    getBulkStackableApproval:{ ptype: "POST", url: basePath+"/service/product/getBulkStackableApproval", queryparam: false, data: true, auth: true },
    updateStackableByBulkMode:{ ptype: "POST", url: basePath+"/service/product/updateStackableByBulkMode", queryparam: false, data: true, auth: true },
    //simulation stackable
    bulkUpdateByProductClick:{ ptype: "POST", url: basePath+"/service/product/bulkUpdateByProductClick", queryparam: false, data: true, auth: true },
    productsNotInPlanogram:{ ptype: "POST", url: basePath+"/service/planogram/productsNotInPlanogram", queryparam: false, data: true, auth: true },
    getSearchableProducts:{ ptype: "POST", url: basePath+"/service/product/getSearchableProducts", queryparam: false, data: true, auth: true },
    //manual complance
    loadStoresByChainId:{ ptype: "GET", url: basePath+"/service/store/loadStoresByChainId", queryparam: true, data: false, auth: true },

    findDepartmentsByChainId:{ ptype: "GET", url: basePath+"/service/department/findDepartmentsByChainId", queryparam: true, data: false, auth: true },
    PlanogramStoreCopy:{ ptype: "POST", url: basePath+"/service/planogram/copyPlanogramIntoBranch", queryparam: false, data: true, auth: true },

    getOverrideGs1ProductInfo:{ ptype: "GET", url: basePath+"/service/product/getOverrideGs1ProductInfo", queryparam: true, data: false, auth: true },
    updateFromGs1ProductInfo:{ ptype: "POST", url: basePath+"/service/product/updateFromGs1ProductInfo", queryparam: false, data: true, auth: true },

     //AUi Impelementation
    getAutoImplementationInfo: { ptype: "POST", url: basePath + "/service/autoImplementation/autoImplementationInfo", queryparam: false, data: true, auth: true},
    getAUIConversionAvailability:{ ptype: "POST", url: basePath+"/service/autoImplementation/getAUIConversionAvailability", queryparam: false, data: true, auth: true },
    convertToAUIVersion:{ ptype: "POST", url: basePath+"/service/autoImplementation/convertToAUIVersion", queryparam: false, data: true, auth: true },
    markApproveDisconnect:{ ptype: "POST", url: basePath+"/service/autoImplementation/markApproveDisconnect", queryparam: false, data: true, auth: true },
    saveSimulationPositions:{ptype: "POST", url: basePath+"/service/autoImplementation/saveSimulationPositions", queryparam: false, data: true, auth: true },
    auiImplementation:{ptype: "POST", url: basePath+"/service/autoImplementation/auiImplementation", queryparam: false, data: true, auth: true },
    loadCurrentActiveFloorLayoutWithPositions:{ptype: "POST", url: basePath+"/service/autoImplementation/loadCurrentActiveFloorLayoutWithPositions", queryparam: false, data: true, auth: true },
    loadImplementingStores:{ptype: "POST", url: basePath+"/service/autoImplementation/loadImplementingStores", queryparam: false, data: true, auth: true },
    updateZeroFieldCountGroup:{ptype: "POST", url: basePath+"/service/autoImplementation/updateZeroFieldCountGroup", queryparam: false, data: true, auth: true },
    auiTakeBackAvailability:{ptype: "POST", url: basePath+"/service/autoImplementation/takeBackAvailability", queryparam: false, data: true, auth: true },
    auiTakeBack:{ptype: "POST", url: basePath+"/service/autoImplementation/takeBack", queryparam: false, data: true, auth: true },
    updateIsReset:{ptype: "POST", url: basePath+ "/service/masterPlanogram/updateIsReset", queryparam: false, data: true, auth: true },
    updateConDisJob:{ptype: "POST", url: basePath+ "/service/masterPlanogram/updateConDisJob", queryparam: false, data: true, auth: true },
    connectedStoreForDepartment: { ptype: "GET", url: basePath + "/service/product/connectedStoreForDepartment", queryparam: true, data: false, auth: true},

    bulkProductUpdate:{ptype: "POST", url: basePath+ "/service/product/bulkIsBlockIsArchivedupdate", queryparam: false, data: true, auth: true },

    implementationJobComplete: { ptype: "GET", url: basePath + "/service/masterPlanogram/implementationJobComplete", queryparam: true, data: false, auth: true},
    getComparisonChanges: { ptype: "POST", url: basePath + "/service/masterplanogram/getComparisonChanges", queryparam: false, data: true, auth: true},
    
    findNewProduct:{ptype: "POST", url: basePath+ "/service/product/findNewProduct", queryparam: false, data: true, auth: true },
    mpVersionList:{ptype: "POST", url: basePath+ "/service/masterPlanogram/versionList", queryparam: false, data: true, auth: true },
    applyNewProducts:{ptype: "POST", url: basePath+ "/service/product/applyNewProduct", queryparam: false, data: true, auth: true },
    countNewProducts:{ptype: "POST", url: basePath+ "/service/product/countNewProducts", queryparam: false, data: true, auth: true },
    loadReplaceProductList:{ptype: "POST", url: basePath+ "/service/product/loadReplaceProductList", queryparam: false, data: true, auth: true },
    cancelNewProduct:{ptype: "POST", url: basePath+ "/service/product/cancelNewProduct", queryparam: false, data: true, auth: true },
    findAristoNotificationProducts:{ptype: "POST", url: basePath+ "/service/product/findAristoNotificationProducts", queryparam: false, data: true, auth: true },
    findNewProductChangesLog:{ptype: "POST", url: basePath+ "/service/product/findNewProductChangesLog", queryparam: false, data: true, auth: true },
    findNewProductTestStartDateLog:{ptype: "POST", url: basePath+ "/service/master/findNewProductTestStartDateLog", queryparam: false, data: true, auth: true },
    findNewProductStartDate: { ptype: "GET", url: basePath + "/service/tempSyncRoutes/findNewProductStartDate", queryparam: true, data: false, auth: true},
    extendTestPeriod:{ptype: "POST", url: basePath+ "/service/product/extendTestPeriod", queryparam: false, data: true, auth: true },
    removeTestNewProduct:{ptype: "POST", url: basePath+ "/service/product/removeTestNewProduct", queryparam: false, data: true, auth: true },
    keepTestProduct:{ptype: "POST", url: basePath+ "/service/product/keepTestProduct", queryparam: false, data: true, auth: true },
    updateManuallyTestStartDate:{ptype: "POST", url: basePath+ "/service/product/updateManuallyTestStartDate", queryparam: false, data: true, auth: true },
    disconnectWarning:{ptype: "POST", url: basePath+ "/service/product/disconnectWarning", queryparam: false, data: true, auth: true },
    applyDisconnectWarning:{ptype: "POST", url: basePath+ "/service/product/applyDisconnectWarning", queryparam: false, data: true, auth: true },
    loadProfitAndSalesChartData:{ptype: "POST", url: basePath+ "/service/product/loadProfitAndSalesChartData", queryparam: false, data: true, auth: true },

    //map calls
    loadNewTestingProduct:{ptype: "POST", url: basePath+ "/service/product/loadNewTestingProduct", queryparam: false, data: true, auth: true },
    loadCountryList: { ptype: "GET", url: basePath + "/userManagement/service/chain/mapCountries", queryparam: true, data: false, auth: true},
    loadRegionsList: { ptype: "GET", url: basePath + "/userManagement/service/chain/mapRegions", queryparam: true, data: false, auth: true},
    loadCityList: { ptype: "GET", url: basePath + "/userManagement/service/chain/mapCities", queryparam: true, data: false, auth: true},
    loadStoresList: { ptype: "GET", url: basePath + "/userManagement/service/chain/mapStores", queryparam: true, data: false, auth: true},
    
    loadMapView:{ptype: "POST", url: basePath+ "/service/map/loadMapView", queryparam: false, data: true, auth: true },
    
    loadDepList:{ptype: "POST", url: basePath+ "/service/master/loadDepList", queryparam: false, data: true, auth: true },
    loadVersions:{ptype: "POST", url: basePath+ "/service/masterPlanogram/loadVersions", queryparam: false, data: true, auth: true },
    findSuggestionList:{ptype: "POST", url: basePath+ "/service/openSearch/findSuggestionList", queryparam: false, data: true, auth: true },
    findsalesProfit:{ptype: "POST", url: basePath+ "/service/openSearch/findsalesProfit", queryparam: false, data: true, auth: true },

    loadProposedProducts:{ptype: "POST", url: basePath+ "/service/planogram/loadProposedProducts", queryparam: false, data: true, auth: true },
    loadTrends: { ptype: "GET", url: basePath + "/service/map/loadTrends", queryparam: true, data: false, auth: true},
    
    loadChartData:{ptype: "POST", url: basePath+ "/service/product/loadChartData", queryparam: false, data: true, auth: true },
    getAristoNotificationOngoingProductCount:{ ptype: "GET", url: basePath+"/service/product/aristoNotificationOngoingProductCount", queryparam: false, data: false, auth: true },
    //cr excel import
    findProductInfoForImportedBarcode:{ptype: "POST", url: basePath+ "/service/planogram/findProductInfoForImportedBarcode", queryparam: false, data: true, auth: true },
    deleteImportedBarcodes:{ptype: "POST", url: basePath+ "/service/planogram/deleteImportedBarcodes", queryparam: false, data: true, auth: true },
    getPlgUsedProducts: { ptype: "GET", url: basePath + "/service/planogram/getPlgUsedProducts", queryparam: true, data: false, auth: true},
    saveImportedBarcodes:{ptype: "POST", url: basePath+ "/service/planogram/saveImportedBarcodes", queryparam: false, data: true, auth: true },
    getPlgImportedProdBarcodes: { ptype: "POST", url: basePath + "/service/planogram/getPlgImportedProdBarcodes", queryparam: false, data: true, auth: true },

    getProductList: { ptype: "POST", url: basePath + "/service/product/getProductList", queryparam: false, data: true, auth: true},
    updateProductStatusToOld: { ptype: "POST", url: basePath + "/service/product/updateProductStatusToOld", queryparam: false, data: true, auth: true},
    
    getProductSimulationSnapshotWarning:{ptype: "POST", url: basePath+ "/service/masterPlanogram/getProductSimulationSnapshotWarning", queryparam: false, data: true, auth: true },
    acknowledgeSimulationWarning:{ptype: "POST", url: basePath+ "/service/masterPlanogram/acknowledgeSimulationWarning", queryparam: false, data: true, auth: true },
    updateProductStatusToOldAndSendToDep:{ptype: "POST", url: basePath+ "/service/product/updateProductStatusToOldAndSendToDep", queryparam: false, data: true, auth: true },
    getfileImportQueueJob:{ptype: "POST", url: basePath+ "/service/fileReadAndImport/jobDetails", queryparam: false, data: true, auth: true },
    deleQueueJob:{ptype: "POST", url: basePath+ "/service/fileReadAndImport/deleteJob", queryparam: false, data: true, auth: true },
    
    //sim excel import
    deleteSimImportedBarcodes:{ptype: "POST", url: basePath+ "/service/masterPlanogram/deleteSimImportedBarcodes", queryparam: false, data: true, auth: true },
    saveSimImportedBarcodes:{ptype: "POST", url: basePath+ "/service/masterPlanogram/saveSimImportedBarcodes", queryparam: false, data: true, auth: true },
    getSimImportedProdBarcodes:{ptype: "POST", url: basePath+ "/service/masterPlanogram/getSimImportedProdBarcodes", queryparam: false, data: true, auth: true },

    //vmp watch panel resolve refresh
    findVMPResolvedProductLog:{ptype: "POST", url: basePath+ "/service/masterPlanogram/findVMPResolvedProductLog", queryparam: false, data: true, auth: true },
}

//error handle in backend calls
function errorHandler(err, showalerts, isMsgFromBE) {

    if(isMsgFromBE){

        if(err.validation){
            
            let codeMessage = i18n.t(err.validation.code);

            if(err.validation.msgParams && err.validation.msgParams.length > 0){
                
                let filledMessage = codeMessage.replace(/\[\$\]/g, () => err.validation.msgParams.shift());

                err.validation.type === "error" ? alertService.error(filledMessage) : alertService.warn(filledMessage);

            }else{
                err.validation.type === "error" ? alertService.error(codeMessage) : alertService.warn(codeMessage);
            }

        }else{
            alertService.error(i18n.t("SRV_SIDE_EXC"));
        }
        if (showalerts || (creserr && creserr.message && creserr.message.indexOf("Network Error") > -1)) {
            let isNetworkErr = (creserr && creserr.message && creserr.message.indexOf("Network Error") > -1);
            alertService.error(isNetworkErr?i18n.t("NETWORK_ERROR"):i18n.t("erroroccurred"));
        }
    } else {
        if (showalerts) {
            alertService.error(i18n.t("UNRECONIZED_ERROR"));
        }

    }

}
//validate acinput values
function validateObj(vobj, cobj) {
    var cvarr = (vobj&&Object.keys(vobj).length>0?Object.keys(vobj).map((key) => { return [key, vobj[key]]; }):[]);

    if (cvarr !== undefined && cvarr.length > 0) {
        if (cobj !== undefined) {
            for (let i = 0; i < cvarr.length; i++) {
                if(cvarr[i][1] && cvarr[i][1].constructor === String){
                    if(cvarr[i][1] && cvarr[i][1] !== "" && cobj.hasOwnProperty(cvarr[i][0])){
                        var vresp = validateSets(cvarr[i][0], cvarr[i][1], cobj[cvarr[i][0]]);
                        if (vresp.validatestate !== null) {
                            return { status: false, msg: vresp.validatemsg };
                        }
                    } else{
                        return {status:false,msg:"Required to fill "+cvarr[i][0]};
                    }
                } else if(cvarr[i][1] && cvarr[i][1].constructor === Object){
                    var coarr = (cvarr[i][1]&&Object.keys(cvarr[i][1]).length>0?Object.keys(cvarr[i][1]).map((key) => { return [key, cvarr[i][1][key]]; }):[]);
                    var cdobj = cobj[cvarr[i][0]];
                    for (let j = 0; j < coarr.length; j++) {
                        if(coarr[j][1] && coarr[j][1] !== "" && cdobj.hasOwnProperty(coarr[j][0])){
                            var voresp = validateSets(coarr[j][0], coarr[j][1], cdobj[coarr[j][0]]);
                            if (voresp.validatestate !== null) {
                                return { status: false, msg: voresp.validatemsg };
                            }
                        } else{
                            return {status:false,msg:"Required to fill "+cvarr[i][0]};
                        }
                    }
                } else if(cvarr[i][1] && cvarr[i][1].constructor === Array){
                    var cvoarr = cvarr[i][1];
                    var cvoobj = (cobj[cvarr[i][0]]?cobj[cvarr[i][0]]:{});

                    for (let l = 0; l < cvoarr.length; l++) {
                        var caoarr = [];
                        if(cvoarr[l]&&Object.keys(cvoarr[l]).length>0){
                            for (let key in cvoarr[l]) {
                                caoarr.push([key, cvoarr[l][key]]);
                            }
                        }
                        var caoobj = cvoobj[l];
                        for (let j = 0; j < caoarr.length; j++) {
                            if(caoarr[j][1] && caoarr[j][1] !== "" && caoobj.hasOwnProperty(coarr[j][0])){
                                var varesp = validateSets(caoarr[j][0], caoarr[j][1], caoobj[coarr[j][0]]);
                                if (varesp.validatestate !== null) {
                                    return { status: false, msg: varesp.validatemsg };
                                }
                            } else{
                                return {status:false,msg:"Required to fill "+cvarr[i][0]};
                            }
                        }
                    }
                }
            }
        } else {
            return { status: false, msg: "Data object not found" };
        }
    }
    return { status: true, msg: "" };
}

export { submitCollection, errorHandler, validateObj };
