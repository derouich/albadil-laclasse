import React, { useState, useRef, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import {
  Popover,
  CardHeader,
  CardActions,
  Divider,
  Button,
  colors
} from '@material-ui/core';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import timelinePlugin from '@fullcalendar/timeline';
import '@fullcalendar/core/main.css';
import '@fullcalendar/daygrid/main.css';
import '@fullcalendar/timegrid/main.css';
import '@fullcalendar/list/main.css';
import * as API from '../../services';
import { useSelector } from 'react-redux';
import { buildListForCalendar } from '../../utils/ListHelper';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(() => ({
  root: {
    width: 350,
    maxWidth: '100%'
  },
  actions: {
    backgroundColor: colors.grey[50],
    justifyContent: 'center'
  }
}));



function AgendaPopover({ anchorEl, ...rest }) {
  const classes = useStyles();
  const { t } = useTranslation();
  //const [rooms, setRooms] = useState([]);
  const token = useSelector((state) => state.user.token);
  const [events, setEvents] = useState([]);
  const calendarRef = useRef(null);


 useEffect(() => {
    let mounted = true;

    const fetchRooms = () => {
      API.getRooms(token)
        .then((rooms) => {
          if (mounted) {
            //setRooms(rooms.Rooms);
            setEvents(buildListForCalendar(rooms.Rooms));
          }
        })
        .catch((error) => { console.log(error); });
    };

    fetchRooms();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Popover
      {...rest}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center'
      }}
    >
      <div className={classes.root}>
        <CardHeader title={t('agenda')} />
        <Divider />
          <FullCalendar
              allDayMaintainDuration
              defaultDate={new Date()}
              defaultView={'listWeek'}
              droppable
              locale={'fr'}
              editable
              //eventClick={handleEventClick}
              eventResizableFromStart
              events={events}
              header={false}
              height={300}
              //eventDrop={handleEventDrop}
              plugins={[
                dayGridPlugin,
                timeGridPlugin,
                interactionPlugin,
                listPlugin,
                timelinePlugin
              ]}
              ref={calendarRef}
              rerenderDelay={10}
              selectable
              weekends
            />

        <Divider />
        <CardActions className={classes.actions}>
          <Button
            component={RouterLink}
            onClick={event =>  window.location.href='/calendar'}
            size="small"
            to="#"
          >
            {t('agenda see all')}
          </Button>
        </CardActions>
      </div>
    </Popover>
  );
}

AgendaPopover.propTypes = {
  anchorEl: PropTypes.any,
  className: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired
};

export default AgendaPopover;
