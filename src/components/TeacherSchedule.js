import React, {Component} from 'react';
import App from '../containers/App'
import {Card, CardHeader, CardText} from 'material-ui/Card';
import SelectField from 'material-ui/SelectField';
import AutoComplete from 'material-ui/AutoComplete';
import MenuItem from 'material-ui/MenuItem';
import Toggle from 'material-ui/Toggle';
import { Table, TableBody, TableRow, TableRowColumn } from 'material-ui/Table';
import moment from 'moment'
import 'moment/locale/ru';
import Utilities from "../core/Utilities";

class TeacherSchedule extends Component {
    state = {
        teacherId: '',
        teachersList:[],
        weeks: [1],
        teacherSchedule:[],
        semesterStarts: null,
        severalWeeks: false,
        chooseWeekTip: "Выберите неделю",
        TeacherListSearchText: "",
    }

    styles = {
        teachersListWidth : {
            width: "100%"
        },
        weeksListWidth : {
            width: "100%"
        },
        toggle: {
            marginTop: 16,
        },
        timecolumn : {
            width: "50px"
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

                const teacherFIO = localStorage.getItem("teacherFIO");
                let teachers = json.filter(t => t.FIO === teacherFIO)

                if (teachers.length > 0) {
                    this.setState({
                        teacherId: teachers[0].TeacherId,
                        TeacherListSearchText: teachers[0].FIO,
                    });

                    this.selectedTeacherChanged(teachers[0].FIO, json)
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

    updateSchedule(teacherId, weeks) {
        let tId = (teacherId !== undefined) ? teacherId : this.state.teacherId;
        let w = (weeks !== undefined) ?
            Array.isArray(weeks) ? weeks : [weeks] :
            Array.isArray(this.state.weeks) ? this.state.weeks : [this.state.weeks];
        if (tId === "" || tId == null) return
        //http://wiki.nayanova.edu/api.php?action=TeacherWeekSchedule&teacherId=57&week=2
        let teacherWeekSchedule = 'http://wiki.nayanova.edu/api.php?action=teacherWeeksSchedule&teacherId=' +
            tId +
            '&weeks=' + w.join("|") + "&compactResult";
        fetch(teacherWeekSchedule)
            .then((data) => data.json())
            .then((json) => {
                this.setState({
                    teacherSchedule: json
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

        this.setState({
            weeks: val
        })

        this.updateSchedule(this.state.teacherId, val)
    }

    selectedTeacherChanged (searchText, dataSource) {
        this.setState({
            TeacherListSearchText: searchText
        })

        if (dataSource === null) {
            this.setState({
                teacherSchedule: []
            })
            return
        }

        let valArray = dataSource.filter(i => i.FIO.indexOf(searchText) >= 0)
        let val = (valArray.length > 0) ? valArray[0].TeacherId : null
        if (val === null) return

        localStorage.setItem("teacherFIO", valArray[0].FIO);

        this.setState({
            teacherId: val
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

        var dowList = Object.keys(this.state.teacherSchedule).sort()

        let ruDOW = {
            1: "Понедельник",
            2: "Вторник",
            3: "Среда",
            4: "Четверг",
            5: "Пятница",
            6: "Суббота",
            7: "Воскресенье"
        }

        const WeekScheduleItems = dowList
            .map((dow) => {

                if (this.state.teacherSchedule[dow].length === 0) {
                    return null
                }

                var rings = Object.keys(this.state.teacherSchedule[dow])
                    .sort((a, b) => {
                        let splitA = a.split(":")
                        let splitB = b.split(":")

                        let aSum = parseInt(splitA[0], 10) * 60 + parseInt(splitA[1], 10)
                        let bSum = parseInt(splitB[0], 10) * 60 + parseInt(splitB[1], 10)

                        return aSum - bSum
                    })

                const dowLessons = rings.map((time, index) => {

                    let tfdIds = Object.keys(this.state.teacherSchedule[dow][time])

                    tfdIds.sort((tfdId1, tfdId2) => {
                        let auds1 = Object.keys(this.state.teacherSchedule[dow][time][tfdId1]["weeksAndAuds"])
                        let weeks1 = []
                        auds1.forEach((a) => {
                            weeks1.push(...this.state.teacherSchedule[dow][time][tfdId1]["weeksAndAuds"][a])
                        })
                        let minWeek1 = Math.min(...weeks1)

                        let auds2 = Object.keys(this.state.teacherSchedule[dow][time][tfdId2]["weeksAndAuds"])
                        let weeks2 = []
                        auds2.forEach((a) => {
                            weeks2.push(...this.state.teacherSchedule[dow][time][tfdId2]["weeksAndAuds"][a])
                        })
                        let minWeek2 = Math.min(...weeks2)

                        return minWeek1 - minWeek2
                    })

                    let firsttime = true

                    let tfdLessons = tfdIds.map((tfdId) => {
                        let auds = Object.keys(this.state.teacherSchedule[dow][time][tfdId]["weeksAndAuds"])
                        let weeks = []
                        let audsStrings = []
                        auds.forEach((a) => {
                            weeks.push(...this.state.teacherSchedule[dow][time][tfdId]["weeksAndAuds"][a])

                            let minWeek = Math.min(...this.state.teacherSchedule[dow][time][tfdId]["weeksAndAuds"][a])
                            let obj = {}
                            obj[minWeek] = Utilities.GatherWeeksToString(
                                this.state.teacherSchedule[dow][time][tfdId]["weeksAndAuds"][a])
                                + " - " + a
                            audsStrings.push(obj)
                        })

                        audsStrings.sort((a,b) => {
                            let aVal = Object.keys(a)[0]
                            let bVal = Object.keys(b)[0]

                            return aVal - bVal
                        })

                        audsStrings = audsStrings.map((obj) => {
                            let key = Object.keys(obj)[0]
                            return obj[key]
                        })


                        let audsString = ""
                        if (auds.length === 1) {
                            audsString = auds[0]
                        } else {
                            audsString = audsStrings.map((aud, index) => (<div key={index}>{aud}</div>))
                        }

                        let weeksString = "(" +
                            Utilities.GatherWeeksToString(weeks)
                            + ")"

                        let timeStr = firsttime ? time: ""

                        const timeCol = (timeStr !== "") ?
                            ((tfdIds.length === 1) ?
                                (
                                    <TableRowColumn
                                        style={ this.styles.timecolumn } >
                                        {timeStr}
                                    </TableRowColumn>
                                ) :
                                (
                                    <TableRowColumn
                                        rowSpan={tfdIds.length}
                                        style={ this.styles.timecolumn } >
                                        {timeStr}
                                    </TableRowColumn>
                                )) : null

                        firsttime = false

                        return(
                            <TableRow key={tfdId} style={{"borderBottom": "1px solid rgb(224, 224, 224)"}}>
                                {timeCol}
                                <TableRowColumn>
                                    {this.state.teacherSchedule[dow][time][tfdId]["lessons"][0].discName} <br />
                                    {this.state.teacherSchedule[dow][time][tfdId]["lessons"][0].groupName} <br />
                                    {weeksString} <br />
                                    {audsString}
                                </TableRowColumn>
                            </TableRow>
                        )
                    })

                    return (
                        [tfdLessons]
                    )
                })

                return (
                    <Card key={dow}>
                        <CardHeader
                            title={ruDOW[dow]}
                            subtitle={""}
                        />
                        <CardText>
                            <Table key={dow}>
                                <TableBody displayRowCheckbox={false}>
                                    {dowLessons}
                                </TableBody>
                            </Table>
                        </CardText>
                    </Card>
                )
            })


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
                                searchText={this.state.TeacherListSearchText}
                            />

                            <br />

                            <SelectField
                                multiple={ this.state.severalWeeks }
                                style={ this.styles.weeksListWidth }
                                floatingLabelText="Выберите неделю"
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

export default TeacherSchedule