/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useHistory } from 'react-router';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/styles';
import {
  AppBar,
  Badge,
  Button,
  IconButton,
  Toolbar,
  Hidden,
  colors,
} from '@material-ui/core';
import NotificationsIcon from '@material-ui/icons/NotificationsOutlined';
import CalendarTodayOutlinedIcon from '@material-ui/icons/CalendarTodayOutlined';


import InputIcon from '@material-ui/icons/Input';
import MenuIcon from '@material-ui/icons/Menu';
import NotificationsPopover from 'src/components/NotificationsPopover';
import AgendaPopover from 'src/components/AgendaPopover';

import PricingModal from 'src/components/PricingModal';
import { logout } from 'src/actions';
import * as API from '../../services';
import { useTranslation } from 'react-i18next';
import ReactGA from 'react-ga';

// CHange Language
import ReactFlagsSelect from 'react-flags-select';
//OR import sass module
import 'react-flags-select/scss/react-flags-select.scss';
import i18n from '../../i18n';
import { LocalStorage } from '../../services/localstorage.service';


const useStyles = makeStyles((theme) => ({
  root: {
    boxShadow: 'none',
    backgroundColor: '#F5F5F5'
  },
  flexGrow: {
    flexGrow: 1
  },
  search: {
    backgroundColor: 'rgba(255,255,255, 0.1)',
    borderRadius: 4,
    flexBasis: 300,
    height: 36,
    padding: theme.spacing(0, 2),
    display: 'flex',
    alignItems: 'center'
  },
  searchIcon: {
    marginRight: theme.spacing(2),
    color: 'inherit'
  },
  searchInput: {
    flexGrow: 1,
    color: 'inherit',
    '& input::placeholder': {
      opacity: 1,
      color: 'inherit'
    }
  },
  searchPopper: {
    zIndex: theme.zIndex.appBar + 100
  },
  searchPopperContent: {
    marginTop: theme.spacing(1)
  },
  trialButton: {
    marginLeft: theme.spacing(2),
    color: theme.palette.common.white,
    backgroundColor: colors.green[600],
    '&:hover': {
      backgroundColor: colors.green[900]
    }
  },
  trialIcon: {
    marginRight: theme.spacing(1)
  },
  menuButton: {
    marginRight: theme.spacing(1),
    color: theme.palette.menuButton
  },
  chatButton: {
    marginLeft: theme.spacing(1)
  },
  notificationsButton: {
    marginLeft: theme.spacing(0),
    color: colors.red[600]
  },
  notificationsBadge: {
    backgroundColor: colors.orange[600]
  },
  logoutButton: {
    marginLeft: theme.spacing(1)
  },
  logoutIcon: {
    marginRight: theme.spacing(1)
  }
}));

function TopBar({
  onOpenNavBarMobile,
  className,
  ...rest
}) {
  const classes = useStyles();
  const { t } = useTranslation();
  const history = useHistory();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.user.token);
  const notificationsRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [newNotifications, setNewNotifications] = useState([]);
  const [openNotifications, setOpenNotifications] = useState(false);
  const [openAgenda, setOpenAgenda] = useState(false);

  const [pricingModalOpen, setPricingModalOpen] = useState(false);

  const handleLogout = () => {
    ReactGA.event({
      category: 'Dashboard',
      action: 'Click on Logout!'
    });

    dispatch(logout(logout));
    history.push('/auth/login');
  };

  const handlePricingModalClose = () => {
    setPricingModalOpen(false);
  };

  //onSelect Method
  const onSelectFlag = (countryCode) => {
    if (countryCode=='US') {
      i18n.changeLanguage('en');
      LocalStorage.setItem('language', 'en');
    } else if(countryCode=='FR'){
      i18n.changeLanguage('fr');
      LocalStorage.setItem('language', 'fr');
    } else if(countryCode=='MA'){
      i18n.changeLanguage('ar');
      LocalStorage.setItem('language', 'ar');
    }
    window.location.reload(false)
  }


  const handleNotificationsOpen = () => {
    setOpenNotifications(true);
  };


  const handleNotificationsClose = () => {
    setOpenNotifications(false);
  };

  const handleAgendaOpen = () => {
    setOpenAgenda(true);
  };
  const handleAgendaClose = () => {
    setOpenAgenda(false);
  };

  useEffect(() => {
    let mounted = true;
    //SET DEFAULT FLAG
    const fetchNotifications = () => {
      API.getNotifications(token)
        .then((notifications) => {
          if (mounted) {

            if (notifications.NewNotifications) {
              setNotifications(notifications.NewNotifications.concat(notifications.OldNotifications));
              setNewNotifications(notifications.NewNotifications);
            }
          }
        })
        .catch((error) => { console.log(error); });
    };

    fetchNotifications();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AppBar
      {...rest}
      className={clsx(classes.root, className)}
      color="primary"
    >
      <Toolbar>
        <Hidden lgUp>
          <IconButton
            className={classes.menuButton}
            color="inherit"
            onClick={onOpenNavBarMobile}
          >
            <MenuIcon />
          </IconButton>
        </Hidden>
        <RouterLink to="/">
          <img
            alt="Logo"
            src="/images/logos/logo.png"
            width="150"
            height="45"
          />
        </RouterLink>
        <div className={classes.flexGrow} />

        {}
        <IconButton
          className={classes.notificationsButton}
          color="inherit"
          onClick={handleNotificationsOpen}
          ref={notificationsRef}
        >
          <Badge
            badgeContent={newNotifications.length}
            classes={{ badge: classes.notificationsBadge }}
          >
            <NotificationsIcon />
          </Badge>
        </IconButton>

        <ReactFlagsSelect
          defaultCountry={
            LocalStorage.getItem('language') === 'ar' ? 'MA' :
            LocalStorage.getItem('language') === 'fr' ? 'FR' :
              LocalStorage.getItem('language')=== 'en' ? 'US'
                : "FR"
          }
          countries={["FR", "US", "MA"]}
          selectedSize={20}
          optionsSize={25}
          alignOptions="center"
          showSelectedLabel={false}
          showOptionLabel={false}
          onSelect={onSelectFlag}
        />
        {/*
        <IconButton
          className={classes.notificationsButton}
          color="inherit"
          onClick={handleAgendaOpen}
          ref={notificationsRef}
        >
          <Badge
            badgeContent={'0'}
            invisible={true}
            classes={{ badge: classes.notificationsBadge }}
          >
            <CalendarTodayOutlinedIcon />
          </Badge>
        </IconButton>


        <Button
          className={classes.logoutButton}
          color="inherit"
          onClick={handleLogout}
        >
          <InputIcon className={classes.logoutIcon} />
        </Button>
        */}

      </Toolbar>

      <NotificationsPopover
        anchorEl={notificationsRef.current}
        notifications={notifications}
        newNotifications={newNotifications}
        onClose={handleNotificationsClose}
        open={openNotifications}
      />

      <AgendaPopover
        anchorEl={notificationsRef.current}
        onClose={handleAgendaClose}
        open={openAgenda}
      />


      <PricingModal
        onClose={handlePricingModalClose}
        open={pricingModalOpen}
      />


    </AppBar>

  );
}

TopBar.propTypes = {
  className: PropTypes.string,
  onOpenNavBarMobile: PropTypes.func
};

export default TopBar;
