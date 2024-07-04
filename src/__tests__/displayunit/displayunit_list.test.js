import { shallow, mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import { DisplayUnits } from '../../components/displayUnits/DisplayUnits';
import { submitSets } from '../../components/UiComponents/SubmitSets';

let props = {
    t: jest.fn(),
    history: { listen: jest.fn(), push: jest.fn() },
}

jest.mock('../../components/UiComponents/SubmitSets');

it("display units list renders without crashing", () => {
    submitSets.mockResolvedValue(Promise.resolve({ status: false, extra: null }));
    shallow(<DisplayUnits {...props} />);
});

describe("display units loads without errors", () => {
    var deftabledata = [{
        "shelf": [
            {"width": 250,"height": 20,"uom": "cm","gap": 5,"x": 0,"y": 0,"rank": 1,"id": 467,"reverseRowNumber": 7 },
            {"width": 250,"height": 40,"uom": "cm","gap": 5,"x": 0,"y": 30.76923076923077,"rank": 1,"id": 468,"reverseRowNumber": 6}
        ],"fieldName": "DU-0003","width": 250,"height": 325,"depth": 50,"uom": "cm","id": 92,"remark": ""
    },{
        "shelf": [
            {"width": 250,"height": 40,"uom": "cm","gap": 5,"x": 0,"y": 0,"rank": 1,"id": 389,"reverseRowNumber": 6}
        ],"fieldName": "MRT-DU-01","width": 250,"height": 280,"depth": 50,"uom": "cm","id": 79,"remark": ""
    }];
    var defalldata = [{ page: 1, data: deftabledata }];

    submitSets.mockResolvedValue(Promise.resolve({ status: false, extra: null }));
    const wrapper = mount(<MemoryRouter><DisplayUnits {...props} /></MemoryRouter>);
    const subwrapper = wrapper.find(DisplayUnits);
    subwrapper.setState({ isnottesting: false, toridata: defalldata, ftablebody: deftabledata, totalresults: 2, isdataloaded: true });
    wrapper.update();

    it("loads table list works without errors", () => {
        
    });

    it("table row click works without errors", () => {
        
    });
});