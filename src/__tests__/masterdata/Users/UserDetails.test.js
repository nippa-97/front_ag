import { shallow } from 'enzyme';
import UserDetails from '../../../components/masterdata/userManagemnt/UserDetails';


it("renders User Details without crashing", () => {
    shallow(<UserDetails />);
});