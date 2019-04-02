const FETCH_USER_LOGOUT = 'FETCH_USER_LOGOUT';

const FETCH_OFFERS = 'FETCH_OFFERS';
const FETCH_OFFERS_FAILED = 'FETCH_OFFERS_FAILED';
const FETCH_OFFERS_SUCCESS= 'FETCH_OFFERS_SUCCESS';
const SET_NEW_LOCAL_OFFER = 'SET_NEW_LOCAL_OFFER';
const REMOVE_LOCAL_OFFER = 'REMOVE_LOCAL_OFFER';

const INITIAL_STATE = {
	dataSource: [],
	loading: false,
	isSync: false,
	offlineDataSource: [],
	error: null, 
	markers: []
	
};

export const fetchOffersDataSource = () => async dispatch => {
  try{
    return fetchOffers(dispatch);
  } catch (error){
    return false;
  }
}

const fetchOffers = async (dispatch) => {
	try {
		dispatch({ type: FETCH_OFFERS });
		const pathService = `${global.wpSite}/wp-json/svapphelper/v2/offers`; 
    //console.log(pathService);
		let data = await fetch(pathService); 
		if (data.status === 200) {
			data = await data.json();
			dispatch({ type: FETCH_OFFERS_SUCCESS, payload: data });
			return true;
		}
		dispatch({ type: FETCH_OFFERS_FAILED, error: 'Something error!' });
		return false;
	} catch (error) {
		dispatch({
			type: FETCH_OFFERS_FAILED,
			error:
				'A network error (such as timeout, interrupted connection or unreachable host) has occurred'
		});
		return false;
	}
};

export const saveOffer = (body = null) => async dispatch => {
	try {
		dispatch({ type: SET_NEW_LOCAL_OFFER, payload: body });
		global.offerEmitter.emit('offersOffline');
	} catch (error) {
		console.log(error);
	}
};

export const removeOffer = (body = null) => async dispatch => {
  try{
    dispatch( { type: REMOVE_LOCAL_OFFER, payload: body });
    global.offerEmitter.emit('offersOffline');
  } catch(error){
    console.log(error);
  }

}

// export const sedn
export default (state = INITIAL_STATE, action) => {

	switch (action.type) {
		case FETCH_USER_LOGOUT: {
			return INITIAL_STATE;
		}
    case SET_NEW_LOCAL_OFFER: {
			return {
				...state,
				offlineDataSource: [action.payload, ...state.offlineDataSource]
			};
		}
    case REMOVE_LOCAL_OFFER: {
      const newOfflineOffers = state.offlineDataSource.filter(offlineOffers => {
        return offlineOffers != action.payload; 
      });      
			return {...state,	offlineDataSource: newOfflineOffers };
		}
		case FETCH_OFFERS: {
 			return { ...state, loading: true, error: null };
		}
		case FETCH_OFFERS_SUCCESS: {
			return { ...state, loading: false, error: null, dataSource: action.payload };
		}
		case FETCH_OFFERS_FAILED: {
			return { ...state, loading: false, error: action.error };
		}
		default:
			return state;
	}
};
