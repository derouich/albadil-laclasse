import React, { useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  Typography,
  colors
} from '@material-ui/core';
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline';
import ModalVideo from 'react-modal-video'
import { useTranslation } from 'react-i18next';
import ReactGA from 'react-ga';

const useStyles = makeStyles((theme) => ({
  root: {},
  media: {
    height: 170
  },
  placeholder: {
    height: 170,
    backgroundSize: 'cover',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover': {
      cursor: 'pointer'
    }
  },

  insertDriveFileIcon: {
    height: theme.spacing(6),
    width: theme.spacing(6),
    fontSize: theme.spacing(6),
    color:'white'
  },
    insertDriveFileIconHover: {
    height: theme.spacing(10),
    width: theme.spacing(10),
    fontSize: theme.spacing(6),
    color:'white'
  },

  content: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  actions: {
    justifyContent: 'center'
  },
  PlayCircleFilled: {
    marignRight: theme.spacing(3) ,
  },
  menu: {
    width: 250,
    maxWidth: '100%'
  }
}));

function InfoBox({ className, bgimage, videotitle, videoid, ...rest }) {
  const classes = useStyles();

  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isBoxHover , setIsBoxHover] = useState(false);

  const handleOpenVideoModal = () => {
    ReactGA.event({
      category: 'Dashboard',
      action: 'Watch LaClasse Youtube Video!'
    });

    setIsVideoModalOpen(true);
  };

  return (
    <Card
      {...rest}
      className={clsx(classes.root, className)}
    >
        <div
          className={classes.placeholder}
          style={{ backgroundImage: `url(${bgimage})` }}
          onClick={handleOpenVideoModal}
           onMouseEnter={() => setIsBoxHover(true) }
           onMouseLeave={() => setIsBoxHover(false) }
        >
          <PlayCircleOutlineIcon className={!isBoxHover ? classes.insertDriveFileIcon : classes.insertDriveFileIconHover }  />
        </div>

      <CardContent className={classes.content}>
        <div>
          <Typography variant="h5">{videotitle}</Typography>
        </div>
      </CardContent>
      <Divider />
      <ModalVideo channel='youtube' isOpen={isVideoModalOpen} videoId={videoid} onClose={() => setIsVideoModalOpen(false)} />

      {/*
      <CardActions className={classes.actions}>
        <ModalVideo channel='youtube' isOpen={isVideoModalOpen} videoId={videoid} onClose={() => setIsVideoModalOpen(false)} />
        <Button
          onClick={handleOpenVideoModal}
        >
          <PlayCircleOutlineIcon className={classes.PlayCircleFilled} />
          Regarder
        </Button>
      </CardActions>
      */}

    </Card>
  );
}

InfoBox.propTypes = {
  className: PropTypes.string,
};

export default InfoBox;
