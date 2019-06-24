import helpers from '../../components/helpers';

const FETCH_REDEEM_OFFER_SUCCESS = 'FETCH_REDEEM_OFFER_SUCCESS';
const FETCH_REDEEM_OFFER         = 'FETCH_REDEEM_OFFER';
const FETCH_REDEEM_OFFER_FAILED  = 'FETCH_REDEEM_OFFER_FAILED';

const FETCH_STATS_SUCCESS = 'FETCH_STATS_SUCCESS';
const FETCH_STATS         = 'FETCH_STATS';
const FETCH_STATS_FAILED  = 'FETCH_STATS_FAILED';

const INITIAL_STATE = {
	loading: false,
	isSync: false,
  offlineDataSource: [],
  merchantStats: [],
	error: null,
  message:''
};

export const getMerchantStats = (merchant_id = null) => async dispatch => {
  try{
      dispatch({ type: FETCH_STATS });
      const pathService = `${global.wpSite}/wp-json/svapphelper/v2/merchant/stats`;
      //console.log(pathService);
      let data = await fetch(pathService, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Content-Ads': helpers.getAvertisingID()
        },
        body: JSON.stringify({
          merchant_id: merchant_id
        })
      });        
      if (data.status === 200) {            
          data = await data.json();
          console.log(data);
          
          if(data.message){
              console.log(data.message);
              dispatch({type: FETCH_STATS_SUCCESS, payload: data}); 
              return true;
          }
      }
      dispatch({type: FETCH_STATS_FAILED, error: 'No se pudo aceder a los stats!'});
      return false;
    } catch (error) {
        dispatch({type: FETCH_STATS_FAILED, error: 'A network error has occurred'});
        return false;
    }  
}

export const merchantRedeemOffer = (offer= null) => async dispatch => {

     try {
        dispatch({type: FETCH_REDEEM_OFFER });
        const pathService = `${global.wpSite}/wp-json/svapphelper/v2/redeem`; 
        //console.log(pathService);
        let data = await fetch(pathService, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Content-Ads': helpers.getAvertisingID()
          },
          body: JSON.stringify(offer)
        });        
        if (data.status === 200) {            
            data = await data.json();
            console.log(data);
            
            if(data.message){
                console.log(data.message);
                dispatch({type: FETCH_REDEEM_OFFER_SUCCESS, payload: data}); 
                return true;
            }
        }
        dispatch({type: FETCH_REDEEM_OFFER_FAILED, error: 'No se pudo redimir la oferta!'});
        return false;
    } catch (error) {
        dispatch({type: FETCH_REDEEM_OFFER_FAILED, error: 'A network error has occurred'});
        return false;
    }  

};



// export const sedn
export default (state = INITIAL_STATE, action) => {

	switch (action.type) {
		case FETCH_REDEEM_OFFER: {
			return {	...state,	isSync: true	};
		}
		case FETCH_REDEEM_OFFER_FAILED: {
			return {...state,		isSync: false	};
		}
		case FETCH_REDEEM_OFFER_SUCCESS: {
		  return { ...state, isSync: true, message: action.payload };
    }
		case FETCH_STATS: {
			return {	...state,	isSync: true	};
		}
		case FETCH_STATS_FAILED: {
			return {...state,		isSync: false	};
		}
		case FETCH_STATS_SUCCESS: {
		  return { ...state, isSync: true, merchantStats: action.payload };
		}    
		default:
			return state;
	}
};
