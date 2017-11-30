import React, { Component } from 'react';
import './App.css';
import {MuiThemeProvider} from "material-ui";
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import AppBar from 'material-ui/AppBar'
import {Link} from 'react-router-dom'

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
                            width={250}
                            open={this.state.menuOpen}
                            onRequestChange={(menuOpen) => this.setState({menuOpen})}
                        >
                            <Link to="/" style={{ textDecoration: 'none' }}>
                                <MenuItem onClick={this.handleClose}>Главная</MenuItem>
                            </Link>

                            <Link to="/groupSchedule" style={{ textDecoration: 'none' }}>
                                <MenuItem onClick={this.handleClose}>Расписание группы</MenuItem>
                            </Link>

                            <Link to="/teacherSchedule" style={{ textDecoration: 'none' }}>
                                <MenuItem onClick={this.handleClose}>Расписание преподавателя</MenuItem>
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
