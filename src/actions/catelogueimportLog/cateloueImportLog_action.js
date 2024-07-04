import { CATELOUEIMPORT_COUNT_NOTIFI_SET, CATELOUEIMPORT_COUNT_SET } from "../../constants/catelogueImportLogTypes";


//new products counts object set
export const setCatelogimportCountAction = (payload) => {
    return {
      type: CATELOUEIMPORT_COUNT_SET,
      payload
    }
};
//new products redirect object set
export const setCatelogimportCountRedirectAction = (payload) => {
    return {
      type: CATELOUEIMPORT_COUNT_NOTIFI_SET,
      payload
    }
};