import { SELECTED_MP_DETAILS, SELECTED_CATEGORY_DETAILS, SELECTED_CATEGORY_RECT, SELECTED_SUBCATEGORY_DETAILS, SELECTED_BRAND_DETAILS, MP_EDIT_ONE_CATEGORY_DETAILS,
  MP_CAT_DATA_CACHE, MP_CAT_NAVIGATE_CACHE, MP_SCAT_DATA_CACHE, MP_SCAT_NAVIGATE_CACHE, MP_BRAND_DATA_CACHE, MP_BRAND_NAVIGATE_CACHE, MP_LOADED_DEPARTMENTS, MP_STACKABLE_MARK_LIST, MP_VERSION_NAME, NEW_REFRESH, FILTER_DATES, 
  MP_DEPT_SEARCH, 
  MP_EDIT_STACK_HISTORY,
  MP_FULL_SCREEN_SAVE_RES,
  // MP_CACHE_CLIPBOARD_N_OTHERS,
  AUI_MD_REDIRECT, NEW_PROD_COUNT_CAT, NEW_PROD_COUNT_SUBCAT, AUI_CONVERTED_DETAILS ,AFFECTED_SIMULATIONS_MODAL_DATA, SIMULATION_PRODUCTSEARCH_DATA} from "../../constants/masterPlanogramTypes";

//set selected master planogram to redux
export const selectedMasterPlanSetAction = (payload) => {
    return {
      type: SELECTED_MP_DETAILS,
      payload
    }
  };

//set selected mp category to redux
export const selectedMPCategorySetAction = (payload) => {
  return {
    type: SELECTED_CATEGORY_DETAILS,
    payload
  }
};

//set selected mp category to redux
export const selectedMPCategoryRectSetAction = (payload) => {
  return {
    type: SELECTED_CATEGORY_RECT,
    payload
  }
};

//set selected mp sub category to redux
export const selectedMPSubCatSetAction = (payload) => {
  return {
    type: SELECTED_SUBCATEGORY_DETAILS,
    payload
  }
};

//set selected mp brand to redux
export const selectedMPBrandSetAction = (payload) => {
  return {
    type: SELECTED_BRAND_DETAILS,
    payload
  }
};
// one category edit chnages responcse set to redux
export const MPCategoryChangesSetAction = (payload) => {
  return {
    type: MP_EDIT_ONE_CATEGORY_DETAILS,
    payload
  }
};
// one category data cache responcse set to redux
export const mpCategoryDataCacheSetAction = (payload) => {
  return {
    type: MP_CAT_DATA_CACHE,
    payload
  }
};
// one category navigate cache responcse set to redux
export const mpCategoryNavCacheSetAction = (payload) => {
  return {
    type: MP_CAT_NAVIGATE_CACHE,
    payload
  }
};
// one sub category data cache responcse set to redux
export const mpSubCategoryDataCacheSetAction = (payload) => {
  return {
    type: MP_SCAT_DATA_CACHE,
    payload
  }
};
// one category nav cache responcse set to redux
export const mpSubCategoryNavCacheSetAction = (payload) => {
  return {
    type: MP_SCAT_NAVIGATE_CACHE,
    payload
  }
};
// one brand data cache responcse set to redux
export const mpBrandDataCacheSetAction = (payload) => {
  return {
    type: MP_BRAND_DATA_CACHE,
    payload
  }
};
// one brand nav cache responcse set to redux
export const mpBrandNavCacheSetAction = (payload) => {
  return {
    type: MP_BRAND_NAVIGATE_CACHE,
    payload
  }
};

// set first departments set to redux (from main department select page)
export const mpDepartmentsSetAction = (payload) => {
  return {
    type: MP_LOADED_DEPARTMENTS,
    payload
  }
};
// set first departments set to redux (from main department select page)
export const mpstackableMarkListAction = (payload) => {
  return {
    type: MP_STACKABLE_MARK_LIST,
    payload
  }
};

// set input value of the version name
export const mpVersionName = (payload) => {
  return {
    type: MP_VERSION_NAME,
    payload
  }
};

// set input value of the version name
export const filterDates = (payload) => {
  return {
    type: FILTER_DATES,
    payload
  }
};

export const newRefresh = (payload) => {
  return {
    type: NEW_REFRESH,
    payload
  }
};

// set department view search obj
export const mpDeptSearchSetAction = (payload) => {
  return {
    type: MP_DEPT_SEARCH,
    payload
  }
}

// set mp stack history 
export const mpEditStackHistorySetAction = (payload) => {
  return {
    type: MP_EDIT_STACK_HISTORY,
    payload
  }
}
// set after save fullscreen edit obj
export const mpAftersaveFullScreenObjSetAction = (payload) => {
  return {
    type: MP_FULL_SCREEN_SAVE_RES,
    payload
  }
}

// set cache of clip board and removed prods,added prods for redux array
// export const mpsetClipBoardandotherforCatSetAction = (payload) => {
//   return {
//     type: MP_CACHE_CLIPBOARD_N_OTHERS,
//     payload
//   }
// }

// set cache of clip board and removed prods,added prods for redux array
export const auiRedirectMDSetAction = (payload) => {
  return {
    type: AUI_MD_REDIRECT,
    payload
  }
}

//set newProdCounts of Levels
export const setNewProdCountCatAction = (payload) => {
  return {
    type: NEW_PROD_COUNT_CAT,
    payload
  }
}

export const setNewProdCountSubCatAction = (payload) => {
  return {
    type: NEW_PROD_COUNT_SUBCAT,
    payload
  }
}
export const AuiConvertedetailsSetAction = (payload) => {
  return {
    type: AUI_CONVERTED_DETAILS,
    payload
  }
}
export const AffectedSimulationModalSetAction = (payload) => {
  return {
    type: AFFECTED_SIMULATIONS_MODAL_DATA,
    payload
  }
}
export const SimulationNewProductSearchDetailsSetAction = (payload) => {
  return {
    type: SIMULATION_PRODUCTSEARCH_DATA,
    payload
  }
}