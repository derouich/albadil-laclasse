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
  Divider,
  Button
} from '@material-ui/core';
import EditClasse from '../Classe/EditClasse';
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

function EditClassModal({
                     open, onClose, className, theclasse, ...rest
                   }) {
  const classes = useStyles();
  const { t } = useTranslation(); //{t('calendar')}

  const [disableEditButton, setDisableEditButton] = useState(false);

  const disableEdit = (state) => {
    setDisableEditButton(state);
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
        <CardHeader title={t('class update')} />
        <Divider />
        <CardContent>

          <EditClasse onChange={disableEdit} theclasse={theclasse} />

        </CardContent>
        <Divider />
        <CardActions className={classes.actions}>

          <Button onClick={onClose}>
            {t('dismiss')}
          </Button>

          <Button
            style={{backgroundColor : '#388e3c' , color:'white'}}
            color="primary"
            variant="contained"
            type="submit"
            form="editClassForm"
            disabled={disableEditButton}
          >
            {
              disableEditButton ?
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
                :
                t('update')
            }
          </Button>

        </CardActions>
      </Card>
    </Modal>
  );
}

EditClassModal.propTypes = {
  className: PropTypes.string,
  onClose: PropTypes.func,
  open: PropTypes.bool
};

EditClassModal.defaultProps = {
  open: false,
  onClose: () => {}
};

export default EditClassModal;

