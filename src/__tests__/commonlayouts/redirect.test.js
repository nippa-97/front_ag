import { shallow, mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';

import { RedirectComponent } from '../../components/common_layouts/Redirect';

import { alertService } from '../../_services/alert.service';
import { grantPermission } from '../../_services/common.service';

jest.mock('../../_services/common.service');

let props = {
    t: jest.fn(),
    history: { listen: jest.fn(), push: jest.fn() },
    planogramState: null,
    taskFeedState: null,
    signedobj: null,
    setFieldView: jest.fn(),
    setPLanogramView: jest.fn(),
};

it("redirect page renders without crashing", () => {
    shallow(<RedirectComponent {...props} />);
});

function wrapperInit(props){
    const wrapper = mount(<MemoryRouter><RedirectComponent {...props} /></MemoryRouter>);
    const subwrapper = wrapper.find(RedirectComponent);

    return subwrapper;
}

describe("redirect page validations works without errors", () => {
    
    it("redirect state lading page redirect working without errors", () => {
        var landingprops = props;
        landingprops["planogramState"] = null;
        landingprops["taskFeedState"] = null;
        landingprops["signedobj"] = null;

        let subwrapper = wrapperInit(landingprops);
        subwrapper.instance().checkRedirectState();

        expect(subwrapper.instance().props.history.push).toBeCalledWith("/landing");
    });

    it("redirect state planogram display unit view isredirect working without errors", () => {
        var plgdunitprops = props;
        plgdunitprops["planogramState"] = { pgramFieldDetails: { isredirect: true } };

        let subwrapper = wrapperInit(plgdunitprops);
        subwrapper.instance().checkRedirectState();

        expect(subwrapper.instance().props.setFieldView).toBeCalled();
    });

    it("redirect state planogram display unit view isnotredirect working without errors", () => {
        var plgdlayoutprops = props;
        plgdlayoutprops["planogramState"] = { planogramDetails: { isnotsredirect: true } };

        let subwrapper = wrapperInit(plgdlayoutprops);
        subwrapper.instance().checkRedirectState();

        expect(subwrapper.instance().props.setPLanogramView).toBeCalled();
    });

    it("redirect state task redirect working without errors", () => {
        var taskprops = props;
        taskprops["planogramState"] = null;
        taskprops["taskFeedState"] = { tasktableDetails: { taskdetail: {} } };

        let subwrapper = wrapperInit(taskprops);
        subwrapper.instance().checkRedirectState();

        expect(subwrapper.instance().props.history.push).toBeCalledWith("/tasks");
    });

    var signinprops = props;
    signinprops["planogramState"] = null;
    signinprops["taskFeedState"] = null;
    signinprops["signedobj"] = { signinDetails: { } };

    let siginsubwrapper = wrapperInit(signinprops);

    it("redirect state sigin redirect denied working without errors", () => {
        grantPermission.mockReturnValueOnce(false);
        siginsubwrapper.instance().checkRedirectState();

        expect(siginsubwrapper.instance().props.history.push).toBeCalledWith("/signin");
    });

    it("redirect state sigin redirect planogram working without errors", () => {
        grantPermission.mockReturnValueOnce(true);
        siginsubwrapper.instance().checkRedirectState();

        expect(siginsubwrapper.instance().props.history.push).toBeCalledWith("/planograms");
    });

    it("redirect state sigin redirect task working without errors", () => {
        grantPermission.mockReturnValueOnce(false).mockReturnValueOnce(true);
        siginsubwrapper.instance().checkRedirectState();

        expect(siginsubwrapper.instance().props.history.push).toBeCalledWith("/tasks");
    });
});

//check component snapshot without errors
/* it("redirect snapshot renders without crashing", () => {
    const wrapper = mount(<MemoryRouter><RedirectComponent {...props} /></MemoryRouter>);
    expect(wrapper).toMatchSnapshot();
}); */