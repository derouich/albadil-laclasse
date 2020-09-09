/* eslint-disable react/no-multi-comp */
/* eslint-disable react/display-name */
import React, { lazy } from 'react';
import { Redirect } from 'react-router-dom';
import AuthLayout from './layouts/Auth';
import ErrorLayout from './layouts/Error';
import DashboardLayout from './layouts/Dashboard';
import HomeView from './views/Home';
import ClassesView from './views/ClassesList';
import SettingsView from './views/Settings';
import LoginView from "./views/Login";
import CoursView from './views/Cours';
import RegisterView from './views/Register'
import WithAuth from './WithAuth';
import IsAuth from './IsAuth';
import CalendarView from './views/Calendar';
import ForgetPasswordView from './views/Login/ForgetPassword';
import CoursHistoryView from './views/Cours/History';
import ClassView from './views/ClassProfile';

export default [
  {
    path: '/',
    exact: true,
    component: () => <Redirect to="/home" />
  },

  {
    path: '/live',
    component: AuthLayout,
    routes: [
      {
        path: '/live/:id',
        exact: true,
        component: lazy(() => import('src/views/Login/ShareInput'))
      },
      {
        component: () => <Redirect to="/errors/error-404" />
      }
    ]
  },

  {
    path: '/auth',
    component: IsAuth(AuthLayout),
    routes: [
      {
        path: '/auth/login',
        exact: true,
        component: LoginView
      },
      {
        path: '/auth/register',
        exact: true,
        component: RegisterView
      },
      {
        path: '/auth/forgetPassword',
        exact: true,
        component: ForgetPasswordView
      },
      {
        component: () => <Redirect to="/errors/error-404" />
      }
    ]
  },
  {
    path: '/errors',
    component: ErrorLayout,
    routes: [
      {
        path: '/errors/error-401',
        exact: true,
        component: lazy(() => import('src/views/Errors/Error401'))
      },
      {
        path: '/errors/error-404',
        exact: true,
        component: lazy(() => import('src/views/Errors/Error404'))
      },
      {
        path: '/errors/error-500',
        exact: true,
        component: lazy(() => import('src/views/Errors/Error500'))
      },
      {
        component: () => <Redirect to="/errors/error-404" />
      }
    ]
  },
  {
    route: '*',
    component: WithAuth(DashboardLayout),
    routes: [
      {
        path: '/calendar',
        exact: true,
        component: CalendarView
      },
      {
        path: '/Cours/History',
        exact: true,
        component: CoursHistoryView
      },

      {
        path: '/home',
        exact: true,
        component: WithAuth(HomeView)
      },
      {
        path: '/classes',
        exact: true,
        component: WithAuth(ClassesView)
      },
      {
        path: '/cours',
        exact: true,
        component: WithAuth(CoursView)
      },
      {
        path: '/classe/:id',
        exact: true,
        component: WithAuth(ClassView)
      },
      {
        path: '/classe/:id/:tab',
        exact: true,
        component: WithAuth(ClassView)
      },
      {
        path: '/settings/:tab',
        exact: true,
        component: WithAuth(SettingsView)
      },
      {
        component: () => <Redirect to="/errors/error-404" />
      }
    ]
  }
];
