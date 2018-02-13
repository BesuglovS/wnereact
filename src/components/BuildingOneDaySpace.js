import React, {Component} from 'react';
import App from '../containers/App'
import {Card, CardHeader, CardText} from 'material-ui/Card';
import DatePicker from 'material-ui/DatePicker';
import areIntlLocalesSupported from 'intl-locales-supported';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

let DateTimeFormat;
if (areIntlLocalesSupported(['ru', 'ru-RU'])) {
    DateTimeFormat = global.Intl.DateTimeFormat;
} else {
    const IntlPolyfill = require('intl');
    DateTimeFormat = IntlPolyfill.DateTimeFormat;
    require('intl/locale-data/jsonp/ru');
    require('intl/locale-data/jsonp/ru-RU');
}

class BuildingOneDaySpace extends Component {
    state = {
        buildingId: '',
        buildingsList:[],
        scheduleDate: new Date(),
        buildingSpace:[]
    }

    componentDidMount() {
        let buildingsAPIUrl = 'http://wiki.nayanova.edu/api.php?action=list&listtype=buildings';
        fetch(buildingsAPIUrl)
            .then((data) => data.json())
            .then((json) => {
                this.setState({
                    buildingsList: json
                })

                const buildingName = localStorage.getItem("buildingName");

                let b = json.filter(b => b.Name === buildingName)

                if (b.length > 0) {
                    let buildingId = b[0].BuildingId

                    this.selectedBuildingChanged(null, null, buildingId)
                }
            })
            .catch(function(error) {
                console.log(error)
            });
    }

    formatDate(date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    }

    updateSchedule(bId, dt) {
        let buildingId = (bId !== undefined) ? bId : this.state.buildingId;
        if (buildingId === "") return

        let date = (dt !== undefined) ? dt : this.state.scheduleDate;

        //http://wiki.nayanova.edu/new/api/api?action=dailyBuildingSchedule&date=2017-11-30&buildingId=1
        let dailyScheduleAPIUrl = 'http://wiki.nayanova.edu/new/api/api?action=dailyBuildingSchedule' +
            '&date=' + this.formatDate(date) +
            '&buildingId=' + buildingId;
        fetch(dailyScheduleAPIUrl)
            .then((data) => data.json())
            .then((json) => {
                if (json === "Занятий нет")
                {
                    json = []
                }

                this.setState({
                    buildingSpace: json
                })
            })
            .catch(function(error) {
                console.log(error)
            });
    }

    dateChanged(alwaysNull, date) {
        this.setState({
            scheduleDate: date
        })

        this.updateSchedule(this.state.buildingId, date)
    }

    selectedBuildingChanged (e, key, val) {
        let building = this.state.buildingsList.filter(b => b.BuildingId === val)

        if (building.length > 0) {
            localStorage.setItem("buildingName", building[0].Name);
        }

        this.setState({
            buildingId: val
        })

        this.updateSchedule(val, this.state.scheduleDate)
    }

    render () {
        const buildingsListItems = this.state.buildingsList.map((building) =>
            <MenuItem key={building.BuildingId}
                      value={building.BuildingId}
                      primaryText={building.Name}/>
        )

        let audListHeaders = null
        if (this.state.buildingSpace.audArray !== undefined) {
            audListHeaders = (this.state.buildingSpace.audArray.sort()
                .map((audName, index) =>(<td key={index}>{audName}</td>)))
        }

        let BuildingSpaceBody = null
        if (this.state.buildingSpace.table !== undefined) {
            BuildingSpaceBody = Object.keys(this.state.buildingSpace.table)
                .map((time, index) => {

                    let timeSpace = this.state.buildingSpace.table[time];

                    let timeauds = Object.keys(timeSpace).sort()
                        .map((audName, index) => {

                            let audLessons = this.state.buildingSpace.table[time][audName];

                            if (audLessons.length > 0) {
                                return (
                                    <td key={index} title={audLessons[0].title}>
                                        {audLessons[0].text}
                                    </td>
                                )
                            } else {
                                return (<td key={index}></td>)
                            }
                        });

                    console.log("timeSpace")
                    console.log(timeSpace)

                    return (
                        <tr key={index}>
                            <td>{time}</td>
                            {timeauds}
                        </tr>
                    )
                })
        }

        const BuildingSpace = (
            <div className="BuildingSpaceTableDiv">
                <table className="BuildingSpaceTable">
                    <tbody>
                    <tr>
                        <td>Время</td>
                        {audListHeaders}
                    </tr>
                    {BuildingSpaceBody}
                    </tbody>
                </table>
            </div>
        )

        return (
            <App>
                <div>
                    <Card>
                        <CardHeader
                            title="Занятость корпуса"
                            subtitle=""
                        />

                        <CardText>

                            <DatePicker
                                hintText="Выберите дату"
                                DateTimeFormat={DateTimeFormat}
                                autoOk={true}
                                cancelLabel="Отмена"
                                locale="ru"
                                container="inline"
                                value={this.state.scheduleDate}
                                onChange={this.dateChanged.bind(this)}
                            />

                            <SelectField
                                floatingLabelText="Выберите корпус"
                                value={this.state.buildingId}
                                onChange={this.selectedBuildingChanged.bind(this)}
                            >
                                {buildingsListItems}
                            </SelectField>

                        </CardText>

                    </Card>

                    <Card>
                        <CardText>
                            {BuildingSpace}
                        </CardText>
                    </Card>
                </div>
            </App>
        )
    }
}

export default BuildingOneDaySpace