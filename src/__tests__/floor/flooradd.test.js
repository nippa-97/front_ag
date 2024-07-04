import { shallow, mount } from 'enzyme';
import { FloorDetails } from '../../components/floors/floorDetails/FloorDetails';
import { MemoryRouter } from 'react-router-dom';
import { submitSets } from '../../components/UiComponents/SubmitSets';

let props = {
    t: jest.fn(),
    history: { listen: jest.fn(), push: jest.fn() },
};

jest.mock('../../components/UiComponents/SubmitSets');

it("floor masterdata add renders without crashing", () => {
    shallow(<FloorDetails {...props} />);
});

describe("floor masterdata save works without errors", () => {
    var draftobj = {"flowWidth": 100,"flowHeight": 50,"id": 58,"uom": "feet","svg": "<svg preserveAspectRatio=\"none\" xmlns=\"http://www.w3.org/2000/svg\" class=\"PDmap\" height=\"310\" width=\"620\" style=\"border: 2px solid rgb(204, 204, 204);\"><defs><pattern id=\"img1\" patternUnits=\"userSpaceOnUse\" width=\"620\" height=\"310\"><image x=\"0\" y=\"0\" width=\"620\" height=\"310\"></image></pattern></defs><rect fill=\"url(#img1)\" y=\"0\" x=\"0\" height=\"310\" width=\"620\"></rect></svg>","x": 0,"y": 0,"name": "test field 1","imageWidth": 0,"imageHeight": 0,"imageX": 0,"imageY": 0};
    
    const wrapper = mount(<MemoryRouter><FloorDetails {...props} /></MemoryRouter>);
    const subwrapper = wrapper.find(FloorDetails);
    subwrapper.setState({ sobj: draftobj, isedit: true });
    wrapper.update();
    
    it("floor masterdata loads renders", () => {
        expect(wrapper.find(".form-subcontent input#floornametxt").props().value).toBe("test field 1");
        expect(wrapper.find(".form-subcontent select#flooruomtxt").props().value).toBe("feet");
    });

    it("floor masterdata saves renders", () => {
        wrapper.find(".form-subcontent select#flooruomtxt").simulate('change', { target: { value: 'inches' } });
        wrapper.update();

        submitSets.mockResolvedValue(Promise.resolve({ status: true, extra: null }));
        wrapper.find("Button#btnupdatelink").simulate('click');
    });
});

//check component snapshot without errors
/* it("floor details snapshot renders without crashing", () => {
    const wrapper = mount(<MemoryRouter><FloorDetails {...props} /></MemoryRouter>);
    expect(wrapper).toMatchSnapshot();
}); */