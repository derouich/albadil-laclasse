import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { Typography } from '@material-ui/core';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import RiseLoader from "react-spinners/RiseLoader";

const useStyles = makeStyles((theme) => ({
  root: {
    textAlign: 'center',
    padding: theme.spacing(3)
  },
  spinner: {


    // backgroundImage: 'url("/images/icons/noevents.png")',
    // backgroundPositionX: 'right',
    //backgroundPositionY: 'center',
    //backgroundRepeat: 'no-repeat',
    //backgroundSize: 'cover'
  }
}));

function LoadingElement({ className, ...rest }) {
  const classes = useStyles();

  return (
    <div
      {...rest}
      className={clsx(classes.root, className)}
    >
      <div className={classes.image} />

      <RiseLoader
        className={classes.spinner}
        size={20}
        color={'#4c4beb'}
      />

    </div>
  );
}

LoadingElement.propTypes = {
  className: PropTypes.string
};

export default LoadingElement;
