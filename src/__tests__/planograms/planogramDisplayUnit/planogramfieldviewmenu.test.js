import { shallow, mount } from 'enzyme';
import {useTranslation} from 'react-i18next'

import ViewMenu from '../../../components/planograms/planDisplayUnit/viewContext';

jest.mock('react-i18next', () => ({
    useTranslation: () => {
      return {
        t: (str) => str,
      };
    },
}));

let defprodobj = {
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
};

let props = {
    xpos: 0, ypos: 0,
    isview: true,
    isRTL: "rtl",
    viewProd: defprodobj,
    handlclose: jest.fn(),
};

describe("planogram field active context menu data loads without errors", () => {
    const wrapper = shallow(<ViewMenu {...props} />);
    
    it("planogram field active context menu data renders", () => {
        expect(wrapper.find(".pdunit-prodview-menu #act_contextm_bcode").text()).toBe("7290013847386");
    });

    it("planogram field active context menu click without errors", () => {
        wrapper.find(".pdunit-prodview-menu .closelink").simulate("click");
    });
});