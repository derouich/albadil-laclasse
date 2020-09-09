import React, { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import {
  Container,
  Tabs,
  Tab,
  Divider,
  colors
} from '@material-ui/core';
import Page from 'src/components/Page';
import Header from './Header';
import Connections from './Connections';
import Projects from './Projects';
import HistoryCours from './../Cours/HistoryCours';
import { useSelector } from 'react-redux';
import * as API from '../../services';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme) => ({
  root: {},
  container: {
    marginTop: theme.spacing(3) ,

  },
  divider: {
    backgroundColor: colors.grey[300]
  },
  content: {
    marginTop: theme.spacing(3)
  }
}));

function Profile({ match, history }) {
  const classes = useStyles();
  const { t } = useTranslation(); //{t('calendar')}

  const user = useSelector((state) => state.user.userData);
  const token = useSelector((state) => state.user.token);

  const [classe, setClasse] = useState([]);

  const { id, tab: currentTab } = match.params;

  const tabs = [
    { value: 'studentsList', label: t('students list') },
    { value: 'cours', label: t('courses') },
    { value: 'historique' , label : t('archived courses')}
  ];

  const handleTabsChange = (event, value) => {
    history.push(value);
  };

  useEffect(() => {
    let mounted = true;

    const fetchClasse = () => {
      API.getClasse(id, token)
        .then((classe) => {
          if (mounted) {
            setClasse(classe);
          }
        })
        .catch((error) => { console.log(error); });
    };

    fetchClasse();

    return () => {
      mounted = false;
    };
  }, []);

  if (!currentTab) {
    return <Redirect to={`/classe/${id}/studentsList`} />;
  }

  if (!tabs.find((tab) => tab.value === currentTab)) {
    return <Redirect to="/errors/error-404" />;
  }
  return (
    
    <Page
      className={classes.root}
      title="Classe"
    >
      <Header
        classeId={id}
        thisclasse={classe}
      />
      <Container maxWidth="lg">
        <Tabs
          indicatorColor="primary"
          onChange={handleTabsChange}
          scrollButtons="auto"
          value={currentTab}
          variant="scrollable"
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.value}
              label={tab.label}
              value={tab.value}
            />
          ))}
        </Tabs>
        <Divider className={classes.divider} />
        <div className={classes.content}>
          {currentTab === 'studentsList' && <Connections thisclasse={classe} classeId={id} />}
          {currentTab === 'cours' && <Projects classeId={id} />}
          {currentTab === 'historique' && <HistoryCours classeId={id} />}
        </div>
      </Container>
    </Page>
  );
}

Profile.propTypes = {
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired
};

export default Profile;
