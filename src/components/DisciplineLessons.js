import React, {Component} from 'react';
import App from '../containers/App'
import AutoComplete from 'material-ui/AutoComplete';
import moment from 'moment'
import 'moment/locale/ru';
import { Table, TableBody, TableRow, TableRowColumn } from 'material-ui/Table';

class DisciplineLessons extends Component {
    state = {
        teacherId: '',
        teachersList:[],
        tfdId: '',
        tfdList:[],
        tfdTeacherList:[],
        lessonsList:[]
    }

    styles = {
        teachersListWidth : {
            width: "100%"
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

                const teacherId = localStorage.getItem("teacherIdDisciplines");
                if (teacherId) {
                    this.setState({ teacherId: teacherId });
                    this.selectedTeacherChanged("",[])
                }
            })
            .catch(function(error) {
                console.log(error)
            });

        let tfdListAPIUrl = 'http://wiki.nayanova.edu/api.php?action=list&listtype=tfdListExpanded';

        fetch(tfdListAPIUrl)
        fetch(tfdListAPIUrl)
            .then((data) => data.json())
            .then((json) => {
                json.forEach(item => {
                    item["summary"] =
                        item["studentGroupName"] + " " +
                        item["disciplineName"]
                })

                this.setState({
                    tfdList: json
                })

            })
        .catch(function(error) {
            console.log(error)
        });
    }

    selectedTfdChanged (searchText, dataSource) {
        let valArray = dataSource.filter(i => i["summary"].indexOf(searchText) >= 0)
        let val = (valArray.length > 0) ? valArray[0].TeacherForDisciplineId: null
        localStorage.setItem("tfdIdLessonList", val);

        this.setState({
            tfdId: val
        })

        this.updateLessonsList(val)
    }

    selectedTeacherChanged (searchText, dataSource) {
        let valArray = dataSource.filter(i => i.FIO.indexOf(searchText) >= 0)
        let val = (valArray.length > 0) ? valArray[0].TeacherId : null
        localStorage.setItem("teacherIdDisciplineLessons", val);

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
            .filter(t => t.TeacherId === this.state.teacherId);
        if (teacher.length === 0) return
        teacher = teacher[0]
        let tfdList = this.state.tfdList.filter(tfd => tfd.teacherFIO === teacher.FIO);

        this.setState({
            tfdTeacherList: tfdList
        })
    }

    updateLessonsList(tfdId) {
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

                json.forEach(item => {
                    item.Moment = moment(item.Date + " " + item.Time)
                    item.Time = item.Time.substr(0,5)
                    item.Date = moment(item.Date).locale('ru').format('DD MMMM')
                })

                this.setState({
                    lessonsList: json
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

        return (
            <App>
                <div className="teacherDisciplinesDiv containerPadding1">
                    <h2>Список занятий по дисциплине</h2>
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
                    {disciplinesLessonsWrapper}
                </div>
            </App>
        )
    }
}

export default DisciplineLessons