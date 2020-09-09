import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import {
  Popover,
  CardHeader,
  Divider,
  colors
} from '@material-ui/core';
import NotificationList from './NotificationList';
import Placeholder from './Placeholder';
import { useTranslation } from 'react-i18next';
const useStyles = makeStyles(() => ({
  root: {
    width: 350,
    maxWidth: '100%'
  },
  actions: {
    backgroundColor: colors.grey[50],
    justifyContent: 'center'
  }
}));

function NotificationsPopover({ notifications, newNotifications, anchorEl, ...rest }) {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Popover
      {...rest}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center'
      }}
    >
      <div className={classes.root}>
        <CardHeader title={t('notifications')} />
        <Divider />
        {notifications.length > 0 ? (
          <NotificationList notifications={notifications} newNotifications={newNotifications} />
        ) : (
          <Placeholder />
        )}

        {/*<Divider />
        <CardActions className={classes.actions}>
          <Button
            component={RouterLink}
            size="small"
            to="#"
          >
            See all
          </Button>
        </CardActions>*/}
      </div>
    </Popover>
  );
}

NotificationsPopover.propTypes = {
  anchorEl: PropTypes.any,
  className: PropTypes.string,
  notifications: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired
};

export default NotificationsPopover;
