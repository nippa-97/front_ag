import { shallow, mount } from 'enzyme';
import { Planograms } from '../../components/planograms/Planograms';
import { MemoryRouter } from 'react-router-dom';

import { submitSets } from '../../components/UiComponents/SubmitSets';

jest.mock('../../components/UiComponents/SubmitSets');

let props = {
    t: jest.fn(),
    history: { listen: jest.fn(), push: jest.fn() },
    setPLanogramdetailsView: jest.fn(),
    setFieldStore: jest.fn(),
    setPLanogramView:  jest.fn(),
};

it("planogram stores renders without crashing", () => {
    submitSets.mockReturnValueOnce(Promise.resolve({ status: false, extra: null }));
    shallow(<Planograms {...props} />);
});

describe("planogram stores table data loads without errors", () => {
    var deftabledata = [{"tags": [],"storeId": 32,"storeName": "C-001_B01","aisleVer": 0,"blockVer": 0,"fieldVer": 1,"flowLayoutVer": 0,"id": 0,"mainVersion": "0.2.1","productLocationVer": 0,"productVer": 0,"shelfVer": 0,"date": "2021-11-05T04:38:46.272Z","floorStatus": "ACTIVE"},
    {"tags": [],"storeId": 33,"storeName": "C-001_B02","aisleVer": 0,"blockVer": 0,"fieldVer": 1,"flowLayoutVer": 0,"id": 612,"mainVersion": "0.1.1","productLocationVer": 0,"productVer": 0,"shelfVer": 0,"date": "2021-11-05T05:07:21.846Z","floorStatus": "ACTIVE" }];
    var defalldata = [{ page: 1, data: deftabledata }];

    submitSets.mockReturnValueOnce(Promise.resolve({ status: false, extra: null }));
    const wrapper = mount(<MemoryRouter><Planograms {...props} /></MemoryRouter>);
    const subwrapper = wrapper.find(Planograms);
    subwrapper.setState({ isnottesting: false, toridata: defalldata, ftablebody: deftabledata, totalresults: 2, isdataloaded: true });
    wrapper.update();

    it("planogram stores mock table data renders", () => {
        expect(wrapper.find(".filter-table tbody tr").length).toBe(2);
        expect(wrapper.find(".filter-table tbody tr").at(0).find("td").at(1).text()).toBe("32");
    });

    it("planogram stores mock table loads without renders", () => {
        submitSets.mockReturnValueOnce(Promise.resolve({ status: true, extra: deftabledata }));

        jest.spyOn(subwrapper.instance(), 'loadTableData');
        subwrapper.instance().handleTableSearch();

        expect(subwrapper.state().toridata.length).toBe(1);
        //expect(subwrapper.instance().loadTableData).toBeCalled();
    });

    /* it("planogram stores click row without layout works without errors", () => {
        subwrapper.instance().handleRowClick(0);

        expect(subwrapper.instance().props.setFieldStore).toBeCalledWith(null);
    }); */

    it("planogram stores click row with layout works without errors", () => {
        subwrapper.instance().handleRowClick(1);

        expect(subwrapper.instance().props.setFieldStore).toBeCalledWith(33);
    });

    it("change filter text and update without errors", () => {
        submitSets.mockReturnValueOnce(Promise.resolve({ status: true, extra: deftabledata }));

        const testevent = { target: { value: "C-001"}, which: 13 };
        subwrapper.instance().handleFilterObject(testevent,"florName","enter");
    });

    it("planogram stores reset filters without errors", () => {
        submitSets.mockReturnValueOnce(Promise.resolve({ status: true, extra: deftabledata }));

        jest.spyOn(subwrapper.instance(), 'handleTableSearch');
        subwrapper.instance().resetTableFilters();
        
        expect(subwrapper.state().sobj.startIndex).toBe(0);
        expect(subwrapper.instance().handleTableSearch).toBeCalled();
    });

    it("planogram stores trigger reset filters without errors", () => {
        submitSets.mockReturnValueOnce(Promise.resolve({ status: true, extra: deftabledata }));

        jest.spyOn(subwrapper.instance(), 'handleTableSearch');
        subwrapper.instance().getTriggerSearch();
        
        expect(subwrapper.state().sobj.startIndex).toBe(0);
        expect(subwrapper.instance().handleTableSearch).toBeCalled();
    });

    it("planogram stores handle new link without errors", () => {
        subwrapper.instance().handleNewLink();

        expect(subwrapper.instance().props.setPLanogramView).toBeCalledWith(null);
    });

    it("planogram stores click row works without errors", () => {
        wrapper.find(".filter-table tbody tr").at(0).simulate("click");
    });

    it("check pagination page change existing page without errors", () => {
        jest.spyOn(subwrapper.instance(), 'handleTableSearch');

        subwrapper.setState({ sobj: { florName: "", isReqPagination: true, startIndex: 0, maxResult: 8 },
        totalresults: 20, toridata: [ {page: 1, data: deftabledata, totalPages: 3 } ] }, () => {
            subwrapper.instance().handlePageChange(1);

            //expect(subwrapper.instance().handleTableSearch).toBeCalled();
        });
    });
});