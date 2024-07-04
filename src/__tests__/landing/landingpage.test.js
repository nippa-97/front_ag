import { shallow, mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import { LandingPage } from '../../components/landingPage/landingpage';

let props = {
    t: jest.fn(),
    isRTL: "rtl",
    setResetState: jest.fn(),
    handleLangObj: jest.fn(),
};
let preventDefault = jest.fn();

it("landing page renders without crashing", () => {
    shallow(<LandingPage {...props} />);
});

describe("landing page works without errors", () => {
    const wrapper = mount(<MemoryRouter><LandingPage {...props} /></MemoryRouter>);
    const subwrapper = wrapper.find(LandingPage);

    it("change language without errors", () => {
        const component = subwrapper.instance();
        component.handleLang(1, { preventDefault });
        wrapper.update();

        expect(subwrapper.state().selectedLang.code).toBe("he");
    });

    it("component unmount works without errors", () => {
        jest.spyOn(subwrapper.instance(),"componentWillUnmount");
        subwrapper.instance().componentWillUnmount();

        expect(subwrapper.instance().componentWillUnmount).toBeCalled();
    });
});


//check component snapshot without errors
/* it("landing page snapshot renders without crashing", () => {
    const wrapper = mount(<MemoryRouter><LandingPage {...props} /></MemoryRouter>);
    expect(wrapper).toMatchSnapshot();
}); */