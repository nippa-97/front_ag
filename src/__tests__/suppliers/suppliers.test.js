import { shallow, mount } from 'enzyme';
import { SuppliersComponent } from '../../components/suppliers/suppliers';
import { MemoryRouter } from 'react-router-dom';

import { submitSets } from '../../components/UiComponents/SubmitSets';
import { alertService } from '../../_services/alert.service';

let props = {
    t: jest.fn(),
    history: { listen: jest.fn(), push: jest.fn() },
    setDunitView: jest.fn(),
};

jest.mock('../../components/UiComponents/SubmitSets');

var snapshallow;

beforeEach(() => {
    submitSets.mockReturnValue(Promise.resolve({ status: false, extra: null }));
    snapshallow = shallow(<SuppliersComponent {...props} />);
})

describe("suppliers masterdata table data loads without errors", () => {
    var deftabledata = [{"startIndex": 0,"maxResult": 0,"supplierId": 1,"supplierName":"A","supplierCode":"A1"},{"startIndex": 0,"maxResult": 0,"supplierId": 2,"supplierName":"B","supplierCode":"B1"}];
    var defalldata = [{ page: 1, data: deftabledata }];

    submitSets.mockReturnValue(Promise.resolve({ status: false, extra: null }));
    const wrapper = mount(<MemoryRouter><SuppliersComponent {...props} /></MemoryRouter>);
    const subwrapper = wrapper.find(SuppliersComponent);

    subwrapper.setState({ isnottesting: false, toridata: defalldata, ftablebody: deftabledata, totalresults: 2, isdataloaded: true });
    wrapper.update();
    
    it("suppliers masterdata table data renders", () => {
        expect(wrapper.find(".filter-table tbody tr").length).toBe(2);
        expect(wrapper.find(".filter-table tbody tr").at(1).find("td").at(3).text()).toBe("B");
    });

    it("suppliers masterdata mock table loads without renders", () => {
        submitSets.mockReturnValue(Promise.resolve({ status: true, extra: deftabledata }));

        jest.spyOn(subwrapper.instance(), 'loadTableData');
        subwrapper.instance().handleTableSearch();

        expect(subwrapper.state().toridata.length).toBe(0);
    });

    it("suppliers masterdata click row works without errors", () => {
        wrapper.find(".filter-table tbody tr").at(1).simulate("click");
        wrapper.update();
        expect(wrapper.find("Modal.tagmodal-view").props().show).toBe(true);
    });

    it("change name and update without errors", () => {
        const testevent = { target: { value: "supplier 1"}, which: 13 };
        subwrapper.instance().handleFilterObject(testevent,"supplierName","enter");
    });

    it("update suppliers handle success without errors", () => {
        jest.spyOn(alertService, 'success');

        subwrapper.instance().handleSupSave({ status: true },2);
        expect(alertService.success).toBeCalled();
    });

    it("update suppliers handle error without errors", () => {
        jest.spyOn(alertService, 'error');

        subwrapper.instance().handleSupSave({ status: false, extra: "error" },2);
        expect(alertService.error).toBeCalled();
    });
    
    it("suppliers masterdata reset filters without errors", () => {
        jest.spyOn(subwrapper.instance(), 'handleTableSearch');
        subwrapper.instance().resetTableFilters();
        
        expect(subwrapper.state().sobj.startIndex).toBe(0);
        expect(subwrapper.instance().handleTableSearch).toBeCalled();
    });

    it("suppliers masterdata handle new link without errors", () => {
        jest.spyOn(subwrapper.instance(), 'defaultObjectLoad');
        subwrapper.instance().handleNewLink();
        
        expect(subwrapper.state().isedit).toBeFalsy();
        expect(subwrapper.instance().defaultObjectLoad).toBeCalled();
    });

    it("delete suppliers handle success without errors", () => {
        jest.spyOn(alertService, 'success');

        subwrapper.instance().handleSupDelete({ status: true });
        expect(alertService.success).toBeCalled();
    });

    it("delete suppliers handle error without errors", () => {
        jest.spyOn(alertService, 'error');

        subwrapper.instance().handleSupDelete({ status: false, extra: "error" });
        expect(alertService.error).toBeCalled();
    });
});
