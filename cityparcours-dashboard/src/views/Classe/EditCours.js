import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import moment from 'moment';
import { makeStyles } from '@material-ui/styles';
import {
    TextField, Typography , Divider

} from '@material-ui/core';
import * as API from '../../services';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import {ErrorSnackbar} from '../Snackbars';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock , faFileAlt } from "@fortawesome/free-regular-svg-icons";
import {addLabelForSelectorClasse  } from '../../utils/ListHelper';

import Select from 'react-select';
import { useTranslation } from 'react-i18next';

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
  }
}));
const divStyle = {
  marginTop: '20px'
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
function EditCours({ className, onChange, thecours, ...rest }) {
  const classes = useStyles();
  const { t } = useTranslation(); //{t('calendar')}

  const history = useHistory();
  const token = useSelector((state) => state.user.token);
  const [currentClasse, setCurrentClasse] = useState([]);

  const initialValues = {
    coursName: thecours.roomName,
    description: thecours.description,
    classeName: thecours.classe.length > 0 ? thecours.classe[0]._id : 'none',
    startDate: (!thecours.isInstant ? moment(startDate).format('YYYY-MM-DDTHH:mm') : null),
    endDate: (!thecours.isInstant ? moment(endDate).format('YYYY-MM-DDTHH:mm') : null),
    isInstant: thecours.isInstant
  };

  const [values, setValues] = useState({ ...initialValues });
  const [classesList, setClassesList] = useState([]);
  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);
  const [startDate, setStartDate] = useState(new Date(thecours.startDateTime) );
  const [endDate, setEndDate] = useState(new Date(thecours.endDateTime) );
  const [errorMsg , setErrorMsg] = useState('');
  const[isCLassesEmpty , setIsClassesEmpty] = useState(true);

  const handleErrorSnackbarClose = () => {
    setOpenErrorSnackbar(false);
  };

  const handleFieldChange = (event, field, value) => {
    event.persist();
    setValues((prevValues) => ({
      ...prevValues,
      [field]: value
    }));
  };

 const  handleChange = (newValue, actionMeta) => {
  var classesIds = [];
  if(newValue && newValue.length > 0 ) {
    setIsClassesEmpty(false);
    newValue.map( option => ( classesIds.push(option._id) ));

    values.classeId = classesIds;
    setCurrentClasse(newValue);
  } else {
    setIsClassesEmpty(true);
    setCurrentClasse(classesIds);
  }

  };

  useEffect(() => {
    let mounted = true;

    // Todo need recieve label array and add Id
      if(thecours.classe.length > 0) {
        values.oldClasseId =  thecours.classe ;
        setIsClassesEmpty(false);
        setCurrentClasse(addLabelForSelectorClasse(thecours.classe)) ;
     }

    const fetchClasses = () => {
      API.getClasses(token)
        .then((classes) => {
          if (mounted) {
            setClassesList(addLabelForSelectorClasse(classes));
          }
        })
        .catch((error) => { console.log(error); });
    };

    fetchClasses();

    return () => {
      mounted = false;
    };
  }, [token]);



  const handleSubmit = async (event) => {
    event.preventDefault();

    onChange(true);
    if (moment(startDate).isBefore(endDate) || thecours.isInstant ) {
      let roomData = {
        roomName: values.coursName,
        description: values.description,
        classeId: values.classeId || [] ,
        oldClasseId: thecours.classe.length > 0 ? thecours.classe : [],
        startDateTime: (!thecours.isInstant ? startDate : null),
        endDateTime: (!thecours.isInstant ? endDate : null),
        isInstant: thecours.isInstant,
        isCLassesEmpty: isCLassesEmpty
      };

      API.updateRoom(thecours._id, roomData, token)
        .then(() => {
          if (window.location.pathname === '/cours') {
            window.location.reload();

          } else if (window.location.pathname.includes('classe/')) {
            window.location.reload();

          } else {
            history.push('/cours');
            onChange(false);
          }
        })
        .catch((error) => {
          onChange(false);
        });
    } else {
      setErrorMsg(t('Verify Date'));
      setOpenErrorSnackbar(true );
      onChange(false);
    }
  };

  return (
    <form
      {...rest}
      className={clsx(classes.root, className)}
      id="editCoursForm"
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

          <div style={divStyle} >
      <Typography gutterBottom variant="h6"> {t('choose your class')} </Typography>
        <Select variant="outlined"
          styles={customStylesSelector}
          isMulti
          value={ currentClasse }
          className="basic-multi-select"
          onChange={handleChange}
          placeholder="Assigner des classes"
          options = { classesList }
        />
      </div>

               <Divider />
{ !values.isInstant ?
        <div className="grid-container">
        <div className="Date-start">
<Typography
        gutterBottom
         variant="h6" align='inherit'>{t('start date')} * </Typography>
      <DatePicker
        showTimeSelect
        selected={startDate}
        onChange={date => setStartDate(date)}
        timeFormat="HH:mm"
        timeIntervals={15}
        timeCaption="time"
        withPortal
        disabledKeyboardNavigation
        dateFormat="MMMM d, yyyy HH:mm"
        />
        </div>
        <div className="DateEnd">
<Typography
        gutterBottom
         variant="h6" align='inherit'>{t('end date')} * </Typography>
      <DatePicker
        showTimeSelect
        selected={endDate}
        onChange={date => setEndDate(date)}
        timeFormat="HH:mm"
        timeIntervals={15}
        timeCaption="time"
        withPortal
        disabledKeyboardNavigation
        dateFormat="MMMM d, yyyy HH:mm"
        />
        </div>
        </div>
        : null }

      <ErrorSnackbar
        onClose={handleErrorSnackbarClose}
        open={openErrorSnackbar}
        errorMessage={errorMsg}
      />
    </form>
  );
}

EditCours.propTypes = {
  className: PropTypes.string
};

export default EditCours;
