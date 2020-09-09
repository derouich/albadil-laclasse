import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { makeStyles } from '@material-ui/styles';
import {
  Avatar,
  Button,
  Card,
  CardContent,
  Divider,
  Input,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  colors
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import ClasseGenericMoreButton from '../../components/ClasseGenericMoreButton';
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined';

import * as API from '../../services';
import { useSelector } from 'react-redux';
import EmptyElements from '../Empty/EmptyElements';
import RemoveStudentModal from './RemoveStudentModal';
import { useTranslation } from 'react-i18next';
import Paginate from '../../components/Paginate';

const useStyles = makeStyles((theme) => ({
  root: {},
  content: {
    paddingTop: 0
  },
  search: {
    padding: theme.spacing(2, 3),
    display: 'flex',
    alignItems: 'center'
  },
  searchIcon: {
    color: theme.palette.text.secondary
  },
  searchInput: {
    marginLeft: theme.spacing(1),
    color: theme.palette.text.secondary,
    fontSize: '14px'
  },
  avatar: {
    height: 60,
    width: 60
  },
  listItem: {
    flexWrap: 'wrap'
  },
  listItemText: {
    marginLeft: theme.spacing(2)
  },
  connectButton: {
    marginLeft: 'auto'
  },
  pendingButton: {
    marginLeft: 'auto',
    color: theme.palette.common.white,
    backgroundColor: colors.grey[600],
    '&:hover': {
      backgroundColor: colors.grey[900]
    }
  },
  connectedButton: {
    marginLeft: 'auto',
    color: theme.palette.common.white,
    backgroundColor: colors.green[600],
    '&:hover': {
      backgroundColor: colors.green[900]
    }
  },
  removeButton: {
    marginLeft: theme.spacing(2),
    color: theme.palette.common.white,
    backgroundColor: colors.red[600],
    '&:hover': {
      backgroundColor: colors.red[900]
    }
  },
  buttonIcon: {
    marginRight: theme.spacing(1)
  },
  paginate: {
    marginTop: theme.spacing(3),
    display: 'flex',
    justifyContent: 'center'
  }
}));

//TODO change the position to helper to use it everywhere Function to get INITIAL
var getInitials = function (string) {
    var names = string.split(' '),
        initials = names[0].substring(0, 1).toUpperCase();

    if (names.length > 1) {
        initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
};

function Connections({ className, classeId, thisclasse, ...rest }) {
  const classes = useStyles();
  const { t } = useTranslation(); //{t('calendar')}

  const token = useSelector((state) => state.user.token);
  const user = useSelector((state) => state.user.userData);

  const [participants, setParticipants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalRemoveStudent, setModalRemoveStudent] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  //Pagination
  const [offset , setOffset] = useState(0);
  const [pageCount , setPageCount] = useState(0);
  const [currentPage , setCurrentPage] = useState(0);
  const [pageStudents, setStudents] = useState([]);
  const pageMaxCount = 20 ;


  const handlePageClick = data => {
    let selected = data.selected;
    const offset = selected * pageMaxCount;
    setOffset(offset);
    setCurrentPage(selected);
    const slice = participants.slice(offset, offset + pageMaxCount);
    setStudents(slice);

  };

  const handleModalRemoveStudent = (student) => {
      setModalRemoveStudent(true);
  };

  const handleCloseModalRemoveStudent = () => {
      setModalRemoveStudent(false);
  };

  // Search
  const handleStudentSearch = (event) => {
    //event.persist();
    const query = event.target.value;
    const newquery = query.replace(/ /g,'');
    const results = participants.filter(participant => {
      return Object.keys(participant).some(key =>
        participant[key].toString().toLowerCase().includes(newquery)
      );
    });
      /////////////////////Pagination ////////////////
      setPageCount(Math.ceil(results.length / pageMaxCount));
      const slice = results.slice(offset, offset + pageMaxCount);
      setStudents(slice);
      //setParticipants(results);
      /////////////////////Pagination ////////////////
  };

  useEffect(() => {
    let mounted = true;
    const fetchClasseParticipants = () => {
      API.getClasseParticipant(classeId, token)
        .then((participants) => {
          if (mounted) {
            // Search
            /**
            const results = participants.filter(participant => {
              return Object.keys(participant).some(key =>
                participant[key].toString().toLowerCase().includes(searchTerm)
              );
            });
            **/
            /////////////////////Pagination ////////////////
            setPageCount(Math.ceil(participants.length / pageMaxCount));
            const slice = participants.slice(offset, offset + pageMaxCount);
            setStudents(slice);
            setParticipants(participants);
            /////////////////////Pagination ////////////////

           // setParticipants(results);
            setIsLoading(false);
          }
        })
        .catch((error) => { console.log(error); });
    };

    fetchClasseParticipants();

    return () => {
      mounted = false;
    };
  },);

  return (
    <Card
      {...rest}
      className={clsx(classes.root, className)}
    >
      <Divider />
      <div className={classes.search}>
        <SearchIcon
          className={classes.searchIcon}
          color="inherit"
        />
        <Input
          className={classes.searchInput}
          disableUnderline
          placeholder={t('search')}
          onChange={handleStudentSearch}
        />
      </div>
      <Divider />
      <CardContent className={classes.content}>
      {(pageStudents && !isLoading && pageStudents.length > 1) ?
        <PerfectScrollbar>
          <List disablePadding>
            {pageStudents ? pageStudents.map((connection, i) => (
              thisclasse.creator === connection._id ? null :
              <ListItem
                className={classes.listItem}
                disableGutters
                divider={i < pageStudents.length - 1}
                key={connection._id}
              >
                <ListItemAvatar>
                  <Avatar
                    alt="Profile"
                    className={classes.avatar}
                   // component={RouterLink}
                    src={connection.profileImage && connection.profileImage !== '' ? connection.profileImage : null}
                  >
                  { getInitials(connection.fullName) }

                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  className={classes.listItemText}
                  primary={connection.fullName}
                 //secondary={connection.email}
                />
                {
                  thisclasse.creator !== user._id ? null :
                    connection.isInvited ?
                      <Button
                        className={classes.pendingButton}
                        size="small"
                        variant="contained"
                      >
                        {t('waiting')}
                      </Button>
                      :
                      <Button
                        className={classes.connectedButton}
                        size="small"
                        variant="contained"
                      >
                        {t('accepted')}
                      </Button>
                }
                {
                  thisclasse.creator !== user._id ? null :
                    <Button
                      className={classes.removeButton}
                      size="small"
                      variant="contained"
                      onClick={() => {setCurrentUser(connection) ; handleModalRemoveStudent() ;}}
                    >
                      <DeleteOutlineOutlinedIcon />
                    </Button>
                }

              </ListItem>
            )) : null}
          </List>
        </PerfectScrollbar>
        : pageStudents.length == 1 && !isLoading ?
         <EmptyElements title={t('no students')} description={t('invite students to join your class')}/>
         : null }

        {
          (pageStudents.length > 19 && !isLoading  ) ?
            <div className={classes.paginate}>
              <Paginate pageCount={pageCount}
                        onPageChange={handlePageClick} />
            </div> : null
        }

      </CardContent>
        <RemoveStudentModal
          student={currentUser}
          classeid={classeId}
          onClose={handleCloseModalRemoveStudent}
          open={modalRemoveStudent}
        />
    </Card>
  );
}

Connections.propTypes = {
  className: PropTypes.string
};

export default Connections;
