import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme) => ({
  root: {
    textAlign: 'center',
    padding: theme.spacing(3)
  },
  image: {
  //  height: 240,
    //backgroundImage: 'url("/images/icons/noevents.png")',
   // backgroundPositionX: 'right',
   // backgroundPositionY: 'center',
   // backgroundRepeat: 'no-repeat',
   // backgroundSize: 'cover'
  }
}));

function EmptyCours({ className, ...rest }) {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div
      {...rest}
      className={clsx(classes.root, className)}
    >
      <div className={classes.image} />
      <img src={"/images/icons/noevents 2.png"} alt="noevents" style={{width:'100px'}} />
      <Typography variant="h4">
        {t('no classes to come')}
      </Typography>
    </div>
  );
}

EmptyCours.propTypes = {
  className: PropTypes.string
};

export default EmptyCours;
