import { shallow, mount } from 'enzyme';
import { AddNewDepartment } from '../../components/chainDepartments/AddNew/addnewdep';
import { MemoryRouter } from 'react-router-dom';

import { submitSets } from '../../components/UiComponents/SubmitSets';
import { alertService } from '../../_services/alert.service';

let props = {
    t: jest.fn(),
    history: { listen: jest.fn(), push: jest.fn() },
    isRTL: "rtl",
};

jest.mock('../../components/UiComponents/SubmitSets');

describe("department category masterdata save works without errors", () => {
    submitSets.mockReturnValueOnce(Promise.resolve({ status: false, extra: null }));
    
    const wrapper = mount(<MemoryRouter><AddNewDepartment {...props} /></MemoryRouter>);
    const subwrapper = wrapper.find(AddNewDepartment);

    subwrapper.setState({ 
        isedit: false,
        sobj: {categoryName:"", isDelete: false, isNew: true, brands:[], maxResult:8,startIndex:0}, 
        cobj:{categoryName:"",isDelete:false,id:-1,isNew:true,subCategory:[]},
        currentPage:1,
        totalPages: 0,
        filtertxt:"",
        paginatedItems:[{categoryName:"cat01", isDelete: false, isNew: true, brands:[], maxResult:8,startIndex:0},{categoryName:"cat02", isDelete: false, isNew: true, brands:[], maxResult:8,startIndex:0}],
    });
    wrapper.update();
    
    it("category table data renders", () => {
        expect(wrapper.find(".filter-table tbody tr").length).toBe(2);
        expect(wrapper.find(".filter-table tbody tr").at(0).find("td").at(0).text()).toBe("cat01");
    });
    
});