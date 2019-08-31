import React, {Component} from 'react';
import App from '../containers/App'
import AutoComplete from 'material-ui/AutoComplete';
import moment from 'moment'
import 'moment/locale/ru';
import { Table, TableBody, TableRow, TableRowColumn } from 'material-ui/Table';
import {Card, CardText} from 'material-ui/Card';

class DisciplineLessons extends Component {
    state = {
        teacherId: '',
        teachersList:[],
        tfdId: '',
        tfdList:[],
        tfdTeacherList:[],
        lessonsList:[],
        hoursByLesson: -1,
        lessonsByMonth: {},
        TeacherListSearchText: ""
    }

    styles = {
        teachersListWidth : {
            width: "100%"
        }
    }

    componentDidMount() {
        let tfdListAPIUrl = 'http://wiki.nayanova.edu/api.php?action=list&listtype=tfdListExpanded';

        fetch(tfdListAPIUrl)
            .then((data) => data.json())
            .then((json) => {
                json.forEach(item => {
                    if (
                        item["studentGroupName"].startsWith("1 ") ||
                        item["studentGroupName"].startsWith("2 ") ||
                        item["studentGroupName"].startsWith("3 ") ||
                        item["studentGroupName"].startsWith("4 ") ||
                        item["studentGroupName"].startsWith("5 ") ||
                        item["studentGroupName"].startsWith("6 ") ||
                        item["studentGroupName"].startsWith("7 "))
                    {
                        item["hoursByLesson"] = 1
                    } else {
                        item["hoursByLesson"] = 2
                    }

                    item["summary"] =
                        item["studentGroupName"] + " " +
                        item["disciplineName"]
                })

                this.setState({
                    tfdList: json
                })

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

            })
            .catch(function(error) {
                console.log(error)
            });
    }

    selectedTfdChanged (searchText, dataSource) {
        let valArray = dataSource.filter(i => i["summary"].indexOf(searchText) >= 0)
        let val = (valArray.length > 0) ? valArray[0].TeacherForDisciplineId: null

        this.setState({
            tfdId: val
        })

        if (valArray[0] !== undefined) {
            this.updateLessonsList(val, valArray[0]["hoursByLesson"])
        }
    }

    selectedTeacherChanged (searchText, dataSource) {
        this.setState({
            TeacherListSearchText: searchText
        })

        let valArray = dataSource.filter(i => i.FIO.indexOf(searchText) >= 0)
        let val = (valArray.length > 0) ? valArray[0].TeacherId : null
        if (val === null) return

        localStorage.setItem("teacherFIO", valArray[0].FIO);

        this.setState({
            teacherId: val
        })

        this.setState({
            lessonsList: []
        })

        this.refs[`disciplinePicker`].setState({searchText:''});

        this.updateDisciplinesList(val)
    }

    updateDisciplinesList(teacherId) {
        let teacher = this.state.teachersList
            .filter(t => t.TeacherId === teacherId);
        if (teacher.length === 0) return
        teacher = teacher[0]

        let tfdList = this.state.tfdList.filter(tfd => tfd.teacherFIO === teacher.FIO);

        this.setState({
            tfdTeacherList: tfdList
        })
    }

    updateLessonsList(tfdId, hoursByLesson) {
        if (tfdId === this.state.tfdId) return
        let tId = (tfdId !== undefined) ? tfdId : this.state.tfdId;
        if (tId === "" || tId == null) return
        //http://wiki.nayanova.edu/api.php?action=disciplineLessons&tfdId=1
        let teacherScheduleUrl =
            'http://wiki.nayanova.edu/api.php?action=disciplineLessons&tfdId=' +
            tId;
        fetch(teacherScheduleUrl)
            .then((data) => data.json())
            .then((json) => {
                json.sort((a,b) => {
                    let aMoment = moment(a.Date + " " + a.Time.substr(0,5))
                    let bMoment = moment(b.Date + " " + b.Time.substr(0,5))

                    if (aMoment.isBefore(bMoment)) return -1
                    if (bMoment.isBefore(aMoment)) return 1
                    return 0
                })

                let lessonsByMonth = {}

                json.forEach(item => {
                    item.Moment = moment(item.Date + " " + item.Time)
                    item.Time = item.Time.substr(0,5)
                    let momentDate = moment(item.Date)
                    item.Date = momentDate.locale('ru').format('DD MMMM')
                    let month = momentDate.month()

                    if (!lessonsByMonth.hasOwnProperty(month)) {
                        lessonsByMonth[month] = hoursByLesson
                    } else {
                        lessonsByMonth[month] += hoursByLesson
                    }
                })

                this.setState({
                    lessonsList: json,
                    lessonsByMonth
                })
            })
            .catch(function(error) {
                console.log(error)
            });
    }



    render() {
        let lessonList =
            this.state.lessonsList.map((lesson) => {
                let lessonIsBeforeNow = lesson.Moment.isBefore(moment())
                return (
                    <TableRow key={lesson.LessonId} >
                        <TableRowColumn style={{
                            fontSize: "0.6em",
                            backgroundColor: lessonIsBeforeNow ? "#ffd": "#fff"
                        }}>
                            {lesson.Date}
                        </TableRowColumn>
                        <TableRowColumn style={{
                            fontSize: "0.6em", width: "25%",
                            backgroundColor: lessonIsBeforeNow ? "#ffd": "#fff"
                        }}>
                            {lesson.Time}
                        </TableRowColumn>
                        <TableRowColumn style={{
                            fontSize: "0.6em",
                            backgroundColor: lessonIsBeforeNow ? "#ffd": "#fff"
                        }}>
                            {lesson.Name}
                        </TableRowColumn>
                    </TableRow>
                )}
            )

        const disciplinesLessonsWrapper =
            (this.state.lessonsList.length === 0) ?
            (<h3>Занятий нет</h3>) :
            (
                <Table>
                    <TableBody displayRowCheckbox={false}>
                        {lessonList}
                    </TableBody>
                </Table>
            )

        let lessonsByMonthKeys = Object
            .keys(this.state.lessonsByMonth)
            .sort((a,b) => (a - b))

        const monthList = lessonsByMonthKeys.map((monthNumber) => {
            let monthHours = this.state.lessonsByMonth[monthNumber]

            return (
                <TableRow key={monthNumber} >
                    <TableRowColumn>
                        {moment([2000,1,1]).month(monthNumber).locale('ru').format('MMMM')}
                    </TableRowColumn>
                    <TableRowColumn>
                        {monthHours}
                    </TableRowColumn>
                </TableRow>
            )}
        )

        const monthTable = (this.state.lessonsList.length === 0) ?
            (<span></span>) :
            (
                <Table>
                    <TableBody displayRowCheckbox={false}>
                        {monthList}
                    </TableBody>
                </Table>
            )

        return (
            <App>
                <div className="teacherDisciplinesDiv containerPadding1">
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

                    <AutoComplete
                        ref={`disciplinePicker`}
                        style={ this.styles.teachersListWidth }
                        hintText="Выберите дисциплину"
                        dataSource={this.state.tfdTeacherList}
                        dataSourceConfig = {{
                            text: "summary",
                            value: "TeacherForDisciplineId"
                        }}
                        fullWidth={true}
                        filter={AutoComplete.fuzzyFilter}
                        onUpdateInput={this.selectedTfdChanged.bind(this)}
                    />

                    <Card key={2}>
                        <CardText>
                            {monthTable}
                        </CardText>
                    </Card>
                    <Card key={3}>
                        <CardText>
                            {disciplinesLessonsWrapper}
                        </CardText>
                    </Card>
                </div>
            </App>
        )
    }
}

export default DisciplineLessons
