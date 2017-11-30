import React, {Component} from 'react';
import {MuiThemeProvider} from "material-ui";
import App from '../App'
import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';

class TeacherDisciplines extends Component {
    state = {
        teacherId: '',
        teachersList:[],
        teacherDisciplines:[]
    }

    styles = {
        teachersListWidth : {
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

    selectedTeacherChanged (e, key, val) {
        localStorage.setItem("teacherIdDisciplines", val);

        this.setState({
            teacherId: val
        })

        this.updateDisciplineList(val)
    }

    updateDisciplineList(teacherId) {
        let tId = (teacherId !== undefined) ? teacherId : this.state.teacherId;
        if (tId === "") return
        //http://wiki.nayanova.edu/api.php?action=list&listtype=teacherDisciplines&teacherId=57
        let teacherScheduleUrl =
            'http://wiki.nayanova.edu/api.php?action=list&listtype=teacherDisciplines&teacherId=' +
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

        const teacherListItems = this.state.teachersList.map((teacher) =>
            <MenuItem key={teacher.TeacherId}
                      value={teacher.TeacherId} primaryText={teacher.FIO}/>
        )

        let teacherDisciplinesItems = this.state.teacherDisciplines.map((disc, index) => (
            <tr key={index}>
                <td>{disc.Name}</td>
                <td>{disc.StudentGroupName}</td>
                <td>{disc.AuditoriumHours}</td>
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
                            {teacherDisciplinesItems}
                        </tbody>
                    </table>
                </div>
            ) : (this.state.groupId !== '') ? <h2>Дисциплин нет</h2> : null


        return (
            <MuiThemeProvider>
                <App>
                    <div className="containerPadding1">
                        <h2>Дисциплины преподавателя</h2>
                        <SelectField
                            style={this.styles.teachersListWidth}
                            floatingLabelText="Выберите преподавателя"
                            value={this.state.teacherId}
                            onChange={this.selectedTeacherChanged.bind(this)}
                        >
                            {teacherListItems}
                        </SelectField>
                        {groupDisciplinesTableDiv}
                    </div>
                </App>
            </MuiThemeProvider>
        )
    }
}

export default TeacherDisciplines