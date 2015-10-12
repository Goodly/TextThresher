import alt from 'utils/alt';
import AppActions from 'actions/appActions';
import data from 'assets/tua.json';

// #TODO: we will eventually need to move off mock data.
// what is API structure? workflow? how are we fetching one TUA after the other?

class AppStore {
  constructor() {
    this.bindActions(AppActions);
    this.tua = data.results;
  }
}

export default alt.createStore(AppStore, 'AppStore');
