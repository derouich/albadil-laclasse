import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { Snackbar, SnackbarContent, colors } from '@material-ui/core';
import ErrorOutline from '@material-ui/icons/ErrorOutline';
import CheckCircleIcon from '@material-ui/icons/CheckCircleOutlined';
import { useTranslation } from 'react-i18next';

const useStylesForError = makeStyles((theme) => ({
  content: {
    backgroundColor: colors.red[600]
  },
  message: {
    display: 'flex',
    alignItems: 'center'
  },
  icon: {
    marginRight: theme.spacing(2)
  }
}));

const useStylesForSuccess = makeStyles((theme) => ({
  content: {
    backgroundColor: colors.green[600]
  },
  message: {
    display: 'flex',
    alignItems: 'center'
  },
  icon: {
    marginRight: theme.spacing(2)
  }
}));


const useStylesForInfo = makeStyles((theme) => ({
  content: {
    backgroundColor: colors.blue[600]
  },
  message: {
    display: 'flex',
    alignItems: 'center'
  },
  icon: {
    marginRight: theme.spacing(2)
  }
}));

export const ErrorSnackbar = ({ open, onClose, errorMessage }) =>{
  const classes = useStylesForError();

  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center'
      }}
      autoHideDuration={1500}
      onClose={onClose}
      open={open}
    >
      <SnackbarContent
        className={classes.content}
        message={(
          <span className={classes.message}>
            <ErrorOutline className={classes.icon} />
            {errorMessage ? errorMessage : 'Oops! Something went wrong.'}
          </span>
        )}
        variant="h6"
      />
    </Snackbar>
  );
};




export const SuccessSnackbar = ({ open, onClose, message })=> {
  const classes = useStylesForSuccess();

  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center'
      }}
      autoHideDuration={6000}
      onClose={onClose}
      open={open}
    >
      <SnackbarContent
        className={classes.content}
        message={(
          <span className={classes.message}>
            <CheckCircleIcon className={classes.icon} />
            {message}
          </span>
        )}
        variant="h6"
      />
    </Snackbar>
  );
};



export const InfoSnackbar = ({ open, onClose, errorMessage })=> {
  const classes = useStylesForInfo();
  const { t } = useTranslation(); //{t('calendar')}


  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center'
      }}
      autoHideDuration={2500}
      onClose={onClose}
      open={open}
    >
      <SnackbarContent
        className={classes.content}
        message={(
          <span className={classes.message}>
            <ErrorOutline className={classes.icon} />
            {errorMessage ? errorMessage : t('something went wrong')}
          </span>
        )}
        variant="h6"
      />
    </Snackbar>
  );
};

InfoSnackbar.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool
};

InfoSnackbar.defaultProps = {
  open: true,
  onClose: () => {}
};


SuccessSnackbar.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool
};

SuccessSnackbar.defaultProps = {
  open: true,
  onClose: () => {}
};


ErrorSnackbar.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool
};

ErrorSnackbar.defaultProps = {
  open: true,
  onClose: () => {}
};

