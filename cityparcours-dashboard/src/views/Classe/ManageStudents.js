import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import {
  TextField,
  Button,
  Chip,
  Grid,
  Switch,
  Divider,
  Typography,
  IconButton, CardActions, Card, CardContent
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import * as API from '../../services';
import { useSelector } from 'react-redux';
import {SuccessSnackbar} from '../Snackbars';
import { useTranslation } from 'react-i18next';
import FilesDropzoneManageStudents from 'src/components/FilesDropzoneManageStudents';
import Spinner from 'react-bootstrap/Spinner';

const useStyles = makeStyles((theme) => ({

  root: {},

  alert: {
    marginBottom: theme.spacing(3)
  },
  formGroup: {
    marginBottom: theme.spacing(4),
    marginTop: theme.spacing(4)
  },
  fieldGroup: {
    display: 'flex',
    alignItems: 'center'
  },
  fieldHint: {
    margin: theme.spacing(1, 0)
  },
  tags: {
    marginTop: theme.spacing(1),
    '& > * + *': {
      marginLeft: theme.spacing(1)
    }
  },
  flexGrow: {
    flexGrow: 1,
    marginLeft: 5
  },
  dateField: {
    '& + &': {
      marginLeft: theme.spacing(2)
    }
  },
  students: {
    marginBottom: 20,
    marginTop: 20
  },
  addButton: {
    marginLeft: theme.spacing(1)
  },
  actions: {
    justifyContent: 'flex-end'
  }
}));

const initialValues = {
  fullName: '',
  email: '',
  invitedUsers: []
};

function ManageStudents({ className, isClasse, thisthingid, onClose, ...rest }) {
  const classes = useStyles();
  const { t } = useTranslation(); //{t('calendar')}

  const token = useSelector((state) => state.user.token);

  const childRef = useRef();

  const [values, setValues] = useState({ ...initialValues });
  const [isBulkUpload, setIsBulkUpload] = useState(false);
  const [oldInvitedUsers, setOldInvitedUsers] = useState({ ...initialValues });
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('Done!');
  const [isConfirmClicked, setIsConfirmClicked] = useState(false);


  const handleFieldChange = (event, field, value) => {
    event.persist();
    setValues((prevValues) => ({
      ...prevValues,
      [field]: value
    }));
  };

  const handleIsBulkUploadSwitch = (event) => {
    event.persist();
    setIsBulkUpload(event.target.checked);
    setIsConfirmClicked(false);
  };

  const handleTagAdd = () => {
    setValues((prevValues) => {
      const newValues = { ...prevValues };

      if (newValues.email.trim() && newValues.fullName.trim() && !newValues.invitedUsers.includes(newValues.email) && !newValues.invitedUsers.includes(newValues.fullName)) {
        let isDuplicated = false;
        // Check old invites
        for (let _oldInvitedUser of oldInvitedUsers.invitedUsers) {
          if (_oldInvitedUser.split(";")[1] === newValues.email) {
            isDuplicated = true;
          }
        }

        // Check new invites
        for (let _newInvitedUser of values.invitedUsers) {
          if (_newInvitedUser.split(";")[1] === newValues.email) {
            isDuplicated = true;
          }
        }

        if (!isDuplicated) {
          newValues.invitedUsers = [...newValues.invitedUsers];
          newValues.invitedUsers.push(newValues.fullName + ';' + newValues.email);
        }
      }

      newValues.email = '';
      newValues.fullName = '';

      return newValues;
    });
  };

  const handleAddInvitedUser = (value) => {
    setOldInvitedUsers((prevValues) => {
      const newValues = { ...prevValues };

      newValues.invitedUsers = [...newValues.invitedUsers];
      newValues.invitedUsers.push(value);

      return newValues;
    });

    setValues((prevValues) => {
      const newValues = { ...prevValues };

      newValues.invitedUsers = [...newValues.invitedUsers];
      newValues.invitedUsers.push(value);

      return newValues;
    });
  };

  const handleTagDelete = (email) => {

    if (oldInvitedUsers.invitedUsers.includes(email)) {
      if (isClasse) {

        API.deleteInvitedUser(email, thisthingid, token)
          .then(() => {
            setSnackbarMessage('Invited user deleted ');
            setOpenSuccessSnackbar(true);
          }).catch((error) => { console.log(error); });
      }
    }

    setValues((prevValues) => {
      const newValues = { ...prevValues };

      newValues.invitedUsers = newValues.invitedUsers.filter((t) => t !== email);

      return newValues;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsConfirmClicked(true);

    if (isBulkUpload) {
      childRef.current.handleUploadFile();
    } else {
      let inviteUsersData = {
        isClasse: isClasse,
        thisThingID: thisthingid,
        invitedUsers: values.invitedUsers
      };

      // Separate old from new
      for (let _invitedUser of inviteUsersData.invitedUsers) {
        for (let _oldInvitedUser of oldInvitedUsers.invitedUsers) {
          if (_invitedUser.split(";")[1] === _oldInvitedUser.split(";")[1]) {
            const index = inviteUsersData.invitedUsers.indexOf(_invitedUser);
            if (index > -1) {
              inviteUsersData.invitedUsers.splice(index, 1);
            }
          }
        }
      }

      API.inviteUsers(inviteUsersData, token)

        .then(() => {
          window.location.reload();

        }).catch((error) => {
        setIsConfirmClicked(false);
        console.log(error);
      });
    }
  };

  useEffect(() => {
    let mounted = true;

    const fetchInvitedUser = () => {
      if (isClasse) {
        API.getClasse(thisthingid, token)
          .then((classe) => {
            if (mounted) {
              for (let invitedUser of classe.invited) {
                handleAddInvitedUser(invitedUser.fullName + ';' + invitedUser.email);
              }
            }
          })
          .catch((error) => { console.log(error); });
      } else {
        API.getRoom(thisthingid, token)
          .then((room) => {
            if (mounted) {
              for (let invitedUser of room.invited) {
                handleAddInvitedUser(invitedUser.fullName + ';' + invitedUser.email);
              }
            }
          })
          .catch((error) => { console.log(error); });
      }
    };

    fetchInvitedUser();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSuccessSnackbarClose = () => {
    setOpenSuccessSnackbar(false);
  };

  return (
    <form
      {...rest}
      className={clsx(classes.root, className)}
      id='inviteUsersForm'
      onSubmit={handleSubmit}
    >
      <CardContent>
        <Grid
          container
          spacing={4}
        >
          <Grid
            item
            md={6}
            xs={12}
          >
            <Typography variant="h6">{t('Bulk Add')}</Typography>
            <Typography variant="body2">
              {t('With bulk Add you can add more students using CSV file.')}
            </Typography>
            <Switch
              checked={isBulkUpload}
              color="secondary"
              edge="start"
              name="isBulkUpload"
              onChange={handleIsBulkUploadSwitch}
            />
          </Grid>

          {
            !isBulkUpload ? null :
              <Grid
                item
                md={6}
                xs={12}
              >
                <Typography variant="h6">{t('Download CSV example')}</Typography>
                <IconButton
                  aria-label="delete"
                  className={classes.margin}
                  href={'https://static.laclasse.ma/files/students-csv-example.csv'}
                >
                  <CloudDownloadIcon />
                </IconButton>
              </Grid>
          }
        </Grid>

        <Divider />

        {
          isBulkUpload ? null :
            <div className={classes.formGroup}>
              <div className={classes.fieldGroup}>
                <TextField
                  className={classes.flexGrow}
                  label={t('full name')}
                  name="fullName"
                  onChange={(event) => handleFieldChange(event, 'fullName', event.target.value)}
                  value={values.fullName}
                  variant="outlined"
                />

                <TextField
                  className={classes.flexGrow}
                  label={t('email address')}
                  name="email"
                  onChange={(event) => handleFieldChange(event, 'email', event.target.value)}
                  value={values.email}
                  variant="outlined"
                />
                <Button
                  className={classes.addButton}
                  style={{backgroundColor : '#0275d8' , color:'white'}}
                  onClick={handleTagAdd}
                  size="small"
                >
                  <AddIcon className={classes.addIcon} />
                  {t('add')}
                </Button>
              </div>
              <Typography
                className={classes.fieldHint}
                variant="body2"
              >
                {t('these students will receive the invitation in their email addresses')}
              </Typography>
              <div className={classes.tags}>
                {values.invitedUsers.map((email) => (
                  <Chip
                    deleteIcon={<CloseIcon />}
                    key={email}
                    label={email}
                    onDelete={() => handleTagDelete(email)}
                  />
                ))}
              </div>
            </div>
        }


        {
          !isBulkUpload ? null :
            <FilesDropzoneManageStudents ref={childRef} onClose={onClose} isClasse={isClasse} thisthingid={thisthingid} />
        }
      </CardContent>

      <SuccessSnackbar
        onClose={handleSuccessSnackbarClose}
        open={openSuccessSnackbar}
        message={snackbarMessage}
      />

      <Divider />

      <CardActions className={classes.actions}>
        <Button onClick={onClose}>
          {t('dismiss')}
        </Button>

        <Button
          style={{backgroundColor : isConfirmClicked ? '#919191' : '#388e3c' , color:'white'}}
          variant="contained"
          type="submit"
          form="inviteUsersForm"
          disabled={isConfirmClicked}
        >
          {
            isConfirmClicked ?
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                variant="primary"
              />
              :
              t('confirm')
          }
        </Button>
      </CardActions>
    </form>
  );
}

ManageStudents.propTypes = {
  className: PropTypes.string
};

export default ManageStudents;
