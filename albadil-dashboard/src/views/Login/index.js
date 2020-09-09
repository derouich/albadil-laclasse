import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Button } from '@material-ui/core';
import { useLocation } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Divider,
  Link
} from '@material-ui/core';
import LockIcon from '@material-ui/icons/Lock';
import Page from 'src/components/Page';
import gradients from 'src/utils/gradients';
import LoginForm from './LoginForm';
import { useHistory } from 'react-router';
import * as API from '../../services';
import { Link as RouterLink } from 'react-router-dom';
import ModalForgetPassword from './ModalForgetPassword';
import {SuccessSnackbar} from '../Snackbars';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(6, 6)
  },
  card: {
    width: theme.breakpoints.values.md,
    maxWidth: '100%',
    overflow: 'visible',
    display: 'flex',
    position: 'relative',
    '& > *': {
      flexGrow: 1,
      flexBasis: '50%',
      width: '50%'
    }
  },
  content: {
    padding: theme.spacing(8, 4, 3, 4)
  },
  media: {
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    padding: theme.spacing(3),
    color: theme.palette.common.white,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    [theme.breakpoints.down('md')]: {
      display: 'none'
    }
  },
  icon: {
    backgroundColor: theme.palette.secondary.dark,
    color: theme.palette.common.white,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1),
    position: 'absolute',
    top: -32,
    left: theme.spacing(3),
    height: 64,
    width: 64,
    fontSize: 32
  },
  loginForm: {
    marginTop: theme.spacing(3),
    marginMargin: theme.spacing(3)
  },
  divider: {
    margin: theme.spacing(2, 0)
  },
  person: {
    marginTop: theme.spacing(2),
    display: 'flex'
  },
  avatar: {
    marginRight: theme.spacing(2)
  },
    createAccountBtn: {
    marginTop: theme.spacing(2),
    width: '100%',
  }

}));

function LoginView() {
  const classes = useStyles();
  const { t } = useTranslation(); //{t('calendar')}

  const history = useHistory();

  let params = new URLSearchParams(useLocation().search);

  const [openEmailConfirmationSnackbar, setOpenEmailConfirmationSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [openForgetPassword, setOpenForgetPassword] = useState(false);


  const handleEmailConfirmationSnackbarClose = () => {
    setOpenEmailConfirmationSnackbar(false);
  };

  const inscrireHandler = () => {
    history.push('/auth/register');
  };

  useEffect(() => {
    let mounted = true;

    const activateUser = () => {
      API.activateUser(params.get("token"), params.get("email"))
        .then((message) => {
          if (mounted) {
            setSnackbarMessage(t('email verified successfully'));
            setOpenEmailConfirmationSnackbar(true);
          }
        })
        .catch((error) => { console.log(error); });
    };

    if (params.get("token") && params.get("email")) {
      activateUser();
    }

    if (params.get("confirmationEmail")) {
      setSnackbarMessage(t('activation email has been sent'));
      setOpenEmailConfirmationSnackbar(true);
    }

    if (params.get("password_reset")) {
      setSnackbarMessage(t('password changed'));
      setOpenEmailConfirmationSnackbar(true);
    }

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Page
      className={classes.root}
      title={t('sign in')}
    >
      <Card className={classes.card}>
        <CardContent className={classes.content}>
          <LockIcon className={classes.icon} />
          <Typography
            gutterBottom
            variant="h3"
          >
            {t('sign in')}
          </Typography>
          <Typography variant="subtitle2">
            {t('sign in on the internal platform')}
          </Typography>

          <LoginForm className={classes.loginForm} />

          <div style={{marginTop:'15px' , width:'100%' }}>
          <Link
            //align="left"
            color="primary"
            component={RouterLink}
            onClick={() => setOpenForgetPassword(true)}
            to="/auth/login"
            underline="always"
            variant="subtitle2"
          >
            {t('forget password')}
          </Link>
          </div>

          {
            /*
              <Divider className={classes.divider} />

         <Typography
            variant="h5"
          >
            <center>{t('you dont have an account')}</center>
          </Typography>

          <Button
            className={classes.createAccountBtn}
            color="secondary"
            size="large"
            onClick={inscrireHandler}
            variant="contained"
          >
            {t('register')}
          </Button>
            */
          }


        </CardContent>
        <ModalForgetPassword
          onClose={() => setOpenForgetPassword(false)}
          open={openForgetPassword}
        />
      </Card>

      <SuccessSnackbar
        onClose={handleEmailConfirmationSnackbarClose}
        open={openEmailConfirmationSnackbar}
        message={snackbarMessage}
      />
    </Page>
  );
}

export default LoginView;
