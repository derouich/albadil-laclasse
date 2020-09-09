import React, { useState } from 'react';
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
import { useSelector } from 'react-redux';
import * as API from '../../services';
import { useTranslation } from 'react-i18next';
import Spinner from 'react-bootstrap/Spinner';

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

function CoursArchiveConfirmationModal({
                                        open, onClose, className, thecours, ...rest
                                      }) {
  const classes = useStyles();
  const { t } = useTranslation(); //{t('calendar')}

  const [disableArchiveButton, setDisableArchiveButton] = useState(false);

  const token = useSelector((state) => state.user.token);

  const onCoursArchive = async () => {

    setDisableArchiveButton(true);

    let data = {
      isActive: false
    };
    API.updateRoom(thecours._id, data, token)

      .then(() => {
        window.location.reload();

      }).catch((error) => {
      setDisableArchiveButton(false);
    });
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
        <CardHeader title={t('archive course') + ' ' + thecours.roomName} />
        <Divider />
        <CardContent>
          <Typography variant="body1">
            {t('archive message', { thingToArchive: t('course')})}
          </Typography>
        </CardContent>
        <Divider />
        <CardActions className={classes.actions}>

          <Button onClick={onClose}>
            {t('dismiss')}
          </Button>

          <Button
            color="primary"
            onClick={onCoursArchive}
            variant="contained"
            disabled={disableArchiveButton}
          >
            {
              disableArchiveButton ?
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
                :
                t('confirm')
            }
          </Button>

        </CardActions>
      </Card>
    </Modal>
  );
}

CoursArchiveConfirmationModal.propTypes = {
  className: PropTypes.string,
  onClose: PropTypes.func,
  open: PropTypes.bool
};

CoursArchiveConfirmationModal.defaultProps = {
  open: false,
  onClose: () => {}
};

export default CoursArchiveConfirmationModal;
