import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import validate from 'validate.js';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import {
  Button,
  Checkbox,
  FormHelperText,
  TextField,
  Typography,
  Link, Radio, colors
} from '@material-ui/core';
import * as API from '../../services';
import { useDispatch } from 'react-redux';
import { login } from 'src/actions';
import Select from 'react-select';

import {ErrorSnackbar,InfoSnackbar} from '../Snackbars';

// import array from json
import city from '../../mock/villeMaroc.json';
import { useTranslation } from 'react-i18next';
import ReactGA from 'react-ga';
import Spinner from 'react-bootstrap/Spinner';

const allCity = city.allcity;

const customStylesSelector = {
   option: (provided, state) => ({
    ...provided,
   // borderBottom: '1px dotted blue',
  }),

   menu: base => ({
        ...base,
        zIndex: 100
      }),
};


const divStyle = {
  marginTop: '10px' ,
  marginBottom:'20px'
};

const useStyles = makeStyles((theme) => ({
  root: {},
  fields: {
    margin: theme.spacing(-1),
    marginTop: theme.spacing(3),
    display: 'flex',
    flexWrap: 'wrap',
    '& > *': {
      flexGrow: 1,
      margin: theme.spacing(1)
    }
  },
  policy: {
    display: 'flex',
    alignItems: 'center'
  },
  policyCheckbox: {
    marginLeft: '-14px'
  },
  submitButton: {
    marginTop: theme.spacing(2),
    width: '100%'
  } ,

  option: {
    border: `1px solid ${theme.palette.divider}`,
    display: 'inline-flex',
    alignItems: 'flex-start',
    padding: theme.spacing(2),
    maxWidth: 200,
    '& + &': {
      marginTop: theme.spacing(2),
      marginLeft: theme.spacing(4)
    }
  },
  selectedOption: {
    backgroundColor: colors.grey[100]
  },
  optionRadio: {
    margin: -10 ,
  },
  optionDetails: {
    marginLeft: theme.spacing(2)
  }
}));


function RegisterForm({ className, ...rest }) {
  const classes = useStyles();
  const { t } = useTranslation(); //{t('calendar')}

  const dispatch = useDispatch();
  const history = useHistory();

  const schema = {
    fullName: {
      presence: { allowEmpty: false, message: t('full name is required') }
    },
    email: {
      presence: { allowEmpty: false, message: t('email is required') },
      email: {
        message: t('invalid email address')
      }
    },
    password: {
      presence: { allowEmpty: false, message: t('password is required') },
      length: {
        maximum: 100,
        minimum: 8,
        message: t('password must be at least 6 characters')
      }
    },
    confirm: {
      presence: { allowEmpty: false, message: t('password is required') },
      length: {
        maximum: 100,
        minimum: 8,
        message: t('password must be at least 6 characters')
      }
    }
  };

  const options = [
    {
      value: 'false',
      title: t('student'),
      description: '',
      icon : '/images/icons/studente.png'
    },
    {
      value: 'true',
      title: t('teacher'),
      description: '' ,
      icon : '/images/icons/teachere.png'

    }
  ];

  let params = new URLSearchParams(useLocation().search);

  const [formState, setFormState] = useState({
    isValid: false,
    values: {},
    touched: {},
    errors: {}
  });


  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);
  const [openInfoSnackbar, setOpenInfoSnackbar] = useState(false);
  const [isRegisterButtonClicked, setIsRegisterButtonClicked] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

 const  handleChangeCity = (newValue, actionMeta) => {
   setFormState((prevFormState) => ({
     ...prevFormState,
     values: {
       ...prevFormState.values,
       'cityName': newValue ? newValue.label : null
     },
     touched: {
       ...prevFormState.touched,
       'cityName': true
     }
   }));
  };


  const handleErrorSnackbarClose = () => {
    setOpenErrorSnackbar(false);
  };
    const handleInfoSnackbarClose = () => {
    setOpenInfoSnackbar(false);
  };
  //Valid password ??
  //const valid = values.password && values.password === values.confirm;

  const [isTeacher, setIsTeacher] = useState(options[0].value);
  const handleChangeIsTeacher = (event, option) => {

    setIsTeacher(option.value);
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
            :
            event.target.name === 'email' || event.target.name === 'confirm' || event.target.name === 'password' ? event.target.value.split(" ").join("") : event.target.value
      },
      touched: {
        ...prevFormState.touched,
        [event.target.name]: true
      }
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsRegisterButtonClicked(true);

    ReactGA.event({
      category: 'Register',
      action: 'Create an Account!'
    });

    if (!formState.values.email.includes('@laclasse.ma')) {
      setErrorMsg(t('you should have @laclasse.ma email address'));
      setOpenErrorSnackbar(true);
      setIsRegisterButtonClicked(false);
    } else {
      if (formState.values.password !== formState.values.confirm) {
        setErrorMsg(t('passwords not the same'));
        setOpenErrorSnackbar(true);
        setIsRegisterButtonClicked(false);
      } else {

        let userData = formState.values;
        userData.isModerator = (isTeacher === 'true');

        API.register(userData)
          .then((user) => {
            if (user.user.isModerator) {
              history.push('/auth/login');
            } else {
              history.push('/auth/login');
            }

          })
          .catch((error) => {
            setErrorMsg(t('email already exists'));
            setIsRegisterButtonClicked(false);
            setOpenErrorSnackbar(true);
          });
      }
    }
  };

  const hasError = (field) => !!(formState.touched[field] && formState.errors[field]);

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
      <div>
        {options.map((option) => (
          <div
            className={clsx(classes.option, {
              [classes.selectedOption]: isTeacher === option.value
            })}
            key={option.value}
            onClick={(event) => handleChangeIsTeacher(event, option)}
          >
            <Radio
              checked={isTeacher === option.value}
              className={classes.optionRadio}
              color="primary"
              onClick={(event) => handleChangeIsTeacher(event, option)}
            />
            <div className={classes.optionDetails}>
              <Typography
                gutterBottom
                variant="h5"
              >
                {option.title}
              </Typography>
              <img src={option.icon}
                   style={{
                     width: 100,
                     height: 100,
                   }}
                   alt={""}
              />
              <Typography variant="body1">{option.description}</Typography>
            </div>
          </div>
        ))}
      </div>
      <div className={classes.fields}>
        <TextField
          error={hasError('fullName')}
          fullWidth
          helperText={
            hasError('fullName') ? formState.errors.fullName[0] : null
          }
          label={t('full name')}
          name="fullName"
          required
          onChange={handleChange}
          value={formState.values.fullName || params.get("fullName") || ''}
          variant="outlined"
        />
      {isTeacher=="true" ?

        <TextField
          error={hasError('etablissement')}
          fullWidth
          helperText={
            hasError('etablissement') ? formState.errors.etablissement[0] : null
          }
          label={t('establishment')}
          name="etablissement"
          onChange={handleChange}
          value={formState.values.etablissement || ''}
          variant="outlined"
          required
        />
        : null }
      {isTeacher=="true" ?
       <div style={{divStyle}} >
      <div style={{marginLeft:'10px'}}>
        <Typography gutterBottom variant="caption">
          {t('city')} * :
        </Typography>
      </div>
        <Select
          variant="h6"
          error={hasError('cityName')}
          styles={customStylesSelector}
          name="cityName"
          //isMulti
          className="basic-single"
          classNamePrefix="select"
          placeholder={t('choose your city')}
          onChange={handleChangeCity}
          options = { allCity }
          isClearable
        />
        </div>
        : null }
        {isTeacher=="true" ?
        <TextField
          error={hasError('phone')}
          fullWidth
          helperText={
            hasError('phone') ? formState.errors.phone[0] : null
          }
          label={t('phone number')}
          name="phone"
          onChange={handleChange}
          value={formState.values.phone || ''}
          variant="outlined"
        />
        : null }

        <TextField
          error={hasError('email')}
          fullWidth
          helperText={hasError('email') ? formState.errors.email[0] : null}
          label={t('email address')}
          name="email"
          required
          onChange={handleChange}
          value={formState.values.email || params.get("email") || ''}
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
          required
          onChange={handleChange}
          type="password"
          value={formState.values.password || ''}
          variant="outlined"
        />

        <TextField
          error={hasError('confirm')}
          helperText={
            hasError('confirm') ? formState.errors.confirm[0] : null
          }
          fullWidth
          label={t('confirm password')}
          name="confirm"
          required
          onChange={handleChange}
          type="password"
          value={formState.values.confirm || ''}
          variant="outlined"
        />
      </div>
      <Button
        className={classes.submitButton}
        color="primary"
        disabled={!formState.isValid || isRegisterButtonClicked}
        size="large"
        type="submit"
        variant="contained"
      >
        {
          isRegisterButtonClicked ?
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            />
            :
            t('create account')
        }
      </Button>

       <ErrorSnackbar
        onClose={handleErrorSnackbarClose}
        open={openErrorSnackbar}
        errorMessage={errorMsg}
      />
       <InfoSnackbar
       // onClose={handleInfoSnackbarClose}
        open={openInfoSnackbar}
        errorMessage={infoMsg}
      />

    </form>

  );
}

RegisterForm.propTypes = {
  className: PropTypes.string
};

export default RegisterForm;
