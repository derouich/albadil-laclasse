import React, { useState } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import city from '../../../mock/villeMaroc.json';

import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Grid,
  Divider,
  TextField,
  colors,
  Typography
} from '@material-ui/core';
import { SuccessSnackbar } from '../../Snackbars';
import * as API from '../../../services';
import { useDispatch, useSelector } from 'react-redux';
import { setProfileData } from '../../../actions';
import Select from 'react-select';
import { useTranslation } from 'react-i18next';
import Spinner from 'react-bootstrap/Spinner';

// import array from json
const allCity = city.allcity;

const useStyles = makeStyles(theme => ({
  root: {},
  saveButton: {
    color: theme.palette.common.white,
    backgroundColor: colors.green[600],
    '&:hover': {
      backgroundColor: colors.green[900]
    }
  },
  options: {
    backgroundColor: theme.palette.secondary.main
  }
}));

const divStyle = {
  // marginTop: '10px' ,
  marginBottom: '20px'
};

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

function GeneralSettings({ profile, className, ...rest }) {
  const classes = useStyles();
  const { t } = useTranslation(); //{t('calendar')}

  const dispatch = useDispatch();
  const token = useSelector(state => state.user.token);

  const [openSnackbar, setOpenSnackbar] = useState(false);

  const [values, setValues] = useState({
    fullName: profile.fullName,
    email: profile.email,
    phone: profile.phone,
    cityName: profile.cityName,
    etablissement: profile.etablissement
  });

  const [disableSaveChangeButton, setDisableSaveChangeButton] = useState(false);

  const handleChange = event => {
    event.persist();
    setValues({
      ...values,
      [event.target.name]:
        event.target.type === 'checkbox'
          ? event.target.checked
          : event.target.value
    });
  };

  const handleChangeCity = (newValue, actionMeta) => {
    values.cityName = newValue.label;
  };

  const handleSubmit = event => {
    event.preventDefault();

    setDisableSaveChangeButton(true);

    API.updateConnectedUser(values, token)
      .then(userData => {
        setOpenSnackbar(true);
        setDisableSaveChangeButton(false);
        dispatch(setProfileData(userData));
        //window.location.reload();
      })
      .catch(error => {
        setDisableSaveChangeButton(false);
      });
  };

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  return (
    <Card {...rest} className={clsx(classes.root, className)}>
      <form onSubmit={handleSubmit}>
        <CardHeader title={t('profile')} />
        <Divider />
        <CardContent>
          <Grid container spacing={4}>
            <Grid item md={12} xs={12}>
              <TextField
                fullWidth
                label={t('full name')}
                name="fullName"
                onChange={handleChange}
                required
                value={values.fullName}
                variant="outlined"
              />
            </Grid>

            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label={t('email address')}
                name="email"
                onChange={handleChange}
                required
                value={values.email}
                variant="outlined"
                type="email"
              />
            </Grid>

            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label={t('phone number')}
                name="phone"
                onChange={handleChange}
                type="text"
                value={values.phone}
                variant="outlined"
                //required
              />
            </Grid>

            <Grid item md={6} xs={12}>
              <div style={divStyle}>
                <div style={{ marginLeft: '10px' }}>
                  <Typography gutterBottom variant="caption">
                    {t('city')} * :
                  </Typography>
                </div>
                <Select
                  variant="h6"
                  styles={customStylesSelector}
                  //isMulti
                  defaultValue={allCity.filter(
                    option => option.label === values.cityName
                  )}
                  className="basic-multi-select"
                  placeholder={t('choose your city')}
                  onChange={handleChangeCity}
                  options={allCity}
                />
              </div>
            </Grid>

            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label={t('establishment')}
                name="etablissement"
                onChange={handleChange}
                required
                value={values.etablissement}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <CardActions>
          <Button
            className={classes.saveButton}
            type="submit"
            variant="contained"
            disabled={disableSaveChangeButton}
          >
            {disableSaveChangeButton ? (
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
            ) : (
              t('save changes')
            )}
          </Button>
        </CardActions>
      </form>
      <SuccessSnackbar
        message={'successfully saved changes'}
        onClose={handleSnackbarClose}
        open={openSnackbar}
      />
    </Card>
  );
}

GeneralSettings.propTypes = {
  className: PropTypes.string,
  profile: PropTypes.object.isRequired
};

export default GeneralSettings;
