import React, { useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { Link as RouterLink } from 'react-router-dom';
import { makeStyles } from '@material-ui/styles';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Link,
  Typography,
  colors,
  Avatar
} from '@material-ui/core';
import CoursGenericMoreButton from './CoursGenericMoreButton';
import sha1 from 'sha1';
import { useSelector } from 'react-redux';
import PlayCircleFilled from '@material-ui/icons/PlayCircleFilled';
import getInitials from '../utils/getInitials';
import moment from 'moment';
import momentTZ from 'moment-timezone';
import ScheduleIcon from '@material-ui/icons/Schedule';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClock,
  faFileAlt,
  faCopy
} from '@fortawesome/free-regular-svg-icons';
import {
  faChalkboardTeacher,
  faShareAlt,
  faUserGraduate
} from '@fortawesome/free-solid-svg-icons';
import Label from '../components/Label';
import { InfoSnackbar } from '../views/Snackbars';
import { useTranslation } from 'react-i18next';
import * as API from '../services';
import ReactGA from 'react-ga';
import Spinner from 'react-bootstrap/Spinner';
import CoursClassesShowModal from '../views/Cours/CoursClassesShowModal';

const useStyles = makeStyles(theme => ({
  root: {},
  header: {
    paddingBottom: 0
  },
  content: {
    padding: 0,
    '&:last-child': {
      paddingBottom: 0
    }
  },
  description: {
    padding: theme.spacing(2, 3, 1, 3)
  },
  tags: {
    padding: theme.spacing(0, 3, 2, 3),
    '& > * + *': {
      marginLeft: theme.spacing(1)
    }
  },

  learnMoreButton: {
    width: '100%',
    color: 'white',
    backgroundColor: theme.palette.secondary.main,
    '&:hover': {
      backgroundColor: theme.palette.secondary.main
    }
  },
  learnMoreButtonTextDisabled: {
    width: '100%',
    color: `${theme.palette.primary.main} !important`,
    backgroundColor: '#9b9ea1',
    '&:hover': {
      backgroundColor: '#9b9ea1'
    }
  },
  learnMoreButtonDisable: {
    width: '100%',
    color: 'white',
    backgroundColor: '#A9A9A9',
    '&:hover': {
      backgroundColor: '#A9A9A9'
    },
    '&:disabled': {
      color: 'white'
    }
  },
  likedButton: {
    color: colors.yellow[600]
  },
  shareButton: {
    marginLeft: theme.spacing(1)
  },
  details: {
    padding: theme.spacing(2, 3)
  },

  PlayCircleFilled: {
    marignRight: theme.spacing(3),
    color: 'white'
  },
  avatar: {
    border: `2px solid ${theme.palette.common.white}`,
    height: 50,
    width: 50,
    backgroundColor: theme.palette.secondary.main
  },
  avatarHover: {
    border: `2px solid ${theme.palette.common.white}`,
    height: 55,
    width: 55,
    backgroundColor: theme.palette.secondary.main
  }
}));

function CoursCard({ className, theCours, ...rest }) {
  const classes = useStyles();
  const { t } = useTranslation(); //{t('calendar')}

  const token = useSelector(state => state.user.token);
  const user = useSelector(state => state.user.userData);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [isBoxHover, setIsBoxHover] = useState(false);
  const [errorMessage, setErrorMessage] = useState('copied !');
  const [startLoadingCours, setStartLoadingCours] = useState(false);

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  const startCours = () => {
    if (!theCours.isActive) {
      setErrorMessage(t('the course is archived'));
      setOpenSnackbar(true);
      return false;
    }

    setStartLoadingCours(true);

    ReactGA.event({
      category: 'Cours',
      action: 'Start cours!'
    });

    let queryString =
      '' +
      'meetingID=' +
      theCours.meetingID +
      '&fullName=' +
      encodeURIComponent(user.fullName) +
      '&password=' +
      (user._id === theCours.creator._id
        ? theCours.moderatorPW
        : theCours.attendeePW) +
      '&redirect=true';
    //"&redirect=true";

    let checksum = sha1(
      'join' + queryString + process.env.REACT_APP_BBB_SECRET
    );
    let coursRedirectURL =
      process.env.REACT_APP_BBB_HOST +
      '/join?' +
      queryString +
      '&checksum=' +
      checksum;

    let coursData = {
      roomQueryString: queryString,
      roomChecksum: checksum,
      roomRedirectURL: coursRedirectURL,
      roomId: theCours._id,
      meetingID: theCours.meetingID,
      roomName: theCours.roomName,
      moderatorPW: theCours.moderatorPW,
      attendeePW: theCours.attendeePW,
      isGustaveDashboard: true
    };

    API.startVerifyRoom(coursData, token)

      .then(response => {
        if (response.isRoomOn) {
          //window.open(response.roomRedirectURL, '_blank');
          window.location.href = response.roomRedirectURL;
        } else {
          setStartLoadingCours(false);
          // Cours is moved to archive automatically
        }
      })

      .catch(error => {
        setStartLoadingCours(false);
      });
  };

  return (
    <Card {...rest} className={clsx(classes.root, className)}>
      <CardHeader
        // onMouseEnter={() => setIsBoxHover(true) }
        // onMouseLeave={() => setIsBoxHover(false) }
        action={
          user._id === theCours.creator._id ? (
            <CoursGenericMoreButton thecours={theCours} />
          ) : null
        }
        avatar={
          <Avatar
            alt="cours"
            className={classes.avatar}
            src={'/images/icons/cours-home 2.png'}
          ></Avatar>
        }
        className={classes.header}
        disableTypography
        subheader={
          <Typography variant="body2">
            {t('created by')}{' '}
            <Link color="textPrimary" to="/profile/1/timeline" variant="h6">
              {theCours.creator.fullName}
            </Link>{' '}
          </Typography>
        }
        title={
          <Link color="textPrimary" variant="h4">
            {theCours ? theCours.roomName : ''}
          </Link>
        }
      />
      <Divider />
      <CardContent
        //onMouseEnter={() => setIsBoxHover(true) }
        //onMouseLeave={() => setIsBoxHover(false) }
        className={classes.content}
      >
        <div className={classes.description}>
          {!theCours.isInstant ? (
            <Typography color="textSecondary" variant="subtitle2">
              <FontAwesomeIcon
                icon={faClock}
                style={{ marginRight: '10px', marginLeft: '10px' }}
              />
              {moment(theCours.startDateTime)
                .local()
                .format('DD/MM/YYYY HH:mm')}
              <Link variant="h6"> {t('to')} </Link>
              {moment(theCours.endDateTime)
                .local()
                .format('DD/MM/YYYY HH:mm')}
            </Typography>
          ) : (
            <Typography color="textSecondary" variant="subtitle2">
              <FontAwesomeIcon
                icon={faClock}
                style={{ marginRight: '10px', marginLeft: '10px' }}
              />
              {t('instant course')}
            </Typography>
          )}
        </div>
        <Divider />
        <div className={classes.description}>
          <Typography color="textSecondary" variant="subtitle2">
            <FontAwesomeIcon
              icon={faFileAlt}
              style={{ marginRight: '10px', marginLeft: '10px' }}
            />
            {theCours.description ? theCours.description : t('no description')}
          </Typography>
        </div>

        <Divider />

        {theCours.creator._id === user._id && theCours.isActive ? (
          <div className={classes.description}>
            <Typography color="textSecondary" variant="subtitle2">
              <FontAwesomeIcon
                icon={faShareAlt}
                style={{ marginRight: '5px', marginLeft: '5px' }}
              />
              <i style={{ fontSize: '12px' }}>
                {!theCours.urlCode
                  ? (theCours.shortUrl = t('no url'))
                  : 'https://'+ process.env.REACT_APP_URL_BASE +'/live/' + theCours.urlCode}
              </i>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(
                    'https://'+ process.env.REACT_APP_URL_BASE +'/live/' + theCours.urlCode
                  );
                  setErrorMessage('copied !');
                  setOpenSnackbar(true);
                }}
                //style={{float: 'right'}}
              >
                <FontAwesomeIcon
                  icon={faCopy}
                  style={{ marginRight: '10px', marginLeft: '10px' }}
                />
                <Typography style={{ fontSize: '12px' }}>
                  {/*{t('copy')}*/}
                </Typography>
              </Button>
            </Typography>
          </div>
        ) : null}

        <Divider />
        <div className={classes.details}>
          <Grid
            alignItems="center"
            container
            justify="space-between"
            spacing={3}
          >
            <Grid item>
              {/*TODO: add modal show all classes */}
              <Typography variant="body2">{t('classes')}</Typography>
              <center>
                <Typography variant="h5">{theCours.classe.length}</Typography>
              </center>
            </Grid>
            <Grid item>
              {/*TODO: change city */}
              <Typography variant="body2">{t('city')}</Typography>
              <center>
                <Typography variant="h5">
                  {theCours.city ? theCours.city : 'NA'}
                </Typography>
              </center>
            </Grid>
            <Grid item>
              <Typography variant="body2">{t('participants')}</Typography>
              <center>
                {/*TODO: change thecours.classes with participants*/}
                <Typography variant="h5">
                  {theCours.participants ? theCours.participants : '0'}
                </Typography>
              </center>
            </Grid>
          </Grid>
        </div>
        {/*
      { theCours.classe.length > 0 ?
        <div className={classes.tags}>
         { theCours.classe.map((obj) => (
            <Label
              key={obj._id}
              color={'#388e3c'}
              style={{padding:'15px'}}
            >
              <FontAwesomeIcon icon={faChalkboardTeacher} size="lg" style={{marginRight:'10px'}} />
              <Link style={{ color: 'white' }}
                component={RouterLink}
               to={'/classe/' + obj._id }> {obj.classeName}  </Link>
            </Label>))}

        </div> : null
      }
      */}
        <Divider />
        <div className={classes.details}>
          <Grid
            alignItems="center"
            container
            justify="space-between"
            spacing={3}
          >
            <Grid item style={{ width: '100%' }}>
              <Button
                className={
                  theCours.isActive
                    ? classes.learnMoreButton
                    : classes.learnMoreButtonDisable
                }
                size="large"
                color="primary"
                onClick={() => startCours()}
                disabled={startLoadingCours}
              >
                {startLoadingCours && theCours.isActive ? (
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                ) : null}

                {startLoadingCours ? null : theCours.isActive ? (
                  <PlayCircleFilled className={classes.PlayCircleFilled} />
                ) : null}
                {startLoadingCours
                  ? null
                  : theCours.isActive
                  ? t('start')
                  : t('deactivate')}
              </Button>
            </Grid>
          </Grid>
        </div>
      </CardContent>
      <InfoSnackbar
        onClose={handleSnackbarClose}
        open={openSnackbar}
        errorMessage={errorMessage}
      />
    </Card>
  );
}

CoursCard.propTypes = {
  className: PropTypes.string,
  theCours: PropTypes.object.isRequired
};

export default CoursCard;
