import { shallow, mount } from 'enzyme';
import { SubCategory } from '../../components/chainDepartments/AddNew/category';
import { MemoryRouter } from 'react-router-dom';

import { submitSets } from '../../components/UiComponents/SubmitSets';
import { alertService } from '../../_services/alert.service';

let props = {
    t: jest.fn(),
    history: { listen: jest.fn(), push: jest.fn() },
    setDunitView: jest.fn(),
    catobj:{id:1},
    depobj:{departmentId:1}
};

jest.mock('../../components/UiComponents/SubmitSets');

it("subcategory list renders without crashing", () => {
    submitSets.mockReturnValue(Promise.resolve({ status: false, extra: null }));
    shallow(<SubCategory {...props} />);
});

describe("subcategory table data loads without errors", () => {
    submitSets.mockReturnValue(Promise.resolve({ status: false, extra: null }));

    const wrapper = mount(<MemoryRouter><SubCategory {...props} /></MemoryRouter>);
    const subwrapper = wrapper.find(SubCategory);

    var deftabledata = [
        {
            isDelete: false,
            isNew: false,
            brands: [],
            categoryId: 1,
            subCategoryId: 1,
            subCategoryName: "sub1"
        },
        {
            isDelete: false,
            isNew: false,
            brands: [],
            categoryId: 2,
            subCategoryId:2,
            subCategoryName: "sub2"
        }
    ];
    var defalldata = [{ page: 1, data: deftabledata }];

    subwrapper.setState({ isnottesting: false, toridata: defalldata, ftablebody: deftabledata, totalresults: 2, isdataloaded: true });
    wrapper.update();
    
    it("subcategory mock table data renders", () => {
        expect(wrapper.find(".filter-table tbody tr").length).toBe(2);
        expect(wrapper.find(".filter-table tbody tr").at(0).find("td").at(1).text()).toBe("");
    });

    it("subcategory mock table loads without renders", () => {
        submitSets.mockReturnValueOnce(Promise.resolve({ status: true, extra: deftabledata }));

        jest.spyOn(subwrapper.instance(), 'loadTableData');
        subwrapper.instance().handleTableSearch();

        expect(subwrapper.state().toridata.length).toBe(1);
        //expect(subwrapper.instance().loadTableData).toBeCalled();
    });

    it("subcategory click row works without errors", () => {
        wrapper.find(".filter-table tbody tr").at(0).simulate("click");
    });

    it("change filter text and update without errors", () => {
        submitSets.mockReturnValueOnce(Promise.resolve({ status: true, extra: deftabledata }));

        const testevent = { target: { value: "Cereal"}, which: 13 };
        subwrapper.instance().handleFilterObject(testevent,"name","enter");
    });

    it("subcategory reset filters without errors", () => {
        submitSets.mockReturnValueOnce(Promise.resolve({ status: true, extra: deftabledata }));

        jest.spyOn(subwrapper.instance(), 'handleTableSearch');
        subwrapper.instance().resetTableFilters();
        
        expect(subwrapper.state().sobj.startIndex).toBe(0);
        expect(subwrapper.instance().handleTableSearch).toBeCalled();
    });

    it("subcategory handle new link without errors", () => {
        subwrapper.instance().initNewSubCatModal();
    });
});
