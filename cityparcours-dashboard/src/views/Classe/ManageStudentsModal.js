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
  Divider,
  Button
} from '@material-ui/core';
import ManageStudents from '../Classe/ManageStudents';
import { useTranslation } from 'react-i18next';

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

function ManageStudentsModal({
      open, onClose, className, isClasse, thisthingid, ...rest
  }) {
  const classes = useStyles();
  const { t } = useTranslation(); //{t('calendar')}

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
        <CardHeader title={t('manage your students')} />

        <Divider />

        <ManageStudents isClasse={isClasse} thisthingid={thisthingid} onClose={onClose} />
      </Card>
    </Modal>
  );
}

ManageStudentsModal.propTypes = {
  className: PropTypes.string,
  onClose: PropTypes.func,
  open: PropTypes.bool
};

ManageStudentsModal.defaultProps = {
  open: false,
  onClose: () => {}
};

export default ManageStudentsModal;

