import React, { useState , useEffect } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import {
  TextField,
  Button,
  Chip,
  Typography,
  Divider
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

// import array from json
const allCity = city.allcity;
const useStyles = makeStyles((theme) => ({

  root: {},

  alert: {
    marginBottom: theme.spacing(3)
  },
  formGroup: {
    marginBottom: theme.spacing(4)
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
  }
}));

const divStyle = {
 // marginTop: '10px' ,
  marginBottom:'20px'
};

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

const customStylesSelector = {
   option: (provided, state) => ({
    ...provided,
   // borderBottom: '1px dotted blue',
    color: state.isSelected ? 'black' : 'black',
    backgroundColor : state.isSelected ? 'white' : 'white',
    padding: 10,
  }),
   menu: base => ({
        ...base,
        zIndex: 100
      }),
  singleValue: (provided, state) => {
    const opacity = state.isDisabled ? 0.5 : 1;
    const transition = 'opacity 300ms';
    return { ...provided, opacity, transition };
  }
}


function EditClasse({ className, onChange, theclasse, ...rest }) {
  const classes = useStyles();
  const { t } = useTranslation(); //{t('calendar')}

  const history = useHistory();
  const token = useSelector((state) => state.user.token);

  const initialValues = {
    classeName: theclasse.classeName,
    etablissement: theclasse.schoolName,
    ville: theclasse.city
  };

  const [values, setValues] = useState({ ...initialValues });
  const [formState, setFormState] = useState({
    isValid: false,
    values: {},
    touched: {},
    errors: {}
  });

 const  handleChangeCity = (newValue, actionMeta) => {
    values.ville = newValue.label;
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    onChange(true);

    let classeData = {
      classeName: values.classeName,
      schoolName: values.etablissement,
      city: values.ville
    };

    API.updateClasse(theclasse._id, classeData, token)
      .then(() => {
        if (window.location.pathname === '/classes') {
          window.location.reload();
        } else {
          history.push('/classes');
          onChange(false);
        }
      })
      .catch((error) => {
        onChange(false);
      });
  };

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
      id='editClassForm'
      onSubmit={handleSubmit}
    >
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
          value={values.etablissement}
          variant="outlined"
        />
      </div>
      <div style={divStyle} >
              <div style={{marginLeft:'10px'}}>
                <Typography gutterBottom variant="caption">
                  {t('city')} :
                </Typography>
              </div>
            <Select variant="h6"
              styles={customStylesSelector}
              //isMulti
              defaultValue={allCity.filter(option => option.label === theclasse.city) }
              className="basic-multi-select"
              placeholder={t('choose your city')}
              onChange={handleChangeCity}
              options = { allCity }
            />
        </div>

{/*
      <div className={classes.formGroup}>
        <TextField
          fullWidth
          label="Ville"
          name="ville"
          onChange={(event) => handleFieldChange(event, 'ville', event.target.value)}
          value={values.ville}
          variant="outlined"
          required
        />
      </div>
*/}
    </form>
  );
}


EditClasse.propTypes = {
  className: PropTypes.string
};

export default EditClasse;
