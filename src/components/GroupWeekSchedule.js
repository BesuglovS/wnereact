import React, {Component} from 'react';
import App from '../containers/App'
import {Card, CardHeader, CardText} from 'material-ui/Card';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import moment from 'moment'
import 'moment/locale/ru';

class GroupWeekSchedule extends Component {
    state = {
        groupId: '',
        groupsList:[],
        weeks: [1],
        groupSchedule:[],
        semesterStarts: null
    }

    styles = {
        groupsListWidth : {
            width: "380px"
        },
        weeksListWidth : {
            width: "380px"
        }
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

        let configOptionsUrl = 'http://wiki.nayanova.edu/api.php?action=list&listtype=configOptions';
        fetch(configOptionsUrl)
            .then((data) => data.json())
            .then((json) => {
                let ss = json.filter(i => i["Key"] === "Semester Starts")
                if (ss.length > 0) {
                    let semesterString = ss[0].Value;
                    let momentSemesterStarts = moment(semesterString).startOf('isoweek')

                    this.setState({
                        semesterStarts: momentSemesterStarts
                    })

                    let momentNow = moment();
                    let days = momentNow.diff(momentSemesterStarts, 'days')
                    let weekNum = Math.floor(days / 7) + 1

                    this.setState({
                        weeks: [weekNum]
                    })

                    this.selectedWeekChanged(null, null, weekNum)
                }
            })
            .catch(function(error) {
                console.log(error)
            });
    }

    updateSchedule(groupId, weeks) {

        console.log("weeks")
        console.log(weeks)

        let gId = (groupId !== undefined) ? groupId : this.state.groupId;
        let w = (weeks !== undefined) ? weeks : this.state.weeks;
        if (gId === "") return
        //http://wiki.nayanova.edu/api.php?action=weekSchedule&groupId=1&week=2
        let weekSchedule =
            'http://wiki.nayanova.edu/api.php?action=weekSchedule&groupId=' + gId +
            '&week=' + w.join("|");
        fetch(weekSchedule)
            .then((data) => data.json())
            .then((json) => {

                let result = []

                let olddow = -1;
                let currentDowLessons = [];
                for(let i = 0; i < json.length; i++) {
                    let lesson = json[i];

                    if ((lesson.dow !== olddow) && (i !== 0)) {
                        result.push(currentDowLessons)
                        currentDowLessons = []
                    }

                    currentDowLessons.push(lesson)

                    olddow = lesson.dow;
                }
                if (currentDowLessons.length > 0) {
                    result.push(currentDowLessons)
                }

                this.setState({
                    groupSchedule: result
                })
            })
            .catch(function(error) {
                console.log(error)
            });
    }

    selectedWeekChanged(e, key, val) {
        if (!Array.isArray(val)) {
            val = [val]
        }

        this.setState({
            weeks: val
        })

        this.updateSchedule(this.state.groupId, val)
    }

    selectedGroupChanged (e, key, val) {
        localStorage.setItem("groupId", val);

        this.setState({
            groupId: val
        })

        this.updateSchedule(val, this.state.weeks)
    }

    render() {
        const weeks = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18]
            .map((week) => {
                    let weekLabel =
                        (this.state.semesterStarts !== null) ?
                            (this.state.weeks.length > 1) ?
                                (week) :
                                ((week + "  ( " +
                                this.state.semesterStarts.clone().add(week-1, 'week').locale('ru').format('DD MMMM YYYY') + " - " +
                                this.state.semesterStarts.clone().add(week-1, 'week').add(6, 'days').locale('ru').format('DD MMMM YYYY')+ " )")) :
                            week

                    return (
                        <MenuItem key={week} value={week}
                                  primaryText={weekLabel}
                        />)
                }
            )


        const groupListItems = this.state.groupsList.map((group) =>
            <MenuItem key={group.StudentGroupId} value={group.StudentGroupId} primaryText={group.Name}/>
        )

        const WeekScheduleItems = this.state.groupSchedule
            .map((dowLessons, index) =>{
                let date = new Date(dowLessons[0].date)
                let dateString = moment(date).locale('ru').format('DD MMMM YYYY')
                let dowString = moment(date).locale('ru').format('dddd');

                const dayLessons = dowLessons
                    .map((lesson, index) =>{
                        return (
                            <tr key={index}>
                                <td>{lesson.Time.substr(0,5)}</td>
                                <td>
                                    {lesson.discName} <br />
                                    {lesson.FIO} <br />
                                    {lesson.groupName}

                                </td>
                                <td>{lesson.audName}</td>
                            </tr>
                        )
                    })

                return (
                    <Card key={index}>
                        <CardHeader
                            title={dateString}
                            subtitle={dowString}
                        />
                        <CardText>
                            <div className="groupScheduleTableDiv">
                                <table className="groupScheduleTable">
                                    <tbody>
                                    {dayLessons}
                                    </tbody>
                                </table>
                            </div>
                        </CardText>
                    </Card>)
            })

        const WeekScheduleWrapper =
            (this.state.groupSchedule.length === 0) ?
                (<h3>Занятий нет</h3>) :
                (<div>{WeekScheduleItems}</div>)

        return (
            <App>
                <div className="teacherScheduleDiv">
                    <Card>
                        <CardHeader
                            title="Расписание группы на неделю"
                            subtitle=""
                        />

                        <CardText>

                            <SelectField
                                style={ this.styles.groupsListWidth }
                                floatingLabelText="Выберите группу"
                                value={this.state.groupId}
                                onChange={this.selectedGroupChanged.bind(this)}
                            >
                                {groupListItems}
                            </SelectField>

                            <br />

                            <SelectField
                                multiple={true}
                                style={ this.styles.weeksListWidth }
                                floatingLabelText="Выберите неделю"
                                value={this.state.weeks}
                                onChange={this.selectedWeekChanged.bind(this)}
                            >
                                {weeks}
                            </SelectField>

                        </CardText>

                    </Card>

                    <Card>
                        <CardText>
                            {WeekScheduleWrapper}
                        </CardText>
                    </Card>
                </div>
            </App>
        )
    }
}

export default GroupWeekSchedule