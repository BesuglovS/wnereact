import React, {Component} from 'react';
import App from '../containers/App'
import AutoComplete from 'material-ui/AutoComplete';
import moment from 'moment'
import 'moment/locale/ru';

class TeacherLessons extends Component {
    state = {
        teacherId: '',
        teachersList:[],
        teacherLessons:[],
        TeacherListSearchText: "",
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

        this.updateLessonsList(val)
    }

    updateLessonsList(teacherId) {
        let tId = (teacherId !== undefined) ? teacherId : this.state.teacherId;
        if (tId === "" || tId == null) return
        //http://wiki.nayanova.edu/api.php?action=teacherLessons&teacherId=1
        let teacherLessonsUrl =
            'http://wiki.nayanova.edu/api.php?action=teacherLessons&teacherId=' +
            tId;
        fetch(teacherLessonsUrl)
            .then((data) => data.json())
            .then((json) => {
                json.forEach((lesson, index, list) => {
                    let bigM = moment(lesson.Date + " " + lesson.Time.substring(0, 5), "YYYY-MM-DD HH:mm")
                    list[index].lessonIsBeforeNow = bigM.isBefore(moment())

                    let m = moment(lesson.Date, "YYYY-MM-DD")
                    list[index].Date = m.locale('ru').format('DD.MM.YYYY')
                    list[index].Time = list[index].Time.substring(0, 5);
                });


                this.setState({
                    teacherLessons: json
                })
            })
            .catch(function(error) {
                console.log(error)
            });
    }

    render() {

        let teacherLessonsItems = this.state.teacherLessons.map((lesson, index) => (
            <tr style={{
                backgroundColor: lesson.lessonIsBeforeNow ? "#ffd": "#fff"
            }} key={index}>
                <td>{lesson.disciplineName}</td>
                <td>{lesson.studentGroupname}</td>
                <td>{lesson.Date}</td>
                <td>{lesson.Time}</td>
                <td>{lesson.auditoriumName}</td>
            </tr>
        ))


        let teacherLessonsDiv =
            (this.state.teacherLessons.length !== 0) ? (
                <div className="groupDisciplinesTableDiv">
                    <table className="groupDisciplinesTable smallerFont">
                        <tbody>
                        {/*Table header?*/}
                        {teacherLessonsItems}
                        </tbody>
                    </table>
                </div>
            ) : (this.state.groupId !== '') ? <h2>Занятий нет</h2> : null


        return (
            <App>
                <div className="teacherDisciplinesDiv containerPadding1">
                    <h2>Занятия преподавателя</h2>
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
                    {teacherLessonsDiv}
                </div>
            </App>
        )
    }
}

export default TeacherLessons