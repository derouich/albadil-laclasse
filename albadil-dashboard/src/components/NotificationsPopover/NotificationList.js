import React, { useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import moment from 'moment';
import { makeStyles } from '@material-ui/styles';
import {
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText
} from '@material-ui/core';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import SchoolIcon from '@material-ui/icons/School';
import BookIcon from '@material-ui/icons/Book';
import CodeIcon from '@material-ui/icons/Code';
import StoreIcon from '@material-ui/icons/Store';
import gradients from 'src/utils/gradients';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import * as API from '../../services';

const useStyles = makeStyles((theme) => ({
  root: {},
  listItem: {
    '&:hover': {
      backgroundColor: theme.palette.background.default
    }
  },
  avatarBlue: {
    backgroundImage: gradients.blue
  },
  avatarGreen: {
    backgroundImage: gradients.green
  },
  avatarOrange: {
    backgroundImage: gradients.orange
  },
  avatarIndigo: {
    backgroundImage: gradients.indigo
  },
  arrowForwardIcon: {
    color: theme.palette.icon
  }
}));

function NotificationList({ notifications, newNotifications, className, ...rest }) {
  const classes = useStyles();
  const { t } = useTranslation(); //{t('calendar')}

  const token = useSelector((state) => state.user.token);

  useEffect(() => {
    let mounted = true;

    let notificationsIDs = [];

    for (let notif of newNotifications) {
      notificationsIDs.push(notif._id);
    }

    let data = {
      notificationsIDs: notificationsIDs
    };

    const updateIsSeenNotifications = () => {
      API.updateIsSeenNotifications(data, token)
        .then(() => {
        })
        .catch((error) => { console.log(error); });
    };

    updateIsSeenNotifications();

    return () => {
      mounted = false;
    };
  }, []);


  const avatars = {
    classe: (
      <Avatar className={classes.avatarGreen}>
        <SchoolIcon />
      </Avatar>
    ),
    room: (
      <Avatar className={classes.avatarBlue}>
        <BookIcon />
      </Avatar>
    ),
    project: (
      <Avatar className={classes.avatarGreen}>
        <StoreIcon />
      </Avatar>
    ),
    feature: (
      <Avatar className={classes.avatarIndigo}>
        <CodeIcon />
      </Avatar>
    )
  };

  return (
    <List
      {...rest}
      className={clsx(classes.root, className)}
      disablePadding
    >

      {
        notifications.map((notification, i) => (

          i >= 10 ? null :
            <ListItem
              className={classes.listItem}
              component={RouterLink}
              divider={i < notifications.length - 1}
              key={notification._id}
              to={notification.type === 'room' ? '/cours' : '/classe/' + notification.thisTypeId}
            >
              <ListItemAvatar>{avatars[notification.type]}</ListItemAvatar>
              <ListItemText
                primary={ t('you are invited to') + ' ' + notification.title + ' ' + t('by') + ' ' + notification.createdBy}
                primaryTypographyProps={{ variant: 'body1' }}
                secondary={moment(notification.createdAt).fromNow()}
              />
              <ArrowForwardIcon className={classes.arrowForwardIcon} />
            </ListItem>
        ))
      }
    </List>
  );
}

NotificationList.propTypes = {
  className: PropTypes.string,
  notifications: PropTypes.array.isRequired
};

export default NotificationList;
