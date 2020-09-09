/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/styles';
import { Button, TextField, colors } from '@material-ui/core';
import * as API from '../../../services';
import validate from 'validate.js';
import {ErrorSnackbar} from '../../Snackbars';
import { useTranslation } from 'react-i18next';


const schema = {
  password: {
    presence: { allowEmpty: false, message: 'is required' },
    length: {
      maximum: 100,
      minimum: 5
    }
  },
   confirm: {
    presence: { allowEmpty: false, message: 'is required' },
    length: {
      maximum: 100,
      minimum: 5
    }
  },
};


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
    backgroundColor: '#388e3c',
    color:'white',
    '&:hover': {
      backgroundColor: colors.green[900]
    }

}
}));

function ForgetForm({ className, ...rest }) {
  const classes = useStyles();
  const { t } = useTranslation(); //{t('calendar')}

  const history = useHistory();
  const dispatch = useDispatch();

  const [openFailedSnackbar, setFailedSnackbar] = useState(false);
  const [errorMessage, setErrorMessage] = useState(t('something went wrong'));

  let params = new URLSearchParams(useLocation().search);

  const [values, setValues] = useState({
    password: '',
    confirm: ''
  });

  const handleChange = (event) => {
    setValues({
      ...values,
      [event.target.name]: event.target.value
    });
  };

  const valid = values.password && values.password === values.confirm && values.password.length >= 6;

  const handlePasswordReset = () => {
    let data = {
      password: values.password,
      email: params.get("email"),
      token: params.get("token"),

    };

    API.resetPassword(data)

      .then(() => {
        history.push('/auth/login?password_reset=true');
      })
      .catch(() => {
        setErrorMessage(t('password reset link is expired or already used'));
        setFailedSnackbar(true);
      });
  };

  return (
    <form
      {...rest}
      className={clsx(classes.root, className)}
    >
      <div className={classes.fields}>
        <TextField
          fullWidth
          label={t('password')}
          name="password"
          onChange={handleChange}
          type="password"
          value={values.password}
          variant="outlined"
        />
        <TextField
          fullWidth
          label={t('confirm password')}
          name="confirm"
          onChange={handleChange}
          type="password"
          name="confirm"
          value={values.confirm}
          variant="outlined"
        />
      </div>

      <Button
        className={classes.submitButton}
        color="primary"
        disabled={!valid}
        size="large"
        variant="contained"
        onClick={() => handlePasswordReset()}
      >
        {t('confirm')}
      </Button>
      <ErrorSnackbar
        onClose={()=> setFailedSnackbar(false)}
        open={openFailedSnackbar}
        errorMessage={errorMessage}
      />
    </form>
  );
}

ForgetForm.propTypes = {
  className: PropTypes.string
};

export default ForgetForm;
