import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Container } from '@material-ui/core';
import Page from 'src/components/Page';
import Header from './Header';
import { Redirect } from 'react-router-dom';

import { useSelector } from 'react-redux';
import * as API from '../../services';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3)
  },
  statistics: {
    marginTop: theme.spacing(3)
  },
  notifications: {
    marginTop: theme.spacing(6)
  },
  projects: {
    marginTop: theme.spacing(6)
  },
  todos: {
    marginTop: theme.spacing(6)
  }
}));

function HomeView() {
  const classes = useStyles();
  const { t } = useTranslation();
  const token = useSelector((state) => state.user.token);
  const user = useSelector((state) => state.user.userData);

  const [userData, setUserData] = useState([]);
  const [isLoading , setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchUserData = () => {
      API.getConnectedUser(token)
        .then((user) => {
          if (mounted) {
            setUserData(user);
            setIsLoading(false);
          }
        })
        .catch((error) => { console.log(error); });
    };

    fetchUserData();

    return () => {
      mounted = false;
    };
  }, [token]);

  if (!user.isModerator) {
    return <Redirect to={`/cours`} />;
  }

  return (
    <Page
      className={classes.root}
      title={t('home')}
    >
      <Container maxWidth="lg">
        <Header userdata={userData} />
      </Container>
    </Page>
  );
}

export default HomeView;
