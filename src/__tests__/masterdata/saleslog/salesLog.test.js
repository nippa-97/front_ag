
import { shallow, mount } from 'enzyme'; 
import {SalesLog} from '../../../components/masterdata/salesLog/salesLog';
import { Provider } from "react-redux";
import { MemoryRouter } from 'react-router-dom';
let props = {
    t: jest.fn(),
    history: { listen: jest.fn(), push: jest.fn() },
    
};
it("SalesLog Component renders without crashing", () => {
    shallow(<SalesLog {...props} />);
});

describe("Feed table data loads without errors", () => {
    
    const wrapper = mount(<MemoryRouter><SalesLog {...props}  /></MemoryRouter>);
    const subwrapper = wrapper.find(SalesLog);
    

    it("syncnow works", () => {
        wrapper.find("#syncNow").at(0).simulate('click')
        expect(subwrapper.state().mTrrigerloading).toBe(true)
        subwrapper.setState({mTrrigerloading:false });
        wrapper.update()
    });
    it("force issue sync works", () => {
        wrapper.find("#forceIssueSync").at(0).simulate('click')
        expect(subwrapper.state().mTrrigerloading).toBe(true)
        subwrapper.setState({mTrrigerloading:false });
        wrapper.update()
    });
});