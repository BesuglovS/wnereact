import React, {Component} from 'react';
import App from '../containers/App'
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

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

        let groupDisciplinesItems = Object.keys(this.state.groupDisciplines).map((index) => (
            <tr key={index}>
                <td>{this.state.groupDisciplines[index].Name}</td>
                <td>{this.state.groupDisciplines[index].GroupName}</td>
                <td>{this.state.groupDisciplines[index].AuditoriumHours}</td>
                <td>{this.state.groupDisciplines[index].hoursCount}</td>
                <td>{Attestation[this.state.groupDisciplines[index].Attestation]}</td>
            </tr>
        ))

        let groupDisciplinesTableDiv =
            (this.state.groupDisciplines.length !== 0) ? (
                <div className="groupDisciplinesTableDiv">
                    <table className="groupDisciplinesTable smallerFont">
                        <tbody>
                        <tr>
                            <td>Дисциплина</td>
                            <td>Группа</td>
                            <td>Часы</td>
                            <td>В расписании</td>
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
