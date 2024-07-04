import { shallow, mount } from 'enzyme';
import {useTranslation} from 'react-i18next'

import ContextMenu from '../../../components/planograms/planDisplayUnit/drawcontext';

jest.mock('react-i18next', () => ({
    useTranslation: () => {
      return {
        t: (str) => str,
      };
    },
}));

let defprodobj = { prod: {
    "productBlock": [],
    "id": 21160,
    "isDelete": false,
    "isNew": false,
    "f_uuid": "07ccb1e5-465a-4d0b-a155-fc9fcae90b2f",
    "productWidth": 40,
    "productHeight": 35,
    "productPadding": 0,
    "productDepth": 5,
    "productUom": "cm",
    "productFacingQty": 1,
    "productTotalQty": 1,
    "previousQty": 1,
    "productInfo": {
        "productImage": [],
        "id": 252,
        "width": 40,
        "height": 35,
        "uom": "cm",
        "depth": 5,
        "barcode": "7290013847386",
        "productSource": "gs1",
        "gs1Code": "7290013847386",
        "posMappingId": null,
        "lastPriceOfProduct": null,
        "productName": "140 גרם טונה 4% טבעי לייט",
        "brandName": "סטארקיסט",
        "imageId": 3290,
        "imageUrl": ""
    }
}
};

let props = {
    xpos: 0, ypos: 0,
    isview: true,
    isRTL: "rtl",
    isexpand: true,
    currentprod: defprodobj,
    handledeleteall: jest.fn(),
    handledelete: jest.fn(),
    handlexpand: jest.fn(),
    handlclose: jest.fn(),
};

it("planogram field context menu renders without crashing", () => {
    shallow(<ContextMenu {...props} />);
});

describe("planogram field context menu data loads without errors", () => {
    const wrapper = shallow(<ContextMenu {...props} />);
    
    it("planogram field context menu data renders", () => {
        expect(wrapper.find(".pdunit-prodcontext-menu #contextm_bcode").text()).toBe("7290013847386");
    });

    it("planogram field product handleclick deleteall works without errors", () => {
        jest.spyOn(props,"handledeleteall");
        wrapper.find(".pdunit-prodcontext-menu #contextm_deleteall").simulate("click");

        expect(props.handledeleteall).toBeCalled();
    });

    it("planogram field product handleclick delete works without errors", () => {
        jest.spyOn(props,"handledelete");
        wrapper.find(".pdunit-prodcontext-menu #contextm_delete").simulate("click");

        expect(props.handledelete).toBeCalled();
    });

    it("planogram field product handleclick expand works without errors", () => {
        jest.spyOn(props,"handlexpand");
        wrapper.find(".pdunit-prodcontext-menu #contextm_expand").simulate("click");

        expect(props.handlexpand).toBeCalled();
    });

    it("planogram field product handleclick close works without errors", () => {
        jest.spyOn(props,"handlclose");
        wrapper.find(".pdunit-prodcontext-menu #contextm_close").simulate("click");

        expect(props.handlclose).toBeCalled();
    });
});