import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Link as RouterLink, useLocation, useParams } from 'react-router-dom';
import {
  Button,
  Card,
  CardContent,
  Typography,
  useMediaQuery,
  useTheme
} from '@material-ui/core';
import Page from 'src/components/Page';
import ShareForm from './ShareForm';
import ShareLinkError from './ShareLinkError';
import { useHistory } from 'react-router';
import { useTranslation } from 'react-i18next';
import SchoolIcon from '@material-ui/icons/School';
import * as API from '../../../services';
import { addLabelForSelectorClasse } from '../../../utils/ListHelper';
import { useSelector } from 'react-redux';
import moment from 'moment';

const useStyles = makeStyles(theme => ({
  root: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(6, 6)
  },
  card: {
    width: theme.breakpoints.values.md,
    maxWidth: '100%',
    overflow: 'visible',
    display: 'flex',
    position: 'relative',
    '& > *': {
      flexGrow: 1,
      flexBasis: '50%',
      width: '50%'
    }
  },
  content: {
    padding: theme.spacing(8, 4, 3, 4)
  },
  media: {
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    padding: theme.spacing(3),
    color: theme.palette.common.white,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    [theme.breakpoints.down('md')]: {
      display: 'none'
    }
  },
  icon: {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.common.white,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1),
    position: 'absolute',
    top: -32,
    left: theme.spacing(3),
    height: 64,
    width: 64,
    fontSize: 32
  },
  ReForgetPasswordForm: {
    marginTop: theme.spacing(3),
    marginMargin: theme.spacing(3)
  },
  divider: {
    margin: theme.spacing(2, 0)
  },
  person: {
    marginTop: theme.spacing(2),
    display: 'flex'
  },
  avatar: {
    marginRight: theme.spacing(2)
  },
  createAccountBtn: {
    marginTop: theme.spacing(2),
    width: '100%'
  }
}));

function ReForgetPassword() {
  const classes = useStyles();
  const { t } = useTranslation(); //{t('calendar')}

  const { id } = useParams();

  return (
    <Page className={classes.root} title={t('title share email')}>
      <Card className={classes.card}>
        <CardContent className={classes.content}>
          <SchoolIcon className={classes.icon} />
          <Typography gutterBottom variant="h3">
            {t('share email description')}
          </Typography>
          <Typography variant="subtitle2"></Typography>

          <ShareForm roomCode={id} className={classes.ShareForm} />
        </CardContent>
      </Card>
    </Page>
  );
}

export default ReForgetPassword;
