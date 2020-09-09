import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import Alert from 'src/components/Alert';
import InfoBox from './InfoBox';
import EmptyCours from './EmptyCours';
import {
  Typography,
  Grid,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText
} from '@material-ui/core';
import CreateClassModal from '../Classe/CreateClassModal';
import CreateCoursModal from '../Classe/CreateCoursModal';
import { Link as RouterLink } from 'react-router-dom';
import getInitials from 'src/utils/getInitials';
import moment from 'moment';
import sha1 from 'sha1';
import { useTranslation } from 'react-i18next';
import video1Bg from './../../assets/images/video-1.png';
import video2Bg from './../../assets/images/video-2.png';

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(1)
  },
  summaryButton: {
    backgroundColor: theme.palette.common.white,
    marginRight: theme.spacing(1)
  },
  barChartIcon: {
    marginRight: theme.spacing(1)
  },
  image: {
    width: '100%',
    maxHeight: 400
  },
  name: {
    marginTop: theme.spacing(2)
  },
  header: {
    paddingBottom: 0
  },
  content: {
    paddingTop: 0
  },
  listItem: {
    padding: theme.spacing(2, 0),
    justifyContent: 'space-between'
  },
  alert: {
    //  backgroundColor : colors.blue[600]
  },
  InfoBox: {
    marginTop: theme.spacing(3)
  },
  ActionBox: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3)
  },
  box: {
    marginRight: theme.spacing(3)
  },
  placeholderBlue: {
    height: 150,
    // backgroundColor: '#bf0b0e', red
    backgroundColor: theme.palette.secondary.main,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  placeholderOrange: {
    height: 150,
    // backgroundColor: '#bf0b0e',  red
    backgroundColor: theme.palette.secondary.main,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  ActionIcon: {
    height: theme.spacing(15),
    width: theme.spacing(15),
    fontSize: theme.spacing(6),
    marginTop: theme.spacing(3)
  },
  ActionIconHover: {
    height: theme.spacing(17),
    width: theme.spacing(17),
    fontSize: theme.spacing(6),
    marginTop: theme.spacing(3),
    cursor: 'pointer'
  },

  actions: {
    justifyContent: 'center'
  }
}));

function Header({ className, userdata, ...rest }) {
  const classes = useStyles();
  const { t } = useTranslation();

  const user = useSelector(state => state.user);
  const [openCreateClassModal, setOpenCreateClassModal] = useState(false);
  const [openCreateCoursModal, setOpenCreateCoursModal] = useState(false);
  const [openAlert, setOpenAlert] = useState(true);
  const [isCoursHover, setIsCoursHover] = useState(false);
  const [isClasseHover, setIsClasseHover] = useState(false);

  let action = [
    { name: t('create a class'), type: 'classe' },
    { name: t('create a course'), type: 'cours' }
  ];

  const startCours = (meetingID, moderatorPW, attendeePW) => {
    let queryString =
      '' +
      'meetingID=' +
      meetingID +
      '&fullName=' +
      user.userData.fullName.split(' ').join('+') +
      '&password=' +
      (user.userData.isModerator ? moderatorPW : attendeePW) +
      '&redirect=true';

    let checksum = sha1(
      'join' + queryString + process.env.REACT_APP_BBB_SECRET
    );

    let coursRedirectURL =
      process.env.REACT_APP_BBB_HOST +
      '/join?' +
      queryString +
      '&checksum=' +
      checksum;

    window.open(coursRedirectURL, '_blank');
  };

  let cours = []; // 5 max
  let comingCoursNumber = 0;
  let totalStudents = [];

  if (userdata.classes) {
    for (let classe of userdata.classes) {
      for (let _user of classe.users) {
        if (
          _user.email &&
          _user.email.toString() !== user.userData.email.toString()
        ) {
          totalStudents.push(_user.email);
        }
      }

      // Get classe invited students
      for (let _user of classe.invited) {
        if (
          _user.email &&
          _user.email.toString() !== user.userData.email.toString()
        ) {
          totalStudents.push(_user.email);
        }
      }
    }
  }

  if (userdata.rooms) {
    for (let room of userdata.rooms) {
      // Get room students
      for (let _user of room.users) {
        if (_user.email.toString() !== user.userData.email.toString()) {
          totalStudents.push(_user.email);
        }
      }

      // Get room invited students
      for (let _user of room.invited) {
        if (_user.email.toString() !== user.userData.email.toString()) {
          totalStudents.push(_user.email);
        }
      }

      if (moment().isBefore(room.startDateTime)) {
        comingCoursNumber += 1;

        if (cours.length < 5) {
          if (!room.isInstant) {
            cours.push({
              name: room.roomName,
              meetingID: room.meetingID,
              moderatorPW: room.moderatorPW,
              attendeePW: room.attendeePW,
              date: moment(room.startDateTime).format('DD MM YYYY, HH:mm')
            });
          }
        }
      }
    }
  }

  const handleAlertClose = () => {
    setOpenAlert(false);
  };

  return (
    <div {...rest} className={clsx(classes.root, className)}>
      {openAlert && (
        <Alert
          className={classes.alert}
          variant="info"
          message={t('home alert message')}
          onClose={handleAlertClose}
        />
      )}

      <Grid alignItems="center" container alignItems="flex-start" spacing={1}>
        <Grid item sm={12} xs={12} md={8}>
          <Typography component="h1" gutterBottom variant="h3">
            {t('welcome')}, {user.userData.fullName}
          </Typography>

          {user.userData.isModerator ? (
            <Grid
              className={classes.ActionBox}
              justify="center"
              alignItems="flex-start"
              container
              spacing={3}
            >
              {action.map(act => (
                <Grid
                  item
                  xs={12}
                  sm={5}
                  lg={5}
                  className={classes.box}
                  key={act.type}
                >
                  <Card>
                    {act.type === 'cours' ? (
                      <div
                        className={classes.placeholderBlue}
                        onClick={() => setOpenCreateCoursModal(true)}
                        onMouseEnter={() => setIsCoursHover(true)}
                        onMouseLeave={() => setIsCoursHover(false)}
                      >
                        <img
                          src="/images/icons/cours-home 2.png"
                          className={
                            !isCoursHover
                              ? classes.ActionIcon
                              : classes.ActionIconHover
                          }
                        />
                      </div>
                    ) : (
                      <div
                        className={classes.placeholderOrange}
                        onClick={() => setOpenCreateClassModal(true)}
                        onMouseEnter={() => setIsClasseHover(true)}
                        onMouseLeave={() => setIsClasseHover(false)}
                      >
                        <img
                          src="/images/icons/classe-home 2.png"
                          className={
                            !isClasseHover
                              ? classes.ActionIcon
                              : classes.ActionIconHover
                          }
                        />
                      </div>
                    )}
                    <Divider />

                    <CardActions className={classes.actions}>
                      <Button
                        onClick={() => {
                          act.type === 'cours'
                            ? setOpenCreateCoursModal(true)
                            : setOpenCreateClassModal(true);
                        }}
                      >
                        {act.name}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : null}

          <CreateClassModal
            onClose={() => setOpenCreateClassModal(false)}
            open={openCreateClassModal}
          />

          <CreateCoursModal
            onClose={() => setOpenCreateCoursModal(false)}
            open={openCreateCoursModal}
          />

          <Grid
            className={classes.InfoBox}
            justify="center"
            alignItems="flex-start"
            container
            spacing={3}
          >

            {/*
              <img
                alt="Logo"
                src="/images/logos/logo-gustave.png"
                width="300"
                height="300"
              />
            */}

          </Grid>
        </Grid>
        <Grid item sm={12} xs={12} md={4}>
          <Card
            {...rest}
            styles={{ marginTop: '10px' }}
            className={clsx(classes.root, className)}
          >
            <CardHeader
              avatar={
                <Avatar
                  alt="Author"
                  className={classes.avatar}
                  component={RouterLink}
                  src={user.userData.profileImage}
                  to="/settings/general"
                >
                  {getInitials(user.userData.fullName)}
                </Avatar>
              }
              className={classes.header}
              disableTypography
              subheader={
                <Typography
                  component={RouterLink}
                  to="/settings/general"
                  variant="h5"
                >
                  {user.userData.email}
                </Typography>
              }
              title={
                <Typography display="block" variant="overline">
                  {user.userData.fullName}
                </Typography>
              }
            />
            <CardContent className={classes.content}>
              <List>
                <ListItem
                  className={classes.listItem}
                  disableGutters
                  divider
                  key={'totalCours'}
                >
                  <Typography variant="subtitle2">
                    {t('total courses')}
                  </Typography>
                  <Typography variant="h6">
                    {userdata && userdata.rooms ? userdata.rooms.length : '0'}
                  </Typography>
                </ListItem>
                <ListItem
                  className={classes.listItem}
                  disableGutters
                  divider
                  key={'totalClasses'}
                >
                  <Typography variant="subtitle2">
                    {t('total classes')}
                  </Typography>
                  <Typography variant="h6">
                    {userdata && userdata.classes
                      ? userdata.classes.length
                      : '0'}
                  </Typography>
                </ListItem>

                {user.userData.isModerator ? (
                  <ListItem
                    className={classes.listItem}
                    disableGutters
                    divider
                    key={'totalEtudiants'}
                  >
                    <Typography variant="subtitle2">
                      {t('total students')}
                    </Typography>
                    <Typography variant="h6">
                      {[...new Set(totalStudents)].length}
                    </Typography>
                  </ListItem>
                ) : null}

                <ListItem
                  className={classes.listItem}
                  disableGutters
                  key={'CoursProchain'}
                >
                  <Typography variant="subtitle2">
                    {t('next classes')}
                  </Typography>
                  <Typography variant="h6">{comingCoursNumber}</Typography>
                </ListItem>
              </List>
            </CardContent>
          </Card>
          <Card {...rest} className={clsx(classes.root, className)}>
            <CardHeader
              className={classes.header}
              title={t('coming courses')}
              titleTypographyProps={{
                variant: 'overline'
              }}
            />
            <CardContent className={classes.content}>
              {cours.length > 0 ? (
                <List>
                  {cours.map(cour => (
                    <ListItem disableGutters key={cour.name}>
                      <ListItemAvatar>
                        <Avatar
                          alt="Author"
                          className={classes.avatar}
                          component={RouterLink}
                          to="/calendar"
                          src={'/images/icons/calendar.png'}
                        ></Avatar>
                      </ListItemAvatar>

                      <ListItemText
                        primary={cour.name}
                        primaryTypographyProps={{ variant: 'h6' }}
                        secondary={cour.date}
                        onClick={() =>
                          startCours(
                            cour.meetingID,
                            cour.moderatorPW,
                            cour.attendeePW
                          )
                        }
                        style={{ cursor: 'pointer' }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <EmptyCours />
              )}
            </CardContent>

            <CardActions className={classes.actions}>
              <Button fullWidth component={RouterLink} to="/cours">
                {t('all courses')}
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}

Header.propTypes = {
  className: PropTypes.string
};

export default Header;
