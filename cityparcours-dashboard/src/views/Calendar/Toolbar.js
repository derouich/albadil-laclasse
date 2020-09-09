import React from 'react';
import clsx from 'clsx';
import moment from 'moment';
import 'moment/locale/fr';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import {
  Grid,
  Hidden,
  Typography,
  Tooltip,
  ButtonGroup,
  IconButton,
  Button
} from '@material-ui/core';
import ViewConfigIcon from '@material-ui/icons/ViewComfyOutlined';
import ViewWeekIcon from '@material-ui/icons/ViewWeekOutlined';
import ViewDayIcon from '@material-ui/icons/ViewDayOutlined';
import ViewAgendaIcon from '@material-ui/icons/ViewAgendaOutlined';
import AddIcon from '@material-ui/icons/Add';

import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

moment.locale('fr');

const useStyles = makeStyles((theme) => ({
  root: {},
  addIcon: {
    marginRight: theme.spacing(3)
  }
}));

const viewOptions = [
  {
    label: 'Month',
    value: 'dayGridMonth',
    icon: ViewConfigIcon
  },
  {
    label: 'Week',
    value: 'timeGridWeek',
    icon: ViewWeekIcon
  },
  {
    label: 'Day',
    value: 'timeGridDay',
    icon: ViewDayIcon
  },
  {
    label: 'Agenda',
    value: 'listWeek',
    icon: ViewAgendaIcon
  }
];

function Toolbar({
  date,
  view,
  onDatePrev,
  onDateNext,
  onEventAdd,
  onViewChange,
  onDateToday,
  className,
  ...rest
}) {
  const classes = useStyles();
  const { t } = useTranslation(); //{t('calendar')}
  const user = useSelector((state) => state.user.userData);

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
            {t('calendar')}
          </Typography>
          <Typography
            component="h1"
            variant="h3"
          >
            {t('your schedule')}
          </Typography>
        </Grid>


        {
          user.isModerator ?
            <Grid item>
              <Button
                color="primary"
                onClick={onEventAdd}
                variant="contained"
              >
                <AddIcon className={classes.addIcon} />
                {t('create a course')}
              </Button>
            </Grid>
          : null
        }


      </Grid>
      <Grid
        alignItems="center"
        container
        justify="space-between"
        spacing={3}
      >
        <Grid item>
          <ButtonGroup>
            <Button onClick={onDatePrev}>{t('calendar prev')}</Button>
            <Button onClick={onDateToday}>{t('calendar today')}</Button>
            <Button onClick={onDateNext}>{t('calendar next')}</Button>
          </ButtonGroup>
        </Grid>
        <Hidden smDown>
          <Grid item>
            <Typography variant="h3">
              {moment(date).format('MMMM YYYY')}
            </Typography>
          </Grid>
          <Grid item>
            {viewOptions.map(viewOption => {
              const Icon = viewOption.icon;

              return (
                <Tooltip
                  key={viewOption.value}
                  title={viewOption.label}
                >
                  <IconButton
                    color={viewOption.value === view ? 'primary' : 'default'}
                    onClick={() => onViewChange(viewOption.value)}
                  >
                    <Icon />
                  </IconButton>
                </Tooltip>
              );
            })}
          </Grid>
        </Hidden>
      </Grid>
    </div>
  );
}

Toolbar.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  date: PropTypes.any.isRequired,
  onDateNext: PropTypes.func,
  onDatePrev: PropTypes.func,
  onDateToday: PropTypes.func,
  onEventAdd: PropTypes.func,
  onViewChange: PropTypes.func,
  view: PropTypes.string.isRequired
};

export default Toolbar;
