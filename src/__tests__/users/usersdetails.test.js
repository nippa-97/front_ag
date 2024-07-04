import { shallow, mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';

import { UserDetails } from '../../components/masterdata/userManagemnt/UserDetails';

let props = {
    t: jest.fn(),
    signedDetails: { signinDetails: { userRolls: {userLevel: "Chain"} } },
};
//check component loading without errors
it("users masterdata renders without crashing", () => {
    shallow(<UserDetails {...props} />);
});

var groupsdatalist = [{id:1,groupName:"test group 1"},{id:2, groupName:"test group 2"}];
var cuserobj = { firstName: 'John', lastName: 'Doelson', phone: '+9123453434', regionId: 1,
    roleId: -1, branchId: 1, isNew: false, isResetPassword: false, userLevel: '', password: 'XFe9', departments: [],
    userHasGroupDto: [ { id: 1, groupDto: [{id:2, groupName:"test group 2"}], isDelete: false, isNew: false } ]
}

const wrapper = mount(<MemoryRouter><UserDetails {...props} /></MemoryRouter>);
const subcomponent = wrapper.find(UserDetails);
subcomponent.setState({ usergroupslist: groupsdatalist });
subcomponent.update();

//user groups
describe("user groups loading and groups add works without errors", () => {
    //user groups data loading check
    it("user groups data loading", () => {
        expect(wrapper.find("#usergroups-select option").length).toBe(3); //with default option
    });
    //user groups add check
    it("add groups to new users without issues", () => {
        subcomponent.instance().handleGroupAdd(1);
        subcomponent.update();

        expect(wrapper.find(".usergroups-main Badge").length).toBe(1);
    });
    //viewing groups of edit user check
    it("viewing groups of edit users without issues", () => {
        subcomponent.setState({ sobj: cuserobj });
        subcomponent.update();
        
        expect(wrapper.find("FormControl#firstname-text").prop("value")).toBe('John');
        expect(wrapper.find(".usergroups-main Badge").length).toBe(1);
    });
    //remove groups of edit user check
    it("remove added groups of users without issues", () => {
        subcomponent.setState({ sobj: cuserobj });
        subcomponent.update();

        wrapper.find(".usergroups-main Badge").at(0).find(".remove-link").simulate("click");
        subcomponent.update();

        expect(wrapper.find(".usergroups-main Badge").length).toBe(0);
    });
});

//check component snapshot without errors
/* it("users snapshot renders without crashing", () => {
    expect(wrapper).toMatchSnapshot();
}); */