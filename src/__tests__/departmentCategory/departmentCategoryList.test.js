import { shallow, mount } from 'enzyme';
import { ChainDepartmentsComponent } from '../../components/chainDepartments/departments';
import { MemoryRouter } from 'react-router-dom';

import { submitSets } from '../../components/UiComponents/SubmitSets';
import { alertService } from '../../_services/alert.service';

let props = {
    t: jest.fn(),
    history: { listen: jest.fn(), push: jest.fn() },
    setDunitView: jest.fn(),
};

jest.mock('../../components/UiComponents/SubmitSets');

it("department category masterdata list renders without crashing", () => {
    submitSets.mockReturnValue(Promise.resolve({ status: false, extra: null }));
    shallow(<ChainDepartmentsComponent {...props} />);
});

describe("department category masterdata table data loads without errors", () => {
    submitSets.mockReturnValue(Promise.resolve({ status: false, extra: null }));

    const wrapper = mount(<MemoryRouter><ChainDepartmentsComponent {...props} /></MemoryRouter>);
    const subwrapper = wrapper.find(ChainDepartmentsComponent);

    var deftabledata = [
        {
            "startIndex": 0,
            "maxResult": 0,
            "categories": [],
            "isDelete": false,
            "isNew": false,
            "chainDepartmentId": 1,
            "departmentId": 118,
            "departmentName": "Cereal",
            "departmentColor": "#41bfc8",
            "displayName": "Test 1"
        },
        {
            "startIndex": 0,
            "maxResult": 0,
            "categories": [],
            "isDelete": false,
            "isNew": false,
            "chainDepartmentId": 5,
            "departmentId": 44,
            "departmentName": "Juices",
            "departmentColor": "#a60c99",
            "displayName": "Juices"
        }
    ];
    var defalldata = [{ page: 1, data: deftabledata }];

    subwrapper.setState({ isnottesting: false, toridata: defalldata, ftablebody: deftabledata, totalresults: 2, isdataloaded: true });
    wrapper.update();
    
    it("department category masterdata mock table data renders", () => {
        expect(wrapper.find(".filter-table tbody tr").length).toBe(2);
        expect(wrapper.find(".filter-table tbody tr").at(0).find("td").at(1).text()).toBe("0");
    });

    it("department category masterdata mock table loads without renders", () => {
        submitSets.mockReturnValueOnce(Promise.resolve({ status: true, extra: deftabledata }));

        jest.spyOn(subwrapper.instance(), 'loadTableData');
        subwrapper.instance().handleTableSearch();

        expect(subwrapper.state().toridata.length).toBe(1);
        //expect(subwrapper.instance().loadTableData).toBeCalled();
    });

    it("department category masterdata click row works without errors", () => {
        wrapper.find(".filter-table tbody tr").at(0).simulate("click");
    });

    it("change filter text and update without errors", () => {
        submitSets.mockReturnValueOnce(Promise.resolve({ status: true, extra: deftabledata }));

        const testevent = { target: { value: "Cereal"}, which: 13 };
        subwrapper.instance().handleFilterObject(testevent,"name","enter");
    });

    it("department category masterdata reset filters without errors", () => {
        submitSets.mockReturnValueOnce(Promise.resolve({ status: true, extra: deftabledata }));

        jest.spyOn(subwrapper.instance(), 'handleTableSearch');
        subwrapper.instance().resetTableFilters();
        
        expect(subwrapper.state().sobj.startIndex).toBe(0);
        expect(subwrapper.instance().handleTableSearch).toBeCalled();
    });

    it("department category masterdata handle new link without errors", () => {
        subwrapper.instance().handleNewLink();
    });
});
