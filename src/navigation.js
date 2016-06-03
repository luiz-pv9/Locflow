import Cache from './cache'
import {Request} from './request'

export const Navigation = {

  /*
  ** 
  */
  onVisit: function(path) {
    let req = Request.get(path)
  },

  /*
  **
  */
  onLeave: function(path) {
  }
}
