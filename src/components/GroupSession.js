import React, {Component} from 'react';
import App from '../containers/App'
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import moment from 'moment'
import 'moment/locale/ru';

class GroupSession extends Component {
    state = {
        groupId: '',
        groupsList:[],
        groupExams:[],
        groupName: ""
    }

    componentDidMount() {
        let mainGroupsAPIUrl = 'http://wiki.nayanova.edu/api.php?action=list&listtype=mainStudentGroups&sessionList';
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
    }

    selectedGroupChanged (e, key, val) {
        let groups = this.state.groupsList.filter(g => g.StudentGroupId === val)
        if (groups.length > 0) {
            localStorage.setItem("groupName", groups[0].Name);
        }

        this.setState({
            groupId: val
        })

        this.updateDisciplineList(val)
    }

    updateDisciplineList(groupId) {
        let studentGroupId = (groupId !== undefined) ? groupId : this.state.groupId;
        if (studentGroupId === "") return
        //http://wiki.nayanova.edu/api.php?action=groupExams&groupId=102
        let dailyScheduleAPIUrl =
            'http://wiki.nayanova.edu/api.php?action=groupExams&groupId=' +
            studentGroupId;
        fetch(dailyScheduleAPIUrl)
            .then((data) => data.json())
            .then((json) => {

                let exams = json[studentGroupId].Exams

                exams.sort((a,b) => {
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

                exams.forEach((item) => {
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
                    item.mergeAud = (item.ConsultationAuditoriumName === item.ExamAuditoriumName)
                })

                this.setState({
                    groupExams: exams,
                    groupName: json[studentGroupId].groupName
                })
            })
            .catch(function(error) {
                console.log(error)
            });
    }



    render() {

        const groupListItems = this.state.groupsList.map((group) =>
            <MenuItem key={group.StudentGroupId} value={group.StudentGroupId} primaryText={group.Name}/>
        )

        let groupExamsItems = this.state.groupExams.map((exam, index) => {
            const consTime = exam.mergeTime ?
                (<td rowSpan="2">{exam.ConsultationTime}</td>):
                (<td>{exam.ConsultationTime}</td>)
            const examTime = exam.mergeTime ?
                (null):
                (<td>{exam.ExamTime}</td>)

            const consAud = exam.mergeAud ?
                (<td rowSpan="2">{exam.ConsultationAuditoriumName}</td>):
                (<td>{exam.ConsultationAuditoriumName}</td>)
            const examAud = exam.mergeAud ?
                (null):
                (<td>{exam.ExamAuditoriumName}</td>)


            let result = [
                <tr key={index+1}>
                    <td colSpan="2">{exam.DisciplineName}</td>
                    <td colSpan="2">{exam.TeacherFIO}</td>
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

        let groupExamsTableDiv =
            (this.state.groupExams.length !== 0) ? (
                <div className="groupDisciplinesTableDiv">
                    <table className="groupDisciplinesTable">
                        <tbody>
                            {groupExamsItems}
                        </tbody>
                    </table>
                </div>
            ) : (this.state.groupId !== '') ? <h2>Экзменов нет</h2> : null


        return (
            <App>
                <div className="groupDisciplinesDiv containerPadding1">
                    <h2>Экзамены группы</h2>
                    <SelectField
                        floatingLabelText="Выберите группу"
                        value={this.state.groupId}
                        onChange={this.selectedGroupChanged.bind(this)}
                    >
                        {groupListItems}
                    </SelectField>
                    {groupExamsTableDiv}
                </div>
            </App>
        )
    }
}

export default GroupSession