import { RECEIVE_LOBBY, REMOVE_LOBBY } from "../actions/lobby_actions";

const roomsReducer = (state = {}, action) => {

    switch (action.type) {
        case RECEIVE_LOBBY:
            return action.rooms;

        case REMOVE_LOBBY:
            return state;

        default:
            return state;
  }
};

export default roomsReducer;
