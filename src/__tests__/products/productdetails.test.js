import { shallow, mount } from 'enzyme';
import { AddNewItemComponent } from '../../components/products/AddNew/addnew';
import { MemoryRouter } from 'react-router-dom';
import { submitSets } from '../../components/UiComponents/SubmitSets';

let props = {
    t: jest.fn(),
    history: { listen: jest.fn(), push: jest.fn() },
};

jest.mock('../../components/UiComponents/SubmitSets');

it("products masterdata add renders without crashing", () => {
    shallow(<AddNewItemComponent {...props} />);
});

const wrapper = mount(<MemoryRouter><AddNewItemComponent {...props} /></MemoryRouter>);
const subwrapper = wrapper.find(AddNewItemComponent);

describe("products masterdata save works without errors", () => {
    var draftobj = {"productImage": [],"id": 521,"width": 10,"height": 11.6,"uom": "cm","depth": 10,"barcode": "7290000355757","productSource": "direct","gs1Code": "","posMappingId": null,"lastPriceOfProduct": null,"productName": " טל וטרי עגבניות מרוסקות רגילות","brandName": "-"};
    
    subwrapper.setState({ sobj: draftobj, isedit: true });
    wrapper.update();
    
    it("products masterdata loads renders", () => {
        expect(wrapper.find(".form-subcontent input#brandnametxt").props().value).toBe("-");
        expect(wrapper.find(".form-subcontent input#barcodetxt").props().value).toBe("7290000355757");
    });

    it("products masterdata saves renders", () => {
        wrapper.find(".form-subcontent select#uomtxt").simulate('change', { target: { value: 'feet' } });
        wrapper.update();
        
        submitSets.mockResolvedValue(Promise.resolve({ status: true, extra: null }));
        wrapper.find("Button#updatebtn").simulate('click');
    });
});

//check component snapshot without errors
/* it("product details snapshot renders without crashing", () => {
    expect(wrapper).toMatchSnapshot();
}); */