import React, {
  useRef,
  useState,
  memo
} from 'react';
import PropTypes from 'prop-types';
import {
  ListItemIcon,
  ListItemText,
  Tooltip,
  IconButton,
  Menu,
  MenuItem
} from '@material-ui/core';
import MoreIcon from '@material-ui/icons/MoreVert';
import SendIcon from '@material-ui/icons/Send';
import EditIcon from '@material-ui/icons/Edit';
import ArchiveIcon from '@material-ui/icons/Archive';
import DeleteIcon from '@material-ui/icons/Delete';
import ManageStudentsModal from '../views/Classe/ManageStudentsModal';
import EditCoursModal from '../views/Classe/EditCoursModal';
import CoursDeleteConfirmationModal from '../views/Cours/CoursDeleteConfirmationModal';
import CoursArchiveConfirmationModal from '../views/Cours/CoursArchiveConfirmationModal';
import { useTranslation } from 'react-i18next';

function CoursGenericMoreButton(props) {
  const moreRef = useRef(null);
  const { t } = useTranslation(); //{t('calendar')}

  const [openMenu, setOpenMenu] = useState(false);
  const [manageStudents, setManageStudents] = useState(false);
  const [openCoursDeleteModal, setOpenCoursDeleteModal] = useState(false);
  const [openEditCoursModal, setOpenEditCoursModal] = useState(false);
  const [openArchiveCoursModal, setOpenArchiveCoursModal] = useState(false);

  const handleMenuOpen = () => {
    setOpenMenu(true);
  };

  const handleMenuClose = () => {
    setOpenMenu(false);
  };

  return (
    <>
      <Tooltip title={t('more options')}>
        <IconButton
          {...props}
          onClick={handleMenuOpen}
          ref={moreRef}
          size="small"
        >
          <MoreIcon />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={moreRef.current}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
        elevation={1}
        onClose={handleMenuClose}
        open={openMenu}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
      >
        {
          props.thecours && props.thecours.isActive ?
            <MenuItem onClick={ () =>  { setManageStudents(true)  ; setOpenMenu(false) }}>
              <ListItemIcon>
                <SendIcon />
              </ListItemIcon>
              <ListItemText primary={t('invite students')} />
            </MenuItem>
            : null
        }

        {
          props.thecours && props.thecours.isActive ?
            <MenuItem onClick={ () =>  {setOpenEditCoursModal(true); setOpenMenu(false)}}>
              <ListItemIcon>
                <EditIcon />
              </ListItemIcon>
              <ListItemText primary={t('edit')} />
            </MenuItem>
            : null
        }

        {
          props.thecours && props.thecours.isActive ?
            <MenuItem onClick={ () =>  {setOpenArchiveCoursModal(true); setOpenMenu(false)}}>
              <ListItemIcon>
                <ArchiveIcon />
              </ListItemIcon>
              <ListItemText primary={t('archive')} />
            </MenuItem>
            : null
        }

        <MenuItem onClick={ () =>  {setOpenCoursDeleteModal(true); setOpenMenu(false)}}>
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          <ListItemText primary={t('delete')} />
        </MenuItem>
      </Menu>

      <ManageStudentsModal
        onClose={() =>  { setManageStudents(false) ; setOpenMenu(false) }}
        open={manageStudents}
        isClasse={false}
        thisthingid={props.thecours._id}
      />


      <EditCoursModal
        onClose={() => setOpenEditCoursModal(false)}
        open={openEditCoursModal}
        thecours={props.thecours}
      />

      <CoursDeleteConfirmationModal
        onClose={() => setOpenCoursDeleteModal(false)}
        open={openCoursDeleteModal}
        thecours={props.thecours}
      />

      <CoursArchiveConfirmationModal
        onClose={() => setOpenArchiveCoursModal(false)}
        open={openArchiveCoursModal}
        thecours={props.thecours}
      />
    </>
  );
}

CoursGenericMoreButton.propTypes = {
  className: PropTypes.string
};

export default memo(CoursGenericMoreButton);
