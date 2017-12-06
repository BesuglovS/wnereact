import React, {Component} from 'react';
import App from '../containers/App'
import AutoComplete from 'material-ui/AutoComplete';
import Utilities from "../core/Utilities";

class TeacherDisciplines extends Component {
    state = {
        teacherId: '',
        teachersList:[],
        teacherDisciplines:[]
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
                    this.selectedTeacherChanged(null, null, teacherId)
                }
            })
            .catch(function(error) {
                console.log(error)
            });
    }

    selectedTeacherChanged (searchText, dataSource) {
        let valArray = dataSource.filter(i => i.FIO.indexOf(searchText) >= 0)
        let val = (valArray.length > 0) ? valArray[0].TeacherId : null
        localStorage.setItem("teacherIdDisciplines", val);

        this.setState({
            teacherId: val
        })

        this.updateDisciplineList(val)
    }

    updateDisciplineList(teacherId) {
        let tId = (teacherId !== undefined) ? teacherId : this.state.teacherId;
        if (tId === "" || tId == null) return
        //http://wiki.nayanova.edu/api.php?action=list&listtype=disciplines&teacherId=13
        let teacherScheduleUrl =
            'http://wiki.nayanova.edu/api.php?action=list&listtype=disciplines&teacherId=' +
            tId;
        fetch(teacherScheduleUrl)
            .then((data) => data.json())
            .then((json) => {
                this.setState({
                    teacherDisciplines: json
                })
            })
            .catch(function(error) {
                console.log(error)
            });
    }



    render() {
        const Attestation = {
            0: "нет",
            1: "зачёт",
            2: "экзамен",
            3: "зачёт и экзамен",
            4: "зачёт с оценкой"
        }

        let teacherDisciplinesItems = this.state.teacherDisciplines.map((disc, index) => (
            <tr key={index}>
                <td>{disc.Name}</td>
                <td>{disc.GroupName}</td>
                <td>{disc.AuditoriumHours}</td>
                <td style={{backgroundColor: Utilities.GetPercentColorString(disc.AuditoriumHours, disc.hoursCount)}}>
                    {disc.hoursCount}
                </td>
                <td>{disc.LectureHours}</td>
                <td>{disc.PracticalHours}</td>
                <td>{Attestation[disc.Attestation]}</td>
            </tr>
        ))


        let groupDisciplinesTableDiv =
            (this.state.teacherDisciplines.length !== 0) ? (
                <div className="groupDisciplinesTableDiv">
                    <table className="groupDisciplinesTable">
                        <tbody>
                            <tr>
                                <td>Дисциплина</td>
                                <td>Группа</td>
                                <td>Часы</td>
                                <td>В рас-писании</td>
                                <td>Лекции</td>
                                <td>Практики</td>
                                <td>Отчётность</td>
                            </tr>
                            {teacherDisciplinesItems}
                        </tbody>
                    </table>
                </div>
            ) : (this.state.groupId !== '') ? <h2>Дисциплин нет</h2> : null


        return (
            <App>
                <div className="teacherDisciplinesDiv containerPadding1">
                    <h2>Дисциплины преподавателя</h2>
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
                    {groupDisciplinesTableDiv}
                </div>
            </App>
        )
    }
}

export default TeacherDisciplines