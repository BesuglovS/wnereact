import React, {Component} from 'react';
import {MuiThemeProvider} from "material-ui";
import App from '../App'
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

class GroupSchedule extends Component {
    state = {
        groupId: '',
        groupsList:[],
        scheduleDate: new Date(),
        groupSchedule:[]
    }

    componentDidMount() {
        let mainGroupsAPIUrl = 'http://wiki.nayanova.edu/api.php?action=list&listtype=mainStudentGroups';
        fetch(mainGroupsAPIUrl)
            .then((data) => data.json())
            .then((json) => {
                this.setState({
                    groupsList: json
                })

                const groupId = localStorage.getItem("groupId");
                if (groupId) {
                    this.setState({ groupId: groupId });
                    this.selectedGroupChanged(null, null, groupId)
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

    updateSchedule(groupId) {
        let studentGroupId = (groupId !== undefined) ? groupId : this.state.groupId;
        if (studentGroupId === "") return
        //http://wiki.nayanova.edu/api.php?action=dailySchedule&groupId=84&date=2017-11-29
        let dailyScheduleAPIUrl = 'http://wiki.nayanova.edu/api.php?action=dailySchedule&groupId=' +
            studentGroupId +
            '&date=' + this.formatDate(this.state.scheduleDate);
        fetch(dailyScheduleAPIUrl)
            .then((data) => data.json())
            .then((json) => {
                if (json === "Занятий нет")
                {
                    json = []
                }

                this.setState({
                    groupSchedule: json
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

        this.updateSchedule()
    }

    selectedGroupChanged (e, key, val) {
        localStorage.setItem("groupId", val);

        this.setState({
            groupId: val
        })

        this.updateSchedule(val)
    }

    render() {
        const groupListItems = this.state.groupsList.map((group) =>
            <MenuItem key={group.StudentGroupId} value={group.StudentGroupId} primaryText={group.Name}/>
        )

        const groupLessons = this.state.groupSchedule.map((lesson, index) => (
            <tr key={index}>
                <td>{lesson.Time}</td>
                <td>
                    {lesson.discName} <br />
                    {lesson.FIO}
                </td>
                <td>{lesson.audName}</td>
            </tr>
        ))

        let lessonsTableItems = (this.state.groupSchedule.length !== 0) ? (
            <div className="groupScheduleTableDiv">
                <table className="groupScheduleTable">
                    <tbody>
                    {groupLessons}
                    </tbody>
                </table>
            </div>
        ) : (this.state.groupId !== '') ? <h2>Занятий нет</h2> : null

        return (
            <MuiThemeProvider>
                <App>
                    <div>
                        <Card>
                            <CardHeader
                                title="Расписание группы"
                                subtitle=""
                            />

                            <CardText>

                                <DatePicker
                                    hintText="Выберите дату занятий"
                                    DateTimeFormat={DateTimeFormat}
                                    autoOk={true}
                                    cancelLabel="Отмена"
                                    locale="ru"
                                    container="inline"
                                    value={this.state.scheduleDate}
                                    onChange={this.dateChanged.bind(this)}
                                />

                                <SelectField
                                    floatingLabelText="Выберите группу"
                                    value={this.state.groupId}
                                    onChange={this.selectedGroupChanged.bind(this)}
                                >
                                    {groupListItems}
                                </SelectField>

                            </CardText>

                        </Card>

                        <Card>
                            <CardText>
                                {lessonsTableItems}
                            </CardText>
                        </Card>
                    </div>
                </App>
            </MuiThemeProvider>
        )
    }
}


export default GroupSchedule