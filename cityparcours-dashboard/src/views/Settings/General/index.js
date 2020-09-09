import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { Grid } from '@material-ui/core';
import ProfileDetails from './ProfileDetails';
import GeneralSettings from './GeneralSettings';
import * as API from '../../../services';
import { useSelector } from 'react-redux';

const useStyles = makeStyles(() => ({
  root: {}
}));

function General({ className, ...rest }) {
  const classes = useStyles();
  const token = useSelector((state) => state.user.token);

  const [userData, setUserData] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchUserData = () => {
      API.getConnectedUser(token)
        .then((thisUser) => {
          if (mounted) {
            setUserData(thisUser);
          }
        })
        .catch((error) => { console.log(error); });
    };

    fetchUserData();

    return () => {
      mounted = false;
    };
  }, []);

  if (!userData) {
    return null;
  }

  return (
    <Grid
      {...rest}
      className={clsx(classes.root, className)}
      container
      spacing={3}
    >
      <Grid
        item
        lg={4}
        md={6}
        xl={3}
        xs={12}
      >
        <ProfileDetails profile={userData} />
      </Grid>
      <Grid
        item
        lg={8}
        md={6}
        xl={9}
        xs={12}
      >
        <GeneralSettings profile={userData} />
      </Grid>
    </Grid>
  );
}

General.propTypes = {
  className: PropTypes.string
};

export default General;
