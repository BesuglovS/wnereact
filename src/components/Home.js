import React from 'react';
import {MuiThemeProvider} from "material-ui";
import App from '../App'
import {Link} from 'react-router-dom'
import {Card, CardHeader, CardText} from 'material-ui/Card';

const Home = () => (
    <MuiThemeProvider>
        <App>
            <Card>
                <CardText>
                    <Link to="/groupSchedule" style={{ textDecoration: 'none' }}>
                        <a className="HomeMenu">Расписание группы</a>
                    </Link>

                    <br />

                    <Link to="/teacherSchedule" style={{ textDecoration: 'none' }}>
                        <a className="HomeMenu">Расписание преподавателя</a>
                    </Link>

                    <br />

                    <Link to="/groupDisciplines" style={{ textDecoration: 'none' }}>
                        <a className="HomeMenu">Дисциплины группы</a>
                    </Link>

                    <br />

                    <Link to="/teacherDisciplines" style={{ textDecoration: 'none' }}>
                        <a className="HomeMenu">Дисциплины преподавателя</a>
                    </Link>

                    <br />

                    <Link to="/buildingOneDaySpace" style={{ textDecoration: 'none' }}>
                        <a className="HomeMenu">Занятость корпуса</a>
                    </Link>
                </CardText>
            </Card>
        </App>
    </MuiThemeProvider>
)

export default Home