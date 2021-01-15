const EventEmitter = require("events");
const FileStore = require("./fileStore")
const _ = require("lodash");
const reservedKeys = [
  "_events",
  "_eventsCount",
  "_maxListeners",
  "_persistState",
  "_getValidState",
  "_getPersistState",
  "_fileStore",
  "_options",
  "getState",
  "set",
  "setInitialState",
  "on",
  "emit",
  "state",
  "changeList",
];

const SimpleState = (initialValueObject, options = {}) => {
  let state = new EventEmitter();
  state._options = options

  if (state._options.persist && (state._options.persistRelPath || state._options.persistAbsolutePath)) {
    state._fileStore = new FileStore({relPath: state._options.persistRelPath, absolutePath: state._options.persistAbsolutePath})
  }
    
  state._getValidState = (s) => {
    let fauxState = {}
    let validStateKeys = Object.keys(s).filter(function (a) {
        return reservedKeys.every(function (b) {
          return !a.includes(b);
        });
    });
    
    validStateKeys.forEach((key) => {
        fauxState[key] = s[key];
    });

    return fauxState
  }

  state.getState = () => {
    return state._getValidState(state)
  }
    
  state._getPersistState = () => {
      let validState = state._getValidState(state)
      let persistState = {}
      state._options.persist.forEach((key) => {
          persistState[key] = validState[key]
      })
      return persistState
  }

    

  state.setInitialState = (initialState) => {
    let initialFsState
    if (state._fileStore) {
        initialFsState = state._fileStore.get()
    }
      
    if (initialFsState) {
        Object.keys(initialFsState).forEach((key) => {
            initialState[key] = initialFsState[key]
        })
    } else {
        initialState = state._getValidState(initialState)
    }
      
    if (initialState) {

      Object.keys(initialState).forEach((key) => {
        state[key] = initialState[key];
      });
        
    }
  };

  state._persistState = () => {
    let persistState = state._getPersistState()
    state._fileStore.set(persistState)
  }
  state._persistStateDebounce = _.debounce(state._persistState)

  state.set = (valueObject) => {
    let changeList = [];

    valueList = Object.keys(valueObject);

    valueKeys = valueList.filter(function (a) {
      return reservedKeys.every(function (b) {
        let isAllowed = !a.includes(b);
        if (!isAllowed) {
          console.warn(
            `Initial value with key of ${b} is reserved and will be discarded from state.`
          );
        }
        return isAllowed;
      });
    });

    valueKeys.forEach((key) => {
      if (!_.isEqual(valueObject[key], state[key])) {
        //if the value is different set state and add to emitList
        state[key] = valueObject[key];
        changeList.push({ key, value: valueObject[key] });
      }
    });

    if (changeList.length > 0) {
      state.emit("state", state);
      state.emit("changeList", changeList);
      changeList.forEach(({ key, value }) => {
        state.emit(key, value);
      });
      if (state._fileStore && changeList.some(persistValue => state._options.persist.includes(persistValue.key))) {
        state._persistStateDebounce()
      }

    }
  };

  state.setInitialState(initialValueObject);
  return state;
};

module.exports = SimpleState;
