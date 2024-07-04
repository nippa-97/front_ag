import { shallow, mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';

import { NoMatchComponent } from '../../components/nomatch/nomatch';

let props = {
    t: jest.fn(),
    isRTL: "RTL",
    history: { listen: jest.fn(), push: jest.fn(), goBack: jest.fn() },
};

it("nomatch page renders without crashing", () => {
    shallow(<NoMatchComponent {...props} />);
});

describe("nomatch page process without errors", () => {
    const wrapper = mount(<MemoryRouter><NoMatchComponent {...props} /></MemoryRouter>);
    const subcomponent = wrapper.find(NoMatchComponent);

    it("goback works without errors", () => {
        subcomponent.find(".nomatch-content Button").simulate("click");

        expect(subcomponent.instance().props.history.goBack).toBeCalled();
    });

});

//check component snapshot without errors
/* it("nomatch page snapshot renders without crashing", () => {
    const wrapper = mount(<MemoryRouter><NoMatchComponent {...props} /></MemoryRouter>);
    expect(wrapper).toMatchSnapshot();
}); */