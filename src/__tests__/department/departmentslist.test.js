import { shallow, mount } from 'enzyme';
import { DepartmentsComponent } from '../../components/departments/departments';
import { MemoryRouter } from 'react-router-dom';

import { submitSets } from '../../components/UiComponents/SubmitSets';
import { alertService } from '../../_services/alert.service';

let props = {
    t: jest.fn(),
    history: { listen: jest.fn(), push: jest.fn() },
    setDunitView: jest.fn(),
};

jest.mock('../../components/UiComponents/SubmitSets');

it("departments masterdata list renders without crashing", () => {
    submitSets.mockReturnValue(Promise.resolve({ status: false, extra: null }));
    shallow(<DepartmentsComponent {...props} />);
});

describe("departments masterdata table data loads without errors", () => {
    submitSets.mockReturnValue(Promise.resolve({ status: false, extra: null }));

    const wrapper = mount(<MemoryRouter><DepartmentsComponent {...props} /></MemoryRouter>);
    const subwrapper = wrapper.find(DepartmentsComponent);

    var deftabledata = [{"startIndex": 0,"maxResult": 0,"departmentId": 12,"name": "DP-02","color": "#00a19d"},{"startIndex": 0,"maxResult": 0,"departmentId": 11,"name": "DP-01","color": "#00ff4c"}];
    var defalldata = [{ page: 1, data: deftabledata }];

    subwrapper.setState({ isnottesting: false, toridata: defalldata, ftablebody: deftabledata, totalresults: 2, isdataloaded: true });
    wrapper.update();
    
    it("departments masterdata mock table data renders", () => {
        expect(wrapper.find(".filter-table tbody tr").length).toBe(2);
        expect(wrapper.find(".filter-table tbody tr").at(0).find("td").at(2).text()).toBe("12");
    });

    it("departments masterdata mock table loads without renders", () => {
        submitSets.mockReturnValueOnce(Promise.resolve({ status: true, extra: deftabledata }));

        jest.spyOn(subwrapper.instance(), 'loadTableData');
        subwrapper.instance().handleTableSearch();

        expect(subwrapper.state().toridata.length).toBe(1);
        //expect(subwrapper.instance().loadTableData).toBeCalled();
    });

    it("departments masterdata click row works without errors", () => {
        wrapper.find(".filter-table tbody tr").at(0).simulate("click");
    });

    it("change filter text and update without errors", () => {
        submitSets.mockReturnValueOnce(Promise.resolve({ status: true, extra: deftabledata }));

        const testevent = { target: { value: "DP-02"}, which: 13 };
        subwrapper.instance().handleFilterObject(testevent,"name","enter");
    });

    it("departments masterdata reset filters without errors", () => {
        submitSets.mockReturnValueOnce(Promise.resolve({ status: true, extra: deftabledata }));

        jest.spyOn(subwrapper.instance(), 'handleTableSearch');
        subwrapper.instance().resetTableFilters();
        
        expect(subwrapper.state().sobj.startIndex).toBe(0);
        expect(subwrapper.instance().handleTableSearch).toBeCalled();
    });

    it("departments masterdata handle new link without errors", () => {
        subwrapper.instance().handleNewLink();
    });
});

//check component snapshot without errors
/* it("departments snapshot renders without crashing", () => {
    const wrapper = mount(<MemoryRouter><DepartmentsComponent {...props} /></MemoryRouter>);
    expect(wrapper).toMatchSnapshot();
}); */
