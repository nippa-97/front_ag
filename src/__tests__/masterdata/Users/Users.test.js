import { shallow, mount } from 'enzyme';
import Users from '../../../components/masterdata/userManagemnt/Users';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from "react-redux";
import { store } from '../../../store/store';

const user = {
  name: "Adeneye David",
  email: "david@gmail.com",
  username: "Dave",
};

const signinDetails={
    userRolls:{
      storeName: "Store 9",
      storeUUID: "9",
      storeId: 9,
      name: "CEO",
      rank: 1,
      rollUUID: "1",
      systemMainRoleType: "CEO",
      uuid: "2",
      userLevel: "Chain",
    }
  }

it("Users Component renders without crashing", () => {
  shallow(<Users />);
});


describe("", () => {
  it("accepts users  props", () => {
    const wrapper = mount(<Router>  <Provider store={store}><Users signedDetails={signinDetails} /></Provider></Router>);
    var user=wrapper.find(Users);
    expect(user.props().signedDetails).toEqual(signinDetails);
  });

  

});