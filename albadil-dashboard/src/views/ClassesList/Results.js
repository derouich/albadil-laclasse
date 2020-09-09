import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import {
  Button,
  Grid,
  Typography
} from '@material-ui/core';
import { ToggleButtonGroup, ToggleButton } from '@material-ui/lab';
import ViewModuleIcon from '@material-ui/icons/ViewModule';
import Paginate from 'src/components/Paginate';

import ProjectCard from 'src/components/ProjectCard';
import * as API from '../../services';
import { useSelector } from 'react-redux';
import EmptyElements from '../Empty/EmptyElements';
import {removeDuplicates} from '../../utils/ListHelper';
import { useTranslation } from 'react-i18next';
import LoadingElement from '../Loading/LoadingElement';
import AddIcon from '@material-ui/icons/Add';
import CreateClassModal from '../Classe/CreateClassModal';

const useStyles = makeStyles((theme) => ({
  root: {},
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: theme.spacing(2)
  },
  title: {
    position: 'relative',
    '&:after': {
      position: 'absolute',
      bottom: -8,
      left: 0,
      content: '" "',
      height: 3,
      width: 48,
      backgroundColor: theme.palette.primary.main
    }
  },
  actions: {
    display: 'flex',
    alignItems: 'center'
  },
  sortButton: {
    textTransform: 'none',
    letterSpacing: 0,
    marginRight: theme.spacing(2)
  },
  paginate: {
    marginTop: theme.spacing(3),
    display: 'flex',
    justifyContent: 'center'
  }
}));

function Projects({ className, ...rest }) {
  const classes = useStyles();
  const { t } = useTranslation(); //{t('calendar')}

  const token = useSelector((state) => state.user.token);
  const user = useSelector((state) => state.user.userData);

  const [mode, setMode] = useState('grid');
  const [classesList, setClassesList] = useState([]);

  //Pagination
  const [offset , setOffset] = useState(0);
  const [pageCount , setPageCount] = useState(0);
  const [currentPage , setCurrentPage] = useState(0);
 const [pageClasses, setPageClasses] = useState([]);
  const pageMaxCount = 9 ;


  const [isLoading, setIsLoading] = useState(true);
  const [openCreateClassModal, setOpenCreateClassModal] = useState(false);

  const handlePageClick = data => {
    let selected = data.selected;
    const offset = selected * pageMaxCount;
    setOffset(offset);
    setCurrentPage(selected);
    const slice = classesList.slice(offset, offset + pageMaxCount);
    setPageClasses(slice);

  };


  const handleModeChange = (event, value) => {
    setMode(value);
  };

  useEffect(() => {
    let mounted = true;

    const fetchClasses = () => {
      API.getClasses(token)
        .then((classes) => {
          if (mounted) {
            //Todo need to check why we receive sometimes two elements instead of one
            var uniqueArray = removeDuplicates(classes, "_id");
            setClassesList(uniqueArray.reverse());

            /////////////////////Pagination ////////////////
             setPageCount(Math.ceil(uniqueArray.length / pageMaxCount));
            const slice = uniqueArray.slice(offset, offset + pageMaxCount);
            setPageClasses(slice);
            /////////////////////Pagination ////////////////

            setIsLoading(false);
          }
        })
        .catch((error) => { console.log(error); });
    };

    fetchClasses();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div
      {...rest}
      className={clsx(classes.root, className)}
    >
      <div className={classes.header}
      >
        <Typography
          className={classes.title}
          variant="h3"
        >
          {
            isLoading ? '...' : pageClasses ? pageClasses.length : '0'
          }
          {' '}
          {t('classes')}
        </Typography>
        <div className={classes.actions}>
          {
            user.isModerator ?
              <Button
                color="primary"
                variant="contained"
                onClick={() => setOpenCreateClassModal(true)}
              >
                <AddIcon className={classes.addIcon} />
                {t('create a class')}
              </Button>
              : null
          }
          {/*
          <ToggleButtonGroup
            exclusive
            onChange={handleModeChange}
            size="small"
            value={mode}
          >
            <ToggleButton value="grid">
              <ViewModuleIcon />
            </ToggleButton>
          </ToggleButtonGroup>
          */}
        </div>
      </div>

      {
        isLoading ? <LoadingElement /> :
          pageClasses.length > 0 ?
            <Grid
              container
              spacing={3}
            >
              {
                pageClasses.map((theClasse) => (
                  <Grid
                    item
                    key={theClasse.id}
                    md={mode === 'grid' ? 4 : 12}
                    sm={mode === 'grid' ? 6 : 12}
                    xs={12}
                  >
                    <ProjectCard theClasse={theClasse}  />
                  </Grid>
                ))
              }
            </Grid>
            :
            <EmptyElements title={t('no class')} description={user.isModerator ? t('create your first class') : t('you are not invited to any class')}/>
      }

      <CreateClassModal
        onClose={() => setOpenCreateClassModal(false)}
        open={openCreateClassModal}
      />

      {
        (pageClasses.length > 0 && !isLoading ) ?
          <div className={classes.paginate}>
            <Paginate pageCount={pageCount}
                      onPageChange={handlePageClick} />
          </div> : null
      }

    </div>
  );
}

Projects.propTypes = {
  className: PropTypes.string
};

export default Projects;
