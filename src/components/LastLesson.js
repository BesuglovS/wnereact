import React, {Component} from 'react';
import App from '../containers/App'
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import moment from 'moment'
import 'moment/locale/ru';

class LastLesson extends Component {
    state = {
        groupId: '',
        groupsList:[],
        lastLessonsList:[]
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

        this.updateLastLessonsList(val)
    }

    updateLastLessonsList(groupId) {
        let studentGroupId = (groupId !== undefined) ? groupId : this.state.groupId;
        if (studentGroupId === "") return
        //http://wiki.nayanova.edu/api.php?action=LastLessons&groupId=15
        let dailyScheduleAPIUrl =
            'http://wiki.nayanova.edu/api.php?action=LastLessons&groupId=' +
            studentGroupId;
        fetch(dailyScheduleAPIUrl)
            .then((data) => data.json())
            .then((json) => {
                this.setState({
                    lastLessonsList: json
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

        let lastLessonsItems = this.state.lastLessonsList.map((disc, index) => {
            let fancyDate = moment(disc.lastLessonDate).locale('ru').format('DD MMMM YYYY');
            return (
                <tr key={index}>
                    <td>{disc.Name}</td>
                    <td>{disc.GroupName}</td>
                    <td>{fancyDate}</td>
                    <td>{disc.teacherFIO}</td>
                    <td>{Attestation[disc.Attestation]}</td>
                </tr>
            )})

        let lastLessonTableDiv =
            (this.state.lastLessonsList.length !== 0) ? (
                <div className="groupDisciplinesTableDiv">
                    <table className="groupDisciplinesTable">
                        <tbody>
                        {lastLessonsItems}
                        </tbody>
                    </table>
                </div>
            ) : (this.state.groupId !== '') ? <h2>Дисциплин нет</h2> : null


        return (
            <App>
                <div className="lastLessonDiv containerPadding1">
                    <h2>Последний урок</h2>
                    <SelectField
                        floatingLabelText="Выберите группу"
                        value={this.state.groupId}
                        onChange={this.selectedGroupChanged.bind(this)}
                    >
                        {groupListItems}
                    </SelectField>
                    {lastLessonTableDiv}
                </div>
            </App>
        )
    }
}

export default LastLesson