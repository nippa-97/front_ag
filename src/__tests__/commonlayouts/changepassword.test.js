import { shallow, mount } from 'enzyme';
import { ProfileSettingsComponent } from '../../components/common_layouts/profilesettings';

import { submitSets } from '../../components/UiComponents/SubmitSets';
import { alertService } from '../../_services/alert.service';

var defuserobj = { "webNotificationToken": [], "mobileNotificationToken": [],"id": 20,"userUUID": "20","storeId": 9,"storeName": "Store 9","storeAddress": null,"storeTel": "0112121235","userRolls": {"storeName": "Store 9","storeUUID": "9","storeId": 9,"name": "CEO","rank": 1,"rollUUID": "1","systemMainRoleType": "CEO","uuid": "2","userLevel": "Chain"},"token": "","userDto": {"email": "planigoCeo@outlook.com","fName": "ceo","lName": "ceo last"}}

let props = {
    t: jest.fn(),
    history: { listen: jest.fn(), push: jest.fn() },
    setLogoutState: jest.fn(),
    handleSignObj: jest.fn(),
    signedDetails: { signinDetails: defuserobj },
};

jest.mock('../../components/UiComponents/SubmitSets');

it("profile settings renders without crashing", () => {
    shallow(<ProfileSettingsComponent {...props} />);
});

const wrapper = shallow(<ProfileSettingsComponent {...props} />);

it("profile settings details loading without errors", () => {
    expect(wrapper.find(".userprofile-container p").at(0).text()).toBe("ceo");
    expect(wrapper.find(".userprofile-container p").at(1).text()).toBe("ceo last");
});

describe("change password without errors", () => {
    it("opens edit password modal without errors", () => {
        var component = wrapper.instance();
        component.handleResetPwToggle();

        expect(wrapper.find(".reserpw-modal").prop("show")).toBeTruthy();
    });

    it("change password form fields without errors", () => {
        wrapper.find("#curpassword").simulate('change', { target: { value: '1234' } });
        wrapper.find("#newpassword").simulate('change', { target: { value: '2345' } });
        wrapper.find("#conpassword").simulate('change', { target: { value: '2345' } });

        expect(wrapper.state().sobj.oldPassword).toBe("1234");
        expect(wrapper.state().sobj.newPassword).toBe("2345");
    });

    it("reset password modal without errors", () => {
        wrapper.find("#resetpwbtn").simulate('click');

        expect(wrapper.find("#curpassword").prop("value")).toBe("");
        expect(wrapper.find("#newpassword").prop("value")).toBe("");
    });

    it("save passwords validate old password without errors", () => {
        jest.spyOn(alertService, 'error');

        submitSets.mockResolvedValueOnce(Promise.resolve({ status: true, extra: null }));
        wrapper.find("#updatepwbtn").simulate('click');

        expect(wrapper.state().sobj.oldPassword).toBe("");
        expect(alertService.error).toBeCalled();
    });

    it("save passwords validate new password without errors", () => {
        jest.spyOn(alertService, 'error');

        let mockobj = {oldPassword: "1234", newPassword: "", confirmPassword: ""};
        wrapper.setState({ sobj: mockobj }, () => {
            submitSets.mockResolvedValueOnce(Promise.resolve({ status: true, extra: null }));
            wrapper.find("#updatepwbtn").simulate('click');

            expect(wrapper.state().sobj.newPassword).toBe("");
            expect(alertService.error).toBeCalled();    
        });
    });

    it("save passwords validate confirm password without errors", () => {
        jest.spyOn(alertService, 'error');

        let mockobj = {oldPassword: "1234", newPassword: "2345", confirmPassword: ""};
        wrapper.setState({ sobj: mockobj }, () => {
            submitSets.mockResolvedValueOnce(Promise.resolve({ status: true, extra: null }));
            wrapper.find("#updatepwbtn").simulate('click');

            expect(wrapper.state().sobj.confirmPassword).toBe("");
            expect(alertService.error).toBeCalled();    
        });
    });

    it("save passwords validate old and new passwords equals without errors", () => {
        jest.spyOn(alertService, 'error');

        let mockobj = {oldPassword: "1234", newPassword: "1234", confirmPassword: "1234"};
        wrapper.setState({ sobj: mockobj }, () => {
            submitSets.mockResolvedValueOnce(Promise.resolve({ status: true, extra: null }));
            wrapper.find("#updatepwbtn").simulate('click');

            expect(wrapper.state().sobj.oldPassword).toBe(mockobj.newPassword);
            expect(alertService.error).toBeCalled();    
        });
    });

    it("save passwords validate new and confirm passwords equals without errors", () => {
        jest.spyOn(alertService, 'error');

        let mockobj = {oldPassword: "1234", newPassword: "2345", confirmPassword: "3456"};
        wrapper.setState({ sobj: mockobj }, () => {
            submitSets.mockResolvedValueOnce(Promise.resolve({ status: true, extra: null }));
            wrapper.find("#updatepwbtn").simulate('click');

            expect(wrapper.state().sobj.confirmPassword).not.toEqual(mockobj.newPassword);
            expect(alertService.error).toBeCalled();    
        });
    });

    it("save passwords error response without errors", () => {
        jest.spyOn(alertService, 'error');

        let mockobj = {oldPassword: "1234", newPassword: "2345", confirmPassword: "2345"};
        wrapper.setState({ sobj: mockobj }, () => {
            submitSets.mockResolvedValueOnce(Promise.resolve({ status: false, extra: "error" }));
            wrapper.find("#updatepwbtn").simulate('click');

            //expect(alertService.error).toBeCalledWith("error");    
        });
    });

    it("save passwords success response without errors", () => {
        jest.spyOn(alertService, 'success');

        submitSets.mockResolvedValueOnce(Promise.resolve({ status: true, extra: null }));
        wrapper.find("#updatepwbtn").simulate('click');

        /* expect(alertService.success).toBeCalled();  
        expect(wrapper.props.handleSignObj).toBeCalledWith(null);   */
    });
});

//check component snapshot without errors
/* it("change password snapshot renders without crashing", () => {
    expect(wrapper).toMatchSnapshot();
}); */