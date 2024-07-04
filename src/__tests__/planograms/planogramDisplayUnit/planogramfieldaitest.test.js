import { shallow, mount } from 'enzyme';

import ViewAITest from '../../../components/planograms/planDisplayUnit/viewAITest';

import * as jsonformat1 from './testsamples/json_format_1.json';
import * as jsonformat2 from './testsamples/json_format_2.json';

let props = {
    t: jest.fn(),
    isRTL: "rtl",
    dmode: true,
    prodlist: [],
    saveobj: {},
    showview: true,
    handleview: jest.fn(),
    checkallowtoadd: jest.fn(),
};

describe("planogram field ai test data loads without errors", () => {
    const wrapper = shallow(<ViewAITest {...props} />);
    
    it("planogram field ai test without converting data renders", () => {
        wrapper.find(".jsontext-content").simulate("change", { target: { value: jsonformat2 } });
        wrapper.find("#tabsaitest-view").simulate("select", "t2");
        //
    });

    it("planogram field ai test json converting data renders", () => {
        wrapper.find("#mdlswitch").simulate("change");
        wrapper.find(".jsontext-content").simulate("change", { target: { value: jsonformat1 } });
        wrapper.find("#tabsaitest-view").simulate("select", "t2");
        //console.log(wrapper.find("#fieldaitest-view").debug());
    });
});