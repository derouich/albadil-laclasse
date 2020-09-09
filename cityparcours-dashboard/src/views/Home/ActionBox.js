import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import {
  Button,
  Card,
  CardActions,
  Divider,
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {},
  media: {
    height: 150
  },
  placeholderBlue: {
    height: 150,
   // backgroundColor: '#bf0b0e', red
   backgroundColor : '#009dec',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center' ,

  },
  placeholderOrange: {
    height: 150,
    // backgroundColor: '#bf0b0e',  red
    backgroundColor : '#388e3c',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center' ,

  },
  insertDriveFileIcon: {
    height: theme.spacing(15),
    width: theme.spacing(15),
    fontSize: theme.spacing(6) ,

  },
  content: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  actions: {
    justifyContent: 'center'
  },
  AddIcon: {
    marignRight: theme.spacing(3) ,
  },
  menu: {
    width: 250,
    maxWidth: '100%'
  }
}));

function ActionBox({ tuto, className, ...rest }) {
  const classes = useStyles();

  return (
    <Card
      {...rest}
      className={clsx(classes.root, className)}
    >
      {
        tuto.type === 'cours' ?
          (
            <div className={classes.placeholderBlue}>
              <img src="/images/icons/cours-home 2.png" className={classes.insertDriveFileIcon} />
            </div>
          ) : (
            <div className={classes.placeholderOrange}>
              <img src="/images/icons/classe-home 2.png" className={classes.insertDriveFileIcon} />
            </div>
          )
      }
      <Divider />

      <CardActions className={classes.actions}>
        <Button  >
          {tuto.name}
        </Button>
      </CardActions>
    </Card>
  );
}

ActionBox.propTypes = {
  className: PropTypes.string,
};

export default ActionBox;
