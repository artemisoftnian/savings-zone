const FETCH_USER = 'FETCH_USER';
const FETCH_USER_FAILED = 'FETCH_USER_FAILED';
const FETCH_USER_SUCCESS = 'FETCH_USER_SUCCESS';
const FETCH_USER_LOGOUT = 'FETCH_USER_LOGOUT';

const FETCH_REGISTRATION = 'FETCH_REGISTRATION';
const FETCH_REGISTRATION_FAILED = 'FETCH_REGISTRATION_FAILED';
const FETCH_REGISTRATION_SUCCESS = 'FETCH_REGISTRATION_SUCCESS';


const INITIAL_STATE = {
    user: null,
    loading: false,
    isAuth: false,
    registered: false
};

export const logOutUser = () => ({
    type: FETCH_USER_LOGOUT
});


export const registerUser = (email = null, password = null, name = null, lastname = null) => async dispatch => {
    try{
        dispatch({ type: FETCH_REGISTRATION });
        const pathService = global.wpSite + '/wp-json/svapphelper/v2/users';

        let data = await fetch(pathService, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              accept: 'application/json',
              app_check: 'savings_zone_app',
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
        let data = await fetch(pathService);
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
        dispatch({type: FETCH_USER_FAILED, error: 'A network error (such as timeout, interrupted connection or unreachable host) has occurred'});
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
        default:
            return state;
    }
};
