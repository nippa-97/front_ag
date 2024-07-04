import { shallow, mount } from 'enzyme';
import { ProductsComponent } from '../../components/products/products';
import { MemoryRouter } from 'react-router-dom';

let props = {
    t: jest.fn(),
    history: { listen: jest.fn(), push: jest.fn() },
};

it("products masterdata list renders without crashing", () => {
    shallow(<ProductsComponent {...props} />);
});

const wrapper = mount(<MemoryRouter><ProductsComponent {...props} /></MemoryRouter>);
const subwrapper = wrapper.find(ProductsComponent);

describe("products masterdata table data loads without errors", () => {
    var deftabledata = [{"productImage": [],"id": 1295,"uom": "cm","barcode": "1010101101010100011110101","productSource": "direct","productName": "Juice","brandName": "MD"},{"productImage": [],"id": 1294,"uom": "cm","barcode": "4005808779277","productSource": "gs1","productName": "NIVEA BODY LOTION - תחליב גוף לעור יבש מועשר בחמאת שיאה, 625 מל","brandName": "NIVEA"}];
    var defalldata = [{ page: 1, data: deftabledata }];

    subwrapper.setState({ isnottesting: false, toridata: defalldata, ftablebody: deftabledata, totalresults: 2, isdataloaded: true });
    wrapper.update();

    it("products masterdata mock table data renders", () => {
        expect(wrapper.find(".filter-table tbody tr").length).toBe(2);
        expect(wrapper.find(".filter-table tbody tr").at(0).find("td").at(1).text()).toBe("1295");
    });

    it("products masterdata click row works without errors", () => {
        wrapper.find(".filter-table tbody tr").at(0).simulate("click");
    });
});

//check component snapshot without errors
/* it("product list snapshot renders without crashing", () => {
    expect(wrapper).toMatchSnapshot();
}); */