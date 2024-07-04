import {  SALE_LOG_WARNING_SET } from "../../constants/saleLogTypes";


//set question edit object
export const viewSaleWarningAction = (payload) => {
    return {
      type: SALE_LOG_WARNING_SET,
      payload
    }
};


