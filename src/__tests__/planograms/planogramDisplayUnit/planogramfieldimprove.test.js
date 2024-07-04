import { shallow, mount } from 'enzyme';

import ImprovementProgress from '../../../components/planograms/planDisplayUnit/improvementProgress';

let props = {
    value: 33.5,
    dmode: true,
};

describe("planogram field impovements data loads without errors", () => {
    it("planogram field impovements loading without errors", () => {
        const wrapper = shallow(<ImprovementProgress {...props} />);
        
        expect(wrapper.find("#improveview-percnt").prop("value")).toBe(props.value);
    });
    it("planogram field minus impovements loading without errors", () => {
        props.value = -5.1;
        const wrapper = shallow(<ImprovementProgress {...props} />);
        
        expect(wrapper.find("#improveview-percnt").prop("value")).toBe(props.value);
    });
});