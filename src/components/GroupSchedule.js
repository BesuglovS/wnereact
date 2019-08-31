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

                const groupName = localStorage.getItem("groupName");
                let groups = json.filter(g => g.Name === groupName)

                if (groups.length > 0) {
                    let group = groups[0]

                    this.setState({ groupId: group.StudentGroupId });
                    this.selectedGroupChanged(null, null, group.StudentGroupId)
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

                if (json.length > 1) {
                    let prevTime = json[0].Time
                    let base = 0
                    let active = false;

                    for (let i = 1; i < json.length; i++) {
                        let item = json[i]
                        item.skipTime = false;
                        if (item.Time === prevTime) {
                            if (!active) {
                                active = true;
                                base = i - 1
                            }
                        } else {
                            if (active) {
                                active = false
                                json[base].Span = i-base
                                for (let j = base+1; j < i; j++) {
                                    json[j].skipTime = true;
                                }
                            }
                        }

                        prevTime = item.Time
                    }
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
        let groups = this.state.groupsList.filter(g => g.StudentGroupId === val)
        if (groups.length > 0) {
            localStorage.setItem("groupName", groups[0].Name);
        }

        this.setState({
            groupId: val
        })

        this.updateSchedule(val)
    }

    render() {
        const groupListItems = this.state.groupsList.map((group) =>
            <MenuItem key={group.StudentGroupId} value={group.StudentGroupId} primaryText={group.Name}/>
        )

        const groupLessons = (this.state.groupSchedule[0] !== undefined) ?
            (this.state.groupSchedule[0].Lessons.map((lesson, index) =>
            {
                let groupName = ""
                let groups = this.state.groupsList.filter(g => g.StudentGroupId === this.state.groupId)
                if (groups.length > 0) {
                    groupName = groups[0].Name
                }

                let groupString = ""
                let lessonGroupName = lesson.groupName
                if (lessonGroupName !== groupName) {
                    groupString = " (" + lessonGroupName + ")"
                }

                const boldStyle = {fontWeight: 700}

                return (
                    <tr key={index}>
                        {lesson.skipTime?
                            (null):
                            lesson.hasOwnProperty("Span")?
                                (<td rowSpan={lesson.Span}>{lesson.Time}</td>):
                                (<td>{lesson.Time}</td>)}
                        <td className="discNameAndFIO">
                            <span style={boldStyle}>{lesson.discName}</span> {groupString}<br />
                            {lesson.FIO}
                        </td>
                        <td className="audName">{lesson.audName}</td>
                    </tr>
                )
            }
        )) : {}

        let lessonsTableItems = (this.state.groupSchedule[0] !== undefined &&
            this.state.groupSchedule[0].Lessons !== undefined &&
            this.state.groupSchedule[0].Lessons.length !== 0) ? (
            <div className="groupScheduleTableDiv">
                <table className="groupScheduleTable">
                    <tbody>
                    {groupLessons}
                    </tbody>
                </table>
            </div>
        ) : (this.state.groupId !== '') ? <h2>Занятий нет</h2> : null

        return (
            <App>
                <div className="groupScheduleDiv">
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
                        <CardHeader
                            title="Расписание группы"
                            subtitle=""
                        />
                        <CardText>
                            {lessonsTableItems}
                        </CardText>
                    </Card>
                </div>
            </App>
        )
    }
}


export default GroupSchedule
