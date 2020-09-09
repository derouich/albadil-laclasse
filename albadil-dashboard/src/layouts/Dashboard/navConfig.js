/* eslint-disable react/no-multi-comp */
/* eslint-disable react/display-name */
import React from 'react';
import ArchiveOutlinedIcon from '@material-ui/icons/ArchiveOutlined';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import HomeIcon from '@material-ui/icons/HomeOutlined';
import SchoolIcon from '@material-ui/icons/School';
import BookIcon from '@material-ui/icons/Book';
import SettingsIcon from '@material-ui/icons/SettingsOutlined';
import InputIcon from '@material-ui/icons/Input';


export default [
  {
    subheader: 'menu',
    items: [
      {
        title: 'home',
        href: '/home',
        icon: HomeIcon
      },
      {
        title: 'calendar',
        href: '/calendar',
        icon: CalendarTodayIcon,
       // label: () => <Label color={colors.green[500]}>New</Label>
      },
      {
        title: 'my classes',
        href: '/classes',
        icon: SchoolIcon
      },
      {
        title: 'my courses',
        href: '/cours',
        icon: BookIcon
      },
      {
        title: 'courses archive',
        href: '/Cours/History',
        icon: ArchiveOutlinedIcon
      },
      {
        title: 'my profile',
        href: '/settings/general',
        icon: SettingsIcon
      },
      {
        title: 'sign out',
        href: '#',
        icon: InputIcon,
        isLogout: 'true'
      }
    ]
  },

];
