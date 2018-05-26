import React, {Component} from 'react';
import App from '../containers/App'
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import moment from 'moment'
import 'moment/locale/ru';

class LastLessonFaculty extends Component {
    state = {
        facultyId: '',
        facultiesList:[],
        lastLessonsList:[]
    }

    componentDidMount() {
        let facultiesAPIUrl = 'http://wiki.nayanova.edu/api.php?action=list&listtype=faculties';
        fetch(facultiesAPIUrl)
            .then((data) => data.json())
            .then((json) => {
                this.setState({
                    facultiesList: json
                })

                const facultyName = localStorage.getItem("facultyName");

                console.log(facultyName + ' was saved');

                let faculties = json.filter(g => g.Name === facultyName)

                if (faculties.length > 0) {
                    let faculty = faculties[0]

                    this.setState({ facultyId: faculty.FacultyId });
                    this.selectedFacultyChanged(null, null, faculty.FacultyId)
                }
            })
            .catch(function(error) {
                console.log(error)
            });
    }

    selectedFacultyChanged (e, key, val) {
        let faculties = this.state.facultiesList.filter(f => f.FacultyId === val)
        if (faculties.length > 0) {
            localStorage.setItem("facultyName", faculties[0].Name);
        }

        this.setState({
            facultyId: val
        })

        this.updateLastLessonsList(val)
    }

    updateLastLessonsList(facultyIdNumber) {
        let facultyId = (facultyIdNumber !== undefined) ? facultyIdNumber : this.state.groupId;
        if (facultyId === "" || facultyId === undefined) return
        //http://wiki.nayanova.edu/api.php?action=LastLessons&facultyId=1
        let lastLessonsAPIURL =
            'http://wiki.nayanova.edu/api.php?action=LastLessons&facultyId=' +
            facultyId;
        fetch(lastLessonsAPIURL)
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

        const groupListItems = this.state.facultiesList.map((faculty) =>
            <MenuItem key={faculty.FacultyId} value={faculty.FacultyId} primaryText={faculty.Name}/>
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
                        floatingLabelText="Выберите факультет"
                        value={this.state.facultyId}
                        onChange={this.selectedFacultyChanged.bind(this)}
                    >
                        {groupListItems}
                    </SelectField>
                    {lastLessonTableDiv}
                </div>
            </App>
        )
    }
}

export default LastLessonFaculty