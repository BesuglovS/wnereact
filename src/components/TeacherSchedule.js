import React, {Component} from 'react';
import App from '../containers/App'
import {Card, CardHeader, CardText} from 'material-ui/Card';
import SelectField from 'material-ui/SelectField';
import AutoComplete from 'material-ui/AutoComplete';
import MenuItem from 'material-ui/MenuItem';
import moment from 'moment'
import 'moment/locale/ru';

class TeacherSchedule extends Component {
    state = {
        teacherId: '',
        teachersList:[],
        week: 1,
        teacherSchedule:[],
        semesterStarts: null
    }

    styles = {
        teachersListWidth : {
            width: "380px"
        },
        weeksListWidth : {
            width: "380px"
        }
    }

    componentDidMount() {
        let teachersListAPIUrl = 'http://wiki.nayanova.edu/api.php?action=list&listtype=teachers';
        fetch(teachersListAPIUrl)
            .then((data) => data.json())
            .then((json) => {
                this.setState({
                    teachersList: json
                })

                const teacherId = localStorage.getItem("teacherId");
                if (teacherId) {
                    this.setState({ teacherId: teacherId });
                    this.selectedTeacherChanged(null, null, teacherId)
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
                        week: weekNum
                    })

                    this.selectedWeekChanged(null, null, weekNum)
                }
            })
            .catch(function(error) {
                console.log(error)
            });
    }

    updateSchedule(teacherId, week) {
        let tId = (teacherId !== undefined) ? teacherId : this.state.teacherId;
        let w = (week !== undefined) ? week : this.state.week;
        if (tId === "" || tId == null) return
        //http://wiki.nayanova.edu/api.php?action=TeacherWeekSchedule&teacherId=57&week=2
        let teacherWeekSchedule = 'http://wiki.nayanova.edu/api.php?action=TeacherWeekSchedule&teacherId=' +
            tId +
            '&week=' + w;
        fetch(teacherWeekSchedule)
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
                    teacherSchedule: result
                })
            })
            .catch(function(error) {
                console.log(error)
            });
    }

    selectedWeekChanged(e, key, val) {
        this.setState({
            week: val
        })

        this.updateSchedule(this.state.teacherId, val)
    }

    selectedTeacherChanged (searchText, dataSource) {
        let valArray = dataSource.filter(i => i.FIO.indexOf(searchText) >= 0)
        let val = (valArray.length > 0) ? valArray[0].TeacherId : null
        localStorage.setItem("teacherId", val);

        this.setState({
            teacherId: val
        })

        this.updateSchedule(val, this.state.week)
    }

    render() {
        const weeks = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18]
            .map((week) => {
                    let weekLabel =
                        (this.state.semesterStarts !== null) ?
                            (week + "  ( " +
                                this.state.semesterStarts.clone().add(week-1, 'week').locale('ru').format('DD MMMM YYYY') + " - " +
                                this.state.semesterStarts.clone().add(week-1, 'week').add(6, 'days').locale('ru').format('DD MMMM YYYY')+ " )") :
                            week

                    return (
                        <MenuItem key={week} value={week}
                                  primaryText={weekLabel}
                        />)
                }
            )

        const TeacherWeekScheduleItems = this.state.teacherSchedule
            .map((dowLessons, index) =>{
                let date = new Date(dowLessons[0].Date)
                let dateString = moment(date).locale('ru').format('DD MMMM YYYY')
                let dowString = moment(date).locale('ru').format('dddd');

                const dayLessons = dowLessons
                    .map((lesson, index) =>{
                        return (
                            <tr key={index}>
                                <td>{lesson.Time.substr(0,5)}</td>
                                <td>
                                    {lesson.disciplineName} <br />
                                    {lesson.groupName}
                                </td>
                                <td>{lesson.auditoriumName}</td>
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

        const TeacherWeekScheduleWrapper =
            (this.state.teacherSchedule.length === 0) ?
                (<h3>Занятий нет</h3>) :
                (<div>{TeacherWeekScheduleItems}</div>)

        return (
            <App>
                <div className="teacherScheduleDiv">
                    <Card>
                        <CardHeader
                            title="Расписание преподавателя"
                            subtitle=""
                        />

                        <CardText>

                            <AutoComplete
                                style={ this.styles.teachersListWidth }
                                hintText="Выберите преподавателя"
                                dataSource={this.state.teachersList}
                                dataSourceConfig = {{
                                    text: "FIO",
                                    value: "TeacherId"
                                }}
                                fullWidth={true}
                                filter={AutoComplete.fuzzyFilter}
                                onUpdateInput={this.selectedTeacherChanged.bind(this)}
                            />

                            <br />

                            <SelectField
                                style={ this.styles.weeksListWidth }
                                floatingLabelText="Выберите неделю"
                                value={this.state.week}
                                onChange={this.selectedWeekChanged.bind(this)}
                            >
                                {weeks}
                            </SelectField>

                        </CardText>

                    </Card>

                    <Card>
                        <CardText>
                            {TeacherWeekScheduleWrapper}
                        </CardText>
                    </Card>
                </div>
            </App>
        )
    }
}

export default TeacherSchedule