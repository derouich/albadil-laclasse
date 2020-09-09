import React, { useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import { Typography, Grid, Button } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import CreateClassModal from '../Classe/CreateClassModal';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme) => ({
  root: {},
  addIcon: {
    marginRight: theme.spacing(1)
  }
}));

function Header({ className, ...rest }) {
  const classes = useStyles();
  const { t } = useTranslation(); //{t('calendar')}

  const user = useSelector((state) => state.user.userData);

  const [openCreateClassModal, setOpenCreateClassModal] = useState(false);

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
            {t('my classes')}
          </Typography>
        </Grid>
        <Grid item>

          {/*
          {
            user.isModerator ?
              <Button
                color="primary"
                variant="contained"
                onClick={() => setOpenCreateClassModal(true)}
              >
                <AddIcon className={classes.addIcon} />
                {t('create a class')}
              </Button>
              : null
          }
          */}

        </Grid>

        <CreateClassModal
          onClose={() => setOpenCreateClassModal(false)}
          open={openCreateClassModal}
        />
      </Grid>
    </div>
  );
}

Header.propTypes = {
  className: PropTypes.string
};

export default Header;
