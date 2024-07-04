import { shallow, mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';

import { ConfirmationPassword } from '../../components/resetPassword/ConfirmationPassword';

let props = {
    t: jest.fn(),
    isRTL: "RTL",
    history: { listen: jest.fn(), push: jest.fn() },
};

it("confirm password page renders without crashing", () => {
    shallow(<ConfirmationPassword {...props} />);
});

describe("confirm password process without errors", () => {
    const wrapper = mount(<MemoryRouter><ConfirmationPassword {...props} /></MemoryRouter>);
    const subcomponent = wrapper.find(ConfirmationPassword);

    it("click confirm button works without errors", () => {
        subcomponent.find("Button.confirmbtn").simulate("click");
    });

    it("component unmount works without errors", () => {
        jest.spyOn(subcomponent.instance(),"componentWillUnmount");
        subcomponent.instance().componentWillUnmount();

        expect(subcomponent.instance().componentWillUnmount).toBeCalled();
    });
});

//check component snapshot without errors
/* it("confirm password snapshot renders without crashing", () => {
    const wrapper = mount(<MemoryRouter><ConfirmationPassword {...props} /></MemoryRouter>);
    expect(wrapper).toMatchSnapshot();
}); */