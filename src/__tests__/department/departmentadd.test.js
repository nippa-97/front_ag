import { shallow, mount } from 'enzyme';
import { DepartmentDetailsComponent } from '../../components/departments/AddNew/addnew';
import { MemoryRouter } from 'react-router-dom';

import { submitSets } from '../../components/UiComponents/SubmitSets';
import { alertService } from '../../_services/alert.service';

let props = {
    t: jest.fn(),
    history: { listen: jest.fn(), push: jest.fn() },
    isRTL: "rtl",
};

jest.mock('../../components/UiComponents/SubmitSets');

it("departments masterdata add renders without crashing", () => {
    shallow(<DepartmentDetailsComponent {...props} />);
});

describe("departments masterdata save works without errors", () => {
    submitSets.mockReturnValueOnce(Promise.resolve({ status: false, extra: null }));
    var draftobj = {"startIndex": 0,"maxResult": 0,"departmentId": 12,"name": "DP-02","color": "#00a19d"};
    
    const wrapper = mount(<MemoryRouter><DepartmentDetailsComponent {...props} /></MemoryRouter>);
    const subwrapper = wrapper.find(DepartmentDetailsComponent);

    subwrapper.setState({ sobj: draftobj, isedit: true });
    wrapper.update();
    
    it("department masterdata loads renders", () => {
        expect(wrapper.find(".formcontrol-main AcInput").at(0).props().adefval).toBe("DP-02");
        expect(wrapper.find(".formcontrol-main AcInput").at(1).props().adefval).toBe("#00a19d");
    });

    it("update department handle success without errors", () => {
        jest.spyOn(alertService, 'success');

        subwrapper.instance().handleDeptSave({ status: true },2);
        expect(alertService.success).toBeCalled();
    });

    it("update department handle error without errors", () => {
        jest.spyOn(alertService, 'error');

        subwrapper.instance().handleDeptSave({ status: false, extra: "error" },2);
        expect(alertService.error).toBeCalled();
    });

    it("delete department handle success without errors", () => {
        jest.spyOn(alertService, 'success');

        subwrapper.instance().handleDeptDelete({ status: true });
        expect(alertService.success).toBeCalled();
    });

    it("delete department handle error without errors", () => {
        jest.spyOn(alertService, 'error');

        subwrapper.instance().handleDeptDelete({ status: false, extra: "error" });
        expect(alertService.error).toBeCalled();
    });
});

//check component snapshot without errors
/* it("department details snapshot renders without crashing", () => {
    const wrapper = mount(<MemoryRouter><DepartmentDetailsComponent {...props} /></MemoryRouter>);
    expect(wrapper).toMatchSnapshot();
}); */