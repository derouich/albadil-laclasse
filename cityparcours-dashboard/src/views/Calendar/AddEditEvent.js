/* eslint-disable react/display-name */
import React, { useState, forwardRef, useEffect } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import moment from 'moment';
import uuid from 'uuid/v1';
import { makeStyles } from '@material-ui/styles';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faFileAlt } from '@fortawesome/free-regular-svg-icons';
import * as API from '../../services';

import {
  Card,
  CardContent,
  CardActions,
  Typography,
  TextField,
  Button,
  IconButton,
  Divider,
  colors,
  FormControlLabel,
  Switch
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/DeleteOutlined';
import DatePicker from 'react-datepicker';
import { useSelector } from 'react-redux';
import { addLabelForSelectorClasse } from '../../utils/ListHelper';
import { ErrorSnackbar } from '../Snackbars';
import makeAnimated from 'react-select/animated';
import { useTranslation } from 'react-i18next';
import Spinner from 'react-bootstrap/Spinner';

const animatedComponents = makeAnimated();
const useStyles = makeStyles(theme => ({
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
  field: {
    marginTop: theme.spacing(3)
  },
  cancelButton: {
    marginLeft: 'auto'
  },
  confirmButton: {
    color: theme.palette.common.white,
    backgroundColor: theme.palette.secondary.main,
    '&:hover': {
      backgroundColor: theme.palette.secondary.main
    }
  }
}));

const customStylesSelector = {
  option: (provided, state) => ({
    ...provided,
    // borderBottom: '1px dotted blue',
    color: state.isSelected ? 'black' : 'black',
    backgroundColor: state.isSelected ? 'white' : 'white',
    padding: 10
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
};

const defaultEvent = {
  title: '',
  desc: ''
  //  allDay: false,
  // start: new Date(),
  // end: new Date()
};

const divStyle = {
  marginTop: '20px'
};

const AddEditEvent = forwardRef((props, ref) => {
  const {
    event,
    onDelete,
    onCancel,
    onAdd,
    onEdit,
    className,
    ...rest
  } = props;
  const classes = useStyles();
  const { t } = useTranslation(); //{t('calendar')}

  const token = useSelector(state => state.user.token);
  const [values, setValues] = useState(event || { ...defaultEvent });
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [classesList, setClassesList] = useState([]);
  const [currentClasse, setCurrentClasse] = useState([]);
  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [disableAddButton, setDisableAddButton] = useState(false);
  const [disableEditButton, setDisableEditButton] = useState(false);

  const mode = event ? 'edit' : 'add';

  const handleFieldChange = e => {
    e.persist();
    setValues(prevValues => ({
      ...prevValues,
      [e.target.name]:
        e.target.type === 'checkbox' ? e.target.checked : e.target.value
    }));
  };

  const handleDelete = () => {
    API.deleteCours(values.id, token)
      .then(() => {
        if (onDelete) {
          // onDelete(event);
        }
        window.location.reload();
      })
      .catch(error => {
        console.log(error);
      });
  };

  const handleErrorSnackbarClose = () => {
    setOpenErrorSnackbar(false);
  };

  const handleAdd = () => {
    if (!values.title || !startDate || !endDate) {
      setErrorMsg('Les champs sont vide');
      setOpenErrorSnackbar(true);
      return;
    }

    setDisableAddButton(true);

    values.start = moment(startDate).format('YYYY-MM-DDTHH:mm');
    //values.color = "#388e3c";
    values.color = '#009dec';
    values.end = moment(endDate).format('YYYY-MM-DDTHH:mm');

    if (moment(values.start).isBefore(values.end)) {
      let roomData = {
        roomName: values.title,
        description: values.desc,
        classeId: values.classeId || 'none',
        startDateTime: moment(startDate).format('YYYY-MM-DDTHH:mm'),
        endDateTime: moment(endDate).format('YYYY-MM-DDTHH:mm'),
        isInstant: false
      };
      API.createRoom(roomData, token)
        .then(() => {
          // onAdd({ ...values, id: uuid() });
          window.location.reload();
        })
        .catch(error => {
          setDisableAddButton(false);
        });
    } else {
      setErrorMsg(t('Verify Date'));
      setOpenErrorSnackbar(true);
      setDisableAddButton(false);
    }
  };

  const handleChange = (newValue, actionMeta) => {
    var classesIds = [];
    if (newValue) {
      if (newValue.length > 0) {
        newValue.map(option => classesIds.push(option.id));
        values.classeId = classesIds;
        setCurrentClasse(newValue);
      } else {
        setCurrentClasse(classesIds);
      }
    } else {
      setCurrentClasse(classesIds);
    }
  };

  const handleEdit = () => {
    setDisableEditButton(true);

    if (!values.title || !values.desc) {
      setDisableEditButton(false);
      return;
    }

    values.start = moment(startDate).format('YYYY-MM-DDTHH:mm');
    values.end = moment(endDate).format('YYYY-MM-DDTHH:mm');
    if (!values.oldClasseId) values.oldClasseId = [];
    if (moment(values.start).isBefore(values.end)) {
      let roomData = {
        roomName: values.title,
        description: values.desc,
        classeId: values.classeId || [],
        oldClasseId: values.oldClasseId.length > 0 ? values.oldClasseId : [],
        startDateTime: values.start,
        endDateTime: values.end,
        isInstant: false
      };

      API.updateRoom(values.id, roomData, token)
        .then(() => {
          //onEdit(values);
          window.location.reload();
        })
        .catch(error => {
          setDisableEditButton(false);
        });
    } else {
      setDisableEditButton(false);
      setOpenErrorSnackbar(true);
    }
  };

  useEffect(() => {
    let mounted = true;

    if (event) {
      setStartDate(new Date(event.start));
      setEndDate(new Date(event.end));
      if (event.classe.length > 0) {
        values.oldClasseId = event.classe;
        setCurrentClasse(addLabelForSelectorClasse(event.classe));
      }
    } else {
      //default Value to end meeting time Add to endDate two Hour default
      setStartDate(endDate.setMinutes(startDate.getMinutes() + 15));
      setEndDate(endDate.setHours(endDate.getHours() + 2));
    }

    const fetchClasses = () => {
      API.getClasses(token)
        .then(classes => {
          if (mounted) {
            setClassesList(addLabelForSelectorClasse(classes));
          }
        })
        .catch(error => {
          console.log(error);
        });
    };

    fetchClasses();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Card {...rest} className={clsx(classes.root, className)} ref={ref}>
      <form>
        <CardContent>
          <Typography align="center" gutterBottom variant="h3">
            {mode === 'add' ? t('course creation') : t('course update')}
          </Typography>
          <TextField
            className={classes.field}
            fullWidth
            label={t('course name')}
            name="title"
            required
            onChange={handleFieldChange}
            value={values.title}
            variant="outlined"
          />
          <TextField
            className={classes.field}
            fullWidth
            label={t('description')}
            name="desc"
            onChange={handleFieldChange}
            value={values.desc}
            variant="outlined"
          />
          <div style={divStyle}>
            <Typography gutterBottom variant="h6">
              {' '}
              {t('choose your class')}{' '}
            </Typography>

            <Select
              closeMenuOnSelect={false}
              components={animatedComponents}
              value={currentClasse}
              onChange={handleChange}
              className="basic-multi-select"
              isMulti
              options={classesList}
              styles={customStylesSelector}
            />
          </div>

          <div className="grid-container">
            <div className="Date-start">
              <Typography gutterBottom variant="h6" align="inherit">
                {t('start date')} *{' '}
              </Typography>

              <DatePicker
                showTimeSelect
                selected={startDate}
                onChange={date => setStartDate(date)}
                timeFormat="HH:mm"
                popperPlacement="top-end"
                timeIntervals={15}
                timeCaption="time"
                withPortal
                disabledKeyboardNavigation
                dateFormat="MMMM d, yyyy HH:mm"
              />
            </div>
            <div className="DateEnd">
              <Typography gutterBottom variant="h6" align="inherit">
                {t('end date')} *{' '}
              </Typography>
              <DatePicker
                showTimeSelect
                selected={endDate}
                onChange={date => setEndDate(date)}
                timeFormat="HH:mm"
                popperPlacement="top-end"
                timeIntervals={15}
                timeCaption="time"
                withPortal
                disabledKeyboardNavigation
                dateFormat="MMMM d, yyyy HH:mm"
              />
            </div>
          </div>
        </CardContent>
        <Divider />
        <CardActions>
          <IconButton edge="start" onClick={handleDelete}>
            <DeleteIcon />
          </IconButton>
          <Button
            className={classes.cancelButton}
            onClick={onCancel}
            variant="contained"
          >
            {t('cancel')}
          </Button>

          {mode === 'add' ? (
            <Button
              className={classes.confirmButton}
              onClick={handleAdd}
              variant="contained"
              disabled={disableAddButton}
            >
              {disableAddButton ? (
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
              ) : (
                t('add')
              )}
            </Button>
          ) : (
            <Button
              className={classes.confirmButton}
              onClick={handleEdit}
              variant="contained"
              disabled={disableEditButton}
            >
              {disableEditButton ? (
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
              ) : (
                t('save')
              )}
            </Button>
          )}
        </CardActions>
        <ErrorSnackbar
          onClose={handleErrorSnackbarClose}
          open={openErrorSnackbar}
          errorMessage={errorMsg}
        />
      </form>
    </Card>
  );
});

AddEditEvent.propTypes = {
  className: PropTypes.string,
  event: PropTypes.object,
  onAdd: PropTypes.func,
  onCancel: PropTypes.func,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func
};

export default AddEditEvent;
