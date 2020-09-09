/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/styles';
import { Button, TextField } from '@material-ui/core';
import { login } from 'src/actions';
import * as API from '../../../services';
import validate from 'validate.js';
import { ErrorSnackbar, InfoSnackbar } from '../../Snackbars';
import { useTranslation } from 'react-i18next';
import Spinner from 'react-bootstrap/Spinner';




const useStyles = makeStyles((theme) => ({
  root: {},
  fields: {
    margin: theme.spacing(2),
    display: 'flex',
    flexWrap: 'wrap',
    '& > *': {
      flexGrow: 1,
      margin: theme.spacing(1)
    }
  },
  submitButton: {
    marginTop: theme.spacing(2),
    width: '100%',
    backgroundColor : '#388e3c',
    '&:hover': {
      backgroundColor: '#008e13'
    }
  }
}));

function ShareForm({ roomCode, className, ...rest }) {
  const classes = useStyles();
  const { t } = useTranslation(); //{t('calendar')}

  const [openFailedSnackbar, setFailedSnackbar] = useState(false);
  const [isStartCoursClicked, setIsStartCoursClicked] = useState(false);
  const [startLoadingCours, setStartLoadingCours] = useState(false);
  const [errorMessage, setErrorMessage] = useState(t('share denied'));
  const [infoMessage, setInfoMessage] = useState('');
  const [openInfoSnackbar, setOpenInfoSnackbar] = useState(false);

  const schema = {
      email: {
        presence: { allowEmpty: false, message: t('email is required') },
        email: {
          message: t('invalid email address')
        }
      }
  };
  //let params = new URLSearchParams(useLocation().search);

  const [formState, setFormState] = useState({
    isValid: false,
    values: {},
    touched: {},
    errors: {}
  });

  const handleInfoSnackbarClose = () => {
    setOpenInfoSnackbar(false);
  };

  const handleChange = (event) => {
      event.persist();

      setFormState((prevFormState) => ({
      ...prevFormState,
      values: {
        ...prevFormState.values,
        [event.target.name]: event.target.value
      },
      touched: {
        ...prevFormState.touched,
        [event.target.name]: true
      }
    }));

  };


  // roomCode

  const handleRoomStart = () => {

    setIsStartCoursClicked(true);
    setStartLoadingCours(true);
    let data = {
      roomCode: roomCode,
      userEmail: formState.values.email,
      isGustaveDashboard: true
    };

    API.startRoom(data)

      .then((response) => {

        if (response.isModerator) {
          setErrorMessage(t("as a professor you can't access your course in here!"));
          setIsStartCoursClicked(false);
          setStartLoadingCours(false);
          setFailedSnackbar(true);
        } else {
          if (response.roomURL) {
            window.location.href = response.roomURL;
          } else {
            //history.push('/');
            setErrorMessage(t("share denied"));
            setIsStartCoursClicked(false);
            setStartLoadingCours(false);
            setFailedSnackbar(true);
          }
        }
      })
      .catch((error) => {
        setErrorMessage(t(''));
        setIsStartCoursClicked(false);
        setStartLoadingCours(false);
        setFailedSnackbar(true);
      });
  };

  const hasError = (field) => (!!(formState.touched[field] && formState.errors[field]));

  useEffect(() => {
    const errors = validate(formState.values, schema, {fullMessages: false});
    setFormState((prevFormState) => ({
      ...prevFormState,
      isValid: !errors,
      errors: errors || {}
    }));
  }, [formState.values]);

  return (
    <form
      {...rest}
      className={clsx(classes.root, className)}
    >
      <div className={classes.fields}>
      <TextField
          error={hasError('email')}
          fullWidth
          helperText={hasError('email') ? formState.errors.email[0] : null}
          label={t('email address')}
          name="email"
          required
          onChange={handleChange}
          value={formState.values.email || ''}
          variant="outlined"
        />
      </div>

      <Button
        className={classes.submitButton}
        color="primary"
        //disabled={!valid}
        disabled={!formState.isValid || isStartCoursClicked}
        size="large"
        variant="contained"
        onClick={() => handleRoomStart()}
      >
        {
          startLoadingCours ?
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            />
            :
            t('start')
        }
      </Button>

      <ErrorSnackbar
          onClose={()=> setFailedSnackbar(false)}
          open={openFailedSnackbar}
          errorMessage={errorMessage}
      />

      <InfoSnackbar
        onClose={handleInfoSnackbarClose}
        open={openInfoSnackbar}
        errorMessage={infoMessage}
      />
    </form>
  );
}

ShareForm.propTypes = {
  className: PropTypes.string
};

export default ShareForm;
