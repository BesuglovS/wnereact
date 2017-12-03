import React, {Component} from 'react';
import App from '../containers/App'
import {Card, CardHeader, CardText} from 'material-ui/Card';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Toggle from 'material-ui/Toggle';
import moment from 'moment'
import 'moment/locale/ru';

class GroupWeekSchedule extends Component {
    state = {
        groupId: '',
        groupsList:[],
        weeks: [1],
        groupSchedule:[],
        semesterStarts: null,
        severalWeeks: false,
        chooseWeekTip: "Выберите неделю"
    }

    styles = {
        groupsListWidth : {
            width: "100%"
        },
        weeksListWidth : {
            width: "100%"
        },
        toggle: {
            marginTop: 16,
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

                    this.selectedWeekChanged(null, null, weekNum)
                }
            })
            .catch(function(error) {
                console.log(error)
            });
    }

    updateSchedule(groupId, weeks) {
        let gId = (groupId !== undefined) ? groupId : this.state.groupId;
        let w = (weeks !== undefined) ?
            Array.isArray(weeks) ? weeks : [weeks] :
            Array.isArray(this.state.weeks) ? this.state.weeks : [this.state.weeks];
        if (gId === "") return
        //http://wiki.nayanova.edu/api.php?action=weekSchedule&groupId=1&week=2
        let weekSchedule =
            'http://wiki.nayanova.edu/api.php?action=weeksSchedule&groupId=' + gId +
            '&weeks=' + w.join("|");
        fetch(weekSchedule)
            .then((data) => data.json())
            .then((json) => {

                let r = []

                for (const weekNum in json) {
                    let result = []

                    let groupWeekSchedule = json[weekNum]

                    let olddow = -1;
                    let currentDowLessons = [];
                    for (let i = 0; i < groupWeekSchedule.length; i++) {
                        let lesson = groupWeekSchedule[i];

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

                    r.push(result)
                }

                this.setState({
                    groupSchedule: r
                })
            })
            .catch(function(error) {
                console.log(error)
            });
    }

    selectedWeekChanged(e, key, val, oneOrMany) {
        let severalWeeks = (oneOrMany === undefined) ?
            this.state.severalWeeks : (oneOrMany === 'many');

        if (!Array.isArray(val) && severalWeeks)
        {
            val = [val]
        }

        console.log("week changed")
        console.log(val)

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

        var weeks = Array.isArray(this.state.weeks) ? this.state.weeks : [this.state.weeks];

        this.updateSchedule(val, weeks)
    }

    render() {
        const weeks = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18]
            .map((week) => {
                var weeks = Array.isArray(this.state.weeks) ? this.state.weeks : [this.state.weeks];

                let weekLabel =
                    (this.state.semesterStarts !== null) ?
                        (weeks.length > 2) ?
                            (week) :
                            (weeks.length > 1) ?
                                ((week + "  ( " +
                                    this.state.semesterStarts.clone().add(week-1, 'week').locale('ru').format('DD.MM') + " - " +
                                    this.state.semesterStarts.clone().add(week-1, 'week').add(6, 'days').locale('ru').format('DD.MM')+ " )"))
                            :
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
            .map((groupWeekLessons, index) =>{

                return groupWeekLessons.map((dowLessons, index) => {
                    let date = new Date(dowLessons[0].date)
                    let dateString = moment(date).locale('ru').format('DD MMMM YYYY')
                    let dowString = moment(date).locale('ru').format('dddd');

                    const dayLessons = Array.from(dowLessons)
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
                        </Card>
                    )
                })
            })

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
                                multiple={ this.state.severalWeeks }
                                style={ this.styles.weeksListWidth }
                                floatingLabelText={this.state.chooseWeekTip}
                                value={this.state.weeks}
                                onChange={this.selectedWeekChanged.bind(this)}
                            >
                                {weeks}
                            </SelectField>

                            <Toggle
                                label="Несколько недель"
                                style={this.styles.toggle}
                                defaultToggled={false}
                                toggled = {this.state.severalWeeks}
                                onToggle = {() => {
                                    let oldStateSeveralWeeks = this.state.severalWeeks

                                    this.setState({ severalWeeks: !this.state.severalWeeks })

                                    if (!oldStateSeveralWeeks) {
                                        this.setState({ chooseWeekTip: "Выберите недели" })
                                        this.selectedWeekChanged(null, null, [this.state.weeks], 'many')
                                    } else {
                                        this.setState({ chooseWeekTip: "Выберите неделю" })
                                        this.selectedWeekChanged(null, null, this.state.weeks[0], 'one')
                                    }
                                } }
                            />

                        </CardText>

                    </Card>

                    <Card>
                        <CardText>
                            {WeekScheduleItems}
                        </CardText>
                    </Card>
                </div>
            </App>
        )
    }
}

export default GroupWeekSchedule