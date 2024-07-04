import { shallow, mount } from 'enzyme';
import { Floor } from '../../components/floors/Floors';
import { MemoryRouter } from 'react-router-dom';

let props = {
    t: jest.fn(),
    history: { listen: jest.fn(), push: jest.fn() },
};

it("floors masterdata list renders without crashing", () => {
    shallow(<Floor {...props} />);
});

const wrapper = mount(<MemoryRouter><Floor {...props} /></MemoryRouter>);
const subwrapper = wrapper.find(Floor);

describe("floors masterdata table data loads without errors", () => {
    var deftabledata = [{"startIndex": 0,"maxResult": 0,"id": 53,"name": "qa","width": 23,"height": 23,"uom": "meters"},{"startIndex": 0,"maxResult": 0,"id": 31,"name": "Store 9","width": 30,"height": 16,"uom": "meters","imageId": 1966,"imageUrl": "https://staging-res.s3.eu-west-3.amazonaws.com/temp/zN7e0VIAsTyOzqHs2SyiGfloorImage.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIARRBCRW2FIEQDSZOR%2F20211126%2Feu-west-3%2Fs3%2Faws4_request&X-Amz-Date=20211126T103534Z&X-Amz-Expires=604800&X-Amz-Signature=7d4031acb985da36569799ab9c1afb7149a7e17bcc50659dff48ebcdc04a08b9&X-Amz-SignedHeaders=host"}];
    var defalldata = [{ page: 1, data: deftabledata }];

    subwrapper.setState({ isnottesting: false, toridata: defalldata, ftablebody: deftabledata, totalresults: 2, isdataloaded: true });
    wrapper.update();
    
    it("floors masterdata mock table data renders", () => {
        expect(wrapper.find(".filter-table tbody tr").length).toBe(2);
        expect(wrapper.find(".filter-table tbody tr").at(0).find("td").at(3).text()).toBe("qa");
    });

    it("floors masterdata click row works without errors", () => {
        wrapper.find(".filter-table tbody tr").at(0).simulate("click");
    });
});

//check component snapshot without errors
/* it("floor list snapshot renders without crashing", () => {
    expect(wrapper).toMatchSnapshot();
}); */