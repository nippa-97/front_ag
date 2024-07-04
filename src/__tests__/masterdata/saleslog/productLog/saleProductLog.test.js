
import { shallow, mount } from 'enzyme'; 
import { MemoryRouter } from 'react-router-dom';
import {SaleProductLog} from '../../../../components/masterdata/salesLog/productlog/saleProductLog';
let props = {
    t: jest.fn(),
    history: { listen: jest.fn(), push: jest.fn() },
    
};
it("SaleProductLog Component renders without crashing", () => {
    shallow(<SaleProductLog {...props} />);
});

describe("Feed table data loads without errors", () => {
    
    const wrapper = mount(<MemoryRouter><SaleProductLog {...props}  /></MemoryRouter>);
    const subwrapper = wrapper.find(SaleProductLog);
    

    it("handleFilterDepartment function", () => {
        subwrapper.instance().handleFilterDepartment({target:{value:"10"}})
        subwrapper.instance().handleFilterProduct({target:{value:"test"}})
        // expect(subwrapper.state().mTrrigerloading).toBe(true)
        // subwrapper.setState({mTrrigerloading:false });
        // wrapper.update()
    });
    
});