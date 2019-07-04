import helpers from '../../components/helpers';

const FETCH_USER = 'FETCH_USER';
const FETCH_USER_FAILED = 'FETCH_USER_FAILED';
const FETCH_USER_SUCCESS = 'FETCH_USER_SUCCESS';
const FETCH_USER_LOGOUT = 'FETCH_USER_LOGOUT';

const FETCH_REGISTRATION = 'FETCH_REGISTRATION';
const FETCH_REGISTRATION_FAILED = 'FETCH_REGISTRATION_FAILED';
const FETCH_REGISTRATION_SUCCESS = 'FETCH_REGISTRATION_SUCCESS';

const FETCH_SUBSCRIPTION_UPDATE = 'FETCH_SUBSCRIPTION_UPDATE';
const FETCH_SUBSCRIPTION_UPDATE_FAILED = 'FETCH_SUBSCRIPTION_UPDATE_FAILED';
const FETCH_SUBSCRIPTION_UPDATE_SUCCESS = 'FETCH_SUBSCRIPTION_UPDATE_SUCCESS';

const FETCH_SUBSCRIPTION_CHECK = 'FETCH_SUBSCRIPTION_CHECK';
const FETCH_SUBSCRIPTION_CHECK_FAILED = 'FETCH_SUBSCRIPTION_UPDATE_CHECK';
const FETCH_SUBSCRIPTION_CHECK_SUCCESS = 'FETCH_SUBSCRIPTION_UPDATE_CHECK';


const INITIAL_STATE = {
    user: null,
    loading: false,
    isAuth: false,
    registered: false,
    subscribed: false
};

export const logOutUser = () => ({
    type: FETCH_USER_LOGOUT
});


export const updateSubscription = ( userId = null, detail = null, osType = null, ioState = null  ) => async dispatch => {
    try{
        dispatch({ type: FETCH_SUBSCRIPTION_UPDATE });
        const pathService = global.wpSite + '/wp-json/svapphelper/v2/subscription';

        console.log(pathService);
        var toSendData = null;

        if(detail === 'free'){
            toSendData = {
                user_id: userId,
                subscription_type: 'free',
                subscription_exp_date: 'never',
                subscription_receipt: 'na',
                subscription_expired: 'true',
                subscription_os_type: osType,
            }            
        }
        else{            
            if(osType === "android"){
                toSendData = {
                    user_id: userId,
                    subscription_type: detail.productId,
                    subscription_exp_date: detail.transactionDate,
                    subscription_receipt: detail.transactionReceipt,
                    subscription_expired: '',
                    subscription_os_type: osType,
                }
            }
            else if(osType === "ios"){
                toSendData = {
                    user_id: userId,
                    subscription_type: detail.productId,
                    subscription_exp_date: detail.transactionDate,
                    subscription_receipt: detail.transactionReceipt,
                    subscription_expired: '',
                    subscription_os_type: osType,                
                }
            }
        }

        console.log('this',toSendData);

        let data = await fetch(pathService, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              accept: 'application/json',
              'Content-Ads': helpers.getAvertisingID(),
            },
            body: JSON.stringify(toSendData)
        });

        if (data.status === 200){
            data = await data.json();

            if(data.status){
                dispatch({type: FETCH_SUBSCRIPTION_UPDATE_SUCCESS, payload: data });
                return true;
            }
            else{
                dispatch({ type:FETCH_SUBSCRIPTION_UPDATE_FAILED, error: data.message  }) //data.message
                return false;
            }
        }

    }catch (error){
        dispatch({type: FETCH_SUBSCRIPTION_UPDATE_FAILED, error: error});
        return false;
    }
};

export const checkSubscription = ( userId = null ) => async dispatch => {
    try{
        dispatch({ type: FETCH_SUBSCRIPTION_CHECK });
        const pathService = global.wpSite + '/wp-json/svapphelper/v2/subscription/restore';

        console.log(pathService);
        var toSendData = null;

        toSendData = {
            user_id: userId,
        } 

        //console.log('this',toSendData);

        let data = await fetch(pathService, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              accept: 'application/json',
              'Content-Ads': helpers.getAvertisingID(),
            },
            body: JSON.stringify(toSendData)
        });

        if (data.status === 200){
            data = await data.json();

            if(data.status){
                dispatch({type: FETCH_SUBSCRIPTION_CHECK_SUCCESS, payload: data });
                return true;
            }
            else{
                dispatch({ type:FETCH_SUBSCRIPTION_CHECK_FAILED, error: data.message  }) //data.message
                return false;
            }
        }

    }catch (error){
        dispatch({type: FETCH_SUBSCRIPTION_CHECK_FAILED, error: error});
        return false;
    }
};


export const registerUser = (email = null, password = null, name = null, lastname = null) => async dispatch => {
    try{
        dispatch({ type: FETCH_REGISTRATION });
        const pathService = global.wpSite + '/wp-json/svapphelper/v2/users';

        let data = await fetch(pathService, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              accept: 'application/json',
              'Content-Ads': helpers.getAvertisingID(),
            },
            body: JSON.stringify({
              username: email,
              name: name,
              lastname: lastname,
              email: email,
              password: password,
              meta: { appSubscribed: false },
            })
        });

        if (data.status === 200){
            data = await data.json();

            if(data.status){
                dispatch({type: FETCH_REGISTRATION_SUCCESS, payload: data });
                return true;
            }
            else{
                dispatch({ type:FETCH_REGISTRATION_FAILED, error: data.message  }) //data.message
                return false;
            }
        }

    }catch (error){
        dispatch({type: FETCH_REGISTRATION_FAILED, error: error});
        return false;
    }
};


export const loginUser = (username= null, password = null) => async dispatch => {
    try {
        dispatch({type: FETCH_USER }); 
        const pathService = `${global.wpSite}/wp-json/svapphelper/v2/log?email=${username}&key=${password}`;

        //console.log(pathService);
        let data = await fetch(pathService,{
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Content-Ads': helpers.getAvertisingID()
              },
        });
        if (data.status === 200) {
            data = await data.json();
            if(data.status){
                dispatch({type: FETCH_USER_SUCCESS, payload: data  }); 
                return true;
            }
        }
        dispatch({type: FETCH_USER_FAILED, error: 'Invalid User Name or Password!'});
        return false;
    } catch (error) {
            console.warn(error);
            dispatch({type: FETCH_USER_FAILED, error: 'Probably a connection error!, If connection is available, re check user and password'});
        return false;
    }
};


export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case FETCH_USER_LOGOUT:  {
            return INITIAL_STATE;
        }
        case FETCH_USER: {
            return { ...INITIAL_STATE, loading: true };
        }
        case FETCH_USER_SUCCESS: {
            return { ...INITIAL_STATE, isAuth: true, user: action.payload };
        }
        case FETCH_USER_FAILED: {
            return { ...INITIAL_STATE, error: action.error };
        }
        case FETCH_REGISTRATION: {
            return { ...INITIAL_STATE, registered: true };
        }
        case FETCH_REGISTRATION_SUCCESS: {
            return { ...INITIAL_STATE, registered: true, isAuth: true, user: action.payload };
        }
        case FETCH_REGISTRATION_FAILED: {
            return { ...INITIAL_STATE, error: action.error };
        }

        case FETCH_SUBSCRIPTION_UPDATE: {
            return { ...INITIAL_STATE, registered: true, subscribed: true };
        }
        case FETCH_SUBSCRIPTION_UPDATE_SUCCESS: {
            return { ...INITIAL_STATE, registered: true, isAuth: true, subscribed: true, user: action.payload };
        }
        case FETCH_SUBSCRIPTION_UPDATE_FAILED: {
            return { ...INITIAL_STATE, error: action.error }; 
        }   
        
        case FETCH_SUBSCRIPTION_CHECK: {
            return { ...INITIAL_STATE, registered: true, subscribed: true };
        }
        case FETCH_SUBSCRIPTION_CHECK_SUCCESS: {
            return { ...INITIAL_STATE, registered: true, isAuth: true, subscribed: true, user: action.payload };
        }
        case FETCH_SUBSCRIPTION_CHECK_FAILED: {
            return { ...INITIAL_STATE, error: action.error }; 
        }    
        
        default:
            return state;
    }
};