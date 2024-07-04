import React, { PureComponent } from 'react'
import Select from 'react-select'
import './searchbarMap.css'
import { Button, Col } from 'react-bootstrap'
import { XIcon } from '@primer/octicons-react'
class SearchbarMap extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            
        }
    }

    render() {
        let { allCountryList, allRegionsList, allCityList, allStoresList, mapFilters } = this.props;
        // console.log(mapFilters);

        return (<>
            <div className='searchbar-Map'>
                <div className='title'>{this.props.t("FILTERS")}</div>
                <div  className='filters' >
                    <Select 
                        placeholder="Select Country"
                        options={allCountryList}  
                        value={allCountryList.find(x => x.value === mapFilters.country)} 
                        onChange={e => this.props.handleChangeFilters(false, "country", e.value)}
                        className="filter-selec2" size="sm" classNamePrefix="searchselect-inner" 
                        maxMenuHeight={200}    
                    />
                    <Select 
                        placeholder="Select Region"
                        options={allRegionsList} 
                        value={allRegionsList.find(x => x.value === mapFilters.region)} 
                        onChange={e => this.props.handleChangeFilters(false, "region", e.value)}
                        className="filter-selec2" size="sm" classNamePrefix="searchselect-inner" 
                        maxMenuHeight={200}    
                    />
                    <Select 
                        placeholder="Select City"
                        options={allCityList} 
                        value={allCityList.find(x => x.value === mapFilters.city)} 
                        onChange={e => this.props.handleChangeFilters(false, "city", e.value)}
                        className="filter-selec2" size="sm" classNamePrefix="searchselect-inner" 
                        maxMenuHeight={200}    
                    />
                    <Select 
                        placeholder="Select Store"
                        options={allStoresList} 
                        value={allStoresList.find(x => x.value === mapFilters.store)}  
                        onChange={e => this.props.handleChangeFilters(false, "store", e.value)}
                        className="filter-selec2" size="sm" classNamePrefix="searchselect-inner" 
                        maxMenuHeight={200}    
                    />
                    <Button variant='default' className='reset-btn' onClick={() => this.props.handleChangeFilters(true)} size='sm'>Reset</Button>
                </div>
            </div>

            <Col className="mapfilter-taglist">
                <ul className='list-inline'>
                    {mapFilters.country !== -1?<li className='list-inline-item'>
                        {mapFilters.countryName} <span className='remove-link' onClick={() => this.props.handleChangeFilters(false, "country", -1)} ><XIcon size={14}/></span>
                    </li>:<></>}

                    {mapFilters.region !== -1?<li className='list-inline-item'>
                        {mapFilters.regionName} <span className='remove-link' onClick={() => this.props.handleChangeFilters(false, "region", -1)}><XIcon size={14}/></span>
                    </li>:<></>}

                    {mapFilters.city !== -1?<li className='list-inline-item'>
                        {mapFilters.cityName} <span className='remove-link' onClick={() => this.props.handleChangeFilters(false, "city", -1)}><XIcon size={14}/></span>
                    </li>:<></>}

                    {mapFilters.store !== -1?<li className='list-inline-item'>
                        {mapFilters.storeName} <span className='remove-link' onClick={() => this.props.handleChangeFilters(false, "store", -1)}><XIcon size={14}/></span>
                    </li>:<></>}
                </ul>
            </Col>
        </>)
    }
}

export default SearchbarMap