import React, {Component} from 'react';
import App from '../containers/App'
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Utilities from "../core/Utilities";

class GroupDisciplines extends Component {
    state = {
        groupId: '',
        groupsList:[],
        groupDisciplines:[]
    }

    componentDidMount() {
        let mainGroupsAPIUrl = 'http://wiki.nayanova.edu/api.php?action=list&listtype=mainStudentGroups';
        fetch(mainGroupsAPIUrl)
            .then((data) => data.json())
            .then((json) => {
                this.setState({
                    groupsList: json
                })

                const groupId = localStorage.getItem("groupIdDisciplines");
                if (groupId) {
                    this.setState({ groupId: groupId });
                    this.selectedGroupChanged(null, null, groupId)
                }
            })
            .catch(function(error) {
                console.log(error)
            });
    }

    selectedGroupChanged (e, key, val) {
        localStorage.setItem("groupIdDisciplines", val);

        this.setState({
            groupId: val
        })

        this.updateDisciplineList(val)
    }

    updateDisciplineList(groupId) {
        let studentGroupId = (groupId !== undefined) ? groupId : this.state.groupId;
        if (studentGroupId === "") return
        //http://wiki.nayanova.edu/api.php?action=list&listtype=groupDisciplines&groupId=1
        let dailyScheduleAPIUrl =
            'http://wiki.nayanova.edu/api.php?action=list&listtype=groupDisciplines&groupId=' +
            studentGroupId;
        fetch(dailyScheduleAPIUrl)
            .then((data) => data.json())
            .then((json) => {
                this.setState({
                    groupDisciplines: json
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

        const groupListItems = this.state.groupsList.map((group) =>
            <MenuItem key={group.StudentGroupId} value={group.StudentGroupId} primaryText={group.Name}/>
        )

        let groupDisciplinesItems = this.state.groupDisciplines.map((disc, index) => (
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
            (this.state.groupDisciplines.length !== 0) ? (
                <div className="groupDisciplinesTableDiv">
                    <table className="groupDisciplinesTable">
                        <tbody>
                        <tr>
                            <td>Дисциплина</td>
                            <td>Группа</td>
                            <td>Часы</td>
                            <td>В рас&#13;писании</td>
                            <td>Лекции</td>
                            <td>Практики</td>
                            <td>Отчётность</td>
                        </tr>
                        {groupDisciplinesItems}
                        </tbody>
                    </table>
                </div>
            ) : (this.state.groupId !== '') ? <h2>Дисциплин нет</h2> : null


        return (
            <App>
                <div className="groupDisciplinesDiv containerPadding1">
                    <h2>Дисциплины группы</h2>
                    <SelectField
                        floatingLabelText="Выберите группу"
                        value={this.state.groupId}
                        onChange={this.selectedGroupChanged.bind(this)}
                    >
                        {groupListItems}
                    </SelectField>
                    {groupDisciplinesTableDiv}
                </div>
            </App>
        )
    }
}

export default GroupDisciplines