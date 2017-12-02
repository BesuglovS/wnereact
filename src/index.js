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

ReactDOM.render(
    <BrowserRouter basename="/">
        <div>
            <Route exact path="/" component={GroupWeekSchedule}/>
            <Route path="/groupDisciplines" component={GroupDisciplines}/>
            <Route path="/teacherDisciplines" component={TeacherDisciplines}/>
            <Route path="/teacherSchedule" component={TeacherSchedule}/>
            <Route path="/groupDaySchedule" component={GroupSchedule}/>
            <Route path="/buildingOneDaySpace" component={BuildingOneDaySpace}/>
            <Route path="/lastLesson" component={LastLesson}/>
        </div>
    </BrowserRouter>,
    document.getElementById('root'));
//registerServiceWorker();
