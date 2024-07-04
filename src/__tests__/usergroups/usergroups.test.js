import { shallow, mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';

import { UserGroupsComponent } from '../../components/masterdata/usergroups/usergroups';

let props = {
    t: jest.fn(),
};
//check component loading without errors
it("users groups masterdata renders without crashing", () => {
    shallow(<UserGroupsComponent {...props} />);
});

var tabledatalist = [{0:"",1:"test group 1",2:""},{0:"",1:"test group 2",2:""}];
var oridatalist = [{page: 1, data:[{"storeId": 8,"storeName": "קייזר","storeUUID": "8","userFirstName": "worker","userId": 2,"userLastName": "worker last","userUUID": "2","rollName": "CEO","rollUUID": "1","systemMainRoleType": "CEO","regionId": 1,"regionName": "Northan","regionUUID": "1"}] }];

const wrapper = mount(<MemoryRouter><UserGroupsComponent {...props} /></MemoryRouter>);
const subcomponent = wrapper.find(UserGroupsComponent);
subcomponent.setState({ ftablebody: tabledatalist, isdataloaded: true, ismocktesting: true, toridata: oridatalist });
subcomponent.update();

//table data loading and rows click
describe("table data loads without errors", () => {
    //table data loading check
    it("table data loading", () => {
        expect(wrapper.find(".pdunit-content .filter-table tbody tr").length).toBe(2);
    });
    //table row click check
    it("table row click (edit mode) working without issues", () => {
        wrapper.find(".pdunit-content .filter-table tbody tr").at(0).simulate('click');
    });
});
//add new user
describe("add new user group works without errors", () => {
    it("add modal opening", () =>{
        subcomponent.instance().handleModalToggle();
        expect(subcomponent.state().showmodal).toBe(true);
    });
    it("add users to modal group users list", () =>{
        //mockusers
        var cusers = [{"userFirstName": "Worker","userLastName": "Emploer 2","userId": 25,
            "rollName": "Worker", "storeName": "Central branch 02", "regionName": "Central" },
          {"userFirstName": "Worker","userLastName": "Employer 3","userId": 26,
            "rollName": "Worker", "storeName": "קייזר", "regionName": "Northan"
        }];
        var selectusers = [{value: 25, label: "Worker 1"},{value: 26, label: "Worker 2"}];
        subcomponent.setState({ alluserslist: cusers, selectuserslist: selectusers });
        subcomponent.update();

        wrapper.find('.filter-searchselect').at(0).find("input").simulate('keyDown', { key: 'ArrowDown', keyCode: 40 });
        wrapper.find('MenuList Option').at(1).simulate("click");

        expect(wrapper.find("#modaluserslist .list-group-item").length).toBe(2);
        expect(wrapper.find("#modaluserslist .list-group-item").at(0).find("label").text()).toBe("Worker Employer 3");
    });
});

//check component snapshot without errors
/* it("user groups snapshot renders without crashing", () => {
    expect(wrapper).toMatchSnapshot();
}); */