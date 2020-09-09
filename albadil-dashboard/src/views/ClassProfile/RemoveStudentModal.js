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
import * as API from '../../services';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import ReactGA from 'react-ga';

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

function RemoveStudentModal({
  open, onClose, className, student, classeid, ...rest
}) {
  const classes = useStyles();
  const { t } = useTranslation(); //{t('calendar')}

  const token = useSelector((state) => state.user.token);

  const handleDeleteStudent = () => {

    ReactGA.event({
      category: 'Classe',
      action: 'Delete student from classe!'
    });

    API.deleteUser(student._id, classeid, token)
      .then(() => {
        window.location.reload();
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
        <CardHeader title={t('delete student')} />
        <Divider />
        <CardContent>
          <Typography variant="body1">
            {t('delete student message')}
            <strong>{' ' + student.fullName + ' '}</strong>
            {t('from this classe')}
          </Typography>
        </CardContent>
        <Divider />
        <CardActions className={classes.actions}>
          <Button onClick={onClose}>
            {t('no')}
          </Button>

          <Button
            color="primary"
            style={{backgroundColor : '#d9534f' , color:'white'}}
            onClick={handleDeleteStudent}
            variant="contained"
          >
            {t('yes')}
          </Button>
        </CardActions>
      </Card>
    </Modal>
  );
}

RemoveStudentModal.propTypes = {
  className: PropTypes.string,
  onClose: PropTypes.func,
  open: PropTypes.bool
};

RemoveStudentModal.defaultProps = {
  open: false,
  onClose: () => {}
};

export default RemoveStudentModal;
