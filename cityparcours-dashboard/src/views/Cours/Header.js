import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import { Typography, Grid, Button } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import CreateCoursModal from '../Classe/CreateCoursModal';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme) => ({
  root: {},
  addIcon: {
    marginRight: theme.spacing(3)
  }
}));

function Header({ className, ...rest }) {
  const classes = useStyles();
  const { t } = useTranslation(); //{t('calendar')}

  const user = useSelector((state) => state.user.userData);

  const [openCreateCoursModal, setOpenCreateCoursModal] = useState(false);

  return (
    <div
      {...rest}
      className={clsx(classes.root, className)}
    >
      <Grid
        alignItems="flex-end"
        container
        justify="space-between"
        spacing={3}
      >
        <Grid item>
          <Typography
            component="h2"
            gutterBottom
            variant="overline"
          >
            {t('my courses')}
          </Typography>
        </Grid>
        <Grid item>
          {/*
          {
            user.isModerator ?
              <Button
                color="primary"
                variant="contained"
                onClick={() => setOpenCreateCoursModal(true)}
              >
                <AddIcon className={classes.addIcon} />
                {t('create a course')}
              </Button>
              : null
          }
          */}

        </Grid>

        <CreateCoursModal
          onClose={() => setOpenCreateCoursModal(false)}
          open={openCreateCoursModal}
        />
      </Grid>
    </div>
  );
}

Header.propTypes = {
  className: PropTypes.string
};

export default Header;
