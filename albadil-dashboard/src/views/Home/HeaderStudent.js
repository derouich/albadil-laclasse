import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import Alert from 'src/components/Alert';
import InfoBox from './InfoBox';
import EmptyCours from './EmptyCours';
import CreateClassModal from '../Classe/CreateClassModal';
import CreateCoursModal from '../Classe/CreateCoursModal';
import { Link as RouterLink } from 'react-router-dom';
import getInitials from 'src/utils/getInitials';
import moment from 'moment';
import sha1 from 'sha1';
import { useTranslation } from 'react-i18next';
import Page from 'src/components/Page';
import { Container } from '@material-ui/core';
import Results from '../Cours/Results';

const useStyles = makeStyles((theme) => ({
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
  } ,
  InfoBox: {
    marginTop: theme.spacing(3)
  },
  ActionBox: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  box : {
    marginRight: theme.spacing(3)
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
  ActionIcon: {
    height: theme.spacing(15),
    width: theme.spacing(15),
    fontSize: theme.spacing(6) ,
    marginTop: theme.spacing(3) 
  },
    ActionIconHover: {
    height: theme.spacing(20),
    width: theme.spacing(25),
    fontSize: theme.spacing(6) ,
    marginTop: theme.spacing(3) ,
    cursor:'pointer'
  },

  actions: {
    justifyContent: 'center'
  },
}));

function HeaderStudent({ className, userdata, ...rest }) {
  const classes = useStyles();
  const { t } = useTranslation();

  const user = useSelector((state) => state.user);
  const [openCreateClassModal, setOpenCreateClassModal] = useState(false);
  const [openCreateCoursModal, setOpenCreateCoursModal] = useState(false);
  const [openAlert, setOpenAlert] = useState(true);
  const [isCoursHover, setIsCoursHover] = useState(false);
  const [isClasseHover, setIsClasseHover] = useState(false);

  let action = [
    { name: t('create a class'), type: "classe" },
    { name: t('create a course'), type: "cours" }
  ];

  const startCours = (meetingID, moderatorPW, attendeePW) => {
    let queryString = "" +
      "meetingID=" + meetingID +
      "&fullName=" + user.userData.fullName.split(' ').join('+') +
      "&password=" + (user.userData.isModerator ? moderatorPW : attendeePW) +
      "&redirect=true";

    let checksum = sha1("join" + queryString + process.env.REACT_APP_BBB_SECRET);

    let coursRedirectURL = process.env.REACT_APP_BBB_HOST + '/join?' + queryString + '&checksum=' + checksum;

    window.open(coursRedirectURL, "_blank");
  };

  let cours = []; // 5 max
  let comingCoursNumber = 0;
  let totalStudents = [];

  if (userdata.classes) {
    for (let classe of userdata.classes) {
      for (let _user of classe.users) {
        if (_user.email.toString() !== user.userData.email.toString()) {
          totalStudents.push(_user.email);
        }
      }

      // Get classe invited students
      for (let _user of classe.invited) {
        if (_user.email.toString() !== user.userData.email.toString()) {
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

        if (cours.length < 5 ) {
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
     <Page
      className={classes.root}
      title={t('my courses')}
    >
      <Container maxWidth="lg">
        <Results className={classes.results} />
      </Container>
    </Page>
  );
}

HeaderStudent.propTypes = {
  className: PropTypes.string
};

export default HeaderStudent;
