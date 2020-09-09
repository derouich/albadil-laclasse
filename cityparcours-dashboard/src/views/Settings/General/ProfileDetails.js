import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import {
  Card,
  CardContent,
  CardActions,
  Avatar,
  Typography,
  Button
} from '@material-ui/core';
import getInitials from 'src/utils/getInitials';
import * as API from '../../../services';
import { setProfileData } from '../../../actions';
import { useDispatch, useSelector } from 'react-redux';
import { SuccessSnackbar } from '../../Snackbars';
import { useTranslation } from 'react-i18next';
import Spinner from 'react-bootstrap/Spinner';

const useStyles = makeStyles(
  theme => (
    console.log(theme, 'theme'),
    {
      root: {},
      content: {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        textAlgin: 'center'
      },
      name: {
        marginTop: theme.spacing(1)
      },
      avatar: {
        height: 100,
        width: 100
      },
      uploadButton: {
        width: '100%',
        backgroundColor: theme.palette.secondary.main,
        color: 'white',
        '&:hover': {
          backgroundColor: theme.palette.secondary.main
        }
      },
      removeButton: {
        width: '100%',
        backgroundColor: '#E10000',
        color: 'white',
        '&:hover': {
          backgroundColor: '#E10009'
        }
      }
    }
  )
);

function ProfileDetails({ profile, className, ...rest }) {
  const classes = useStyles();
  const { t } = useTranslation(); //{t('calendar')}

  const dispatch = useDispatch();
  const fileInput = useRef(null);
  const token = useSelector(state => state.user.token);

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [userProfileImage, setUserProfileImage] = useState(
    profile.profileImage
  );
  const [disableDeleteButton, setDisableDeleteButton] = useState(false);
  const [disableUploadButton, setDisableUploadButton] = useState(false);

  const handleRemoveClick = () => {
    setDisableDeleteButton(true);
    API.updateConnectedUser(
      {
        profileImage: ''
      },
      token
    )

      .then(userData => {
        setOpenSnackbar(true);
        setUserProfileImage(null);
        dispatch(setProfileData(userData));
        setDisableDeleteButton(false);
        //window.location.reload();
      })
      .catch(error => {
        setDisableDeleteButton(false);
      });
  };

  const handleClick = () => {
    fileInput.current.click();
  };

  const handleFileChange = e => {
    e.preventDefault();

    setDisableUploadButton(true);

    let reader = new FileReader();
    let profileImage = e.target.files[0];

    if (profileImage) {
      reader.onload = e => {
        setUserProfileImage(e.target.result);

        API.updateConnectedUser(
          {
            isUpdateImage: true,
            profileImage: e.target.result
          },
          token
        )

          .then(userData => {
            setOpenSnackbar(true);
            dispatch(setProfileData(userData));
            setDisableUploadButton(false);
            //window.location.reload();
          })
          .catch(error => {
            setDisableUploadButton(false);
          });
      };

      reader.readAsDataURL(profileImage);
    } else {
      setDisableUploadButton(false);
    }
  };

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  return (
    <Card {...rest} className={clsx(classes.root, className)}>
      <CardContent className={classes.content}>
        <Avatar
          onClick={() => handleClick()}
          className={classes.avatar}
          src={userProfileImage}
        >
          {getInitials(profile.fullName)}
        </Avatar>

        <Typography className={classes.name} gutterBottom variant="h3">
          {profile.fullName}
        </Typography>
        <Typography color="textSecondary" variant="body1">
          {profile.email}
        </Typography>
        <Typography color="textSecondary" variant="body2">
          {profile.etablissement && profile.cityName
            ? profile.etablissement + ', ' + profile.cityName
            : null}
        </Typography>
      </CardContent>
      <CardActions>
        <input
          type="file"
          onChange={e => handleFileChange(e)}
          ref={fileInput}
          hidden
          accept={'image/*'}
        />

        <Button
          className={classes.uploadButton}
          variant="text"
          size="large"
          onClick={() => handleClick()}
          disabled={disableUploadButton}
        >
          {disableUploadButton ? (
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            />
          ) : (
            t('upload')
          )}
        </Button>

        <Button
          className={classes.removeButton}
          variant="text"
          size="large"
          onClick={() => handleRemoveClick()}
          disabled={disableDeleteButton}
        >
          {disableDeleteButton ? (
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            />
          ) : (
            t('remove')
          )}
        </Button>
      </CardActions>

      <SuccessSnackbar
        message={'successfully saved changes'}
        onClose={handleSnackbarClose}
        open={openSnackbar}
      />
    </Card>
  );
}

ProfileDetails.propTypes = {
  className: PropTypes.string,
  profile: PropTypes.object.isRequired
};

export default ProfileDetails;
