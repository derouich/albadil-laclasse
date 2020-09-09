import React, { useState , useEffect } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import {
  TextField,
  Button,
  Chip,
  Typography,
  Divider, CardContent, Card, CardActions
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';
import * as API from '../../services';
import { useHistory } from 'react-router';
import { useSelector } from 'react-redux';
import validate from 'validate.js';
import Select from 'react-select';
import city from '../../mock/villeMaroc.json';
import { useTranslation } from 'react-i18next';
import ReactGA from 'react-ga';
import Spinner from 'react-bootstrap/Spinner';

// import array from json
const allCity = city.allcity;

const useStyles = makeStyles((theme) => ({

  root: {},

  alert: {
    marginBottom: theme.spacing(3)
  },
  formGroup: {
    marginBottom: theme.spacing(2)
  },
  fieldGroup: {
    display: 'flex',
    alignItems: 'center'
  },
  fieldHint: {
    margin: theme.spacing(1, 0)
  },
  tags: {
    marginTop: theme.spacing(1),
    '& > * + *': {
      marginLeft: theme.spacing(1)
    }
  },
  flexGrow: {
    flexGrow: 1,
    marginLeft: 5 ,
    email: true ,
    length: {
      maximum: 100
    }
  },
  emailStudent: {
    flexGrow: 1,
    marginLeft: 5
  },
  dateField: {
    '& + &': {
      marginLeft: theme.spacing(2)
    }
  },
  students: {
    marginBottom:20,
    marginTop:20
  },
  actions: {
    justifyContent: 'flex-end'
  }
}));

const schema = {
  email: {
    presence: { allowEmpty: false, message: 'is required' },
    email: true,
    length: {
      maximum: 100
    }
  } ,
    fullName: {
    presence: { allowEmpty: false, message: 'is required' },
    length: {
      maximum: 100
    }
  }
};


const divStyle = {
 // marginTop: '10px' ,
  marginBottom:'15px'
};

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


function CreateClasse({ className, onClose, ...rest }) {
  const classes = useStyles();
  const { t } = useTranslation(); //{t('calendar')}

  const [disableSubmit, setDisableSubmit] = useState(false);
  const history = useHistory();
  const token = useSelector((state) => state.user.token);
  const user = useSelector((state) => state.user.userData);


  const initialValues = {
    classeName: '',
    etablissement: user.etablissement,
    ville: user.cityName,
    email: '',
    fullName: '',
    tags: []
  };

  const [values, setValues] = useState({ ...initialValues });
  const [formState, setFormState] = useState({
    isValid: false,
    values: {},
    touched: {},
    errors: {}
  });

 const  handleChangeCity = (newValue, actionMeta) => {
    if(newValue) values.ville = newValue.label;
  };

  const handleFieldChange = (event, field, value) => {
    event.persist();

    setFormState((prevFormState) => ({
      ...prevFormState,
      values: {
        ...prevFormState.values,
        [event.target.name]:
          event.target.type === 'checkbox'
            ? event.target.checked
            : event.target.value
      },
      touched: {
        ...prevFormState.touched,
        [event.target.name]: true
      }
    }));

    setValues((prevValues) => ({
      ...prevValues,
      [field]: value
    }));
  };

  const handleTagAdd = () => {
    setValues((prevValues) => {
      const newValues = { ...prevValues };

      if (formState.isValid && newValues.email.trim() && newValues.fullName.trim() && !newValues.tags.includes(newValues.email) && !newValues.tags.includes(newValues.fullName)) {
        let isDuplicated = false;

        // Check new invites
        for (let _newInvitedUser of values.tags) {
          if (_newInvitedUser.split(";")[1] === newValues.email) {
            isDuplicated = true;
          }
        }

        if (!isDuplicated) {
          newValues.tags = [...newValues.tags];
          newValues.tags.push(newValues.fullName + ';' + newValues.email);
        }
      }

      newValues.email = '';
      newValues.fullName = '';

      return newValues;
    });
  };

  const handleTagDelete = (email) => {
    setValues((prevValues) => {
      const newValues = { ...prevValues };

      newValues.tags = newValues.tags.filter((t) => t !== email);

      return newValues;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    ReactGA.event({
      category: 'Classe',
      action: 'Create classe!'
    });

    setDisableSubmit(true);
    let classeData = {
      classeName: values.classeName,
      schoolName: values.etablissement,
      city: values.ville,
      invitedUsers: values.tags
    };

    API.createClasse(classeData, token)
      .then(() => {
        if (window.location.pathname === '/classes') {
          window.location.reload();
        } else {
          history.push('/classes');
        }
      })
      .catch((error) => { setDisableSubmit(false); });
  };

  const hasError = (field) => !!(formState.touched[field] && formState.errors[field]);

  useEffect(() => {
    const errors = validate(formState.values, schema);

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
      id='createClassForm'
      onSubmit={handleSubmit}
    >
      <CardContent>
        <div className={classes.formGroup}>
          <TextField
            fullWidth
            label={t('class name')}
            name="classeName"
            onChange={(event) => handleFieldChange(event, 'classeName', event.target.value)}
            value={values.classeName}
            variant="outlined"
            required
          />
        </div>

        <div className={classes.formGroup}>
          <TextField
            fullWidth
            label={t('establishment')}
            name="etablissement"
            onChange={(event) => handleFieldChange(event, 'etablissement', event.target.value)}
            value={values.etablissement }
            variant="outlined"
          />
        </div>

        <div style={divStyle} >
          <div style={{marginLeft:'10px'}}>
            <Typography gutterBottom variant="caption">
              {t('city')}:
            </Typography>
          </div>
          <Select variant="h6"
                  styles={customStylesSelector}
            //isMulti
                  defaultValue={allCity.filter(option => option.label === user.cityName) }
                  className="basic-single"
                  classNamePrefix="select"
                  placeholder={t('choose your city')}
                  onChange={handleChangeCity}
                  options = { allCity }
                  isClearable
          />
        </div>

        <Typography
          className={classes.fieldHint}
          variant="body2"
        >
          * {t('by default the class takes the city and the establishment in your profile')}
        </Typography>

        <Divider />
        <Typography gutterBottom={true} variant="h3" className={classes.students}>
          {t('adding students')}
        </Typography>

        <div className={classes.formGroup}>
          <div className={classes.fieldGroup}>
            <TextField
              className={classes.flexGrow}
              error={hasError('fullName')}
              label={t('full name')}
              name="fullName"
              onChange={(event) => handleFieldChange(event, 'fullName', event.target.value)}
              value={values.fullName}
              variant="outlined"
            />

            <TextField
              className={classes.emailStudent}
              error={hasError('email')}
              label={t('email address')}
              name="email"
              onChange={(event) => handleFieldChange(event, 'email', event.target.value)}
              value={values.email}
              variant="outlined"
            />
            <Button
              className={classes.addButton}
              style={{backgroundColor : '#0275d8' , color:'white'}}
              onClick={handleTagAdd}
              size="small"
            >
              <AddIcon className={classes.addIcon} />
              {t('add')}
            </Button>
          </div>
          <Typography
            className={classes.fieldHint}
            variant="body2"
          >
            {t('these students will receive the invitation in their email addresses')}
          </Typography>
          <div className={classes.tags}>
            {values.tags.map((email) => (
              <Chip
                deleteIcon={<CloseIcon />}
                key={email}
                label={email}
                onDelete={() => handleTagDelete(email)}
              />
            ))}
          </div>
        </div>
      </CardContent>

      <Divider />

      <CardActions className={classes.actions}>
        <Button onClick={onClose}>
          {t('dismiss')}
        </Button>

        <Button
          style={{backgroundColor : disableSubmit ? '#9b9ea1' : '#388e3c' , color:'white'}}
          variant="contained"
          type="submit"
          form="createClassForm"
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
    </form>
  );
}


CreateClasse.propTypes = {
  className: PropTypes.string
};

export default CreateClasse;
