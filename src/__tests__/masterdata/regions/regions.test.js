import { shallow } from 'enzyme';
import Regions from '../../../components/masterdata/regions/regions';

it("renders Regions without crashing", () => {
    shallow(<Regions />);
});