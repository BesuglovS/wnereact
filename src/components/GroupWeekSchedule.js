import React, {Component} from 'react';
import App from '../containers/App'
import {Card, CardHeader, CardText} from 'material-ui/Card';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Toggle from 'material-ui/Toggle';
import { Table, TableBody, TableRow, TableRowColumn } from 'material-ui/Table';
import moment from 'moment'
import 'moment/locale/ru';
import Utilities from "../core/Utilities";

class GroupWeekSchedule extends Component {
    state = {
        groupId: '',
        groupsList:[],
        weeks: [1],
        groupSchedule:[],
        semesterStarts: null,
        severalWeeks: false,
        chooseWeekTip: "Выберите неделю",
        weeksList:[],
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
        },
        timecolumn : {
            width: "50px"
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

        let configOptionsUrl = 'http://wiki.nayanova.edu/api.php?action=list&listtype=configOptions';
        fetch(configOptionsUrl)
            .then((data) => data.json())
            .then((json) => {
                let ss = json.filter(i => i["Key"] === "Semester Starts")
                let se = json.filter(i => i["Key"] === "Semester Ends")
                if (ss.length > 0 && se.length > 0) {
                    let semesterString = ss[0].Value;
                    let momentSemesterStarts = moment(semesterString).startOf('isoweek')

                    let semesterEndsString = se[0].Value;
                    let momentSemesterEnds = moment(semesterEndsString).startOf('isoweek')

                    let weekCount = (momentSemesterEnds.diff(momentSemesterStarts, 'days') / 7) + 1
                    let weekArray = []
                    for(let i = 0; i < weekCount; i++) {
                        weekArray.push(i+1)
                    }

                    this.setState({
                        semesterStarts: momentSemesterStarts,
                        weeksList: weekArray,
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
        //http://wiki.nayanova.edu/api.php?action=weeksSchedule&groupId=15&weeks=15|16&compactResult
        let weekSchedule =
            'http://wiki.nayanova.edu/api.php?action=weeksSchedule&groupId=' + gId +
            '&weeks=' + w.join("|") + "&compactResult";
        fetch(weekSchedule)
            .then((data) => data.json())
            .then((json) => {
                this.setState({
                    groupSchedule: json
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

        this.updateSchedule(this.state.groupId, val)
    }

    selectedGroupChanged (e, key, val) {
        let groups = this.state.groupsList.filter(g => g.StudentGroupId === val)
        if (groups.length > 0) {
            localStorage.setItem("groupName", groups[0].Name);
        }

        this.setState({
            groupId: val
        })

        let weeks = Array.isArray(this.state.weeks) ? this.state.weeks : [this.state.weeks];

        this.updateSchedule(val, weeks)
    }

    render() {
        const weeks = this.state.weeksList
            .map((week) => {
                let weeks = Array.isArray(this.state.weeks) ? this.state.weeks : [this.state.weeks];

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

        let dowList = Object.keys(this.state.groupSchedule).sort()

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

                if (this.state.groupSchedule[dow].length === 0) {
                    return null
                }

                let rings = Object.keys(this.state.groupSchedule[dow])
                    .sort((a, b) => {
                        let splitA = a.split(":")
                        let splitB = b.split(":")

                        let aSum = parseInt(splitA[0], 10) * 60 + parseInt(splitA[1], 10)
                        let bSum = parseInt(splitB[0], 10) * 60 + parseInt(splitB[1], 10)

                        return aSum - bSum
                    })

                const dowLessons = rings.map((time, index) => {

                    let tfdIds = Object.keys(this.state.groupSchedule[dow][time])

                    tfdIds.sort((tfdId1, tfdId2) => {
                        let auds1 = Object.keys(this.state.groupSchedule[dow][time][tfdId1]["weeksAndAuds"])
                        let weeks1 = []
                        auds1.forEach((a) => {
                            weeks1.push(...this.state.groupSchedule[dow][time][tfdId1]["weeksAndAuds"][a])
                        })
                        let minWeek1 = Math.min(...weeks1)

                        let auds2 = Object.keys(this.state.groupSchedule[dow][time][tfdId2]["weeksAndAuds"])
                        let weeks2 = []
                        auds2.forEach((a) => {
                            weeks2.push(...this.state.groupSchedule[dow][time][tfdId2]["weeksAndAuds"][a])
                        })
                        let minWeek2 = Math.min(...weeks2)

                        return minWeek1 - minWeek2
                    })

                    let firsttime = true

                    let tfdLessons = tfdIds.map((tfdId) => {
                        let auds = Object.keys(this.state.groupSchedule[dow][time][tfdId]["weeksAndAuds"])
                        let weeks = []
                        let audsStrings = []
                        auds.forEach((a) => {
                            weeks.push(...this.state.groupSchedule[dow][time][tfdId]["weeksAndAuds"][a])

                            let minWeek = Math.min(...this.state.groupSchedule[dow][time][tfdId]["weeksAndAuds"][a])
                            let obj = {}
                            obj[minWeek] = Utilities.GatherWeeksToString(
                                this.state.groupSchedule[dow][time][tfdId]["weeksAndAuds"][a])
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
                                    {this.state.groupSchedule[dow][time][tfdId]["lessons"][0].discName} <br />
                                    {this.state.groupSchedule[dow][time][tfdId]["lessons"][0].teacherFIO} <br />
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