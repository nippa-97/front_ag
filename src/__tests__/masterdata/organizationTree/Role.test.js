import { shallow } from 'enzyme';
import Role from '../../../components/masterdata/hierarchy/Role';


it("renders Role without crashing", () => {
    shallow(<Role />);
});