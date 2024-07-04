import { shallow, mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import { SignInComponent } from '../../components/signin/signin';

import { grantPermission } from '../../_services/common.service';

let props = {
    t: jest.fn(),
    isRTL: "RTL",
    setResetState: jest.fn(),
    removeFirebaseToken: jest.fn(),
    handleSignObj: jest.fn(),
    history: { listen: jest.fn(), push: jest.fn() },
};

jest.mock('../../_services/common.service');

it("signin page renders without crashing", () => {
    shallow(<SignInComponent {...props} />);
});

describe("signin process without errors", () => {
    const wrapper = mount(<MemoryRouter><SignInComponent {...props} /></MemoryRouter>);
    const subcomponent = wrapper.find(SignInComponent);

    const defaultobj = { username: "", password: "" };
    
    it("change username field works without errors", () => {
        defaultobj.username = "planigo@outlook.com";
        subcomponent.setState({ lobj: defaultobj });
        subcomponent.update();

        expect(wrapper.find(".mtd-form-field").at(0).find("input").prop("value")).toBe("planigo@outlook.com");
    });

    it("change password field works without errors", () => {
        defaultobj.password = "Test@123";
        subcomponent.setState({ lobj: defaultobj });

        expect(wrapper.find(".mtd-form-field").at(1).find("input").prop("value")).toBe("Test@123");
    });

    it("trigger enterkey password field works without errors", () => {
        //wrapper.find(".mtd-form-field").at(1).find("input").simulate('keypress', {key: 'Enter'});
        subcomponent.instance().handleEnterTrigger();
    });

    it("signin successfully handle without errors", () => {
        grantPermission.mockReturnValueOnce(true);
        subcomponent.instance().handleSignin({ status: true, extra: {} });

        expect(grantPermission).toBeCalled();
    });

    it("signin successfully handle task redirect without errors", () => {
        grantPermission.mockReturnValueOnce(false).mockReturnValueOnce(true);
        subcomponent.instance().handleSignin({ status: true, extra: {} });

        expect(grantPermission).toBeCalled();
    });

    it("signin successfully without permission handle without errors", () => {
        grantPermission.mockReturnValueOnce(false);
        subcomponent.instance().handleSignin({ status: true, extra: {} });

        expect(grantPermission).toBeCalled();
    });

    it("signin unsuccessfully handle without errors", () => {
        subcomponent.instance().handleSignin({ status: false, extra: null });
    });
});

//check component snapshot without errors
/* it("signin snapshot renders without crashing", () => {
    const wrapper = mount(<MemoryRouter><SignInComponent {...props} /></MemoryRouter>);
    expect(wrapper).toMatchSnapshot();
}); */