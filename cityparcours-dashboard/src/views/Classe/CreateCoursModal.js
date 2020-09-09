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
import CreateCours from '../Classe/CreateCours';
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

function CreateCoursModal({
                            open, currentClasseId , onClose, className, ...rest
                          }) {
  const classes = useStyles();
  const { t } = useTranslation(); //{t('calendar')}

  const [disableSubmit, setDisableSubmit] = useState(false);

  function handleDisableSubmit(newValue) {
    setDisableSubmit(newValue);
  }

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
        <CardHeader title={t('Course Creation')} />
        <Divider />
        <CardContent>

          <CreateCours currentClasseId={currentClasseId} onChange={handleDisableSubmit} />

        </CardContent>
        <Divider />
        <CardActions className={classes.actions}>
          <Button onClick={onClose}>
            {t('dismiss')}
          </Button>
          <Button
            style={{backgroundColor : disableSubmit ? '#919191' : '#388e3c' , color:'white'}}
            color="primary"
            variant="contained"
            type="submit"
            form="createCoursForm"
            disabled={disableSubmit}
          >
            {
              disableSubmit ?
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

CreateCoursModal.propTypes = {
  className: PropTypes.string
};

export default CreateCoursModal;

