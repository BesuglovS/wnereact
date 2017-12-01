import React, {Component} from 'react';
import App from '../containers/App'
import {Card, CardHeader, CardText} from 'material-ui/Card';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import moment from 'moment'
import 'moment/locale/ru';

class TeacherSchedule extends Component {
    state = {
        teacherId: '',
        teachersList:[],
        week: 1,
        teacherSchedule:[]
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
        if (tId === "") return
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

    selectedTeacherChanged (e, key, val) {
        localStorage.setItem("teacherId", val);

        this.setState({
            teacherId: val
        })

        this.updateSchedule(val, this.state.week)
    }

    render() {
        const weeks = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18]
            .map((week) =>
            <MenuItem key={week} value={week} primaryText={week}/>
        )

        const teacherListItems = this.state.teachersList.map((teacher) =>
            <MenuItem key={teacher.TeacherId}
                      value={teacher.TeacherId} primaryText={teacher.FIO}/>
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

        const TeacherWeekScheduleWrapper = () => {
            if (this.state.teacherSchedule.length === 0)
            {
                return (<h3>Занятий нет</h3>)
            } else {
                return (<div>{TeacherWeekScheduleItems}</div>)
            }
        }

        return (
            <App>
                <div className="teacherScheduleDiv">
                    <Card>
                        <CardHeader
                            title="Расписание преподавателя"
                            subtitle=""
                        />

                        <CardText>

                            <SelectField
                                style={ this.styles.teachersListWidth }
                                floatingLabelText="Выберите преподавателя"
                                value={this.state.teacherId}
                                onChange={this.selectedTeacherChanged.bind(this)}
                            >
                                {teacherListItems}
                            </SelectField>

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
                            {TeacherWeekScheduleWrapper()}
                        </CardText>
                    </Card>
                </div>
            </App>
        )
    }
}

export default TeacherSchedule