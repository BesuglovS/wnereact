import React, {Component} from 'react';
import App from '../containers/App'
import AutoComplete from 'material-ui/AutoComplete';
import moment from "moment/moment";


class TeacherSession extends Component {
    state = {
        teacherId: '',
        teachersList:[],
        teacherExams:[],
        TeacherListSearchText: "",
    }

    styles = {
        teachersListWidth : {
            width: "100%"
        }
    }

    componentDidMount() {
        let teachersListAPIUrl = 'http://wiki.nayanova.edu/api.php?action=list&listtype=teachers&sessionList';
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

        this.updateExamsList(val)
    }

    updateExamsList(teacherId) {
        let tId = (teacherId !== undefined) ? teacherId : this.state.teacherId;
        if (tId === "" || tId == null) return
        //http://wiki.nayanova.edu/api.php?action=teacherExams&teacherId=116
        let teacherScheduleUrl =
            'http://wiki.nayanova.edu/api.php?action=teacherExams&teacherId=' +
            tId;
        fetch(teacherScheduleUrl)
            .then((data) => data.json())
            .then((json) => {
                json.sort((a,b) => {
                    let aMoment = (a["ConsultationDateTime"] === "") ?
                        moment(a["ExamDateTime"], "DD.MM.YYYY h:mm") :
                        moment(a["ConsultationDateTime"], "DD.MM.YYYY h:mm")
                    let bMoment = (b["ConsultationDateTime"] === "") ?
                        moment(b["ExamDateTime"], "DD.MM.YYYY h:mm") :
                        moment(b["ConsultationDateTime"], "DD.MM.YYYY h:mm")

                    if (aMoment.isBefore(bMoment)) return -1
                    if (bMoment.isBefore(aMoment)) return 1
                    return 0
                })

                json.forEach((item) => {
                    if (item.ConsultationDateTime.indexOf(" ") !== -1) {
                        let split = item.ConsultationDateTime.split(' ')
                        item.ConsultationDate = split[0]
                        item.ConsultationTime = split[1]
                        delete item.ConsultationDateTime;
                    } else {
                        item.ConsultationDate = item.ConsultationDateTime
                        item.ConsultationTime = ""
                        delete item.ConsultationDateTime;
                    }

                    if (item.ExamDateTime.indexOf(" ") !== -1) {
                        let split = item.ExamDateTime.split(' ')
                        item.ExamDate = split[0]
                        item.ExamTime = split[1]
                        delete item.ExamDateTime;
                    } else {
                        item.ExamDate = item.ExamDateTime
                        item.ExamTime = ""
                        delete item.ExamDateTime;
                    }

                    item.mergeTime = (item.ConsultationTime === item.ExamTime)
                    item.mergeAud = (item.consultationAud === item.examinationAud)
                })

                this.setState({
                    teacherExams: json
                })
            })
            .catch(function(error) {
                console.log(error)
            });
    }



    render() {
        let teacherExamsItems = this.state.teacherExams.map((exam, index) => {
            const consTime = exam.mergeTime ?
                (<td rowSpan="2">{exam.ConsultationTime}</td>):
                (<td>{exam.ConsultationTime}</td>)
            const examTime = exam.mergeTime ?
                (null):
                (<td>{exam.ExamTime}</td>)

            const consAud = exam.mergeAud ?
                (<td rowSpan="2">{exam.consultationAud}</td>):
                (<td>{exam.consultationAud}</td>)
            const examAud = exam.mergeAud ?
                (null):
                (<td>{exam.examinationAud}</td>)


            let result = [
                <tr key={index+1}>
                    <td colSpan="2">{exam.Name}</td>
                    <td colSpan="2">{exam.groupName}</td>
                </tr>,
                <tr key={index+2}>
                    <td>Консультация</td>
                    <td>{exam.ConsultationDate}</td>
                    {consTime}
                    {consAud}
                </tr>,
                <tr key={index+3}>
                    <td>Экзамен</td>
                    <td>{exam.ExamDate}</td>
                    {examTime}
                    {examAud}
                </tr>
            ]

            if (exam.ConsultationDate === "") {
                result.splice(1, 1);
                if (exam.ExamDate === "") {
                    result.splice(1, 1);
                }
            } else {
                if (exam.ExamDate === "") {
                    result.splice(2, 1);
                }
            }

            return result
        })


        let teacherExamsTableDiv =
            (this.state.teacherExams.length !== 0) ? (
                <div className="groupDisciplinesTableDiv">
                    <table className="groupDisciplinesTable">
                        <tbody>
                        {teacherExamsItems}
                        </tbody>
                    </table>
                </div>
            ) : (this.state.groupId !== '') ? <h2>Экзменов нет</h2> : null

        return (
            <App>
                <div className="teacherDisciplinesDiv containerPadding1">
                    <h2>Экзамены преподавателя</h2>
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
                    {teacherExamsTableDiv}
                </div>
            </App>
        )
    }
}

export default TeacherSession