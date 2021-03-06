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
import DeleteIcon from '@material-ui/icons/Delete';
import ManageStudentsModal from '../views/Classe/ManageStudentsModal';
import EditClassModal from '../views/Classe/EditClassModal';
import ClasseDeleteConfirmationModal from '../views/Classe/ClasseDeleteConfirmationModal';
import { useTranslation } from 'react-i18next';

function ClasseGenericMoreButton(props) {
  const moreRef = useRef(null);
  const { t } = useTranslation(); //{t('calendar')}

  const [openMenu, setOpenMenu] = useState(false);
  const [manageStudents, setManageStudents] = useState(false);
  const [openClasseDeleteModal, setOpenClasseDeleteModal] = useState(false);
  const [openEditClassModal, setOpenEditClassModal] = useState(false);

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
        <MenuItem onClick={ () =>  { setManageStudents(true)  ; setOpenMenu(false) }}>
          <ListItemIcon>
            <SendIcon />
          </ListItemIcon>
          <ListItemText primary={t('invite students')} />
        </MenuItem>

        <MenuItem onClick={ () =>  {setOpenEditClassModal(true); setOpenMenu(false)}}>
          <ListItemIcon>
            <EditIcon />
          </ListItemIcon>
          <ListItemText primary={t('edit')} />
        </MenuItem>

        <MenuItem onClick={ () =>  {setOpenClasseDeleteModal(true); setOpenMenu(false)}}>
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          <ListItemText primary={t('delete')} />
        </MenuItem>

      </Menu>

      <ManageStudentsModal
        onClose={() =>  { setManageStudents(false) ; setOpenMenu(false) }}
        open={manageStudents}
        isClasse={true}
        thisthingid={props.theclasse._id}
      />

      <EditClassModal
        onClose={() => setOpenEditClassModal(false)}
        open={openEditClassModal}
        theclasse={props.theclasse}
      />

      <ClasseDeleteConfirmationModal
        onClose={() => setOpenClasseDeleteModal(false)}
        open={openClasseDeleteModal}
        theclasse={props.theclasse}
      />
    </>
  );
}

ClasseGenericMoreButton.propTypes = {
  className: PropTypes.string
};

export default memo(ClasseGenericMoreButton);
