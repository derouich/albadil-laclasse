import React, { useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import {
  Container,
  Avatar,
  Typography,
  Button,
  colors
} from '@material-ui/core';
import PeopleOutlined from '@material-ui/icons/PeopleOutlined';
import AddIcon from '@material-ui/icons/Add';
import CreateCoursModal from '../Classe/CreateCoursModal';
import { useSelector } from 'react-redux';
import ManageStudentsModal from '../Classe/ManageStudentsModal';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(theme => ({
  root: {},
  cover: {
    position: 'relative',
    height: 80,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    '&:before': {
      position: 'absolute',
      content: '" "',
      top: 0,
      left: 0,
      height: '100%',
      width: '100%',
      backgroundColor: theme.palette.secondary.dark
      //  backgroundImage: 'linear-gradient(90deg, rgba(247,183,49,1) 0%, rgba(247,193,49,1) 30%, rgba(247,193,49,1) 74%)'
    },
    '&:hover': {
      '& $changeButton': {
        visibility: 'visible'
      }
    }
  },
  changeButton: {
    visibility: 'hidden',
    position: 'absolute',
    bottom: theme.spacing(3),
    right: theme.spacing(3),
    backgroundColor: colors.blueGrey[900],
    color: theme.palette.common.white,
    [theme.breakpoints.down('md')]: {
      top: theme.spacing(3),
      bottom: 'auto'
    },
    '&:hover': {
      backgroundColor: colors.blueGrey[900]
    }
  },
  addPhotoIcon: {
    marginRight: theme.spacing(1)
  },
  container: {
    padding: theme.spacing(2, 3),
    position: 'relative',
    display: 'flex',
    flexWrap: 'wrap',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column'
    }
  },
  avatar: {
    border: `2px solid ${theme.palette.common.white}`,
    height: 120,
    width: 120,
    top: -60,
    left: theme.spacing(3),
    position: 'absolute',
    backgroundColor: theme.palette.secondary.dark
  },
  details: {
    marginLeft: 136
  },
  actions: {
    marginLeft: 'auto',
    [theme.breakpoints.down('sm')]: {
      marginTop: theme.spacing(1)
    },
    '& > * + *': {
      marginLeft: theme.spacing(1)
    }
  },
  pendingButton: {
    color: theme.palette.common.white,
    backgroundColor: colors.red[600],
    '&:hover': {
      backgroundColor: colors.red[900]
    }
  },
  personAddIcon: {
    marginRight: theme.spacing(1)
  },
  mailIcon: {
    marginRight: theme.spacing(1)
  }
}));

function Header({ className, classeId, thisclasse, ...rest }) {
  const classes = useStyles();
  const { t } = useTranslation(); //{t('calendar')}

  const user = useSelector(state => state.user.userData);

  const [openCreateCoursModal, setOpenCreateCoursModal] = useState(false);
  const [manageStudents, setManageStudents] = useState(false);

  return (
    <div {...rest} className={clsx(classes.root, className)}>
      <div className={classes.cover}></div>
      <Container maxWidth="lg" className={classes.container}>
        <Avatar
          alt="classe"
          className={classes.avatar}
          src={'/images/icons/classe-home 2.png'}
        />
        <div className={classes.details}>
          <Typography component="h1" variant="h4">
            {thisclasse.classeName}
          </Typography>
          <Typography component="h2" gutterBottom variant="overline">
            {thisclasse.schoolName + ', ' + thisclasse.city}
          </Typography>
        </div>

        {user.isModerator && thisclasse.creator === user._id ? (
          <div className={classes.actions}>
            <Button
              color="primary"
              variant="contained"
              onClick={() => setManageStudents(true)}
            >
              <PeopleOutlined className={classes.mailIcon} />
              {t('manage students')}
            </Button>

            <Button
              color="primary"
              variant="contained"
              onClick={() => setOpenCreateCoursModal(true)}
            >
              <AddIcon className={classes.mailIcon} />
              {t('create a course')}
            </Button>
          </div>
        ) : null}

        <CreateCoursModal
          onClose={() => setOpenCreateCoursModal(false)}
          open={openCreateCoursModal}
          currentClasseId={classeId}
        />
      </Container>

      <ManageStudentsModal
        onClose={() => {
          setManageStudents(false);
        }}
        open={manageStudents}
        isClasse={true}
        thisthingid={classeId}
      />
    </div>
  );
}

Header.propTypes = {
  className: PropTypes.string
};

export default Header;
