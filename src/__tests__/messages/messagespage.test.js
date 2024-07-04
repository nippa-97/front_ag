import { shallow, mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';

import { MessagesComponent } from '../../components/messages/messages';

let props = {
    t: jest.fn(),
    isRTL: "RTL",
    history: { listen: jest.fn(), push: jest.fn() },
};

it("messages page renders without crashing", () => {
    shallow(<MessagesComponent {...props} />);
});

describe("messages page process without errors", () => {
    const wrapper = mount(<MemoryRouter><MessagesComponent {...props} /></MemoryRouter>);
    const subcomponent = wrapper.find(MessagesComponent);

    it("works without errors", () => {
        
    });

});

//check component snapshot without errors
/* it("messages page snapshot renders without crashing", () => {
    const wrapper = mount(<MemoryRouter><MessagesComponent {...props} /></MemoryRouter>);
    expect(wrapper).toMatchSnapshot();
}); */