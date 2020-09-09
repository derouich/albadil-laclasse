import React, { useState, useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import timelinePlugin from '@fullcalendar/timeline';
import { makeStyles } from '@material-ui/styles';
import moment from 'moment';

import {
  Container,
  Modal,
  Card,
  CardContent,
  colors,
  useTheme,
  useMediaQuery
} from '@material-ui/core';
import '@fullcalendar/core/main.css';
import '@fullcalendar/daygrid/main.css';
import '@fullcalendar/timegrid/main.css';
import '@fullcalendar/list/main.css';
import Page from 'src/components/Page';
import AddEditEvent from './AddEditEvent';
import Toolbar from './Toolbar';
import * as API from '../../services';
import { useSelector } from 'react-redux';
import { buildListForCalendar } from '../../utils/ListHelper';
import {ErrorSnackbar} from '../Snackbars';
import { useTranslation } from 'react-i18next';


const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    '& .fc-unthemed td': {
      borderColor: theme.palette.divider
    },
    '& .fc-widget-header': {
      backgroundColor: colors.grey[50]
    },
    '& .fc-axis': {
      ...theme.typography.body2
    },
    '& .fc-list-item-time': {
      ...theme.typography.body2
    },
    '& .fc-list-item-title': {
      ...theme.typography.body1
    },
    '& .fc-list-heading-main': {
      ...theme.typography.h6
    },
    '& .fc-list-heading-alt': {
      ...theme.typography.h6
    },
    '& .fc th': {
      borderColor: theme.palette.divider
    },
    '& .fc-day-header': {
      ...theme.typography.subtitle2,
      fontWeight: 500,
      color: theme.palette.text.secondary,
      padding: theme.spacing(1),
      backgroundColor: colors.grey[50]
    },
    '& .fc-day-top': {
      ...theme.typography.body2
    },
    '& .fc-highlight': {
      backgroundColor: colors.blueGrey[50]
    },
    '& .fc-event': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      borderWidth: 2,
      opacity: 0.9,
      '& .fc-time': {
        ...theme.typography.h6,
        color: 'inherit'
      },
      '& .fc-title': {
        ...theme.typography.body1,
        color: 'inherit'
      }
    },
    '& .fc-list-empty': {
      ...theme.typography.subtitle1
    }
  },
  card: {
    marginTop: theme.spacing(3)
  }
}));

function CalendarView() {
  const classes = useStyles();
  const { t } = useTranslation(); //{t('calendar')}

  const calendarRef = useRef(null);
  const theme = useTheme();
  const mobileDevice = useMediaQuery(theme.breakpoints.down('sm'));
  const [view, setView] = useState(mobileDevice ? 'listWeek' : 'dayGridMonth');
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [eventModal, setEventModal] = useState({
    open: false,
    event: null
  });
  const token = useSelector((state) => state.user.token);
  const user = useSelector((state) => state.user.userData);
  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');


  const handleErrorSnackbarClose = () => {
    setOpenErrorSnackbar(false);
  };

  const handleEventClick = (info) => {
    const selected = events.find((event) => event.id === info.event.id);

    if (selected.creator._id === user._id && selected.isActive) {
      setEventModal({
        open: true,
        event: selected
      });
    } else if (!selected.isActive && selected.creator._id === user._id) {
      setErrorMsg("un ancien cours ne peut pas etre modifier !");
      setOpenErrorSnackbar(true);
      setTimeout(() => {
        setOpenErrorSnackbar(false);
      }, 5000);
    }
  };


  const handleEventNew = () => {
    setEventModal({
      open: true,
      event: null
    });
  };

  const handleEventDelete = (event) => {
    setEvents((currentEvents) => currentEvents.filter((e) => e.id !== event.id));
    setEventModal({
      open: false,
      event: null
    });
  };

  const handleModalClose = () => {
    setEventModal({
      open: false,
      event: null
    });
  };

  const handleEventAdd = (event) => {

    setEvents((currentEvents) => [...currentEvents, event]);

    setEventModal({
      open: false,
      event: null
    });
  };

  const handleEventEdit = (event) => {
    setEvents((currentEvents) => currentEvents.map((e) => (e.id === event.id ? event : e)));
    setEventModal({
      open: false,
      event: null
    });
  };

  const handleDateToday = () => {
    const calendarApi = calendarRef.current.getApi();

    calendarApi.today();
    setDate(calendarApi.getDate());
  };

  const handleViewChange = (newView) => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.changeView(newView);
    setView(newView);
  };

  const handleDatePrev = () => {
    const calendarApi = calendarRef.current.getApi();

    calendarApi.prev();
    setDate(calendarApi.getDate());
  };

  const handleDateNext = () => {
    const calendarApi = calendarRef.current.getApi();

    calendarApi.next();
    setDate(calendarApi.getDate());
  };

  const handleEventDrop = (info) => {
        if(window.confirm("Are you sure you want to change the event date?")){
            const selected = events.find((event) => event.id === info.event.id);
            const newvALUE = info.start.format();
            // updateAppointment is another custom method
            //his.props.updateAppointment({...info.event.extendedProps, start:  handleEventDrop, end: info.event.end})
      let roomData = {
        roomName: selected.title,
        description: selected.desc,
        classeId: selected.classe[0].id || 'none',
        oldClasseId: selected.classe.length > 0 ? selected.classe[0].id : 'none',
        startDateTime: selected.start,
        endDateTime: selected.end
      };

      API.updateRoom(selected.id, roomData, token)
        .then(() => {
            window.location.reload();
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
            console.log('change aborted')
    }
   };

  useEffect(() => {
    let mounted = true;

    const fetchRooms = () => {
      API.getRooms(token)
        .then((rooms) => {
          if (mounted) {
            setEvents(buildListForCalendar(rooms.Rooms.concat(rooms.ArchivedRooms)));
          }
        })
        .catch((error) => { console.log(error); });
    };

    fetchRooms();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const calendarApi = calendarRef.current.getApi();
    const newView = mobileDevice ? 'listWeek' : 'dayGridMonth';

    calendarApi.changeView(newView);
    setView(newView);
  }, [mobileDevice]);

  return (
    <Page
      className={classes.root}
      title={t('calendar')}
    >
      <Container maxWidth={false}>
        <Toolbar
          date={date}
          onDateNext={handleDateNext}
          onDatePrev={handleDatePrev}
          onDateToday={handleDateToday}
          onEventAdd={handleEventNew}
          onViewChange={handleViewChange}
          view={view}
        />
        <Card className={classes.card}>
          <CardContent>
            <FullCalendar
              allDayMaintainDuration
              defaultDate={date}
              defaultView={view}
              droppable
              locale={'fr'}
              editable={false}
              eventClick={user.isModerator ? handleEventClick : null}
              eventResizableFromStart
              events={events}
              header={false}
              height={800}
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
          </CardContent>
        </Card>
      <ErrorSnackbar
        //onClose={handleErrorSnackbarClose}
        open={openErrorSnackbar}
        errorMessage={errorMsg}
      />
        <Modal
          onClose={handleModalClose}
          open={eventModal.open}
        >
          <AddEditEvent
            event={eventModal.event}
            onAdd={handleEventAdd}
            onCancel={handleModalClose}
            onDelete={handleEventDelete}
            onEdit={handleEventEdit}
          />
        </Modal>
      </Container>
    </Page>
  );
}

export default CalendarView;
