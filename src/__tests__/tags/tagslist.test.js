import { shallow, mount } from 'enzyme';
import { TagsComponent } from '../../components/tags/tags';
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
    snapshallow = shallow(<TagsComponent {...props} />);
})

describe("tags masterdata table data loads without errors", () => {
    var deftabledata = [{"startIndex": 0,"maxResult": 0,"id": 19,"tagName": "Happy new year 2021"},{"startIndex": 0,"maxResult": 0,"id": 18,"tagName": "Christmas"}];
    var defalldata = [{ page: 1, data: deftabledata }];

    submitSets.mockReturnValue(Promise.resolve({ status: false, extra: null }));
    const wrapper = mount(<MemoryRouter><TagsComponent {...props} /></MemoryRouter>);
    const subwrapper = wrapper.find(TagsComponent);

    subwrapper.setState({ isnottesting: false, toridata: defalldata, ftablebody: deftabledata, totalresults: 2, isdataloaded: true });
    wrapper.update();
    
    it("tags masterdata table data renders", () => {
        expect(wrapper.find(".filter-table tbody tr").length).toBe(2);
        expect(wrapper.find(".filter-table tbody tr").at(1).find("td").at(3).text()).toBe("Christmas");
    });

    it("tags masterdata mock table loads without renders", () => {
        submitSets.mockReturnValue(Promise.resolve({ status: true, extra: deftabledata }));

        jest.spyOn(subwrapper.instance(), 'loadTableData');
        subwrapper.instance().handleTableSearch();

        expect(subwrapper.state().toridata.length).toBe(1);
        //expect(subwrapper.instance().loadTableData).toBeCalled();
    });

    it("tags masterdata click row works without errors", () => {
        wrapper.find(".filter-table tbody tr").at(1).simulate("click");
        wrapper.update();
        expect(wrapper.find("Modal.tagmodal-view").props().show).toBe(true);
    });

    it("change name and update without errors", () => {
        const testevent = { target: { value: "Christmas 2"}, which: 13 };
        subwrapper.instance().handleFilterObject(testevent,"tagName","enter");
    });

    it("update tag handle success without errors", () => {
        jest.spyOn(alertService, 'success');

        subwrapper.instance().handleTagSave({ status: true },2);
        expect(alertService.success).toBeCalled();
    });

    it("update tag handle error without errors", () => {
        jest.spyOn(alertService, 'error');

        subwrapper.instance().handleTagSave({ status: false, extra: "error" },2);
        expect(alertService.error).toBeCalled();
    });
    
    it("tags masterdata reset filters without errors", () => {
        jest.spyOn(subwrapper.instance(), 'handleTableSearch');
        subwrapper.instance().resetTableFilters();
        
        expect(subwrapper.state().sobj.startIndex).toBe(0);
        expect(subwrapper.instance().handleTableSearch).toBeCalled();
    });

    it("tags masterdata handle new link without errors", () => {
        jest.spyOn(subwrapper.instance(), 'defaultObjectLoad');
        subwrapper.instance().handleNewLink();
        
        expect(subwrapper.state().isedit).toBeFalsy();
        expect(subwrapper.instance().defaultObjectLoad).toBeCalled();
    });

    it("delete tag handle success without errors", () => {
        jest.spyOn(alertService, 'success');

        subwrapper.instance().handleTagDelete({ status: true });
        expect(alertService.success).toBeCalled();
    });

    it("delete tag handle error without errors", () => {
        jest.spyOn(alertService, 'error');

        subwrapper.instance().handleTagDelete({ status: false, extra: "error" });
        expect(alertService.error).toBeCalled();
    });
});

//check component snapshot without errors
/* it("tags snapshot renders without crashing", () => {
    expect(snapshallow).toMatchSnapshot();
}); */