import { shallow, mount } from 'enzyme';

import { ViewProposeList } from '../../../components/planograms/planDisplayUnit/viewProposeList';

let defprodlist = {
    removeItemArray: [
        {
            "applyStatus": "pending",
            "itemBarcode": "7290000355757",
            "itemId": 521,
            "productWidth": 10,
            "productDepth": 10,
            "productUom": "cm",
            "productHeight": 11.6,
            "productBrand": "-",
            "itemName": " טל וטרי עגבניות מרוסקות רגילות",
            "saleQty": 0,
            "suggestedApplyDate": "2021-12-24T10:48:50.246Z",
            "suggestedDate": "2021-12-24T10:48:50.246Z",
            "suggestedFor": "field",
            "suggestedType": "product_remove",
            "productTotalFacingQty": 6,
            "productTotalRevenue": 0,
            "productRevenuePerFacing": null,
            "salePerFacingDay": 0,
            "suggestedId": 0,
            "isNew": true,
            "itemImageUrl": ""
        },
        {
            "applyStatus": "pending",
            "itemBarcode": "7290112492777",
            "itemId": 1216,
            "productWidth": 9,
            "productDepth": 4,
            "productUom": "cm",
            "productHeight": 23.1,
            "productBrand": "פינוק",
            "itemName": "2 ב-1 שמפו ומרכך למניעת קשקשים",
            "saleQty": 0,
            "suggestedApplyDate": "2021-12-24T10:48:50.246Z",
            "suggestedDate": "2021-12-24T10:48:50.246Z",
            "suggestedFor": "field",
            "suggestedType": "product_remove",
            "productTotalFacingQty": 3,
            "productTotalRevenue": 0,
            "productRevenuePerFacing": null,
            "salePerFacingDay": 0,
            "suggestedId": 0,
            "isNew": true,
            "itemImageUrl": ""
        }
    ],
    addingItemArray: [{
        "applyStatus": "pending",
        "itemBarcode": "6111049003113",
        "itemId": 333,
        "productInfo": {},
        "productWidth": 20.1,
        "productDepth": 10,
        "productUom": "cm",
        "productHeight": 20,
        "productBrand": "-",
        "itemName": "4X ספיה סרדינים חריפים",
        "saleQty": 0,
        "suggestedApplyDate": "2021-12-24T10:50:30.300Z",
        "suggestedDate": "2021-12-24T10:50:30.300Z",
        "suggestedFor": "field",
        "suggestedType": "product_remove",
        "productTotalFacingQty": 5,
        "productTotalRevenue": 1700,
        "productRevenuePerFacing": 340,
        "salePerFacingDay": 340,
        "suggestedId": 0,
        "isNew": true,
        "itemImageUrl": ""
    }]
};

let props = {
    t: jest.fn(),
    isRTL: "rtl",
    loadedproposelist: defprodlist,
    drawRectCanvas: jest.fn(),
    dragStart: jest.fn(),
    handleprophighlight: jest.fn(),
    handleEscapeClear: jest.fn(),
    copytoclipboard: jest.fn(),
};

describe("planogram field propose product list data loads without errors", () => {
    const wrapper = shallow(<ViewProposeList {...props} />);
    
    it("planogram field propose product list loading without errors", () => {
        expect(wrapper.find(".remove-item").length).toBe(2);
        expect(wrapper.find(".add-item").length).toBe(1);
    });

    it("planogram field propose product list product draw canvas works without errors", () => {
        wrapper.find(".add-item").at(0).find(".thumb-view").simulate("mousedown");
        
        expect(props.drawRectCanvas).toBeCalled();
    });

    it("planogram field propose product list product remove hightlight works without errors", () => {
        wrapper.find(".remove-item").at(0).find(".props_high").simulate("click");
        
        expect(props.handleprophighlight).toBeCalled();
    });
});