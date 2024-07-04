import { shallow } from 'enzyme';
import Hierarchy from '../../../components/masterdata/hierarchy/hierarchy';


it("renders Regions without crashing", () => {
    shallow(<Hierarchy />);
});