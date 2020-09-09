import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { Fab } from '@material-ui/core';
import franceIcon from './../assets/images/flags/france.svg'
import moroccoIcon from './../assets/images/flags/morocco.svg'

const useStyles = makeStyles((theme) => ({
  fab: {
    position: 'fixed',
    bottom: 20,
    right: 20,
    zIndex: theme.zIndex.drawer - 100
  },
  flag: {
    height: '100%',
    width: '100%',
    position: 'absolute'
  }
}));

function DirectionToggle({ direction, onToggle }) {
  const classes = useStyles();

  return (
    <>
      <Fab
        className={classes.fab}
        color="primary"
        onClick={onToggle}
        size="small"
      >
        {
          direction === 'rtl' ?
            <img src={franceIcon} className={classes.flag} alt="Fr" />
            :
            <img src={moroccoIcon} className={classes.flag} alt="Ar" />
        }
      </Fab>
    </>
  );
}

DirectionToggle.propTypes = {
  direction: PropTypes.string,
  onToggle: PropTypes.func
};

export default DirectionToggle;
