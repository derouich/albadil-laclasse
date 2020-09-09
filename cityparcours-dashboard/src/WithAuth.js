import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { LocalStorage } from './services/localstorage.service';

export default function WithAuth(ComponentToProtect) {
  return class extends Component {
    constructor() {
      super();
      this.state = {
        loading: true,
        redirect: false,
      };
    }

    componentDidMount() {
      const userToken = LocalStorage.getItem('userToken');

      if (!userToken || userToken === '') {
        this.setState({ loading: false, redirect: true });
      } else {
        this.setState({ loading: false });
      }
      /*fetch('/checkToken')
        .then(res => {
          if (res.status === 200) {
            this.setState({ loading: false });
          } else {
            const error = new Error(res.error);
            throw error;
          }
        })
        .catch(err => {
          console.error(err);
          this.setState({ loading: false, redirect: true });
        });*/

    }
    render() {
      const { loading, redirect } = this.state;
      if (loading) {
        return null;
      }
      if (redirect) {
        return <Redirect to="/auth/login" />;
      }
      return <ComponentToProtect {...this.props} />;
    }
  }
}
