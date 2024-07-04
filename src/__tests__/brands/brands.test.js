import { shallow, mount } from 'enzyme';
import { BrandsComponent } from '../../components/brands/brands';
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
    snapshallow = shallow(<BrandsComponent {...props} />);
})

describe("brands masterdata table data loads without errors", () => {
    var deftabledata = [
            {"startIndex": 0,"maxResult": 0,"brandId": 1, "brandName":"b1", "supplierId":8,"supplierName":"s1","supplierCode":"s1"},
            {"startIndex": 0,"maxResult": 0,"brandId": 2, "brandName":"b2", "supplierId":2,"supplierName":"s2","supplierCode":"s2"}
        ];
    var defalldata = [{ page: 1, data: deftabledata }];

    submitSets.mockReturnValue(Promise.resolve({ status: false, extra: null }));
    const wrapper = mount(<MemoryRouter><BrandsComponent {...props} /></MemoryRouter>);
    const subwrapper = wrapper.find(BrandsComponent);

    subwrapper.setState({ isnottesting: false, toridata: defalldata, ftablebody: deftabledata, totalresults: 2, isdataloaded: true });
    wrapper.update();
    
    it("brands masterdata table data renders", () => {
        expect(wrapper.find(".filter-table tbody tr").length).toBe(2);
        expect(wrapper.find(".filter-table tbody tr").at(1).find("td").at(3).text()).toBe("b2");
    });

    it("brands masterdata mock table loads without renders", () => {
        submitSets.mockReturnValue(Promise.resolve({ status: true, extra: deftabledata }));

        jest.spyOn(subwrapper.instance(), 'loadTableData');
        subwrapper.instance().handleTableSearch();

        expect(subwrapper.state().toridata.length).toBe(0);
    });

    it("brands masterdata click row works without errors", () => {
        wrapper.find(".filter-table tbody tr").at(1).simulate("click");
        wrapper.update();
        expect(wrapper.find("Modal.tagmodal-view").props().show).toBe(true);
    });

    it("change name and update without errors", () => {
        const testevent = { target: { value: "supplier 1"}, which: 13 };
        subwrapper.instance().handleFilterObject(testevent,"supplierName","enter");
    });

    it("update brands handle success without errors", () => {
        jest.spyOn(alertService, 'success');

        subwrapper.instance().handleBrandSave({ status: true },2);
        expect(alertService.success).toBeCalled();
    });

    it("update brands handle error without errors", () => {
        jest.spyOn(alertService, 'error');

        subwrapper.instance().handleBrandSave({ status: false, extra: "error" },2);
        expect(alertService.error).toBeCalled();
    });
    
    it("brands masterdata reset filters without errors", () => {
        jest.spyOn(subwrapper.instance(), 'handleTableSearch');
        subwrapper.instance().resetTableFilters();
        
        expect(subwrapper.state().sobj.startIndex).toBe(0);
        expect(subwrapper.instance().handleTableSearch).toBeCalled();
    });

    it("brands masterdata handle new link without errors", () => {
        jest.spyOn(subwrapper.instance(), 'defaultObjectLoad');
        subwrapper.instance().handleNewLink();
        
        expect(subwrapper.state().isedit).toBeFalsy();
        expect(subwrapper.instance().defaultObjectLoad).toBeCalled();
    });

    it("delete brands handle success without errors", () => {
        jest.spyOn(alertService, 'success');

        subwrapper.instance().handleBrandDelete({ status: true });
        expect(alertService.success).toBeCalled();
    });

    it("delete brands handle error without errors", () => {
        jest.spyOn(alertService, 'error');

        subwrapper.instance().handleBrandDelete({ status: false, extra: "error" });
        expect(alertService.error).toBeCalled();
    });
});