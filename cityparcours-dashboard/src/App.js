import React, { useEffect, useState } from 'react';
import { Router } from 'react-router-dom';
import { renderRoutes } from 'react-router-config';
import { createBrowserHistory } from 'history';
import MomentUtils from '@date-io/moment';
import { Provider as StoreProvider } from 'react-redux';
import { ThemeProvider } from '@material-ui/styles';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import 'react-perfect-scrollbar/dist/css/styles.css';
import { theme, themeWithRtl } from './theme';
import { configureStore } from './store';
import routes from './routes';
import GoogleAnalytics from './components/GoogleAnalytics';
import CookiesNotification from './components/CookiesNotification';
import ScrollReset from './components/ScrollReset';
import StylesProvider from './components/StylesProvider';
import DirectionToggle from './components/DirectionToggle';
import './mixins/chartjs';
import './mixins/moment';
import './mixins/validate';
import './mixins/prismjs';
import './mock';
import './assets/scss/main.scss';
import { PersistGate } from 'redux-persist/integration/react'
import i18n from "./i18n";
import { I18nextProvider } from 'react-i18next';
import './../node_modules/react-modal-video/scss/modal-video.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactGA from 'react-ga';
import { LocalStorage } from './services/localstorage.service';
import * as API from './services';

const history = createBrowserHistory();
//const store = configureStore();
const { store, persistor } = configureStore();

function initializeReactGA() {
  ReactGA.initialize('UA-163895259-1');
  ReactGA.pageview('/dashboard');
}

function App() {
  const [direction, setDirection] = useState('ltr');

  initializeReactGA();

  useEffect(() => {

    if ( !(LocalStorage.getItem('language') === undefined) ||
      !LocalStorage.getItem('language').isEmpty
      || !LocalStorage.getItem('language').equals('') ) {
      i18n.changeLanguage(LocalStorage.getItem('language'))
    } else {
      i18n.changeLanguage('fr')
    }

    if (LocalStorage.getItem('language') === 'ar') {
      setDirection('rtl');
     // i18n.changeLanguage('ar');
    } else {
      setDirection('ltr');
     // i18n.changeLanguage('fr');
    }
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <StoreProvider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ThemeProvider theme={direction === 'rtl' ? themeWithRtl : theme}>
            <StylesProvider direction={direction}>
              <MuiPickersUtilsProvider utils={MomentUtils}>
                <Router history={history}>
                  <ScrollReset />
                  <GoogleAnalytics />
                  {/* <CookiesNotification />
                  <DirectionToggle
                    direction={direction}
                    onToggle={handleDirectionToggle}
                  />
                  */}
                  {renderRoutes(routes)}
                </Router>
              </MuiPickersUtilsProvider>
            </StylesProvider>
          </ThemeProvider>
        </PersistGate>
      </StoreProvider>
    </I18nextProvider>
  );
}

export default App;
