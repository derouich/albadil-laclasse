/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import validate from 'validate.js';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/styles';
import { Button, TextField } from '@material-ui/core';
import { login } from 'src/actions';
import * as API from '../../services';
import {ErrorSnackbar} from '../Snackbars';
import { useTranslation } from 'react-i18next';
import ReactGA from 'react-ga';
import Spinner from 'react-bootstrap/Spinner';

const useStyles = makeStyles((theme) => ({
  root: {},
  fields: {
    margin: theme.spacing(-1),
    display: 'flex',
    flexWrap: 'wrap',
    '& > *': {
      flexGrow: 1,
      margin: theme.spacing(1)
    }
  },
  submitButton: {
    marginTop: theme.spacing(2),
    width: '100%'
  }
}));

function LoginForm({ className, ...rest }) {
  const classes = useStyles();
  const { t } = useTranslation(); //{t('calendar')}

  const history = useHistory();
  const dispatch = useDispatch();
  const [formState, setFormState] = useState({
    isValid: false,
    values: {},
    touched: {},
    errors: {}
  });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [loginMessage, setLoginMessage] = useState(t('authentication failed'));
  const [disableSubmit, setDisableSubmit] = useState(false);

  const schema = {
    email: {
      presence: { allowEmpty: false, message: t('email is required') },
      email: {
        message: t('invalid email address')
      }
    },
    password: {
      presence: { allowEmpty: false, message: t('password is required') },
      length: {
        minimum: 3,
        message: t('password must be at least 6 characters')
      }
    }
  };


  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  const handleChange = (event) => {
    event.persist();

    setFormState((prevFormState) => ({
      ...prevFormState,
      values: {
        ...prevFormState.values,
        [event.target.name]:
          event.target.type === 'checkbox'
            ? event.target.checked
            : event.target.value.split(" ").join("")
      },
      touched: {
        ...prevFormState.touched,
        [event.target.name]: true
      }
    }));
  };


  const handleSubmit = async (event) => {
    event.preventDefault();

    setDisableSubmit(true);

    ReactGA.event({
      category: 'Login',
      action: 'Login to Account!'
    });

    API.login(formState.values)
      .then(userData => { dispatch(login(userData)); })
      .then(() => { history.push('/'); })
      .catch((error) => {
        setDisableSubmit(false);
        if (error.response && error.response.data && error.response.data.error && error.response.data.error.includes('403')) {
          setLoginMessage(t('user is not activated'));
        } else {
          setLoginMessage(t('authentication failed'));
        }
        setOpenSnackbar(true);
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
      onSubmit={handleSubmit}
    >
      <div className={classes.fields}>
        <TextField
          error={hasError('email')}
          fullWidth
          helperText={hasError('email') ? formState.errors.email[0] : null}
          label={t('email address')}
          name="email"
          onChange={handleChange}
          value={formState.values.email || ''}
          variant="outlined"
        />
        <TextField
          error={hasError('password')}
          fullWidth
          helperText={
            hasError('password') ? formState.errors.password[0] : null
          }
          label={t('password')}
          name="password"
          onChange={handleChange}
          type="password"
          value={formState.values.password || ''}
          variant="outlined"
        />
      </div>
      <ErrorSnackbar
        onClose={handleSnackbarClose}
        open={openSnackbar}
        errorMessage={loginMessage}
      />
      <Button
        className={classes.submitButton}
        color="primary"
        disabled={!formState.isValid || disableSubmit}
        size="large"
        type="submit"
        variant="contained"
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
            t('sign in')
        }
      </Button>
    </form>
  );
}

LoginForm.propTypes = {
  className: PropTypes.string
};

export default LoginForm;
