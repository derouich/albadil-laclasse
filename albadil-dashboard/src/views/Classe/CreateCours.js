import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import moment from 'moment';
import momentTZ from 'moment-timezone';
import { makeStyles } from '@material-ui/styles';
import {
FormControlLabel , TextField, Typography , Divider , Switch ,
} from '@material-ui/core';
import * as API from '../../services';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import {ErrorSnackbar} from '../Snackbars';
import Select from 'react-select';
import {addLabelForSelectorClasse  } from '../../utils/ListHelper';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "react-datepicker/dist/react-datepicker.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock , faFileAlt } from "@fortawesome/free-regular-svg-icons";
import makeAnimated from 'react-select/animated';
import { useTranslation } from 'react-i18next';
import ReactGA from 'react-ga';

const animatedComponents = makeAnimated();

const useStyles = makeStyles((theme) => ({
  root: {},
  alert: {
    marginBottom: theme.spacing(3)
  },
  formGroup: {
    marginBottom: theme.spacing(3)
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
    flexGrow: 1
  },
  dateField: {
    '& + &': {
      marginLeft: theme.spacing(2)
    }
  },

}));

const divStyle = {
  marginTop: '20px' ,
  marginBottom:'20px'
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

const initialValues = {
  coursName: '',
  description: '',
  classeId: 'none',
  startDate: moment().format('YYYY-MM-DDTHH:mm'),
  endDate: moment().add(1, 'h').format('YYYY-MM-DDTHH:mm')
};

function CreateCours({ className, currentClasseId, onChange, ...rest  }) {
  const classes = useStyles();
  const { t } = useTranslation(); //{t('calendar')}

  const history = useHistory();
  const token = useSelector((state) => state.user.token);

  const [values, setValues] = useState({ ...initialValues });
  const [classesList, setClassesList] = useState([]);
  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);
 const [startDate, setStartDate] = useState(new Date() );
 const [endDate, setEndDate] = useState( new Date() );
  const [currentClasse, setCurrentClasse] = useState([]);
  const [isInstantCours , setIsInstantCours] = useState(false);

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
//momentTZ(theCours.startDateTime).tz(timezone).format()
  const handleErrorSnackbarClose = () => {
    setOpenErrorSnackbar(false);
  };

  const handleInstantCours = () => {
    isInstantCours ? setIsInstantCours(false) : setIsInstantCours(true);
  };

 const  handleChange = (newValue, actionMeta) => {
   let classesIds = [];
    if(actionMeta.action == 'clear'){
      setCurrentClasse(classesIds);
    }
   if(newValue && newValue.length > 0 ) {
     newValue.map( option => ( classesIds.push(option._id) ));

     setCurrentClasse(newValue);
   } else {
     setCurrentClasse(classesIds);
   }
    values.classeId = classesIds;
  };

  const handleFieldChange = (event, field, value) => {
    event.persist();
    setValues((prevValues) => ({
      ...prevValues,
      [field]: value
    }));
  };

  useEffect(() => {
    let mounted = true;

    //default Value to end meeting time Add to endDate two Hour default

    setStartDate(endDate.setMinutes(startDate.getMinutes() + 15) );
    setEndDate(endDate.setHours(endDate.getHours() + 2));

    const fetchClasses = () => {
      API.getConnectedUserClasses(token)
        .then((classes) => {
          if (mounted) {
          //with react-js element need to have label value ( just for UI Reason )
            setClassesList(addLabelForSelectorClasse(classes));

          }
        })
        .catch((error) => { console.log(error); });
    };

    if(currentClasseId) {
      values.classeId = currentClasseId;
    }
    fetchClasses();


    return () => {
      mounted = false;
    };
  }, [token]);


  const handleSubmit = async (event) => {
    event.preventDefault();

    ReactGA.event({
      category: 'Cours',
      action: 'Create cours!'
    });

    onChange(true);
    if (moment(startDate).isBefore(endDate)) {
      let roomData = {
        roomName: values.coursName.replace(/'/g, ""),
        description: values.description,
        classeId: values.classeId || null,
        isInstant: (isInstantCours ? true : false),
        startDateTime: (!isInstantCours ? startDate : null),
        endDateTime: (!isInstantCours ? endDate : null),
        isGustaveDashboard: true
      };

      API.createRoom(roomData, token)
        .then(() => {
          if (window.location.pathname === '/cours') {
            window.location.reload();

          } else if (window.location.pathname.includes('classe/')) {
            window.location.reload();

          } else {
            history.push('/cours');
          }
        })
        .catch((error) => { onChange(false); });
    } else {
      setOpenErrorSnackbar(true);
      onChange(false);
    }
  };

  return (
    <form
      {...rest}
      className={clsx(classes.root, className)}
      id="createCoursForm"
      onSubmit={handleSubmit}
    >
      <div className={classes.formGroup}>
        <TextField
          fullWidth
          label={t('course name')}
          name="coursName"
          onChange={(event) => handleFieldChange(event, 'coursName', event.target.value)}
          value={values.coursName}
          variant="outlined"
          required={true}
        />
      </div>

      <div className={classes.formGroup}>
        <TextField
          fullWidth
          label={t('description')}
          name="description"
          onChange={(event) => handleFieldChange(event, 'description', event.target.value)}
          value={values.description}
          variant="outlined"
        />
      </div>
      <Divider />
{
    !currentClasseId ?
     <div style={divStyle} >
      <div style={{marginLeft:'10px'}}>
        <Typography gutterBottom variant="caption">
          {t('choose your class')}
        </Typography>
      </div>

      <Select
      closeMenuOnSelect={false}
      classNamePrefix="select"
      components={animatedComponents}
      value={ currentClasse }
      onChange={handleChange}
      className="basic-multi-select"
      isMulti
      options={classesList}
     //styles={customStylesSelector}
    />
    </div>
    : null
}
{/*
      <TextField
        className={classes.formGroup}
        fullWidth
        name="classeName"
        onChange={(event) => handleFieldChange(event, 'classeName', event.target.value)}
        select
        // eslint-disable-next-line react/jsx-sort-props
        SelectProps={{ native: true }}
        value={values.classeName}
        variant="outlined"
      >
        <option
          key={"none"}
          value={"none"}
        >
          {"Select Classe"}
        </option>

        {classesList ? classesList.map(option => (
          <option
            key={option._id}
            value={option._id}
          >
            {option.classeName}
          </option>
        )) : null
        }
      </TextField>
*/}

        <Divider />
          <FormControlLabel
            className={classes.field}
            control={(
              <Switch
                checked={isInstantCours}
                name="instant"
                onChange={handleInstantCours}
              />
            )}
            label={t('instant course')}
          />
         <Divider />
        { !isInstantCours ?
        <div className="grid-container">
        <div className="Date-start">
        <Typography
        gutterBottom
         variant="h6" align='inherit'>{t('start date')} * </Typography>
      <DatePicker
        showTimeSelect
        selected={new Date(startDate)}
        onChange={date => setStartDate(date)}
        timeFormat="HH:mm"
        popperPlacement="top-end"
        timeIntervals={15}
        minDate={new Date()}
        withPortal
        disabledKeyboardNavigation
        timeCaption="time"
        dateFormat="MMMM d, yyyy HH:mm"
        />
        </div>
        <div className="DateEnd">
<Typography
        gutterBottom
         variant="h6" align='inherit'>{t('end date')} * </Typography>
      <DatePicker
        showTimeSelect
        selected={new Date(endDate)}
        onChange={date => setEndDate(date)}
        timeFormat="HH:mm"
        popperPlacement="top-end"
        timeIntervals={15}
        minDate={startDate}
        //fixedHeight
        withPortal
        disabledKeyboardNavigation
        timeCaption="time"
        dateFormat="MMMM d, yyyy HH:mm"
        />
        </div>
        </div>
        : null  }
        {/*
          <TextField
            className={classes.field}
            defaultValue={moment(values.end).format('YYYY-MM-DDThh:mm:ss')}
            disabled={values.allDay}
            fullWidth
            label="End date"
            name="end"
            onChange={handleFieldChange}
            type="datetime-local"
            variant="outlined"
          />
        */}

{/*
      <div className={classes.formGroup}>
        <TextField
          className={classes.field}
          value={moment(values.startDate).format('YYYY-MM-DDTHH:mm')}
          fullWidth
          label="Start date"
          name="startDate"
          onChange={(event) => handleFieldChange(event, 'startDate', event.target.value)}
          type="datetime-local"
          variant="outlined"
        />
      </div>

      <div className={classes.formGroup}>
        <TextField
          className={classes.field}
          value={moment(values.endDate).format('YYYY-MM-DDTHH:mm')}
          fullWidth
          label="End date"
          name="endDate"
          onChange={(event) => handleFieldChange(event, 'endDate', event.target.value)}
          type="datetime-local"
          variant="outlined"
        />
      </div>
*/}
      <ErrorSnackbar
        onClose={handleErrorSnackbarClose}
        open={openErrorSnackbar}
        errorMessage={t('Verify Date')}
      />
    </form>
  );
}

CreateCours.propTypes = {
  className: PropTypes.string
};

export default CreateCours;
