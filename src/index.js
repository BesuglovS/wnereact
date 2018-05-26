import React from 'react';
import ReactDOM from 'react-dom';
// import registerServiceWorker from './registerServiceWorker';
import { BrowserRouter, Route } from 'react-router-dom'
import GroupSchedule from "./components/GroupSchedule";
import GroupWeekSchedule from "./components/GroupWeekSchedule";
import GroupDisciplines from './components/GroupDisciplines'
import TeacherDisciplines from './components/TeacherDisciplines'
import TeacherSchedule from './components/TeacherSchedule'
import BuildingOneDaySpace from './components/BuildingOneDaySpace'
import LastLesson from './components/LastLesson'
import LastLessonFaculty from "./components/LastLessonFaculty";
import DisciplineLessons from "./components/DisciplineLessons";
import GroupSession from "./components/GroupSession";
import TeacherSession from "./components/TeacherSession";
import TeacherLessons from "./components/TeacherLessons";

ReactDOM.render(
    <BrowserRouter basename="/md">
        <div>
            <Route exact path="/" component={GroupWeekSchedule}/>
            <Route path="/groupDisciplines" component={GroupDisciplines}/>
            <Route path="/teacherDisciplines" component={TeacherDisciplines}/>
            <Route path="/teacherSchedule" component={TeacherSchedule}/>
            <Route path="/groupDaySchedule" component={GroupSchedule}/>
            <Route path="/buildingOneDaySpace" component={BuildingOneDaySpace}/>
            <Route path="/lastLesson" component={LastLesson}/>
            <Route path="/lastLessonFaculty" component={LastLessonFaculty}/>
            <Route path="/disciplineLessons" component={DisciplineLessons}/>
            <Route path="/groupSession" component={GroupSession}/>
            <Route path="/teacherSession" component={TeacherSession}/>
            <Route path="/teacherLessons" component={TeacherLessons}/>
        </div>
    </BrowserRouter>,
    document.getElementById('root'));
//registerServiceWorker();
