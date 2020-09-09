import React, { useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Grid,
  Button,
  Divider,
  TextField,
  colors, IconButton
} from '@material-ui/core';
import * as API from '../../services';
import { useSelector } from 'react-redux';
import {SuccessSnackbar} from '../Snackbars';
import { useTranslation } from 'react-i18next';
import AccountDeleteConfirmationModal from './AccountDeleteConfirmationModal';

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(3),
  },
  saveButton: {
    color: theme.palette.common.white,
    backgroundColor: colors.green[600],
    '&:hover': {
      backgroundColor: colors.green[900]
    }
  },
  deleteButton: {
    color: theme.palette.common.white,
    backgroundColor: colors.red[600],
    '&:hover': {
      backgroundColor: colors.red[900]
    }
  }
}));

function Security({ className, ...rest }) {
  const classes = useStyles();
  const { t } = useTranslation(); //{t('calendar')}

  const token = useSelector((state) => state.user.token);
  const user = useSelector((state) => state.user.userData);

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openDeleteAccountModal, setOpenDeleteAccountModal] = useState(false);

  const [values, setValues] = useState({
    password: '',
    confirm: '',
    accountEmail: ''
  });

  const handleChange = (event) => {
    setValues({
      ...values,
      [event.target.name]: event.target.value
    });
  };

  const handlePasswordChange = () => {

    API.updateConnectedUser({
      password: values.password
    }, token)

      .then(() => {
        setOpenSnackbar(true);
        setValues({
          password: '',
          confirm: ''
        });
      })
      .catch((error) => { console.log(error); });
  };

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  const valid = values.password && values.password.length >= 6 && values.confirm.length >= 6 && values.password === values.confirm;

  let deleteAccountButtonValid;
  if (values.accountEmail) {
    deleteAccountButtonValid = values.accountEmail.toLowerCase() === user.email.toLowerCase();
  }

  return (
    <>
      <Card
        {...rest}
        className={clsx(classes.root, className)}
      >
        <CardHeader
          title={t('change password')}
          subheader={t('6 characters minimum required')}
        />
        <Divider />
        <CardContent>
          <form>
            <Grid
              container
              spacing={3}
            >
              <Grid
                item
                md={4}
                sm={6}
                xs={12}
              >
                <TextField
                  fullWidth
                  label={t('password')}
                  name="password"
                  onChange={handleChange}
                  type="password"
                  value={values.password}
                  variant="outlined"
                />
              </Grid>
              <Grid
                item
                md={4}
                sm={6}
                xs={12}
              >
                <TextField
                  fullWidth
                  label={t('confirm password')}
                  name="confirm"
                  onChange={handleChange}
                  type="password"
                  value={values.confirm}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </form>
        </CardContent>
        <Divider />
        <CardActions>
          <Button
            className={classes.saveButton}
            disabled={!valid}
            variant="contained"
            onClick={() => handlePasswordChange()}
          >
            {t('save changes')}
          </Button>
        </CardActions>

        <SuccessSnackbar
          message={"successfully saved changes"}
          onClose={handleSnackbarClose}
          open={openSnackbar}
        />
      </Card>

      {/* Delete Account card*/}

      <Card
        {...rest}
        className={clsx(classes.root, className)}
      >
        <CardHeader title={t('delete account')} />
        <Divider />
        <CardContent>
          <form>
            <Grid
              container
              spacing={3}
            >
              <Grid
                item
                md={12}
                sm={12}
                xs={12}
              >
                <TextField
                  fullWidth
                  label={t('email address')}
                  name="accountEmail"
                  onChange={handleChange}
                  type="email"
                  value={values.accountEmail}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </form>
        </CardContent>
        <Divider />
        <CardActions>
          <Button
            className={classes.deleteButton}
            disabled={!deleteAccountButtonValid}
            variant="contained"
            color="secondary"
            onClick={() =>  {setOpenDeleteAccountModal(true)}}
          >
            {t('delete account')}
          </Button>
        </CardActions>

        <AccountDeleteConfirmationModal
          onClose={() => setOpenDeleteAccountModal(false)}
          open={openDeleteAccountModal}
        />
      </Card>
    </>
  );
}

Security.propTypes = {
  className: PropTypes.string
};

export default Security;
