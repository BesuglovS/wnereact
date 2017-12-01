import React from 'react';
import ReactDOM from 'react-dom';
// import registerServiceWorker from './registerServiceWorker';
import { BrowserRouter, Route } from 'react-router-dom'
import GroupSchedule from "./components/GroupSchedule";
import GroupDisciplines from './components/GroupDisciplines'
import TeacherDisciplines from './components/TeacherDisciplines'
import TeacherSchedule from './components/TeacherSchedule'
import BuildingOneDaySpace from './components/BuildingOneDaySpace'

ReactDOM.render(
    <BrowserRouter basename="/md">
        <div>
            <Route exact path="/" component={GroupSchedule}/>
            <Route path="/groupDisciplines" component={GroupDisciplines}/>
            <Route path="/teacherDisciplines" component={TeacherDisciplines}/>
            <Route path="/teacherSchedule" component={TeacherSchedule}/>
            <Route path="/BuildingOneDaySpace" component={BuildingOneDaySpace}/>
        </div>
    </BrowserRouter>,
    document.getElementById('root'));
//registerServiceWorker();
