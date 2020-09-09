import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import { Grid , colors} from '@material-ui/core';
import CoursCard from 'src/components/CoursCard';
import * as API from '../../services';
import Alert from 'src/components/Alert';
import EmptyElements from '../Empty/EmptyElements';

import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import LoadingElement from '../Loading/LoadingElement';

const useStyles = makeStyles((theme) => ({
  root: {},
    alert: {
      marginTop: theme.spacing(3) ,
      marginBottom: theme.spacing(3) ,
      backgroundColor: colors.blue[700]
  },
  divider: {
    backgroundColor: colors.grey[300]
  } ,

}));

function HistoryCours({ className, classeId, ...rest }) {
  const classes = useStyles();
  const { t } = useTranslation(); //{t('calendar')}

  const token = useSelector((state) => state.user.token);
  const [openAlert, setOpenAlert] = useState(false);

  const [classe, setClasse] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleAlertClose = () => {
    setOpenAlert(false);
  };
  useEffect(() => {
    let mounted = true;

    const fetchClasse = () => {
      API.getArchivedClasse(classeId, token)
        .then((classe) => {
          if (mounted) {
            setClasse(classe);
            setIsLoading(false);
            // show alert that elements will be in history automaticaly if rooms more than 1
            if(classe.rooms.length > 0 ) setOpenAlert(true);
          }
        })
        .catch((error) => { console.log(error); });
    };

    fetchClasse();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div
      {...rest}
      className={clsx(classes.root, className)}
    >
    {
      isLoading ? <LoadingElement /> :
        (classe.rooms && classe.rooms.length > 0 ) ?
        <Grid
          container
          spacing={3}
        >
          {classe && classe.rooms ? classe.rooms.map((room) => (
            <Grid
              item
              key={room._id}
              lg={4}
              lx={4}
              md={6}
              xs={12}
            >
              <CoursCard
                theCours={room}
              />
            </Grid>
          )) : null}
        </Grid>
        : <EmptyElements title={t('no archived course')} description={''} />
    }
    </div>
  );
}

HistoryCours.propTypes = {
  className: PropTypes.string
};

export default HistoryCours;
