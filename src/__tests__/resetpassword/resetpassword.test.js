import { shallow, mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';

import { ResetPassword } from '../../components/resetPassword/ResetPassword';

let props = {
    t: jest.fn(),
    isRTL: "RTL",
    history: { listen: jest.fn(), push: jest.fn() },
};

it("reset password page renders without crashing", () => {
    shallow(<ResetPassword {...props} />);
});

describe("reset password process without errors", () => {
    const wrapper = mount(<MemoryRouter><ResetPassword {...props} /></MemoryRouter>);
    const subcomponent = wrapper.find(ResetPassword);

    it("component unmount works without errors", () => {
        jest.spyOn(subcomponent.instance(),"componentWillUnmount");
        subcomponent.instance().componentWillUnmount();

        expect(subcomponent.instance().componentWillUnmount).toBeCalled();
    });
});

//check component snapshot without errors
/* it("reset password snapshot renders without crashing", () => {
    const wrapper = mount(<MemoryRouter><ResetPassword {...props} /></MemoryRouter>);
    expect(wrapper).toMatchSnapshot();
}); */