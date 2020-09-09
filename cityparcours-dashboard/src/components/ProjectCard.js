import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import clsx from 'clsx';
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
import ClasseGenericMoreButton from './ClasseGenericMoreButton';
import { useSelector } from 'react-redux';
import * as API from '../services';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(theme => ({
  root: {},
  header: {
    paddingBottom: 20
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
    backgroundColor: theme.palette.secondary.dark,
    color: 'white',
    '&:hover': {
      backgroundColor: theme.palette.secondary.dark,
      color: '#FFFFFF'
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
    backgroundColor: '#388e3c'
  }
}));

function ProjectCard({ theClasse, className, ...rest }) {
  const classes = useStyles();
  const { t } = useTranslation(); //{t('calendar')}

  const user = useSelector(state => state.user.userData);
  const token = useSelector(state => state.user.token);

  const [classeParticipants, setClasseParticipants] = useState([]);

  const [isBoxHover, setIsBoxHover] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchClassesParticipant = () => {
      API.getClasseParticipant(theClasse._id, token)
        .then(participants => {
          if (mounted) {
            setClasseParticipants(participants);
          }
        })
        .catch(error => {
          console.log(error);
        });
    };

    fetchClassesParticipant();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Card {...rest} className={clsx(classes.root, className)}>
      <CardHeader
        //onMouseEnter={() => setIsBoxHover(true) }
        //onMouseLeave={() => setIsBoxHover(false) }
        action={
          user.isModerator && user._id === theClasse.creator ? (
            <ClasseGenericMoreButton theclasse={theClasse} />
          ) : null
        }
        avatar={
          <Avatar
            alt="classe"
            className={classes.avatar}
            src={'/images/icons/classe-home 2.png'}
          ></Avatar>
        }
        className={classes.header}
        disableTypography
        subheader={
          <Typography variant="body2">
            {/*
            by
            {' '}
            <Link
              color="textPrimary"
              component={RouterLink}
              to="/profile/1/timeline"
              variant="h6"
            >
              {project.author.name}
            </Link>

            {' '}
            | Updated:
            {' '}
            {moment(project.updated_at).fromNow()}
            */}
          </Typography>
        }
        title={
          <Link
            color="textPrimary"
            variant="h3"
            component={RouterLink}
            to={'/classe/' + (theClasse ? theClasse._id : 'null')}
          >
            {theClasse ? theClasse.classeName : ''}
          </Link>
        }
      />

      <CardContent
        //onMouseEnter={() => setIsBoxHover(true) }
        // onMouseLeave={() => setIsBoxHover(false) }
        className={classes.content}
      >
        <Divider />
        <div className={classes.details}>
          <Grid
            alignItems="center"
            container
            justify="space-between"
            spacing={3}
          >
            <Grid item>
              <Typography variant="body2">{t('establishment')}</Typography>
              <Typography variant="h5">
                {theClasse ? theClasse.schoolName : ''}
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="body2">{t('city')}</Typography>
              <Typography variant="h5">
                {theClasse ? theClasse.city : ''}
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="body2">{t('participants')}</Typography>
              <Typography variant="h5">
                {classeParticipants ? classeParticipants.length - 1 : '0'}
              </Typography>
            </Grid>

            <Grid item style={{ width: '100%' }}>
              <Button
                className={classes.learnMoreButton}
                size="large"
                color="primary"
                component={RouterLink}
                to={'/classe/' + (theClasse ? theClasse._id : 'null')}
              >
                {t('access')}
              </Button>
            </Grid>
          </Grid>
        </div>
      </CardContent>
    </Card>
  );
}

ProjectCard.propTypes = {
  className: PropTypes.string,
  theClasse: PropTypes.object.isRequired
};

export default ProjectCard;
