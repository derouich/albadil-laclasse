import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import {
  Modal,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Typography,
  Divider,
  Button
} from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import * as API from '../../services';
import { useTranslation } from 'react-i18next';
import ReactGA from 'react-ga';
import { logout } from '../../actions';
import { useHistory } from 'react-router';
import { LocalStorage } from '../../services/localstorage.service';

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    outline: 'none',
    boxShadow: theme.shadows[20],
    width: 700,
    maxHeight: '100%',
    overflowY: 'auto',
    maxWidth: '100%'
  },
  container: {
    marginTop: theme.spacing(3),
    height: 200
  },
  actions: {
    justifyContent: 'flex-end'
  }
}));

function AccountDeleteConfirmationModal({
                                         open, onClose, className, ...rest
                                       }) {
  const classes = useStyles();
  const history = useHistory();
  const dispatch = useDispatch();
  const { t } = useTranslation(); //{t('calendar')}

  const token = useSelector((state) => state.user.token);

  const onAccountDelete = async () => {
    ReactGA.event({
      category: 'Settings',
      action: 'Click on Delete Account!'
    });

    API.deleteAccount(token)

      .then(() => {
        ['userToken'].forEach(propName => LocalStorage.removeItem(propName));
        ['persist:root'].forEach(propName => LocalStorage.removeItem(propName));
        history.push('/auth/login');

      }).catch((error) => { console.log(error); });
  };


  if (!open) {
    return null;
  }

  return (
    <Modal
      onClose={onClose}
      open={open}
    >
      <Card
        {...rest}
        className={clsx(classes.root, className)}
      >
        <CardHeader title={t('delete account')} />
        <Divider />
        <CardContent>
          <Typography variant="body1">
            {t('delete account message')}
          </Typography>
        </CardContent>
        <Divider />
        <CardActions className={classes.actions}>
          <Button onClick={onClose}>
            {t('dismiss')}
          </Button>
          <Button
            color="primary"
            onClick={onAccountDelete}
            variant="contained"
          >
            {t('delete')}
          </Button>
        </CardActions>
      </Card>
    </Modal>
  );
}

AccountDeleteConfirmationModal.propTypes = {
  className: PropTypes.string,
  onClose: PropTypes.func,
  open: PropTypes.bool
};

AccountDeleteConfirmationModal.defaultProps = {
  open: false,
  onClose: () => {}
};

export default AccountDeleteConfirmationModal;
