<<<<<<< HEAD
import { createStore, applyMiddleware } from 'redux';
import { persistCombineReducers } from 'redux-persist';
import thunk from 'redux-thunk';
import storage from 'redux-persist/es/storage';
import rootReducer from './rootReducer';

let middleware = [thunk];

const config = {
    key: 'root',
    storage,
    blacklist: ['nav']
};

const reducer = persistCombineReducers(config, rootReducer);

if (__DEV__) { // eslint-disable-line
    //const logger = require('redux-logger').createLogger(); // eslint-disable-line
    //middleware = [...middleware, logger.__esModule ? logger.default : logger];
} else {
    middleware = [...middleware];
}

export default function configureStore(initialState) {
    return createStore(
        reducer,
        initialState,
        applyMiddleware(...middleware)
    );
}
=======
import { createStore, applyMiddleware } from 'redux';
import { persistCombineReducers } from 'redux-persist';
import thunk from 'redux-thunk';
import storage from 'redux-persist/es/storage';
import rootReducer from './rootReducer';

let middleware = [thunk];

const config = {
    key: 'root',
    storage,
    blacklist: ['nav']
};

const reducer = persistCombineReducers(config, rootReducer);

if (__DEV__) { // eslint-disable-line
    //const logger = require('redux-logger').createLogger(); // eslint-disable-line
    //middleware = [...middleware, logger.__esModule ? logger.default : logger];
} else {
    middleware = [...middleware];
}

export default function configureStore(initialState) {
    return createStore(
        reducer,
        initialState,
        applyMiddleware(...middleware)
    );
}
>>>>>>> 8afe828627badbc7538961adcb877521f4fa42a4
