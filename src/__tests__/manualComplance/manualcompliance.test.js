import { shallow, mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';

import { submitSets } from '../../components/UiComponents/SubmitSets';
import { alertService } from '../../_services/alert.service';
import { ManualComplianceComponent } from '../../components/manualcompliance/manualcompliance';

let props = {
    t: jest.fn(),
    history: { listen: jest.fn(), push: jest.fn() },
    setManualComplianceId: jest.fn(),
};

jest.mock('../../components/UiComponents/SubmitSets');

it("manual complinace list renders without crashing", () => {
    submitSets.mockReturnValue(Promise.resolve({ status: false, extra: null }));
    shallow(<ManualComplianceComponent {...props} />);
});

describe("manual complinace table data loads without errors", () => {
    submitSets.mockReturnValue(Promise.resolve({ status: false, extra: null }));

    const wrapper = mount(<MemoryRouter><ManualComplianceComponent {...props} /></MemoryRouter>);
    const subwrapper = wrapper.find(ManualComplianceComponent);

    var deftabledata =[
        {"0": 2,"1": "00000002","2": "Planigo chain 4","3": "C-001_B01","4": "DP-02","5": 1,"6": "WO- UK-R-002_B07","7": "25-02-2022 11:04:18","8": "redo_requested"}
    ]
    var defalldata = [{ page: 1, data: deftabledata }];

    subwrapper.setState({ isnottesting: false, toridata: defalldata, ftablebody: deftabledata, totalresults: 2, isdataloaded: true });
    wrapper.update();
    
    it("manual complinace mock table data renders", () => {
        expect(wrapper.find(".filter-table tbody tr").length).toBe(1);
        expect(wrapper.find(".filter-table tbody tr").at(0).find("td").at(2).text()).toBe("Planigo chain 4");
    });
    it("chain filter state setting", () => {
    subwrapper.instance().handleMFilters({target:{value:"1"}},"chain");
    expect(subwrapper.state().sobj.chainId).toBe("1")
    })
    it("store filter state setting", () => {
        subwrapper.instance().handleMFilters({target:{value:"1"}},"store");
        expect(subwrapper.state().sobj.chainId).toBe("1")
    })
    it("department filter state setting", () => {
        subwrapper.instance().handleMFilters({target:{value:"1"}},"department");
        expect(subwrapper.state().sobj.chainId).toBe("1")
    })
    it("search click", () => {
        var saveob={chainId: "1",departmentId: "1",isReqPagination: true, maxResult: 8,startIndex: 0,storeId: "1"}
        subwrapper.instance().handleFilterObject({target:{value:"1"}},null,'click');
        expect(subwrapper.state().sobj).toEqual(saveob)
    })
    it("row click", () => {
        wrapper.find(".filter-table tbody tr").at(0).simulate("click");
    })
  
    
})