import React, { Component } from 'react';
import '../css/App.css';
import {MuiThemeProvider} from "material-ui";
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import AppBar from 'material-ui/AppBar'
import {Link} from 'react-router-dom'
import MenuIcon from 'material-ui/svg-icons/navigation/menu'
import Divider from 'material-ui/Divider';

const iconStyles = {
    marginRight: 24,
    cursor: "pointer"
};


class App extends Component {
    constructor(props) {
        super(props);
        this.state = {menuOpen: false};
    }

    handleToggle = () => this.setState({menuOpen: !this.state.menuOpen});

    handleClose = () => this.setState({menuOpen: false});

    render() {
        return (
                <MuiThemeProvider>
                    <div>
                        <AppBar
                            title={"Расписание СГОАН"}
                            iconClassNameRight="muidocs-icon-navigation-expand-more"
                            onLeftIconButtonTouchTap={this.handleToggle}
                        />

                        <Drawer
                            docked={false}
                            width={280}
                            open={this.state.menuOpen}
                            onRequestChange={(menuOpen) => this.setState({menuOpen})}
                        >
                            <div onClick={this.handleClose}
                                 className="containerPadding1 menuTop">
                                <MenuIcon style={iconStyles} />
                                <span>Расписание СГОАН</span>
                            </div>

                            <Divider />

                            <Link to="/" style={{ textDecoration: 'none' }}>
                                <MenuItem onClick={this.handleClose}>Расписание группы на неделю</MenuItem>
                            </Link>

                            <Link to="/groupDaySchedule" style={{ textDecoration: 'none' }}>
                                <MenuItem onClick={this.handleClose}>Расписание группы на один день</MenuItem>
                            </Link>

                            <Link to="/teacherSchedule" style={{ textDecoration: 'none' }}>
                                <MenuItem onClick={this.handleClose}>Расписание преподавателя</MenuItem>
                            </Link>

                            <Link to="/groupSession" style={{ textDecoration: 'none' }}>
                                <MenuItem onClick={this.handleClose}>Экзамены по группам</MenuItem>
                            </Link>

                            <Link to="/teacherSession" style={{ textDecoration: 'none' }}>
                                <MenuItem onClick={this.handleClose}>Экзамены преподавателя</MenuItem>
                            </Link>

                            <Link to="/groupDisciplines" style={{ textDecoration: 'none' }}>
                                <MenuItem onClick={this.handleClose}>Дисциплины группы</MenuItem>
                            </Link>

                            <Link to="/teacherDisciplines" style={{ textDecoration: 'none' }}>
                                <MenuItem onClick={this.handleClose}>Дисциплины преподавателя</MenuItem>
                            </Link>

                            <Link to="/buildingOneDaySpace" style={{ textDecoration: 'none' }}>
                                <MenuItem onClick={this.handleClose}>Занятость корпуса</MenuItem>
                            </Link>

                            <Link to="/lastLesson" style={{ textDecoration: 'none' }}>
                                <MenuItem onClick={this.handleClose}>Последний урок</MenuItem>
                            </Link>

                            <Link to="/disciplineLessons" style={{ textDecoration: 'none' }}>
                                <MenuItem onClick={this.handleClose}>Список занятий по дисциплине</MenuItem>
                            </Link>

                            <Link to="/teacherLessons" style={{ textDecoration: 'none' }}>
                                <MenuItem onClick={this.handleClose}>Список занятий преподавателя</MenuItem>
                            </Link>
                        </Drawer>
                        <main>
                            {this.props.children}
                        </main>
                    </div>
                </MuiThemeProvider>
        );
    }
}

export default App;
