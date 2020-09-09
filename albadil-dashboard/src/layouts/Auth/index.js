import React, { Suspense, useEffect } from 'react';
import { renderRoutes } from 'react-router-config';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { LinearProgress } from '@material-ui/core';
import Topbar from './Topbar';
import { useSelector } from 'react-redux';
import validate from '../../views/Login/LoginForm';
import { useHistory } from 'react-router';

const useStyles = makeStyles((theme) => ({
  container: {
    minHeight: '100vh',
    display: 'flex',
    '@media all and (-ms-high-contrast:none)': {
      height: 0 // IE11 fix
    }
  },
  content: {
    flexGrow: 1,
    maxWidth: '100%',
    overflowX: 'hidden',
    paddingTop: 64,
    [theme.breakpoints.down('xs')]: {
      paddingTop: 56
    }
  }
}));

function Auth({ route }) {
  const classes = useStyles();
  const history = useHistory();
  const user = useSelector((state) => state.user);

  useEffect(() => {
    /*if (user.isAuthenticated && user.token && user.token !== '') {
      history.push('/');
    }*/
  }, []);


  return (
    <>
      <Topbar />
      <div className={classes.container}>
        <div className={classes.content}>
          <Suspense fallback={<LinearProgress />}>
            {renderRoutes(route.routes)}
          </Suspense>
        </div>
      </div>
    </>
  );
}

Auth.propTypes = {
  route: PropTypes.object
};

export default Auth;
