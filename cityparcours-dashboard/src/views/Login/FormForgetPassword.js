import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import {
  TextField, Typography , Divider
} from '@material-ui/core';
import * as API from '../../services';
import { useHistory } from 'react-router';
import "react-datepicker/dist/react-datepicker.css";
import "react-datepicker/dist/react-datepicker.css";
import {ErrorSnackbar} from '../Snackbars';
import CheckCircleOutlineOutlinedIcon from '@material-ui/icons/CheckCircleOutlineOutlined';
import { useTranslation } from 'react-i18next';



const useStyles = makeStyles((theme) => ({
  root: {},
  alert: {
    marginBottom: theme.spacing(3)
  },
  formGroup: {
    marginBottom: theme.spacing(6)
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
    flexGrow: 1
  },
  dateField: {
    '& + &': {
      marginLeft: theme.spacing(2)
    }
  },


}));


const initialValues = {
  email: ''
};

function FormForgetPassword({ className, currentClasseId , onClose , ...rest  }) {
  const classes = useStyles();
  const { t } = useTranslation(); //{t('calendar')}

  const history = useHistory();

  const [values, setValues] = useState({ ...initialValues });
  const [openForgetSnackbar, setOpenForgetSnackbar] = useState(false);
  const [isSuccessEmail , setIsSuccessEmail ] = useState(false);



  const handleFieldChange = (event, field, value) => {
    event.persist();
    setValues((prevValues) => ({
      ...prevValues,
      [field]: value
    }));
  };

  useEffect(() => {
    let mounted = true;


    return () => {
      mounted = false;
    };
  }, []);


  const handleSubmit = async (event) => {
    event.preventDefault();
    if(isSuccessEmail) {
      onClose()
    } else {
    API.forgotPassword(values)
      .then(() => {
        setIsSuccessEmail(true);
      })
      .catch((error) => {
        console.log(error);
        setOpenForgetSnackbar(true);
      });
    }
  };

  const handleForgetSnackbarClose = () => {
    setOpenForgetSnackbar(false);
  };

  return (
    <form
      {...rest}
      className={clsx(classes.root, className)}
      id="FormForgetPassword"
      onSubmit={handleSubmit}
    >
    {!(isSuccessEmail) ?
      <div>
    <div style={{ marginTop:'10px' , marginBottom:'20px'}}>
    <Typography variant='h4' >
      {t('forgot your password')}
        </Typography>
        </div>
      <div className={classes.formGroup}>
        <TextField
          fullWidth
          label={t('email address')}
          name="email"
          onChange={(event) => handleFieldChange(event, 'email', event.target.value)}
          //value={values.email}
          variant="outlined"
          required={true}
        />
      </div>
      </div>
     :
     <div>
     <div style={{display: 'flex',  justifyContent:'center', alignItems:'center'}}>
     <CheckCircleOutlineOutlinedIcon style={{ fontSize: 40 , color:'#388e3c' }}/>
     </div>
     <Typography variant='h4' >
       {t('a reset link will be sent to you email address')}
    </Typography>
    </div>
     }
      <Divider />
    <ErrorSnackbar
        onClose={()=> setOpenForgetSnackbar(false)}
        open={openForgetSnackbar}
        errorMessage={"Email not found "}
      />
    </form>
  );
}

FormForgetPassword.propTypes = {
  className: PropTypes.string
};

export default FormForgetPassword;
